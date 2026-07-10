import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { parsePublicRuntimeConfig } from "@fandom-harbor/config";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { TrustedIdentity, TrustedSession } from "./identity";
import {
  isValidRegistrationName,
  normalizeRegistrationName,
  registrationNameEmail,
} from "./registration-policy";

export interface AuthCookie {
  name: string;
  value: string;
}

export interface AuthCookieMutation extends AuthCookie {
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | "lax" | "none" | "strict";
    secure?: boolean;
  };
}

export interface AuthCookieStore {
  getAll(): AuthCookie[] | Promise<AuthCookie[]>;
  setAll(cookies: AuthCookieMutation[]): Promise<void> | void;
}

export interface PasswordSignUpInput {
  invitationCodeHash: string;
  password: string;
  registrationName: string;
}

export interface AuthProvider {
  getSession(): Promise<TrustedSession | null>;
  signInWithPassword(input: {
    password: string;
    registrationName: string;
  }): Promise<TrustedSession>;
  signOut(): Promise<void>;
  signUpWithPassword(input: PasswordSignUpInput): Promise<{
    identity: TrustedIdentity;
    session: TrustedSession | null;
  }>;
}

export class AuthProviderError extends Error {
  constructor(
    public readonly code:
      | "INVITATION_EXHAUSTED"
      | "INVITATION_EXPIRED"
      | "INVITATION_REVOKED"
      | "INVALID_INVITATION"
      | "INVALID_CREDENTIALS"
      | "PROVIDER_ERROR"
      | "PROVIDER_CONFIGURATION_ERROR"
      | "RATE_LIMITED"
      | "REGISTRATION_NAME_TAKEN"
      | "SERVICE_UNAVAILABLE"
      | "WEAK_PASSWORD",
    message: string,
  ) {
    super(message);
    this.name = "AuthProviderError";
  }
}

type RegistrationInvitationStatus =
  "exhausted" | "expired" | "invalid" | "revoked" | "valid";

const registrationInvitationStatuses = new Set<RegistrationInvitationStatus>([
  "exhausted",
  "expired",
  "invalid",
  "revoked",
  "valid",
]);

function invitationStatusError(
  status: RegistrationInvitationStatus,
): AuthProviderError | null {
  switch (status) {
    case "valid":
      return null;
    case "expired":
      return new AuthProviderError(
        "INVITATION_EXPIRED",
        "Invitation has expired",
      );
    case "exhausted":
      return new AuthProviderError(
        "INVITATION_EXHAUSTED",
        "Invitation has no remaining uses",
      );
    case "revoked":
      return new AuthProviderError(
        "INVITATION_REVOKED",
        "Invitation has been revoked",
      );
    case "invalid":
      return new AuthProviderError(
        "INVALID_INVITATION",
        "Invitation is invalid",
      );
  }
}

function invitationStatusFromRpc(
  data: unknown,
  error: { code?: string; message?: string } | null,
): RegistrationInvitationStatus {
  if (error) {
    const missingFunction =
      error.code === "PGRST202" ||
      error.message?.includes("registration_invitation_status");
    throw new AuthProviderError(
      missingFunction ? "PROVIDER_CONFIGURATION_ERROR" : "SERVICE_UNAVAILABLE",
      missingFunction
        ? "Registration invitation status function is not deployed"
        : "Invitation validation service is unavailable",
    );
  }

  if (
    typeof data !== "string" ||
    !registrationInvitationStatuses.has(data as RegistrationInvitationStatus)
  ) {
    throw new AuthProviderError(
      "PROVIDER_CONFIGURATION_ERROR",
      "Registration invitation status response is invalid",
    );
  }

  return data as RegistrationInvitationStatus;
}

function trustedIdentity(user: User): TrustedIdentity {
  return { id: user.id };
}

function trustedSession(
  session: { expires_at?: number; user: User } | null,
): TrustedSession | null {
  if (!session?.expires_at) return null;

  return {
    expiresAt: new Date(session.expires_at * 1_000),
    identity: trustedIdentity(session.user),
  };
}

function provider(client: SupabaseClient): AuthProvider {
  return {
    async getSession() {
      const { data, error } = await client.auth.getUser();

      if (error || !data.user) return null;

      const { data: sessionData } = await client.auth.getSession();
      const session = trustedSession(sessionData.session);

      return session && session.identity.id === data.user.id ? session : null;
    },

    async signInWithPassword(input) {
      if (!isValidRegistrationName(input.registrationName)) {
        throw new AuthProviderError(
          "INVALID_CREDENTIALS",
          "Registration name or password is invalid",
        );
      }
      const { data, error } = await client.auth.signInWithPassword({
        email: await registrationNameEmail(input.registrationName),
        password: input.password,
      });

      if (error || !data.session) {
        throw new AuthProviderError(
          "INVALID_CREDENTIALS",
          "Registration name or password is invalid",
        );
      }

      const session = trustedSession(data.session);
      if (!session) {
        throw new AuthProviderError("PROVIDER_ERROR", "Session is incomplete");
      }
      return session;
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) {
        throw new AuthProviderError("PROVIDER_ERROR", "Sign out failed");
      }
    },

    async signUpWithPassword(input) {
      const registrationName = normalizeRegistrationName(
        input.registrationName,
      );
      if (!isValidRegistrationName(registrationName)) {
        throw new AuthProviderError(
          "PROVIDER_ERROR",
          "Registration name is invalid",
        );
      }
      const { data: invitationStatusData, error: invitationError } =
        await client.rpc("registration_invitation_status", {
          p_code_hash: input.invitationCodeHash,
        });

      const invitationErrorBeforeSignup = invitationStatusError(
        invitationStatusFromRpc(invitationStatusData, invitationError),
      );
      if (invitationErrorBeforeSignup) throw invitationErrorBeforeSignup;

      const { data, error } = await client.auth.signUp({
        email: await registrationNameEmail(registrationName),
        password: input.password,
        options: {
          data: {
            invitation_code_hash: input.invitationCodeHash,
            registration_name: registrationName,
          },
        },
      });

      if (error || !data.user) {
        if (error) {
          const {
            data: invitationStatusAfterFailureData,
            error: invitationStatusAfterFailureError,
          } = await client.rpc("registration_invitation_status", {
            p_code_hash: input.invitationCodeHash,
          });
          const invitationErrorAfterSignup = invitationStatusError(
            invitationStatusFromRpc(
              invitationStatusAfterFailureData,
              invitationStatusAfterFailureError,
            ),
          );
          if (invitationErrorAfterSignup) {
            throw invitationErrorAfterSignup;
          }

          const normalizedMessage = error.message.toLowerCase();
          const duplicateRegistrationName =
            error.code === "user_already_exists" ||
            normalizedMessage.includes("already registered");
          const weakPassword =
            error.code === "weak_password" ||
            normalizedMessage.includes("weak password") ||
            normalizedMessage.includes("password should");

          if (error.status === 429) {
            throw new AuthProviderError(
              "RATE_LIMITED",
              "Auth request rate limit exceeded",
            );
          }
          if (duplicateRegistrationName) {
            throw new AuthProviderError(
              "REGISTRATION_NAME_TAKEN",
              "Registration name is already in use",
            );
          }
          if (weakPassword) {
            throw new AuthProviderError(
              "WEAK_PASSWORD",
              "Password does not meet provider requirements",
            );
          }
        }

        throw new AuthProviderError(
          "SERVICE_UNAVAILABLE",
          error?.message ?? "Sign up failed",
        );
      }

      if (!data.session) {
        throw new AuthProviderError(
          "PROVIDER_CONFIGURATION_ERROR",
          "Email confirmations must be disabled for registration",
        );
      }

      return {
        identity: trustedIdentity(data.user),
        session: trustedSession(data.session),
      };
    },
  };
}

function config(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
) {
  return parsePublicRuntimeConfig(environment);
}

export function createBrowserAuthProvider(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
): AuthProvider {
  const runtime = config(environment);
  return provider(
    createBrowserClient(
      runtime.NEXT_PUBLIC_SUPABASE_URL,
      runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  );
}

export function createServerAuthProvider(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): AuthProvider {
  const runtime = config(environment);
  return provider(
    createServerClient(
      runtime.NEXT_PUBLIC_SUPABASE_URL,
      runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => cookies.getAll(),
          setAll: (mutations) => cookies.setAll(mutations),
        },
      },
    ),
  );
}

import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { parsePublicRuntimeConfig } from "@fandom-harbor/config";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { TrustedIdentity, TrustedSession } from "./identity";

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
  email: string;
  emailRedirectTo?: string;
  password: string;
}

export interface AuthProvider {
  getSession(): Promise<TrustedSession | null>;
  signInWithPassword(input: {
    email: string;
    password: string;
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
      "EMAIL_NOT_VERIFIED" | "INVALID_CREDENTIALS" | "PROVIDER_ERROR",
    message: string,
  ) {
    super(message);
    this.name = "AuthProviderError";
  }
}

function trustedIdentity(user: User): TrustedIdentity {
  if (!user.email) {
    throw new AuthProviderError(
      "PROVIDER_ERROR",
      "Authenticated identity is missing an email address",
    );
  }

  return {
    email: user.email,
    emailVerified: Boolean(user.email_confirmed_at),
    id: user.id,
  };
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
      const { data, error } = await client.auth.signInWithPassword(input);

      if (error || !data.session) {
        throw new AuthProviderError(
          "INVALID_CREDENTIALS",
          "Email or password is invalid",
        );
      }

      const session = trustedSession(data.session);
      if (!session) {
        throw new AuthProviderError("PROVIDER_ERROR", "Session is incomplete");
      }
      if (!session.identity.emailVerified) {
        await client.auth.signOut();
        throw new AuthProviderError(
          "EMAIL_NOT_VERIFIED",
          "Email verification is required",
        );
      }

      return session;
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) {
        throw new AuthProviderError("PROVIDER_ERROR", "Sign out failed");
      }
    },

    async signUpWithPassword({ emailRedirectTo, ...credentials }) {
      const { data, error } = await client.auth.signUp({
        ...credentials,
        ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
      });

      if (error || !data.user) {
        throw new AuthProviderError("PROVIDER_ERROR", "Sign up failed");
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

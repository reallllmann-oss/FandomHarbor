import "server-only";

import {
  isValidRegistrationName,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeRegistrationName,
} from "@fandom-harbor/auth";
import {
  invitationSecretHash,
  INVITATION_CODE_LENGTH,
} from "@fandom-harbor/services";
import { z } from "zod";

const serverRegistrationConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

const trustedRegistrationInputSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email())
    .transform((value) => value.toLowerCase()),
  invitationCode: z.string().trim().min(INVITATION_CODE_LENGTH).max(256),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  registrationName: z
    .string()
    .transform(normalizeRegistrationName)
    .refine(isValidRegistrationName),
});

const preparedAttemptSchema = z.object({
  attempt_id: z.uuid(),
  attempt_proof: z.string().regex(/^[0-9a-f]{64}$/),
  attempt_status: z.literal("prepared"),
  expected_auth_user_id: z.uuid(),
  proof_expires_at: z.iso.datetime({ offset: true }),
  reservation_expires_at: z.iso.datetime({ offset: true }),
});

const attemptStatusSchema = z.object({
  attempt_status: z.string(),
  auth_user_created: z.boolean(),
  reservation_expires_at: z.iso.datetime({ offset: true }),
});

const attemptContextSchema = z.object({
  attempt_id: z.uuid(),
  attempt_status: z.string(),
  auth_user_id: z.uuid().nullable(),
  expected_auth_user_id: z.uuid(),
  proof_expires_at: z.iso.datetime({ offset: true }),
  reservation_expires_at: z.iso.datetime({ offset: true }),
});

const adminUserSchema = z.object({
  confirmed_at: z.string().nullable().optional(),
  email_confirmed_at: z.string().nullable().optional(),
  id: z.uuid(),
});

export type TrustedRegistrationResult = {
  attemptHandle: string;
  reservationExpiresAt: Date;
  status: "confirmation_delivery_deferred" | "confirmation_pending";
};

export class TrustedRegistrationError extends Error {
  constructor(
    public readonly code:
      | "INVALID_INPUT"
      | "PROVIDER_CONFIGURATION_ERROR"
      | "REGISTRATION_UNAVAILABLE",
  ) {
    super(
      code === "INVALID_INPUT"
        ? "Registration input is invalid"
        : "Registration could not be completed",
    );
    this.name = "TrustedRegistrationError";
  }
}

type FetchImplementation = typeof fetch;

function secretHeaders(secretKey: string) {
  return {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    "content-type": "application/json",
  };
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createTrustedRegistrationBroker(
  environment: Record<string, string | undefined>,
  transport: FetchImplementation = fetch,
) {
  const configResult = serverRegistrationConfigSchema.safeParse(environment);
  if (!configResult.success) {
    throw new TrustedRegistrationError("PROVIDER_CONFIGURATION_ERROR");
  }
  const config = configResult.data;
  const serviceHeaders = secretHeaders(config.SUPABASE_SECRET_KEY);

  async function contextByProof(attemptProof: string) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/registration_context_by_proof`,
      {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ p_attempt_proof: attemptProof }),
      },
    );
    if (!response.ok) return null;
    const parsed = z
      .array(attemptContextSchema)
      .safeParse(await responseJson(response));
    return parsed.success ? (parsed.data[0] ?? null) : null;
  }

  async function adminUserEmail(userId: string) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      { headers: serviceHeaders },
    );
    if (!response.ok) return null;
    const parsed = z
      .object({ email: z.string().pipe(z.email()), id: z.uuid() })
      .safeParse(await responseJson(response));
    return parsed.success && parsed.data.id === userId
      ? parsed.data.email.toLowerCase()
      : null;
  }

  async function attemptStatus(attemptId: string, attemptProof: string) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/registration_attempt_status`,
      {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({
          p_attempt_id: attemptId,
          p_attempt_proof: attemptProof,
        }),
      },
    );
    if (!response.ok) return null;
    const parsed = z
      .array(attemptStatusSchema)
      .safeParse(await responseJson(response));
    return parsed.success ? (parsed.data[0] ?? null) : null;
  }

  async function releasePreparedAttempt(
    attemptId: string,
    attemptProof: string,
  ) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/release_email_registration`,
      {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({
          p_attempt_id: attemptId,
          p_attempt_proof: attemptProof,
          p_reason: "auth_creation_failed",
        }),
      },
    );
    return response.ok;
  }

  async function sendConfirmation(email: string) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/resend`,
      {
        method: "POST",
        headers: {
          apikey: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, type: "signup" }),
      },
    );
    return response.ok;
  }

  async function confirmationResult(
    attemptHandle: string,
    email: string,
    reservationExpiresAt: string,
  ): Promise<TrustedRegistrationResult> {
    const sent = await sendConfirmation(email).catch(() => false);
    return {
      attemptHandle,
      reservationExpiresAt: new Date(reservationExpiresAt),
      status: sent ? "confirmation_pending" : "confirmation_delivery_deferred",
    };
  }

  return {
    async register(
      input: {
        email: string;
        invitationCode: string;
        password: string;
        registrationName: string;
      },
      existingAttemptHandle?: string,
    ): Promise<TrustedRegistrationResult> {
      const inputResult = trustedRegistrationInputSchema.safeParse(input);
      if (!inputResult.success) {
        throw new TrustedRegistrationError("INVALID_INPUT");
      }
      const trustedInput = inputResult.data;

      let existingContext = null;
      if (existingAttemptHandle) {
        existingContext = await contextByProof(existingAttemptHandle).catch(
          () => null,
        );
        if (
          existingContext?.auth_user_id &&
          ["auth_created", "verified_pending", "activated"].includes(
            existingContext.attempt_status,
          )
        ) {
          const email = await adminUserEmail(existingContext.auth_user_id);
          if (!email) {
            throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
          }
          return confirmationResult(
            existingAttemptHandle,
            email,
            existingContext.reservation_expires_at,
          );
        }
      }

      const prepareResponse = await transport(
        `${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/prepare_email_registration`,
        {
          method: "POST",
          headers: serviceHeaders,
          body: JSON.stringify({
            p_code_hash: await invitationSecretHash(
              trustedInput.invitationCode,
            ),
            p_email: trustedInput.email,
            p_existing_attempt_id:
              existingContext?.attempt_status === "prepared"
                ? existingContext.attempt_id
                : null,
            p_existing_proof:
              existingContext?.attempt_status === "prepared"
                ? existingAttemptHandle
                : null,
            p_registration_name: trustedInput.registrationName,
          }),
        },
      );
      if (!prepareResponse.ok) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }
      const preparedResult = z
        .array(preparedAttemptSchema)
        .safeParse(await responseJson(prepareResponse));
      const prepared = preparedResult.success
        ? preparedResult.data[0]
        : undefined;
      if (!prepared) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }

      let adminResponse: Response;
      try {
        adminResponse = await transport(
          `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
          {
            method: "POST",
            headers: serviceHeaders,
            body: JSON.stringify({
              email: trustedInput.email,
              email_confirm: false,
              id: prepared.expected_auth_user_id,
              password: trustedInput.password,
              user_metadata: {},
            }),
          },
        );
      } catch {
        // A network failure is ambiguous: the Auth transaction may still have
        // committed. Never release its reservation from an uncertain result.
        const status = await attemptStatus(
          prepared.attempt_id,
          prepared.attempt_proof,
        ).catch(() => null);
        if (status?.auth_user_created) {
          return confirmationResult(
            prepared.attempt_proof,
            trustedInput.email,
            prepared.reservation_expires_at,
          );
        }
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }

      const adminUserResult = adminResponse.ok
        ? adminUserSchema.safeParse(await responseJson(adminResponse))
        : null;
      const adminCreateSucceeded =
        adminUserResult?.success === true &&
        adminUserResult.data.id === prepared.expected_auth_user_id &&
        !adminUserResult.data.email_confirmed_at &&
        !adminUserResult.data.confirmed_at;

      if (!adminCreateSucceeded) {
        const status = await attemptStatus(
          prepared.attempt_id,
          prepared.attempt_proof,
        ).catch(() => null);
        if (!status?.auth_user_created) {
          if (!adminResponse.ok && status?.attempt_status === "prepared") {
            await releasePreparedAttempt(
              prepared.attempt_id,
              prepared.attempt_proof,
            ).catch(() => false);
          }
          throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
        }
      }

      return confirmationResult(
        prepared.attempt_proof,
        trustedInput.email,
        prepared.reservation_expires_at,
      );
    },

    async resend(attemptHandle: string): Promise<TrustedRegistrationResult> {
      const context = await contextByProof(attemptHandle);
      if (
        !context?.auth_user_id ||
        !["auth_created", "verified_pending"].includes(context.attempt_status)
      ) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }
      const email = await adminUserEmail(context.auth_user_id);
      if (!email) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }
      return confirmationResult(
        attemptHandle,
        email,
        context.reservation_expires_at,
      );
    },

    async verificationContext(attemptHandle: string) {
      const context = await contextByProof(attemptHandle);
      if (
        !context?.auth_user_id ||
        !["auth_created", "verified_pending"].includes(context.attempt_status)
      ) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }
      const email = await adminUserEmail(context.auth_user_id);
      if (!email) {
        throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
      }
      return {
        email,
        reservationExpiresAt: new Date(context.reservation_expires_at),
      };
    },
  };
}

export function createWebTrustedRegistrationBroker() {
  return createTrustedRegistrationBroker({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}

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
  status:
    | "confirmation_delivery_deferred"
    | "confirmation_request_accepted"
    | "verification_pending";
};

export class TrustedRegistrationError extends Error {
  constructor(
    public readonly code:
      | "INVALID_INPUT"
      | "ATTEMPT_UNAVAILABLE"
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
    if (!response.ok) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    const parsed = z
      .array(attemptContextSchema)
      .safeParse(await responseJson(response));
    if (!parsed.success) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    return parsed.data[0] ?? null;
  }

  async function resumeContextBySubmission(
    trustedInput: z.infer<typeof trustedRegistrationInputSchema>,
    attemptProof: string,
  ) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/registration_resume_context`,
      {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({
          p_attempt_proof: attemptProof,
          p_code_hash: await invitationSecretHash(trustedInput.invitationCode),
          p_email: trustedInput.email,
          p_registration_name: trustedInput.registrationName,
        }),
      },
    );
    if (!response.ok) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    const parsed = z
      .array(attemptContextSchema)
      .safeParse(await responseJson(response));
    if (!parsed.success) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    return parsed.data[0] ?? null;
  }

  async function eligibleUnconfirmedUserEmail(
    userId: string,
    expectedEmail?: string,
  ) {
    const response = await transport(
      `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      { headers: serviceHeaders },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    const parsed = z
      .object({
        banned_until: z.string().nullable().optional(),
        confirmed_at: z.string().nullable().optional(),
        email: z.string().pipe(z.email()),
        email_confirmed_at: z.string().nullable().optional(),
        id: z.uuid(),
      })
      .safeParse(await responseJson(response));
    if (!parsed.success) {
      throw new TrustedRegistrationError("REGISTRATION_UNAVAILABLE");
    }
    if (parsed.data.id !== userId) return null;
    const email = parsed.data.email.toLowerCase();
    if (expectedEmail && email !== expectedEmail.toLowerCase()) return null;
    if (parsed.data.email_confirmed_at || parsed.data.confirmed_at) return null;
    if (
      parsed.data.banned_until &&
      new Date(parsed.data.banned_until).getTime() > Date.now()
    ) {
      return null;
    }
    return email;
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
    authUserId: string,
    expectedEmail: string | undefined,
    reservationExpiresAt: string,
  ): Promise<TrustedRegistrationResult> {
    const eligibleEmail = await eligibleUnconfirmedUserEmail(
      authUserId,
      expectedEmail,
    );
    if (!eligibleEmail) {
      throw new TrustedRegistrationError("ATTEMPT_UNAVAILABLE");
    }
    const accepted = await sendConfirmation(eligibleEmail).catch(() => false);
    return {
      attemptHandle,
      reservationExpiresAt: new Date(reservationExpiresAt),
      status: accepted
        ? "confirmation_request_accepted"
        : "confirmation_delivery_deferred",
    };
  }

  return {
    async register(input: {
      email: string;
      invitationCode: string;
      password: string;
      registrationName: string;
    }): Promise<TrustedRegistrationResult> {
      const inputResult = trustedRegistrationInputSchema.safeParse(input);
      if (!inputResult.success) {
        throw new TrustedRegistrationError("INVALID_INPUT");
      }
      const trustedInput = inputResult.data;

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
            p_existing_attempt_id: null,
            p_existing_proof: null,
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
            prepared.expected_auth_user_id,
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
        prepared.expected_auth_user_id,
        trustedInput.email,
        prepared.reservation_expires_at,
      );
    },

    async resume(
      input: {
        email: string;
        invitationCode: string;
        password: string;
        registrationName: string;
      },
      attemptHandle: string,
    ): Promise<TrustedRegistrationResult | null> {
      const inputResult = trustedRegistrationInputSchema.safeParse(input);
      if (!inputResult.success) {
        throw new TrustedRegistrationError("INVALID_INPUT");
      }
      const context = await resumeContextBySubmission(
        inputResult.data,
        attemptHandle,
      );
      if (!context?.auth_user_id || context.attempt_status !== "auth_created") {
        return null;
      }
      const email = await eligibleUnconfirmedUserEmail(
        context.auth_user_id,
        inputResult.data.email,
      );
      if (!email) return null;
      return {
        attemptHandle,
        reservationExpiresAt: new Date(context.reservation_expires_at),
        status: "verification_pending",
      };
    },

    async resend(attemptHandle: string): Promise<TrustedRegistrationResult> {
      const context = await contextByProof(attemptHandle);
      if (!context?.auth_user_id || context.attempt_status !== "auth_created") {
        throw new TrustedRegistrationError("ATTEMPT_UNAVAILABLE");
      }
      return confirmationResult(
        attemptHandle,
        context.auth_user_id,
        undefined,
        context.reservation_expires_at,
      );
    },

    async verificationContext(attemptHandle: string) {
      const context = await contextByProof(attemptHandle);
      if (!context?.auth_user_id || context.attempt_status !== "auth_created") {
        throw new TrustedRegistrationError("ATTEMPT_UNAVAILABLE");
      }
      const email = await eligibleUnconfirmedUserEmail(context.auth_user_id);
      if (!email) {
        throw new TrustedRegistrationError("ATTEMPT_UNAVAILABLE");
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

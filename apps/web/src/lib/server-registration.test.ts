import { invitationSecretHash } from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTrustedRegistrationBroker,
  TrustedRegistrationError,
} from "./server-registration";

vi.mock("server-only", () => ({}));

const environment = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.example.test",
  SUPABASE_SECRET_KEY: "server-secret-test-key",
};
const input = {
  email: " Reader@Example.Test ",
  invitationCode: "AbC123xYz90",
  password: "strong-password-42!",
  registrationName: "HarborReader",
};
const attempt = {
  attempt_id: "a1000000-0000-4000-8000-000000000001",
  attempt_proof: "a".repeat(64),
  attempt_status: "prepared",
  expected_auth_user_id: "a1000000-0000-4000-8000-000000000002",
  proof_expires_at: "2026-10-14T02:15:00.000Z",
  reservation_expires_at: "2026-10-14T04:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function pathOf(request: RequestInfo | URL) {
  return new URL(typeof request === "string" ? request : request.toString())
    .pathname;
}

describe("server-only trusted registration broker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("prepares, creates the preallocated UID, and resends without exposing credentials", async () => {
    const transport = vi.fn(
      async (request: RequestInfo | URL, options?: RequestInit) => {
        void options;
        switch (pathOf(request)) {
          case "/rest/v1/rpc/prepare_email_registration":
            return jsonResponse([attempt]);
          case "/auth/v1/admin/users":
            return jsonResponse({
              confirmed_at: null,
              email_confirmed_at: null,
              id: attempt.expected_auth_user_id,
            });
          case "/auth/v1/resend":
            return jsonResponse({});
          default:
            throw new Error(`Unexpected request: ${String(request)}`);
        }
      },
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await createTrustedRegistrationBroker(
      environment,
      transport,
    ).register({
      ...input,
      expected_auth_user_id: "a1000000-0000-4000-8000-000000000099",
    } as typeof input);

    expect(result).toEqual({
      attemptHandle: attempt.attempt_proof,
      reservationExpiresAt: new Date(attempt.reservation_expires_at),
      status: "confirmation_pending",
    });
    expect(JSON.stringify(result)).not.toContain(attempt.attempt_id);
    expect(JSON.stringify(result)).not.toContain(input.email);
    expect(JSON.stringify(result)).not.toContain(input.password);
    expect(JSON.stringify(result)).not.toContain(input.email.trim());
    expect(consoleError).not.toHaveBeenCalled();

    const prepareOptions = transport.mock.calls[0]?.[1] as RequestInit;
    expect(prepareOptions.headers).toMatchObject({
      apikey: environment.SUPABASE_SECRET_KEY,
      authorization: `Bearer ${environment.SUPABASE_SECRET_KEY}`,
    });
    expect(JSON.parse(String(prepareOptions.body))).toEqual({
      p_code_hash: await invitationSecretHash(input.invitationCode),
      p_email: "reader@example.test",
      p_existing_attempt_id: null,
      p_existing_proof: null,
      p_registration_name: input.registrationName,
    });

    const adminOptions = transport.mock.calls[1]?.[1] as RequestInit;
    expect(JSON.parse(String(adminOptions.body))).toEqual({
      email: "reader@example.test",
      email_confirm: false,
      id: attempt.expected_auth_user_id,
      password: input.password,
      user_metadata: {},
    });
    expect(String(adminOptions.body)).not.toContain(attempt.attempt_id);
    expect(String(adminOptions.body)).not.toContain(attempt.attempt_proof);

    const resendOptions = transport.mock.calls[2]?.[1] as RequestInit;
    expect(resendOptions.headers).toEqual({
      apikey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "content-type": "application/json",
    });
    expect(JSON.stringify(resendOptions.headers)).not.toContain(
      environment.SUPABASE_SECRET_KEY,
    );
  });

  it("releases a prepared attempt after an explicit Admin rejection", async () => {
    const transport = vi.fn(
      async (request: RequestInfo | URL, options?: RequestInit) => {
        switch (pathOf(request)) {
          case "/rest/v1/rpc/prepare_email_registration":
            return jsonResponse([attempt]);
          case "/auth/v1/admin/users":
            return jsonResponse({ message: "request rejected" }, 400);
          case "/rest/v1/rpc/registration_attempt_status":
            return jsonResponse([
              {
                attempt_status: "prepared",
                auth_user_created: false,
                reservation_expires_at: attempt.reservation_expires_at,
              },
            ]);
          case "/rest/v1/rpc/release_email_registration": {
            const body = JSON.parse(String(options?.body));
            expect(body).toEqual({
              p_attempt_id: attempt.attempt_id,
              p_attempt_proof: attempt.attempt_proof,
              p_reason: "auth_creation_failed",
            });
            return jsonResponse(true);
          }
          default:
            throw new Error(`Unexpected request: ${String(request)}`);
        }
      },
    );

    const failure = createTrustedRegistrationBroker(
      environment,
      transport,
    ).register(input);
    await expect(failure).rejects.toEqual(
      new TrustedRegistrationError("REGISTRATION_UNAVAILABLE"),
    );
    await expect(failure).rejects.not.toThrow(attempt.attempt_proof);
    expect(transport).toHaveBeenCalledTimes(4);
  });

  it("never releases a prepared reservation after an ambiguous network failure", async () => {
    const transport = vi.fn(async (request: RequestInfo | URL) => {
      switch (pathOf(request)) {
        case "/rest/v1/rpc/prepare_email_registration":
          return jsonResponse([attempt]);
        case "/auth/v1/admin/users":
          throw new TypeError("network unavailable");
        case "/rest/v1/rpc/registration_attempt_status":
          return jsonResponse([
            {
              attempt_status: "prepared",
              auth_user_created: false,
              reservation_expires_at: attempt.reservation_expires_at,
            },
          ]);
        default:
          throw new Error(`Unexpected request: ${String(request)}`);
      }
    });

    await expect(
      createTrustedRegistrationBroker(environment, transport).register(input),
    ).rejects.toMatchObject({ code: "REGISTRATION_UNAVAILABLE" });
    expect(
      transport.mock.calls.some(
        ([request]) =>
          pathOf(request) === "/rest/v1/rpc/release_email_registration",
      ),
    ).toBe(false);
  });

  it("reconciles an ambiguous Admin response to an auth-created attempt", async () => {
    const transport = vi.fn(async (request: RequestInfo | URL) => {
      switch (pathOf(request)) {
        case "/rest/v1/rpc/prepare_email_registration":
          return jsonResponse([attempt]);
        case "/auth/v1/admin/users":
          return jsonResponse({ id: "malformed" });
        case "/rest/v1/rpc/registration_attempt_status":
          return jsonResponse([
            {
              attempt_status: "auth_created",
              auth_user_created: true,
              reservation_expires_at: attempt.reservation_expires_at,
            },
          ]);
        case "/auth/v1/resend":
          return jsonResponse({});
        default:
          throw new Error(`Unexpected request: ${String(request)}`);
      }
    });

    await expect(
      createTrustedRegistrationBroker(environment, transport).register(input),
    ).resolves.toEqual({
      attemptHandle: attempt.attempt_proof,
      reservationExpiresAt: new Date(attempt.reservation_expires_at),
      status: "confirmation_pending",
    });
  });

  it("keeps the pending identity when confirmation delivery is retryable", async () => {
    const transport = vi.fn(async (request: RequestInfo | URL) => {
      switch (pathOf(request)) {
        case "/rest/v1/rpc/prepare_email_registration":
          return jsonResponse([attempt]);
        case "/auth/v1/admin/users":
          return jsonResponse({
            confirmed_at: null,
            email_confirmed_at: null,
            id: attempt.expected_auth_user_id,
          });
        case "/auth/v1/resend":
          return jsonResponse({ message: "delivery unavailable" }, 503);
        default:
          throw new Error(`Unexpected request: ${String(request)}`);
      }
    });

    await expect(
      createTrustedRegistrationBroker(environment, transport).register(input),
    ).resolves.toEqual({
      attemptHandle: attempt.attempt_proof,
      reservationExpiresAt: new Date(attempt.reservation_expires_at),
      status: "confirmation_delivery_deferred",
    });
  });

  it("fails closed when the server-only secret is absent", () => {
    expect(() =>
      createTrustedRegistrationBroker({
        ...environment,
        SUPABASE_SECRET_KEY: undefined,
      }),
    ).toThrowError(
      new TrustedRegistrationError("PROVIDER_CONFIGURATION_ERROR"),
    );
  });
});

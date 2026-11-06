// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import type { SuperAdminEmailBindingService } from "@fandom-harbor/services";

import { createSuperAdminEmailBindingOrchestrator } from "./super-admin-email-binding-orchestrator";
import { createB3SaEmailBindingAuthGateway } from "./super-admin-email-binding-runtime";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@fandom-harbor/auth", () => ({ createServerAuthProvider: vi.fn() }));
vi.mock("@fandom-harbor/database", () => ({
  createServerSupabaseClient: vi.fn(),
  createSuperAdminEmailBindingRepository: vi.fn(),
}));
vi.mock("@fandom-harbor/services", () => ({
  createSuperAdminEmailBindingService: vi.fn(),
}));

const UID = "10000000-0000-4000-8000-000000000001";
const OTHER_UID = "10000000-0000-4000-8000-000000000002";
const OPERATION = "20000000-0000-4000-8000-000000000001";
const SESSION = "30000000-0000-4000-8000-000000000001";
const OLD_EMAIL = "synthetic@accounts.fandom-harbor.invalid";
const NEW_EMAIL = "synthetic@example.com";

// Exact GoTrue v2.197.0 verifyPost singleConfirmationAccepted response.
const FIRST_ACCEPTED = {
  msg: "Confirmation link accepted. Please proceed to confirm link sent to the other email",
  code: "200",
};
const FINAL_SESSION = {
  access_token: "synthetic-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 2000003600,
  refresh_token: "synthetic-refresh-token",
  user: { id: UID, email: NEW_EMAIL },
};

function user(email = OLD_EMAIL, pending?: string) {
  // Official GoTrue User JSON intentionally does not expose confirm_status.
  return {
    id: UID,
    email,
    identities: [
      {
        identity_id: "identity-1",
        provider: "email",
        identity_data: { email },
      },
    ],
    ...(pending ? { new_email: pending } : {}),
  };
}

function fixture(
  input: {
    firstBody?: unknown;
    firstStatus?: number;
    malformed?: boolean;
  } = {},
) {
  let authoritative = user();
  const events: string[] = [];
  const transport = vi.fn<typeof fetch>(async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith(`/admin/users/${UID}`))
      return Response.json(authoritative);
    if (path.endsWith("/token")) return Response.json(FINAL_SESSION);
    if (path.endsWith("/logout")) {
      events.push(`logout:${new URL(String(url)).searchParams.get("scope")}`);
      return new Response(null, { status: 204 });
    }
    if (path.endsWith("/admin/generate_link")) {
      const body = JSON.parse(String(init?.body));
      events.push(body.type);
      authoritative = user(OLD_EMAIL, NEW_EMAIL);
      return Response.json({
        properties: {
          email_otp: body.type === "email_change_current" ? "111111" : "222222",
        },
        user: { id: UID },
      });
    }
    if (path.endsWith("/verify")) {
      const body = JSON.parse(String(init?.body));
      expect(body.type).toBe("email_change");
      expect(body).not.toHaveProperty("token_hash");
      if (body.email === OLD_EMAIL) {
        events.push("verify:current");
        if (input.malformed) return new Response("not-json", { status: 200 });
        return Response.json(
          "firstBody" in input ? input.firstBody : FIRST_ACCEPTED,
          { status: input.firstStatus ?? 200 },
        );
      }
      expect(body.email).toBe(NEW_EMAIL);
      expect(body.token).toBe("222222");
      events.push("verify:new");
      authoritative = user(NEW_EMAIL);
      return Response.json(FINAL_SESSION);
    }
    throw new Error("Unexpected mock Auth route");
  });
  const auth = createB3SaEmailBindingAuthGateway({
    publishableKey: "synthetic-publishable-key",
    secret: "synthetic-service-key",
    transport,
    url: "http://127.0.0.1:54321",
  });
  let status = "prepared";
  const snapshot = () => ({
    completedAtEpochSeconds: null,
    emailFingerprintBound: status !== "prepared",
    expiresAtEpochSeconds: 2000001800,
    operationId: OPERATION,
    preparedAtEpochSeconds: 2000000000,
    recoveryReasonCode: null,
    sessionBound: status !== "prepared",
    status,
    targetUserId: UID,
  });
  // Ledger transitions are mocked; transport parsing and orchestration are real.
  const ledger = {
    get: vi.fn(async () => snapshot()),
    bind: vi.fn(async () => {
      status = "bound";
      return snapshot();
    }),
    advance: vi.fn(async ({ nextStatus }: { nextStatus: string }) => {
      status = nextStatus;
      events.push(`ledger:${status}`);
      return snapshot();
    }),
    assertContext: vi.fn(async () => snapshot()),
    markRecoveryRequired: vi.fn(async () => {
      status = "recovery_required";
      return snapshot();
    }),
    beginReauth: vi.fn(async () => {
      status = "awaiting_reauth";
      events.push("ledger:awaiting_reauth");
      return snapshot();
    }),
    complete: vi.fn(),
  };
  const sender = {
    sendNewEmailOtp: vi.fn(async () => {
      events.push("send:new");
    }),
  };
  const subject = createSuperAdminEmailBindingOrchestrator({
    allowedTargetUserIds: [UID, OTHER_UID],
    auth,
    binding: ledger as unknown as SuperAdminEmailBindingService,
    emailHmacSecret: "h".repeat(32),
    emailHmacContext: "local",
    async getTrustedAuthEvidence() {
      return {
        actorUserId: UID,
        assuranceLevel: "aal2",
        sessionId: SESSION,
        authenticationMethods: [
          { method: "totp", authenticatedAtEpochSeconds: 2000000000 },
        ],
      };
    },
    revokeCurrentActorSessions: vi.fn(async () => undefined),
    sender,
  });
  const start = () =>
    subject.start({
      operationId: OPERATION,
      password: "synthetic-password",
      targetEmail: NEW_EMAIL,
    });
  return { auth, events, ledger, sender, start, subject, transport };
}

describe("GoTrue v2.197.0 email-change wire contract", () => {
  it("accepts the exact first-arm response without inventing UID or Session evidence", async () => {
    const target = fixture();
    const result = await target.auth.verifyEmailChangeOtp({
      email: OLD_EMAIL,
      otp: "111111",
      retainAccessTokenForGlobalRevocation: false,
    });
    expect(result).toEqual({ kind: "first_confirmation_accepted" });
    expect(result).not.toHaveProperty("userId");
    expect(result).not.toHaveProperty("accessToken");
    expect(target.events).toEqual(["verify:current"]);
  });

  it("parses the final full Session separately and retains its token only for global revocation", async () => {
    const target = fixture();
    await expect(
      target.auth.verifyEmailChangeOtp({
        email: NEW_EMAIL,
        otp: "222222",
        retainAccessTokenForGlobalRevocation: true,
      }),
    ).resolves.toEqual({
      kind: "session",
      accessToken: FINAL_SESSION.access_token,
      userId: UID,
    });
    expect(target.events).toEqual(["verify:new"]);
  });

  it("runs both arms through the real adapter, reaches awaiting_reauth, and never enters recovery on normal success", async () => {
    const target = fixture();
    await expect(target.start()).resolves.toMatchObject({
      status: "new_email_sent",
    });
    expect(target.sender.sendNewEmailOtp).toHaveBeenCalledWith({
      email: NEW_EMAIL,
      operationId: OPERATION,
      otp: "222222",
    });
    await expect(
      target.subject.verifyNewEmail({
        operationId: OPERATION,
        targetEmail: NEW_EMAIL,
        otp: "222222",
      }),
    ).resolves.toMatchObject({ status: "awaiting_reauth" });
    expect(target.events).toEqual([
      "logout:local",
      "email_change_current",
      "email_change_new",
      "verify:current",
      "ledger:current_confirmed",
      "send:new",
      "ledger:new_email_sent",
      "verify:new",
      "ledger:identity_changed",
      "logout:global",
      "ledger:awaiting_reauth",
    ]);
    expect(target.ledger.markRecoveryRequired).not.toHaveBeenCalled();
    expect(target.ledger.complete).not.toHaveBeenCalled();
    expect(target.sender.sendNewEmailOtp).toHaveBeenCalledOnce();
    expect(
      target.transport.mock.calls.every(([url]) =>
        String(url).startsWith("http://127.0.0.1:54321/auth/v1/"),
      ),
    ).toBe(true);
  });

  it.each([
    ["arbitrary message", { msg: "Success", code: "200" }, 200],
    [
      "message prefix",
      { ...FIRST_ACCEPTED, msg: `${FIRST_ACCEPTED.msg} extra` },
      200,
    ],
    ["numeric code", { ...FIRST_ACCEPTED, code: 200 }, 200],
    ["wrong code", { ...FIRST_ACCEPTED, code: "201" }, 200],
    ["missing code", { msg: FIRST_ACCEPTED.msg }, 200],
    ["empty body", {}, 200],
    ["null body", null, 200],
    ["array body", [FIRST_ACCEPTED], 200],
    [
      "error body",
      { error: "otp_expired", msg: "Token expired", code: "403" },
      403,
    ],
    ["HTTP failure with success message", FIRST_ACCEPTED, 400],
    ["wrong success status", FIRST_ACCEPTED, 201],
    ["extra UID", { ...FIRST_ACCEPTED, user: { id: UID } }, 200],
    ["hybrid Session", { ...FIRST_ACCEPTED, ...FINAL_SESSION }, 200],
    [
      "contradictory error",
      { ...FIRST_ACCEPTED, error_code: "otp_expired" },
      200,
    ],
  ])(
    "fails closed for first-arm %s without sending or advancing",
    async (_label, body, status) => {
      const target = fixture({ firstBody: body, firstStatus: status });
      await expect(target.start()).rejects.toMatchObject({
        code: "RECOVERY_REQUIRED",
      });
      expect(target.sender.sendNewEmailOtp).not.toHaveBeenCalled();
      expect(target.ledger.advance).not.toHaveBeenCalled();
      expect(target.ledger.complete).not.toHaveBeenCalled();
      expect(target.ledger.markRecoveryRequired).toHaveBeenCalledWith(
        expect.objectContaining({ reasonCode: "CURRENT_ARM_UNCERTAIN" }),
      );
    },
  );

  it("fails closed for HTTP 200 with invalid JSON", async () => {
    const target = fixture({ malformed: true });
    await expect(target.start()).rejects.toMatchObject({
      code: "RECOVERY_REQUIRED",
    });
    expect(target.sender.sendNewEmailOtp).not.toHaveBeenCalled();
    expect(target.ledger.advance).not.toHaveBeenCalled();
  });

  it("cleans up an unexpected first-arm Session and refuses to treat it as current-only success", async () => {
    const target = fixture({ firstBody: FINAL_SESSION });
    await expect(target.start()).rejects.toMatchObject({
      code: "RECOVERY_REQUIRED",
    });
    expect(
      target.events.filter((event) => event === "logout:local"),
    ).toHaveLength(2);
    expect(target.sender.sendNewEmailOtp).not.toHaveBeenCalled();
    expect(target.ledger.advance).not.toHaveBeenCalled();
  });

  it.each([
    ["first acknowledgement", FIRST_ACCEPTED],
    ["missing token", { user: { id: UID } }],
    ["invalid UID", { ...FINAL_SESSION, user: { id: "invalid" } }],
    ["hybrid acknowledgement", { ...FINAL_SESSION, ...FIRST_ACCEPTED }],
    ["contradictory error", { ...FINAL_SESSION, error: "expired" }],
  ])("does not accept %s as a final Session", async (_label, body) => {
    const gateway = createB3SaEmailBindingAuthGateway({
      publishableKey: "synthetic",
      secret: "synthetic",
      url: "http://127.0.0.1:54321",
      transport: vi.fn<typeof fetch>(async () => Response.json(body)),
    });
    await expect(
      gateway.verifyEmailChangeOtp({
        email: NEW_EMAIL,
        otp: "222222",
        retainAccessTokenForGlobalRevocation: true,
      }),
    ).rejects.toThrow("OTP verification failed");
  });

  it("rejects an Admin read returning a different UID", async () => {
    const gateway = createB3SaEmailBindingAuthGateway({
      publishableKey: "synthetic",
      secret: "synthetic",
      url: "http://127.0.0.1:54321",
      transport: vi.fn<typeof fetch>(async () =>
        Response.json({ ...user(), id: OTHER_UID }),
      ),
    });
    await expect(gateway.getUser(UID)).rejects.toThrow(
      "Authoritative Auth user read failed",
    );
  });

  it("keeps the non-public confirmation status unknown rather than fabricating zero", async () => {
    const target = fixture();
    await expect(target.auth.getUser(UID)).resolves.toMatchObject({
      userId: UID,
      email: OLD_EMAIL,
      emailChangeConfirmStatus: null,
      newEmail: null,
    });
  });
});

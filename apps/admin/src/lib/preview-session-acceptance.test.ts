import { describe, expect, it, vi } from "vitest";
import type { TrustedAuthEvidence } from "@fandom-harbor/auth";
import {
  createPreviewSessionAcceptance,
  previewSessionEnvironmentAllowed,
  type PreviewSessionGateway,
} from "./preview-session-acceptance";

const UID = "cb1e6693-876d-4c4c-8153-3d0fbac6da17";
const OTHER_TARGET = "5fa18bad-6a32-41c3-87e3-e761b00ef8f1";
const THIRD_UID = "10000000-0000-4000-8000-000000000003";
const SESSION = "20000000-0000-4000-8000-000000000001";
const OTHER_SESSION = "20000000-0000-4000-8000-000000000002";
const FACTOR = "30000000-0000-4000-8000-000000000001";
const FACTOR_2 = "30000000-0000-4000-8000-000000000002";
const NOW = Date.parse("2026-10-28T09:00:00+08:00") / 1000;
const environment = {
  VERCEL: "1",
  VERCEL_ENV: "preview",
  VERCEL_TARGET_ENV: "preview",
  VERCEL_PROJECT_ID: "preview-project",
  VERCEL_GIT_COMMIT_REF: "codex/v1-package-b0-auth-architecture",
  B3_SA_DEPLOYMENT_TARGET: "preview",
  B3_SA_EXPECTED_VERCEL_PROJECT_ID: "preview-project",
  B3_SA_EXPECTED_GIT_BRANCH: "codex/v1-package-b0-auth-architecture",
  B3_SA_EXPECTED_SUPABASE_PROJECT_REF: "bniqsjnjqesnpcfkpqcz",
  B3_SA_ALLOWED_TARGET_UIDS: `${UID},${OTHER_TARGET}`,
  NEXT_PUBLIC_SUPABASE_URL: "https://bniqsjnjqesnpcfkpqcz.supabase.co",
  B3_SA_EMAIL_BINDING_ENABLED: "false",
};

function evidence(): TrustedAuthEvidence {
  return {
    actorUserId: UID,
    sessionId: SESSION,
    assuranceLevel: "aal1",
    authenticationMethods: [
      { method: "password", authenticatedAtEpochSeconds: NOW - 30 },
    ],
  };
}
function fixture(changes: Partial<TrustedAuthEvidence> = {}) {
  let current: TrustedAuthEvidence = { ...evidence(), ...changes };
  const gateway: PreviewSessionGateway = {
    current: vi.fn(async () => current),
    readAccess: vi.fn(async () => ({ activeMember: true, superAdmin: true })),
    listVerifiedTotp: vi.fn(async () => [{ id: FACTOR }, { id: FACTOR_2 }]),
    verifyTotp: vi.fn(async () => {
      current = {
        ...current,
        assuranceLevel: "aal2",
        authenticationMethods: [
          ...current.authenticationMethods,
          { method: "totp", authenticatedAtEpochSeconds: NOW },
        ],
      };
    }),
    protectedSelfRead: vi.fn(async () => undefined),
    signOutLocal: vi.fn(async () => undefined),
  };
  return {
    gateway,
    subject: createPreviewSessionAcceptance(gateway, () => NOW),
  };
}

describe("Preview session environment boundary", () => {
  it("works with the binding Gate OFF and does not use that Gate as authorization", () => {
    expect(previewSessionEnvironmentAllowed(environment)).toBe(true);
    expect(
      previewSessionEnvironmentAllowed({
        ...environment,
        B3_SA_EMAIL_BINDING_ENABLED: undefined,
      }),
    ).toBe(true);
  });
  it.each([
    { VERCEL_ENV: "production" },
    { VERCEL_TARGET_ENV: "production" },
    { VERCEL_PROJECT_ID: "another-project" },
    { VERCEL_GIT_COMMIT_REF: "main" },
    { B3_SA_EXPECTED_GIT_BRANCH: "main" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://szfhngifsipsrxcpekti.supabase.co" },
    { B3_SA_EXPECTED_SUPABASE_PROJECT_REF: "szfhngifsipsrxcpekti" },
    { NEXT_PUBLIC_SUPABASE_URL: "http://bniqsjnjqesnpcfkpqcz.supabase.co" },
    { B3_SA_ALLOWED_TARGET_UIDS: `${UID},${THIRD_UID}` },
    { B3_SA_ALLOWED_TARGET_UIDS: `${UID},${UID}` },
    { B3_SA_ALLOWED_TARGET_UIDS: UID },
    { B3_SA_DEPLOYMENT_TARGET: "local" },
  ])("rejects mismatched environment %j", (changes) =>
    expect(
      previewSessionEnvironmentAllowed({ ...environment, ...changes }),
    ).toBe(false),
  );
});

describe("self-only MFA/current Session acceptance", () => {
  it.each([UID, OTHER_TARGET])(
    "allows a newly authenticated exact target %s",
    async (userId) => {
      const target = fixture({ actorUserId: userId });
      await expect(target.subject.snapshot()).resolves.toMatchObject({
        userId,
        assuranceLevel: "aal1",
        mfaVerified: false,
        protectedReadVerified: false,
      });
      expect(target.gateway.protectedSelfRead).not.toHaveBeenCalled();
    },
  );
  it("moves AAL1 to independently verified AAL2 and performs the protected self read", async () => {
    const target = fixture();
    await target.subject.verify(SESSION, FACTOR, "123456");
    expect(target.gateway.verifyTotp).toHaveBeenCalledWith(FACTOR, "123456");
    await expect(target.subject.snapshot()).resolves.toMatchObject({
      assuranceLevel: "aal2",
      mfaVerified: true,
      protectedReadVerified: true,
    });
    expect(target.gateway.protectedSelfRead).toHaveBeenCalledWith(
      UID,
      "Phase2RemoteInviter",
    );
  });
  it("rejects an incorrect OTP without declaring AAL2 or reading protected data", async () => {
    const target = fixture();
    vi.mocked(target.gateway.verifyTotp).mockRejectedValueOnce(
      new Error("MFA_REJECTED"),
    );
    await expect(
      target.subject.verify(SESSION, FACTOR, "000000"),
    ).rejects.toThrow("MFA_REJECTED");
    expect(target.gateway.protectedSelfRead).not.toHaveBeenCalled();
    await expect(target.subject.snapshot()).resolves.toMatchObject({
      assuranceLevel: "aal1",
      mfaVerified: false,
    });
  });
  it.each(["not-a-factor", THIRD_UID])(
    "rejects a foreign/unverified Factor %s before Auth mutation",
    async (factor) => {
      const target = fixture();
      await expect(
        target.subject.verify(SESSION, factor, "123456"),
      ).rejects.toMatchObject({ code: "MFA_REJECTED" });
      expect(target.gateway.verifyTotp).not.toHaveBeenCalled();
    },
  );
  it("does not accept a successful MFA transport result without trustworthy new AAL2 evidence", async () => {
    const target = fixture();
    vi.mocked(target.gateway.verifyTotp).mockResolvedValueOnce(undefined);
    await expect(
      target.subject.verify(SESSION, FACTOR, "123456"),
    ).rejects.toMatchObject({ code: "MFA_REJECTED" });
    expect(target.gateway.protectedSelfRead).not.toHaveBeenCalled();
  });
  it.each([
    { actorUserId: THIRD_UID },
    {
      authenticationMethods: [
        { method: "password", authenticatedAtEpochSeconds: NOW - 86400 * 2 },
      ],
    },
    { authenticationMethods: [] },
  ])("rejects non-target or preserved/old sessions %j", async (changes) => {
    const target = fixture(changes);
    await expect(target.subject.snapshot()).rejects.toThrow();
    await expect(target.subject.logout(SESSION)).rejects.toThrow();
    expect(target.gateway.signOutLocal).not.toHaveBeenCalled();
  });
  it("rejects a missing live Auth Session", async () => {
    const target = fixture();
    vi.mocked(target.gateway.current).mockResolvedValueOnce(null);
    await expect(target.subject.snapshot()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });
  it("binds verify and logout actions to the Session rendered in the form", async () => {
    const target = fixture({ sessionId: OTHER_SESSION });
    await expect(
      target.subject.verify(SESSION, FACTOR, "123456"),
    ).rejects.toMatchObject({ code: "SESSION_MISMATCH" });
    await expect(target.subject.logout(SESSION)).rejects.toMatchObject({
      code: "SESSION_MISMATCH",
    });
    expect(target.gateway.verifyTotp).not.toHaveBeenCalled();
    expect(target.gateway.signOutLocal).not.toHaveBeenCalled();
  });
  it.each([
    { activeMember: false, superAdmin: true },
    { activeMember: true, superAdmin: false },
  ])("rejects changed authority %j", async (access) => {
    const target = fixture();
    vi.mocked(target.gateway.readAccess).mockResolvedValue(access);
    await expect(
      target.subject.verify(SESSION, FACTOR, "123456"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(target.gateway.verifyTotp).not.toHaveBeenCalled();
  });
  it("rejects identity/Session replacement by the MFA result", async () => {
    const target = fixture();
    vi.mocked(target.gateway.current)
      .mockResolvedValueOnce(evidence())
      .mockResolvedValueOnce({
        ...evidence(),
        actorUserId: OTHER_TARGET,
        assuranceLevel: "aal2",
        authenticationMethods: [
          ...evidence().authenticationMethods,
          { method: "totp", authenticatedAtEpochSeconds: NOW },
        ],
      });
    await expect(
      target.subject.verify(SESSION, FACTOR, "123456"),
    ).rejects.toMatchObject({ code: "MFA_REJECTED" });
  });
  it("requires fresh TOTP rather than historical AAL2", async () => {
    const target = fixture({
      assuranceLevel: "aal2",
      authenticationMethods: [
        ...evidence().authenticationMethods,
        { method: "totp", authenticatedAtEpochSeconds: NOW - 301 },
      ],
    });
    await expect(target.subject.snapshot()).resolves.toMatchObject({
      mfaVerified: false,
      protectedReadVerified: false,
    });
  });
  it("keeps the factor-count continuity check", async () => {
    const target = fixture();
    vi.mocked(target.gateway.listVerifiedTotp).mockResolvedValueOnce([
      { id: FACTOR },
    ]);
    await expect(target.subject.snapshot()).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
    });
  });
  it("propagates uncertain logout rather than claiming successful cookie-only cleanup", async () => {
    const target = fixture();
    vi.mocked(target.gateway.signOutLocal).mockRejectedValueOnce(
      new Error("LOGOUT_UNCONFIRMED"),
    );
    await expect(target.subject.logout(SESSION)).rejects.toThrow(
      "LOGOUT_UNCONFIRMED",
    );
    expect(target.gateway.signOutLocal).toHaveBeenCalledOnce();
  });
  it("only delegates current-session logout and never modifies other sessions", async () => {
    const target = fixture();
    await target.subject.logout(SESSION);
    expect(target.gateway.signOutLocal).toHaveBeenCalledOnce();
    expect(target.gateway.verifyTotp).not.toHaveBeenCalled();
    expect(target.gateway.protectedSelfRead).not.toHaveBeenCalled();
  });
});

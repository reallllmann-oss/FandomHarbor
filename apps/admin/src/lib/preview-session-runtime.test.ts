// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  createPreviewSessionGateway,
  createPreviewSessionRuntime,
} from "./preview-session-runtime";

vi.mock("server-only", () => ({}));
vi.mock("./identity-access", () => ({ createAdminIdentityAccess: vi.fn() }));
vi.mock("@fandom-harbor/database", () => ({
  createServerSupabaseClient: vi.fn(),
}));

const UID = "cb1e6693-876d-4c4c-8153-3d0fbac6da17";
const SESSION = "20000000-0000-4000-8000-000000000001";
function fixture() {
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: UID } },
        error: null,
      })),
      getClaims: vi.fn(async () => ({
        data: {
          claims: {
            sub: UID,
            session_id: SESSION,
            aal: "aal1",
            amr: [{ method: "password", timestamp: 1793151000 }],
          },
        },
        error: null,
      })),
      getSession: vi.fn(async () => ({
        data: { session: { access_token: "synthetic-current-access-token" } },
        error: null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(async () => ({
          data: { currentLevel: "aal1", nextLevel: "aal2" },
          error: null,
        })),
        listFactors: vi.fn(async () => ({
          data: {
            totp: [
              { id: "factor-a", status: "verified" },
              { id: "factor-b", status: "unverified" },
            ],
          },
          error: null,
        })),
        challengeAndVerify: vi.fn(async () => ({ error: null })),
      },
    },
    rpc: vi.fn(async () => ({
      data: {
        userId: UID,
        registrationName: "Phase2RemoteInviter",
        membership: { state: "active" },
        effectiveRoles: ["reader", "super_admin"],
      },
      error: null,
    })),
  };
  const access = {
    getForIdentity: vi.fn(async () => ({
      identity: { id: UID },
      membershipState: "active",
      capabilities: new Set(["super_admin:operate"]),
    })),
  };
  const gateway = createPreviewSessionGateway(
    client as unknown as Parameters<typeof createPreviewSessionGateway>[0],
    access as unknown as Parameters<typeof createPreviewSessionGateway>[1],
  );
  return { client, access, gateway };
}

describe("official Auth MFA/local logout gateway", () => {
  it("cross-checks live getUser, verified Claims, and the SDK AAL", async () => {
    const target = fixture();
    await expect(target.gateway.current()).resolves.toMatchObject({
      actorUserId: UID,
      sessionId: SESSION,
      assuranceLevel: "aal1",
    });
    expect(target.client.auth.getUser).toHaveBeenCalledOnce();
    expect(target.client.auth.getClaims).toHaveBeenCalledOnce();
    expect(
      target.client.auth.mfa.getAuthenticatorAssuranceLevel,
    ).toHaveBeenCalledOnce();
  });
  it("rejects a stale JWT when network Auth no longer recognizes the Session", async () => {
    const target = fixture();
    target.client.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "session_not_found" },
    } as never);
    await expect(target.gateway.current()).resolves.toBeNull();
    expect(target.client.auth.getClaims).not.toHaveBeenCalled();
  });
  it("rejects disagreement between authoritative user, signed UID and SDK AAL", async () => {
    const target = fixture();
    target.client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce(
      { data: { currentLevel: "aal2" }, error: null } as never,
    );
    await expect(target.gateway.current()).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
    });
    target.client.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "10000000-0000-4000-8000-000000000099" } },
      error: null,
    });
    await expect(target.gateway.current()).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
    });
  });
  it("only exposes verified TOTP factors and invokes the official verifier", async () => {
    const target = fixture();
    await expect(target.gateway.listVerifiedTotp()).resolves.toEqual([
      { id: "factor-a" },
    ]);
    await target.gateway.verifyTotp("factor-a", "123456");
    expect(target.client.auth.mfa.challengeAndVerify).toHaveBeenCalledWith({
      factorId: "factor-a",
      code: "123456",
    });
  });
  it("does not turn an Auth TOTP error into AAL2", async () => {
    const target = fixture();
    target.client.auth.mfa.challengeAndVerify.mockResolvedValueOnce({
      error: { code: "mfa_verification_failed" },
    } as never);
    await expect(
      target.gateway.verifyTotp("factor-a", "000000"),
    ).rejects.toMatchObject({ code: "MFA_REJECTED" });
  });
  it("uses the authenticated self-read RPC without service-role or authorization writes", async () => {
    const target = fixture();
    await target.gateway.protectedSelfRead(UID, "Phase2RemoteInviter");
    expect(target.client.rpc).toHaveBeenCalledWith(
      "get_identity_access_subject_v1",
      { p_user_id: UID },
    );
    target.client.rpc.mockResolvedValueOnce({
      data: { userId: "other" },
      error: null,
    } as never);
    await expect(
      target.gateway.protectedSelfRead(UID, "Phase2RemoteInviter"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("explicitly revokes only local scope and proves the previous JWT is refused by Auth", async () => {
    const target = fixture();
    target.client.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "session_not_found" },
    } as never);
    await expect(target.gateway.signOutLocal()).resolves.toBeUndefined();
    expect(target.client.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "local",
    });
    expect(target.client.auth.getUser).toHaveBeenCalledWith(
      "synthetic-current-access-token",
    );
  });
  it("does not claim logout when the old JWT is still accepted", async () => {
    const target = fixture();
    await expect(target.gateway.signOutLocal()).rejects.toMatchObject({
      code: "LOGOUT_UNCONFIRMED",
    });
    expect(target.client.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "local",
    });
  });
  it("does not retry uncertain revocation or accept an unrelated probe failure", async () => {
    const target = fixture();
    target.client.auth.signOut.mockResolvedValueOnce({
      error: { code: "network" },
    } as never);
    await expect(target.gateway.signOutLocal()).rejects.toMatchObject({
      code: "LOGOUT_UNCONFIRMED",
    });
    expect(target.client.auth.getUser).not.toHaveBeenCalled();
    target.client.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "bad_jwt" },
    } as never);
    await expect(target.gateway.signOutLocal()).rejects.toMatchObject({
      code: "LOGOUT_UNCONFIRMED",
    });
  });
  it("requires an actual Session before attempting local revocation", async () => {
    const target = fixture();
    target.client.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    } as never);
    await expect(target.gateway.signOutLocal()).rejects.toMatchObject({
      code: "LOGOUT_UNCONFIRMED",
    });
    expect(target.client.auth.signOut).not.toHaveBeenCalled();
  });
  it("rejects Production before constructing any Auth client", async () => {
    await expect(
      createPreviewSessionRuntime({ VERCEL_ENV: "production" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

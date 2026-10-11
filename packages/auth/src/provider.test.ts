import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProviderError, createServerAuthProvider } from "./provider";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  rpc: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mocks.getClaims,
      signUp: mocks.signUp,
    },
    rpc: mocks.rpc,
  })),
}));

const runtime = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
};

const cookies = {
  getAll: () => [],
  setAll: () => undefined,
};

const input = {
  invitationCodeHash: "a".repeat(64),
  password: "12345678",
  registrationName: "HarborReader",
};

describe("registration provider errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["invalid", "INVALID_INVITATION"],
    ["expired", "INVITATION_EXPIRED"],
    ["exhausted", "INVITATION_EXHAUSTED"],
    ["revoked", "INVITATION_REVOKED"],
  ] as const)("classifies %s invitations", async (status, code) => {
    mocks.rpc.mockResolvedValue({ data: status, error: null });

    const auth = createServerAuthProvider(runtime, cookies);

    await expect(auth.signUpWithPassword(input)).rejects.toMatchObject({
      code,
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("reports a missing invitation status RPC as configuration failure", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.registration_invitation_status",
      },
    });

    const auth = createServerAuthProvider(runtime, cookies);

    await expect(auth.signUpWithPassword(input)).rejects.toMatchObject({
      code: "PROVIDER_CONFIGURATION_ERROR",
    } satisfies Partial<AuthProviderError>);
  });

  it("classifies provider password rejection after a valid invitation", async () => {
    mocks.rpc.mockResolvedValue({ data: "valid", error: null });
    mocks.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: {
        code: "weak_password",
        message: "Password should be stronger",
        status: 422,
      },
    });

    const auth = createServerAuthProvider(runtime, cookies);

    await expect(auth.signUpWithPassword(input)).rejects.toMatchObject({
      code: "WEAK_PASSWORD",
    });
  });

  it("returns a trusted session after valid atomic registration", async () => {
    mocks.rpc.mockResolvedValue({ data: "valid", error: null });
    mocks.signUp.mockResolvedValue({
      data: {
        session: {
          expires_at: 1_900_000_000,
          user: { id: "20000000-0000-4000-8000-000000000010" },
        },
        user: { id: "20000000-0000-4000-8000-000000000010" },
      },
      error: null,
    });

    const auth = createServerAuthProvider(runtime, cookies);
    const result = await auth.signUpWithPassword(input);

    expect(result.session?.identity.id).toBe(
      "20000000-0000-4000-8000-000000000010",
    );
  });
});

describe("server trusted Auth evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses Supabase verified claims and returns no raw token material", async () => {
    mocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          aal: "aal2",
          amr: [{ method: "totp", timestamp: 1_900_000_100 }],
          session_id: "20000000-0000-4000-8000-000000000002",
          sub: "10000000-0000-4000-8000-000000000001",
        },
      },
      error: null,
    });

    const result = await createServerAuthProvider(
      runtime,
      cookies,
    ).getTrustedAuthEvidence();

    expect(mocks.getClaims).toHaveBeenCalledOnce();
    expect(result).toEqual({
      actorUserId: "10000000-0000-4000-8000-000000000001",
      assuranceLevel: "aal2",
      authenticationMethods: [
        { authenticatedAtEpochSeconds: 1_900_000_100, method: "totp" },
      ],
      sessionId: "20000000-0000-4000-8000-000000000002",
    });
    expect(result).not.toHaveProperty("access_token");
    expect(result).not.toHaveProperty("refresh_token");
  });

  it("returns null only when there is no verified session", async () => {
    mocks.getClaims.mockResolvedValue({ data: null, error: null });

    await expect(
      createServerAuthProvider(runtime, cookies).getTrustedAuthEvidence(),
    ).resolves.toBeNull();
  });

  it("maps provider verification failures without exposing provider details", async () => {
    mocks.getClaims.mockResolvedValue({
      data: null,
      error: new Error("raw provider detail"),
    });

    await expect(
      createServerAuthProvider(runtime, cookies).getTrustedAuthEvidence(),
    ).rejects.toMatchObject({
      code: "TRUSTED_AUTH_UNAVAILABLE",
      message: "Trusted authentication evidence is unavailable",
    });
  });
});

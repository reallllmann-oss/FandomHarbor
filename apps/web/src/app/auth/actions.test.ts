import {
  AuthProviderError,
  createTrustedAccessContext,
} from "@fandom-harbor/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../lib/identity-access";
import { createWebTrustedRegistrationBroker } from "../../lib/server-registration";
import { signIn, signUp } from "./actions";

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));

const cookieStore = {
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(
    async () =>
      new Headers({ host: "localhost:3000", origin: "http://localhost:3000" }),
  ),
}));

const securityBroker = {
  consumeRateLimit: vi.fn(async () => undefined),
  getRegistrationMode: vi.fn(
    async (): Promise<"email_required" | "legacy"> => "legacy",
  ),
  resolveLoginName: vi.fn(
    async (): Promise<{
      email: string;
      isLegacyEmail: boolean;
      userId: string;
    } | null> => null,
  ),
};

vi.mock("../../lib/server-auth-security", () => ({
  ServerAuthSecurityError: class extends Error {},
  createWebServerAuthSecurityBroker: vi.fn(() => securityBroker),
}));

vi.mock("../../lib/server-registration", () => ({
  TrustedRegistrationError: class extends Error {},
  createWebTrustedRegistrationBroker: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000010",
};

function createCredentialsFormData(
  password = "12345678",
  invitationCode = "AbC123xYz90",
) {
  const formData = new FormData();
  formData.set("registrationName", "HarborReader");
  formData.set("email", "reader@example.test");
  formData.set("password", password);
  formData.set("invitationCode", invitationCode);
  return formData;
}

describe("web auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    securityBroker.getRegistrationMode.mockResolvedValue("legacy");
    securityBroker.resolveLoginName.mockResolvedValue(null);
  });

  it("rejects sign-up passwords shorter than 8 characters", async () => {
    await expect(signUp(createCredentialsFormData("1234567"))).rejects.toThrow(
      "REDIRECT:/auth/sign-up?error=password",
    );
    expect(createWebIdentityAccess).not.toHaveBeenCalled();
  });

  it("allows an 8-character sign-up password", async () => {
    const signUpWithPassword = vi.fn(async () => ({
      identity,
      session: { identity },
    }));
    const signOut = vi.fn();

    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signOut,
        signUpWithPassword,
      },
    } as never);

    await expect(signUp(createCredentialsFormData("12345678"))).rejects.toThrow(
      "REDIRECT:/auth/sign-in?status=registered",
    );
    expect(signUpWithPassword).toHaveBeenCalledWith({
      invitationCodeHash: expect.stringMatching(/^[0-9a-f]{64}$/),
      password: "12345678",
      registrationName: "HarborReader",
    });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("uses the trusted email broker and stores only the opaque attempt cookie", async () => {
    securityBroker.getRegistrationMode.mockResolvedValueOnce("email_required");
    const register = vi.fn(async () => ({
      attemptHandle: "a".repeat(64),
      reservationExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      status: "confirmation_pending" as const,
    }));
    vi.mocked(createWebTrustedRegistrationBroker).mockReturnValue({
      register,
    } as never);

    await expect(signUp(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/verify-email?status=confirmation_pending",
    );
    expect(register).toHaveBeenCalledWith(
      {
        email: "reader@example.test",
        invitationCode: "AbC123xYz90",
        password: "12345678",
        registrationName: "HarborReader",
      },
      undefined,
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "fh_registration_attempt",
      "a".repeat(64),
      expect.objectContaining({
        httpOnly: true,
        path: "/auth",
        sameSite: "lax",
      }),
    );
    expect(JSON.stringify(cookieStore.set.mock.calls)).not.toContain(
      "reader@example.test",
    );
    expect(cookies).toHaveBeenCalled();
  });

  it("keeps valid legacy invitation lengths eligible for database validation", async () => {
    const signUpWithPassword = vi.fn(async () => ({
      identity,
      session: null,
    }));
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signUpWithPassword,
      },
    } as never);

    await expect(
      signUp(
        createCredentialsFormData(
          "12345678",
          "LegacyInvitationCodeThatRemainsValid123",
        ),
      ),
    ).rejects.toThrow("REDIRECT:/auth/sign-in?status=registered");
    expect(signUpWithPassword).toHaveBeenCalledWith({
      invitationCodeHash: expect.stringMatching(/^[0-9a-f]{64}$/),
      password: "12345678",
      registrationName: "HarborReader",
    });
  });

  it("requires a registration name and invitation code", async () => {
    const formData = createCredentialsFormData();
    formData.set("registrationName", "");
    formData.set("invitationCode", "");

    await expect(signUp(formData)).rejects.toThrow(
      "REDIRECT:/auth/sign-up?error=registration-name",
    );
    expect(createWebIdentityAccess).not.toHaveBeenCalled();
  });

  it("shows an explicit invalid invitation error", async () => {
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signUpWithPassword: vi.fn(async () => {
          throw new AuthProviderError("INVALID_INVITATION", "invalid invite");
        }),
      },
    } as never);

    await expect(signUp(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-up?error=invitation",
    );
  });

  it("shows an explicit duplicate registration name error", async () => {
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signUpWithPassword: vi.fn(async () => {
          throw new AuthProviderError(
            "REGISTRATION_NAME_TAKEN",
            "duplicate registration name",
          );
        }),
      },
    } as never);

    await expect(signUp(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-up?error=name-taken",
    );
  });

  it.each([
    ["INVITATION_EXPIRED", "invitation-expired"],
    ["INVITATION_EXHAUSTED", "invitation-exhausted"],
    ["INVITATION_REVOKED", "invitation-revoked"],
    ["WEAK_PASSWORD", "password"],
    ["PROVIDER_CONFIGURATION_ERROR", "configuration"],
    ["SERVICE_UNAVAILABLE", "service-unavailable"],
  ] as const)("maps %s to %s", async (code, queryError) => {
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signUpWithPassword: vi.fn(async () => {
          throw new AuthProviderError(code, "classified registration error");
        }),
      },
    } as never);

    await expect(signUp(createCredentialsFormData())).rejects.toThrow(
      `REDIRECT:/auth/sign-up?error=${queryError}`,
    );
  });

  it("maps sign-up rate limits to a specific user-facing error", async () => {
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      auth: {
        signOut: vi.fn(),
        signUpWithPassword: vi.fn(async () => {
          throw new AuthProviderError(
            "RATE_LIMITED",
            "auth request rate limit exceeded",
          );
        }),
      },
    } as never);

    await expect(signUp(createCredentialsFormData("12345678"))).rejects.toThrow(
      "REDIRECT:/auth/sign-up?error=rate-limited",
    );
  });

  it("allows an 8-character sign-in password and routes Readers to archive", async () => {
    const signInWithPassword = vi.fn(async () => ({ identity }));
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({
            identity,
            membershipState: "active",
          }),
        ),
      },
      auth: {
        signInWithPassword,
      },
    } as never);

    await expect(signIn(createCredentialsFormData("12345678"))).rejects.toThrow(
      "REDIRECT:/archive",
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      password: "12345678",
      registrationName: "HarborReader",
    });
    expect(redirect).toHaveBeenCalledWith("/archive");
  });

  it("resolves a real-email account on the server before password login", async () => {
    securityBroker.resolveLoginName.mockResolvedValueOnce({
      email: "reader@example.test",
      isLegacyEmail: false,
      userId: identity.id,
    });
    const signInWithResolvedEmail = vi.fn(async () => ({ identity }));
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({ identity, membershipState: "active" }),
        ),
      },
      auth: { signInWithResolvedEmail },
    } as never);

    await expect(signIn(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/archive",
    );
    expect(signInWithResolvedEmail).toHaveBeenCalledWith({
      email: "reader@example.test",
      password: "12345678",
    });
  });

  it("returns a Reader to a safe local page after sign-in", async () => {
    const formData = createCredentialsFormData();
    formData.set("next", "/author/harbor-author");
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({ identity, membershipState: "active" }),
        ),
      },
      auth: { signInWithPassword: vi.fn(async () => ({ identity })) },
    } as never);

    await expect(signIn(formData)).rejects.toThrow(
      "REDIRECT:/author/harbor-author",
    );
  });

  it("ignores external redirect targets after sign-in", async () => {
    const formData = createCredentialsFormData();
    formData.set("next", "//example.test/phishing");
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({ identity, membershipState: "active" }),
        ),
      },
      auth: { signInWithPassword: vi.fn(async () => ({ identity })) },
    } as never);

    await expect(signIn(formData)).rejects.toThrow("REDIRECT:/archive");
  });
});

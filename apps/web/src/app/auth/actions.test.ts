import {
  AuthProviderError,
  createTrustedAccessContext,
} from "@fandom-harbor/auth";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../lib/identity-access";
import { signIn, signUp } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000010",
};

function createCredentialsFormData(
  password = "12345678",
  invitationCode = "a".repeat(32),
) {
  const formData = new FormData();
  formData.set("registrationName", "HarborReader");
  formData.set("password", password);
  formData.set("invitationCode", invitationCode);
  return formData;
}

describe("web auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

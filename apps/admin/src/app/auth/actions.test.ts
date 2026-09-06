import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminIdentityAccess } from "../../lib/identity-access";
import { signIn, signOut } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("../../lib/identity-access", () => ({
  createAdminIdentityAccess: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000011",
};

function createCredentialsFormData(password = "12345678") {
  const formData = new FormData();
  formData.set("registrationName", "HarborAdmin");
  formData.set("password", password);
  return formData;
}

describe("admin auth sign-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects passwords shorter than 8 characters", async () => {
    await expect(signIn(createCredentialsFormData("1234567"))).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=invalid",
    );
    expect(createAdminIdentityAccess).not.toHaveBeenCalled();
  });

  it("accepts an 8-character password for admins", async () => {
    const signInWithPassword = vi.fn(async () => ({ identity }));
    vi.mocked(createAdminIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({
            identity,
            membershipState: "active",
            roles: ["admin"],
          }),
        ),
      },
      auth: {
        signInWithPassword,
      },
    } as never);

    await expect(signIn(createCredentialsFormData("12345678"))).rejects.toThrow(
      "REDIRECT:/",
    );
    expect(signInWithPassword).toHaveBeenCalledWith({
      password: "12345678",
      registrationName: "HarborAdmin",
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });
});

describe("admin auth sign-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ends the existing session and returns to the Admin sign-in page", async () => {
    const providerSignOut = vi.fn(async () => undefined);
    vi.mocked(createAdminIdentityAccess).mockResolvedValue({
      auth: { signOut: providerSignOut },
    } as never);

    await expect(signOut()).rejects.toThrow("REDIRECT:/auth/sign-in");

    expect(providerSignOut).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/auth/sign-in");
  });
});

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
const resolver = vi.hoisted(() => ({ resolve: vi.fn() }));
vi.mock("../../lib/admin-login-resolver", () => ({
  createAdminLoginResolver: vi.fn(() => resolver),
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
    resolver.resolve.mockResolvedValue({
      userId: identity.id,
      email: "synthetic@preview.invalid",
    });
  });

  it("rejects passwords shorter than 8 characters", async () => {
    await expect(signIn(createCredentialsFormData("1234567"))).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=invalid",
    );
    expect(createAdminIdentityAccess).not.toHaveBeenCalled();
  });

  it("accepts an 8-character password for admins", async () => {
    const signInWithResolvedEmail = vi.fn(async () => ({ identity }));
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
        signInWithResolvedEmail,
      },
    } as never);

    await expect(signIn(createCredentialsFormData("12345678"))).rejects.toThrow(
      "REDIRECT:/",
    );
    expect(signInWithResolvedEmail).toHaveBeenCalledWith({
      password: "12345678",
      email: "synthetic@preview.invalid",
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  function mockAccess(
    input: {
      roles?: ("admin" | "super_admin")[];
      membershipState?: "active" | "revoked";
      returnedUid?: string;
    } = {},
  ) {
    const auth = {
      signInWithResolvedEmail: vi.fn(async () => ({
        identity: { id: input.returnedUid ?? identity.id },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(async () => undefined),
    };
    const accessRepository = {
      getForIdentity: vi.fn(async () =>
        createTrustedAccessContext({
          identity,
          membershipState: input.membershipState ?? "active",
          roles: input.roles ?? ["super_admin"],
        }),
      ),
    };
    vi.mocked(createAdminIdentityAccess).mockResolvedValue({
      auth,
      accessRepository,
    } as never);
    return { auth, accessRepository };
  }

  it.each(["Phase2RemoteInviter", "akumie"])(
    "uses the authoritative current email for %s and retains role authorization",
    async (name) => {
      const { auth, accessRepository } = mockAccess();
      const form = createCredentialsFormData();
      form.set("registrationName", name);
      resolver.resolve.mockResolvedValue({
        userId: identity.id,
        email: "bound@example.com",
      });
      await expect(signIn(form)).rejects.toThrow("REDIRECT:/");
      expect(resolver.resolve).toHaveBeenCalledWith(name);
      expect(auth.signInWithResolvedEmail).toHaveBeenCalledWith({
        email: "bound@example.com",
        password: "12345678",
      });
      expect(auth.signInWithPassword).not.toHaveBeenCalled();
      expect(accessRepository.getForIdentity).toHaveBeenCalledWith(identity);
    },
  );

  it.each([null, new Error("resolution unavailable")])(
    "fails closed without a guessed email when resolution fails (%s)",
    async (result) => {
      const { auth } = mockAccess();
      if (result instanceof Error)
        resolver.resolve.mockRejectedValueOnce(result);
      else resolver.resolve.mockResolvedValueOnce(result);
      await expect(signIn(createCredentialsFormData())).rejects.toThrow(
        "REDIRECT:/auth/sign-in?error=invalid",
      );
      expect(auth.signInWithResolvedEmail).not.toHaveBeenCalled();
      expect(auth.signInWithPassword).not.toHaveBeenCalled();
    },
  );

  it("rejects and signs out a password Session for a different UID before reading capabilities", async () => {
    const { auth, accessRepository } = mockAccess({
      returnedUid: "20000000-0000-4000-8000-000000000099",
    });
    await expect(signIn(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=invalid",
    );
    expect(auth.signOut).toHaveBeenCalledOnce();
    expect(accessRepository.getForIdentity).not.toHaveBeenCalled();
  });

  it("keeps Auth credential rejection generic", async () => {
    const { auth } = mockAccess();
    auth.signInWithResolvedEmail.mockRejectedValueOnce(
      new Error("Auth rejected"),
    );
    await expect(signIn(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=invalid",
    );
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it.each(["resolver", "password"])(
    "does not expose account data in %s failure responses or logs",
    async (stage) => {
      const { auth } = mockAccess();
      const error = new Error(
        "synthetic@example.com synthetic-private-material",
      );
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const consoleLog = vi
        .spyOn(console, "log")
        .mockImplementation(() => undefined);
      try {
        if (stage === "resolver") resolver.resolve.mockRejectedValueOnce(error);
        else auth.signInWithResolvedEmail.mockRejectedValueOnce(error);
        await expect(signIn(createCredentialsFormData())).rejects.toThrow(
          "REDIRECT:/auth/sign-in?error=invalid",
        );
        expect(redirect).toHaveBeenCalledWith("/auth/sign-in?error=invalid");
        expect(JSON.stringify(vi.mocked(redirect).mock.calls)).not.toContain(
          "synthetic@example.com",
        );
        expect(consoleError).not.toHaveBeenCalled();
        expect(consoleLog).not.toHaveBeenCalled();
      } finally {
        consoleError.mockRestore();
        consoleLog.mockRestore();
      }
    },
  );

  it("still signs out a Reader and refuses the Admin surface", async () => {
    const { auth } = mockAccess({ roles: [] });
    await expect(signIn(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=forbidden",
    );
    expect(auth.signOut).toHaveBeenCalledOnce();
  });

  it("still rejects a Super Admin with revoked membership", async () => {
    const { auth } = mockAccess({ membershipState: "revoked" });
    await expect(signIn(createCredentialsFormData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=forbidden",
    );
    expect(auth.signOut).toHaveBeenCalledOnce();
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

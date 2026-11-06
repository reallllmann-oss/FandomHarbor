import type { AuthCookieStore } from "@fandom-harbor/auth";
import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { createServerSupabaseClient } from "@fandom-harbor/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../lib/identity-access";
import { createStagedAuthCookies } from "../../lib/staged-auth-cookies";
import {
  requestEmailChange,
  requestPasswordReset,
  signIn,
  updatePassword,
  verifyPasswordRecovery,
} from "./actions";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock("../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));
vi.mock("@fandom-harbor/database", async (original) => ({
  ...(await original<typeof import("@fandom-harbor/database")>()),
  createServerSupabaseClient: vi.fn(),
}));

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(
    async () =>
      new Headers({
        host: "localhost:3000",
        origin: "http://localhost:3000",
      }),
  ),
}));
const security = {
  consumeRateLimit: vi.fn(),
  resolveLoginName: vi.fn(),
  issuePasswordRecoveryGrant: vi.fn(),
  verifyPasswordRecoveryGrant: vi.fn(),
};
vi.mock("../../lib/server-auth-security", () => ({
  PASSWORD_RECOVERY_GRANT_TTL_SECONDS: 600,
  ServerAuthSecurityError: class extends Error {},
  createWebServerAuthSecurityBroker: vi.fn(() => security),
}));

const UID = "20000000-0000-4000-8000-000000000010";
const OTHER = "20000000-0000-4000-8000-000000000011";
const email = "reader@example.test";
const user = { id: UID, email };
let cookieAdapter: AuthCookieStore;
let issuedUid: string;
let issuedSessionUid: string;
const destination = { getAll: vi.fn(), setAll: vi.fn() };
const commit = vi.fn();
const accessRead = vi.fn();
const client = {
  auth: {
    verifyOtp: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
};

function form(values: Record<string, string>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}
const credentials = () =>
  form({ registrationName: "HarborReader", password: "test-password" });
const recovery = () =>
  form({ registrationName: "HarborReader", token: "123456" });
const password = () =>
  form({
    currentPassword: "test-password",
    password: "new-test-password",
    passwordConfirmation: "new-test-password",
  });
const changeEmail = () =>
  form({ currentPassword: "test-password", email: "reader-new@example.test" });

beforeEach(() => {
  vi.resetAllMocks();
  issuedUid = UID;
  issuedSessionUid = UID;
  destination.getAll.mockReturnValue([
    { name: "auth", value: "original-test-session" },
  ]);
  security.consumeRateLimit.mockResolvedValue(undefined);
  security.resolveLoginName.mockResolvedValue({
    email,
    userId: UID,
    isLegacyEmail: false,
  });
  security.issuePasswordRecoveryGrant.mockReturnValue("test-only-grant");
  security.verifyPasswordRecoveryGrant.mockReturnValue(false);
  accessRead.mockResolvedValue(
    createTrustedAccessContext({
      identity: { id: UID },
      membershipState: "active",
    }),
  );
  vi.mocked(createWebIdentityAccess).mockImplementation(async (options) => {
    const staged = options?.stageAuthCookies
      ? createStagedAuthCookies(destination)
      : null;
    cookieAdapter = staged?.cookieAdapter ?? destination;
    commit.mockImplementation(async () => staged?.commit());
    return {
      cookieAdapter,
      runtime: {},
      commitAuthCookies: commit,
      accessRepository: { getForIdentity: accessRead },
      auth: {
        signInWithResolvedEmail: async () => {
          await cookieAdapter.setAll([
            { name: "auth", value: "new-test-session" },
          ]);
          return { identity: { id: issuedUid } };
        },
      },
    } as never;
  });
  client.auth.verifyOtp.mockImplementation(async () => {
    await cookieAdapter.setAll([
      { name: "auth", value: "recovery-test-session" },
    ]);
    return {
      data: {
        user: { ...user, id: issuedUid },
        session: { user: { ...user, id: issuedSessionUid } },
      },
      error: null,
    };
  });
  client.auth.getUser.mockResolvedValue({ data: { user }, error: null });
  client.auth.signInWithPassword.mockImplementation(async () => {
    await cookieAdapter.setAll([
      { name: "auth", value: "reauth-test-session" },
    ]);
    return {
      data: {
        user: { ...user, id: issuedUid },
        session: { user: { ...user, id: issuedSessionUid } },
      },
      error: null,
    };
  });
  client.auth.updateUser.mockResolvedValue({ data: { user }, error: null });
  client.auth.signOut.mockResolvedValue({ error: null });
  client.auth.resetPasswordForEmail.mockResolvedValue({
    data: {},
    error: null,
  });
  vi.mocked(createServerSupabaseClient).mockReturnValue(client as never);
});

describe("Reader identity and recovery boundaries", () => {
  it("publishes login cookies only for the resolved UID", async () => {
    await expect(signIn(credentials())).rejects.toThrow("REDIRECT:/archive");
    expect(accessRead).toHaveBeenCalledWith({ id: UID });
    expect(commit).toHaveBeenCalledOnce();
    expect(destination.setAll).toHaveBeenCalledOnce();
  });

  it("rejects a different login UID without publishing cookies or reading its access", async () => {
    issuedUid = OTHER;
    await expect(signIn(credentials())).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=invalid",
    );
    expect(client.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "local",
    });
    expect(commit).not.toHaveBeenCalled();
    expect(destination.setAll).not.toHaveBeenCalled();
    expect(accessRead).not.toHaveBeenCalled();
  });

  it.each(["known", "unknown", "limited", "provider-failed"])(
    "keeps recovery-request feedback neutral: %s",
    async (scenario) => {
      if (scenario === "unknown")
        security.resolveLoginName.mockResolvedValue(null);
      if (scenario === "limited")
        security.consumeRateLimit.mockRejectedValue(new Error("rate limited"));
      if (scenario === "provider-failed")
        client.auth.resetPasswordForEmail.mockResolvedValue({
          error: new Error("unavailable"),
        });
      await expect(
        requestPasswordReset(form({ registrationName: "HarborReader" })),
      ).rejects.toThrow("REDIRECT:/auth/reset-password?status=sent");
      expect(cookieStore.set).not.toHaveBeenCalled();
      if (scenario === "limited")
        expect(client.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    },
  );

  it("issues a short-lived grant only after OTP, session and current Auth UID agree", async () => {
    await expect(verifyPasswordRecovery(recovery())).rejects.toThrow(
      "REDIRECT:/account/security?status=recovery",
    );
    expect(client.auth.verifyOtp).toHaveBeenCalledExactlyOnceWith({
      email,
      token: "123456",
      type: "recovery",
    });
    expect(client.auth.getUser).toHaveBeenCalledOnce();
    expect(security.issuePasswordRecoveryGrant).toHaveBeenCalledExactlyOnceWith(
      UID,
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "fh_password_recovery",
      "test-only-grant",
      expect.objectContaining({
        httpOnly: true,
        path: "/account/security",
        maxAge: 600,
        sameSite: "lax",
      }),
    );
    expect(destination.setAll).toHaveBeenCalledOnce();
  });

  it.each([
    "otp-uid",
    "session-uid",
    "missing-session",
    "current-uid",
    "current-email",
    "current-unavailable",
    "otp-error",
  ])("rejects inconsistent recovery evidence: %s", async (scenario) => {
    if (scenario === "otp-uid") issuedUid = OTHER;
    if (scenario === "session-uid") issuedSessionUid = OTHER;
    if (scenario === "missing-session")
      client.auth.verifyOtp.mockResolvedValue({
        data: { user, session: null },
        error: null,
      });
    if (scenario === "current-uid")
      client.auth.getUser.mockResolvedValue({
        data: { user: { ...user, id: OTHER } },
        error: null,
      });
    if (scenario === "current-email")
      client.auth.getUser.mockResolvedValue({
        data: { user: { ...user, email: "different@example.test" } },
        error: null,
      });
    if (scenario === "current-unavailable")
      client.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("unavailable"),
      });
    if (scenario === "otp-error")
      client.auth.verifyOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error("invalid OTP"),
      });
    await expect(verifyPasswordRecovery(recovery())).rejects.toThrow(
      "REDIRECT:/auth/reset-password?error=invalid",
    );
    expect(security.issuePasswordRecoveryGrant).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(destination.setAll).not.toHaveBeenCalled();
  });

  it("does not issue a recovery grant when session-cookie publication fails", async () => {
    destination.setAll.mockRejectedValue(new Error("cookie commit failed"));
    await expect(verifyPasswordRecovery(recovery())).rejects.toThrow(
      "REDIRECT:/auth/reset-password?error=invalid",
    );
    expect(security.issuePasswordRecoveryGrant).not.toHaveBeenCalled();
  });

  it.each(["unknown", "legacy"])(
    "does not issue a recovery grant for %s accounts",
    async (scenario) => {
      security.resolveLoginName.mockResolvedValue(
        scenario === "unknown"
          ? null
          : { email, userId: UID, isLegacyEmail: true },
      );
      await expect(verifyPasswordRecovery(recovery())).rejects.toThrow(
        "REDIRECT:/auth/reset-password?error=invalid",
      );
      expect(security.issuePasswordRecoveryGrant).not.toHaveBeenCalled();
      expect(destination.setAll).not.toHaveBeenCalled();
    },
  );

  it("does not claim other-session revocation until the official call succeeds", async () => {
    await expect(updatePassword(password())).rejects.toThrow(
      "REDIRECT:/account/security?status=password-updated",
    );
    expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({
      password: "new-test-password",
    });
    expect(client.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "others",
    });
    expect(cookieStore.delete).toHaveBeenCalledWith("fh_password_recovery");
  });

  it.each(["rejected", "network"])(
    "reports an already changed password with unconfirmed revocation: %s",
    async (scenario) => {
      if (scenario === "rejected")
        client.auth.signOut.mockResolvedValue({ error: new Error("rejected") });
      else client.auth.signOut.mockRejectedValue(new Error("network"));
      await expect(updatePassword(password())).rejects.toThrow(
        "REDIRECT:/account/security?status=password-updated-sessions-unconfirmed",
      );
      expect(client.auth.updateUser).toHaveBeenCalledOnce();
      expect(client.auth.signOut).toHaveBeenCalledOnce();
      expect(cookieStore.delete).toHaveBeenCalledOnce();
    },
  );

  it("requires the current password when the UID-bound recovery grant is absent or invalid", async () => {
    const input = password();
    input.delete("currentPassword");
    await expect(updatePassword(input)).rejects.toThrow(
      "REDIRECT:/account/security?error=current-password",
    );
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it("accepts a valid recovery grant without the old password", async () => {
    security.verifyPasswordRecoveryGrant.mockReturnValue(true);
    const input = password();
    input.delete("currentPassword");
    await expect(updatePassword(input)).rejects.toThrow(
      "REDIRECT:/account/security?status=password-updated",
    );
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(client.auth.updateUser).toHaveBeenCalledOnce();
  });

  it.each(["password", "email"])(
    "rejects a reauthentication UID mismatch before %s mutation",
    async (operation) => {
      issuedSessionUid = OTHER;
      await expect(
        operation === "password"
          ? updatePassword(password())
          : requestEmailChange(changeEmail()),
      ).rejects.toThrow("REDIRECT:/account/security?error=session-identity");
      expect(client.auth.updateUser).not.toHaveBeenCalled();
      expect(destination.setAll).not.toHaveBeenCalled();
      expect(client.auth.signOut).toHaveBeenCalledExactlyOnceWith({
        scope: "local",
      });
    },
  );

  it("retains the native secure email-change request for a matching Reader UID", async () => {
    await expect(requestEmailChange(changeEmail())).rejects.toThrow(
      "REDIRECT:/account/security?status=email-change-sent",
    );
    expect(client.auth.updateUser).toHaveBeenCalledExactlyOnceWith({
      email: "reader-new@example.test",
    });
    expect(destination.setAll).toHaveBeenCalledOnce();
  });
});

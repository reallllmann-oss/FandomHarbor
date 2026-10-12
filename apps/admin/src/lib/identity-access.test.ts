import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  accessForIdentity: vi.fn(),
  authGetSession: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
  maybeSingle: vi.fn(),
  select: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: vi.fn(), set: vi.fn() })),
}));

vi.mock("@fandom-harbor/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@fandom-harbor/config")>()),
  readPublicRuntimeConfig: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  })),
}));

vi.mock("@fandom-harbor/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@fandom-harbor/auth")>()),
  createServerAuthProvider: vi.fn(() => ({
    getSession: mocks.authGetSession,
  })),
}));

vi.mock("@fandom-harbor/database", () => ({
  createServerSupabaseClient: vi.fn(() => ({ from: mocks.from })),
  createSupabaseAccessContextRepository: vi.fn(() => ({
    getForIdentity: mocks.accessForIdentity,
  })),
  createSupabaseIdentityAccessStore: vi.fn(() => ({})),
}));

import { getAdminCurrentIdentity } from "./identity-access";

const identity = {
  id: "20000000-0000-4000-8000-000000000011",
};

describe("Admin current identity trusted lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authGetSession.mockResolvedValue({ identity });
    mocks.accessForIdentity.mockResolvedValue(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author", "super_admin"],
      }),
    );
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({
      data: { registration_name: "akumie" },
      error: null,
    });
  });

  it("keys the self-profile read from the verified Session identity", async () => {
    await expect(getAdminCurrentIdentity()).resolves.toEqual({
      displayRole: "超级管理员",
      registrationName: "akumie",
    });

    expect(mocks.accessForIdentity).toHaveBeenCalledWith(identity);
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.select).toHaveBeenCalledWith("registration_name");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", identity.id);
    expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
  });
});

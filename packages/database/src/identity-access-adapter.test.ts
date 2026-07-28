import {
  InvitationCodeCollisionError,
  type IdentityAccessStore,
} from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseAccessError } from "./access-context-repository";
import { createSupabaseIdentityAccessStore } from "./identity-access-adapter";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("./server-client", () => ({
  createServerSupabaseClient: () => ({ rpc: mocks.rpc }),
}));

function store(): IdentityAccessStore {
  return createSupabaseIdentityAccessStore(
    {},
    {
      getAll: () => [],
      setAll: () => undefined,
    },
  );
}

const invitationInput = {
  codeHash: "a".repeat(64),
  expiresAt: new Date("2026-08-01T00:00:00.000Z"),
  maxUses: 2,
};

describe("Supabase identity access adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only a persisted non-null invitation id", async () => {
    mocks.rpc.mockResolvedValue({
      data: "10000000-0000-4000-8000-000000000001",
      error: null,
    });

    await expect(store().createInvitation(invitationInput)).resolves.toBe(
      "10000000-0000-4000-8000-000000000001",
    );
  });

  it("maps PostgreSQL 23505 to a typed invitation collision", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        details: "internal collision detail",
        hint: null,
        message: "internal unique constraint detail",
      },
    });

    await expect(
      store().createInvitation(invitationInput),
    ).rejects.toBeInstanceOf(InvitationCodeCollisionError);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it.each([{ data: null }, { data: { id: null } }])(
    "maps a defensive null result to a typed collision",
    async ({ data }) => {
      mocks.rpc.mockResolvedValue({ data, error: null });

      await expect(
        store().createInvitation(invitationInput),
      ).rejects.toBeInstanceOf(InvitationCodeCollisionError);
      expect(mocks.rpc).toHaveBeenCalledTimes(1);
    },
  );

  it("maps a non-23505 error once without exposing database details", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        details: "private schema detail",
        hint: "private SQL hint",
        message: "private database message",
      },
    });

    const outcome = store().createInvitation(invitationInput);

    await expect(outcome).rejects.toBeInstanceOf(DatabaseAccessError);
    await expect(outcome).rejects.toThrow(
      "Identity access operation failed: create_invitation",
    );
    await expect(outcome).rejects.not.toThrow("private");
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("rejects an unexpected success shape instead of creating a ghost invitation", async () => {
    mocks.rpc.mockResolvedValue({
      data: { id: "10000000-0000-4000-8000-000000000001" },
      error: null,
    });

    await expect(
      store().createInvitation(invitationInput),
    ).rejects.toBeInstanceOf(DatabaseAccessError);
  });
});

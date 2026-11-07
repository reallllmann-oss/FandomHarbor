import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createServerAuthSecurityBroker } from "./server-auth-security";

const environment = {
  AUTH_RATE_LIMIT_SECRET: "test-only-rate-limit-pepper-32-bytes-long",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "test-only-secret-key",
};

describe("server-only auth security broker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores only a keyed subject digest in the rate-limit RPC", async () => {
    const transport = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        void input;
        void init;
        return Response.json(true);
      },
    );
    const broker = createServerAuthSecurityBroker(environment, transport);

    await expect(
      broker.consumeRateLimit("auth.login", "private-user-input", 5, 300),
    ).resolves.toBeUndefined();

    const body = JSON.parse(String(transport.mock.calls[0]?.[1]?.body));
    expect(body).toEqual({
      p_limit: 5,
      p_scope: "auth.login",
      p_subject_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
      p_window_seconds: 300,
    });
    expect(JSON.stringify(body)).not.toContain("private-user-input");
  });

  it("resolves a login name to Auth email only across the server boundary", async () => {
    const userId = "20000000-0000-4000-8000-000000000010";
    const transport = vi.fn(async (input: string | URL | Request) => {
      const path = new URL(String(input)).pathname;
      if (path.endsWith("/rpc/resolve_login_name_user_id")) {
        return Response.json(userId);
      }
      return Response.json({ id: userId, email: "Reader@Example.test" });
    });

    await expect(
      createServerAuthSecurityBroker(environment, transport).resolveLoginName(
        "HarborReader",
      ),
    ).resolves.toEqual({
      email: "reader@example.test",
      isLegacyEmail: false,
      userId,
    });
    expect(JSON.stringify(transport.mock.calls)).toContain(
      "Bearer test-only-secret-key",
    );
  });

  it("uses one fixed Admin decoy read for an unknown registration name", async () => {
    const transport = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        void input;
        void init;
        return Response.json(null);
      },
    );
    await expect(
      createServerAuthSecurityBroker(environment, transport).resolveLoginName(
        "UnknownReader",
      ),
    ).resolves.toBeNull();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(String(transport.mock.calls[1]?.[0])).toContain(
      "/auth/v1/admin/users/00000000-0000-4000-8000-000000000000",
    );
  });

  it("binds a short-lived password recovery grant to one Auth UID", () => {
    const broker = createServerAuthSecurityBroker(environment, vi.fn());
    const userId = "20000000-0000-4000-8000-000000000010";
    const otherUserId = "20000000-0000-4000-8000-000000000011";
    const issuedAt = 1_000_000;
    const grant = broker.issuePasswordRecoveryGrant(userId, issuedAt);

    expect(
      broker.verifyPasswordRecoveryGrant(grant, userId, issuedAt + 599_000),
    ).toBe(true);
    expect(
      broker.verifyPasswordRecoveryGrant(grant, otherUserId, issuedAt),
    ).toBe(false);
    expect(
      broker.verifyPasswordRecoveryGrant(
        `${grant.slice(0, -1)}${grant.endsWith("a") ? "b" : "a"}`,
        userId,
        issuedAt,
      ),
    ).toBe(false);
    expect(
      broker.verifyPasswordRecoveryGrant(grant, userId, issuedAt + 601_000),
    ).toBe(false);
    expect(grant).not.toContain(environment.AUTH_RATE_LIMIT_SECRET);
  });
});

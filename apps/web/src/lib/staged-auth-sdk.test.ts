import type { AuthCookieMutation } from "@fandom-harbor/auth";
import { createServerAuthProvider } from "@fandom-harbor/auth";
import { createServerSupabaseClient } from "@fandom-harbor/database";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createStagedAuthCookies } from "./staged-auth-cookies";

afterEach(() => vi.unstubAllGlobals());

it("carries real SDK login and subsequent Auth updates across the staged cookie boundary without network access", async () => {
  const uid = "20000000-0000-4000-8000-000000000010";
  const base = "https://local-reader-contract.supabase.co";
  const runtime = {
    NEXT_PUBLIC_SUPABASE_URL: base,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-only-publishable-key",
  };
  const jwt =
    [
      { alg: "HS256", typ: "JWT" },
      {
        sub: uid,
        aud: "authenticated",
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    ]
      .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
      .join(".") + ".test-signature";
  const user = {
    id: uid,
    email: "reader@example.test",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
  };
  let observedBearer = false;
  const transport = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      );
      if (url.origin !== base) throw new Error("unexpected transport origin");
      const method = init?.method ?? "GET";
      if (url.pathname === "/auth/v1/token" && method === "POST") {
        return Response.json({
          access_token: jwt,
          refresh_token: "test-only-refresh",
          token_type: "bearer",
          expires_in: 3600,
          user,
        });
      }
      if (url.pathname === "/auth/v1/user") {
        observedBearer =
          new Headers(init?.headers).get("authorization") === `Bearer ${jwt}`;
        return Response.json(user);
      }
      throw new Error("unexpected transport operation");
    },
  );
  vi.stubGlobal("fetch", transport);
  const stored = new Map<string, AuthCookieMutation>();
  const setAll = vi.fn((mutations: AuthCookieMutation[]) => {
    for (const mutation of mutations) {
      if (mutation.options?.maxAge === 0) stored.delete(mutation.name);
      else stored.set(mutation.name, mutation);
    }
  });
  const staged = createStagedAuthCookies({
    getAll: () => [...stored.values()],
    setAll,
  });
  const provider = createServerAuthProvider(runtime, staged.cookieAdapter);
  const session = await provider.signInWithResolvedEmail({
    email: user.email,
    password: "test-only-password",
  });
  expect(session.identity.id).toBe(uid);
  expect(stored.size).toBe(0);

  // A separate SDK client must read the newly staged session, not stale cookies.
  const client = createServerSupabaseClient(runtime, staged.cookieAdapter);
  const current = await client.auth.getUser();
  expect(current.data.user?.id).toBe(uid);
  expect(observedBearer).toBe(true);
  await staged.commit();
  expect(stored.size).toBeGreaterThan(0);
  const writesAtCommit = setAll.mock.calls.length;
  const updated = await client.auth.updateUser({
    password: "replacement-test-password",
  });
  expect(updated.error).toBeNull();
  expect(setAll.mock.calls.length).toBeGreaterThan(writesAtCommit);
  expect(
    transport.mock.calls.some(
      ([url, init]) =>
        String(url).includes("/auth/v1/user") && init?.method === "PUT",
    ),
  ).toBe(true);
});

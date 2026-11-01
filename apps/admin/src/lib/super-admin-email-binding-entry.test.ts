// @vitest-environment node
import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import BindingPage from "../app/b3-sa/email-binding/[operationId]/page";
import {
  createB3Sa2Runtime,
  runB3SaPreviewReadiness,
} from "./super-admin-email-binding-runtime";
import { reportBindingEntryFailure } from "./super-admin-email-binding-diagnostics";
import { getAdminAccessContext } from "./identity-access";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("./identity-access", () => ({ getAdminAccessContext: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const UID = "cb1e6693-876d-4c4c-8153-3d0fbac6da17";
const OTHER = "5fa18bad-6a32-41c3-87e3-e761b00ef8f1";
const OP = "20000000-0000-4000-8000-000000000003";
const SID = "10000000-0000-4000-8000-000000000001";
const REF = "bniqsjnjqesnpcfkpqcz";
const URL = `https://${REF}.supabase.co`;
const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "P-256",
});
const jwk = {
  ...publicKey.export({ format: "jwk" }),
  kid: "synthetic-entry-signing-key",
  alg: "ES256",
  use: "sig",
};

function environment() {
  return {
    B3_SA_EMAIL_BINDING_ENABLED: "true",
    B3_SA_EMAIL_HMAC_SECRET: "synthetic-hmac-material-".repeat(3),
    B3_SA_PREVIEW_SENDER_API_KEY: "synthetic-sending-access-key",
    B3_SA_ALLOWED_TARGET_UIDS: `${UID},${OTHER}`,
    B3_SA_DEPLOYMENT_TARGET: "preview",
    B3_SA_EXPECTED_SUPABASE_PROJECT_REF: REF,
    B3_SA_EXPECTED_GIT_BRANCH: "codex/v1-package-b0-auth-architecture",
    B3_SA_EXPECTED_VERCEL_PROJECT_ID: "prj_synthetic_preview",
    NEXT_PUBLIC_SUPABASE_URL: URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-publishable-key",
    SUPABASE_SECRET_KEY: "synthetic-admin-key",
    NODE_ENV: "production",
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_TARGET_ENV: "preview",
    VERCEL_PROJECT_ID: "prj_synthetic_preview",
    VERCEL_GIT_COMMIT_REF: "codex/v1-package-b0-auth-architecture",
  };
}

function fixture(
  input: {
    uid?: string;
    noSession?: boolean;
    readonlyCookies?: boolean;
    expiredToken?: boolean;
    operationUid?: string;
    rpcStatus?: number;
    targetMismatch?: boolean;
    noRole?: boolean;
    aal?: "aal1" | "aal2";
    totpAge?: number;
    pastOperationDeadline?: boolean;
  } = {},
) {
  for (const [key, value] of Object.entries(environment()))
    vi.stubEnv(key, value);
  const uid = input.uid ?? UID;
  vi.mocked(getAdminAccessContext).mockResolvedValue(
    input.noSession
      ? null
      : ({
          identity: { id: uid },
          capabilities: new Set(input.noRole ? [] : ["super_admin:operate"]),
        } as never),
  );
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", typ: "JWT", kid: jwk.kid }),
  ).toString("base64url");
  const token = (expired: boolean) => {
    const payload = Buffer.from(
      JSON.stringify({
        iss: `${URL}/auth/v1`,
        aud: "authenticated",
        sub: uid,
        session_id: SID,
        aal: input.aal ?? "aal1",
        amr: [
          { method: "password", timestamp: now - 30 },
          ...(input.aal === "aal2"
            ? [{ method: "totp", timestamp: now - (input.totpAge ?? 10) }]
            : []),
        ],
        iat: now - 30,
        exp: now + (expired ? -1 : 3600),
      }),
    ).toString("base64url");
    const unsigned = `${header}.${payload}`;
    return `${unsigned}.${sign("sha256", Buffer.from(unsigned), { key: privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url")}`;
  };
  const jwt = token(input.expiredToken ?? false);
  const user = {
    id: uid,
    email: "synthetic@preview.invalid",
    identities: [],
    factors: [1, 2].map((i) => ({
      id: `20000000-0000-4000-8000-00000000000${i}`,
      factor_type: "totp",
      status: "verified",
    })),
  };
  const session = {
    access_token: jwt,
    refresh_token: "synthetic-refresh-token",
    token_type: "bearer",
    expires_at: now + (input.expiredToken ? -1 : 3600),
    expires_in: 3600,
    user,
  };
  const values = new Map<string, string>(
    input.noSession
      ? []
      : [
          [
            `sb-${REF}-auth-token`,
            `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
          ],
        ],
  );
  const setter = vi.fn((name: string, value: string) => {
    if (input.readonlyCookies)
      throw new Error(
        "Cookies can only be modified in a Server Action or Route Handler.",
      );
    values.set(name, value);
  });
  vi.mocked(cookies).mockResolvedValue({
    getAll: () => [...values].map(([name, value]) => ({ name, value })),
    set: setter,
  } as never);
  const paths: string[] = [];
  const transport = vi.fn<typeof fetch>(async (url, init) => {
    const path = new globalThis.URL(String(url)).pathname;
    if (new globalThis.URL(String(url)).origin !== URL)
      throw new Error("NETWORK_BOUNDARY_REJECTED");
    paths.push(path);
    if (path.endsWith("/.well-known/jwks.json"))
      return Response.json({ keys: [jwk] });
    if (path === "/auth/v1/user") return Response.json(user);
    if (path === `/auth/v1/admin/users/${UID}`)
      return Response.json({
        ...user,
        identities: [
          {
            id: "40000000-0000-4000-8000-000000000001",
            provider: "email",
            identity_data: { email: user.email },
          },
        ],
      });
    if (path === "/auth/v1/token")
      return Response.json({
        ...session,
        access_token: token(false),
        expires_at: now + 3600,
      });
    if (path === "/auth/v1/logout") return new Response(null, { status: 204 });
    if (path.endsWith("/challenge"))
      return Response.json({
        id: "30000000-0000-4000-8000-000000000001",
        expires_at: now + 300,
      });
    if (path.endsWith("/verify")) return Response.json(session);
    if (path.endsWith("/get_super_admin_email_binding_targets_v1")) {
      if (input.rpcStatus)
        return Response.json(
          { message: "synthetic upstream failure: never expose" },
          { status: input.rpcStatus },
        );
      return Response.json(input.targetMismatch ? [OTHER] : [UID, OTHER]);
    }
    if (path.endsWith("/get_super_admin_email_binding_operation_v1")) {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ p_operation_id: OP });
      return Response.json({
        operationId: OP,
        targetUserId: input.operationUid ?? UID,
        status: "prepared",
        preparedAtEpochSeconds: now - (input.pastOperationDeadline ? 1810 : 5),
        expiresAtEpochSeconds: now + (input.pastOperationDeadline ? -10 : 1795),
        sessionBound: false,
        emailFingerprintBound: false,
        recoveryReasonCode: null,
        completedAtEpochSeconds: null,
      });
    }
    throw new Error("NON_READONLY_SYNTHETIC_ROUTE_REJECTED");
  });
  vi.stubGlobal("fetch", transport);
  const page = () =>
    BindingPage({
      params: Promise.resolve({ operationId: OP }),
      searchParams: Promise.resolve({}),
    });
  return { page, paths, setter, transport };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("B3 binding entry with real runtime, SSR clients, repository, and signed local JWT", () => {
  it("allows an authenticated AAL1 owner to read prepared before fresh TOTP without cookie writes", async () => {
    const f = fixture({ readonlyCookies: true });
    await expect(f.page()).resolves.toMatchObject({ type: "div" });
    expect(
      f.paths.some((p) =>
        p.endsWith("/get_super_admin_email_binding_operation_v1"),
      ),
    ).toBe(true);
    expect(
      f.paths.some((p) => p.includes("generate_link") || p.includes("/verify")),
    ).toBe(false);
  });
  it("rejects a different UID even when its JWT is signed and valid", async () => {
    const f = fixture({ uid: OTHER });
    await expect(f.page()).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=forbidden",
    );
  });
  it("allows a legitimately refreshed owner Session in a read-only Server Component", async () => {
    const f = fixture({ readonlyCookies: true, expiredToken: true });
    await expect(f.page()).resolves.toMatchObject({ type: "div" });
    expect(f.paths).toContain("/auth/v1/token");
    expect(f.setter).not.toHaveBeenCalled();
  });
  it("does not misdiagnose an expired prepared Operation as a missing login or Admin role", async () => {
    const f = fixture({ pastOperationDeadline: true });
    await expect(f.page()).resolves.toMatchObject({ type: "div" });
    expect(
      f.paths.some(
        (p) =>
          p.includes("generate_link") ||
          p.endsWith("/bind_super_admin_email_binding_v1"),
      ),
    ).toBe(false);
  });
  it("rejects an absent browser Session", async () => {
    const f = fixture({ noSession: true });
    await expect(f.page()).rejects.toThrow(
      "REDIRECT:/auth/sign-in?error=forbidden",
    );
    expect(f.paths).toEqual([]);
  });
  it("rejects a third UID and a non-Super-Admin before privileged operation reads", async () => {
    for (const input of [
      { uid: "10000000-0000-4000-8000-000000000099" },
      { noRole: true },
    ]) {
      const f = fixture(input);
      await expect(f.page()).rejects.toThrow(
        "REDIRECT:/auth/sign-in?error=forbidden",
      );
      expect(f.paths).toEqual([]);
    }
  });
  it("keeps Gate OFF as not-found before any runtime calls", async () => {
    const f = fixture();
    vi.stubEnv("B3_SA_EMAIL_BINDING_ENABLED", "false");
    await expect(f.page()).rejects.toThrow("NOT_FOUND");
    expect(f.paths).toEqual([]);
  });
  it("reports a configuration failure without falsely denying the user's Admin role", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    const f = fixture();
    vi.stubEnv("B3_SA_EMAIL_HMAC_SECRET", undefined);
    await expect(f.page()).resolves.toMatchObject({
      type: "section",
      props: { role: "alert" },
    });
    expect(f.paths).toEqual([]);
    expect(report).toHaveBeenCalledWith("[b3_sa_entry]", {
      stage: "SERVER_CONFIGURATION",
      http_status: null,
      error_code: "EMAIL_HMAC_REJECTED",
    });
  });
  it("reports a real RPC refusal separately and never logs its response body", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    const f = fixture({ rpcStatus: 401 });
    await expect(f.page()).resolves.toMatchObject({
      type: "section",
      props: { role: "alert" },
    });
    expect(report).toHaveBeenCalledWith("[b3_sa_entry]", {
      stage: "TARGETS_READ",
      http_status: 401,
      error_code: "PROVIDER_REJECTED",
    });
    expect(JSON.stringify(report.mock.calls)).not.toContain(
      "synthetic upstream failure",
    );
  });
  it("keeps Session cookie persistence required by default in Server Actions", async () => {
    const f = fixture();
    const runtime = await createB3Sa2Runtime();
    await runtime.supabase.auth.mfa.challengeAndVerify({
      factorId: "20000000-0000-4000-8000-000000000001",
      code: "000000",
    });
    expect(f.setter).toHaveBeenCalled();
  });
  it("does not log unknown thrown error messages or their sensitive fields", () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    reportBindingEntryFailure(
      Object.assign(new Error("synthetic-sensitive-message"), {
        token: "synthetic-sensitive-field",
      }),
    );
    expect(report).toHaveBeenCalledExactlyOnceWith("[b3_sa_entry]", {
      stage: "ENTRY_READ",
      http_status: null,
      error_code: "UNCLASSIFIED_ERROR",
    });
  });
  it.each([
    [{ aal: "aal1" as const }, "AAL2_REQUIRED"],
    [{ aal: "aal2" as const, totpAge: 301 }, "STALE_TOTP"],
  ])(
    "never turns page-read access into permission to bind without fresh AAL2 (%s)",
    async (input, code) => {
      const f = fixture(input);
      const runtime = await createB3Sa2Runtime();
      await expect(
        runtime.orchestrator.start({
          operationId: OP,
          password: "synthetic-password",
          targetEmail: "synthetic@example.com",
        }),
      ).rejects.toMatchObject({ code });
      expect(
        f.paths.some(
          (p) =>
            p.includes("generate_link") ||
            p.endsWith("/bind_super_admin_email_binding_v1"),
        ),
      ).toBe(false);
    },
  );
});

describe("Gate OFF Preview configuration readiness is strictly read-only", () => {
  it("checks configuration and exact DB targets while Gate remains OFF without creating any Auth client or Session", async () => {
    const f = fixture({ noSession: true });
    vi.stubEnv("B3_SA_EMAIL_BINDING_ENABLED", "false");
    const result = await runB3SaPreviewReadiness();
    expect(result.passed).toBe(true);
    expect(process.env.B3_SA_EMAIL_BINDING_ENABLED).toBe("false");
    expect(f.paths).toEqual([
      "/rest/v1/rpc/get_super_admin_email_binding_targets_v1",
    ]);
    expect(f.setter).not.toHaveBeenCalled();
  });
  it.each([
    ["missing HMAC", "B3_SA_EMAIL_HMAC_SECRET", undefined],
    ["short HMAC", "B3_SA_EMAIL_HMAC_SECRET", "short"],
    ["missing Sender", "B3_SA_PREVIEW_SENDER_API_KEY", undefined],
    ["missing Node environment", "NODE_ENV", undefined],
  ])("identifies %s before making any request", async (_label, key, value) => {
    const f = fixture();
    vi.stubEnv(key, value);
    const r = await runB3SaPreviewReadiness();
    expect(r.passed).toBe(false);
    expect(r.rows.at(-1)?.stage).toBe("SERVER_CONFIGURATION");
    expect(f.paths).toEqual([]);
  });
  it.each([
    ["Production", "VERCEL_ENV", "production"],
    ["wrong Ref", "NEXT_PUBLIC_SUPABASE_URL", "https://wrong.supabase.co"],
    ["wrong branch", "VERCEL_GIT_COMMIT_REF", "main"],
    [
      "third UID",
      "B3_SA_ALLOWED_TARGET_UIDS",
      `${UID},10000000-0000-4000-8000-000000000003`,
    ],
  ])("rejects %s before any privileged request", async (_label, key, value) => {
    const f = fixture();
    vi.stubEnv(key, value);
    const r = await runB3SaPreviewReadiness();
    expect(r.passed).toBe(false);
    expect(r.rows.at(-1)?.stage).toBe("PREVIEW_BOUNDARY");
    expect(f.paths).toEqual([]);
  });
  it("fails closed when DB and configured UID sets differ", async () => {
    const f = fixture({ targetMismatch: true });
    const r = await runB3SaPreviewReadiness();
    expect(r.passed).toBe(false);
    expect(r.rows.at(-1)?.error_code).toBe("TARGET_SET_MISMATCH");
    expect(f.paths).toHaveLength(1);
  });
});

// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAdminLoginResolver,
  runAdminPreviewLoginPreflight,
} from "./admin-login-resolver";

vi.mock("server-only", () => ({}));

const UID = "10000000-0000-4000-8000-000000000001";
const OTHER_UID = "10000000-0000-4000-8000-000000000002";
const environment = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "sb_secret_" + "synthetic-test-only".repeat(2),
};

function fixture(
  input: {
    rpcBody?: unknown;
    rpcStatus?: number;
    userBody?: unknown;
    userStatus?: number;
  } = {},
) {
  const transport = vi.fn<typeof fetch>(async (url) =>
    String(url).includes("/rest/v1/rpc/")
      ? Response.json("rpcBody" in input ? input.rpcBody : UID, {
          status: input.rpcStatus ?? 200,
        })
      : Response.json(
          "userBody" in input
            ? input.userBody
            : { id: UID, email: "synthetic@preview.invalid" },
          { status: input.userStatus ?? 200 },
        ),
  );
  return {
    transport,
    subject: createAdminLoginResolver(environment, transport, vi.fn()),
  };
}

describe("Admin canonical-name/current-email resolver", () => {
  it.each([
    ["Phase2RemoteInviter", "synthetic@preview.invalid"],
    ["akumie", "legacy@accounts.fandom-harbor.invalid"],
    ["Phase2RemoteInviter", "bound@example.com"],
    ["akumie", "another@example.com"],
  ])(
    "resolves %s through the UID registry to its current Auth email (%s)",
    async (name, email) => {
      const target = fixture({ userBody: { id: UID, email } });
      await expect(target.subject.resolve(name)).resolves.toEqual({
        userId: UID,
        email,
      });
      expect(target.transport).toHaveBeenNthCalledWith(
        1,
        environment.NEXT_PUBLIC_SUPABASE_URL +
          "/rest/v1/rpc/resolve_login_name_user_id",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ p_registration_name: name }),
          cache: "no-store",
          redirect: "error",
        }),
      );
      expect(target.transport).toHaveBeenNthCalledWith(
        2,
        environment.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/admin/users/" + UID,
        expect.objectContaining({ cache: "no-store", redirect: "error" }),
      );
    },
  );

  it("normalizes registration names and keeps service credentials on server requests", async () => {
    const target = fixture();
    await target.subject.resolve("  Ｐhase2RemoteInviter  ");
    expect(
      JSON.parse(String(target.transport.mock.calls[0]?.[1]?.body)),
    ).toEqual({ p_registration_name: "Phase2RemoteInviter" });
    expect(target.transport.mock.calls[1]?.[1]?.headers).toMatchObject({
      apikey: environment.SUPABASE_SECRET_KEY,
    });
    for (const [, init] of target.transport.mock.calls) {
      const headers = new Headers(init?.headers);
      expect(headers.get("apikey")).toBe(environment.SUPABASE_SECRET_KEY);
      expect(headers.has("authorization")).toBe(false);
    }
  });

  it("re-reads Auth on each login rather than caching the old .invalid email", async () => {
    const target = fixture();
    await expect(
      target.subject.resolve("Phase2RemoteInviter"),
    ).resolves.toMatchObject({ email: "synthetic@preview.invalid" });
    target.transport
      .mockResolvedValueOnce(Response.json(UID))
      .mockResolvedValueOnce(
        Response.json({ id: UID, email: "bound@example.com" }),
      );
    await expect(
      target.subject.resolve("Phase2RemoteInviter"),
    ).resolves.toMatchObject({ email: "bound@example.com" });
    expect(target.transport).toHaveBeenCalledTimes(4);
  });

  it("uses a decoy read for unknown names and never returns an invented hashed email", async () => {
    const target = fixture({
      rpcBody: null,
      userBody: { error: "not_found" },
      userStatus: 404,
    });
    await expect(target.subject.resolve("unknown")).resolves.toBeNull();
    expect(String(target.transport.mock.calls[1]?.[0])).toBe(
      environment.NEXT_PUBLIC_SUPABASE_URL +
        "/auth/v1/admin/users/00000000-0000-0000-0000-000000000000",
    );
  });

  it.each(["", "\u0000", "a".repeat(65)])(
    "rejects invalid input without a network request (%s)",
    async (name) => {
      const target = fixture();
      await expect(target.subject.resolve(name)).resolves.toBeNull();
      expect(target.transport).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "wrong Auth UID",
      { userBody: { id: OTHER_UID, email: "synthetic@preview.invalid" } },
    ],
    ["malformed UID", { rpcBody: "invalid" }],
    ["RPC failure", { rpcBody: UID, rpcStatus: 503 }],
    ["Auth failure", { userStatus: 403 }],
    ["invalid email", { userBody: { id: UID, email: "not-an-email" } }],
    ["missing user", { userBody: null }],
  ])("fails closed for %s without a legacy fallback", async (_label, input) => {
    const target = fixture(input);
    await expect(target.subject.resolve("Phase2RemoteInviter")).rejects.toThrow(
      "Admin login could not be completed",
    );
  });

  it("rejects malformed JSON and transport failures", async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("not-json", { status: 200 }));
    const subject = createAdminLoginResolver(environment, transport);
    await expect(subject.resolve("akumie")).rejects.toThrow(
      "Admin login could not be completed",
    );
    transport.mockRejectedValueOnce(new Error("network unavailable"));
    await expect(subject.resolve("akumie")).rejects.toThrow();
  });

  it("requires a server-only credential without accepting a public-key substitute", () => {
    const transport = vi.fn<typeof fetch>();
    expect(() =>
      createAdminLoginResolver(
        {
          NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-key",
        },
        transport,
      ),
    ).toThrow("Admin login could not be completed");
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    "public-key",
    "sb_secret_short",
    " " + environment.SUPABASE_SECRET_KEY,
  ])("rejects malformed server credentials before transport", (key) => {
    const transport = vi.fn<typeof fetch>();
    expect(() =>
      createAdminLoginResolver(
        { ...environment, SUPABASE_SECRET_KEY: key },
        transport,
      ),
    ).toThrow();
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    [{ message: "Invalid API key" }, "INVALID_API_KEY"],
    [{ code: "PGRST301" }, "PGRST301"],
    [
      { code: "private-material", message: "private-material" },
      "UNCLASSIFIED_ERROR",
    ],
  ])(
    "attributes RPC rejection without exposing provider bodies",
    async (body, code) => {
      const target = fixture({ rpcBody: body, rpcStatus: 401 });
      await expect(
        target.subject.resolve("Phase2RemoteInviter"),
      ).rejects.toMatchObject({
        diagnostic: {
          stage: "NAME_UID_RPC",
          http_status: 401,
          error_code: code,
        },
      });
      expect(target.transport).toHaveBeenCalledTimes(1);
    },
  );

  it("attributes the second HTTP failure to Auth lookup rather than password authentication", async () => {
    const target = fixture({
      userStatus: 403,
      userBody: { code: "not_admin" },
    });
    await expect(target.subject.resolve("akumie")).rejects.toMatchObject({
      diagnostic: {
        stage: "AUTH_USER_LOOKUP",
        http_status: 403,
        error_code: "not_admin",
      },
    });
  });
});

describe("protected Preview read-only login preflight", () => {
  const preview = {
    ...environment,
    NEXT_PUBLIC_SUPABASE_URL: "https://bniqsjnjqesnpcfkpqcz.supabase.co",
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_TARGET_ENV: "preview",
    VERCEL_PROJECT_ID: "synthetic-preview-project",
    VERCEL_GIT_COMMIT_REF: "codex/v1-package-b0-auth-architecture",
    B3_SA_DEPLOYMENT_TARGET: "preview",
    B3_SA_EXPECTED_VERCEL_PROJECT_ID: "synthetic-preview-project",
    B3_SA_EXPECTED_GIT_BRANCH: "codex/v1-package-b0-auth-architecture",
    B3_SA_EXPECTED_SUPABASE_PROJECT_REF: "bniqsjnjqesnpcfkpqcz",
    B3_SA_ALLOWED_TARGET_UIDS:
      "cb1e6693-876d-4c4c-8153-3d0fbac6da17,5fa18bad-6a32-41c3-87e3-e761b00ef8f1",
    B3_SA_EMAIL_BINDING_ENABLED: "false",
  };
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  function setup(userId = "cb1e6693-876d-4c4c-8153-3d0fbac6da17") {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(userId))
      .mockResolvedValueOnce(
        Response.json({ id: userId, email: "synthetic@preview.invalid" }),
      );
    vi.stubGlobal("fetch", transport);
    return transport;
  }
  it("checks fixed UID continuity with read-only requests and no password/Session call", async () => {
    const transport = setup();
    const result = await runAdminPreviewLoginPreflight(preview);
    expect(result.passed).toBe(true);
    expect(result.rows.map((row) => row.stage)).toEqual([
      "NAME_UID_RPC",
      "AUTH_USER_LOOKUP",
      "RESOLVED_UID_CHECK",
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /synthetic@|sb_secret_|password|access_token/u,
    );
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls.map(([url]) => String(url))).toEqual([
      preview.NEXT_PUBLIC_SUPABASE_URL +
        "/rest/v1/rpc/resolve_login_name_user_id",
      preview.NEXT_PUBLIC_SUPABASE_URL +
        "/auth/v1/admin/users/cb1e6693-876d-4c4c-8153-3d0fbac6da17",
    ]);
  });
  it.each([
    { VERCEL_ENV: "production" },
    { VERCEL_GIT_COMMIT_REF: "main" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://wrong-project.supabase.co" },
    { B3_SA_ALLOWED_TARGET_UIDS: UID },
  ])("refuses wrong environment before any request (%j)", async (change) => {
    const transport = setup();
    expect(
      (await runAdminPreviewLoginPreflight({ ...preview, ...change })).passed,
    ).toBe(false);
    expect(transport).not.toHaveBeenCalled();
  });
  it("rejects an unexpected canonical UID", async () => {
    setup(OTHER_UID);
    expect(await runAdminPreviewLoginPreflight(preview)).toMatchObject({
      passed: false,
      rows: expect.arrayContaining([
        {
          stage: "RESOLVED_UID_CHECK",
          http_status: null,
          error_code: "UID_MISMATCH",
        },
      ]),
    });
  });
  it("exposes only the safe failing stage on actual gateway rejection", async () => {
    const transport = setup();
    transport
      .mockReset()
      .mockResolvedValueOnce(
        Response.json({ message: "Invalid API key" }, { status: 401 }),
      );
    expect(await runAdminPreviewLoginPreflight(preview)).toEqual({
      passed: false,
      rows: [
        {
          stage: "NAME_UID_RPC",
          http_status: 401,
          error_code: "INVALID_API_KEY",
        },
      ],
    });
    expect(transport).toHaveBeenCalledTimes(1);
  });
});

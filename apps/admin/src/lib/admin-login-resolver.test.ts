// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { createAdminLoginResolver } from "./admin-login-resolver";

vi.mock("server-only", () => ({}));

const UID = "10000000-0000-4000-8000-000000000001";
const OTHER_UID = "10000000-0000-4000-8000-000000000002";
const environment = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "synthetic-server-key",
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
    subject: createAdminLoginResolver(environment, transport),
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
});

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createStagedAuthCookies } from "./staged-auth-cookies";

describe("staged Auth cookies", () => {
  it("keeps issued cookies private until the identity is accepted", async () => {
    const setAll = vi.fn();
    const staged = createStagedAuthCookies({ getAll: () => [], setAll });
    await staged.cookieAdapter.setAll([
      { name: "auth", value: "test-session" },
    ]);
    expect(setAll).not.toHaveBeenCalled();
    expect(await staged.cookieAdapter.getAll()).toEqual([
      { name: "auth", value: "test-session" },
    ]);
    await staged.commit();
    expect(setAll).toHaveBeenCalledExactlyOnceWith([
      { name: "auth", value: "test-session" },
    ]);
    await staged.cookieAdapter.setAll([{ name: "auth", value: "rotated" }]);
    expect(setAll).toHaveBeenLastCalledWith([
      { name: "auth", value: "rotated" },
    ]);
  });

  it("does not publish mutations when a rejected flow is discarded", async () => {
    const setAll = vi.fn();
    const staged = createStagedAuthCookies({
      getAll: () => [{ name: "auth", value: "original-session" }],
      setAll,
    });
    await staged.cookieAdapter.setAll([
      { name: "auth", value: "wrong-session" },
    ]);
    expect(setAll).not.toHaveBeenCalled();
  });

  it("overlays rotated chunks and carries deletion options into commit", async () => {
    const setAll = vi.fn();
    const staged = createStagedAuthCookies({
      getAll: () => [
        { name: "auth.0", value: "old" },
        { name: "auth.1", value: "old-tail" },
        { name: "unrelated", value: "preserved" },
      ],
      setAll,
    });
    const mutations = [
      { name: "auth.0", value: "new" },
      { name: "auth.1", value: "", options: { maxAge: 0, path: "/" } },
    ];
    await staged.cookieAdapter.setAll(mutations);
    expect(await staged.cookieAdapter.getAll()).toEqual([
      { name: "auth.0", value: "new" },
      { name: "unrelated", value: "preserved" },
    ]);
    await staged.commit();
    expect(setAll).toHaveBeenCalledWith(mutations);
  });

  it("surfaces a failed cookie commit instead of claiming success", async () => {
    const staged = createStagedAuthCookies({
      getAll: () => [],
      setAll: () => {
        throw new Error("cookie write unavailable");
      },
    });
    await staged.cookieAdapter.setAll([{ name: "auth", value: "new" }]);
    await expect(staged.commit()).rejects.toThrow("cookie write unavailable");
  });
});

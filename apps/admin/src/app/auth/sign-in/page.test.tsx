import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSignInPage from "./page";
import { runAdminPreviewLoginPreflight } from "../../../lib/admin-login-resolver";
import { previewSessionEnvironmentAllowed } from "../../../lib/preview-session-acceptance";

vi.mock("../actions", () => ({ signIn: vi.fn() }));
vi.mock("../../../lib/admin-login-resolver", () => ({
  runAdminPreviewLoginPreflight: vi.fn(),
}));
vi.mock("../../../lib/preview-session-acceptance", () => ({
  previewSessionEnvironmentAllowed: vi.fn(),
}));

describe("Preview sign-in preflight rendering", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(previewSessionEnvironmentAllowed).mockReturnValue(true);
  });
  it("hides password input when server resolution fails", async () => {
    vi.mocked(runAdminPreviewLoginPreflight).mockResolvedValue({
      passed: false,
      rows: [
        {
          stage: "NAME_UID_RPC",
          http_status: 401,
          error_code: "INVALID_API_KEY",
        },
      ],
    });
    const html = renderToStaticMarkup(
      await AdminSignInPage({
        searchParams: Promise.resolve({ check: "preview" }),
      }),
    );
    expect(html).toContain("NAME_UID_RPC");
    expect(html).toContain("401");
    expect(html).not.toContain('type="password"');
    expect(html).not.toContain("<form");
  });
  it("allows the existing form only after a successful preflight", async () => {
    vi.mocked(runAdminPreviewLoginPreflight).mockResolvedValue({
      passed: true,
      rows: [],
    });
    const html = renderToStaticMarkup(
      await AdminSignInPage({
        searchParams: Promise.resolve({ check: "preview" }),
      }),
    );
    expect(html).toContain('type="password"');
    expect(html).toContain("只读自检通过");
  });
  it.each([false, true])(
    "never invokes privileged Preview checks for an ordinary sign-in visit (%s)",
    async (allowed) => {
      vi.mocked(previewSessionEnvironmentAllowed).mockReturnValue(allowed);
      await AdminSignInPage({ searchParams: Promise.resolve({}) });
      expect(runAdminPreviewLoginPreflight).not.toHaveBeenCalled();
    },
  );
  it("never invokes the privileged check outside the exact Preview boundary", async () => {
    vi.mocked(previewSessionEnvironmentAllowed).mockReturnValue(false);
    await AdminSignInPage({
      searchParams: Promise.resolve({ check: "preview" }),
    });
    expect(runAdminPreviewLoginPreflight).not.toHaveBeenCalled();
  });
});

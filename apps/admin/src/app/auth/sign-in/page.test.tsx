import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSignInPage from "./page";
import { runAdminPreviewLoginPreflight } from "../../../lib/admin-login-resolver";
import { previewSessionEnvironmentAllowed } from "../../../lib/preview-session-acceptance";
import { runB3SaPreviewReadiness } from "../../../lib/super-admin-email-binding-runtime";

vi.mock("../actions", () => ({ signIn: vi.fn() }));
vi.mock("../../../lib/admin-login-resolver", () => ({
  runAdminPreviewLoginPreflight: vi.fn(),
}));
vi.mock("../../../lib/preview-session-acceptance", () => ({
  previewSessionEnvironmentAllowed: vi.fn(),
}));
vi.mock("../../../lib/super-admin-email-binding-runtime", () => ({
  runB3SaPreviewReadiness: vi.fn(),
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
  it("renders binding readiness independently of password login and never implies a binding completed", async () => {
    vi.mocked(runB3SaPreviewReadiness).mockResolvedValue({
      passed: true,
      rows: [{ stage: "TARGET_SET", http_status: null, error_code: "OK" }],
    });
    const html = renderToStaticMarkup(
      await AdminSignInPage({
        searchParams: Promise.resolve({ check: "binding" }),
      }),
    );
    expect(html).toContain("绑定配置只读自检通过");
    expect(html).toContain("尚未执行邮箱绑定");
    expect(runAdminPreviewLoginPreflight).not.toHaveBeenCalled();
  });
  it("never runs binding readiness on ordinary visits or outside the exact Preview boundary", async () => {
    await AdminSignInPage({ searchParams: Promise.resolve({}) });
    vi.mocked(previewSessionEnvironmentAllowed).mockReturnValue(false);
    await AdminSignInPage({
      searchParams: Promise.resolve({ check: "binding" }),
    });
    expect(runB3SaPreviewReadiness).not.toHaveBeenCalled();
  });
});

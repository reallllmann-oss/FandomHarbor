import { describe, expect, it, vi } from "vitest";
import {
  AdminLoginStageError,
  reportAdminLoginDiagnostic,
  safeAdminLoginCode,
} from "./admin-login-diagnostics";

describe("safe login diagnostics", () => {
  it.each([
    "private@example.com",
    "private-token",
    null,
    {},
    "PGRST301 with private payload",
  ])("redacts arbitrary provider codes", (value) => {
    expect(safeAdminLoginCode(value)).toBe("UNCLASSIFIED_ERROR");
  });
  it("emits only a static phase, HTTP status and whitelisted code", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      reportAdminLoginDiagnostic({
        stage: "NAME_UID_RPC",
        http_status: 401,
        error_code: "PGRST301",
      });
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        stage: "NAME_UID_RPC",
        http_status: 401,
        error_code: "PGRST301",
      });
    } finally {
      spy.mockRestore();
    }
  });
  it("does not forward unknown messages or invalid HTTP statuses", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      reportAdminLoginDiagnostic({
        stage: "PASSWORD_AUTHENTICATION",
        http_status: 999,
        error_code: "private@example.com",
      });
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        stage: "PASSWORD_AUTHENTICATION",
        http_status: null,
        error_code: "UNCLASSIFIED_ERROR",
      });
      const error = new AdminLoginStageError(
        "AUTH_USER_LOOKUP",
        403,
        "private-token",
      );
      expect(error.message).toBe("Admin login could not be completed");
      expect(JSON.stringify(error)).not.toContain("private-token");
    } finally {
      spy.mockRestore();
    }
  });
});

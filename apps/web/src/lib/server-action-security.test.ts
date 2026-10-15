import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  assertTrustedActionRequest,
  requestClientKey,
} from "./server-action-security";

describe("server action request boundary", () => {
  it("accepts a same-origin browser form request", () => {
    expect(() =>
      assertTrustedActionRequest(
        new Headers({
          host: "harbor.example",
          origin: "https://harbor.example",
          "sec-fetch-site": "same-origin",
        }),
      ),
    ).not.toThrow();
  });

  it.each([
    new Headers({ host: "harbor.example" }),
    new Headers({ host: "harbor.example", origin: "https://evil.example" }),
    new Headers({
      host: "harbor.example",
      origin: "https://harbor.example",
      "sec-fetch-site": "cross-site",
    }),
  ])("rejects missing or cross-site origins", (requestHeaders) => {
    expect(() => assertTrustedActionRequest(requestHeaders)).toThrow(
      "untrusted request origin",
    );
  });

  it("bounds the request fingerprint inputs", () => {
    const key = requestClientKey(
      new Headers({
        "user-agent": "x".repeat(500),
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      }),
    );
    expect(key).toMatch(/^203\.0\.113\.10\0x{256}$/);
  });
});

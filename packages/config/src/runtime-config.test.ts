import { describe, expect, it } from "vitest";

import {
  parsePublicRuntimeConfig,
  parseServerRuntimeConfig,
} from "./runtime-config";

const publicEnvironment = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
};

describe("runtime config", () => {
  it("parses the browser-safe Supabase configuration", () => {
    expect(parsePublicRuntimeConfig(publicEnvironment)).toEqual(
      publicEnvironment,
    );
  });

  it("accepts an optional public site URL for canonical metadata", () => {
    expect(
      parsePublicRuntimeConfig({
        ...publicEnvironment,
        NEXT_PUBLIC_SITE_URL: "https://fandom.example",
      }),
    ).toMatchObject({ NEXT_PUBLIC_SITE_URL: "https://fandom.example" });
  });

  it("parses server configuration without accepting undeclared secrets", () => {
    expect(
      parseServerRuntimeConfig({
        ...publicEnvironment,
        NODE_ENV: "test",
        SUPABASE_SERVICE_ROLE_KEY: "must-not-cross-the-boundary",
      }),
    ).toEqual({
      ...publicEnvironment,
      NODE_ENV: "test",
    });
  });

  it("rejects missing or invalid values", () => {
    expect(() => parsePublicRuntimeConfig({})).toThrow();
    expect(() =>
      parseServerRuntimeConfig({ ...publicEnvironment, NODE_ENV: "invalid" }),
    ).toThrow();
  });
});

import { describe, expect, it } from "vitest";

import {
  isValidRegistrationName,
  normalizeRegistrationName,
  registrationNameEmail,
} from "./registration-policy";

describe("registration name policy", () => {
  it("normalizes surrounding whitespace without requiring an email", () => {
    expect(normalizeRegistrationName("  港湾读者  ")).toBe("港湾读者");
    expect(isValidRegistrationName("港湾读者")).toBe(true);
    expect(isValidRegistrationName("   ")).toBe(false);
  });

  it("rejects control characters and names longer than 64 characters", () => {
    expect(isValidRegistrationName("reader\nname")).toBe(false);
    expect(isValidRegistrationName("a".repeat(65))).toBe(false);
  });

  it("maps registration names to a case-insensitive internal Auth identifier", async () => {
    await expect(registrationNameEmail("HarborReader")).resolves.toBe(
      await registrationNameEmail("harborreader"),
    );
    await expect(registrationNameEmail("HarborReader")).resolves.toMatch(
      /^[0-9a-f]{64}@accounts\.fandom-harbor\.invalid$/,
    );
  });
});

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  generateInvitationCode,
  INVITATION_CODE_LENGTH,
  INVITATION_CODE_PATTERN,
  isStandardInvitationCode,
} from "./invitation-code";

describe("invitation code generation", () => {
  it("generates 11-character alphanumeric codes from Web Crypto", () => {
    const fillRandomValues = vi.fn((values: Uint32Array) => {
      values.forEach((_, index) => {
        values[index] = index * 17;
      });
      return values;
    });

    const code = generateInvitationCode(fillRandomValues);

    expect(code).toHaveLength(INVITATION_CODE_LENGTH);
    expect(code).toMatch(INVITATION_CODE_PATTERN);
    expect(isStandardInvitationCode(code)).toBe(true);
    expect(fillRandomValues).toHaveBeenCalledOnce();
  });

  it("keeps repeated generation inside the format contract", () => {
    for (let index = 0; index < 100; index += 1) {
      expect(generateInvitationCode()).toMatch(INVITATION_CODE_PATTERN);
    }
  });

  it("uses a secure random source without predictable fallbacks", async () => {
    const packageRoot = process.cwd().endsWith("packages/services")
      ? process.cwd()
      : resolve(process.cwd(), "packages/services");
    const source = await readFile(
      resolve(packageRoot, "src/invitation-code.ts"),
      "utf8",
    );

    expect(source).toContain("crypto.getRandomValues");
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("Date.now");
    expect(source).not.toContain("randomUUID");
  });

  it("shares the format contract with the local QA fixture", async () => {
    const fixtureSource = await readFile(
      resolve(
        process.cwd().endsWith("packages/services")
          ? resolve(process.cwd(), "../..")
          : process.cwd(),
        "scripts/local-qa-fixture.mjs",
      ),
      "utf8",
    );

    expect(fixtureSource).toContain("invitation-code-contract.json");
    expect(fixtureSource).toContain("randomBytes");
    expect(fixtureSource).not.toContain("Math.random");
    expect(fixtureSource).not.toContain(
      'invitationCode: randomBytes(32).toString("hex")',
    );
  });
});

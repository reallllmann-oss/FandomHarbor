import { describe, expect, it } from "vitest";

import {
  TrustedAuthEvidenceError,
  trustedAuthEvidenceFromVerifiedClaims,
} from "./trusted-auth-evidence";

const actorUserId = "10000000-0000-4000-8000-000000000001";
const sessionId = "20000000-0000-4000-8000-000000000002";

function claims(overrides: Record<string, unknown> = {}) {
  return {
    aal: "aal2",
    amr: [
      { method: "password", timestamp: 1_900_000_000 },
      { method: "totp", timestamp: 1_900_000_100 },
    ],
    session_id: sessionId,
    sub: actorUserId,
    ...overrides,
  };
}

describe("trusted Auth evidence", () => {
  it("normalizes only the security claims needed by the server runtime", () => {
    expect(trustedAuthEvidenceFromVerifiedClaims(claims())).toEqual({
      actorUserId,
      assuranceLevel: "aal2",
      authenticationMethods: [
        {
          authenticatedAtEpochSeconds: 1_900_000_000,
          method: "password",
        },
        {
          authenticatedAtEpochSeconds: 1_900_000_100,
          method: "totp",
        },
      ],
      sessionId,
    });
  });

  it.each([
    ["missing subject", { sub: undefined }],
    ["malformed subject", { sub: "not-a-uuid" }],
    ["missing assurance level", { aal: undefined }],
    ["malformed assurance level", { aal: "aal3" }],
    ["missing session", { session_id: undefined }],
    ["malformed session", { session_id: "not-a-uuid" }],
    ["string-only AMR", { amr: ["password", "totp"] }],
    ["malformed AMR timestamp", { amr: [{ method: "totp", timestamp: 1.5 }] }],
    ["malformed AMR method", { amr: [{ method: "", timestamp: 1 }] }],
  ])("rejects %s", (_label, override) => {
    expect(() =>
      trustedAuthEvidenceFromVerifiedClaims(claims(override)),
    ).toThrow(TrustedAuthEvidenceError);
    try {
      trustedAuthEvidenceFromVerifiedClaims(claims(override));
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_AUTH_EVIDENCE" });
    }
  });

  it("allows missing AMR to remain a distinguishable no-method state", () => {
    expect(
      trustedAuthEvidenceFromVerifiedClaims(claims({ amr: undefined }))
        .authenticationMethods,
    ).toEqual([]);
  });
});

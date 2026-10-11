const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export type TrustedAuthenticatorAssuranceLevel = "aal1" | "aal2";

export interface TrustedAuthenticationMethodReference {
  authenticatedAtEpochSeconds: number;
  method: string;
}

export interface TrustedAuthEvidence {
  actorUserId: string;
  assuranceLevel: TrustedAuthenticatorAssuranceLevel;
  authenticationMethods: readonly TrustedAuthenticationMethodReference[];
  sessionId: string;
}

export type TrustedAuthEvidenceErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_AUTH_EVIDENCE"
  | "TRUSTED_AUTH_UNAVAILABLE";

const TRUSTED_AUTH_MESSAGES: Readonly<
  Record<TrustedAuthEvidenceErrorCode, string>
> = {
  AUTHENTICATION_REQUIRED: "Authentication is required",
  INVALID_AUTH_EVIDENCE: "Trusted authentication evidence is invalid",
  TRUSTED_AUTH_UNAVAILABLE: "Trusted authentication evidence is unavailable",
};

export class TrustedAuthEvidenceError extends Error {
  constructor(public readonly code: TrustedAuthEvidenceErrorCode) {
    super(TRUSTED_AUTH_MESSAGES[code]);
    this.name = "TrustedAuthEvidenceError";
  }
}

function invalidEvidence(): TrustedAuthEvidenceError {
  return new TrustedAuthEvidenceError("INVALID_AUTH_EVIDENCE");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw invalidEvidence();
  }
  const normalized = value.toLowerCase();
  if (normalized === NIL_UUID) throw invalidEvidence();
  return normalized;
}

function parseAssuranceLevel(
  value: unknown,
): TrustedAuthenticatorAssuranceLevel {
  if (value !== "aal1" && value !== "aal2") throw invalidEvidence();
  return value;
}

function parseAuthenticationMethods(
  value: unknown,
): readonly TrustedAuthenticationMethodReference[] {
  if (value === undefined) return Object.freeze([]);
  if (!Array.isArray(value)) throw invalidEvidence();

  return Object.freeze(
    value.map((entry) => {
      if (!isRecord(entry)) throw invalidEvidence();
      const timestamp = entry.timestamp;
      if (
        typeof entry.method !== "string" ||
        entry.method.length === 0 ||
        typeof timestamp !== "number" ||
        !Number.isSafeInteger(timestamp) ||
        timestamp < 0
      ) {
        throw invalidEvidence();
      }

      return Object.freeze({
        authenticatedAtEpochSeconds: timestamp,
        method: entry.method,
      });
    }),
  );
}

/**
 * Normalizes claims only after Supabase Auth has verified the JWT. Callers must
 * never pass decoded, browser-supplied or otherwise unverified claims here.
 */
export function trustedAuthEvidenceFromVerifiedClaims(
  value: unknown,
): TrustedAuthEvidence {
  if (!isRecord(value)) throw invalidEvidence();

  return Object.freeze({
    actorUserId: parseUuid(value.sub),
    assuranceLevel: parseAssuranceLevel(value.aal),
    authenticationMethods: parseAuthenticationMethods(value.amr),
    sessionId: parseUuid(value.session_id),
  });
}

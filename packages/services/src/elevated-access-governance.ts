import {
  TrustedAuthEvidenceError,
  type TrustedAuthEvidence,
} from "@fandom-harbor/auth";

import {
  IdentityAccessExpectedStateToken,
  IdentityAccessNormalizedReason,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  type IdentityAccessMutationResult,
} from "./identity-access-governance-domain";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const PAYLOAD_FINGERPRINT_PATTERN = /^[0-9a-f]{64}$/u;
const AUTHORIZATION_REFERENCE_MAX_LENGTH = 200;

export const GRANT_SUPER_ADMIN_OPERATION = "grant_super_admin" as const;
export const MAX_TOTP_AGE_SECONDS = 5 * 60;

export type ElevatedAccessOperation = typeof GRANT_SUPER_ADMIN_OPERATION;

export type ElevatedAccessSecurityErrorCode =
  | "AAL2_REQUIRED"
  | "AUTHENTICATION_REQUIRED"
  | "EXPECTED_STATE_CONFLICT"
  | "FRESH_TOTP_REQUIRED"
  | "INTENT_CONSUMED"
  | "INTENT_EXPIRED"
  | "INTENT_MISMATCH"
  | "INTERNAL_FAILURE"
  | "INVALID_AUTH_EVIDENCE"
  | "INVALID_OPERATION"
  | "INVALID_REQUEST"
  | "INVALID_SESSION"
  | "INVALID_TARGET"
  | "REQUEST_ID_CONFLICT"
  | "STALE_TOTP"
  | "UNAUTHORIZED_ACTOR";

const SAFE_ERROR_MESSAGES: Readonly<
  Record<ElevatedAccessSecurityErrorCode, string>
> = {
  AAL2_REQUIRED: "AAL2 authentication is required",
  AUTHENTICATION_REQUIRED: "Authentication is required",
  EXPECTED_STATE_CONFLICT: "The target state has changed",
  FRESH_TOTP_REQUIRED: "Fresh TOTP authentication is required",
  INTENT_CONSUMED: "The elevated intent has already been consumed",
  INTENT_EXPIRED: "The elevated intent has expired",
  INTENT_MISMATCH: "The elevated intent does not match this request",
  INTERNAL_FAILURE: "The elevated access operation is unavailable",
  INVALID_AUTH_EVIDENCE: "Trusted authentication evidence is invalid",
  INVALID_OPERATION: "The elevated operation is not authorized",
  INVALID_REQUEST: "The elevated access request is invalid",
  INVALID_SESSION: "The elevated intent is not valid for this session",
  INVALID_TARGET: "The elevated target is not authorized",
  REQUEST_ID_CONFLICT: "The request identifier has a different payload",
  STALE_TOTP: "TOTP authentication is no longer fresh",
  UNAUTHORIZED_ACTOR: "The actor is not authorized for this operation",
};

export class ElevatedAccessSecurityError extends Error {
  constructor(public readonly code: ElevatedAccessSecurityErrorCode) {
    super(SAFE_ERROR_MESSAGES[code]);
    this.name = "ElevatedAccessSecurityError";
  }
}

export interface ElevatedAccessClientError {
  code: ElevatedAccessSecurityErrorCode;
  message: string;
}

export function elevatedAccessClientError(
  error: unknown,
): ElevatedAccessClientError {
  const code =
    error instanceof ElevatedAccessSecurityError
      ? error.code
      : "INTERNAL_FAILURE";
  return Object.freeze({ code, message: SAFE_ERROR_MESSAGES[code] });
}

export interface FreshTotpEvidence {
  authenticatedAtEpochSeconds: number;
  ageSeconds: number;
}

export interface ElevatedCommissioningPolicy {
  actorAuthorizationReference: string;
  authorizedActorUserId: string;
  exactTargetUserId: string;
}

export interface ValidatedElevatedCommissioningPolicy {
  actorAuthorizationReference: string;
  authorizedActorUserId: IdentityAccessUserId;
  exactTargetUserId: IdentityAccessUserId;
}

export interface ElevatedCommissioningPolicyPort {
  getGrantSuperAdminPolicy(): Promise<ElevatedCommissioningPolicy>;
}

export interface ElevatedTrustedAuthEvidenceSource {
  getTrustedAuthEvidence(): Promise<TrustedAuthEvidence | null>;
}

export interface GrantSuperAdminPayload {
  actorUserId: IdentityAccessUserId;
  expectedStateToken: IdentityAccessExpectedStateToken;
  normalizedReason: IdentityAccessNormalizedReason;
  operation: ElevatedAccessOperation;
  targetUserId: IdentityAccessUserId;
}

export interface GrantSuperAdminIntentRequest extends GrantSuperAdminPayload {
  requestId: IdentityAccessRequestId;
}

export interface ElevatedIntent {
  actorAuthorizationReference: string;
  actorSessionId: string;
  actorUserId: IdentityAccessUserId;
  challengeNotBeforeEpochSeconds: number;
  consumedAtEpochSeconds: number | null;
  desiredRole: "super_admin";
  expectedStateToken: IdentityAccessExpectedStateToken;
  expiresAtEpochSeconds: number;
  intentId: string;
  issuedAtEpochSeconds: number;
  normalizedReason: IdentityAccessNormalizedReason;
  operation: ElevatedAccessOperation;
  payloadFingerprint: string;
  priorTotpAuthenticatedAtEpochSeconds: number;
  requestId: IdentityAccessRequestId;
  targetUserId: IdentityAccessUserId;
}

export interface IssueElevatedIntentCommand extends GrantSuperAdminIntentRequest {
  actorAuthorizationReference: string;
  actorSessionId: string;
  payloadFingerprint: string;
  priorTotpAuthenticatedAtEpochSeconds: number;
}

export type IssueElevatedIntentResult =
  | { intent: ElevatedIntent; status: "issued" | "replayed" }
  | { status: "request_id_conflict" };

export interface ConsumeElevatedIntentCommand extends GrantSuperAdminIntentRequest {
  actorAuthorizationReference: string;
  actorSessionId: string;
  confirmedTotpAuthenticatedAtEpochSeconds: number;
  intentId: string;
  payloadFingerprint: string;
}

export type ConsumeElevatedIntentResult =
  | { result: IdentityAccessMutationResult; status: "result" }
  | {
      status:
        | "expected_state_conflict"
        | "intent_consumed"
        | "intent_expired"
        | "intent_mismatch"
        | "request_id_conflict";
    };

/**
 * A future private database adapter must repeat every check and perform claim,
 * consumption, grant, Audit and shared-ledger result in one transaction. This
 * interface deliberately does not claim that the runtime provides atomicity.
 */
export interface ElevatedIntentPort {
  consumeGrantSuperAdminIntent(
    command: ConsumeElevatedIntentCommand,
  ): Promise<ConsumeElevatedIntentResult>;
  getIntent(intentId: string): Promise<ElevatedIntent | null>;
  issueGrantSuperAdminIntent(
    command: IssueElevatedIntentCommand,
  ): Promise<IssueElevatedIntentResult>;
}

export interface ElevatedAccessClock {
  now(): Date;
}

export interface ElevatedAccessGovernanceServiceDependencies {
  auth: ElevatedTrustedAuthEvidenceSource;
  clock: ElevatedAccessClock;
  intents: ElevatedIntentPort;
  policy: ElevatedCommissioningPolicyPort;
}

export interface ElevatedAccessGovernanceService {
  confirmGrantSuperAdminIntent(
    input: unknown,
  ): Promise<IdentityAccessMutationResult>;
  issueGrantSuperAdminIntent(input: unknown): Promise<ElevatedIntent>;
}

interface ParsedGrantSuperAdminRequest {
  expectedStateToken: IdentityAccessExpectedStateToken;
  normalizedReason: IdentityAccessNormalizedReason;
  operation: ElevatedAccessOperation;
  requestId: IdentityAccessRequestId;
  targetUserId: IdentityAccessUserId;
}

interface ParsedGrantSuperAdminConfirmation extends ParsedGrantSuperAdminRequest {
  intentId: string;
}

function securityError(
  code: ElevatedAccessSecurityErrorCode,
): ElevatedAccessSecurityError {
  return new ElevatedAccessSecurityError(code);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
): void {
  const keys = Reflect.ownKeys(value);
  if (
    keys.some((key) => typeof key !== "string" || !required.includes(key)) ||
    required.some((key) => !Object.hasOwn(value, key))
  ) {
    const clientAuthFields = new Set([
      "aal",
      "actorUserId",
      "amr",
      "mfaTimestamp",
      "sessionId",
    ]);
    if (
      keys.some((key) => typeof key === "string" && clientAuthFields.has(key))
    ) {
      throw securityError("INVALID_AUTH_EVIDENCE");
    }
    throw securityError("INVALID_REQUEST");
  }
}

function parseOperation(value: unknown): ElevatedAccessOperation {
  if (value !== GRANT_SUPER_ADMIN_OPERATION) {
    throw securityError("INVALID_OPERATION");
  }
  return value;
}

function parseDomainValue<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    throw securityError("INVALID_REQUEST");
  }
}

function parseTarget(value: unknown): IdentityAccessUserId {
  try {
    return IdentityAccessUserId.parse(value);
  } catch {
    throw securityError("INVALID_TARGET");
  }
}

function parseUuid(value: unknown, errorCode: ElevatedAccessSecurityErrorCode) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw securityError(errorCode);
  }
  const normalized = value.toLowerCase();
  if (normalized === NIL_UUID) throw securityError(errorCode);
  return normalized;
}

function parseIntentId(value: unknown): string {
  return parseUuid(value, "INTENT_MISMATCH");
}

function parseGrantSuperAdminRequest(
  value: unknown,
): ParsedGrantSuperAdminRequest {
  if (!isRecord(value)) throw securityError("INVALID_REQUEST");
  exactKeys(value, [
    "expectedStateToken",
    "operation",
    "reason",
    "requestId",
    "targetUserId",
  ]);

  return {
    expectedStateToken: parseDomainValue(() =>
      IdentityAccessExpectedStateToken.parse(value.expectedStateToken),
    ),
    normalizedReason: parseDomainValue(() =>
      IdentityAccessNormalizedReason.parse(value.reason),
    ),
    operation: parseOperation(value.operation),
    requestId: parseDomainValue(() =>
      IdentityAccessRequestId.parse(value.requestId),
    ),
    targetUserId: parseTarget(value.targetUserId),
  };
}

function parseGrantSuperAdminConfirmation(
  value: unknown,
): ParsedGrantSuperAdminConfirmation {
  if (!isRecord(value)) throw securityError("INVALID_REQUEST");
  exactKeys(value, [
    "expectedStateToken",
    "intentId",
    "operation",
    "reason",
    "requestId",
    "targetUserId",
  ]);
  const { intentId, ...request } = value;
  return {
    ...parseGrantSuperAdminRequest(request),
    intentId: parseIntentId(intentId),
  };
}

function nowEpochSeconds(clock: ElevatedAccessClock): number {
  const now = clock.now();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw securityError("INTERNAL_FAILURE");
  }
  return Math.floor(now.getTime() / 1_000);
}

export function requireFreshTotpEvidence(
  evidence: TrustedAuthEvidence | null,
  currentEpochSeconds: number,
): FreshTotpEvidence {
  if (evidence === null) throw securityError("AUTHENTICATION_REQUIRED");
  if (evidence.assuranceLevel !== "aal2") {
    throw securityError("AAL2_REQUIRED");
  }
  if (!Number.isSafeInteger(currentEpochSeconds) || currentEpochSeconds < 0) {
    throw securityError("INTERNAL_FAILURE");
  }

  const totpTimestamps = evidence.authenticationMethods
    .filter((entry) => entry.method === "totp")
    .map((entry) => entry.authenticatedAtEpochSeconds);
  if (totpTimestamps.length === 0) {
    throw securityError("FRESH_TOTP_REQUIRED");
  }
  if (
    totpTimestamps.some(
      (timestamp) => !Number.isSafeInteger(timestamp) || timestamp < 0,
    )
  ) {
    throw securityError("INVALID_AUTH_EVIDENCE");
  }

  const authenticatedAtEpochSeconds = Math.max(...totpTimestamps);
  const ageSeconds = currentEpochSeconds - authenticatedAtEpochSeconds;
  if (ageSeconds < 0) throw securityError("INVALID_AUTH_EVIDENCE");
  if (ageSeconds > MAX_TOTP_AGE_SECONDS) throw securityError("STALE_TOTP");

  return Object.freeze({ authenticatedAtEpochSeconds, ageSeconds });
}

function parsePolicy(
  value: ElevatedCommissioningPolicy,
): ValidatedElevatedCommissioningPolicy {
  if (
    typeof value.actorAuthorizationReference !== "string" ||
    value.actorAuthorizationReference.length < 1 ||
    value.actorAuthorizationReference.length >
      AUTHORIZATION_REFERENCE_MAX_LENGTH
  ) {
    throw securityError("INTERNAL_FAILURE");
  }

  let authorizedActorUserId: IdentityAccessUserId;
  let exactTargetUserId: IdentityAccessUserId;
  try {
    authorizedActorUserId = IdentityAccessUserId.parse(
      value.authorizedActorUserId,
    );
    exactTargetUserId = IdentityAccessUserId.parse(value.exactTargetUserId);
  } catch {
    throw securityError("INTERNAL_FAILURE");
  }
  if (authorizedActorUserId.value === exactTargetUserId.value) {
    throw securityError("INTERNAL_FAILURE");
  }

  return Object.freeze({
    actorAuthorizationReference: value.actorAuthorizationReference,
    authorizedActorUserId,
    exactTargetUserId,
  });
}

async function trustedEvidence(
  source: ElevatedTrustedAuthEvidenceSource,
): Promise<TrustedAuthEvidence | null> {
  try {
    return await source.getTrustedAuthEvidence();
  } catch (error) {
    if (error instanceof TrustedAuthEvidenceError) {
      if (error.code === "AUTHENTICATION_REQUIRED") {
        throw securityError("AUTHENTICATION_REQUIRED");
      }
      throw securityError("INVALID_AUTH_EVIDENCE");
    }
    throw securityError("INTERNAL_FAILURE");
  }
}

async function currentPolicy(
  port: ElevatedCommissioningPolicyPort,
): Promise<ValidatedElevatedCommissioningPolicy> {
  try {
    return parsePolicy(await port.getGrantSuperAdminPolicy());
  } catch (error) {
    if (error instanceof ElevatedAccessSecurityError) throw error;
    throw securityError("INTERNAL_FAILURE");
  }
}

function authorizeExactActorAndTarget(
  evidence: TrustedAuthEvidence,
  policy: ValidatedElevatedCommissioningPolicy,
  targetUserId: IdentityAccessUserId,
): void {
  if (evidence.actorUserId !== policy.authorizedActorUserId.value) {
    throw securityError("UNAUTHORIZED_ACTOR");
  }
  if (targetUserId.value !== policy.exactTargetUserId.value) {
    throw securityError("INVALID_TARGET");
  }
}

function utf8(value: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(value);
  const result = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(result).set(encoded);
  return result;
}

function fingerprintPart(value: string): string {
  return `${new TextEncoder().encode(value).byteLength}:${value}`;
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fingerprints a versioned fixed-order tuple rather than raw input JSON. The
 * actor, exact operation/target/role, expected state and normalized reason are
 * all server-controlled canonical values.
 */
export async function grantSuperAdminPayloadFingerprint(
  payload: GrantSuperAdminPayload,
): Promise<string> {
  const canonicalTuple = [
    "fandom-harbor:elevated-access:v1",
    payload.actorUserId.value,
    payload.operation,
    payload.targetUserId.value,
    "super_admin",
    payload.expectedStateToken.value,
    payload.normalizedReason.value,
  ] as const;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    utf8(canonicalTuple.map(fingerprintPart).join("")),
  );
  return hex(digest);
}

function assertFingerprint(value: string): void {
  if (!PAYLOAD_FINGERPRINT_PATTERN.test(value)) {
    throw securityError("INTERNAL_FAILURE");
  }
}

function assertIssuedIntentMatches(
  intent: ElevatedIntent,
  command: IssueElevatedIntentCommand,
): void {
  assertFingerprint(intent.payloadFingerprint);
  if (
    intent.requestId.value !== command.requestId.value ||
    intent.actorUserId.value !== command.actorUserId.value ||
    intent.actorSessionId !== command.actorSessionId ||
    intent.actorAuthorizationReference !==
      command.actorAuthorizationReference ||
    intent.operation !== command.operation ||
    intent.targetUserId.value !== command.targetUserId.value ||
    intent.desiredRole !== "super_admin" ||
    intent.expectedStateToken.value !== command.expectedStateToken.value ||
    intent.normalizedReason.value !== command.normalizedReason.value ||
    intent.payloadFingerprint !== command.payloadFingerprint ||
    intent.priorTotpAuthenticatedAtEpochSeconds !==
      command.priorTotpAuthenticatedAtEpochSeconds
  ) {
    throw securityError("INTENT_MISMATCH");
  }
  if (
    parseIntentId(intent.intentId) !== intent.intentId ||
    !Number.isSafeInteger(intent.issuedAtEpochSeconds) ||
    !Number.isSafeInteger(intent.challengeNotBeforeEpochSeconds) ||
    !Number.isSafeInteger(intent.expiresAtEpochSeconds) ||
    intent.challengeNotBeforeEpochSeconds !== intent.issuedAtEpochSeconds ||
    intent.expiresAtEpochSeconds - intent.issuedAtEpochSeconds !==
      MAX_TOTP_AGE_SECONDS ||
    intent.consumedAtEpochSeconds !== null
  ) {
    throw securityError("INTENT_MISMATCH");
  }
}

export function validateElevatedIntentForConsumption(input: {
  confirmation: ConsumeElevatedIntentCommand;
  currentEpochSeconds: number;
  intent: ElevatedIntent;
  trustedAuthEvidence: TrustedAuthEvidence;
}): void {
  const { confirmation, currentEpochSeconds, intent, trustedAuthEvidence } =
    input;
  if (
    intent.consumedAtEpochSeconds === null &&
    currentEpochSeconds > intent.expiresAtEpochSeconds
  ) {
    throw securityError("INTENT_EXPIRED");
  }
  if (
    trustedAuthEvidence.actorUserId !== intent.actorUserId.value ||
    confirmation.actorUserId.value !== intent.actorUserId.value
  ) {
    throw securityError("UNAUTHORIZED_ACTOR");
  }
  if (
    trustedAuthEvidence.sessionId !== intent.actorSessionId ||
    confirmation.actorSessionId !== intent.actorSessionId
  ) {
    throw securityError("INVALID_SESSION");
  }
  if (
    confirmation.intentId !== intent.intentId ||
    confirmation.actorAuthorizationReference !==
      intent.actorAuthorizationReference ||
    confirmation.requestId.value !== intent.requestId.value ||
    confirmation.operation !== intent.operation ||
    confirmation.targetUserId.value !== intent.targetUserId.value ||
    confirmation.expectedStateToken.value !== intent.expectedStateToken.value ||
    confirmation.normalizedReason.value !== intent.normalizedReason.value ||
    confirmation.payloadFingerprint !== intent.payloadFingerprint
  ) {
    throw securityError("INTENT_MISMATCH");
  }
  if (
    confirmation.confirmedTotpAuthenticatedAtEpochSeconds <=
      intent.priorTotpAuthenticatedAtEpochSeconds ||
    confirmation.confirmedTotpAuthenticatedAtEpochSeconds <
      intent.challengeNotBeforeEpochSeconds
  ) {
    throw securityError("FRESH_TOTP_REQUIRED");
  }
}

function mapConsumeFailure(
  status: Exclude<ConsumeElevatedIntentResult, { status: "result" }>["status"],
): never {
  switch (status) {
    case "expected_state_conflict":
      throw securityError("EXPECTED_STATE_CONFLICT");
    case "intent_consumed":
      throw securityError("INTENT_CONSUMED");
    case "intent_expired":
      throw securityError("INTENT_EXPIRED");
    case "intent_mismatch":
      throw securityError("INTENT_MISMATCH");
    case "request_id_conflict":
      throw securityError("REQUEST_ID_CONFLICT");
    default:
      throw securityError("INTERNAL_FAILURE");
  }
}

function safeRuntimeValidation(validation: () => void): void {
  try {
    validation();
  } catch (error) {
    if (error instanceof ElevatedAccessSecurityError) throw error;
    throw securityError("INTERNAL_FAILURE");
  }
}

async function safePortOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ElevatedAccessSecurityError) throw error;
    throw securityError("INTERNAL_FAILURE");
  }
}

export function createElevatedAccessGovernanceService(
  dependencies: ElevatedAccessGovernanceServiceDependencies,
): ElevatedAccessGovernanceService {
  return {
    async issueGrantSuperAdminIntent(input) {
      const parsed = parseGrantSuperAdminRequest(input);
      const currentEpochSeconds = nowEpochSeconds(dependencies.clock);
      const evidence = await trustedEvidence(dependencies.auth);
      const totp = requireFreshTotpEvidence(evidence, currentEpochSeconds);
      if (evidence === null) throw securityError("AUTHENTICATION_REQUIRED");
      const policy = await currentPolicy(dependencies.policy);
      authorizeExactActorAndTarget(evidence, policy, parsed.targetUserId);

      const payload: GrantSuperAdminPayload = {
        actorUserId: policy.authorizedActorUserId,
        expectedStateToken: parsed.expectedStateToken,
        normalizedReason: parsed.normalizedReason,
        operation: parsed.operation,
        targetUserId: policy.exactTargetUserId,
      };
      const payloadFingerprint =
        await grantSuperAdminPayloadFingerprint(payload);
      const command: IssueElevatedIntentCommand = {
        ...payload,
        actorAuthorizationReference: policy.actorAuthorizationReference,
        actorSessionId: evidence.sessionId,
        payloadFingerprint,
        priorTotpAuthenticatedAtEpochSeconds: totp.authenticatedAtEpochSeconds,
        requestId: parsed.requestId,
      };
      const result = await safePortOperation(() =>
        dependencies.intents.issueGrantSuperAdminIntent(command),
      );
      if (result.status === "request_id_conflict") {
        throw securityError("REQUEST_ID_CONFLICT");
      }
      safeRuntimeValidation(() =>
        assertIssuedIntentMatches(result.intent, command),
      );
      return result.intent;
    },

    async confirmGrantSuperAdminIntent(input) {
      const parsed = parseGrantSuperAdminConfirmation(input);
      const currentEpochSeconds = nowEpochSeconds(dependencies.clock);
      const evidence = await trustedEvidence(dependencies.auth);
      const totp = requireFreshTotpEvidence(evidence, currentEpochSeconds);
      if (evidence === null) throw securityError("AUTHENTICATION_REQUIRED");

      // Resolve the session-bound intent before applying the pre-mutation
      // target policy. The database lookup is scoped to the live actor,
      // session and frozen commissioning policy, so an unrelated caller
      // cannot use an opaque intent id as a result-disclosure oracle.
      const intent = await safePortOperation(() =>
        dependencies.intents.getIntent(parsed.intentId),
      );
      if (intent === null) throw securityError("INTENT_MISMATCH");

      // A new execution must still satisfy the strict "target is ordinary"
      // policy. A consumed intent, however, must be allowed to reach the
      // atomic database boundary so that an exact retry can return its
      // canonical ledger result after the original grant changed that state.
      const policy =
        intent.consumedAtEpochSeconds === null
          ? await currentPolicy(dependencies.policy)
          : null;
      if (policy !== null) {
        authorizeExactActorAndTarget(evidence, policy, parsed.targetUserId);
      }

      const payload: GrantSuperAdminPayload = {
        actorUserId: policy?.authorizedActorUserId ?? intent.actorUserId,
        expectedStateToken: parsed.expectedStateToken,
        normalizedReason: parsed.normalizedReason,
        operation: parsed.operation,
        targetUserId: policy?.exactTargetUserId ?? parsed.targetUserId,
      };
      const payloadFingerprint =
        await grantSuperAdminPayloadFingerprint(payload);
      const confirmation: ConsumeElevatedIntentCommand = {
        ...payload,
        actorAuthorizationReference:
          policy?.actorAuthorizationReference ??
          intent.actorAuthorizationReference,
        actorSessionId: evidence.sessionId,
        confirmedTotpAuthenticatedAtEpochSeconds:
          totp.authenticatedAtEpochSeconds,
        intentId: parsed.intentId,
        payloadFingerprint,
        requestId: parsed.requestId,
      };
      safeRuntimeValidation(() =>
        validateElevatedIntentForConsumption({
          confirmation,
          currentEpochSeconds,
          intent,
          trustedAuthEvidence: evidence,
        }),
      );

      const result = await safePortOperation(() =>
        dependencies.intents.consumeGrantSuperAdminIntent(confirmation),
      );
      if (result.status !== "result") mapConsumeFailure(result.status);
      return result.result;
    },
  };
}

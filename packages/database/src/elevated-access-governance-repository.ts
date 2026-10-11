import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import {
  ElevatedAccessSecurityError,
  GRANT_SUPER_ADMIN_OPERATION,
  IdentityAccessExpectedStateToken,
  IdentityAccessNormalizedReason,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  parseIdentityAccessMutationResult,
  type ConsumeElevatedIntentCommand,
  type ConsumeElevatedIntentResult,
  type ElevatedCommissioningPolicy,
  type ElevatedCommissioningPolicyPort,
  type ElevatedIntent,
  type ElevatedIntentPort,
  type IssueElevatedIntentCommand,
  type IssueElevatedIntentResult,
} from "@fandom-harbor/services";

import { createServerSupabaseClient } from "./server-client";

interface IssueIntentParameters {
  p_expected_state_token: string;
  p_payload_fingerprint: string;
  p_reason: string;
  p_request_id: string;
}

interface GetIntentParameters {
  p_intent_id: string;
}

interface ConfirmIntentParameters extends IssueIntentParameters {
  p_intent_id: string;
}

interface ElevatedAccessDataSource {
  confirmIntent(parameters: ConfirmIntentParameters): Promise<unknown>;
  getIntent(parameters: GetIntentParameters): Promise<unknown>;
  getPolicy(): Promise<unknown>;
  issueIntent(parameters: IssueIntentParameters): Promise<unknown>;
}

export interface ElevatedAccessDatabaseAdapters {
  intents: ElevatedIntentPort;
  policy: ElevatedCommissioningPolicyPort;
}

interface RpcResponse {
  data: unknown;
  error: unknown;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const FINGERPRINT_PATTERN = /^[0-9a-f]{64}$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): void {
  const keys = Reflect.ownKeys(value);
  if (
    keys.some((key) => typeof key !== "string" || !expected.includes(key)) ||
    expected.some((key) => !Object.hasOwn(value, key))
  ) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  return value;
}

function uuidValue(value: unknown): string {
  const parsed = stringValue(value).toLowerCase();
  if (!UUID_PATTERN.test(parsed)) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  return parsed;
}

function epochValue(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  return value as number;
}

function nullableEpochValue(value: unknown): number | null {
  return value === null ? null : epochValue(value);
}

function parsePolicy(value: unknown): ElevatedCommissioningPolicy {
  if (!isRecord(value)) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  exactKeys(value, [
    "actorAuthorizationReference",
    "authorizedActorUserId",
    "exactTargetUserId",
  ]);
  const actorAuthorizationReference = stringValue(
    value.actorAuthorizationReference,
  );
  const authorizedActorUserId = IdentityAccessUserId.parse(
    value.authorizedActorUserId,
  ).value;
  const exactTargetUserId = IdentityAccessUserId.parse(
    value.exactTargetUserId,
  ).value;
  if (
    actorAuthorizationReference.length === 0 ||
    authorizedActorUserId === exactTargetUserId
  ) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  return Object.freeze({
    actorAuthorizationReference,
    authorizedActorUserId,
    exactTargetUserId,
  });
}

function parseIntent(value: unknown): ElevatedIntent {
  if (!isRecord(value)) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  exactKeys(value, [
    "actorAuthorizationReference",
    "actorSessionId",
    "actorUserId",
    "challengeNotBeforeEpochSeconds",
    "consumedAtEpochSeconds",
    "desiredRole",
    "expectedStateToken",
    "expiresAtEpochSeconds",
    "intentId",
    "issuedAtEpochSeconds",
    "normalizedReason",
    "operation",
    "payloadFingerprint",
    "priorTotpAuthenticatedAtEpochSeconds",
    "requestId",
    "targetUserId",
  ]);
  const operation = stringValue(value.operation);
  const desiredRole = stringValue(value.desiredRole);
  const payloadFingerprint = stringValue(value.payloadFingerprint);
  if (
    operation !== GRANT_SUPER_ADMIN_OPERATION ||
    desiredRole !== "super_admin" ||
    !FINGERPRINT_PATTERN.test(payloadFingerprint)
  ) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  return Object.freeze({
    actorAuthorizationReference: stringValue(value.actorAuthorizationReference),
    actorSessionId: uuidValue(value.actorSessionId),
    actorUserId: IdentityAccessUserId.parse(value.actorUserId),
    challengeNotBeforeEpochSeconds: epochValue(
      value.challengeNotBeforeEpochSeconds,
    ),
    consumedAtEpochSeconds: nullableEpochValue(value.consumedAtEpochSeconds),
    desiredRole,
    expectedStateToken: IdentityAccessExpectedStateToken.parse(
      value.expectedStateToken,
    ),
    expiresAtEpochSeconds: epochValue(value.expiresAtEpochSeconds),
    intentId: uuidValue(value.intentId),
    issuedAtEpochSeconds: epochValue(value.issuedAtEpochSeconds),
    normalizedReason: IdentityAccessNormalizedReason.parse(
      value.normalizedReason,
    ),
    operation,
    payloadFingerprint,
    priorTotpAuthenticatedAtEpochSeconds: epochValue(
      value.priorTotpAuthenticatedAtEpochSeconds,
    ),
    requestId: IdentityAccessRequestId.parse(value.requestId),
    targetUserId: IdentityAccessUserId.parse(value.targetUserId),
  });
}

function parseIssueResult(value: unknown): IssueElevatedIntentResult {
  if (!isRecord(value) || typeof value.status !== "string") {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  if (value.status === "request_id_conflict") {
    exactKeys(value, ["status"]);
    return { status: "request_id_conflict" };
  }
  if (value.status !== "issued" && value.status !== "replayed") {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  exactKeys(value, ["intent", "status"]);
  return { intent: parseIntent(value.intent), status: value.status };
}

function parseConsumeResult(value: unknown): ConsumeElevatedIntentResult {
  if (!isRecord(value) || typeof value.status !== "string") {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  if (value.status === "result") {
    exactKeys(value, ["result", "status"]);
    return {
      result: parseIdentityAccessMutationResult(value.result),
      status: "result",
    };
  }
  if (
    value.status !== "expected_state_conflict" &&
    value.status !== "intent_consumed" &&
    value.status !== "intent_expired" &&
    value.status !== "intent_mismatch" &&
    value.status !== "request_id_conflict"
  ) {
    throw new ElevatedAccessSecurityError("INTERNAL_FAILURE");
  }
  exactKeys(value, ["status"]);
  return { status: value.status };
}

function errorString(value: unknown, key: string): string | null {
  if (!isRecord(value) || typeof value[key] !== "string") return null;
  return value[key] as string;
}

function mapProviderError(error: unknown): ElevatedAccessSecurityError {
  const message = errorString(error, "message");
  const stableMessages = new Map<
    string,
    ConstructorParameters<typeof ElevatedAccessSecurityError>[0]
  >([
    ["AAL2_REQUIRED", "AAL2_REQUIRED"],
    ["AUTHENTICATION_REQUIRED", "AUTHENTICATION_REQUIRED"],
    ["EXPECTED_STATE_CONFLICT", "EXPECTED_STATE_CONFLICT"],
    ["FRESH_TOTP_REQUIRED", "FRESH_TOTP_REQUIRED"],
    ["INTENT_MISMATCH", "INTENT_MISMATCH"],
    ["INVALID_AUTH_EVIDENCE", "INVALID_AUTH_EVIDENCE"],
    ["INVALID_SESSION", "INVALID_SESSION"],
    ["INVALID_TARGET", "INVALID_TARGET"],
    ["STALE_TOTP", "STALE_TOTP"],
    ["UNAUTHORIZED_ACTOR", "UNAUTHORIZED_ACTOR"],
  ]);
  return new ElevatedAccessSecurityError(
    (message === null ? undefined : stableMessages.get(message)) ??
      "INTERNAL_FAILURE",
  );
}

async function callProvider<T>(
  operation: () => Promise<unknown>,
  parser: (value: unknown) => T,
): Promise<T> {
  try {
    return parser(await operation());
  } catch (error) {
    if (error instanceof ElevatedAccessSecurityError) throw error;
    throw mapProviderError(error);
  }
}

function issueParameters(
  command: IssueElevatedIntentCommand | ConsumeElevatedIntentCommand,
): IssueIntentParameters {
  return {
    p_expected_state_token: IdentityAccessExpectedStateToken.parse(
      command.expectedStateToken.value,
    ).value,
    p_payload_fingerprint: command.payloadFingerprint,
    p_reason: IdentityAccessNormalizedReason.parse(
      command.normalizedReason.value,
    ).value,
    p_request_id: IdentityAccessRequestId.parse(command.requestId.value).value,
  };
}

function confirmParameters(
  command: ConsumeElevatedIntentCommand,
): ConfirmIntentParameters {
  return {
    ...issueParameters(command),
    p_intent_id: uuidValue(command.intentId),
  };
}

export function createElevatedAccessDatabaseAdapters(
  source: ElevatedAccessDataSource,
): ElevatedAccessDatabaseAdapters {
  return {
    policy: {
      getGrantSuperAdminPolicy() {
        return callProvider(source.getPolicy, parsePolicy);
      },
    },
    intents: {
      consumeGrantSuperAdminIntent(command) {
        return callProvider(
          () => source.confirmIntent(confirmParameters(command)),
          parseConsumeResult,
        );
      },
      getIntent(intentId) {
        return callProvider(
          () => source.getIntent({ p_intent_id: uuidValue(intentId) }),
          (value) => (value === null ? null : parseIntent(value)),
        );
      },
      issueGrantSuperAdminIntent(command) {
        return callProvider(
          () => source.issueIntent(issueParameters(command)),
          parseIssueResult,
        );
      },
    },
  };
}

async function rpcData(request: PromiseLike<RpcResponse>): Promise<unknown> {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export function createSupabaseElevatedAccessDatabaseAdapters(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): ElevatedAccessDatabaseAdapters {
  const client = createServerSupabaseClient(environment, cookies);
  return createElevatedAccessDatabaseAdapters({
    confirmIntent(parameters) {
      return rpcData(
        client
          .rpc("confirm_grant_super_admin_intent_v1", parameters)
          .retry(false),
      );
    },
    getIntent(parameters) {
      return rpcData(client.rpc("get_grant_super_admin_intent_v1", parameters));
    },
    getPolicy() {
      return rpcData(client.rpc("get_grant_super_admin_policy_v1"));
    },
    issueIntent(parameters) {
      return rpcData(
        client
          .rpc("issue_grant_super_admin_intent_v1", parameters)
          .retry(false),
      );
    },
  });
}

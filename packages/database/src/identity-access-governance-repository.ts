import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import {
  IdentityAccessExpectedStateToken,
  IdentityAccessGovernanceDomainError,
  IdentityAccessNormalizedReason,
  IdentityAccessPageLimit,
  IdentityAccessRegistrationNameQuery,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  parseIdentityAccessAuditCursor,
  parseIdentityAccessGovernanceAuditPage,
  parseIdentityAccessMutationResult,
  parseIdentityAccessSubjectCursor,
  parseIdentityAccessSubjectDetail,
  parseIdentityAccessSubjectPage,
  type GrantAuthorRoleCommand,
  type IdentityAccessAuditListInput,
  type IdentityAccessGovernanceAuditPage,
  type IdentityAccessGovernanceReadPort,
  type IdentityAccessGovernanceWritePort,
  type IdentityAccessMutationResult,
  type IdentityAccessSubjectDetail,
  type IdentityAccessSubjectPage,
  type IdentityAccessSubjectSearchInput,
  type RevokeAuthorRoleCommand,
  type SetOrdinaryMembershipStateCommand,
} from "@fandom-harbor/services";

import { createServerSupabaseClient } from "./server-client";

interface SearchIdentityAccessSubjectsRpcParameters {
  p_cursor: {
    missingRegistrationName: boolean;
    normalizedRegistrationName: string | null;
    userId: string;
  } | null;
  p_limit: number;
  p_query: string | null;
}

interface GetIdentityAccessSubjectRpcParameters {
  p_user_id: string;
}

interface ListIdentityAccessAuditRpcParameters {
  p_before: { auditId: string; createdAt: string } | null;
  p_limit: number;
  p_user_id: string;
}

interface IdentityAccessOrdinaryMutationRpcParameters {
  p_expected_state_token: string;
  p_reason: string;
  p_request_id: string;
  p_target_user_id: string;
}

interface SetOrdinaryMembershipStateRpcParameters extends IdentityAccessOrdinaryMutationRpcParameters {
  p_state: "active" | "revoked" | "suspended";
}

interface IdentityAccessGovernanceRepositoryDataSource {
  getSubject(
    parameters: GetIdentityAccessSubjectRpcParameters,
  ): Promise<unknown>;
  grantAuthorRole(
    parameters: IdentityAccessOrdinaryMutationRpcParameters,
  ): Promise<unknown>;
  listAudit(parameters: ListIdentityAccessAuditRpcParameters): Promise<unknown>;
  revokeAuthorRole(
    parameters: IdentityAccessOrdinaryMutationRpcParameters,
  ): Promise<unknown>;
  searchSubjects(
    parameters: SearchIdentityAccessSubjectsRpcParameters,
  ): Promise<unknown>;
  setOrdinaryMembershipState(
    parameters: SetOrdinaryMembershipStateRpcParameters,
  ): Promise<unknown>;
}

interface IdentityAccessGovernanceRepository
  extends IdentityAccessGovernanceReadPort, IdentityAccessGovernanceWritePort {}

interface RpcResponse {
  data: unknown;
  error: unknown;
}

function dataCorruption(): IdentityAccessGovernanceDomainError {
  return new IdentityAccessGovernanceDomainError("DATA_CORRUPTION");
}

function stringProperty(value: unknown, key: string): string | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !Object.hasOwn(value, key)
  ) {
    return null;
  }
  const candidate = Reflect.get(value, key);
  return typeof candidate === "string" ? candidate : null;
}

export function mapIdentityAccessGovernanceRpcError(
  error: unknown,
): IdentityAccessGovernanceDomainError {
  const code = stringProperty(error, "code");
  const details = stringProperty(error, "details");

  if (code === "28000") {
    return new IdentityAccessGovernanceDomainError("UNAUTHENTICATED");
  }
  if (code === "42501") {
    return new IdentityAccessGovernanceDomainError(
      details === "ELEVATED_MUTATION_DEFERRED"
        ? "ELEVATED_MUTATION_DEFERRED"
        : "FORBIDDEN",
    );
  }
  if (code === "22023") {
    return new IdentityAccessGovernanceDomainError(
      details === "REQUEST_ID_MISMATCH"
        ? "REQUEST_ID_MISMATCH"
        : "INVALID_INPUT",
    );
  }
  if (code === "P0002") {
    return new IdentityAccessGovernanceDomainError("TARGET_NOT_FOUND");
  }
  if (code?.startsWith("PGRST")) {
    return new IdentityAccessGovernanceDomainError("REPOSITORY_UNAVAILABLE");
  }
  if (code !== null) {
    return new IdentityAccessGovernanceDomainError("UNKNOWN_REPOSITORY_ERROR");
  }
  return new IdentityAccessGovernanceDomainError("REPOSITORY_UNAVAILABLE");
}

function parseProviderData<T>(
  parser: (value: unknown) => T,
  value: unknown,
): T {
  try {
    return parser(value);
  } catch {
    throw dataCorruption();
  }
}

async function callProvider<T>(
  operation: () => Promise<unknown>,
  parser: (value: unknown) => T,
): Promise<T> {
  try {
    return parseProviderData(parser, await operation());
  } catch (error) {
    if (
      error instanceof IdentityAccessGovernanceDomainError &&
      error.code === "DATA_CORRUPTION"
    ) {
      throw error;
    }
    throw mapIdentityAccessGovernanceRpcError(error);
  }
}

function requireUserId(value: IdentityAccessUserId): string {
  return IdentityAccessUserId.parse(value.value).value;
}

function requireRequestId(value: IdentityAccessRequestId): string {
  return IdentityAccessRequestId.parse(value.value).value;
}

function requireExpectedStateToken(
  value: IdentityAccessExpectedStateToken,
): string {
  return IdentityAccessExpectedStateToken.parse(value.value).value;
}

function requireReason(value: IdentityAccessNormalizedReason): string {
  return IdentityAccessNormalizedReason.parse(value.value).value;
}

function requireLimit(value: IdentityAccessPageLimit): number {
  return IdentityAccessPageLimit.parse(value.value).value;
}

function searchParameters(
  input: IdentityAccessSubjectSearchInput,
): SearchIdentityAccessSubjectsRpcParameters {
  const limit = requireLimit(input.limit);
  const cursor = parseIdentityAccessSubjectCursor(
    input.cursor === null
      ? null
      : {
          missingRegistrationName: input.cursor.missingRegistrationName,
          normalizedRegistrationName:
            input.cursor.normalizedRegistrationName?.value ?? null,
          userId: input.cursor.userId.value,
        },
  );

  let query: string | null = null;
  if (input.query?.kind === "userId") {
    query = requireUserId(input.query.userId);
  } else if (input.query?.kind === "registrationName") {
    query = IdentityAccessRegistrationNameQuery.parse(
      input.query.registrationName.value,
    ).value;
  }

  return {
    p_cursor:
      cursor === null
        ? null
        : {
            missingRegistrationName: cursor.missingRegistrationName,
            normalizedRegistrationName:
              cursor.normalizedRegistrationName?.value ?? null,
            userId: cursor.userId.value,
          },
    p_limit: limit,
    p_query: query,
  };
}

function auditParameters(
  input: IdentityAccessAuditListInput,
): ListIdentityAccessAuditRpcParameters {
  const before = parseIdentityAccessAuditCursor(
    input.before === null
      ? null
      : {
          auditId: input.before.auditId,
          createdAt: input.before.createdAt,
        },
  );
  return {
    p_before:
      before === null
        ? null
        : {
            auditId: before.auditId,
            createdAt: before.createdAt.toISOString(),
          },
    p_limit: requireLimit(input.limit),
    p_user_id: requireUserId(input.targetUserId),
  };
}

function mutationParameters(
  command:
    | GrantAuthorRoleCommand
    | RevokeAuthorRoleCommand
    | SetOrdinaryMembershipStateCommand,
): IdentityAccessOrdinaryMutationRpcParameters {
  return {
    p_expected_state_token: requireExpectedStateToken(
      command.expectedStateToken,
    ),
    p_reason: requireReason(command.reason),
    p_request_id: requireRequestId(command.requestId),
    p_target_user_id: requireUserId(command.targetUserId),
  };
}

function validatePageSize<T extends { items: unknown[] }>(
  page: T,
  limit: number,
): T {
  if (page.items.length > limit) throw dataCorruption();
  return page;
}

function validateMutationResult(
  value: unknown,
  command:
    | GrantAuthorRoleCommand
    | RevokeAuthorRoleCommand
    | SetOrdinaryMembershipStateCommand,
): IdentityAccessMutationResult {
  const result = parseIdentityAccessMutationResult(value);
  if (
    result.requestId.value !== requireRequestId(command.requestId) ||
    result.targetUserId.value !== requireUserId(command.targetUserId)
  ) {
    throw dataCorruption();
  }

  if (result.status === "saved") {
    const isRoleCommand = command.operation !== "setOrdinaryMembershipState";
    if (isRoleCommand !== (result.roleGrantId !== undefined)) {
      throw dataCorruption();
    }
  }
  return result;
}

export function createIdentityAccessGovernanceRepository(
  source: IdentityAccessGovernanceRepositoryDataSource,
): IdentityAccessGovernanceRepository {
  return {
    async getSubjectDetail(userId) {
      const expectedUserId = requireUserId(userId);
      const result = await callProvider<IdentityAccessSubjectDetail>(
        () => source.getSubject({ p_user_id: expectedUserId }),
        parseIdentityAccessSubjectDetail,
      );
      if (result.profile.userId.value !== expectedUserId) {
        throw dataCorruption();
      }
      return result;
    },

    async grantAuthorRole(command) {
      return callProvider(
        () => source.grantAuthorRole(mutationParameters(command)),
        (value) => validateMutationResult(value, command),
      );
    },

    async listSubjectAudit(input) {
      const parameters = auditParameters(input);
      return callProvider<IdentityAccessGovernanceAuditPage>(
        () => source.listAudit(parameters),
        (value) =>
          validatePageSize(
            parseIdentityAccessGovernanceAuditPage(value),
            parameters.p_limit,
          ),
      );
    },

    async revokeAuthorRole(command) {
      return callProvider(
        () => source.revokeAuthorRole(mutationParameters(command)),
        (value) => validateMutationResult(value, command),
      );
    },

    async searchSubjects(input) {
      const parameters = searchParameters(input);
      return callProvider<IdentityAccessSubjectPage>(
        () => source.searchSubjects(parameters),
        (value) =>
          validatePageSize(
            parseIdentityAccessSubjectPage(value),
            parameters.p_limit,
          ),
      );
    },

    async setOrdinaryMembershipState(command) {
      const parameters: SetOrdinaryMembershipStateRpcParameters = {
        ...mutationParameters(command),
        p_state: command.state,
      };
      return callProvider(
        () => source.setOrdinaryMembershipState(parameters),
        (value) => validateMutationResult(value, command),
      );
    },
  };
}

async function rpcData(request: PromiseLike<RpcResponse>): Promise<unknown> {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export function createSupabaseIdentityAccessGovernanceRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): IdentityAccessGovernanceRepository {
  const client = createServerSupabaseClient(environment, cookies);

  return createIdentityAccessGovernanceRepository({
    getSubject(parameters) {
      return rpcData(client.rpc("get_identity_access_subject_v1", parameters));
    },
    grantAuthorRole(parameters) {
      return rpcData(
        client.rpc("grant_author_role_v2", parameters).retry(false),
      );
    },
    listAudit(parameters) {
      return rpcData(client.rpc("list_identity_access_audit_v1", parameters));
    },
    revokeAuthorRole(parameters) {
      return rpcData(
        client.rpc("revoke_author_role_v2", parameters).retry(false),
      );
    },
    searchSubjects(parameters) {
      return rpcData(
        client.rpc("search_identity_access_subjects_v1", parameters),
      );
    },
    setOrdinaryMembershipState(parameters) {
      return rpcData(
        client.rpc("set_ordinary_membership_state_v2", parameters).retry(false),
      );
    },
  });
}

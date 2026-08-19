import {
  IdentityAccessGovernanceDomainError,
  IdentityAccessNormalizedReason,
  IdentityAccessRequestId,
  parseGrantAuthorRoleCommand,
  parseRevokeAuthorRoleCommand,
  parseSetOrdinaryMembershipStateCommand,
  type IdentityAccessGovernanceErrorCode,
  type IdentityAccessGovernanceService,
  type IdentityAccessMembershipState,
  type IdentityAccessMutationResult,
  type IdentityAccessOrdinaryMembershipState,
  type IdentityAccessStateSnapshot,
  type IdentityAccessSubjectDetail,
} from "@fandom-harbor/services";

export type AccessGovernanceOperation =
  "grantAuthorRole" | "revokeAuthorRole" | "setOrdinaryMembershipState";

export interface AccessGovernanceReview {
  authorActive: boolean;
  currentMembershipState: IdentityAccessMembershipState;
  expectedStateToken: string;
  operation: AccessGovernanceOperation;
  reason: string;
  registrationName: string | null;
  requestId: string;
  state?: IdentityAccessOrdinaryMembershipState;
  targetUserId: string;
}

interface SerializedCurrentState {
  authorActive: boolean;
  membershipState: IdentityAccessMembershipState;
  stateToken: string;
  targetUserId: string;
}

export type AccessGovernanceMutationActionState =
  | { status: "idle" }
  | { message: string; status: "invalid" }
  | { review: AccessGovernanceReview; status: "review" }
  | {
      auditLogId?: string;
      current: SerializedCurrentState;
      requestId: string;
      status: "saved" | "unchanged";
    }
  | {
      conflictReason:
        "expected_state_mismatch" | "target_membership_not_active";
      current: SerializedCurrentState;
      requestId: string | null;
      status: "conflict";
    }
  | {
      code: IdentityAccessGovernanceErrorCode;
      message: string;
      retryReview?: AccessGovernanceReview;
      status: "error";
    };

export const INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE = {
  status: "idle",
} as const satisfies AccessGovernanceMutationActionState;

export interface AccessGovernanceMutationDependencies {
  createRequestId(): string;
  createService(): Promise<IdentityAccessGovernanceService>;
  refresh(): void;
}

const safeMessages: Readonly<
  Record<IdentityAccessGovernanceErrorCode, string>
> = {
  CONFLICT: "目标状态已经变化。请刷新详情并重新复核。",
  DATA_CORRUPTION: "治理服务返回了不可信数据，未执行变更。",
  ELEVATED_MUTATION_DEFERRED:
    "该账户属于 Admin 或 Super Admin；写入等待未来 Reauth/MFA 阶段。",
  FORBIDDEN: "当前账号没有执行这项治理操作的权限。",
  INVALID_INPUT: "操作、目标、状态指纹或变更原因不符合治理合同。",
  REPOSITORY_UNAVAILABLE:
    "治理服务暂时不可用。可以使用同一 Request ID 安全重试。",
  REQUEST_ID_MISMATCH:
    "该 Request ID 与原始请求不一致。为安全起见，请重新复核。",
  TARGET_NOT_FOUND: "目标身份当前不存在或不可治理。",
  UNAUTHENTICATED: "登录状态已失效，请重新登录。",
  UNKNOWN_REPOSITORY_ERROR:
    "治理操作没有完成。可以使用同一 Request ID 安全重试。",
};

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") {
    throw new IdentityAccessGovernanceDomainError("INVALID_INPUT");
  }
  return value;
}

function operationFromForm(formData: FormData): AccessGovernanceOperation {
  const value = formString(formData, "operation");
  if (
    value !== "grantAuthorRole" &&
    value !== "revokeAuthorRole" &&
    value !== "setOrdinaryMembershipState"
  ) {
    throw new IdentityAccessGovernanceDomainError("INVALID_INPUT");
  }
  return value;
}

function hasAuthor(detail: IdentityAccessSubjectDetail): boolean {
  return detail.activeRoleGrants.some((grant) => grant.role === "author");
}

function currentState(
  snapshot: IdentityAccessStateSnapshot,
  stateToken: string,
): SerializedCurrentState {
  return {
    authorActive: snapshot.activeRoleGrants.some(
      (grant) => grant.role === "author",
    ),
    membershipState: snapshot.membership.state,
    stateToken,
    targetUserId: snapshot.targetUserId.value,
  };
}

function reviewFromState(
  state: AccessGovernanceMutationActionState,
): AccessGovernanceReview | null {
  if (state.status === "review") return state.review;
  return state.status === "error" ? (state.retryReview ?? null) : null;
}

function safeError(
  error: unknown,
  review?: AccessGovernanceReview,
): AccessGovernanceMutationActionState {
  const code =
    error instanceof IdentityAccessGovernanceDomainError
      ? error.code
      : "UNKNOWN_REPOSITORY_ERROR";
  const retryable =
    code === "REPOSITORY_UNAVAILABLE" || code === "UNKNOWN_REPOSITORY_ERROR";
  return {
    code,
    message: safeMessages[code],
    ...(retryable && review ? { retryReview: review } : {}),
    status: "error",
  };
}

function commandFor(review: AccessGovernanceReview) {
  const base = {
    expectedStateToken: review.expectedStateToken,
    reason: review.reason,
    requestId: review.requestId,
    targetUserId: review.targetUserId,
  };
  switch (review.operation) {
    case "grantAuthorRole":
      return parseGrantAuthorRoleCommand(base);
    case "revokeAuthorRole":
      return parseRevokeAuthorRoleCommand(base);
    case "setOrdinaryMembershipState":
      return parseSetOrdinaryMembershipStateCommand({
        ...base,
        state: review.state,
      });
  }
}

async function prepareReview(
  formData: FormData,
  dependencies: AccessGovernanceMutationDependencies,
): Promise<AccessGovernanceMutationActionState> {
  const operation = operationFromForm(formData);
  const targetUserId = formString(formData, "targetUserId");
  const expectedStateToken = formString(formData, "expectedStateToken");
  const reason = IdentityAccessNormalizedReason.parse(
    formString(formData, "reason"),
  ).value;
  const detail = await (
    await dependencies.createService()
  ).getSubjectDetail(targetUserId);

  if (detail.isElevatedAccount) {
    throw new IdentityAccessGovernanceDomainError("ELEVATED_MUTATION_DEFERRED");
  }
  if (detail.expectedState.token.value !== expectedStateToken) {
    return {
      conflictReason: "expected_state_mismatch",
      current: currentState(
        detail.expectedState.snapshot,
        detail.expectedState.token.value,
      ),
      requestId: null,
      status: "conflict",
    };
  }

  const authorActive = hasAuthor(detail);
  if (
    (operation === "grantAuthorRole" &&
      (authorActive || detail.membership.state !== "active")) ||
    (operation === "revokeAuthorRole" && !authorActive)
  ) {
    throw new IdentityAccessGovernanceDomainError("INVALID_INPUT");
  }

  const requestId = IdentityAccessRequestId.parse(
    dependencies.createRequestId(),
  ).value;
  const state =
    operation === "setOrdinaryMembershipState"
      ? parseSetOrdinaryMembershipStateCommand({
          expectedStateToken,
          reason,
          requestId,
          state: formString(formData, "state"),
          targetUserId,
        }).state
      : undefined;

  return {
    review: {
      authorActive,
      currentMembershipState: detail.membership.state,
      expectedStateToken,
      operation,
      reason,
      registrationName: detail.profile.registrationName,
      requestId,
      ...(state ? { state } : {}),
      targetUserId: detail.profile.userId.value,
    },
    status: "review",
  };
}

async function confirmReview(
  previousState: AccessGovernanceMutationActionState,
  dependencies: AccessGovernanceMutationDependencies,
): Promise<AccessGovernanceMutationActionState> {
  const review = reviewFromState(previousState);
  if (!review) throw new IdentityAccessGovernanceDomainError("INVALID_INPUT");
  const service = await dependencies.createService();
  const command = commandFor(review);
  let result: IdentityAccessMutationResult;
  switch (command.operation) {
    case "grantAuthorRole":
      result = await service.grantAuthorRole(command);
      break;
    case "revokeAuthorRole":
      result = await service.revokeAuthorRole(command);
      break;
    case "setOrdinaryMembershipState":
      result = await service.setOrdinaryMembershipState(command);
      break;
  }
  dependencies.refresh();
  const current = currentState(result.currentState, result.stateToken.value);
  if (result.status === "conflict") {
    return {
      conflictReason: result.conflictReason,
      current,
      requestId: result.requestId.value,
      status: "conflict",
    };
  }
  return {
    ...(result.status === "saved" ? { auditLogId: result.auditLogId } : {}),
    current,
    requestId: result.requestId.value,
    status: result.status,
  };
}

export async function executeAccessGovernanceMutation(
  previousState: AccessGovernanceMutationActionState,
  formData: FormData,
  dependencies: AccessGovernanceMutationDependencies,
): Promise<AccessGovernanceMutationActionState> {
  const intent = formData.get("intent");
  if (intent === "cancel") return INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE;
  try {
    if (intent === "review") {
      return await prepareReview(formData, dependencies);
    }
    if (intent === "confirm") {
      return await confirmReview(previousState, dependencies);
    }
    return { message: safeMessages.INVALID_INPUT, status: "invalid" };
  } catch (error) {
    return safeError(error, reviewFromState(previousState) ?? undefined);
  }
}

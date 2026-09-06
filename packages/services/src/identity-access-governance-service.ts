import type { TrustedAccessContext } from "@fandom-harbor/auth";

import {
  IdentityAccessGovernanceDomainError,
  IdentityAccessUserId,
  parseGrantAuthorRoleCommand,
  parseIdentityAccessAuditListInput,
  parseIdentityAccessSubjectSearchInput,
  parseRevokeAuthorRoleCommand,
  parseSetOrdinaryMembershipStateCommand,
  type IdentityAccessGovernanceAuditPage,
  type IdentityAccessGovernanceReadPort,
  type IdentityAccessGovernanceWritePort,
  type IdentityAccessMutationResult,
  type IdentityAccessSubjectDetail,
  type IdentityAccessSubjectPage,
} from "./identity-access-governance-domain";

export interface IdentityAccessGovernanceLiveAccessChecker {
  getCurrent(): Promise<TrustedAccessContext | null>;
}

export interface IdentityAccessGovernanceServiceDependencies {
  access: IdentityAccessGovernanceLiveAccessChecker;
  read: IdentityAccessGovernanceReadPort;
  write: IdentityAccessGovernanceWritePort;
}

export interface IdentityAccessGovernanceService {
  getSubjectDetail(input: unknown): Promise<IdentityAccessSubjectDetail>;
  grantAuthorRole(input: unknown): Promise<IdentityAccessMutationResult>;
  listSubjectAudit(input: unknown): Promise<IdentityAccessGovernanceAuditPage>;
  revokeAuthorRole(input: unknown): Promise<IdentityAccessMutationResult>;
  searchSubjects(input: unknown): Promise<IdentityAccessSubjectPage>;
  setOrdinaryMembershipState(
    input: unknown,
  ): Promise<IdentityAccessMutationResult>;
}

async function safeOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof IdentityAccessGovernanceDomainError) throw error;
    throw new IdentityAccessGovernanceDomainError("UNKNOWN_REPOSITORY_ERROR");
  }
}

async function requireLiveAdmin(
  access: IdentityAccessGovernanceLiveAccessChecker,
): Promise<void> {
  const context = await safeOperation(() => access.getCurrent());
  if (context === null) {
    throw new IdentityAccessGovernanceDomainError("UNAUTHENTICATED");
  }

  const hasLiveAdminRole =
    context.roles.has("admin") || context.roles.has("super_admin");
  if (
    context.membershipState !== "active" ||
    !hasLiveAdminRole ||
    !context.capabilities.has("admin:operate")
  ) {
    throw new IdentityAccessGovernanceDomainError("FORBIDDEN");
  }
}

async function requireOrdinaryTarget(
  read: IdentityAccessGovernanceReadPort,
  targetUserId: IdentityAccessUserId,
): Promise<void> {
  const target = await safeOperation(() => read.getSubjectDetail(targetUserId));
  if (target.isElevatedAccount) {
    throw new IdentityAccessGovernanceDomainError("ELEVATED_MUTATION_DEFERRED");
  }
}

export function createIdentityAccessGovernanceService(
  dependencies: IdentityAccessGovernanceServiceDependencies,
): IdentityAccessGovernanceService {
  return {
    async getSubjectDetail(input) {
      const userId = IdentityAccessUserId.parse(input);
      await requireLiveAdmin(dependencies.access);
      return safeOperation(() => dependencies.read.getSubjectDetail(userId));
    },

    async grantAuthorRole(input) {
      const command = parseGrantAuthorRoleCommand(input);
      await requireLiveAdmin(dependencies.access);
      await requireOrdinaryTarget(dependencies.read, command.targetUserId);
      return safeOperation(() => dependencies.write.grantAuthorRole(command));
    },

    async listSubjectAudit(input) {
      const normalized = parseIdentityAccessAuditListInput(input);
      await requireLiveAdmin(dependencies.access);
      return safeOperation(() =>
        dependencies.read.listSubjectAudit(normalized),
      );
    },

    async revokeAuthorRole(input) {
      const command = parseRevokeAuthorRoleCommand(input);
      await requireLiveAdmin(dependencies.access);
      await requireOrdinaryTarget(dependencies.read, command.targetUserId);
      return safeOperation(() => dependencies.write.revokeAuthorRole(command));
    },

    async searchSubjects(input) {
      const normalized = parseIdentityAccessSubjectSearchInput(input);
      await requireLiveAdmin(dependencies.access);
      return safeOperation(() => dependencies.read.searchSubjects(normalized));
    },

    async setOrdinaryMembershipState(input) {
      const command = parseSetOrdinaryMembershipStateCommand(input);
      await requireLiveAdmin(dependencies.access);
      await requireOrdinaryTarget(dependencies.read, command.targetUserId);
      return safeOperation(() =>
        dependencies.write.setOrdinaryMembershipState(command),
      );
    },
  };
}

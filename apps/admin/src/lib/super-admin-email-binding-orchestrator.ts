import { createHmac } from "node:crypto";

import type { TrustedAuthEvidence } from "@fandom-harbor/auth";
import type {
  SuperAdminEmailBindingOperation,
  SuperAdminEmailBindingService,
} from "@fandom-harbor/services";
import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
const otpSchema = z.string().regex(/^\d{6}$/u);

export type EmailChangeArm = "email_change_current" | "email_change_new";

export interface AuthoritativeEmailIdentity {
  email: string;
  identityId: string;
  provider: "email";
}

export interface AuthoritativeBindingUser {
  email: string;
  emailChangeConfirmStatus: number | null;
  identities: readonly AuthoritativeEmailIdentity[];
  newEmail: string | null;
  userId: string;
}

export interface EmailChangeCredential {
  emailOtp: string;
  userId: string;
}

export interface VerifiedEmailChange {
  kind: "session";
  accessToken: string;
  userId: string;
}

export interface SuperAdminEmailBindingAuthGateway {
  generateEmailChangeCredential(input: {
    currentEmail: string;
    newEmail: string;
    type: EmailChangeArm;
  }): Promise<EmailChangeCredential>;
  getUser(userId: string): Promise<AuthoritativeBindingUser>;
  revokeAllSessions(accessToken: string): Promise<void>;
  verifyEmailChangeOtp(input: {
    email: string;
    otp: string;
    retainAccessTokenForGlobalRevocation: boolean;
  }): Promise<VerifiedEmailChange | { kind: "first_confirmation_accepted" }>;
  verifyPassword(input: {
    email: string;
    password: string;
  }): Promise<{ authenticatedAtEpochSeconds: number; userId: string }>;
}

export interface MigrationOnlyEmailSender {
  sendNewEmailOtp(input: {
    email: string;
    operationId: string;
    otp: string;
  }): Promise<void>;
}

export type BindingOrchestratorErrorCode =
  | "AUTH_STATE_UNAVAILABLE"
  | "DELIVERY_FAILED"
  | "IDENTITY_MISMATCH"
  | "INVALID_OPERATION"
  | "INVALID_REQUEST"
  | "OTP_REJECTED"
  | "PASSWORD_REJECTED"
  | "RECOVERY_REQUIRED";

export class BindingOrchestratorError extends Error {
  constructor(public readonly code: BindingOrchestratorErrorCode) {
    super(code);
    this.name = "BindingOrchestratorError";
  }
}

interface OrchestratorDependencies {
  allowedTargetUserIds: readonly string[];
  auth: SuperAdminEmailBindingAuthGateway;
  emailHmacContext: string;
  binding: SuperAdminEmailBindingService;
  emailHmacSecret: string;
  getTrustedAuthEvidence(): Promise<TrustedAuthEvidence | null>;
  revokeCurrentActorSessions(): Promise<void>;
  sender: MigrationOnlyEmailSender;
}

function fail(code: BindingOrchestratorErrorCode): BindingOrchestratorError {
  return new BindingOrchestratorError(code);
}

function email(value: string): string {
  const parsed = emailSchema.safeParse(value);
  if (!parsed.success) throw fail("INVALID_REQUEST");
  return parsed.data;
}

function otp(value: string): string {
  const parsed = otpSchema.safeParse(value);
  if (!parsed.success) throw fail("INVALID_REQUEST");
  return parsed.data;
}

function fingerprint(secret: string, context: string, value: string): string {
  if (
    Buffer.byteLength(secret, "utf8") < 32 ||
    context.length < 1 ||
    context.length > 100
  ) {
    throw fail("AUTH_STATE_UNAVAILABLE");
  }
  return createHmac("sha256", secret)
    .update("fandom-harbor:super-admin-email-binding:v1")
    .update("\0")
    .update(context)
    .update("\0")
    .update(value)
    .digest("hex");
}

function currentEvidence(
  evidence: TrustedAuthEvidence | null,
  operation: SuperAdminEmailBindingOperation,
): TrustedAuthEvidence {
  if (evidence === null || evidence.actorUserId !== operation.targetUserId) {
    throw fail("IDENTITY_MISMATCH");
  }
  return evidence;
}

function finalIdentityMatches(
  user: AuthoritativeBindingUser,
  expectedUserId: string,
  expectedEmail: string,
): boolean {
  const emailIdentities = user.identities.filter(
    (identity) => identity.provider === "email",
  );
  return (
    user.userId === expectedUserId &&
    user.email === expectedEmail &&
    user.newEmail === null &&
    // Public GoTrue User JSON omits confirm_status. A final Session (or the
    // recovery read), cleared pending email and matching identity prove completion.
    (user.emailChangeConfirmStatus === null ||
      user.emailChangeConfirmStatus === 0) &&
    emailIdentities.length === 1 &&
    emailIdentities[0]?.email === expectedEmail
  );
}

export function createSuperAdminEmailBindingOrchestrator(
  dependencies: OrchestratorDependencies,
) {
  async function operationForCurrentActor(operationId: string) {
    const operation = await dependencies.binding.get(operationId);
    if (!dependencies.allowedTargetUserIds.includes(operation.targetUserId)) {
      throw fail("IDENTITY_MISMATCH");
    }
    const evidence = currentEvidence(
      await dependencies.getTrustedAuthEvidence(),
      operation,
    );
    return { evidence, operation };
  }

  async function recovery(
    operation: SuperAdminEmailBindingOperation,
    evidence: TrustedAuthEvidence,
    emailFingerprint: string,
    reasonCode: string,
  ): Promise<never> {
    await dependencies.binding.markRecoveryRequired({
      emailFingerprint,
      operationId: operation.operationId,
      reasonCode,
      sessionId: evidence.sessionId,
    });
    throw fail("RECOVERY_REQUIRED");
  }

  return {
    async getRedactedOperation(operationId: string) {
      const { operation } = await operationForCurrentActor(operationId);
      return operation;
    },

    async start(input: {
      operationId: string;
      password: string;
      targetEmail: string;
    }) {
      const targetEmail = email(input.targetEmail);
      const { evidence, operation } = await operationForCurrentActor(
        input.operationId,
      );
      if (operation.status !== "prepared") throw fail("INVALID_OPERATION");

      const currentUser = await dependencies.auth.getUser(
        operation.targetUserId,
      );
      if (currentUser.userId !== operation.targetUserId) {
        throw fail("IDENTITY_MISMATCH");
      }
      let passwordEvidence;
      try {
        passwordEvidence = await dependencies.auth.verifyPassword({
          email: currentUser.email,
          password: input.password,
        });
      } catch {
        throw fail("PASSWORD_REJECTED");
      }
      if (passwordEvidence.userId !== operation.targetUserId) {
        throw fail("IDENTITY_MISMATCH");
      }

      const emailFingerprint = fingerprint(
        dependencies.emailHmacSecret,
        dependencies.emailHmacContext,
        targetEmail,
      );
      const bound = await dependencies.binding.bind({
        emailFingerprint,
        operationId: operation.operationId,
        passwordEvidence,
        targetUserId: operation.targetUserId,
      });

      let currentCredential: EmailChangeCredential;
      let newCredential: EmailChangeCredential;
      try {
        currentCredential =
          await dependencies.auth.generateEmailChangeCredential({
            currentEmail: currentUser.email,
            newEmail: targetEmail,
            type: "email_change_current",
          });
        newCredential = await dependencies.auth.generateEmailChangeCredential({
          currentEmail: currentUser.email,
          newEmail: targetEmail,
          type: "email_change_new",
        });
      } catch {
        return recovery(
          bound,
          evidence,
          emailFingerprint,
          "ARM_GENERATION_UNCERTAIN",
        );
      }
      if (
        currentCredential.userId !== operation.targetUserId ||
        newCredential.userId !== operation.targetUserId
      ) {
        return recovery(
          bound,
          evidence,
          emailFingerprint,
          "GENERATED_UID_MISMATCH",
        );
      }

      try {
        const currentVerification =
          await dependencies.auth.verifyEmailChangeOtp({
            email: currentUser.email,
            otp: currentCredential.emailOtp,
            retainAccessTokenForGlobalRevocation: false,
          });
        if (currentVerification.kind !== "first_confirmation_accepted") {
          throw fail("IDENTITY_MISMATCH");
        }
        const authoritative = await dependencies.auth.getUser(
          operation.targetUserId,
        );
        const originalIdentity = currentUser.identities[0];
        const confirmedIdentity = authoritative.identities[0];
        if (
          authoritative.userId !== operation.targetUserId ||
          authoritative.email !== currentUser.email ||
          authoritative.newEmail !== targetEmail ||
          (authoritative.emailChangeConfirmStatus !== null &&
            authoritative.emailChangeConfirmStatus !== 1) ||
          currentUser.identities.length !== 1 ||
          authoritative.identities.length !== 1 ||
          !originalIdentity ||
          !confirmedIdentity ||
          originalIdentity.email !== currentUser.email ||
          confirmedIdentity.email !== currentUser.email ||
          confirmedIdentity.identityId !== originalIdentity.identityId
        ) {
          throw fail("IDENTITY_MISMATCH");
        }
      } catch {
        newCredential.emailOtp = "";
        return recovery(
          bound,
          evidence,
          emailFingerprint,
          "CURRENT_ARM_UNCERTAIN",
        );
      } finally {
        currentCredential.emailOtp = "";
      }

      let currentConfirmed: SuperAdminEmailBindingOperation;
      try {
        currentConfirmed = await dependencies.binding.advance({
          emailFingerprint,
          expectedStatus: "bound",
          nextStatus: "current_confirmed",
          operationId: operation.operationId,
          sessionId: evidence.sessionId,
        });
      } catch {
        return recovery(
          bound,
          evidence,
          emailFingerprint,
          "LEDGER_ADVANCE_AFTER_CURRENT_CONFIRMATION",
        );
      }

      try {
        await dependencies.sender.sendNewEmailOtp({
          email: targetEmail,
          operationId: operation.operationId,
          otp: newCredential.emailOtp,
        });
      } catch {
        return recovery(
          currentConfirmed,
          evidence,
          emailFingerprint,
          "NEW_ARM_DELIVERY_FAILED",
        );
      } finally {
        newCredential.emailOtp = "";
      }

      try {
        return await dependencies.binding.advance({
          emailFingerprint,
          expectedStatus: "current_confirmed",
          nextStatus: "new_email_sent",
          operationId: operation.operationId,
          sessionId: evidence.sessionId,
        });
      } catch {
        return recovery(
          currentConfirmed,
          evidence,
          emailFingerprint,
          "LEDGER_ADVANCE_AFTER_NEW_ARM_DELIVERY",
        );
      }
    },

    async verifyNewEmail(input: {
      operationId: string;
      otp: string;
      targetEmail: string;
    }) {
      const targetEmail = email(input.targetEmail);
      const emailFingerprint = fingerprint(
        dependencies.emailHmacSecret,
        dependencies.emailHmacContext,
        targetEmail,
      );
      const { evidence, operation } = await operationForCurrentActor(
        input.operationId,
      );
      if (operation.status !== "new_email_sent") {
        throw fail("INVALID_OPERATION");
      }
      await dependencies.binding.assertContext({
        emailFingerprint,
        expectedStatus: "new_email_sent",
        operationId: operation.operationId,
        sessionId: evidence.sessionId,
      });

      let verified: VerifiedEmailChange | null = null;
      try {
        const result = await dependencies.auth.verifyEmailChangeOtp({
          email: targetEmail,
          otp: otp(input.otp),
          retainAccessTokenForGlobalRevocation: true,
        });
        if (result.kind !== "session") throw fail("OTP_REJECTED");
        verified = result;
      } catch {
        let authoritative: AuthoritativeBindingUser;
        try {
          authoritative = await dependencies.auth.getUser(
            operation.targetUserId,
          );
        } catch {
          return recovery(
            operation,
            evidence,
            emailFingerprint,
            "OTP_AUTHORITY_UNAVAILABLE",
          );
        }
        if (
          !finalIdentityMatches(
            authoritative,
            operation.targetUserId,
            targetEmail,
          )
        ) {
          throw fail("OTP_REJECTED");
        }
        await dependencies.binding.markRecoveryRequired({
          emailFingerprint,
          operationId: operation.operationId,
          reasonCode: "OTP_RESULT_UNCERTAIN",
          sessionId: evidence.sessionId,
        });
      }
      if (verified && verified.userId !== operation.targetUserId) {
        return recovery(
          operation,
          evidence,
          emailFingerprint,
          "VERIFIED_UID_MISMATCH",
        );
      }

      let authoritative: AuthoritativeBindingUser;
      try {
        authoritative = await dependencies.auth.getUser(operation.targetUserId);
      } catch {
        return recovery(
          operation,
          evidence,
          emailFingerprint,
          "FINAL_AUTHORITY_UNAVAILABLE",
        );
      }
      if (
        !finalIdentityMatches(
          authoritative,
          operation.targetUserId,
          targetEmail,
        )
      ) {
        return recovery(
          operation,
          evidence,
          emailFingerprint,
          "IDENTITY_CHANGE_NOT_AUTHORITATIVE",
        );
      }

      let identityChanged: SuperAdminEmailBindingOperation;
      try {
        identityChanged = await dependencies.binding.advance({
          emailFingerprint,
          expectedStatus: verified ? "new_email_sent" : "recovery_required",
          nextStatus: "identity_changed",
          operationId: operation.operationId,
          sessionId: evidence.sessionId,
        });
      } catch {
        await dependencies.binding.markRecoveryRequired({
          emailFingerprint,
          operationId: operation.operationId,
          reasonCode: "LEDGER_ADVANCE_AFTER_AUTH_SUCCESS",
          sessionId: evidence.sessionId,
        });
        identityChanged = await dependencies.binding.advance({
          emailFingerprint,
          expectedStatus: "recovery_required",
          nextStatus: "identity_changed",
          operationId: operation.operationId,
          sessionId: evidence.sessionId,
        });
      }

      try {
        if (verified) {
          await dependencies.auth.revokeAllSessions(verified.accessToken);
          verified.accessToken = "";
        } else {
          await dependencies.revokeCurrentActorSessions();
        }
        return await dependencies.binding.beginReauth({
          emailFingerprint,
          operationId: identityChanged.operationId,
          originalSessionId: evidence.sessionId,
        });
      } catch {
        if (verified) verified.accessToken = "";
        return recovery(
          identityChanged,
          evidence,
          emailFingerprint,
          "SESSION_REVOCATION_UNCONFIRMED",
        );
      }
    },

    async complete(input: {
      operationId: string;
      password: string;
      protectedAdminReadVerified: boolean;
      targetEmail: string;
    }) {
      const targetEmail = email(input.targetEmail);
      const { operation } = await operationForCurrentActor(input.operationId);
      if (operation.status !== "awaiting_reauth") {
        throw fail("INVALID_OPERATION");
      }
      const authoritative = await dependencies.auth.getUser(
        operation.targetUserId,
      );
      if (
        !finalIdentityMatches(
          authoritative,
          operation.targetUserId,
          targetEmail,
        )
      ) {
        throw fail("IDENTITY_MISMATCH");
      }
      let passwordEvidence;
      try {
        passwordEvidence = await dependencies.auth.verifyPassword({
          email: targetEmail,
          password: input.password,
        });
      } catch {
        throw fail("PASSWORD_REJECTED");
      }
      if (passwordEvidence.userId !== operation.targetUserId) {
        throw fail("IDENTITY_MISMATCH");
      }
      return dependencies.binding.complete({
        emailFingerprint: fingerprint(
          dependencies.emailHmacSecret,
          dependencies.emailHmacContext,
          targetEmail,
        ),
        operationId: operation.operationId,
        passwordEvidence,
        protectedAdminReadVerified: input.protectedAdminReadVerified,
      });
    },
  };
}

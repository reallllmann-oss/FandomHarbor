import "server-only";

import {
  createServerAuthProvider,
  type AuthCookieMutation,
} from "@fandom-harbor/auth";
import {
  createServerSupabaseClient,
  createSuperAdminEmailBindingRepository,
  type SuperAdminEmailBindingDataSource,
} from "@fandom-harbor/database";
import { createSuperAdminEmailBindingService } from "@fandom-harbor/services";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  BindingOrchestratorError,
  createSuperAdminEmailBindingOrchestrator,
  type AuthoritativeBindingUser,
  type MigrationOnlyEmailSender,
  type SuperAdminEmailBindingAuthGateway,
} from "./super-admin-email-binding-orchestrator";
import {
  b3SaTargetSetsMatch,
  isB3SaEmailBindingFeatureEnabled,
  resolveB3SaRuntimeBoundary,
} from "./super-admin-email-binding-boundary";

const commonConfigSchema = z.object({
  B3_SA_EMAIL_BINDING_ENABLED: z.literal("true"),
  B3_SA_EMAIL_HMAC_SECRET: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  SUPABASE_SECRET_KEY: z.string().min(1),
});
const localConfigSchema = commonConfigSchema.extend({
  B3_SA_LOCAL_SENDER_TOKEN: z.string().min(32),
  B3_SA_LOCAL_SENDER_URL: z.url(),
});
const previewConfigSchema = commonConfigSchema.extend({
  B3_SA_PREVIEW_SENDER_API_KEY: z.string().min(20),
});

const uuidSchema = z.uuid();
const operationIdSchema = z.uuid();
const authIdentitySchema = z.object({
  email: z.string().email().optional(),
  id: z.string().optional(),
  identity_data: z
    .object({ email: z.string().email().optional() })
    .passthrough()
    .optional(),
  identity_id: z.string().optional(),
  provider: z.string(),
});
const adminUserSchema = z.object({
  email: z.email(),
  email_change_confirm_status: z.number().int().min(0).default(0),
  id: z.uuid(),
  identities: z.array(authIdentitySchema).default([]),
  new_email: z.email().nullable().optional(),
});
const sessionResponseSchema = z.object({
  access_token: z.string().min(1),
  user: z.object({ id: z.uuid() }),
});
const generatedLinkSchema = z.object({
  properties: z.object({ email_otp: z.string().min(1) }),
  user: z.object({ id: z.uuid() }),
});

function safeLocalSenderUrl(value: string): URL {
  const url = new URL(value);
  const allowedHosts = new Set(["127.0.0.1", "::1", "[::1]", "localhost"]);
  if (url.protocol !== "http:" || !allowedHosts.has(url.hostname)) {
    throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  }
  return url;
}

async function json(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function secretHeaders(secret: string) {
  return {
    apikey: secret,
    authorization: `Bearer ${secret}`,
    "content-type": "application/json",
  };
}

function createDataSource(input: {
  secret: string;
  transport: typeof fetch;
  url: string;
}): SuperAdminEmailBindingDataSource {
  async function rpc(name: string, parameters: Record<string, unknown>) {
    const response = await input.transport(`${input.url}/rest/v1/rpc/${name}`, {
      body: JSON.stringify(parameters),
      headers: secretHeaders(input.secret),
      method: "POST",
    });
    const body = await json(response);
    if (!response.ok) throw new Error(`B3-SA RPC unavailable: ${name}`);
    return body;
  }

  return {
    advance: (parameters) =>
      rpc("advance_super_admin_email_binding_v1", parameters),
    assertContext: (parameters) =>
      rpc("assert_super_admin_email_binding_context_v1", parameters),
    beginReauth: (parameters) =>
      rpc("begin_super_admin_email_binding_reauth_v1", parameters),
    bind: (parameters) => rpc("bind_super_admin_email_binding_v1", parameters),
    complete: (parameters) =>
      rpc("complete_super_admin_email_binding_v1", parameters),
    get: (parameters) =>
      rpc("get_super_admin_email_binding_operation_v1", parameters),
    getAllowedTargets: () =>
      rpc("get_super_admin_email_binding_targets_v1", {}),
    markRecoveryRequired: (parameters) =>
      rpc("mark_super_admin_email_binding_recovery_v1", parameters),
    prepare: (parameters) =>
      rpc("prepare_super_admin_email_binding_v1", parameters),
    terminate: (parameters) =>
      rpc("terminate_super_admin_email_binding_v1", parameters),
  };
}

function createAuthGateway(input: {
  publishableKey: string;
  secret: string;
  transport: typeof fetch;
  url: string;
}): SuperAdminEmailBindingAuthGateway {
  const publicHeaders = secretHeaders(input.publishableKey);
  const serviceHeaders = secretHeaders(input.secret);

  async function localSignOut(accessToken: string) {
    const response = await input.transport(
      `${input.url}/auth/v1/logout?scope=local`,
      {
        headers: { ...publicHeaders, authorization: `Bearer ${accessToken}` },
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Temporary Auth session cleanup failed");
  }

  return {
    async generateEmailChangeCredential(parameters) {
      const response = await input.transport(
        `${input.url}/auth/v1/admin/generate_link`,
        {
          body: JSON.stringify({
            email: parameters.currentEmail,
            new_email: parameters.newEmail,
            type: parameters.type,
          }),
          headers: serviceHeaders,
          method: "POST",
        },
      );
      const parsed = generatedLinkSchema.safeParse(await json(response));
      if (!response.ok || !parsed.success) {
        throw new Error("Email-change credential generation failed");
      }
      return {
        emailOtp: parsed.data.properties.email_otp,
        userId: parsed.data.user.id,
      };
    },

    async getUser(userId) {
      const parsedUserId = uuidSchema.parse(userId);
      const response = await input.transport(
        `${input.url}/auth/v1/admin/users/${parsedUserId}`,
        { headers: serviceHeaders },
      );
      const parsed = adminUserSchema.safeParse(await json(response));
      if (!response.ok || !parsed.success) {
        throw new Error("Authoritative Auth user read failed");
      }
      const identities = parsed.data.identities
        .filter((identity) => identity.provider === "email")
        .map((identity) => {
          const email = identity.email ?? identity.identity_data?.email;
          const identityId = identity.identity_id ?? identity.id;
          if (!email || !identityId) {
            throw new Error("Authoritative email identity is incomplete");
          }
          return {
            email: email.toLowerCase(),
            identityId,
            provider: "email" as const,
          };
        });
      return {
        email: parsed.data.email.toLowerCase(),
        emailChangeConfirmStatus: parsed.data.email_change_confirm_status,
        identities,
        newEmail: parsed.data.new_email?.toLowerCase() ?? null,
        userId: parsed.data.id,
      } satisfies AuthoritativeBindingUser;
    },

    async revokeAllSessions(accessToken) {
      const response = await input.transport(
        `${input.url}/auth/v1/logout?scope=global`,
        {
          headers: { ...publicHeaders, authorization: `Bearer ${accessToken}` },
          method: "POST",
        },
      );
      if (!response.ok)
        throw new Error("Global Auth session revocation failed");
    },

    async verifyEmailChangeOtp(parameters) {
      const response = await input.transport(`${input.url}/auth/v1/verify`, {
        body: JSON.stringify({
          email: parameters.email,
          token: parameters.otp,
          type: "email_change",
        }),
        headers: publicHeaders,
        method: "POST",
      });
      const parsed = sessionResponseSchema.safeParse(await json(response));
      if (!response.ok || !parsed.success) {
        throw new Error("Email-change OTP verification failed");
      }
      if (!parameters.retainAccessTokenForGlobalRevocation) {
        await localSignOut(parsed.data.access_token);
        return { accessToken: "", userId: parsed.data.user.id };
      }
      return {
        accessToken: parsed.data.access_token,
        userId: parsed.data.user.id,
      };
    },

    async verifyPassword(parameters) {
      const response = await input.transport(
        `${input.url}/auth/v1/token?grant_type=password`,
        {
          body: JSON.stringify(parameters),
          headers: publicHeaders,
          method: "POST",
        },
      );
      const parsed = sessionResponseSchema.safeParse(await json(response));
      if (!response.ok || !parsed.success) {
        throw new Error("Password reauthentication failed");
      }
      await localSignOut(parsed.data.access_token);
      return {
        authenticatedAtEpochSeconds: Math.floor(Date.now() / 1_000),
        userId: parsed.data.user.id,
      };
    },
  };
}

function createLocalSender(input: {
  senderToken: string;
  senderUrl: string;
  transport: typeof fetch;
}): MigrationOnlyEmailSender {
  const senderUrl = safeLocalSenderUrl(input.senderUrl);
  return {
    async sendNewEmailOtp(parameters) {
      const response = await input.transport(senderUrl, {
        body: JSON.stringify({
          email: parameters.email,
          otp: parameters.otp,
          template: "super-admin-email-binding-new-address-v1",
        }),
        headers: {
          authorization: `Bearer ${input.senderToken}`,
          "content-type": "application/json",
        },
        method: "POST",
      });
      if (!response.ok) throw new Error("Local migration-only sender failed");
    },
  };
}

function createPreviewSender(input: {
  apiKey: string;
  transport: typeof fetch;
}): MigrationOnlyEmailSender {
  return {
    async sendNewEmailOtp(parameters) {
      const response = await input.transport("https://api.resend.com/emails", {
        body: JSON.stringify({
          from: "Fandom Harbor <no-reply@preview-auth.fandomharbor.com>",
          subject: "Fandom Harbor Super Admin 邮箱验证",
          text: `您的 6 位邮箱验证码是：${parameters.otp}\n\n验证码仅用于本次受控 Preview 身份迁移，请勿转发。`,
          to: [parameters.email],
        }),
        headers: {
          authorization: `Bearer ${input.apiKey}`,
          "content-type": "application/json",
          "idempotency-key": `b3-sa-${parameters.operationId}`,
        },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Preview migration-only sender failed");
      }
    },
  };
}

export { isB3SaEmailBindingFeatureEnabled };

export async function createB3Sa2Runtime(
  environment: Record<string, string | undefined> = process.env,
  transport: typeof fetch = fetch,
) {
  const boundary = resolveB3SaRuntimeBoundary(environment);
  if (!boundary) {
    throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  }
  const parsed = (
    boundary.mode === "local" ? localConfigSchema : previewConfigSchema
  ).safeParse(environment);
  if (!parsed.success) {
    throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  }
  const config = parsed.data;
  const cookieStore = await cookies();
  const cookieAdapter = {
    getAll: () => cookieStore.getAll(),
    setAll(mutations: AuthCookieMutation[]) {
      for (const { name, options, value } of mutations) {
        cookieStore.set(name, value, options);
      }
    },
  };
  const serverAuth = createServerAuthProvider(config, cookieAdapter);
  const supabase = createServerSupabaseClient(config, cookieAdapter);
  const operations = createSuperAdminEmailBindingRepository(
    createDataSource({
      secret: config.SUPABASE_SECRET_KEY,
      transport,
      url: boundary.supabaseUrl,
    }),
  );
  const databaseTargetUserIds = await operations.getAllowedTargetUserIds();
  if (
    !b3SaTargetSetsMatch(boundary.allowedTargetUserIds, databaseTargetUserIds)
  ) {
    throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  }
  const binding = createSuperAdminEmailBindingService({
    auth: serverAuth,
    clock: { now: () => new Date() },
    operations,
  });
  const auth = createAuthGateway({
    publishableKey: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secret: config.SUPABASE_SECRET_KEY,
    transport,
    url: boundary.supabaseUrl,
  });
  const sender =
    boundary.mode === "local"
      ? createLocalSender({
          senderToken: (config as z.infer<typeof localConfigSchema>)
            .B3_SA_LOCAL_SENDER_TOKEN,
          senderUrl: (config as z.infer<typeof localConfigSchema>)
            .B3_SA_LOCAL_SENDER_URL,
          transport,
        })
      : createPreviewSender({
          apiKey: (config as z.infer<typeof previewConfigSchema>)
            .B3_SA_PREVIEW_SENDER_API_KEY,
          transport,
        });

  return {
    auth,
    binding,
    orchestrator: createSuperAdminEmailBindingOrchestrator({
      allowedTargetUserIds: boundary.allowedTargetUserIds,
      auth,
      binding,
      emailHmacContext: boundary.supabaseProjectRef,
      emailHmacSecret: config.B3_SA_EMAIL_HMAC_SECRET,
      getTrustedAuthEvidence: () => serverAuth.getTrustedAuthEvidence(),
      async revokeCurrentActorSessions() {
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) throw new Error("Global Auth session revocation failed");
      },
      sender,
    }),
    serverAuth,
    supabase,
  };
}

export function parseOperationId(value: string) {
  return operationIdSchema.parse(value);
}

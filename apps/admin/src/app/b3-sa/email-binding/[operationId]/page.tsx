import { notFound, redirect } from "next/navigation";

import {
  createB3Sa2Runtime,
  isB3SaEmailBindingFeatureEnabled,
  parseOperationId,
} from "../../../../lib/super-admin-email-binding-runtime";
import {
  completeBindingAction,
  startBindingAction,
  verifyFreshTotpAction,
  verifyNewEmailAction,
} from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  AUTH_STATE_UNAVAILABLE: "认证状态暂时无法核验，操作未推进。",
  DELIVERY_FAILED: "本地迁移邮件发送失败，操作已停止。",
  IDENTITY_MISMATCH: "当前身份与获批操作不一致。",
  INVALID_OPERATION: "操作当前状态不允许执行此步骤。",
  INVALID_REQUEST: "提交内容不符合安全要求。",
  OTP_REJECTED: "验证码无效或已过期，操作未推进。",
  PASSWORD_REJECTED: "当前密码重新验证失败。",
  RECOVERY_REQUIRED: "外部身份结果需要人工核对，禁止自动重试。",
  completed: "邮箱绑定已完成，独立重新登录与高权限读取均已通过。",
  new_email_sent: "新邮箱验证码已交给本地迁移专用发送器。",
  totp_verified: "TOTP 已完成，请在五分钟内继续本人密码验证。",
};

function Field(props: {
  autoComplete?: string;
  inputMode?: "email" | "numeric" | "text";
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {props.label}
      <input
        autoComplete={props.autoComplete}
        className="min-h-11 rounded-control border border-border bg-background px-3"
        inputMode={props.inputMode}
        name={props.name}
        required
        type={props.type ?? "text"}
      />
    </label>
  );
}

export default async function SuperAdminEmailBindingPage({
  params,
  searchParams,
}: {
  params: Promise<{ operationId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  if (!isB3SaEmailBindingFeatureEnabled()) notFound();
  const operationId = parseOperationId((await params).operationId);
  const result = (await searchParams).status;
  let runtime;
  let operation;
  try {
    runtime = await createB3Sa2Runtime();
    operation = await runtime.orchestrator.getRedactedOperation(operationId);
  } catch {
    redirect("/auth/sign-in?error=forbidden");
  }
  const { data: factorData } = await runtime.supabase.auth.mfa.listFactors();
  const factors = (factorData?.totp ?? []).filter(
    (factor) => factor.status === "verified",
  );
  const needsFreshAuth = ["prepared", "awaiting_reauth"].includes(
    operation.status,
  );

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <section className="hero-panel">
        <p className="eyebrow">B3-SA · 本地受控流程</p>
        <h1 className="mt-3 text-3xl font-semibold">
          Super Admin 真实邮箱绑定
        </h1>
        <p className="mt-4 text-muted-foreground">
          此页面不在管理导航中，仅接受已批准的单次
          Operation。页面不会展示邮箱、验证码、密码或原生 Auth Token。
        </p>
      </section>

      {result && messages[result] ? (
        <p
          className="rounded-control border border-border bg-surface-muted p-4"
          role={
            result.includes("FAILED") || result.includes("REJECTED")
              ? "alert"
              : "status"
          }
        >
          {messages[result]}
        </p>
      ) : null}

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">脱敏状态</h2>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Operation</dt>
            <dd className="font-mono">…{operation.operationId.slice(-8)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>目标 UID</dt>
            <dd className="font-mono">…{operation.targetUserId.slice(-8)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>状态</dt>
            <dd>{operation.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>截止</dt>
            <dd>
              {new Date(operation.expiresAtEpochSeconds * 1_000).toLocaleString(
                "zh-CN",
              )}
            </dd>
          </div>
        </dl>
      </section>

      {needsFreshAuth ? (
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">Fresh TOTP</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            每次状态推进仍会重新核对可信 Claims、UID、Session 和操作状态。
          </p>
          <form
            action={verifyFreshTotpAction.bind(null, operationId)}
            className="mt-4 grid gap-4"
          >
            <label className="grid gap-2 text-sm font-medium">
              已验证 TOTP 因子
              <select
                className="min-h-11 rounded-control border border-border bg-background px-3"
                name="factorId"
                required
              >
                {factors.map((factor) => (
                  <option key={factor.id} value={factor.id}>
                    {factor.friendly_name || `因子 …${factor.id.slice(-6)}`}
                  </option>
                ))}
              </select>
            </label>
            <Field
              autoComplete="one-time-code"
              label="6 位 TOTP"
              name="code"
              inputMode="numeric"
            />
            <button
              className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground"
              type="submit"
            >
              完成 fresh TOTP
            </button>
          </form>
        </section>
      ) : null}

      {operation.status === "prepared" ? (
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">绑定并发送新邮箱 OTP</h2>
          <form
            action={startBindingAction.bind(null, operationId)}
            className="mt-4 grid gap-4"
          >
            <Field
              autoComplete="email"
              label="目标真实邮箱"
              name="targetEmail"
              type="email"
            />
            <Field
              autoComplete="current-password"
              label="本人当前密码"
              name="password"
              type="password"
            />
            <button
              className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground"
              type="submit"
            >
              开始受控绑定
            </button>
          </form>
        </section>
      ) : null}

      {operation.status === "new_email_sent" ? (
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">验证新邮箱</h2>
          <form
            action={verifyNewEmailAction.bind(null, operationId)}
            className="mt-4 grid gap-4"
          >
            <Field
              autoComplete="email"
              label="目标真实邮箱（再次绑定核对）"
              name="targetEmail"
              type="email"
            />
            <Field
              autoComplete="one-time-code"
              label="新邮箱原生 6 位 OTP"
              name="otp"
              inputMode="numeric"
            />
            <button
              className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground"
              type="submit"
            >
              验证并撤销所有旧 Session
            </button>
          </form>
        </section>
      ) : null}

      {operation.status === "awaiting_reauth" ? (
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">独立重新认证</h2>
          <form
            action={completeBindingAction.bind(null, operationId)}
            className="mt-4 grid gap-4"
          >
            <Field
              autoComplete="email"
              label="已生效的新邮箱"
              name="targetEmail"
              type="email"
            />
            <Field
              autoComplete="current-password"
              label="本人当前密码"
              name="password"
              type="password"
            />
            <button
              className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground"
              type="submit"
            >
              完成连续性验收
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

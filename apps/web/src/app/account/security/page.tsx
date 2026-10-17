import { MIN_PASSWORD_LENGTH } from "@fandom-harbor/auth";
import { PasswordInput } from "@fandom-harbor/ui";
import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../../lib/identity-access";
import {
  confirmEmailChange,
  requestEmailChange,
  updatePassword,
} from "../../auth/actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  "current-password": "当前密码不正确。",
  email: "请输入有效的新邮箱和当前密码。",
  "email-code": "邮箱验证码无效或已过期。",
  "email-update": "邮箱变更暂时无法提交，请稍后再试。",
  "legacy-email":
    "该账号仍使用旧版内部邮箱，需要在 Package B3 完成安全迁移后再绑定真实邮箱。",
  password: "两次输入的新密码不一致或不符合密码要求。",
  "password-update": "密码暂时无法更新，请稍后再试。",
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in?next=/account/security");
  const query = await searchParams;
  const recovering = query.status === "recovery";

  return (
    <section className="reading-card mx-auto max-w-2xl">
      <p className="text-sm font-medium text-primary">账号安全</p>
      <h1 className="mt-3 text-3xl font-semibold">密码与邮箱</h1>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errors[query.error] ?? "操作失败，请稍后再试。"}
        </p>
      ) : null}
      {query.status === "password-updated" ? (
        <p className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm">
          密码已更新，其他设备的会话已退出。
        </p>
      ) : null}
      {query.status === "email-change-sent" ? (
        <p
          className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm"
          role="status"
        >
          邮箱变更请求已受理。如果邮件正常发送，请分别检查旧邮箱和新邮箱（含垃圾邮件），并按提示完成双重确认。
        </p>
      ) : null}
      {query.status === "email-change-pending" ||
      query.status === "email-confirmed" ? (
        <p
          className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm"
          role="status"
        >
          当前邮箱已验证，请继续完成另一封邮件中的验证码。
        </p>
      ) : null}
      {query.status === "email-change-complete" ? (
        <p
          className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm"
          role="status"
        >
          邮箱变更成功，新邮箱已生效。
        </p>
      ) : null}
      {query.status === "email-change-status-unknown" ? (
        <p
          className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm"
          role="status"
        >
          本次邮箱确认已被认证服务受理，但暂时无法确认整体变更状态。请刷新页面并检查当前邮箱，避免重复提交。
        </p>
      ) : null}

      <form action={updatePassword} className="mt-8 space-y-5">
        <h2 className="text-xl font-semibold">
          {recovering ? "设置新密码" : "修改密码"}
        </h2>
        {!recovering ? (
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="current-password"
            >
              当前密码
            </label>
            <PasswordInput
              autoComplete="current-password"
              id="current-password"
              name="currentPassword"
              required
            />
          </div>
        ) : null}
        <div>
          <label className="block text-sm font-medium" htmlFor="new-password">
            新密码（至少 {MIN_PASSWORD_LENGTH} 位）
          </label>
          <PasswordInput
            autoComplete="new-password"
            id="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            name="password"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="new-password-confirmation"
          >
            再次输入新密码
          </label>
          <PasswordInput
            autoComplete="new-password"
            id="new-password-confirmation"
            minLength={MIN_PASSWORD_LENGTH}
            name="passwordConfirmation"
            required
          />
        </div>
        <button
          className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          保存新密码
        </button>
      </form>

      <form
        action={requestEmailChange}
        className="mt-10 space-y-5 border-t border-border pt-8"
      >
        <h2 className="text-xl font-semibold">更换邮箱</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          仅适用于已绑定真实邮箱的普通账号。旧版内部邮箱账号将在 B3
          使用独立迁移流程。
        </p>
        <label className="block text-sm font-medium">
          新邮箱
          <input
            autoComplete="email"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="email"
            required
            type="email"
          />
        </label>
        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="email-current-password"
          >
            当前密码
          </label>
          <PasswordInput
            autoComplete="current-password"
            id="email-current-password"
            name="currentPassword"
            required
          />
        </div>
        <button
          className="min-h-11 rounded-control border border-border px-4"
          type="submit"
        >
          发送邮箱变更验证
        </button>
      </form>

      <form
        action={confirmEmailChange}
        className="mt-6 space-y-5 border-t border-border pt-6"
      >
        <h2 className="text-xl font-semibold">确认邮箱验证码</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          双重确认开启时，旧邮箱和新邮箱会分别收到验证码。请使用收到该验证码的邮箱逐一提交。
        </p>
        <label className="block text-sm font-medium">
          收到验证码的邮箱
          <input
            autoComplete="email"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-sm font-medium">
          6 位验证码
          <input
            autoComplete="one-time-code"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3 font-mono tracking-[0.3em]"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            name="token"
            pattern="[0-9]{6}"
            required
          />
        </label>
        <button
          className="min-h-11 rounded-control border border-border px-4"
          type="submit"
        >
          确认验证码
        </button>
      </form>
    </section>
  );
}

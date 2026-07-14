import Link from "next/link";
import {
  MAX_REGISTRATION_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@fandom-harbor/auth";

import { signUp } from "../actions";

export const dynamic = "force-dynamic";

const registrationErrorMessages: Record<string, string> = {
  configuration:
    "注册服务尚未完成配置，请联系管理员检查数据库 Migration 与 Auth 设置。",
  invitation: "邀请码无效，请检查后重新输入。",
  "invitation-exhausted": "邀请码已用完，请向邀请人申请新的邀请码。",
  "invitation-expired": "邀请码已过期，请向邀请人申请新的邀请码。",
  "invitation-revoked": "邀请码已被撤销，请向邀请人确认。",
  "name-taken": "该注册名已被使用，请更换注册名。",
  password: `密码不符合要求，请输入 ${MIN_PASSWORD_LENGTH}–128 位字符。`,
  "rate-limited": "注册请求过于频繁，请稍后再试。",
  "registration-name": `注册名格式无效，请输入 1–${MAX_REGISTRATION_NAME_LENGTH} 位可见字符。`,
  "service-unavailable": "注册服务暂时不可用，请稍后重试或联系管理员。",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">门禁注册</p>
      <h1 className="mt-3 text-3xl font-semibold">创建门禁账号</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        使用注册名、密码和有效邀请码创建账号。邀请码只开放 Reader 门禁，不会授予
        Author 或管理员权限。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {registrationErrorMessages[query.error] ??
            "注册失败，错误类型无法识别。请记录当前页面并联系管理员。"}
        </p>
      ) : null}
      <form action={signUp} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          注册名
          <input
            autoComplete="username"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            maxLength={MAX_REGISTRATION_NAME_LENGTH}
            name="registrationName"
            required
            type="text"
          />
        </label>
        <label className="block text-sm font-medium">
          密码（至少 {MIN_PASSWORD_LENGTH} 位）
          <input
            autoComplete="new-password"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            minLength={MIN_PASSWORD_LENGTH}
            name="password"
            required
            type="password"
          />
        </label>
        <label className="block text-sm font-medium">
          邀请码
          <input
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3 font-mono"
            name="invitationCode"
            required
            type="password"
          />
        </label>
        <button
          className="min-h-11 w-full rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          创建账号
        </button>
      </form>
      <p className="mt-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <span>已有账号？</span>
        <Link
          className="inline-flex min-h-11 items-center rounded-control px-2 text-primary"
          href="/auth/sign-in"
        >
          返回登录
        </Link>
      </p>
    </section>
  );
}

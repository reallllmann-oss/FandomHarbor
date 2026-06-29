import Link from "next/link";

import { signUp } from "../actions";

export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">Phase 1 · Identity</p>
      <h1 className="mt-3 text-3xl font-semibold">创建门禁账号</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        创建账号不会自动进入归档，也不会授予作者或管理员权限。邮箱验证后仍需兑换有效邀请码。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          创建账号失败。请检查输入或稍后重试。
        </p>
      ) : null}
      <form action={signUp} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          邮箱
          <input
            autoComplete="email"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-sm font-medium">
          密码（至少 12 位）
          <input
            autoComplete="new-password"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            minLength={12}
            name="password"
            required
            type="password"
          />
        </label>
        <button
          className="min-h-11 w-full rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          创建并发送验证邮件
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        已有账号？ <Link href="/auth/sign-in">返回登录</Link>
      </p>
    </section>
  );
}

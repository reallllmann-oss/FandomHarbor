import Link from "next/link";

import { signIn } from "../actions";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">Phase 1 · Identity</p>
      <h1 className="mt-3 text-3xl font-semibold">登录 Fandom Harbor</h1>
      {query.status === "verify-email" ? (
        <p className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm">
          请先打开验证邮件，完成邮箱验证后再登录。
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          登录失败。请检查邮箱、密码和邮箱验证状态。
        </p>
      ) : null}
      <form action={signIn} className="mt-6 space-y-5">
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
          密码
          <input
            autoComplete="current-password"
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
          登录
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        还没有账号？ <Link href="/auth/sign-up">创建账号</Link>
      </p>
    </section>
  );
}

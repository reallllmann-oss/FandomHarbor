import Link from "next/link";
import { MIN_PASSWORD_LENGTH } from "@fandom-harbor/auth";

import { signIn } from "../actions";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; status?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">账号入口</p>
      <h1 className="mt-3 text-3xl font-semibold">登录 Fandom Harbor</h1>
      {query.status === "registered" ? (
        <p className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm">
          账号创建成功，请使用注册名登录。
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          登录失败。请检查注册名和密码。
        </p>
      ) : null}
      <form action={signIn} className="mt-6 space-y-5">
        {query.next ? (
          <input name="next" type="hidden" value={query.next} />
        ) : null}
        <label className="block text-sm font-medium">
          注册名
          <input
            autoComplete="username"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="registrationName"
            required
            type="text"
          />
        </label>
        <label className="block text-sm font-medium">
          密码
          <input
            autoComplete="current-password"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            minLength={MIN_PASSWORD_LENGTH}
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
      <p className="mt-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <span>还没有账号？</span>
        <Link
          className="inline-flex min-h-11 items-center rounded-control px-2 text-primary"
          href="/auth/sign-up"
        >
          创建账号
        </Link>
      </p>
    </section>
  );
}

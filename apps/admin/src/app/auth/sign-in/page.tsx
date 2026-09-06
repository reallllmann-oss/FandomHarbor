import { MIN_PASSWORD_LENGTH } from "@fandom-harbor/auth";
import { signIn } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="mx-auto max-w-lg rounded-card border border-border bg-surface p-6">
      <p className="text-sm font-medium text-primary">管理后台访问</p>
      <h1 className="mt-3 text-3xl font-semibold">管理员登录</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        仅成员资格正常的管理员与超级管理员可以进入。读者和作者凭据不会获得后台
        访问权。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {query.error === "forbidden"
            ? "该账号没有后台权限。"
            : "登录失败，请检查注册名和密码。"}
        </p>
      ) : null}
      <form action={signIn} className="mt-6 space-y-5">
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
          进入后台
        </button>
      </form>
    </section>
  );
}

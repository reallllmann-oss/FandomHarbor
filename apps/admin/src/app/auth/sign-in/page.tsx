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
      <p className="text-sm font-medium text-primary">Admin access</p>
      <h1 className="mt-3 text-3xl font-semibold">管理员登录</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        仅 active Admin 与 Super Admin 可以进入。Reader 和 Author
        凭据不会获得后台访问权。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {query.error === "forbidden"
            ? "该账号没有后台权限。"
            : "登录失败，请检查凭据和邮箱验证状态。"}
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
          进入后台
        </button>
      </form>
    </section>
  );
}

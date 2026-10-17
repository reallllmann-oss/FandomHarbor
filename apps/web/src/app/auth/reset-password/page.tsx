import { verifyPasswordRecovery } from "../actions";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const query = await searchParams;
  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">账号恢复</p>
      <h1 className="mt-3 text-3xl font-semibold">验证恢复验证码</h1>
      {query.status === "sent" ? (
        <p className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm">
          如果该注册名已绑定可投递邮箱，验证码已经发送。
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          注册名或验证码无效，请重新检查。
        </p>
      ) : null}
      <form action={verifyPasswordRecovery} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          注册名
          <input
            autoComplete="username"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="registrationName"
            required
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
          className="min-h-11 w-full rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          继续重置密码
        </button>
      </form>
    </section>
  );
}

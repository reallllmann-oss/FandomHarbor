import Link from "next/link";

import { requestPasswordReset } from "../actions";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">账号恢复</p>
      <h1 className="mt-3 text-3xl font-semibold">找回密码</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        输入注册名。如果账号已绑定可投递邮箱，我们会发送 6
        位验证码。无论账号是否存在，页面都会显示相同结果。
      </p>
      <form action={requestPasswordReset} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          注册名
          <input
            autoComplete="username"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
            name="registrationName"
            required
          />
        </label>
        <button
          className="min-h-11 w-full rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          发送验证码
        </button>
      </form>
      <Link
        className="mt-4 inline-flex min-h-11 items-center rounded-control px-2 text-primary"
        href="/auth/sign-in"
      >
        返回登录
      </Link>
    </section>
  );
}

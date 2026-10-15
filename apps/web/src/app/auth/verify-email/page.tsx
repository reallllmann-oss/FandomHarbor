import Link from "next/link";

import { resendRegistrationOtp, verifyRegistrationOtp } from "../actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  "attempt-expired": "本次注册预留已失效，请返回注册页重新开始。",
  "invalid-code": "验证码无效或已经过期，请检查后重试。",
  "rate-limited": "验证码尝试过于频繁，请稍后再试。",
  "resend-cooldown": "验证码刚刚发送，请稍后再尝试重发。",
  "resend-failed": "验证码暂时无法重发，请稍后再试。",
  "verification-failed": "验证暂时无法完成，请稍后再试。",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const query = await searchParams;
  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">邮箱验证</p>
      <h1 className="mt-3 text-3xl font-semibold">输入 6 位验证码</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        验证码已发送到你的注册邮箱，15 分钟内有效。重复发送不会延长邀请码的 2
        小时预留期限。
      </p>
      {query.status === "confirmation_delivery_deferred" ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          账号已创建，但邮件暂未送达。请稍后使用下方按钮重发。
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errors[query.error] ?? "验证请求失败，请稍后再试。"}
        </p>
      ) : null}
      <form action={verifyRegistrationOtp} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          邮箱验证码
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
          验证邮箱
        </button>
      </form>
      <form action={resendRegistrationOtp} className="mt-3">
        <button
          className="min-h-11 w-full rounded-control border border-border px-4"
          type="submit"
        >
          重新发送验证码
        </button>
      </form>
      <Link
        className="mt-4 inline-flex min-h-11 items-center rounded-control px-2 text-primary"
        href="/auth/sign-up"
      >
        返回注册
      </Link>
    </section>
  );
}

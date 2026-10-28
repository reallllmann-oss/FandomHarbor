import { notFound, redirect } from "next/navigation";

import {
  PreviewSessionError,
  previewSessionEnvironmentAllowed,
} from "../../../lib/preview-session-acceptance";
import { createPreviewSessionRuntime } from "../../../lib/preview-session-runtime";
import { endPreviewSession, verifyPreviewSessionTotp } from "./actions";

export const dynamic = "force-dynamic";

export default async function PreviewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!previewSessionEnvironmentAllowed(process.env)) notFound();
  let snapshot;
  try {
    snapshot = await (await createPreviewSessionRuntime()).snapshot();
  } catch (error) {
    if (
      error instanceof PreviewSessionError &&
      ["UNAUTHENTICATED", "NEW_LOGIN_REQUIRED"].includes(error.code)
    )
      redirect("/auth/sign-in");
    notFound();
  }
  const query = await searchParams;
  return (
    <section className="mx-auto grid max-w-lg gap-6 rounded-card border border-border bg-surface p-6">
      <h1 className="text-2xl font-semibold">本人登录与双重验证</h1>
      <p>此入口仅供获批的 Preview 账号验收，不会执行邮箱绑定或更改权限。</p>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt>账号</dt>
          <dd>{snapshot.registrationName}</dd>
        </div>
        <div>
          <dt>身份</dt>
          <dd>…{snapshot.userId.slice(-8)}</dd>
        </div>
        <div>
          <dt>本次会话</dt>
          <dd>…{snapshot.sessionId.slice(-8)}</dd>
        </div>
        <div>
          <dt>验证等级</dt>
          <dd>{snapshot.assuranceLevel}</dd>
        </div>
        <div>
          <dt>成员及超级管理员权限</dt>
          <dd>PASS</dd>
        </div>
        <div>
          <dt>Fresh TOTP</dt>
          <dd>{snapshot.mfaVerified ? "PASS" : "待本人验证"}</dd>
        </div>
        <div>
          <dt>受保护 Admin 读取</dt>
          <dd>
            {snapshot.protectedReadVerified ? "PASS" : "完成双重验证后核验"}
          </dd>
        </div>
      </dl>
      {query.status === "MFA_REJECTED" ? (
        <p role="alert">
          本次验证未通过，请停止后续验收并核对。未执行权限或邮箱操作。
        </p>
      ) : null}
      <form
        action={verifyPreviewSessionTotp.bind(null, snapshot.sessionId)}
        className="grid gap-4"
      >
        <label className="grid gap-2">
          本人已有 TOTP 因子
          <select
            name="factorId"
            required
            className="min-h-11 border border-border bg-background p-2"
          >
            {snapshot.factors.map((f) => (
              <option key={f.id} value={f.id}>
                因子 …{f.id.slice(-6)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          6 位动态验证码
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className="min-h-11 border border-border bg-background p-2"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-control bg-primary p-3 text-primary-foreground"
        >
          验证本次会话
        </button>
      </form>
      <p className="text-sm">
        验收后请使用下方按钮，只退出本次会话，保留其他设备和既有会话。
      </p>
      <form action={endPreviewSession.bind(null, snapshot.sessionId)}>
        <button
          type="submit"
          className="min-h-11 rounded-control border border-border p-3"
        >
          仅退出本次验收会话
        </button>
      </form>
    </section>
  );
}

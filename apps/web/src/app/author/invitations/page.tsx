import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../../lib/identity-access";
import { InvitationForm } from "./invitation-form";
import { revokeInvitation } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("work:author")) redirect("/archive");
  const query = await searchParams;

  return (
    <section className="reading-card">
      <p className="text-sm font-medium text-primary">Author invitations</p>
      <h1 className="mt-3 text-3xl font-semibold">邀请码管理</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        原始邀请码只在创建结果中显示一次；数据库仅保存 SHA-256
        hash。邀请码只授予 Reader 门禁。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          撤销失败，请检查 Invitation ID、原因和权限。
        </p>
      ) : null}
      {query.status ? (
        <p className="mt-4 text-sm text-primary" role="status">
          邀请码已撤销并写入审计记录。
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <InvitationForm />
        <form
          action={revokeInvitation}
          className="rounded-card border border-border p-5"
        >
          <h2 className="font-semibold">撤销邀请码</h2>
          <label className="mt-4 block text-sm font-medium">
            Invitation ID
            <input
              className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
              name="invitationId"
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            原因
            <textarea
              className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
              maxLength={1000}
              name="reason"
              required
            />
          </label>
          <button className="mt-5 min-h-11 rounded-control border border-border px-4">
            撤销并审计
          </button>
        </form>
      </div>
    </section>
  );
}

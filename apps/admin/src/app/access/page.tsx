import { redirect } from "next/navigation";

import { getAdminAccessContext } from "../../lib/identity-access";
import { grantRole, revokeRole, setMembershipState } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3";

export default async function AccessAdministrationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const access = await getAdminAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("admin:operate")) {
    redirect("/auth/sign-in?error=forbidden");
  }
  const query = await searchParams;
  const roles = access.capabilities.has("super_admin:operate")
    ? (["author", "admin", "super_admin"] as const)
    : (["author"] as const);

  return (
    <section>
      <p className="text-sm font-medium text-primary">
        Identity administration
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Membership 与 Role Grant</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        所有操作都需要原因，并由数据库原子函数再次检查当前操作者权限并写入 audit
        log。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          操作被拒绝或输入无效，未产生部分变更。
        </p>
      ) : null}
      {query.status ? (
        <p className="mt-4 text-sm text-primary" role="status">
          操作已完成并写入审计记录。
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <form
          action={grantRole}
          className="rounded-card border border-border p-5"
        >
          <h2 className="font-semibold">授予角色</h2>
          <IdentityFields roles={roles} />
          <button className="mt-5 min-h-11 rounded-control bg-primary px-4 text-primary-foreground">
            授予并审计
          </button>
        </form>
        <form
          action={revokeRole}
          className="rounded-card border border-border p-5"
        >
          <h2 className="font-semibold">撤销角色</h2>
          <IdentityFields roles={roles} />
          <button className="mt-5 min-h-11 rounded-control border border-border px-4">
            撤销并审计
          </button>
        </form>
        <form
          action={setMembershipState}
          className="rounded-card border border-border p-5"
        >
          <h2 className="font-semibold">修改 Membership</h2>
          <label className="mt-4 block text-sm font-medium">
            User ID
            <input className={inputClass} name="userId" required />
          </label>
          <label className="mt-4 block text-sm font-medium">
            新状态
            <select className={inputClass} name="state">
              <option value="active">active</option>
              <option value="suspended">suspended</option>
              <option value="revoked">revoked</option>
            </select>
          </label>
          <ReasonField />
          <button className="mt-5 min-h-11 rounded-control border border-border px-4">
            更新并审计
          </button>
        </form>
      </div>
    </section>
  );
}

function IdentityFields({ roles }: { roles: readonly string[] }) {
  return (
    <>
      <label className="mt-4 block text-sm font-medium">
        User ID
        <input className={inputClass} name="userId" required />
      </label>
      <label className="mt-4 block text-sm font-medium">
        角色
        <select className={inputClass} name="role">
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      <ReasonField />
    </>
  );
}

function ReasonField() {
  return (
    <label className="mt-4 block text-sm font-medium">
      原因
      <textarea
        className={inputClass}
        maxLength={1000}
        name="reason"
        required
      />
    </label>
  );
}

import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../lib/identity-access";
import { redeemInvitation } from "../auth/actions";

export const dynamic = "force-dynamic";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (access.capabilities.has("archive:read")) redirect("/archive");
  const query = await searchParams;

  return (
    <section className="reading-card mx-auto max-w-lg">
      <p className="text-sm font-medium text-primary">邀请门禁</p>
      <h1 className="mt-3 text-3xl font-semibold">兑换邀请码</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        邀请码只授予 Reader 门禁资格，不会自动授予 Author、Admin 或 Super
        Admin。
      </p>
      {query.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          邀请码无效、已过期、已撤销、已耗尽或已被兑换。
        </p>
      ) : null}
      <form action={redeemInvitation} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          邀请码
          <input
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3 font-mono"
            name="invite"
            required
            type="password"
          />
        </label>
        <button
          className="min-h-11 w-full rounded-control bg-primary px-4 text-primary-foreground"
          type="submit"
        >
          兑换并进入归档
        </button>
      </form>
    </section>
  );
}

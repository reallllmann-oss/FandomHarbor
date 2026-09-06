import { getAdminAccessContext } from "../lib/identity-access";
import { shouldShowAdminHeaderAction } from "../lib/admin-presentation";
import { signOut } from "./auth/actions";

export async function AdminHeaderActions() {
  try {
    const access = await getAdminAccessContext();
    if (!shouldShowAdminHeaderAction(access)) return null;
  } catch {
    return null;
  }

  return (
    <form action={signOut} className="min-w-0 max-w-full">
      <button
        className="site-header-account-action max-w-full rounded-control text-sm font-medium"
        type="submit"
      >
        <span className="hidden sm:inline">退出登录</span>
        <span className="sm:hidden">退出</span>
      </button>
    </form>
  );
}

import { getAdminCurrentIdentity } from "../lib/identity-access";
import { AdminAccountMenu } from "./admin-account-menu";

export async function AdminHeaderActions() {
  let identity;
  try {
    identity = await getAdminCurrentIdentity();
  } catch {
    return null;
  }
  return identity ? <AdminAccountMenu identity={identity} /> : null;
}

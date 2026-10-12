import { getAdminCurrentIdentity } from "../lib/identity-access";
import { AdminMobileNavigation } from "./admin-mobile-navigation";

export async function AdminHeaderActions() {
  let identity;
  try {
    identity = await getAdminCurrentIdentity();
  } catch {
    return null;
  }
  return identity ? <AdminMobileNavigation identity={identity} /> : null;
}

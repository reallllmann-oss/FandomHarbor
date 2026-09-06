import type {
  IdentityAccessEffectiveRole,
  IdentityAccessMembershipState,
} from "@fandom-harbor/services";
import type { TrustedAccessContext } from "@fandom-harbor/auth";

export const ADMIN_MEMBERSHIP_LABELS: Readonly<
  Record<IdentityAccessMembershipState, string>
> = {
  active: "正常",
  pending: "待审核",
  revoked: "已撤销",
  suspended: "已暂停",
};

const ADMIN_ROLE_LABELS: Readonly<Record<IdentityAccessEffectiveRole, string>> =
  {
    admin: "管理员",
    author: "作者",
    reader: "读者",
    super_admin: "超级管理员",
  };

const ADMIN_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
  year: "numeric",
});

export function adminRoleLabel(role: IdentityAccessEffectiveRole): string {
  return ADMIN_ROLE_LABELS[role];
}

export function formatAdminTimestamp(value: Date | string): string {
  const parts = ADMIN_TIMESTAMP_FORMATTER.formatToParts(
    value instanceof Date ? value : new Date(value),
  );
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}（北京时间）`;
}

export function shouldShowAdminHeaderAction(
  access: Pick<TrustedAccessContext, "capabilities"> | null,
): boolean {
  return access?.capabilities.has("admin:operate") ?? false;
}

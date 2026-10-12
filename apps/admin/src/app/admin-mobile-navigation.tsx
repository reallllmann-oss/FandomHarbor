"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { AdminCurrentIdentity } from "../lib/admin-current-identity";
import {
  adminNavigationConfig,
  getActiveAdminNavigationItem,
} from "../lib/admin-navigation";
import { signOut } from "./auth/actions";

const mobileNavigationQuery = "(max-width: 1023px)";
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function subscribeToMobileNavigation(callback: () => void) {
  const media = window.matchMedia(mobileNavigationQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileNavigationSnapshot() {
  return window.matchMedia(mobileNavigationQuery).matches;
}

function getServerMobileNavigationSnapshot() {
  return false;
}

export function AdminMobileNavigation({
  identity,
}: {
  identity: AdminCurrentIdentity;
}) {
  const [open, setOpen] = useState(false);
  const isMobileNavigation = useSyncExternalStore(
    subscribeToMobileNavigation,
    getMobileNavigationSnapshot,
    getServerMobileNavigationSnapshot,
  );
  const pathname = usePathname();
  const activeItem = getActiveAdminNavigationItem(pathname);
  const closeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    (isMobileNavigation ? closeRef.current : logoutRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !isMobileNavigation || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (isMobileNavigation) return;
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMobileNavigation, open]);

  useEffect(() => {
    if (!open || !isMobileNavigation) return;

    const previousOverflow = document.body.style.overflow;
    const backgroundTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        [
          "#main-content",
          ".site-footer",
          '[data-header-region="brand"]',
          '[data-header-region="mobile-leading"]',
          '[data-header-region="page-context"]',
          ".site-header-utilities > button",
        ].join(","),
      ),
    );
    const previousInert = backgroundTargets.map((target) => target.inert);

    document.body.style.overflow = "hidden";
    backgroundTargets.forEach((target) => {
      target.inert = true;
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      backgroundTargets.forEach((target, index) => {
        target.inert = previousInert[index] ?? false;
      });
    };
  }, [isMobileNavigation, open]);

  const closeAndReturnFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="admin-account-menu" ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={
          isMobileNavigation
            ? `${open ? "关闭" : "打开"}管理导航，当前账号：${identity.registrationName}，${identity.displayRole}`
            : `账号：${identity.registrationName}，${identity.displayRole}`
        }
        className="admin-account-trigger rounded-control"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span className="admin-account-trigger-copy">
          <span className="admin-account-trigger-name">
            {identity.registrationName}
          </span>
          <span aria-hidden="true" className="admin-account-trigger-separator">
            ·
          </span>
          <span className="admin-account-trigger-role">
            {identity.displayRole}
          </span>
        </span>
        <span aria-hidden="true" className="admin-account-trigger-indicator">
          {open ? "▴" : "▾"}
        </span>
        <span aria-hidden="true" className="admin-mobile-menu-trigger-copy">
          <span className="admin-mobile-menu-trigger-icon">☰</span>
          <span>菜单</span>
        </span>
      </button>

      {open && isMobileNavigation ? (
        <button
          aria-label="关闭导航遮罩"
          className="admin-mobile-navigation-backdrop"
          onClick={closeAndReturnFocus}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      {open ? (
        <section
          aria-label={isMobileNavigation ? "管理导航和账号" : "账号菜单"}
          aria-modal={isMobileNavigation ? "true" : undefined}
          className="admin-account-panel"
          id={panelId}
          ref={panelRef}
          role={isMobileNavigation ? "dialog" : "region"}
        >
          <div className="admin-mobile-navigation-heading">
            <strong>管理后台</strong>
            <button
              aria-label="关闭管理导航"
              className="admin-mobile-navigation-close rounded-control"
              onClick={closeAndReturnFocus}
              ref={closeRef}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav
            aria-label="移动端后台主要导航"
            className="admin-mobile-primary-navigation"
          >
            {adminNavigationConfig.map((item) => (
              <a
                aria-label={
                  "accessibilityLabel" in item
                    ? item.accessibilityLabel
                    : undefined
                }
                aria-current={
                  activeItem?.href === item.href ? "page" : undefined
                }
                className="admin-mobile-primary-navigation-link rounded-control"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="admin-account-panel-identity">
            <p className="admin-account-panel-label">当前账号</p>
            <p className="admin-account-panel-name">
              {identity.registrationName}
            </p>
            <p className="admin-account-panel-role">{identity.displayRole}</p>
          </div>
          <form action={signOut} className="admin-account-panel-action">
            <button
              className="admin-account-logout rounded-control"
              ref={logoutRef}
              type="submit"
            >
              退出登录
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

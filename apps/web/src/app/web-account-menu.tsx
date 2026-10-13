"use client";

import type {
  CurrentAccountIdentity,
  CurrentAccountIdentityFor,
} from "@fandom-harbor/auth";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { signOut } from "./auth/actions";

interface WebAccountMenuProps {
  authorIdentity: CurrentAccountIdentityFor<"author"> | null;
  readerIdentity: CurrentAccountIdentityFor<"reader"> | null;
}

export function webAccountSurface(pathname: string): "author" | "reader" {
  return pathname === "/studio" || pathname.startsWith("/studio/")
    ? "author"
    : "reader";
}

export function selectWebCurrentIdentity(
  pathname: string,
  identities: WebAccountMenuProps,
): CurrentAccountIdentity | null {
  return webAccountSurface(pathname) === "author"
    ? identities.authorIdentity
    : identities.readerIdentity;
}

export function WebAccountMenu({
  authorIdentity,
  readerIdentity,
}: WebAccountMenuProps) {
  const pathname = usePathname();
  const identity = selectWebCurrentIdentity(pathname, {
    authorIdentity,
    readerIdentity,
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    logoutRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      returnFocusRef.current = true;
      setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
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
  }, [open]);

  useEffect(() => {
    if (open || !returnFocusRef.current) return;
    returnFocusRef.current = false;
    triggerRef.current?.focus();
  }, [open]);

  const identityLabel = identity
    ? `${identity.registrationName}，${identity.displayRole}`
    : "信息不可用";

  return (
    <div className="web-account-menu" ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={`账号：${identityLabel}`}
        className="web-account-trigger rounded-control"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span className="web-account-trigger-copy">
          <span className="web-account-trigger-name">
            {identity?.registrationName ?? "账号"}
          </span>
          {identity ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="web-account-trigger-role">
                {identity.displayRole}
              </span>
            </>
          ) : null}
        </span>
        <span aria-hidden="true" className="web-account-trigger-compact">
          <span>账号</span>
        </span>
        <span aria-hidden="true" className="web-account-trigger-indicator">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <section
          aria-label="账号菜单"
          className="web-account-panel"
          id={panelId}
          role="region"
        >
          <p className="web-account-panel-label">当前账号</p>
          {identity ? (
            <>
              <p className="web-account-panel-name">
                {identity.registrationName}
              </p>
              <p className="web-account-panel-role">{identity.displayRole}</p>
            </>
          ) : (
            <p className="web-account-panel-unavailable">账号信息不可用</p>
          )}
          <form action={signOut} className="web-account-panel-action">
            <button
              className="web-account-logout rounded-control"
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

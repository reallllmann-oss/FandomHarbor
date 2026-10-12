"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { AdminCurrentIdentity } from "../lib/admin-current-identity";
import { signOut } from "./auth/actions";

export function AdminAccountMenu({
  identity,
}: {
  identity: AdminCurrentIdentity;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    logoutRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
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

  return (
    <div className="admin-account-menu" ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={`账号：${identity.registrationName}，${identity.displayRole}`}
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
      </button>

      {open ? (
        <section
          aria-label="账号菜单"
          className="admin-account-panel"
          id={panelId}
        >
          <p className="admin-account-panel-label">当前账号</p>
          <p className="admin-account-panel-name">
            {identity.registrationName}
          </p>
          <p className="admin-account-panel-role">{identity.displayRole}</p>
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

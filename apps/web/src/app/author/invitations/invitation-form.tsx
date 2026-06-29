"use client";

import { useActionState } from "react";

import { createInvitation, type InvitationActionState } from "./actions";

const initialState: InvitationActionState = {};

export function InvitationForm() {
  const [state, action, pending] = useActionState(
    createInvitation,
    initialState,
  );

  return (
    <form action={action} className="rounded-card border border-border p-5">
      <h2 className="font-semibold">创建邀请码</h2>
      <label className="mt-4 block text-sm font-medium">
        可用次数
        <input
          className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
          defaultValue={1}
          min={1}
          name="maxUses"
          required
          type="number"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        过期时间
        <input
          className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
          name="expiresAt"
          required
          type="datetime-local"
        />
      </label>
      <button
        className="mt-5 min-h-11 rounded-control bg-primary px-4 text-primary-foreground disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "创建中…" : "创建邀请码"}
      </button>
      {state.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.invitation ? (
        <div className="mt-4 rounded-control border border-border bg-surface-muted p-3">
          <p className="text-sm font-medium">邀请码只显示这一次</p>
          <code className="mt-2 block break-all text-sm">
            {state.invitation.secret}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            Invitation ID: {state.invitation.id}
          </p>
        </div>
      ) : null}
    </form>
  );
}

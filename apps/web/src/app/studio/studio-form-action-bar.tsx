import Link from "next/link";

import { disabledStudioActionProps } from "./studio-state-contract";

interface StudioFormActionBarProps {
  actions: readonly string[];
  backHref: "/studio/articles" | "/studio/works";
  backLabel: string;
  submitActionLabel?: string;
  submitDisabled?: boolean;
  submitPending?: boolean;
}

export function StudioFormActionBar({
  actions,
  backHref,
  backLabel,
  submitActionLabel,
  submitDisabled = false,
  submitPending = false,
}: StudioFormActionBarProps) {
  return (
    <aside
      aria-label="表单操作"
      className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-lg"
    >
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-primary" href={backHref}>
          {backLabel}
        </Link>
        <Link className="text-primary" href="/studio">
          返回 Studio
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((label) =>
          label === submitActionLabel ? (
            <button
              className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitDisabled || submitPending}
              key={label}
              type="submit"
            >
              {submitPending ? "保存中…" : label}
            </button>
          ) : (
            <button
              className="min-h-11 rounded-control border border-border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              key={label}
              {...disabledStudioActionProps(label)}
            >
              {label}
            </button>
          ),
        )}
      </div>
    </aside>
  );
}

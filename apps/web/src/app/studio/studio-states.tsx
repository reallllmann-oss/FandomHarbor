import Link from "next/link";

import { disabledStudioActionProps } from "./studio-state-contract";

interface StudioEmptyListStateProps {
  createLabel: string;
  createHref?: "/studio/works/new";
  description: string;
  heading: string;
  headingId: string;
}

export function StudioEmptyListState({
  createLabel,
  createHref,
  description,
  heading,
  headingId,
}: StudioEmptyListStateProps) {
  return (
    <section aria-labelledby={headingId} className="empty-state">
      <h2 className="text-xl font-semibold" id={headingId}>
        {heading}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {createHref ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-sm text-primary-foreground"
            href={createHref}
          >
            {createLabel}
          </Link>
        ) : (
          <button
            className="min-h-11 rounded-control border border-border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            {...disabledStudioActionProps(createLabel)}
          >
            {createLabel}（后续开放）
          </button>
        )}
        <Link
          className="inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm text-primary"
          href="/studio"
        >
          返回 Studio
        </Link>
      </div>
    </section>
  );
}

interface StudioDetailNavigationProps {
  listHref: "/studio/articles" | "/studio/works";
  listLabel: string;
}

export function StudioDetailNavigation({
  listHref,
  listLabel,
}: StudioDetailNavigationProps) {
  return (
    <nav aria-label="详情页返回导航" className="flex flex-wrap gap-3 text-sm">
      <Link className="text-primary" href={listHref}>
        {listLabel}
      </Link>
      <Link className="text-primary" href="/studio">
        返回 Studio
      </Link>
    </nav>
  );
}

interface StudioDetailNotFoundProps extends StudioDetailNavigationProps {
  description: string;
  title: string;
}

export function StudioDetailNotFound({
  description,
  listHref,
  listLabel,
  title,
}: StudioDetailNotFoundProps) {
  return (
    <section aria-labelledby="studio-not-found-heading" className="empty-state">
      <p className="eyebrow">Not Found</p>
      <h1 className="mt-2 text-2xl font-semibold" id="studio-not-found-heading">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex justify-center">
        <StudioDetailNavigation listHref={listHref} listLabel={listLabel} />
      </div>
    </section>
  );
}

interface DisabledStudioActionsProps {
  actions: readonly string[];
  description: string;
  heading: string;
  headingId: string;
}

export function DisabledStudioActions({
  actions,
  description,
  heading,
  headingId,
}: DisabledStudioActionsProps) {
  return (
    <section aria-labelledby={headingId} className="stat-card">
      <h2 className="text-lg font-semibold" id={headingId}>
        {heading}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((label) => (
          <button
            className="min-h-11 rounded-control border border-border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            key={label}
            {...disabledStudioActionProps(label)}
          >
            {label}（占位）
          </button>
        ))}
      </div>
    </section>
  );
}

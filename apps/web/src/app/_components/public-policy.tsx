import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

const bodyClassName =
  "text-base leading-8 text-muted-foreground [overflow-wrap:anywhere]";
const listClassName =
  "space-y-2 pl-6 text-base leading-8 text-muted-foreground [overflow-wrap:anywhere]";
const linkClassName =
  "rounded-control text-primary underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

const policyNavigation = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/content-policy", label: "Content Policy" },
];

export function PublicPolicyPage({
  children,
  description,
  title,
}: PropsWithChildren<{ description: string; title: string }>) {
  return (
    <article className="mx-auto min-w-0 max-w-3xl [overflow-wrap:anywhere]">
      <header className="border-b border-border pb-10 pt-2 sm:pb-12 sm:pt-6">
        <p className="eyebrow">Fandom Harbor · V1 Public Policy</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className={`mt-5 max-w-2xl ${bodyClassName}`}>{description}</p>
        <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">文档状态</dt>
            <dd className="mt-1 font-medium text-foreground">
              Owner-approved candidate
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">版本</dt>
            <dd className="mt-1 font-medium text-foreground">V1.0</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">批准日期</dt>
            <dd className="mt-1 font-medium text-foreground">2026-07-25</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">运营主体</dt>
            <dd className="mt-1 font-medium text-foreground">
              Fandom Harbor，由刘祯莹个人运营
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">生效方式</dt>
            <dd className="mt-1 font-medium text-foreground">
              正式网站发布之日起生效
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">法律审阅</dt>
            <dd className="mt-1 font-medium text-foreground">NOT COMPLETED</dd>
          </div>
        </dl>
        <p
          className="mt-6 border-l-2 border-primary pl-4 text-sm leading-7 text-muted-foreground"
          role="note"
        >
          此政策已完成 Product Owner 决策应用，但尚未部署到
          Production，当前尚未生效；独立法律审阅尚未完成。
        </p>
      </header>

      <nav aria-label="公开政策" className="my-10 border-y border-border py-4">
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {policyNavigation.map((item) => (
            <li key={item.href}>
              <Link
                className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14 sm:space-y-16">{children}</div>

      <footer className="mt-14 border-t border-border pt-8 text-sm leading-7 text-muted-foreground sm:mt-16">
        <p>
          联系邮箱： <ContactLink />
        </p>
      </footer>
    </article>
  );
}

export function PolicySection({
  children,
  id,
  title,
}: PropsWithChildren<{ id: string; title: string }>) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 space-y-5"
      id={id}
    >
      <h2
        className="font-serif text-2xl font-medium leading-tight text-foreground sm:text-3xl"
        id={`${id}-title`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PolicySubsection({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold leading-7 text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PolicyParagraph({ children }: PropsWithChildren) {
  return <p className={bodyClassName}>{children}</p>;
}

export function BulletList({ children }: { children: ReactNode }) {
  return <ul className={`list-disc ${listClassName}`}>{children}</ul>;
}

export function NumberedList({ children }: { children: ReactNode }) {
  return <ol className={`list-decimal ${listClassName}`}>{children}</ol>;
}

export function ContactLink() {
  return (
    <a className={linkClassName} href="mailto:fandomharbor@163.com">
      fandomharbor@163.com
    </a>
  );
}

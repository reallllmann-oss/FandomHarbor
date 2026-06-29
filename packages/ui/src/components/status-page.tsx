import type { ReactNode } from "react";

import { Button } from "./button";

interface StatusPageProps {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}

export function StatusPage({
  action,
  description,
  eyebrow,
  title,
}: StatusPageProps) {
  return (
    <section className="mx-auto max-w-2xl py-20 text-center">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">{description}</p>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </section>
  );
}

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return <Button onClick={onRetry}>重试</Button>;
}

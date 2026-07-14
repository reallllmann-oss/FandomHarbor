import type { PropsWithChildren } from "react";

interface HomepageSectionProps extends PropsWithChildren {
  labelledBy: string;
  tone?: "default" | "quiet";
}

export function HomepageShell({ children }: PropsWithChildren) {
  return (
    <div className="homepage-shell" id="foundation">
      {children}
    </div>
  );
}

export function HomepageSection({
  children,
  labelledBy,
  tone = "default",
}: HomepageSectionProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className="homepage-section"
      data-tone={tone}
    >
      <div className="homepage-region">{children}</div>
    </section>
  );
}

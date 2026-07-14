import type { PropsWithChildren, ReactNode } from "react";

export function ReadingPageLayout({ children }: PropsWithChildren) {
  return <div className="reading-page-layout">{children}</div>;
}

export function ReadingContextRegion({ children }: PropsWithChildren) {
  return (
    <section aria-label="章节上下文" className="reading-context-region">
      {children}
    </section>
  );
}

export function ReadingContentRegion({ children }: PropsWithChildren) {
  return <div className="reading-content-region">{children}</div>;
}

export function ReadingContinuationRegion({ children }: PropsWithChildren) {
  return (
    <section aria-label="章节延续" className="reading-continuation-region">
      {children}
    </section>
  );
}

export function ChapterHeader({
  author,
  chapterLabel,
  title,
  workTitle,
}: {
  author?: ReactNode;
  chapterLabel: string;
  title: string;
  workTitle: string;
}) {
  return (
    <header className="reading-chapter-header">
      <p className="eyebrow">{chapterLabel}</p>
      <h1 id="reading-chapter-title">{title}</h1>
      <p className="reading-chapter-work">{workTitle}</p>
      {author ? <p className="reading-chapter-author">作者：{author}</p> : null}
    </header>
  );
}

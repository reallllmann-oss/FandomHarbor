import type { BrowseWork } from "@fandom-harbor/services";
import Link from "next/link";

export function HomepageWorkPreview({ work }: { work: BrowseWork }) {
  return (
    <article className="homepage-preview">
      <p className="homepage-preview-meta">
        公开于{" "}
        <time dateTime={work.publishedAt.toISOString()}>
          {work.publishedAt.toLocaleDateString("zh-CN", { timeZone: "UTC" })}
        </time>
      </p>
      <h3 className="homepage-preview-title">
        <Link
          className="homepage-preview-title-link"
          href={`/works/${work.slug}`}
        >
          {work.title}
        </Link>
      </h3>
      <p className="homepage-preview-author">
        <span>作者</span>
        <Link
          className="homepage-preview-author-link"
          href={`/author/${work.authorSlug}`}
        >
          {work.authorName}
        </Link>
      </p>
      <p className="homepage-preview-summary">
        {work.summary || "这部作品暂时没有公开简介。"}
      </p>
    </article>
  );
}

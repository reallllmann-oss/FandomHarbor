"use client";

import Link from "next/link";

import { RetryButton } from "@fandom-harbor/ui";

export default function AuthorProfileError({ reset }: { reset: () => void }) {
  return (
    <section className="author-error" role="alert">
      <p className="eyebrow">加载失败</p>
      <h1>作者主页暂时离港</h1>
      <p>作者资料暂时无法读取。你可以重试，或返回公共发现空间继续浏览。</p>
      <div className="author-error-actions">
        <RetryButton onRetry={reset} />
        <Link className="author-secondary-action" href="/archive">
          浏览作品档案
        </Link>
        <Link className="author-text-action" href="/search">
          搜索作品或作者
        </Link>
      </div>
    </section>
  );
}

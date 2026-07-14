"use client";

import Link from "next/link";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <div className="search-shell">
      <section className="search-orientation">
        <p className="eyebrow">主动发现</p>
        <h1>搜索暂时停在这里</h1>
        <p className="search-orientation-copy">
          公开作品与作者的查询暂时无法完成。你的阅读路径和站内内容不会因此改变。
        </p>
      </section>

      <section className="search-error" role="alert">
        <p className="eyebrow">查询未完成</p>
        <h2>可以重试，或换一条路径继续</h2>
        <p>
          请稍后再次尝试。你也可以清空关键词重新开始，或前往作品归档浏览已经发布的故事。
        </p>
        <div className="search-recovery-actions">
          <button
            className="search-primary-action"
            onClick={reset}
            type="button"
          >
            重新尝试
          </button>
          <a className="search-secondary-action" href="/search">
            清空并重新搜索
          </a>
          <Link className="search-text-action" href="/archive">
            浏览作品归档
          </Link>
        </div>
      </section>
    </div>
  );
}

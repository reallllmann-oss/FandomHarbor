import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import { isBrowseSort, type BrowseSort } from "@fandom-harbor/services";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createPublicBrowseGateway } from "../../lib/public-browse";
import { pageMetadata } from "../../lib/seo";
import { ReaderShelf } from "../reader-shelf-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  description: "按发布时间或标题浏览 Fandom Harbor 的已发布作品。",
  pathname: "/archive",
  title: "Archive",
});

const sortLabels: Record<BrowseSort, string> = {
  newest: "最新发布",
  oldest: "最早发布",
  "title-asc": "标题 A–Z",
  "title-desc": "标题 Z–A",
};

function parameter(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function positivePage(value: string) {
  if (!/^[1-9]\d*$/u.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function archiveHref(page: number, sort: BrowseSort) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("sort", sort);
  return `/archive?${query.toString()}`;
}

export default async function ArchiveBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const parameters = await searchParams;
  const requestedSort = parameter(parameters.sort);
  const sort: BrowseSort = isBrowseSort(requestedSort)
    ? requestedSort
    : "newest";
  const page = positivePage(parameter(parameters.page));
  const browse = await createPublicBrowseGateway(
    readPublicRuntimeConfig(),
  ).list({ page, sort });

  if (browse.pageCount > 0 && page > browse.pageCount) {
    redirect(archiveHref(browse.pageCount, sort));
  }

  const firstItem = browse.total === 0 ? 0 : (page - 1) * browse.pageSize + 1;
  const lastItem = Math.min(page * browse.pageSize, browse.total);

  return (
    <div className="archive-shell">
      <section className="archive-orientation">
        <p className="eyebrow">作品归档</p>
        <h1>发现下一段值得进入的故事</h1>
        <p className="archive-orientation-copy">
          这里收录已经发布的作品。按时间或标题安静浏览，从故事简介与作者线索中，找到适合此刻阅读的一篇。
        </p>
      </section>

      <section
        aria-labelledby="archive-controls-title"
        className="archive-controls"
      >
        <div className="archive-controls-copy">
          <h2 id="archive-controls-title">整理浏览顺序</h2>
          <p>排序和页码会保存在链接中，返回时仍能继续当前位置。</p>
        </div>
        <form action="/archive" className="archive-sort-form" method="get">
          <label className="archive-sort-label" htmlFor="archive-sort">
            排序方式
            <select
              className="archive-sort-select"
              defaultValue={sort}
              id="archive-sort"
              name="sort"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="archive-sort-submit" type="submit">
            更新顺序
          </button>
        </form>
      </section>

      {browse.items.length === 0 ? (
        <section className="archive-empty" aria-live="polite">
          <p className="eyebrow">尚无归档</p>
          <h2>这里暂时没有已发布作品</h2>
          <p>
            草稿和未发布内容不会出现在公共归档中。你可以返回首页，或前往搜索查看其他公开入口。
          </p>
          <div className="archive-empty-actions">
            <Link className="archive-secondary-action" href="/">
              返回首页
            </Link>
            <Link className="archive-secondary-action" href="/search">
              前往搜索
            </Link>
          </div>
        </section>
      ) : (
        <section aria-labelledby="archive-results" className="archive-results">
          <div className="archive-results-heading">
            <div className="archive-results-title-group">
              <p className="eyebrow">公开作品</p>
              <h2 id="archive-results">沿着故事线索浏览</h2>
              <p className="archive-results-count" role="status">
                共 {browse.total} 部作品，当前显示第 {firstItem}–{lastItem} 部
              </p>
            </div>
            <p className="archive-page-context">
              {sortLabels[sort]} · 第 {browse.page} / {browse.pageCount} 页
            </p>
          </div>

          <ul className="archive-work-list">
            {browse.items.map((work) => (
              <li className="archive-work" key={work.id}>
                <h3 className="archive-work-title">
                  <Link href={`/works/${work.slug}`}>{work.title}</Link>
                </h3>
                <p className="archive-work-summary">
                  {work.summary || "这部作品暂未留下简介。"}
                </p>
                <div className="archive-work-footer">
                  <p className="archive-work-author">
                    作者
                    <span aria-hidden="true"> · </span>
                    <Link
                      className="archive-author-link"
                      href={`/author/${work.authorSlug}`}
                    >
                      {work.authorName}
                    </Link>
                  </p>
                  <p className="archive-work-date">
                    {work.publishedAt.toLocaleDateString("zh-CN", {
                      timeZone: "UTC",
                    })}
                    发布
                  </p>
                </div>
                <Link
                  className="archive-work-entry"
                  href={`/works/${work.slug}`}
                >
                  查看作品 <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <nav aria-label="Archive 分页" className="archive-pagination">
            {browse.page > 1 ? (
              <Link
                className="archive-page-action"
                href={archiveHref(browse.page - 1, sort)}
                rel="prev"
              >
                上一页
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="archive-page-action archive-page-action-disabled"
              >
                已是第一页
              </span>
            )}
            <span aria-current="page" className="archive-page-current">
              第 {browse.page} / {browse.pageCount} 页
            </span>
            {browse.page < browse.pageCount ? (
              <Link
                className="archive-page-action"
                href={archiveHref(browse.page + 1, sort)}
                rel="next"
              >
                下一页
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="archive-page-action archive-page-action-disabled"
              >
                已是最后一页
              </span>
            )}
          </nav>
        </section>
      )}

      <section className="archive-shelf" aria-labelledby="local-shelf-title">
        <div className="archive-shelf-heading">
          <p className="eyebrow">私人回访</p>
          <h2 id="local-shelf-title">回到当前浏览器保存的阅读</h2>
          <p>
            书签与最近阅读只保存在这台设备中。它们属于私人回访，不参与上方的公共作品浏览与排序。
          </p>
        </div>
        <div className="archive-shelf-content">
          <ReaderShelf />
        </div>
      </section>
    </div>
  );
}

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
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">Archive Browse</p>
        <h1 className="mt-3 text-3xl font-semibold">浏览已发布作品</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Archive 只展示 Published Works。排序和页码保存在 URL
          中，可直接分享并恢复当前浏览位置。
        </p>
        <form
          action="/archive"
          className="mt-6 flex flex-col gap-3 sm:max-w-md sm:flex-row sm:items-end"
          method="get"
        >
          <label
            className="grid flex-1 gap-2 text-sm font-medium"
            htmlFor="archive-sort"
          >
            排序方式
            <select
              className="min-h-11 rounded-control border border-border bg-background px-3"
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
          <button
            className="min-h-11 rounded-control bg-primary px-5 font-medium text-primary-foreground"
            type="submit"
          >
            应用排序
          </button>
        </form>
      </section>

      {browse.items.length === 0 ? (
        <section
          className="reading-card max-w-none text-center"
          aria-live="polite"
        >
          <h2 className="text-xl font-semibold">Archive 暂无已发布作品</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Draft 和未发布作品不会显示在这里。作品发布后会自动进入 Archive。
          </p>
        </section>
      ) : (
        <section aria-labelledby="archive-results" className="site-stack">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold" id="archive-results">
                Published Works
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" role="status">
                共 {browse.total} 部作品，当前显示第 {firstItem}–{lastItem} 部
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {sortLabels[sort]} · 第 {browse.page} / {browse.pageCount} 页
            </p>
          </div>

          <ul className="book-grid">
            {browse.items.map((work) => (
              <li className="stat-card" key={work.id}>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Published Work
                </p>
                <h3 className="mt-3 text-xl font-semibold">
                  <Link href={`/works/${work.slug}`}>{work.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  作者：
                  <Link
                    className="text-primary"
                    href={`/author/${work.authorSlug}`}
                  >
                    {work.authorName}
                  </Link>
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {work.summary || "暂无作品简介。"}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  发布于{" "}
                  {work.publishedAt.toLocaleDateString("zh-CN", {
                    timeZone: "UTC",
                  })}
                </p>
              </li>
            ))}
          </ul>

          <nav
            aria-label="Archive 分页"
            className="flex items-center justify-between gap-4"
          >
            {browse.page > 1 ? (
              <Link
                className="inline-flex min-h-11 items-center rounded-control border border-border px-4"
                href={archiveHref(browse.page - 1, sort)}
                rel="prev"
              >
                上一页
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 items-center px-4 text-muted-foreground"
              >
                已是第一页
              </span>
            )}
            <span aria-current="page" className="text-sm font-medium">
              第 {browse.page} / {browse.pageCount} 页
            </span>
            {browse.page < browse.pageCount ? (
              <Link
                className="inline-flex min-h-11 items-center rounded-control border border-border px-4"
                href={archiveHref(browse.page + 1, sort)}
                rel="next"
              >
                下一页
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 items-center px-4 text-muted-foreground"
              >
                已是最后一页
              </span>
            )}
          </nav>
        </section>
      )}

      <section
        className="reading-card max-w-none"
        aria-labelledby="local-shelf-title"
      >
        <p className="eyebrow">Local Reader Shelf</p>
        <h2 className="mt-3 text-2xl font-semibold" id="local-shelf-title">
          当前浏览器的本地书架
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          书签与最近阅读只保存在当前浏览器，不绑定账号，也不影响公开 Archive
          浏览。
        </p>
        <div className="mt-6">
          <ReaderShelf />
        </div>
      </section>
    </div>
  );
}

import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchQuery,
} from "@fandom-harbor/services";
import Link from "next/link";
import type { Metadata } from "next";

import { createPublicSearchGateway } from "../../lib/public-search";
import { pageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  description: "搜索 Fandom Harbor 的已发布作品与公开作者。",
  pathname: "/search",
  title: "搜索作品与作者",
});

function queryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const rawQuery = queryValue(parameters.q);
  const query = normalizeSearchQuery(rawQuery);
  const invalid =
    query.length > MAX_SEARCH_QUERY_LENGTH || /\p{Cc}/u.test(query);
  const results =
    query.length > 0 && !invalid
      ? await createPublicSearchGateway(readPublicRuntimeConfig()).search(query)
      : { authors: [], query, works: [] };
  const resultCount = results.works.length + results.authors.length;

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">Search MVP</p>
        <h1 className="mt-3 text-3xl font-semibold">搜索作品与作者</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          按作品标题、作品 Slug、作者名称或作者 Slug
          搜索。结果仅包含已发布作品。
        </p>
        <form
          action="/search"
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          method="get"
          role="search"
        >
          <label className="sr-only" htmlFor="public-search-query">
            搜索 Published Works 与作者
          </label>
          <input
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-control border border-border bg-background px-4"
            defaultValue={rawQuery}
            id="public-search-query"
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            name="q"
            placeholder="输入作品标题、Slug 或作者名称"
            type="search"
          />
          <button
            className="min-h-11 rounded-control bg-primary px-6 font-medium text-primary-foreground"
            type="submit"
          >
            搜索
          </button>
        </form>
        {invalid ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            搜索关键词需控制在 {MAX_SEARCH_QUERY_LENGTH}{" "}
            个字符以内，且不能包含控制字符。
          </p>
        ) : null}
      </section>

      {query.length === 0 ? (
        <section
          className="reading-card max-w-none text-center"
          aria-labelledby="search-start-title"
        >
          <h2 className="text-xl font-semibold" id="search-start-title">
            从一个明确的关键词开始
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Search MVP 不保存搜索历史，也不会提供推荐或热门词。
          </p>
        </section>
      ) : invalid ? null : resultCount === 0 ? (
        <section
          className="reading-card max-w-none text-center"
          aria-live="polite"
        >
          <h2 className="text-xl font-semibold">没有找到公开结果</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            请检查标题或 Slug。草稿和未发布作品不会出现在搜索中。
          </p>
        </section>
      ) : (
        <div aria-live="polite" className="site-stack">
          <p className="text-sm text-muted-foreground" role="status">
            “{results.query}”共找到 {resultCount} 条公开结果
          </p>

          {results.works.length > 0 ? (
            <section
              aria-labelledby="search-work-results"
              className="reading-card max-w-none"
            >
              <h2 className="text-2xl font-semibold" id="search-work-results">
                已发布作品
              </h2>
              <ul className="mt-5 grid gap-4 md:grid-cols-2">
                {results.works.map((work) => (
                  <li
                    className="rounded-control border border-border p-5"
                    key={work.id}
                  >
                    <h3 className="text-lg font-semibold">
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
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {work.summary || "暂无作品简介。"}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Slug：{work.slug}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.authors.length > 0 ? (
            <section
              aria-labelledby="search-author-results"
              className="reading-card max-w-none"
            >
              <h2 className="text-2xl font-semibold" id="search-author-results">
                作者
              </h2>
              <ul className="mt-5 grid gap-4 md:grid-cols-2">
                {results.authors.map((author) => (
                  <li
                    className="rounded-control border border-border p-5"
                    key={author.slug}
                  >
                    <h3 className="text-lg font-semibold">
                      <Link href={`/author/${author.slug}`}>
                        {author.displayName}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {author.bio || "这位作者还没有填写简介。"}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      已发布作品 {author.publishedWorkCount} · Slug：
                      {author.slug}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

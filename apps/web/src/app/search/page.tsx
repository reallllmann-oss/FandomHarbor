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
    <div className="search-shell">
      <section className="search-orientation">
        <p className="eyebrow">主动发现</p>
        <h1>寻找一部作品，或一位作者</h1>
        <p className="search-orientation-copy">
          从一个明确的标题、作者名称或公开标识开始，在已经发布的故事与创作者之间找到下一条阅读路径。
        </p>
      </section>

      <section aria-labelledby="search-query-title" className="search-query">
        <div className="search-query-copy">
          <h2 id="search-query-title">输入你的线索</h2>
          <p>搜索只会返回公开作品，以及拥有公开作品的作者。</p>
        </div>
        <form
          action="/search"
          className="search-form"
          method="get"
          role="search"
        >
          <label className="search-label" htmlFor="public-search-query">
            作品或作者关键词
          </label>
          <div className="search-form-row">
            <input
              autoComplete="off"
              className="search-input"
              defaultValue={rawQuery}
              id="public-search-query"
              maxLength={MAX_SEARCH_QUERY_LENGTH}
              name="q"
              placeholder="例如：作品标题、作者名称或公开标识"
              type="search"
            />
            <button className="search-submit" type="submit">
              开始搜索
            </button>
          </div>
          <p className="search-input-help">
            最多 {MAX_SEARCH_QUERY_LENGTH} 个字符。搜索记录不会被保存。
          </p>
          {invalid ? (
            <p className="search-validation" role="alert">
              关键词需控制在 {MAX_SEARCH_QUERY_LENGTH}{" "}
              个字符以内，且不能包含控制字符。
            </p>
          ) : null}
        </form>
      </section>

      {query.length === 0 ? (
        <section
          aria-labelledby="search-start-title"
          className="search-recovery"
        >
          <p className="eyebrow">从线索开始</p>
          <h2 id="search-start-title">想起一个名字，就从那里出发</h2>
          <p>
            这里不提供热门词或推荐排序。如果暂时没有明确关键词，可以先到作品归档中安静浏览。
          </p>
          <div className="search-recovery-actions">
            <Link className="search-secondary-action" href="/archive">
              浏览作品归档
            </Link>
            <Link className="search-text-action" href="/">
              返回首页
            </Link>
          </div>
        </section>
      ) : invalid ? null : resultCount === 0 ? (
        <section aria-live="polite" className="search-recovery search-empty">
          <p className="eyebrow">暂无匹配</p>
          <h2>没有找到与“{results.query}”相符的公开结果</h2>
          <p>
            可以调整标题、作者名称或公开标识后再次搜索。草稿和未发布内容不会出现在这里。
          </p>
          <div className="search-recovery-actions">
            <Link className="search-secondary-action" href="/archive">
              浏览作品归档
            </Link>
            <Link className="search-text-action" href="/">
              返回首页
            </Link>
          </div>
        </section>
      ) : (
        <div className="search-results-stack">
          <section
            aria-labelledby="search-context-title"
            className="search-context"
          >
            <div>
              <p className="eyebrow">查询结果</p>
              <h2 id="search-context-title">关于“{results.query}”</h2>
            </div>
            <p className="search-result-count" role="status">
              找到 {resultCount} 条公开结果
            </p>
          </section>

          {results.works.length > 0 ? (
            <section
              aria-labelledby="search-work-results"
              className="search-results-region search-work-results"
            >
              <div className="search-region-heading">
                <div>
                  <p className="eyebrow">故事线索</p>
                  <h2 id="search-work-results">找到的公开作品</h2>
                </div>
                <p>{results.works.length} 部作品</p>
              </div>
              <ul className="search-work-list">
                {results.works.map((work) => (
                  <li className="search-work-result" key={work.id}>
                    <h3 className="search-work-title">
                      <Link href={`/works/${work.slug}`}>{work.title}</Link>
                    </h3>
                    <p className="search-work-summary">
                      {work.summary || "这部作品暂未留下简介。"}
                    </p>
                    <div className="search-work-meta">
                      <p>
                        作者
                        <span aria-hidden="true"> · </span>
                        <Link
                          className="search-author-link"
                          href={`/author/${work.authorSlug}`}
                        >
                          {work.authorName}
                        </Link>
                      </p>
                      <p>
                        {work.publishedAt.toLocaleDateString("zh-CN", {
                          timeZone: "UTC",
                        })}
                        发布
                      </p>
                    </div>
                    <Link
                      className="search-result-entry"
                      href={`/works/${work.slug}`}
                    >
                      查看作品 <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.authors.length > 0 ? (
            <section
              aria-labelledby="search-author-results"
              className="search-results-region search-author-results"
            >
              <div className="search-region-heading">
                <div>
                  <p className="eyebrow">创作者线索</p>
                  <h2 id="search-author-results">找到的公开作者</h2>
                </div>
                <p>{results.authors.length} 位作者</p>
              </div>
              <ul className="search-author-list">
                {results.authors.map((author) => (
                  <li className="search-author-result" key={author.slug}>
                    <h3 className="search-author-title">
                      <Link href={`/author/${author.slug}`}>
                        {author.displayName}
                      </Link>
                    </h3>
                    <p className="search-author-bio">
                      {author.bio || "这位作者暂未留下公开简介。"}
                    </p>
                    <p className="search-author-context">
                      已公开 {author.publishedWorkCount} 部作品
                    </p>
                    <Link
                      className="search-result-entry"
                      href={`/author/${author.slug}`}
                    >
                      查看作者主页 <span aria-hidden="true">→</span>
                    </Link>
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

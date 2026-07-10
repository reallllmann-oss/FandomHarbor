import Link from "next/link";

import { landingSignals, mockWorks } from "../lib/mock-content";

export default function HomePage() {
  return (
    <div className="site-stack" id="foundation">
      <section className="hero-panel">
        <p className="eyebrow">Sprint 002B · Reading Experience Foundation</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Fandom Harbor 是一个以阅读体验为核心、以权限边界为底线的私域作品港口。
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          Reader 路由已开始使用 002A Content Service 合同组织作品、章节和文章。
          当前由可替换 fixture 提供内容，数据库验证完成后可切换到 Supabase
          Repository。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-control bg-primary px-4 py-3 text-primary-foreground"
            href="/search"
          >
            搜索作品与作者
          </Link>
          <Link
            className="rounded-control border border-border px-4 py-3"
            href="/works"
          >
            查看作品骨架
          </Link>
          <Link
            className="rounded-control border border-border px-4 py-3"
            href="/auth/sign-in"
          >
            登录 Reader
          </Link>
          <Link
            className="rounded-control border border-border px-4 py-3"
            href="/access"
          >
            邀请入口
          </Link>
        </div>
      </section>

      <section className="info-grid">
        {landingSignals.map((signal) => (
          <article className="stat-card" key={signal.label}>
            <p className="text-sm text-muted-foreground">{signal.label}</p>
            <p className="mt-2 text-xl font-semibold">{signal.value}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {signal.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="site-stack">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Preview Shelf</p>
            <h2 className="mt-3 text-2xl font-semibold">首页预览三部作品</h2>
          </div>
          <Link className="text-sm text-primary" href="/works">
            进入 Reader 列表
          </Link>
        </div>
        <div className="book-grid">
          {mockWorks.map((work) => (
            <article className="stat-card" key={work.slug}>
              <p className="text-sm text-muted-foreground">
                {work.fandom} · {work.rating} · {work.status}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{work.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                作者：
                <Link
                  className="text-primary"
                  href={`/author/${work.authorSlug}`}
                >
                  {work.authorName}
                </Link>
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {work.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {work.tags.map((tag) => (
                  <span
                    className="rounded-full border border-border px-2 py-1"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                className="mt-5 inline-flex text-sm text-primary"
                href={`/works/${work.slug}`}
              >
                查看作品详情
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

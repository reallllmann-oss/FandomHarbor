import Link from "next/link";

export default function StudioHomePage() {
  return (
    <div className="site-stack">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <span aria-current="page">Studio</span>
      </nav>

      <section className="reading-card max-w-none">
        <p className="eyebrow">Author Studio</p>
        <h1 className="mt-3 text-3xl font-semibold">内容管理工作区</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          从这里进入作品与独立文章列表，继续创建、编辑与发布自己的内容。这里保持专注，不展示与创作无关的统计信息。
        </p>
      </section>

      <section aria-labelledby="studio-sections-heading" className="site-stack">
        <h2 className="sr-only" id="studio-sections-heading">
          Studio 内容入口
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="stat-card">
            <p className="eyebrow">Works</p>
            <h3 className="mt-2 text-xl font-semibold">作品管理</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              查看作品标题、状态与更新时间。
            </p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center rounded-control text-primary"
              href="/studio/works"
            >
              打开作品列表 →
            </Link>
          </article>
          <article className="stat-card">
            <p className="eyebrow">Articles</p>
            <h3 className="mt-2 text-xl font-semibold">文章管理</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              查看独立文章、草稿状态与更新时间。
            </p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center rounded-control text-primary"
              href="/studio/articles"
            >
              打开文章列表 →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}

export default function DocsHomePage() {
  return (
    <section className="reading-card">
      <p className="text-sm font-medium text-primary">只读边界</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        项目文档浏览入口
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        当前仅建立应用边界和共享布局。根目录下的 `.ai/` 与 `docs/` Markdown
        仍是唯一事实源，本应用不会创建可编辑副本。
      </p>
    </section>
  );
}

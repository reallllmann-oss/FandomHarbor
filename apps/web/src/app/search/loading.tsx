export default function SearchLoading() {
  return (
    <div aria-busy="true" className="search-shell">
      <section className="search-orientation">
        <p className="eyebrow">主动发现</p>
        <h1>正在寻找作品与作者</h1>
        <p className="search-orientation-copy">
          正在沿着你的关键词查找已经公开的故事与创作者，请稍候。
        </p>
      </section>

      <section aria-hidden="true" className="search-query search-loading-query">
        <div className="search-query-copy">
          <div className="search-loading-line search-loading-line-title" />
          <div className="search-loading-line search-loading-line-copy" />
        </div>
        <div className="search-loading-form">
          <div className="search-loading-line search-loading-line-label" />
          <div className="search-loading-control" />
        </div>
      </section>

      <section aria-hidden="true" className="search-loading-results">
        <div className="search-loading-heading">
          <div className="search-loading-line search-loading-line-title" />
          <div className="search-loading-line" />
        </div>
        <div className="search-loading-list">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="search-loading-result" key={index}>
              <div className="search-loading-line search-loading-line-title" />
              <div className="search-loading-line search-loading-line-wide" />
              <div className="search-loading-line" />
            </div>
          ))}
        </div>
      </section>
      <span className="sr-only">正在查询公开作品与作者</span>
    </div>
  );
}

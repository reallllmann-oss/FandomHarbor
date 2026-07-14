export default function ArchiveLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="archive-shell">
      <section className="archive-orientation">
        <p className="eyebrow">作品归档</p>
        <h1>正在整理可浏览的故事</h1>
        <p className="archive-orientation-copy">
          正在读取已发布作品与当前浏览位置，请稍候。
        </p>
      </section>
      <section
        className="archive-controls archive-loading-controls"
        aria-hidden="true"
      >
        <div className="archive-loading-line archive-loading-line-wide" />
        <div className="archive-loading-control" />
      </section>
      <section className="archive-results" aria-hidden="true">
        <div className="archive-results-heading">
          <div className="archive-loading-line archive-loading-line-title" />
          <div className="archive-loading-line" />
        </div>
        <div className="archive-loading-list">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="archive-loading-work" key={index}>
              <div className="archive-loading-line archive-loading-line-title" />
              <div className="archive-loading-line archive-loading-line-wide" />
              <div className="archive-loading-line" />
            </div>
          ))}
        </div>
      </section>
      <span className="sr-only">正在打开作品归档</span>
    </div>
  );
}

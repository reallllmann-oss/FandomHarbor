export default function WorkDetailLoading() {
  return (
    <div aria-busy="true" className="work-detail-shell work-loading">
      <p className="sr-only" role="status">
        正在准备作品详情、公开章节与阅读入口。
      </p>

      <div aria-hidden="true" className="work-loading-breadcrumb">
        <span className="work-loading-line work-loading-line-label" />
      </div>

      <section aria-hidden="true" className="work-orientation">
        <span className="work-loading-line work-loading-line-label" />
        <span className="work-loading-line work-loading-line-title" />
        <span className="work-loading-line work-loading-line-copy" />
      </section>

      <section aria-hidden="true" className="work-premise work-loading-section">
        <div className="work-loading-heading">
          <span className="work-loading-line work-loading-line-label" />
          <span className="work-loading-line work-loading-line-heading" />
        </div>
        <div className="work-loading-copy">
          <span className="work-loading-line work-loading-line-wide" />
          <span className="work-loading-line work-loading-line-copy" />
        </div>
      </section>

      <section aria-hidden="true" className="work-context work-loading-context">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="work-loading-copy" key={index}>
            <span className="work-loading-line work-loading-line-label" />
            <span className="work-loading-line work-loading-line-value" />
          </div>
        ))}
      </section>

      <section
        aria-hidden="true"
        className="work-reading-decision work-loading-section"
      >
        <div className="work-loading-heading">
          <span className="work-loading-line work-loading-line-label" />
          <span className="work-loading-line work-loading-line-heading" />
        </div>
        <span className="work-loading-control" />
      </section>

      <section
        aria-hidden="true"
        className="work-chapters work-loading-section"
      >
        <div className="work-loading-heading">
          <span className="work-loading-line work-loading-line-label" />
          <span className="work-loading-line work-loading-line-heading" />
        </div>
        <div className="work-loading-chapter-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <span className="work-loading-chapter" key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AuthorProfileLoading() {
  return (
    <div
      aria-busy="true"
      aria-describedby="author-loading-status"
      className="author-profile-shell author-loading"
    >
      <p className="sr-only" id="author-loading-status" role="status">
        正在读取作者资料与已发布作品。
      </p>
      <section
        aria-labelledby="author-loading-title"
        className="author-identity"
      >
        <div className="author-identity-main">
          <div className="author-identity-heading">
            <div className="author-loading-avatar" />
            <div className="author-loading-heading">
              <div className="author-loading-line author-loading-line-label" />
              <h1 className="sr-only" id="author-loading-title">
                正在打开作者主页
              </h1>
              <div className="author-loading-line author-loading-line-title" />
            </div>
          </div>
          <div className="author-loading-copy">
            <div className="author-loading-line author-loading-line-wide" />
            <div className="author-loading-line" />
          </div>
          <div className="author-loading-metrics">
            <div className="author-loading-line" />
            <div className="author-loading-line" />
            <div className="author-loading-line" />
          </div>
        </div>
        <div className="author-loading-relationship">
          <div className="author-loading-line author-loading-line-label" />
          <div className="author-loading-line author-loading-line-wide" />
          <div className="author-loading-control" />
        </div>
      </section>

      <section aria-label="正在读取已发布作品" className="author-works">
        <div className="author-loading-works-heading">
          <div className="author-loading-line author-loading-line-title" />
          <div className="author-loading-line" />
        </div>
        <div className="author-loading-work-list">
          {[0, 1, 2].map((item) => (
            <div className="author-loading-work" key={item}>
              <div className="author-loading-line author-loading-line-label" />
              <div className="author-loading-line author-loading-line-title" />
              <div className="author-loading-line author-loading-line-wide" />
              <div className="author-loading-line" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

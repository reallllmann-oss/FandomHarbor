export default function AccessGovernanceLoading() {
  return (
    <div aria-live="polite" className="site-stack" role="status">
      <section className="hero-panel">
        <p className="eyebrow">Identity &amp; Access Governance</p>
        <h1 className="mt-3 text-3xl font-semibold">正在读取身份与权限…</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          正在通过受控读取链路重新验证当前访问并加载脱敏治理信息。
        </p>
      </section>
      <div className="info-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="stat-card min-h-32 animate-pulse" key={index} />
        ))}
      </div>
    </div>
  );
}

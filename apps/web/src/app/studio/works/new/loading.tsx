export default function CreateWorkLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="正在加载新建作品表单"
      className="site-stack"
    >
      <div className="h-5 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="reading-card max-w-none">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-10 w-56 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="reading-card max-w-none">
          <div className="h-11 animate-pulse rounded-control bg-surface-muted" />
          <div className="mt-6 h-40 animate-pulse rounded-control bg-surface-muted" />
          <div className="mt-6 h-11 animate-pulse rounded-control bg-surface-muted" />
        </div>
        <div className="stat-card">
          <div className="aspect-[2/3] animate-pulse rounded-card bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

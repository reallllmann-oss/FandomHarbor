import Link from "next/link";

export default function WorkDetailNotFound() {
  return (
    <section
      aria-labelledby="work-not-found-title"
      className="work-state work-not-found"
    >
      <p className="eyebrow">作品未找到</p>
      <h1 id="work-not-found-title">这里没有可公开阅读的作品</h1>
      <p>
        这个地址不存在、内容已失效，或作品尚未公开。你可以返回作品档案，或通过搜索寻找其他公开内容。
      </p>
      <nav aria-label="作品未找到恢复路径" className="work-state-actions">
        <Link className="work-secondary-action" href="/archive">
          浏览作品档案
        </Link>
        <Link className="work-text-action" href="/search">
          搜索作品或作者
        </Link>
        <Link className="work-text-action" href="/works">
          返回阅读目录
        </Link>
      </nav>
    </section>
  );
}

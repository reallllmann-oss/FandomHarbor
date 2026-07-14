"use client";

import { RetryButton } from "@fandom-harbor/ui";
import Link from "next/link";

export default function WorkDetailError({ reset }: { reset: () => void }) {
  return (
    <section
      aria-labelledby="work-error-title"
      className="work-state work-error"
      role="alert"
    >
      <p className="eyebrow">作品暂不可用</p>
      <h1 id="work-error-title">这次没有顺利打开作品</h1>
      <p>你可以重新尝试，或返回公共作品档案与搜索，继续寻找其他可读内容。</p>
      <div className="work-state-actions">
        <RetryButton onRetry={reset} />
        <Link className="work-secondary-action" href="/archive">
          浏览作品档案
        </Link>
        <Link className="work-text-action" href="/search">
          前往搜索
        </Link>
      </div>
    </section>
  );
}

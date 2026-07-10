"use client";

import { RetryButton, StatusPage } from "@fandom-harbor/ui";

export default function AuthorProfileError({ reset }: { reset: () => void }) {
  return (
    <div aria-live="assertive" role="alert">
      <StatusPage
        action={<RetryButton onRetry={reset} />}
        description="作者资料暂时无法读取，请稍后重试。"
        eyebrow="加载失败"
        title="作者主页暂时离港"
      />
    </div>
  );
}

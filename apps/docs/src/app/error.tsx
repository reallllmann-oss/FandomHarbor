"use client";

import { RetryButton, StatusPage } from "@fandom-harbor/ui";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <StatusPage
      action={<RetryButton onRetry={reset} />}
      description="文档入口暂时无法显示，源文档未受影响。"
      eyebrow="发生错误"
      title="文档入口载入失败"
    />
  );
}

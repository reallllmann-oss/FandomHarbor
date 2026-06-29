"use client";

import { RetryButton, StatusPage } from "@fandom-harbor/ui";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <StatusPage
      action={<RetryButton onRetry={reset} />}
      description="页面暂时无法显示。你可以重试，或稍后返回。"
      eyebrow="发生错误"
      title="这次没有顺利靠岸"
    />
  );
}

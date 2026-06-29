"use client";

import { RetryButton, StatusPage } from "@fandom-harbor/ui";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <StatusPage
      action={<RetryButton onRetry={reset} />}
      description="后台页面暂时无法显示，尚未执行任何管理操作。"
      eyebrow="发生错误"
      title="管理工作区载入失败"
    />
  );
}

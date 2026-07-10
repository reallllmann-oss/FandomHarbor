"use client";

import { Button, RetryButton, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <div aria-live="assertive" role="alert">
      <StatusPage
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <RetryButton onRetry={reset} />
            <Button asChild variant="outline">
              <Link href="/works">返回阅读目录</Link>
            </Button>
          </div>
        }
        description="页面暂时无法显示。你可以重试，或返回阅读目录选择其他内容。"
        eyebrow="发生错误"
        title="这次没有顺利靠岸"
      />
    </div>
  );
}

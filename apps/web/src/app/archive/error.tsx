"use client";

import { Button, RetryButton, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function ArchiveError({ reset }: { reset: () => void }) {
  return (
    <div aria-live="assertive" role="alert">
      <StatusPage
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <RetryButton onRetry={reset} />
            <Button asChild variant="outline">
              <Link href="/archive">返回 Archive 首页</Link>
            </Button>
          </div>
        }
        description="公开作品暂时无法读取。你可以重试，或返回 Archive 默认页面。"
        eyebrow="Archive 错误"
        title="浏览航线暂时中断"
      />
    </div>
  );
}

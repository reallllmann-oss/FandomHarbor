"use client";

import { Button, RetryButton, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <div aria-live="assertive" role="alert">
      <StatusPage
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <RetryButton onRetry={reset} />
            <Button asChild variant="outline">
              <Link href="/search">清空并重新搜索</Link>
            </Button>
          </div>
        }
        description="公开搜索暂时无法完成。你可以重试，或清空关键词后重新开始。"
        eyebrow="搜索失败"
        title="这次没有找到航线"
      />
    </div>
  );
}

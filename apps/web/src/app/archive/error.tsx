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
              <Link href="/archive">返回作品归档</Link>
            </Button>
          </div>
        }
        description="公开作品暂时无法读取。你可以重试，或返回作品归档的默认浏览页。"
        eyebrow="归档浏览错误"
        title="浏览航线暂时中断"
      />
    </div>
  );
}

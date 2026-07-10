import { Button, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <StatusPage
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/works">返回阅读目录</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/archive">打开本地书架</Link>
          </Button>
        </div>
      }
      description="这个地址不存在、内容已失效，或当前内容尚未开放。你可以返回阅读目录，或从本地书架选择其他记录。"
      eyebrow="404"
      title="没有找到这个页面"
    />
  );
}

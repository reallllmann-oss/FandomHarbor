import { Button, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <StatusPage
      action={
        <Button asChild>
          <Link href="/">返回文档首页</Link>
        </Button>
      }
      description="该文档页面尚不存在。"
      eyebrow="404"
      title="没有找到这个文档页面"
    />
  );
}

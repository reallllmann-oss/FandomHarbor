import { Button, StatusPage } from "@fandom-harbor/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <StatusPage
      action={
        <Button asChild>
          <Link href="/">返回后台首页</Link>
        </Button>
      }
      description="该管理页面不存在。"
      eyebrow="404"
      title="没有找到这个后台页面"
    />
  );
}

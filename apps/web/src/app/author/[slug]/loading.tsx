import { StatusPage } from "@fandom-harbor/ui";

export default function AuthorProfileLoading() {
  return (
    <StatusPage
      description="正在读取作者资料与已发布作品。"
      eyebrow="加载中"
      title="正在打开作者主页"
    />
  );
}

import { StatusPage } from "@fandom-harbor/ui";

export default function SearchLoading() {
  return (
    <StatusPage
      description="正在检查公开作品与作者资料。"
      eyebrow="搜索中"
      title="正在寻找结果"
    />
  );
}

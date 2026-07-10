import { StatusPage } from "@fandom-harbor/ui";

export default function ArchiveLoading() {
  return (
    <StatusPage
      description="正在读取已发布作品与当前页码。"
      eyebrow="加载中"
      title="正在打开 Archive"
    />
  );
}

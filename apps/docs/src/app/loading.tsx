import { StatusPage } from "@fandom-harbor/ui";

export default function Loading() {
  return (
    <StatusPage
      description="正在准备只读文档入口。"
      eyebrow="加载中"
      title="正在载入项目文档"
    />
  );
}

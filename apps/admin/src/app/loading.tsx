import { StatusPage } from "@fandom-harbor/ui";

export default function Loading() {
  return (
    <StatusPage
      description="正在准备管理工作区。"
      eyebrow="加载中"
      title="正在载入后台"
    />
  );
}

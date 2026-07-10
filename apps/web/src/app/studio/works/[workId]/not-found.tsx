import { StudioDetailNotFound } from "../../studio-states";

export default function StudioWorkNotFound() {
  return (
    <StudioDetailNotFound
      description="这个作品不存在，或不属于当前作者。你可以返回作品列表继续查看自己的内容。"
      listHref="/studio/works"
      listLabel="返回作品列表"
      title="无法打开这个作品"
    />
  );
}

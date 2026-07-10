import { StudioDetailNotFound } from "../../studio-states";

export default function StudioArticleNotFound() {
  return (
    <StudioDetailNotFound
      description="这篇文章不存在，或不属于当前作者。你可以返回文章列表继续查看自己的内容。"
      listHref="/studio/articles"
      listLabel="返回文章列表"
      title="无法打开这篇文章"
    />
  );
}

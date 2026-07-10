export const workStudioActions = [
  "新建章节",
  "编辑作品",
  "发布作品",
  "归档作品",
] as const;

export const articleStudioActions = [
  "新建文章",
  "编辑文章",
  "发布文章",
  "归档文章",
] as const;

export const createWorkStudioActions = ["保存草稿", "发布"] as const;

export function disabledStudioActionProps(label: string) {
  return {
    disabled: true,
    title: `${label}将在后续 Step 开放`,
    type: "button" as const,
  };
}

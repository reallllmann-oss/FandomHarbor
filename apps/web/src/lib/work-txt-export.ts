import type { Chapter, Work } from "@fandom-harbor/services";

import { contentDocumentToPlainText } from "./content-document-text";

export function publishedWorkTxtFileName(title: string) {
  const normalized = title.replace(/[\\/:*?"<>|\u0000-\u001f]/gu, " ").trim();
  return `${normalized || "Fandom Harbor 作品"}.txt`;
}

export function buildPublishedWorkTxt(input: {
  authorName: string;
  chapters: Chapter[];
  work: Work;
}) {
  if (input.work.status !== "published") {
    throw new Error("Only published works can be exported");
  }
  const chapters = input.chapters
    .filter((chapter) => chapter.status === "published")
    .toSorted((left, right) => left.position - right.position);
  return [
    input.work.title,
    `作者：${input.authorName}`,
    "",
    input.work.summary,
    "",
    ...chapters.flatMap((chapter) => [
      chapter.title,
      "",
      contentDocumentToPlainText(chapter.content),
      "",
    ]),
  ].join("\n");
}

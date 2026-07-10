import type { Chapter, Work } from "@fandom-harbor/services";
import { describe, expect, it } from "vitest";

import {
  buildPublishedWorkTxt,
  publishedWorkTxtFileName,
} from "./work-txt-export";

const work: Work = {
  categoryId: null,
  createdAt: new Date(),
  id: "10000000-0000-4000-8000-000000000001",
  publishedAt: new Date(),
  slug: "harbor",
  status: "published",
  summary: "作品简介",
  title: "Harbor / Light",
  updatedAt: new Date(),
};

function chapter(position: number, status: Chapter["status"]): Chapter {
  return {
    content: {
      content: [
        {
          content: [{ text: `正文 ${position}`, type: "text" }],
          type: "paragraph",
        },
      ],
      type: "doc",
    },
    contentSchemaVersion: 1,
    createdAt: new Date(),
    id: `20000000-0000-4000-8000-00000000000${position}`,
    position,
    publishedAt: status === "published" ? new Date() : null,
    slug: `chapter-${position}`,
    status,
    title: `第 ${position} 章`,
    updatedAt: new Date(),
    workId: work.id,
  };
}

describe("published Work TXT export", () => {
  it("exports published chapters in position order and excludes drafts", () => {
    const text = buildPublishedWorkTxt({
      authorName: "Harbor Author",
      chapters: [
        chapter(2, "published"),
        chapter(3, "draft"),
        chapter(1, "published"),
      ],
      work,
    });
    expect(text).toContain("Harbor Author");
    expect(text.indexOf("第 1 章")).toBeLessThan(text.indexOf("第 2 章"));
    expect(text).not.toContain("第 3 章");
  });

  it("rejects draft works and creates a readable safe filename", () => {
    expect(() =>
      buildPublishedWorkTxt({
        authorName: "A",
        chapters: [],
        work: { ...work, status: "draft" },
      }),
    ).toThrow();
    expect(publishedWorkTxtFileName(work.title)).toBe("Harbor   Light.txt");
  });
});

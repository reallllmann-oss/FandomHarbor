import { describe, expect, it } from "vitest";

import {
  contentDocumentToPlainText,
  plainTextToContentDocument,
} from "./content-document-text";

describe("draft content plain-text projection", () => {
  it("projects structured chapter paragraphs into editable plain text", () => {
    expect(
      contentDocumentToPlainText({
        content: [
          {
            content: [{ text: "第一段", type: "text" }],
            type: "paragraph",
          },
          {
            content: [
              { text: "第二段", type: "text" },
              { type: "hardBreak" },
              { text: "换行", type: "text" },
            ],
            type: "paragraph",
          },
        ],
        type: "doc",
      }),
    ).toBe("第一段\n\n第二段\n换行");
  });

  it("fails closed to an empty editor for an unknown document shape", () => {
    expect(contentDocumentToPlainText({ type: "doc" })).toBe("");
  });

  it("projects plain text back into the minimal content document shape", () => {
    expect(plainTextToContentDocument("第一段\n\n第二段\n换行")).toEqual({
      content: [
        {
          content: [{ text: "第一段", type: "text" }],
          type: "paragraph",
        },
        {
          content: [
            { text: "第二段", type: "text" },
            { type: "hardBreak" },
            { text: "换行", type: "text" },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
    });
  });
});

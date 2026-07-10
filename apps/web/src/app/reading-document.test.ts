import type { ContentDocument } from "@fandom-harbor/services";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createReadingDocumentContent } from "./reading-document-content";

describe("reading document", () => {
  it("renders supported structured nodes without trusting raw HTML", () => {
    const document: ContentDocument = {
      content: [
        {
          content: [
            {
              marks: [{ type: "bold" }],
              text: "Safe harbor",
              type: "text",
            },
            { text: " <script>unsafe()</script>", type: "text" },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
    };

    const markup = renderToStaticMarkup(
      createElement("div", null, createReadingDocumentContent(document)),
    );

    expect(markup).toContain("<strong>Safe harbor</strong>");
    expect(markup).toContain("&lt;script&gt;unsafe()&lt;/script&gt;");
    expect(markup).not.toContain("<script>");
  });
});

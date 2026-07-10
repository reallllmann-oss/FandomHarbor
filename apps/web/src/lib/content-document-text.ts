import type { ContentDocument, JsonValue } from "@fandom-harbor/services";

function isRecord(
  value: JsonValue | undefined,
): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textFromNode(node: Record<string, JsonValue>): string {
  if (node.type === "hardBreak") return "\n";
  if (node.type === "text")
    return typeof node.text === "string" ? node.text : "";

  return Array.isArray(node.content)
    ? node.content.filter(isRecord).map(textFromNode).join("")
    : "";
}

export function contentDocumentToPlainText(document: ContentDocument) {
  const content = document.content;
  if (!Array.isArray(content)) return "";

  return content
    .filter(isRecord)
    .map(textFromNode)
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function plainTextToContentDocument(body: string): ContentDocument {
  const normalized = body.replace(/\r\n/g, "\n");
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      const content: Array<Record<string, JsonValue>> = [];

      for (const [lineIndex, line] of lines.entries()) {
        if (lineIndex > 0) {
          content.push({ type: "hardBreak" });
        }
        content.push({ text: line, type: "text" });
      }

      return {
        content,
        type: "paragraph",
      };
    });

  return {
    content: paragraphs,
    type: "doc",
  };
}

import type { ContentDocument, JsonValue } from "@fandom-harbor/services";
import { createElement, type ReactNode } from "react";

function isRecord(
  value: JsonValue | undefined,
): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function childNodes(
  node: Record<string, JsonValue>,
): Record<string, JsonValue>[] {
  const content = node.content;
  return Array.isArray(content) ? content.filter(isRecord) : [];
}

function textContent(node: Record<string, JsonValue>, key: string): ReactNode {
  if (node.type === "hardBreak") return createElement("br", { key });
  if (node.type !== "text" || typeof node.text !== "string") return null;

  let content: ReactNode = node.text;
  const marks = Array.isArray(node.marks) ? node.marks.filter(isRecord) : [];

  for (const [index, mark] of marks.entries()) {
    if (mark.type === "bold") {
      content = createElement(
        "strong",
        { key: `${key}-bold-${index}` },
        content,
      );
    }
    if (mark.type === "italic") {
      content = createElement("em", { key: `${key}-italic-${index}` }, content);
    }
  }

  return content;
}

function inlineContent(node: Record<string, JsonValue>, key: string) {
  return childNodes(node).map((child, index) =>
    textContent(child, `${key}-inline-${index}`),
  );
}

function blockContent(node: Record<string, JsonValue>, key: string): ReactNode {
  const children = childNodes(node);
  const nested = () =>
    children.map((child, index) => blockContent(child, `${key}-${index}`));

  switch (node.type) {
    case "paragraph":
      return createElement("p", { key }, inlineContent(node, key));
    case "heading": {
      const tag = isRecord(node.attrs) && node.attrs.level === 3 ? "h3" : "h2";
      return createElement(tag, { key }, inlineContent(node, key));
    }
    case "blockquote":
      return createElement("blockquote", { key }, nested());
    case "bulletList":
      return createElement("ul", { key }, nested());
    case "orderedList":
      return createElement("ol", { key }, nested());
    case "listItem":
      return createElement("li", { key }, nested());
    default:
      return nested();
  }
}

export function createReadingDocumentContent(document: ContentDocument) {
  return childNodes(document).map((node, index) =>
    blockContent(node, `block-${index}`),
  );
}

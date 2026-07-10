import type { ContentDocument } from "@fandom-harbor/services";

import { createReadingDocumentContent } from "./reading-document-content";

export function ReadingDocument({ document }: { document: ContentDocument }) {
  return (
    <div className="reader-prose">{createReadingDocumentContent(document)}</div>
  );
}

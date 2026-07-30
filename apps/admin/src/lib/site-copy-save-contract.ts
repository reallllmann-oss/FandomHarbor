import type {
  SiteCopyErrorCode,
  SiteCopyFieldId,
} from "@fandom-harbor/services";

export type SiteCopySaveActionState =
  | { status: "idle" }
  | {
      code: SiteCopyErrorCode;
      message: string;
      requestId: string | null;
      status: "error";
    }
  | {
      auditLogId: string;
      changedFields: SiteCopyFieldId[];
      requestId: string;
      revisionId: string;
      status: "saved";
      updatedAt: string;
      version: string;
    }
  | {
      requestId: string;
      revisionId: string;
      status: "unchanged";
      version: string;
    }
  | {
      currentRevisionId: string;
      currentVersion: string;
      requestId: string;
      status: "conflict";
    };

export const INITIAL_SITE_COPY_SAVE_STATE = {
  status: "idle",
} as const satisfies SiteCopySaveActionState;

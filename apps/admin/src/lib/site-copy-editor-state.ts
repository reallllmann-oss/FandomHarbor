import {
  diffSiteCopy,
  normalizeSiteCopyField,
  normalizeSiteCopyReason,
  parseSiteCopyRequestId,
  parseSiteCopyUuid,
  SITE_COPY_FIELD_IDS,
  SITE_COPY_FIELD_LIMITS,
  SiteCopyDomainError,
  type SiteCopyContent,
  type SiteCopyFieldId,
} from "@fandom-harbor/services";

import type { SiteCopySaveActionState } from "./site-copy-save-contract";

const POSITIVE_DECIMAL_PATTERN = /^[1-9][0-9]*$/u;

export interface SiteCopyReviewIntent {
  baseRevisionId: string;
  baseVersion: string;
  changedFields: SiteCopyFieldId[];
  content: SiteCopyContent;
  reason: string;
  requestId: string;
}

export interface SiteCopyReviewErrors {
  fields: Partial<Record<SiteCopyFieldId, string>>;
  reason?: string;
}

export type SiteCopyReviewPreparation =
  | {
      errors: SiteCopyReviewErrors;
      status: "invalid";
    }
  | {
      intent: SiteCopyReviewIntent;
      status: "ready";
    };

export interface SiteCopyEditorBaseline {
  content: SiteCopyContent;
  revisionId: string;
  version: string;
}

export interface SiteCopyCompletedBaseline extends SiteCopyEditorBaseline {
  status: "saved" | "unchanged";
}

export function parsePositiveVersion(value: unknown): bigint {
  if (typeof value !== "string" || !POSITIVE_DECIMAL_PATTERN.test(value)) {
    throw new SiteCopyDomainError(
      "INVALID_INPUT",
      "baseVersion must be a positive decimal bigint",
    );
  }
  return BigInt(value);
}

function fieldError(field: SiteCopyFieldId): string {
  const { max, min } = SITE_COPY_FIELD_LIMITS[field];
  return `请输入 ${min}–${max} 个有效 Unicode 字符；不允许换行或控制字符。`;
}

export function prepareSiteCopyReview(
  input: {
    baseline: SiteCopyEditorBaseline;
    draft: SiteCopyContent;
    reason: string;
  },
  requestIdFactory: () => string = () => crypto.randomUUID(),
): SiteCopyReviewPreparation {
  const fields: Partial<Record<SiteCopyFieldId, string>> = {};
  const normalized = {} as SiteCopyContent;

  for (const field of SITE_COPY_FIELD_IDS) {
    try {
      normalized[field] = normalizeSiteCopyField(field, input.draft[field]);
    } catch {
      fields[field] = fieldError(field);
    }
  }

  let reason: string | undefined;
  try {
    reason = normalizeSiteCopyReason(input.reason);
  } catch {
    reason = undefined;
  }

  if (Object.keys(fields).length > 0 || reason === undefined) {
    return {
      errors: {
        fields,
        ...(reason === undefined
          ? {
              reason:
                "请输入 4–200 个有效 Unicode 字符；不允许换行或控制字符。",
            }
          : {}),
      },
      status: "invalid",
    };
  }

  parsePositiveVersion(input.baseline.version);
  const baseRevisionId = parseSiteCopyUuid(
    input.baseline.revisionId,
    "baseRevisionId",
  );
  const requestId = parseSiteCopyRequestId(requestIdFactory());

  return {
    intent: {
      baseRevisionId,
      baseVersion: input.baseline.version,
      changedFields: diffSiteCopy(input.baseline.content, normalized),
      content: normalized,
      reason,
      requestId,
    },
    status: "ready",
  };
}

export function completedBaseline(
  intent: SiteCopyReviewIntent,
  result: SiteCopySaveActionState,
): SiteCopyCompletedBaseline | null {
  if (result.status !== "saved" && result.status !== "unchanged") {
    return null;
  }
  if (result.requestId !== intent.requestId) return null;

  return {
    content: intent.content,
    revisionId: result.revisionId,
    status: result.status,
    version: result.version,
  };
}

export function resultMatchesIntent(
  intent: SiteCopyReviewIntent | null,
  result: SiteCopySaveActionState,
): boolean {
  if (!intent || result.status === "idle") return false;
  return result.requestId === null || result.requestId === intent.requestId;
}

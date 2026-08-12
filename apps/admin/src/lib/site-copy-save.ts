import {
  parseAdminSiteCopySaveInput,
  parseSiteCopyRequestId,
  requireSiteCopyAdmin,
  SiteCopyDomainError,
  type AdminSiteCopySaveInput,
  type AdminSiteCopySaveResult,
  type SiteCopyContent,
  type SiteCopyErrorCode,
} from "@fandom-harbor/services";
import type { TrustedAccessContext } from "@fandom-harbor/auth";

import { getAdminAccessContext } from "./identity-access";
import { saveAdminSiteCopy } from "./site-copy";
import { parsePositiveVersion } from "./site-copy-editor-state";
import type { SiteCopySaveActionState } from "./site-copy-save-contract";

interface SiteCopySaveDependencies {
  getAccessContext(): Promise<TrustedAccessContext | null>;
  save(
    access: TrustedAccessContext,
    input: AdminSiteCopySaveInput,
  ): Promise<AdminSiteCopySaveResult>;
}

const defaultDependencies: SiteCopySaveDependencies = {
  getAccessContext: getAdminAccessContext,
  save: saveAdminSiteCopy,
};

const safeErrorMessages: Readonly<Record<SiteCopyErrorCode, string>> = {
  DATA_CORRUPTION:
    "数据库返回的站点文案状态不可信，未保存任何变更。请停止操作并联系维护者。",
  FORBIDDEN: "当前账号没有保存站点文案的权限。",
  INVALID_INPUT: "保存内容或变更说明不符合站点文案合同，请检查后重试。",
  REPOSITORY_UNAVAILABLE:
    "站点文案暂时无法保存。你的输入仍保留，可以稍后使用同一保存请求重试。",
  UNAUTHENTICATED: "登录状态已失效，请重新登录后再保存。",
  UNKNOWN_REPOSITORY_ERROR:
    "保存没有完成。你的输入仍保留，请稍后重试或联系维护者。",
};

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") {
    throw new SiteCopyDomainError("INVALID_INPUT", `${name} is required`);
  }
  return value;
}

function contentFromForm(formData: FormData): SiteCopyContent {
  return {
    footer_brand_note: formString(formData, "footer_brand_note"),
    homepage_introduction: formString(formData, "homepage_introduction"),
    homepage_primary_cta_label: formString(
      formData,
      "homepage_primary_cta_label",
    ),
    homepage_secondary_cta_label: formString(
      formData,
      "homepage_secondary_cta_label",
    ),
    homepage_title: formString(formData, "homepage_title"),
    navigation_archive_label: formString(formData, "navigation_archive_label"),
    navigation_search_label: formString(formData, "navigation_search_label"),
    navigation_studio_label: formString(formData, "navigation_studio_label"),
  };
}

function requestIdForError(formData: FormData): string | null {
  try {
    return parseSiteCopyRequestId(formData.get("requestId"));
  } catch {
    return null;
  }
}

function inputFromForm(formData: FormData): AdminSiteCopySaveInput {
  return parseAdminSiteCopySaveInput({
    baseRevisionId: formString(formData, "baseRevisionId"),
    baseVersion: parsePositiveVersion(formData.get("baseVersion")),
    content: contentFromForm(formData),
    reason: formString(formData, "reason"),
    requestId: formString(formData, "requestId"),
  });
}

function serializedResult(
  requestId: string,
  result: AdminSiteCopySaveResult,
): SiteCopySaveActionState {
  if (result.status === "conflict") {
    return {
      currentRevisionId: result.currentRevisionId,
      currentVersion: result.currentVersion.toString(10),
      requestId,
      status: "conflict",
    };
  }
  if (result.status === "unchanged") {
    return {
      requestId,
      revisionId: result.revisionId,
      status: "unchanged",
      version: result.version.toString(10),
    };
  }

  return {
    auditLogId: result.auditLogId.toString(10),
    changedFields: result.changedFields,
    requestId,
    revisionId: result.revisionId,
    status: "saved",
    updatedAt: result.updatedAt.toISOString(),
    version: result.version.toString(10),
  };
}

function safeError(
  error: unknown,
  requestId: string | null,
): SiteCopySaveActionState {
  const code =
    error instanceof SiteCopyDomainError
      ? error.code
      : "UNKNOWN_REPOSITORY_ERROR";
  return {
    code,
    message: safeErrorMessages[code],
    requestId,
    status: "error",
  };
}

export async function executeSiteCopySave(
  formData: FormData,
  dependencies: SiteCopySaveDependencies = defaultDependencies,
): Promise<SiteCopySaveActionState> {
  let requestId: string | null = null;

  try {
    const access = await dependencies.getAccessContext();
    requireSiteCopyAdmin(access);
    requestId = requestIdForError(formData);
    const input = inputFromForm(formData);
    const result = await dependencies.save(access, input);
    return serializedResult(input.requestId, result);
  } catch (error) {
    return safeError(error, requestId);
  }
}

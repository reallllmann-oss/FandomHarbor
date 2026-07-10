import { describe, expect, it } from "vitest";

import {
  EMPTY_WORK_FORM_VALUES,
  validateWorkForm,
  WORK_DESCRIPTION_MAX_LENGTH,
  WORK_TITLE_MAX_LENGTH,
} from "./work-form-validation";

describe("Create Work UI Shell validation", () => {
  it("requires a non-whitespace title", () => {
    expect(
      validateWorkForm({ ...EMPTY_WORK_FORM_VALUES, title: "   " }),
    ).toMatchObject({ title: "请输入作品标题。" });
  });

  it("enforces the title maximum length", () => {
    expect(
      validateWorkForm({
        ...EMPTY_WORK_FORM_VALUES,
        title: "a".repeat(WORK_TITLE_MAX_LENGTH + 1),
      }),
    ).toMatchObject({
      title: `作品标题不能超过 ${WORK_TITLE_MAX_LENGTH} 个字符。`,
    });
  });

  it("rejects control characters in a title", () => {
    expect(
      validateWorkForm({
        ...EMPTY_WORK_FORM_VALUES,
        title: "Harbor\u0000Lights",
      }),
    ).toMatchObject({ title: "作品标题包含不可使用的控制字符。" });
  });

  it("enforces the description maximum length", () => {
    expect(
      validateWorkForm({
        ...EMPTY_WORK_FORM_VALUES,
        description: "a".repeat(WORK_DESCRIPTION_MAX_LENGTH + 1),
        title: "Harbor Lights",
      }),
    ).toMatchObject({
      description: `作品简介不能超过 ${WORK_DESCRIPTION_MAX_LENGTH} 个字符。`,
    });
  });

  it("accepts a valid draft form state", () => {
    expect(
      validateWorkForm({
        category: "21000000-0000-4000-8000-000000000001",
        description: "一部准备保存的作品草稿。",
        tags: ["22000000-0000-4000-8000-000000000001"],
        title: "Harbor Lights",
      }),
    ).toEqual({});
  });
});

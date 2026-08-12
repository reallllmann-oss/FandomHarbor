import {
  SITE_COPY_BASELINE_V1,
  SITE_COPY_FIELD_IDS,
  SITE_COPY_FIELD_LIMITS,
  type SiteCopyContent,
} from "@fandom-harbor/services";
import { describe, expect, it } from "vitest";

import {
  completedBaseline,
  parsePositiveVersion,
  prepareSiteCopyReview,
  resultMatchesIntent,
  type SiteCopyEditorBaseline,
} from "./site-copy-editor-state";

const baseRevisionId = "30000000-0000-4000-8000-000000000011";
const firstRequestId = "40000000-0000-4000-8000-000000000011";
const secondRequestId = "40000000-0000-4000-8000-000000000012";
const baseline = {
  content: { ...SITE_COPY_BASELINE_V1 },
  revisionId: baseRevisionId,
  version: "9007199254740993",
} satisfies SiteCopyEditorBaseline;

function review(
  draft: SiteCopyContent,
  reason = "更新站点文案",
  requestId = firstRequestId,
) {
  return prepareSiteCopyReview({ baseline, draft, reason }, () => requestId);
}

describe("Site Copy editor review contract", () => {
  it("accepts reason boundaries 4 and 200 after normalization", () => {
    const four = review({ ...baseline.content }, "  e\u0301abc  ");
    const twoHundred = review(
      { ...baseline.content },
      `  ${"理".repeat(200)}  `,
    );

    expect(four).toMatchObject({
      intent: { reason: "éabc" },
      status: "ready",
    });
    expect(twoHundred).toMatchObject({
      intent: { reason: "理".repeat(200) },
      status: "ready",
    });
  });

  it.each([
    ["3 code points", "理由短"],
    ["trimmed to 3", "  理由短  "],
    ["201 code points", "理".repeat(201)],
    ["control character", "有效\u0000原因"],
    ["line break", "有效\n原因"],
  ])("rejects invalid reason: %s", (_label, reason) => {
    expect(review({ ...baseline.content }, reason)).toMatchObject({
      errors: { reason: expect.any(String) },
      status: "invalid",
    });
  });

  it("normalizes NFC and trim before calculating actual changes", () => {
    const normalizedBaseline = {
      ...baseline,
      content: {
        ...baseline.content,
        homepage_title: "Café",
      },
    };
    const result = prepareSiteCopyReview(
      {
        baseline: normalizedBaseline,
        draft: {
          ...normalizedBaseline.content,
          homepage_title: "  Cafe\u0301  ",
        },
        reason: "  复核规范化  ",
      },
      () => firstRequestId,
    );

    expect(result).toMatchObject({
      intent: {
        changedFields: [],
        content: { homepage_title: "Café" },
        reason: "复核规范化",
      },
      status: "ready",
    });
  });

  it("validates every field with code-point, control and newline semantics", () => {
    for (const field of SITE_COPY_FIELD_IDS) {
      const limit = SITE_COPY_FIELD_LIMITS[field];
      const atMaximum = review({
        ...baseline.content,
        [field]: "文".repeat(limit.max),
      });
      const empty = review({ ...baseline.content, [field]: "   " });
      const tooLong = review({
        ...baseline.content,
        [field]: "文".repeat(limit.max + 1),
      });
      const control = review({
        ...baseline.content,
        [field]: "有效\u0000",
      });
      const newline = review({
        ...baseline.content,
        [field]: "有效\n",
      });

      expect(atMaximum.status).toBe("ready");
      expect(empty).toMatchObject({
        errors: { fields: { [field]: expect.any(String) } },
        status: "invalid",
      });
      expect(tooLong).toMatchObject({
        errors: { fields: { [field]: expect.any(String) } },
        status: "invalid",
      });
      expect(control).toMatchObject({
        errors: { fields: { [field]: expect.any(String) } },
        status: "invalid",
      });
      expect(newline).toMatchObject({
        errors: { fields: { [field]: expect.any(String) } },
        status: "invalid",
      });
    }
  });

  it("counts astral Unicode characters as code points rather than UTF-16 units", () => {
    const result = review({
      ...baseline.content,
      homepage_title: "𠮷".repeat(40),
    });

    expect(result.status).toBe("ready");
  });

  it("creates a new request identity for each new review intent", () => {
    const first = review(
      { ...baseline.content, homepage_title: "Harbor One" },
      "第一次修改",
      firstRequestId,
    );
    const second = review(
      { ...baseline.content, homepage_title: "Harbor Two" },
      "第二次修改",
      secondRequestId,
    );

    expect(first).toMatchObject({
      intent: { requestId: firstRequestId },
      status: "ready",
    });
    expect(second).toMatchObject({
      intent: { requestId: secondRequestId },
      status: "ready",
    });
  });

  it("updates the local baseline only for matching Saved or Unchanged results", () => {
    const prepared = review({
      ...baseline.content,
      homepage_title: "Fandom Harbor Library",
    });
    if (prepared.status !== "ready") throw new Error("review failed");

    expect(
      completedBaseline(prepared.intent, {
        auditLogId: "9007199254740994",
        changedFields: ["homepage_title"],
        requestId: firstRequestId,
        revisionId: "30000000-0000-4000-8000-000000000012",
        status: "saved",
        updatedAt: "2026-07-31T00:00:00.000Z",
        version: "9007199254740994",
      }),
    ).toEqual({
      content: prepared.intent.content,
      revisionId: "30000000-0000-4000-8000-000000000012",
      status: "saved",
      version: "9007199254740994",
    });

    expect(
      completedBaseline(prepared.intent, {
        currentRevisionId: "30000000-0000-4000-8000-000000000099",
        currentVersion: "9007199254740099",
        requestId: firstRequestId,
        status: "conflict",
      }),
    ).toBeNull();
    expect(
      completedBaseline(prepared.intent, {
        code: "REPOSITORY_UNAVAILABLE",
        message: "safe",
        requestId: firstRequestId,
        status: "error",
      }),
    ).toBeNull();
  });

  it("ignores a late result from an older request intent", () => {
    const prepared = review({ ...baseline.content });
    if (prepared.status !== "ready") throw new Error("review failed");

    const result = {
      requestId: secondRequestId,
      revisionId: baseRevisionId,
      status: "unchanged",
      version: baseline.version,
    } as const;

    expect(resultMatchesIntent(prepared.intent, result)).toBe(false);
    expect(completedBaseline(prepared.intent, result)).toBeNull();
  });

  it("parses arbitrarily large canonical decimal versions without number conversion", () => {
    expect(parsePositiveVersion("9007199254740993123456789")).toBe(
      9007199254740993123456789n,
    );
    for (const value of ["", "0", "-1", "1.5", "1e3", "01", 2]) {
      expect(() => parsePositiveVersion(value)).toThrow();
    }
  });
});

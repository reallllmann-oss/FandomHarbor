import { describe, expect, it } from "vitest";

import {
  articleStudioActions,
  createWorkStudioActions,
  disabledStudioActionProps,
  workStudioActions,
} from "./studio-state-contract";

describe("Studio read-only action contract", () => {
  it("keeps every Work action disabled and free of write callbacks", () => {
    for (const action of workStudioActions) {
      expect(disabledStudioActionProps(action)).toEqual({
        disabled: true,
        title: `${action}将在后续 Step 开放`,
        type: "button",
      });
    }
  });

  it("keeps every Article action disabled and free of write callbacks", () => {
    for (const action of articleStudioActions) {
      expect(disabledStudioActionProps(action)).toEqual({
        disabled: true,
        title: `${action}将在后续 Step 开放`,
        type: "button",
      });
    }
  });

  it("keeps Create Work publishing disabled without a mutation callback", () => {
    expect(createWorkStudioActions).toEqual(["保存草稿", "发布"]);
    expect(disabledStudioActionProps("发布")).toEqual({
      disabled: true,
      title: "发布将在后续 Step 开放",
      type: "button",
    });
  });
});

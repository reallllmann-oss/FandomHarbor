import { describe, expect, it } from "vitest";

import {
  B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF,
  b3SaTargetSetsMatch,
  isB3SaEmailBindingFeatureEnabled,
  resolveB3SaRuntimeBoundary,
} from "./super-admin-email-binding-boundary";

const UID_1 = "10000000-0000-4000-8000-000000000001";
const UID_2 = "10000000-0000-4000-8000-000000000002";

function previewEnvironment() {
  return {
    B3_SA_ALLOWED_TARGET_UIDS: `${UID_1},${UID_2}`,
    B3_SA_DEPLOYMENT_TARGET: "preview",
    B3_SA_EMAIL_BINDING_ENABLED: "true",
    B3_SA_EXPECTED_GIT_BRANCH: "codex/v1-package-b0-auth-architecture",
    B3_SA_EXPECTED_SUPABASE_PROJECT_REF:
      B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF,
    B3_SA_EXPECTED_VERCEL_PROJECT_ID: "prj_preview_admin",
    NEXT_PUBLIC_SUPABASE_URL: `https://${B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF}.supabase.co`,
    NODE_ENV: "production",
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: "codex/v1-package-b0-auth-architecture",
    VERCEL_PROJECT_ID: "prj_preview_admin",
    VERCEL_TARGET_ENV: "preview",
  };
}

describe("B3-SA Preview runtime boundary", () => {
  it("accepts only the approved protected Preview identity tuple", () => {
    expect(resolveB3SaRuntimeBoundary(previewEnvironment())).toEqual({
      allowedTargetUserIds: [UID_1, UID_2],
      mode: "preview",
      supabaseProjectRef: B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF,
      supabaseUrl: `https://${B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF}.supabase.co`,
    });
  });

  it.each([
    ["production Vercel environment", { VERCEL_ENV: "production" }],
    ["production target environment", { VERCEL_TARGET_ENV: "production" }],
    ["wrong Vercel project", { VERCEL_PROJECT_ID: "prj_production" }],
    ["wrong branch", { VERCEL_GIT_COMMIT_REF: "main" }],
    [
      "Production Supabase URL",
      { NEXT_PUBLIC_SUPABASE_URL: "https://szfhngifsipsrxcpekti.supabase.co" },
    ],
    [
      "third UID",
      {
        B3_SA_ALLOWED_TARGET_UIDS: `${UID_1},${UID_2},30000000-0000-4000-8000-000000000003`,
      },
    ],
    ["duplicate UID", { B3_SA_ALLOWED_TARGET_UIDS: `${UID_1},${UID_1}` }],
  ])("fails closed for %s", (_label, override) => {
    expect(
      isB3SaEmailBindingFeatureEnabled({
        ...previewEnvironment(),
        ...override,
      }),
    ).toBe(false);
  });

  it("allows a separate local-only identity tuple without Vercel", () => {
    expect(
      resolveB3SaRuntimeBoundary({
        B3_SA_ALLOWED_TARGET_UIDS: UID_1,
        B3_SA_DEPLOYMENT_TARGET: "local",
        B3_SA_EMAIL_BINDING_ENABLED: "true",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NODE_ENV: "test",
      }),
    ).toMatchObject({ mode: "local", supabaseProjectRef: "local" });
  });

  it("requires the server environment and database policy to name the same exact UIDs", () => {
    expect(b3SaTargetSetsMatch([UID_1, UID_2], [UID_2, UID_1])).toBe(true);
    expect(b3SaTargetSetsMatch([UID_1], [UID_1, UID_2])).toBe(false);
    expect(
      b3SaTargetSetsMatch(
        [UID_1, UID_2],
        [UID_1, "30000000-0000-4000-8000-000000000003"],
      ),
    ).toBe(false);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = resolve(process.cwd(), "src");
const runtime = readFileSync(
  resolve(appRoot, "lib/super-admin-email-binding-runtime.ts"),
  "utf8",
);
const boundary = readFileSync(
  resolve(appRoot, "lib/super-admin-email-binding-boundary.ts"),
  "utf8",
);
const orchestrator = readFileSync(
  resolve(appRoot, "lib/super-admin-email-binding-orchestrator.ts"),
  "utf8",
);
const page = readFileSync(
  resolve(appRoot, "app/b3-sa/email-binding/[operationId]/page.tsx"),
  "utf8",
);
const actions = readFileSync(
  resolve(appRoot, "app/b3-sa/email-binding/[operationId]/actions.ts"),
  "utf8",
);

describe("B3-SA2 protected page contract", () => {
  it("is local/approved-Preview only and never enters ordinary Admin navigation", () => {
    expect(runtime).toContain("resolveB3SaRuntimeBoundary");
    expect(runtime).toContain("B3_SA_EMAIL_BINDING_ENABLED");
    expect(page).toContain("isB3SaEmailBindingFeatureEnabled");
    expect(page).not.toMatch(/adminNavigationConfig|href:\s*["']\/b3-sa/iu);
    expect(boundary).toContain('environment.VERCEL_ENV !== "preview"');
    expect(boundary).toContain("B3_SA_PRODUCTION_SUPABASE_PROJECT_REF");
    expect(boundary).toContain("B3_SA_ALLOWED_TARGET_UIDS");
  });

  it("keeps secret and native Auth material inside server-only modules", () => {
    expect(runtime).toContain('import "server-only"');
    expect(runtime).toContain("SUPABASE_SECRET_KEY");
    expect(runtime).not.toContain("NEXT_PUBLIC_SUPABASE_SECRET_KEY");
    expect(page).not.toMatch(
      /SUPABASE_SECRET|emailOtp|accessToken|hashed_token/iu,
    );
    expect(actions).not.toMatch(
      /SUPABASE_SECRET|emailOtp|accessToken|hashed_token/iu,
    );
    expect(orchestrator).not.toContain("hashed_token");
  });

  it("uses an isolated password token session and clears it immediately", () => {
    expect(runtime).toContain("grant_type=password");
    expect(runtime).toContain("logout?scope=local");
    expect(runtime).toContain("logout?scope=global");
    expect(runtime).not.toMatch(/auth\.users|auth\.identities/iu);
  });

  it("rechecks operation and trusted identity in every state-changing action", () => {
    expect(
      actions.match(/runtime\.binding\.get\(operationId\)/gu),
    ).toHaveLength(1);
    expect(
      orchestrator.match(/operationForCurrentActor\(/gu)?.length,
    ).toBeGreaterThanOrEqual(4);
    expect(orchestrator).toContain("assertContext");
    expect(actions).toContain("getAdminAccessContext");
  });

  it("limits senders to loopback local delivery or the fixed Preview provider", () => {
    expect(runtime).toContain('url.protocol !== "http:"');
    expect(runtime).toContain('"127.0.0.1"');
    expect(runtime).toContain('"localhost"');
    expect(runtime).toContain("B3_SA_LOCAL_SENDER_TOKEN");
    expect(runtime).toContain('"https://api.resend.com/emails"');
    expect(runtime).toContain("B3_SA_PREVIEW_SENDER_API_KEY");
    expect(runtime).toContain('"idempotency-key"');
  });
});

import { z } from "zod";

export const B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF =
  "bniqsjnjqesnpcfkpqcz";
export const B3_SA_PRODUCTION_SUPABASE_PROJECT_REF = "szfhngifsipsrxcpekti";

const uuidSchema = z.uuid();
const projectRefSchema = z.string().regex(/^[a-z]{20}$/u);

export interface B3SaRuntimeBoundary {
  allowedTargetUserIds: readonly string[];
  mode: "local" | "preview";
  supabaseProjectRef: string;
  supabaseUrl: string;
}

function exactTargetUserIds(
  value: string | undefined,
): readonly string[] | null {
  if (!value) return null;
  const parsed = value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (
    parsed.length < 1 ||
    parsed.length > 2 ||
    new Set(parsed).size !== parsed.length
  ) {
    return null;
  }
  const validated: string[] = [];
  for (const entry of parsed) {
    const result = uuidSchema.safeParse(entry);
    if (!result.success) return null;
    validated.push(result.data);
  }
  return Object.freeze(validated);
}

function supabaseProjectRef(url: URL): string | null {
  const match = /^([a-z]{20})\.supabase\.co$/u.exec(url.hostname);
  return match?.[1] ?? null;
}

export function resolveB3SaRuntimeBoundary(
  environment: Record<string, string | undefined> = process.env,
): B3SaRuntimeBoundary | null {
  if (environment.B3_SA_EMAIL_BINDING_ENABLED !== "true") return null;
  const allowedTargetUserIds = exactTargetUserIds(
    environment.B3_SA_ALLOWED_TARGET_UIDS,
  );
  if (!allowedTargetUserIds) return null;

  let url: URL;
  try {
    url = new URL(environment.NEXT_PUBLIC_SUPABASE_URL ?? "");
  } catch {
    return null;
  }

  if (environment.B3_SA_DEPLOYMENT_TARGET === "local") {
    const localHost = ["127.0.0.1", "[::1]", "localhost"].includes(
      url.hostname,
    );
    if (
      !["development", "test"].includes(environment.NODE_ENV ?? "") ||
      environment.VERCEL === "1" ||
      !localHost ||
      url.protocol !== "http:"
    ) {
      return null;
    }
    return Object.freeze({
      allowedTargetUserIds,
      mode: "local",
      supabaseProjectRef: "local",
      supabaseUrl: url.toString().replace(/\/$/u, ""),
    });
  }

  if (environment.B3_SA_DEPLOYMENT_TARGET !== "preview") return null;
  const configuredRef = projectRefSchema.safeParse(
    environment.B3_SA_EXPECTED_SUPABASE_PROJECT_REF,
  );
  const actualRef = supabaseProjectRef(url);
  if (actualRef === B3_SA_PRODUCTION_SUPABASE_PROJECT_REF) return null;
  if (
    environment.VERCEL !== "1" ||
    environment.VERCEL_ENV !== "preview" ||
    environment.VERCEL_TARGET_ENV !== "preview" ||
    !environment.VERCEL_PROJECT_ID ||
    environment.VERCEL_PROJECT_ID !==
      environment.B3_SA_EXPECTED_VERCEL_PROJECT_ID ||
    !environment.VERCEL_GIT_COMMIT_REF ||
    environment.VERCEL_GIT_COMMIT_REF !==
      environment.B3_SA_EXPECTED_GIT_BRANCH ||
    url.protocol !== "https:" ||
    !configuredRef.success ||
    configuredRef.data !== B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF ||
    actualRef !== B3_SA_APPROVED_PREVIEW_SUPABASE_PROJECT_REF
  ) {
    return null;
  }

  return Object.freeze({
    allowedTargetUserIds,
    mode: "preview",
    supabaseProjectRef: actualRef,
    supabaseUrl: url.toString().replace(/\/$/u, ""),
  });
}

export function isB3SaEmailBindingFeatureEnabled(
  environment: Record<string, string | undefined> = process.env,
) {
  return resolveB3SaRuntimeBoundary(environment) !== null;
}

export function b3SaTargetSetsMatch(
  configured: readonly string[],
  database: readonly string[],
): boolean {
  if (configured.length !== database.length) return false;
  const configuredSet = new Set(configured.map((entry) => entry.toLowerCase()));
  return (
    configuredSet.size === configured.length &&
    database.every((entry) => configuredSet.has(entry.toLowerCase()))
  );
}

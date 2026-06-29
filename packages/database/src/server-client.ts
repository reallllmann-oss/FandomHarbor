import type { AuthCookieStore } from "@fandom-harbor/auth";
import {
  parsePublicRuntimeConfig,
  type PublicRuntimeConfig,
} from "@fandom-harbor/config";
import { createServerClient } from "@supabase/ssr";

export function createServerSupabaseClient(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
) {
  const runtime = parsePublicRuntimeConfig(environment);

  return createServerClient(
    runtime.NEXT_PUBLIC_SUPABASE_URL,
    runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookies.getAll(),
        setAll: (mutations) => cookies.setAll(mutations),
      },
    },
  );
}

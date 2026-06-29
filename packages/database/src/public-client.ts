import {
  parsePublicRuntimeConfig,
  type PublicRuntimeConfig,
} from "@fandom-harbor/config";
import { createClient } from "@supabase/supabase-js";

export function createPublicSupabaseClient(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
) {
  const config = parsePublicRuntimeConfig(environment);

  return createClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

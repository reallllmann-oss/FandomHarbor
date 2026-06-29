import { z } from "zod";

const publicRuntimeConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
});

const serverRuntimeConfigSchema = publicRuntimeConfigSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export type PublicRuntimeConfig = z.infer<typeof publicRuntimeConfigSchema>;
export type ServerRuntimeConfig = z.infer<typeof serverRuntimeConfigSchema>;

export function parsePublicRuntimeConfig(
  environment: Record<string, string | undefined>,
): PublicRuntimeConfig {
  return publicRuntimeConfigSchema.parse(environment);
}

export function parseServerRuntimeConfig(
  environment: Record<string, string | undefined>,
): ServerRuntimeConfig {
  return serverRuntimeConfigSchema.parse(environment);
}

export function readPublicRuntimeConfig(): PublicRuntimeConfig {
  return parsePublicRuntimeConfig({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

export function readServerRuntimeConfig(): ServerRuntimeConfig {
  return parseServerRuntimeConfig({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

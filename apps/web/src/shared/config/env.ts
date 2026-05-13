import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api/v1'),
});

type WebEnv = z.infer<typeof envSchema>;

function parseEnv(): WebEnv {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    throw new Error(`Web config validation error:\n${result.error.toString()}`);
  }
  return result.data;
}

const env = parseEnv();

export const config = {
  apiBaseUrl: env.VITE_API_BASE_URL,
} as const;

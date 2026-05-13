import { z } from 'zod';
import { loadEnv } from 'vite';

const viteEnvSchema = z.object({
  API_PROXY_TARGET: z.string().url().default('http://localhost:3000'),
  VITE_PORT: z.coerce.number().default(4200),
});

export type ViteEnv = z.infer<typeof viteEnvSchema>;

export function parseViteEnv(mode: string, root: string): ViteEnv {
  const raw = loadEnv(mode, root, '');
  const result = viteEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Vite env validation error:\n${result.error.toString()}`);
  }
  return result.data;
}

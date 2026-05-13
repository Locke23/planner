/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { parseViteEnv } from './vite-env';

export default defineConfig(({ mode }) => {
  const env = parseViteEnv(mode, import.meta.dirname);

  return {
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: env.VITE_PORT,
    host: 'localhost',
    proxy: {
      '/api': env.API_PROXY_TARGET,
    },
  },
  preview: {
    port: env.VITE_PORT,
    host: 'localhost',
  },
  plugins: [
    tailwindcss(),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  };
});

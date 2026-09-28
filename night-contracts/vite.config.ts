/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { gameAssets } from './tools/gameAssets.ts';

const root = import.meta.dirname;

export default defineConfig({
  base: './',
  plugins: [
    gameAssets(path.join(root, 'assets')),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest,glb,ogg}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
    }),
  ],
  build: {
    target: 'es2022',
    assetsDir: '_app',
    chunkSizeWarningLimit: 4000,
  },
  server: { port: 5173 },
  optimizeDeps: {
    include: ['three', '@dimforge/rapier3d-compat', 'howler', '@capacitor/haptics', '@capacitor/core'],
  },
  preview: { port: 4173 },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
  },
});

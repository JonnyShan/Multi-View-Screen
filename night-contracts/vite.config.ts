/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { gameAssets } from './tools/gameAssets.ts';

const root = import.meta.dirname;

/**
 * `vite build --mode artifact` makes one self-contained page (everything
 * inlined, no service worker) for hosting where only the page itself is served.
 */
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact';
  return {
    base: './',
    plugins: [
      gameAssets(path.join(root, 'assets'), { ship: !artifact }),
      VitePWA({
        disable: artifact,
        registerType: 'autoUpdate',
        injectRegister: null,
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest,glb,ogg,mp3,m4a}'],
          maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        },
      }),
    ],
    build: {
      target: 'es2022',
      outDir: artifact ? 'dist-artifact' : 'dist',
      assetsDir: '_app',
      chunkSizeWarningLimit: 8000,
      assetsInlineLimit: artifact ? 100_000_000 : 4096,
      cssCodeSplit: !artifact,
      rollupOptions: {
        output: artifact
          ? { inlineDynamicImports: true }
          : {
              // separate, long-cached vendor chunks
              manualChunks(id: string) {
                if (id.includes('rapier3d')) return 'rapier';
                if (id.includes('node_modules/three/')) return 'three';
                if (id.includes('node_modules/howler') || id.includes('@capacitor')) return 'vendor';
                return undefined;
              },
            },
      },
    },
    server: { port: 5173 },
    optimizeDeps: {
      include: [
        'three',
        'three/addons/loaders/GLTFLoader.js',
        'three/addons/utils/SkeletonUtils.js',
        'three/addons/utils/BufferGeometryUtils.js',
        'three/addons/postprocessing/EffectComposer.js',
        'three/addons/postprocessing/GTAOPass.js',
        'three/addons/postprocessing/OutputPass.js',
        'three/addons/postprocessing/RenderPass.js',
        'three/addons/postprocessing/ShaderPass.js',
        'three/addons/postprocessing/UnrealBloomPass.js',
        '@dimforge/rapier3d-compat',
        'howler',
        '@capacitor/haptics',
        '@capacitor/core',
      ],
    },
    preview: { port: 4173 },
    test: {
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
      testTimeout: 120_000,
    },
  };
});

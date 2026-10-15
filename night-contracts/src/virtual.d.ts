/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:game-assets' {
  /** Files under assets/{models,ui,audio} that exist at build time. */
  export const gameAssetFiles: string[];
  /** The same files as data: URIs, in the single-page build only (empty otherwise). */
  export const gameAssetInline: Record<string, string>;
}

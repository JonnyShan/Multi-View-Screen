/**
 * Where a shipped art file (assets/{models,ui,audio}) is read from: the copied
 * file in normal builds, or the inlined data: URI in the single-page build.
 */
import { gameAssetFiles, gameAssetInline } from 'virtual:game-assets';

const BASE = `${import.meta.env.BASE_URL}game-assets/`;

export function hasAsset(path: string): boolean {
  return gameAssetFiles.includes(path);
}

export function assetUrl(path: string): string {
  return gameAssetInline[path] ?? BASE + path;
}

/** Bytes of a base64 data: URI, decoded here because sandboxed pages may refuse to fetch one. */
export function dataUriBytes(uri: string): ArrayBuffer {
  const bin = atob(uri.slice(uri.indexOf(',') + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

/** The file's bytes, from inline data or the copied file. */
export async function assetBytes(path: string): Promise<ArrayBuffer> {
  const url = assetUrl(path);
  if (url.startsWith('data:')) return dataUriBytes(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.arrayBuffer();
}

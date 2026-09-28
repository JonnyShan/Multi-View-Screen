/**
 * Serves and ships the art handoff folder (assets/) without bundling concept art.
 *
 * - `virtual:game-assets` exports the list of files that actually exist, so the
 *   AssetRegistry only requests real files (no 404 console noise).
 * - Dev: files are served from /game-assets/.
 * - Build: models, ui and audio are copied to dist/game-assets/.
 * - Single-page build: no side files ship, so every file is inlined as a
 *   base64 data: URI (`gameAssetInline`) and read without a request.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const SHIPPED = ['models', 'ui', 'audio'];
const EXT = /\.(glb|gltf|bin|png|jpg|jpeg|webp|ktx2|svg|ogg|mp3|m4a|wav)$/i;
const MIME: Record<string, string> = {
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  bin: 'application/octet-stream',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ktx2: 'image/ktx2',
  svg: 'image/svg+xml',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
};
const VIRTUAL_ID = 'virtual:game-assets';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function walk(dir: string, root: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, root, out);
    else if (EXT.test(entry.name)) out.push(path.relative(root, full).split(path.sep).join('/'));
  }
}

export function listGameAssets(assetsDir: string): string[] {
  const out: string[] = [];
  for (const sub of SHIPPED) walk(path.join(assetsDir, sub), assetsDir, out);
  return out.sort();
}

export function gameAssets(assetsDir: string, opts: { ship?: boolean } = {}): Plugin {
  const ship = opts.ship ?? true;
  let outDir = 'dist';
  return {
    name: 'night-contracts-game-assets',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const files = listGameAssets(assetsDir);
      // a single-page build ships no side files, so it carries them inline
      const inline: Record<string, string> = {};
      if (!ship) {
        for (const rel of files) {
          const ext = rel.slice(rel.lastIndexOf('.') + 1).toLowerCase();
          inline[rel] = `data:${MIME[ext] ?? 'application/octet-stream'};base64,${fs.readFileSync(path.join(assetsDir, rel)).toString('base64')}`;
        }
      }
      return `export const gameAssetFiles = ${JSON.stringify(files)};\nexport const gameAssetInline = ${JSON.stringify(inline)};`;
    },
    configureServer(server) {
      // new or removed art files refresh the asset list without a restart
      server.watcher.add(assetsDir);
      const refresh = (file: string): void => {
        if (!file.startsWith(assetsDir) || !EXT.test(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
      server.middlewares.use('/game-assets', (req, res, next) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        const first = rel.split('/')[0];
        const file = path.join(assetsDir, rel);
        if (!SHIPPED.includes(first) || !file.startsWith(assetsDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          next();
          return;
        }
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (!ship) return;
      for (const rel of listGameAssets(assetsDir)) {
        const dest = path.join(outDir, 'game-assets', rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(assetsDir, rel), dest);
      }
    },
  };
}

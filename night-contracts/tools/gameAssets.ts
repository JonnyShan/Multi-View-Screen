/**
 * Serves and ships the art handoff folder (assets/) without bundling concept art.
 *
 * - `virtual:game-assets` exports the list of files that actually exist, so the
 *   AssetRegistry only requests real files (no 404 console noise).
 * - Dev: files are served from /game-assets/.
 * - Build: models, ui and audio are copied to dist/game-assets/.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const SHIPPED = ['models', 'ui', 'audio'];
const EXT = /\.(glb|gltf|bin|png|jpg|jpeg|webp|ktx2|svg|ogg|mp3|m4a|wav)$/i;
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

export function gameAssets(assetsDir: string): Plugin {
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
      return `export const gameAssetFiles = ${JSON.stringify(listGameAssets(assetsDir))};`;
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
      for (const rel of listGameAssets(assetsDir)) {
        const dest = path.join(outDir, 'game-assets', rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(assetsDir, rel), dest);
      }
    },
  };
}

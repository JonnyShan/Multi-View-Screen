// Finishes a game folder after a brand change: writes the page title, description and theme colour from
// js/brand.js into index.html (for link previews, which don't run scripts), checks that every brand file it names
// exists, and reports the folder size against the 10 MB instant-play limit.
//
//   node tools/build.mjs <game-folder>
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = resolve(process.argv[2] || '.');
const { BRAND } = await import(pathToFileURL(join(dir, 'js/brand.js')).href);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// 1. index.html head
const page = join(dir, 'index.html');
let html = readFileSync(page, 'utf8');
const head = `<!-- brand:head (written from js/brand.js by tools/build.mjs) -->
<meta name="theme-color" content="${esc(BRAND.dark)}">
<title>${esc(BRAND.title)}</title>
<meta name="description" content="${esc(BRAND.description)}">
<!-- /brand:head -->`;
const re = /<!-- brand:head[\s\S]*?<!-- \/brand:head -->/;
if (!re.test(html)) throw new Error('index.html has no <!-- brand:head --> block');
html = html.replace(re, head);
writeFileSync(page, html);

// 2. brand files named in brand.js
const files = [BRAND.logo, BRAND.logoUi, BRAND.product && BRAND.product.img, ...(BRAND.fonts.files || []).map(f => f.src)].filter(Boolean);
const missing = files.filter(f => !existsSync(join(dir, f)));

// 3. size
const size = (d) => readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? size(join(d, e.name)) : statSync(join(d, e.name)).size), 0);
const bytes = size(dir), limit = 10 * 1024 * 1024;
const mb = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';

console.log(`${BRAND.title}: head written`);
console.log(missing.length ? `MISSING brand files: ${missing.join(', ')}` : `brand files: all ${files.length} present`);
console.log(`folder size: ${mb(bytes)} ${bytes <= limit ? '(under 10 MB)' : '(OVER 10 MB: run tools/compress-models.mjs on the .glb files)'}`);
process.exit(missing.length || bytes > limit ? 1 : 0);

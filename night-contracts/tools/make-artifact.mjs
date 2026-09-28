// Packs the artifact build (vite build --mode artifact) into one HTML page
// in the Artifact page format: no doctype/html/head/body of its own, title and
// styles first, everything inlined so nothing but the page needs serving.
// usage: node tools/make-artifact.mjs <out.html>
import fs from 'node:fs';
import path from 'node:path';

const dir = 'dist-artifact';
const out = process.argv[2] ?? path.join(dir, 'night-contracts.html');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const js = [...html.matchAll(/<script[^>]*type="module"[^>]*src="\.\/([^"]+)"/g)].map((m) => m[1]);
const css = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\.\/([^"]+)"/g)].map((m) => m[1]);
const preloads = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="\.\/([^"]+)"/g)].map((m) => m[1]);
if (js.length !== 1 || preloads.length) throw new Error(`expected one module script and no preloads, got ${js.length} scripts, ${preloads.length} preloads`);

let code = fs.readFileSync(path.join(dir, js[0]), 'utf8');
if (/\bimport\s*\(\s*["'`]\.\/|from\s*["'`]\.\//.test(code)) throw new Error('bundle still imports sibling chunks');
const closers = (code.match(/<\/script/gi) ?? []).length;
const comments = (code.match(/<!--/g) ?? []).length;
// keep the inline script from ending early
code = code.replace(/<\/script/gi, '<\\/script');
if (comments) throw new Error(`bundle contains ${comments} "<!--" sequences; handle them before inlining`);

let styles = css.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
if (/url\(\s*["']?\.\//.test(styles)) throw new Error('stylesheet still references side files');
styles = styles.replace(/<\/style/gi, '<\\/style');

const page = `<title>Night Contracts</title>
<style>${styles}</style>
<canvas id="game"></canvas>
<div id="ui"></div>
<script type="module">${code}</script>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log(`wrote ${out}: ${(page.length / 1e6).toFixed(2)} MB (escaped ${closers} script closers)`);

#!/usr/bin/env node
// Local preview server for dist/.
//
//   npm run preview           serve dist/ at http://localhost:4173 (opens the review page)
//   npm run dev               same, plus rebuild on every change and live reload
//   PORT=5000 npm run dev     another port
//
// Live reload is injected into responses only; files on disk stay exactly as built.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/project.mjs';
import { build } from './build.mjs';

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const portArg = args.indexOf('--port');
const PORT = Number(process.env.PORT || (portArg >= 0 ? args[portArg + 1] : 4173));
const DIST = path.join(ROOT, 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};
const RELOAD = '<script>(function(){try{new EventSource("/__reload").onmessage=function(){location.reload()}}catch(e){}})();</script>';
const clients = new Set();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (url.pathname === '/') {
    res.writeHead(302, { Location: '/review.html' });
    res.end();
    return;
  }
  const file = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found. Run npm run build first.');
    return;
  }
  const ext = path.extname(file);
  let body = fs.readFileSync(file);
  if (watch && ext === '.html') body = Buffer.from(body.toString('utf8').replace(/<\/body>(?![\s\S]*<\/body>)/, RELOAD + '</body>'));
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
});

async function rebuild() {
  const t0 = Date.now();
  try {
    await build({ quiet: true });
    console.log(`Rebuilt in ${Date.now() - t0} ms`);
    clients.forEach((res) => res.write('data: reload\n\n'));
  } catch (e) {
    console.error(`Build failed:\n${e.message}`);
  }
}

if (watch) {
  await rebuild();
  let timer = null;
  for (const dir of ['src', 'content', 'config', 'review', 'harness', 'assets']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    fs.watch(abs, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 150);
    });
  }
} else if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  await rebuild();
}

server.listen(PORT, () => {
  console.log(`Preview: http://localhost:${PORT}/review.html`);
  console.log(`  Playable:       http://localhost:${PORT}/index.html`);
  console.log(`  MRAID harness:  http://localhost:${PORT}/harness.html`);
  if (watch) console.log('  Watching src/, content/, config/, review/, harness/ and assets/ for changes.');
});

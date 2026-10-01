// Boots the single-page build under a strict content security policy, like a
// sandboxed host (no fetches at all, not even data: or blob: URLs), rides by
// day and by night, and fails on any console error or warning.
// usage: pnpm build:artifact && node tools/artifact-check.mjs [outDir] [page.html]
import fs from 'node:fs';
import http from 'node:http';
import { chromium } from '@playwright/test';

const out = process.argv[2] ?? 'dist-artifact';
const CSP = "default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'";
const html = fs.readFileSync(process.argv[3] ?? 'dist-artifact/night-contracts.html');
const server = http.createServer((req, res) => res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': CSP }).end(html)).listen(0);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
const logs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`${m.type()}: ${m.text().slice(0, 200)}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
  await page.evaluate(() => window.__nc.setClock(9.5));
  await page.locator('[data-act="ride"]').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${out}/check-day.png` });
  await page.evaluate(() => window.__nc.setClock(22));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/check-night.png` });
  // a row of parked cars by day, close up
  await page.evaluate(() => {
    const sim = window.__nc.sim();
    ['sedan', 'suv', 'hatch', 'ute', 'van'].forEach((m, i) => (sim.spawnCar('civilian', m, [0xe9e6de, 0x9e1b1b, 0x1d3f7a, 0x121316, 0x7a7d80][i], 470, 380 + i * 48, Math.PI / 2, 999).mode = 'idle'));
    window.__nc.setClock(14);
    window.__nc.camera({ x: 492, y: 372, z: 9, tx: 470, ty: 400, tz: 4 });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/check-cars.png` });
  // materials from the generated GLBs are named (code-built ones are not) and have metal 1 and
  // rough 1 factors scaled by their maps: a missing map means a texture failed to load
  const untextured = await page.evaluate(() => {
    const bad = new Set();
    window.__nc.scene.traverse((o) => {
      for (const m of [o.material ?? []].flat()) if (m.isMeshStandardMaterial && m.name && m.metalness === 1 && !m.metalnessMap) bad.add(o.name || o.type);
    });
    return [...bad];
  });
  if (untextured.length) logs.push(`error: untextured models: ${untextured.join(', ')}`);
} finally {
  await browser.close();
  server.close();
}
const unique = [...new Set(logs)];
console.log(unique.join('\n') || 'no console errors or warnings');
console.log(`shots: ${out}/check-{day,night,cars}.png`);
process.exit(unique.length ? 1 : 0);

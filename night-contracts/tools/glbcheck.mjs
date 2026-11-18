// Dev check: export placeholder GLBs, drop them into assets/, confirm they load, then remove them.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
const out = process.argv[2] ?? 'glb.png';
const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const browser = await chromium.launch({ args });
let page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
await page.goto('http://localhost:5199/?e2e=1&q=medium');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
const files = await page.evaluate(async () => (await import('/src/dev/exportTestAssets.ts')).exportTestAssets());
const written = [];
for (const [rel, bytes] of Object.entries(files)) {
  const p = path.join('assets', rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, Buffer.from(bytes));
  written.push(p);
}
console.log('wrote', written.map((w) => `${w} (${fs.statSync(w).size} bytes)`).join(', '));
try {
  // the dev server needs a restart for the virtual asset list; a full reload re-evaluates it after invalidation
  await page.close();
  await new Promise((r) => setTimeout(r, 1500));
  page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const logs = [];
  page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto('http://localhost:5199/?e2e=1&q=medium');
  await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
  await page.click('[data-act="ride"]');
  await page.evaluate(() => {
    window.__nc.setClock(14); window.__nc.setWeather('clear');
    const s = window.__nc.sim();
    const c = s.spawnCar('civilian', 'sedan', 0xffffff, 560, 400, Math.PI / 2); c.mode = 'idle';
    window.__nc.camera({ x: 590, y: 340, z: 22, tx: 545, ty: 350, tz: 6 });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out });
  console.log(logs.filter((l) => /GLB|placeholder|error|warn/i.test(l)).join('\n'));
} finally {
  for (const w of written) fs.rmSync(w);
  console.log('removed test GLBs');
}
await browser.close();

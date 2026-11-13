// Dev helper: triangles per mesh (total, not frustum culled) for the given quality.
import { chromium, devices } from '@playwright/test';
const q = process.argv[2] ?? 'medium';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ ...devices['iPhone 14 Pro landscape'] });
const page = await ctx.newPage();
await page.goto(`http://localhost:5199/?e2e=1&q=${q}`);
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.waitForTimeout(1500);
const rows = await page.evaluate(async () => {
  const THREE = await import('/node_modules/.vite/deps/three.js').catch(() => null);
  void THREE;
  const out = {};
  const scene = window.__nc.scene;
  scene.traverse((o) => {
    if (!o.geometry || !o.visible) return;
    const g = o.geometry;
    const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    const n = o.isInstancedMesh ? o.count : 1;
    const key = o.name || o.type;
    out[key] = (out[key] || 0) + tris * n;
  });
  return Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 30);
});
for (const [k, v] of rows) console.log(String(Math.round(v)).padStart(9), k);
console.log(JSON.stringify(await page.evaluate(() => window.__nc.state())));
await browser.close();

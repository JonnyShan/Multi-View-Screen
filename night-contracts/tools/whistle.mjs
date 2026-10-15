// Dev helper: step off, walk away, whistle, and screenshot the bike riding over.
// usage: node tools/whistle.mjs out-prefix [dx] [dy]   (dev server on port 5199)
import { chromium } from '@playwright/test';
const [out = 'whistle', dx = '40', dy = '330'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto((process.env.URL ?? 'http://localhost:5199/') + '?e2e=1');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.waitForTimeout(800);
await page.keyboard.press('KeyE');
await page.waitForTimeout(400);
// stand on the nearest footpath some way off
await page.evaluate(([ox, oy]) => {
  const sim = window.__nc.sim();
  const tx = sim.bike.x + ox;
  const ty = sim.bike.y + oy;
  let best = { x: tx, y: ty };
  let bd = Infinity;
  for (const o of sim.city.footLoops) {
    const cx = Math.max(o.minX, Math.min(o.maxX, tx));
    const cy = Math.max(o.minY, Math.min(o.maxY, ty));
    for (const p of [{ x: o.minX, y: cy }, { x: o.maxX, y: cy }, { x: cx, y: o.minY }, { x: cx, y: o.maxY }]) {
      const d = Math.hypot(p.x - tx, p.y - ty);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
  }
  sim.footBody.setTranslation({ x: best.x, y: best.y, z: 0 }, true);
  sim.player.x = sim.player.px = best.x;
  sim.player.y = sim.player.py = best.y;
  // face back towards the bike
  sim.player.facing = Math.atan2(sim.bike.y - best.y, sim.bike.x - best.x);
}, [+dx, +dy]);
await page.waitForTimeout(1500);
// slow time right down so screenshots (slow under software rendering) keep up
await page.evaluate(() => window.__nc.slow(0.08));
await page.keyboard.press('KeyE');
for (let i = 0; i < 8; i++) {
  const s = await page.evaluate(() => {
    const sim = window.__nc.sim();
    return { t: sim.time.toFixed(2), auto: sim.bike.auto, whistle: sim.player.whistleT.toFixed(2), bike: [Math.round(sim.bike.x), Math.round(sim.bike.y)], speed: Math.round(sim.bike.speed), player: [Math.round(sim.player.x), Math.round(sim.player.y)] };
  });
  console.log(i, JSON.stringify(s));
  await page.screenshot({ path: `${out}-${i}.png` });
  if (!s.auto && i > 1) break;
  await page.waitForTimeout(4000);
}
console.log(logs.slice(0, 20).join('\n'));
await browser.close();

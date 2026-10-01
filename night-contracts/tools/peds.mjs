// Dev helper: line pedestrians up in front of a fixed camera and screenshot them.
// usage: node tools/peds.mjs out.png [hour] [rain]   (dev server on port 5199)
import { chromium } from '@playwright/test';
const [out = 'peds.png', hour = '21.5', rain = '', dist = '52'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto((process.env.URL ?? 'http://localhost:5199/') + '?e2e=1');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.waitForFunction(() => window.__nc.state().playing, null, { timeout: 30000 });
await page.waitForTimeout(500);
// pause (the sim stops, rendering carries on) and hide the pause menu
await page.keyboard.press('Escape');
await page.waitForFunction(() => window.__nc.state().paused, null, { timeout: 10000 });
await page.addStyleTag({ content: '.screen, .panel { display: none !important; }' });
await page.evaluate(([h, wet, d]) => {
  const nc = window.__nc;
  nc.setClock(+h);
  if (wet) {
    nc.setWeather('rain');
    // the sim is paused, so copy the weather over by hand
    nc.sim().raining = true;
    nc.sim().wet = 1;
  }
  const sim = nc.sim();
  const bx = sim.bike.x;
  const by = sim.bike.y + 70;
  const peds = sim.peds.list.slice(0, 9);
  peds.forEach((p, i) => {
    p.alive = true;
    p.state = i === 3 ? 'flee' : i === 5 ? 'down' : 'walk';
    p.x = p.px = bx - 50 + i * 12.5;
    p.y = p.py = by + (i % 2) * 6;
    p.z = sim.city.heightAt(p.x, p.y);
    p.a = p.pa = -Math.PI / 2 + (i % 3 - 1) * 0.5;
    p.walkPhase = i * 0.9;
  });
  nc.camera({ x: bx, y: by - +d, z: 6 + +d * 0.1, tx: bx, ty: by, tz: 8 });
}, [hour, rain, dist]);
// software rendering is slow: give it a few frames
await page.waitForTimeout(8000);
await page.screenshot({ path: out });
console.log(JSON.stringify(await page.evaluate(() => {
  const nc = window.__nc;
  const sim = nc.sim();
  const out = { t: sim.time, bike: [Math.round(sim.bike.x), Math.round(sim.bike.y)] };
  nc.scene.traverse((o) => {
    if (o.name && o.name.startsWith('ped-body')) out[o.name] = o.count;
  });
  out.peds = sim.peds.list.slice(0, 9).map((p) => [Math.round(p.x), Math.round(p.y), p.state]);
  return out;
})));
console.log(logs.filter((l) => !l.includes('vite')).slice(0, 20).join('\n'));
await browser.close();

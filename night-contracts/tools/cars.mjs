// Dev helper: parks a row of cars of one model in different paints and shoots them by day and night.
// usage: node tools/cars.mjs out-prefix [model]
import { chromium } from '@playwright/test';
const [out = 'cars', model = 'sedan'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
const logs = [];
page.on('console', (m) => (m.type() === 'error' || /GLB|placeholder/.test(m.text())) && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1&q=high');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate((m) => {
  document.querySelector('.hud').style.display = 'none';
  const sim = window.__nc.sim();
  const paints = [0xe9e6de, 0x9e1b1b, 0x1d3f7a, 0x121316, 0x7a7d80];
  paints.forEach((c, i) => {
    const car = sim.spawnCar('civilian', m, c, 470 + i * 0, 380 + i * 48, Math.PI / 2 + (i % 2) * 0.4, 999);
    car.mode = 'idle';
  });
  window.__nc.setWeather('clear');
}, model);
for (const [hour, tag] of [[14, 'day'], [22, 'night']]) {
  await page.evaluate((h) => window.__nc.setClock(h), hour);
  await page.evaluate(() => window.__nc.camera({ x: 505, y: 350, z: 22, tx: 470, ty: 430, tz: 4 }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}-${tag}.png` });
  await page.evaluate(() => window.__nc.camera({ x: 492, y: 372, z: 9, tx: 470, ty: 380, tz: 4 }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}-${tag}-close.png` });
}
console.log(JSON.stringify(await page.evaluate(() => window.__nc.state())));
console.log(logs.join('\n'));
await browser.close();

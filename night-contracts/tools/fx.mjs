// Dev helper: explode a car in front of the camera and grab a burst of frames.
import { chromium } from '@playwright/test';
const [out = 'fx.png', hour = '13'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const logs = [];
page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1&q=medium');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate((h) => {
  const nc = window.__nc; nc.setClock(+h); nc.setWeather('clear');
  const sim = nc.sim();
  sim.heat.enabled = false;
  window.__car = sim.spawnCar('civilian', 'sedan', 0x2b4a6e, 538, 560, Math.PI / 2 + 0.6, 120);
  window.__car.mode = 'idle';
}, hour);
await page.waitForTimeout(400);
await page.evaluate(() => { window.__nc.slow(0.04); window.__nc.sim().damageCar(window.__car, 500, 'player', 'gun'); });
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(250);
  await page.screenshot({ path: out.replace('.png', `-${i}.png`) });
}
console.log(logs.join('\n'));
await browser.close();

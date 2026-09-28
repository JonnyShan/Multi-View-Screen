// Dev helper: close-up views of the bike and rider in daylight.
import { chromium } from '@playwright/test';
const [out = 'model.png', hour = '14'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const logs = [];
page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1&q=high');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate((h) => { window.__nc.setClock(+h); window.__nc.setWeather('clear'); document.querySelector('.hud').style.display = 'none'; }, hour);
const views = [
  [538 + 30, 322 + 6, 10, 538, 322, 6, 'side'],
  [538 + 20, 322 + 26, 12, 538, 322, 7, 'front3q'],
  [538 - 14, 322 - 22, 16, 538, 322, 8, 'rear3q'],
];
for (const [x, y, z, tx, ty, tz, name] of views) {
  await page.evaluate((c) => window.__nc.camera(c), { x, y, z, tx, ty, tz });
  await page.waitForTimeout(700);
  await page.screenshot({ path: out.replace('.png', `-${name}.png`) });
}
console.log(logs.join('\n'));
await browser.close();

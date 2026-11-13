// Dev helper: answer the first contract, wait near the meeting place, screenshot the HUD.
import { chromium, devices } from '@playwright/test';
const [out = 'contract.png', phone = ''] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(phone ? { ...devices['iPhone 14 Pro landscape'] } : { viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1&q=medium');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate(() => window.__nc.slow(6));
await page.waitForFunction(() => window.__nc.state().contract === 'ringing', null, { timeout: 120000 });
await page.evaluate(() => window.__nc.input.press('answer'));
await page.waitForFunction(() => window.__nc.state().contract === 'briefed', null, { timeout: 30000 });
// park the bike on the approach to the casino
await page.evaluate(() => {
  const sim = window.__nc.sim();
  const c = sim.contracts;
  const x = c.parkX - 10, y = c.parkY - 260;
  window.__nc.teleport(x, y, Math.atan2(c.parkY - y, c.parkX - x));
});
await page.waitForFunction(() => ['arriving', 'meeting'].includes(window.__nc.state().contract), null, { timeout: 120000 });
await page.evaluate(() => window.__nc.slow(1));
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
console.log(JSON.stringify(await page.evaluate(() => window.__nc.state())));
console.log(logs.join('\n'));
await browser.close();

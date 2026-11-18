// Dev helper: screenshot the title screen, optionally in an emulated phone.
import { chromium, devices } from '@playwright/test';
const [out = 'title.png', phone = ''] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(phone ? { ...devices['iPhone 14 Pro landscape'] } : { viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto((process.env.URL ?? 'http://localhost:5199/') + (process.env.Q ? `?q=${process.env.Q}` : ''));
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
if (process.env.RIDE) {
  await page.click('[data-act="ride"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: out.replace('.png', '-ride.png') });
  console.log(JSON.stringify(await page.evaluate(() => window.__nc.state())));
}
console.log(logs.join('\n'));
await browser.close();

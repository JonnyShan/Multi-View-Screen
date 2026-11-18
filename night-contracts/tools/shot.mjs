// Dev helper: boot the game in headless Chromium, ride for a bit and screenshot.
// usage: node tools/shot.mjs out.png [seconds] [width] [height] [extra-js]
import { chromium } from '@playwright/test';
const [out = 'shot.png', secs = '3', w = '1280', h = '720', extra = ''] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(process.env.URL ?? 'http://localhost:5199/');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
if (extra) await page.evaluate(extra);
await page.keyboard.down('KeyW');
await page.waitForTimeout(+secs * 1000);
await page.keyboard.up('KeyW');
await page.waitForTimeout(300);
const state = await page.evaluate(() => window.__nc.state());
await page.screenshot({ path: out });
console.log(JSON.stringify(state));
console.log(logs.slice(0, 30).join('\n'));
await browser.close();

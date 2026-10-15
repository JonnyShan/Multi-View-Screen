// Dev helper: the rider on foot. Steps off and screenshots idle, walking, running,
// the whistle, shooting and a slash, freezing time for each shot.
// usage: node tools/onfoot.mjs out-prefix   (dev server on port 5199)
import { chromium } from '@playwright/test';
const [out = 'onfoot'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
page.on('pageerror', (e) => console.log(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1&q=high');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate(() => {
  window.__nc.setClock(15);
  window.__nc.setWeather('clear');
  document.querySelector('.hud').style.display = 'none';
});
await page.waitForTimeout(600);
await page.keyboard.press('KeyE');
await page.waitForTimeout(1200);
const cam = () =>
  page.evaluate(() => {
    const pl = window.__nc.sim().player;
    const f = pl.facing;
    // in front of the player and off to one side
    window.__nc.camera({ x: pl.x + Math.cos(f + 0.9) * 26, y: pl.y + Math.sin(f + 0.9) * 26, z: 9, tx: pl.x, ty: pl.y, tz: 6.5 });
  });
const shot = async (name) => {
  await page.evaluate(() => window.__nc.slow(0.0005));
  await cam();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}-${name}.png` });
  console.log(name, JSON.stringify(await page.evaluate(() => ({ mode: window.__nc.sim().player.mode, v: Math.hypot(window.__nc.sim().player.vx, window.__nc.sim().player.vy).toFixed(1) }))));
  await page.evaluate(() => window.__nc.slow(1));
};
await page.evaluate(() => window.__nc.slow(1));
await shot('idle');
// walk a little way off from the bike, then run
await page.evaluate(() => window.__nc.slow(0.3));
await page.keyboard.down('KeyW');
await page.waitForTimeout(700);
await shot('move');
await page.keyboard.up('KeyW');
// stand well clear of the bike so E whistles instead of remounting
await page.evaluate(() => {
  const sim = window.__nc.sim();
  const x = sim.bike.x - 70;
  const y = sim.bike.y;
  sim.footBody.setTranslation({ x, y, z: 0 }, true);
  sim.player.x = sim.player.px = x;
  sim.player.y = sim.player.py = y;
  sim.player.vx = sim.player.vy = 0;
  sim.player.facing = Math.PI / 2;
});
await page.waitForTimeout(1500);
await page.evaluate(() => window.__nc.slow(0.3));
await page.keyboard.press('KeyE');
await page.waitForTimeout(900);
await shot('whistle');
await page.waitForTimeout(2500);
await page.evaluate(() => window.__nc.slow(0.3));
await page.keyboard.down('Space');
await page.waitForTimeout(1500);
await shot('shoot');
await page.keyboard.up('Space');
await page.waitForTimeout(800);
await page.evaluate(() => window.__nc.slow(0.15));
await page.keyboard.press('KeyK');
await page.waitForTimeout(500);
await shot('slash');
await browser.close();

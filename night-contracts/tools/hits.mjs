// Dev helper: hit markers while firing, the red kill marker, and the red screen edge
// on the side the player was hurt from (left, then behind).
import { chromium } from '@playwright/test';
const [out = 'hits'] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => m.type() === 'error' && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/?e2e=1');
await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120000 });
await page.click('[data-act="ride"]');
await page.evaluate(() => {
  const nc = window.__nc;
  nc.setClock(21.5);
  const sim = nc.sim();
  // six rounds: hit markers, then the red kill marker
  window.__car = sim.spawnCar('target', 'sedan', 0x121316, 538, 480, Math.PI / 2, sim.t.gun.damageCar * 6);
  window.__car.mode = 'idle';
});
await page.waitForTimeout(800);
/** A close crop around the marker, scaled up. */
const zoom = async (name) => {
  const box = await page.evaluate(() => {
    const m = document.querySelector('.hitmark');
    return { x: parseFloat(m.style.left), y: parseFloat(m.style.top), o: m.style.opacity, t: m.style.transform, kill: m.classList.contains('kill') };
  });
  console.log(name, JSON.stringify(box));
  await page.screenshot({ path: `${out}-${name}-zoom.png`, clip: { x: Math.max(0, box.x - 120), y: Math.max(0, box.y - 80), width: 240, height: 160 } });
};
// slow time so the short markers last a few software-rendered frames, and all but
// freeze it the moment a marker shows
await page.evaluate(() => window.__nc.slow(0.05));
await page.keyboard.down('Space');
const freezeOn = (kill) =>
  page.waitForFunction(
    (k) => {
      const m = document.querySelector('.hitmark');
      const on = m && m.style.opacity > 0.5 && m.classList.contains('kill') === k;
      if (on) window.__nc.slow(0.0005);
      return on;
    },
    kill,
    { timeout: 90000, polling: 'raf' },
  );
await freezeOn(false);
await page.screenshot({ path: `${out}-hit.png` });
await zoom('hit');
await page.evaluate(() => window.__nc.slow(0.05));
await freezeOn(true);
await page.screenshot({ path: `${out}-kill.png` });
await zoom('kill');
await page.evaluate(() => window.__nc.slow(1));
await page.keyboard.up('Space');
const hurt = async (name, side) => {
  await page.evaluate((s) => {
    const sim = window.__nc.sim();
    const pl = sim.player;
    const a = sim.bike.heading;
    // the visual right of heading a is (-sin a, cos a)
    const dir = s === 'left' ? [Math.sin(a), -Math.cos(a)] : [-Math.cos(a), -Math.sin(a)];
    // hurt inside the next step so the event reaches the HUD like a real hit
    const step = sim.step;
    sim.step = (intent) => {
      step.call(sim, intent);
      sim.step = step;
      sim.hurtPlayer(12, pl.x + dir[0] * 100, pl.y + dir[1] * 100);
    };
    window.__nc.slow(0.05);
  }, side);
  await page.waitForFunction(
    () => {
      const on = [...document.querySelectorAll('.hurtvignette i')].some((i) => i.style.opacity > 0.6);
      if (on) window.__nc.slow(0.0005);
      return on;
    },
    null,
    { timeout: 60000, polling: 'raf' },
  );
  await page.screenshot({ path: `${out}-${name}.png` });
  console.log(name, await page.evaluate(() => [...document.querySelectorAll('.hurtvignette i')].map((i) => `${i.className}=${i.style.opacity || 0}`).join(' ')));
  await page.evaluate(() => window.__nc.slow(1));
};
await page.waitForTimeout(4000);
await hurt('left', 'left');
await page.waitForTimeout(3000);
await hurt('behind', 'behind');
console.log(JSON.stringify(await page.evaluate(() => window.__nc.state())));
console.log(logs.join('\n'));
await browser.close();

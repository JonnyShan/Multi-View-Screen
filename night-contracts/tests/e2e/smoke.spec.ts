import { expect, test, type Page } from '@playwright/test';

const MILESTONE = process.env.MILESTONE ?? 'latest';

type State = Record<string, unknown>;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function state(page: Page): Promise<State> {
  return page.evaluate(() => window.__nc!.state());
}

test('boot, ride, answer the phone', async ({ page }, info) => {
  const errors = watchErrors(page);
  const phone = info.project.name === 'iphone';
  await page.goto('/?e2e=1');
  await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120_000 });
  await expect(page.locator('[data-act="ride"]')).toHaveText('RIDE');
  await page.locator('[data-act="ride"]').click();
  await expect.poll(async () => (await state(page)).playing).toBe(true);

  // ride for five seconds: keyboard on desktop, the floating thumb stick on the phone
  const start = await state(page);
  if (phone) {
    const vp = page.viewportSize()!;
    const sx = vp.width * 0.2;
    const sy = vp.height * 0.7;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx, sy - 60, { steps: 4 });
    await page.waitForTimeout(5000);
    await page.mouse.up();
  } else {
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(5000);
    await page.keyboard.up('KeyW');
  }
  const after = await state(page);
  const moved = Math.hypot((after.x as number) - (start.x as number), (after.y as number) - (start.y as number));
  expect(moved).toBeGreaterThan(5);

  // the phone rings a few seconds in; answer it
  await expect.poll(async () => (await state(page)).contract, { timeout: 150_000, intervals: [1000] }).toBe('ringing');
  if (phone) await page.locator('.phone').click({ force: true });
  else await page.keyboard.press('Enter');
  await expect.poll(async () => (await state(page)).contract, { timeout: 30_000 }).toBe('briefed');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `docs/screenshots/${MILESTONE}-${info.project.name}.png` });

  const s = await state(page);
  console.log(`[${info.project.name}] calls=${s.calls} tris=${s.triangles} quality=${s.quality}`);
  expect(errors).toEqual([]);
});

test('saves progress and settings across a reload', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'storage behaviour is the same on both');
  const errors = watchErrors(page);
  await page.goto('/?e2e=1&q=low');
  await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120_000 });
  await page.locator('[data-act="ride"]').click();
  await page.evaluate(() => {
    window.__nc!.sim()!.player.cash = 43210;
  });
  // pausing persists the save
  await page.keyboard.press('Escape');
  await expect(page.locator('.screen.on h2')).toHaveText('PAUSED');
  await page.reload();
  await page.waitForFunction(() => window.__nc?.ready(), null, { timeout: 120_000 });
  expect((await state(page)).cash).toBe(43210);
  expect(errors).toEqual([]);
});

// Dev helper: renders a GLB from six angles (dev server on port 5199) and prints its size.
// usage: node tools/glbview.mjs model.glb out-prefix [zoom] [spin radians] [mark radius] [clip@seconds,...]
import fs from 'node:fs';
import { chromium } from '@playwright/test';
const [file, prefix = 'glb', zoom = '0.9', spin = '0', marks = '0', poses = ''] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
page.on('pageerror', (e) => console.log(`pageerror: ${e.message}`));
await page.goto('http://localhost:5199/tools/glbview.html');
await page.waitForFunction(() => window.glbReady, null, { timeout: 60000 });
const b64 = fs.readFileSync(file).toString('base64');
const runs = poses ? poses.split(',').map((p) => p.split('@')) : [[null, 0]];
for (const [clip, time] of runs) {
  const views = clip ? [['side', [1, 0.2, 0.15]], ['front', [0.3, 0.2, 1]]] : undefined;
  const res = await page.evaluate(([b, z, sp, mk, c, t, v]) => window.renderGlb(b, { zoom: +z, spin: +sp, marks: +mk, clip: c, time: +t, views: v }), [b64, zoom, spin, marks, clip, time, views]);
  for (const [name, url] of res.out) fs.writeFileSync(`${prefix}${clip ? `-${clip}${time}` : ''}-${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  delete res.out;
  console.log(JSON.stringify(res));
}
await browser.close();

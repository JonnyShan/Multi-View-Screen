// Smoke-tests a game folder in headless Chromium: loads it, passes the age gate if there is one, checks the title
// screen, optionally rides for a few seconds, and reports console errors plus the download and folder size.
//
//   node tools/check.cjs <game-folder> [--play] [--q high] [--shots <dir>]
//
// --q picks the graphics tier (default mid; the low tier skips the 3D models). Needs Playwright with Chromium
// (npm i in tools/, then npx playwright install chromium).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const dir = path.resolve(args[0] || '.');
const flag = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const play = !!flag('play', false), q = flag('q', 'mid'), shots = flag('shots', null);
const LIMIT = 10 * 1024 * 1024;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg' };
const served = new Map(); // path -> bytes, i.e. what a first-time player downloads
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(dir, u === '/' ? 'index.html' : u);
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  served.set(f, fs.statSync(f).size);
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const folderBytes = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => {
  const p = path.join(d, e.name);
  return s + (e.isDirectory() ? folderBytes(p) : fs.statSync(p).size);
}, 0);
const mb = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('requestfailed', r => errors.push('request failed: ' + r.url()));
  p.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  const t0 = Date.now();
  await p.goto(`http://localhost:${port}/index.html?fixeddt=0.033&q=${q}&noga=1`);
  await p.waitForFunction(() => window.__ready === true && window.__game && ['gate', 'title'].includes(window.__game.state), null, { timeout: 240000 });
  const loadS = ((Date.now() - t0) / 1000).toFixed(1);
  const snap = async (name) => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, name + '.png'), timeout: 240000 }); } };
  let state = await p.evaluate(() => window.__game.state);
  const report = { folder: path.relative(process.cwd(), dir) || '.', load: loadS + ' s (software rendering)', firstState: state };
  if (state === 'gate') {
    await p.waitForTimeout(600);
    await snap('gate');
    report.gate = await p.evaluate(() => ({ question: document.querySelector('#gate h2').textContent, yes: document.querySelector('#gateYes').textContent, no: document.querySelector('#gateNo').textContent }));
    await p.click('#gateYes');
    await p.waitForFunction(() => window.__game.state === 'title', null, { timeout: 10000 });
    state = 'title';
  }
  await p.waitForFunction(() => getComputedStyle(document.querySelector('#gate')).opacity === '0', null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  await snap('title');
  report.title = await p.evaluate(() => ({ tab: document.title, legal: document.querySelector('#legal').textContent, logo: !!document.querySelector('#title .wm img') }));
  if (play) {
    await p.click('#btnRide');
    await p.waitForFunction(() => window.__game.state === 'race', null, { timeout: 240000 });
    await p.keyboard.down('ArrowUp');
    await p.waitForFunction(() => window.__game.raceT > 5, null, { timeout: 240000 });
    await snap('race');
    report.race = await p.evaluate(() => ({ t: +window.__game.raceT.toFixed(1), kmh: Math.round(window.__game.st.v * 3.6) }));
    await p.keyboard.up('ArrowUp');
  }
  report.errors = errors;
  report.downloaded = mb([...served.values()].reduce((a, b) => a + b, 0)) + ` (${served.size} files)`;
  const folder = folderBytes(dir) - (fs.existsSync(path.join(dir, 'README.md')) ? fs.statSync(path.join(dir, 'README.md')).size : 0);
  report.folder_size = mb(folder) + (folder <= LIMIT ? ' (under 10 MB)' : ' (OVER 10 MB)');
  console.log(JSON.stringify(report, null, 2));
  await b.close();
  server.close();
  process.exit(errors.length || folder > LIMIT ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

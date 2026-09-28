import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../tools/build.mjs';
import { ROOT } from '../tools/lib/project.mjs';
import { readZip } from '../tools/lib/zip.mjs';
import { readCmap, familyFiles } from '../tools/lib/fonts.mjs';
import { readJson } from '../tools/lib/project.mjs';

const OUT = '.qa-tmp/test-build';

test('dev build produces self contained files with no external URLs', async () => {
  const result = await build({ out: OUT, quiet: true });
  const dir = path.join(ROOT, OUT);
  for (const name of ['index.html', 'playable-mraid.html', 'review.html', 'harness.html', 'vec-quiz-ad.zip', 'build-report.json']) {
    assert.ok(fs.existsSync(path.join(dir, name)), name);
  }
  const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.ok(!/<script[^>]+src=/.test(index), 'no script src in the web build');
  assert.ok(!/<link[^>]+stylesheet/.test(index));
  assert.match(index, /var clickTag = "";/);
  assert.match(index, /@font-face\{font-family:"?VQ Latin"?;/);
  assert.ok(!index.includes(String.fromCharCode(0x2013)));
  const mraid = fs.readFileSync(path.join(dir, 'playable-mraid.html'), 'utf8');
  assert.match(mraid, /<script src="mraid.js"><\/script>/);
  const zip = readZip(fs.readFileSync(path.join(dir, 'vec-quiz-ad.zip')));
  assert.deepEqual(zip.map((e) => e.name), ['index.html']);
  assert.equal(zip[0].data.toString('utf8'), index);
  assert.equal(result.guard.filter((g) => g.level === 'error').length, 0);
  assert.deepEqual(result.included, ['en']);
});

test('the ad build carries no review bridge; the review build does', async () => {
  const dir = path.join(ROOT, OUT);
  const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.ok(!index.includes('vq-review'), 'review hook stripped from the ad');
  const review = fs.readFileSync(path.join(dir, 'review.html'), 'utf8');
  assert.ok(review.includes('vq-review'));
});

test('builds are deterministic', async () => {
  const a = fs.readFileSync(path.join(ROOT, OUT, 'index.html'));
  await build({ out: OUT, quiet: true });
  const b = fs.readFileSync(path.join(ROOT, OUT, 'index.html'));
  assert.ok(a.equals(b));
});

test('release build refuses placeholder copy, missing languages and empty client details', async () => {
  await assert.rejects(build({ out: OUT + '-release', quiet: true, release: true }), (e) => {
    const text = e.problems.join('\n');
    assert.match(text, /placeholder/);
    assert.match(text, /Arabic has no copy yet/);
    assert.match(text, /cta\.url is empty/);
    assert.match(text, /placement\.maxZipBytes is empty/);
    return true;
  });
});

test('client details dropped in as JSON flow into the build', async () => {
  const result = await build({
    out: OUT + '-override',
    quiet: true,
    override: {
      cta: { url: 'https://example.com/test-cta' },
      brand: { colours: { primary: '#123456' } },
      placement: { sizes: [{ width: 320, height: 480 }], maxZipBytes: 500000 }
    }
  });
  const dir = path.join(ROOT, OUT + '-override');
  const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.match(index, /var clickTag = "https:\/\/example.com\/test-cta";/);
  assert.match(index, /--vq-primary:#123456/);
  const sized = fs.readFileSync(path.join(dir, 'index-320x480.html'), 'utf8');
  assert.match(sized, /<meta name="ad.size" content="width=320,height=480">/);
  assert.ok(fs.existsSync(path.join(dir, 'vec-quiz-320x480.zip')));
  assert.ok(result.guard.some((g) => g.check === 'zip-size' && g.level === 'pass'));
});

test('bad client values are rejected rather than shipped', async () => {
  await assert.rejects(build({ out: OUT + '-bad', quiet: true, override: { brand: { colours: { primary: 'blue' } } } }), /#RRGGBB/);
  await assert.rejects(build({ out: OUT + '-bad', quiet: true, override: { cta: { url: 'http://insecure.example' } } }), /https/);
});

test('the subset fonts keep every character the copy uses', async () => {
  const report = readJson(path.join(OUT, 'build-report.json'));
  assert.ok(report.fonts.length >= 2);
  const latin = familyFiles(readJson('config/fonts.json').families.latin);
  const cmap = readCmap(fs.readFileSync(latin['400']));
  for (const ch of 'AZaz09 ') assert.ok(cmap.has(ch.codePointAt(0)));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeZip, readZip, crc32 } from '../tools/lib/zip.mjs';
import { scanHtml, checkZip } from '../tools/lib/guard.mjs';

const EN_DASH = String.fromCharCode(0x2013);
const html = (head = '<script>var clickTag = "";</script>', body = '') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

test('zip round trip keeps names and bytes, with valid CRCs', () => {
  const entries = [
    { name: 'index.html', data: Buffer.from('<p>' + 'x'.repeat(5000) + '</p>') },
    { name: 'tiny.json', data: Buffer.from('{}') }
  ];
  const back = readZip(writeZip(entries));
  assert.deepEqual(back.map((e) => e.name), ['index.html', 'tiny.json']);
  back.forEach((e, i) => {
    assert.ok(e.crcOk);
    assert.ok(e.data.equals(entries[i].data));
  });
  assert.equal(back[0].method, 8);
  assert.equal(back[1].method, 0);
});

test('zip output is deterministic', () => {
  const entries = [{ name: 'index.html', data: Buffer.from('same') }];
  assert.ok(writeZip(entries).equals(writeZip(entries)));
});

test('crc32 matches the standard check value', () => {
  assert.equal(crc32(Buffer.from('123456789')).toString(16), 'cbf43926');
});

test('zips pass the system unzip integrity test when unzip is installed', (t) => {
  let hasUnzip = true;
  try {
    execFileSync('unzip', ['-v'], { stdio: 'ignore' });
  } catch (e) {
    hasUnzip = false;
  }
  if (!hasUnzip) return t.skip('unzip not installed');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vq-zip-')), 'a.zip');
  fs.writeFileSync(file, writeZip([{ name: 'index.html', data: Buffer.from('hello'.repeat(100)) }]));
  assert.match(execFileSync('unzip', ['-t', file], { encoding: 'utf8' }), /No errors detected/);
});

test('guard passes a clean single file, and the configured click URL is allowed', () => {
  const results = scanHtml(html(), { label: 't', expectMraidTag: false });
  assert.equal(results.filter((r) => r.level === 'error').length, 0);
  const withCta = html('<script>var clickTag = "https://example.com/cta";</script>');
  assert.equal(scanHtml(withCta, { label: 't', expectMraidTag: false, allowUrls: ['https://example.com/cta'] }).filter((r) => r.level === 'error').length, 0);
  assert.ok(scanHtml(withCta, { label: 't', expectMraidTag: false }).some((r) => r.check === 'external-urls' && r.level === 'error'));
});

test('guard catches external requests, stray scripts and en dashes', () => {
  const bad = html('<script src="https://cdn.example.com/lib.js"></script><link rel="stylesheet" href="https://x.test/a.css">', 'Hi ' + EN_DASH + ' there <img src="//cdn.test/a.png">');
  const checks = scanHtml(bad, { label: 't', expectMraidTag: false }).filter((r) => r.level === 'error').map((r) => r.check);
  for (const c of ['external-urls', 'script-src', 'stylesheet', 'en-dash', 'protocol-relative', 'clicktag']) assert.ok(checks.includes(c), c);
});

test('guard allows XML namespaces and allowlisted URLs but nothing else', () => {
  const page = html(undefined, '<svg xmlns="http://www.w3.org/2000/svg"></svg><a data-x="https://agreed.example/e">');
  assert.equal(scanHtml(page, { label: 't', expectMraidTag: false, allowUrls: ['https://agreed.example/e'] }).filter((r) => r.level === 'error').length, 0);
  assert.ok(scanHtml(page, { label: 't', expectMraidTag: false }).some((r) => r.check === 'external-urls' && r.level === 'error'));
});

test('guard ignores base64 font data that happens to contain "http"', () => {
  const page = html(undefined, '<style>@font-face{src:url(data:font/woff2;base64,AAhttpAAhttpsBB==)}</style>');
  assert.equal(scanHtml(page, { label: 't', expectMraidTag: false }).filter((r) => r.level === 'error').length, 0);
});

test('guard enforces the MRAID tag rules for each variant', () => {
  const withTag = html('<script src="mraid.js"></script><script>var clickTag = "";</script>');
  assert.ok(scanHtml(withTag, { label: 't', expectMraidTag: false }).some((r) => r.check === 'mraid-tag' && r.level === 'error'));
  assert.ok(scanHtml(html(), { label: 't', expectMraidTag: true }).some((r) => r.check === 'mraid-tag' && r.level === 'error'));
  assert.equal(scanHtml(withTag, { label: 't', expectMraidTag: true }).filter((r) => r.level === 'error').length, 0);
});

test('zip guard: structure, junk files and size limit', () => {
  const good = writeZip([{ name: 'index.html', data: Buffer.from(html()) }]);
  assert.equal(checkZip(good, { label: 'z' }).filter((r) => r.level === 'error').length, 0);
  assert.ok(checkZip(good, { label: 'z' }).some((r) => r.check === 'zip-size' && r.level === 'warning'));
  assert.ok(checkZip(good, { label: 'z', release: true }).some((r) => r.check === 'zip-size' && r.level === 'error'));
  assert.ok(checkZip(good, { label: 'z', maxZipBytes: 10 }).some((r) => r.check === 'zip-size' && r.level === 'error'));
  const messy = writeZip([
    { name: 'ad/index.html', data: Buffer.from('x') },
    { name: '__MACOSX/._index.html', data: Buffer.from('x') },
    { name: 'notes.docx', data: Buffer.from('x') }
  ]);
  const checks = checkZip(messy, { label: 'z' }).filter((r) => r.level === 'error').map((r) => r.check);
  for (const c of ['zip-index', 'zip-flat', 'zip-junk', 'zip-types']) assert.ok(checks.includes(c), c);
});

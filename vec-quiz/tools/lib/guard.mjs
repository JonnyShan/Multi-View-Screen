// Ad package guard: checks a built HTML file and its zip against what ad servers
// reject most often. Limits come from config/client.json placement; while a limit is
// unknown the guard reports the size and says the limit is missing instead of guessing.

import { readZip } from './zip.mjs';

// XML namespace identifiers are not network requests.
const NAMESPACE_URLS = [
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/XML/1998/namespace'
];

const ALLOWED_EXT = /\.(html|js|css|png|jpe?g|gif|svg|webp|woff2?|json)$/i;

export function formatBytes(n) {
  if (n === null || n === undefined) return 'unknown';
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

function stripDataUris(html) {
  return html.replace(/data:[a-z0-9.+/-]+(;[a-z0-9=.+-]+)*,[A-Za-z0-9+/=%._-]*/gi, 'data:');
}

export function scanHtml(html, { allowUrls = [], expectMraidTag = false, expectClickTag = true, expectAdSize = null, maxHtmlBytes = null, label = 'HTML' }) {
  const results = [];
  const add = (level, check, message) => results.push({ level, check, message: `${label}: ${message}` });
  const bytes = Buffer.byteLength(html);
  const text = stripDataUris(html);
  const allowed = new Set(NAMESPACE_URLS.concat(allowUrls.filter(Boolean)));

  const urls = [...new Set(text.match(/https?:\/\/[^\s"'<>)\\]+/gi) || [])];
  const external = urls.filter((u) => ![...allowed].some((a) => u === a || u.startsWith(a)));
  if (external.length) add('error', 'external-urls', `references external URLs: ${external.slice(0, 5).join(', ')}`);
  else add('pass', 'external-urls', 'no external URLs outside the allowlist');

  if (/(src|href)\s*=\s*["']?\/\//i.test(text) || /url\(\s*["']?\/\//i.test(text)) {
    add('error', 'protocol-relative', 'uses a protocol relative URL');
  }
  const scriptSrcs = [...text.matchAll(/<script[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/gi)].map((m) => m[1]);
  const badScripts = scriptSrcs.filter((s) => s !== 'mraid.js');
  if (badScripts.length) add('error', 'script-src', `loads scripts from files: ${badScripts.join(', ')}`);
  const hasMraidTag = scriptSrcs.includes('mraid.js');
  if (expectMraidTag && !hasMraidTag) add('error', 'mraid-tag', 'MRAID variant is missing <script src="mraid.js">');
  if (!expectMraidTag && hasMraidTag) add('error', 'mraid-tag', 'web variant must not reference mraid.js');
  if (expectMraidTag && hasMraidTag) add('pass', 'mraid-tag', 'references mraid.js for the host to inject');
  if (/<link[^>]+rel\s*=\s*["']?stylesheet/i.test(text) || /@import/i.test(text)) {
    add('error', 'stylesheet', 'loads an external stylesheet');
  }
  if (/<iframe/i.test(text)) add('warning', 'iframe', 'contains an iframe');

  if (expectClickTag) {
    const m = /var\s+clickTag\s*=\s*"([^"]*)"/.exec(html);
    if (!m) add('error', 'clicktag', 'no clickTag declaration in the head');
    else if (!m[1]) add('warning', 'clicktag', 'clickTag is declared but empty because cta.url is not set yet');
    else add('pass', 'clicktag', 'clickTag declared');
  }
  if (expectAdSize) {
    const want = `width=${expectAdSize.width},height=${expectAdSize.height}`;
    if (!html.includes(`<meta name="ad.size" content="${want}">`)) add('error', 'ad-size', `missing ad.size meta for ${want}`);
    else add('pass', 'ad-size', `ad.size ${want}`);
  } else {
    add('warning', 'ad-size', 'no ad.size meta: placement sizes are not known yet (config/client.json placement.sizes)');
  }
  if (html.includes(String.fromCharCode(0x2013))) add('error', 'en-dash', 'contains an en dash');
  if (maxHtmlBytes) {
    if (bytes > maxHtmlBytes) add('error', 'html-size', `${formatBytes(bytes)} is over the ${formatBytes(maxHtmlBytes)} limit`);
    else add('pass', 'html-size', `${formatBytes(bytes)} is within the ${formatBytes(maxHtmlBytes)} limit`);
  } else {
    add('info', 'html-size', `${formatBytes(bytes)} (no HTML size limit set yet)`);
  }
  return results;
}

export function checkZip(buf, { maxZipBytes = null, label = 'zip', release = false }) {
  const results = [];
  const add = (level, check, message) => results.push({ level, check, message: `${label}: ${message}` });
  let entries;
  try {
    entries = readZip(buf);
  } catch (e) {
    add('error', 'zip-read', e.message);
    return results;
  }
  const names = entries.map((e) => e.name);
  if (!names.includes('index.html')) add('error', 'zip-index', 'index.html is not at the root of the zip');
  else add('pass', 'zip-index', 'index.html at the root');
  const nested = names.filter((n) => n.includes('/'));
  if (nested.length) add('error', 'zip-flat', `contains folders: ${nested.join(', ')}`);
  const junk = names.filter((n) => /(^|\/)(\.|__MACOSX)/.test(n));
  if (junk.length) add('error', 'zip-junk', `contains hidden or system files: ${junk.join(', ')}`);
  const badType = names.filter((n) => !ALLOWED_EXT.test(n));
  if (badType.length) add('error', 'zip-types', `contains unsupported file types: ${badType.join(', ')}`);
  const badName = names.filter((n) => !/^[A-Za-z0-9._/-]+$/.test(n));
  if (badName.length) add('error', 'zip-names', `file names must be plain ASCII without spaces: ${badName.join(', ')}`);
  const badCrc = entries.filter((e) => !e.crcOk).map((e) => e.name);
  if (badCrc.length) add('error', 'zip-crc', `CRC mismatch: ${badCrc.join(', ')}`);
  if (maxZipBytes) {
    if (buf.length > maxZipBytes) add('error', 'zip-size', `${formatBytes(buf.length)} is over the ${formatBytes(maxZipBytes)} limit`);
    else add('pass', 'zip-size', `${formatBytes(buf.length)} is within the ${formatBytes(maxZipBytes)} limit`);
  } else {
    add(release ? 'error' : 'warning', 'zip-size',
      `${formatBytes(buf.length)}; the zip size limit is unknown until the placement specs arrive (config/client.json placement.maxZipBytes)`);
  }
  return results;
}

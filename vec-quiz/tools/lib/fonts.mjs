// Font pipeline: fetch pinned sources, read cmaps, subset to WOFF2.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import subsetFont from 'subset-font';
import fontverter from 'fontverter';
import { ROOT, rel } from './project.mjs';

export const CACHE_DIR = path.join(ROOT, 'fonts', 'cache');

function cacheDirFor(family) {
  return path.join(CACHE_DIR, `${family.package.replace(/[@/]/g, '_')}@${family.version}`);
}

// Minimal tar reader for npm tarballs.
function untar(buf) {
  const files = new Map();
  let p = 0;
  let longName = null;
  while (p + 512 <= buf.length) {
    const header = buf.subarray(p, p + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, len) => header.toString('utf8', start, start + len).replace(/\0.*$/s, '');
    let name = field(0, 100);
    const prefix = field(345, 155);
    if (prefix) name = prefix + '/' + name;
    const size = parseInt(field(124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    const body = buf.subarray(p + 512, p + 512 + size);
    if (type === 'x') {
      const match = /\d+ path=([^\n]+)\n/.exec(body.toString('utf8'));
      longName = match ? match[1] : null;
    } else if (type === '0' || type === '\0') {
      files.set(longName || name, Buffer.from(body));
      longName = null;
    }
    p += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

export function familyFiles(family) {
  const dir = cacheDirFor(family);
  const out = {};
  for (const [weight, file] of Object.entries(family.files)) out[weight] = path.join(dir, file);
  out.license = path.join(dir, family.licenseFile);
  return out;
}

export function ensureFamily(key, family, log = () => {}) {
  const files = familyFiles(family);
  const missing = Object.values(files).filter((f) => !fs.existsSync(f));
  if (!missing.length) return files;
  const spec = `${family.package}@${family.version}`;
  log(`Fetching font ${key} (${spec}) from the npm registry...`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vq-font-'));
  try {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const out = execFileSync(npm, ['pack', spec, '--json', '--silent', '--pack-destination', tmp], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const info = JSON.parse(out)[0];
    const tgz = fs.readFileSync(path.join(tmp, info.filename));
    const integrity = 'sha512-' + crypto.createHash('sha512').update(tgz).digest('base64');
    if (integrity !== family.integrity) {
      throw new Error(`Integrity mismatch for ${spec}: expected ${family.integrity}, got ${integrity}. Refusing to use it.`);
    }
    const entries = untar(zlib.gunzipSync(tgz));
    const dir = cacheDirFor(family);
    const wanted = Object.values(family.files).concat([family.licenseFile]);
    for (const name of wanted) {
      const data = entries.get('package/' + name);
      if (!data) throw new Error(`${spec} has no file ${name}.`);
      const target = path.join(dir, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, data);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return files;
}

// Reads the Unicode coverage of a TrueType or OpenType font (cmap formats 4 and 12).
export function readCmap(buf) {
  const numTables = buf.readUInt16BE(4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString('latin1', rec, rec + 4) === 'cmap') cmapOffset = buf.readUInt32BE(rec + 8);
  }
  if (cmapOffset < 0) throw new Error('Font has no cmap table.');
  const count = buf.readUInt16BE(cmapOffset + 2);
  const subtables = [];
  for (let i = 0; i < count; i++) {
    const rec = cmapOffset + 4 + i * 8;
    const platform = buf.readUInt16BE(rec);
    const encoding = buf.readUInt16BE(rec + 2);
    const offset = cmapOffset + buf.readUInt32BE(rec + 4);
    subtables.push({ platform, encoding, offset, format: buf.readUInt16BE(offset) });
  }
  const pick =
    subtables.find((s) => s.format === 12 && (s.platform === 3 || s.platform === 0)) ||
    subtables.find((s) => s.format === 4 && (s.platform === 3 || s.platform === 0));
  if (!pick) throw new Error('Font has no Unicode cmap subtable (format 4 or 12).');
  const covered = new Set();
  if (pick.format === 12) {
    const groups = buf.readUInt32BE(pick.offset + 12);
    for (let g = 0; g < groups; g++) {
      const at = pick.offset + 16 + g * 12;
      const start = buf.readUInt32BE(at);
      const end = buf.readUInt32BE(at + 4);
      const glyph = buf.readUInt32BE(at + 8);
      for (let c = start; c <= end; c++) if (glyph + (c - start) !== 0) covered.add(c);
    }
  } else {
    const o = pick.offset;
    const segCount = buf.readUInt16BE(o + 6) / 2;
    const ends = o + 14;
    const starts = ends + segCount * 2 + 2;
    const deltas = starts + segCount * 2;
    const ranges = deltas + segCount * 2;
    for (let s = 0; s < segCount; s++) {
      const end = buf.readUInt16BE(ends + s * 2);
      const start = buf.readUInt16BE(starts + s * 2);
      const delta = buf.readInt16BE(deltas + s * 2);
      const rangeOffset = buf.readUInt16BE(ranges + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        let glyph;
        if (rangeOffset === 0) {
          glyph = (c + delta) & 0xffff;
        } else {
          const addr = ranges + s * 2 + rangeOffset + (c - start) * 2;
          glyph = buf.readUInt16BE(addr);
          if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph !== 0) covered.add(c);
      }
    }
  }
  return covered;
}

// Name IDs 13 and 14 (licence description and URL) are kept so the SIL OFL notice
// travels inside every embedded font, as the licence asks.
export async function subsetToWoff2(buf, text) {
  const sfnt = await subsetFont(buf, text, { targetFormat: 'sfnt', preserveNameIds: [13, 14] });
  const woff2 = await fontverter.convert(sfnt, 'woff2');
  return { sfnt: Buffer.from(sfnt), woff2: Buffer.from(woff2) };
}

export { rel };

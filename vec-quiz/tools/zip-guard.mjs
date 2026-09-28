#!/usr/bin/env node
// Ad zip guard, standalone. The build already runs it; use this to re-check a zip
// (for example one edited by hand or received back from someone else).
//
//   npm run zip                          checks every dist/*.zip
//   npm run zip -- path/to/file.zip      checks the given zip(s)
//   npm run zip -- --release             treats an unknown size limit as an error

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, rel, loadProject } from './lib/project.mjs';
import { readZip } from './lib/zip.mjs';
import { scanHtml, checkZip } from './lib/guard.mjs';

const args = process.argv.slice(2);
const release = args.includes('--release');
let zips = args.filter((a) => !a.startsWith('--')).map((a) => path.resolve(a));
if (!zips.length) {
  const dist = path.join(ROOT, 'dist');
  zips = fs.existsSync(dist) ? fs.readdirSync(dist).filter((n) => n.endsWith('.zip')).map((n) => path.join(dist, n)) : [];
}
if (!zips.length) {
  console.error('No zip found. Run npm run build first.');
  process.exit(1);
}

const { client } = loadProject().config;
let errors = 0;
for (const file of zips) {
  const buf = fs.readFileSync(file);
  const label = rel(file);
  const results = checkZip(buf, { label, maxZipBytes: client.placement.maxZipBytes || null, release });
  try {
    const index = readZip(buf).find((e) => e.name === 'index.html');
    if (index) {
      const size = (/(\d+)x(\d+)\.zip$/.exec(file) || []).slice(1).map(Number);
      results.push(...scanHtml(index.data.toString('utf8'), {
        label: `${label} index.html`,
        allowUrls: [client.cta.url, client.reporting.enabled ? client.reporting.endpoint : ''],
        expectMraidTag: false,
        expectAdSize: size.length ? { width: size[0], height: size[1] } : null,
        maxHtmlBytes: client.placement.maxHtmlBytes || null
      }));
    }
  } catch (e) {
    // checkZip already reported unreadable zips
  }
  for (const r of results) {
    if (r.level === 'error') errors += 1;
    console.log(`${r.level.padEnd(7)} ${r.message}`);
  }
}
process.exit(errors ? 1 : 0);

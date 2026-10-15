#!/usr/bin/env node
// Font cache.
//
//   npm run fonts             fetch the families the current languages need (plus Latin)
//   npm run fonts -- --all    fetch every family in config/fonts.json (about 150 MB with Chinese)
//   npm run fonts -- --list   show what is cached
//
// Sources are pinned by version and sha512 in config/fonts.json and verified on download.

import fs from 'node:fs';
import { loadProject } from './lib/project.mjs';
import { ensureFamily, familyFiles } from './lib/fonts.mjs';

const args = process.argv.slice(2);
const { config } = loadProject();
const families = config.fonts.families;

if (args.includes('--list')) {
  for (const [key, family] of Object.entries(families)) {
    const files = familyFiles(family);
    const cached = Object.values(files).every((f) => fs.existsSync(f));
    console.log(`${cached ? 'cached ' : 'missing'}  ${key.padEnd(11)} ${family.package}@${family.version}  (${family.covers})`);
  }
  process.exit(0);
}

const wanted = new Set(['latin']);
if (args.includes('--all')) Object.keys(families).forEach((k) => wanted.add(k));
else Object.values(config.languages.languages).forEach((l) => l.font && wanted.add(l.font));

for (const key of wanted) {
  ensureFamily(key, families[key], console.log);
  console.log(`ok  ${key}`);
}

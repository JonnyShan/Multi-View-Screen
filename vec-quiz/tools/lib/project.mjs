// Loads config and content from disk with readable errors. Every tool starts here.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

export function readJson(file) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    throw new Error(`Cannot read ${rel(abs)}: ${e.message}`);
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${rel(abs)} is not valid JSON: ${e.message}`);
  }
}

export function writeJson(file, value) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(value, null, 2) + '\n');
}

// Language content files are content/<code>.json; quiz.json holds the structure.
export function loadContents(dir = path.join(ROOT, 'content')) {
  const contents = {};
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.json') || name === 'quiz.json') continue;
    contents[name.replace(/\.json$/, '')] = readJson(path.join(dir, name));
  }
  return contents;
}

export function loadProject({ contentDir } = {}) {
  const config = {
    client: readJson('config/client.json'),
    languages: readJson('config/languages.json'),
    limits: readJson('config/limits.json'),
    fonts: readJson('config/fonts.json'),
    engine: readJson('config/engine.json')
  };
  const pkg = readJson('package.json');
  const dir = contentDir ? path.resolve(ROOT, contentDir) : path.join(ROOT, 'content');
  return {
    root: ROOT,
    pkg,
    config,
    contentDir: dir,
    quiz: readJson(path.join(dir, 'quiz.json')),
    contents: loadContents(dir)
  };
}

// Walks config/client.json and lists every value that is still empty: these are the
// client details the build is waiting on. Keys starting with "_" are notes.
export function configGaps(client) {
  const gaps = [];
  const walk = (node, trail) => {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('_')) continue;
      const here = trail.concat(key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, here);
      } else if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
        gaps.push(here.join('.'));
      }
    }
  };
  walk(client, []);
  return gaps;
}

// Gaps that block a release build. Reporting stays optional because it ships disabled;
// the brand font is optional because Noto is a valid fallback; legal depends on an
// open question.
export function releaseBlockers(client) {
  const gaps = configGaps(client);
  const optional = [
    /^brand\.fonts\./,
    /^reporting\./,
    /^legal\./,
    /^placement\.(dsp|adServer|environment|maxHtmlBytes|backupImageRequired)$/,
    /^brand\.logo\.forDarkBackground$/,
    /^brand\.logo\.forLightBackground$/,
    /^brand\.colours\.(surface|onPrimary|correct|incorrect)$/
  ];
  const blockers = gaps.filter((g) => !optional.some((re) => re.test(g)));
  const logo = client.brand && client.brand.logo;
  if (logo && !logo.forLightBackground && !logo.forDarkBackground) blockers.push('brand.logo (either version)');
  return blockers;
}

#!/usr/bin/env node
// Copy and config check.
//
//   npm run check              limits and structure for every language file, en dash scan, client gaps
//   npm run check -- --release also fails on missing languages, placeholder copy and empty client details
//
// Exit code 1 when anything blocks.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, rel, loadProject, configGaps, releaseBlockers } from './lib/project.mjs';
import { validateAll } from '../src/js/content.js';

const EN_DASH = String.fromCharCode(0x2013);
const EM_DASH = String.fromCharCode(0x2014);
const TEXT_EXT = /\.(m?js|json|md|html|css|csv|tsv|toml|sql|txt|ya?ml)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '.qa-tmp']);
const SKIP_PATHS = [/^fonts\/cache\//, /^dist\/qa\//];

// Repo wide scan for en dashes (and em dashes, reported as warnings).
export function scanDashes(root = ROOT) {
  const hits = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      const r = rel(abs);
      if (SKIP_PATHS.some((re) => re.test(r + (entry.isDirectory() ? '/' : '')))) continue;
      if (entry.isDirectory()) walk(abs);
      else if (TEXT_EXT.test(entry.name) && entry.name !== 'package-lock.json') {
        const lines = fs.readFileSync(abs, 'utf8').split('\n');
        lines.forEach((line, i) => {
          if (line.includes(EN_DASH)) hits.push({ level: 'error', file: r, line: i + 1, dash: 'en dash' });
          if (line.includes(EM_DASH)) hits.push({ level: 'warning', file: r, line: i + 1, dash: 'em dash' });
        });
      }
    }
  };
  walk(root);
  return hits;
}

export function runCheck({ release = false, log = console.log } = {}) {
  const project = loadProject();
  const { config, quiz, contents } = project;
  const report = validateAll({ quiz, registry: config.languages, contents, limits: config.limits, fonts: config.fonts });
  let errors = 0;
  let warnings = 0;
  const say = (level, message) => {
    if (level === 'error') errors += 1;
    if (level === 'warning') warnings += 1;
    log(`  ${level === 'error' ? 'ERROR' : level === 'warning' ? 'warn ' : 'info '} ${message}`);
  };

  log('Quiz structure (content/quiz.json)');
  if (!report.quizIssues.length) log('  ok');
  report.quizIssues.forEach((i) => say(i.code === 'placeholder' && release ? 'error' : i.level, i.message));

  log('\nLanguages');
  for (const code of Object.keys(report.languages)) {
    const lang = report.languages[code];
    const name = `${lang.profile.name} (${code})`;
    if (lang.status === 'missing') {
      say(release ? 'error' : 'info', `${name}: no copy yet (content/${code}.json)`);
      const pending = (config.languages.languages[code] || {})._pending;
      if (pending) log(`        ${pending}`);
      continue;
    }
    const e = lang.issues.filter((i) => i.level === 'error');
    const w = lang.issues.filter((i) => i.level === 'warning' && i.code !== 'placeholder');
    log(`  ${name}: ${lang.status}${e.length ? `, ${e.length} error(s)` : ''}${w.length ? `, ${w.length} warning(s)` : ''}`);
    e.forEach((i) => say('error', `  ${i.message}`));
    w.forEach((i) => say('warning', `  ${i.message}`));
    if (lang.status === 'placeholder') say(release ? 'error' : 'info', `  ${name} is placeholder copy, not client copy.`);
  }

  log('\nClient details still empty (config/client.json)');
  const gaps = configGaps(config.client);
  const blockers = new Set(releaseBlockers(config.client));
  if (!gaps.length) log('  none');
  gaps.forEach((g) => log(`  ${blockers.has(g) ? 'needed for release' : 'optional          '}  ${g}`));
  if (release) releaseBlockers(config.client).forEach((b) => say('error', `release needs ${b}`));

  log('\nEn dash scan');
  const dashes = scanDashes();
  if (!dashes.length) log('  none found');
  dashes.forEach((d) => say(d.level, `${d.dash} in ${d.file}:${d.line}`));

  log(`\n${errors} error(s), ${warnings} warning(s).${release ? ' (release rules)' : ''}`);
  return { errors, warnings, report, gaps, dashes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors } = runCheck({ release: process.argv.includes('--release') });
  process.exit(errors ? 1 : 0);
}

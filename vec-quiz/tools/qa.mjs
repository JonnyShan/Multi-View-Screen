#!/usr/bin/env node
// QA runner: every automatable item on the QA checklist (docs/QA.md), in Node and
// headless Chromium. Writes dist/qa/qa-report.md and dist/qa/qa-report.json.
//
//   npm run qa              full run (downloads the Chinese fonts once, about 100 MB, for the fixture build)
//   npm run qa -- --no-cjk  skip Mandarin and Cantonese in the fixture build
//
// Browser checks need Chromium: on a Mac run `npx playwright install chromium` once.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadProject } from './lib/project.mjs';
import { runCheck } from './check.mjs';
import { build } from './build.mjs';
import { makeFixtures, writeFixtureDir, FIXTURE_LANGUAGE_OVERRIDE } from './lib/fixtures.mjs';

const args = process.argv.slice(2);
const withCjk = !args.includes('--no-cjk');
const TMP = path.join(ROOT, '.qa-tmp');
const OUT = path.join(ROOT, 'dist', 'qa');
const results = [];

function record(id, title, status, detail = '') {
  results.push({ id, title, status, detail });
  console.log(`${status.padEnd(8)} ${id.padEnd(4)} ${title}${detail ? ': ' + detail : ''}`);
}

const fileUrl = (p) => 'file://' + p.split(path.sep).join('/');
const frames = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 30)))));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  const project = loadProject();
  const { config } = project;
  const client = config.client;
  const viewports = config.engine.testViewports;
  const questions = project.quiz.questions;

  // A. Content and config
  const check = runCheck({ log: () => {} });
  const contentErrors = check.errors - check.dashes.filter((d) => d.level === 'error').length;
  record('A1', 'Copy passes structure and limit checks', contentErrors === 0 ? 'PASS' : 'FAIL', `${contentErrors} error(s); languages: ${Object.entries(check.report.languages).map(([c, l]) => `${c} ${l.status}`).join(', ')}`);
  const enDashes = check.dashes.filter((d) => d.level === 'error');
  record('A2', 'No en dashes anywhere in the repo', enDashes.length ? 'FAIL' : 'PASS', enDashes.length ? enDashes.map((d) => `${d.file}:${d.line}`).join(', ') : 'scanned source, config, content, docs and dist');
  const mustBeEmpty = {
    'brand.logo': client.brand.logo.forLightBackground || client.brand.logo.forDarkBackground,
    'brand.colours': Object.entries(client.brand.colours).filter(([k]) => !k.startsWith('_')).map(([, v]) => v).join(''),
    'brand.fonts.latin.family': client.brand.fonts.latin.family,
    'cta.url': client.cta.url,
    'placement.sizes': client.placement.sizes.length ? 'set' : '',
    'placement.maxZipBytes': client.placement.maxZipBytes === null ? '' : 'set',
    'placement.dsp': client.placement.dsp,
    'reporting.endpoint': client.reporting.endpoint,
    'languages.cmn.font': config.languages.languages.cmn.font + config.languages.languages.cmn.script,
    'languages.yue.font': config.languages.languages.yue.font + config.languages.languages.yue.script
  };
  const filled = Object.entries(mustBeEmpty).filter(([, v]) => v).map(([k]) => k);
  record('A3', 'Unknown client details are empty hooks, not guesses', filled.length ? 'FAIL' : 'PASS',
    filled.length ? `filled without a source: ${filled.join(', ')}` : `${check.gaps.length} empty hooks in config/client.json plus Mandarin and Cantonese script`);
  let unit = { ok: false, text: '' };
  try {
    const out = execFileSync(process.execPath, ['--test', 'test/*.test.mjs'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    unit = { ok: true, text: out };
  } catch (e) {
    unit = { ok: false, text: String(e.stdout || '') + String(e.stderr || '') };
  }
  const pass = /# pass (\d+)/.exec(unit.text);
  const fail = /# fail (\d+)/.exec(unit.text);
  record('A4', 'Unit tests (engine, content rules, sheet2json, zip guard, build, Worker)', unit.ok ? 'PASS' : 'FAIL', `${pass ? pass[1] : '?'} passed, ${fail ? fail[1] : '?'} failed`);

  // B. Build
  let dist;
  try {
    dist = await build({ quiet: true });
  } catch (e) {
    record('B1', 'Dev build', 'FAIL', e.message);
    return finish();
  }
  const guardErrors = dist.guard.filter((g) => g.level === 'error');
  const external = dist.guard.filter((g) => g.check === 'external-urls' || g.check === 'script-src' || g.check === 'stylesheet');
  record('B1', 'Single file: web and MRAID builds inline everything, no external requests', guardErrors.length || external.some((g) => g.level === 'error') ? 'FAIL' : 'PASS',
    `index.html ${dist.files.find((f) => f.name === 'index.html').size}, playable-mraid.html ${dist.files.find((f) => f.name === 'playable-mraid.html').size}`);
  const zip = dist.files.find((f) => f.name === 'vec-quiz-ad.zip');
  const zipSize = dist.guard.find((g) => g.check === 'zip-size');
  record('B3', 'Ad zip guard: structure (index.html at root, flat, allowed types, CRC)', dist.guard.some((g) => g.check.startsWith('zip-') && g.level === 'error') ? 'FAIL' : 'PASS', `vec-quiz-ad.zip ${zip.size}`);
  record('B3b', 'Ad zip guard: size within the placement limit', client.placement.maxZipBytes ? (zipSize.level === 'pass' ? 'PASS' : 'FAIL') : 'BLOCKED',
    client.placement.maxZipBytes ? zipSize.message : `limit unknown until the placement specs arrive; current zip ${zip.size}`);
  const a = fs.readFileSync(path.join(ROOT, 'dist/index.html'));
  const again = await build({ quiet: true, out: '.qa-tmp/dist-repeat' });
  const b = fs.readFileSync(path.join(again.outDir, 'index.html'));
  record('B4', 'Deterministic build (same input, byte identical output)', a.equals(b) ? 'PASS' : 'FAIL', `content hash ${dist.hash}`);
  let releaseProblems = [];
  try {
    await build({ quiet: true, release: true, out: '.qa-tmp/dist-release' });
  } catch (e) {
    releaseProblems = e.problems || [e.message];
  }
  record('B5', 'Release build refuses to ship placeholder copy or empty client details', releaseProblems.length ? 'PASS' : 'FAIL', `refused with ${releaseProblems.length} blocker(s), as expected today`);

  // Fixture build: sample text in all six scripts (not client copy).
  const fixtureCodes = config.languages.order.filter((c) => withCjk || (c !== 'cmn' && c !== 'yue'));
  const fixtures = makeFixtures({ quiz: project.quiz, english: project.contents.en, limits: config.limits, codes: fixtureCodes });
  writeFixtureDir(path.join(TMP, 'content'), { quiz: project.quiz, files: fixtures });
  let fixture;
  try {
    fixture = await build({ quiet: true, contentDir: path.join(TMP, 'content'), languagesOverride: FIXTURE_LANGUAGE_OVERRIDE, out: '.qa-tmp/dist-fixture', override: { cta: { url: 'https://example.com/qa-cta' } } });
    const uncovered = fixture.warnings.filter((w) => /No font covers/.test(w));
    record('B2', 'Fonts subset per language and inlined; every character covered', uncovered.length ? 'FAIL' : 'PASS',
      `fixture build with ${fixture.included.length} scripts: ${fixture.fonts.filter((f) => f.weight === '400').map((f) => `${f.family} ${f.size}`).join(', ')} (x2 weights); total ${fixture.files.find((f) => f.name === 'index.html').size}`);
  } catch (e) {
    record('B2', 'Fonts subset per language and inlined; every character covered', 'FAIL', e.message);
  }
  const reported = await build({ quiet: true, out: '.qa-tmp/dist-report', override: { cta: { url: 'https://example.com/qa-cta' }, reporting: { enabled: true, endpoint: 'https://reporting.qa.invalid/e', campaignId: 'qa' } } });

  // C to F need a browser.
  let chromium;
  let browser;
  try {
    ({ chromium } = await import('playwright-core'));
    browser = await chromium.launch();
  } catch (e) {
    const why = `Chromium not available (${e.message.split('\n')[0]}). Run: npx playwright install chromium`;
    ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4', 'F1', 'F2'].forEach((id) => record(id, 'Browser check', 'NOT RUN', why));
    return finish();
  }

  const watch = (page) => {
    const log = { errors: [], external: [], failed: [] };
    page.on('pageerror', (e) => log.errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') log.errors.push(m.text());
    });
    page.on('request', (r) => {
      if (/^https?:/.test(r.url())) log.external.push(r.url());
    });
    page.on('requestfailed', (r) => log.failed.push(r.url()));
    return log;
  };

  // C1: loads cleanly at every viewport.
  {
    const problems = [];
    for (const v of viewports) {
      const page = await browser.newPage({ viewport: { width: v.width, height: v.height } });
      const log = watch(page);
      await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')));
      await page.evaluate(() => document.fonts.ready);
      await frames(page);
      if (log.errors.length || log.external.length || log.failed.length) problems.push(`${v.width}x${v.height}: ${[...log.errors, ...log.external, ...log.failed].join('; ')}`);
      await page.close();
    }
    record('C1', 'Loads with no console errors, failed or external requests at every test viewport', problems.length ? 'FAIL' : 'PASS', problems.join(' | ') || `${viewports.length} viewports`);
  }

  // C2, C3, C6, C7: English end to end.
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    const log = watch(page);
    await page.addInitScript(() => {
      window.__opened = [];
      window.open = (url) => {
        window.__opened.push(url);
        return null;
      };
    });
    const run = async (pick) => {
      await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')));
      await page.evaluate(() => document.fonts.ready);
      const seen = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const target = pick(q);
        await page.click(`.vq-answer[data-answer="${target}"]`);
        const feedback = await page.textContent('.vq-feedback-text');
        const disabled = await page.$$eval('.vq-answer', (els) => els.every((e) => e.disabled));
        seen.push({ feedback, disabled });
        await page.click('.vq-next');
      }
      await frames(page);
      return { score: await page.textContent('.vq-score'), screen: await page.getAttribute('#vq', 'data-screen'), seen };
    };
    const right = await run((q) => q.correct);
    const wrong = await run((q) => q.answers.find((x) => x !== q.correct));
    const total = questions.length;
    const ok = right.screen === 'end' && right.score === `You got ${total} out of ${total}` && wrong.score === `You got 0 out of ${total}` &&
      right.seen.every((s) => s.feedback === 'Correct' && s.disabled) && wrong.seen.every((s) => s.feedback === 'Not quite');
    await page.click('.vq-replay');
    const afterReplay = await page.getAttribute('#vq', 'data-screen');
    const events = await page.evaluate(() => window.__vqEvents.map((e) => e.e));
    record('C2', 'English end to end: answer, feedback, next, score, replay', ok && afterReplay === 'question' ? 'PASS' : 'FAIL',
      `all right: "${right.score}", all wrong: "${wrong.score}", replay goes to ${afterReplay} (single language, so no picker); events: ${[...new Set(events)].join(', ')}`);
    // CTA with no URL configured: notice, no navigation.
    await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')) + '');
    for (const q of questions) {
      await page.click(`.vq-answer[data-answer="${q.correct}"]`);
      await page.click('.vq-next');
    }
    await page.click('.vq-cta');
    const opened = await page.evaluate(() => window.__opened.slice());
    const notice = await page.textContent('.vq-notice');
    // CTA with the ad server's clickTag set.
    const clickPage = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await clickPage.addInitScript(() => {
      window.__opened = [];
      window.open = (url) => {
        window.__opened.push(url);
        return null;
      };
    });
    const html = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8').replace('var clickTag = "";', 'var clickTag = "https://example.com/clicktag-test";');
    fs.writeFileSync(path.join(TMP, 'clicktag.html'), html);
    await clickPage.goto(fileUrl(path.join(TMP, 'clicktag.html')));
    for (const q of questions) {
      await clickPage.click(`.vq-answer[data-answer="${q.correct}"]`);
      await clickPage.click('.vq-next');
    }
    await clickPage.click('.vq-cta');
    const openedWithTag = await clickPage.evaluate(() => window.__opened.slice());
    await clickPage.close();
    record('C3', 'CTA uses the ad server clickTag; with no URL set it shows a dev notice and goes nowhere',
      opened.length === 0 && /CTA URL not set/.test(notice) && openedWithTag[0] === 'https://example.com/clicktag-test' ? 'PASS' : 'FAIL',
      `no URL: opened ${opened.length}; clickTag set: opened ${openedWithTag.join(', ') || 'nothing'}`);
    // Keyboard.
    await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')));
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.className);
    await page.keyboard.press('Enter');
    const answered = await page.evaluate(() => document.querySelector('.vq-question').hasAttribute('data-answered'));
    const nextFocused = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('vq-next'));
    await page.keyboard.press('Enter');
    const moved = await page.evaluate(() => document.querySelector('.vq-progress-text').textContent);
    record('C7', 'Keyboard: Tab reaches the answers, Enter answers, focus moves to Next, Enter advances',
      focused === 'vq-answer' && answered && nextFocused && /Question 2/.test(moved) ? 'PASS' : 'FAIL', `first focus ${focused}; after Enter: ${moved}`);
    if (log.errors.length) record('C2b', 'No errors during the playthrough', 'FAIL', log.errors.join('; '));
    await page.close();
  }

  // Review variant of the playable, driven by postMessage, for layout checks.
  const reviewPlayable = (distDir) => {
    const reviewHtml = fs.readFileSync(path.join(distDir, 'review.html'), 'utf8');
    const json = /<script type="application\/json" id="vq-review-data">([\s\S]*?)<\/script>/.exec(reviewHtml)[1];
    const file = path.join(TMP, `review-playable-${path.basename(distDir)}.html`);
    fs.writeFileSync(file, JSON.parse(json).playable);
    return file;
  };
  const states = (langs) => {
    const list = [{ screen: 'picker' }];
    for (const lang of langs) {
      questions.forEach((q, i) => {
        list.push({ screen: 'question', lang, index: i });
        list.push({ screen: 'question', lang, index: i, answered: 'wrong' });
      });
      list.push({ screen: 'end', lang, score: questions.length });
    }
    return list;
  };
  async function layoutSweep(file, { langs, pseudo = {}, viewportList = viewports }) {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    const log = watch(page);
    await page.goto(fileUrl(file));
    await page.evaluate(() => document.fonts.ready);
    const overflow = [];
    const small = [];
    for (const v of viewportList) {
      await page.setViewportSize({ width: v.width, height: v.height });
      for (const s of states(langs)) {
        const before = await page.evaluate(() => (window.__vqFit ? window.__vqFit.count : 0));
        await page.evaluate((cmd) => window.postMessage(Object.assign({ ns: 'vq-review', cmd: 'set' }, cmd), '*'), Object.assign({}, s, { pseudo }));
        await page.waitForFunction((b) => window.__vqFit && window.__vqFit.count > b, before);
        await frames(page);
        const found = await page.evaluate(() => {
          const scr = document.querySelector('.vq-screen[data-active]');
          const over = [...scr.querySelectorAll('[data-overflow]')].map((e) => e.getAttribute('data-key') || e.className);
          if (scr.hasAttribute('data-overflow')) over.push('screen');
          const tiny = [...scr.querySelectorAll('button')].filter((b) => b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden')
            .map((b) => ({ b, r: b.getBoundingClientRect() })).filter(({ r }) => r.width < 43.5 || r.height < 43.5)
            .map(({ b, r }) => `${b.className.split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`).join(', ');
          return { over, tiny };
        });
        const label = `${v.width}x${v.height} ${s.screen}${s.lang ? ' ' + s.lang : ''}${s.index !== undefined ? ' q' + (s.index + 1) : ''}${s.answered ? ' answered' : ''}`;
        if (found.over.length) overflow.push(`${label} [${found.over.join(', ')}]`);
        if (found.tiny) small.push(`${label} (${found.tiny})`);
      }
    }
    await page.close();
    return { overflow, small, errors: log.errors };
  }

  const enReview = reviewPlayable(path.join(ROOT, 'dist'));
  const sweep = await layoutSweep(enReview, { langs: ['en'] });
  record('C4', 'Placeholder copy fits every test viewport on every screen', sweep.overflow.length ? 'FAIL' : 'PASS',
    sweep.overflow.length ? sweep.overflow.slice(0, 8).join(' | ') : `${viewports.length} viewports x ${states(['en']).length} screens`);
  record('C6', 'Tap targets at least 44 x 44 px', sweep.small.length ? 'FAIL' : 'PASS', sweep.small.slice(0, 6).join(' | ') || 'all visible buttons');
  const long = await layoutSweep(enReview, { langs: ['en'], pseudo: { long: true } });
  const longPhones = long.overflow.filter((o) => !o.startsWith('300x250'));
  record('C5', 'Copy padded to every character limit (90 question, 30 answer, UI limits) still fits', longPhones.length ? 'FAIL' : 'PASS',
    (longPhones.length ? longPhones.slice(0, 6).join(' | ') : 'all phone, tablet and landscape viewports') +
    (long.overflow.length - longPhones.length ? `; 300x250 MPU stress frame overflows on ${long.overflow.length - longPhones.length} screens (only matters if an MPU placement is booked)` : ''));
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 }, reducedMotion: 'reduce' });
    await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')));
    const duration = await page.evaluate(() => getComputedStyle(document.querySelector('.vq-screen')).transitionDuration);
    record('C8', 'Reduced motion preference turns transitions off', /^0s(, 0s)*$/.test(duration) ? 'PASS' : 'FAIL', `transition-duration ${duration}`);
    await page.close();
  }

  // D. Languages (fixture build).
  if (fixture) {
    const fxReview = reviewPlayable(path.join(ROOT, '.qa-tmp/dist-fixture'));
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    const log = watch(page);
    await page.goto(fileUrl(path.join(ROOT, '.qa-tmp/dist-fixture/index.html')));
    await page.evaluate(() => document.fonts.ready);
    await frames(page);
    const labels = await page.$$eval('.vq-lang', (els) => els.map((e) => e.getAttribute('data-lang')));
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const fallbackIn = async (selector) => {
      const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector });
      const bad = [];
      for (const nodeId of nodeIds) {
        const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        const system = fonts.filter((f) => !f.isCustomFont && f.glyphCount > 0);
        if (system.length) bad.push(system.map((f) => f.familyName).join('+'));
      }
      return { count: nodeIds.length, bad };
    };
    const picker = await fallbackIn('.vq-lang span');
    record('D1', 'Picker lists every language in order, each label drawn with its inlined font (no system fallback)',
      labels.join(',') === fixtureCodes.join(',') && !picker.bad.length ? 'PASS' : 'FAIL', `${labels.join(', ')}; system fonts used: ${picker.bad.join(', ') || 'none'}`);
    const perLang = [];
    await page.close();
    const fxPage = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await fxPage.goto(fileUrl(fxReview));
    await fxPage.evaluate(() => document.fonts.ready);
    const fxCdp = await fxPage.context().newCDPSession(fxPage);
    await fxCdp.send('DOM.enable');
    await fxCdp.send('CSS.enable');
    let rtl = null;
    for (const code of fixtureCodes) {
      for (const s of [{ screen: 'question', index: 1, answered: 'wrong' }, { screen: 'end', score: 3 }]) {
        await fxPage.evaluate((cmd) => window.postMessage(Object.assign({ ns: 'vq-review', cmd: 'set' }, cmd), '*'), Object.assign({ lang: code }, s));
        await frames(fxPage);
        const { root } = await fxCdp.send('DOM.getDocument', { depth: -1 });
        const { nodeIds } = await fxCdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.vq-screen[data-active] [data-key]' });
        for (const nodeId of nodeIds) {
          const { fonts } = await fxCdp.send('CSS.getPlatformFontsForNode', { nodeId });
          fonts.filter((f) => !f.isCustomFont && f.glyphCount > 0).forEach((f) => perLang.push(`${code} ${s.screen}: ${f.familyName}`));
        }
        if (code === 'ar' && s.screen === 'question') {
          rtl = await fxPage.evaluate(() => {
            const r = (sel) => document.querySelector(sel).getBoundingClientRect();
            return {
              dir: document.documentElement.dir,
              logoRight: r('.vq-question .vq-logo').left > r('.vq-progress').left,
              align: getComputedStyle(document.querySelector('.vq-qtext')).textAlign,
              nextLeft: r('.vq-next').left < r('.vq-feedback-text').left
            };
          });
          await fxPage.waitForTimeout(350);
          await fxPage.screenshot({ path: path.join(OUT, 'arabic-fixture-360x640.png') });
        }
      }
    }
    record('D3', 'Every language renders question and end screens with inlined fonts only', perLang.length ? 'FAIL' : 'PASS', perLang.slice(0, 6).join(' | ') || `${fixtureCodes.length} languages checked with Chromium's platform font report`);
    record('D2', 'Arabic mirrors right to left (dir, logo, progress, text alignment, Next button)',
      rtl && rtl.dir === 'rtl' && rtl.logoRight && rtl.nextLeft && (rtl.align === 'start' || rtl.align === 'right') ? 'PASS' : 'FAIL', rtl ? JSON.stringify(rtl) : 'not measured');
    await fxPage.waitForTimeout(350);
    await fxPage.screenshot({ path: path.join(OUT, 'fixture-end-360x640.png') });
    await fxPage.close();
    const fxSweep = await layoutSweep(fxReview, { langs: fixtureCodes, viewportList: viewports.filter((v) => v.width !== 300) });
    record('D4', 'Every script fits every phone, tablet and landscape viewport (fixture text)', fxSweep.overflow.length ? 'FAIL' : 'PASS',
      fxSweep.overflow.slice(0, 6).join(' | ') || `${fixtureCodes.length} languages x ${viewports.length - 1} viewports`);
    const rtlMirror = await layoutSweep(enReview, { langs: ['en'], pseudo: { rtl: true } });
    record('D5', 'RTL mirror mode (review) on English fits everywhere', rtlMirror.overflow.filter((o) => !o.startsWith('300x250')).length ? 'FAIL' : 'PASS', rtlMirror.overflow.slice(0, 4).join(' | ') || 'no overflow');
  }

  // E. MRAID and reporting.
  {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const log = watch(page);
    await page.goto(fileUrl(path.join(ROOT, 'dist/harness.html')) + '?manual=1&click=' + encodeURIComponent('https://example.com/mraid-click'));
    await page.waitForTimeout(400);
    const frame = page.frames().find((f) => f !== page.mainFrame());
    const viewsBefore = await frame.evaluate(() => window.__vqEvents.filter((e) => e.e === 'view').length);
    await page.evaluate(() => window.__harness.send('ready'));
    await page.waitForTimeout(100);
    const viewsAfterReady = await frame.evaluate(() => window.__vqEvents.filter((e) => e.e === 'view').length);
    await page.evaluate(() => window.__harness.send('viewable', true));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.__harness.send('viewable', false));
    await page.evaluate(() => window.__harness.send('viewable', true));
    await page.waitForTimeout(100);
    const views = await frame.evaluate(() => window.__vqEvents.filter((e) => e.e === 'view').length);
    for (const q of questions) {
      await frame.click(`.vq-answer[data-answer="${q.correct}"]`);
      await frame.click('.vq-next');
    }
    await frame.click('.vq-cta');
    await page.waitForTimeout(150);
    const calls = await page.evaluate(() => window.__harness.log.filter((l) => l.kind === 'mraid').map((l) => l.text));
    const env = await frame.evaluate(() => window.__vqEvents[0] && window.__vqEvents[0].env);
    const openCall = calls.find((c) => c.startsWith('open('));
    record('E1', 'MRAID: waits for ready and viewable, one view event, CTA through mraid.open',
      viewsBefore === 0 && viewsAfterReady === 0 && views === 1 && openCall === 'open("https://example.com/mraid-click")' && env === 'mraid' && !log.errors.length ? 'PASS' : 'FAIL',
      `views before ready ${viewsBefore}, after ready ${viewsAfterReady}, after viewable x2 ${views}; ${openCall || 'no open call'}; errors ${log.errors.length}`);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    const log = watch(page);
    await page.goto(fileUrl(path.join(ROOT, 'dist/index.html')));
    await frames(page);
    for (const q of questions) {
      await page.click(`.vq-answer[data-answer="${q.correct}"]`);
      await page.click('.vq-next');
    }
    const events = await page.evaluate(() => window.__vqEvents);
    record('E2', 'Web (no MRAID): view event on screen, environment reported as web', events[0] && events.some((e) => e.e === 'view' && e.env === 'web') ? 'PASS' : 'FAIL', events.map((e) => e.e).join(', '));
    record('E3', 'Reporting ships disabled: a full playthrough makes zero network requests', log.external.length === 0 ? 'PASS' : 'FAIL', `${events.length} events recorded locally, ${log.external.length} requests`);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await page.addInitScript(() => {
      window.open = () => null;
    });
    const posted = [];
    page.on('request', (r) => {
      if (r.url().startsWith('https://reporting.qa.invalid/')) posted.push({ body: r.postData(), type: r.headers()['content-type'] || '' });
    });
    await page.route('https://reporting.qa.invalid/**', (route) => route.fulfill({ status: 204, body: '' }));
    await page.goto(fileUrl(path.join(reported.outDir, 'index.html')));
    await frames(page);
    for (const q of questions) {
      await page.click(`.vq-answer[data-answer="${q.answers[q.answers.length - 1]}"]`);
      await page.click('.vq-next');
    }
    await page.click('.vq-cta').catch(() => {});
    await page.waitForTimeout(500);
    const bodies = posted.map((p) => JSON.parse(p.body));
    const answers = bodies.filter((b) => b.e === 'answer');
    const complete = bodies.find((b) => b.e === 'complete');
    const expectedScore = questions.filter((q) => q.answers[q.answers.length - 1] === q.correct).length;
    record('E4', 'Reporting when enabled: events posted as text/plain with language, question, answer, correctness and score',
      answers.length === questions.length && complete && complete.score === expectedScore && complete.lang === 'en' && bodies.every((b) => b.cid === 'qa') && posted.every((p) => /text\/plain/.test(p.type)) ? 'PASS' : 'FAIL',
      `${posted.length} posts: ${[...new Set(bodies.map((b) => b.e))].join(', ')}; complete score ${complete ? complete.score : 'none'} (expected ${expectedScore})`);
    await page.close();
  }

  // F. Review page.
  {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const log = watch(page);
    await page.goto(fileUrl(path.join(ROOT, 'dist/review.html')));
    for (const handle of await page.$$('.rv-frame')) await handle.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({
      frames: document.querySelectorAll('.rv-frame iframe').length,
      fits: document.querySelectorAll('.rv-frame-foot .rv-badge.is-ok').length,
      overflow: document.querySelectorAll('.rv-frame-foot .rv-badge.is-bad').length,
      langs: document.querySelectorAll('.rv-langs .rv-badge').length
    }));
    await page.screenshot({ path: path.join(OUT, 'review-page.png'), fullPage: false });
    record('F1', 'Review page: languages with status, every viewport frame renders and reports fit', info.frames === viewports.length && info.fits === viewports.length && info.langs === config.languages.order.length && !log.errors.length ? 'PASS' : 'FAIL',
      `${info.frames} frames, ${info.fits} fit, ${info.overflow} overflow, ${info.langs} language badges, ${log.errors.length} errors`);
    await page.close();
    const fresh = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    await fresh.goto(fileUrl(path.join(ROOT, 'dist/review.html')) + '#screen=question&index=1&answered=wrong&frames=360x640');
    await fresh.waitForTimeout(1200);
    const deep = await fresh.frames()[1].evaluate(() => ({
      progress: document.querySelector('.vq-progress-text').textContent,
      answered: document.querySelector('.vq-question').hasAttribute('data-answered')
    }));
    record('F2', 'Review deep links restore the state (screen, question, answer)', /Question 2/.test(deep.progress) && deep.answered ? 'PASS' : 'FAIL', JSON.stringify(deep));
    await fresh.close();
  }
  await browser.close();
  return finish();
}

function finish() {
  const manual = [
    ['G1', 'Real devices: iOS Safari and Android Chrome WebView', 'NOT RUN', 'no devices in this environment'],
    ['G2', 'Real MRAID host and ad server validation (CM360 upload, DV360 approval)', 'NOT RUN', 'needs Livewire\'s CM360 account; nothing was shared externally'],
    ['G3', 'Client copy in all six languages, real Arabic RTL, real Hindi and Chinese shaping', 'BLOCKED', 'copy and translations not received (due 24 Sep)'],
    ['G4', 'Brand: logo, colours, fonts and contrast with the real palette', 'BLOCKED', 'brand assets not received'],
    ['G5', 'Placement: sizes, zip limit, backup image', 'BLOCKED', 'specs not received ("similar to the Mac\'s campaign")'],
    ['G6', 'CTA destination URL', 'BLOCKED', 'not received'],
    ['G7', 'Authorisation statement on the end screen', 'BLOCKED', 'open question for the client'],
    ['G8', 'Mandarin and Cantonese scripts (Simplified and Traditional?)', 'BLOCKED', 'asked 21 Sep, not confirmed']
  ];
  manual.forEach(([id, title, status, detail]) => record(id, title, status, detail));
  const counts = results.reduce((acc, r) => Object.assign(acc, { [r.status]: (acc[r.status] || 0) + 1 }), {});
  const lines = [
    '| # | Check | Result | Detail |',
    '| --- | --- | --- | --- |',
    ...results.map((r) => `| ${r.id} | ${r.title} | ${r.status} | ${r.detail.replace(/\|/g, '/')} |`)
  ];
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'qa-report.md'), `# QA report\n\n${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}\n\n${lines.join('\n')}\n`);
  fs.writeFileSync(path.join(OUT, 'qa-report.json'), JSON.stringify({ counts, results }, null, 2) + '\n');
  console.log(`\n${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}. Report: dist/qa/qa-report.md`);
  process.exitCode = counts.FAIL ? 1 : 0;
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});

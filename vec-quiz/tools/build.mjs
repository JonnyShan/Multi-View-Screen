#!/usr/bin/env node
// Single file build.
//
//   node tools/build.mjs            dev build into dist/
//   node tools/build.mjs --release  refuses placeholder copy, missing languages and empty client details
//   node tools/build.mjs --lenient  also includes languages whose only errors are over limit copy (review use)
//
// Outputs (all self contained, no external requests):
//   dist/index.html           ad build for CM360 or DV360 HTML5 (clickTag declared, MRAID detected at runtime)
//   dist/playable-mraid.html  same build with <script src="mraid.js"> for MRAID networks that expect the tag
//   dist/vec-quiz-ad.zip      index.html zipped for upload, checked by the ad zip guard
//   dist/review.html          review page with every test viewport, copy table and build checks
//   dist/harness.html         MRAID harness with a mock MRAID 3.0 host
//   dist/build-report.json    sizes, languages, fonts, guard results

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { ROOT, rel, loadProject, configGaps, releaseBlockers, readJson } from './lib/project.mjs';
import { validateAll, expectedKeys, isPlaceholder } from '../src/js/content.js';
import { ensureFamily, readCmap, subsetToWoff2 } from './lib/fonts.mjs';
import { writeZip } from './lib/zip.mjs';
import { scanHtml, checkZip, formatBytes } from './lib/guard.mjs';

const TOKEN_RE = /\{[A-Za-z]+\}/g;
const PLACEHOLDER_BG = '#f3f3f0';
const COLOUR_VARS = {
  background: '--vq-bg',
  surface: '--vq-surface',
  text: '--vq-text',
  primary: '--vq-primary',
  onPrimary: '--vq-on-primary',
  correct: '--vq-correct',
  incorrect: '--vq-incorrect'
};

class BuildError extends Error {
  constructor(problems) {
    super(problems.map((p) => `  - ${p}`).join('\n'));
    this.problems = problems;
  }
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--release') opts.release = true;
    else if (a === '--lenient') opts.lenient = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--debug') opts.debug = true;
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--override') opts.override = readJson(argv[++i]);
    else throw new Error(`Unknown option ${a}. Options: --release --lenient --debug --quiet --out <dir> --override <json>`);
  }
  return opts;
}

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') deepMerge(target[k], v);
    else target[k] = v;
  }
  return target;
}

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function sanitizeSvg(svg) {
  return svg
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

function numeralDigits(numerals) {
  if (!numerals) return '0123456789';
  try {
    const f = new Intl.NumberFormat('en-u-nu-' + numerals);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => f.format(n)).join('');
  } catch (e) {
    return '0123456789';
  }
}

async function bundle(entry, define, debug) {
  const result = await esbuild.build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    format: 'iife',
    minify: !debug,
    write: false,
    target: 'es2019',
    define,
    legalComments: 'none',
    charset: 'utf8',
    logLevel: 'silent'
  });
  return result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
}

function fill(template, parts) {
  let out = template;
  for (const [marker, value] of Object.entries(parts)) {
    if (!out.includes(marker)) throw new Error(`Template marker ${marker} not found.`);
    out = out.replace(marker, () => value);
  }
  return out;
}

const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export async function build(options = {}) {
  const opts = Object.assign({ release: false, lenient: false, out: 'dist', quiet: false, debug: false, override: null, contentDir: null, languagesOverride: null }, options);
  const log = opts.quiet ? () => {} : (...a) => console.log(...a);
  const outDir = path.resolve(ROOT, opts.out);
  const project = loadProject({ contentDir: opts.contentDir });
  const { config, quiz, contents, pkg } = project;
  if (opts.override) deepMerge(config.client, opts.override);
  // QA only: lets fixture builds set scripts that are still pending with the client.
  if (opts.languagesOverride) deepMerge(config.languages.languages, opts.languagesOverride);
  const fixtures = Object.keys(contents).filter((code) => contents[code].fixture === true);
  if (fixtures.length && !opts.contentDir) {
    throw new BuildError([`content/ contains QA fixture files (${fixtures.join(', ')}). Fixtures are sample text for tests, never copy; remove them.`]);
  }
  const client = config.client;
  const fatal = [];
  const warnings = [];

  // 1. Validate the copy.
  const report = validateAll({ quiz, registry: config.languages, contents, limits: config.limits, fonts: config.fonts });
  report.quizIssues.forEach((i) => {
    if (i.level === 'error') fatal.push(i.message);
    else if (i.code === 'placeholder' && opts.release) fatal.push(i.message + ' The release build needs client copy.');
    else warnings.push(i.message);
  });
  let included = report.included.slice();
  const order = [...new Set((config.languages.order || []).concat(Object.keys(contents)))];
  for (const code of order) {
    const lang = report.languages[code];
    const errors = lang.issues.filter((i) => i.level === 'error');
    const onlyOverLimit = errors.length > 0 && errors.every((i) => i.code === 'over-limit');
    if (lang.status === 'invalid' && opts.lenient && !opts.release && onlyOverLimit && report.quizOk) {
      included.push(code);
      warnings.push(`${lang.profile.name} included despite ${errors.length} over limit strings (--lenient).`);
    } else if (lang.status === 'invalid') {
      (opts.release ? fatal : warnings).push(`${lang.profile.name} left out: ${errors.length} error(s), first: ${errors[0].message}`);
    } else if (lang.status === 'missing' && opts.release) {
      fatal.push(`${lang.profile.name} has no copy yet (content/${code}.json).`);
    } else if (lang.status === 'placeholder' && opts.release) {
      fatal.push(`${lang.profile.name} is placeholder copy.`);
    }
  }
  included = order.filter((c) => included.includes(c));
  if (!included.length) fatal.push('No language has valid copy, so there is nothing to build. Run npm run check.');

  // 2. Client details. Empty values stay empty; release refuses to ship without them.
  const gaps = configGaps(client);
  if (opts.release) releaseBlockers(client).forEach((g) => fatal.push(`config/client.json ${g} is empty.`));
  for (const [key, value] of Object.entries(client.brand.colours)) {
    if (!key.startsWith('_') && value && !/^#[0-9a-fA-F]{6}$/.test(value)) fatal.push(`brand.colours.${key} must be #RRGGBB, got "${value}".`);
  }
  if (client.cta.url && !/^https:\/\//.test(client.cta.url)) fatal.push('cta.url must start with https://');
  if (client.reporting.enabled && !/^https:\/\//.test(client.reporting.endpoint)) fatal.push('reporting.enabled is true but reporting.endpoint is not an https URL.');
  const sizes = Array.isArray(client.placement.sizes) ? client.placement.sizes : [];
  sizes.forEach((s) => {
    if (!s || !Number.isInteger(s.width) || !Number.isInteger(s.height)) fatal.push('placement.sizes entries must look like {"width": 320, "height": 480}.');
  });

  let logo = '';
  const logos = client.brand.logo;
  if (logos.forLightBackground || logos.forDarkBackground) {
    const light = luminance(client.brand.colours.background || PLACEHOLDER_BG) > 0.4;
    const file = light ? logos.forLightBackground || logos.forDarkBackground : logos.forDarkBackground || logos.forLightBackground;
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) fatal.push(`Logo file ${file} does not exist.`);
    else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.svg') {
        const svg = sanitizeSvg(fs.readFileSync(abs, 'utf8'));
        const external = (svg.match(/https?:\/\/[^\s"'<>)]+/g) || []).filter((u) => !u.startsWith('http://www.w3.org/'));
        if (external.length) fatal.push(`Logo ${file} references external URLs: ${external.join(', ')}`);
        logo = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
      } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp') {
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        logo = `data:${mime};base64,` + fs.readFileSync(abs).toString('base64');
      } else fatal.push(`Logo ${file} must be SVG, PNG, JPG or WEBP.`);
    }
  }
  if (fatal.length) throw new BuildError(fatal);

  // 3. Runtime data.
  const expected = expectedKeys(quiz, config.limits);
  const profiles = {};
  included.forEach((code) => {
    profiles[code] = report.languages[code].profile;
  });
  const strings = {};
  included.forEach((code) => {
    strings[code] = {};
    for (const key of expected.keys()) {
      const value = contents[code].strings[key];
      if (typeof value === 'string' && value) strings[code][key] = value;
    }
  });
  const max = {};
  for (const [key, rule] of expected) max[key] = rule.max;
  const anyPlaceholder = quiz.placeholder === true || included.some((c) => isPlaceholder(contents[c]));

  // 4. Fonts: pick a family per character (script font first, Latin fallback),
  //    subset each family to exactly those characters, inline as WOFF2.
  const brandLatin = client.brand.fonts && client.brand.fonts.latin;
  const useBrandLatin = Boolean(brandLatin && brandLatin.files && brandLatin.files['400'] && brandLatin.files['700'] && brandLatin.webLicenceConfirmed === true);
  const sources = {};
  const familyKeys = new Set(['latin']);
  included.forEach((code) => familyKeys.add(profiles[code].font));
  for (const key of familyKeys) {
    const family = config.fonts.families[key];
    let files;
    if (key === 'latin' && useBrandLatin) {
      files = { 400: path.join(ROOT, brandLatin.files['400']), 700: path.join(ROOT, brandLatin.files['700']) };
    } else {
      files = ensureFamily(key, family, log);
    }
    sources[key] = { key, cssFamily: family.cssFamily, files, cmap: readCmap(fs.readFileSync(files['400'])), brand: key === 'latin' && useBrandLatin };
  }
  const charSets = {};
  const usedBy = {};
  const uncovered = [];
  for (const code of included) {
    const stack = [...new Set([profiles[code].font, 'latin'])];
    const text = Object.values(strings[code]).map((s) => s.replace(TOKEN_RE, '')).join('') + numeralDigits(profiles[code].numerals) + ' ';
    for (const ch of new Set(Array.from(text))) {
      if (ch === '\n' || ch === '\r' || ch === '\t') continue;
      const cp = ch.codePointAt(0);
      const family = stack.find((k) => sources[k].cmap.has(cp));
      if (!family) {
        uncovered.push(`${code} U+${cp.toString(16).toUpperCase().padStart(4, '0')} "${ch}"`);
        continue;
      }
      (charSets[family] = charSets[family] || new Set()).add(cp);
      (usedBy[family] = usedBy[family] || new Set()).add(code);
    }
  }
  if (!opts.release && !logo) {
    charSets.latin = charSets.latin || new Set();
    Array.from('LOGO').forEach((ch) => charSets.latin.add(ch.codePointAt(0)));
  }
  if (uncovered.length) {
    const message = `No font covers: ${uncovered.join(', ')}`;
    if (opts.release) throw new BuildError([message]);
    warnings.push(message);
  }
  const fontFaces = [];
  const fontRows = [];
  for (const key of Object.keys(sources)) {
    const set = charSets[key];
    if (!set || !set.size) continue;
    const text = String.fromCodePoint(...[...set].sort((a, b) => a - b));
    for (const weight of config.fonts.weights) {
      const { sfnt, woff2 } = await subsetToWoff2(fs.readFileSync(sources[key].files[weight]), text);
      const covered = readCmap(sfnt);
      const lost = [...set].filter((cp) => !covered.has(cp));
      if (lost.length) throw new BuildError([`Subset of ${key} ${weight} dropped ${lost.length} characters.`]);
      fontFaces.push(`@font-face{font-family:"${sources[key].cssFamily}";font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${woff2.toString('base64')}) format("woff2")}`);
      fontRows.push({
        family: key + (sources[key].brand ? ' (brand)' : ''),
        weight,
        chars: set.size,
        bytes: woff2.length,
        size: formatBytes(woff2.length),
        langs: [...(usedBy[key] || [])]
      });
    }
  }
  const latinFamily = `"${sources.latin.cssFamily}"`;
  const familyCss = Object.keys(sources).map((key) => {
    const stack = key === 'latin' ? latinFamily : `"${sources[key].cssFamily}",${latinFamily}`;
    return `.vq[data-font="${key}"],.vq [data-font="${key}"]{font-family:${stack},system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`;
  }).join('\n');
  const colourCss = Object.entries(COLOUR_VARS)
    .filter(([k]) => client.brand.colours[k])
    .map(([k, v]) => `${v}:${client.brand.colours[k]}`);
  const brandCss = colourCss.length ? `:root{${colourCss.join(';')}}` : '';

  // 5. Bundle.
  const css = (await esbuild.transform(
    fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8') + '\n' + brandCss + '\n' + familyCss + '\n' + fontFaces.join('\n'),
    { loader: 'css', minify: !opts.debug, logLevel: 'silent' }
  )).code;
  const adJs = await bundle('src/js/main.js', { __REVIEW__: 'false' }, opts.debug);
  const reviewJs = await bundle('src/js/main.js', { __REVIEW__: 'true' }, opts.debug);

  const runtime = {
    release: opts.release,
    defaultLang: included.includes(config.languages.default) ? config.languages.default : included[0],
    langs: included.map((code) => {
      const p = profiles[code];
      return { code, name: p.name, htmlLang: p.htmlLang, dir: p.dir, font: p.font, numerals: p.numerals };
    }),
    quiz: { questions: quiz.questions.map((q) => ({ id: q.id, answers: q.answers.slice(), correct: q.correct })) },
    strings,
    max,
    engine: {
      picker: config.engine.picker,
      answer: config.engine.answer,
      replay: config.engine.replay,
      fit: config.engine.fit
    },
    cta: { url: client.cta.url || '' },
    reporting: { enabled: client.reporting.enabled === true, endpoint: client.reporting.endpoint || '', campaignId: client.reporting.campaignId || '' },
    brand: { logo, logoAlt: logos.alt || '' }
  };
  const hash = crypto.createHash('sha256').update(JSON.stringify(runtime)).update(css).update(adJs).digest('hex').slice(0, 10);
  runtime.build = { version: pkg.version, hash };
  const dataJson = jsonForScript(runtime);

  // 6. Compose the variants.
  const template = fs.readFileSync(path.join(ROOT, 'src/index.html'), 'utf8');
  const page = (head, js) => fill(template, { '<!--VQ:HEAD-->': head, '/*VQ:CSS*/': css, '<!--VQ:DATA-->': dataJson, '/*VQ:JS*/': js });
  const clickTag = `<script>var clickTag = ${JSON.stringify(client.cta.url || '')};</script>`;
  const adSizeMeta = (s) => `<meta name="ad.size" content="width=${s.width},height=${s.height}">`;
  const mockJs = (await esbuild.transform(fs.readFileSync(path.join(ROOT, 'harness/mraid-mock.js'), 'utf8'), { minify: !opts.debug, target: 'es2015', logLevel: 'silent' })).code.replace(/<\/script/gi, '<\\/script');
  const outputs = {
    'index.html': page(clickTag, adJs),
    'playable-mraid.html': page('<script src="mraid.js"></script>\n' + clickTag, adJs)
  };
  const reviewPlayable = page(clickTag, reviewJs);
  const harnessPlayable = page(`<script>${mockJs}</script>\n` + clickTag, reviewJs);
  const zips = { 'vec-quiz-ad.zip': writeZip([{ name: 'index.html', data: Buffer.from(outputs['index.html']) }]) };
  sizes.forEach((s) => {
    const html = page(adSizeMeta(s) + '\n' + clickTag, adJs);
    outputs[`index-${s.width}x${s.height}.html`] = html;
    zips[`vec-quiz-${s.width}x${s.height}.zip`] = writeZip([{ name: 'index.html', data: Buffer.from(html) }]);
  });

  // 7. Ad zip guard.
  const allowUrls = [client.cta.url, client.reporting.enabled ? client.reporting.endpoint : ''];
  const guardOpts = { allowUrls, maxHtmlBytes: client.placement.maxHtmlBytes || null };
  let guard = [];
  guard = guard.concat(scanHtml(outputs['index.html'], Object.assign({ label: 'index.html', expectMraidTag: false }, guardOpts)));
  guard = guard.concat(scanHtml(outputs['playable-mraid.html'], Object.assign({ label: 'playable-mraid.html', expectMraidTag: true }, guardOpts)));
  sizes.forEach((s) => {
    const name = `index-${s.width}x${s.height}.html`;
    guard = guard.concat(scanHtml(outputs[name], Object.assign({ label: name, expectMraidTag: false, expectAdSize: s }, guardOpts)));
  });
  for (const [name, buf] of Object.entries(zips)) {
    guard = guard.concat(checkZip(buf, { label: name, maxZipBytes: client.placement.maxZipBytes || null, release: opts.release }));
  }
  const guardErrors = guard.filter((g) => g.level === 'error');
  if (guardErrors.length) throw new BuildError(guardErrors.map((g) => g.message));

  // 8. Review page and MRAID harness.
  const viewports = [];
  const seen = new Set();
  sizes.map((s) => ({ label: 'Placement', width: s.width, height: s.height, placement: true }))
    .concat(config.engine.testViewports)
    .forEach((v) => {
      const id = `${v.width}x${v.height}`;
      if (seen.has(id)) return;
      seen.add(id);
      viewports.push(Object.assign({ id }, v));
    });
  const notes = (trail) => {
    let node = client;
    for (const k of trail.slice(0, -1)) node = node && node[k];
    return (node && node._note) || '';
  };
  const files = Object.entries(outputs).map(([name, html]) => ({ name, bytes: Buffer.byteLength(html), size: formatBytes(Buffer.byteLength(html)) }))
    .concat(Object.entries(zips).map(([name, buf]) => ({ name, bytes: buf.length, size: formatBytes(buf.length), note: 'upload package' })));
  const reviewCss = (await esbuild.transform(fs.readFileSync(path.join(ROOT, 'review/review.css'), 'utf8'), { loader: 'css', minify: !opts.debug, logLevel: 'silent' })).code;
  const languagesForReview = order.map((code) => {
    const l = report.languages[code];
    const entry = (config.languages.languages || {})[code] || {};
    return {
      code,
      name: l.profile.name,
      status: l.status,
      profile: { dir: l.profile.dir, htmlLang: l.profile.htmlLang, font: l.profile.font },
      rows: l.rows,
      issues: l.issues.map((i) => ({ level: i.level, message: i.message })),
      pending: entry._pending || ''
    };
  });
  const reviewData = {
    build: runtime.build,
    release: opts.release,
    placeholder: anyPlaceholder,
    playable: reviewPlayable,
    included,
    quiz: runtime.quiz,
    languages: languagesForReview,
    expected: [...expected].map(([key, r]) => ({ key, kind: r.kind, max: r.max, required: r.required })),
    viewports,
    gaps: gaps.map((g) => ({ path: g, note: notes(g.split('.')) })),
    blockers: releaseBlockers(client),
    guard,
    fonts: fontRows,
    files,
    reportingEnabled: runtime.reporting.enabled,
    reportingEndpoint: runtime.reporting.endpoint
  };
  const reviewHtml = fill(fs.readFileSync(path.join(ROOT, 'review/review.html'), 'utf8'), {
    '/*VQ:CSS*/': reviewCss,
    '<!--VQ:DATA-->': jsonForScript(reviewData),
    '/*VQ:JS*/': await bundle('review/review.js', {}, opts.debug)
  });
  const harnessHtml = fill(fs.readFileSync(path.join(ROOT, 'harness/harness.html'), 'utf8'), {
    '/*VQ:CSS*/': reviewCss,
    '<!--VQ:DATA-->': jsonForScript({ build: runtime.build, playable: harnessPlayable, viewports }),
    '/*VQ:JS*/': await bundle('harness/harness.js', {}, opts.debug)
  });

  // 9. Write.
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of fs.readdirSync(outDir)) {
    if (/\.(html|zip)$/.test(name) || name === 'build-report.json') fs.rmSync(path.join(outDir, name));
  }
  for (const [name, html] of Object.entries(outputs)) fs.writeFileSync(path.join(outDir, name), html);
  for (const [name, buf] of Object.entries(zips)) fs.writeFileSync(path.join(outDir, name), buf);
  fs.writeFileSync(path.join(outDir, 'review.html'), reviewHtml);
  fs.writeFileSync(path.join(outDir, 'harness.html'), harnessHtml);
  files.push({ name: 'review.html', bytes: Buffer.byteLength(reviewHtml), size: formatBytes(Buffer.byteLength(reviewHtml)), note: 'internal review, not for upload' });
  files.push({ name: 'harness.html', bytes: Buffer.byteLength(harnessHtml), size: formatBytes(Buffer.byteLength(harnessHtml)), note: 'internal MRAID test, not for upload' });
  const buildReport = {
    version: pkg.version,
    hash,
    release: opts.release,
    placeholder: anyPlaceholder,
    included,
    languages: Object.fromEntries(order.map((code) => [code, report.languages[code].status])),
    files,
    fonts: fontRows,
    guard,
    warnings,
    gaps
  };
  fs.writeFileSync(path.join(outDir, 'build-report.json'), JSON.stringify(buildReport, null, 2) + '\n');

  log(`Built ${rel(outDir)}/ (v${pkg.version}, content ${hash}${opts.release ? ', release' : ', dev'})`);
  log(`  Languages: ${order.map((c) => `${c} ${report.languages[c].status}${included.includes(c) ? '' : ' (left out)'}`).join(', ')}`);
  files.forEach((f) => log(`  ${f.name.padEnd(24)} ${f.size.padStart(10)}${f.note ? '  ' + f.note : ''}`));
  fontRows.forEach((f) => log(`  font ${f.family} ${f.weight}: ${f.chars} chars, ${f.size}`));
  guard.filter((g) => g.level === 'warning').forEach((g) => log(`  warn: ${g.message}`));
  warnings.forEach((w) => log(`  warn: ${w}`));
  if (gaps.length) log(`  ${gaps.length} client details still empty (npm run check lists them).`);
  return { outDir, hash, included, files, fonts: fontRows, guard, warnings, gaps, outputs, runtime };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build(parseArgs(process.argv.slice(2))).catch((e) => {
    if (e instanceof BuildError) console.error(`Build failed:\n${e.message}`);
    else console.error(e.stack || e.message);
    process.exit(1);
  });
}

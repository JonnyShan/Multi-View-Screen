#!/usr/bin/env node
// sheet2json: turns the client's copy spreadsheet into content/quiz.json and one
// content/<code>.json per language, checking every cell against the limits and
// reporting problems by cell reference (for example "Arabic F14").
//
//   node tools/sheet2json.mjs copy.xlsx                 convert and write (refuses on errors)
//   node tools/sheet2json.mjs copy.xlsx --dry-run       report only
//   node tools/sheet2json.mjs copy.csv --map "Simplified Chinese=cmn,Traditional Chinese=yue"
//   node tools/sheet2json.mjs copy.xlsx --sheet "Final" --force
//   node tools/sheet2json.mjs --template                regenerate sheets/vec-quiz-copy-template.(xlsx|csv)
//
// Two layouts are understood:
//   template: a "Key" column with q1, q1.a1 ... plus UI keys (see sheets/)
//   loose:    rows labelled "Question 1", "Answer A" (or "Q1", "A") in the order they appear;
//             without labels, a row ending in "?" starts a question and the rows below are answers
// The correct answer comes from a "Correct" column (Y, Yes, TRUE, X, 1 or a tick) or,
// failing that, a "*" marker on the answer text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, rel, loadProject, writeJson } from './lib/project.mjs';
import { readSheet, cellRef, colName } from './lib/sheet.mjs';
import { writeXlsx } from './lib/xlsx-write.mjs';
import { validateQuiz, validateStrings, expectedKeys, isPlaceholder } from '../src/js/content.js';

const TRUTHY = /^(y|yes|true|x|1|✓|✔|correct|\*)$/i;
const MARKER = /^\s*\*\s*|\s*\*\s*$|\s*\((correct|right answer|right)\)\s*$/i;
const QUESTION_LABEL = /^(q|question)\s*[.:#-]?\s*(\d+)?\s*[.:)]?$/i;
const ANSWER_LABEL = /^((a|answer|option|opt)\s*[.:#-]?\s*([0-9]+|[a-d])?|[a-d])\s*[.:)]?$/i;
const SCRIPT_NAMED = /(simplified|traditional|简体|繁體|繁体|chinese|中文)/i;
const KNOWN_NAMES = {
  english: 'en',
  vietnamese: 'vi',
  'tiếng việt': 'vi',
  arabic: 'ar',
  'العربية': 'ar',
  hindi: 'hi',
  'हिन्दी': 'hi',
  'हिंदी': 'hi'
};

const norm = (s) => String(s === undefined || s === null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');

export function parseMap(text) {
  const map = {};
  String(text || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((pair) => {
    const i = pair.lastIndexOf('=');
    if (i > 0) map[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  });
  return map;
}

// Pure conversion, used by the CLI and the tests.
export function convertSheet(rows, { registry, limits, map = {}, existing = {}, source = '' }) {
  const issues = [];
  const err = (message, ref) => issues.push({ level: 'error', message: ref ? `${ref}: ${message}` : message });
  const warn = (message, ref) => issues.push({ level: 'warning', message: ref ? `${ref}: ${message}` : message });

  const nameToCode = {};
  for (const [code, entry] of Object.entries(registry.languages || {})) {
    nameToCode[norm(entry.name)] = code;
    nameToCode[norm(code)] = code;
  }
  for (const [name, code] of Object.entries(KNOWN_NAMES)) if (registry.languages[code]) nameToCode[norm(name)] = code;
  for (const [name, code] of Object.entries(map)) nameToCode[norm(name)] = code;

  let headerRow = -1;
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    if ((rows[r] || []).some((c) => nameToCode[norm(c)] === 'en')) {
      headerRow = r;
      break;
    }
  }
  if (headerRow < 0) {
    err('No header row with an "English" column in the first 30 rows.');
    return { issues };
  }
  const header = rows[headerRow];
  const langCols = [];
  let keyCol = -1;
  let correctCol = -1;
  const unknownCols = [];
  header.forEach((cell, c) => {
    const n = norm(cell);
    if (!n) {
      unknownCols.push(c);
      return;
    }
    if (nameToCode[n]) {
      const code = nameToCode[n];
      if (!registry.languages[code]) err(`Column ${colName(c)} maps to "${code}", which is not in config/languages.json.`);
      else if (langCols.some((l) => l.code === code)) err(`Two columns map to ${registry.languages[code].name} (${colName(c)} and ${colName(langCols.find((l) => l.code === code).col)}).`);
      else langCols.push({ col: c, code, header: String(cell).trim() });
    } else if (['key', 'id', 'string id', 'key id'].includes(n)) keyCol = c;
    else if (/^correct/.test(n) || n === 'answer key' || n === 'is correct') correctCol = c;
    else if (SCRIPT_NAMED.test(n)) {
      err(`Column ${colName(c)} "${String(cell).trim()}" names a Chinese script. Which of Mandarin or Cantonese it is, and its script, is still waiting on client confirmation, so it is not mapped automatically. Once confirmed, run again with --map "${String(cell).trim()}=cmn" (or yue).`);
    } else unknownCols.push(c);
  });
  const en = langCols.find((l) => l.code === 'en');
  if (!en) {
    err('The sheet has no English column.');
    return { issues };
  }
  const found = keyCol >= 0 ? undefined : unknownCols.find((c) => rows.slice(headerRow + 1).some((row) => {
    const v = String((row || [])[c] || '').trim();
    return v && (QUESTION_LABEL.test(v) || ANSWER_LABEL.test(v));
  }));
  const labelCol = found === undefined ? -1 : found;
  const mode = keyCol >= 0 ? 'template' : 'loose';

  const questions = [];
  const ui = {};
  const cell = (row, c) => String((rows[row] || [])[c] === undefined ? '' : rows[row][c]);
  const cellsOf = (r) => {
    const out = {};
    langCols.forEach((l) => {
      out[l.code] = { text: cell(r, l.col), ref: cellRef(r, l.col) };
    });
    return out;
  };
  const isCorrect = (r) => correctCol >= 0 && TRUTHY.test(cell(r, correctCol).trim());
  const addAnswer = (q, r, marked) => {
    q.answers.push({ row: r, cells: cellsOf(r), correct: isCorrect(r) || marked });
  };

  for (let r = headerRow + 1; r < rows.length; r++) {
    const anyText = langCols.some((l) => cell(r, l.col).trim());
    if (mode === 'template') {
      const key = cell(r, keyCol).trim();
      if (!key || key.startsWith('#') || key.startsWith('_')) continue;
      let m;
      if (limits.strings[key]) ui[key] = { row: r, cells: cellsOf(r) };
      else if ((m = /^q(\d+)$/i.exec(key))) questions.push({ n: Number(m[1]), row: r, cells: cellsOf(r), answers: [] });
      else if ((m = /^q(\d+)\.a(\d+)$/i.exec(key))) {
        const q = questions.find((x) => x.n === Number(m[1]));
        if (!q) err(`Answer ${key} comes before its question.`, cellRef(r, keyCol));
        else addAnswer(q, r, false);
      } else warn(`Key "${key}" is not used by the quiz; row skipped.`, cellRef(r, keyCol));
      continue;
    }
    const label = labelCol >= 0 ? cell(r, labelCol).trim() : '';
    if (!anyText && !label) continue;
    const english = cell(r, en.col).trim();
    const current = questions[questions.length - 1];
    if (label && limits.strings[label]) ui[label] = { row: r, cells: cellsOf(r) };
    else if (label && QUESTION_LABEL.test(label)) questions.push({ row: r, cells: cellsOf(r), answers: [] });
    else if (label && ANSWER_LABEL.test(label)) {
      if (!current) err(`"${label}" appears before any question.`, cellRef(r, labelCol));
      else addAnswer(current, r, MARKER.test(english));
    } else if (!label && labelCol < 0) {
      if (/[?？؟]\s*$/.test(english)) questions.push({ row: r, cells: cellsOf(r), answers: [] });
      else if (current) addAnswer(current, r, MARKER.test(english));
      else warn('Row skipped: it is not a question and no question comes before it.', cellRef(r, en.col));
    } else warn(`Row skipped: label "${label}" is not a question, answer or UI key.`, cellRef(r, labelCol));
  }

  // Optional slots the client left empty (answers 3 and 4, question 5 in the template)
  // are dropped: a row with no text in any language and no correct mark is not an answer.
  const blank = (cells) => Object.values(cells).every((c) => !c.text.trim());
  questions.forEach((q) => {
    q.answers = q.answers.filter((a) => a.correct || !blank(a.cells));
  });
  for (let i = questions.length - 1; i >= 0; i--) {
    if (blank(questions[i].cells) && !questions[i].answers.length) questions.splice(i, 1);
  }

  // Strip "*" correct markers from answer text in every language.
  questions.forEach((q) => q.answers.forEach((a) => {
    Object.values(a.cells).forEach((c) => {
      if (MARKER.test(c.text) && c.text.trim()) {
        c.text = c.text.replace(MARKER, '');
        if (!(correctCol >= 0)) warn('Correct marker removed from the answer text.', c.ref);
      }
    });
  }));

  // Structure.
  const quiz = { placeholder: false, source, questions: [] };
  questions.forEach((q, i) => {
    const id = `q${i + 1}`;
    const correct = q.answers.filter((a) => a.correct);
    if (correct.length !== 1) {
      err(`${id} has ${correct.length} answers marked correct; mark exactly one.`, q.cells.en.ref);
    }
    q.id = id;
    q.answers.forEach((a, j) => {
      a.id = `${id}.a${j + 1}`;
    });
    quiz.questions.push({ id, answers: q.answers.map((a) => a.id), correct: correct.length === 1 ? correct[0].id : '' });
  });

  // Strings per language, with the cell each came from.
  const refs = {};
  const files = {};
  const skipped = [];
  for (const l of langCols) {
    const strings = {};
    const cellRefs = {};
    const put = (key, c) => {
      if (!c) return;
      let text = c.text.replace(/\r\n?/g, '\n');
      if (text !== text.trim() && text.trim()) {
        warn(`${registry.languages[l.code].name} "${key}": leading or trailing spaces trimmed.`, c.ref);
        text = text.trim();
      }
      cellRefs[key] = c.ref;
      if (text) strings[key] = text;
    };
    Object.entries(ui).forEach(([key, entry]) => put(key, entry.cells[l.code]));
    questions.forEach((q) => {
      put(q.id, q.cells[l.code]);
      q.answers.forEach((a) => put(a.id, a.cells[l.code]));
    });
    const hasQuizText = questions.some((q) => strings[q.id] || q.answers.some((a) => strings[a.id]));
    if (!hasQuizText && l.code !== 'en') {
      skipped.push(l.code);
      continue;
    }
    // UI strings the sheet does not provide are kept from the existing file.
    const previous = existing[l.code];
    const kept = [];
    if (previous && previous.strings) {
      for (const key of Object.keys(limits.strings)) {
        if (!(key in strings) && previous.strings[key]) {
          strings[key] = previous.strings[key];
          if (isPlaceholder(previous, key)) kept.push(key);
        }
      }
    }
    const ordered = {};
    for (const key of expectedKeys(quiz, limits).keys()) if (key in strings) ordered[key] = strings[key];
    files[l.code] = { lang: l.code, placeholder: kept.length ? kept : false, source, strings: ordered };
    refs[l.code] = cellRefs;
  }

  // Validate against the limits, reporting by cell.
  validateQuiz(quiz, limits).forEach((i) => {
    if (i.code !== 'correct-missing') (i.level === 'error' ? err : warn)(i.message);
  });
  for (const [code, file] of Object.entries(files)) {
    const name = registry.languages[code].name;
    validateStrings(code, file, quiz, limits).issues.forEach((i) => {
      if (i.code === 'placeholder') {
        warn(`${name}: UI strings still placeholder (not in the sheet): ${file.placeholder.join(', ')}`);
        return;
      }
      const ref = i.key && refs[code][i.key] ? refs[code][i.key] : '';
      const message = `${name} ${i.message.replace(new RegExp('^' + code + ' '), '')}`;
      (i.level === 'error' ? err : warn)(message, ref);
    });
  }
  return {
    issues,
    quiz,
    files,
    skipped,
    summary: {
      headerRow: headerRow + 1,
      mode,
      keyColumn: keyCol >= 0 ? colName(keyCol) : '',
      labelColumn: labelCol >= 0 ? colName(labelCol) : '',
      correctColumn: correctCol >= 0 ? colName(correctCol) : '',
      columns: langCols.map((l) => `${l.header}=${colName(l.col)} (${l.code})`),
      questions: questions.map((q) => q.answers.length)
    }
  };
}

// Template rows, generated from config so limits in the sheet always match the build.
export function templateRows({ registry, limits }) {
  const langs = registry.order.map((code) => registry.languages[code].name);
  const rows = [['Key', 'What this is', 'Limit', 'Correct (Y on the right answer)', ...langs]];
  const uiNotes = {
    'language.label': 'Name of the language on its picker button, written in that language',
    'picker.title': 'Heading on the language picker, for example "Choose your language"',
    'question.progress': 'Progress line. Keep {n} and {total}: "Question {n} of {total}"',
    'answer.correct': 'Shown when the player picks the right answer',
    'answer.incorrect': 'Shown when the player picks a wrong answer',
    'button.next': 'Button to the next question',
    'button.results': 'Button after the last question',
    'end.title': 'End screen heading (optional)',
    'end.score': 'Score line. Keep {score} and {total}: "You got {score} out of {total}"',
    'end.body': 'End screen message above the button (optional)',
    'button.cta': 'Call to action button on the end screen',
    'button.replay': 'Play again button (optional)',
    legal: 'Authorisation statement, if one is required (optional)'
  };
  for (const [key, rule] of Object.entries(limits.strings)) {
    rows.push([key, uiNotes[key] || '', `${rule.max} characters${rule.required ? '' : ', optional'}`, '', ...langs.map(() => '')]);
  }
  for (let q = 1; q <= limits.questions.max; q++) {
    rows.push([`q${q}`, `Question ${q}`, `${limits.question.max} characters`, '', ...langs.map(() => '')]);
    for (let a = 1; a <= limits.answersPerQuestion.max; a++) {
      rows.push([`q${q}.a${a}`, `Question ${q}, answer ${a}${a > limits.answersPerQuestion.min ? ' (optional)' : ''}`, `${limits.answer.max} characters`, '', ...langs.map(() => '')]);
    }
  }
  return rows;
}

function csvEscape(v) {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main(argv) {
  const opts = { map: {}, dryRun: false, force: false, sheet: undefined, file: null, template: false, out: path.join(ROOT, 'content') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--template') opts.template = true;
    else if (a === '--map') opts.map = parseMap(argv[++i]);
    else if (a === '--sheet') opts.sheet = argv[++i];
    else if (a === '--out') opts.out = path.resolve(argv[++i]);
    else if (a.startsWith('--')) {
      console.error(`Unknown option ${a}`);
      return 2;
    } else opts.file = a;
  }
  const project = loadProject();
  const registry = project.config.languages;
  const limits = project.config.limits;
  if (opts.template) {
    const rows = templateRows({ registry, limits });
    fs.mkdirSync(path.join(ROOT, 'sheets'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'sheets/vec-quiz-copy-template.csv'), String.fromCharCode(0xfeff) + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n') + '\r\n');
    fs.writeFileSync(path.join(ROOT, 'sheets/vec-quiz-copy-template.xlsx'), writeXlsx(rows, { sheetName: 'Copy', widths: [14, 52, 20, 12, ...registry.order.map(() => 32)] }));
    console.log('Wrote sheets/vec-quiz-copy-template.xlsx and sheets/vec-quiz-copy-template.csv');
    return 0;
  }
  if (!opts.file) {
    console.error('Usage: node tools/sheet2json.mjs <sheet.xlsx|sheet.csv> [--sheet NAME] [--map "Header=code"] [--dry-run] [--force]\n       node tools/sheet2json.mjs --template');
    return 2;
  }
  let sheet;
  try {
    sheet = readSheet(path.resolve(opts.file), { sheet: opts.sheet });
  } catch (e) {
    console.error(e.message);
    return 1;
  }
  const source = `sheet2json from ${path.basename(opts.file)} (${sheet.sheet}) on ${new Date().toISOString().slice(0, 10)}`;
  const result = convertSheet(sheet.rows, { registry, limits, map: opts.map, existing: project.contents, source });
  const errors = result.issues.filter((i) => i.level === 'error');
  const warnings = result.issues.filter((i) => i.level === 'warning');
  if (result.summary) {
    const s = result.summary;
    console.log(`Sheet: ${path.basename(opts.file)} (${sheet.sheet}), header row ${s.headerRow}, ${s.mode} layout${s.keyColumn ? `, keys in ${s.keyColumn}` : ''}${s.labelColumn ? `, labels in ${s.labelColumn}` : ''}${s.correctColumn ? `, correct in ${s.correctColumn}` : ''}`);
    console.log(`Columns: ${s.columns.join(', ')}`);
    console.log(`Questions: ${s.questions.length} (answers per question: ${s.questions.join(', ') || 'none'})`);
    if (result.skipped.length) console.log(`No text yet for: ${result.skipped.join(', ')} (left unchanged)`);
  }
  warnings.forEach((w) => console.log(`  warn:  ${w.message}`));
  errors.forEach((e) => console.log(`  error: ${e.message}`));
  if (errors.length && !opts.force) {
    console.log(`\n${errors.length} error(s). Nothing written. Fix the sheet, or re-run with --force to write anyway.`);
    return 1;
  }
  if (opts.dryRun) {
    console.log('\nDry run: nothing written.');
    return errors.length ? 1 : 0;
  }
  const readme = project.quiz._readme;
  writeJson(path.join(opts.out, 'quiz.json'), Object.assign(readme ? { _readme: readme } : {}, result.quiz));
  const written = ['quiz.json'];
  for (const [code, file] of Object.entries(result.files)) {
    writeJson(path.join(opts.out, `${code}.json`), file);
    written.push(`${code}.json`);
  }
  console.log(`\nWrote ${written.map((f) => rel(path.join(opts.out, f))).join(', ')}. Next: npm run check, then npm run build.`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}

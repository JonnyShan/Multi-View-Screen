import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProject } from '../tools/lib/project.mjs';
import { parseCsv, readXlsx, cellRef, colName } from '../tools/lib/sheet.mjs';
import { writeXlsx } from '../tools/lib/xlsx-write.mjs';
import { convertSheet, templateRows, parseMap } from '../tools/sheet2json.mjs';

const project = loadProject();
const registry = project.config.languages;
const limits = project.config.limits;
const en = project.contents.en.strings;
const quiz = project.quiz;

// A filled template: key column, correct column, English plus Arabic sample cells.
function templateSheet({ arabic = {}, extraRows = [] } = {}) {
  const rows = [['Key', 'What this is', 'Limit', 'Correct', 'English', 'Mandarin', 'Cantonese', 'Vietnamese', 'Arabic', 'Hindi']];
  for (const key of Object.keys(limits.strings)) rows.push([key, '', '', '', en[key] || '', '', '', '', arabic[key] || '', '']);
  quiz.questions.forEach((q) => {
    rows.push([q.id, '', '', '', en[q.id], '', '', '', arabic[q.id] || '', '']);
    q.answers.forEach((a) => rows.push([a, '', '', a === q.correct ? 'Y' : '', en[a], '', '', '', arabic[a] || '', '']));
  });
  return rows.concat(extraRows);
}

test('cell references and column names', () => {
  assert.equal(colName(0), 'A');
  assert.equal(colName(25), 'Z');
  assert.equal(colName(26), 'AA');
  assert.equal(cellRef(13, 5), 'F14');
});

test('CSV parsing handles quotes, embedded newlines, BOM and semicolons', () => {
  const rows = parseCsv('﻿Key,English\r\nq1,"Say ""hi""\nthere"\r\nq2,plain\r\n');
  assert.deepEqual(rows, [['Key', 'English'], ['q1', 'Say "hi"\nthere'], ['q2', 'plain']]);
  assert.deepEqual(parseCsv('a;b;c\n1;2;3\n'), [['a', 'b', 'c'], ['1', '2', '3']]);
});

test('template layout round trips the English copy and structure', () => {
  const result = convertSheet(templateSheet(), { registry, limits, existing: {}, source: 'test' });
  assert.deepEqual(result.issues.filter((i) => i.level === 'error'), []);
  assert.equal(result.summary.mode, 'template');
  assert.deepEqual(result.quiz.questions.map((q) => q.correct), quiz.questions.map((q) => q.correct));
  assert.deepEqual(result.files.en.strings, en);
  assert.equal(result.files.en.placeholder, false);
  assert.deepEqual(result.skipped.sort(), ['ar', 'cmn', 'hi', 'vi', 'yue']);
});

test('limit errors point at the exact cell', () => {
  const arabic = {};
  for (const key of Object.keys(en)) arabic[key] = 'نص';
  arabic.q3 = 'ن'.repeat(97);
  const result = convertSheet(templateSheet({ arabic }), { registry, limits, existing: {}, source: 'test' });
  const over = result.issues.find((i) => i.level === 'error' && /97 characters/.test(i.message));
  assert.ok(over, JSON.stringify(result.issues));
  assert.match(over.message, /^I\d+: Arabic "q3" is 97 characters; the limit is 90\./);
});

test('missing UI strings are kept from the existing file and flagged as placeholder', () => {
  const rows = templateSheet().filter((row) => !limits.strings[row[0]]);
  const result = convertSheet(rows, { registry, limits, existing: project.contents, source: 'test' });
  assert.deepEqual(result.issues.filter((i) => i.level === 'error'), []);
  assert.deepEqual(result.files.en.placeholder.sort(), Object.keys(limits.strings).filter((k) => en[k]).sort());
  assert.ok(result.issues.some((i) => /UI strings still placeholder/.test(i.message)));
});

test('loose layout with labels and a Correct column', () => {
  const rows = [
    ['', 'English', 'Arabic', 'Correct?'],
    ['Question 1', 'Is this a question?', 'سؤال؟', ''],
    ['A', 'Yes', 'نعم', 'Y'],
    ['B', 'No', 'لا', ''],
    ['Question 2', 'Pick one', 'اختر', ''],
    ['Answer A', 'First', 'الأول', ''],
    ['Answer B', 'Second', 'الثاني', 'x'],
    ['Answer C', 'Third', 'الثالث', '']
  ];
  const result = convertSheet(rows, { registry, limits, existing: project.contents, source: 'test' });
  assert.equal(result.summary.mode, 'loose');
  assert.deepEqual(result.quiz.questions, [
    { id: 'q1', answers: ['q1.a1', 'q1.a2'], correct: 'q1.a1' },
    { id: 'q2', answers: ['q2.a1', 'q2.a2', 'q2.a3'], correct: 'q2.a2' }
  ]);
  assert.equal(result.files.ar.strings['q2.a3'], 'الثالث');
});

test('loose layout without labels: "?" starts a question, "*" marks the correct answer', () => {
  const rows = [
    ['English'],
    ['Which is right?'],
    ['Left'],
    ['Right *'],
    ['Another question?'],
    ['*Up'],
    ['Down']
  ];
  const result = convertSheet(rows, { registry, limits, existing: project.contents, source: 'test' });
  assert.deepEqual(result.quiz.questions.map((q) => q.correct), ['q1.a2', 'q2.a1']);
  assert.equal(result.files.en.strings['q1.a2'], 'Right');
  assert.equal(result.files.en.strings['q2.a1'], 'Up');
});

test('optional template rows left empty are dropped, not reported as missing', () => {
  const rows = templateSheet().filter((row) => !['q4.a3', 'q5', 'q5.a1', 'q5.a2'].includes(row[0]));
  rows.push(['q4.a3', '', '', '', '', '', '', '', '', ''], ['q5', '', '', '', '', '', '', '', '', ''], ['q5.a1', '', '', '', '', '', '', '', '', ''], ['q5.a2', '', '', '', '', '', '', '', '', '']);
  const result = convertSheet(rows, { registry, limits, existing: {}, source: 'test' });
  const q4 = quiz.questions[3];
  assert.equal(result.quiz.questions.length, 4);
  assert.deepEqual(result.quiz.questions[3].answers, ['q4.a1', 'q4.a2']);
  assert.ok(result.issues.some((i) => i.level === 'error' && /q4 has 0 answers marked correct/.test(i.message)) === (q4.correct === 'q4.a3'));
});

test('questions without exactly one correct answer are errors', () => {
  const rows = [['', 'English', 'Correct'], ['Q1', 'One?', ''], ['A', 'x', ''], ['B', 'y', '']];
  const result = convertSheet(rows, { registry, limits, existing: project.contents, source: 'test' });
  assert.ok(result.issues.some((i) => i.level === 'error' && /0 answers marked correct/.test(i.message)));
});

test('a Chinese column named by script is refused until mapped explicitly', () => {
  const rows = templateSheet().map((row, i) => {
    const copy = row.slice();
    copy[5] = i === 0 ? 'Simplified Chinese' : copy[5];
    return copy;
  });
  const refused = convertSheet(rows, { registry, limits, existing: {}, source: 'test' });
  assert.ok(refused.issues.some((i) => i.level === 'error' && /names a Chinese script/.test(i.message)));
  const mapped = convertSheet(rows, { registry, limits, existing: {}, map: parseMap('Simplified Chinese=cmn'), source: 'test' });
  assert.ok(!mapped.issues.some((i) => /names a Chinese script/.test(i.message)));
});

test('XLSX written by the template tool reads back cell for cell', () => {
  const rows = templateSheet({ arabic: { q1: 'سؤال الاختبار', 'q1.a1': 'جواب' } });
  const parsed = readXlsx(writeXlsx(rows));
  assert.equal(parsed.sheet, 'Copy');
  rows.forEach((row, r) => row.forEach((value, c) => assert.equal(parsed.rows[r][c] || '', value)));
  const result = convertSheet(parsed.rows, { registry, limits, existing: {}, source: 'test' });
  assert.equal(result.files.en.strings.q2, en.q2);
});

test('the client template lists every UI key and every question slot', () => {
  const rows = templateRows({ registry, limits });
  const keys = rows.slice(1).map((r) => r[0]);
  assert.ok(Object.keys(limits.strings).every((k) => keys.includes(k)));
  assert.ok(keys.includes(`q${limits.questions.max}.a${limits.answersPerQuestion.max}`));
  assert.deepEqual(rows[0].slice(4), registry.order.map((c) => registry.languages[c].name));
});

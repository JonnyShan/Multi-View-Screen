import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProject } from '../tools/lib/project.mjs';
import { validateAll, validateQuiz, validateStrings, countChars, fillTokens, expectedKeys } from '../src/js/content.js';

const project = loadProject();
const { quiz, config, contents } = project;
const limits = config.limits;
const EN_DASH = String.fromCharCode(0x2013);

const clone = (v) => JSON.parse(JSON.stringify(v));
const english = () => clone(contents.en);
const codes = (issues) => issues.map((i) => i.code);

test('character counting uses code points, spaces included', () => {
  assert.equal(countChars('abc def'), 7);
  assert.equal(countChars('हिन्दी'), 6);
  assert.equal(countChars('\u{1F600}a'), 2);
});

test('tokens are filled and unknown tokens left alone', () => {
  assert.equal(fillTokens('Question {n} of {total}', { n: 2, total: 5 }), 'Question 2 of 5');
  assert.equal(fillTokens('{nope}', { n: 1 }), '{nope}');
});

test('placeholder English passes the limits and is reported as placeholder', () => {
  const report = validateAll({ quiz, registry: config.languages, contents, limits, fonts: config.fonts });
  assert.equal(report.quizOk, true);
  assert.equal(report.languages.en.status, 'placeholder');
  assert.deepEqual(report.included, ['en']);
  for (const code of ['cmn', 'yue', 'vi', 'ar', 'hi']) assert.equal(report.languages[code].status, 'missing');
});

test('the placeholder copy exercises the limits exactly', () => {
  const file = english();
  assert.equal(countChars(file.strings.q2), limits.question.max);
  assert.equal(countChars(file.strings['q2.a1']), limits.answer.max);
});

test('over limit, missing, token and en dash problems are errors', () => {
  const file = english();
  file.strings.q1 = 'x'.repeat(limits.question.max + 1);
  file.strings['q1.a1'] = 'y'.repeat(limits.answer.max + 1);
  delete file.strings['q3.a2'];
  file.strings['question.progress'] = 'Question {n}';
  file.strings['end.score'] = 'You got {score} of {total} in {time}';
  file.strings['button.next'] = 'Next ' + EN_DASH + ' go';
  const { issues } = validateStrings('en', file, quiz, limits);
  const errors = issues.filter((i) => i.level === 'error');
  assert.ok(errors.some((i) => i.code === 'over-limit' && i.key === 'q1' && i.count === 91));
  assert.ok(errors.some((i) => i.code === 'over-limit' && i.key === 'q1.a1'));
  assert.ok(errors.some((i) => i.code === 'missing' && i.key === 'q3.a2'));
  assert.ok(errors.some((i) => i.code === 'token-missing' && i.key === 'question.progress'));
  assert.ok(errors.some((i) => i.code === 'token-unknown' && i.key === 'end.score'));
  assert.ok(errors.some((i) => i.code === 'en-dash' && i.key === 'button.next'));
});

test('whitespace, double spaces, line breaks and unknown keys are warnings', () => {
  const file = english();
  file.strings.q1 = ' Leading space';
  file.strings.q2 = 'Double  space';
  file.strings.q3 = 'Line\nbreak';
  file.strings.extra = 'Not used';
  const { issues } = validateStrings('en', file, quiz, limits);
  const warnings = issues.filter((i) => i.level === 'warning');
  assert.deepEqual(['whitespace', 'double-space', 'line-break', 'unknown-key'].every((c) => codes(warnings).includes(c)), true);
  assert.equal(issues.filter((i) => i.level === 'error').length, 0);
});

test('optional UI strings may be empty, required ones may not', () => {
  const file = english();
  file.strings['end.body'] = '';
  file.strings.legal = '';
  file.strings['button.replay'] = '';
  assert.equal(validateStrings('en', file, quiz, limits).issues.filter((i) => i.level === 'error').length, 0);
  file.strings['button.cta'] = '';
  assert.ok(validateStrings('en', file, quiz, limits).issues.some((i) => i.code === 'missing' && i.key === 'button.cta'));
});

test('quiz structure rules: counts, one correct answer, unique ids', () => {
  const bad = clone(quiz);
  bad.questions[0].correct = 'q9.a9';
  bad.questions[1].answers = ['q2.a1'];
  bad.questions.push(clone(quiz.questions[0]));
  const issues = codes(validateQuiz(bad, limits));
  assert.ok(issues.includes('correct-missing'));
  assert.ok(issues.includes('answer-count'));
  assert.ok(issues.includes('question-count'));
  assert.ok(issues.includes('duplicate-id'));
});

test('a language with copy but no font (Mandarin, script unconfirmed) is invalid', () => {
  const file = english();
  file.lang = 'cmn';
  file.placeholder = true;
  const report = validateAll({ quiz, registry: config.languages, contents: { en: contents.en, cmn: file }, limits, fonts: config.fonts });
  assert.equal(report.languages.cmn.status, 'invalid');
  assert.ok(report.languages.cmn.issues.some((i) => i.code === 'font-missing'));
  assert.ok(report.languages.cmn.issues.some((i) => i.code === 'html-lang-missing'));
  assert.deepEqual(report.included, ['en']);
});

test('a language file must declare its own code', () => {
  const file = english();
  const { issues } = validateStrings('vi', file, quiz, limits);
  assert.ok(issues.some((i) => i.code === 'lang-mismatch'));
});

test('expected keys cover UI strings plus every question and answer', () => {
  const keys = [...expectedKeys(quiz, limits).keys()];
  assert.ok(keys.includes('picker.title'));
  assert.ok(keys.includes('q5.a2'));
  assert.equal(keys.filter((k) => /^q\d+$/.test(k)).length, quiz.questions.length);
});

// Content model and validation. Shared by the playable, the review page and the
// Node tools (build, check, sheet2json), so it must stay free of DOM and Node APIs.

export const EN_DASH = String.fromCharCode(0x2013);

// Tokens that may appear inside strings, for example "Question {n} of {total}".
const TOKEN_RE = /\{([A-Za-z]+)\}/g;

// Values used when measuring a string that contains tokens. One digit each, since
// a quiz never has more than 9 questions.
const SAMPLE_VALUES = { n: '5', total: '5', score: '5' };

// Characters as the client counts them: Unicode code points, spaces included.
export function countChars(text) {
  let n = 0;
  for (const _ of String(text)) n++;
  return n;
}

export function fillTokens(template, values) {
  return String(template).replace(TOKEN_RE, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  );
}

export function tokensIn(text) {
  const found = [];
  String(text).replace(TOKEN_RE, (match) => {
    found.push(match);
    return match;
  });
  return found;
}

export function isPlaceholder(file, key) {
  if (!file) return false;
  if (file.placeholder === true) return true;
  return Array.isArray(file.placeholder) && (key === undefined || file.placeholder.includes(key));
}

// Every string key the quiz needs, with its rule. UI keys come from limits.strings,
// question and answer keys come from the quiz structure.
export function expectedKeys(quiz, limits) {
  const keys = new Map();
  for (const [key, rule] of Object.entries(limits.strings || {})) {
    keys.set(key, {
      kind: 'ui',
      max: rule.max,
      required: rule.required !== false,
      tokens: rule.tokens || []
    });
  }
  for (const q of (quiz && quiz.questions) || []) {
    keys.set(q.id, { kind: 'question', qid: q.id, max: limits.question.max, required: true, tokens: [] });
    for (const a of q.answers || []) {
      keys.set(a, { kind: 'answer', qid: q.id, max: limits.answer.max, required: true, tokens: [] });
    }
  }
  return keys;
}

function issue(level, code, message, extra) {
  return Object.assign({ level, code, message }, extra || {});
}

export function validateQuiz(quiz, limits) {
  const issues = [];
  if (!quiz || !Array.isArray(quiz.questions)) {
    issues.push(issue('error', 'quiz-shape', 'content/quiz.json needs a "questions" array.'));
    return issues;
  }
  const qMin = limits.questions.min;
  const qMax = limits.questions.max;
  if (quiz.questions.length < qMin || quiz.questions.length > qMax) {
    issues.push(issue('error', 'question-count',
      `The quiz has ${quiz.questions.length} questions; allowed is ${qMin} to ${qMax}.`));
  }
  const seen = new Set();
  const aMin = limits.answersPerQuestion.min;
  const aMax = limits.answersPerQuestion.max;
  quiz.questions.forEach((q, i) => {
    const where = `question ${i + 1}`;
    if (!q || typeof q.id !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(q.id)) {
      issues.push(issue('error', 'question-id', `${where} needs an id made of letters, digits, dots, dashes or underscores.`));
      return;
    }
    if (seen.has(q.id)) issues.push(issue('error', 'duplicate-id', `Duplicate id "${q.id}".`, { key: q.id }));
    seen.add(q.id);
    const answers = Array.isArray(q.answers) ? q.answers : [];
    if (answers.length < aMin || answers.length > aMax) {
      issues.push(issue('error', 'answer-count',
        `${q.id} has ${answers.length} answers; allowed is ${aMin} to ${aMax}.`, { key: q.id }));
    }
    for (const a of answers) {
      if (typeof a !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(a)) {
        issues.push(issue('error', 'answer-id', `${q.id} has an invalid answer id.`, { key: q.id }));
        continue;
      }
      if (seen.has(a)) issues.push(issue('error', 'duplicate-id', `Duplicate id "${a}".`, { key: a }));
      seen.add(a);
    }
    if (!answers.includes(q.correct)) {
      issues.push(issue('error', 'correct-missing',
        `${q.id} must mark exactly one of its answers as correct.`, { key: q.id }));
    }
  });
  if (quiz.placeholder === true) {
    issues.push(issue('warning', 'placeholder', 'content/quiz.json is placeholder structure, not client copy.'));
  }
  return issues;
}

// Checks one language file against the quiz and the limits. Returns the issues plus
// a per key table that the review page renders.
export function validateStrings(code, file, quiz, limits) {
  const issues = [];
  const rows = [];
  const at = (key) => ({ lang: code, key });
  if (!file || typeof file !== 'object') {
    issues.push(issue('error', 'file-shape', `content/${code}.json is not a JSON object.`, { lang: code }));
    return { issues, rows };
  }
  if (file.lang !== code) {
    issues.push(issue('error', 'lang-mismatch',
      `content/${code}.json declares lang "${file.lang}"; it must be "${code}".`, { lang: code }));
  }
  const strings = file.strings && typeof file.strings === 'object' ? file.strings : null;
  if (!strings) {
    issues.push(issue('error', 'file-shape', `content/${code}.json needs a "strings" object.`, { lang: code }));
    return { issues, rows };
  }
  const expected = expectedKeys(quiz, limits);
  for (const [key, rule] of expected) {
    const raw = strings[key];
    const row = { key, kind: rule.kind, text: typeof raw === 'string' ? raw : '', max: rule.max, count: 0, placeholder: isPlaceholder(file, key), level: '' };
    rows.push(row);
    if (raw === undefined || raw === null || raw === '') {
      if (rule.required) {
        issues.push(issue('error', 'missing', `${code} is missing "${key}".`, at(key)));
        row.level = 'error';
      }
      continue;
    }
    if (typeof raw !== 'string') {
      issues.push(issue('error', 'not-text', `${code} "${key}" must be text.`, at(key)));
      row.level = 'error';
      continue;
    }
    row.count = countChars(fillTokens(raw, SAMPLE_VALUES));
    const flag = (level, codeName, message, extra) => {
      issues.push(issue(level, codeName, message, Object.assign(at(key), extra || {})));
      if (level === 'error' || !row.level) row.level = level;
    };
    if (row.count > rule.max) {
      flag('error', 'over-limit', `${code} "${key}" is ${row.count} characters; the limit is ${rule.max}.`, { count: row.count, max: rule.max });
    }
    const present = tokensIn(raw);
    for (const token of rule.tokens) {
      if (!present.includes(token)) flag('error', 'token-missing', `${code} "${key}" must contain ${token}.`);
    }
    for (const token of present) {
      if (!rule.tokens.includes(token)) flag('error', 'token-unknown', `${code} "${key}" contains ${token}, which the engine does not fill.`);
    }
    if (raw.includes(EN_DASH)) {
      flag('error', 'en-dash', `${code} "${key}" contains an en dash. Replace it with a hyphen or rephrase.`);
    }
    // Control characters other than tab and newline are almost always paste damage.
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(raw)) {
      flag('error', 'control-char', `${code} "${key}" contains a control character.`);
    }
    if (/[\r\n]/.test(raw)) flag('warning', 'line-break', `${code} "${key}" contains a line break; the layout wraps text itself.`);
    if (raw !== raw.trim()) flag('warning', 'whitespace', `${code} "${key}" has leading or trailing spaces.`);
    if (/ {2,}/.test(raw)) flag('warning', 'double-space', `${code} "${key}" contains a double space.`);
  }
  for (const key of Object.keys(strings)) {
    if (!expected.has(key)) {
      issues.push(issue('warning', 'unknown-key', `${code} has "${key}", which the quiz does not use.`, at(key)));
    }
  }
  if (isPlaceholder(file)) {
    issues.push(issue('warning', 'placeholder', `content/${code}.json contains placeholder copy.`, { lang: code }));
  }
  return { issues, rows };
}

// The registry entry a language needs before it can render: html lang, direction and font.
export function languageProfile(code, registry, file) {
  const entry = (registry.languages && registry.languages[code]) || {};
  const own = (file && file.language) || {};
  return {
    code,
    name: own.name || entry.name || code,
    htmlLang: own.htmlLang || entry.htmlLang || '',
    dir: own.dir || entry.dir || '',
    font: own.font || entry.font || '',
    numerals: own.numerals || entry.numerals || '',
    registered: Boolean(registry.languages && registry.languages[code])
  };
}

// Full report across the quiz and every language: registered languages without a
// file show as missing, files without a registry entry must describe themselves.
export function validateAll({ quiz, registry, contents, limits, fonts }) {
  const quizIssues = validateQuiz(quiz, limits);
  const quizOk = !quizIssues.some((i) => i.level === 'error');
  const codes = [...new Set([...(registry.order || []), ...Object.keys(contents)])];
  const languages = {};
  for (const code of codes) {
    const file = contents[code];
    const profile = languageProfile(code, registry, file);
    if (!file) {
      languages[code] = { code, profile, status: 'missing', issues: [], rows: [] };
      continue;
    }
    const { issues, rows } = validateStrings(code, file, quiz, limits);
    if (!profile.registered && !(file.language && file.language.dir && file.language.font)) {
      issues.push(issue('error', 'unregistered', `${code} is not in config/languages.json and its file does not set language.dir and language.font.`, { lang: code }));
    }
    if (!profile.htmlLang) {
      issues.push(issue('error', 'html-lang-missing', `${code} has no htmlLang in config/languages.json.`, { lang: code }));
    }
    if (profile.dir !== 'ltr' && profile.dir !== 'rtl') {
      issues.push(issue('error', 'dir-missing', `${code} needs dir "ltr" or "rtl" in config/languages.json.`, { lang: code }));
    }
    if (!profile.font) {
      issues.push(issue('error', 'font-missing', `${code} has no font in config/languages.json. For Mandarin and Cantonese this waits on the client confirming the script.`, { lang: code }));
    } else if (fonts && !fonts.families[profile.font]) {
      issues.push(issue('error', 'font-unknown', `${code} uses font "${profile.font}", which config/fonts.json does not define.`, { lang: code }));
    }
    const hasError = issues.some((i) => i.level === 'error');
    const status = hasError ? 'invalid' : isPlaceholder(file) ? 'placeholder' : 'ready';
    languages[code] = { code, profile, status, issues, rows };
  }
  const included = (registry.order || []).concat(Object.keys(contents).filter((c) => !(registry.order || []).includes(c)))
    .filter((code) => languages[code] && (languages[code].status === 'ready' || languages[code].status === 'placeholder'));
  return { quizOk, quizIssues, languages, included: quizOk ? included : [] };
}

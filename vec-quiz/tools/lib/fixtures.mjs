// QA fixtures: sample text in each script so fonts, shaping and right to left layout
// can be tested before the client's translations arrive. The samples are letter
// sequences and mnemonic words (abjad, Devanagari conjuncts, heavenly stems), not
// translations, and every file is marked fixture so the build refuses it in content/.

import fs from 'node:fs';
import path from 'node:path';
import { countChars } from '../../src/js/content.js';

const SAMPLES = {
  cmn: { label: '普通话', words: ['甲乙丙', '丁戊己', '庚辛壬', '癸子丑', '寅卯辰', '简体测试'], ratio: 0.45, joiner: '' },
  yue: { label: '廣東話', words: ['甲乙丙', '丁戊己', '庚辛壬', '癸子丑', '寅卯辰', '繁體測試'], ratio: 0.45, joiner: '' },
  vi: { label: 'Tiếng Việt', words: ['Ăn', 'Âm', 'Êm', 'Ôn', 'Ơi', 'Ưu', 'Đa', 'ắằẳẵặ', 'ốồổỗộ', 'ứừửữự'], ratio: 1.1, joiner: ' ' },
  ar: { label: 'العربية', words: ['أبجد', 'هوز', 'حطي', 'كلمن', 'سعفص', 'قرشت', 'ثخذ', 'ضظغ', 'لا'], ratio: 0.95, joiner: ' ' },
  hi: { label: 'हिन्दी', words: ['कखग', 'क्षत्र', 'ज्ञश्र', 'द्धर्क', 'हिकीकु', 'घङचछ'], ratio: 1.0, joiner: ' ' }
};

// QA only: the scripts Mandarin and Cantonese use are still waiting on the client,
// so fixture builds assume the usual split just to exercise the CJK font pipeline.
export const FIXTURE_LANGUAGE_OVERRIDE = {
  cmn: { htmlLang: 'zh-Hans', script: 'Hans', font: 'han-sc' },
  yue: { htmlLang: 'zh-Hant', script: 'Hant', font: 'han-tc' }
};

function sampleText(sample, target, max, seed) {
  const words = sample.words;
  let out = '';
  let i = seed;
  while (countChars(out) < target) {
    out += (out ? sample.joiner : '') + words[i % words.length];
    i += 1;
  }
  return Array.from(out).slice(0, Math.min(max, Math.max(1, target))).join('').trim();
}

export function makeFixtures({ quiz, english, limits, codes }) {
  const files = {};
  const maxFor = (key) => {
    if (limits.strings[key]) return limits.strings[key].max;
    return /\.a\d+$/.test(key) ? limits.answer.max : limits.question.max;
  };
  for (const code of codes) {
    if (code === 'en') {
      files.en = english;
      continue;
    }
    const sample = SAMPLES[code];
    if (!sample) continue;
    const strings = {};
    let seed = 0;
    for (const [key, en] of Object.entries(english.strings)) {
      seed += 1;
      const max = maxFor(key);
      if (key === 'language.label') {
        strings[key] = sample.label;
        continue;
      }
      const tokens = en.match(/\{[A-Za-z]+\}/g) || [];
      const target = Math.max(2, Math.round(countChars(en.replace(/\{[A-Za-z]+\}/g, '')) * sample.ratio));
      if (tokens.length === 2) {
        strings[key] = `${sampleText(sample, Math.min(target, max - 8), max - 8, seed)} ${tokens[0]} / ${tokens[1]}`;
      } else {
        strings[key] = sampleText(sample, target, max, seed) + (en.endsWith('?') ? '?' : '');
      }
    }
    files[code] = {
      lang: code,
      fixture: true,
      placeholder: true,
      source: 'QA FIXTURE ONLY. Sample letters and mnemonic words to exercise fonts and right to left layout. Not a translation and never shipped.',
      strings
    };
  }
  return files;
}

export function writeFixtureDir(dir, { quiz, files }) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'quiz.json'), JSON.stringify(quiz, null, 2) + '\n');
  for (const [code, file] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, `${code}.json`), JSON.stringify(file, null, 2) + '\n');
  }
}

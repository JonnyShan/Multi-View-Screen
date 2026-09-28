// DOM rendering. Knows nothing about scoring or reporting: it draws a state from the
// engine and turns taps into actions. All copy goes in through textContent.

import { fillTokens, countChars } from './content.js';
import { fitElement, fitScreen } from './fit.js';

function padTo(textValue, max) {
  // Review "max length" mode: repeat the copy until it hits its character limit.
  if (!textValue || !max) return textValue;
  let out = textValue;
  while (countChars(out) < max) out += ' ' + textValue;
  return Array.from(out).slice(0, max).join('').trimEnd();
}

export function createView({ root, data, onAction, onCta }) {
  const doc = root.ownerDocument;
  const html = doc.documentElement;
  const win = doc.defaultView;
  const $ = (selector, scope) => (scope || root).querySelector(selector);
  const screens = {};
  root.querySelectorAll('[data-screen-id]').forEach((el) => {
    screens[el.getAttribute('data-screen-id')] = el;
  });
  const langs = data.langs;
  const byCode = {};
  langs.forEach((l) => {
    byCode[l.code] = l;
  });
  const questions = data.quiz.questions;
  const minPx = data.engine.fit.minFontPx;
  const fitListeners = [];
  let pseudo = { rtl: false, long: false };
  let current = null;
  let keyboardAnswer = false;
  let cycleTimer = null;
  let cycleIndex = 0;
  let viewable = false;
  let fitQueued = false;
  let noticeTimer = null;

  function raw(code, key) {
    const table = data.strings[code] || {};
    return typeof table[key] === 'string' ? table[key] : '';
  }

  function text(code, key, values) {
    let value = raw(code, key);
    if (values) value = fillTokens(value, values);
    if (pseudo.long && value) value = padTo(value, data.max[key]);
    return value;
  }

  function setText(el, value) {
    el.textContent = value;
    if (value) el.removeAttribute('data-empty');
    else el.setAttribute('data-empty', '');
  }

  function applyLang(el, code) {
    const profile = byCode[code];
    if (!profile) return;
    el.setAttribute('lang', profile.htmlLang);
    el.setAttribute('dir', pseudo.rtl ? 'rtl' : profile.dir);
    el.setAttribute('data-font', profile.font);
  }

  function numberFormat(code) {
    const profile = byCode[code];
    const system = profile && profile.numerals;
    if (system && typeof Intl !== 'undefined') {
      try {
        const formatter = new Intl.NumberFormat('en-u-nu-' + system);
        return (n) => formatter.format(n);
      } catch (e) {
        // unsupported numbering system: fall back to Western digits
      }
    }
    return (n) => String(n);
  }

  // Layout mode and unit from the viewport. Design sizes are pixels at the basis size.
  function layout() {
    const w = root.clientWidth || win.innerWidth;
    const h = root.clientHeight || win.innerHeight;
    if (!w || !h) return;
    const aspect = w / h;
    const mode = aspect > 1.35 ? 'landscape' : aspect >= 0.85 ? 'compact' : 'portrait';
    const basis = mode === 'landscape' ? [640, 360] : mode === 'compact' ? [400, 400] : [360, 640];
    const u = Math.max(0.5, Math.min(2.2, Math.min(w / basis[0], h / basis[1])));
    root.setAttribute('data-layout', mode);
    root.style.setProperty('--vq-u', u.toFixed(3));
  }

  function scheduleFit() {
    if (fitQueued) return;
    fitQueued = true;
    let timer = null;
    const run = () => {
      if (!fitQueued) return;
      fitQueued = false;
      win.clearTimeout(timer);
      if (!current) return;
      const result = fitScreen(screens[current.screen], root, minPx);
      result.screen = current.screen;
      result.lang = current.lang;
      fitListeners.forEach((fn) => fn(result));
    };
    // rAF is throttled in hidden and offscreen frames, so a timer backs it up.
    win.requestAnimationFrame(run);
    timer = win.setTimeout(run, 120);
  }

  function activate(name) {
    Object.keys(screens).forEach((key) => {
      const el = screens[key];
      const on = key === name;
      if (on) {
        el.setAttribute('data-active', '');
        el.removeAttribute('inert');
        el.setAttribute('aria-hidden', 'false');
      } else {
        el.removeAttribute('data-active');
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Picker

  function showTitle(index) {
    const lang = langs[index % langs.length];
    const title = $('.vq-picker-title');
    applyLang(title, lang.code);
    setText(title, text(lang.code, 'picker.title'));
  }

  function stopCycle() {
    if (cycleTimer) win.clearInterval(cycleTimer);
    cycleTimer = null;
  }

  function startCycle() {
    stopCycle();
    if (!current || current.screen !== 'picker' || langs.length < 2 || !viewable) return;
    const title = $('.vq-picker-title');
    cycleTimer = win.setInterval(() => {
      title.setAttribute('data-fading', '');
      win.setTimeout(() => {
        cycleIndex = (cycleIndex + 1) % langs.length;
        showTitle(cycleIndex);
        fitElement(title, minPx);
        title.removeAttribute('data-fading');
      }, 200);
    }, data.engine.picker.titleCycleMs);
  }

  function renderPicker() {
    showTitle(cycleIndex);
    root.querySelectorAll('.vq-lang').forEach((button) => {
      const code = button.getAttribute('data-lang');
      applyLang(button, code);
      setText(button.firstChild, text(code, 'language.label') || byCode[code].name);
    });
  }

  // Question

  function renderQuestion(state, prev) {
    const code = state.lang;
    const q = questions[state.index];
    const total = questions.length;
    const fmt = numberFormat(code);
    const scr = screens.question;
    setText($('.vq-progress-text', scr), text(code, 'question.progress', { n: fmt(state.index + 1), total: fmt(total) }));

    const dots = $('.vq-dots', scr);
    if (dots.children.length !== total) {
      dots.textContent = '';
      for (let i = 0; i < total; i++) dots.appendChild(doc.createElement('li'));
    }
    Array.from(dots.children).forEach((li, i) => {
      li.className = i < state.index ? 'is-done' : i === state.index ? 'is-current' : '';
    });

    const qEl = $('.vq-qtext', scr);
    qEl.setAttribute('data-key', q.id);
    setText(qEl, text(code, q.id));

    const box = $('.vq-answers', scr);
    const signature = [code, q.id, pseudo.long, pseudo.rtl].join('|');
    if (box.getAttribute('data-sig') !== signature) {
      box.textContent = '';
      q.answers.forEach((answer) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'vq-answer';
        button.setAttribute('data-answer', answer);
        const label = doc.createElement('span');
        label.className = 'vq-answer-text';
        label.setAttribute('data-fit', '');
        label.setAttribute('data-key', answer);
        label.textContent = text(code, answer);
        const mark = doc.createElement('span');
        mark.className = 'vq-mark';
        mark.setAttribute('aria-hidden', 'true');
        button.appendChild(label);
        button.appendChild(mark);
        button.addEventListener('click', (ev) => {
          keyboardAnswer = ev.detail === 0;
          onAction({ type: 'answer', answer });
        });
        box.appendChild(button);
      });
      box.setAttribute('data-sig', signature);
    }

    const answered = Boolean(state.selected);
    if (answered) scr.setAttribute('data-answered', '');
    else scr.removeAttribute('data-answered');
    Array.from(box.children).forEach((button) => {
      const answer = button.getAttribute('data-answer');
      const picked = answer === state.selected;
      const right = answer === q.correct;
      button.disabled = answered;
      button.classList.toggle('is-correct', answered && picked && right);
      button.classList.toggle('is-wrong', answered && picked && !right);
      button.classList.toggle('is-reveal', answered && !picked && right);
      button.classList.toggle('is-dim', answered && !picked && !right);
      button.setAttribute('aria-pressed', picked ? 'true' : 'false');
    });

    const ok = answered && state.selected === q.correct;
    const feedback = $('.vq-feedback-text', scr);
    feedback.className = 'vq-feedback-text' + (answered ? (ok ? ' is-ok' : ' is-wrong') : '');
    setText(feedback, answered ? text(code, ok ? 'answer.correct' : 'answer.incorrect') : '');

    const next = $('.vq-next', scr);
    const key = state.index === total - 1 ? 'button.results' : 'button.next';
    next.setAttribute('data-key', key);
    setText(next, text(code, key));
    if (answered && keyboardAnswer) next.focus();
    else if (!answered && keyboardAnswer && prev && prev.screen === 'question' && prev.index !== state.index) qEl.focus();
  }

  // End

  function renderEnd(state) {
    const code = state.lang;
    const fmt = numberFormat(code);
    const score = state.answers.filter((a) => a.ok).length;
    const scr = screens.end;
    setText($('.vq-end-title', scr), text(code, 'end.title'));
    setText($('.vq-score', scr), text(code, 'end.score', { score: fmt(score), total: fmt(questions.length) }));
    setText($('.vq-end-body', scr), text(code, 'end.body'));
    setText($('.vq-cta', scr), text(code, 'button.cta'));
    setText($('.vq-replay', scr), text(code, 'button.replay'));
    setText($('.vq-legal', scr), text(code, 'legal'));
  }

  function render(state, prev) {
    current = state;
    const profile = byCode[state.lang] || byCode[data.defaultLang] || langs[0];
    html.setAttribute('lang', profile.htmlLang);
    html.setAttribute('dir', pseudo.rtl ? 'rtl' : profile.dir);
    root.setAttribute('data-font', profile.font);
    root.setAttribute('data-screen', state.screen);
    if (state.screen === 'picker') renderPicker();
    else if (state.screen === 'question') renderQuestion(state, prev);
    else if (state.screen === 'end') renderEnd(state);
    activate(state.screen);
    if (state.screen === 'picker') startCycle();
    else stopCycle();
    scheduleFit();
  }

  function init() {
    // Logo: inline image when configured, a labelled box in non release builds so
    // reviewers can see where it goes, nothing at all in a release build.
    root.querySelectorAll('[data-logo]').forEach((slot) => {
      if (data.brand.logo) {
        const img = doc.createElement('img');
        img.src = data.brand.logo;
        img.alt = data.brand.logoAlt || '';
        slot.appendChild(img);
      } else if (!data.release) {
        slot.setAttribute('data-placeholder', '');
        slot.textContent = 'LOGO';
      }
    });
    const langBox = $('.vq-langs');
    langs.forEach((lang) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'vq-lang';
      button.setAttribute('data-lang', lang.code);
      const label = doc.createElement('span');
      label.setAttribute('data-fit', '');
      label.setAttribute('data-key', 'language.label');
      button.appendChild(label);
      button.addEventListener('click', () => onAction({ type: 'pick', lang: lang.code }));
      langBox.appendChild(button);
    });
    $('.vq-next').addEventListener('click', (ev) => {
      keyboardAnswer = ev.detail === 0;
      onAction({ type: 'next' });
    });
    $('.vq-cta').addEventListener('click', () => onCta());
    $('.vq-replay').addEventListener('click', () => onAction({ type: 'replay' }));
    layout();
    win.addEventListener('resize', () => {
      layout();
      scheduleFit();
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(scheduleFit);
  }

  init();

  return {
    render,
    setViewable(value) {
      viewable = value;
      if (value) startCycle();
      else stopCycle();
    },
    setPseudo(next) {
      pseudo = { rtl: Boolean(next && next.rtl), long: Boolean(next && next.long) };
      $('.vq-answers').removeAttribute('data-sig');
      if (current) render(current, current);
    },
    setOutline(on) {
      if (on) root.setAttribute('data-outline', '');
      else root.removeAttribute('data-outline');
    },
    onFit(fn) {
      fitListeners.push(fn);
    },
    refit: scheduleFit,
    notice(message) {
      const box = $('.vq-notice');
      box.textContent = message;
      box.hidden = false;
      if (noticeTimer) win.clearTimeout(noticeTimer);
      noticeTimer = win.setTimeout(() => {
        box.hidden = true;
      }, 2600);
    }
  };
}

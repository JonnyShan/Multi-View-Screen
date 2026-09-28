// Quiz state machine. Pure functions only, so the flow and the scoring can be tested
// in Node without a browser.
//
// State: { screen: 'picker' | 'question' | 'end', lang, index, selected, answers }
// Each reduce() call returns the next state plus the reporting events it produced.

export function createContext({ quiz, langs, pickerMode = 'auto', replay = 'picker' }) {
  const showPicker = pickerMode === 'always' || (pickerMode === 'auto' && langs.length > 1);
  return { quiz, langs, showPicker: pickerMode === 'never' ? false : showPicker, replay };
}

function questionState(lang, index, answers) {
  return { screen: 'question', lang, index, selected: null, answers };
}

export function startState(ctx) {
  if (ctx.showPicker) return { screen: 'picker', lang: null, index: 0, selected: null, answers: [] };
  return questionState(ctx.langs[0], 0, []);
}

export function scoreOf(state) {
  return state.answers.filter((a) => a.ok).length;
}

export function reduce(state, action, ctx) {
  const events = [];
  const same = { state, events };
  const questions = ctx.quiz.questions;
  switch (action.type) {
    case 'pick': {
      if (state.screen !== 'picker' || !ctx.langs.includes(action.lang)) return same;
      events.push({ e: 'language_select', lang: action.lang });
      return { state: questionState(action.lang, 0, []), events };
    }
    case 'answer': {
      if (state.screen !== 'question' || state.selected) return same;
      const q = questions[state.index];
      if (!q || !q.answers.includes(action.answer)) return same;
      const ok = action.answer === q.correct;
      events.push({ e: 'answer', lang: state.lang, q: q.id, a: action.answer, ok: ok ? 1 : 0, n: state.index + 1 });
      return {
        state: Object.assign({}, state, {
          selected: action.answer,
          answers: state.answers.concat([{ q: q.id, a: action.answer, ok }])
        }),
        events
      };
    }
    case 'next': {
      if (state.screen !== 'question' || !state.selected) return same;
      const nextIndex = state.index + 1;
      if (nextIndex < questions.length) return { state: questionState(state.lang, nextIndex, state.answers), events };
      const end = { screen: 'end', lang: state.lang, index: nextIndex, selected: null, answers: state.answers };
      events.push({ e: 'complete', lang: state.lang, score: scoreOf(end), total: questions.length });
      return { state: end, events };
    }
    case 'replay': {
      if (state.screen !== 'end') return same;
      events.push({ e: 'replay', lang: state.lang });
      if (ctx.replay === 'picker' && ctx.showPicker) return { state: startState(ctx), events };
      return { state: questionState(state.lang, 0, []), events };
    }
    case 'goto':
      // Review page only: jump straight to a screen. Produces no reporting events.
      return { state: synthesize(action, ctx), events };
    default:
      return same;
  }
}

// Builds a plausible state for the review page: earlier questions answered correctly,
// the current one optionally answered right or wrong, or an end screen with a given score.
export function synthesize({ screen, lang, index = 0, answered = null, score = null }, ctx) {
  const questions = ctx.quiz.questions;
  const code = ctx.langs.includes(lang) ? lang : ctx.langs[0];
  if (screen === 'picker') return { screen: 'picker', lang: null, index: 0, selected: null, answers: [] };
  const wrongOf = (q) => q.answers.find((a) => a !== q.correct);
  if (screen === 'end') {
    const target = score === null ? questions.length : Math.max(0, Math.min(questions.length, score));
    const answers = questions.map((q, i) => {
      const ok = i < target;
      return { q: q.id, a: ok ? q.correct : wrongOf(q), ok };
    });
    return { screen: 'end', lang: code, index: questions.length, selected: null, answers };
  }
  const i = Math.max(0, Math.min(questions.length - 1, index));
  const answers = questions.slice(0, i).map((q) => ({ q: q.id, a: q.correct, ok: true }));
  const state = questionState(code, i, answers);
  if (answered === 'correct' || answered === 'wrong') {
    const q = questions[i];
    const a = answered === 'correct' ? q.correct : wrongOf(q);
    state.selected = a;
    state.answers = answers.concat([{ q: q.id, a, ok: a === q.correct }]);
  }
  return state;
}

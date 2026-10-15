// Playable entry point. The build inlines this bundle, the styles, the subset fonts
// and the content into one HTML file.

import { createContext, startState, reduce, scoreOf } from './engine.js';
import { createAdEnv } from './ad-env.js';
import { createReporter } from './report.js';
import { createView } from './view.js';
import { installReviewHook } from './review-hook.js';

/* global __REVIEW__ */

const data = JSON.parse(document.getElementById('vq-data').textContent);
const root = document.getElementById('vq');
const env = createAdEnv(window);
const eventListeners = [];

// Every event is kept in window.__vqEvents for QA and debugging, whether or not
// reporting is enabled.
window.__vqEvents = [];
const reporter = createReporter({
  config: data.reporting,
  version: data.build.version,
  env: env.kind,
  hook(evt, sent) {
    window.__vqEvents.push(evt);
    eventListeners.forEach((fn) => fn(evt, sent));
  }
});

const ctx = createContext({
  quiz: data.quiz,
  langs: data.langs.map((l) => l.code),
  pickerMode: data.engine.picker.show,
  replay: data.engine.replay
});

let state = startState(ctx);
let advanceTimer = null;

function track(evt) {
  const payload = Object.assign({}, evt);
  delete payload.e;
  reporter.track(evt.e, payload);
}

function dispatch(action) {
  const out = reduce(state, action, ctx);
  const prev = state;
  state = out.state;
  out.events.forEach(track);
  if (advanceTimer) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }
  if (action.type === 'answer' && state.selected && data.engine.answer.autoAdvanceMs > 0) {
    advanceTimer = setTimeout(() => dispatch({ type: 'next' }), data.engine.answer.autoAdvanceMs);
  }
  view.render(state, prev);
}

function cta() {
  const url = env.clickUrl(data.cta.url);
  reporter.track('cta', { lang: state.lang, score: scoreOf(state), total: data.quiz.questions.length });
  if (!url) {
    if (!data.release) view.notice('CTA URL not set yet (config/client.json cta.url)');
    return;
  }
  env.open(url);
}

const view = createView({ root, data, onAction: dispatch, onCta: cta });

if (!ctx.showPicker && state.lang) track({ e: 'language_select', lang: state.lang, auto: 1 });
view.render(state, null);

env.whenViewable(() => {
  reporter.track('view', {}, { once: true });
});
env.onViewableChange((v) => view.setViewable(v));
view.setViewable(env.isViewable());

if (__REVIEW__) {
  installReviewHook({
    win: window,
    dispatch,
    getState: () => state,
    view,
    onEvent: (fn) => eventListeners.push(fn)
  });
}

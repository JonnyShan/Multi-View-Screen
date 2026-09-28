// Review page bridge. Compiled into the review and harness builds only; the ad build
// replaces __REVIEW__ with false and this module drops out.
//
// Commands arrive by postMessage ({ ns: 'vq-review', cmd, ... }) or as a URL hash
// for deep links, e.g. #screen=question&index=2&answered=wrong&lang=en&rtl=1&long=1

const NS = 'vq-review';

function parseHash(hash) {
  const out = {};
  String(hash || '')
    .replace(/^#/, '')
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v = ''] = pair.split('=');
      out[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  return out;
}

export function installReviewHook({ win, dispatch, getState, view, onEvent }) {
  const post = (message) => {
    try {
      if (win.parent && win.parent !== win) win.parent.postMessage(Object.assign({ ns: NS }, message), '*');
    } catch (e) {
      // no parent to talk to
    }
  };

  let fits = 0;
  onEvent((evt, sent) => post({ type: 'event', evt, sent }));
  view.onFit((result) => {
    fits += 1;
    win.__vqFit = { count: fits, result, state: getState() };
    post({ type: 'fit', result, state: getState() });
  });

  function run(cmd) {
    if (cmd.pseudo) view.setPseudo(cmd.pseudo);
    if (cmd.outline !== undefined) view.setOutline(Boolean(cmd.outline));
    if (cmd.screen) {
      dispatch({
        type: 'goto',
        screen: cmd.screen,
        lang: cmd.lang,
        index: cmd.index === undefined ? 0 : Number(cmd.index),
        answered: cmd.answered || null,
        score: cmd.score === undefined || cmd.score === null || cmd.score === '' ? null : Number(cmd.score)
      });
    }
  }

  win.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || d.ns !== NS || d.cmd !== 'set') return;
    run(d);
  });

  const hash = parseHash(win.location.hash);
  if (Object.keys(hash).length) {
    run({
      screen: hash.screen,
      lang: hash.lang,
      index: hash.index,
      answered: hash.answered,
      score: hash.score,
      pseudo: { rtl: hash.rtl === '1', long: hash.long === '1' },
      outline: hash.outline === '1'
    });
  }
  post({ type: 'ready', state: getState() });
}

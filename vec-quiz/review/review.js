// Review page: every test viewport side by side, driven from one set of controls,
// plus the copy table, what is still waiting on the client, build checks and the
// reporting event log. Self contained: the playable travels inside this file.

const data = JSON.parse(document.getElementById('vq-review-data').textContent);
const app = document.getElementById('rv');
const questions = data.quiz.questions;
const included = data.included;

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v === false || v === null || v === undefined) return;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  });
  kids.flat().forEach((kid) => {
    if (kid === null || kid === undefined || kid === false) return;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  });
  return el;
}

const STATUS = {
  ready: ['Ready', 'is-ok'],
  placeholder: ['Placeholder copy', 'is-warn'],
  invalid: ['Has errors', 'is-bad'],
  missing: ['No copy yet', '']
};

function parseHash() {
  const out = {};
  location.hash.replace(/^#/, '').split('&').filter(Boolean).forEach((pair) => {
    const [k, v = ''] = pair.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return out;
}

const fromHash = parseHash();
const state = {
  lang: included.includes(fromHash.lang) ? fromHash.lang : included[0],
  screen: ['picker', 'question', 'end'].includes(fromHash.screen) ? fromHash.screen : 'picker',
  index: Math.max(0, Math.min(questions.length - 1, Number(fromHash.index) || 0)),
  answered: ['correct', 'wrong'].includes(fromHash.answered) ? fromHash.answered : '',
  score: fromHash.score !== undefined && fromHash.score !== '' ? Number(fromHash.score) : questions.length,
  rtl: fromHash.rtl === '1',
  long: fromHash.long === '1',
  outline: fromHash.outline !== '0',
  zoom: fromHash.zoom === '100' ? '100' : 'fit',
  frames: fromHash.frames ? fromHash.frames.split(',') : data.viewports.map((v) => v.id),
  tab: fromHash.tab || 'copy'
};

function writeHash() {
  const parts = {
    lang: state.lang,
    screen: state.screen,
    index: state.index,
    answered: state.answered,
    score: state.score,
    rtl: state.rtl ? 1 : 0,
    long: state.long ? 1 : 0,
    outline: state.outline ? 1 : 0,
    zoom: state.zoom,
    frames: state.frames.join(','),
    tab: state.tab
  };
  history.replaceState(null, '', '#' + Object.entries(parts).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'));
  lastHash = location.hash;
}

let lastHash = '';

// Frames

const frames = [];

function command() {
  return {
    ns: 'vq-review',
    cmd: 'set',
    screen: state.screen,
    lang: state.lang,
    index: state.index,
    answered: state.screen === 'question' ? state.answered || null : null,
    score: state.screen === 'end' ? state.score : null,
    pseudo: { rtl: state.rtl, long: state.long },
    outline: state.outline
  };
}

function send(frame) {
  if (frame.iframe.contentWindow) frame.iframe.contentWindow.postMessage(command(), '*');
}

function broadcast() {
  writeHash();
  frames.forEach(send);
}

function frameScale(v) {
  if (state.zoom === '100') return 1;
  const maxW = v.width > v.height ? 560 : 330;
  return Math.min(1, maxW / v.width, 600 / v.height);
}

function renderFrames(container) {
  container.textContent = '';
  frames.length = 0;
  data.viewports.filter((v) => state.frames.includes(v.id)).forEach((v) => {
    const s = frameScale(v);
    const iframe = h('iframe', {
      title: `${v.label} ${v.width}x${v.height}`,
      width: v.width,
      height: v.height,
      sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox',
      style: `width:${v.width}px;height:${v.height}px;transform:scale(${s})`
    });
    iframe.srcdoc = data.playable;
    const foot = h('div', { class: 'rv-frame-foot' }, h('span', { class: 'rv-note', text: 'Rendering...' }));
    const card = h('div', { class: 'rv-frame' },
      h('div', { class: 'rv-frame-title' },
        h('strong', { text: v.label }),
        h('span', { text: `${v.width}x${v.height}${v.placement ? ' placement' : ''}` })),
      h('div', { class: 'rv-frame-box', style: `width:${Math.round(v.width * s)}px;height:${Math.round(v.height * s)}px` }, iframe),
      foot);
    frames.push({ v, iframe, foot });
    container.append(card);
  });
}

function updateFit(frame, result) {
  frame.foot.textContent = '';
  const where = `${result.screen}${result.lang ? ' / ' + result.lang : ''}`;
  if (!result.overflow.length) {
    frame.foot.append(h('span', { class: 'rv-badge is-ok', text: 'Fits' }), ' ', h('span', { class: 'rv-note', text: where + (result.scale < 1 ? ` (scaled ${Math.round(result.scale * 100)}%)` : '') }));
  } else {
    frame.foot.append(h('span', { class: 'rv-badge is-bad', text: 'Overflow' }), ' ', h('span', { class: 'rv-note', text: `${where}: ${result.overflow.join(', ')}` }));
  }
}

const eventLog = [];
let logEl = null;

function logEvent(frame, evt, sent) {
  const time = new Date().toLocaleTimeString();
  eventLog.push(`${time}  ${frame.v.label.padEnd(16)} ${sent ? 'sent    ' : 'not sent'}  ${JSON.stringify(evt)}`);
  if (eventLog.length > 300) eventLog.shift();
  if (logEl) logEl.textContent = eventLog.slice().reverse().join('\n') || 'No events yet. Play a frame.';
}

window.addEventListener('message', (ev) => {
  const d = ev.data;
  if (!d || d.ns !== 'vq-review') return;
  const frame = frames.find((f) => f.iframe.contentWindow === ev.source);
  if (!frame) return;
  if (d.type === 'ready') send(frame);
  else if (d.type === 'fit') updateFit(frame, d.result);
  else if (d.type === 'event') logEvent(frame, d.evt, d.sent);
});

// Controls

function seg(options, current, onPick) {
  return h('div', { class: 'rv-seg', role: 'group' }, options.map((o) =>
    h('button', { type: 'button', 'aria-pressed': String(o.value === current), disabled: o.disabled, title: o.title, onclick: () => onPick(o.value), text: o.label })));
}

function renderControls(panel) {
  panel.textContent = '';
  const langOptions = data.languages.map((l) => ({
    value: l.code,
    label: l.name,
    disabled: !included.includes(l.code),
    title: included.includes(l.code) ? '' : STATUS[l.status][0]
  }));
  const screenOptions = [{ value: 'picker', label: 'Picker' }]
    .concat(questions.map((q, i) => ({ value: 'q' + i, label: 'Q' + (i + 1) })))
    .concat([{ value: 'end', label: 'End' }]);
  const currentScreen = state.screen === 'question' ? 'q' + state.index : state.screen;
  const rerender = () => {
    renderControls(panel);
    broadcast();
  };
  panel.append(
    h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Language' }), seg(langOptions, state.lang, (v) => {
      state.lang = v;
      rerender();

window.addEventListener('hashchange', () => {
  const next = parseHash();
  if (location.hash === lastHash) return;
  Object.assign(state, {
    lang: included.includes(next.lang) ? next.lang : state.lang,
    screen: ['picker', 'question', 'end'].includes(next.screen) ? next.screen : state.screen,
    index: next.index !== undefined ? Math.max(0, Math.min(questions.length - 1, Number(next.index) || 0)) : state.index,
    answered: ['correct', 'wrong'].includes(next.answered) ? next.answered : '',
    score: next.score !== undefined && next.score !== '' ? Number(next.score) : state.score,
    rtl: next.rtl === '1',
    long: next.long === '1',
    frames: next.frames ? next.frames.split(',') : state.frames
  });
  app.textContent = '';
  render();
});
    })),
    h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Screen' }), seg(screenOptions, currentScreen, (v) => {
      if (v.startsWith('q')) {
        state.screen = 'question';
        state.index = Number(v.slice(1));
      } else state.screen = v;
      rerender();
    }))
  );
  if (state.screen === 'question') {
    panel.append(h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Answer' }), seg([
      { value: '', label: 'Not answered' },
      { value: 'correct', label: 'Answered right' },
      { value: 'wrong', label: 'Answered wrong' }
    ], state.answered, (v) => {
      state.answered = v;
      rerender();
    })));
  }
  if (state.screen === 'end') {
    panel.append(h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Score' }),
      seg(questions.map((q, i) => i).concat([questions.length]).map((n) => ({ value: n, label: `${n}/${questions.length}` })), state.score, (v) => {
        state.score = v;
        rerender();
      })));
  }
  const toggle = (key, label, title) => h('label', { class: 'rv-check', title },
    h('input', { type: 'checkbox', checked: state[key], onchange: (e) => {
      state[key] = e.target.checked;
      broadcast();
    } }), label);
  panel.append(h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Test modes' }),
    toggle('rtl', 'RTL mirror', 'Flip the current language right to left to check the Arabic layout before Arabic copy arrives'),
    toggle('long', 'Max length copy', 'Pad every string to its character limit'),
    toggle('outline', 'Outline overflow', 'Dashed red outline on any text that does not fit')));
  panel.append(h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Frames' }),
    h('div', { class: 'rv-seg' }, data.viewports.map((v) => h('button', {
      type: 'button',
      'aria-pressed': String(state.frames.includes(v.id)),
      title: `${v.width}x${v.height}`,
      onclick: () => {
        state.frames = state.frames.includes(v.id) ? state.frames.filter((f) => f !== v.id) : state.frames.concat([v.id]);
        renderControls(panel);
        renderFrames(document.getElementById('rv-frames'));
        writeHash();
      },
      text: v.label
    }))),
    seg([{ value: 'fit', label: 'Fit' }, { value: '100', label: '100%' }], state.zoom, (v) => {
      state.zoom = v;
      renderControls(panel);
      renderFrames(document.getElementById('rv-frames'));
      writeHash();
    })));
}

// Tabs

function copyTable() {
  const langs = data.languages;
  const table = h('table', { class: 'rv-table' },
    h('thead', {}, h('tr', {}, h('th', { text: 'Key' }), h('th', { text: 'Limit' }), langs.map((l) => h('th', {}, `${l.name} `, h('span', { class: `rv-badge ${STATUS[l.status][1]}`, text: STATUS[l.status][0] }))))));
  const body = h('tbody');
  data.expected.forEach((rule) => {
    const tr = h('tr', {}, h('td', { class: 'rv-key', text: rule.key }), h('td', { text: String(rule.max) }));
    langs.forEach((l) => {
      const row = (l.rows || []).find((r) => r.key === rule.key);
      if (!row || !row.text) {
        tr.append(h('td', { class: 'is-missing', text: l.status === 'missing' ? '' : rule.required ? 'missing' : 'optional, empty' }));
        return;
      }
      const cls = row.level === 'error' ? 'is-bad' : row.level === 'warning' ? 'is-warn' : '';
      tr.append(h('td', { class: cls, dir: l.profile.dir || 'auto', lang: l.profile.htmlLang || undefined },
        h('span', { class: 'rv-cell-text', text: row.text }),
        h('span', { class: 'rv-cell-count', dir: 'ltr', text: `${row.count}/${row.max}${row.placeholder ? ' placeholder' : ''}` })));
    });
    body.append(tr);
  });
  table.append(body);
  return h('div', { class: 'rv-scroll' }, table);
}

function waitingList() {
  const wrap = h('div');
  wrap.append(h('p', { class: 'rv-note', text: 'Empty values in config/client.json and languages without copy. Each stays empty until the client supplies it; nothing here is guessed.' }));
  wrap.append(h('h3', { text: 'Client details' }), h('ul', { class: 'rv-list' }, data.gaps.map((g) =>
    h('li', {}, h('span', { class: 'rv-key', text: g.path }), g.note ? h('div', { class: 'rv-note', text: g.note }) : null))));
  wrap.append(h('h3', { text: 'Languages' }), h('ul', { class: 'rv-list' }, data.languages.map((l) =>
    h('li', {}, `${l.name}: `, h('span', { class: `rv-badge ${STATUS[l.status][1]}`, text: STATUS[l.status][0] }),
      l.pending ? h('div', { class: 'rv-note', text: l.pending }) : null,
      l.issues.filter((i) => i.level === 'error').slice(0, 6).map((i) => h('div', { class: 'rv-note', text: i.message }))))));
  if (data.blockers.length) {
    wrap.append(h('h3', { text: 'Release blockers' }), h('ul', { class: 'rv-list' }, data.blockers.map((b) => h('li', { text: b }))));
  }
  return wrap;
}

function checksList() {
  const wrap = h('div');
  const level = { pass: 'is-ok', info: '', warning: 'is-warn', error: 'is-bad' };
  wrap.append(h('h3', { text: 'Ad package guard' }), h('table', { class: 'rv-table' }, h('tbody', {}, data.guard.map((r) =>
    h('tr', {}, h('td', {}, h('span', { class: `rv-badge ${level[r.level]}`, text: r.level })), h('td', { text: r.message }))))));
  wrap.append(h('h3', { text: 'Fonts (subset per language, inlined as WOFF2)' }), h('table', { class: 'rv-table' },
    h('thead', {}, h('tr', {}, ['Family', 'Weight', 'Characters', 'WOFF2', 'Used by'].map((t) => h('th', { text: t })))),
    h('tbody', {}, data.fonts.map((f) => h('tr', {}, h('td', { text: f.family }), h('td', { text: f.weight }), h('td', { text: String(f.chars) }), h('td', { text: f.size }), h('td', { text: f.langs.join(', ') }))))));
  wrap.append(h('h3', { text: 'Files' }), h('table', { class: 'rv-table' }, h('tbody', {}, data.files.map((f) =>
    h('tr', {}, h('td', { class: 'rv-key', text: f.name }), h('td', { text: f.size }), h('td', { class: 'rv-note', text: f.note || '' }))))));
  return wrap;
}

function eventsPanel() {
  logEl = h('pre', { class: 'rv-log' });
  logEl.textContent = eventLog.slice().reverse().join('\n') || 'No events yet. Play a frame.';
  return h('div', {},
    h('p', { class: 'rv-note', text: data.reportingEnabled
      ? 'Reporting is enabled: events are also sent to ' + data.reportingEndpoint
      : 'Reporting ships disabled: events below are recorded locally only and nothing leaves the creative.' }),
    logEl);
}

function renderTabs(panel) {
  panel.textContent = '';
  const tabs = [
    ['copy', 'Copy'],
    ['waiting', `Waiting on client (${data.gaps.length})`],
    ['checks', 'Build checks'],
    ['events', 'Events']
  ];
  const body = h('div');
  panel.append(h('div', { class: 'rv-tabs', role: 'tablist' }, tabs.map(([id, label]) => h('button', {
    type: 'button',
    role: 'tab',
    'aria-selected': String(state.tab === id),
    onclick: () => {
      state.tab = id;
      writeHash();
      renderTabs(panel);
    },
    text: label
  }))), body);
  logEl = null;
  if (state.tab === 'copy') body.append(copyTable());
  else if (state.tab === 'waiting') body.append(waitingList());
  else if (state.tab === 'checks') body.append(checksList());
  else body.append(eventsPanel());
}

// Page

function render() {
  const b = data.build;
  const buildBadge = data.release ? h('span', { class: 'rv-badge is-ok', text: 'Release build' }) : h('span', { class: 'rv-badge is-warn', text: 'Dev build' });
  app.append(
    h('header', { class: 'rv-head' },
      h('h1', { text: 'VEC quiz playable review' }),
      h('span', { class: 'rv-meta', text: `v${b.version} | content ${b.hash} | ${included.length} of ${data.languages.length} languages playable` }),
      buildBadge,
      data.placeholder ? h('span', { class: 'rv-badge is-warn', text: 'Placeholder copy' }) : null),
    h('div', { class: 'rv-panel' }, h('div', { class: 'rv-langs' }, data.languages.map((l) =>
      h('span', { class: `rv-badge ${STATUS[l.status][1]}`, title: STATUS[l.status][0] }, `${l.name}: ${STATUS[l.status][0]}`)))));
  const controls = h('div', { class: 'rv-panel' });
  app.append(controls);
  const framesEl = h('div', { class: 'rv-frames', id: 'rv-frames' });
  app.append(framesEl);
  const tabs = h('div', { class: 'rv-panel' });
  app.append(tabs);
  renderControls(controls);
  renderFrames(framesEl);
  renderTabs(tabs);
  writeHash();
}

render();

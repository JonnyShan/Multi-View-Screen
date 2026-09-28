// MRAID harness: runs the MRAID build of the playable against a mock MRAID 3.0 host.
// By default the host fires ready after 300 ms and viewable after 700 ms, like a real
// SDK. Add ?manual=1 to drive every host event by hand. window.__harness exposes the
// log and a send() function for automated QA.

const data = JSON.parse(document.getElementById('vq-harness-data').textContent);
const app = document.getElementById('hx');
const params = new URLSearchParams(location.search);

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

const harness = {
  log: [],
  auto: params.get('manual') !== '1',
  viewport: data.viewports.find((v) => v.id === params.get('viewport')) || data.viewports[0],
  clickUrl: params.get('click') || '',
  viewable: false,
  send: null
};
window.__harness = harness;

let iframe = null;
let logEl = null;
let timers = [];

function log(kind, text) {
  const entry = { t: Math.round(performance.now()), kind, text };
  harness.log.push(entry);
  if (logEl) logEl.textContent = harness.log.slice().reverse().map((e) => `${String(e.t).padStart(6)} ms  ${e.kind.padEnd(6)} ${e.text}`).join('\n');
}

function send(cmd, value) {
  if (!iframe || !iframe.contentWindow) return;
  if (cmd === 'viewable') harness.viewable = Boolean(value);
  log('host', `${cmd}${value === undefined ? '' : ' ' + JSON.stringify(value)}`);
  iframe.contentWindow.postMessage({ ns: 'vq-mraid-host', cmd, value }, '*');
}
harness.send = send;

function playableHtml() {
  // Simulates the ad server writing its click URL into clickTag at serve time.
  if (!harness.clickUrl) return data.playable;
  return data.playable.replace(/var clickTag = "[^"]*";/, () => `var clickTag = ${JSON.stringify(harness.clickUrl)};`);
}

function load(frameBox) {
  timers.forEach(clearTimeout);
  timers = [];
  harness.viewable = false;
  frameBox.textContent = '';
  const v = harness.viewport;
  iframe = h('iframe', {
    title: 'Playable under the mock MRAID host',
    width: v.width,
    height: v.height,
    sandbox: 'allow-scripts allow-popups',
    style: `width:${v.width}px;height:${v.height}px;border:0;display:block`
  });
  iframe.srcdoc = playableHtml();
  frameBox.style.width = v.width + 'px';
  frameBox.style.height = v.height + 'px';
  frameBox.append(iframe);
  log('host', `load ${v.width}x${v.height}${harness.auto ? ' (auto: ready at 300 ms, viewable at 700 ms)' : ' (manual)'}`);
}

window.addEventListener('message', (ev) => {
  if (!iframe || ev.source !== iframe.contentWindow) return;
  const d = ev.data || {};
  if (d.ns === 'vq-mraid') {
    if (d.type === 'loaded' && harness.auto) {
      timers.push(setTimeout(() => send('ready'), 300));
      timers.push(setTimeout(() => send('viewable', true), 700));
    } else if (d.type === 'call') {
      log('mraid', `${d.call}(${d.args.map((a) => JSON.stringify(a)).join(', ')})`);
    } else if (d.type === 'error') {
      log('error', d.message);
    }
  } else if (d.ns === 'vq-review' && d.type === 'event') {
    log('event', `${JSON.stringify(d.evt)}${d.sent ? ' (sent)' : ' (reporting disabled, not sent)'}`);
  }
});

function render() {
  const frameBox = h('div', { class: 'rv-frame-box' });
  const clickInput = h('input', { type: 'url', value: harness.clickUrl, placeholder: 'https://example.com/click-test', size: 34 });
  app.append(
    h('header', { class: 'rv-head' },
      h('h1', { text: 'MRAID harness' }),
      h('span', { class: 'rv-meta', text: `v${data.build.version} | content ${data.build.hash} | mock MRAID 3.0 host` })),
    h('div', { class: 'rv-frames' },
      h('div', { class: 'rv-frame' }, frameBox),
      h('div', { class: 'rv-panel', style: 'flex:1;min-width:300px' },
        h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Host' }),
          h('button', { class: 'rv-btn', type: 'button', onclick: () => send('ready'), text: 'Fire ready' }),
          h('button', { class: 'rv-btn', type: 'button', onclick: () => send('viewable', !harness.viewable), text: 'Toggle viewable' }),
          h('button', { class: 'rv-btn', type: 'button', onclick: () => send('state', 'hidden'), text: 'Hide' }),
          h('button', { class: 'rv-btn', type: 'button', onclick: () => send('state', 'default'), text: 'Show' })),
        h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Exposure' }),
          h('input', { type: 'range', min: 0, max: 100, value: 100, onchange: (e) => send('exposure', Number(e.target.value)) })),
        h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Viewport' }),
          h('div', { class: 'rv-seg' }, data.viewports.map((v) => h('button', {
            type: 'button',
            'aria-pressed': String(v.id === harness.viewport.id),
            onclick: () => {
              harness.viewport = v;
              app.textContent = '';
              render();
            },
            text: `${v.width}x${v.height}`
          })))),
        h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Click URL' }), clickInput,
          h('button', { class: 'rv-btn', type: 'button', onclick: () => {
            harness.clickUrl = clickInput.value.trim();
            load(frameBox);
          }, text: 'Apply and reload' })),
        h('div', { class: 'rv-row' }, h('span', { class: 'rv-label', text: 'Mode' }),
          h('label', { class: 'rv-check' }, h('input', { type: 'checkbox', checked: harness.auto, onchange: (e) => {
            harness.auto = e.target.checked;
          } }), 'Auto ready and viewable'),
          h('button', { class: 'rv-btn', type: 'button', onclick: () => load(frameBox), text: 'Reload' })),
        h('p', { class: 'rv-note', text: 'Click URL simulates the ad server writing its click through into clickTag. Leave it empty to see the build exactly as configured (cta.url is empty until the client supplies it).' }),
        (logEl = h('pre', { class: 'rv-log' })))));
  load(frameBox);
}

render();

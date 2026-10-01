// Phone test mode (?debug=1): a small live readout of frame rate and resolution, and a "Send debug report" button
// that posts what this device measured (frame times per screen, GPU, load time, errors, sound and share results)
// to the leaderboard server's /report, where they can be read back from the database.
// Loaded only with ?debug=1, so normal players never download it.
import { BRAND, QUALITY } from './config.js';

const T0 = performance.now();
const now = () => Math.round(performance.now());
const cap = (list, max, item) => { if (list.length < max) list.push(item); };
const clip = (s, n = 300) => String(s).slice(0, n);

const errors = [], events = [], net = [], shares = [];
const frames = {}; // state -> { ms: [], cpu: [] }
const dprSamples = [];
const peak = { calls: 0, tris: 0, geometries: 0, textures: 0, programs: 0 }; // calls and tris: the busiest riding frame
let readyAt = null, lastState = null, feel = null;

// ------------------------------------------------------------------ capture
function hookErrors() {
  addEventListener('error', (e) => {
    const el = e.target;
    if (el && el !== window && (el.src || el.href)) cap(errors, 30, { t: now(), kind: 'resource', src: clip(el.src || el.href, 160) });
    else cap(errors, 30, { t: now(), kind: 'error', msg: clip(e.message), at: clip(`${e.filename || ''}:${e.lineno || ''}`, 160) });
  }, true);
  addEventListener('unhandledrejection', (e) => cap(errors, 30, { t: now(), kind: 'promise', msg: clip(e.reason && (e.reason.stack || e.reason.message) || e.reason) }));
  for (const level of ['error', 'warn']) {
    const orig = console[level].bind(console);
    console[level] = (...a) => { cap(errors, 30, { t: now(), kind: level, msg: clip(a.map(x => (x && x.stack) || (typeof x === 'object' ? safeJson(x) : x)).join(' ')) }); orig(...a); };
  }
}
const safeJson = (x) => { try { return JSON.stringify(x); } catch { return String(x); } };

// every request that leaves the site (leaderboard, analytics): status and time taken
function hookNet() {
  const orig = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const u = typeof input === 'string' ? input : input.url;
    if (u.startsWith(location.origin) || !/^https?:/.test(u)) return orig(input, init);
    const t = performance.now(), short = clip(u.replace(/^https?:\/\//, '').split('?')[0], 120), m = (init && init.method) || 'GET';
    return orig(input, init).then(
      (r) => { cap(net, 40, { t: now(), m, u: short, s: r.status, ms: Math.round(performance.now() - t) }); return r; },
      (e) => { cap(net, 40, { t: now(), m, u: short, s: 'failed', err: clip(e && e.name, 40), ms: Math.round(performance.now() - t) }); throw e; });
  };
}

// the share sheet: whether it opened, and how it ended
function hookShare() {
  if (!navigator.share) return;
  const orig = navigator.share.bind(navigator);
  navigator.share = (data) => {
    const rec = { t: now(), files: !!(data && data.files && data.files.length), result: 'open' };
    cap(shares, 10, rec);
    return orig(data).then((v) => { rec.result = 'shared'; return v; }, (e) => { rec.result = (e && e.name) || 'error'; throw e; });
  };
}

const ev = (...a) => cap(events, 120, [now(), ...a]);
function hookPage() {
  document.addEventListener('visibilitychange', () => ev('visible', document.visibilityState));
  addEventListener('orientationchange', () => ev('orientation', screen.orientation ? screen.orientation.type : orientation));
  addEventListener('resize', () => ev('resize', innerWidth, innerHeight));
  addEventListener('pagehide', () => ev('pagehide'));
}

// ------------------------------------------------------------------ frame timing
function wrapLoop(game) {
  // the game's loop re-reads this.loop for its next frame, so wrapping the property times every frame's JavaScript
  // three.js clears its draw counts on every render call and the post-processing passes come last, so count the
  // whole frame here instead
  const info = game.renderer.info;
  info.autoReset = false;
  const orig = game.loop;
  game.loop = (t) => {
    info.reset();
    const a = performance.now();
    orig(t);
    const s = game.paused ? 'paused' : game.state;
    bucket(s).cpu.push(performance.now() - a);
    if (s === 'race') { peak.calls = Math.max(peak.calls, info.render.calls); peak.tris = Math.max(peak.tris, info.render.triangles); }
  };
}
const bucket = (s) => frames[s] || (frames[s] = { ms: [], cpu: [] });

function hookGame(game) {
  wrapLoop(game);
  const gl = game.renderer.getContext();
  game.renderer.domElement.addEventListener('webglcontextlost', () => ev('webgl', 'context lost'));
  game.renderer.domElement.addEventListener('webglcontextrestored', () => ev('webgl', 'context restored'));
  let last = null, sampleT = 0;
  const tick = (t) => {
    requestAnimationFrame(tick);
    const s = game.paused ? 'paused' : game.state;
    if (s !== lastState) {
      ev('state', s);
      if (readyAt == null && s !== 'loading') readyAt = now();
      lastState = s; last = null; // a frame across a state change belongs to neither
    }
    if (last != null && document.visibilityState === 'visible') {
      const b = bucket(s);
      if (b.ms.length < 20000) b.ms.push(t - last);
    }
    last = t;
    if (t - sampleT > 2000) {
      sampleT = t;
      const r = game.renderer, info = r.info;
      if (s === 'race') cap(dprSamples, 200, +r.getPixelRatio().toFixed(2));
      peak.geometries = Math.max(peak.geometries, info.memory.geometries);
      peak.textures = Math.max(peak.textures, info.memory.textures);
      peak.programs = Math.max(peak.programs, info.programs ? info.programs.length : 0);
    }
  };
  requestAnimationFrame(tick);
  return gl;
}

// ------------------------------------------------------------------ numbers
const pct = (sorted, p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0;
const r1 = (v) => Math.round(v * 10) / 10;
function stats(b) {
  const ms = b.ms.slice().sort((x, y) => x - y), cpu = b.cpu.slice().sort((x, y) => x - y);
  const total = ms.reduce((a, v) => a + v, 0);
  return {
    frames: ms.length,
    seconds: r1(total / 1000),
    fps: ms.length ? r1(1000 * ms.length / total) : 0,
    p50: r1(pct(ms, 0.5)), p95: r1(pct(ms, 0.95)), p99: r1(pct(ms, 0.99)), worst: r1(ms[ms.length - 1] || 0),
    over33: ms.length ? r1(100 * ms.filter(v => v > 34).length / ms.length) : 0, // % of frames slower than 30 fps
    over50: ms.filter(v => v > 50).length,                                    // visible hitches
    cpu50: r1(pct(cpu, 0.5)), cpu95: r1(pct(cpu, 0.95)),                       // the game's own JavaScript per frame
  };
}

function gpuInfo(gl) {
  if (!gl) return null;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  return {
    vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    webgl2,
    maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    samples: webgl2 ? gl.getParameter(gl.MAX_SAMPLES) : 0,
  };
}

function loadInfo() {
  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const kb = Math.round(res.reduce((a, e) => a + (e.transferSize || 0), 0) / 1024);
  const slow = res.slice().sort((a, b) => b.duration - a.duration).slice(0, 6)
    .map(e => ({ u: clip(e.name.split('/').slice(-2).join('/').split('?')[0], 60), ms: Math.round(e.duration), kb: Math.round((e.transferSize || 0) / 1024) }));
  return {
    ready: readyAt, // ms from opening the page to the first screen after loading
    dom: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    started: Math.round(T0),
    files: res.length, kb, slow,
  };
}

let gl = null;
function report(note) {
  const game = window.__game, r = game && game.renderer;
  const perf = {};
  for (const [s, b] of Object.entries(frames)) if (b.ms.length > 10) perf[s] = stats(b);
  const ctx = game && game.audio && game.audio.ctx;
  let canShareFiles = null;
  try { canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })); } catch { canShareFiles = false; }
  const fatal = document.getElementById('fatal');
  return {
    v: 1, feel, note: clip(note || '', 500),
    page: location.pathname + location.search,
    device: {
      ua: navigator.userAgent,
      platform: (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform,
      touch: navigator.maxTouchPoints || 0,
      screen: [screen.width, screen.height], view: [innerWidth, innerHeight], dpr: devicePixelRatio,
      cores: navigator.hardwareConcurrency || null, memGB: navigator.deviceMemory || null,
      net: navigator.connection ? navigator.connection.effectiveType : null,
      homeScreen: matchMedia('(display-mode: standalone)').matches || !!navigator.standalone,
    },
    gpu: gpuInfo(gl),
    quality: { tier: QUALITY.tier, mobile: QUALITY.mobile, maxDpr: QUALITY.maxDpr, minDpr: QUALITY.minDpr, settings: game && game.settings },
    load: loadInfo(),
    perf,
    dpr: dprSamples.length ? { min: Math.min(...dprSamples), max: Math.max(...dprSamples), last: dprSamples[dprSamples.length - 1], n: dprSamples.length } : (r ? { last: +r.getPixelRatio().toFixed(2) } : null),
    render: peak,
    heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
    audio: ctx ? { state: ctx.state, rate: ctx.sampleRate, latency: ctx.baseLatency != null ? r1(ctx.baseLatency * 1000) : null, session: navigator.audioSession ? navigator.audioSession.type : 'none', voice: !!game.audio.voice } : { state: 'not started' },
    share: { canShareFiles, calls: shares },
    lap: game && game.result ? { t: game.result.t, medal: game.result.medal } : null,
    net, errors, events,
    fatal: fatal && fatal.textContent ? clip(fatal.textContent) : null,
    t: now(),
  };
}

async function send(note) {
  const base = BRAND.leaderboard && BRAND.leaderboard.url; // the same server as the worldwide leaderboard
  if (!base) throw new Error('no server set');
  const r = await fetch(base.replace(/\/$/, '') + '/report', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ game: BRAND.id, report: report(note) }),
  });
  if (!r.ok) throw new Error('server said ' + r.status);
  return (await r.json()).id;
}

// ------------------------------------------------------------------ on screen
const CSS = `
#dbgHud{position:fixed;top:calc(env(safe-area-inset-top,0px) + 4px);left:50%;transform:translateX(-50%);z-index:60;pointer-events:none;
  font:600 11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#fff;background:rgba(0,0,0,.66);padding:3px 8px;border-radius:4px;white-space:nowrap;text-align:center}
#dbgHud b{color:#CBFE00;font-weight:700}
#dbgHud .bad{color:#ff6b6b}
#dbgBtn{position:fixed;left:calc(env(safe-area-inset-left,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:61;
  font:700 13px/1 system-ui,sans-serif;color:#111;background:#CBFE00;border:0;border-radius:6px;padding:10px 12px}
#dbgPanel{position:fixed;left:calc(env(safe-area-inset-left,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:62;width:min(320px,calc(100vw - 20px));
  font:14px/1.4 system-ui,sans-serif;color:#fff;background:rgba(20,20,20,.96);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:12px;display:grid;gap:10px}
#dbgPanel h4{margin:0;font-size:14px}
#dbgPanel .row{display:flex;gap:6px}
#dbgPanel .row button{flex:1;padding:9px 0;border-radius:6px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font:600 13px system-ui,sans-serif}
#dbgPanel .row button.on{background:#CBFE00;color:#111;border-color:#CBFE00}
#dbgPanel textarea{width:100%;box-sizing:border-box;min-height:54px;border-radius:6px;border:1px solid rgba(255,255,255,.3);background:#000;color:#fff;font:14px system-ui,sans-serif;padding:6px}
#dbgPanel .go{padding:11px 0;border-radius:6px;border:0;background:#CBFE00;color:#111;font:700 14px system-ui,sans-serif}
#dbgPanel .go:disabled{opacity:.5}
#dbgPanel .msg{font-size:13px;opacity:.85}
#dbgPanel .x{position:absolute;right:6px;top:4px;background:none;border:0;color:#fff;font-size:20px;padding:4px 8px}
[data-dbg-hide]{display:none!important}`;

function buildUi(game) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const hud = document.createElement('div'); hud.id = 'dbgHud'; document.body.appendChild(hud);
  const btn = document.createElement('button'); btn.id = 'dbgBtn'; btn.textContent = 'Send debug report'; document.body.appendChild(btn);
  const panel = document.createElement('div'); panel.id = 'dbgPanel'; panel.dataset.dbgHide = '';
  panel.innerHTML = `<button class="x" aria-label="Close">×</button><h4>How did it feel?</h4>
    <div class="row"><button data-f="smooth">Smooth</button><button data-f="ok">OK</button><button data-f="choppy">Choppy</button></div>
    <textarea placeholder="Anything wrong? (optional) e.g. no sound, share didn't open"></textarea>
    <button class="go">Send report</button><div class="msg"></div>`;
  document.body.appendChild(panel);
  const note = panel.querySelector('textarea'), go = panel.querySelector('.go'), msg = panel.querySelector('.msg');
  // keep the game's keyboard controls out of the text box, and taps on the panel from reaching the game
  for (const k of ['keydown', 'keyup']) panel.addEventListener(k, (e) => e.stopPropagation());
  for (const k of ['pointerdown', 'touchstart']) { panel.addEventListener(k, (e) => e.stopPropagation()); btn.addEventListener(k, (e) => e.stopPropagation()); }
  panel.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
    feel = b.dataset.f;
    panel.querySelectorAll('[data-f]').forEach(o => o.classList.toggle('on', o === b));
  }));
  const open = (on) => { if (on) panel.removeAttribute('data-dbg-hide'); else panel.dataset.dbgHide = ''; };
  btn.addEventListener('click', () => { open(true); msg.textContent = ''; });
  panel.querySelector('.x').addEventListener('click', () => open(false));
  go.addEventListener('click', () => {
    go.disabled = true; msg.textContent = 'Sending…';
    send(note.value).then(
      (id) => { msg.textContent = `Sent. Report #${id}. Thank you!`; note.value = ''; },
      (e) => { msg.textContent = `Couldn't send (${e.message}). Check the connection and try again.`; })
      .finally(() => { go.disabled = false; });
  });

  // live readout, twice a second
  let n = 0, sum = 0, cpuSum = 0, lastT = null;
  const read = (t) => {
    requestAnimationFrame(read);
    if (lastT != null) { n++; sum += t - lastT; }
    lastT = t;
  };
  requestAnimationFrame(read);
  setInterval(() => {
    const s = game.paused ? 'paused' : game.state;
    const b = frames[s], cpu = b && b.cpu.length ? b.cpu.slice(-30) : [];
    cpuSum = cpu.reduce((a, v) => a + v, 0) / (cpu.length || 1);
    const fps = n ? 1000 * n / sum : 0;
    n = 0; sum = 0;
    const dpr = game.renderer.getPixelRatio().toFixed(2);
    hud.innerHTML = `<b class="${fps < 40 ? 'bad' : ''}">${fps.toFixed(0)} fps</b> · js ${cpuSum.toFixed(1)} ms · res ${dpr}× · ${QUALITY.tier} · ${s}` +
      (errors.length ? ` · <span class="bad">${errors.length} err</span>` : '');
    // the report button stays out of the way while riding
    const riding = ['intro', 'countdown', 'race', 'finish'].includes(game.state) && !game.paused;
    if (riding) { btn.dataset.dbgHide = ''; open(false); } else btn.removeAttribute('data-dbg-hide');
  }, 500);
}

export function start() {
  hookErrors();
  hookNet();
  hookShare();
  hookPage();
  ev('debug', 'on');
  const wait = () => {
    const game = window.__game;
    if (!game || !game.renderer) { setTimeout(wait, 50); return; }
    gl = hookGame(game);
    const ui = () => (document.body ? buildUi(game) : setTimeout(ui, 50));
    ui();
  };
  wait();
}

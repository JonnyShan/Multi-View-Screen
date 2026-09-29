// Procedural prototype-class race bike + rider. Local space: +z forward, +y up, +x = rider's left.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { BRAND } from './config.js';
import * as TX from './textures.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// Optional scanned/generated bike body (assets/bike-ai.glb). When set, it replaces the procedural bike; the
// procedural rider stays and is fitted to its seat, clip-ons and pegs. Numbers were measured from the model.
let AI_BIKE = null;
const AI = {
  scale: 1.073, xMid: 0.006, yGround: -0.4987,               // model units: length on x (front = -x), up on y
  wheels: [                                                   // wheel centres in model units, radius to cut
    { cx: -0.656, cy: -0.209, r: 0.335, bodyZ: 0.7, key: 'frontWheel' },
    { cx: 0.668, cy: -0.214, r: 0.335, bodyZ: -0.72, key: 'rearWheel' },
  ],
  hub: 0.085,                                                 // |z| half-width of tyre + rim + discs
  grip: { l: V(0.28, 0.785, 0.49), r: V(-0.28, 0.785, 0.49) },
  pegs: { l: V(0.18, 0.41, -0.33), r: V(-0.18, 0.41, -0.33) },
  hipDy: -0.1, hipDz: 0,
  exhaustTip: V(0, 0.32, -1.05),
};
export function setBikeAsset(scene) { AI_BIKE = scene ? { scene, split: null } : null; }
let AI_RIDER = null;
export function setRiderAsset(scene) { AI_RIDER = scene || null; }

// Split the single generated mesh into body + two wheels (so the wheels can spin), once.
function splitAIBike() {
  if (AI_BIKE.split) return AI_BIKE.split;
  let mesh = null;
  AI_BIKE.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; });
  const g = mesh.geometry, pos = g.attributes.position;
  const idx = g.index ? g.index.array : [...Array(pos.count).keys()];
  const lists = [[], [], []];
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const x = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3, y = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3, z = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
    let k = 0;
    AI.wheels.forEach((w, i) => { if (Math.abs(z) < AI.hub && (x - w.cx) ** 2 + (y - w.cy) ** 2 < w.r * w.r) k = i + 1; });
    lists[k].push(a, b, c);
  }
  const part = (list) => {
    const pg = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(g.attributes)) pg.setAttribute(name, attr);
    pg.setIndex(list);
    pg.computeBoundingSphere();
    return pg;
  };
  const mat = mesh.material;
  mat.side = THREE.DoubleSide;
  AI_BIKE.split = { body: part(lists[0]), wheels: [part(lists[1]), part(lists[2])], mat };
  return AI_BIKE.split;
}
const XA = V(1, 0, 0), ZA = V(0, 0, 1);
const TAU = Math.PI * 2;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const COND = '"Barlow Condensed", "Arial Narrow", sans-serif';

// ------------------------------------------------------------------ canvas helpers
const texCache = new Map();
const cached = (k, f) => { if (!texCache.has(k)) texCache.set(k, f()); return texCache.get(k); };
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function canvasTex(c, { srgb = true, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const grey = (v) => `rgb(${v | 0},${v | 0},${v | 0})`;

// 2x2 twill carbon weave (tile = 8 tows); used as colour + bump.
function carbonTex() {
  const S = 256, N = 8, cs = S / N;
  const [c, g] = mkCanvas(S, S);
  const r = rng(7);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const warp = ((i + j) & 3) < 2, x = i * cs, y = j * cs;
    const gr = warp ? g.createLinearGradient(x, 0, x + cs, 0) : g.createLinearGradient(0, y, 0, y + cs);
    const hi = warp ? 70 : 38;
    gr.addColorStop(0, grey(9)); gr.addColorStop(0.5, grey(hi)); gr.addColorStop(1, grey(9));
    g.fillStyle = gr; g.fillRect(x, y, cs, cs);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let k = 0; k < 7; k++) { const o = r() * cs; if (warp) g.fillRect(x + o, y, 1, cs); else g.fillRect(x, y + o, cs, 1); }
  }
  return canvasTex(c, { repeat: true });
}

// Slick tyre: scrubbed crown + generic sidewall markings (v runs bead(-x) -> crown -> bead(+x)).
const TYRE = { rc: 0.25, Ro: 0.3, d: 0.72 };
TYRE.Psi = Math.PI / 2 + TYRE.d;
function tyreTex() {
  const W = 2048, H = 256;
  const [c, g] = mkCanvas(W, H);
  const r = rng(3);
  g.fillStyle = '#1c1b1a'; g.fillRect(0, 0, W, H);
  const vOf = (psi) => (psi + TYRE.Psi) / (2 * TYRE.Psi);
  const Y = (v) => (1 - v) * H;
  // scrubbed crown band
  const y0 = Y(vOf(1.25)), y1 = Y(vOf(-1.25));
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, 'rgba(60,56,52,0)'); gr.addColorStop(0.2, 'rgba(60,56,52,0.55)'); gr.addColorStop(0.5, 'rgba(70,66,60,0.7)'); gr.addColorStop(0.8, 'rgba(60,56,52,0.55)'); gr.addColorStop(1, 'rgba(60,56,52,0)');
  g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,86,80,0.25)' : 'rgba(10,10,10,0.3)'; g.fillRect(r() * W, y0 + r() * (y1 - y0), 20 + r() * 90, 1); }
  // sidewall text bands
  for (const side of [1, -1]) {
    const vm = vOf(side * (Math.PI / 2 + TYRE.d * 0.5));
    const yc = Y(vm), th = Math.abs(Y(vOf(side * (Math.PI / 2 + TYRE.d * 0.85))) - Y(vOf(side * (Math.PI / 2 + TYRE.d * 0.15))));
    g.save();
    // letter tops face the tread on both sidewalls (v runs inward on the +x side, outward on the -x side)
    if (side > 0) { g.translate(W, yc); g.scale(-1, -1); } else g.translate(W * 0.17, yc);
    g.font = `700 ${th * 0.62}px ${COND}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let k = 0; k < 3; k++) {
      const x = (k + 0.5) / 3 * W;
      g.fillStyle = 'rgba(205,200,190,0.82)';
      g.fillText('SLICK', x - W * 0.07, 0);
      g.fillStyle = BRAND.cream;
      g.fillText('SOFT', x + W * 0.07, 0);
      g.fillRect(x + W * 0.1, -th * 0.18, W * 0.05, th * 0.36);   // compound marker
      g.fillStyle = 'rgba(205,200,190,0.5)';
      g.fillRect(x - W * 0.16, -1, W * 0.04, 2); g.fillRect(x + W * 0.16, -1, W * 0.02, 2);
    }
    g.restore();
  }
  return canvasTex(c);
}

function radiatorTex() {
  const [c, g] = mkCanvas(256, 256);
  g.fillStyle = '#1e1f21'; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 3) { g.fillStyle = '#44464a'; g.fillRect(x, 0, 1, 256); }
  for (let y = 10; y < 256; y += 26) { g.fillStyle = '#101011'; g.fillRect(0, y, 256, 5); }
  g.strokeStyle = '#0b0b0b'; g.lineWidth = 16; g.strokeRect(0, 0, 256, 256);
  return canvasTex(c);
}

function heatTex() {
  const [c, g] = mkCanvas(4, 256);
  const gr = g.createLinearGradient(0, 256, 0, 0); // bottom = v0 = header end
  gr.addColorStop(0, '#4b4585'); gr.addColorStop(0.12, '#6c5a9a'); gr.addColorStop(0.24, '#b48f58'); gr.addColorStop(0.4, '#a9a7a8'); gr.addColorStop(1, '#b8b9bf');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  return canvasTex(c);
}

// Full-face helmet paint in sphere UVs (u: 0 right, .25 face, .5 left, .75 back; canvas y = polar angle).
function helmetTex() {
  const W = 1024, H = 512, PI = Math.PI;
  const [c, g] = mkCanvas(W, H);
  const X = (u) => u * W, Y = (th) => th / PI * H;
  const both = (pts, fill) => {
    g.fillStyle = fill;
    for (const side of [1, -1]) for (const wrap of [-1, 0, 1]) {
      g.beginPath();
      pts.forEach(([s, th], i) => { const x = X(0.25 + side * s + wrap), y = Y(th * PI); i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.closePath(); g.fill();
    }
  };
  g.fillStyle = BRAND.cream; g.fillRect(0, 0, W, H);
  // crown
  g.fillStyle = BRAND.red; g.fillRect(0, 0, W, Y(0.2 * PI));
  // side flash sweeping up and back, with gold edge
  both([[0.03, 0.66], [0.16, 0.6], [0.3, 0.44], [0.42, 0.3], [0.5, 0.25], [0.5, 0.34], [0.4, 0.4], [0.3, 0.52], [0.2, 0.66], [0.1, 0.72]], BRAND.gold);
  both([[0.03, 0.68], [0.17, 0.62], [0.31, 0.46], [0.43, 0.32], [0.5, 0.28], [0.5, 0.34], [0.4, 0.4], [0.3, 0.52], [0.2, 0.66], [0.1, 0.74]], BRAND.red);
  // crown stripes front-to-back
  g.fillStyle = BRAND.cream;
  for (const u of [0.25, 0.75]) g.fillRect(X(u) - 9, 0, 18, Y(0.2 * PI));
  g.fillStyle = BRAND.gold; g.fillRect(0, Y(0.2 * PI), W, 5);
  // lower shell / neck roll
  g.fillStyle = BRAND.ink; g.fillRect(0, Y(0.7 * PI), W, H);
  g.fillStyle = BRAND.gold; g.fillRect(0, Y(0.7 * PI) - 4, W, 4);
  // eye port (under the visor)
  g.fillStyle = '#0b0a0a';
  {
    const x0 = X(0.25 - 0.178), y0 = Y(0.365 * PI), w = X(0.356), h = Y(0.2 * PI), r = 26;
    g.beginPath(); g.moveTo(x0 + r, y0); g.arcTo(x0 + w, y0, x0 + w, y0 + h, r); g.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
    g.arcTo(x0, y0 + h, x0, y0, r); g.arcTo(x0, y0, x0 + w, y0, r); g.closePath(); g.fill();
  }
  // chin vent + brow vents + rear exhaust slots
  g.fillStyle = '#111';
  for (let k = -2; k <= 2; k++) g.fillRect(X(0.25 + k * 0.012) - 3, Y(0.62 * PI), 6, Y(0.05 * PI));
  for (const s of [-1, 1]) g.fillRect(X(0.25 + s * 0.03) - 8, Y(0.2 * PI), 16, Y(0.06 * PI));
  for (let k = -1; k <= 1; k++) g.fillRect(X(0.75 + k * 0.022) - 4, Y(0.42 * PI), 8, Y(0.08 * PI));
  // rider number on both sides (u=0.5 left, u=0/1 right); reads correctly from either side
  g.font = `800 italic ${H * 0.13}px ${COND}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const u of [0.565, -0.065, 0.935]) {
    g.fillStyle = BRAND.ink; g.fillText(BRAND.riderNumber, X(u), Y(0.5 * PI));
  }
  return canvasTex(c);
}

// ------------------------------------------------------------------ rider leathers atlas
const ATLAS = 1024;
const RECT = {
  torso: [0, 0, 512, 448], hump: [512, 0, 256, 224], neck: [768, 0, 256, 96],
  leg: [0, 448, 512, 576], arm: [512, 224, 256, 544], hand: [768, 96, 256, 160],
  boot: [768, 256, 256, 192], foot: [768, 448, 256, 192],
  knee: [768, 640, 64, 128], shoulder: [832, 640, 64, 128], elbow: [896, 640, 64, 128], toe: [960, 640, 64, 128],
  knuckle: [768, 768, 64, 128], ankle: [832, 768, 64, 128], thumb: [896, 768, 64, 128], heel: [960, 768, 64, 128],
};
// pass: 'col' (albedo), 'bump' (height), 'rm' (G = roughness, B = metalness)
function riderAtlas(pass) {
  const [c, g] = mkCanvas(ATLAS, ATLAS);
  const TOK = {
    red: [BRAND.red, 128, 0.5, 0], cream: [BRAND.cream, 132, 0.45, 0], ink: [BRAND.ink, 126, 0.55, 0],
    suede: ['#28201c', 118, 0.92, 0], gold: [BRAND.gold, 130, 0.4, 0], hot: [BRAND.redHot, 128, 0.48, 0],
    slider: [BRAND.gold, 150, 0.3, 0], metal: ['#b4b6bb', 150, 0.3, 1], sole: ['#0f0e0d', 110, 0.9, 0],
    carbon: ['#1f1f23', 140, 0.28, 0], boot: ['#161313', 128, 0.35, 0],
  };
  const val = (tok) => {
    const t = TOK[tok] || TOK.ink;
    if (pass === 'col') return t[0];
    if (pass === 'bump') return grey(t[1]);
    return `rgb(0,${Math.round(t[2] * 255)},${Math.round(t[3] * 255)})`;
  };
  const r = rng(11);
  g.fillStyle = val('ink'); g.fillRect(0, 0, ATLAS, ATLAS);
  const region = (name, fn) => {
    const [x, y, w, h] = RECT[name];
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const U = (u) => x + u * w, Vy = (v) => y + v * h;
    const path = (pts, o) => { g.beginPath(); pts.forEach(([u, v], i) => i ? g.lineTo(U(u + o), Vy(v)) : g.moveTo(U(u + o), Vy(v))); };
    const R = {
      U, V: Vy, w, h, g, pass,
      fill(tok) { g.fillStyle = val(tok); g.fillRect(x, y, w, h); },
      box(u0, v0, u1, v1, tok) { g.fillStyle = val(tok); for (const o of [-1, 0, 1]) g.fillRect(U(u0 + o), Vy(v0), (u1 - u0) * w, (v1 - v0) * h); },
      poly(pts, tok) { g.fillStyle = val(tok); for (const o of [-1, 0, 1]) { path(pts, o); g.closePath(); g.fill(); } },
      ell(u, v, ru, rv, tok) { g.fillStyle = val(tok); for (const o of [-1, 0, 1]) { g.beginPath(); g.ellipse(U(u + o), Vy(v), ru * w, rv * h, 0, 0, TAU); g.fill(); } },
      stroke(pts, px, tok) { g.strokeStyle = val(tok); g.lineWidth = px; for (const o of [-1, 0, 1]) { path(pts, o); g.stroke(); } },
      seam(pts) {
        if (pass === 'rm') return;
        g.lineWidth = pass === 'bump' ? 2.5 : 1.3; g.strokeStyle = pass === 'bump' ? grey(60) : 'rgba(0,0,0,0.4)';
        for (const o of [-1, 0, 1]) { path(pts, o); g.stroke(); }
        g.setLineDash([3, 3]); g.lineWidth = 1; g.strokeStyle = pass === 'bump' ? grey(170) : 'rgba(255,240,220,0.14)';
        for (const o of [-1, 0, 1]) { path(pts.map(([u, v]) => [u + 0.006, v + 0.006]), o); g.stroke(); }
        g.setLineDash([]);
      },
      ribs(u0, v0, u1, v1, n, tok = 'ink') {
        R.box(u0, v0, u1, v1, tok);
        if (pass === 'rm') return;
        for (let k = 0; k < n; k++) {
          const vv = v0 + (k + 0.5) / n * (v1 - v0);
          if (pass === 'bump') { g.fillStyle = grey(90); g.fillRect(U(u0), Vy(vv) - 1.5, (u1 - u0) * w, 3); g.fillStyle = grey(175); g.fillRect(U(u0), Vy(vv + 0.5 / n * (v1 - v0)) - 2, (u1 - u0) * w, 4); }
          else { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(U(u0), Vy(vv) - 1, (u1 - u0) * w, 2); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(U(u0), Vy(vv) + 2, (u1 - u0) * w, 2); }
        }
        R.seam([[u0, v0], [u1, v0]]); R.seam([[u0, v1], [u1, v1]]);
      },
      perf(u0, v0, u1, v1, step) {
        if (pass === 'rm') return;
        g.fillStyle = pass === 'bump' ? grey(70) : 'rgba(0,0,0,0.35)';
        let row = 0;
        for (let yy = Vy(v0); yy < Vy(v1); yy += step, row++) for (let xx = U(u0) + (row & 1) * step / 2; xx < U(u1); xx += step) { g.beginPath(); g.arc(xx, yy, 1.1, 0, TAU); g.fill(); }
      },
    };
    fn(R);
    g.restore();
  };

  // --- torso (u: 0 left flank, .25 chest, .5 right flank, .75 back; v: crotch -> collar)
  region('torso', (R) => {
    R.fill('red');
    R.box(0.5, 0, 1.0, 0.26, 'suede');
    R.box(0, 0, 1, 0.07, 'ink');
    R.box(-0.075, 0.3, 0.075, 0.92, 'ink'); R.box(0.425, 0.3, 0.575, 0.92, 'ink');
    for (const u of [-0.075, 0.075, 0.425, 0.575]) R.stroke([[u, 0.3], [u, 0.92]], 3, 'gold');
    R.poly([[0.07, 0.95], [0.25, 0.73], [0.43, 0.95], [0.43, 0.85], [0.25, 0.61], [0.07, 0.85]], 'cream');
    R.stroke([[0.07, 0.81], [0.25, 0.56], [0.43, 0.81]], 4, 'gold');
    R.ribs(0.17, 0.33, 0.33, 0.5, 7);
    R.poly([[0.575, 0.72], [0.665, 0.6], [0.665, 0.93], [0.575, 0.93]], 'cream');
    R.poly([[0.925, 0.72], [0.835, 0.6], [0.835, 0.93], [0.925, 0.93]], 'cream');
    R.stroke([[0.575, 0.7], [0.665, 0.58]], 3, 'gold'); R.stroke([[0.925, 0.7], [0.835, 0.58]], 3, 'gold');
    R.ribs(0.63, 0.3, 0.87, 0.47, 8);
    R.box(0, 0.93, 1, 1, 'ink'); R.box(0, 0.948, 1, 0.962, 'hot');
    R.perf(0.12, 0.47, 0.38, 0.57, 7); R.perf(0.66, 0.5, 0.84, 0.58, 7);
    for (const u of [0.075, 0.425, 0.575, 0.925]) R.seam([[u, 0.28], [u, 0.93]]);
    R.seam([[0, 0.26], [1, 0.26]]); R.seam([[0.07, 0.95], [0.25, 0.73], [0.43, 0.95]]); R.seam([[0.07, 0.85], [0.25, 0.61], [0.43, 0.85]]);
    R.seam([[0.25, 0.07], [0.25, 0.33]]);
  });
  // --- aero hump (u .75 = back face). Number drawn rotated 180 deg so it reads upright from behind.
  region('hump', (R) => {
    R.fill('red');
    R.box(0, 0.86, 1, 1, 'ink');
    R.stroke([[0.56, 0.04], [0.56, 0.86]], 4, 'gold'); R.stroke([[0.94, 0.04], [0.94, 0.86]], 4, 'gold');
    R.ell(0.75, 0.47, 0.15, 0.27, 'cream');
    if (pass === 'col') {
      g.save(); g.translate(R.U(0.75), R.V(0.47)); g.rotate(Math.PI);
      g.font = `800 italic ${R.h * 0.36}px ${COND}`; g.fillStyle = BRAND.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(BRAND.riderNumber, 0, R.h * 0.02); g.restore();
    }
    R.seam([[0, 0.86], [1, 0.86]]);
  });
  region('neck', (R) => { R.fill('ink'); R.box(0, 0.35, 1, 0.5, 'hot'); R.seam([[0, 0.3], [1, 0.3]]); });
  // --- leg (u: 0 inner, .25 front, .5 outer, .75 back; v: hip -> ankle, knee at .535)
  region('leg', (R) => {
    R.fill('red');
    R.box(0, 0, 1, 0.035, 'ink');
    R.box(-0.14, 0.06, 0.12, 0.49, 'suede');
    R.poly([[0.43, 0.0], [0.57, 0.0], [0.61, 0.2], [0.575, 0.48], [0.425, 0.48], [0.39, 0.2]], 'cream');
    R.stroke([[0.43, 0.0], [0.39, 0.2], [0.425, 0.48]], 3, 'gold'); R.stroke([[0.57, 0.0], [0.61, 0.2], [0.575, 0.48]], 3, 'gold');
    R.poly([[0.47, 0.03], [0.53, 0.03], [0.55, 0.2], [0.52, 0.44], [0.48, 0.44], [0.45, 0.2]], 'hot');
    R.ell(0.25, 0.54, 0.1, 0.07, 'cream');
    R.ribs(0.63, 0.47, 0.87, 0.6, 6);
    R.box(0.38, 0.6, 0.62, 1, 'ink'); R.box(0.62, 0.62, 1.0, 1, 'ink'); R.box(-0.12, 0.55, 0.12, 1, 'ink');
    R.stroke([[0.38, 0.6], [0.38, 0.75]], 3, 'gold');
    R.perf(0.15, 0.1, 0.35, 0.4, 7);
    R.seam([[0.12, 0.06], [0.12, 0.49]]); R.seam([[0.86, 0.06], [0.86, 0.49]]); R.seam([[0, 0.49], [1, 0.49]]); R.seam([[0.38, 0.6], [0.38, 1]]); R.seam([[0.62, 0.6], [0.62, 1]]);
    R.seam([[0.15, 0.49], [0.15, 0.61], [0.35, 0.61], [0.35, 0.49]]);
  });
  // --- arm (u: 0 inner, .25 biceps, .5 outer, .75 elbow side; v: shoulder -> wrist, elbow .565, cuff .8)
  region('arm', (R) => {
    R.fill('red');
    R.box(-0.12, 0.08, 0.12, 0.8, 'ink');
    R.poly([[0.41, 0.0], [0.59, 0.0], [0.565, 0.5], [0.435, 0.5]], 'cream');
    R.stroke([[0.41, 0.0], [0.435, 0.5]], 3, 'gold'); R.stroke([[0.59, 0.0], [0.565, 0.5]], 3, 'gold');
    R.ribs(0.15, 0.5, 0.35, 0.63, 5);
    R.box(0.64, 0.48, 0.86, 0.65, 'ink');
    R.poly([[0.46, 0.6], [0.54, 0.6], [0.53, 0.79], [0.47, 0.79]], 'cream');
    R.box(0, 0.795, 1, 1, 'ink'); R.box(0, 0.83, 1, 0.87, 'hot'); R.box(0, 0.795, 1, 0.808, 'cream');
    R.seam([[0.12, 0.08], [0.12, 0.8]]); R.seam([[0.88, 0.08], [0.88, 0.8]]); R.seam([[0, 0.795], [1, 0.795]]);
    R.perf(0.15, 0.1, 0.35, 0.45, 7);
  });
  // --- glove fist (u .25 = back of hand, .75 = palm/fingers)
  region('hand', (R) => {
    R.fill('ink');
    R.poly([[0.12, 0.05], [0.38, 0.05], [0.33, 0.6], [0.17, 0.6]], 'red');
    R.stroke([[0.12, 0.05], [0.17, 0.6]], 2, 'cream'); R.stroke([[0.38, 0.05], [0.33, 0.6]], 2, 'cream');
    for (const d of [-0.07, 0, 0.07]) R.seam([[0.75 + d, 0.45], [0.75 + d, 1]]);
    R.seam([[0, 0.45], [1, 0.45]]);
  });
  // --- boot shaft (u as leg; v: top cuff -> ankle)
  region('boot', (R) => {
    R.fill('boot');
    R.box(0, 0, 1, 0.07, 'hot');
    R.poly([[0.4, 0.1], [0.6, 0.1], [0.58, 0.8], [0.42, 0.8]], 'red');
    R.stroke([[0.4, 0.1], [0.42, 0.8]], 3, 'cream'); R.stroke([[0.6, 0.1], [0.58, 0.8]], 3, 'cream');
    R.box(0.2, 0.08, 0.3, 0.9, 'cream');
    R.ribs(0.66, 0.12, 0.84, 0.5, 5, 'boot');
    R.seam([[0, 0.07], [1, 0.07]]); R.seam([[0.2, 0.08], [0.2, 0.9]]); R.seam([[0.3, 0.08], [0.3, 0.9]]);
  });
  // --- boot foot (u: 0 inner, .25 instep, .5 outer, .75 sole; v: heel -> toe)
  region('foot', (R) => {
    R.fill('boot');
    R.box(0.62, 0, 0.88, 1, 'sole');
    R.poly([[0.42, 0.25], [0.58, 0.25], [0.58, 0.75], [0.42, 0.6]], 'red');
    R.box(0.1, 0.44, 0.4, 0.5, 'cream');
    R.seam([[0, 0.85], [0.62, 0.85]]); R.seam([[0.62, 0], [0.62, 1]]); R.seam([[0.88, 0], [0.88, 1]]);
    if (pass === 'bump') for (let v = 0.05; v < 1; v += 0.06) { g.fillStyle = grey(80); g.fillRect(R.U(0.63), R.V(v), 0.24 * R.w, 2); }
  });
  // leather grain (armour pieces are painted afterwards so they stay smooth)
  if (pass !== 'rm') {
    for (let i = 0; i < 50000; i++) {
      const l = r() < 0.5;
      g.fillStyle = pass === 'bump' ? (l ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)') : (l ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)');
      g.fillRect(r() * ATLAS, r() * ATLAS, 2, 2);
    }
  }
  // --- armour pieces
  region('knee', (R) => {
    R.fill('slider');
    R.box(0, 0, 1, 0.14, 'ink'); R.box(0, 0.86, 1, 1, 'ink');
    if (pass === 'col') for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(255,245,220,${0.2 + r() * 0.3})`; g.lineWidth = 1; g.beginPath(); const x0 = R.U(0.3 + r() * 0.4), y0 = R.V(0.2 + r() * 0.6); g.moveTo(x0, y0); g.lineTo(x0 + (r() - 0.5) * 20, y0 + 6 + r() * 12); g.stroke(); }
  });
  region('shoulder', (R) => { R.fill('red'); R.box(0.4, 0.1, 0.6, 0.9, 'cream'); R.box(0, 0, 1, 0.1, 'ink'); R.box(0, 0.9, 1, 1, 'ink'); });
  region('elbow', (R) => { R.fill('metal'); R.box(0, 0, 1, 0.12, 'ink'); R.box(0, 0.88, 1, 1, 'ink'); });
  region('toe', (R) => { R.fill('metal'); R.box(0, 0, 1, 0.1, 'ink'); });
  region('knuckle', (R) => { R.fill('carbon'); R.box(0.2, 0.2, 0.3, 0.8, 'hot'); });
  region('ankle', (R) => { R.fill('metal'); });
  region('thumb', (R) => { R.fill('ink'); });
  region('heel', (R) => { R.fill('carbon'); R.box(0, 0.4, 1, 0.6, 'hot'); });
  return canvasTex(c, { srgb: pass === 'col' });
}

// ------------------------------------------------------------------ geometry helpers
// Side-profile shape (x = forward, y = up) extruded across the bike, then width-tapered by fn(z, y).
function sculpt(shape, depth, bevel, taper, segs = 6, curveSegments = 14) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: segs, curveSegments,
  });
  g.rotateY(-Math.PI / 2);
  g.translate(depth / 2, 0, 0);
  if (taper) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * taper(p.getZ(i), p.getY(i)));
  }
  smoothNormals(g, 55);
  g.computeBoundingBox();
  const pts = shape.getPoints(24);
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const v of pts) { minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x); miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y); }
  g.userData.bounds = { minx, maxx, miny, maxy };
  return g;
}
const shapeOf = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); return s; };
const circlePath = (cx, cy, r, n, P = THREE.Path) => { const p = new P(); for (let i = 0; i < n; i++) { const a = i / n * TAU; i ? p.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : p.moveTo(cx + r, cy); } p.closePath(); return p; };
// Extrude a profile drawn in the wheel plane (x = forward, y = up) to a slab of thickness `depth` centred on x = cx.
function slabX(shape, depth, cx = 0, bevel = 0, curveSegments = 6) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 2, curveSegments });
  g.translate(0, 0, -depth / 2);
  g.rotateY(-Math.PI / 2);
  g.translate(cx, 0, 0);
  return bevel > 0 ? smoothNormals(g, 50) : g;
}
function cylBetween(a, b, r1, r2, seg = 16, open = false) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const g = new THREE.CylinderGeometry(r2, r1, len, seg, 1, open);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
}
function boxAt(w, h, d, pos, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  g.translate(pos.x, pos.y, pos.z);
  return g;
}
function ellipsoid(rx, ry, rz, pos, ws = 16, hs = 10) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz); g.translate(pos.x, pos.y, pos.z);
  return g;
}
// Lathe about the x axis (the wheel axle). points: [radius, axial].
function latheX(pts, seg, phiStart = 0, phiLength = TAU) {
  const g = new THREE.LatheGeometry(pts.map(([r, a]) => new THREE.Vector2(r, a)), seg, phiStart, phiLength);
  g.rotateZ(-Math.PI / 2);
  return g;
}
// Place geometry built along +y (from 0 to len) between two points.
function orientY(g, a, b) {
  const d = new THREE.Vector3().subVectors(b, a).normalize();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d));
  g.translate(a.x, a.y, a.z);
  return g;
}
// Normalise attributes so geometries merge: non-indexed, position/normal/uv only.
function clean(g, keepSkin = false) {
  const keep = keepSkin ? ['position', 'normal', 'uv', 'skinIndex', 'skinWeight'] : ['position', 'normal', 'uv'];
  let o = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(o.attributes)) if (!keep.includes(k)) o.deleteAttribute(k);
  if (!o.attributes.normal) o.computeVertexNormals();
  if (!o.attributes.uv) o.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(o.attributes.position.count * 2), 2));
  o.clearGroups();
  return o;
}
// Average normals of coincident vertices (sphere / lathe seams).
function weldNormals(g) {
  const p = g.attributes.position, n = g.attributes.normal, map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(i);
  }
  const t = new THREE.Vector3();
  for (const list of map.values()) {
    if (list.length < 2) continue;
    t.set(0, 0, 0);
    for (const i of list) t.x += n.getX(i), t.y += n.getY(i), t.z += n.getZ(i);
    t.normalize();
    for (const i of list) n.setXYZ(i, t.x, t.y, t.z);
  }
  return g;
}
// Smooth shading for non-indexed extrusions: average face normals of coincident vertices within a crease angle.
function smoothNormals(g, creaseDeg = 50) {
  if (g.index) g = g.toNonIndexed();
  g.computeVertexNormals();
  const p = g.attributes.position, n = g.attributes.normal, map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${Math.round(p.getX(i) * 2e4)},${Math.round(p.getY(i) * 2e4)},${Math.round(p.getZ(i) * 2e4)}`;
    let l = map.get(k); if (!l) map.set(k, l = []); l.push(i);
  }
  const cosT = Math.cos(creaseDeg * Math.PI / 180), src = n.array.slice(), out = n.array;
  for (const l of map.values()) {
    for (const i of l) {
      let x = 0, y = 0, z = 0;
      for (const j of l) {
        const d = src[i * 3] * src[j * 3] + src[i * 3 + 1] * src[j * 3 + 1] + src[i * 3 + 2] * src[j * 3 + 2];
        if (d >= cosT) { x += src[j * 3]; y += src[j * 3 + 1]; z += src[j * 3 + 2]; }
      }
      const L = Math.hypot(x, y, z) || 1;
      out[i * 3] = x / L; out[i * 3 + 1] = y / L; out[i * 3 + 2] = z / L;
    }
  }
  n.needsUpdate = true;
  return g;
}
// Per-face box-projected UVs in the part's own space (consistent carbon weave scale on merged parts).
function boxUV(g, scale) {
  const p = g.attributes.position, uv = g.attributes.uv;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(c, b).cross(t.subVectors(a, b));
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    for (let k = 0; k < 3; k++) {
      const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k);
      if (ax >= ay && ax >= az) uv.setXY(i + k, z * scale, y * scale);
      else if (ay >= az) uv.setXY(i + k, x * scale, z * scale);
      else uv.setXY(i + k, x * scale, y * scale);
    }
  }
  uv.needsUpdate = true;
}

// Generic loft: rings of superellipse cross-sections {c, ex, ez, a, bf (+ez), bb (-ez), n, w (bone weights), v}.
// Outward orientation requires ex x ez = -(ring advance direction), as for limbs (ex = +x, ez = +z, advancing +y).
function loft(rings, seg, { rect = null, mirror = false } = {}) {
  const nR = rings.length, cols = seg + 1, N = nR * cols;
  const P = new Float32Array(N * 3), NR = new Float32Array(N * 3), UVs = new Float32Array(N * 2);
  const skin = rings[0].w != null;
  const SI = skin ? new Uint16Array(N * 4) : null, SW = skin ? new Float32Array(N * 4) : null;
  const acc = [0];
  for (let i = 1; i < nR; i++) acc.push(acc[i - 1] + rings[i].c.distanceTo(rings[i - 1].c));
  const tot = acc[nR - 1] || 1;
  for (let i = 0; i < nR; i++) {
    const r = rings[i], e = 2 / (r.n || 2);
    const v = r.v != null ? r.v : acc[i] / tot;
    for (let j = 0; j <= seg; j++) {
      const ph = (j / seg) * TAU, cs = Math.cos(ph), sn = Math.sin(ph);
      const px = r.a * Math.sign(cs) * Math.pow(Math.abs(cs), e);
      const pz = (sn >= 0 ? r.bf : r.bb) * Math.sign(sn) * Math.pow(Math.abs(sn), e);
      const k = i * cols + j;
      P[k * 3] = r.c.x + r.ex.x * px + r.ez.x * pz;
      P[k * 3 + 1] = r.c.y + r.ex.y * px + r.ez.y * pz;
      P[k * 3 + 2] = r.c.z + r.ex.z * px + r.ez.z * pz;
      const u = j / seg;
      if (rect) { UVs[k * 2] = (rect[0] + u * rect[2]) / ATLAS; UVs[k * 2 + 1] = 1 - (rect[1] + v * rect[3]) / ATLAS; }
      else { UVs[k * 2] = u; UVs[k * 2 + 1] = v; }
      if (skin) {
        let s = 0;
        for (let q = 0; q < 4; q++) { const en = r.w[q]; SI[k * 4 + q] = en ? en[0] : 0; SW[k * 4 + q] = en ? en[1] : 0; s += en ? en[1] : 0; }
        for (let q = 0; q < 4; q++) SW[k * 4 + q] /= s || 1;
      }
    }
  }
  const pt = (i, j, out) => out.set(P[(i * cols + j) * 3], P[(i * cols + j) * 3 + 1], P[(i * cols + j) * 3 + 2]);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), dR = new THREE.Vector3(), dA = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < nR; i++) {
    const il = Math.max(0, i - 1), ir = Math.min(nR - 1, i + 1);
    for (let j = 0; j <= seg; j++) {
      const jl = j === 0 ? seg - 1 : j - 1, jr = j === seg ? 1 : j + 1;
      dR.subVectors(pt(i, jr, A), pt(i, jl, B));
      dA.subVectors(pt(ir, j, A), pt(il, j, B));
      if (dR.lengthSq() < 1e-12) {
        const o = i === 0 ? rings[1].c : rings[i - 1].c;
        nn.subVectors(rings[i].c, o);
      } else nn.crossVectors(dA, dR);
      if (nn.lengthSq() < 1e-14) nn.set(0, 1, 0);
      nn.normalize();
      const k = (i * cols + j) * 3;
      NR[k] = nn.x; NR[k + 1] = nn.y; NR[k + 2] = nn.z;
    }
  }
  const idx = [];
  for (let i = 0; i < nR - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * cols + j, b = a + 1, c = a + cols + 1, d = a + cols;
    if (mirror) idx.push(a, b, d, b, c, d); else idx.push(a, d, b, b, d, c);
  }
  if (mirror) for (let k = 0; k < N; k++) { P[k * 3] *= -1; NR[k * 3] *= -1; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(NR, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(UVs, 2));
  if (skin) { g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4)); }
  g.setIndex(idx);
  return g;
}
// Limb profile: keys [t, a, bf, bb, zc, xc] -> rings along +y with Catmull-Rom interpolation.
function profile(keys, ts, weightFn, n = 2) {
  const at = (t) => {
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] < t) i++;
    const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
    const u = clamp((t - k1[0]) / (k2[0] - k1[0]), 0, 1), u2 = u * u, u3 = u2 * u;
    const out = [];
    for (let q = 1; q < 6; q++) {
      const p0 = k0[q] ?? 0, p1 = k1[q] ?? 0, p2 = k2[q] ?? 0, p3 = k3[q] ?? 0;
      out.push(Math.max(q < 4 ? 0 : -1, 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3)));
    }
    return out;
  };
  const t0 = ts[0], t1 = ts[ts.length - 1];
  return ts.map((t) => {
    const [a, bf, bb, zc, xc] = at(t);
    return { c: V(xc, t, zc), ex: XA, ez: ZA, a, bf, bb, n, w: weightFn(t), v: (t - t0) / (t1 - t0) };
  });
}
// Ellipsoidal armour shell along +y, centred at (x, y, z) with radii (rx, ry, rz).
function shellRings(x, y, z, rx, ry, rz, w, n = 2, count = 9) {
  const out = [];
  for (let i = 0; i <= count; i++) {
    const t = -1 + 2 * i / count, s = Math.sqrt(Math.max(0, 1 - t * t));
    out.push({ c: V(x, y + t * ry, z), ex: XA, ez: ZA, a: rx * s, bf: rz * s, bb: rz * s, n, w, v: i / count });
  }
  return out;
}
const _ikd = new THREE.Vector3(), _ikp = new THREE.Vector3();
// Two-bone IK: mid joint bends toward `pole`; bone lengths stay fixed (end stops short if out of reach).
function ik(root, target, l1, l2, pole, outMid, outEnd) {
  const d = _ikd.subVectors(target, root);
  let len = d.length();
  d.divideScalar(len || 1);
  len = clamp(len, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const x = (l1 * l1 - l2 * l2 + len * len) / (2 * len);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const p = _ikp.copy(pole).addScaledVector(d, -pole.dot(d)).normalize();
  outMid.copy(root).addScaledVector(d, x).addScaledVector(p, h);
  outEnd.copy(root).addScaledVector(d, len);
}

// Full-face helmet surface: deformed unit sphere (direction d) -> helmet-local point.
function helmetPt(d, out) {
  let x = d.x * 0.127, y = d.y * 0.138, z = d.z * (d.z > 0 ? 0.148 : 0.163);
  const chin = ss(0.05, 0.8, d.z) * ss(-0.05, -0.65, d.y);
  z += chin * 0.024; y -= chin * 0.018;
  x *= 1 - 0.12 * chin;
  const yb = lerp(-0.118, -0.152, ss(0.1, 0.85, d.z));
  if (y < yb) y = yb + (y - yb) * 0.12;
  return out.set(x, y + 0.012, z - 0.008);
}

// Paint material whose map is sampled from a per-side texture so decals read correctly on both flanks.
function liveryMaterial(texR, texL, b) {
  const fit = (t) => {
    const c = t.clone(); c.needsUpdate = true;
    c.wrapS = c.wrapT = THREE.ClampToEdgeWrapping;
    const w = b.maxx - b.minx, h = b.maxy - b.miny;
    c.repeat.set(1 / w, 1 / h); c.offset.set(-b.minx / w, -b.miny / h);
    return c;
  };
  const mat = new THREE.MeshPhysicalMaterial({ map: fit(texR), roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });
  const mapL = fit(texL);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.mapL = { value: mapL };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNX;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvObjNX = objectNormal.x;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNX;\nuniform sampler2D mapL;')
      .replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampledDiffuseColor = vObjNX > 0.0 ? texture2D(mapL, vec2(1.0 - vMapUv.x, vMapUv.y)) : texture2D(map, vMapUv);
        diffuseColor *= sampledDiffuseColor;
      #endif`);
  };
  mat.customProgramCacheKey = () => 'livery';
  return mat;
}

export function makeMaterials() {
  const carbonMap = cached('carbon', carbonTex);
  const leatherCol = cached('leatherCol', () => riderAtlas('col'));
  const leatherBump = cached('leatherBump', () => riderAtlas('bump'));
  const leatherRM = cached('leatherRM', () => riderAtlas('rm'));
  return {
    livR: TX.liveryTexture(false, 'fairing'),
    livL: TX.liveryTexture(true, 'fairing'),
    tailR: TX.liveryTexture(false, 'tail'),
    tailL: TX.liveryTexture(true, 'tail'),
    paint: new THREE.MeshPhysicalMaterial({ color: BRAND.red, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
    paintInk: new THREE.MeshPhysicalMaterial({ color: '#1f1917', roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
    carbon: new THREE.MeshPhysicalMaterial({ map: carbonMap, bumpMap: carbonMap, bumpScale: 0.5, roughness: 0.38, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.07 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d4a748', roughness: 0.24, metalness: 1 }),
    rim: new THREE.MeshStandardMaterial({ color: '#b98a3e', roughness: 0.3, metalness: 0.9 }),
    alu: new THREE.MeshStandardMaterial({ color: '#a4a8ae', roughness: 0.3, metalness: 1 }),
    dark: new THREE.MeshStandardMaterial({ color: '#2c2d31', roughness: 0.32, metalness: 0.85 }),
    ink: new THREE.MeshStandardMaterial({ color: '#151413', roughness: 0.82 }),
    rubber: new THREE.MeshStandardMaterial({ map: cached('tyre', tyreTex), roughness: 0.78 }),
    disc: new THREE.MeshStandardMaterial({ color: '#8a8b8f', roughness: 0.34, metalness: 0.9, emissive: new THREE.Color('#ff5a14'), emissiveIntensity: 0 }),
    ti: new THREE.MeshStandardMaterial({ map: cached('heat', heatTex), roughness: 0.2, metalness: 1 }),
    screen: new THREE.MeshPhysicalMaterial({ color: '#2a2a33', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.5, clearcoat: 1 }),
    tail: new THREE.MeshStandardMaterial({ color: '#300', emissive: '#ff2010', emissiveIntensity: 3 }),
    radiator: new THREE.MeshStandardMaterial({ map: cached('rad', radiatorTex), roughness: 0.55, metalness: 0.6 }),
    decal: new THREE.MeshPhysicalMaterial({ map: TX.decalTexture('number'), alphaTest: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, polygonOffset: true, polygonOffsetFactor: -2 }),
    leather: new THREE.MeshStandardMaterial({ map: leatherCol, bumpMap: leatherBump, bumpScale: 1.2, roughnessMap: leatherRM, metalnessMap: leatherRM, roughness: 1, metalness: 1 }),
    helmet: new THREE.MeshPhysicalMaterial({ map: cached('helmet', helmetTex), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 }),
    visor: new THREE.MeshPhysicalMaterial({ color: '#3d2a12', roughness: 0.03, metalness: 0.95, clearcoat: 1 }),
  };
}

const wheelCache = new Map();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
const _X = new THREE.Vector3(), _Y = new THREE.Vector3(), _Z = new THREE.Vector3();
const _q = new THREE.Quaternion(), _e = new THREE.Euler();

export class BikeModel {
  constructor(mats = makeMaterials()) {
    this.m = mats;
    this.root = new THREE.Group();       // at ground contact, yaw/pitch
    this.leanG = new THREE.Group();      // roll about the contact line
    this.pitchG = new THREE.Group();     // wheelie / stoppie
    this.root.add(this.leanG);
    this.leanG.add(this.pitchG);
    this.body = new THREE.Group();
    this.pitchG.add(this.body);
    this.static = [];
    this.#buildBike();
    this.#mergeStatic();
    if (AI_BIKE) this.#useAIBike();
    this.#buildRider();
    this.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.wheelSpin = 0;
  }

  #add(mesh) { this.body.add(mesh); this.static.push(mesh); return mesh; }

  // Swap the procedural bike for the generated one: body mesh + two spinning wheel groups; rider anchors refit.
  #useAIBike() {
    const sp = splitAIBike();
    for (const o of [...this.body.children]) this.body.remove(o);
    const S = AI.scale;
    const place = (o) => { o.rotation.y = Math.PI / 2; o.scale.setScalar(S); return o; };
    const body = place(new THREE.Mesh(sp.body, sp.mat));
    body.position.set(0, -AI.yGround * S, AI.xMid * S - 0.01);
    this.body.add(body);
    AI.wheels.forEach((w, i) => {
      const hub = new THREE.Group();
      hub.position.set(0, (w.cy - AI.yGround) * S, -(w.cx - AI.xMid) * S - 0.01);
      const spin = new THREE.Group();
      hub.add(spin);
      const wm = place(new THREE.Mesh(sp.wheels[i], sp.mat));
      wm.position.set(0, -w.cy * S, w.cx * S);
      spin.add(wm);
      hub.userData.spin = spin;
      this.body.add(hub);
      this[w.key] = hub;
    });
    this.grip = { l: AI.grip.l.clone(), r: AI.grip.r.clone() };
    this.pegs = { l: AI.pegs.l.clone(), r: AI.pegs.r.clone() };
    this.fit = { dy: AI.hipDy, dz: AI.hipDz };
    this.exhaustTip = AI.exhaustTip.clone();
  }
  #geo(g, mat) { return this.#add(new THREE.Mesh(g, mat)); }

  #buildBike() {
    const m = this.m;
    // --- Main fairing
    const fs = new THREE.Shape();
    fs.moveTo(1.1, 0.66);
    fs.quadraticCurveTo(1.07, 0.86, 0.86, 0.95);
    fs.lineTo(0.62, 1.0);
    fs.quadraticCurveTo(0.5, 1.02, 0.44, 0.96);
    fs.quadraticCurveTo(0.34, 0.72, 0.1, 0.56);
    fs.quadraticCurveTo(-0.14, 0.44, -0.22, 0.3);
    fs.quadraticCurveTo(-0.26, 0.17, -0.12, 0.14);
    fs.lineTo(0.3, 0.13);
    fs.quadraticCurveTo(0.42, 0.16, 0.42, 0.36);
    fs.quadraticCurveTo(0.46, 0.64, 0.72, 0.665);
    fs.quadraticCurveTo(0.96, 0.67, 1.1, 0.66);
    const fairTaper = (z, y) => lerp(0.4, 1, ss(1.16, 0.6, z)) * lerp(0.72, 1, ss(0.08, 0.42, y)) * lerp(1, 0.8, ss(0.88, 1.04, y)) * lerp(0.82, 1, ss(-0.28, 0.1, z));
    const fg = sculpt(fs, 0.36, 0.075, fairTaper, 6, 18);
    this.fairing = new THREE.Mesh(fg, [liveryMaterial(m.livR, m.livL, { minx: -0.27, maxx: 1.1, miny: 0.13, maxy: 1.02 }), m.paint]);
    this.body.add(this.fairing);
    // front number board, conformed to the nose by raycasting onto the fairing
    this.#noseDecal();
    // ram-air intake at the nose + lip
    const intake = new THREE.CylinderGeometry(1, 1, 0.04, 28);
    intake.rotateX(Math.PI / 2); intake.scale(0.062, 0.03, 1); intake.rotateX(-0.25); intake.translate(0, 0.705, 1.09);
    this.#geo(intake, m.ink);
    const lip = new THREE.TorusGeometry(1, 0.12, 6, 28);
    lip.scale(0.064, 0.032, 0.06); lip.rotateX(-0.25); lip.translate(0, 0.705, 1.108);
    this.#geo(lip, m.paintInk);
    // --- Tank / airbox cover (low, so the tucked rider's chest lies on it)
    const ts = new THREE.Shape();
    ts.moveTo(0.4, 0.9);
    ts.quadraticCurveTo(0.34, 1.07, 0.16, 1.07);
    ts.quadraticCurveTo(0.0, 1.07, -0.05, 0.99);
    ts.lineTo(-0.06, 0.85); ts.lineTo(0.38, 0.83);
    this.#geo(sculpt(ts, 0.27, 0.055, (z, y) => lerp(1, 0.66, ss(0.95, 1.1, y)) * lerp(1, 0.85, ss(0.2, -0.06, z))), m.paintInk);
    // grippy knee pads on the tank flanks
    for (const sx of [-1, 1]) {
      const kp = shapeOf([[0.2, 0.9], [0.02, 0.9], [-0.04, 0.97], [0.06, 1.0], [0.2, 0.98]]);
      this.#geo(slabX(kp, 0.012, sx * 0.19, 0.004), m.ink);
    }
    // --- Tail unit
    const tl = new THREE.Shape();
    tl.moveTo(0.0, 0.88);
    tl.lineTo(-0.36, 0.91);
    tl.quadraticCurveTo(-0.44, 0.93, -0.5, 1.0);
    tl.lineTo(-0.96, 1.07);
    tl.quadraticCurveTo(-1.02, 1.06, -0.99, 1.0);
    tl.quadraticCurveTo(-0.8, 0.86, -0.5, 0.78);
    tl.quadraticCurveTo(-0.2, 0.72, 0.0, 0.76);
    const tg = sculpt(tl, 0.24, 0.05, (z, y) => lerp(1, 0.42, ss(-0.4, -1.02, z)) * lerp(1, 0.85, ss(0.95, 1.08, y)));
    this.tailMesh = new THREE.Mesh(tg, [liveryMaterial(m.tailR, m.tailL, { minx: -1.02, maxx: 0.0, miny: 0.72, maxy: 1.07 }), m.paint]);
    this.body.add(this.tailMesh);
    // seat pad (suede) with rear bolster
    const sp = shapeOf([[0.0, 0.88], [-0.38, 0.905], [-0.43, 0.93], [-0.44, 0.965], [-0.4, 0.97], [-0.36, 0.94], [0.0, 0.915]]);
    this.#geo(sculpt(sp, 0.17, 0.012, null, 2, 8), m.ink);
    // --- Bubble screen
    const scr = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), m.screen);
    scr.scale.set(0.16, 0.12, 0.3); scr.position.set(0, 0.965, 0.66); scr.rotation.x = 0.26;
    this.body.add(scr);
    // dash + top clamp are seen through the screen / from the onboard camera
    this.#geo(boxAt(0.13, 0.065, 0.022, V(0, 0.935, 0.52), -0.95), m.ink);
    // --- Tail light (LED bar in a black housing)
    const led = new THREE.CapsuleGeometry(0.008, 0.11, 3, 8); led.rotateZ(Math.PI / 2); led.scale(1, 1, 0.6); led.translate(0, 0.952, -1.012);
    this.#geo(led, m.tail);
    this.#geo(boxAt(0.15, 0.026, 0.05, V(0, 0.955, -0.985), 0.15), m.ink);
    // --- Aero: stacked box wings either side of the nose
    for (const sx of [-1, 1]) {
      const foil = shapeOf([[0.075, 0.0], [0.05, 0.009], [0.0, 0.012], [-0.05, 0.006], [-0.07, 0.0], [-0.05, -0.003], [0.0, -0.004], [0.05, -0.003]]);
      for (const [dy, dz] of [[0, 0], [0.075, -0.02]]) {
        const span = 0.108;
        const w = new THREE.ExtrudeGeometry(foil, { depth: span, bevelEnabled: false, curveSegments: 4 });
        w.rotateY(-Math.PI / 2);                       // chord -> +z, span -> -x (aerofoil is span-symmetric)
        w.rotateX(0.1);                                // leading edge down
        w.translate(sx > 0 ? 0.145 + span : -0.145, 0.665 + dy, 0.9 + dz);
        this.#geo(w, m.carbon);
      }
      const ep = shapeOf([[0.08, -0.02], [0.02, -0.03], [-0.07, -0.02], [-0.1, 0.03], [-0.09, 0.09], [-0.03, 0.1], [0.05, 0.09], [0.07, 0.05]]);
      this.#geo(slabX(ep, 0.007, sx * 0.25, 0.002).translate(0, 0.665, 0.895), m.paint);
    }
    // --- Radiator in the fairing inlet behind the front wheel
    const rad = boxAt(0.25, 0.3, 0.035, V(0, 0.45, 0.445), -0.22);
    this.#geo(rad, m.radiator);
    this.#geo(boxAt(0.27, 0.32, 0.02, V(0, 0.45, 0.425), -0.22), m.ink);
    // --- Wheels
    this.frontWheel = this.#wheel(true); this.frontWheel.position.set(0, 0.3, 0.7);
    this.rearWheel = this.#wheel(false); this.rearWheel.position.set(0, 0.3, -0.72);
    this.body.add(this.frontWheel, this.rearWheel);
    // --- Front mudguard (carbon arch over the tyre)
    const arch = [[0.312, -0.066], [0.326, -0.058], [0.336, -0.034], [0.339, 0], [0.336, 0.034], [0.326, 0.058], [0.312, 0.066], [0.307, 0.06], [0.33, 0.032], [0.333, 0], [0.33, -0.032], [0.307, -0.06], [0.312, -0.066]];
    this.#geo(latheX(arch, 22, -1.95, 1.45).translate(0, 0.3, 0.7), m.carbon);
    // rear hugger
    const hug = arch.map(([r, a]) => [r + 0.012, a * 1.5]);
    this.#geo(latheX(hug, 16, -1.95, 1.0).translate(0.0, 0.3, -0.72), m.carbon);
    this.#forks();
    this.#frame();
    this.#swingarm();
    this.#exhaust();
    this.#rearsets();
  }

  #noseDecal() {
    // raycast only against the nose triangles (the fairing is non-indexed)
    const src = this.fairing.geometry.attributes.position, keep = [];
    for (let i = 0; i < src.count; i += 3) {
      let ok = true;
      for (let k = 0; k < 3 && ok; k++) ok = src.getZ(i + k) > 0.84 && src.getY(i + k) > 0.66;
      if (ok) for (let k = 0; k < 3; k++) keep.push(src.getX(i + k), src.getY(i + k), src.getZ(i + k));
    }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3));
    const f = new THREE.Mesh(ng, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    f.updateMatrixWorld(true);
    const rc = new THREE.Raycaster();
    const n = V(0, 0.64, 0.77).normalize();        // nose surface normal (forward-up)
    const t = V(0, 0.77, -0.64).normalize();       // up-the-nose tangent
    const ctr = V(0, 0.83, 1.02);
    const W = 0.15, H = 0.085, NX = 12, NY = 8;
    const pos = [], uv = [], idx = [];
    const o = new THREE.Vector3();
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const u = i / NX, v = j / NY;
      o.copy(ctr).addScaledVector(XA, (u - 0.5) * W).addScaledVector(t, (v - 0.5) * H).addScaledVector(n, 0.2);
      rc.set(o, n.clone().negate());
      const hit = rc.intersectObject(f, false).find(h => h.face && h.face.normal.dot(n) > 0) || null;
      const p = hit ? hit.point : o.clone().addScaledVector(n, -0.2);
      p.addScaledVector(n, 0.0015);
      pos.push(p.x, p.y, p.z); uv.push(u, v);
    }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 2, d = a + NX + 1;
      idx.push(a, b, d, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    this.#geo(g, this.m.decal);
  }

  #forks() {
    const m = this.m;
    const rake = 0.42, fa = V(0, Math.cos(rake), -Math.sin(rake));
    const fp = (x, s) => V(x, 0.3 + fa.y * s, 0.7 + fa.z * s);
    this.forkAxis = fa;
    for (const sx of [-1, 1]) {
      const x = sx * 0.108;
      this.#geo(cylBetween(fp(x, -0.04), fp(x, 0.1), 0.031, 0.029, 16), m.dark);              // axle clamp foot
      this.#geo(cylBetween(V(x - 0.022, 0.3, 0.7), V(x + 0.022, 0.3, 0.7), 0.027, 0.027, 16), m.dark);
      this.#geo(cylBetween(V(x + sx * 0.022, 0.3, 0.7), V(x + sx * 0.03, 0.3, 0.7), 0.016, 0.016, 6), m.alu); // axle nut
      this.#geo(cylBetween(fp(x, 0.1), fp(x, 0.215), 0.025, 0.025, 16), m.dark);               // DLC stanchion
      this.#geo(cylBetween(fp(x, 0.205), fp(x, 0.228), 0.035, 0.034, 16), m.ink);              // dust wiper
      this.#geo(cylBetween(fp(x, 0.228), fp(x, 0.665), 0.033, 0.031, 18), m.gold);             // outer tube
      this.#geo(cylBetween(fp(x, 0.665), fp(x, 0.69), 0.02, 0.018, 12), m.alu);                // preload cap
      this.#geo(cylBetween(fp(x, 0.545), fp(x, 0.585), 0.039, 0.039, 16), m.alu);              // clip-on clamp
      // radial caliper mount lugs
      for (const s of [0.02, 0.1]) this.#geo(boxAt(0.02, 0.022, 0.05, fp(x, s).add(V(-sx * 0.012, 0, -0.035)), -rake), m.dark);
      // radial monobloc caliper straddling the disc edge (behind the fork leg)
      const a0 = 0.62, a1 = 1.28, rI = 0.118, rO = 0.188, cs = new THREE.Shape();
      for (let k = 0; k <= 10; k++) { const a = lerp(a0, a1, k / 10); const p = [-Math.sin(a) * rO, Math.cos(a) * rO]; k ? cs.lineTo(...p) : cs.moveTo(...p); }
      for (let k = 10; k >= 0; k--) { const a = lerp(a0, a1, k / 10); cs.lineTo(-Math.sin(a) * rI, Math.cos(a) * rI); }
      const cal = slabX(cs, 0.036, sx * 0.078, 0.008, 4);
      cal.translate(0, 0.3, 0.7);
      this.#geo(cal, m.gold);
      // piston bulges on the outer face
      for (const a of [0.8, 1.1]) this.#geo(cylBetween(V(sx * 0.098, 0.3 + Math.cos(a) * 0.162, 0.7 - Math.sin(a) * 0.162), V(sx * 0.108, 0.3 + Math.cos(a) * 0.162, 0.7 - Math.sin(a) * 0.162), 0.018, 0.016, 12), m.gold);
    }
    // top triple clamp (machined), in the plane normal to the fork axis
    const tc = new THREE.Shape();
    tc.moveTo(-0.15, -0.04); tc.lineTo(0.15, -0.04); tc.quadraticCurveTo(0.165, 0.0, 0.14, 0.04); tc.lineTo(0.05, 0.075); tc.quadraticCurveTo(0, 0.09, -0.05, 0.075); tc.lineTo(-0.14, 0.04); tc.quadraticCurveTo(-0.165, 0.0, -0.15, -0.04);
    const tcg = new THREE.ExtrudeGeometry(tc, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 2, curveSegments: 6 });
    const fb = V(0, -Math.sin(rake), -Math.cos(rake));
    tcg.applyMatrix4(new THREE.Matrix4().makeBasis(XA, fb, fa));
    const tcp = fp(0, 0.625); tcg.translate(tcp.x, tcp.y, tcp.z);
    this.#geo(tcg, m.alu);
    // clip-ons, grips, levers, guards
    this.grip = {};
    for (const sx of [-1, 1]) {
      const c0 = fp(sx * 0.108, 0.565), end = V(sx * 0.36, 0.852, 0.382);
      this.#geo(cylBetween(c0, end, 0.011, 0.011, 10), m.alu);
      const d = end.clone().sub(c0).normalize();
      const g0 = c0.clone().addScaledVector(d, 0.1), g1 = end.clone().addScaledVector(d, -0.012);
      this.#geo(cylBetween(g0, g1, 0.017, 0.017, 12), m.ink);
      this.#geo(cylBetween(g1, end.clone().addScaledVector(d, 0.018), 0.015, 0.013, 10), m.alu);    // bar-end weight
      this.grip[sx > 0 ? 'l' : 'r'] = g0.clone().lerp(g1, 0.55);
      // lever in front of the grip + carbon lever guard
      const l0 = c0.clone().addScaledVector(d, 0.05).add(V(0, 0.004, 0.035)), l1 = end.clone().addScaledVector(d, -0.02).add(V(0, 0.01, 0.07));
      this.#geo(cylBetween(l0, l1, 0.006, 0.005, 6), m.alu);
      const gd = boxAt(0.012, 0.03, 0.09, end.clone().add(V(sx * 0.014, 0.004, 0.045)), 0, sx * 0.25, 0);
      this.#geo(gd, m.carbon);
      // radial master cylinder / reservoir
      this.#geo(cylBetween(c0.clone().add(V(sx * 0.035, 0.01, 0)), c0.clone().add(V(sx * 0.035, 0.012, 0.07)), 0.011, 0.01, 10), m.dark);
      this.#geo(cylBetween(c0.clone().add(V(sx * 0.04, 0.02, 0.01)), c0.clone().add(V(sx * 0.04, 0.065, 0.0)), 0.013, 0.013, 10), m.dark);
    }
  }

  #frame() {
    const m = this.m;
    for (const sx of [-1, 1]) {
      // twin aluminium spar from the steering head to the swingarm pivot
      const path = [V(0.05, 0.83, 0.44), V(0.12, 0.8, 0.34), V(0.152, 0.74, 0.2), V(0.155, 0.66, 0.06), V(0.15, 0.58, -0.04), V(0.148, 0.52, -0.09)];
      const rings = path.map((c, i) => {
        const tng = (i === 0 ? path[1].clone().sub(path[0]) : i === path.length - 1 ? path[i].clone().sub(path[i - 1]) : path[i + 1].clone().sub(path[i - 1])).normalize();
        const ez = UP.clone().addScaledVector(tng, -UP.dot(tng)).normalize();
        const ex = tng.clone().cross(ez);
        return { c: c.clone(), ex, ez, a: 0.017, bf: 0.05 - i * 0.002, bb: 0.05 - i * 0.002, n: 4.5 };
      });
      let g = loft(rings, 16);
      if (sx < 0) g = loft(rings, 16, { mirror: true });
      this.#geo(g, m.alu);
      // pivot plate + pivot nut
      const pp = shapeOf([[0.03, 0.62], [-0.03, 0.63], [-0.15, 0.53], [-0.17, 0.42], [-0.13, 0.33], [-0.04, 0.33], [0.03, 0.42]]);
      this.#geo(slabX(pp, 0.022, sx * 0.15, 0.006, 4), m.alu);
      this.#geo(cylBetween(V(sx * 0.16, 0.42, -0.1), V(sx * 0.178, 0.42, -0.1), 0.022, 0.02, 6), m.gold);
    }
    // engine castings (mostly behind the fairing), clutch cover (right), sprocket cover (left, carbon)
    this.#geo(boxAt(0.28, 0.26, 0.4, V(0, 0.33, 0.1)), m.dark);
    this.#geo(boxAt(0.22, 0.2, 0.2, V(0, 0.32, -0.12), 0.2), m.dark);
    this.#geo(cylBetween(V(-0.14, 0.3, 0.02), V(-0.165, 0.3, 0.02), 0.075, 0.07, 24), m.dark);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; this.#geo(cylBetween(V(-0.16, 0.3 + Math.cos(a) * 0.062, 0.02 + Math.sin(a) * 0.062), V(-0.17, 0.3 + Math.cos(a) * 0.062, 0.02 + Math.sin(a) * 0.062), 0.006, 0.006, 6), m.alu); }
    const sc = shapeOf([[0.02, 0.46], [-0.08, 0.46], [-0.1, 0.4], [-0.08, 0.35], [0.02, 0.35], [0.04, 0.4]]);
    this.#geo(slabX(sc, 0.012, 0.14, 0.004), m.carbon);
    // rear shock: spring + body + reservoir
    const sb = V(0, 0.4, -0.2), st = V(0, 0.66, -0.16);
    const axis = st.clone().sub(sb), L = axis.length(); axis.normalize();
    const turns = 6, pts = [];
    for (let i = 0; i <= turns * 18; i++) { const t = i / (turns * 18), a = t * turns * TAU; pts.push(V(Math.cos(a) * 0.028, 0.03 + t * (L - 0.1), Math.sin(a) * 0.028)); }
    const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 18, 0.005, 5, false);
    this.#geo(orientY(spring, sb, st), m.gold);
    this.#geo(cylBetween(sb, st, 0.017, 0.017, 12), m.dark);
    this.#geo(cylBetween(st.clone().add(V(0.035, -0.02, 0)), st.clone().add(V(0.035, -0.14, 0.03)), 0.017, 0.017, 12), m.alu);
  }

  #swingarm() {
    const m = this.m;
    const prof = new THREE.Shape();
    prof.moveTo(-0.04, 0.5);
    prof.quadraticCurveTo(-0.2, 0.53, -0.38, 0.47);
    prof.lineTo(-0.63, 0.365); prof.lineTo(-0.77, 0.335);
    prof.quadraticCurveTo(-0.8, 0.3, -0.77, 0.268);
    prof.lineTo(-0.6, 0.255); prof.lineTo(-0.34, 0.3); prof.lineTo(-0.16, 0.335);
    prof.quadraticCurveTo(-0.04, 0.34, -0.03, 0.42);
    prof.quadraticCurveTo(-0.02, 0.48, -0.04, 0.5);
    const hole = new THREE.Path(); hole.moveTo(-0.22, 0.46); hole.lineTo(-0.44, 0.42); hole.lineTo(-0.25, 0.37); hole.closePath();
    prof.holes.push(hole);
    for (const sx of [-1, 1]) this.#geo(slabX(prof, 0.034, sx === 1 ? 0.152 : -0.142, 0.008, 8), m.carbon);
    this.#geo(boxAt(0.27, 0.055, 0.05, V(0.005, 0.44, -0.3), 0.3), m.alu);          // cross brace
    this.#geo(cylBetween(V(-0.2, 0.3, -0.72), V(0.2, 0.3, -0.72), 0.012, 0.012, 8), m.dark);  // rear axle
    for (const sx of [-1, 1]) {
      this.#geo(boxAt(0.02, 0.05, 0.07, V(sx * (sx > 0 ? 0.178 : 0.168), 0.3, -0.7)), m.alu);  // adjuster block
      this.#geo(cylBetween(V(sx * 0.18, 0.3, -0.72), V(sx * 0.2, 0.3, -0.72), 0.018, 0.016, 6), m.gold);
    }
    // rear caliper (right, under the arm) + hanger
    const a0 = 1.95, a1 = 2.55, cs = new THREE.Shape();
    for (let k = 0; k <= 8; k++) { const a = lerp(a0, a1, k / 8); const p = [-Math.sin(a) * 0.125, Math.cos(a) * 0.125]; k ? cs.lineTo(...p) : cs.moveTo(...p); }
    for (let k = 8; k >= 0; k--) { const a = lerp(a0, a1, k / 8); cs.lineTo(-Math.sin(a) * 0.07, Math.cos(a) * 0.07); }
    this.#geo(slabX(cs, 0.032, -0.1, 0.006, 4).translate(0, 0.3, -0.72), m.gold);
    this.#geo(boxAt(0.012, 0.03, 0.15, V(-0.12, 0.25, -0.62), -0.4), m.alu);
    // chain: top and bottom runs + wrap around the rear sprocket
    const F = { z: -0.04, y: 0.41, r: 0.045 }, Rr = { z: -0.72, y: 0.3, r: 0.106 }, cx = 0.112;
    const dz = Rr.z - F.z, dy = Rr.y - F.y, D = Math.hypot(dz, dy), d = [dz / D, dy / D];
    const up = [-d[1], d[0]].map(v => v * (d[0] < 0 ? -1 : 1));
    const sb = (Rr.r - F.r) / D, cb = Math.sqrt(1 - sb * sb);
    const links = [];
    for (const side of [1, -1]) {
      const nz = up[0] * side * cb - d[0] * sb, ny = up[1] * side * cb - d[1] * sb;
      const A = [F.z + nz * F.r, F.y + ny * F.r], B = [Rr.z + nz * Rr.r, Rr.y + ny * Rr.r];
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.floor(len / 0.0159);
      for (let i = 0; i <= n; i++) links.push([lerp(A[0], B[0], i / n), lerp(A[1], B[1], i / n), Math.atan2(B[1] - A[1], B[0] - A[0])]);
    }
    const aTop = Math.atan2(up[1] * cb - d[1] * sb, up[0] * cb - d[0] * sb), aBot = Math.atan2(-up[1] * cb - d[1] * sb, -up[0] * cb - d[0] * sb);
    let span = aBot - aTop; while (span < 0) span += TAU;
    const nw = Math.floor(span * Rr.r / 0.0159);
    for (let i = 1; i < nw; i++) { const a = aTop + span * i / nw; links.push([Rr.z + Math.cos(a) * Rr.r, Rr.y + Math.sin(a) * Rr.r, a + Math.PI / 2]); }
    links.forEach(([z, y, ang], i) => {
      const rot = -ang; // local z along the run
      for (const ox of [-0.0085, 0.0085]) this.#geo(boxAt(0.0025, 0.012, 0.019, V(cx + ox, y, z), rot), i & 1 ? m.gold : m.dark);
      this.#geo(boxAt(0.014, 0.008, 0.008, V(cx, y, z), rot), m.dark);
    });
  }

  #exhaust() {
    const m = this.m;
    const exA = V(-0.1, 0.6, -0.42), exB = V(-0.1, 0.78, -0.8);
    const dir = exB.clone().sub(exA), len = dir.length(), dn = dir.clone().normalize();
    // header from under the engine sweeping up into the silencer
    const hdr = new THREE.CatmullRomCurve3([V(-0.05, 0.2, 0.12), V(-0.1, 0.2, -0.05), V(-0.12, 0.34, -0.22), V(-0.105, 0.5, -0.34), exA.clone().addScaledVector(dn, 0.02)]);
    const hg = new THREE.TubeGeometry(hdr, 36, 0.027, 12, false);
    const huv = hg.attributes.uv; for (let i = 0; i < huv.count; i++) huv.setXY(i, 0.5, 0.03);
    this.#geo(hg, m.ti);
    // tapered titanium silencer (lathe along its own axis)
    const prof = [[0.0, -0.01], [0.03, -0.01], [0.046, 0.02], [0.052, 0.08], [0.051, len - 0.06], [0.047, len - 0.01], [0.045, len]];
    const sil = new THREE.LatheGeometry(prof.map(([r, a]) => new THREE.Vector2(r, a)), 24);
    this.#geo(orientY(sil, exA, exB), m.ti);
    // flared outlet with black bore
    const outlet = new THREE.LatheGeometry([[0.045, 0], [0.047, 0.012], [0.042, 0.018], [0.036, 0.01]].map(([r, a]) => new THREE.Vector2(r, a)), 24);
    this.#geo(orientY(outlet, exB, exB.clone().add(dn)), m.ti);
    const bore = new THREE.CircleGeometry(0.037, 20); bore.rotateX(-Math.PI / 2);
    this.#geo(orientY(bore, exB.clone().addScaledVector(dn, 0.006), exB.clone().addScaledVector(dn, 2)), m.ink);
    // carbon heat shield wrapping the outer / lower face
    const hs = new THREE.CylinderGeometry(0.062, 0.058, len * 0.62, 20, 1, true, Math.PI * 1.1, Math.PI * 1.1);
    hs.translate(0, len * 0.5, 0);
    this.#geo(orientY(hs, exA, exB), m.carbon);
    // hanger bracket to the subframe
    this.#geo(cylBetween(exA.clone().lerp(exB, 0.7).add(V(0, 0.04, 0)), V(-0.07, 0.86, -0.62), 0.008, 0.008, 6), m.alu);
    this.exhaustTip = exB.clone().addScaledVector(dn, 0.06);
  }

  #rearsets() {
    const m = this.m;
    this.pegs = {};
    for (const sx of [-1, 1]) {
      const peg = V(sx * 0.165, 0.5, -0.38);
      this.pegs[sx > 0 ? 'l' : 'r'] = peg;
      const hp = shapeOf([[-0.27, 0.64], [-0.24, 0.6], [-0.35, 0.52], [-0.4, 0.47], [-0.43, 0.49], [-0.37, 0.56], [-0.3, 0.66]]);
      this.#geo(slabX(hp, 0.012, sx * 0.148, 0.003, 4), m.alu);                         // hanger
      this.#geo(slabX(shapeOf([[-0.36, 0.49], [-0.42, 0.47], [-0.45, 0.53], [-0.41, 0.6], [-0.37, 0.57]]), 0.006, sx * 0.156, 0.002), m.alu); // heel plate
      this.#geo(cylBetween(V(sx * 0.15, 0.5, -0.38), V(sx * 0.235, 0.5, -0.38), 0.011, 0.011, 10), m.dark);  // knurled peg
      this.#geo(cylBetween(V(sx * 0.235, 0.5, -0.38), V(sx * 0.242, 0.5, -0.38), 0.012, 0.01, 10), m.alu);
      // shift lever (left) / brake lever (right) running forward under the toe
      this.#geo(cylBetween(V(sx * 0.16, 0.495, -0.37), V(sx * 0.17, 0.47, -0.22), 0.006, 0.006, 6), m.alu);
      this.#geo(cylBetween(V(sx * 0.16, 0.47, -0.22), V(sx * 0.2, 0.47, -0.22), 0.006, 0.006, 6), m.dark);
    }
  }

  // Merge static parts by material: fewer draw calls for the player bike and the ghost.
  #mergeStatic() {
    const byMat = new Map();
    for (const mesh of this.static) {
      mesh.updateMatrix();
      const g = clean(mesh.geometry.clone());
      g.applyMatrix4(mesh.matrix);
      if (mesh.material === this.m.carbon) boxUV(g, 22);
      if (!byMat.has(mesh.material)) byMat.set(mesh.material, []);
      byMat.get(mesh.material).push(g);
      this.body.remove(mesh);
    }
    for (const [mat, list] of byMat) this.body.add(new THREE.Mesh(mergeGeometries(list, false), mat));
    this.static = [];
  }

  #wheel(front) {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    g.add(spin);
    // geometry is identical for every bike (player + ghost): build once per wheel, share it
    const key = front ? 'front' : 'rear';
    if (!wheelCache.has(key)) wheelCache.set(key, BikeModel.#wheelGeo(front));
    for (const [name, geo] of wheelCache.get(key)) spin.add(new THREE.Mesh(geo, this.m[name]));
    g.userData.spin = spin;
    return g;
  }

  static #wheelGeo(front) {
    const m = { rubber: 'rubber', rim: 'rim', alu: 'alu', disc: 'disc' };
    const parts = new Map();
    const put = (mat, geo) => { if (!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(clean(geo)); };
    // slick tyre (true section profile)
    const Wt = front ? 0.12 : 0.19, N = 28, tp = [];
    for (let i = 0; i <= N; i++) { const psi = -TYRE.Psi + 2 * TYRE.Psi * i / N; tp.push([TYRE.rc + (TYRE.Ro - TYRE.rc) * Math.cos(psi), (Wt / 2) * Math.sin(psi)]); }
    put(m.rubber, latheX(tp, 72));
    // forged rim: barrel + flanges, then 7 swept spokes
    const wr = front ? 0.046 : 0.074;
    const rp = [[0.226, wr + 0.004], [0.214, wr + 0.007], [0.2, wr], [0.192, wr - 0.012], [0.188, 0], [0.192, -wr + 0.012], [0.2, -wr], [0.214, -wr - 0.007], [0.226, -wr - 0.004]];
    put(m.rim, latheX(rp, 64));
    const spokes = 7;
    for (let k = 0; k < spokes; k++) {
      const s = new THREE.Shape(), rs = [0.05, 0.075, 0.105, 0.135, 0.162, 0.18, 0.19, 0.198], hw = [0.02, 0.015, 0.011, 0.0095, 0.0095, 0.012, 0.018, 0.026];
      const off = (r) => 0.018 * ((r - 0.05) / 0.15) ** 2;
      rs.forEach((r, i) => i ? s.lineTo(off(r) - hw[i], r) : s.moveTo(off(r) - hw[i], r));
      for (let i = rs.length - 1; i >= 0; i--) s.lineTo(off(rs[i]) + hw[i], rs[i]);
      const sg = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 2, curveSegments: 1 });
      sg.translate(0, 0, -0.009); sg.rotateY(Math.PI / 2); sg.rotateX(k * TAU / spokes);
      if (!front) sg.translate(0.012, 0, 0);
      put(m.rim, smoothNormals(sg, 50));
    }
    // hub
    const hw2 = front ? 0.07 : 0.1;
    put(m.alu, latheX([[0.013, -hw2], [0.03, -hw2], [0.033, -hw2 + 0.012], [0.058, -hw2 + 0.016], [0.06, -hw2 + 0.026], [0.046, -hw2 + 0.03], [0.043, 0], [0.046, hw2 - 0.03], [0.06, hw2 - 0.026], [0.058, hw2 - 0.016], [0.033, hw2 - 0.012], [0.03, hw2], [0.013, hw2]], 24));
    // drilled floating discs on alloy carriers with bobbins
    const disc = (rO, rI, x, rows, per, carrierR, arms) => {
      const s = circlePath(0, 0, rO, 72, THREE.Shape);
      s.holes.push(circlePath(0, 0, rI, 72));
      for (let row = 0; row < rows; row++) {
        const rr = rI + (rO - rI) * (row + 1) / (rows + 1);
        for (let k = 0; k < per; k++) { const a = (k + row / rows) / per * TAU; s.holes.push(circlePath(Math.cos(a) * rr, Math.sin(a) * rr, 0.0034, 7)); }
      }
      put(m.disc, slabX(s, 0.0055, x, 0, 1));
      const cs = new THREE.Shape(), NN = arms * 16;
      for (let i = 0; i < NN; i++) { const a = i / NN * TAU, lob = Math.pow(Math.max(0, Math.cos(arms * a)), 1.6); const r = lerp(carrierR, rI + 0.008, ss(0.0, 0.55, lob)); i ? cs.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cs.moveTo(r, 0); }
      cs.holes.push(circlePath(0, 0, 0.03, 16));
      put(m.alu, slabX(cs, 0.008, x + Math.sign(x) * 0.003, 0.0015, 1));
      for (let k = 0; k < arms; k++) { const a = k / arms * TAU; put(m.alu, cylBetween(V(x - 0.007, Math.sin(a) * (rI + 0.002), Math.cos(a) * (rI + 0.002)), V(x + 0.007, Math.sin(a) * (rI + 0.002), Math.cos(a) * (rI + 0.002)), 0.0065, 0.0065, 8)); }
    };
    if (front) { disc(0.168, 0.124, 0.078, 3, 14, 0.066, 6); disc(0.168, 0.124, -0.078, 3, 14, 0.066, 6); }
    else {
      disc(0.11, 0.08, -0.1, 2, 10, 0.05, 5);
      // rear sprocket (left) with lightening holes
      const sp = new THREE.Shape(), T = 42;
      for (let i = 0; i < T; i++) {
        const a = i / T * TAU, da = TAU / T;
        const pts = [[0.1, a], [0.1, a + da * 0.2], [0.109, a + da * 0.38], [0.109, a + da * 0.62], [0.1, a + da * 0.8]];
        pts.forEach(([r, aa], k) => (i === 0 && k === 0) ? sp.moveTo(Math.cos(aa) * r, Math.sin(aa) * r) : sp.lineTo(Math.cos(aa) * r, Math.sin(aa) * r));
      }
      sp.holes.push(circlePath(0, 0, 0.042, 20));
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; sp.holes.push(circlePath(Math.cos(a) * 0.068, Math.sin(a) * 0.068, 0.017, 12)); }
      put(m.alu, slabX(sp, 0.006, 0.112, 0, 1));
      put(m.alu, latheX([[0.03, 0.08], [0.05, 0.085], [0.05, 0.108], [0.03, 0.112]], 16));   // sprocket carrier
    }
    return [...parts].map(([name, list]) => [name, mergeGeometries(list, false)]);
  }

  // ---------------------------------------------------------------- rider (skinned leathers + helmet)
  #buildRider() {
    const m = this.m;
    this.rider = new THREE.Group();
    this.body.add(this.rider);
    const names = ['pelvis', 'chest', 'neck',
      'upper_l', 'elbow_l', 'fore_l', 'hand_l', 'upper_r', 'elbow_r', 'fore_r', 'hand_r',
      'thigh_l', 'knee_l', 'shin_l', 'foot_l', 'thigh_r', 'knee_r', 'shin_r', 'foot_r'];
    const bindY = { pelvis: 0, chest: 0.18, neck: 0.52, upper: 0, elbow: 0.28, fore: 0.28, hand: 0, thigh: 0, knee: 0.42, shin: 0.42, foot: 0 };
    const B = this.B = {};
    this.bones = names.map((n, i) => { const b = new THREE.Bone(); b.name = n; b.matrixAutoUpdate = false; B[n] = i; this.rider.add(b); return b; });
    const inv = names.map(n => new THREE.Matrix4().makeTranslation(0, -bindY[n.split('_')[0]], 0));
    const skel = new THREE.Skeleton(this.bones, inv);
    const blend = (b1, b2, t) => t <= 0 ? [[b1, 1]] : t >= 1 ? [[b2, 1]] : [[b1, 1 - t], [b2, t]];

    // --- upper body: pelvis + torso + neck + aero hump
    const up = [];
    const torsoKeys = [
      [-0.165, 0.0, 0.0, 0.0, -0.02], [-0.15, 0.08, 0.05, 0.07, -0.02], [-0.12, 0.13, 0.075, 0.105, -0.015], [-0.07, 0.165, 0.09, 0.13, -0.01],
      [0.0, 0.18, 0.1, 0.13, -0.005], [0.07, 0.172, 0.098, 0.118, 0], [0.14, 0.158, 0.094, 0.104, 0], [0.22, 0.156, 0.096, 0.1, 0],
      [0.3, 0.166, 0.106, 0.1, 0], [0.38, 0.18, 0.118, 0.104, 0], [0.45, 0.192, 0.112, 0.104, 0], [0.5, 0.186, 0.094, 0.098, 0],
      [0.55, 0.15, 0.07, 0.08, 0], [0.585, 0.09, 0.056, 0.062, 0.0], [0.605, 0.0, 0.0, 0.0, 0.0],
    ];
    const tts = [-0.165, -0.155, -0.14, -0.12, -0.095, -0.07, -0.04, -0.01, 0.02, 0.05, 0.08, 0.11, 0.14, 0.17, 0.2, 0.23, 0.26, 0.3, 0.34, 0.38, 0.42, 0.45, 0.48, 0.51, 0.54, 0.565, 0.585, 0.598, 0.605];
    const torsoW = (t) => t < 0.52 ? blend(B.pelvis, B.chest, ss(0.06, 0.26, t)) : blend(B.chest, B.neck, ss(0.54, 0.62, t) * 0.4);
    up.push(loft(profile(torsoKeys, tts, torsoW, 2.3), 32, { rect: RECT.torso }));
    // hump on the back (chest bone), protruding behind the neck
    const humpKeys = [[0.2, 0.0, 0.0, 0.0, -0.085], [0.24, 0.06, 0.04, 0.02, -0.085], [0.32, 0.1, 0.05, 0.04, -0.085], [0.42, 0.108, 0.05, 0.058, -0.087],
      [0.5, 0.098, 0.05, 0.07, -0.088], [0.57, 0.078, 0.05, 0.074, -0.086], [0.63, 0.05, 0.045, 0.058, -0.08], [0.665, 0.02, 0.025, 0.03, -0.075], [0.675, 0.0, 0.0, 0.0, -0.07]];
    const hts = [0.2, 0.22, 0.25, 0.29, 0.33, 0.37, 0.41, 0.45, 0.49, 0.53, 0.57, 0.6, 0.63, 0.65, 0.665, 0.675];
    up.push(loft(profile(humpKeys, hts, () => [[B.chest, 1]], 2.2), 24, { rect: RECT.hump }));
    // neck + collar
    const neckKeys = [[0.47, 0.058, 0.058, 0.06, 0.0], [0.54, 0.056, 0.056, 0.056, 0.005], [0.62, 0.05, 0.05, 0.05, 0.012], [0.7, 0.048, 0.048, 0.048, 0.02], [0.72, 0.0, 0.0, 0.0, 0.02]];
    up.push(loft(profile(neckKeys, [0.47, 0.5, 0.54, 0.58, 0.62, 0.66, 0.7, 0.715, 0.72], (t) => blend(B.chest, B.neck, ss(0.52, 0.6, t))), 16, { rect: RECT.neck }));
    const upperGeo = mergeGeometries(up.map(g => g.toNonIndexed()), false);

    // --- limbs: arms, gloves, legs, boots, armour
    const lim = [];
    for (const s of ['l', 'r']) {
      const mir = s === 'r';
      const U = B['upper_' + s], E = B['elbow_' + s], F = B['fore_' + s], H = B['hand_' + s];
      const T = B['thigh_' + s], K = B['knee_' + s], S = B['shin_' + s], Ft = B['foot_' + s];
      // arm: shoulder (0) -> elbow (0.28) -> wrist (0.54). Outer side = -x (canonical left).
      const armKeys = [[-0.075, 0.0, 0.0, 0.0], [-0.065, 0.035, 0.035, 0.035], [-0.04, 0.056, 0.055, 0.055], [0.02, 0.062, 0.058, 0.057], [0.09, 0.056, 0.055, 0.05],
        [0.15, 0.05, 0.053, 0.046], [0.21, 0.046, 0.046, 0.044], [0.26, 0.043, 0.04, 0.046], [0.28, 0.044, 0.039, 0.049], [0.31, 0.046, 0.043, 0.047], [0.36, 0.047, 0.045, 0.043],
        [0.415, 0.041, 0.039, 0.038], [0.424, 0.041, 0.039, 0.038], [0.43, 0.05, 0.048, 0.047], [0.47, 0.047, 0.044, 0.044], [0.52, 0.04, 0.036, 0.036], [0.545, 0.03, 0.028, 0.028], [0.555, 0.0, 0.0, 0.0]];
      const ats = [-0.075, -0.07, -0.06, -0.04, -0.01, 0.03, 0.07, 0.11, 0.15, 0.19, 0.22, 0.245, 0.265, 0.28, 0.295, 0.315, 0.34, 0.37, 0.4, 0.418, 0.424, 0.43, 0.45, 0.48, 0.51, 0.53, 0.545, 0.555];
      const armW = (t) => t < 0.28 ? blend(U, E, ss(0.2, 0.28, t)) : blend(E, F, ss(0.28, 0.36, t));
      lim.push(loft(profile(armKeys, ats, armW), 20, { rect: RECT.arm, mirror: mir }));
      lim.push(loft(shellRings(-0.03, 0.015, 0.0, 0.034, 0.075, 0.056, [[U, 1]], 2.2), 16, { rect: RECT.shoulder, mirror: mir }));
      lim.push(loft(shellRings(-0.012, 0.28, -0.044, 0.03, 0.045, 0.014, [[E, 1]], 2.4), 14, { rect: RECT.elbow, mirror: mir }));
      // gloved fist around the grip (hand bone: +y along the fist, +z = back of hand)
      const handKeys = [[0.0, 0.03, 0.021, 0.023, 0.0], [0.03, 0.04, 0.025, 0.03, 0.0], [0.06, 0.046, 0.026, 0.038, -0.004], [0.09, 0.047, 0.025, 0.043, -0.008],
        [0.11, 0.044, 0.02, 0.039, -0.012], [0.125, 0.035, 0.013, 0.028, -0.015], [0.136, 0.0, 0.0, 0.0, -0.016]];
      lim.push(loft(profile(handKeys, [0, 0.015, 0.03, 0.045, 0.06, 0.075, 0.09, 0.1, 0.11, 0.12, 0.128, 0.136], () => [[H, 1]], 3), 18, { rect: RECT.hand, mirror: mir }));
      lim.push(loft(shellRings(0.0, 0.072, 0.026, 0.04, 0.026, 0.011, [[H, 1]], 2.6), 12, { rect: RECT.knuckle, mirror: mir }));
      lim.push(loft(shellRings(0.045, 0.055, -0.012, 0.014, 0.036, 0.015, [[H, 1]], 2), 10, { rect: RECT.thumb, mirror: mir }));
      // leg: hip (0) -> knee (0.42) -> ankle (0.84). Outer side = -x.
      const legKeys = [[-0.11, 0.0, 0.0, 0.0], [-0.095, 0.055, 0.055, 0.06], [-0.07, 0.08, 0.078, 0.085], [-0.02, 0.09, 0.086, 0.092], [0.05, 0.09, 0.088, 0.088], [0.12, 0.085, 0.082, 0.078],
        [0.2, 0.077, 0.074, 0.068], [0.28, 0.067, 0.064, 0.058], [0.35, 0.058, 0.055, 0.05], [0.39, 0.055, 0.057, 0.048], [0.42, 0.055, 0.061, 0.046], [0.45, 0.052, 0.056, 0.048],
        [0.5, 0.048, 0.046, 0.058], [0.57, 0.05, 0.042, 0.066], [0.64, 0.046, 0.04, 0.056], [0.72, 0.04, 0.036, 0.043], [0.8, 0.034, 0.032, 0.035], [0.86, 0.03, 0.03, 0.03], [0.875, 0.0, 0.0, 0.0]];
      const lts = [-0.11, -0.1, -0.085, -0.06, -0.02, 0.03, 0.09, 0.15, 0.21, 0.27, 0.31, 0.345, 0.375, 0.4, 0.42, 0.44, 0.465, 0.49, 0.52, 0.56, 0.6, 0.65, 0.7, 0.76, 0.82, 0.86, 0.875];
      const legW = (t) => t < 0.42 ? blend(T, K, ss(0.3, 0.42, t)) : blend(K, S, ss(0.42, 0.54, t));
      lim.push(loft(profile(legKeys, lts, legW), 22, { rect: RECT.leg, mirror: mir }));
      // knee slider puck on the outside of the knee
      lim.push(loft(shellRings(-0.062, 0.425, 0.006, 0.02, 0.056, 0.037, [[K, 1]], 2.4, 10), 14, { rect: RECT.knee, mirror: mir }));
      // race boot: shaft on the shin, foot on the foot bone, toe slider + ankle guard + heel cup
      const bootKeys = [[0.596, 0.043, 0.038, 0.052], [0.6, 0.053, 0.047, 0.065], [0.606, 0.057, 0.051, 0.069], [0.65, 0.055, 0.049, 0.064], [0.72, 0.051, 0.047, 0.053], [0.8, 0.048, 0.046, 0.048], [0.86, 0.049, 0.05, 0.05], [0.91, 0.044, 0.045, 0.045], [0.93, 0.0, 0.0, 0.0]];
      lim.push(loft(profile(bootKeys, [0.596, 0.6, 0.606, 0.63, 0.67, 0.72, 0.77, 0.82, 0.86, 0.9, 0.92, 0.93], () => [[S, 1]], 2.2), 20, { rect: RECT.boot, mirror: mir }));
      lim.push(loft(shellRings(-0.05, 0.84, 0.0, 0.012, 0.03, 0.03, [[S, 1]], 2), 10, { rect: RECT.ankle, mirror: mir }));
      const footKeys = [[-0.095, 0.0, 0.0, 0.0, -0.02], [-0.085, 0.03, 0.035, 0.04, -0.025], [-0.05, 0.043, 0.06, 0.066, -0.015], [0.0, 0.047, 0.066, 0.078, -0.01], [0.05, 0.049, 0.05, 0.079, -0.012],
        [0.1, 0.05, 0.038, 0.073, -0.016], [0.15, 0.047, 0.03, 0.062, -0.021], [0.19, 0.038, 0.022, 0.05, -0.024], [0.215, 0.024, 0.014, 0.034, -0.026], [0.228, 0.0, 0.0, 0.0, -0.028]];
      lim.push(loft(profile(footKeys, [-0.095, -0.088, -0.07, -0.045, -0.02, 0.01, 0.04, 0.07, 0.1, 0.13, 0.16, 0.185, 0.205, 0.218, 0.228], () => [[Ft, 1]], 2.6), 20, { rect: RECT.foot, mirror: mir }));
      lim.push(loft(shellRings(-0.047, 0.16, -0.05, 0.01, 0.036, 0.018, [[Ft, 1]], 2.2), 10, { rect: RECT.toe, mirror: mir }));
      lim.push(loft(shellRings(0.0, -0.07, -0.035, 0.032, 0.02, 0.04, [[Ft, 1]], 2.2), 10, { rect: RECT.heel, mirror: mir }));
    }
    const limbGeo = mergeGeometries(lim.map(g => g.toNonIndexed()), false);
    const upper = new THREE.SkinnedMesh(upperGeo, m.leather);
    const limbs = new THREE.SkinnedMesh(limbGeo, m.leather);
    for (const sm of [upper, limbs]) { sm.bind(skel, new THREE.Matrix4()); sm.frustumCulled = false; this.rider.add(sm); }
    // main.js hides these four (+ helmet) for the onboard camera: all point at the upper-body mesh.
    this.limbs = { torso: upper, hump: upper, neck: upper, pelvis: upper, arms: limbs, legs: limbs };
    this.helmet = this.#buildHelmet();
    this.rider.add(this.helmet);
    this.kneeL = V(0, 0, 0); this.kneeR = V(0, 0, 0);
    this.anch = {
      hip: V(), Yp: V(), lumbar: V(), Yc: V(), c7: V(), Yn: V(), Yh: V(),
      arm: { l: { wr: V(), pole: V() }, r: { wr: V(), pole: V() } },
      leg: { l: { ankle: V(), pole: V(), foot: V() }, r: { ankle: V(), pole: V(), foot: V() } },
    };
    if (AI_RIDER) {
      // the procedural body still computes the pose; the generated rider is what you see
      upper.visible = false; limbs.visible = false; this.helmet.visible = false;
      this.ai = new AIRider(AI_RIDER, this.rider);
      this.limbs = { torso: this.ai.mesh, hump: this.ai.mesh, neck: this.ai.mesh, pelvis: this.ai.mesh, arms: this.ai.mesh, legs: this.ai.mesh };
      this.helmet = new THREE.Object3D();
    }
    this.pose(0, 0, 1);
  }

  #buildHelmet() {
    const m = this.m;
    const grp = new THREE.Group();
    const d = new THREE.Vector3(), o = new THREE.Vector3();
    const deform = (g, scale = 1, cx = 0, cy = 0.012, cz = -0.008) => {
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        d.fromBufferAttribute(p, i).normalize();
        helmetPt(d, o);
        p.setXYZ(i, cx + (o.x - cx) * scale, cy + (o.y - cy) * scale, cz + (o.z - cz) * scale);
      }
      g.computeVertexNormals();
      return weldNormals(g);
    };
    const shell = deform(new THREE.SphereGeometry(1, 56, 36));
    const visor = deform(new THREE.SphereGeometry(1, 26, 8, Math.PI / 2 - 1.03, 2.06, Math.PI * 0.385, Math.PI * 0.165), 1.028);
    const trim = [];
    const surf = (dir, lift = 0) => { d.copy(dir).normalize(); helmetPt(d, o); return o.clone().add(V(0, 0, 0)).addScaledVector(d, lift); };
    // rear spoiler: aerofoil lip across the back of the shell
    const sp = shapeOf([[0.012, -0.004], [-0.015, 0.014], [-0.05, 0.02], [-0.066, 0.014], [-0.045, 0.002], [-0.012, -0.012]]);
    const spg = new THREE.ExtrudeGeometry(sp, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.004, bevelSegments: 2, curveSegments: 4 });
    spg.translate(0, 0, -0.055); spg.rotateY(-Math.PI / 2);   // shape x -> z (forward), extrude -> x
    const sb = surf(V(0, 0.5, -0.87));
    spg.translate(0, sb.y, sb.z + 0.012);
    trim.push(smoothNormals(spg, 45));
    for (const sx of [-1, 1]) {
      const fin = shapeOf([[0.0, -0.01], [-0.045, 0.012], [-0.068, 0.018], [-0.05, 0.0]]);
      trim.push(slabX(fin, 0.005, sx * 0.058, 0.002).translate(0, sb.y - 0.004, sb.z + 0.012));
      // visor pivot pods
      const pv = surf(V(sx * 0.97, 0.05, 0.22));
      trim.push(cylBetween(pv.clone().addScaledVector(XA, -sx * 0.006), pv.clone().addScaledVector(XA, sx * 0.007), 0.015, 0.013, 14));
      // brow intake scoops
      const sc = new THREE.SphereGeometry(1, 10, 6, 0, TAU, 0, Math.PI / 2);
      sc.scale(0.011, 0.006, 0.03); sc.rotateX(0.5); const sp2 = surf(V(sx * 0.2, 0.8, 0.56)); sc.translate(sp2.x, sp2.y - 0.002, sp2.z);
      trim.push(sc);
    }
    // chin vent grille
    const cv = surf(V(0, -0.5, 0.86));
    trim.push(boxAt(0.05, 0.022, 0.012, cv, -0.55));
    grp.add(new THREE.Mesh(shell, m.helmet), new THREE.Mesh(visor, m.visor), new THREE.Mesh(mergeGeometries(trim.map(g => clean(g)), false), m.paintInk));
    return grp;
  }

  #setBone(i, origin, Y, Zhint) {
    const b = this.bones[i];
    _Y.copy(Y).normalize();
    _Z.copy(Zhint).addScaledVector(_Y, -Zhint.dot(_Y)).normalize();
    _X.crossVectors(_Y, _Z);
    b.matrix.makeBasis(_X, _Y, _Z).setPosition(origin);
    b.matrixWorldNeedsUpdate = true;
    return b.matrix;
  }

  // hang: -1..1 (+ = hanging off to the right), tuck: 0..1, brake: 0..1 (sit up)
  pose(hang, lean, tuck, brake = 0) {
    const B = this.B, P = this._ps || (this._ps = {
      hip: V(), Yp: V(), Zp: V(), Xp: V(), lumbar: V(), Yc: V(), Zc: V(), Xc: V(), c7: V(), Yn: V(), Zn: V(),
      mid: V(), end: V(), sh: V(), wr: V(), pole: V(), nz: V(), Yu: V(), Yf: V(), t: V(), hj: V(), Yft: V(), Zft: V(), ank: V(), kp: V(), kp2: V(), Yt: V(), Ys: V(),
    });
    const h = clamp(hang, -1, 1), ah = Math.abs(h);
    const up = clamp(1 - tuck + brake * 0.6, 0, 1);
    // hips slide across the seat to the inside; pelvis, chest and head progressively yaw/roll into the corner
    const fit = this.fit || { dy: 0, dz: 0 };
    const hip = P.hip.set(-h * 0.17, 0.985 + fit.dy - ah * 0.03, -0.3 + fit.dz - up * 0.015);
    const pa = lerp(0.95, 1.12, up);
    _q.setFromEuler(_e.set(0, -h * 0.18, h * 0.14));
    P.Yp.set(0, Math.sin(pa), Math.cos(pa)).applyQuaternion(_q); P.Zp.set(0, -Math.cos(pa), Math.sin(pa)).applyQuaternion(_q);
    P.Xp.setFromMatrixColumn(this.#setBone(B.pelvis, hip, P.Yp, P.Zp), 0);
    const An = this.anch;
    An.hip.copy(hip); An.Yp.copy(P.Yp);
    const lumbar = P.lumbar.copy(hip).addScaledVector(P.Yp, 0.18);
    const ca = lerp(0.1, 0.66, up);
    _q.setFromEuler(_e.set(0, -h * 0.28, h * 0.26));
    P.Yc.set(0, Math.sin(ca), Math.cos(ca)).applyQuaternion(_q); P.Zc.set(0, -Math.cos(ca), Math.sin(ca)).applyQuaternion(_q);
    P.Xc.setFromMatrixColumn(this.#setBone(B.chest, lumbar, P.Yc, P.Zc), 0);
    const c7 = P.c7.copy(lumbar).addScaledVector(P.Yc, 0.34);
    const na = lerp(0.3, 1.05, up);
    _q.setFromEuler(_e.set(0, -h * 0.4, h * 0.08));
    P.Yn.set(0, Math.sin(na), Math.cos(na)).applyQuaternion(_q); P.Zn.set(0, -Math.cos(na), Math.sin(na)).applyQuaternion(_q);
    this.#setBone(B.neck, c7, P.Yn, P.Zn);
    this.helmet.position.copy(c7).addScaledVector(P.Yn, 0.15);
    An.lumbar.copy(lumbar); An.Yc.copy(P.Yc); An.c7.copy(c7); An.Yn.copy(P.Yn);
    An.Yh.copy(P.Yn).add(_v1.set(-h * 0.25, 1.2, 0)).normalize(); // head lifts to look up the road, dips into the turn
    this.helmet.rotation.set(-0.12 + up * 0.22, -h * 0.35, -lean * 0.45);

    const { mid, end, t } = P;
    for (let k = 0; k < 2; k++) {
      const s = k ? 'r' : 'l', sg = k ? -1 : 1;
      const inside = Math.max(0, -sg * h), outside = Math.max(0, sg * h);
      // --- arm: shoulder -> wrist IK, elbows out and down; outside arm reaches over the tank
      const sh = P.sh.copy(lumbar).addScaledVector(P.Xc, sg * 0.168).addScaledVector(P.Yc, 0.27);
      const grip = this.grip[s];
      P.wr.copy(grip).add(t.set(-sg * 0.004, 0.024, -0.058));
      const pole = P.pole.set(sg * (1 + outside * 0.4), -0.75 - inside * 0.45 + outside * 0.12, -0.12 + inside * 0.25 - outside * 0.1).normalize();
      ik(sh, P.wr, 0.28, 0.26, pole, mid, end);
      An.arm[s].wr.copy(P.wr); An.arm[s].pole.copy(pole);
      P.Yu.subVectors(mid, sh).normalize(); P.Yf.subVectors(end, mid).normalize();
      P.nz.copy(pole).negate();
      this.#setBone(B['upper_' + s], sh, P.Yu, P.nz);
      this.#setBone(B['elbow_' + s], mid, t.addVectors(P.Yu, P.Yf), P.nz);
      this.#setBone(B['fore_' + s], mid, P.Yf, P.nz);
      this.#setBone(B['hand_' + s], end, t.copy(grip).add(_v1.set(0, -0.01, 0.022)).sub(end), _v2.set(sg * 0.35, 1, 0.25));
      // --- leg: hip -> ankle IK with the ball of the boot on the peg; inside knee swings out when hanging off
      const hj = P.hj.copy(hip).addScaledVector(P.Xp, sg * 0.095);
      const Yft = P.Yft.set(sg * (0.1 + inside * 0.25), -0.32, 1).normalize();
      _v1.set(0, 1, 0.3);
      const Zft = P.Zft.copy(_v1).addScaledVector(Yft, -_v1.dot(Yft)).normalize();
      const ankle = P.ank.copy(this.pegs[s]).addScaledVector(Yft, -0.1).addScaledVector(Zft, 0.09);
      const kp = P.kp.set(sg * (0.35 + outside * 0.7), 0.3, 1).lerp(P.kp2.set(sg, -0.12, 0.95), ss(0.05, 1, inside)).normalize();
      ik(hj, ankle, 0.42, 0.42, kp, mid, end);
      An.leg[s].ankle.copy(ankle); An.leg[s].pole.copy(kp); An.leg[s].foot.copy(Yft);
      P.Yt.subVectors(mid, hj).normalize(); P.Ys.subVectors(end, mid).normalize();
      this.#setBone(B['thigh_' + s], hj, P.Yt, kp);
      const mk = this.#setBone(B['knee_' + s], mid, t.addVectors(P.Yt, P.Ys), kp);
      this.#setBone(B['shin_' + s], mid, P.Ys, kp);
      this.#setBone(B['foot_' + s], end, Yft, Zft);
      // knee slider position (rider space): outer face of the knee puck
      (k ? this.kneeR : this.kneeL).set(-sg * 0.085, 0.005, 0.006).applyMatrix4(mk);
    }
    if (this.ai) { this.rider.updateMatrixWorld(true); this.ai.apply(this.anch); }
  }

  // Called per frame with the physics state.
  update(dt, st) {
    this.wheelSpin += (st.v / 0.3) * dt;
    this.frontWheel.userData.spin.rotation.x = this.wheelSpin;
    this.rearWheel.userData.spin.rotation.x = this.wheelSpin;
    this.leanG.rotation.z = st.lean;
    const p = st.pitch || 0;
    if (p < 0) { this.pitchG.position.set(0, 0, -0.72); this.body.position.set(0, 0, 0.72); }
    else { this.pitchG.position.set(0, 0, 0.7); this.body.position.set(0, 0, -0.7); }
    this.pitchG.rotation.x = p;
    const hang = Math.max(-1, Math.min(1, st.lean / 0.9));
    this.pose(hang, st.lean, st.tuck, st.brake);
    this.m.disc.emissiveIntensity = Math.min(3, st.discHeat * 3);
    this.root.updateMatrixWorld(true);
  }

  kneeWorld(right, out) {
    out.copy(right ? this.kneeR : this.kneeL);
    return this.rider.localToWorld(out);
  }
}

// Generated, auto-rigged rider (assets/rider-ai.glb, Mixamo-style bone names). Each frame its bones are swung
// onto the joint targets the procedural pose() computes (hips, spine, head, two-bone IK for arms and legs),
// using the model's own limb lengths.
const _wq = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _sq = new THREE.Quaternion();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3(), _mid = new THREE.Vector3(), _end = new THREE.Vector3();
class AIRider {
  constructor(src, parent) {
    this.root = cloneSkinned(src);
    parent.add(this.root);
    this.bones = {};
    this.root.traverse(o => {
      if (o.isBone) this.bones[o.name] = o;
      if (o.isMesh) {
        o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true;
        const m = o.material = o.material.clone();
        m.emissiveMap = null; m.emissive && m.emissive.set(0);
        m.roughness = 0.55; m.metalness = 0.05;
        this.mesh = o;
      }
    });
    this.bind = Object.values(this.bones).map(b => [b, b.position.clone(), b.quaternion.clone()]);
    this.root.updateMatrixWorld(true);
    const B = this.bones, dist = (a, b) => B[a].getWorldPosition(_a).distanceTo(B[b].getWorldPosition(_b));
    this.len = {
      thigh: dist('LeftUpLeg', 'LeftLeg'), shin: dist('LeftLeg', 'LeftFoot'),
      upper: dist('LeftArm', 'LeftForeArm'), fore: dist('LeftForeArm', 'LeftHand'),
    };
    this.parent = parent;
  }

  // Rotate `bone` (in world space) so the direction to `child` becomes `dir` (world).
  #aim(bone, child, dir) {
    const t = (this._t || (this._t = new THREE.Vector3())).copy(dir).normalize();
    bone.updateMatrixWorld(true);
    bone.getWorldPosition(_a); child.getWorldPosition(_b);
    _d.subVectors(_b, _a).normalize();
    _sq.setFromUnitVectors(_d, t);
    bone.getWorldQuaternion(_wq).premultiply(_sq);
    bone.parent.getWorldQuaternion(_pq).invert();
    bone.quaternion.copy(_pq.multiply(_wq));
    bone.updateMatrixWorld(true);
  }

  apply(A) {
    const B = this.bones, P = this.parent;
    for (const [b, p, q] of this.bind) { b.position.copy(p); b.quaternion.copy(q); }
    this.root.updateMatrixWorld(true);
    const W = (v, out) => P.localToWorld(out.copy(v));
    const D = (v, out) => out.copy(v).transformDirection(P.matrixWorld);
    const v1 = this._v1 || (this._v1 = new THREE.Vector3()), v2 = this._v2 || (this._v2 = new THREE.Vector3());
    // hips onto the seat
    const hips = B.Hips;
    hips.parent.worldToLocal(W(A.hip, v1));
    hips.position.copy(v1);
    hips.updateMatrixWorld(true);
    this.#aim(hips, B.Spine02, D(A.Yp, v1));
    this.#aim(B.Spine02, B.Spine01, D(v2.copy(A.Yp).lerp(A.Yc, 0.5), v1));
    this.#aim(B.Spine01, B.Spine, D(A.Yc, v1));
    this.#aim(B.Spine, B.neck, D(A.Yc, v1));
    this.#aim(B.neck, B.Head, D(A.Yn, v1));
    this.#aim(B.Head, B.head_end, D(A.Yh, v1));
    const L = this.len;
    for (const s of ['l', 'r']) {
      const side = s === 'l' ? 'Left' : 'Right';
      const arm = A.arm[s], leg = A.leg[s];
      // arm: shoulder -> wrist on the grip
      const sh = B[side + 'Arm'].getWorldPosition(v1);
      const wr = W(arm.wr, v2);
      ik(sh, wr, L.upper, L.fore, D(arm.pole, _d).clone(), _mid, _end);
      this.#aim(B[side + 'Arm'], B[side + 'ForeArm'], _a.subVectors(_mid, sh));
      this.#aim(B[side + 'ForeArm'], B[side + 'Hand'], _b.subVectors(_end, _mid));
      // leg: hip joint -> ankle on the peg
      const hj = B[side + 'UpLeg'].getWorldPosition(v1);
      const an = W(leg.ankle, v2);
      ik(hj, an, L.thigh, L.shin, D(leg.pole, _d).clone(), _mid, _end);
      this.#aim(B[side + 'UpLeg'], B[side + 'Leg'], _a.subVectors(_mid, hj));
      this.#aim(B[side + 'Leg'], B[side + 'Foot'], _b.subVectors(_end, _mid));
      this.#aim(B[side + 'Foot'], B[side + 'ToeBase'], D(leg.foot, _a));
    }
  }
}

// Ghost: same model, one additive fresnel material (skinning-aware so the rider keeps its pose).
export function makeGhost() {
  const ghostMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.gold) }, uAlpha: { value: 0.55 } },
    vertexShader: `#include <common>
      #include <skinning_pars_vertex>
      varying vec3 vN; varying vec3 vV;
      void main(){
        #include <beginnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
        vN = normalize(normalMatrix * objectNormal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAlpha; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(uColor * (0.12 + f*1.5) * uAlpha, 1.0); }`,
  });
  const b = new BikeModel();
  b.root.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; o.receiveShadow = false; } });
  b.ghostMat = ghostMat;
  return b;
}

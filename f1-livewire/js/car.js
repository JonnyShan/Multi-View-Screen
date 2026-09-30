// Procedural current-generation (ground-effect era) Formula 1 car, a drop-in for bike.js's BikeModel.
// Local space: +z forward, +y up, +x = driver's left; metres. `root` sits on the ground midway between the axles.
// Paint livery is drawn per pixel from body-space position (see LIVERY_GLSL), decals are conformal canvas-textured
// patches, and static parts are merged by material; each wheel is its own small group so it can spin and steer.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BRAND } from './brand.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const sgnPow = (v, e) => Math.sign(v) * Math.abs(v) ** e;

// Turn sign. In physics.js a positive lean / steer turns the vehicle to its right (towards local -x); the car steers
// its front wheels that way and rolls its body to the outside of the turn. Flip to -1 if the convention changes.
const TURN = 1;

// Main dimensions (m).
const CAR = {
  R: 0.36,                 // tyre outer radius (18" wheel, 720 mm tyre)
  zF: 1.8, zR: -1.8,       // axles (3.6 m wheelbase)
  xF: 0.815, xR: 0.795,    // wheel centres (2.0 m over the tyres)
  wF: 0.37, wR: 0.41,      // tyre widths
  kingpin: 0.70,           // front steering axis x
  pivotY: 0.3,             // roll / pitch centre height
  plankZ: -1.15,           // plank rear edge (skid blocks)
};

// ------------------------------------------------------------------ canvas helpers
const texCache = new Map();
const cached = (k, f) => { if (!texCache.has(k)) texCache.set(k, f()); return texCache.get(k); };
function mkCanvas(w, h, opts) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d', opts)]; }
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
const HEAVY = '"Arial Black", "Helvetica Neue", Helvetica, Arial, "Liberation Sans", "DejaVu Sans", sans-serif';

// 2x2 twill carbon weave (tile = 8 tows); colour + bump.
function carbonTex() {
  const S = 256, N = 8, cs = S / N;
  const [c, g] = mkCanvas(S, S);
  const r = rng(7);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const warp = ((i + j) & 3) < 2, x = i * cs, y = j * cs;
    const gr = warp ? g.createLinearGradient(x, 0, x + cs, 0) : g.createLinearGradient(0, y, 0, y + cs);
    const hi = warp ? 64 : 36;
    gr.addColorStop(0, grey(10)); gr.addColorStop(0.5, grey(hi)); gr.addColorStop(1, grey(10));
    g.fillStyle = gr; g.fillRect(x, y, cs, cs);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let k = 0; k < 7; k++) { const o = r() * cs; if (warp) g.fillRect(x + o, y, 1, cs); else g.fillRect(x, y + o, cs, 1); }
  }
  return canvasTex(c, { repeat: true });
}

// Tyre section: rounded-rectangle (superellipse) profile lathed about the axle. psi runs inner bead (-x) -> crown ->
// outer bead (+x); the lathe's v follows psi, so the texture rows below are laid out by psi too.
const TY = { R: CAR.R, r0: 0.225, n: 5, psiMax: 0.8 * Math.PI, N: 22 };
TY.rc = (TY.R + TY.r0) / 2; TY.hh = (TY.R - TY.r0) / 2;
const tyrePt = (psi, hw) => [TY.rc + TY.hh * sgnPow(Math.cos(psi), 2 / TY.n), hw * sgnPow(Math.sin(psi), 2 / TY.n)];

function tyreTex() {
  const W = 1024, H = 256;
  const [c, g] = mkCanvas(W, H);
  const r = rng(3);
  g.fillStyle = '#1c1c1c'; g.fillRect(0, 0, W, H);
  const rowPsi = (y) => (1 - (y + 0.5) / H) * 2 * TY.psiMax - TY.psiMax;
  const rows = (side, r1, r2) => {           // canvas rows whose section radius lies in [r1, r2] on one sidewall
    let a = H, b = -1;
    for (let y = 0; y < H; y++) {
      const psi = rowPsi(y); if (Math.sign(psi) !== side) continue;
      const rr = tyrePt(psi, 1)[0];
      if (rr >= r1 && rr <= r2) { a = Math.min(a, y); b = Math.max(b, y); }
    }
    return [a, b + 1];
  };
  // scrubbed crown
  const crownTop = rows(1, 0.3535, 0.37)[1], crownBot = rows(-1, 0.3535, 0.37)[0];
  const ct = Math.min(crownTop, crownBot), cb = Math.max(crownTop, crownBot);
  const gr = g.createLinearGradient(0, ct, 0, cb);
  gr.addColorStop(0, 'rgba(58,56,54,0)'); gr.addColorStop(0.15, 'rgba(58,56,54,0.6)'); gr.addColorStop(0.5, 'rgba(66,64,60,0.75)');
  gr.addColorStop(0.85, 'rgba(58,56,54,0.6)'); gr.addColorStop(1, 'rgba(58,56,54,0)');
  g.fillStyle = gr; g.fillRect(0, ct, W, cb - ct);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(96,92,86,0.22)' : 'rgba(8,8,8,0.3)'; g.fillRect(r() * W, ct + r() * (cb - ct), 10 + r() * 50, 1); }
  // sidewalls: compound stripe (brand accent) in two arcs, with markings in the gaps
  for (const side of [-1, 1]) {
    const [s0, s1] = rows(side, 0.303, 0.318);
    const [t0, t1] = rows(side, 0.262, 0.296);
    g.fillStyle = BRAND.car.accent;
    for (const [u0, u1] of [[0.03, 0.4], [0.53, 0.9]]) g.fillRect(u0 * W, s0, (u1 - u0) * W, s1 - s0);
    const th = t1 - t0;
    g.font = `italic 900 ${Math.round(th * 0.8)}px ${HEAVY}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const u of [0.465, 0.965]) {
      g.save();
      // letters' tops point to the tread and read clockwise on the outer (+x) wall (u runs anticlockwise there)
      g.translate(u * W, (t0 + t1) / 2);
      if (side > 0) g.rotate(Math.PI); else g.scale(1, -1);
      g.fillStyle = BRAND.car.trim; g.fillText('SLICK', 0, 0);
      g.restore();
    }
    g.fillStyle = 'rgba(200,200,200,0.35)';
    for (let k = 0; k < 24; k++) g.fillRect((k / 24 + 0.01) * W, t0 + th * 0.1, 3, th * 0.12);
  }
  return canvasTex(c);
}

// Wheel cover (planar, radial design) + solid swatches in the corners for the rim and the centre-lock nut.
function wheelTex() {
  const S = 512, [c, g] = mkCanvas(S, S), m = S / 2;
  g.fillStyle = '#2d2f33'; g.fillRect(0, 0, S, S);                 // rim gunmetal
  const R = S / 2 * (0.232 / 0.24);
  const ring = (r0, r1, col) => { g.beginPath(); g.arc(m, m, R * r1, 0, TAU); g.arc(m, m, R * r0, 0, TAU, true); g.fillStyle = col; g.fill(); };
  g.beginPath(); g.arc(m, m, R, 0, TAU); g.fillStyle = BRAND.car.body; g.fill();
  const gr = g.createRadialGradient(m, m, 0, m, m, R);      // soft dish shading over the body colour
  gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = gr; g.fill();
  ring(0.8, 0.9, BRAND.car.accent);
  ring(0.925, 0.945, BRAND.car.trim);
  ring(0.2, 0.26, BRAND.car.accent);
  g.fillStyle = BRAND.car.accent; g.fillRect(S - 24, 0, 24, 24);    // nut swatch (uv ~ 0.98, 0.98)
  return canvasTex(c);
}
// Roughness (G) / metalness (B) for the wheel: satin painted cover, metallic rim and centre-lock nut.
function wheelORMTex() {
  const S = 64, [c, g] = mkCanvas(S, S), m = S / 2, R = S / 2 * (0.232 / 0.24);
  g.fillStyle = 'rgb(0,90,230)'; g.fillRect(0, 0, S, S);                       // rim: rough 0.35, metal 0.9
  g.beginPath(); g.arc(m, m, R, 0, TAU); g.fillStyle = 'rgb(0,115,10)'; g.fill(); // cover: rough 0.45, metal 0.04
  g.fillStyle = 'rgb(0,72,210)'; g.fillRect(S - 3, 0, 3, 3);                    // nut: rough 0.28, metal 0.82
  const t = canvasTex(c, { srgb: false }); t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.minFilter = THREE.NearestFilter;
  return t;
}
// 4x1 emissive mask: left half dark (drums, deflectors), right half lit (brake discs).
function hubEmissiveTex() {
  const [c, g] = mkCanvas(4, 1);
  g.fillStyle = '#000'; g.fillRect(0, 0, 2, 1); g.fillStyle = '#fff'; g.fillRect(2, 0, 2, 1);
  const t = canvasTex(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  return t;
}

// Helmet paint in sphere UVs (u: 0 right, .25 face, .5 left, .75 back; canvas y = polar angle from the crown).
function helmetTex() {
  const W = 1024, H = 512, PI = Math.PI;
  const [c, g] = mkCanvas(W, H);
  const X = (u) => u * W, Y = (th) => th / PI * H;
  g.fillStyle = BRAND.car.trim; g.fillRect(0, 0, W, H);
  g.fillStyle = BRAND.car.accent; g.fillRect(0, 0, W, Y(0.24 * PI));
  g.fillStyle = BRAND.car.body; g.fillRect(0, Y(0.24 * PI), W, Y(0.035 * PI));
  // side bolts
  for (const side of [1, -1]) for (const wrap of [-1, 0, 1]) {
    const pts = [[0.05, 0.62], [0.2, 0.5], [0.26, 0.56], [0.42, 0.38], [0.5, 0.36], [0.5, 0.42], [0.3, 0.64], [0.24, 0.58], [0.1, 0.68]];
    g.beginPath();
    pts.forEach(([s, th], i) => { const x = X(0.25 + side * s + wrap), y = Y(th * PI); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath(); g.fillStyle = BRAND.car.accent; g.fill();
    g.lineWidth = 6; g.strokeStyle = BRAND.car.body; g.stroke();
  }
  g.fillStyle = BRAND.car.body; g.fillRect(0, Y(0.68 * PI), W, H);
  // eye port (under the visor)
  g.fillStyle = '#0a0a0a';
  const x0 = X(0.25 - 0.17), y0 = Y(0.39 * PI), w = X(0.34), h = Y(0.17 * PI), rr = 24;
  g.beginPath(); g.moveTo(x0 + rr, y0); g.arcTo(x0 + w, y0, x0 + w, y0 + h, rr); g.arcTo(x0 + w, y0 + h, x0, y0 + h, rr);
  g.arcTo(x0, y0 + h, x0, y0, rr); g.arcTo(x0, y0, x0 + w, y0, rr); g.closePath(); g.fill();
  // race number on the back
  g.fillStyle = BRAND.car.body; g.font = `italic 900 ${Math.round(Y(0.14 * PI))}px ${HEAVY}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(BRAND.riderNumber), X(0.75), Y(0.47 * PI));
  return canvasTex(c);
}

// ------------------------------------------------------------------ decal atlas (logo / wordmark + race number)
let LOGO = null, LOGO_VER = 0;
// The logo image plus the bounding box of its opaque pixels (whole image if it can't be read, e.g. cross-origin).
function logoArt() {
  const img = LOGO, iw = img && (img.naturalWidth || img.width), ih = img && (img.naturalHeight || img.height);
  if (!iw || !ih) return null;
  let crop = [0, 0, iw, ih];
  try {
    const k = Math.min(1, 512 / Math.max(iw, ih)), w = Math.max(1, Math.round(iw * k)), h = Math.max(1, Math.round(ih * k));
    const [, g] = mkCanvas(w, h, { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= x0) crop = [Math.max(0, (x0 - 1) / k), Math.max(0, (y0 - 1) / k), Math.min(iw, (x1 - x0 + 3) / k), Math.min(ih, (y1 - y0 + 3) / k)];
  } catch (e) { /* tainted canvas: keep the full image */ }
  return { img, crop };
}
function decalAtlas() {
  const W = 1024, H = 512;
  const [c, g] = mkCanvas(W, H);
  const cells = {};
  const cell = (name, x, y, w, h, draw) => {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const [cw, ch] = draw(x, y, w, h);     // returns the content size (px), drawn centred in the cell
    g.restore();
    const px = (w - cw) / 2, py = (h - ch) / 2;
    cells[name] = { u: (x + px) / W, v: 1 - (y + py + ch) / H, du: cw / W, dv: ch / H, aspect: cw / ch };
  };
  const word = String(BRAND.wordmark || 'LIVEWIRE').toUpperCase();
  const art = logoArt();
  const logo = (fill, outline) => (x, y, w, h) => {
    if (art) {
      const [sx, sy, sw, sh] = art.crop, a = sw / sh;
      let cw = w - 16, ch = cw / a;
      if (ch > h - 16) { ch = h - 16; cw = ch * a; }
      const ox = x + (w - cw) / 2, oy = y + (h - ch) / 2;
      if (fill) {       // silhouette in one colour (for use on accent-coloured panels)
        const [t, tg] = mkCanvas(Math.ceil(cw), Math.ceil(ch));
        tg.drawImage(art.img, sx, sy, sw, sh, 0, 0, cw, ch); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = fill; tg.fillRect(0, 0, cw, ch);
        g.drawImage(t, ox, oy);
      } else g.drawImage(art.img, sx, sy, sw, sh, ox, oy, cw, ch);
      return [cw, ch];
    }
    let fs = h * 0.78;
    g.font = `italic 900 ${fs}px ${HEAVY}`;
    const mw = g.measureText(word).width;
    if (mw > w - 30) { fs *= (w - 30) / mw; g.font = `italic 900 ${fs}px ${HEAVY}`; }
    const tw = g.measureText(word).width;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (outline) { g.lineWidth = fs * 0.08; g.strokeStyle = outline; g.lineJoin = 'round'; g.strokeText(word, x + w / 2, y + h / 2 + fs * 0.04); }
    g.fillStyle = fill || BRAND.car.trim; g.fillText(word, x + w / 2, y + h / 2 + fs * 0.04);
    return [Math.min(w, tw + fs * 0.35), Math.min(h, fs * 0.92)];
  };
  const num = (fill, outline) => (x, y, w, h) => {
    const n = String(BRAND.riderNumber);
    const fs = h * 0.86;
    g.font = `italic 900 ${fs}px ${HEAVY}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const tw = g.measureText(n).width;
    if (outline) { g.lineWidth = fs * 0.07; g.strokeStyle = outline; g.lineJoin = 'round'; g.strokeText(n, x + w / 2, y + h / 2 + fs * 0.04); }
    g.fillStyle = fill; g.fillText(n, x + w / 2, y + h / 2 + fs * 0.04);
    return [Math.min(w, tw + fs * 0.25), Math.min(h, fs * 0.85)];
  };
  cell('logo', 0, 0, W, 200, logo(null, null));                        // natural / white, for black paint
  cell('logoDark', 0, 200, W, 200, logo(BRAND.car.body, null));       // body colour, for accent panels
  cell('num', 0, 400, 256, 112, num(BRAND.car.trim, BRAND.car.accent));
  cell('numDark', 256, 400, 256, 112, num(BRAND.car.body, null));
  const tex = canvasTex(c);
  return { tex, cells };
}

// ------------------------------------------------------------------ interpolation / geometry helpers
// Monotone cubic (PCHIP) through (xs, ys): no overshoot between stations.
function pchip(xs, ys) {
  const n = xs.length, h = [], d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}
// Stations {z, ...params} -> z => interpolated params.
function stations(keys) {
  const ks = [...keys].sort((a, b) => a.z - b.z), zs = ks.map(k => k.z), fns = {};
  for (const f of Object.keys(ks[0])) if (f !== 'z') fns[f] = pchip(zs, ks.map(k => k[f]));
  return (z) => { const o = { z }; for (const f in fns) o[f] = fns[f](z); return o; };
}

// Tapered superellipse section: widest (w) at yM, narrowing by kT at the top (yT) and kB at the bottom (yB).
function fusPt(P, t, out = new THREE.Vector3()) {
  const c = Math.cos(t), s = Math.sin(t), e = 2 / P.n;
  const sy = sgnPow(s, e), f = Math.abs(sy);
  const w = P.w * (s >= 0 ? lerp(1, P.kT, f) : lerp(1, P.kB, f));
  const y = s >= 0 ? P.yM + (P.yT - P.yM) * sy : P.yM + (P.yM - P.yB) * sy;
  return out.set(w * sgnPow(c, e), y, P.z);
}
// Rounded quad section (bilinear map of a superellipse): corners TL (ix, iyT), TR (ox, oyT), BR (oxB, oyB),
// BL (ixB, iyB); `cT` crowns the top, `cO` bulges the outer side.
function quadPt(Q, t, out = new THREE.Vector3()) {
  const e = 2 / Q.n, u = sgnPow(Math.cos(t), e), v = sgnPow(Math.sin(t), e);
  const a = (u + 1) / 2, b = (v + 1) / 2;
  const bx = lerp(Q.ixB, Q.oxB, a), by = lerp(Q.iyB, Q.oyB, a), tx = lerp(Q.ix, Q.ox, a), ty = lerp(Q.iyT, Q.oyT, a);
  let x = lerp(bx, tx, b), y = lerp(by, ty, b);
  y += (Q.cT || 0) * (1 - (2 * a - 1) ** 2) * b * b;
  x += (Q.cO || 0) * (1 - (2 * b - 1) ** 2) * a * a;
  return out.set(x, y, Q.z);
}
const ringOf = (fn, P, M, scale = 1, c = null) => {
  const pts = [];
  for (let j = 0; j < M; j++) pts.push(fn(P, j / M * TAU, new THREE.Vector3()));
  if (scale !== 1) { const o = c || centroid(pts); for (const p of pts) p.sub(o).multiplyScalar(scale).add(o); }
  return pts;
};
function centroid(pts) { const c = new THREE.Vector3(); for (const p of pts) c.add(p); return c.divideScalar(pts.length); }
// Bisection on a monotonic section parameter.
function solveT(fn, P, lo, hi, key, target, rising) {
  const p = new THREE.Vector3();
  for (let i = 0; i < 34; i++) { const m = (lo + hi) / 2; fn(P, m, p); if ((p[key] < target) === rising) lo = m; else hi = m; }
  return fn(P, (lo + hi) / 2, p);
}

// Normalise a geometry (in place) so parts merge: indexed, position/normal/uv only.
function clean(g) {
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  const n = g.attributes.position.count;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  if (!g.index) { const a = new (n > 65535 ? Uint32Array : Uint16Array)(n); for (let i = 0; i < n; i++) a[i] = i; g.setIndex(new THREE.BufferAttribute(a, 1)); }
  g.clearGroups();
  return g;
}
// Mirror across x = 0, keeping it outward-facing (index winding flipped).
function mirrorX(src) {
  const g = clean(src.clone());
  const p = g.attributes.position.array, n = g.attributes.normal.array, idx = g.index.array;
  for (let i = 0; i < p.length; i += 3) { p[i] = -p[i]; n[i] = -n[i]; }
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  return g;
}
// Per-face box-projected UVs (consistent carbon weave scale on merged parts). Needs unshared vertices.
function boxUV(g, scale) {
  const p = g.attributes.position.array, uv = g.attributes.uv.array;
  for (let f = 0; f < p.length; f += 9) {
    const ux = p[f] - p[f + 3], uy = p[f + 1] - p[f + 4], uz = p[f + 2] - p[f + 5], vx = p[f + 6] - p[f + 3], vy = p[f + 7] - p[f + 4], vz = p[f + 8] - p[f + 5];
    const ax = Math.abs(vy * uz - vz * uy), ay = Math.abs(vz * ux - vx * uz), az = Math.abs(vx * uy - vy * ux);
    const [i, j] = ax >= ay && ax >= az ? [2, 1] : ay >= az ? [0, 2] : [0, 1];
    for (let k = 0; k < 3; k++) { const o = f + k * 3, q = (f / 3 + k) * 2; uv[q] = p[o + i] * scale; uv[q + 1] = p[o + j] * scale; }
  }
  g.attributes.uv.needsUpdate = true;
}
function setUV(g, u, v) { const a = g.attributes.uv.array; for (let i = 0; i < a.length; i += 2) { a[i] = u; a[i + 1] = v; } return g; }

// Loft closed rings (equal point counts) into a smooth surface. Duplicate points / rings make creases (their
// zero-area strips don't contribute to the normals). dir 'out' = normals away from the section centroid,
// 'in' = towards it (ducts). Optional flat caps.
function loft(rings, { capStart = false, capEnd = false, dir = 'out' } = {}) {
  const nR = rings.length, M = rings[0].length;
  const pos = new Float32Array(nR * M * 3);
  for (let i = 0; i < nR; i++) for (let j = 0; j < M; j++) { const p = rings[i][j], k = (i * M + j) * 3; pos[k] = p.x; pos[k + 1] = p.y; pos[k + 2] = p.z; }
  const idx = [];
  for (let i = 0; i < nR - 1; i++) for (let j = 0; j < M; j++) {
    const j1 = (j + 1) % M, a = i * M + j, b = i * M + j1, c = (i + 1) * M + j1, d = (i + 1) * M + j;
    idx.push(a, b, d, b, c, d);
  }
  // winding: face normals of the middle strip should point away from the section centroid ('out')
  const mi = Math.min(nR - 2, nR >> 1), cm = centroid(rings[mi]), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  let s = 0;
  for (let j = 0; j < M; j++) {
    const a = rings[mi][j], b = rings[mi][(j + 1) % M], d = rings[mi + 1][j];
    e1.subVectors(b, a).cross(e2.subVectors(d, a));
    s += e1.x * (a.x - cm.x) + e1.y * (a.y - cm.y) + e1.z * (a.z - cm.z);
  }
  if ((s < 0) === (dir === 'out')) for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const parts = [clean(g)];
  const cap = (ring, other) => {
    const c = centroid(ring), axis = c.clone().sub(centroid(other)).normalize();
    if (dir === 'in') axis.negate();
    const P = [];
    for (let j = 0; j < M; j++) { const a = ring[j], b = ring[(j + 1) % M]; P.push(c.x, c.y, c.z, a.x, a.y, a.z, b.x, b.y, b.z); }
    const cg = new THREE.BufferGeometry();
    cg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    cg.computeVertexNormals();
    const n = cg.attributes.normal; let sn = 0;
    for (let k = 0; k < n.count; k += 3) sn += n.getX(k) * axis.x + n.getY(k) * axis.y + n.getZ(k) * axis.z;
    if (sn < 0) {
      const p = cg.attributes.position.array;
      for (let k = 0; k < p.length; k += 9) for (let q = 0; q < 3; q++) { const t = p[k + 3 + q]; p[k + 3 + q] = p[k + 6 + q]; p[k + 6 + q] = t; }
      cg.computeVertexNormals();
    }
    parts.push(clean(cg));
  };
  if (capStart) cap(rings[0], rings[1]);
  if (capEnd) cap(rings[nR - 1], rings[nR - 2]);
  return parts.length > 1 ? mergeGeometries(parts, false) : parts[0];
}
const dupRing = (r) => r.map(p => p.clone());

// NACA-style thickness on an inverted camber line (bulges to the suction side, -eta). j = 0 at the leading edge.
function airfoil(M, th, camber) {
  const pts = [];
  for (let j = 0; j < M; j++) {
    const t = j / M * TAU, xi = (1 - Math.cos(t)) / 2;
    const yt = 5 * th * (0.2969 * Math.sqrt(xi) - 0.126 * xi - 0.3516 * xi * xi + 0.2843 * xi ** 3 - 0.1036 * xi ** 4);
    const yc = -camber * 4 * xi * (1 - xi);
    pts.push([xi, yc + (t < Math.PI ? yt : -yt)]);
  }
  return pts;
}
// Place an airfoil section: chord from `le` along `d` (unit), thickness along `n` (unit, pressure side).
function foilRing(af, le, chord, d, n) {
  return af.map(([xi, eta]) => le.clone().addScaledVector(d, xi * chord).addScaledVector(n, eta * chord));
}
// Chord/normal for a spanwise-x wing: angle a lifts the trailing edge (rearward, up).
const chordDir = (a) => V(0, Math.sin(a), -Math.cos(a));
const upDir = (a) => V(0, Math.cos(a), Math.sin(a));

// Extrude a side profile (shape x = forward z, y = up) to a slab of thickness `depth` centred on x = cx.
function slabX(shape, depth, cx = 0, bevel = 0, curveSegments = 8) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 2, curveSegments });
  g.translate(0, 0, -depth / 2);
  g.rotateY(-Math.PI / 2);
  g.translate(cx, 0, 0);
  return g;
}
const shapeOf = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); return s; };
function roundRect(w, h, r, P = THREE.Shape) {
  const s = new P(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// Aero-section strut between two points: elliptical tube with its long axis along the airflow (z).
function aeroTube(a, b, chord = 0.05, thick = 0.018, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length(); d.normalize();
  const g = new THREE.CylinderGeometry(1, 1, L, seg, 1, false);
  g.scale(chord / 2, 1, thick / 2);
  const cx = V(0, 0, 1).addScaledVector(d, -d.z);
  if (cx.lengthSq() < 1e-6) cx.set(1, 0, 0);
  cx.normalize();
  const cz = new THREE.Vector3().crossVectors(cx, d);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(cx, d, cz).setPosition(a.clone().add(b).multiplyScalar(0.5)));
  return g;
}
// Lathe about the x axis (wheel axle). points [radius, axial].
function latheX(pts, seg, phiStart = 0, phiLength = TAU) {
  const g = new THREE.LatheGeometry(pts.map(([r, a]) => new THREE.Vector2(r, a)), seg, phiStart, phiLength);
  g.rotateZ(-Math.PI / 2);
  return g;
}
// Tube along a smooth curve with an elliptical section (a along the Frenet binormal, b along the normal).
function sweep(points, a, b, segs = 40, radial = 10, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  const g = new THREE.TubeGeometry(curve, segs, 1, radial, closed);
  const fr = curve.computeFrenetFrames(segs, closed), p = g.attributes.position;
  const c = new THREE.Vector3(), o = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    curve.getPointAt(i / segs, c);
    const N = fr.normals[i % (segs + (closed ? 0 : 1))], Bn = fr.binormals[i % (segs + (closed ? 0 : 1))];
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      o.fromBufferAttribute(p, k).sub(c);
      const na = o.dot(N), nb = o.dot(Bn);
      p.setXYZ(k, c.x + N.x * na * b + Bn.x * nb * a, c.y + N.y * na * b + Bn.y * nb * a, c.z + N.z * na * b + Bn.z * nb * a);
    }
  }
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ paint livery (per pixel, body space)
// Slots (uv.x on paint geometry): 0 = livery by position, 1 = body, 2 = accent, 3 = trim, 4 = accent top / body
// underside (halo), 5 = rear wing endplate.
const LIVERY_GLSL = /* glsl */`
uniform vec3 uBody; uniform vec3 uAccent; uniform vec3 uTrim;
varying vec3 vLP; varying vec3 vLN; varying float vSlot;
float edgeAA(float d) { float w = max(fwidth(d) * 0.75, 1e-5); return smoothstep(-w, w, d); }
float cockpitW(float z) {
  float u = (z - 0.185) / 0.44, a = abs(u), pp = u > 0.0 ? 2.5 : 4.0;
  return a >= 1.0 ? 0.0 : 0.222 * pow(1.0 - pow(a, pp), 1.0 / pp);
}
float cockpitMask(vec3 p) { return step(abs(p.x), cockpitW(p.z) - 0.004) * step(p.y, 0.64) * step(0.35, p.y); }
vec3 livery(vec3 p, vec3 n) {
  vec3 col = uBody;
  float ax = abs(p.x);
  // nose tip: accent, raked cut with a trim pinstripe
  float dn = p.z + 0.5 * (p.y - 0.2) - 2.36;
  col = mix(col, uTrim, edgeAA(dn + 0.022));
  col = mix(col, uAccent, edgeAA(dn));
  // sidepod: accent flash around the inlet with a lightning-cut trailing edge, pinstripe behind it
  float pod = edgeAA(ax - 0.34) * edgeAA(p.z + 1.7) * edgeAA(p.y - 0.34);
  float cut = p.z - (0.36 + 0.9 * (p.y - 0.5)) + 0.07 * sign(p.y - 0.5) * smoothstep(0.0, 0.08, abs(p.y - 0.5));
  col = mix(col, uTrim, pod * edgeAA(cut + 0.03));
  col = mix(col, uAccent, pod * edgeAA(cut));
  // accent swoosh along the sidepod shoulder, dropping with the downwash ramp
  float sh = abs((p.y - (0.575 + 0.105 * p.z)) ) - 0.012;
  col = mix(col, uAccent, pod * edgeAA(-sh) * edgeAA(0.3 - p.z) * edgeAA(p.z + 1.3) * step(0.0, n.y + 0.6));
  // engine cover spine
  float spine = edgeAA(0.02 - ax) * edgeAA(-0.26 - p.z) * edgeAA(p.y - 0.55) * step(0.3, n.y + abs(n.x) * step(ax, 0.012));
  col = mix(col, uAccent, spine);
  // chassis top pinstripes from the nose band to the cockpit
  float cs = edgeAA(0.012 - abs(ax - 0.1)) * edgeAA(p.z - 0.62) * edgeAA(2.36 - p.z) * step(0.6, n.y);
  col = mix(col, uTrim, cs);
  return col;
}
vec3 paintColor(vec3 p, vec3 n, float slot) {
  vec3 L = livery(p, n);
  float d = p.y - 0.7 + 0.25 * (p.z + 2.35);
  vec3 E = mix(mix(uBody, uTrim, edgeAA(d + 0.02)), uAccent, edgeAA(d));
  if (slot < 0.5) return L;
  if (slot < 1.5) return uBody;
  if (slot < 2.5) return uAccent;
  if (slot < 3.5) return uTrim;
  if (slot < 4.5) return mix(uBody, uAccent, smoothstep(0.15, 0.3, n.y));
  return E;   // rear wing endplate: accent top, trim pinstripe, body below
}
`;
function paintMaterial() {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0, specularIntensity: 0.35, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.5 });
  const U = { uBody: { value: new THREE.Color(BRAND.car.body) }, uAccent: { value: new THREE.Color(BRAND.car.accent) }, uTrim: { value: new THREE.Color(BRAND.car.trim) } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLP; varying vec3 vLN; varying float vSlot;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position; vLN = normal; vSlot = uv.x;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + LIVERY_GLSL)
      .replace('#include <map_fragment>', '#include <map_fragment>\nfloat ckp = cockpitMask(vLP) * step(vSlot, 0.5);\ndiffuseColor.rgb = mix(paintColor(vLP, normalize(vLN), vSlot), vec3(0.012), ckp);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.85, ckp);')
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\nmaterial.clearcoat *= 1.0 - ckp;');
  };
  m.customProgramCacheKey = () => 'f1livery';
  return m;
}

export function makeMaterials() {
  const carbonMap = cached('carbon', carbonTex);
  const atlas = cached('atlas' + LOGO_VER, decalAtlas);
  return {
    paint: paintMaterial(),
    carbon: new THREE.MeshPhysicalMaterial({ map: carbonMap, bumpMap: carbonMap, bumpScale: 0.4, roughness: 0.48, metalness: 0.1, specularIntensity: 0.35, clearcoat: 0.45, clearcoatRoughness: 0.18, envMapIntensity: 0.5 }),
    floor: new THREE.MeshStandardMaterial({ map: carbonMap, bumpMap: carbonMap, bumpScale: 0.3, roughness: 0.68, metalness: 0.1, envMapIntensity: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: BRAND.car.carbon, roughness: 0.9, metalness: 0 }),   // cockpit, padding, plank, ducts
    metal: new THREE.MeshStandardMaterial({ color: '#8e9096', roughness: 0.3, metalness: 1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#b8c4d0', roughness: 0.03, metalness: 1 }),
    light: new THREE.MeshStandardMaterial({ color: '#330404', emissive: new THREE.Color('#ff1a0a'), emissiveIntensity: 2.6 }),
    decal: new THREE.MeshPhysicalMaterial({
      map: atlas.tex, transparent: true, alphaTest: 0.3, depthWrite: false, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
    }),
    helmet: new THREE.MeshPhysicalMaterial({ map: cached('helmet', helmetTex), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04 }),
    visor: new THREE.MeshPhysicalMaterial({ color: '#0b0c0e', roughness: 0.05, metalness: 0.9, clearcoat: 1, iridescence: 0.35, iridescenceIOR: 1.6, iridescenceThicknessRange: [300, 500] }),
    rubber: new THREE.MeshStandardMaterial({ map: cached('tyre', tyreTex), roughness: 0.82 }),
    wheel: new THREE.MeshPhysicalMaterial({ map: cached('wheel', wheelTex), roughnessMap: cached('wheelORM', wheelORMTex), metalnessMap: cached('wheelORM', wheelORMTex), roughness: 1, metalness: 1, specularIntensity: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.2, envMapIntensity: 0.6 }),
    hub: new THREE.MeshStandardMaterial({ color: '#2a2724', roughness: 0.62, metalness: 0.25, emissive: new THREE.Color('#ff3c06'), emissiveMap: cached('hubE', hubEmissiveTex), emissiveIntensity: 0 }),
    atlas,
  };
}

// ------------------------------------------------------------------ static body
class Builder {
  constructor() { this.parts = {}; }
  put(key, g, slot = 0) {
    if (key === 'carbon' || key === 'floor') { if (g.index) g = g.toNonIndexed(); g.setIndex(null); g = clean(g); boxUV(g, 20); }
    else { g = clean(g); if (key === 'paint') setUV(g, slot, 0); }
    (this.parts[key] ||= []).push(g);
    return g;
  }
  both(key, g, slot = 0) { const a = this.put(key, g, slot); this.put(key, mirrorX(a), slot); }
  merge() { const out = {}; for (const k in this.parts) out[k] = mergeGeometries(this.parts[k], false); return out; }
}

// Fuselage: nose, monocoque, engine cover, gearbox / crash structure (one loft).
const FUS = stations([
  { z: 2.70, yB: 0.084, yM: 0.13, yT: 0.2, w: 0.06, kT: 0.72, kB: 0.85, n: 2.5 },
  { z: 2.45, yB: 0.105, yM: 0.17, yT: 0.27, w: 0.085, kT: 0.74, kB: 0.78, n: 2.6 },
  { z: 2.15, yB: 0.145, yM: 0.235, yT: 0.365, w: 0.115, kT: 0.77, kB: 0.7, n: 2.7 },
  { z: 1.85, yB: 0.17, yM: 0.295, yT: 0.455, w: 0.148, kT: 0.8, kB: 0.64, n: 2.85 },
  { z: 1.55, yB: 0.175, yM: 0.355, yT: 0.545, w: 0.188, kT: 0.82, kB: 0.6, n: 3 },
  { z: 1.25, yB: 0.13, yM: 0.38, yT: 0.60, w: 0.215, kT: 0.82, kB: 0.6, n: 3 },
  { z: 0.95, yB: 0.085, yM: 0.38, yT: 0.635, w: 0.245, kT: 0.8, kB: 0.6, n: 3.1 },
  { z: 0.62, yB: 0.07, yM: 0.38, yT: 0.665, w: 0.275, kT: 0.78, kB: 0.62, n: 3.2 },
  { z: 0.30, yB: 0.07, yM: 0.38, yT: 0.67, w: 0.30, kT: 0.78, kB: 0.62, n: 3.2 },
  { z: 0.00, yB: 0.07, yM: 0.38, yT: 0.675, w: 0.31, kT: 0.8, kB: 0.62, n: 3.2 },
  { z: -0.20, yB: 0.07, yM: 0.38, yT: 0.69, w: 0.31, kT: 0.72, kB: 0.62, n: 3.2 },
  { z: -0.45, yB: 0.07, yM: 0.39, yT: 0.77, w: 0.30, kT: 0.5, kB: 0.62, n: 3 },
  { z: -0.75, yB: 0.07, yM: 0.39, yT: 0.795, w: 0.28, kT: 0.42, kB: 0.62, n: 2.9 },
  { z: -1.05, yB: 0.075, yM: 0.37, yT: 0.76, w: 0.25, kT: 0.4, kB: 0.62, n: 2.8 },
  { z: -1.38, yB: 0.09, yM: 0.33, yT: 0.64, w: 0.195, kT: 0.42, kB: 0.64, n: 2.7 },
  { z: -1.70, yB: 0.16, yM: 0.33, yT: 0.53, w: 0.14, kT: 0.5, kB: 0.66, n: 2.6 },
  { z: -2.00, yB: 0.285, yM: 0.36, yT: 0.46, w: 0.10, kT: 0.62, kB: 0.72, n: 2.6 },
  { z: -2.25, yB: 0.325, yM: 0.37, yT: 0.43, w: 0.075, kT: 0.7, kB: 0.75, n: 2.6 },
]);
const NOSE_TIP = { z0: 2.70, len: 0.1 };
function fusAt(z) {
  if (z <= NOSE_TIP.z0) return FUS(z);
  const P = FUS(NOSE_TIP.z0), k = Math.sqrt(Math.max(0, 1 - ((z - NOSE_TIP.z0) / NOSE_TIP.len) ** 2));
  const yc = (P.yB + P.yT) / 2;
  return { ...P, z, yB: yc + (P.yB - yc) * k, yT: yc + (P.yT - yc) * k, yM: yc + (P.yM - yc) * k, w: P.w * Math.max(k, 0.02) };
}
// Airbox / roll hoop pod on the engine cover.
const AIRBOX = stations([
  { z: -0.24, yB: 0.69, yM: 0.77, yT: 0.915, w: 0.098, kT: 0.4, kB: 0.9, n: 2.5 },
  { z: -0.36, yB: 0.685, yM: 0.77, yT: 0.93, w: 0.112, kT: 0.38, kB: 0.9, n: 2.5 },
  { z: -0.62, yB: 0.67, yM: 0.76, yT: 0.925, w: 0.118, kT: 0.34, kB: 0.9, n: 2.5 },
  { z: -0.98, yB: 0.64, yM: 0.72, yT: 0.85, w: 0.112, kT: 0.33, kB: 0.9, n: 2.5 },
  { z: -1.32, yB: 0.57, yM: 0.63, yT: 0.705, w: 0.095, kT: 0.36, kB: 0.9, n: 2.5 },
  { z: -1.62, yB: 0.49, yM: 0.53, yT: 0.565, w: 0.07, kT: 0.4, kB: 0.9, n: 2.5 },
]);
// Sidepod (left; mirrored).
const POD = stations([
  { z: 0.82, ix: 0.262, iyT: 0.625, ox: 0.70, oyT: 0.605, oxB: 0.685, oyB: 0.43, ixB: 0.30, iyB: 0.40, n: 5, cT: 0.006, cO: 0.004 },
  { z: 0.70, ix: 0.24, iyT: 0.645, ox: 0.725, oyT: 0.615, oxB: 0.70, oyB: 0.40, ixB: 0.25, iyB: 0.26, n: 5, cT: 0.012, cO: 0.008 },
  { z: 0.45, ix: 0.22, iyT: 0.65, ox: 0.735, oyT: 0.61, oxB: 0.705, oyB: 0.37, ixB: 0.22, iyB: 0.12, n: 5, cT: 0.016, cO: 0.012 },
  { z: 0.10, ix: 0.22, iyT: 0.645, ox: 0.73, oyT: 0.585, oxB: 0.69, oyB: 0.35, ixB: 0.22, iyB: 0.08, n: 5, cT: 0.018, cO: 0.014 },
  { z: -0.30, ix: 0.22, iyT: 0.63, ox: 0.69, oyT: 0.52, oxB: 0.63, oyB: 0.29, ixB: 0.22, iyB: 0.075, n: 4.5, cT: 0.018, cO: 0.014 },
  { z: -0.70, ix: 0.21, iyT: 0.59, ox: 0.60, oyT: 0.43, oxB: 0.53, oyB: 0.20, ixB: 0.21, iyB: 0.075, n: 4, cT: 0.016, cO: 0.012 },
  { z: -1.05, ix: 0.18, iyT: 0.52, ox: 0.46, oyT: 0.32, oxB: 0.40, oyB: 0.12, ixB: 0.18, iyB: 0.075, n: 3.6, cT: 0.012, cO: 0.01 },
  { z: -1.35, ix: 0.15, iyT: 0.44, ox: 0.31, oyT: 0.22, oxB: 0.29, oyB: 0.09, ixB: 0.15, iyB: 0.075, n: 3.2, cT: 0.008, cO: 0.006 },
  { z: -1.58, ix: 0.13, iyT: 0.37, ox: 0.20, oyT: 0.16, oxB: 0.20, oyB: 0.08, ixB: 0.13, iyB: 0.075, n: 3, cT: 0.004, cO: 0.004 },
]);

// Inlet: lip annulus + outer skin rings for the paint loft, and an inward-facing duct for the dark loft.
function inletRings(fn, S, zs, M, lip, duct) {
  const mouth = ringOf(fn, S(zs[0]), M), c = centroid(mouth);
  const inner = mouth.map(p => p.clone().sub(c).multiplyScalar(lip).add(c));
  const skin = [inner, mouth, dupRing(mouth)];
  for (let i = 1; i < zs.length; i++) skin.push(ringOf(fn, S(zs[i]), M));
  const d = [inner];
  for (const [dz, k] of duct) d.push(mouth.map(p => p.clone().sub(c).multiplyScalar(k).add(c).setZ(zs[0] + dz)));
  return { skin, duct: d };
}
const range = (a, b, step) => { const n = Math.max(1, Math.round(Math.abs(b - a) / step)), o = []; for (let i = 0; i <= n; i++) o.push(a + (b - a) * i / n); return o; };

function buildBody(B) {
  // --- fuselage
  const zs = [...range(-2.25, -1.0, 0.1).slice(0, -1), ...range(-1.0, -0.3, 0.075).slice(0, -1), ...range(-0.3, 0.68, 0.03).slice(0, -1), ...range(0.68, NOSE_TIP.z0, 0.1)];
  for (let k = 1; k <= 7; k++) zs.push(NOSE_TIP.z0 + NOSE_TIP.len * Math.sin(k / 7 * Math.PI / 2 * 0.985));
  const trough = (ring, z) => {
    if (cockpitW(z) > 0) for (const p of ring) if (p.y > 0.5) { const d = cockpitIn(p.x, z); if (d > 0.034) p.y -= CKP.depth * ss(0.034, 0.044, d); }
    return ring;
  };
  B.put('paint', loft(zs.map(z => trough(ringOf(fusPt, fusAt(z), 48), z)), { capStart: true, capEnd: true }));
  // --- airbox with its intake
  {
    const { skin, duct } = inletRings(fusPt, AIRBOX, range(-0.24, -1.62, 0.08), 28, 0.8, [[-0.05, 0.76], [-0.16, 0.62]]);
    B.put('paint', loft(skin, { capEnd: true }));
    B.put('dark', loft(duct, { capEnd: true, dir: 'in' }));
  }
  // --- sidepods with inlets
  {
    const { skin, duct } = inletRings(quadPt, POD, range(0.82, -1.58, 0.08), 36, 0.86, [[-0.06, 0.82], [-0.2, 0.74]]);
    B.both('paint', loft(skin, { capEnd: true }));
    B.both('dark', loft(duct, { capEnd: true, dir: 'in' }));
  }
  // --- shark fin (accent via the spine rule)
  {
    const s = new THREE.Shape();
    s.moveTo(-0.52, 0.86); s.lineTo(-0.5, 0.935); s.quadraticCurveTo(-0.9, 0.95, -1.35, 0.84); s.quadraticCurveTo(-1.6, 0.76, -1.72, 0.6);
    s.lineTo(-1.66, 0.52); s.lineTo(-0.52, 0.86);
    B.put('paint', slabX(s, 0.006, 0, 0.002, 10));
  }
  // --- T-cam on the roll hoop
  {
    const g = new THREE.CapsuleGeometry(0.02, 0.08, 3, 10); g.rotateZ(Math.PI / 2); g.scale(1, 0.8, 1.35); g.translate(0, 0.945, -0.37);
    B.put('paint', g, 2);
    B.put('dark', new THREE.CylinderGeometry(0.012, 0.012, 0.03, 10).rotateX(Math.PI / 2).translate(0, 0.945, -0.335));
  }
}

// Cockpit opening: half-width as a function of z (rounded front, blunter rear). Mirrored in LIVERY_GLSL.
const CKP = { zc: 0.185, L: 0.44, w: 0.222, pf: 2.5, pr: 4, depth: 0.21 };
function cockpitW(z) {
  const u = (z - CKP.zc) / CKP.L, a = Math.abs(u), p = u > 0 ? CKP.pf : CKP.pr;
  return a >= 1 ? 0 : CKP.w * Math.pow(1 - a ** p, 1 / p);
}
// Inside distance to the opening's edge (min of the lateral and the fore/aft gaps), <= 0 outside.
function cockpitIn(x, z) {
  const r = Math.abs(x) / CKP.w;
  if (r >= 1) return -1;
  const zf = CKP.zc + CKP.L * Math.pow(1 - r ** CKP.pf, 1 / CKP.pf), zr = CKP.zc - CKP.L * Math.pow(1 - r ** CKP.pr, 1 / CKP.pr);
  return Math.min(cockpitW(z) - Math.abs(x), zf - z, z - zr);
}
function topY(z, x) { return solveT(fusPt, fusAt(z), 0, Math.PI, 'x', x, false).y; }
function buildCockpit(B) {
  // padded rim along the opening
  const half = [];
  for (let i = 0; i <= 28; i++) { const z = lerp(-0.2549, 0.6249, (1 - Math.cos(i / 28 * Math.PI)) / 2); half.push(V(cockpitW(z), 0, z)); }
  const outline = [...half.slice().reverse(), ...half.slice(1, -1).map(p => V(-p.x, 0, p.z))];
  const pts = new THREE.CatmullRomCurve3(outline, true, 'centripetal').getSpacedPoints(72).slice(0, 72);
  // pulled in along the outline's inward normal so the tube covers the trough's edge band
  const n = pts.length, ctr = V(0, 0, CKP.zc);
  const rim = pts.map((p, i) => {
    const t = pts[(i + 1) % n].clone().sub(pts[(i + n - 1) % n]), nn = V(t.z, 0, -t.x).normalize();
    if (nn.dot(ctr.clone().sub(p)) < 0) nn.negate();
    const q = p.clone().addScaledVector(nn, 0.019);
    return V(q.x, topY(q.z, q.x) + 0.004, q.z);
  });
  B.put('dark', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 96, 0.028, 8, true));
  // headrest: U of padding round the helmet, open at the front
  const hr = new THREE.TorusGeometry(0.152, 0.05, 10, 28, 1.3 * Math.PI);
  hr.rotateX(-Math.PI / 2);
  const gap = 1.65 * Math.PI, gx = Math.cos(gap), gz = -Math.sin(gap);
  hr.rotateY(-Math.atan2(gx, gz));
  hr.scale(1, 1.55, 1.12); hr.translate(0, 0.69, -0.05);
  B.put('dark', hr);
  // steering wheel
  const sw = new THREE.ExtrudeGeometry(roundRect(0.26, 0.12, 0.04), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 1, curveSegments: 4 });
  sw.translate(0, 0, -0.015); sw.rotateX(-0.95); sw.translate(0, 0.575, 0.33);
  B.put('dark', sw);
}

// Driver's shoulders and arms (a limb: hidden with the helmet for the onboard camera).
function driverGeo() {
  const parts = [];
  const sh = new THREE.SphereGeometry(1, 16, 10); sh.scale(0.2, 0.085, 0.12); sh.translate(0, 0.545, -0.04); parts.push(clean(sh));
  for (const sx of [1, -1]) {
    const a = V(sx * 0.165, 0.56, 0.0), b = V(sx * 0.12, 0.575, 0.3), d = new THREE.Vector3().subVectors(b, a);
    const c = new THREE.CapsuleGeometry(0.042, d.length(), 3, 8);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
    c.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    parts.push(clean(c));
  }
  return mergeGeometries(parts, false);
}

function buildHalo(B) {
  const L = [V(0.212, 0.63, -0.33), V(0.222, 0.73, -0.26), V(0.232, 0.81, -0.13), V(0.228, 0.842, 0.02), V(0.205, 0.858, 0.17), V(0.14, 0.868, 0.29), V(0, 0.872, 0.345)];
  const ring = [...L, ...L.slice(0, -1).reverse().map(p => V(-p.x, p.y, p.z))];
  B.put('paint', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring, false, 'centripetal'), 64, 0.023, 10, false), 4);
  // centre pillar: slim blade down to the chassis ahead of the cockpit
  B.put('paint', sweep([V(0, 0.874, 0.335), V(0, 0.84, 0.43), V(0, 0.76, 0.54), V(0, 0.67, 0.625), V(0, 0.62, 0.66)], 0.017, 0.032, 24, 10), 4);
}

function buildMirrors(B) {
  for (const sx of [1, -1]) {
    const c = V(sx * 0.505, 0.752, 0.47);
    const h = new THREE.ExtrudeGeometry(roundRect(0.165, 0.056, 0.024), { depth: 0.036, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 6 });
    h.translate(c.x, c.y, c.z - 0.018);
    B.put('paint', h, 3);
    const gl = new THREE.ShapeGeometry(roundRect(0.148, 0.042, 0.017), 6);
    gl.rotateY(Math.PI); gl.translate(c.x, c.y, c.z - 0.0275);
    B.put('glass', gl);
    for (const dx of [-0.045, 0.045]) B.put('carbon', aeroTube(V(c.x + dx, 0.615, 0.5), V(c.x + dx * 0.8, 0.735, 0.47), 0.04, 0.012, 8));
  }
}

// Floor: raised-leading-edge plate, rear corners, fences, edge wing, plank + skids, diffuser.
const FLOOR_W = pchipKeys([[-1.2, 0.715], [-1.1, 0.745], [-0.9, 0.78], [-0.5, 0.80], [0.2, 0.80], [0.6, 0.785], [0.85, 0.74], [1.05, 0.66], [1.25, 0.52], [1.42, 0.34], [1.52, 0.2]]);
function pchipKeys(kv) { return pchip(kv.map(k => k[0]), kv.map(k => k[1])); }
const floorTop = (z) => 0.072 + 0.085 * ss(0.95, 1.52, z);
const FLOOR_T = 0.018;
function plateRing(z, xl, xr, yTop, th, cols) {
  const T = [], Bt = [];
  for (let k = 0; k <= cols; k++) { const x = lerp(xl, xr, k / cols), y = yTop(z, x); T.push(V(x, y, z)); Bt.push(V(x, y - th, z)); }
  return [...T, T[cols].clone(), Bt[cols].clone(), ...Bt.slice().reverse(), Bt[0].clone(), T[0].clone()];
}
const roofY = (z) => 0.054 + 0.29 * Math.pow(clamp((-1.2 - z) / 0.95, 0, 1), 1.7);
function buildFloor(B) {
  const zs = [...range(-1.2, 0.9, 0.3).slice(0, -1), ...range(0.9, 1.52, 0.06)];
  B.put('floor', loft(zs.map(z => plateRing(z, -FLOOR_W(z), FLOOR_W(z), (zz) => floorTop(zz), FLOOR_T, 4)), { capStart: true, capEnd: true }));
  // rear corners ahead of the rear tyres
  const RW = pchipKeys([[-1.56, 0.55], [-1.48, 0.6], [-1.35, 0.665], [-1.2, 0.715]]);
  const corner = loft(range(-1.56, -1.19, 0.05).map(z => plateRing(z, 0.51, RW(z), () => 0.072, FLOOR_T, 3)), { capStart: true, capEnd: true });
  B.both('floor', corner);
  // fences under the raised floor entry
  for (let k = 0; k < 3; k++) {
    const x0 = 0.25 + k * 0.1, top = [], bot = [];
    for (const z of range(1.47, 0.95, 0.04)) { top.push([z, floorTop(z) - FLOOR_T + 0.006]); bot.push([z, 0.045 + 0.03 * ss(1.15, 1.47, z)]); }
    const sh = shapeOf([...top, ...bot.reverse()]);
    const g = slabX(sh, 0.007, 0, 0, 4);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + x0 + 0.06 * ss(1.47, 0.95, p.getZ(i)));
    g.computeVertexNormals();
    B.both('floor', g);
  }
  // edge wing curling over the floor edge
  {
    const af = airfoil(16, 0.1, 0.05), rings = [];
    for (const z of range(0.35, -1.12, 0.07)) {
      const hw = FLOOR_W(z), a = 0.5;
      rings.push(foilRing(af, V(hw - 0.105, 0.092, z), 0.1, V(Math.cos(a), Math.sin(a), 0), V(-Math.sin(a), Math.cos(a), 0)));
    }
    B.both('floor', loft(rings, { capStart: true, capEnd: true }));
    for (const z of [0.3, -0.35, -1.05]) {
      const hw = FLOOR_W(z);
      const s = shapeOf([[0.03, 0.068], [-0.03, 0.068], [-0.03, 0.12], [0.03, 0.12]]);
      B.both('floor', slabX(s, 0.006, hw - 0.055, 0, 1).translate(0, 0, z));
    }
  }
  // plank with titanium skid blocks
  {
    const g = new THREE.BoxGeometry(0.3, 0.03, 2.3); g.translate(0, 0.038, 0.0);
    B.put('dark', g);
    for (const z of [0.95, 0.2, -0.55, -1.08]) for (const sx of [1, -1]) B.put('metal', new THREE.BoxGeometry(0.05, 0.004, 0.09).translate(sx * 0.12, 0.022, z));
  }
  // diffuser: rising roof, outer walls, strakes
  {
    const zs2 = range(-1.18, -2.15, 0.05);
    B.put('floor', loft(zs2.map(z => plateRing(z, -0.522, 0.522, (zz) => roofY(zz) + 0.012, 0.012, 2)), { capStart: true, capEnd: true }));
    const wall = [], wb = [];
    for (const z of range(-1.18, -2.15, 0.05)) { const t = (-1.2 - z) / 0.95; wall.push([z, roofY(z) + 0.022]); wb.push([z, 0.035 + 0.09 * t * t]); }
    B.both('floor', slabX(shapeOf([...wall, ...wb.reverse()]), 0.012, 0.528, 0, 2));
    for (const xs of [0.17, 0.35]) {
      const top = [], bot = [];
      for (const z of range(-1.4, -2.15, 0.05)) { const t = (-1.2 - z) / 0.95; top.push([z, roofY(z) + 0.004]); bot.push([z, roofY(z) - 0.035 - 0.05 * ss(0, 0.5, t)]); }
      B.both('floor', slabX(shapeOf([...top, ...bot.reverse()]), 0.008, xs, 0, 2));
    }
  }
}

// Front wing: 4 elements (main plane + 3 flaps) sweeping up towards the endplates.
function frontWingStation(k, u) {
  const o = ss(0.28, 0.95, u);
  let le = V(0, 0.076 + 0.022 * o, 2.80 - 0.075 * o * o), chord = 0.25 - 0.03 * o, a = 0.1 + 0.06 * o;
  const E = [
    [0.15, 0.28 + 0.14 * o], [0.125, 0.42 + 0.22 * o], [0.1, 0.58 + 0.26 * o],
  ];
  for (let i = 0; i < k; i++) {
    const te = le.clone().addScaledVector(chordDir(a), chord);
    le = te.add(V(0, 0.011, 0.022));
    [chord, a] = E[i];
  }
  return { le, chord, a };
}
function buildFrontWing(B) {
  const af = airfoil(24, 0.085, 0.045);
  const us = [0, 0.1, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.67, 0.74, 0.8, 0.85, 0.89, 0.92, 0.945, 0.975];
  for (let k = 0; k < 4; k++) {
    const u0 = k < 2 ? -0.975 : 0.11;
    const xs = k < 2 ? [...us.slice(1).reverse().map(u => -u), ...us] : us.filter(u => u > u0 + 1e-3);
    if (k >= 2) xs.unshift(u0);
    const rings = xs.map(x => {
      const s = frontWingStation(k, Math.abs(x));
      return foilRing(af, s.le.setX(x), s.chord, chordDir(s.a), upDir(s.a));
    });
    const g = loft(rings, { capStart: true, capEnd: true });
    if (k < 2) B.put('carbon', g); else if (k === 2) B.both('carbon', g); else B.both('paint', g, 2);
  }
  // endplates
  const ep = new THREE.Shape();
  ep.moveTo(2.87, 0.03); ep.lineTo(2.87, 0.1); ep.quadraticCurveTo(2.84, 0.16, 2.72, 0.2); ep.quadraticCurveTo(2.5, 0.27, 2.36, 0.39);
  ep.quadraticCurveTo(2.29, 0.45, 2.22, 0.42); ep.lineTo(2.2, 0.36); ep.lineTo(2.2, 0.03); ep.lineTo(2.87, 0.03);
  B.both('paint', slabX(ep, 0.01, 0.975, 0.003, 10), 2);
  // footplate
  const fp = shapeOf([[2.86, 0.03], [2.22, 0.03], [2.22, 0.042], [2.86, 0.042]]);
  const fg = slabX(fp, 0.06, 0.95, 0.003, 1);
  B.both('carbon', fg);
}

// Rear wing: main plane + DRS flap between endplates, twin pylons, beam wing below.
const RW = { span: 0.5, main: { le: V(0, 0.715, -2.14), chord: 0.30, a: 0.22 }, gap: V(0, 0.012, 0.02), flap: { chord: 0.19, a: 0.78 } };
const rwTip = (x) => ss(0.34, 0.5, Math.abs(x));   // wing tips roll down into the endplates
function rwFlapLE() { return RW.main.le.clone().addScaledVector(chordDir(RW.main.a), RW.main.chord).add(RW.gap); }
function buildRearWing(B) {
  const af = airfoil(26, 0.1, 0.05);
  const span = range(-RW.span, RW.span, 0.05);
  const tip = rwTip;
  const mainR = span.map(x => foilRing(af, RW.main.le.clone().setX(x).add(V(0, -0.012 * tip(x), 0)), RW.main.chord, chordDir(RW.main.a + 0.04 * tip(x)), upDir(RW.main.a + 0.04 * tip(x))));
  B.put('carbon', loft(mainR, { capStart: true, capEnd: true }));
  const fle = rwFlapLE();
  const flapR = span.map(x => foilRing(af, fle.clone().setX(x).add(V(0, -0.008 * tip(x), 0)), RW.flap.chord, chordDir(RW.flap.a), upDir(RW.flap.a)));
  B.put('paint', loft(flapR, { capStart: true, capEnd: true }), 1);
  // endplates
  const ep = new THREE.Shape();
  ep.moveTo(-2.05, 0.36); ep.lineTo(-2.05, 0.79); ep.quadraticCurveTo(-2.06, 0.93, -2.2, 0.948); ep.lineTo(-2.55, 0.955);
  ep.quadraticCurveTo(-2.655, 0.955, -2.66, 0.86); ep.lineTo(-2.66, 0.62); ep.quadraticCurveTo(-2.6, 0.5, -2.46, 0.42); ep.quadraticCurveTo(-2.4, 0.36, -2.3, 0.36);
  ep.lineTo(-2.05, 0.36);
  B.both('paint', slabX(ep, 0.01, RW.span + 0.006, 0.003, 10), 5);
  // beam wing (two elements)
  const bs = range(-RW.span, RW.span, 0.1);
  for (const [le, ch, a] of [[V(0, 0.395, -2.08), 0.15, 0.1], [V(0, 0.44, -2.215), 0.125, 0.42]]) {
    B.put('carbon', loft(bs.map(x => foilRing(af, le.clone().setX(x), ch, chordDir(a), upDir(a))), { capStart: true, capEnd: true }));
  }
  // twin swan-neck pylons either side of the exhaust
  const py = new THREE.Shape();
  py.moveTo(-1.96, 0.40); py.quadraticCurveTo(-2.2, 0.46, -2.24, 0.745); py.lineTo(-2.36, 0.765); py.quadraticCurveTo(-2.26, 0.48, -2.12, 0.40); py.lineTo(-1.96, 0.40);
  B.both('carbon', slabX(py, 0.012, 0.075, 0, 8));
  // DRS actuator pod
  B.put('carbon', new THREE.CapsuleGeometry(0.018, 0.08, 4, 10).rotateX(Math.PI / 2 - 0.25).translate(0, 0.79, -2.34));
}

// Suspension: wishbones, push/pull rods and steering links as carbon aero struts (left side, mirrored).
const SUSP = {
  front: { uo: V(0.70, 0.52, 1.79), uf: V(0.10, 0.40, 1.98), ur: V(0.13, 0.49, 1.55), lo: V(0.73, 0.19, 1.81), lf: V(0.09, 0.23, 2.12), lr: V(0.11, 0.22, 1.50), po: V(0.69, 0.215, 1.78), pi: V(0.12, 0.46, 1.66), to: V(0.72, 0.37, 1.66), ti: V(0.13, 0.36, 1.62) },
  rear: { uo: V(0.66, 0.54, -1.80), uf: V(0.09, 0.48, -1.45), ur: V(0.06, 0.43, -2.0), lo: V(0.69, 0.18, -1.80), lf: V(0.12, 0.17, -1.40), lr: V(0.07, 0.30, -2.02), po: V(0.64, 0.52, -1.77), pi: V(0.10, 0.18, -1.62), to: V(0.68, 0.30, -1.97), ti: V(0.08, 0.31, -2.02) },
};
function buildSuspension(B) {
  for (const S of [SUSP.front, SUSP.rear]) {
    for (const [a, b, ch, th] of [[S.uo, S.uf, 0.055, 0.016], [S.uo, S.ur, 0.055, 0.016], [S.lo, S.lf, 0.06, 0.018], [S.lo, S.lr, 0.06, 0.018], [S.po, S.pi, 0.04, 0.016], [S.to, S.ti, 0.045, 0.014]]) {
      B.both('carbon', aeroTube(a, b, ch, th, 10));
    }
  }
}

function buildRear(B) {
  // exhaust: open pipe with a dark bore
  const r0 = 0.046, a0 = 0.0;
  const p = [[r0 + 0.004, a0 - 0.22], [r0 + 0.004, a0 - 0.004], [r0 - 0.002, a0], [r0 - 0.006, a0 - 0.004], [r0 - 0.006, a0 - 0.22]];
  const ex = new THREE.LatheGeometry(p.map(([r, a]) => new THREE.Vector2(r, a)), 24);
  ex.rotateX(-Math.PI / 2); ex.translate(0, 0.475, -2.165);
  B.put('metal', ex);
  B.put('dark', new THREE.CircleGeometry(r0 - 0.005, 20).rotateY(Math.PI).translate(0, 0.475, -2.09));
  // rain light on the crash structure tail + LED strips on the rear wing endplates
  B.put('light', new THREE.BoxGeometry(0.1, 0.045, 0.012).translate(0, 0.372, -2.253));
  for (const sx of [1, -1]) B.put('light', new THREE.BoxGeometry(0.014, 0.2, 0.01).translate(sx * (RW.span + 0.006), 0.74, -2.662));
}

let STATIC = null;
function staticGeometry() {
  if (STATIC && STATIC.ver === LOGO_VER) return STATIC;
  const B = new Builder();
  buildBody(B); buildCockpit(B); buildHalo(B); buildMirrors(B); buildFloor(B);
  buildFrontWing(B); buildRearWing(B); buildSuspension(B); buildRear(B);
  const geo = B.merge();
  STATIC = { ver: LOGO_VER, geo, decal: null, helmet: helmetGeo() };
  return STATIC;
}

// ------------------------------------------------------------------ decals
// Conformal patch: grid (s along the reading direction, t up the letters) -> surface point via `at(s, t)`.
// Offset along the outward normal, which is (reading x up) by construction.
function patch(at, rect, NX = 18, NY = 6, off = 0.0025) {
  const P = [];
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) P.push(at(i / NX, j / NY));
  const get = (i, j) => P[clamp(j, 0, NY) * (NX + 1) + clamp(i, 0, NX)];
  const pos = [], uv = [], idx = [];
  const du = new THREE.Vector3(), dv = new THREE.Vector3(), n = new THREE.Vector3();
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
    du.subVectors(get(i + 1, j), get(i - 1, j)); dv.subVectors(get(i, j + 1), get(i, j - 1));
    n.crossVectors(du, dv).normalize();
    const p = get(i, j).clone().addScaledVector(n, off);
    pos.push(p.x, p.y, p.z); uv.push(rect.u + rect.du * i / NX, rect.v + rect.dv * j / NY);
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 2, d = a + NX + 1;
    idx.push(a, b, c, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return clean(g);
}
function decalGeometry(atlas) {
  const C = atlas.cells, out = [];
  const fusSide = (z, y) => solveT(fusPt, fusAt(z), -Math.PI / 2, Math.PI / 2, 'y', y, true);
  const podSide = (z, y) => solveT(quadPt, POD(z), -1.3, 1.35, 'y', y, true);
  for (const sx of [1, -1]) {
    // reading direction: towards the rear on the left (+x) flank, towards the front on the right
    const zOf = (s, z0, z1) => sx > 0 ? lerp(z1, z0, s) : lerp(z0, z1, s);
    // sidepods
    {
      const w = 0.62, h = w / C.logo.aspect, zc = -0.2, yc = 0.44, k = 0.12;
      out.push(patch((s, t) => { const z = zOf(s, zc - w / 2, zc + w / 2), p = podSide(z, yc + k * (z - zc) - h / 2 + h * t); return V(sx * p.x, p.y, z); }, C.logo));
    }
    // engine cover
    {
      const w = 0.46, h = w / C.logo.aspect, zc = -0.9, yc = 0.62;
      out.push(patch((s, t) => { const z = zOf(s, zc - w / 2, zc + w / 2), p = fusSide(z, yc - h / 2 + h * t); return V(sx * p.x, p.y, z); }, C.logo));
    }
    // front wing endplates (outer faces, on accent paint)
    {
      const w = 0.4, h = w / C.logoDark.aspect, zc = 2.5, yc = 0.12, x = sx * (0.975 + 0.005 + 0.0035 + 0.002);
      out.push(patch((s, t) => V(x, yc - h / 2 + h * t, zOf(s, zc - w / 2, zc + w / 2)), C.logoDark, 2, 1, 0));
    }
    // rear wing endplates: race number
    {
      const h = 0.2, w = h * C.numDark.aspect, zc = -2.38, yc = 0.8, x = sx * (RW.span + 0.006 + 0.005 + 0.0035 + 0.002);
      out.push(patch((s, t) => V(x, yc - h / 2 + h * t, zOf(s, zc - w / 2, zc + w / 2)), C.numDark, 2, 1, 0));
    }
  }
  // nose top number, readable from ahead of the car (tops of the digits towards the cockpit)
  {
    const L = 0.2, w = L * C.num.aspect, zf = 2.24;
    out.push(patch((s, t) => { const z = zf - L * t, x = -w / 2 + w * s; return V(x, topY(z, x), z); }, C.num, 8, 8));
  }
  // rear wing: wordmark on the rear-facing (suction) side of the DRS flap, read from behind
  {
    const W = 0.84, fle = rwFlapLE(), d = chordDir(RW.flap.a), n = upDir(RW.flap.a);
    // suction-side offset of the flap section (same thickness / camber as airfoil(26, 0.1, 0.05))
    const lower = (xi) => { const th = 5 * 0.1 * (0.2969 * Math.sqrt(xi) - 0.126 * xi - 0.3516 * xi * xi + 0.2843 * xi ** 3 - 0.1036 * xi ** 4); return -0.05 * 4 * xi * (1 - xi) - th; };
    const h = Math.min(0.15, W / C.logo.aspect), wv = h * C.logo.aspect, xi0 = 0.5 - h / RW.flap.chord / 2;
    out.push(patch((s, t) => {
      const x = lerp(wv / 2, -wv / 2, s), xi = xi0 + (h / RW.flap.chord) * t;
      return fle.clone().setX(x).add(V(0, -0.008 * rwTip(x), 0)).addScaledVector(d, xi * RW.flap.chord).addScaledVector(n, lower(xi) * RW.flap.chord);
    }, C.logo, 20, 6));
  }
  return mergeGeometries(out, false);
}

// ------------------------------------------------------------------ helmet
function helmetGeo() {
  const g = new THREE.SphereGeometry(1, 32, 20);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const chin = ss(0.1, 0.8, z) * ss(0.0, -0.7, y);
    z += chin * 0.12; y -= chin * 0.05;
    p.setXYZ(i, x * 0.122, y * 0.132, z * (z > 0 ? 0.148 : 0.158));
  }
  g.computeVertexNormals();
  const visor = new THREE.SphereGeometry(1, 24, 6, Math.PI / 2 - 0.95, 1.9, 0.39 * Math.PI, 0.17 * Math.PI);
  visor.scale(0.122 * 1.03, 0.132 * 1.03, 0.148 * 1.03);
  return { shell: g, visor };
}

// ------------------------------------------------------------------ wheels
const wheelCache = new Map();
function wheelGeo(front) {
  const key = front ? 'f' : 'r';
  if (wheelCache.has(key)) return wheelCache.get(key);
  const W = front ? CAR.wF : CAR.wR, hw = W / 2, hr = 0.8 * hw;
  // tyre
  const prof = [];
  for (let j = 0; j < TY.N; j++) prof.push(tyrePt(-TY.psiMax + 2 * TY.psiMax * j / (TY.N - 1), hw));
  const tyre = latheX(prof, 56);
  // rim (closed section: flanges + bead seat outside, barrel inside) + cover disc with slots + centre-lock nut
  const rp = [[0.196, -hr - 0.004], [0.238, -hr - 0.004], [0.246, -hr + 0.003], [0.236, -hr + 0.012], [0.226, -hr + 0.02], [0.226, hr - 0.02],
    [0.236, hr - 0.012], [0.246, hr - 0.003], [0.238, hr + 0.004], [0.196, hr + 0.004], [0.196, -hr - 0.004]];
  const rim = clean(latheX(rp, 48)); setUV(rim, 0.03, 0.03);
  const cs = new THREE.Shape(); cs.absarc(0, 0, 0.232, 0, TAU, false);
  for (let k = 0; k < 5; k++) {
    const a0 = k / 5 * TAU + 0.12, a1 = a0 + 0.62, r1 = 0.105, r2 = 0.182, h = new THREE.Path();
    h.absarc(0, 0, r2, a0, a1, false); h.absarc(0, 0, r1, a1, a0, true); h.closePath();
    cs.holes.push(h);
  }
  const cover = new THREE.ExtrudeGeometry(cs, { depth: 0.006, bevelEnabled: false, curveSegments: 10 });
  cover.rotateY(Math.PI / 2); cover.translate(hr - 0.008, 0, 0);
  const cv = clean(cover), cp = cv.attributes.position, cu = cv.attributes.uv;
  for (let i = 0; i < cp.count; i++) cu.setXY(i, 0.5 + cp.getZ(i) / 0.48, 0.5 + cp.getY(i) / 0.48);
  const nut = clean(latheX([[0.05, hr - 0.01], [0.046, hr + 0.004], [0.042, hr + 0.024], [0.03, hr + 0.034], [0.001, hr + 0.034]], 16)); setUV(nut, 0.985, 0.985);
  const wheel = mergeGeometries([rim, cv, nut], false);
  // non-spinning hub: brake disc (lit by the emissive mask), duct drum, wake deflector over the tyre
  const ds = new THREE.Shape(); ds.absarc(0, 0, 0.172, 0, TAU, false);
  const dh = new THREE.Path(); dh.absarc(0, 0, 0.11, 0, TAU, true); ds.holes.push(dh);
  const disc = clean(slabX(ds, 0.032, front ? -0.02 : -0.04, 0, 20)); setUV(disc, 0.9, 0.5);
  const drum = clean(new THREE.CylinderGeometry(0.182, 0.182, 0.07, 24).rotateZ(Math.PI / 2).translate(-hw - 0.03, 0, 0)); setUV(drum, 0.1, 0.5);
  const parts = [disc, drum];
  if (front) {
    const dp = [[0.382, -0.19], [0.386, -0.19], [0.386, -0.07], [0.382, -0.07], [0.382, -0.19]];
    const def = clean(latheX(dp, 16, 1.5 * Math.PI - 0.62, 1.1)); setUV(def, 0.1, 0.5);
    // struts from the drum to the deflector
    for (const a of [1.5 * Math.PI - 0.45, 1.5 * Math.PI + 0.45]) {
      const pa = V(-hw - 0.01, -Math.sin(a) * 0.18, Math.cos(a) * 0.18), pb = V(-0.15, -Math.sin(a) * 0.382, Math.cos(a) * 0.382);
      parts.push(setUV(clean(aeroTube(pa, pb, 0.03, 0.008, 6)), 0.1, 0.5));
    }
    parts.push(def);
  }
  const hub = mergeGeometries(parts, false);
  const out = { tyre: clean(tyre), wheel, hub, hw };
  wheelCache.set(key, out);
  return out;
}

// ------------------------------------------------------------------ model
const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

export class BikeModel {
  constructor(mats = makeMaterials()) {
    this.m = mats;
    this.root = new THREE.Group();
    this.rollG = new THREE.Group();
    this.pitchG = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.rollG); this.rollG.add(this.pitchG); this.pitchG.add(this.body);
    this.rollG.position.y = CAR.pivotY; this.body.position.y = -CAR.pivotY;
    this.leanG = this.rollG;   // alias (bike naming)

    const S = staticGeometry();
    for (const [k, g] of Object.entries(S.geo)) this.body.add(Object.assign(new THREE.Mesh(g, mats[k]), { name: k }));
    if (!S.decal) S.decal = decalGeometry(mats.atlas);
    this.decals = new THREE.Mesh(S.decal, mats.decal); this.decals.name = 'decals'; this.decals.renderOrder = 1;
    this.body.add(this.decals);
    // driver's helmet (+ visor as a child so hiding the helmet hides both)
    this.helmet = new THREE.Mesh(S.helmet.shell, mats.helmet);
    this.helmet.position.set(0, 0.785, -0.03);
    this.helmet.rotation.x = 0.08;
    this.helmet.add(new THREE.Mesh(S.helmet.visor, mats.visor));
    this.body.add(this.helmet);
    this.limbs = {};
    for (const k of ['torso', 'hump', 'neck', 'pelvis']) { const g = new THREE.Group(); g.name = k; this.body.add(g); this.limbs[k] = g; }
    if (!S.driver) S.driver = driverGeo();
    this.limbs.torso.add(Object.assign(new THREE.Mesh(S.driver, mats.dark), { name: 'driver' }));

    // wheels: hub (planted on the road) -> steer -> offset -> side flip -> spin
    this.wheels = [];
    for (const front of [true, false]) for (const sx of [1, -1]) {
      const G = wheelGeo(front);
      const hub = new THREE.Group(), steer = new THREE.Group(), off = new THREE.Group(), flip = new THREE.Group(), spin = new THREE.Group();
      hub.add(steer); steer.add(off); off.add(flip); flip.add(spin);
      if (sx < 0) flip.rotation.y = Math.PI;
      const p0 = front ? V(sx * CAR.kingpin, CAR.R, CAR.zF) : V(sx * CAR.xR, CAR.R, CAR.zR);
      off.position.x = front ? sx * (CAR.xF - CAR.kingpin) : 0;
      flip.add(new THREE.Mesh(G.hub, mats.hub));
      spin.add(new THREE.Mesh(G.tyre, mats.rubber), new THREE.Mesh(G.wheel, mats.wheel));
      hub.position.copy(p0);
      hub.userData.spin = spin;
      this.body.add(hub);
      this.wheels.push({ hub, steer, spin, p0, front, dir: sx });
    }
    this.frontWheel = this.wheels[0].hub;
    this.rearWheel = this.wheels[2].hub;

    this.exhaustTip = V(0, 0.475, -2.17);
    this.cue = {};
    this.yaw = 0;
    this.spinA = 0;
    this.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.update(0, { v: 0, lean: 0, brake: 0, throttle: 0, a: 0, pitch: 0, discHeat: 0 });
  }

  update(dt, st) {
    dt = Math.max(0, dt || 0);
    const v = st.v || 0, lean = st.lean || 0;
    this.spinA = (this.spinA + v / CAR.R * dt) % TAU;
    // steering: explicit input, else the kinematic angle for the cornering load (exaggerated a little)
    const maxS = lerp(0.3, 0.07, ss(4, 60, Math.abs(v)));
    const target = st.steer != null ? clamp(st.steer, -1, 1) * maxS
      : clamp(1.6 * 3.6 * 9.81 * Math.tan(clamp(lean, -1.3, 1.3)) / Math.max(v * v, 25), -maxS, maxS);
    this.steerA = (this.steerA == null || dt > 0.5 || dt === 0) ? target : this.steerA + (target - this.steerA) * Math.min(1, dt * 14);
    // body roll (to the outside of the turn, ~1.2 deg per g, max 2 deg) and pitch (dive / squat) on damped springs
    const latG = Math.tan(clamp(lean, -1.3, 1.3));
    const rollT = clamp(latG * 0.021, -0.035, 0.035) * ss(1, 10, v);
    const vf = ss(3, 25, v);
    const pitchT = clamp((st.pitch || 0) * 0.1, -0.02, 0.02) + (0.016 * clamp(st.brake || 0, 0, 1) - 0.008 * clamp((st.a || 0) / 10, 0, 1) * clamp(st.throttle ?? 0, 0, 1)) * vf;
    if (this.pv == null || dt > 0.5) { this.pv = pitchT; this.pw = 0; this.rv = rollT; this.rw = 0; }
    for (let n = Math.max(1, Math.ceil(dt * 120)), i = 0, hs = Math.min(dt, 0.5) / n; i < n; i++) {
      this.pw += (170 * (pitchT - this.pv) - 16 * this.pw) * hs; this.pv += this.pw * hs;
      this.rw += (150 * (rollT - this.rv) - 15 * this.rw) * hs; this.rv += this.rw * hs;
    }
    this.rollG.rotation.z = -TURN * this.rv;
    this.pitchG.rotation.x = this.pv;
    this.body.position.y = -CAR.pivotY - 0.012 * ss(25, 85, v);      // aero squat at speed
    // keep the wheels planted: hubs are placed in body space from their fixed root-space positions
    this.rollG.updateMatrix(); this.pitchG.updateMatrix(); this.body.updateMatrix();
    _m1.multiplyMatrices(this.rollG.matrix, this.pitchG.matrix).multiply(this.body.matrix).invert();
    for (const w of this.wheels) {
      _m2.makeTranslation(w.p0.x, w.p0.y, w.p0.z).premultiply(_m1);
      _m2.decompose(w.hub.position, w.hub.quaternion, _s);
      w.steer.rotation.y = w.front ? -TURN * this.steerA : 0;
      w.spin.rotation.x = this.spinA * w.dir;
    }
    { const h = clamp(st.discHeat || 0, 0, 1); this.m.hub.emissiveIntensity = h * h * 2.4; }
    this.root.updateMatrixWorld(true);
  }

  // World position of the plank's rear skid block on one side (sparks come from here).
  kneeWorld(right, out) {
    out.set(right ? -0.12 : 0.12, 0.022, CAR.plankZ);
    return this.body.localToWorld(out);
  }
}

// Ghost: same car, every mesh an additive fresnel shell.
export function makeGhost() {
  const ghostMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.accent) }, uAlpha: { value: 0.55 } },
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
  b.decals.visible = false;   // coplanar with the paint: would double the rim light
  b.ghostMat = ghostMat;
  return b;
}

export function setBikeAsset() {}
export function setRiderAsset() {}
// Logo artwork (image or canvas, on transparent) for the decals of cars built after this call.
export function setCarLogo(img) { LOGO = img || null; LOGO_VER++; STATIC = null; }

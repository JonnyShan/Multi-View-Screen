// Procedural canvas textures: road, kerbs, grass, brand boards, livery.
import * as THREE from 'three';
import { BRAND } from './config.js';

const SLAB = '"Zilla Slab", Georgia, serif';
const COND = '"Barlow Condensed", "Arial Narrow", sans-serif';

let maxAniso = 8;
export function setAnisotropy(n) { maxAniso = n; }

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = true, srgb = true, aniso = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (aniso) t.anisotropy = maxAniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// Deterministic PRNG so every kiosk renders the same world.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function speckle(g, w, h, n, colors, size = [1, 3], r = Math.random) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(r() * colors.length) | 0];
    const s = size[0] + r() * (size[1] - size[0]);
    g.fillRect(r() * w, r() * h, s, s);
  }
}

export function asphaltTexture() {
  const W = 512, H = 1024;
  const [c, g] = canvas(W, H);
  const r = rng(7);
  g.fillStyle = '#434143';
  g.fillRect(0, 0, W, H);
  // subtle longitudinal tonal bands (resurfacing / rubbered-in line)
  for (let i = 0; i < 18; i++) {
    const x = r() * W, w = 20 + r() * 90;
    g.fillStyle = `rgba(${r() < 0.5 ? '20,20,22' : '80,78,76'},${0.05 + r() * 0.07})`;
    g.fillRect(x, 0, w, H);
  }
  // darker rubbered racing groove in the middle third
  const grd = g.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0.0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.35, 'rgba(10,10,12,0.22)');
  grd.addColorStop(0.5, 'rgba(10,10,12,0.30)');
  grd.addColorStop(0.65, 'rgba(10,10,12,0.22)');
  grd.addColorStop(1.0, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 26000, ['#2a292b', '#4a494a', '#565453', '#303032', '#615e5b'], [1, 2.4], r);
  // patch repairs
  for (let i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(25,25,27,0.35)';
    g.fillRect(40 + r() * (W - 140), r() * H, 30 + r() * 80, 40 + r() * 160);
  }
  // white edge lines (road is 14m wide; line ~0.25m)
  g.fillStyle = '#e9e4d8';
  g.fillRect(W * 0.012, 0, W * 0.018, H);
  g.fillRect(W * (1 - 0.03), 0, W * 0.018, H);
  // wear on the lines
  speckle(g, W * 0.05, H, 1600, ['#3a393b', '#8a8680'], [1, 3], r);
  g.save(); g.translate(W * 0.95, 0); speckle(g, W * 0.05, H, 1600, ['#3a393b', '#8a8680'], [1, 3], r); g.restore();
  return tex(c);
}

export function runoffTexture() {
  const W = 256, H = 512;
  const [c, g] = canvas(W, H);
  const r = rng(11);
  g.fillStyle = '#35503a';
  g.fillRect(0, 0, W, H);
  speckle(g, W, H, 9000, ['#2c4431', '#3f5c44', '#2f4834', '#46644a'], [1, 2.2], r);
  return tex(c);
}

export function kerbTexture() {
  const W = 64, H = 256;
  const [c, g] = canvas(W, H);
  const half = H / 2;
  g.fillStyle = BRAND.red; g.fillRect(0, 0, W, half);
  g.fillStyle = BRAND.cream; g.fillRect(0, half, W, half);
  // bevel shading across width
  const grd = g.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0, 'rgba(0,0,0,0.25)');
  grd.addColorStop(0.25, 'rgba(0,0,0,0)');
  grd.addColorStop(0.8, 'rgba(255,255,255,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 900, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.12)'], [1, 2], rng(3));
  return tex(c);
}

export function grassTexture() {
  const W = 256, H = 512;
  const [c, g] = canvas(W, H);
  const r = rng(5);
  // mowing stripes along the track
  g.fillStyle = '#51702f'; g.fillRect(0, 0, W, H / 2);
  g.fillStyle = '#62823a'; g.fillRect(0, H / 2, W, H / 2);
  speckle(g, W, H, 14000, ['#3f5a24', '#6f8f42', '#587733', '#7e9a4a', '#4a6a2a'], [1, 2.5], r);
  return tex(c);
}

export function gravelTexture() {
  const W = 256, H = 256;
  const [c, g] = canvas(W, H);
  const r = rng(9);
  g.fillStyle = '#b39c78'; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 16000, ['#9c8563', '#c8b28d', '#8a7556', '#d6c3a0', '#a58e6a'], [1, 3], r);
  return tex(c);
}

export function fenceTexture() {
  const W = 128, H = 128;
  const [c, g] = canvas(W, H);
  g.clearRect(0, 0, W, H);
  g.strokeStyle = 'rgba(190,190,185,0.95)';
  g.lineWidth = 2;
  const s = 16;
  for (let i = -H; i < W + H; i += s) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke();
    g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke();
  }
  return tex(c, { srgb: true });
}

function wordmark(g, x, y, size, color = BRAND.cream, spacing = 0.12) {
  g.save();
  g.font = `700 ${size}px ${SLAB}`;
  g.fillStyle = color;
  g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = `${size * spacing}px`;
  g.textAlign = 'center';
  g.fillText(BRAND.wordmark, x, y);
  g.restore();
}

function redLine(g, x, y, w, h = 4) {
  g.fillStyle = BRAND.redHot;
  g.fillRect(x - w / 2, y, w, h);
}

export function airfenceTexture() {
  const W = 1024, H = 128;
  const [c, g] = canvas(W, H);
  g.fillStyle = BRAND.red; g.fillRect(0, 0, W, H);
  // inflatable ribs
  for (let x = 0; x < W; x += 64) {
    const grd = g.createLinearGradient(x, 0, x + 64, 0);
    grd.addColorStop(0, 'rgba(0,0,0,0.22)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    grd.addColorStop(1, 'rgba(0,0,0,0.22)');
    g.fillStyle = grd; g.fillRect(x, 0, 64, H);
  }
  g.fillStyle = BRAND.cream; g.fillRect(0, H - 14, W, 6);
  wordmark(g, W * 0.3, H * 0.44, 58, BRAND.cream);
  g.save();
  g.font = `800 italic 52px ${COND}`; g.fillStyle = BRAND.gold; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('KENTUCKY STRAIGHT BOURBON', W * 0.76, H * 0.46);
  g.restore();
  return tex(c);
}

export function billboardTexture(variant = 0) {
  const W = 1024, H = 320;
  const [c, g] = canvas(W, H);
  if (variant === 0) {
    g.fillStyle = BRAND.ink; g.fillRect(0, 0, W, H);
    wordmark(g, W / 2, H * 0.42, 112, BRAND.cream, 0.1);
    redLine(g, W / 2, H * 0.66, W * 0.62, 7);
    g.font = `600 36px ${SLAB}`; g.fillStyle = BRAND.gold; g.textAlign = 'center';
    g.fillText('KENTUCKY STRAIGHT BOURBON WHISKEY', W / 2, H * 0.84);
  } else if (variant === 1) {
    g.fillStyle = BRAND.red; g.fillRect(0, 0, W, H);
    g.font = `800 italic 130px ${COND}`; g.fillStyle = BRAND.cream; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('NEVER DRINK AND RIDE', W / 2, H * 0.44);
    g.font = `600 34px ${SLAB}`; g.fillStyle = BRAND.cream;
    g.fillText('WILD TURKEY · ENJOY RESPONSIBLY', W / 2, H * 0.82);
  } else if (variant === 2) {
    g.fillStyle = BRAND.cream; g.fillRect(0, 0, W, H);
    g.font = `800 italic 150px ${COND}`; g.fillStyle = BRAND.red; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('RED LINE', W / 2, H * 0.42);
    redLine(g, W / 2, H * 0.68, W * 0.5, 8);
    g.font = `700 40px ${SLAB}`; g.fillStyle = BRAND.ink;
    g.fillText(BRAND.wordmark, W / 2, H * 0.85);
  } else {
    g.fillStyle = '#20382a'; g.fillRect(0, 0, W, H);
    g.font = `700 64px ${SLAB}`; g.fillStyle = BRAND.cream; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('LAWRENCEBURG, KENTUCKY', W / 2, H * 0.38);
    g.font = `600 italic 44px ${COND}`; g.fillStyle = BRAND.gold;
    g.fillText('KENTUCKY RIVER CIRCUIT', W / 2, H * 0.7);
  }
  return tex(c, { repeat: false });
}

export function gantryTexture() {
  const W = 2048, H = 256;
  const [c, g] = canvas(W, H);
  g.fillStyle = BRAND.ink; g.fillRect(0, 0, W, H);
  g.fillStyle = BRAND.red; g.fillRect(0, H - 22, W, 22);
  wordmark(g, W * 0.27, H * 0.45, 120, BRAND.cream, 0.1);
  g.font = `800 italic 170px ${COND}`; g.fillStyle = BRAND.redHot; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('RED LINE', W * 0.72, H * 0.47);
  return tex(c, { repeat: false });
}

export function rickhouseTexture() {
  const W = 512, H = 512;
  const [c, g] = canvas(W, H);
  const r = rng(21);
  g.fillStyle = '#2a2624'; g.fillRect(0, 0, W, H);
  // corrugated metal cladding
  for (let x = 0; x < W; x += 8) {
    g.fillStyle = x % 16 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.18)';
    g.fillRect(x, 0, 4, H);
  }
  // whiskey-fungus streaks
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(10,8,7,${0.05 + r() * 0.1})`;
    g.fillRect(r() * W, r() * H * 0.3, 4 + r() * 20, H * (0.3 + r() * 0.7));
  }
  // small window grid (7 floors)
  for (let fy = 0; fy < 7; fy++) {
    for (let fx = 0; fx < 6; fx++) {
      const x = 30 + fx * 80, y = 40 + fy * 66;
      g.fillStyle = '#16120f'; g.fillRect(x, y, 22, 26);
      g.fillStyle = r() < 0.14 ? 'rgba(255,190,110,0.85)' : 'rgba(80,90,100,0.35)';
      g.fillRect(x + 3, y + 3, 16, 20);
    }
  }
  return tex(c);
}

export function rickhouseSignTexture() {
  const W = 1024, H = 160;
  const [c, g] = canvas(W, H);
  g.clearRect(0, 0, W, H);
  wordmark(g, W / 2, H / 2, 118, '#efe6d2', 0.14);
  return tex(c, { repeat: false });
}

export function chequerTexture() {
  const W = 256, H = 64;
  const [c, g] = canvas(W, H);
  const s = 16;
  for (let y = 0; y < H / s; y++) for (let x = 0; x < W / s; x++) {
    g.fillStyle = (x + y) % 2 ? '#111' : '#eee';
    g.fillRect(x * s, y * s, s, s);
  }
  return tex(c, { repeat: false });
}

// Fairing / tail livery in the part's side-profile coordinates (z forward, y up, metres).
// mirror=true draws the left flank: graphics flipped nose-left, text still reading correctly.
const PART = {
  fairing: { z0: -0.27, z1: 1.1, y0: 0.13, y1: 1.02, W: 1024, H: 672 },
  tail: { z0: -1.02, z1: 0.0, y0: 0.72, y1: 1.07, W: 1024, H: 352 },
};
export function liveryTexture(mirror = false, part = 'fairing') {
  const P = PART[part];
  const [c, g] = canvas(P.W, P.H);
  const X = (z) => { const u = (z - P.z0) / (P.z1 - P.z0); return (mirror ? 1 - u : u) * P.W; };
  const Y = (y) => (P.y1 - y) / (P.y1 - P.y0) * P.H;
  const poly = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([z, y], i) => i ? g.lineTo(X(z), Y(y)) : g.moveTo(X(z), Y(y))); g.closePath(); g.fill(); };
  const k = P.H / (P.y1 - P.y0); // px per metre (vertical)
  g.fillStyle = BRAND.red; g.fillRect(0, 0, P.W, P.H);
  if (part === 'fairing') {
    poly([[-0.3, 0.1], [-0.3, 0.4], [0.3, 0.44], [0.62, 0.56], [1.15, 0.62], [1.15, 0.1]], BRAND.ink);
    // cream sweep rising to the nose
    poly([[-0.3, 0.42], [0.3, 0.47], [0.7, 0.62], [1.15, 0.8], [1.15, 0.88], [0.7, 0.7], [0.3, 0.54], [-0.3, 0.5]], BRAND.cream);
    g.strokeStyle = BRAND.gold; g.lineWidth = 0.012 * k;
    g.beginPath(); [[-0.3, 0.39], [0.3, 0.43], [0.62, 0.53], [1.15, 0.6]].forEach(([z, y], i) => i ? g.lineTo(X(z), Y(y)) : g.moveTo(X(z), Y(y))); g.stroke();
    // race number roundel
    g.fillStyle = BRAND.cream;
    g.beginPath(); g.ellipse(X(0.74), Y(0.83), 0.1 * k, 0.075 * k, 0, 0, Math.PI * 2); g.fill();
    g.font = `800 italic ${0.12 * k}px ${COND}`; g.fillStyle = BRAND.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(BRAND.riderNumber, X(0.74), Y(0.825));
    // wordmark on the lower flank + red line device
    g.save();
    g.font = `700 ${0.045 * k}px ${SLAB}`; g.fillStyle = BRAND.cream; g.textAlign = 'center'; g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = `${0.006 * k}px`;
    g.fillText(BRAND.wordmark, X(0.2), Y(0.31));
    g.restore();
    g.fillStyle = BRAND.redHot; g.fillRect(Math.min(X(0.0), X(0.4)), Y(0.27), Math.abs(X(0.4) - X(0.0)), 0.007 * k);
  } else {
    poly([[-1.1, 1.1], [-1.1, 1.03], [0.05, 0.9], [0.05, 1.1]], BRAND.cream);
    g.strokeStyle = BRAND.gold; g.lineWidth = 0.01 * k;
    g.beginPath(); g.moveTo(X(-1.1), Y(1.0)); g.lineTo(X(0.05), Y(0.87)); g.stroke();
    g.fillStyle = BRAND.cream;
    g.beginPath(); g.ellipse(X(-0.66), Y(0.87), 0.085 * k, 0.065 * k, 0, 0, Math.PI * 2); g.fill();
    g.font = `800 italic ${0.1 * k}px ${COND}`; g.fillStyle = BRAND.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(BRAND.riderNumber, X(-0.66), Y(0.865));
  }
  // clear-coat depth: soft top highlight, darker lower edge
  const grd = g.createLinearGradient(0, 0, 0, P.H);
  grd.addColorStop(0, 'rgba(255,255,255,0.06)');
  grd.addColorStop(0.6, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.2)');
  g.fillStyle = grd; g.fillRect(0, 0, P.W, P.H);
  return tex(c, { repeat: false });
}

// Side decal (correct-reading text). Transparent background.
export function decalTexture(kind) {
  const W = 512, H = 256;
  const [c, g] = canvas(W, H);
  g.clearRect(0, 0, W, H);
  if (kind === 'number') {
    g.fillStyle = BRAND.cream;
    g.beginPath(); g.ellipse(W / 2, H / 2, W * 0.34, H * 0.44, 0, 0, Math.PI * 2); g.fill();
    g.font = `800 italic 200px ${COND}`; g.fillStyle = BRAND.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(BRAND.riderNumber, W / 2, H * 0.54);
  } else {
    wordmark(g, W / 2, H * 0.45, 64, BRAND.cream, 0.08);
    redLine(g, W / 2, H * 0.66, W * 0.72, 8);
  }
  return tex(c, { repeat: false });
}

export function helmetTexture() {
  const W = 512, H = 256;
  const [c, g] = canvas(W, H);
  g.fillStyle = BRAND.cream; g.fillRect(0, 0, W, H);
  g.fillStyle = BRAND.red; g.fillRect(0, H * 0.18, W, H * 0.3);
  g.fillStyle = BRAND.ink; g.fillRect(0, H * 0.48, W, H * 0.06);
  g.fillStyle = BRAND.gold; g.fillRect(0, H * 0.56, W, H * 0.03);
  // centre stripe
  g.fillStyle = BRAND.red; g.fillRect(W * 0.72, 0, W * 0.06, H);
  return tex(c, { repeat: false });
}

export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const [c, g] = canvas(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return tex(c, { repeat: false, aniso: false });
}

export function ringTexture(size = 256) {
  const [c, g] = canvas(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,0)');
  grd.addColorStop(0.5, 'rgba(255,220,170,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return tex(c, { repeat: false, aniso: false });
}

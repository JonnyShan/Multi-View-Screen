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

// Asphalt: colour + normal + roughness maps built from one procedural height field so the low sun
// picks out the aggregate. u runs across the 14 m road, v along it (26 m per repeat).
export function asphaltSet(scale = 1) {
  const W = 512 * scale, H = 1024 * scale;
  const r = rng(7);
  const [hc, hg] = canvas(W, H);
  hg.fillStyle = 'rgb(128,128,128)'; hg.fillRect(0, 0, W, H);
  // aggregate stones
  const stones = 90000 * scale * scale;
  for (let i = 0; i < stones; i++) {
    const v = 100 + r() * 130 | 0;
    hg.fillStyle = `rgb(${v},${v},${v})`;
    const sz = (0.6 + r() * r() * 1.8) * scale;
    hg.fillRect(r() * W, r() * H, sz, sz * (0.7 + r() * 0.6));
  }
  // pores between stones
  for (let i = 0; i < stones * 0.5; i++) {
    hg.fillStyle = `rgba(20,20,20,${0.4 + r() * 0.5})`;
    const sz = (0.5 + r() * 0.9) * scale;
    hg.fillRect(r() * W, r() * H, sz, sz);
  }
  // sealed cracks
  hg.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    let x = r() * W, y = r() * H;
    hg.strokeStyle = 'rgba(40,40,40,0.8)'; hg.lineWidth = (1.2 + r() * 1.6) * scale;
    hg.beginPath(); hg.moveTo(x, y);
    for (let k = 0; k < 14; k++) { x += (r() - 0.5) * 30 * scale; y += (r() - 0.3) * 26 * scale; hg.lineTo(x, y); }
    hg.stroke();
  }
  const hd = hg.getImageData(0, 0, W, H).data;

  const [cc, cg] = canvas(W, H);
  const [nc, ng] = canvas(W, H);
  const [rc, rg] = canvas(W, H);
  const cImg = cg.createImageData(W, H), nImg = ng.createImageData(W, H), rImg = rg.createImageData(W, H);
  const cd = cImg.data, nd = nImg.data, rd = rImg.data;
  const k = 1.6 / scale;
  for (let y = 0; y < H; y++) {
    const yu = ((y - 1 + H) % H) * W, yd = ((y + 1) % H) * W, y0 = y * W;
    for (let x = 0; x < W; x++) {
      const xl = (x - 1 + W) % W, xr = (x + 1) % W;
      const h = hd[(y0 + x) * 4] / 255;
      const dx = (hd[(y0 + xr) * 4] - hd[(y0 + xl) * 4]) / 255;
      const dy = (hd[(yd + x) * 4] - hd[(yu + x) * 4]) / 255;
      let nx = -dx * k, ny = dy * k;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const o = (y0 + x) * 4;
      nd[o] = (nx * inv * 0.5 + 0.5) * 255; nd[o + 1] = (ny * inv * 0.5 + 0.5) * 255; nd[o + 2] = (inv * 0.5 + 0.5) * 255; nd[o + 3] = 255;
      // warm grey binder, lighter limestone chips on the high spots
      const t = Math.max(0, Math.min(1, (h - 0.35) * 1.6));
      cd[o] = 56 + t * 44; cd[o + 1] = 54 + t * 42; cd[o + 2] = 53 + t * 38; cd[o + 3] = 255;
      const rough = 0.92 - t * 0.28;
      rd[o] = rd[o + 1] = rd[o + 2] = rough * 255; rd[o + 3] = 255;
    }
  }
  cg.putImageData(cImg, 0, 0); ng.putImageData(nImg, 0, 0); rg.putImageData(rImg, 0, 0);

  // colour: resurfacing bands, rubbered groove, repairs, painted edge lines
  for (let i = 0; i < 18; i++) {
    const x = r() * W, w = (20 + r() * 90) * scale;
    cg.fillStyle = `rgba(${r() < 0.5 ? '20,20,22' : '90,86,80'},${0.04 + r() * 0.06})`;
    cg.fillRect(x, 0, w, H);
  }
  const groove = (g, a) => {
    const grd = g.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0.0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.3, `rgba(8,8,10,${a * 0.7})`);
    grd.addColorStop(0.5, `rgba(8,8,10,${a})`);
    grd.addColorStop(0.7, `rgba(8,8,10,${a * 0.7})`);
    grd.addColorStop(1.0, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
  };
  groove(cg, 0.22);
  groove(rg, 0.28); // rubber polishes the surface: smoother where the tyres run
  for (let i = 0; i < 6; i++) {
    const x = (40 + r() * 360) * scale, y = r() * H, w = (30 + r() * 80) * scale, h = (40 + r() * 160) * scale;
    cg.fillStyle = 'rgba(22,22,24,0.32)'; cg.fillRect(x, y, w, h);
    rg.fillStyle = 'rgba(0,0,0,0.12)'; rg.fillRect(x, y, w, h);
  }
  const lines = (g, col) => {
    g.fillStyle = col;
    g.fillRect(W * 0.012, 0, W * 0.018, H);
    g.fillRect(W * (1 - 0.03), 0, W * 0.018, H);
  };
  lines(cg, '#e9e4d8');
  lines(rg, 'rgb(135,135,135)');
  lines(ng, 'rgb(128,128,255)');
  const wear = (g) => {
    speckle(g, W * 0.05, H, 1600 * scale * scale, ['#3a393b', '#8a8680'], [scale, 3 * scale], r);
    g.save(); g.translate(W * 0.95, 0); speckle(g, W * 0.05, H, 1600 * scale * scale, ['#3a393b', '#8a8680'], [scale, 3 * scale], r); g.restore();
  };
  wear(cg);
  return { map: tex(cc), normalMap: tex(nc, { srgb: false }), roughnessMap: tex(rc, { srgb: false }) };
}

// Rubber laid down along the racing line (u 0..0.75: soft streaks) plus locked-tyre skid marks (u 0.8..1).
export function rubberTexture() {
  const W = 256, H = 1024;
  const [c, g] = canvas(W, H);
  const r = rng(21);
  const RW = W * 0.75;
  for (let i = 0; i < 260; i++) {
    const x = RW * (0.5 + (r() + r() + r() - 1.5) * 0.42);
    const w = 1 + r() * 5;
    const a = 0.08 + r() * 0.2;
    const y0 = r() * H, len = 100 + r() * 700;
    const grd = g.createLinearGradient(0, y0, 0, y0 + len);
    grd.addColorStop(0, 'rgba(10,9,9,0)'); grd.addColorStop(0.3, `rgba(10,9,9,${a})`);
    grd.addColorStop(0.7, `rgba(10,9,9,${a})`); grd.addColorStop(1, 'rgba(10,9,9,0)');
    g.fillStyle = grd; g.fillRect(x, y0, w, len);
    if (y0 + len > H) { g.save(); g.translate(0, -H); g.fillRect(x, y0, w, len); g.restore(); }
  }
  const soft = g.createLinearGradient(0, 0, RW, 0);
  soft.addColorStop(0, 'rgba(10,9,9,0)'); soft.addColorStop(0.5, 'rgba(10,9,9,0.4)'); soft.addColorStop(1, 'rgba(10,9,9,0)');
  g.fillStyle = soft; g.fillRect(0, 0, RW, H);
  // skid strip
  for (let y = 0; y < H; y += 2) {
    const a = 0.55 + r() * 0.35;
    g.fillStyle = `rgba(8,7,7,${a})`;
    g.fillRect(W * 0.82 + r() * 2, y, W * 0.14, 2);
  }
  const t = tex(c, { srgb: true });
  return t;
}

// Leaf cluster for alpha-tested canopy cards (greyscale, tinted per tree).
export function leafTexture(scale = 1) {
  const S = 256 * scale;
  const [c, g] = canvas(S, S);
  const r = rng(33);
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * S * 0.42;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d;
    const l = (7 + r() * 9) * scale, w = l * (0.45 + r() * 0.2);
    const v = 150 + r() * 105 | 0;
    g.save(); g.translate(x, y); g.rotate(r() * Math.PI * 2);
    g.fillStyle = `rgb(${v},${v * 0.97 | 0},${v * 0.92 | 0})`;
    g.beginPath(); g.ellipse(0, 0, l, w, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(0,0,0,0.18)`; g.lineWidth = Math.max(1, scale * 0.8);
    g.beginPath(); g.moveTo(-l * 0.9, 0); g.lineTo(l * 0.9, 0); g.stroke();
    g.restore();
  }
  const t = tex(c, { repeat: false });
  return t;
}

// Grime on the lens: lights up when the camera looks into the sun.
export function lensDirtTexture() {
  const W = 512, H = 288;
  const [c, g] = canvas(W, H);
  const r = rng(77);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, rad = 6 + r() * r() * 46;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const a = 0.05 + r() * 0.16;
    grd.addColorStop(0, `rgba(255,240,220,${a})`); grd.addColorStop(0.7, `rgba(255,240,220,${a * 0.6})`); grd.addColorStop(1, 'rgba(255,240,220,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(255,245,230,${0.1 + r() * 0.35})`;
    g.beginPath(); g.arc(r() * W, r() * H, 0.4 + r() * 1.4, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(255,240,220,0.06)';
  for (let i = 0; i < 6; i++) {
    g.lineWidth = 2 + r() * 6;
    g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 200, y + (r() - 0.5) * 80, x + (r() - 0.5) * 300, y + (r() - 0.5) * 120); g.stroke();
  }
  return tex(c, { repeat: false, aniso: false });
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

export function grassTexture(scale = 1) {
  const W = 256 * scale, H = 512 * scale;
  const [c, g] = canvas(W, H);
  const r = rng(5);
  // mowing stripes along the track
  g.fillStyle = '#51702f'; g.fillRect(0, 0, W, H / 2);
  g.fillStyle = '#62823a'; g.fillRect(0, H / 2, W, H / 2);
  speckle(g, W, H, 14000 * scale * scale, ['#3f5a24', '#6f8f42', '#587733', '#7e9a4a', '#4a6a2a'], [scale, 2.5 * scale], r);
  // short blade strokes
  const cols = ['#3b5521', '#76954a', '#8aa656', '#4c6b2b', '#a39a55'];
  g.lineWidth = Math.max(1, scale * 0.9);
  for (let i = 0; i < 9000 * scale * scale; i++) {
    const x = r() * W, y = r() * H, l = (2 + r() * 4) * scale;
    g.strokeStyle = cols[(r() * cols.length) | 0];
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * l * 0.6, y - l); g.stroke();
  }
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

// Brand logo lockup (white on transparent mask, see BRAND.logo), tinted per board. drawLogo() draws it
// centred at (x, y), h px tall, squeezed horizontally by sx; it returns false when no logo is loaded.
let LOGO = null;
export function setLogo(img) { LOGO = img; }
export function drawLogo(g, x, y, h, color = BRAND.cream, sx = 1) {
  if (!LOGO) return false;
  const w = h * LOGO.width / LOGO.height;
  const [c, t] = canvas(Math.ceil(w), Math.ceil(h));
  t.drawImage(LOGO, 0, 0, w, h);
  t.globalCompositeOperation = 'source-in';
  t.fillStyle = color; t.fillRect(0, 0, w, h);
  g.drawImage(c, x - w * sx / 2, y - h / 2, w * sx, h);
  return true;
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
  if (!drawLogo(g, W * 0.3, H * 0.47, 104, BRAND.cream)) wordmark(g, W * 0.3, H * 0.44, 58, BRAND.cream);
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
    if (drawLogo(g, W / 2, H * 0.5, H * 0.8, BRAND.cream)) {
      const lw = H * 0.8 * 1.52 / 2 + 44;
      g.fillStyle = BRAND.gold; g.fillRect(56, H / 2 - 2, W / 2 - lw - 56, 4); g.fillRect(W / 2 + lw, H / 2 - 2, W / 2 - lw - 56, 4);
      redLine(g, W / 2, H - 22, W, 8);
    } else {
      wordmark(g, W / 2, H * 0.42, 112, BRAND.cream, 0.1);
      redLine(g, W / 2, H * 0.66, W * 0.62, 7);
      g.font = `600 36px ${SLAB}`; g.fillStyle = BRAND.gold; g.textAlign = 'center';
      g.fillText('KENTUCKY STRAIGHT BOURBON WHISKEY', W / 2, H * 0.84);
    }
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
  // brand (logo, or the wordmark) + game name as one group, centred and scaled to sit inside the posts
  const cy = H * 0.45, gap = 110, size = 120, logoH = H * 0.8;
  let leftW;
  if (LOGO) leftW = logoH * LOGO.width / LOGO.height;
  else { g.font = `700 ${size}px ${SLAB}`; if ('letterSpacing' in g) g.letterSpacing = `${size * 0.1}px`; leftW = g.measureText(BRAND.wordmark).width; }
  if ('letterSpacing' in g) g.letterSpacing = '0px';
  g.font = `800 italic 170px ${COND}`;
  const rightW = g.measureText(BRAND.game).width, total = leftW + gap + rightW;
  const k = Math.min(1, W * 0.84 / total);
  g.save();
  g.translate((W - total * k) / 2, cy * (1 - k)); g.scale(k, k);
  if (!drawLogo(g, leftW / 2, cy, logoH, BRAND.cream)) wordmark(g, leftW / 2, cy, size, BRAND.cream, 0.1);
  g.font = `800 italic 170px ${COND}`; g.fillStyle = BRAND.redHot; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(BRAND.game, leftW + gap + rightW / 2, cy + 2);
  g.restore();
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

// Standing-seam cladding ribs for the rickhouse walls (matches the 8 px rhythm of rickhouseTexture).
export function rickhouseNormalTexture() {
  const W = 512, H = 8;
  const [c, g] = canvas(W, H);
  const img = g.createImageData(W, H);
  for (let x = 0; x < W; x++) {
    const ph = (x % 8) / 8 * Math.PI * 2;
    const nx = Math.cos(ph) * 0.55;
    const inv = 1 / Math.sqrt(nx * nx + 1);
    for (let y = 0; y < H; y++) {
      const o = (y * W + x) * 4;
      img.data[o] = (nx * inv * 0.5 + 0.5) * 255; img.data[o + 1] = 128; img.data[o + 2] = (inv * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return tex(c, { srgb: false });
}

export function rickhouseSignTexture() {
  const W = 1024, H = 160;
  const [c, g] = canvas(W, H);
  g.clearRect(0, 0, W, H);
  if (!drawLogo(g, W / 2, H / 2, H * 0.96, '#efe6d2')) wordmark(g, W / 2, H / 2, 118, '#efe6d2', 0.14);
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

// Livery atlas for decals projected onto the generated bike and rider (transparent, correct-reading).
// rect(name) gives the cell's UV offset + size; aspect(name) its height / width.
export function decalAtlas() {
  const W = 2048, H = 1024, P = 24;
  const [c, g] = canvas(W, H);
  g.clearRect(0, 0, W, H);
  const cells = { word: [0, 0, 1024, 256], num: [1024, 0, 512, 512], plate: [1536, 0, 512, 512], wordInk: [0, 256, 1024, 256] };
  const word = ([x, y, w, h], fill) => {
    g.save();
    let size = h * 0.62;
    const set = () => { g.font = `700 ${size}px ${SLAB}`; if ('letterSpacing' in g) g.letterSpacing = `${size * 0.06}px`; };
    set();
    const tw = g.measureText(BRAND.wordmark).width;
    if (tw > w - 2 * P - 20) { size *= (w - 2 * P - 20) / tw; set(); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = size * 0.14; g.strokeStyle = fill === BRAND.ink ? BRAND.cream : BRAND.ink;
    g.strokeText(BRAND.wordmark, x + w / 2, y + h * 0.54);
    g.fillStyle = fill; g.fillText(BRAND.wordmark, x + w / 2, y + h * 0.54);
    g.restore();
  };
  word(cells.word, BRAND.cream);
  word(cells.wordInk, BRAND.ink);
  { // race number: cream, ink keyline, gold drop
    const [x, y, w, h] = cells.num;
    g.save();
    g.font = `800 italic ${h * 0.8}px ${COND}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const cx = x + w / 2, cy = y + h * 0.53;
    g.lineWidth = h * 0.07; g.strokeStyle = BRAND.ink;
    g.fillStyle = BRAND.gold; g.strokeText(BRAND.riderNumber, cx + h * 0.03, cy + h * 0.03); g.fillText(BRAND.riderNumber, cx + h * 0.03, cy + h * 0.03);
    g.strokeText(BRAND.riderNumber, cx, cy);
    g.fillStyle = BRAND.cream; g.fillText(BRAND.riderNumber, cx, cy);
    g.restore();
  }
  { // number plate: cream oval, ink number
    const [x, y, w, h] = cells.plate;
    g.save();
    g.fillStyle = BRAND.cream; g.strokeStyle = BRAND.ink; g.lineWidth = h * 0.03;
    g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 - P, h * 0.36, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.font = `800 italic ${h * 0.56}px ${COND}`; g.fillStyle = BRAND.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(BRAND.riderNumber, x + w / 2, y + h * 0.53);
    g.restore();
  }
  const t = tex(c, { repeat: false });
  return {
    tex: t,
    rect: (n) => { const [x, y, w, h] = cells[n]; return new THREE.Vector4(x / W, 1 - (y + h) / H, w / W, h / H); },
    aspect: (n) => cells[n][3] / cells[n][2],
  };
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

// Trackside dressing: tyre walls, marshal posts, TV towers, fence hoardings, fluttering flags, spectator banks,
// pit lane, paddock, big screen and an advertising bridge.
// Static props are merged into a few lap-chunked meshes that share one atlas material (vertex-coloured white
// swatches plus printed regions, with a matching roughness/metalness atlas). Crowds and flags are instanced and
// animated in the vertex shader from one time uniform.
import * as THREE from 'three';
import { QUALITY, BRAND, LANES } from './config.js';
import * as TX from './textures.js';

const SLAB = '"Zilla Slab", Georgia, serif';
const COND = '"Barlow Condensed", "Arial Narrow", sans-serif';
const TIER = ({ ultra: 0, high: 1, mid: 2, low: 3 })[QUALITY.tier] ?? 1;
const pick = (...v) => v[Math.min(TIER, v.length - 1)];
const RIVER_LOW = -34;   // terrain below this is the Kentucky River gorge
const CHUNK = 420;       // lap metres per merged static chunk (for frustum / shadow culling)
const CLEAR = 1.3;       // free-standing props keep this far behind the barrier line

const C = (c) => new THREE.Color(c);
const COL = {
  white: C('#ffffff'), cream: C(BRAND.cream), red: C(BRAND.red), redHot: C(BRAND.redHot), burgundy: C(BRAND.burgundy),
  ink: C(BRAND.ink), gold: C(BRAND.gold), amber: C(BRAND.amber), rye: C(BRAND.rye),
  orange: C('#f0661a'), steel: C('#a4a9ae'), darkSteel: C('#3e4146'), concrete: C('#a8a196'), tyre: C('#141312'),
  skin: C('#c98f6c'), glass: C('#1a2127'), denim: C('#2a3345'), grey: C('#6f7276'), black: C('#0e0e0f'),
  yellow: C('#e3b22a'), blue: C('#2b5aa6'), green: C('#2e8a3e'), wood: C('#6b4a2e'), asphalt: C('#57575a'),
};

// ---------------------------------------------------------------------------------------------- atlas
// One 2048x1280 canvas: printed boards up top, swatches (plain white, coloured per vertex) bottom right.
function buildAtlas(maxAniso) {
  const W = 2048, H = 1280;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const oc = document.createElement('canvas'); oc.width = W / 4; oc.height = H / 4;
  const o = oc.getContext('2d');
  o.fillStyle = 'rgb(0,200,0)'; o.fillRect(0, 0, oc.width, oc.height);
  g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
  const R = {}, SW = {};
  const orm = (x, y, w, h, rough, metal) => {
    o.fillStyle = `rgb(0,${Math.round(rough * 255)},${Math.round(metal * 255)})`;
    o.fillRect(x / 4, y / 4, w / 4, h / 4);
  };
  const reg = (name, x, y, w, h, rough = 0.6, metal = 0, inset = 2) => {
    R[name] = [(x + inset) / W, 1 - (y + h - inset) / H, (x + w - inset) / W, 1 - (y + inset) / H];
    orm(x, y, w, h, rough, metal);
  };
  const text = (s, x, y, font, color, { align = 'center', spacing = 0, maxW = 0 } = {}) => {
    g.save();
    g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
    if (spacing && 'letterSpacing' in g) g.letterSpacing = `${spacing}px`;
    if (maxW) {
      const w = g.measureText(s).width;
      if (w > maxW) { g.translate(x, y); g.scale(maxW / w, 1); g.fillText(s, 0, 0); g.restore(); return; }
    }
    g.fillText(s, x, y);
    g.restore();
  };
  const rnd = TX.rng(313);
  const grain = (x, y, w, h, n, a = 0.06) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.7})`;
      g.fillRect(x + rnd() * w, y + rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
    }
  };
  const chequer = (x, y, w, h, sq) => {
    for (let j = 0; j * sq < h; j++) for (let i = 0; i * sq < w; i++) {
      g.fillStyle = (i + j) % 2 ? '#111' : '#eee';
      g.fillRect(x + i * sq, y + j * sq, Math.min(sq, w - i * sq), Math.min(sq, h - j * sq));
    }
  };

  // Hoardings 0-3: the circuit's existing billboard artwork; 4-7: new boards in the same palette.
  for (let v = 0; v < 4; v++) {
    const t = TX.billboardTexture(v);
    g.drawImage(t.image, (v % 4) * 512, 0, 512, 160);
    t.dispose();
    reg(`h${v}`, v * 512, 0, 512, 160, 0.5);
  }
  {
    const y = 160;
    // 4: RED LINE on ink
    let x = 0;
    g.fillStyle = BRAND.ink; g.fillRect(x, y, 512, 160);
    text(BRAND.game, x + 256, y + 72, `italic 800 118px ${COND}`, BRAND.redHot, { maxW: 470 });
    g.fillStyle = BRAND.cream; g.fillRect(x + 96, y + 128, 320, 5);
    reg('h4', x, y, 512, 160, 0.5);
    // 5: circuit name on red with a chequer strip
    x = 512;
    g.fillStyle = BRAND.red; g.fillRect(x, y, 512, 160);
    chequer(x, y, 64, 160, 16);
    text(BRAND.circuit.toUpperCase(), x + 290, y + 66, `700 46px ${SLAB}`, BRAND.cream, { maxW: 420, spacing: 2 });
    g.fillStyle = BRAND.gold; g.fillRect(x + 110, y + 104, 360, 4);
    text(BRAND.wordmark, x + 290, y + 130, `600 26px ${SLAB}`, BRAND.gold, { spacing: 6 });
    reg('h5', x, y, 512, 160, 0.5);
    // 6: responsible message on cream
    x = 1024;
    g.fillStyle = BRAND.cream; g.fillRect(x, y, 512, 160);
    text('NEVER DRINK AND RIDE', x + 256, y + 70, `italic 800 72px ${COND}`, BRAND.ink, { maxW: 480 });
    g.fillStyle = BRAND.redHot; g.fillRect(x + 120, y + 118, 272, 6);
    reg('h6', x, y, 512, 160, 0.5);
    // 7: rider number on burgundy
    x = 1536;
    g.fillStyle = BRAND.burgundy; g.fillRect(x, y, 512, 160);
    g.fillStyle = BRAND.cream; g.beginPath(); g.ellipse(x + 92, y + 80, 64, 58, 0, 0, Math.PI * 2); g.fill();
    text(BRAND.riderNumber, x + 92, y + 84, `italic 800 86px ${COND}`, BRAND.ink);
    text(BRAND.game, x + 330, y + 64, `italic 800 84px ${COND}`, BRAND.cream, { maxW: 300 });
    text(BRAND.wordmark, x + 330, y + 122, `700 30px ${SLAB}`, BRAND.gold, { spacing: 5, maxW: 300 });
    reg('h7', x, y, 512, 160, 0.5);
  }
  // Bridge banner: drawn squashed so it reads right on a 22:1 face.
  {
    const y = 320;
    g.fillStyle = BRAND.ink; g.fillRect(0, y, 2048, 128);
    g.fillStyle = BRAND.redHot; g.fillRect(0, y + 112, 2048, 10);
    g.fillStyle = BRAND.gold; g.fillRect(0, y + 6, 2048, 3);
    const items = [[BRAND.wordmark, `700 64px ${SLAB}`, BRAND.cream], [BRAND.game, `italic 800 96px ${COND}`, BRAND.redHot],
      [BRAND.circuit.toUpperCase(), `600 50px ${SLAB}`, BRAND.gold]];
    [0, 1, 2, 1].forEach((k, n) => {
      text(items[k][0], [300, 780, 1330, 1800][n], y + 62, items[k][1], items[k][2], { maxW: n === 2 ? 560 : 420, spacing: k === 0 ? 8 : 2 });
    });
    reg('bridge', 0, y, 2048, 128, 0.45);
  }
  // Tyre-wall belt covers (conveyor belt, bolted): 4 m x 1 m panels.
  {
    const y = 448;
    const belt = (x, bg, fg, label, font) => {
      g.fillStyle = bg; g.fillRect(x, y, 512, 128);
      grain(x, y, 512, 128, 2600, 0.08);
      // horizontal seams and bolt rows
      g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y + 42, 512, 2); g.fillRect(x, y + 86, 512, 2);
      g.fillStyle = 'rgba(20,20,20,0.7)';
      for (let b = 12; b < 512; b += 32) for (const by of [10, 64, 118]) { g.beginPath(); g.arc(x + b, y + by, 3, 0, Math.PI * 2); g.fill(); }
      if (label) text(label, x + 256, y + 66, font, fg, { maxW: 470, spacing: 4 });
      // grime toward the bottom
      const grd = g.createLinearGradient(0, y, 0, y + 128);
      grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.75, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(40,30,20,0.35)');
      g.fillStyle = grd; g.fillRect(x, y, 512, 128);
    };
    belt(0, BRAND.red, null, null);
    belt(512, BRAND.cream, null, null);
    belt(1024, BRAND.red, BRAND.cream, BRAND.game, `italic 800 84px ${COND}`);
    belt(1536, BRAND.ink, BRAND.cream, BRAND.wordmark, `700 58px ${SLAB}`);
    for (let k = 0; k < 4; k++) reg(`belt${k}`, k * 512, y, 512, 128, 0.78);
  }
  // Big screen picture (TV graphics).
  {
    const x = 0, y = 576, w = 640, h = 360;
    const grd = g.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, '#f2a257'); grd.addColorStop(0.55, '#b3503a'); grd.addColorStop(1, '#2a1216');
    g.fillStyle = grd; g.fillRect(x, y, w, h);
    // sun and a silhouetted rider on the kerb
    g.fillStyle = 'rgba(255,236,190,0.9)'; g.beginPath(); g.arc(x + 450, y + 150, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1b1210';
    g.fillRect(x, y + 250, w, 110);
    g.save(); g.translate(x + 450, y + 230); g.rotate(-0.55);
    g.beginPath(); g.ellipse(0, 0, 70, 20, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(-50, 22, 22, 0, Math.PI * 2); g.arc(52, 22, 22, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(-8, -22, 26, 16, -0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(18, -36, 12, 0, Math.PI * 2); g.fill();
    g.restore();
    for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? BRAND.cream : BRAND.redHot; g.fillRect(x + 250 + k * 40, y + 250, 40, 8); }
    // timing tower
    g.fillStyle = 'rgba(20,14,12,0.82)'; g.fillRect(x + 16, y + 56, 150, 232);
    g.fillStyle = BRAND.redHot; g.fillRect(x + 16, y + 56, 150, 26);
    text('LAP 12/20', x + 91, y + 70, `700 20px ${COND}`, BRAND.cream);
    const nums = ['54', '12', '7', '33', '88', '21', '5', '72'];
    nums.forEach((n, k) => {
      const yy = y + 96 + k * 24;
      text(String(k + 1), x + 34, yy, `700 18px ${COND}`, BRAND.gold);
      g.fillStyle = k === 0 ? BRAND.redHot : '#555'; g.fillRect(x + 50, yy - 9, 4, 18);
      text(n, x + 80, yy, `italic 800 20px ${COND}`, BRAND.cream);
      text(k === 0 ? 'LEADER' : `+${(k * 0.83).toFixed(3)}`, x + 130, yy, `600 16px ${COND}`, '#d9d0bf');
    });
    // live bug + name strap
    g.fillStyle = BRAND.redHot; g.fillRect(x + 530, y + 18, 90, 30);
    text('LIVE', x + 575, y + 34, `italic 800 24px ${COND}`, '#fff');
    g.fillStyle = 'rgba(20,14,12,0.85)'; g.fillRect(x + 190, y + 296, 430, 46);
    g.fillStyle = BRAND.redHot; g.fillRect(x + 190, y + 296, 8, 46);
    text(BRAND.game, x + 290, y + 320, `italic 800 34px ${COND}`, BRAND.cream);
    text(BRAND.circuit.toUpperCase(), x + 500, y + 320, `600 18px ${SLAB}`, BRAND.gold, { maxW: 220 });
    reg('screen', x, y, w, h, 0.3);
  }
  // Team truck trailer livery (13.6 x 3.2 m) and motorhome band.
  {
    const x = 640, y = 576, w = 1024, h = 256;
    g.fillStyle = BRAND.red; g.fillRect(x, y, w, h);
    g.fillStyle = BRAND.ink; g.fillRect(x, y + h - 46, w, 46);
    g.fillStyle = BRAND.cream;
    g.beginPath(); g.moveTo(x, y + 150); g.bezierCurveTo(x + 300, y + 150, x + 600, y + 60, x + w, y + 30); g.lineTo(x + w, y + 60);
    g.bezierCurveTo(x + 620, y + 90, x + 320, y + 178, x, y + 178); g.fill();
    g.strokeStyle = BRAND.gold; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x, y + 186); g.bezierCurveTo(x + 330, y + 186, x + 640, y + 98, x + w, y + 70); g.stroke();
    text(BRAND.game, x + 250, y + 88, `italic 800 118px ${COND}`, BRAND.cream, { maxW: 420 });
    text(BRAND.wordmark, x + 760, y + 170, `700 44px ${SLAB}`, BRAND.cream, { spacing: 8 });
    text(BRAND.riderNumber, x + 940, y + 116, `italic 800 70px ${COND}`, BRAND.ink);
    grain(x, y, w, h, 1500, 0.03);
    reg('truck', x, y, w, h, 0.32, 0.25);
    const y2 = 832, h2 = 128;
    g.fillStyle = BRAND.cream; g.fillRect(x, y2, w, h2);
    g.fillStyle = '#1c2227'; g.fillRect(x, y2 + 26, w, 40);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    for (let k = 0; k < 12; k++) g.fillRect(x + 20 + k * 84, y2 + 28, 70, 10);
    g.fillStyle = BRAND.red; g.fillRect(x, y2 + 80, w, 36);
    g.fillStyle = BRAND.gold; g.fillRect(x, y2 + 74, w, 4);
    text(BRAND.wordmark, x + 800, y2 + 98, `700 26px ${SLAB}`, BRAND.cream, { spacing: 6 });
    reg('coach', x, y2, w, h2, 0.3, 0.2);
  }
  // Small signs.
  {
    const x = 1664;
    const sign = (name, y, bg, fg, label, font) => {
      g.fillStyle = bg; g.fillRect(x, y, 256, 64);
      text(label, x + 128, y + 34, font, fg, { maxW: 236, spacing: 3 });
      reg(name, x, y, 256, 64, 0.5);
    };
    sign('marshal', 576, '#f0661a', BRAND.ink, 'MARSHAL', `800 42px ${COND}`);
    sign('tv', 640, BRAND.ink, BRAND.cream, `${BRAND.game} TV`, `italic 800 44px ${COND}`);
    g.fillStyle = BRAND.redHot; g.beginPath(); g.arc(x + 24, 672, 8, 0, Math.PI * 2); g.fill();
    // tent valance: scalloped red with cream wordmark
    g.fillStyle = BRAND.cream; g.fillRect(x, 704, 256, 64);
    g.fillStyle = BRAND.red; g.fillRect(x, 704, 256, 44);
    for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(x + 16 + k * 32, 748, 16, 0, Math.PI); g.fill(); }
    text(BRAND.wordmark, x + 128, 726, `700 24px ${SLAB}`, BRAND.cream, { spacing: 4 });
    reg('valance', x, 704, 256, 64, 0.9);
    sign('safety', 768, '#f2efe8', BRAND.ink, 'SAFETY', `italic 800 46px ${COND}`);
    sign('pit', 832, BRAND.ink, BRAND.cream, 'PIT', `800 50px ${COND}`);
    sign('post', 896, '#f0661a', BRAND.ink, 'POST', `800 44px ${COND}`);
  }
  // Tileable-ish asphalt and a paving tile.
  {
    const y = 1024;
    g.fillStyle = '#9a9a9a'; g.fillRect(0, y, 256, 256);
    grain(0, y, 256, 256, 9000, 0.12);
    reg('asphalt', 0, y, 256, 256, 0.9, 0, 4);
    g.fillStyle = '#b8b3aa'; g.fillRect(256, y, 256, 256);
    grain(256, y, 256, 256, 6000, 0.08);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let k = 0; k <= 4; k++) { g.fillRect(256 + k * 64, y, 2, 256); g.fillRect(256, y + k * 64, 256, 2); }
    reg('paving', 256, y, 256, 256, 0.92, 0, 4);
  }
  // Swatches: white albedo, tinted per vertex; roughness / metalness per swatch.
  const swatches = {
    matte: [0.85, 0], paint: [0.48, 0.08], metal: [0.38, 0.85], steel: [0.55, 0.55], glass: [0.06, 0.9],
    rubber: [0.93, 0], fabric: [0.96, 0], plastic: [0.42, 0], concrete: [0.97, 0], chrome: [0.18, 1.0],
  };
  let k = 0;
  for (const [name, [r, m]] of Object.entries(swatches)) {
    const x = 1920 + (k % 4) * 32, y = 576 + Math.floor(k / 4) * 32; k++;
    g.fillStyle = '#ffffff'; g.fillRect(x, y, 32, 32);
    orm(x, y, 32, 32, r, m);
    SW[name] = [(x + 16) / W, 1 - (y + 16) / H];
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  const ormTex = new THREE.CanvasTexture(oc);
  ormTex.colorSpace = THREE.NoColorSpace;
  return { tex, ormTex, R, SW };
}

// Flag cloths: 8 landscape designs (512x256) in a 2x4 grid. Portrait banners sample them rotated.
function buildFlagAtlas(maxAniso) {
  const S = 1024;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const text = (s, x, y, font, color, maxW, spacing = 0) => {
    g.save(); g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (spacing && 'letterSpacing' in g) g.letterSpacing = `${spacing}px`;
    const w = g.measureText(s).width;
    g.translate(x, y); if (w > maxW) g.scale(maxW / w, 1); g.fillText(s, 0, 0); g.restore();
  };
  const cell = (k, fn) => { const x = (k % 2) * 512, y = Math.floor(k / 2) * 256; g.save(); g.beginPath(); g.rect(x, y, 512, 256); g.clip(); fn(x, y); g.restore(); };
  cell(0, (x, y) => {
    g.fillStyle = BRAND.red; g.fillRect(x, y, 512, 256);
    g.fillStyle = BRAND.gold; g.fillRect(x, y + 14, 512, 8); g.fillRect(x, y + 234, 512, 8);
    text(BRAND.game, x + 256, y + 132, `italic 800 150px ${COND}`, BRAND.cream, 470);
  });
  cell(1, (x, y) => {
    g.fillStyle = BRAND.cream; g.fillRect(x, y, 512, 256);
    text(BRAND.wordmark, x + 256, y + 116, `700 84px ${SLAB}`, BRAND.red, 470, 6);
    g.fillStyle = BRAND.redHot; g.fillRect(x + 80, y + 176, 352, 10);
  });
  cell(2, (x, y) => {
    for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { g.fillStyle = (i + j) % 2 ? '#141414' : '#f2f2f2'; g.fillRect(x + i * 64, y + j * 64, 64, 64); }
  });
  cell(3, (x, y) => {
    g.fillStyle = BRAND.ink; g.fillRect(x, y, 512, 256);
    g.strokeStyle = BRAND.cream; g.lineWidth = 8; g.strokeRect(x + 16, y + 16, 480, 224);
    text(BRAND.game, x + 256, y + 132, `italic 800 140px ${COND}`, BRAND.redHot, 440);
  });
  cell(4, (x, y) => {
    g.fillStyle = BRAND.burgundy; g.fillRect(x, y, 512, 256);
    g.fillStyle = BRAND.cream; g.beginPath(); g.arc(x + 256, y + 128, 96, 0, Math.PI * 2); g.fill();
    text(BRAND.riderNumber, x + 256, y + 136, `italic 800 136px ${COND}`, BRAND.ink, 170);
  });
  cell(5, (x, y) => {
    g.fillStyle = BRAND.gold; g.fillRect(x, y, 512, 256);
    g.fillStyle = BRAND.ink; g.fillRect(x, y + 196, 512, 60);
    text(BRAND.circuit.toUpperCase(), x + 256, y + 100, `700 58px ${SLAB}`, BRAND.ink, 480, 2);
    text(BRAND.game, x + 256, y + 226, `italic 800 50px ${COND}`, BRAND.cream, 300, 4);
  });
  cell(6, (x, y) => {
    const bands = [BRAND.red, BRAND.cream, BRAND.red];
    bands.forEach((c, k) => { g.fillStyle = c; g.fillRect(x, y + k * 86, 512, 86); });
    g.fillStyle = BRAND.ink; g.fillRect(x, y, 120, 256);
    text(BRAND.riderNumber, x + 60, y + 132, `italic 800 90px ${COND}`, BRAND.cream, 110);
  });
  cell(7, (x, y) => {
    g.fillStyle = BRAND.rye; g.fillRect(x, y, 512, 256);
    g.fillStyle = BRAND.cream; g.fillRect(x, y + 110, 512, 36);
    g.fillStyle = BRAND.gold; g.fillRect(x + 150, y, 36, 256);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

// ---------------------------------------------------------------------------------------------- mesh kit
const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _e1 = new THREE.Vector3(), _e2 = new THREE.Vector3();
const _nm = new THREE.Matrix3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _eu = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3();

const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  ico: new THREE.IcosahedronGeometry(1, 0),
  oct: new THREE.OctahedronGeometry(1, 0),
  pyr: new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4),
  dome: new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2),
  _c: new Map(),
  cyl(seg = 6, open = true, taper = 1) {
    const key = `${seg}|${open}|${taper}`;
    if (!this._c.has(key)) this._c.set(key, new THREE.CylinderGeometry(taper, 1, 1, seg, 1, open));
    return this._c.get(key);
  },
  cone(seg = 8) {
    const key = `cone${seg}`;
    if (!this._c.has(key)) this._c.set(key, new THREE.ConeGeometry(1, 1, seg, 1, true));
    return this._c.get(key);
  },
};

// Accumulates transformed template geometry into per-key buffers.
class Kit {
  constructor(atlas, extra = false) {
    this.A = atlas; this.chunks = new Map(); this.extra = extra; this.tris = 0;
  }
  get(key) {
    let c = this.chunks.get(key);
    if (!c) this.chunks.set(key, c = { p: [], n: [], c: [], u: [], i: [], e: this.extra ? [] : null });
    return c;
  }
  add(key, geo, m, col, uv, ex) {
    const ch = this.get(key);
    const P = geo.attributes.position, Nr = geo.attributes.normal, U = geo.attributes.uv;
    const base = ch.p.length / 3;
    _nm.getNormalMatrix(m);
    for (let k = 0; k < P.count; k++) {
      _v.fromBufferAttribute(P, k).applyMatrix4(m);
      ch.p.push(_v.x, _v.y, _v.z);
      _v.fromBufferAttribute(Nr, k).applyMatrix3(_nm).normalize();
      ch.n.push(_v.x, _v.y, _v.z);
      ch.c.push(col.r, col.g, col.b);
      if (uv.length === 2 || !U) ch.u.push(uv[0], uv[1]);
      else ch.u.push(uv[0] + U.getX(k) * (uv[2] - uv[0]), uv[1] + U.getY(k) * (uv[3] - uv[1]));
      if (ch.e) ch.e.push(ex ? ex[0] : 0, ex ? ex[1] : 0);
    }
    const I = geo.index;
    if (I) for (let k = 0; k < I.count; k++) ch.i.push(base + I.getX(k));
    else for (let k = 0; k < P.count; k++) ch.i.push(base + k);
    this.tris += (I ? I.count : P.count) / 3;
  }
  // Quad a-b-c-d, counter-clockwise seen from its front. A uv rect maps a=(u0,v0) b=(u1,v0) c=(u1,v1) d=(u0,v1).
  quad(key, a, b, c, d, col, uv) {
    const ch = this.get(key);
    const base = ch.p.length / 3;
    _e1.subVectors(b, a); _e2.subVectors(d, a); _n.crossVectors(_e1, _e2).normalize();
    for (const q of [a, b, c, d]) {
      ch.p.push(q.x, q.y, q.z); ch.n.push(_n.x, _n.y, _n.z); ch.c.push(col.r, col.g, col.b);
      if (ch.e) ch.e.push(0, 0);
    }
    if (uv.length === 2) for (let k = 0; k < 4; k++) ch.u.push(uv[0], uv[1]);
    else ch.u.push(uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]);
    ch.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    this.tris += 2;
  }
  geometry(key) {
    const ch = this.chunks.get(key);
    if (!ch || !ch.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(ch.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(ch.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(ch.c, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(ch.u, 2));
    if (ch.e) {
      const t = [], a = [];
      for (let k = 0; k < ch.e.length; k += 2) { t.push(ch.e[k]); a.push(ch.e[k + 1]); }
      g.setAttribute('tint', new THREE.Float32BufferAttribute(t, 1));
      g.setAttribute('arm', new THREE.Float32BufferAttribute(a, 1));
    }
    const V = ch.p.length / 3;
    g.setIndex(V > 65535 ? new THREE.Uint32BufferAttribute(ch.i, 1) : new THREE.Uint16BufferAttribute(ch.i, 1));
    g.computeBoundingSphere();
    return g;
  }
}

// A local frame (prop space) that writes into a kit chunk. +z faces the track, y up.
class Frame {
  constructor(kit, key, base) { this.kit = kit; this.key = key; this.base = base; }
  sub(x, y, z, ry = 0) {
    const m = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z).premultiply(this.base);
    return new Frame(this.kit, this.key, m);
  }
  part(geo, x, y, z, sx, sy, sz, col, uv, rx = 0, ry = 0, rz = 0, ex) {
    _eu.set(rx, ry, rz); _q.setFromEuler(_eu);
    _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)).premultiply(this.base);
    this.kit.add(this.key, geo, _m, col, uv, ex);
  }
  box(x, y, z, sx, sy, sz, col, sw = 'matte', ry = 0, rx = 0, rz = 0, ex) {
    this.part(GEO.box, x, y, z, sx, sy, sz, col, this.kit.A.SW[sw], rx, ry, rz, ex);
  }
  // vertical post from y0 to y1
  post(x, y0, y1, z, r, col, sw = 'steel', seg = 6) {
    this.part(GEO.cyl(seg), x, (y0 + y1) / 2, z, r, y1 - y0, r, col, this.kit.A.SW[sw]);
  }
  // thin member between two local points
  beam(a, b, t, col, sw = 'steel') {
    const d = _e1.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = d.length();
    _q.setFromUnitVectors(_e2.set(0, 1, 0), d.normalize());
    _m.compose(_p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, _s.set(t, len, t)).premultiply(this.base);
    this.kit.add(this.key, GEO.box, _m, col, this.kit.A.SW[sw]);
  }
  // printed panel facing local +z (after ry), centred at x,y,z
  panel(x, y, z, w, h, rect, col = COL.white, ry = 0) {
    this.part(GEO.plane, x, y, z, w, h, 1, col, rect, 0, ry, 0);
  }
}

// Low-poly figure, feet at local origin, facing +z.
function person(F, suit, { legs = null, cap = null, skin = COL.skin, arm = 0, boots = COL.ink } = {}) {
  const L = legs || suit;
  F.box(0, 0.44, 0, 0.34, 0.88, 0.19, L, 'fabric');
  F.box(0, 0.04, 0.03, 0.36, 0.08, 0.26, boots, 'rubber');
  F.box(0, 1.14, 0, 0.42, 0.6, 0.24, suit, 'fabric');
  F.box(-0.27, 1.15, 0, 0.11, 0.56, 0.13, suit, 'fabric');
  if (arm) F.box(0.3, 1.62, 0.12, 0.11, 0.56, 0.13, suit, 'fabric', 0, -0.35, 0.25);
  else F.box(0.27, 1.15, 0, 0.11, 0.56, 0.13, suit, 'fabric');
  F.part(GEO.oct, 0, 1.58, 0, 0.12, 0.14, 0.12, skin, F.kit.A.SW.matte, 0, 0.4, 0);
  if (cap) F.box(0, 1.68, 0.05, 0.24, 0.07, 0.34, cap, 'fabric');
}

// Crowd figure for instancing. tint: 1 = shirt (instance colour), 0.3 = trousers, -1 = skin (per-instance tone);
// arm: 1 on the right arm, which some instances raise and wave.
function crowdGeometry(atlas, lite) {
  const kit = new Kit(atlas, true);
  const F = new Frame(kit, 0, new THREE.Matrix4());
  const sw = atlas.SW.fabric;
  const ex = (t, a = 0) => [t, a];
  F.part(GEO.box, 0, 0.43, 0, 0.34, 0.86, 0.19, COL.denim, sw, 0, 0, 0, ex(0.35));
  F.part(GEO.box, 0, 1.15, 0, 0.44, 0.6, 0.25, COL.white, sw, 0, 0, 0, ex(1));
  if (!lite) {
    F.part(GEO.box, -0.28, 1.15, 0, 0.11, 0.56, 0.13, COL.white, sw, 0, 0, 0, ex(1));
    F.part(GEO.box, 0.28, 1.15, 0, 0.11, 0.56, 0.13, COL.white, sw, 0, 0, 0, ex(1, 1));
  }
  F.part(GEO.oct, 0, 1.59, 0, 0.12, 0.14, 0.12, COL.white, sw, 0, 0.4, 0, ex(-1));
  const g = kit.geometry(0);
  g.userData.tris = kit.tris;
  return g;
}

// ---------------------------------------------------------------------------------------------- materials
function crowdMaterial(U) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; attribute float tint; attribute float arm; attribute float aSkin;`)
      .replace('#include <color_vertex>', `#include <color_vertex>
        #ifdef USE_INSTANCING_COLOR
          vColor.rgb = tint < -0.5 ? color.rgb * vec3(0.95, 0.72, 0.58) * aSkin : mix(color.rgb, color.rgb * instanceColor.rgb, tint);
        #endif`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        float cid = float(gl_InstanceID);
        float cph = fract(sin(cid * 12.9898 + 4.1) * 43758.5453);
        float ca = step(0.8, cph) * arm * (2.5 + sin(uTime * (4.0 + cph * 3.0) + cph * 40.0) * 0.5);
        float cc = cos(ca), cs = sin(ca);
        objectNormal.xy = vec2(cc * objectNormal.x - cs * objectNormal.y, cs * objectNormal.x + cc * objectNormal.y);`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec2 cd = transformed.xy - vec2(0.28, 1.42);
        transformed.xy = vec2(0.28, 1.42) + vec2(cc * cd.x - cs * cd.y, cs * cd.x + cc * cd.y);
        transformed.y += max(0.0, sin(uTime * (3.0 + cph * 4.0) + cph * 30.0)) * 0.13 * step(0.9, fract(cph * 7.13));`);
  };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev(sh, r);
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += diffuseColor.rgb * 0.2;`);
  };
  mat.customProgramCacheKey = () => 'dressing-crowd';
  return mat;
}

function flagMaterial(U, tex) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.78, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; attribute vec3 aFlag;`)
      .replace('#include <uv_vertex>', `#include <uv_vertex>
        vec2 fuv = aFlag.z > 0.5 ? vec2(1.0 - uv.y, uv.x) : uv;
        vMapUv = aFlag.xy + vec2(0.004, 0.003) + fuv * vec2(0.492, 0.244);`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        float fx = position.x;
        float fph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23 + instanceMatrix[3].y * 0.11;
        float gust = 0.7 + 0.3 * sin(uTime * 0.55 + fph * 0.21);
        float fk = 5.5;
        float fw = uTime * 7.0 - fx * fk + fph;
        float famp = 0.15 * gust;
        float dzdx = famp * (sin(fw) - fx * fk * cos(fw));
        objectNormal = normalize(vec3(-dzdx, 0.0, 1.0));`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.z += famp * fx * sin(fw);
        transformed.x -= famp * 0.4 * fx * (0.5 - 0.5 * cos(2.0 * fw));
        transformed.y -= 0.035 * fx * fx;`);
  };
  mat.customProgramCacheKey = () => 'dressing-flag';
  return mat;
}

// ---------------------------------------------------------------------------------------------- occupancy
const K_TRUNK = 1, K_CROWN = 2, K_SOLID = 3, K_MINE = 4, K_WORLD = 5;
const M_ALL = 0b111110, M_PEOPLE = (1 << K_TRUNK) | (1 << K_SOLID) | (1 << K_MINE) | (1 << K_WORLD);

class Space {
  constructor(T, world, scene) {
    this.T = T; this.W = world; this.cell = 16; this.g = new Map(); this.nr = {};
    this.boxes = world.placedBoxes = world.placedBoxes || [];
    this.worldBoxes = this.boxes.length;
    // Trees: every top-level instanced mesh the world built without frustum culling.
    for (const o of scene.children) {
      if (!o.isInstancedMesh || o.frustumCulled !== false) continue;
      const type = o.geometry.type;
      const kind = type === 'CylinderGeometry' ? K_TRUNK : (o === world.canopy || type === 'IcosahedronGeometry') ? K_CROWN : K_SOLID;
      const a = o.instanceMatrix.array;
      for (let k = 0; k < o.count; k++) {
        const e = k * 16;
        const sx = Math.hypot(a[e], a[e + 1], a[e + 2]);
        const r = kind === K_TRUNK ? 0.7 : kind === K_CROWN ? sx * 0.72 : sx * 0.85;
        this.add(a[e + 12], a[e + 14], Math.min(r, 7), kind);
      }
    }
  }
  add(x, z, r, kind = K_MINE) {
    const c = { x, z, r, kind };
    const i0 = Math.floor((x - r) / this.cell), i1 = Math.floor((x + r) / this.cell);
    const j0 = Math.floor((z - r) / this.cell), j1 = Math.floor((z + r) / this.cell);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const key = i * 100003 + j;
      let l = this.g.get(key);
      if (!l) this.g.set(key, l = []);
      l.push(c);
    }
    return c;
  }
  hit(x, z, r, mask = M_ALL) {
    const i0 = Math.floor((x - r) / this.cell), i1 = Math.floor((x + r) / this.cell);
    const j0 = Math.floor((z - r) / this.cell), j1 = Math.floor((z + r) / this.cell);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const l = this.g.get(i * 100003 + j);
      if (!l) continue;
      for (const c of l) {
        if (!((1 << c.kind) & mask)) continue;
        const dx = x - c.x, dz = z - c.z, rr = r + c.r;
        if (dx * dx + dz * dz < rr * rr) return true;
      }
    }
    return false;
  }
  boxHit(x, z, r, worldOnly = false) {
    const n = worldOnly ? this.worldBoxes : this.boxes.length;
    for (let k = 0; k < n; k++) {
      const b = this.boxes[k];
      if (Math.abs(x - b.x) < b.hx + r && Math.abs(z - b.z) < b.hz + r) return true;
    }
    return false;
  }
  trackD(x, z) { this.T.nearest(x, z, 2, this.nr); return this.nr.d; }
  ok(x, z, r, { minD = LANES.wall + CLEAR, mask = M_ALL, boxes = true } = {}) {
    if (this.trackD(x, z) < minD + r) return false;
    if (boxes && this.boxHit(x, z, r)) return false;
    if (this.hit(x, z, r, mask)) return false;
    return this.W.heightAt(x, z) > RIVER_LOW;
  }
  reserve(x, z, hx, hz = hx) { this.boxes.push({ x, z, hx, hz }); }
}

// ---------------------------------------------------------------------------------------------- dressing
class Dressing {
  constructor(scene, track, world) {
    this.scene = scene; this.T = track; this.W = world;
    this.group = new THREE.Group();
    this.group.name = 'dressing';
    this.U = { uTime: { value: 0 } };
    const r = world.renderer;
    const aniso = r && r.capabilities ? Math.min(QUALITY.tier === 'ultra' || QUALITY.tier === 'high' ? 16 : 8, r.capabilities.getMaxAnisotropy()) : 8;
    this.A = buildAtlas(aniso);
    this.kit = new Kit(this.A);          // static props (cast + receive shadow)
    this.low = new Kit(this.A);          // tyre walls: realtime shadow only (a 1 m wall throws an 11 m shadow at 5 deg sun)
    this.flat = new Kit(this.A);         // hoardings, pit lane / paddock surfaces: receive only
    this.glow = new Kit(this.A);         // unlit / emissive faces
    this.flags = [];
    this.banks = [];
    this.space = new Space(track, world, scene);
    this.rng = TX.rng(2024);
    this.placed = [];
    this._fr = {};
    this.#worldObstacles();

    this.#tyreWalls();
    this.#hoardings();
    this.#bridge(262);
    this.#bigScreen(192, 37);
    this.#pitLane();
    this.#marshalPosts();
    this.#tvTowers();
    this.#spectatorBanks();
    this.#fanZones();
    this.#flagClusters();
    this.#roofFlags();
    this.#paddock();
    this.#lightMasts();
    this.#finish();
  }

  // ------------------------------------------------------------------ helpers
  idx(s) { return Math.floor(this.T.wrapS(s) / this.T.ds) % this.T.N; }
  wall(s, side) { const i = this.idx(s); return side > 0 ? this.T.wallR[i] : this.T.wallL[i]; }
  isAir(i, side) { const T = this.T; return T.gravel[i] && -T.turnSide[i] === side && (side > 0 ? T.wallR[i] : T.wallL[i]) > 18; }
  key(s, len = CHUNK) { return Math.floor(this.T.wrapS(s) / len); }
  pt(s, lat, up = 0, out = new THREE.Vector3()) {
    const f = this.T.frame(s, this._fr);
    return out.set(f.x + f.rx * lat, f.y + up, f.z + f.rz * lat);
  }
  // Frame at (s, lat) on the terrain, +z facing the centreline (turned toward oncoming traffic by `lookBack`).
  site(s, lat, r = 1, lookBack = 0) {
    const f = this.T.frame(s, this._fr);
    const x = f.x + f.rx * lat, z = f.z + f.rz * lat;
    const sg = lat >= 0 ? 1 : -1;
    const fx = -sg * f.rx - f.tx * lookBack, fz = -sg * f.rz - f.tz * lookBack;
    const yaw = Math.atan2(fx, fz);
    let y = this.W.heightAt(x, z);
    if (r > 0) for (let k = 0; k < 4; k++) y = Math.min(y, this.W.heightAt(x + Math.cos(k * 1.5708) * r, z + Math.sin(k * 1.5708) * r));
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y - 0.04, z);
    return { x, y: y - 0.04, z, yaw, m, s, trackY: f.y, tx: f.tx, tz: f.tz, rx: f.rx, rz: f.rz };
  }
  frameAt(kit, key, x, y, z, yaw) {
    return new Frame(kit, key, new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z));
  }
  // Circular mask runs [i0, i1] (i1 may exceed N).
  runs(on) {
    const N = this.T.N, out = [];
    let all = true;
    for (let i = 0; i < N; i++) if (!on(i)) { all = false; break; }
    if (all) return [[0, N - 1]];
    let start = 0; while (on(start)) start++;
    let run = -1;
    for (let n = 0; n <= N; n++) {
      const i = (start + n) % N, o = n < N && on(i);
      if (o && run < 0) run = start + n;
      if (!o && run >= 0) { out.push([run, start + n - 1]); run = -1; }
    }
    return out;
  }
  flag(x, y, z, w, h, cell, portrait, yawJitter = 0) {
    this.flags.push({ x, y, z, w, h, cell, portrait, yaw: this.windYaw + yawJitter });
  }
  // Flags stream toward north-north-west: across the main straight and Rickhouse Row, so riders see them broadside.
  get windYaw() { return Math.atan2(-0.98, -0.2); }

  // Things the world placed without reserving a footprint: billboards, the final-corner stand, horse fences.
  #worldObstacles() {
    const T = this.T, L = T.length, sp = this.space;
    const turnAt = (s) => T.turnSide[this.idx(s)];
    for (const c of T.corners) {
      const p = this.pt(c.s0 - 70, -turnAt(c.apex) * (T.wallL[0] + 6));
      sp.add(p.x, p.z, 7, K_WORLD);
    }
    for (let s = 120; s < L; s += 420) { const p = this.pt(s, -33 * turnAt(s)); sp.add(p.x, p.z, 7, K_WORLD); }
    const cl = T.corners[T.corners.length - 1];
    if (cl) {
      const sm = (cl.s0 + cl.s1) / 2, lat = cl.dir === 'R' ? -34 : 34;
      for (let d = -58; d <= 58; d += 8) for (const dl of [2, 8, 14]) { const p = this.pt(sm + d, lat + Math.sign(lat) * dl); sp.add(p.x, p.z, 5.5, K_WORLD); }
    }
    const runs = [[L * 0.36, L * 0.52], [L * 0.8, L * 0.92], [L * 0.05, L * 0.2]];
    for (const [s0, s1] of runs) for (let s = s0; s <= s1; s += 5) { const p = this.pt(s, -turnAt(s) * 44); sp.add(p.x, p.z, 1.2, K_WORLD); }
    // the start gantry legs
    for (const lat of [-10.5, 10.5]) { const p = this.pt(0, lat); sp.add(p.x, p.z, 2, K_WORLD); }
  }

  // ------------------------------------------------------------------ tyre walls
  // Belt-covered tyre stacks in front of the armco: run-ups to every air fence, and the inside of slow apexes.
  #tyreWalls() {
    const T = this.T, N = T.N, ds = T.ds;
    const mask = { [-1]: new Uint8Array(N), [1]: new Uint8Array(N) };
    const mark = (side, s0, s1) => { for (let s = s0; s <= s1; s += ds * 0.5) { const i = this.idx(s); if (!this.isAir(i, side)) mask[side][i] = 1; } };
    for (const side of [-1, 1]) {
      for (const [a, b] of this.runs(i => this.isAir(i, side))) {
        if ((b - a) * ds < 40) continue;
        mark(side, a * ds - 40, a * ds - 1);
        mark(side, b * ds + 1, b * ds + 26);
      }
    }
    for (const c of T.corners) if (c.radius < 75) mark(c.dir === 'R' ? 1 : -1, c.apex - 34, c.apex + 24);
    // close short gaps so walls read as continuous
    for (const side of [-1, 1]) {
      const m = mask[side];
      for (const [a, b] of this.runs(i => !m[i] && !this.isAir(i, side))) if ((b - a + 1) * ds < 26) for (let i = a; i <= b; i++) m[i % N] = 1;
    }
    this.tyreMask = mask;
    this.tyreLen = [-1, 1].reduce((a, sd) => a + mask[sd].reduce((x, v) => x + v, 0) * ds, 0);
    const stacks = TIER <= 1;
    const lathe = new THREE.LatheGeometry([
      new THREE.Vector2(0.14, 0.98), new THREE.Vector2(0.29, 1.01), new THREE.Vector2(0.325, 0.94), new THREE.Vector2(0.325, 0.05),
    ], 5);
    const sw = this.A.SW, R = this.A.R;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    let panel = 0;
    const seq = [0, 1, 0, 1, 2, 1, 0, 1, 3, 1];
    for (const side of [-1, 1]) {
      for (const [i0, i1] of this.runs(i => mask[side][i])) {
        const s0 = i0 * ds, s1 = (i1 + 1) * ds;
        // stacks
        if (stacks) {
          const key = this.key(s0, CHUNK * 2);
          for (let s = s0 + 0.35; s < s1; s += 0.66) {
            const w = this.wall(s, side);
            const p = this.pt(s, side * (w - 0.4), -0.01);
            if (this.space.trackD(p.x, p.z) < w - 1.4) continue;
            _m.makeRotationY(s * 1.7).setPosition(p.x, p.y, p.z);
            this.low.add(key, lathe, _m, COL.tyre, sw.rubber);
          }
        }
        // belt, 4 m panels split into two quads so it follows the curve
        for (let s = s0; s < s1 - 0.5; s += 4) {
          const reg = R[`belt${seq[panel++ % seq.length]}`];
          const key = this.key(s0, CHUNK * 2);
          for (let h = 0; h < 2; h++) {
            const sa = s + h * 2, sb = Math.min(s + h * 2 + 2, s1);
            if (sb <= sa) continue;
            const wa = this.wall(sa, side) - 0.75, wb = this.wall(sb, side) - 0.75;
            const u0 = reg[0] + (reg[2] - reg[0]) * (h * 0.5), u1 = reg[0] + (reg[2] - reg[0]) * (h * 0.5 + 0.5 * (sb - sa) / 2);
            if (side < 0) {
              this.pt(sa, -wa, 0, a); this.pt(sb, -wb, 0, b); this.pt(sb, -wb, 0.95, c); this.pt(sa, -wa, 0.95, d);
              this.low.quad(key, a, b, c, d, COL.white, [u0, reg[1], u1, reg[3]]);
            } else {
              this.pt(sb, wb, 0, a); this.pt(sa, wa, 0, b); this.pt(sa, wa, 0.95, c); this.pt(sb, wb, 0.95, d);
              this.low.quad(key, a, b, c, d, COL.white, [reg[0] + reg[2] - u1, reg[1], reg[0] + reg[2] - u0, reg[3]]);
            }
            // top lip
            this.pt(sa, side * wa, 0.95, a); this.pt(sb, side * wb, 0.95, b);
            this.pt(sb, side * (wb + 0.14), 0.97, c); this.pt(sa, side * (wa + 0.14), 0.97, d);
            if (side < 0) this.low.quad(key, a, b, c, d, COL.ink, sw.rubber); else this.low.quad(key, b, a, d, c, COL.ink, sw.rubber);
          }
        }
      }
    }
  }

  // ------------------------------------------------------------------ fence hoardings
  #hoardings() {
    const T = this.T, L = T.length;
    const R = this.A.R, sw = this.A.SW;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    const len = 3.55, gap = 0.2, y0 = 1.06, y1 = 2.18;
    for (const side of [-1, 1]) {
      const rr = TX.rng(side > 0 ? 71 : 72);
      let s = 4 + rr() * 10;
      while (s < L - 8) {
        const runLen = 30 + rr() * 80, pause = 6 + rr() * 26;
        const A = (rr() * 8) | 0, B = rr() < 0.2 ? A : (A + 1 + ((rr() * 7) | 0)) % 8;
        let n = 0;
        for (let p = s; p < s + runLen && p < L - len - 2; p += len + gap) {
          let ok = true;
          for (const q of [p, p + len / 2, p + len]) {
            const i = this.idx(q);
            const w = side > 0 ? T.wallR[i] : T.wallL[i];
            if (this.isAir(i, side) || w < 18) { ok = false; break; }
            const x = this.pt(q, side * (w + 0.72));
            if (this.space.trackD(x.x, x.z) < w + 0.4) { ok = false; break; }
          }
          if (!ok) continue;
          const reg = R[`h${n++ % 2 ? B : A}`];
          const wa = this.wall(p, side) + 0.72, wb = this.wall(p + len, side) + 0.72;
          if (side < 0) {
            this.pt(p, -wa, y0, a); this.pt(p + len, -wb, y0, b); this.pt(p + len, -wb, y1, c); this.pt(p, -wa, y1, d);
          } else {
            this.pt(p + len, wb, y0, a); this.pt(p, wa, y0, b); this.pt(p, wa, y1, c); this.pt(p + len, wb, y1, d);
          }
          this.flat.quad(0, a, b, c, d, COL.white, reg);
          // dark back face
          const out = this.#out(p + len / 2, side).multiplyScalar(0.04);
          this.flat.quad(0, b.add(out), a.add(out), d.add(out), c.add(out), COL.darkSteel, sw.matte);
        }
        s += runLen + pause;
      }
    }
  }
  #out(s, side) { const f = this.T.frame(s, this._fr); return new THREE.Vector3(f.rx * side, 0, f.rz * side); }

  // ------------------------------------------------------------------ advertising bridge over the main straight
  #bridge(s) {
    const T = this.T, f = T.frame(s, this._fr);
    const yaw = Math.atan2(-f.tx, -f.tz); // local +z faces oncoming riders, +x = track right
    const key = this.key(s);
    const F = this.frameAt(this.kit, key, f.x, f.y, f.z, yaw);
    const span = LANES.wall + 2.6;
    const w = span * 2;
    const R = this.A.R;
    for (const sx of [-1, 1]) {
      F.box(sx * span, 4.4, 0, 1.8, 10.8, 2.3, COL.ink, 'paint');
      F.box(sx * (span + 2.4), 4.4, 0, 3.0, 10.8, 3.2, COL.darkSteel, 'steel');
      F.box(sx * span, 2.2, 1.17, 1.2, 0.3, 0.02, COL.redHot, 'paint');
      const p = this.pt(s, sx * (span + 1.2));
      this.space.add(p.x, p.z, 3.6, K_MINE);
      this.space.reserve(p.x, p.z, 3.4);
    }
    F.box(0, 8.4, 0, w + 1.8, 2.6, 2.6, COL.ink, 'paint');
    F.panel(0, 8.4, 1.31, w - 1.2, 2.3, R.bridge);
    F.panel(0, 8.4, -1.31, w - 1.2, 2.3, R.bridge, COL.white, Math.PI);
    F.box(0, 7.12, 1.31, w, 0.14, 0.03, COL.redHot, 'paint');
    F.box(0, 7.12, -1.31, w, 0.14, 0.03, COL.redHot, 'paint');
    for (const z of [-1.2, 1.2]) {
      F.box(0, 10.8, z, w + 1.6, 0.06, 0.06, COL.steel, 'metal');
      F.box(0, 10.25, z, w + 1.6, 0.04, 0.04, COL.steel, 'metal');
      for (let x = -w / 2; x <= w / 2 + 0.1; x += 3) F.post(x, 9.7, 10.8, z, 0.035, COL.steel, 'metal', 4);
    }
    // spectators leaning on the rails
    const rr = TX.rng(7);
    const pal = [COL.red, COL.cream, COL.ink, COL.blue, COL.white, COL.burgundy];
    for (let k = 0; k < (TIER <= 1 ? 9 : 4); k++) {
      const x = -w / 2 + 3 + rr() * (w - 6), z = rr() < 0.6 ? 0.85 : -0.85;
      person(F.sub(x, 9.7, z, z > 0 ? 0 : Math.PI), pal[k % pal.length], { legs: COL.denim, arm: rr() < 0.3 ? 1 : 0 });
    }
  }

  // ------------------------------------------------------------------ big screen facing the main grandstand
  #bigScreen(s, lat) {
    const st = this.site(s, lat, 4);
    if (!this.space.ok(st.x, st.z, 4.5, { minD: LANES.wall + 1 })) return;
    // aim at the middle of the main grandstand
    const g = this.pt(10, -40);
    const yaw = Math.atan2(g.x - st.x, g.z - st.z);
    const key = this.key(s);
    const F = this.frameAt(this.kit, key, st.x, st.y, st.z, yaw);
    const G = this.frameAt(this.glow, 0, st.x, st.y, st.z, yaw);
    for (const x of [-4.2, 4.2]) {
      F.box(x, 4.2, -0.6, 0.7, 10.4, 0.7, COL.darkSteel, 'steel');
      F.box(x, 0.2, -0.6, 1.6, 0.6, 1.6, COL.concrete, 'concrete');
      for (let y = 1; y < 8.5; y += 1.4) F.beam([x - 0.3, y, -0.95], [x + 0.3, y + 1.2, -0.95], 0.06, COL.steel);
    }
    F.box(0, 9.6, -0.25, 13.6, 8.1, 0.8, COL.ink, 'plastic');
    F.box(0, 13.9, -0.25, 13.8, 0.5, 1.0, COL.redHot, 'paint');
    F.panel(0, 5.2, 0.16, 13.4, 0.9, this.A.R.h4);
    G.panel(0, 9.7, 0.17, 12.8, 7.2, this.A.R.screen, new THREE.Color(1.25, 1.25, 1.25));
    this.space.add(st.x, st.z, 7.5, K_MINE);
    this.space.reserve(st.x, st.z, 7.5);
  }

  // ------------------------------------------------------------------ pit lane surface, pit wall stands, crew
  #pitLane() {
    const sw = this.A.SW, R = this.A.R;
    const s0 = -104, s1 = 162, lat0 = LANES.wall + 1.2, lat1 = 35.8;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    const ground = (s, lat, up, out) => {
      this.pt(s, lat, 0, out);
      out.y = Math.max(this.W.heightAt(out.x, out.z), this.T.frame(s, this._fr).y - 0.45) + up;
      return out;
    };
    const tile = R.asphalt;
    for (let s = s0; s < s1; s += 8) {
      const sb = Math.min(s + 8, s1);
      const lA = (q) => q < -70 ? lat1 - Math.min(1, (-70 - q) / 34) * (lat1 - lat0 - 3.5) : q > 130 ? lat1 - Math.min(1, (q - 130) / 32) * (lat1 - lat0 - 3.5) : lat1;
      for (let l = lat0; l < lat1 - 0.01; l += 4.8) {
        const la = l, lb = Math.min(l + 4.8, lat1);
        const ea = Math.min(lb, lA(s)), eb = Math.min(lb, lA(sb));
        if (ea <= la + 0.05 && eb <= la + 0.05) continue;
        ground(sb, la, 0.03, a); ground(s, la, 0.03, b); ground(s, Math.max(ea, la + 0.05), 0.03, c); ground(sb, Math.max(eb, la + 0.05), 0.03, d);
        this.flat.quad(0, a, b, c, d, COL.asphalt, [tile[0], tile[1], tile[0] + (tile[2] - tile[0]) * (lb - la) / 4.8, tile[3]]);
      }
      // painted lines: pit wall edge and fast-lane line
      for (const [l, wdt] of s > -80 && s < 136 ? [[lat0 + 0.15, 0.14], [lat0 + 4.2, 0.12]] : [[lat0 + 0.15, 0.14]]) {
        ground(sb, l, 0.045, a); ground(s, l, 0.045, b); ground(s, l + wdt, 0.045, c); ground(sb, l + wdt, 0.045, d);
        this.flat.quad(0, a, b, c, d, COL.cream, sw.paint);
      }
    }
    // Pit wall: low concrete wall behind the barrier, team stands with monitors, crews in front of garages.
    const teams = [COL.red, COL.ink, COL.cream, COL.burgundy, COL.gold, COL.rye, COL.blue, COL.darkSteel];
    const rr = TX.rng(88);
    for (let s = -66, k = 0; s <= 124; s += 11, k++) {
      const st = this.site(s, lat0 + 0.95, 0);
      st.y = Math.max(st.y, this.T.frame(s, this._fr).y - 0.45);
      const F = this.frameAt(this.kit, this.key(s), st.x, st.y, st.z, st.yaw + Math.PI); // +z faces the pit lane
      const tc = teams[k % teams.length];
      F.box(0, 0.12, 0, 3.4, 0.24, 1.7, COL.concrete, 'concrete');
      for (const x of [-1.55, 1.55]) for (const z of [-0.7, 0.7]) F.post(x, 0.24, 2.6, z, 0.04, COL.darkSteel, 'steel', 4);
      F.box(0, 2.66, 0.1, 3.6, 0.12, 2.1, tc, 'paint');
      F.box(0, 1.25, -0.8, 3.4, 1.2, 0.05, tc, 'paint');
      F.box(0, 0.95, 0.35, 3.0, 0.06, 0.6, COL.darkSteel, 'metal');
      for (let m = -1; m <= 1; m++) {
        F.box(m * 0.95, 1.3, 0.25, 0.62, 0.4, 0.05, COL.black, 'plastic');
        const G = new Frame(this.glow, 0, F.base);
        G.panel(m * 0.95, 1.3, 0.28, 0.56, 0.34, this.A.SW.matte, new THREE.Color(0.35, 0.5, 0.7));
        F.post(m * 0.95, 0.24, 0.8, 0.9, 0.12, COL.darkSteel, 'metal', 5);
      }
      if (rr() < 0.7) person(F.sub(-0.9 + rr() * 1.8, 0.24, 1.1, Math.PI * (0.8 + rr() * 0.4)), tc, { legs: COL.ink });
      // crew in front of the garage
      if (TIER <= 2) {
        for (let n = 0; n < 2; n++) {
          if (rr() < 0.35) continue;
          const q = this.site(s + (rr() - 0.5) * 8, lat1 - 0.8 - rr() * 1.5, 0);
          q.y = Math.max(q.y, this.T.frame(s, this._fr).y - 0.45) + 0.03;
          person(this.frameAt(this.kit, this.key(s), q.x, q.y, q.z, q.yaw + (rr() - 0.5) * 2.5), tc, { legs: COL.ink, cap: rr() < 0.5 ? tc : null });
        }
      }
    }
    // PIT boards at the lane ends
    for (const s of [s0 + 18, s1 - 16]) {
      const st = this.site(s, lat0 + 0.4, 0);
      const F = this.frameAt(this.kit, this.key(s), st.x, st.y, st.z, st.yaw + Math.PI * 0.5 * (s < 0 ? -1 : 1));
      F.post(0, 0, 2.4, 0, 0.05, COL.steel);
      F.box(0, 2.2, 0, 1.1, 0.55, 0.06, COL.ink, 'paint');
      F.panel(0, 2.2, 0.035, 1.0, 0.5, R.pit);
    }
  }

  // ------------------------------------------------------------------ marshal posts
  #marshalPosts() {
    const T = this.T;
    const spots = [430, 735, 1015, 1290, 1575, 1845, 2120, 2395, 2665, 2960, 3170];
    const use = TIER >= 3 ? spots.filter((_, k) => k % 2 === 0) : spots;
    let num = 1;
    for (const s0 of use) {
      const pref = -T.turnSide[this.idx(s0 + 60)];
      let placed = false;
      for (const side of [pref, -pref]) {
        for (const ds of [0, 12, -12, 24, -24, 36]) {
          const s = s0 + ds, r = 2.4;
          const lat = side * (this.wall(s, side) + CLEAR + r + 0.3);
          const st = this.site(s, lat, r);
          if (!this.space.ok(st.x, st.z, r)) continue;
          this.#marshalPost(st, num++);
          this.placed.push(`M${Math.round(s)}${side > 0 ? 'R' : 'L'}`);
          this.space.add(st.x, st.z, r + 0.5, K_MINE);
          this.space.reserve(st.x, st.z, 3);
          placed = true;
          break;
        }
        if (placed) break;
      }
    }
  }

  #marshalPost(st, num) {
    const key = this.key(st.s);
    const F = new Frame(this.kit, key, st.m);
    const G = new Frame(this.glow, 0, st.m);
    const R = this.A.R;
    const dark = COL.darkSteel, orange = COL.orange;
    F.box(0, -0.4, 0, 3.4, 1.0, 2.6, COL.concrete, 'concrete');
    for (const [x, z] of [[-1.35, -0.95], [1.35, -0.95], [-1.35, 0.95], [1.35, 0.95]]) F.box(x, 0.72, z, 0.12, 1.25, 0.12, dark, 'steel');
    F.box(0, 1.38, 0, 3.1, 0.1, 2.3, dark, 'steel');
    // railings
    for (const y of [1.9, 2.4]) {
      F.box(0, y, 1.12, 3.1, 0.06, 0.06, orange, 'paint');
      for (const x of [-1.52, 1.52]) F.box(x, y, 0.1, 0.06, 0.06, 2.1, orange, 'paint');
    }
    for (const x of [-1.52, 0, 1.52]) F.box(x, 1.9, 1.12, 0.06, 1.0, 0.06, orange, 'paint');
    F.panel(0, 1.64, 1.16, 1.4, 0.36, R.marshal);
    // hut
    F.box(0, 2.5, -0.55, 2.3, 2.2, 1.1, COL.cream, 'paint');
    F.box(0, 2.85, 0.015, 1.7, 0.7, 0.03, COL.glass, 'glass');
    F.box(0, 3.67, -0.3, 2.7, 0.14, 1.9, COL.red, 'paint');
    F.panel(0, 3.3, 0.02, 0.9, 0.22, R.post);
    // steps
    for (let k = 0; k < 4; k++) F.box(1.95, 0.18 + k * 0.32, -0.6 + k * 0.3, 0.8, 0.08, 0.34, dark, 'steel');
    // light panel on a pole
    F.box(-1.5, 3.05, 1.1, 0.07, 1.4, 0.07, dark, 'steel');
    F.box(-1.5, 3.95, 1.08, 0.72, 0.72, 0.1, COL.black, 'plastic');
    G.panel(-1.5, 3.95, 1.135, 0.56, 0.56, this.A.SW.matte, new THREE.Color(0.25, 1.2, 0.45));
    // flag holder with furled flags
    F.box(1.12, 2.05, 1.18, 0.4, 0.5, 0.18, dark, 'steel');
    const flagCols = [COL.yellow, COL.blue, COL.white, COL.red, COL.green];
    flagCols.forEach((c, k) => {
      const x = 0.97 + k * 0.075;
      F.post(x, 1.9, 3.0, 1.18, 0.012, COL.steel, 'metal', 4);
      F.part(GEO.cyl(5, false), x, 2.72, 1.18, 0.035, 0.5, 0.035, c, this.A.SW.fabric);
    });
    // extinguishers
    for (const x of [-1.35, -1.1]) {
      F.part(GEO.cyl(8, false), x, 0.38, 1.42, 0.09, 0.52, 0.09, COL.redHot, this.A.SW.paint);
      F.box(x, 0.68, 1.42, 0.05, 0.08, 0.05, COL.black, 'plastic');
    }
    // marshals
    const rr = TX.rng(num * 31);
    person(F.sub(0.35, 1.43, 0.55, (rr() - 0.5) * 0.6), orange, { cap: COL.white, arm: rr() < 0.4 ? 1 : 0 });
    if (rr() < 0.8) person(F.sub(-0.75, 1.43, 0.2 + rr() * 0.3, 0.9 + rr() * 0.8), orange, { cap: orange });
  }

  // ------------------------------------------------------------------ TV camera towers
  #tvTowers() {
    const T = this.T;
    const spots = [[556, 'out'], [880, 'out'], [1150, 'out'], [1450, 'in'], [1690, 'out'], [2065, 'out'], [2335, 'out'], [2835, 'in']];
    const n = pick(8, 8, 5, 3);
    for (const [s0, where] of spots.slice(0, n)) {
      const out = -T.turnSide[this.idx(s0)];
      const pref = where === 'out' ? out : -out;
      let done = false;
      for (const side of [pref, -pref]) {
        for (const ds of [0, 10, -10, 20, -20, 32]) {
          const s = s0 + ds, r = 2.2;
          const lat = side * (this.wall(s, side) + CLEAR + r + 0.6);
          const st = this.site(s, lat, r, 0.55);
          if (!this.space.ok(st.x, st.z, r + 0.3)) continue;
          this.#tvTower(st, s0 * 7);
          this.placed.push(`TV${Math.round(s)}${side > 0 ? 'R' : 'L'}`);
          this.space.add(st.x, st.z, r + 0.8, K_MINE);
          this.space.reserve(st.x, st.z, 3.2);
          done = true;
          break;
        }
        if (done) break;
      }
    }
  }

  #tvTower(st, seed) {
    const key = this.key(st.s);
    const F = new Frame(this.kit, key, st.m);
    const G = new Frame(this.glow, 0, st.m);
    const rr = TX.rng(seed);
    const h = 6.2 + rr() * 2.2, hw = 1.2, pole = COL.steel;
    for (const x of [-hw, hw]) for (const z of [-hw, hw]) {
      F.box(x, 0.05, z, 0.5, 0.4, 0.5, COL.concrete, 'concrete');
      F.box(x, (h + 1.1) / 2 + 0.1, z, 0.07, h + 1.1, 0.07, pole, 'steel');
    }
    for (let y = 0.4; y < h; y += 2) {
      for (const z of [-hw, hw]) F.box(0, y, z, 2 * hw, 0.05, 0.05, pole, 'steel');
      for (const x of [-hw, hw]) F.box(x, y, 0, 0.05, 0.05, 2 * hw, pole, 'steel');
      const y2 = Math.min(y + 2, h);
      for (const x of [-hw, hw]) F.beam([x, y, -hw], [x, y2, hw], 0.045, pole);
      F.beam([-hw, y, -hw], [hw, y2, -hw], 0.045, pole);
    }
    F.box(0, h, 0, 2 * hw + 0.5, 0.1, 2 * hw + 0.5, COL.wood, 'matte');
    for (const y of [h + 0.55, h + 1.05]) {
      for (const z of [-hw - 0.2, hw + 0.2]) F.box(0, y, z, 2 * hw + 0.45, 0.05, 0.05, pole, 'steel');
      for (const x of [-hw - 0.2, hw + 0.2]) F.box(x, y, 0, 0.05, 0.05, 2 * hw + 0.45, pole, 'steel');
    }
    F.panel(0, h + 0.33, hw + 0.26, 2 * hw + 0.4, 0.5, this.A.R.tv);
    F.panel(0, h + 0.33, -hw - 0.26, 2 * hw + 0.4, 0.5, this.A.R.tv, COL.white, Math.PI);
    // ladder at the back
    for (const x of [-0.25, 0.25]) F.box(x, h / 2, -hw - 0.12, 0.05, h, 0.05, pole, 'steel');
    for (let y = 0.4; y < h; y += 0.45) F.box(0, y, -hw - 0.12, 0.5, 0.035, 0.035, pole, 'steel');
    // camera on a tripod and the operator
    const cx = 0.15, cz = 0.35;
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094;
      F.beam([cx + Math.cos(a) * 0.4, h + 0.05, cz + Math.sin(a) * 0.4], [cx, h + 1.2, cz], 0.035, COL.black, 'metal');
    }
    F.box(cx, h + 1.4, cz, 0.28, 0.32, 0.55, COL.ink, 'plastic');
    F.part(GEO.cyl(8, false), cx, h + 1.42, cz + 0.55, 0.1, 0.55, 0.1, COL.black, this.A.SW.plastic, Math.PI / 2);
    F.part(GEO.cyl(8, false), cx, h + 1.42, cz + 0.86, 0.14, 0.12, 0.14, COL.black, this.A.SW.plastic, Math.PI / 2);
    F.box(cx - 0.2, h + 1.55, cz - 0.1, 0.14, 0.12, 0.2, COL.black, 'plastic');
    G.box(cx + 0.15, h + 1.6, cz + 0.2, 0.04, 0.04, 0.04, new THREE.Color(2.5, 0.2, 0.15));
    person(F.sub(cx - 0.05, h + 0.05, cz - 0.62, 0), COL.ink, { legs: COL.denim, cap: COL.red });
    // canopy
    for (const x of [-hw, hw]) for (const z of [-hw, hw]) F.box(x, h + 1.8, z, 0.05, 1.5, 0.05, pole, 'steel');
    F.part(GEO.pyr, 0, h + 2.85, 0, 2.0, 0.55, 2.0, COL.cream, this.A.SW.fabric);
    F.box(0, h + 2.56, 0, 2.8, 0.05, 2.8, COL.red, 'fabric');
  }

  // ------------------------------------------------------------------ spectator banks
  #spectatorBanks() {
    const all = [
      { s0: 2690, s1: 2968, side: 1 },   // Home Sweep infield (title backdrop)
      { s0: 300, s1: 505, side: -1 },    // braking zone for the Lawrenceburg Hairpin
      { s0: 1620, s1: 1770, side: -1 },  // Tyrone Hairpin
      { s0: 820, s1: 1010, side: 1 },    // Ridge Esses, behind the air fence
      { s0: 1955, s1: 2130, side: -1 },  // Distillery Chicane
      { s0: 2190, s1: 2420, side: 1 },   // Bluegrass Bend
    ];
    const banks = all.slice(0, pick(6, 5, 3, 2));
    const dens = pick(0.31, 0.27, 0.2, 0.13);
    const lite = TIER >= 2;
    const geoBase = crowdGeometry(this.A, lite);
    const mat = crowdMaterial(this.U);
    this.crowdMat = mat;
    const berm = { p: [], c: [], u: [], i: [] };
    // cross-section of the grass bank behind the fence: (metres beyond the barrier line + 1.6, height)
    const prof = [[-0.4, -0.3], [0, 0.02], [1.2, 0.2], [3.5, 0.95], [6.5, 2.15], [9.5, 3.3], [11.5, 3.65], [13, 3.25], [14.8, 1.25], [16, -0.4]];
    const H = (l) => {
      for (let k = 1; k < prof.length; k++) if (l <= prof[k][0]) {
        const [l0, h0] = prof[k - 1], [l1, h1] = prof[k];
        const t = (l - l0) / (l1 - l0); return h0 + (h1 - h0) * (t * t * (3 - 2 * t));
      }
      return prof[prof.length - 1][1];
    };
    const grass = [new THREE.Color(0.95, 1.0, 0.9), new THREE.Color(1.12, 1.12, 0.95), null, new THREE.Color(1.45, 1.25, 0.85)];
    const pal = [COL.red, COL.red, COL.redHot, COL.burgundy, COL.cream, COL.white, COL.white, COL.ink, COL.orange, COL.blue,
      COL.yellow, C('#3d6b45'), COL.grey, C('#2e4a7a'), C('#d9d4c8'), C('#7a3b1e'), COL.gold];
    const rr = TX.rng(4242);
    const sp = this.space;
    const tmpC = new THREE.Color();
    const q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), sc = new THREE.Vector3();

    for (const bank of banks) {
      const { s0, s1, side } = bank;
      // stations every 2 m; a station is usable if the band behind the fence is clear
      const st = [];
      for (let s = s0; s <= s1; s += 2) {
        const w = this.wall(s, side);
        let ok = true;
        for (const l of [0.5, 4, 8, 11.8]) {
          const p = this.pt(s, side * (w + 1.6 + l));
          if (sp.trackD(p.x, p.z) < w + 1.2 + l * 0.8) { ok = false; break; }
          if (sp.boxHit(p.x, p.z, 1.5) || sp.hit(p.x, p.z, 1.2, (1 << K_MINE) | (1 << K_WORLD) | (1 << K_SOLID))) { ok = false; break; }
          if (this.W.heightAt(p.x, p.z) < RIVER_LOW) { ok = false; break; }
        }
        st.push({ s, ok, w });
      }
      // berm segments
      const people = [];
      let seg = [];
      const flush = () => {
        if (seg.length >= 4) this.#bermSegment(berm, seg, side, prof, H, grass, s0, s1);
        seg = [];
      };
      for (const o of st) { if (o.ok) seg.push(o); else flush(); }
      flush();
      // people on usable stations
      const fade = (s) => Math.min(1, (s - s0) / 14, (s1 - s) / 14);
      for (const o of st) {
        if (!o.ok) continue;
        const clump = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(o.s * 0.061 + side * 3.1) * Math.sin(o.s * 0.023 + 1.3));
        for (let l = 1.2; l < 11.9; l += 1.2) {
          for (let n = 0; n < 2; n++) {
            if (rr() > dens * clump * (l < 4 ? 1.5 : 1.05)) continue;
            const s = o.s + n + rr() * 0.8, ll = l + (rr() - 0.5) * 0.6;
            const f = fade(s);
            if (f <= 0.15) continue;
            const lat = side * (o.w + 1.6 + ll);
            const p = this.pt(s, lat);
            if (sp.hit(p.x, p.z, 0.3, M_PEOPLE)) continue;
            const y = this.W.heightAt(p.x, p.z) + H(ll) * Math.max(0, f) - 0.03;
            const fr = this.T.frame(s, this._fr);
            const face = Math.atan2(-side * fr.rx, -side * fr.rz) + (rr() - 0.5) * 0.9 + (rr() < 0.08 ? Math.PI : 0);
            people.push({ x: p.x, y, z: p.z, yaw: face, s: 0.92 + rr() * 0.14, hs: 0.94 + rr() * 0.12 });
          }
        }
      }
      if (!people.length) continue;
      // instanced crowd for this bank
      const geo = geoBase.clone();
      const skin = new Float32Array(people.length);
      const im = new THREE.InstancedMesh(geo, mat, people.length);
      people.forEach((pp, k) => {
        e.set(0, pp.yaw, 0); q.setFromEuler(e);
        im.setMatrixAt(k, _m.compose(pos.set(pp.x, pp.y, pp.z), q, sc.set(pp.s, pp.s * pp.hs, pp.s)));
        tmpC.copy(pal[(rr() * pal.length) | 0]).offsetHSL(0, (rr() - 0.5) * 0.1, (rr() - 0.5) * 0.08);
        im.setColorAt(k, tmpC);
        skin[k] = [1.0, 0.85, 0.62, 0.42, 1.05][(rr() * 5) | 0] * (0.92 + rr() * 0.16);
      });
      geo.setAttribute('aSkin', new THREE.InstancedBufferAttribute(skin, 1));
      im.instanceMatrix.needsUpdate = true;
      im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
      im.castShadow = TIER <= 1;
      im.userData.noLongShadow = true; // sub-texel in the baked circuit shadow map: would only add speckle
      im.receiveShadow = true;
      im.name = 'dressing-crowd';
      this.group.add(im);
      this.crowdCount = (this.crowdCount || 0) + people.length;
      this.crowdTris = (this.crowdTris || 0) + people.length * geoBase.userData.tris;
      // fan flags, parasols
      const kitKey = this.key(s0);
      const F = new Frame(this.kit, kitKey, new THREE.Matrix4());
      for (const pp of people) {
        const r = rr();
        if (r < pick(0.07, 0.06, 0.035, 0.02)) {
          const sub = F.sub(pp.x, pp.y, pp.z, pp.yaw);
          sub.post(0.32, 1.25, 2.75, 0.1, 0.018, COL.wood, 'matte', 4);
          const top = new THREE.Vector3(0.32, 2.72, 0.1).applyMatrix4(sub.base);
          this.flag(top.x, top.y - 0.62, top.z, 0.95, 0.62, [0, 2, 4, 6, 7, 1][(rr() * 6) | 0], 0, (rr() - 0.5) * 0.6);
        } else if (r > 0.985 && TIER <= 2) {
          const sub = F.sub(pp.x + 0.6, pp.y, pp.z, 0);
          sub.post(0, -0.2, 2.25, 0, 0.025, COL.white, 'metal', 4);
          sub.part(GEO.cone(8), 0, 2.2, 0, 1.2, 0.42, 1.2, [COL.red, COL.cream, COL.yellow, COL.white, COL.blue][(rr() * 5) | 0], this.A.SW.fabric);
        }
      }
      // tall banners along the top of the bank
      if (TIER <= 2) {
        const Fb = new Frame(this.kit, kitKey, new THREE.Matrix4());
        let next = s0 + 10 + rr() * 8;
        for (const o of st) {
          if (!o.ok || o.s < next || fade(o.s) < 0.8) continue;
          next = o.s + pick(20, 24, 34) + rr() * 8;
          const p = this.pt(o.s, side * (o.w + 1.6 + 12.2));
          const y = this.W.heightAt(p.x, p.z) + H(12.2) - 0.2;
          const sub = Fb.sub(p.x, y, p.z, 0);
          sub.post(0, -0.4, 7.4, 0, 0.06, COL.steel, 'metal', 6);
          this.flag(p.x, y + 4.4, p.z, 1.15, 2.9, [0, 1, 3, 5][(rr() * 4) | 0], 1, (rr() - 0.5) * 0.3);
        }
      }
      // claim the bank for later props, and reserve its footprint for the broadcast cameras (per 24 m)
      for (let k = 0; k < st.length; k += 4) {
        const o = st[k];
        if (!o.ok) continue;
        for (const l of [3, 9]) { const p = this.pt(o.s, side * (o.w + 1.6 + l)); this.space.add(p.x, p.z, 4, K_MINE); }
        if (k % 12 === 0) { const p = this.pt(o.s + 12, side * (o.w + 9)); this.space.reserve(p.x, p.z, 12); }
      }
      this.banks.push({ ...bank, people: people.length, ok: st.filter(o => o.ok).length, stations: st.length });
    }
    if (berm.i.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(berm.p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(berm.c, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(berm.u, 2));
      g.setIndex(berm.i);
      g.computeVertexNormals();
      const tex = TX.grassTexture(1);
      const mat2 = new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.96, metalness: 0 });
      const mesh = new THREE.Mesh(g, mat2);
      mesh.receiveShadow = true;
      mesh.name = 'dressing-berms';
      this.group.add(mesh);
      this.bermTris = berm.i.length / 3;
    }
  }

  #bermSegment(berm, seg, side, prof, H, grass, s0, s1) {
    const base = berm.p.length / 3;
    const cols = prof.length;
    const c = new THREE.Color();
    for (const o of seg) {
      const fade = Math.max(0, Math.min(1, (o.s - s0) / 14, (s1 - o.s) / 14));
      for (let j = 0; j < cols; j++) {
        const l = prof[j][0];
        const p = this.pt(o.s, side * (o.w + 1.6 + l));
        const g = this.W.heightAt(p.x, p.z);
        const h = prof[j][1] > 0 ? prof[j][1] * fade : prof[j][1];
        berm.p.push(p.x, g + h, p.z);
        const n = 0.5 + 0.5 * Math.sin(o.s * 0.13 + j * 1.7) * Math.cos(o.s * 0.041 - j);
        c.copy(grass[0]).lerp(grass[1], n);
        if (l > 0.8 && l < 11) c.lerp(grass[3], 0.45 + 0.2 * n); // trampled
        berm.c.push(c.r, c.g, c.b);
        berm.u.push(l / 14, o.s / 18);
      }
    }
    for (let k = 0; k < seg.length - 1; k++) for (let j = 0; j < cols - 1; j++) {
      const a = base + k * cols + j, b = a + 1, d = a + cols, e = d + 1;
      if (side > 0) berm.i.push(a, b, d, b, e, d); else berm.i.push(a, d, b, b, d, e);
    }
  }

  // ------------------------------------------------------------------ flags on poles behind the fence
  #flagClusters() {
    const T = this.T, L = T.length;
    const rr = TX.rng(606);
    const step = pick(88, 96, 150, 260);
    const cells = [0, 1, 3, 5];
    let side = 1, k = 0;
    for (let s = 30; s < L - 20; s += step + rr() * 40) {
      side = -side;
      const n = TIER >= 3 ? 2 : 3 + ((rr() * 2) | 0);
      const cell = cells[k++ % cells.length], cell2 = cells[(k + 1) % cells.length];
      for (let j = 0; j < n; j++) {
        const sp = s + j * 4.4;
        const w = this.wall(sp, side);
        if (this.isAir(this.idx(sp), side) && TIER >= 2) continue;
        const lat = side * (w + CLEAR + 0.6);
        const st = this.site(sp, lat, 0.3);
        if (!this.space.ok(st.x, st.z, 0.35, { minD: w + CLEAR })) continue;
        const F = new Frame(this.kit, this.key(sp), st.m);
        F.post(0, -0.3, 6.5, 0, 0.055, COL.steel, 'metal', 6);
        F.part(GEO.oct, 0, 6.55, 0, 0.09, 0.09, 0.09, COL.gold, this.A.SW.metal);
        this.flag(st.x, st.y + 3.7, st.z, 1.0, 2.6, j % 2 ? cell2 : cell, 1, (rr() - 0.5) * 0.4);
        this.space.add(st.x, st.z, 0.5, K_MINE);
      }
    }
  }

  // Masts along the main grandstand roof and the pit building roof (sizes mirror world.js).
  #roofFlags() {
    if (TIER >= 3) return;
    const rr = TX.rng(909);
    const cells = [1, 0, 3, 2];
    // main grandstand: makeStand(210, 16) placed at s=10, lat=-33
    {
      const st = this.site(10, -33, 0);
      const y = this.W.heightAt(st.x, st.z) + 16 * 0.62 + 7.5 + 0.55;
      const F = this.frameAt(this.kit, this.key(10), st.x, 0, st.z, st.yaw);
      for (let x = -97.5, k = 0; x <= 97.6; x += 15, k++) {
        F.post(x, y - 0.3, y + 4.2, 0.4, 0.05, COL.steel, 'metal', 5);
        const p = new THREE.Vector3(x, y + 2.6, 0.4).applyMatrix4(F.base);
        this.flag(p.x, p.y, p.z, 2.1, 1.35, cells[k % 4], 0, (rr() - 0.5) * 0.3);
      }
    }
    // pit building: 200 x 8 x 16 box placed at s=30, lat=44
    {
      const st = this.site(30, 44, 0);
      const y = this.W.heightAt(st.x, st.z) + 8;
      const F = this.frameAt(this.kit, this.key(30), st.x, 0, st.z, st.yaw);
      for (let x = -94, k = 0; x <= 94; x += 12.5, k++) {
        if (Math.abs(x) < 34) continue;
        F.post(x, y - 0.1, y + 5, 7.3, 0.05, COL.steel, 'metal', 5);
        const p = new THREE.Vector3(x, y + 3.4, 7.3).applyMatrix4(F.base);
        this.flag(p.x, p.y, p.z, 2.3, 1.5, cells[(k + 1) % 4], 0, (rr() - 0.5) * 0.3);
      }
    }
  }

  // ------------------------------------------------------------------ paddock: trucks, motorhomes, marquees
  #paddock() {
    const T = this.T, sp = this.space;
    const f = T.frame(30, this._fr);
    const tx = f.tx, tz = f.tz, rx = f.rx, rz = f.rz, fx = f.x, fz = f.z;
    const at = (along, lat) => ({ x: fx + tx * along + rx * lat, z: fz + tz * along + rz * lat });
    const yawAlong = Math.atan2(tx, tz);
    const rr = TX.rng(515);
    const nTrucks = pick(9, 8, 5, 3), nHomes = pick(7, 6, 3, 0), nTents = pick(8, 6, 3, 0);
    let placed = 0;
    // a long vehicle is clear if three circles along its axis are
    const clearLine = (along, lat, half, r) => [-half, 0, half].every(d => { const q = at(along + d, lat); return sp.ok(q.x, q.z, r, { minD: 40 }); });
    // trucks parallel to the pit building, just behind it
    for (let k = 0; k < 12 && placed < nTrucks; k++) {
      const along = -92 + k * 17.5;
      const p = at(along, 74);
      if (!clearLine(along, 74, 5.5, 2.2)) continue;
      const y = this.#groundMin(p.x, p.z, 7);
      const F = this.frameAt(this.kit, 'pad', p.x, y, p.z, yawAlong - Math.PI / 2);
      this.#truck(F, rr, k);
      for (const d of [-5.5, 0, 5.5]) { const q = at(along + d, 74); sp.add(q.x, q.z, 3, K_MINE); }
      placed++;
    }
    placed = 0;
    for (let k = 0; k < 12 && placed < nHomes; k++) {
      const along = -88 + k * 15.5;
      const p = at(along, 96);
      if (!clearLine(along, 96, 5, 2)) continue;
      const y = this.#groundMin(p.x, p.z, 7);
      const F = this.frameAt(this.kit, 'pad', p.x, y, p.z, yawAlong - Math.PI / 2);
      this.#motorhome(F, rr, k);
      for (const d of [-5, 0, 5]) { const q = at(along + d, 96); sp.add(q.x, q.z, 2.8, K_MINE); }
      placed++;
    }
    placed = 0;
    for (let k = 0; k < 16 && placed < nTents; k++) {
      const along = -100 + k * 13 + (rr() - 0.5) * 3;
      const p = at(along, 116 + (rr() - 0.5) * 6);
      if (!sp.ok(p.x, p.z, 3.2, { minD: 40 })) continue;
      const y = this.#groundMin(p.x, p.z, 3);
      const F = this.frameAt(this.kit, 'pad', p.x, y, p.z, yawAlong);
      this.#pagoda(F, rr, 4 + (k % 3 === 0 ? 2 : 0));
      sp.add(p.x, p.z, 4, K_MINE);
      placed++;
    }
    // paddock surface: asphalt apron under the trucks
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    const tile = this.A.R.asphalt, hard = C('#8c8474'); // dusty hard standing
    for (let al = -100; al < 104; al += 8) for (let lt = 64; lt < 106; lt += 8) {
      const P = (u, v, out) => { const q = at(u, v); return out.set(q.x, this.W.heightAt(q.x, q.z) + 0.04, q.z); };
      const test = at(al + 4, lt + 4);
      if (sp.hit(test.x, test.z, 2, (1 << K_TRUNK) | (1 << K_SOLID))) continue;
      P(al + 8, lt, a); P(al, lt, b); P(al, lt + 8, c); P(al + 8, lt + 8, d);
      this.flat.quad(0, a, b, c, d, hard, tile);
    }
    // parked service vehicles behind a few marshal posts
    this.#serviceVehicles();
  }
  #groundMin(x, z, r) {
    let y = this.W.heightAt(x, z);
    for (let k = 0; k < 6; k++) y = Math.min(y, this.W.heightAt(x + Math.cos(k * 1.047) * r, z + Math.sin(k * 1.047) * r));
    return y - 0.05;
  }

  // +x along the vehicle (cab at +x), +z = one flank.
  #truck(F, rr, k) {
    const R = this.A.R, sw = this.A.SW;
    const body = [COL.red, COL.ink, COL.red, COL.burgundy][k % 4];
    F.box(-1, 2.38, 0, 13.6, 3.3, 2.55, COL.white, 'paint');
    F.panel(-1, 2.38, 1.281, 13.5, 3.25, R.truck);
    F.panel(-1, 2.38, -1.281, 13.5, 3.25, R.truck, COL.white, Math.PI);
    F.box(-1, 0.62, 0, 13.4, 0.36, 2.3, COL.ink, 'matte');
    F.box(6.9, 1.95, 0, 2.3, 2.6, 2.5, body, 'paint');
    F.box(7.0, 3.55, 0, 2.0, 0.65, 2.4, body, 'paint');
    F.box(8.06, 2.55, 0, 0.02, 1.0, 2.2, COL.glass, 'glass');
    F.box(8.1, 0.8, 0, 0.15, 0.45, 2.45, COL.darkSteel, 'metal');
    for (const x of [-6.2, -5.1, -4.0, 6.0, 7.4]) for (const z of [-1.08, 1.08]) {
      F.part(GEO.cyl(10, false), x, 0.5, z, 0.5, 0.32, 0.5, COL.tyre, sw.rubber, Math.PI / 2);
    }
    // awning on the +z flank with a couple of crew
    if (k % 2 === 0) {
      F.box(-1, 3.5, 3.2, 12, 0.06, 4.1, COL.cream, 'fabric', 0, -0.06);
      for (const x of [-6.8, -1, 4.8]) F.post(x, 0, 3.3, 5.1, 0.04, COL.steel);
      person(F.sub(-3 + rr() * 4, 0, 3.2, rr() * 6), body, { legs: COL.ink });
      F.box(-1, 0.75, 3.4, 1.8, 0.06, 0.8, COL.white, 'plastic');
    }
  }

  #motorhome(F, rr, k) {
    const R = this.A.R, sw = this.A.SW;
    F.box(0, 2.0, 0, 13, 3.3, 2.55, COL.cream, 'paint');
    F.panel(0, 2.0, 1.281, 12.9, 1.65 * 2, R.coach);
    F.panel(0, 2.0, -1.281, 12.9, 1.65 * 2, R.coach, COL.white, Math.PI);
    F.box(6.51, 2.4, 0, 0.02, 1.3, 2.3, COL.glass, 'glass');
    for (const x of [-4.4, -3.1, 4.6]) for (const z of [-1.08, 1.08]) {
      F.part(GEO.cyl(10, false), x, 0.5, z, 0.5, 0.3, 0.5, COL.tyre, sw.rubber, Math.PI / 2);
    }
    if (k % 3 === 1) {
      F.box(0, 3.1, 2.4, 7, 0.05, 2.2, [COL.red, COL.cream, COL.ink][k % 3], 'fabric', 0, -0.08);
      for (const x of [-3.4, 3.4]) F.post(x, 0, 2.95, 3.45, 0.035, COL.steel);
    }
  }

  #pagoda(F, rr, size, roof = COL.white) {
    const R = this.A.R, h = 2.5, hw = size / 2;
    for (const x of [-hw, hw]) for (const z of [-hw, hw]) F.post(x, 0, h, z, 0.05, COL.white, 'metal', 5);
    F.part(GEO.pyr, 0, h + 0.75, 0, hw * 1.43, 1.5, hw * 1.43, roof, this.A.SW.fabric);
    for (let k = 0; k < 4; k++) F.panel(Math.sin(k * Math.PI / 2) * (hw + 0.01), h - 0.15, Math.cos(k * Math.PI / 2) * (hw + 0.01), size, 0.3, R.valance, COL.white, k * Math.PI / 2);
    F.box(0, 0.75, 0, size * 0.55, 0.05, 0.8, COL.white, 'plastic');
    const pal = [COL.red, COL.cream, COL.ink, COL.blue, COL.white];
    for (let k = 0; k < 2; k++) if (rr() < 0.7) person(F.sub((rr() - 0.5) * size * 0.8, 0, (rr() - 0.5) * size * 0.8, rr() * 6), pal[(rr() * 5) | 0], { legs: COL.denim });
  }

  // Hospitality marquees and fan campsites (dome tents, gazebos, fans, flags) behind the fence.
  #fanZones() {
    const zones = [
      { s0: 318, s1: 520, side: 1, kind: 'marquee' },    // inside of the main straight braking zone
      { s0: 1300, s1: 1540, side: 1, kind: 'camp' },     // Rickhouse Row infield
      { s0: 2440, s1: 2680, side: -1, kind: 'camp' },    // outside of the Home Sweep
      { s0: 1080, s1: 1240, side: -1, kind: 'camp' },    // Palisades
    ].slice(0, pick(4, 3, 2, 1));
    const tentCols = [COL.red, COL.blue, COL.orange, COL.green, COL.yellow, C('#7d8b92'), COL.cream, C('#5a3f8c')];
    const shirt = [COL.red, COL.redHot, COL.cream, COL.white, COL.ink, COL.blue, COL.orange, COL.yellow, COL.burgundy, C('#3d6b45')];
    const sp = this.space;
    for (const z of zones) {
      const rr = TX.rng(Math.round(z.s0 * 3 + z.side + 7));
      const camp = z.kind === 'camp';
      const key = this.key(z.s0);
      const rows = camp ? [3.2, 8.2, 13.5, 19] : [5.2, 12.5];
      let n = 0;
      for (let s = z.s0; s < z.s1; s += camp ? 4.6 : 8.5) {
        for (const l of rows) {
          if (rr() < (camp ? pick(0.5, 0.55, 0.6) : 0.15)) continue;
          const ss = s + (rr() - 0.5) * 2, w = this.wall(ss, z.side);
          const lat = z.side * (w + CLEAR + l + (rr() - 0.5) * 1.4);
          const st = this.site(ss, lat, 2);
          const r = camp ? 1.7 : 3.1;
          if (!sp.ok(st.x, st.z, r)) continue;
          const F = new Frame(this.kit, key, st.m.clone().multiply(new THREE.Matrix4().makeRotationY(camp ? rr() * 6.28 : (rr() - 0.5) * 0.3)));
          if (camp) {
            const big = rr() < 0.25;
            F.part(GEO.dome, 0, -0.05, 0, big ? 1.8 : 1.25, big ? 1.35 : 1.05, big ? 1.5 : 1.05, tentCols[(rr() * tentCols.length) | 0], this.A.SW.fabric);
            F.box(0, 0.35, big ? 1.42 : 1.0, 0.55, 0.6, 0.06, COL.black, 'fabric', 0, -0.35);
            if (rr() < 0.35) {
              F.post(-1.4, 0, 3.4, 0.4, 0.025, COL.steel, 'metal', 4);
              const top = new THREE.Vector3(-1.4, 3.4, 0.4).applyMatrix4(F.base);
              this.flag(top.x, top.y - 0.75, top.z, 1.15, 0.75, [0, 2, 4, 6, 7, 5][(rr() * 6) | 0], 0, (rr() - 0.5) * 0.5);
            }
            if (rr() < 0.4) F.box(1.6, 0.22, 0.4, 0.5, 0.45, 0.4, [COL.blue, COL.red, COL.white][(rr() * 3) | 0], 'plastic');
          } else {
            this.#pagoda(F, rr, rr() < 0.4 ? 6 : 4, [COL.white, COL.red, COL.cream, COL.white][n % 4]);
          }
          // fans standing about
          const fans = camp ? (rr() < 0.45 ? 1 : 0) : 2 + ((rr() * 2) | 0);
          for (let k = 0; k < fans && TIER <= 2; k++) {
            const a = rr() * 6.28, d = r + 0.5 + rr() * 1.2;
            person(F.sub(Math.cos(a) * d, 0, Math.sin(a) * d, rr() * 6.28), shirt[(rr() * shirt.length) | 0], { legs: rr() < 0.7 ? COL.denim : COL.ink, cap: rr() < 0.3 ? COL.red : null, arm: rr() < 0.15 ? 1 : 0 });
          }
          sp.add(st.x, st.z, r + 0.6, K_MINE);
          n++;
        }
      }
      if (n) {
        for (let s = z.s0; s < z.s1; s += 24) { const p = this.pt(s + 12, z.side * (this.wall(s, z.side) + 12)); sp.reserve(p.x, p.z, 12); }
        this.placed.push(`${z.kind}${z.s0}:${n}`);
      }
    }
  }

  #serviceVehicles() {
    const T = this.T, sp = this.space;
    const kinds = ['safety', 'medical', 'recovery', 'medical'];
    const spots = [470, 1060, 1730, 2250];
    spots.forEach((s0, n) => {
      const side = -T.turnSide[this.idx(s0 + 40)];
      for (const ds of [0, 15, -15, 30]) {
        const s = s0 + ds, lat = side * (this.wall(s, side) + CLEAR + 7.5);
        const st = this.site(s, lat, 3);
        if (!sp.ok(st.x, st.z, 3)) continue;
        const F = new Frame(this.kit, this.key(s), st.m.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2 + 0.3)));
        const G = new Frame(this.glow, 0, F.base);
        this.#vehicle(F, G, kinds[n]);
        sp.add(st.x, st.z, 3.2, K_MINE);
        sp.reserve(st.x, st.z, 3);
        break;
      }
    });
  }

  #vehicle(F, G, kind) {
    const sw = this.A.SW, R = this.A.R;
    const body = kind === 'safety' ? COL.red : kind === 'medical' ? COL.white : COL.orange;
    const len = kind === 'safety' ? 4.6 : 5.6, tall = kind === 'safety' ? 0.8 : 1.6;
    F.box(0, 0.45 + tall / 2, 0, len, tall, 1.9, body, 'paint');
    if (kind === 'safety') {
      F.box(-0.3, 1.52, 0, 2.3, 0.55, 1.7, body, 'paint');
      F.box(0.9, 1.5, 0, 0.02, 0.45, 1.55, COL.glass, 'glass');
      F.panel(0.2, 1.0, 0.955, 1.6, 0.4, R.safety);
      F.panel(0.2, 1.0, -0.955, 1.6, 0.4, R.safety, COL.white, Math.PI);
    } else if (kind === 'medical') {
      F.box(2.35, 1.1, 0, 0.9, 1.25, 1.85, body, 'paint');
      F.box(2.81, 1.45, 0, 0.02, 0.6, 1.6, COL.glass, 'glass');
      F.box(0, 1.1, 0.955, len - 0.3, 0.18, 0.01, COL.redHot, 'paint');
      F.box(0, 1.1, -0.955, len - 0.3, 0.18, 0.01, COL.redHot, 'paint');
      F.box(0, 1.35, 0.955, len - 0.3, 0.1, 0.01, COL.yellow, 'paint');
      F.box(0, 1.35, -0.955, len - 0.3, 0.1, 0.01, COL.yellow, 'paint');
    } else {
      F.box(2.1, 1.35, 0, 1.4, 1.3, 1.95, body, 'paint');
      F.box(2.81, 1.6, 0, 0.02, 0.6, 1.7, COL.glass, 'glass');
      F.box(-0.8, 1.15, 0, 3.8, 0.12, 2.1, COL.darkSteel, 'steel');
    }
    const top = kind === 'safety' ? 1.83 : kind === 'medical' ? 2.28 : 2.03;
    F.box(kind === 'safety' ? -0.3 : 2.1, top, 0, 0.3, 0.1, 1.2, COL.black, 'plastic');
    G.box(kind === 'safety' ? -0.3 : 2.1, top + 0.03, 0, 0.26, 0.08, 1.1, kind === 'safety' ? new THREE.Color(2.2, 1.3, 0.2) : new THREE.Color(0.4, 0.8, 2.4));
    for (const x of [-len / 2 + 0.9, len / 2 - 0.9]) for (const z of [-0.88, 0.88]) {
      F.part(GEO.cyl(10, false), x, 0.36, z, 0.36, 0.26, 0.36, COL.tyre, sw.rubber, Math.PI / 2);
    }
  }

  // Floodlight masts around the pit / paddock and behind the main grandstand.
  #lightMasts() {
    const sp = this.space;
    const spots = [[-100, 67], [112, 67], [-100, 128], [112, 128], [-40, -68], [60, -66], [165, 72], [-150, -70]];
    const f = this.T.frame(30, this._fr);
    const tx = f.tx, tz = f.tz, rx = f.rx, rz = f.rz, fx = f.x, fz = f.z;
    for (const [along, lat] of spots.slice(0, pick(8, 8, 5, 3))) {
      const x = fx + tx * along + rx * lat, z = fz + tz * along + rz * lat;
      if (!sp.ok(x, z, 1.5, { minD: 30, boxes: false }) || sp.boxHit(x, z, 1.5, true)) continue;
      const y = this.W.heightAt(x, z) - 0.1;
      const yaw = Math.atan2(-rx * Math.sign(lat), -rz * Math.sign(lat));
      const F = this.frameAt(this.kit, lat > 0 ? 'pad' : this.key(10), x, y, z, yaw);
      const G = new Frame(this.glow, 0, F.base);
      F.part(GEO.cyl(8, false, 0.55), 0, 11, 0, 0.32, 22, 0.32, COL.steel, this.A.SW.steel);
      F.box(0, 22.4, 0.2, 3.4, 1.9, 0.18, COL.darkSteel, 'steel');
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        F.box(-1.2 + i * 0.8, 21.95 + j * 0.9, 0.45, 0.62, 0.62, 0.3, COL.darkSteel, 'metal');
        G.panel(-1.2 + i * 0.8, 21.95 + j * 0.9, 0.61, 0.5, 0.5, this.A.SW.matte, new THREE.Color(1.9, 1.6, 1.15), 0);
      }
      sp.add(x, z, 1.5, K_MINE);
      sp.reserve(x, z, 2);
    }
  }

  // ------------------------------------------------------------------ assemble meshes
  #finish() {
    const A = this.A;
    const mat = new THREE.MeshStandardMaterial({
      map: A.tex, vertexColors: true, roughnessMap: A.ormTex, metalnessMap: A.ormTex, roughness: 1, metalness: 1, envMapIntensity: 0.9,
    });
    let draws = 0;
    for (const [kit, cast, longShadow, tag] of [[this.kit, true, true, 'props'], [this.low, true, false, 'tyres'], [this.flat, false, false, 'flat']]) {
      for (const key of kit.chunks.keys()) {
        const g = kit.geometry(key);
        if (!g) continue;
        const mesh = new THREE.Mesh(g, mat);
        mesh.castShadow = cast;
        mesh.receiveShadow = true;
        if (!longShadow) mesh.userData.noLongShadow = true; // barrier-height props would throw 10 m+ shadows
        mesh.name = `dressing-${tag}-${key}`;
        this.group.add(mesh);
        draws++;
      }
    }
    const gg = this.glow.geometry(0);
    if (gg) {
      const glow = new THREE.Mesh(gg, new THREE.MeshBasicMaterial({ map: A.tex, vertexColors: true }));
      glow.name = 'dressing-glow';
      this.group.add(glow);
      draws++;
    }
    // flags
    if (this.flags.length) {
      const geo = new THREE.PlaneGeometry(1, 1, TIER <= 1 ? 8 : 5, 2).translate(0.5, 0.5, 0);
      const n = this.flags.length;
      const attr = new Float32Array(n * 3);
      const im = new THREE.InstancedMesh(geo, flagMaterial(this.U, buildFlagAtlas(8)), n);
      const q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
      this.flags.forEach((f, k) => {
        e.set(0, f.yaw, 0); q.setFromEuler(e);
        im.setMatrixAt(k, _m.compose(pos.set(f.x, f.y, f.z), q, sc.set(f.w, f.h, f.w)));
        attr[k * 3] = (f.cell % 2) * 0.5;
        attr[k * 3 + 1] = 1 - (Math.floor(f.cell / 2) + 1) * 0.25;
        attr[k * 3 + 2] = f.portrait;
      });
      geo.setAttribute('aFlag', new THREE.InstancedBufferAttribute(attr, 3));
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.receiveShadow = true;
      im.name = 'dressing-flags';
      this.group.add(im);
      draws++;
      this.flagTris = n * geo.index.count / 3;
    }
    draws += this.banks.length + (this.bermTris ? 1 : 0);
    this.scene.add(this.group);
    this.stats = {
      drawCalls: draws,
      tris: Math.round(this.kit.tris + this.low.tris + this.flat.tris + this.glow.tris + (this.flagTris || 0) + (this.crowdTris || 0) + (this.bermTris || 0)),
      props: Math.round(this.kit.tris + this.low.tris + this.flat.tris), kitTris: Math.round(this.kit.tris), tyreTris: Math.round(this.low.tris), tyreLen: Math.round(this.tyreLen), crowd: this.crowdCount || 0, flags: this.flags.length,
      reserved: this.space.boxes.length - this.space.worldBoxes,
      placed: this.placed.join(' '),
      banks: this.banks.map(b => `${b.s0}:${b.people}/${b.ok}of${b.stations}`).join(' '),
    };
  }

  update(t) { this.U.uTime.value = t; }
}

// Call once right after `new World(...)` (before world.bakeLongShadows, so the props are in the baked shadow map),
// then update(t) every frame with the same clock as world.update. Adds its footprints to world.placedBoxes.
// Returns { group, update(t), stats } — stats holds draw call / triangle counts for this quality tier.
export function buildDressing(scene, track, world) {
  const d = new Dressing(scene, track, world);
  return { group: d.group, update: (t) => d.update(t), stats: d.stats };
}

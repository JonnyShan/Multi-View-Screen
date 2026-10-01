// Applies js/brand.js to the page: colours, fonts, logo, names and copy. It runs as its own module, before the
// game's modules load, so the loading screen is already branded.
import { BRAND as B } from './brand.js';

const root = document.documentElement;
const hex = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = (a) => '#' + a.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), B);

const colors = {
  primary: B.primary, 'primary-hot': B.primaryHot, 'primary-deep': B.primaryDeep, light: B.light, accent: B.accent,
  'accent-2': B.accent2, dark: B.dark, alt: B.alt, bg: B.bg,
  panel: mix(B.dark, '#000000', 0.2), glow: mix(B.primaryDeep, B.bg, 0.55),
};
for (const [k, v] of Object.entries(colors)) {
  root.style.setProperty('--' + k, v);
  root.style.setProperty(`--${k}-rgb`, hex(v).join(','));
}
// Text colour for solid fills of each brand colour: dark on bright colours, light on dark ones.
const lum = (c) => hex(c).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
for (const k of ['primary', 'primary-hot', 'accent']) root.style.setProperty('--on-' + k, lum(colors[k]) > 0.4 ? B.dark : B.light);
root.style.setProperty('--display', `'${B.fonts.display}', Georgia, serif`);
root.style.setProperty('--cond', `'${B.fonts.condensed}', 'Arial Narrow', Arial, sans-serif`);
for (const f of B.fonts.files) {
  try { document.fonts.add(new FontFace(f.family, `url(${f.src}) format('woff2')`, { weight: String(f.weight), style: f.style, display: 'swap' })); }
  catch (e) { console.warn('font', f.src, e); }
}

document.title = B.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', B.description);
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', B.dark);

// Text slots: <el data-b="path.in.brand">. Empty values hide the element.
for (const el of document.querySelectorAll('[data-b]')) {
  const v = get(el.dataset.b);
  if (v == null || v === '') el.hidden = true; else el.textContent = v;
}
// Game name: first word in the hot primary colour; data-br puts the rest on its own line.
for (const el of document.querySelectorAll('.game-title')) {
  const [first, ...rest] = B.game.split(' ');
  const r = document.createElement('span'); r.className = 'r'; r.textContent = first;
  el.replaceChildren(r, ...(rest.length ? [el.hasAttribute('data-br') ? document.createElement('br') : ' ', rest.join(' ')] : []));
}
// Wordmark slots: the full-colour logo when there is one, else the brand name in the display face.
for (const el of document.querySelectorAll('.wm')) {
  if (B.logoUi) {
    const img = new Image(); img.src = B.logoUi; img.alt = B.name; img.decoding = 'async';
    img.onerror = () => { el.textContent = B.name; };
    el.replaceChildren(img);
  } else el.textContent = B.name;
}
root.classList.remove('unskinned');

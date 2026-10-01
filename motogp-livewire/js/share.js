// Sharing a lap: a branded lap card (portrait image for stories and messages) and QR codes for the kiosk.
// The card is drawn on a canvas from a frame of the game, the brand logo and fonts, and the lap's numbers.
import { BRAND } from './config.js';
import { fmtTime } from './store.js';

const W = 1080, H = 1350;

const loadImg = (src) => new Promise((res) => {
  if (!src) return res(null);
  const im = new Image();
  im.onload = () => res(im); im.onerror = () => res(null);
  im.src = src;
});

// QR code as a canvas: dark modules on a light quiet zone (scanners want a light border round it).
export async function qrCanvas(text, px, dark = '#000', light = '#fff') {
  const { default: qrcode } = await import('../vendor/qrcode/qrcode.module.js');
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount(), quiet = 2, cell = px / (n + quiet * 2);
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  g.fillStyle = light; g.fillRect(0, 0, px, px);
  g.fillStyle = dark;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (q.isDark(y, x)) g.fillRect(Math.floor((x + quiet) * cell), Math.floor((y + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
  }
  return c;
}

// The lap card. `shot` is a canvas holding a frame of the game (or null for a plain background).
export async function lapCard(r, shot) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const DISP = `"${BRAND.fonts.display}", sans-serif`, COND = `"${BRAND.fonts.condensed}", sans-serif`;
  g.fillStyle = BRAND.bg; g.fillRect(0, 0, W, H);
  if (shot) { // cover-crop the frame into the card
    const s = Math.max(W / shot.width, H / shot.height), w = shot.width * s, h = shot.height * s;
    g.drawImage(shot, (W - w) / 2, (H - h) / 2, w, h);
  }
  const fade = g.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,.55)'); fade.addColorStop(0.28, 'rgba(0,0,0,0)');
  fade.addColorStop(0.5, 'rgba(0,0,0,.15)'); fade.addColorStop(0.72, 'rgba(0,0,0,.82)'); fade.addColorStop(1, 'rgba(0,0,0,.95)');
  g.fillStyle = fade; g.fillRect(0, 0, W, H);

  // header: logo + game name
  const logo = await loadImg(BRAND.logoUi);
  if (logo) { const h = 74, w = logo.width * h / logo.height; g.drawImage(logo, 64, 58, w, h); }
  g.textBaseline = 'alphabetic';
  g.font = `800 italic 64px ${COND}`; g.fillStyle = BRAND.light; g.textAlign = 'right';
  g.fillText(BRAND.game, W - 64, 120);

  // lap time
  g.textAlign = 'left';
  g.font = `600 34px ${COND}`; g.fillStyle = BRAND.accent;
  g.fillText(`LAP TIME · ${BRAND.circuit.toUpperCase()}`, 64, 880);
  g.font = `800 italic 210px ${DISP}`; g.fillStyle = BRAND.light;
  g.fillText(fmtTime(r.t), 56, 1060);

  // medal + personal best chips
  let x = 64;
  const chip = (txt, bg, fg) => {
    g.font = `700 32px ${COND}`;
    const w = g.measureText(txt).width + 44;
    g.fillStyle = bg; g.beginPath(); g.roundRect(x, 1100, w, 56, 6); g.fill();
    g.fillStyle = fg; g.fillText(txt, x + 22, 1139);
    x += w + 14;
  };
  const MEDAL = { gold: ['GOLD', '#E6B422'], silver: ['SILVER', '#C9CED6'], bronze: ['BRONZE', '#C98B4E'] };
  if (MEDAL[r.medal]) chip(MEDAL[r.medal][0] + ' MEDAL', MEDAL[r.medal][1], '#111');
  if (r.pb && r.prevBest != null) chip('PERSONAL BEST', BRAND.primaryHot, BRAND.dark);
  g.font = `600 30px ${COND}`; g.fillStyle = 'rgba(255,255,255,.75)';
  g.fillText(`TOP SPEED ${Math.round(r.top)} KM/H   ·   MAX LEAN ${Math.round(r.lean)}°`, 64, 1212);

  // call to action + QR to the game
  const url = BRAND.share?.url || location.href.split(/[?#]/)[0];
  const qr = await qrCanvas(url, 190, '#000', '#fff');
  g.drawImage(qr, W - 64 - 190, H - 64 - 190);
  g.font = `800 italic 50px ${COND}`; g.fillStyle = BRAND.primaryHot;
  g.fillText('BEAT MY LAP', 64, 1278);
  g.font = `600 30px ${COND}`; g.fillStyle = BRAND.light;
  g.fillText(url.replace(/^https?:\/\//, '').replace(/\/$/, ''), 64, 1318);
  return c;
}

// The card as a PNG file, ready to share.
export async function cardFile(card) {
  const blob = await new Promise(res => card.toBlob(res, 'image/png'));
  return new File([blob], `${(BRAND.title || 'lap').replace(/\W+/g, '-').toLowerCase()}-lap.png`, { type: 'image/png' });
}

// Share the card file: the phone's share sheet when it can take an image, otherwise save it as a PNG.
// Call it straight from the tap (iPhones only open the share sheet from a fresh tap, so make the file beforehand).
// Resolves to 'shared', 'saved' or 'cancelled'.
export function shareFile(file, text) {
  const save = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'saved';
  };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], text }).then(() => 'shared', (e) => (e && e.name === 'AbortError' ? 'cancelled' : save()));
  }
  return Promise.resolve(save());
}

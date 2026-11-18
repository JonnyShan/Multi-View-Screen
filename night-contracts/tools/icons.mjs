// Generates PWA icons, native app icons and splash screens from SVG artwork.
// Needs the dev server (for the Teko font): node tools/icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ICON = (bg = true, inset = 1) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <defs>
    <filter id="rough" x="-10%" y="-30%" width="120%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.35" numOctaves="3" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <radialGradient id="glow" cx="50%" cy="85%" r="70%">
      <stop offset="0" stop-color="#d9a441" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#0e0f11" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${bg ? '<rect width="1024" height="1024" fill="#0e0f11"/><rect width="1024" height="1024" fill="url(#glow)"/>' : ''}
  <g transform="translate(512 512) scale(${inset}) translate(-512 -512)">
    <g filter="url(#rough)">
      <path d="M90 600 C 330 540, 640 500, 950 430 L 960 560 C 660 610, 360 660, 80 720 Z" fill="#e0262b"/>
    </g>
    <g transform="skewX(-12) translate(110 0)">
      <text x="512" y="700" text-anchor="middle" font-family="Teko, Impact, sans-serif" font-weight="600" font-size="560" letter-spacing="-10" fill="#ece6da">NC</text>
    </g>
    <path d="M190 820 L 860 250" stroke="#d9a441" stroke-width="14" stroke-linecap="round"/>
    <path d="M180 832 L 230 790" stroke="#ece6da" stroke-width="30" stroke-linecap="round"/>
  </g>
</svg>`;

const SPLASH = (w, h) => {
  const s = Math.min(w, h);
  const logoW = Math.round(Math.min(w * 0.6, s * 1.1));
  return `<div style="width:${w}px;height:${h}px;background:radial-gradient(ellipse at 50% 80%, #2a1f12 0%, #0e0f11 60%);display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div style="width:${logoW}px">LOGO</div>
  <div style="margin-top:${Math.round(s * 0.02)}px;color:#ece6da;font:600 ${Math.round(s * 0.022)}px 'Chakra Petch',sans-serif;letter-spacing:0.34em">RIDE · HUNT · EXECUTE · DISAPPEAR</div>
</div>`;
};

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('http://localhost:5199/tools/icon-page.html');
await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });
const logo = await page.evaluate(() => window.__logo);
await page.evaluate(() => document.fonts.ready);

async function render(html, w, h, file, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(
    ([html, transparent]) => {
      document.body.innerHTML = `<div id="shot" style="position:fixed;inset:0;background:${transparent ? 'transparent' : '#0e0f11'}">${html}</div>`;
      document.body.style.background = transparent ? 'transparent' : '#0e0f11';
      document.documentElement.style.background = transparent ? 'transparent' : '#0e0f11';
    },
    [html, transparent],
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, omitBackground: transparent });
  console.log('wrote', file);
}

// PWA
await render(ICON(), 192, 192, 'public/icons/icon-192.png');
await render(ICON(), 512, 512, 'public/icons/icon-512.png');
await render(ICON(true, 0.72), 512, 512, 'public/icons/icon-maskable-512.png');
await render(ICON(), 180, 180, 'public/icons/icon-180.png');
await render(ICON(), 1024, 1024, 'resources/icon.png');
// iOS
await render(ICON(), 1024, 1024, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const splashHtml = (w, h) => SPLASH(w, h).replace('LOGO', logo.replace('class="logo"', 'style="width:100%"'));
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  await render(splashHtml(2732, 2732), 2732, 2732, `ios/App/App/Assets.xcassets/Splash.imageset/${f}`);
}
await render(splashHtml(2732, 2732), 2732, 2732, 'resources/splash.png');
// Android launcher icons
const mip = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, px] of Object.entries(mip)) {
  await render(ICON(), px, px, `android/app/src/main/res/mipmap-${d}/ic_launcher.png`);
  await render(`<div style="width:${px}px;height:${px}px;border-radius:50%;overflow:hidden">${ICON()}</div>`, px, px, `android/app/src/main/res/mipmap-${d}/ic_launcher_round.png`, true);
  const fg = Math.round(px * 2.25);
  await render(ICON(false, 0.62), fg, fg, `android/app/src/main/res/mipmap-${d}/ic_launcher_foreground.png`, true);
}
// Android splash screens
const land = { mdpi: [480, 320], hdpi: [800, 480], xhdpi: [1280, 720], xxhdpi: [1600, 960], xxxhdpi: [1920, 1280] };
for (const [d, [w, h]] of Object.entries(land)) {
  await render(splashHtml(w, h), w, h, `android/app/src/main/res/drawable-land-${d}/splash.png`);
  await render(splashHtml(h, w), h, w, `android/app/src/main/res/drawable-port-${d}/splash.png`);
}
await render(splashHtml(480, 320), 480, 320, 'android/app/src/main/res/drawable/splash.png');
await browser.close();

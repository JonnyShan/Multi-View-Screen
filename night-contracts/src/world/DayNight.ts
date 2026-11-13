/**
 * Time of day lighting keyframes. Pure data: colours are sRGB hex values that
 * the renderer converts. Night is the default look (blue hour sky, warm
 * sodium lamps), with dawn, day and golden hour in between.
 */

export interface Lighting {
  hour: number;
  zenith: number;
  horizon: number;
  /** Low warm glow near the horizon (city light at night, sun haze by day). */
  glow: number;
  fog: number;
  fogDensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  sunColor: number;
  sunIntensity: number;
  /** Direction towards the sun or moon in sim space (x, y, z up), normalised. */
  lightDir: [number, number, number];
  /** 0 by day, 1 at full night. Drives lamps, windows, neon. */
  night: number;
  exposure: number;
  starAlpha: number;
  /** Grade keyframe weights for the LUT pass: [night, dawn/dusk, day, golden]. */
  grade: [number, number, number, number];
}

interface Key {
  h: number;
  zenith: number;
  horizon: number;
  glow: number;
  fog: number;
  fogDensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  sunColor: number;
  sunIntensity: number;
  night: number;
  exposure: number;
  grade: [number, number, number, number];
}

const KEYS: Key[] = [
  { h: 0, zenith: 0x040914, horizon: 0x16263c, glow: 0x5a3a1c, fog: 0x101a28, fogDensity: 0.00042, hemiSky: 0x2a3a58, hemiGround: 0x1a1410, hemiIntensity: 0.55, sunColor: 0x8fa6d6, sunIntensity: 0.32, night: 1, exposure: 1.0, grade: [1, 0, 0, 0] },
  { h: 4.6, zenith: 0x060d1c, horizon: 0x1c2e48, glow: 0x4a3620, fog: 0x121d2c, fogDensity: 0.0004, hemiSky: 0x2c3c5a, hemiGround: 0x1a1410, hemiIntensity: 0.55, sunColor: 0x8fa6d6, sunIntensity: 0.3, night: 1, exposure: 1.0, grade: [1, 0, 0, 0] },
  { h: 5.6, zenith: 0x14284a, horizon: 0x5a6f8e, glow: 0xc07a5a, fog: 0x34445c, fogDensity: 0.00036, hemiSky: 0x4a5e80, hemiGround: 0x2a2018, hemiIntensity: 0.7, sunColor: 0xffa070, sunIntensity: 0.5, night: 0.75, exposure: 1.1, grade: [0.4, 0.6, 0, 0] },
  { h: 6.6, zenith: 0x3a6090, horizon: 0xf0b38a, glow: 0xffb27a, fog: 0xc9a58e, fogDensity: 0.00028, hemiSky: 0x9ab6d6, hemiGround: 0x5a4432, hemiIntensity: 0.9, sunColor: 0xffbf8a, sunIntensity: 1.8, night: 0.2, exposure: 1.0, grade: [0, 0.6, 0, 0.4] },
  { h: 9, zenith: 0x3f7fd0, horizon: 0xbcd6ea, glow: 0xf3dcc0, fog: 0xd7d6ce, fogDensity: 0.00022, hemiSky: 0xbcd6f2, hemiGround: 0x6a5a48, hemiIntensity: 1.0, sunColor: 0xfff0dc, sunIntensity: 2.8, night: 0, exposure: 0.95, grade: [0, 0, 1, 0] },
  { h: 13, zenith: 0x3a7bd2, horizon: 0xc4dcee, glow: 0xf5e6d0, fog: 0xdad8ce, fogDensity: 0.0002, hemiSky: 0xc4dcf6, hemiGround: 0x70604c, hemiIntensity: 1.05, sunColor: 0xfff6e8, sunIntensity: 3.1, night: 0, exposure: 0.92, grade: [0, 0, 1, 0] },
  { h: 16.3, zenith: 0x4a80c0, horizon: 0xe8d4b4, glow: 0xffd6a0, fog: 0xe0cdb4, fogDensity: 0.00022, hemiSky: 0xc0d2ea, hemiGround: 0x74604a, hemiIntensity: 1.0, sunColor: 0xffe0b0, sunIntensity: 2.8, night: 0, exposure: 0.95, grade: [0, 0, 0.5, 0.5] },
  { h: 17.8, zenith: 0x4a74b0, horizon: 0xf6c89a, glow: 0xffb070, fog: 0xe2b894, fogDensity: 0.00025, hemiSky: 0xb0bedc, hemiGround: 0x6a4c36, hemiIntensity: 0.9, sunColor: 0xffc080, sunIntensity: 2.4, night: 0.05, exposure: 1.0, grade: [0, 0, 0, 1] },
  { h: 19, zenith: 0x2a4476, horizon: 0xf09a5e, glow: 0xff8a50, fog: 0x9a7466, fogDensity: 0.0003, hemiSky: 0x7a86aa, hemiGround: 0x4a3426, hemiIntensity: 0.75, sunColor: 0xff9a5a, sunIntensity: 1.3, night: 0.35, exposure: 1.05, grade: [0.2, 0.3, 0, 0.5] },
  { h: 20, zenith: 0x0e1e3c, horizon: 0x3a5474, glow: 0x9a6a54, fog: 0x263650, fogDensity: 0.00036, hemiSky: 0x3e5074, hemiGround: 0x241c16, hemiIntensity: 0.62, sunColor: 0x90a8d8, sunIntensity: 0.35, night: 0.85, exposure: 1.0, grade: [0.7, 0.3, 0, 0] },
  { h: 21.5, zenith: 0x060c1a, horizon: 0x1c2e48, glow: 0x6a4420, fog: 0x121c2c, fogDensity: 0.0004, hemiSky: 0x2c3c5a, hemiGround: 0x1a1410, hemiIntensity: 0.56, sunColor: 0x8fa6d6, sunIntensity: 0.32, night: 1, exposure: 1.0, grade: [1, 0, 0, 0] },
  { h: 24, zenith: 0x040914, horizon: 0x16263c, glow: 0x5a3a1c, fog: 0x101a28, fogDensity: 0.00042, hemiSky: 0x2a3a58, hemiGround: 0x1a1410, hemiIntensity: 0.55, sunColor: 0x8fa6d6, sunIntensity: 0.32, night: 1, exposure: 1.0, grade: [1, 0, 0, 0] },
];

function mixHex(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

export function sunElevation(hour: number): number {
  // sunrise ~6:00, sunset ~19:00
  const t = (hour - 6) / 13;
  return Math.sin(Math.PI * t) * 1.2;
}

export function lightingAt(hour: number, overcast = 0): Lighting {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (h - a.h) / (b.h - a.h);
  const s = t * t * (3 - 2 * t);
  const m = (x: number, y: number): number => x + (y - x) * s;

  const elev = sunElevation(h);
  const isSun = elev > -0.05;
  let dir: [number, number, number];
  if (isSun) {
    // sun travels east (+x) to west, arcing over the ocean to the south (-y)
    const az = Math.PI * ((h - 6) / 13);
    const e = Math.max(0.06, elev);
    dir = [Math.cos(az) * Math.cos(e), -Math.abs(Math.sin(az)) * Math.cos(e) * 0.6 - 0.25, Math.sin(e)];
  } else {
    const mh = (h + 12) % 24;
    const az = Math.PI * ((mh - 6) / 13);
    dir = [Math.cos(az) * 0.5, -0.45, 0.75];
  }
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  dir = [dir[0] / len, dir[1] / len, dir[2] / len];

  const night = m(a.night, b.night);
  const oc = Math.max(0, Math.min(1, overcast));
  const grey = (c: number, amt: number, target: number): number => mixHex(c, target, amt);
  const zen = mixHex(a.zenith, b.zenith, s);
  const hor = mixHex(a.horizon, b.horizon, s);
  const fog = mixHex(a.fog, b.fog, s);
  return {
    hour: h,
    zenith: grey(zen, oc * 0.6, night > 0.5 ? 0x0b1018 : 0x6c747c),
    horizon: grey(hor, oc * 0.6, night > 0.5 ? 0x1a222c : 0x8a9096),
    glow: mixHex(a.glow, b.glow, s),
    fog: grey(fog, oc * 0.55, night > 0.5 ? 0x141a22 : 0x7c8288),
    fogDensity: m(a.fogDensity, b.fogDensity) * (1 + oc * 0.9),
    hemiSky: mixHex(a.hemiSky, b.hemiSky, s),
    hemiGround: mixHex(a.hemiGround, b.hemiGround, s),
    hemiIntensity: m(a.hemiIntensity, b.hemiIntensity) * (1 - oc * 0.25),
    sunColor: mixHex(a.sunColor, b.sunColor, s),
    sunIntensity: m(a.sunIntensity, b.sunIntensity) * (1 - oc * 0.7),
    lightDir: dir,
    night: Math.min(1, night + oc * 0.25 * (1 - night)),
    exposure: m(a.exposure, b.exposure),
    starAlpha: Math.max(0, night - 0.6) / 0.4 * (1 - oc),
    grade: [m(a.grade[0], b.grade[0]), m(a.grade[1], b.grade[1]), m(a.grade[2], b.grade[2]), m(a.grade[3], b.grade[3])],
  };
}

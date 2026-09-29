// RED LINE: brand + tuning config.
// Colours are placeholders.

export const BRAND = {
  red: '#8B1E24',       // signature red
  redHot: '#C22A2E',    // brighter red for glows / rev lights
  burgundy: '#5E1419',
  cream: '#EFE6D2',
  amber: '#B8863B',
  gold: '#D9A95B',
  ink: '#1B1512',
  rye: '#2F4A35',

  wordmark: 'KENTUCKY RIVER',
  game: 'RED LINE',
  circuit: 'Kentucky River Circuit',
  mode: 'Time Attack',
  riderNumber: '54',

  // Optional title-screen product image.
  product: null,
  // Logo lockup for trackside boards and the start/finish gantry: white artwork on transparent, tinted per board.
  // Missing file = the text wordmark instead.
  logo: null,

};

// Minimum age by region (only used if AGE_GATE is on).
export const AGE_RULES = {
  AU: { label: 'Australia', age: 18, line: '' },
  US: { label: 'United States', age: 21, line: '' },
  UK: { label: 'United Kingdom', age: 18, line: '' },
  NZ: { label: 'New Zealand', age: 18, line: '' },
  CA: { label: 'Canada', age: 19, line: '' },
  JP: { label: 'Japan', age: 20, line: '' },
  KR: { label: 'South Korea', age: 19, line: '' },
  OTHER: { label: 'Other', age: 21, line: '' },
};
export const DEFAULT_REGION = 'AU';

// Bike + physics tuning (SI units: metres, seconds).
export const TUNE = {
  g: 9.81,
  maxLean: 58 * Math.PI / 180,
  leanRateLow: 120 * Math.PI / 180,   // rad/s at low speed
  leanRateHigh: 80 * Math.PI / 180,   // rad/s at top speed (gyro makes it heavier)
  powerPerMass: 900,                  // W/kg (at the wheel)
  tractionAccel: 11.0,                // m/s^2 (wheelie-limited launch)
  drag: 0.00082,                      // 1/m  -> top speed ~ 103 m/s (370 km/h)
  rolling: 0.25,
  brakeDecel: 13.0,
  assist: 0.82,                       // steering help (Standard); 0.35 = Pro. Only acts while steering into a corner
  gears: [88, 138, 184, 228, 276, 345], // km/h at redline per gear
  redline: 17500,
  idle: 3800,
};

// Surfaces by |lateral offset| from the centreline (metres).
export const LANES = {
  road: 7.0,
  kerb: 8.4,
  runoff: 13.0,
  wall: 25.0,
};

// Graphics tiers. ?q= wins, then the player's saved choice, then a device default.
export const QUALITY_TIERS = ['ultra', 'high', 'mid', 'low'];
export const QUALITY = (() => {
  const q = new URLSearchParams(location.search).get('q');
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('wt_redline_v1_gfx')); } catch { /* storage blocked */ }
  const mobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
  let tier = QUALITY_TIERS.includes(q) ? q : QUALITY_TIERS.includes(saved) ? saved : (mobile ? 'high' : 'ultra');
  const T = { ultra: 0, high: 1, mid: 2, low: 3 }[tier];
  const pick = (...v) => v[T];
  return {
    tier,
    mobile,
    maxDpr: pick(2, 2, 1.5, 1),
    minDpr: pick(1, 0.85, 0.7, 0.6),      // adaptive resolution never drops below this
    shadowMap: pick(4096, 2048, 1024, 1024),
    shadowSpan: pick(34, 40, 40, 40),       // half-width of the sun's shadow box around the bike (m)
    msaa: pick(4, 4, 2, 0),
    trees: pick(3400, 2600, 1500, 800),
    leafCards: T <= 1,                      // alpha leaf-card canopies instead of solid blobs
    crowd: pick(6000, 5200, 3000, 1500),
    terrainSeg: pick(360, 280, 200, 200),
    grass: pick(110000, 60000, 22000, 0),   // 3D grass tufts along the verges
    grassRange: pick(150, 110, 70, 0),      // draw distance for grass (m)
    rays: T <= 2,                           // screen-space sun shafts + lens dirt
    ao: T <= 1,                             // screen-space ambient occlusion
    dof: T <= 2,                            // depth of field on the cinematic shots
    bikeReflections: T === 0 ? 128 : 0,     // live cube-map reflections on the bike's paint and visor (face size)
    sharpen: pick(0.35, 0.3, 0.2, 0),
    rubber: T <= 2,                         // rubbered-in racing line + skid marks
    texScale: pick(2, 2, 1, 1),             // procedural texture resolution multiplier
  };
})();

export const PARAMS = new URLSearchParams(location.search);
// Google Analytics 4 measurement ID (Gamify.com property) for anonymous play stats; '' turns analytics off.
export const ANALYTICS_ID = 'G-V6EPMF5MXG';
export const KIOSK = PARAMS.get('kiosk') === '1';
// Date-of-birth age gate before the title screen. Off for the demo; switch on (or add ?gate=1) before any
// public or client-facing release: some events require one.
export const AGE_GATE = PARAMS.get('gate') === '1';
// Race announcer voice lines. Muted for the client demo; add ?voice=1 to hear them, or set true to switch them back on.
export const ANNOUNCER = PARAMS.get('voice') === '1';

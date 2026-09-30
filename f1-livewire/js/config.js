// RED LINE game config: tuning, graphics tiers and URL switches. Brand values are in brand.js.
import { BRAND } from './brand.js';
export { BRAND };

// Car + physics tuning (SI units: metres, seconds). The physics model is shared with the bike game: `lean` is the
// cornering load, so lateral grip = g·tan(lean). The car doesn't lean; it just corners that hard.
export const TUNE = {
  g: 9.81,
  maxLean: Math.atan(2.6),            // 2.6 g of lateral grip (downforce)
  leanRateLow: 330 * Math.PI / 180,   // how fast cornering load builds (steering response), low speed
  leanRateHigh: 240 * Math.PI / 180,  // ... at top speed
  powerPerMass: 900,                  // W/kg (at the wheels)
  tractionAccel: 12.5,                // m/s^2 (traction-limited launch)
  drag: 0.00108,                      // 1/m  -> top speed ~ 94 m/s (340 km/h)
  rolling: 0.3,
  brakeDecel: 24.0,                   // carbon brakes + downforce
  assist: 0.82,                       // steering help (Standard); 0.35 = Pro. Only acts while steering into a corner
  turn: 1.1,                          // player's bike turns 10% tighter for the same lean (the autopilot, and so the medal pace, uses 1)
  gears: [98, 138, 172, 205, 238, 272, 306, 342], // km/h at redline per gear (8-speed)
  redline: 12500,
  cylinders: 6,                       // engine note: firing frequency = rpm / 60 * cylinders / 2 (V6)
  idle: 4000,
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
  try { saved = JSON.parse(localStorage.getItem(BRAND.id + '_gfx')); } catch { /* storage blocked */ }
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
// One-tap age gate on first load (BRAND.gate). ?gate=0 skips it for testing, ?gate=1 forces it on.
export const AGE_GATE = PARAMS.get('gate') === '0' ? false : PARAMS.get('gate') === '1' || !!(BRAND.gate && BRAND.gate.on);
// Background blur during the race: scenery beyond `start` metres softens, fully blurred by `end`, keeping the eye on
// the bike. Graphics tiers with depth of field only (Ultra, High, Balanced). ?blur=0 turns it off.
export const BACKDROP_BLUR = PARAMS.get('blur') === '1' ? { start: 100, end: 360, amount: 0.85 } : null; // off in this build; ?blur=1 to try it
// Race announcer voice lines. Muted for the client demo; add ?voice=1 to hear them, or set true to switch them back on.
export const ANNOUNCER = false; // this build ships without voice lines

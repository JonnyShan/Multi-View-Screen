// Wild Turkey RED LINE — brand + tuning config.
// Colours are eyeballed from public packaging; swap for Campari's official brand-guide values.

export const BRAND = {
  red: '#8B1E24',       // bourbon red (the "Red Line")
  redHot: '#C22A2E',    // brighter red for glows / rev lights
  burgundy: '#5E1419',
  cream: '#EFE6D2',
  amber: '#B8863B',
  gold: '#D9A95B',
  ink: '#1B1512',
  rye: '#2F4A35',

  wordmark: 'WILD TURKEY',
  game: 'RED LINE',
  circuit: 'Kentucky River Circuit',
  mode: 'Time Attack',
  riderNumber: '54',

  // Responsible-marketing copy. Region-specific line is picked from AGE_RULES below.
  responsible: 'Never drink and ride.',
};

// Legal drinking/purchase age by region (age gate asks full date of birth).
export const AGE_RULES = {
  AU: { label: 'Australia', age: 18, line: 'Enjoy Wild Turkey responsibly. Get the facts at DrinkWise.org.au' },
  US: { label: 'United States', age: 21, line: 'Enjoy Wild Turkey responsibly.' },
  UK: { label: 'United Kingdom', age: 18, line: 'Enjoy responsibly. drinkaware.co.uk' },
  NZ: { label: 'New Zealand', age: 18, line: 'Enjoy Wild Turkey responsibly.' },
  CA: { label: 'Canada', age: 19, line: 'Enjoy Wild Turkey responsibly.' },
  JP: { label: 'Japan', age: 20, line: 'Enjoy Wild Turkey responsibly.' },
  KR: { label: 'South Korea', age: 19, line: 'Enjoy Wild Turkey responsibly.' },
  OTHER: { label: 'Other', age: 21, line: 'Enjoy Wild Turkey responsibly.' },
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
  latDamp: 2.6,                       // lateral velocity damping (arcade "stick")
  assist: 0.82,                       // share of the corner's required lean applied automatically
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

export const QUALITY = (() => {
  const q = new URLSearchParams(location.search).get('q');
  const mobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const tier = q || (mobile ? 'mid' : 'high');
  return {
    tier,
    mobile,
    maxDpr: tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1,
    shadowMap: tier === 'high' ? 2048 : 1024,
    msaa: tier === 'high' ? 4 : tier === 'mid' ? 2 : 0,
    trees: tier === 'high' ? 2600 : tier === 'mid' ? 1500 : 800,
    crowd: tier === 'high' ? 5200 : tier === 'mid' ? 3000 : 1500,
    terrainSeg: tier === 'high' ? 280 : 200,
  };
})();

export const PARAMS = new URLSearchParams(location.search);
export const KIOSK = PARAMS.get('kiosk') === '1';

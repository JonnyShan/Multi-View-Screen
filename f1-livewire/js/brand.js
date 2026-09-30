// Every brand value in this build lives here: names, colours, fonts, logos, copy and legal lines.
// A reskin is this file plus new images in assets/brand/ (see WORKFLOW.md at the repo root).
// Colours are taken from the supplied Livewire logo (lime on black); swap in official brand-guide values when they arrive.

export const BRAND = {
  id: 'livewire_hotlap_v1',           // save-key prefix (leaderboard, settings); give every brand its own
  name: 'Livewire',                   // brand name in page copy
  mark: '',                           // shown after the name in the legal bar ('' for none)
  wordmark: 'LIVEWIRE',               // text stand-in wherever the logo image is missing
  game: 'HOT LAP',                    // game name on boards, the gantry and the title screen (placeholder: confirm)
  circuit: 'Kentucky River Circuit',
  mode: 'Time Attack',
  riderNumber: '7',                   // race number on the car and the timing tower

  // Colours by role. The UI, trackside signage, car livery and HUD all read these.
  primary: '#161616',                 // main fill: airfence, primary buttons (text on it is picked for contrast)
  primaryHot: '#CCFF00',              // the Livewire lime: glows, rev lights, start line, first word of the title
  primaryDeep: '#0E0E0E',             // darker fill for roofs and backgrounds
  light: '#F4F4F4',                   // text and light boards
  accent: '#CCFF00',                  // highlights, the ghost, trims
  accent2: '#9ECC00',                 // secondary highlight
  dark: '#0B0B0B',                    // dark boards, panels
  alt: '#262626',                     // occasional third colour on signage
  bg: '#050505',                      // page background behind the game

  // Car livery (js/car.js builds the F1 car from these).
  car: { body: '#111111', accent: '#CCFF00', trim: '#F4F4F4', carbon: '#1A1A1A' },

  // Typefaces: files in fonts/. Livewire's wordmark is a heavy italic sans, so both roles use Barlow Condensed
  // until the brand typeface is supplied.
  fonts: {
    display: 'Barlow Condensed',
    condensed: 'Barlow Condensed',
    files: [
      { family: 'Barlow Condensed', weight: 600, style: 'italic', src: 'fonts/BarlowCondensed-600i.woff2' },
      { family: 'Barlow Condensed', weight: 800, style: 'italic', src: 'fonts/BarlowCondensed-800i.woff2' },
      { family: 'Barlow Condensed', weight: 500, style: 'normal', src: 'fonts/BarlowCondensed-500.woff2' },
      { family: 'Barlow Condensed', weight: 700, style: 'normal', src: 'fonts/BarlowCondensed-700.woff2' },
      { family: 'Barlow Condensed', weight: 800, style: 'normal', src: 'fonts/BarlowCondensed-800.woff2' },
    ],
  },

  // Logo for trackside boards, the gantry and the car: white artwork on transparent, tinted per use. null = text wordmark.
  logo: null,
  // Full-colour logo for the dark menus, HUD and results screen. null = text wordmark.
  logoUi: null,
  // Title-screen product shot. null = none.
  product: null,

  // Page title and link-preview text.
  title: 'Livewire Hot Lap',
  description: 'Livewire HOT LAP: a time-attack Formula racing game on the fictional Kentucky River Circuit.',

  // Text painted on trackside signage.
  signs: {
    tagline: 'TIME ATTACK',
    productLine: 'ONE LAP · FLAT OUT',
    safety: 'BEAT THE GHOST',
    safetySub: 'LIVEWIRE · HOT LAP',
    place: 'KENTUCKY RIVER CIRCUIT',
  },
  // Corner names, in track order (shown in the HUD as you reach them).
  corners: ['Lawrenceburg Hairpin', 'Ridge Esses', 'The Palisades', 'Warehouse Row', 'Tyrone Hairpin', 'Mill Creek',
    'Quarry Chicane', 'Bluegrass Bend', 'Home Sweep'],
  // Loading-screen line while the scenery is built.
  loadingScenery: 'Carving the Kentucky River palisades',

  // No age gate: nothing age-restricted in this build.
  gate: { on: false },

  // Legal bar: brand name only (no responsible-drinking copy in this build).
  safetyLine: '',
  regions: {},
  defaultRegion: 'AU',
};

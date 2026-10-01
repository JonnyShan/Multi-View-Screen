// Every brand value in this build lives here: names, colours, fonts, logos, copy and legal lines.
// A reskin is this file plus new images in assets/brand/ (see WORKFLOW.md at the repo root).
// Colours are Livewire's own palette from livewire.group (Sep 2026): Neoteric lime, Onyx, Ivory, Serene blue.

export const BRAND = {
  id: 'livewire_motogp_v1',             // save-key prefix (leaderboard, settings); give every brand its own
  name: 'Livewire',                   // brand name in page copy
  mark: '',                           // shown after the name in the legal bar ('' for none)
  wordmark: 'LIVEWIRE',               // text stand-in wherever the logo image is missing
  game: 'HOT LAP',                    // game name on boards, the gantry and the title screen (placeholder: confirm)
  circuit: 'Livewire Raceway',        // fictional
  mode: 'Time Attack',
  riderNumber: '7',                   // race number on the bike, the rider and the timing tower

  // Colours by role. The UI, trackside signage, decals and HUD all read these. The bike and rider paint is baked into their
  // textures: tools/recolour-model.mjs repainted Wild Turkey red to Neoteric and the cream stripes to Onyx.
  primary: '#1A1A1A',                 // main fill: airfence, primary buttons, procedural bike (text on it is picked for contrast); Onyx
  primaryHot: '#CBFE00',              // Neoteric, the Livewire lime: glows, rev lights, start line, first word of the title
  primaryDeep: '#000000',             // darker fill for roofs and backgrounds; Black
  light: '#F1F1F1',                   // text and light boards; Ivory
  accent: '#CBFE00',                  // highlights, the ghost, trims; Neoteric
  accent2: '#4766FF',                 // secondary highlight; Serene
  dark: '#1A1A1A',                    // dark boards, panels; Onyx
  alt: '#383838',                     // occasional third colour on signage; Black 80
  bg: '#000000',                      // page background behind the game


  // Picture look. Leave out any value to keep the game's default. exposure, saturation, sharpen, grain and dirt (lens
  // dirt glow) set the cinematic grade; bloom is the glow strength. sky and fill light the shaded side of everything;
  // key is a soft light from the camera side that shows off the paint; gloss makes the bike and rider shinier (0..1).
  look: { exposure: 1.06, saturation: 1.18, sharpen: 0.4, grain: 0.015, dirt: 0.06, bloom: 0.25, sky: 0.95, fill: 1.6, key: 2, gloss: 1 },

  // Typefaces: files in fonts/. Livewire's own fonts (GT Flexa, Aktiv Grotesk) are commercial, so both roles use the free
  // Barlow Condensed until licensed files are supplied.
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

  // Logo for trackside boards, the gantry and the bike's decals: white artwork on transparent, tinted per use. null = text wordmark.
  logo: 'assets/brand/logo.webp',
  // Logo for the dark menus, HUD and results screen (lime on transparent). null = text wordmark.
  logoUi: 'assets/brand/logo-ui.webp',
  // Title-screen product shot. null = none.
  product: null,

  // Page title and link-preview text.
  title: 'Livewire Hot Lap',
  description: 'Livewire HOT LAP: a time-attack motorcycle racing game on the fictional Livewire Raceway.',

  // Text painted on trackside signage.
  signs: {
    tagline: 'TIME ATTACK',
    productLine: 'ONE LAP · FLAT OUT',
    safety: 'BEAT THE GHOST',
    safetySub: 'LIVEWIRE · HOT LAP',
    place: 'HOME OF THE HOT LAP',
  },
  // Corner names, in track order (shown in the HUD as you reach them).
  corners: ['Spark Hairpin', 'Ridge Esses', 'The Coil', 'Warehouse Row', 'Surge Hairpin', 'Mill Creek',
    'Breaker Chicane', 'Voltage Bend', 'Home Sweep'],
  // Loading-screen line while the scenery is built.
  loadingScenery: 'Wiring up the circuit',

  // Lap sharing: the link on the lap card and the kiosk QR code, and the message that goes with a shared card.
  share: { url: 'https://livewire.gamify.com/livewire/', text: 'I just lapped Livewire Raceway in {time}. Beat that: https://livewire.gamify.com/livewire/' },
  // Worldwide leaderboard: the address of tools/leaderboard-worker once it is deployed. null = this device only.
  leaderboard: { url: null },

  // Show the bike small and slowly turning on the loading screen.
  loaderBike: true,

  // Race announcer (assets/voice/, recorded for Livewire Raceway). false = muted unless ?voice=1.
  announcer: true,

  // No age gate: nothing age-restricted in this build.
  gate: { on: false },

  // Legal bar: brand name only (no responsible-drinking copy in this build).
  safetyLine: '',
  regions: {},
  defaultRegion: 'AU',
};

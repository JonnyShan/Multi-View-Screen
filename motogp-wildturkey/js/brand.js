// Every brand value in this build lives here: names, colours, fonts, logos, copy and legal lines.
// A reskin is this file plus new images in assets/brand/ (see WORKFLOW.md at the repo root).
// Colours are estimated from the supplied logo and pack shot; swap in the official brand-guide values when they arrive.

export const BRAND = {
  id: 'wt_redline_v1',                // save-key prefix (leaderboard, settings); give every brand its own
  name: 'Wild Turkey',                // brand name in page copy
  mark: '®',                          // shown after the name in the legal bar ('' for none)
  wordmark: 'WILD TURKEY',            // text stand-in wherever the logo image is missing
  game: 'RED LINE',                   // game name on boards, the gantry and the title screen
  circuit: 'Kentucky River Circuit',
  mode: 'Time Attack',
  riderNumber: '54',

  // Colours by role. The UI, trackside signage, bike livery and HUD all read these.
  primary: '#8B1E24',                 // main brand colour (airfence, primary buttons, bike paint)
  primaryHot: '#C22A2E',              // brighter primary for glows, rev lights, the start line
  primaryDeep: '#5E1419',             // darker primary for roofs and backgrounds
  light: '#EFE6D2',                   // text and light boards
  accent: '#D9A95B',                  // highlights, the ghost, trims
  accent2: '#B8863B',                 // secondary highlight
  dark: '#1B1512',                    // dark boards, panels
  alt: '#2F4A35',                     // occasional third colour on signage
  bg: '#0D0A09',                      // page background behind the game

  // Typefaces: files in fonts/. `display` is the wordmark-style serif, `condensed` the racing type.
  fonts: {
    display: 'Zilla Slab',
    condensed: 'Barlow Condensed',
    files: [
      { family: 'Barlow Condensed', weight: 600, style: 'italic', src: 'fonts/BarlowCondensed-600i.woff2' },
      { family: 'Barlow Condensed', weight: 800, style: 'italic', src: 'fonts/BarlowCondensed-800i.woff2' },
      { family: 'Barlow Condensed', weight: 500, style: 'normal', src: 'fonts/BarlowCondensed-500.woff2' },
      { family: 'Barlow Condensed', weight: 700, style: 'normal', src: 'fonts/BarlowCondensed-700.woff2' },
      { family: 'Barlow Condensed', weight: 800, style: 'normal', src: 'fonts/BarlowCondensed-800.woff2' },
      { family: 'Zilla Slab', weight: 600, style: 'normal', src: 'fonts/ZillaSlab-600.woff2' },
      { family: 'Zilla Slab', weight: 700, style: 'normal', src: 'fonts/ZillaSlab-700.woff2' },
    ],
  },

  // Logo for trackside boards and the gantry: white artwork on transparent, tinted per board. null = text wordmark.
  logo: 'assets/brand/logo.webp',
  // Full-colour logo for the dark menus, HUD and results screen. null = text wordmark.
  logoUi: 'assets/brand/logo-ui.webp',
  // Title-screen product shot, bottom right (transparent, upright, tightly cropped). null = none.
  product: { img: 'assets/brand/bottle.webp', alt: 'Wild Turkey Kentucky Straight Bourbon Whiskey' },

  // Page title and link-preview text.
  title: 'Wild Turkey Red Line',
  description: 'Wild Turkey RED LINE: a time-attack motorcycle racing game on the fictional Kentucky River Circuit. For adults of legal drinking age.',

  // Text painted on trackside signage.
  signs: {
    tagline: 'KENTUCKY STRAIGHT BOURBON',            // airfence, beside the logo
    productLine: 'KENTUCKY STRAIGHT BOURBON WHISKEY', // under the wordmark when there is no logo
    safety: 'NEVER DRINK AND RIDE',                  // big board and hoardings
    safetySub: 'WILD TURKEY · ENJOY RESPONSIBLY',
    place: 'LAWRENCEBURG, KENTUCKY',
  },
  // Corner names, in track order (shown in the HUD as you reach them).
  corners: ['Lawrenceburg Hairpin', 'Ridge Esses', 'The Palisades', 'Rickhouse Row', 'Tyrone Hairpin', 'Mill Creek',
    'Distillery Chicane', 'Bluegrass Bend', 'Home Sweep'],
  // Loading-screen line while the scenery is built.
  loadingScenery: 'Carving the Kentucky River palisades',

  // One-tap age gate on first load. `age` is also in the question; No leaves the game.
  gate: {
    on: true,
    question: 'Are you over 18?',
    yes: 'Yes',
    no: 'No',
    note: 'This game is for adults of legal drinking age. We don\'t store your answer.',
    deniedTitle: 'Sorry, you need to be 18 or over to play.',
    deniedText: 'For information on alcohol and health, visit',
    exitDelay: 3,                       // seconds on the "sorry" screen before leaving (kiosks return to the gate instead)
  },

  // Legal bar at the bottom of every screen, and the responsible-drinking line + help link per region.
  // The region comes from the browser language; DEFAULT_REGION otherwise.
  safetyLine: 'Never drink and ride',
  regions: {
    AU: { line: 'Enjoy Wild Turkey responsibly. Get the facts at DrinkWise.org.au', help: ['https://drinkwise.org.au', 'DrinkWise.org.au'] },
    US: { line: 'Enjoy Wild Turkey responsibly.', help: ['https://www.responsibility.org', 'responsibility.org'] },
    UK: { line: 'Enjoy responsibly. drinkaware.co.uk', help: ['https://www.drinkaware.co.uk', 'drinkaware.co.uk'] },
    NZ: { line: 'Enjoy Wild Turkey responsibly.', help: ['https://www.responsibility.org', 'responsibility.org'] },
    OTHER: { line: 'Enjoy Wild Turkey responsibly.', help: ['https://www.responsibility.org', 'responsibility.org'] },
  },
  defaultRegion: 'AU',
};

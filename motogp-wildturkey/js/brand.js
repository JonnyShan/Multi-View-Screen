// Every brand value in this build lives here: names, colours, fonts, logos, copy and legal lines.
// A reskin is this file plus new images in assets/brand/ (see WORKFLOW.md at the repo root).
// Reds and charcoals are taken from promotions.wildturkeybourbon.com (Sep 2026); cream and gold from the supplied logo and
// bottle. Swap in brand-guide values if the client supplies them.

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
  primary: '#9E0D2A',                 // main brand colour (airfence, primary buttons, bike paint); site's deep red
  primaryHot: '#BB0B2F',              // brighter primary for glows, rev lights, the start line; site's button red
  primaryDeep: '#5E0A1C',             // darker primary for roofs and backgrounds
  light: '#EFE6D2',                   // text and light boards
  accent: '#D9A95B',                  // highlights, the ghost, trims
  accent2: '#B8863B',                 // secondary highlight
  dark: '#202224',                    // dark boards, panels; the site's charcoal
  alt: '#36393B',                     // occasional third colour on signage; site's lighter charcoal
  bg: '#161718',                      // page background behind the game

  // Typefaces: files in fonts/. `display` is the wordmark-style serif, `condensed` the racing type.
  // Wild Turkey's own heading fonts (WT Heading, Flama) are commercial, so the condensed role uses Antonio, the free
  // Google font the brand's promotions site uses for its headings. Variable fonts give a weight range.
  fonts: {
    display: 'Zilla Slab',
    condensed: 'Antonio',
    files: [
      { family: 'Antonio', weight: '100 700', style: 'normal', src: 'fonts/Antonio-var.woff2' },
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

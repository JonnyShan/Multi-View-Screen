# Reskinning RED LINE

The original game lives in `wild-turkey-redline/`. It stays untouched: each reskin is a full copy next to it.

| Folder | Brand | Vehicle | Status |
|---|---|---|---|
| `wild-turkey-redline/` | Wild Turkey | Motorbike | Original. Do not edit for reskins. |
| `red-line/` | None (stand-in) | Motorbike | Generated shareable copy of the original. |
| `motogp-wildturkey/` | Wild Turkey | Motorbike | To build. |
| `f1-livewire/` | Livewire | F1 car | To build. |

## How the game is built

- **Engine:** Three.js r160, plain ES modules. Three.js and the fonts are vendored in `vendor/` and `fonts/`, so the game has no CDN dependencies and works offline.
- **Build step:** none. The files in the folder are the game.
  - `red-line/` is produced by a Python script that currently lives outside the repo. It swaps brand strings and converts the `.glb` models to glTF JSON plus JPEG textures.
  - The reskins will ship a small build script in the repo instead.
- **Run locally:** any static web server. Opening `index.html` from disk does not work, because browsers block ES modules on `file://`.
  ```sh
  python3 -m http.server 8131 --directory wild-turkey-redline
  # then open http://localhost:8131/
  ```
- **Deploy:** GitHub Pages serves the branch. For example, `red-line/` is live at `livewire.gamify.com/red-line/`.
- **Useful URL options:**
  - `?q=ultra|high|mid|low` sets the graphics tier.
  - `?kiosk=1` turns on kiosk mode.
  - `?gate=1` turns on the age gate.
  - `?voice=1` turns on the announcer.

## Size vs the 10 MB instant-play limit

| Build | Player downloads | On disk | Where the weight is |
|---|---|---|---|
| `wild-turkey-redline/` | **15.2 MB** (over) | 15.8 MB | Bike model 10.2 MB (5.5 MB textures + 4.7 MB geometry); rider model 3.5 MB; Three.js 0.9 MB; game code 0.4 MB; fonts 0.2 MB. |
| `red-line/` | **11.1 MB** (over) | 11.7 MB | The same models converted to JSON + JPEG (bike 6.9 MB, rider 2.9 MB). |

The 0.6 MB of announcer voice lines is not downloaded while the announcer is muted.

All the scenery (sky, hills, trees, grandstands, signage) is drawn in code at load time, so it adds nothing to the download. **The models are the whole problem.**

Planned fix for both reskins:
- Resize the model textures: the base colour to 2048 px and the other maps to 1024 px.
- Quantise and compress the geometry with meshopt. Three.js decodes this with a ~20 KB decoder.
- Expected result: roughly 3–5 MB per game. I'll measure it rather than assume it.

## Every file that changes in a reskin

Paths are relative to the game folder.

### Brand values (move into one file, `js/brand.js`)

| File | What's brand-specific today |
|---|---|
| `js/config.js` | The `BRAND` block: 8 colours, wordmark, game name, circuit name, mode, rider number, product image, logo, and the responsible line. Also the `AGE_RULES` copy per region, the analytics ID, and the `AGE_GATE` / `ANNOUNCER` flags. |
| `index.html` | `<title>` and meta description, and the CSS colour and font variables (lines 19–22). The "Wild Turkey" wordmark appears 6 times: loader, age gate, denied screen, title, attract mode and HUD. The circuit name is in the title, intro and results. The rest is page copy: the age-gate and denied copy (legal drinking age, DrinkWise link), the footer legal line and the error text ("Red Line"). |
| `js/textures.js` | Text painted onto trackside boards: `KENTUCKY STRAIGHT BOURBON`, `… WHISKEY`, `NEVER DRINK AND RIDE`, `WILD TURKEY · ENJOY RESPONSIBLY`, `RED LINE`, `LAWRENCEBURG, KENTUCKY` and `KENTUCKY RIVER CIRCUIT`. Also the rickhouse sign, the logo tint, and the race-number and wordmark decals. |
| `js/dressing.js` | Hoardings, airfence, advertising bridge, tyre-wall belts, flags and the big screen. It takes its colours, wordmark, game and circuit names from `BRAND` (about 90 references), and has `NEVER DRINK AND RIDE` hard-coded (line 97). |
| `js/world.js` | The start/finish gantry (logo), the rickhouses and their sign, and grandstand colours. |
| `js/track.js` | Corner names shown in the HUD: Lawrenceburg Hairpin, Rickhouse Row, Distillery Chicane and others. |
| `js/main.js` | Loading-screen lines ("Carving the Kentucky River palisades"), the product image and logo wiring, the age-gate flow and region help links (DrinkWise, drinkaware), error messages and model file paths. |
| `js/hud.js` | 6 hard-coded HUD colours. |
| `js/store.js` | The save-key prefix `wt_redline_v1_`. Each reskin needs its own, so the brands' leaderboards and settings don't mix on a shared kiosk. |

### Brand images and models

| File | What it is |
|---|---|
| `assets/brand/logo.png` | Logo lockup: white artwork on transparent, tinted per board. The current one is 292 × 193 px. |
| `assets/brand/bottle.png` | Title-screen product shot. The current one is 118 × 378 px. |
| `assets/bike-ai.glb` | The bike. Its livery colours are baked into the base-colour texture, and the decals are projected on top at runtime. |
| `assets/rider-ai.glb` | The rider. The suit colours are baked into the texture. |
| `fonts/*.woff2` | Barlow Condensed and Zilla Slab, stand-ins until the brand typefaces arrive. |
| `assets/voice/intro-1.mp3` | Says "Welcome to the Kentucky River Circuit". Re-record it if the circuit is renamed. The other 18 lines are brand-free. |

### Only for the F1 reskin (bike → car)

| File | Change |
|---|---|
| `js/bike.js` | Replace with a car module: F1 car model, Livewire livery, spinning wheels, driver helmet. No rider rig. |
| `js/physics.js` | Car handling: steering turns the car directly, with no lean. Grip, braking and top speed retuned for an F1 car. The autopilot and medal times are regenerated. |
| `js/hud.js` and `index.html` | Drop the lean gauge and relabel the controls ("lean" → "steer"). |
| `js/audio.js` | Retune the engine synth from a four-cylinder bike to an F1 engine note. |
| `js/main.js` | Camera heights and the chase camera for a car. |

### Only for `motogp-wildturkey`

| File | Change |
|---|---|
| `index.html` and `js/main.js` | One-tap 18+ gate on first load: "Are you over 18?" with Yes and No. No exits. Replaces the date-of-birth gate. |
| `js/fx.js` | Depth blur on the distant background layers during the race, keeping the bike sharp. |

The blur is for focus only. It won't reduce the download, because that background is generated in code rather than downloaded. The compressed models are what bring the size down.

### No change

`vendor/`, `js/fx.js` (except the blur above), `js/analytics.js` (it reads the ID from config) and the rest of the scenery code.

## Brand assets

The brief points to `~/Desktop/assests wilf turkey & livewire`. That is on your Mac, and this session runs in a cloud container, so I can't see that folder yet.

| | Wild Turkey | Livewire |
|---|---|---|
| **Already in the repo** | Logo (292 × 193, white) and bottle shot (118 × 378), both small. Colours estimated from public packaging. | Nothing. |
| **Still needed** | High-resolution or vector logo. High-resolution bottle shot. Official brand colours (hex). Brand typeface. Approval of the logo usage. Legal lines per market. | Logo (SVG, or PNG in white and in colour). Brand colours. Typeface. Livery or car reference. Tagline and copy. What Livewire is, so the circuit and setting fit. |

## Assumptions

- "This F1 racing game" means RED LINE. It is the only racing game in this repo. `JonnyShan/starter-kit-racing-gamify` is a cartoon hatchback racer, not F1.
- `motogp-wildturkey` keeps the existing bike, because RED LINE already uses bikes.
- `f1-livewire` swaps the bike for an F1 car, because the brief says "cars".

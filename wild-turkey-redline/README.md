# Wild Turkey RED LINE

A browser-based, time-attack motorcycle racing game made for Wild Turkey. The player rides one hot lap of the fictional **Kentucky River Circuit** at golden hour. Everything is procedural (Three.js r160), and there are no build steps and no network calls at runtime, so the game runs offline on an event kiosk and also works on phones.

## Run it

Any static file server works. ES modules won't load from `file://`, so opening the HTML file directly won't work.

```bash
cd wild-turkey-redline
python3 -m http.server 8131
# open http://localhost:8131/
```

To deploy, drop the folder on any static host (Netlify, Vercel, GitHub Pages, S3). Motion-sensor tilt steering on phones requires HTTPS.

## Controls

| | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Lean | ← → / A D | Left stick | ◀ ▶ buttons, or Tilt (toggle on the title screen) |
| Brake | ↓ / S / Space | LT, X or B | BRAKE button |
| Camera (chase / onboard) | C | Y | Title toggle |
| Pause | Esc / P | Start | ❚❚ button |

The throttle is automatic. Standard assist leans the bike into corners for the player; Pro assist leaves more of it to the rider.

## Game loop

1. **Age gate.** The player enters their full date of birth and picks a region. The minimum age depends on the region (AU/UK/NZ 18, US 21 and so on). The date of birth is never stored.
2. **Title.** The screen shows a hero shot. After 22 seconds idle it switches to an attract mode: the autopilot rides a lap filmed with trackside broadcast cameras.
3. **Race.** The race runs through these stages:
   - A cinematic intro, then five start lights and lights out.
   - A single timed lap against a gold ghost. The ghost is the device's personal best, or the built-in pace-setter lap if there is no best yet.
   - A live delta to the ghost and sector splits in MotoGP-style colours: purple is best ever, green beats the ghost, yellow is slower.
   - Section call-outs such as "T1 · Lawrenceburg Hairpin".
   - Braking-marker boards before the slow corners, plus a flashing **BRAKE** coach prompt in Standard assist.
4. **Results.** The screen shows gold, silver and bronze medals, a personal-best flag, sectors, top speed, max lean and time off track. A qualifying time gets arcade-style 3-letter initials on a top-10 leaderboard.

Records (leaderboard, personal best and ghost) are kept in `localStorage` on each device. Nothing leaves the device.

## URL options

| Param | Effect |
|---|---|
| `?kiosk=1` | Hides the cursor. The age gate reappears when leaving the results screen, when leaving attract mode, and after 45 s idle on results, so each new player is checked. The gate is never remembered between players. |
| `?q=ultra\|high\|mid\|low` | Forces a graphics tier for this visit. Otherwise the player's **Graphics** choice on the title screen is used (Ultra, High, Balanced, Performance), and the default is Ultra on desktop and High on phones. Resolution also adapts to the frame rate, never dropping below the tier's floor. |
| `?auto=title\|race\|attract\|bike` | Dev and screenshot helpers. `race` lets the autopilot ride. |
| `?at=<metres>` | With `auto=race`, starts mid-lap at that distance (dev only). |
| `?fixeddt=0.033` | Fixed timestep for deterministic captures on slow GPUs (dev only). |

To reset the leaderboard on a kiosk, clear site data for the page. A staff reset shortcut can be added if needed.

## Graphics tiers

| | Ultra | High | Balanced | Performance |
|---|---|---|---|---|
| Max resolution scale | 2× | 2× | 1.5× | 1× |
| Shadow map | 4096 | 2048 | 1024 | 1024 |
| MSAA | 4× | 4× | 2× | off |
| Trees | 3400, leaf-card canopies | 2600, leaf-card canopies | 1500, solid | 800, solid |
| 3D grass tufts | 110k | 60k | 22k | none |
| Sun shafts + lens dirt | yes | yes | yes | no |
| Ambient occlusion (half-res SSAO) | yes | yes | no | no |
| Depth of field on title, intro, replays | yes | yes | yes | no |
| Live reflections on the bike | yes | no | no | no |
| Rubbered racing line + skid marks | yes | yes | yes | no |
| Texture resolution | 2× | 2× | 1× | 1× |

The asphalt has colour, normal and roughness maps generated from one height field, so the low sun picks out the aggregate and the rubbered line. Trees and grass sway in the wind and glow when backlit. Layered ridgelines on the horizon fade into the haze, and the rear tyre smokes under hard braking and off the line.

The scene is rendered once into an HDR target with MSAA and a depth texture (`ScenePass` in `js/fx.js`); ambient occlusion, depth of field, sun shafts, bloom and the final grade all run from that.

## Files

```
index.html          UI shell: age gate, title, HUD, results, CSS
js/main.js          game states, cameras, input, timing, ghosts, leaderboard
js/physics.js       arcade bike dynamics (Frenet frame), autopilot, offline lap sim
js/track.js         circuit spline, surfaces, named sections, track-side geometry
js/world.js         sky, clouds, sun-aware fog, terrain, river gorge, rickhouses, stands, trees
js/bike.js          sculpted bike + posable rider, per-side livery shader, ghost
js/fx.js            bloom + cinematic grade (ACES, speed blur, CA, flare, grain), particles
js/audio.js         Web Audio synth: engine, quickshifter, pops, wind, tyres, kerbs, crowd
js/hud.js           timing tower, speedo, lean gauge, minimap
js/textures.js      procedural canvas textures (asphalt, kerbs, liveries, boards)
js/config.js        brand colours, copy, age rules, physics tuning, quality tiers
vendor/three/       Three.js r160 (MIT), vendored for offline use
fonts/              Barlow Condensed + Zilla Slab (SIL OFL), self-hosted
```

## Brand and compliance: confirm with the client

These were built from public sources and need Campari/Wild Turkey sign-off:

- **Colours and type are stand-ins.** The hex values in `js/config.js` are eyeballed from packaging. Zilla Slab stands in for the custom Ian Brignell wordmark and Barlow Condensed is used for the UI. The official logo lockup and brand-guide values need to be swapped in.
- **No official logo art is used.** "WILD TURKEY" is set in type. Put the real turkey mark in `textures.js` and `index.html` once brand assets are supplied.
- **Fictional series.** The game uses no MotoGP names, logos, riders, teams or real circuits. The rider is anonymous and helmeted, and the number 54 is placeholder.
- **Alcohol-marketing safeguards (ABAC / DISCUS / Portman / CAP):**
  - Full date-of-birth age gate with a region-specific legal age.
  - No product, bottles, glasses or drinking anywhere in the game.
  - No alcohol-themed boosts or power-ups.
  - "Never drink and ride" appears on screen at all times and on trackside boards.
  - A region-specific responsible-drinking line.
  - A premium, non-cartoon art style.
  - Legal should still review. In particular, confirm DrinkWise membership before using the AU line.
- **Leaderboard.** The leaderboard collects initials only, with no personal data. Adding prizes or email capture would bring in trade-promotion and privacy requirements.

## Known limitations

- Visuals were checked with software (SwiftShader) rendering in a headless browser. **Frame rate on real phones and kiosk hardware hasn't been measured yet**, and Ultra is the heaviest tier. Adaptive resolution is built in, and players can drop to Balanced or Performance from the title screen.
- The engine sound is synthesised. It is wired up and running but hasn't been listened to or tuned by ear yet.
- Tilt steering is experimental and needs testing on real iOS and Android devices.
- There is no music. Add a licensed track if the client wants one.

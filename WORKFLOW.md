# Making the next reskin

Every brand value lives in one file per game: `js/brand.js`. That covers names, colours, fonts, logos, sign copy, corner names, the age gate and the legal lines. A reskin is that file plus new images, followed by a build and a check.

| Start from | When the new game has |
|---|---|
| `motogp-wildturkey/` | a motorbike. It has an age gate and responsible-drinking lines, for alcohol brands. |
| `motogp-livewire/` | a motorbike, with no age gate and no alcohol copy. |

Never edit those base folders or `wild-turkey-redline/` for a new brand. Copy them.

An F1 car version, `f1-livewire/`, was retired, and its link now redirects to `motogp-livewire/`. To start from the car, restore it from git history with `git checkout af32d2c -- f1-livewire`.

## Steps

1. **Copy the base folder.** Keep the name lowercase with no spaces, because it becomes the URL.
   ```sh
   cp -R motogp-livewire motogp-acme
   ```

2. **Add the brand images to `motogp-acme/assets/brand/`.** Delete the old brand's images from that folder.

   | File | What it is |
   |---|---|
   | `logo.webp` | The logo as **white artwork on a transparent background**. The game tints it for each trackside board, the gantry and the bike. |
   | `logo-ui.webp` | The full-colour logo for the dark menus, HUD and results screen. |
   | `product.webp` | Optional. A product shot for the title screen: transparent background, upright and tightly cropped. |

   - Keep logos under about 1200 px wide.
   - WebP files are a fraction of the size of PNGs.
   - Put the untouched originals in `assets/brand/source/` so the next person has them.

3. **Edit `motogp-acme/js/brand.js`.** Every field has a comment. The ones that matter most:
   - **`id`:** must be unique per brand. It keeps leaderboards and settings separate on a shared kiosk.
   - **Names:** `name`, `wordmark`, `game`, `circuit` and `title`.
   - **Colours:** `primary`, `primaryHot`, `light`, `accent` and `dark`. Button text switches between light and dark automatically for contrast.
   - **Images:** `logo`, `logoUi` and `product` are paths to the files from step 2. Use `null` when there is no image, and the game falls back to the text wordmark.
   - **Copy:** `signs`, the text painted on trackside boards, and `corners`, the corner names.
   - **Age gate and legal lines:** `gate`, `safetyLine` and `regions`. For an alcohol brand, keep the gate on and fill in the responsible-drinking lines. Otherwise set `gate: { on: false }` and `regions: {}`.

4. **Fonts (optional).** Put `.woff2` files in `fonts/` and list them under `fonts.files` in `brand.js`. Then set `fonts.display`, used for headings and the wordmark, and `fonts.condensed`, used for racing numbers and labels.

5. **Build.** This writes the page title and description into `index.html` for link previews, checks that every file named in `brand.js` exists, and prints the folder size against the 10 MB limit.
   ```sh
   node tools/build.mjs motogp-acme
   ```

6. **Check.** Run `npm install` in `tools/` once, then:
   ```sh
   node tools/check.cjs motogp-acme                   # loads it, passes the gate, checks the title screen
   node tools/check.cjs motogp-acme --q low --play    # also starts a race and holds the throttle
   ```
   Both runs must report `"errors": []` and a size under 10 MB. Add `--shots <folder>` to save screenshots.

7. **Play it locally.**
   ```sh
   python3 -m http.server 8131 --directory motogp-acme
   ```
   Then open http://localhost:8131/. Opening `index.html` directly from disk won't work.

8. **Publish.** Commit and push. GitHub Pages serves the new folder at `livewire.gamify.com/motogp-acme/`.

## When it takes more than config

- **Bike livery.** The bike's and rider's colours are baked into the textures of `assets/bike-ai.glb` and `assets/rider-ai.glb`.
  - Repaint them from the uncompressed originals in `wild-turkey-redline/assets/`, then compress:
    ```sh
    node tools/recolour-model.mjs wild-turkey-redline/assets/bike-ai.glb bike.glb --map red=#CBFE00 --map cream=#1A1A1A --map gold=#CBFE00
    node tools/compress-models.mjs bike.glb motogp-acme/assets/bike-ai.glb
    ```
    Run the same two commands for `rider-ai.glb`.
  - `motogp-livewire/`'s rider was made this way.
- **A new, photoreal bike.** `motogp-livewire/` has its own generated bike instead of a repainted one:
  1. In Higgsfield, make a photoreal concept image of the bike in the brand colours: no rider, no text, three-quarter view, plain background.
  2. Turn it into a 3D model with image-to-3D and PBR materials (Hunyuan3D v3 gave the cleanest shapes).
  3. Fit it to the game, fix the paint colour if needed, and compress it:
     ```sh
     node tools/fit-bike.mjs model.glb fit.glb --front +x     # --front: the axis the bike's nose points along
     node tools/recolour-model.mjs fit.glb paint.glb --map lime=#CBFE00
     node tools/compress-models.mjs paint.glb motogp-acme/assets/bike-ai.glb
     ```
  4. Paste the wheel centres that `fit-bike.mjs` prints into `AI.wheels` in `js/bike.js`.
  5. Check the rider's hands, feet and the decals with `?auto=bike&ang=1.57&q=high`.
- **New or bigger 3D models.** Run them through the compressor. It resizes the textures and compresses the geometry. It took the bike from 10.2 MB to 3.6 MB and the rider from 3.5 MB to 1.8 MB.
  ```sh
  node tools/compress-models.mjs big.glb motogp-acme/assets/model.glb
  ```
- **Announcer voice.** The optional lines in `assets/voice/` are off by default (`?voice=1`), and one of them names the Kentucky River Circuit. Re-record them if the circuit or game name changes.
- **Scenery.** The track, hills, river and warehouses are generated in code and are shared by every reskin. Changing the setting, for example a night race or a city circuit, is development work, not config.

# Making the next reskin

Every brand value lives in one file per game: `js/brand.js`. That covers names, colours, fonts, logos, sign copy, corner names, the age gate and the legal lines. A reskin is that file plus new images, followed by a build and a check.

| Start from | When the new game has |
|---|---|
| `motogp-wildturkey/` | a motorbike. It has an age gate and responsible-drinking lines, for alcohol brands. |
| `motogp-livewire/` | a motorbike, with no age gate and no alcohol copy. |
| `f1-livewire/` | an F1 car. It has no age gate and no alcohol copy. |

Never edit those two folders or `wild-turkey-redline/` for a new brand. Copy them.

## Steps

1. **Copy the base folder.** Keep the name lowercase with no spaces, because it becomes the URL.
   ```sh
   cp -R f1-livewire f1-acme
   ```

2. **Add the brand images to `f1-acme/assets/brand/`.** Delete the old brand's images from that folder.

   | File | What it is |
   |---|---|
   | `logo.webp` | The logo as **white artwork on a transparent background**. The game tints it for each trackside board, the gantry and the car. |
   | `logo-ui.webp` | The full-colour logo for the dark menus, HUD and results screen. |
   | `product.webp` | Optional. A product shot for the title screen: transparent background, upright and tightly cropped. |

   - Keep logos under about 1200 px wide.
   - WebP files are a fraction of the size of PNGs.
   - Put the untouched originals in `assets/brand/source/` so the next person has them.

3. **Edit `f1-acme/js/brand.js`.** Every field has a comment. The ones that matter most:
   - **`id`:** must be unique per brand. It keeps leaderboards and settings separate on a shared kiosk.
   - **Names:** `name`, `wordmark`, `game`, `circuit` and `title`.
   - **Colours:** `primary`, `primaryHot`, `light`, `accent` and `dark`. Button text switches between light and dark automatically for contrast.
   - **Car only:** `car`, the livery colours.
   - **Images:** `logo`, `logoUi` and `product` are paths to the files from step 2. Use `null` when there is no image, and the game falls back to the text wordmark.
   - **Copy:** `signs`, the text painted on trackside boards, and `corners`, the corner names.
   - **Age gate and legal lines:** `gate`, `safetyLine` and `regions`. For an alcohol brand, keep the gate on and fill in the responsible-drinking lines. Otherwise set `gate: { on: false }` and `regions: {}`.

4. **Fonts (optional).** Put `.woff2` files in `fonts/` and list them under `fonts.files` in `brand.js`. Then set `fonts.display`, used for headings and the wordmark, and `fonts.condensed`, used for racing numbers and labels.

5. **Build.** This writes the page title and description into `index.html` for link previews, checks that every file named in `brand.js` exists, and prints the folder size against the 10 MB limit.
   ```sh
   node tools/build.mjs f1-acme
   ```

6. **Check.** Run `npm install` in `tools/` once, then:
   ```sh
   node tools/check.cjs f1-acme                   # loads it, passes the gate, checks the title screen
   node tools/check.cjs f1-acme --q low --play    # also starts a race and holds the throttle
   ```
   Both runs must report `"errors": []` and a size under 10 MB. Add `--shots <folder>` to save screenshots.

7. **Play it locally.**
   ```sh
   python3 -m http.server 8131 --directory f1-acme
   ```
   Then open http://localhost:8131/. Opening `index.html` directly from disk won't work.

8. **Publish.** Commit and push. GitHub Pages serves the new folder at `livewire.gamify.com/f1-acme/`.

## When it takes more than config

- **Bike livery.** The bike's and rider's colours are baked into the textures of `assets/bike-ai.glb` and `assets/rider-ai.glb`.
  - Repaint them from the uncompressed originals in `wild-turkey-redline/assets/`, then compress:
    ```sh
    node tools/recolour-model.mjs wild-turkey-redline/assets/bike-ai.glb bike.glb --map red=#CBFE00 --map cream=#1A1A1A --map gold=#CBFE00
    node tools/compress-models.mjs bike.glb motogp-acme/assets/bike-ai.glb
    ```
    Run the same two commands for `rider-ai.glb`.
  - `motogp-livewire/` was made this way.
  - The F1 car has no such files: its livery comes straight from `brand.car`.
- **New or bigger 3D models.** Run them through the compressor. It resizes the textures and compresses the geometry. It took the bike from 10.2 MB to 3.6 MB and the rider from 3.5 MB to 1.8 MB.
  ```sh
  node tools/compress-models.mjs big.glb f1-acme/assets/model.glb
  ```
- **Announcer voice.** The optional lines in `assets/voice/` are off by default (`?voice=1`), and one of them names the Kentucky River Circuit. Re-record them if the circuit or game name changes. The F1 build ships without them.
- **Scenery.** The track, hills, river and warehouses are generated in code and are shared by every reskin. Changing the setting, for example a night race or a city circuit, is development work, not config.

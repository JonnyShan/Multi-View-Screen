# Wild Turkey WILD RIDE (reskin build)

A time-attack motorcycle racing game branded for Wild Turkey. The player rides one timed lap of the fictional Kentucky River Circuit at golden hour.

This is a reskinnable copy of `wild-turkey-redline/` (which stays untouched). Every brand value is in `js/brand.js`. To make another brand from it, see `WORKFLOW.md` at the repo root.

## Run it

It has no build step. It uses Three.js r160, vendored, with plain ES modules. Serve the folder over HTTP; opening the file from disk won't work.

```bash
python3 -m http.server 8131 --directory motogp-wildturkey
# open http://localhost:8131/
```

## What's different from `wild-turkey-redline/`

- **One brand file.** `js/brand.js` holds the names, colours, fonts, logos, sign copy, corner names, age gate and legal lines. `js/skin.js` applies them to the page before the game loads.
- **One-tap age gate on first load.** "Are you over 18?" with Yes and No.
  - Yes goes to the title screen and is remembered for the browser session.
  - No shows a short "sorry" screen, then leaves for the regional responsible-drinking site.
  - With `?kiosk=1`, every new player gets the gate, and No returns to the gate after a few seconds.
- **Background blur while riding.** Scenery beyond about 100 m softens, and is fully blurred by 360 m, so the eye stays on the bike and the road ahead.
  - Tuned in `BACKDROP_BLUR` in `js/config.js`. `?blur=0` turns it off.
  - It runs on the Ultra, High and Balanced graphics tiers.
- **Brand assets from the client folder** in `assets/brand/`, with the originals in `assets/brand/source/`:
  - `logo.webp` is the white artwork used on the trackside boards and gantry.
  - `logo-ui.webp` is the full-colour logo for the menus and HUD.
  - `bottle.webp` is the title-screen pack shot: the supplied Wild Turkey 101 photo (`source/wild-turkey-101.webp`), cropped to 388 × 1200 px.
  - The loading screen shows the same bottle small and slowly turning (`product.spin` in `brand.js`, drawn by `js/loaderbottle.js`).
- **Compressed models.** The bike and rider are 3.6 MB and 1.8 MB, down from 10.2 MB and 3.5 MB. Textures are resized, and the geometry is quantised and meshopt-compressed with `tools/compress-models.mjs`. The game decodes it with `vendor/meshopt/`.

## URL options

| Param | Effect |
|---|---|
| `?kiosk=1` | Kiosk mode: hides the cursor and asks every new player the age question. |
| `?gate=0` | Skips the age gate, for testing only. |
| `?blur=0` | Turns the background blur off. |
| `?voice=1` | Plays the announcer lines, which are muted by default. |
| `?q=ultra\|high\|mid\|low` | Forces a graphics tier. The Performance (`low`) tier uses the procedural bike instead of the 3D models. |

## Size

7.4 MB on disk, under the 10 MB limit. `node tools/build.mjs motogp-wildturkey` reports it.

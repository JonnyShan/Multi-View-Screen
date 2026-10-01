# Livewire HOT LAP (bike reskin)

A time-attack motorcycle racing game branded for Livewire. The player rides one timed lap of the fictional Livewire Raceway at golden hour.

It's the same game as `motogp-wildturkey/`, reskinned through `js/brand.js`, with its own photoreal bike in Livewire colours. See `WORKFLOW.md` at the repo root for how to make the next one.

## Run it

```bash
python3 -m http.server 8131 --directory motogp-livewire
# open http://localhost:8131/
```

## What's Livewire-specific

- **`js/brand.js`:** Livewire's palette from livewire.group (Neoteric `#CBFE00`, Onyx `#1A1A1A`, Ivory `#F1F1F1`, Serene `#4766FF`), plus names, sign copy and corner names. There is no age gate or alcohol copy.
- **`assets/brand/`:**
  - `logo.webp` is white artwork, used on the boards and the bike's decals.
  - `logo-ui.webp` is lime, used in the menus.
  - The supplied original is in `source/`.
- **Bike (`assets/bike-ai.glb`):** generated for this build with Higgsfield.
  - A photoreal concept (GPT Image 2.5: a lime and gloss-black race bike, no rider, no text) was turned into a 3D model with PBR materials (Hunyuan3D v3 image-to-3D).
  - It was then fitted to the game and repainted to the exact brand lime:
    ```bash
    node tools/fit-bike.mjs hunyuan.glb fit.glb --front +x
    node tools/recolour-model.mjs fit.glb lime.glb --map lime=#CBFE00
    node tools/compress-models.mjs lime.glb motogp-livewire/assets/bike-ai.glb
    ```
  - Its wheel centres are in `AI.wheels` in `js/bike.js`. The tyres get a matte rubber material there, because the generated maps made them as glossy as the paint.
- **Rider paint (`assets/rider-ai.glb`):** repainted from Wild Turkey red and cream to lime and black with `tools/recolour-model.mjs`:
  ```bash
  node tools/recolour-model.mjs wild-turkey-redline/assets/rider-ai.glb rider.glb --map red=#CBFE00 --map cream=#1A1A1A --map gold=#CBFE00
  ```
- **Picture look:** the `look` block in `js/brand.js` makes the picture brighter, glossier and crisper than the Wild Turkey build.
- **Fonts:** Barlow Condensed (free). Livewire's own fonts, GT Flexa and Aktiv Grotesk, are commercial; see `fonts/LICENSE.md`.

The background blur while riding, the graphics tiers and the URL options all work as in `motogp-wildturkey/`. The age gate is off in `brand.js`; `?gate=1` forces it on.

## Open items

- The game name "HOT LAP" and the trackside copy are placeholders to confirm.

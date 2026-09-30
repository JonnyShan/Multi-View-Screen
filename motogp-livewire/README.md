# Livewire HOT LAP (bike reskin)

A time-attack motorcycle racing game branded for Livewire. The player rides one timed lap of the fictional Livewire Raceway at golden hour.

It's the same game as `motogp-wildturkey/`, reskinned through `js/brand.js`, with the bike's paint repainted to the Livewire colours. See `WORKFLOW.md` at the repo root for how to make the next one.

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
- **Bike and rider paint:**
  - Repainted from Wild Turkey red and cream to lime and black with `tools/recolour-model.mjs`:
    ```bash
    node tools/recolour-model.mjs wild-turkey-redline/assets/bike-ai.glb bike.glb --map red=#CBFE00 --map cream=#1A1A1A --map gold=#CBFE00
    ```
  - Then compressed with `tools/compress-models.mjs`.
- **Fonts:** Barlow Condensed (free). Livewire's own fonts, GT Flexa and Aktiv Grotesk, are commercial; see `fonts/LICENSE.md`.

The background blur while riding, the graphics tiers and the URL options all work as in `motogp-wildturkey/`. The age gate is off in `brand.js`; `?gate=1` forces it on.

## Open items

- The game name "HOT LAP" and the trackside copy are placeholders to confirm.

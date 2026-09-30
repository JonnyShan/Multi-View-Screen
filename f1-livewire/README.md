# Livewire HOT LAP (F1 reskin)

A time-attack Formula racing game branded for Livewire. The player drives one timed lap of the fictional Kentucky River Circuit at golden hour in an F1 car.

It's built from the RED LINE bike game, sharing the track, scenery, timing, ghost, HUD and leaderboard. Every brand value is in `js/brand.js`. To make another brand from it, see `WORKFLOW.md` at the repo root.

## Run it

It has no build step. It uses Three.js r160, vendored, with plain ES modules. Serve the folder over HTTP; opening the file from disk won't work.

```bash
python3 -m http.server 8131 --directory f1-livewire
# open http://localhost:8131/
```

## What's different from the bike game

- **The car.** A current-shape F1 car is built in code by `js/car.js`: nose, wings, halo, sidepods, floor, suspension and a driver's helmet. It has no model files, so it adds almost nothing to the download.
  - Its livery comes from `brand.car`: black body, Livewire lime and white.
  - The race number comes from `riderNumber`.
  - The logo goes on the sidepods, engine cover and rear wing.
  - The front wheels steer, the car dives under braking and squats under power, and the plank sparks at top speed.
- **Handling.** The physics model is the bike game's (`js/physics.js`), retuned in `TUNE` (`js/config.js`):
  - 2.6 g of cornering grip.
  - Faster steering response.
  - Harder braking.
  - 340 km/h top speed.
  - 8 gears.
  - A V6 engine note.

  The pace-setter ghost and medal times are simulated with the same physics when the game loads, so they always match the car.
- **HUD.** A cornering-G gauge replaces the lean gauge, and the controls read "steer" and "race".
- **Cameras.** The chase camera is longer and lower for the car. The onboard camera is a T-cam above the driver.
- **No alcohol content.** It has no age gate, no responsible-drinking copy and no announcer lines.

## Open items

- **Placeholder names.** The game name "HOT LAP" and the trackside copy are placeholders to confirm.
- **Brand colours and typeface.** The colours come from the supplied logo (lime `#CCFF00`, near-black ink); the official values and typeface are still to confirm.
- **Logo.** The supplied logo is in `assets/brand/source/`. `logo.webp` is white artwork, used on the boards and the car; `logo-ui.webp` is lime, used in the menus.

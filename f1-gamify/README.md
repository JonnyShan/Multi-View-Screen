# Gamify HOT LAP (F1 car)

A time-attack F1 racing game on the fictional Gamify Raceway, the 8th Gamify core game. It is the Gamify bike game (`motogp-gamify/`) with the bike swapped for the procedural F1 car that Claude Code built on 30 Sep 2026 (`f1-livewire/` at commit 9e26850, retired the same day). Everything else (track, scenery, ghost, worldwide leaderboard, share card, brand packs) is the current bike build.

## What changed from the bike build
- `js/car.js` (from 9e26850): the F1 car built in code, no model files. Livery from `BRAND.car` (body, accent, trim, carbon); the brand logo goes on the sidepods, engine cover and rear wing; the race number from `riderNumber`.
- `js/config.js` TUNE: 2.6 g cornering grip, faster steering, 24 m/s² braking, about 340 km/h, 8 gears, V6 engine note.
- `js/physics.js`: no wheelies or stoppies.
- `js/main.js`: car cameras (longer, lower chase cam; T-cam onboard), car sparks and tyre smoke, no model download or turning loader model.
- `js/hud.js` and `index.html`: cornering G gauge, "Race", "How to drive", steer wording.
- `js/brand.js`: save and leaderboard key `gamify_f1_v1` (packs: `<id>_f1_v1`), share link `demos.gamify.com/racing/`.
- Announcer: the bike line "Brilliant riding!" is left out; the other lines are brand and vehicle free.

## Brand packs
Same as the bike: `brands/<id>/brand.json`, picked with `?brand=<id>`. Smallest pack: `{ "name", "accent", "logo" }`; an optional `"dark"` sets the car body colour (Volt uses navy `#0B1F3A`).

## Run it
```bash
python3 -m http.server 8131
# open http://localhost:8131/f1-gamify/
```

# Assets

Every file shipped with the game, its source and licence.

| File | Source | Licence |
|---|---|---|
| Teko font (`@fontsource/teko`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |
| Chakra Petch font (`@fontsource/chakra-petch`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |
| Barlow font (`@fontsource/barlow`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |

All models, textures and sounds are currently generated in code at runtime (placeholders). No third-party art or audio ships.

## Dropping in art

Put files in these paths and they replace the placeholders automatically (the dev server notices new files; a build copies them to `dist/game-assets/`):

| Path | Used for | Notes |
|---|---|---|
| `models/bike/bike.glb` | the superbike | nodes `wheel_f`, `wheel_r` spin; `fork` steers; `light_head_l`, `light_tail_l`, `seat` optional |
| `models/rider/rider.glb` + `models/rider/animations/*.glb` | the rider | clips named `idle`, `run`, `ride`, `slash`, `shoot`, `jump`, `land`, `fall`; `hand_r` bone holds the katana and gun |
| `models/cars/{sedan,suv,limo,police,civ-hatch,civ-ute,civ-van}.glb` | cars | instanced; one draw call per material; paint tint comes from the material |
| `models/props/{palm,lamp,bench,busstop,barrier,fence}.glb` | street furniture | instanced; palms are scaled to each palm's height |
| `audio/sfx/<name>.ogg`, `audio/music/music.ogg` | sounds | names: engine, gun, enemyGun, slash, screech, impact, crash, explosion, rain, phone, siren, thunder, cash, pop, cut, click, whistle, horn |

Conventions from the brief: GLB, Y up, metres, forward +Z, pivot at ground centre. Models are scaled by 8 on load (8 units = 1 m). Missing files are logged with `console.info` and the placeholder stays.

Add a row to the table at the top for every file you add, with its source and licence.

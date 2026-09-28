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
| `audio/sfx/<name>.ogg`, `audio/music/music.ogg` | sounds | names: engine, gun, enemyGun, slash, screech, impact, crash, explosion, rain, phone, siren, thunder, cash, pop, cut, click, whistle, horn, hit |
| `audio/voice/<id>.mp3` (or `.m4a`, `.ogg`) | the handler on the phone | played through a phone line filter; lines and ids below |

Conventions from the brief: GLB, Y up, metres, forward +Z, pivot at ground centre. Models are scaled by 8 on load (8 units = 1 m). Missing files are logged with `console.info` and the placeholder stays.

The single-page build (`pnpm build:artifact`) has no side files, so it carries every file here inline as base64 (a third bigger). It refuses to build past 15.5 MB.

## Handler lines

What each voice file says (the source of truth is `VOICE_LINES` in `src/audio/voice.ts`; a test checks every brief names its target and places):

| Id | Plays | Line |
|---|---|---|
| `brief-rane` | answering contract 1 | Got a job for you. Viktor Rane. They call him the Accountant. Black sedan, meeting at the Casino Strip. Take him before he reaches the Harbour Docks. |
| `brief-kasai` | answering contract 2 | Next one. Lena Kasai. Mother Hen. Armoured white SUV, and her escort shoots. She meets at the Neon Market. Don't let her reach the Old Temple. |
| `brief-ormond` | answering contract 3 | This is the big one. Judge Ormond. The Magistrate. Stretch limo, two escorts, and they'll try to ram you. He meets at the Old Temple. Stop him before the Rail Yard. |
| `done-1`, `done-2` | target down (alternating) | Clean work. Money's on its way. / It's done. You've been paid. |
| `fail-escaped` | target got away | They got away. Stay by the phone. |
| `fail-died` | you died on a job | You went down out there. Job's off. I'll call you. |

Add a row to the table at the top for every file you add, with its source and licence.

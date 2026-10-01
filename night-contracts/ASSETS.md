# Assets

Every file shipped with the game, its source and licence.

| File | Source | Licence |
|---|---|---|
| Teko font (`@fontsource/teko`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |
| Chakra Petch font (`@fontsource/chakra-petch`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |
| Barlow font (`@fontsource/barlow`) | Google Fonts via Fontsource | SIL Open Font License 1.1 |
| `models/rider/rider.glb` | Generated for this game with Higgsfield on the owner's account (30 Sep 2026). Concept image: GPT Image 2.5 (job `7f4b1d5a`). Mesh, rig and idle: Meshy v7 image to 3D (job `33cb4a31`). Clips: Meshy rigging, run `82c5235d`, walk `df7ce4dd`, jump `8683e3f5`, slash `3fef6de1`, fall `60a61888`. Processed with `tools/art/rider.mjs` | Higgsfield generation, see note below |
| `models/bike/bike.glb` | Generated with Higgsfield as above. Concept image: GPT Image 2.5 (job `5e127cff`). Mesh: Tripo H3.1 image to 3D (job `0a7593bd`). Processed with `tools/art/bike.mjs` | Higgsfield generation, see note below |
| `models/cars/sedan.glb` | Generated with Higgsfield as above. Concept image: GPT Image 2.5 (job `769be4b5`). Mesh: Hunyuan3D v3 image to 3D (job `3322d796`). Processed with `tools/art/car.mjs sedan` | Higgsfield generation, see note below |
| `models/cars/suv.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `b59ced40`). Mesh: Hunyuan3D v3 image to 3D (job `a8fd974c`). Processed with `tools/art/car.mjs suv` | Higgsfield generation, see note below |
| `models/cars/limo.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `fec61211`). Mesh: Hunyuan3D v3 image to 3D (job `809112ef`). Processed with `tools/art/car.mjs limo` | Higgsfield generation, see note below |
| `models/cars/police.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `72b25503`). Mesh: Hunyuan3D v3 image to 3D (job `3e6b2dc7`). Processed with `tools/art/car.mjs police` (adds `light_bar_l` on the roof bar for the flashers) | Higgsfield generation, see note below |
| `models/cars/civ-hatch.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `c038ecbe`). Mesh: Hunyuan3D v3 image to 3D (job `e0c9c909`). Processed with `tools/art/car.mjs hatch` | Higgsfield generation, see note below |
| `models/cars/civ-ute.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `92315e5b`). Mesh: Hunyuan3D v3 image to 3D (job `0b823d3e`). Processed with `tools/art/car.mjs ute` | Higgsfield generation, see note below |
| `models/cars/civ-van.glb` | Generated with Higgsfield (1 Oct 2026). Concept image: GPT Image 2.5 (job `ee3368c6`). Mesh: Hunyuan3D v3 image to 3D (job `fc04cd85`). Processed with `tools/art/car.mjs van` | Higgsfield generation, see note below |

The generated models are original designs: the prompts asked for an original character and, for the bike and cars, no logos, badges or text. The 3D generator invented the backs of the cars and gave some of them made-up plate text, lettering and plain badge dots (no real brand). `tools/art/car.mjs` paints those out of the colour maps (the `blank` boxes in its `CARS` table). The police livery is a plain two-tone with no words or crest. Their use is governed by Higgsfield's terms for the owner's plan: confirm those allow commercial use before a store release. Everything else (buildings, props, people, sounds) is generated in code at runtime. No third-party audio ships.

## Making models (`tools/art`)

The raw generator files are not committed (tens of MB each). Re-run a script on a raw file to rebuild a game model:

| Script | Does |
|---|---|
| `node tools/art/bike.mjs raw.glb` | scales to metres, stands it on the ground, cuts the wheels out onto their axles (`wheel_f`, `wheel_r`), adds `seat`, `light_head_l`, `light_tail_l`, `grip_l/r`, `peg_l/r` |
| `node tools/art/rider.mjs base.glb idle run=run.glb walk=walk.glb ...` | keeps the base file's mesh and skeleton and retargets each clip file onto it (clips from different auto rigs line up by bone name) |
| `node tools/art/car.mjs <model> raw.glb [--back back.png]` | scales and centres, cuts one wheel out as a template plus four axle empties, adds lamp empties and far versions (`body_lod1`, `wheel_lod1`), and paints out made-up marks on the back. Each model's numbers live in the script's `CARS` table; `--back` writes a gridded view of the back (10 cm squares) for placing the `blank` boxes |
| `node tools/art/measure.mjs raw.glb [rotY] [headY]` | measures a raw car for that table: length, centre, axles and wheel size from the tyres touching the ground, tail lamps from the red at the back, the nose at headlight height |

The bike and rider scripts replace the generated metal and roughness maps with ones painted from the colour map (the generated ones made the rider solid chrome and the bike patchy mirror metal). Every script drops material extensions that need the costlier physical material, shrinks colour maps to 1024 JPEG and the other maps to 512, and writes meshopt compressed geometry (EXT_meshopt_compression, decoded by the game's loader; normals, UVs and skin weights quantized, positions kept as floats so axles and mount points stay put). `node tools/glbview.mjs model.glb out` renders a model from six angles.

## Dropping in art

Put files in these paths and they replace the placeholders automatically (the dev server notices new files; a build copies them to `dist/game-assets/`):

| Path | Used for | Notes |
|---|---|---|
| `models/bike/bike.glb` | the superbike | nodes `wheel_f`, `wheel_r` spin; `fork` steers; `light_head_l`, `light_tail_l`, `seat` optional; `grip_l/r` and `peg_l/r` place the rider's hands and feet |
| `models/rider/rider.glb` + `models/rider/animations/*.glb` | the rider | Mixamo style bone names (`Hips`, `Spine02`, `Spine01`, `Spine`, `neck`, `Head`, `LeftArm`, `LeftForeArm`, `LeftHand`, `LeftUpLeg`, `LeftLeg`, `LeftFoot`, `LeftToeBase`, and the right side); clips named `idle`, `walk`, `run`, `jump`, `slash`, `fall`. Riding and the roof crouch are posed in code against the bike's grips, pegs and seat; the katana and gun are the code-built ones |
| `models/cars/{sedan,suv,limo,police,civ-hatch,civ-ute,civ-van}.glb` | cars | instanced; one draw call per material; paint tint multiplies the colour map, so paint the body white. Optional nodes: `body`, `body_lod1` (far), `wheel`, `wheel_lod1` (a template drawn at the empties `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`), `light_head_l`, `light_tail_l`, and on the police car `light_bar_l` (top of the roof bar near its left end; a negative x puts the red flasher on the right) |
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

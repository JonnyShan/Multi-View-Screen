# Hoops 1v1

A 1-on-1 half-court basketball game for phones, built with three.js. Open `index.html` from any static web server.

## What's in it

- **Arena**: a 3D half court with glossy floor reflections, a verlet-cloth net, a rim and glass that the ball physically bounces off, LED boards and a shot clock. The stands, crowd and hardwood are photo textures.
- **Branding**: Livewire (livewire.group). Your team, the arena boards, the court and the UI use Livewire's yellow `#CBFE00` and black, its wordmark and its mark (`BRAND` in `js/data.js`, `img/logo-livewire.png`, `img/livewire-mark.png`). Your player's kit, the cover art and the portrait were recoloured from the original teal kit by `raw/hardwood/recolor_livewire.py`, so the chest lettering still carries the old team name.
- **Players**: two fictional players, Morrow (you, Livewire) and Varga (CPU). Each body is a textured, rigged 3D model made from a generated full-body photo. Models ship as glTF JSON plus a JPEG texture (`models/`). If a model fails to load, a built-in body is used instead. The data for six more players is still in `js/data.js`, but there is no picker for now.
- **Motion**: running, walking, backpedalling, defensive slides, stances and jumps come from motion-capture clips (`models/motion.json`). The clips are blended by speed and direction and retargeted onto each body. A procedural rig handles what the library doesn't cover: dribbling, shooting, layups, dunks, steals, and arm IK that keeps the hands on the ball.
- **Gameplay**: timed jump shots with a release meter, layups and dunks, crossovers, spins and step-backs, steals, blocks, rebounds, a 12-second shot clock, clearing the ball, and games to 11. The front screen has one button: Start.
- **Audio**: recorded sound effects generated with ElevenLabs (`sfx/`):
  - an arena crowd bed that swells with excitement
  - an "ooooh" build-up whenever someone rises to shoot or drives
  - two layered crowd roars when you score, which get bigger on threes and dunks
  - groans when you miss or the CPU scores
  - the net swish, the backboard bang, rim clanks, the dribble and the dunk slam

  Sneaker squeaks and the buzzer are still synthesised with WebAudio. If a sound file fails to load, a synthesised version plays instead.

## Controls

| Action | Touch | Keyboard |
| --- | --- | --- |
| Move | Drag on the left half; push to the edge to sprint | WASD / arrows, Shift to sprint |
| Shoot / Block / Jump | Big orange button: hold, then release at the top of the jump | J or Space |
| Move / Steal | Grey button | K |
| Pause | Top-left button | — |

## Files

- `js/main.js`: renderer, quality tiers, menus, camera, loop
- `js/game.js`: rules, possessions, shooting model, moves, steals, blocks, HUD
- `js/ai.js`: CPU offense and defense
- `js/player.js`: procedural rig and animation, IK, and retargeting onto the skinned models
- `js/motion.js`: the motion-capture layer (clip blending by speed and direction, jump time-warping)
- `js/ball.js`: ball physics and the net cloth
- `js/arena.js`: court, markings, reflections, stands, hoop
- `js/audio.js`: sound playback (recorded crowd and ball sounds, synthesised fallbacks)
- `js/input.js`, `js/data.js`

## Art

The images and models were generated with Higgsfield: the arena crowd panorama, hardwood texture, team logos, player portraits, cover art, and the player models (full-body reference, then image-to-3D with auto-rigging). The motion clips come from the Higgsfield (Meshy) animation library. They were baked to per-bone rotation deltas by `raw/hardwood/anim/convert_clips.py`, which is kept outside the repo. All teams and players are fictional.

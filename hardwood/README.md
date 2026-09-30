# Hardwood 1v1

A 1-on-1 half-court basketball game for phones, built with three.js. Open `index.html` from any static web server.

## What's in it

- **Arena**: a 3D half court with glossy floor reflections, a verlet-cloth net, a rim and glass that the ball physically bounces off, LED boards and a shot clock. The stands, crowd and hardwood are photo textures.
- **Players**: 8 fictional stars from a fictional league. Each body is a textured, rigged 3D model made from a generated full-body photo. The models are driven live by a procedural animation rig with arm IK, so hands stay on the ball. Models ship as glTF JSON plus a JPEG texture (`models/`). If a model fails to load, a built-in body is used instead.
- **Gameplay**: timed jump shots with a release meter, layups and dunks, crossovers, spins and step-backs, steals, blocks, rebounds, a 12-second shot clock, clearing the ball, and games to 11 or 21. There are four CPU difficulty levels.
- **Audio**: synthesised with WebAudio. It covers crowd noise, the dribble, rim, glass, net, sneaker squeaks and the buzzer.

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
- `js/ball.js`: ball physics and the net cloth
- `js/arena.js`: court, markings, reflections, stands, hoop
- `js/audio.js`, `js/input.js`, `js/data.js`

## Art

The images and models were generated with Higgsfield: the arena crowd panorama, hardwood texture, team logos, player portraits, cover art, and the player models (full-body reference, then image-to-3D with auto-rigging). All teams and players are fictional.

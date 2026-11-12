# Gamify HOT LAP (bike reskin)

A time-attack motorcycle racing game branded for Gamify. A copy of `motogp-livewire/`, reskinned through `js/brand.js` (the one theme file). The Livewire folder is untouched.

## What's Gamify-specific
- `js/brand.js`: name Gamify, circuit Gamify Raceway, accent electric blue `#1F82D0` (replaces the lime), graphite primary, Gamify orange as the second highlight. Leaderboard off (the shared Worker answers only one other site), so best laps stay on the device.
- `assets/brand/logo-ui.webp`: the full Gamify logo (seven-dot mark in its own colours, white wordmark) for the menus and HUD. `assets/brand/logo.webp`: the same artwork in white, tinted per use on boards and decals.
- `assets/bike-ai.glb`, `assets/rider-ai.glb`: base-colour textures repainted lime to Gamify blue.
- Announcer: the two intro lines named the old circuit, so they were re-recorded on 12 Nov 2026 with the same ElevenLabs voice (British Football Announcer, eleven_v3): "Welcome to Gamify Raceway! One lap, flat out. Let's see what you've got." and "It's hot lap time here at Gamify Raceway. Beat the ghost, beat the clock!" (about 290 credits for two takes of each; loudness matched to the other lines). The other 17 lines are brand-free (checked by transcription).

## Run it
```bash
python3 -m http.server 8131 --directory motogp-gamify
```

# Licences

Third-party and generated assets used by the games in this repo. New assets get a line here when they enter the repo. The file was started with the crowd audio; the earlier generated assets (the Higgsfield players, crowd atlas, pitch texture and intro art) are described in the design spec but not yet listed here.

## Livewire Cricket (`cricket.html`)

### Audio
| Asset | Licence | Source | Use |
|---|---|---|---|
| Stadium crowd murmur, 20 s seamless loop | **Not CC0.** ElevenLabs-generated audio. Use is under ElevenLabs' terms for Jonny's plan (not checked here: confirm before anything public beyond Livewire's own work) | Generated with ElevenLabs Sound Effects v2 (`eleven_text_to_sound_v2`) on Jonny's ElevenLabs workspace, 2 Oct 2026, flow "Gridiron crowd sounds" (0LrmLsEUwC7gYWTyozvh). Copied unchanged (128 kbps MP3) from the vault, `03 - Gamify/Game Studio/Sports Mock-up Games/Shared Audio/` ("Stadium Crowd Sounds.md") | `assets/audio/stadium-crowd-loop-20s.mp3`: the crowd under the game |
| Stadium crowd cheer, 6 s | **Not CC0.** ElevenLabs-generated audio, same terms as above | Same flow and vault folder as above | `assets/audio/stadium-crowd-cheer-6s.mp3`: the roar on sixes, fours, wickets you take and a win |

| Match sounds, 9 clips: bat crack, edge, stumps, fielders' "Howzat!", crowd swell, crowd "ohhh", crowd gasp, air horn, heartbeat loop | **Not CC0.** ElevenLabs-generated audio, same terms as above | Generated with ElevenLabs Sound Effects v2 (`eleven_text_to_sound_v2`) on Jonny's ElevenLabs workspace, 2 Oct 2026, flow "Livewire Cricket sounds" (oYql8fHiCJfgbPu5BESM). Best take of three to seven each; trimmed, levelled and re-encoded (MP3, the heartbeat as WAV so it loops without a gap) | `assets/audio/bat-crack.mp3`, `bat-edge.mp3`, `stumps.mp3`, `howzat.mp3`, `crowd-swell.mp3`, `crowd-ohh.mp3`, `crowd-gasp.mp3`, `air-horn.mp3`, `heartbeat-loop.wav` |
| Commentator calls, 9 lines | **Not CC0.** ElevenLabs-generated speech (Multilingual v2, `eleven_multilingual_v2`) in the ElevenLabs Voice Library voice "Viraj – Famous Sports Commentator Voice with Power & Modulation" (voice id PdJQAOWyIMAQwD7gQcSc), a library voice shared by its owner. Use is under ElevenLabs' terms and the voice's library terms for Jonny's plan (not checked here: confirm before anything public beyond Livewire's own work) | Same flow as above, 2 Oct 2026. Best take of three each; trimmed, levelled, MP3 | `assets/audio/call-six-1.mp3`, `call-six-2.mp3`, `call-four.mp3`, `call-caught.mp3`, `call-bowled.mp3`, `call-last-ball.mp3`, `call-win.mp3`, `call-lose.mp3`, `call-tie.mp3` |

The crowd murmur and cheer also ship, re-encoded smaller, in Livewire Gridiron (`JonnyShan/livewire-gridiron`, `public/audio/`). The other sounds in the game (keeper's gloves, ball bounce, whoosh, tick, the stand-in crowd noise, and the old bat and stumps sounds used until the clips load) are synthesised at runtime with Web Audio.

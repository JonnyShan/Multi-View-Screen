# Licences

Third-party and generated assets used by the games in this repo. New assets get a line here when they enter the repo. The file was started with the crowd audio; the earlier generated assets (the Higgsfield players, crowd atlas, pitch texture and intro art) are described in the design spec but not yet listed here.

## Livewire Cricket (`cricket.html`)

### Audio
| Asset | Licence | Source | Use |
|---|---|---|---|
| Stadium crowd murmur, 20 s seamless loop | **Not CC0.** ElevenLabs-generated audio. Use is under ElevenLabs' terms for Jonny's plan (not checked here: confirm before anything public beyond Livewire's own work) | Generated with ElevenLabs Sound Effects v2 (`eleven_text_to_sound_v2`) on Jonny's ElevenLabs workspace, 2 Oct 2026, flow "Gridiron crowd sounds" (0LrmLsEUwC7gYWTyozvh). Copied unchanged (128 kbps MP3) from the vault, `03 - Gamify/Game Studio/Sports Mock-up Games/Shared Audio/` ("Stadium Crowd Sounds.md") | `assets/audio/stadium-crowd-loop-20s.mp3`: the crowd under the game |
| Stadium crowd cheer, 6 s | **Not CC0.** ElevenLabs-generated audio, same terms as above | Same flow and vault folder as above | `assets/audio/stadium-crowd-cheer-6s.mp3`: the roar on sixes, fours and a win |

The same two sounds ship, re-encoded smaller, in Livewire Gridiron (`JonnyShan/livewire-gridiron`, `public/audio/`). Every other sound in the game (bat crack, edge, gloves, stumps, whoosh, the stand-in crowd noise) is synthesised at runtime with Web Audio.

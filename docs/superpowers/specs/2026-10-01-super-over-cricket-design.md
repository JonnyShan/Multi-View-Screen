# Super Over Showdown: Mobile Cricket Game Design Spec

**Date:** 2026-10-01
**Status:** Playable prototype (`cricket.html`), design open for review

## Concept

This is a **phone-first**, portrait, one-thumb cricket game (also playable on desktop with the mouse) built around the **super over**, cricket's real tie-breaker format: 6 balls and 2 wickets per side. Both halves use the same gesture: swipe up from the bottom of the screen to the middle.

1. **Bat.** Swipe up so your thumb reaches the gold line across the middle of the screen at the same moment as the ball. Your timing decides the power. A perfect hit sends a six into the stands, followed by a chase camera.
2. **Bowl.** The game flips and you defend your score. The camera looks down the pitch from the bowler's end with the batter's stumps in the middle of the screen. Swipe up to them as fast as you can and stop right on them. Your swipe speed sets the pace, and where your thumb stops is where the ball arrives.

A match lasts about 3 minutes. The real super-over rules give us the scoring for free.

## Market research (Oct 2026)

Install figures are Play Store counts; sizes are approximate. "[U]" marks a figure the research couldn't verify.

| Game | Installs | Size | Batting control | What players complain about |
|---|---|---|---|---|
| Cricket League (Miniclip) | ~235M | ~110–220 MB | Swipe, with a timing bar | Disconnects, pay-to-win |
| Real Cricket (Nautilus/KRAFTON) | ~82M | 1.6 GB iOS | Shot buttons and a meter, or swipe | Ad overload, connection stalls |
| WCC3 (Nextwave) | ~43M | 1.4 GB iOS | Joystick, swipe and a meter | Forced ads after every over, lag |
| Hitwicket | ~20M | ~0.5–0.8 GB | Tap, with odds shown | Rigged or pay-to-win feel |
| Stick Cricket Super League | ~16M | 88 MB iOS | Tap left or right | Thin bowling, no live head-to-head |

**Gaps we can own**

- Console-like looks at a small download. The best-looking games are 1.2–1.9 GB.
- **Instant play from a link.** Google Play Instant shut down in Dec 2025, so instant play on Android now means the web.
- **No forced ads**, and **fair asynchronous play** (ghost replays) instead of live PvP that drops out.
- **Portrait, clip-ready presentation.** Cricket clips from EA Cricket 07 and Big Ant games already circulate as vertical video.

**Controls**

Stick Cricket's tap-the-side scheme is the best-loved arcade control. Reviewers favour **one gesture with clear early/perfect/late feedback**. The biggest frustration is a "perfect" shot that still finds a fielder, so **perfect timing must always reward**.

## Locked prototype scope

- **File:** `cricket.html` at the repo root. It is a single file with no build step, following the `delivery3d.html` pattern.
- **Engine:** Three.js r160 as an ES module from jsdelivr. Everything else is procedural: textures, crowd, audio, stadium. The only download is three.js, about 185 KB gzipped.
- **Platform:** phone first. Phones held upright play full screen with touch. Desktops, laptops and landscape tablets get the same game in a phone-shaped portrait frame, where a mouse drag does the swipe. The layout and controls are identical. A phone held sideways gets a "Turn your phone upright" screen. On touch devices, Play also asks for fullscreen and a portrait lock where allowed.

## Systems

### Batting: swipe to the line
- The AI bowler mixes yorkers, full, good-length and short deliveries. It adds swing, seam and the occasional slower ball. Pace rises through the over.
- The batting camera is aimed at the contact point, so the ball reaches the bat at the gold line in the middle of the screen.
- A swipe has to start in the bottom part of the screen. The moment of the hit is when the thumb crosses the middle line. That moment is interpolated between touch samples, using coalesced pointer events and their timestamps, not the frame time.
- The perfect moment is when the ball's on-screen position crosses that same line, kept inside the batter's hitting area:

  | Timing | Result |
  |---|---|
  | ±45 ms | Perfect: always a six, with a chase cam |
  | ±90 ms | Great: a long ball that can be six, four or caught in the deep |
  | ±140 ms | Good: along the ground |
  | ±190 ms | Edge: often caught behind |

- The swipe angle aims the shot: up-left goes to leg, up-right to off. Early pulls it squarer and late runs it finer.
- Swipe speed adds power: a faster swipe hits a perfect six further.
- Crossing the line before the ball is bowled is ignored, so you can retry.
- A bounce marker flashes where the ball pitches, as a learning aid.
- **The batter's technique.** The batter's poses were taken from 10 AI reference photos of real batting technique (stance, backlift, straight drive, lofted-drive finish, pull, pull finish, square cut, forward defence, leave and slog finish). Each photo shows one moment from two camera angles. MediaPipe Pose measured the joints, and the keyframes were tuned against the photos side by side. The photos and the joint measurements are in `assets/players/batting-refs/`.
  - The batter strides as your thumb starts up the screen: forward to a full ball, back to a short one.
  - At the line he plays the shot that matches where the ball goes:
    - a vertical-bat drive for straight and cover;
    - a square cut behind point;
    - a pull through the leg side;
    - a forward block for defence.
  - Lofted hits finish with the bat high over the shoulder; along-the-ground hits finish lower.
  - The boots are planted by IK, and both gloves are solved onto the bat handle with the fingers wrapped round it.

### Ball physics and fielding
- The flight sim uses gravity, light drag, bounce and roll. A six is a ball that crosses the 66 m rope on the full; a four crosses it after bouncing.
- The ball can land in the stands or hit the LED boards.
- There are 10 fielders plus the bowler, each with a reaction time, speed and reach. Catches and stops come from the physics, not a dice roll.
- Runs come from how long it takes to collect the ball and throw it in.

### Bowling: swipe to the stumps
- The aiming view is a zoomed bowler's-eye view, with the batter's stumps dead centre inside a gold crosshair.
- **Speed.** Swipe speed is measured from touch-down until the thumb settles where it stops, so pausing to adjust costs pace. It maps to 90–153 km/h.
- **Placement.** Where the thumb stops is cast onto the plane of the stumps. The game then solves the length and line so the ball arrives at exactly that point.
- **Stop on the stumps** and the ball hits them. On the stumps, the faster the ball, the more likely it bowls the batter (about 30% at 90 km/h, about 90% at 153 km/h).
- **Miss the stumps** and how close you were, plus your pace, sets how dangerous the ball is. Too far wide is called a wide.
- A readout confirms each delivery, for example "153 KM/H · Dead centre" or "118 KM/H · Outside off".

### Juice
- Hit-stop on a perfect hit: a split-second freeze at impact. The ball then flies at full speed, followed by a chase camera. (An earlier stepped slow motion made the ball seem to bounce off the air.)
- When a six lands:
  - the crowd jumps
  - the LED boards and ribbon switch to "SIX"
  - the floodlights strobe
  - fireworks go off
  - confetti bursts where the ball lands in the stands
- Umpire signals for six, four, out and wide. LED stumps and bails flash red.
- Synthesised bat crack and crowd roar, plus haptics on Android.

### Stadium and crowd
- **Crowd:** about 34k seated fans drawn as camera-facing cards from an AI-generated atlas (see "Crowd" below). On sixes, fours and wickets they jump out of their seats to cheer, then sit back down a few at a time. On the title screen they stand as the wave passes.
- **Stands:** seat rows and aisle steps are painted onto the terraces in a shader, so empty seats read as seats.
- **Sky and lights:** a navy night sky with a haze lit by the floodlights just above the roof, and faint beams from each floodlight bank to the middle.
- **Pitch:** an AI-generated, tileable photo of rolled clay (fine cracks and dry grass) is multiplied over the painted pitch as surface detail, about 1.5 m per tile (`assets/pitch/pitch-detail.webp`, 70 KB).
- **Bat and stumps:** the bat is a shaped willow blade (flat face, rounded edges, a spine down the back, sloping shoulders) with a Livewire sticker running down the face, a rubber grip and a few red ball marks. The LED stumps carry the Livewire wordmark with neon bands.
- **Hit zone:** the neon hit line and the bounce ring disappear the moment you swing, or once the ball is past if you don't.

### Performance
- The crowd is one draw call of instanced cards, and twinkling phone torches are one more.
- Off-screen 3D players are culled, so they skip both the main and the shadow pass. Each player is tested as a 1.5 m sphere around their waist.
- The game measures its frame rate. Below 45 fps it drops bloom, render resolution and shadow resolution, and draws 60% of the crowd.
- An on-screen readout in the bottom-right corner shows the current frame rate, the average since Play, the slowest frame of the last 2 s, and the quality tier (HQ or LQ). It is there for phone testing; add `?nofps` to the URL to hide it.

## Livewire branding (first branded edition)

- **Palette:** Onyx `#1A1A1A`, Ivory `#F1F1F1` and Neon `#CCFF00`, sampled from the Livewire brand sheet. Neon is the accent throughout the UI: buttons, the hit line, the crosshair and sixes.
- **Logos:** the wordmark, lockup and logomark were cut from the brand sheet as white masks (`assets/livewire/*-mask.png`). They are embedded in `cricket.html` and tinted in code to any brand colour.
- **Top ring:** an LED band under the roof edge runs neon Livewire logomarks and wordmarks, with neon light strips above and below. It strobes when a six is hit.
- **Bottom ring:** the boundary boards and the band between the two tiers cycle Livewire wordmark, lockup and "Super Over Showdown" panels. They switch to SIX, FOUR and WICKET boards on those events.
- **Kits:** your team (Livewire) wears onyx with neon, and the rivals wear royal blue (`#2563EB`) with onyx trim and white pads. The umpire wears a pink shirt.
- **Rest of the stadium:** the crowd wears the brand colours, the big screen has a Livewire header, and the title screen shows the Livewire lockup.

## 3D player pipeline

1. **Concept image.** Generated on Higgsfield with GPT Image 2.5, using the Livewire logomark as a reference. The result is a front-view, A-pose batter in Livewire kit with the logomark on the chest (`assets/players/livewire-batter-concept.jpg`).
2. **3D model.** Meshy 7 image-to-3D on Higgsfield, with textures, PBR and an automatic humanoid skeleton. Settings: A-pose, about 15k triangles, 1.8 m tall. It produces a 24-bone, Mixamo-style rig (Hips, Spine, LeftArm and so on).
3. **Optimisation** with gltf-transform:
   - The material's metalness is set to 0 and its emissive map removed, because Meshy exported it fully metallic and self-lit.
   - The texture goes from 2048 px PNG to 1024 px WebP.
   - File size drops from 6.9 MB to 1.4 MB.
   - The texture is then moved out of the model into its own file beside it (`assets/players/livewire-batter.glb` plus `livewire-batter.webp`). The game loads it as a plain image, the same way as the crowd atlas. A texture packed inside a `.glb` is decoded through a `blob:` fetch. The Claude artifact viewer's security policy blocks that fetch, so every player rendered untextured white there.
4. **In the game:**
   - The model loads after the first frame, so the title screen isn't held up.
   - The existing capsule rig still runs every animation (swing keyframes and arm IK) but is hidden. Each frame, the model's skeleton copies it:
     - the hips, spine and head copy their orientation;
     - the arms and legs are aimed along the capsule's limbs.
   - The bat stays on the capsule's grip. The batters' arms are solved onto the handle with their own arm lengths, and their legs onto the pose's foot positions.
   - If the model fails to load, the capsule players are used instead.
   - **Motion capture.** Four clips from the Meshy animation library, applied through Higgsfield's rigging tool at 8 credits each: Idle, RunFast, Over_Shoulder_Throw and Victory_Cheer. `assets/players/motions.json` (400 KB, 120 KB gzipped) holds each clip's rig and keys. At load, every clip is retargeted onto every model: each bone keeps the clip's change in world orientation from its bind pose, and the hips' movement is scaled to the player's height.
     - Fielders stand in the idle clip between balls, sprint (speed-matched) when they chase, and throw the ball in after fielding it, holding it until the arm whips through.
     - The bowler sprints in on the run clip with the ball in his hand, then hands over to the procedural delivery stride.
     - The whole fielding side celebrates a wicket.
     - The umpire idles between signals.
     - Batting, the delivery stride, keeping, the ready crouch and umpire signals stay procedural so they keep matching the ball. Each switch blends over 0.22 s.
5. **Cast.** There are five models covering every player on the field. Each role is shown only when its side is on screen:

| Model | Plays while you bat | Plays while you bowl |
|---|---|---|
| `livewire-batter.glb` (onyx and neon, logomark on the chest) | your striker and non-striker | your keeper |
| `rival-batter.glb` (royal blue and onyx, white pads) | the rivals' keeper | their striker and non-striker |
| `rival-bowler.glb` (royal blue and onyx, no helmet or pads) | the bowler and the 9 fielders | |
| `livewire-fielder.glb` (onyx and neon, logomark on the chest) | | your bowler and the 9 fielders |
| `umpire.glb` (pink shirt, white hat) | the umpire | the umpire |

   The later concepts used the Livewire batter or rival bowler as a style reference, so all five match. The fielder and umpire models are lighter (about 10k triangles) because they are usually far from the camera.

   **Recolouring.** The rivals were first generated in ivory, which read as plain white on the field. Their kit was recoloured in the texture instead of regenerating the models, which keeps their rigs and costs nothing.
   - Each texture pixel is labelled with the body part it belongs to, using each triangle's strongest bone.
   - The cloth-white pixels on the shirt, sleeves and trousers (and the umpire's grey shirt) take the new colour, scaled by their old brightness so the folds stay.
   - Pads below the knee, gloves, boots, skin and black trim are left alone.
   - The scripts are in `assets/players/kit-recolor/`.

**Cost:** about 234 Higgsfield credits for the five player models (46.75 each: concept image 2.75, 3D model 44), plus 32 for the four motion clips and 27.5 for the ten batting reference photos.

## Crowd

1. **Sprite sheets.** GPT Image 2.5 on Higgsfield, at 4K with a transparent background:
   - Two sheets of 16 seated spectators each, every one in their own black stadium seat, in natural poses: leaning forward, arms crossed, drinks, hot chips, filming, pointing, chatting, a child on a lap, a foam finger, a neon wig. Most wear dark evening clothes, with Livewire neon and ivory team shirts mixed in. One cell came back empty, so there are 31 fans.
   - Two more sheets used those as references and show the same fans jumping out of their seats to cheer.
   - The four sheets cost 17 credits. They replace the first round's standing fans (8.5 credits).
2. **Atlas.** `assets/crowd/build-atlas.py` cuts each fan out:
   - It keeps only the region connected to the fan, which drops bits of neighbouring fans.
   - It scales every sheet to real size, using about 1.28 m for a seated head and 1.72 m for a standing one.
   - It puts the seat legs or feet on the bottom edge of each cell, and bleeds colour into the transparent edges so mipmaps stay clean.
   - Seated cells are 0.95 m × 1.6 m and cheering cells 1.1 m × 2.3 m. The result is a 1136 × 1992 WebP, about 380 KB (`assets/crowd/fans.webp`).
3. **In the game:**
   - Each seat gets a random fan, mirrored half the time, with its own height, brightness and timing.
   - Light falls off toward the back of each tier and under the roof.
   - Distant stands fade slightly into a blue-grey haze and lose a little saturation.
   - A small mip bias softens the fans the way a broadcast lens does.
   - The cards turn to face the camera about the vertical axis.
   - A mip-aware alpha test keeps distant fans from thinning out.
   - If the atlas can't load (for example over `file://`), the old box crowd stays.

## Recommendations to make it great

1. **Keep perfect sacred.** A perfect hit is always a big, guaranteed six. Use replays to show players why a "great" hit got caught, because that is the top complaint in the category.
2. **Make the stadium shot the product.** Show distance plus a row-and-seat number. Add "roof shot" and "out of the ground" milestones. Run a 3-second auto replay you can export as a vertical clip with the score overlaid. This is the growth loop.
3. **Run a daily challenge.** One seeded over a day, the same for everyone, like Wordle. Show a shareable emoji ball log (6️⃣4️⃣•🟥) and friend leaderboards.
4. **Use asynchronous head-to-head.** Bat against a friend's recorded bowling and bowl at their ghost batter. This keeps the fairness of a real opponent without disconnects.
5. **Add depth slowly.** Unlock footwork (advance or back) and a loft toggle after 10 matches, and spin bowling with drift and turn later. Day, dusk and night stadiums plus weather give visual variety at little cost.
6. **Monetize without forced ads.** Use cosmetics (bats, kits, stadium skins, six celebrations), a season pass and an optional "continue" ad. Never put an interstitial between overs or sell power for money. Ads after every over are the category's main complaint.
7. **Plan the tech path.**
   - Keep the web build. It is the instant-play front door for link shares, YouTube Playables (under 15 MiB, interactive in 5 s) and Discord or Telegram mini-apps.
   - For store builds, either wrap the web build with Capacitor, or move to Unity 6 (the category norm) or PlayCanvas when you need mocap animation.
   - Ship about 15 MB to first tap, then stream stadium and player detail as KTX2 textures and compressed glTF.
8. **Buy art, not code.** Use mocap packs (Mixamo, Rokoko, Move.ai) for batting and bowling animations, a stadium kit from the Unity Asset Store or Sketchfab, and crowd sound from a library.

## Known prototype limits

- Every player is a generated 3D model. Fielding, running, throwing and celebrating use motion capture. The batting swing is keyframed from reference photos rather than captured, and the bowling stride is still code-driven.
- The crowd is flat cards. They hold up at broadcast distance but look flat if the camera gets within a few metres of the stands.
- There are no running animations between wickets, no LBW, no no-balls or free hits, and no left-handers.
- Timing feel was verified headless (SwiftShader) for logic only, with real touch events checked separately. It needs tuning on real phones: touch latency, the speed-to-km/h curve, and how big the stumps target should be.

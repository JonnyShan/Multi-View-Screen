# Super Over Showdown: Mobile Cricket Game Design Spec

**Date:** 2026-10-01
**Status:** Playable prototype (`cricket.html`), design open for review

## Concept

This is a **phones-only**, portrait, one-thumb cricket game built around the **super over**, cricket's real tie-breaker format: 6 balls and 2 wickets per side. Both halves use the same gesture: swipe up from the bottom of the screen to the middle.

1. **Bat.** Swipe up so your thumb reaches the gold line across the middle of the screen at the same moment as the ball. Your timing decides the power. A perfect hit sends a six into the stands with a slow-motion chase camera.
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
- **Platform:** phones only. Desktops and tablets get a "Grab your phone" screen, and phones held sideways get a "Turn your phone upright" screen. On Android, Play also asks for fullscreen and a portrait lock where allowed. Adding `?anydevice` to the URL skips the gate for development.

## Systems

### Batting: swipe to the line
- The AI bowler mixes yorkers, full, good-length and short deliveries. It adds swing, seam and the occasional slower ball. Pace rises through the over.
- The batting camera is aimed at the contact point, so the ball reaches the bat at the gold line in the middle of the screen.
- A swipe has to start in the bottom part of the screen. The moment of the hit is when the thumb crosses the middle line. That moment is interpolated between touch samples, using coalesced pointer events and their timestamps, not the frame time.
- The perfect moment is when the ball's on-screen position crosses that same line, kept inside the batter's hitting area:

  | Timing | Result |
  |---|---|
  | ±45 ms | Perfect: always a six, with a slow-motion chase cam |
  | ±90 ms | Great: a long ball that can be six, four or caught in the deep |
  | ±140 ms | Good: along the ground |
  | ±190 ms | Edge: often caught behind |

- The swipe angle aims the shot: up-left goes to leg, up-right to off. Early pulls it squarer and late runs it finer.
- Swipe speed adds power: a faster swipe hits a perfect six further.
- Crossing the line before the ball is bowled is ignored, so you can retry.
- A bounce marker flashes where the ball pitches, as a learning aid.

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
- Hit-stop on a perfect hit, then slow motion and a chase camera.
- When a six lands:
  - the crowd jumps
  - the LED boards and ribbon switch to "SIX"
  - the floodlights strobe
  - fireworks go off
  - confetti bursts where the ball lands in the stands
- Umpire signals for six, four, out and wide. LED stumps and bails flash red.
- Synthesised bat crack and crowd roar, plus haptics on Android.

### Performance
- About 14k instanced fans that bob in a vertex shader, and twinkling phone torches.
- The game measures its frame rate. Below 45 fps it drops bloom, render resolution and shadow resolution.

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

- Characters are capsule rigs, not skinned and motion-captured. The crowd is boxes.
- There are no running animations between wickets, no LBW, no no-balls or free hits, and no left-handers.
- Timing feel was verified headless (SwiftShader) for logic only, with real touch events checked separately. It needs tuning on real phones: touch latency, the speed-to-km/h curve, and how big the stumps target should be.

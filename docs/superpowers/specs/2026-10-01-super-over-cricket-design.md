# Super Over Showdown: Mobile Cricket Game Design Spec

**Date:** 2026-10-01
**Status:** Playable prototype (`cricket.html`), design open for review

## Concept

This is a portrait, one-thumb cricket game built around the **super over**, cricket's real tie-breaker format: 6 balls and 2 wickets per side.

1. **Bat.** The ball is bowled at you and you tap to hit it. Your timing decides the power. A perfect hit sends a six into the stands with a slow-motion chase camera.
2. **Bowl.** The game flips and you defend your score. You pick a line and length, choose a delivery type, and then lock your release on a meter.

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
- **Platform:** portrait first. Landscape and desktop still work, with Space as the tap.

## Systems

### Batting
- The AI bowler mixes yorkers, full, good-length and short deliveries. It adds swing, seam and the occasional slower ball. Pace rises through the over.
- The sim is slowed to about 0.85 s of ball travel for touch input. The speed readout shows real-world km/h.
- The timing window is measured from the pointer event's `timeStamp`, not the frame time:

  | Timing | Result |
  |---|---|
  | ±40 ms | Perfect: a lofted six with a slow-motion chase cam |
  | ±85 ms | Great: a long ball that can be six, four or caught in the deep |
  | ±135 ms | Good: along the ground |
  | ±185 ms | Edge: often caught behind |

  Yorkers and fast balls shrink these windows.
- Tapping the left or right side of the screen aims the shot towards leg or off. Early timing pulls the shot squarer and late timing runs it finer.
- A bounce marker flashes where the ball pitches, as a learning aid. A "Pro" setting could hide it.

### Ball physics and fielding
- The flight sim uses gravity, light drag, bounce and roll. A six is a ball that crosses the 66 m rope on the full; a four crosses it after bouncing.
- The ball can land in the stands or hit the LED boards.
- There are 10 fielders plus the bowler, each with a reaction time, speed and reach. Catches and stops come from the physics, not a dice roll.
- Runs come from how long it takes to collect the ball and throw it in.

### Bowling
- You drag to place a target on the pitch. Coloured length bands show yorker, full, good, back of a length and short.
- There are three delivery types:
  - **Pace:** fast with a wide sweet spot.
  - **Swing:** moves away late, with a narrower sweet spot.
  - **Slower:** a big bonus if the last ball was quick.
- The release meter adds scatter, so a bad release becomes a half-volley or a wide.
- The AI batter weighs how dangerous the delivery is: its length, its line, and how much it differs from the last ball. Repeating a spot gets punished. It also weighs the required rate and how aggressive it needs to be. Physics then decides the actual result.

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
- Timing feel was verified headless (SwiftShader) for logic only. It needs tuning on real phones, especially iPhone touch latency.

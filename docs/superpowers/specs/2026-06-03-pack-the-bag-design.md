# Pack the Bag — Uber Eats Stacking Game

**Date:** 2026-06-03
**Status:** Design approved (pending spec review)
**Deliverable:** Single self-contained `pack-the-bag.html` in repo root (matches `index.html`, `route-rush.html`, `delivery3d.html` pattern).

## 1. Concept

A Tetris-style stacking game reskinned for Uber Eats. Food pieces fall into a paper bag (the well). The player moves, rotates, and drops them. **Unlike Tetris, completed rows do NOT clear — locked food stays in place.** The goal is to pack the bag from the bottom to the top as densely as possible.

Brand framing: "get good at stacking food into bags." The skill is **packing density** — since rows never clear, gaps fill the bag fast and messy; tight packing fits more food and earns a higher grade.

## 2. Core mechanic

- Pieces fall under gravity. Player controls move/rotate/drop. Piece locks on landing.
- **No line clearing.** Locked cells are permanent.
- A completed full row glows Uber-green ("Bag packed!") and awards bonus points, but **stays on screen**.
- Round ends when the stack reaches the top (a piece locks in the top 2 rows, or a new piece can't spawn). Topping out is the **win / round-end**, not a failure — positive framing for a brand game. There is no harsh "Game Over"; every round ends in a graded delivery.

## 3. Scoring & win screen

- **Efficiency %** is the headline metric: `efficiency = 1 - holes / cellsUpToStackTop`, where a *hole* is an empty cell with at least one filled cell above it in the same column, and `cellsUpToStackTop` is every cell from the highest filled row down to the floor.
- **Points:** soft drop +1/cell, hard drop +2/cell, lock +10, completed row +100.
- **Win screen** ("Order delivered!"): pieces placed, bags packed (completed rows), efficiency %, and a star grade:
  - ★★★ ≥ 90% efficiency
  - ★★ ≥ 75%
  - ★ ≥ 60%
  - below 60% → "Messy pack — try again" (still shows %, no stars)
- **Persistence:** best score and best efficiency saved to `localStorage` (same pattern as `index.html`'s `ivg_counts`). Key: `ptb_best`.

## 4. Pieces (7 tetrominoes, food-reskinned)

| Tetromino | Food | Base color |
|---|---|---|
| I (1×4) | Sub sandwich | tan `#d9a86c` |
| O (2×2) | Egg carton | white/yolk `#f5f0e6` / `#f7c948` |
| L | Banana | yellow `#ffd23f` |
| J | Milk bottle | blue/white `#cfe8ff` |
| S | Burger | brown/green `#8a5a2b` |
| Z | Fries | red `#e23b3b` |
| T | Drink cup | teal `#2ec4b6` |

Each piece has a **sprite painter** that draws a recognizable food motif across the piece's cells with a chunky black outline (the chunky-outlined look of the reference image). Exact art is an implementation detail; per-cell motif + unified piece outline is acceptable.

The **well itself** is styled as an Uber Eats paper bag (brown panel, folded-top look, "Uber Eats" wordmark) so completing the fill reads as "bag packed, out for delivery."

## 5. Layout (mobile-first, vertical iPhone)

Full-viewport flex column, portrait:

```
┌─────────────────────┐
│  HUD: score · bags  │  ~12% height
│  best · ★ · mute    │
├─────────────────────┤
│                     │
│   BAG (canvas)      │  flex: fill remaining
│   8 cols × 16 rows  │  cell = floor(min(availW/8, availH/16))
│   centered          │  next-piece preview shown top-right of HUD
│                     │
├─────────────────────┤
│  ◀   ⟳   ▶    ⬇    │  ~14% height, touch buttons
└─────────────────────┘
```

- Grid **8 × 16** (~0.5 aspect ≈ iPhone portrait). Cell px computed from available space so the bag always fits the screen with no scroll.
- Desktop: same column centered, `max-width: 480px`, side gutters; touch buttons still shown but keyboard also active.
- Recompute cell size on resize / orientation change.

## 6. Controls

- **Desktop keyboard:** ← → move, ↑ rotate CW, ↓ soft drop (hold to repeat), Space hard drop, P pause.
- **Mobile touch:** on-screen buttons `◀ ▶` (move, auto-repeat on hold), `⟳` (rotate), `⬇` (hard drop). Optional swipe: swipe-down = hard drop, tap playfield = rotate. Buttons are the primary, reliable path.

## 7. Sound

WebAudio blips, reusing the `ding()` oscillator pattern from `index.html`:
- rotate: short high tick
- lock: low thunk
- row complete: rising 3-note arpeggio
- win: short jingle

Mute toggle in HUD, persisted.

## 8. Code structure (one file, logically separated units)

| Unit | Responsibility | Depends on |
|---|---|---|
| `PIECES` | 7 shape matrices + food color/painter spec | — |
| `Board` | 2D grid; `get/set`, `collides(piece)`, `fullRows()`, `countHoles()`, `stackTop()` | — |
| `Piece` | type, matrix, x/y; `moved(dx,dy)`, `rotated(dir)` (returns new state, pure) | PIECES |
| `rotateWithKicks` | try piece rotation against Board with wall-kick offsets `[0,-1,+1,-2,+2]` | Board, Piece |
| `Renderer` | draw bag, grid, locked cells, current piece, ghost, next preview; per-food painters | Board, PIECES |
| `Input` | map keys + touch buttons + swipe → actions | Game |
| `Game` | state machine (start/playing/paused/won), gravity tick, lock, spawn, row-complete glow, win check, score, efficiency | all above |
| `Sound` | WebAudio blips, mute | — |
| `Storage` | load/save best score & efficiency (`localStorage` `ptb_best`) | — |

State machine: `START → PLAYING ⇄ PAUSED → WON → (restart) START`.

Render: `requestAnimationFrame` loop. Gravity on a fixed interval (e.g. 700ms, unaffected by frame rate); soft/hard drop bypass it.

Rotation: simple matrix rotation + basic wall kicks (SRS-lite). No T-spin / 180 handling (YAGNI).

## 9. Out of scope (MVP)

- Hold piece
- Increasing gravity speed / levels (fixed fall speed is fine; round is short)
- Multiplayer / leaderboard server (localStorage only)
- Photo-realistic assets
- Sound music track

## 10. Success criteria

- Loads as a single file, no build step, no external assets, no network calls.
- Fills a vertical iPhone screen (portrait) with no scroll; bag + HUD + buttons all visible.
- Pieces spawn, move, rotate (with wall kicks), soft/hard drop, and lock correctly.
- Completed rows glow green and **persist** (never clear).
- Topping out ends the round and shows efficiency %, bags packed, and star grade.
- Best score/efficiency persists across reloads.
- Playable with keyboard (desktop) and touch buttons (mobile).

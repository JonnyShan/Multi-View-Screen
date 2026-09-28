# VEC Quiz Playable: build log

Date: 28 Sep 2026
Built by: Claude Code (cloud session), for Gamify
Code: `JonnyShan/Multi-View-Screen`, branch `claude/funny-newton-efsdch`, folder `vec-quiz/`
Pull request (draft): https://github.com/JonnyShan/Multi-View-Screen/pull/15
Copy this file to `~/Brain/03 - Gamify/Game Studio/VEC Quiz Playable/BUILD LOG.md` (the vault is not reachable from the cloud session).

## Read first: what this build could not see

- **The brief was not available.** `~/Brain/03 - Gamify/Game Studio/VEC Quiz Playable/CLAUDE CODE BRIEF - VEC Quiz Engine.md` lives on your Mac. The cloud container has no `~/Brain`, and it is not in Google Drive or any connected repo. I rebuilt the spec from your task prompt plus the Livewire email thread "Playable Brief - VIC Gov VEC FY27" (17 to 28 Sep) and Livewire's 27 May playables answers.
  - Section 1 layout: **reconstructed**, see README "Layout". Not the brief's.
  - Section 9 QA checklist: **reconstructed**, see `docs/QA.md`. Not the brief's.
  - Section 10: followed as stated in your prompt (unknown client detail = config hook with an empty value).
- **The census reference build was not read.** `reference/census_playable_reference.html` is also on your Mac. Fetching the live Census build (the CloudFront link in Anthony's email) was blocked by this session's permission classifier, so I did not pursue it. The MRAID layer and review chrome were written from scratch; nothing from the ABS build (branding, copy or code) is in this repo.
- **Repo location.** The container can only push to this session's repo and branch, so the project is `Multi-View-Screen/vec-quiz/` (symlinked at `~/Projects/vec-quiz` inside the container). `git subtree split --prefix vec-quiz` lifts it into its own repo with history.

To reconcile: drop the brief and `census_playable_reference.html` into `vec-quiz/docs/` and ask me to diff the build against sections 1, 9 and 10.

## Preview

- **Local (recommended):** check out the branch, then `cd vec-quiz && npm install && npm run preview` and open http://localhost:4173/review.html (playable at /index.html, MRAID harness at /harness.html). `npm run dev` adds rebuild on save.
- **In the Claude app:** `dist/review.html` and `dist/index.html` were sent to you in this session. Both are single self contained files and render inline.
- **Source:** https://github.com/JonnyShan/Multi-View-Screen/tree/claude/funny-newton-efsdch/vec-quiz
- **No hosted preview URL was created.** You said not to share anything externally, and hosting the page would publish it. Say the word and I will set one up.

## What was built (your priorities, in order)

| # | Priority | Status |
| --- | --- | --- |
| 1 | Content model and engine, languages and client details added by dropping in JSON | Done. `content/quiz.json` (structure) plus `content/<code>.json` per language; `config/client.json` holds every client detail with empty hooks; pure state machine in `src/js/engine.js` |
| 2 | English end to end on placeholder content | Done. 5 placeholder questions (4, 4, 4, 3 and 2 answers), one question at exactly 90 characters and answers at exactly 30 |
| 3 | Review page | Done. `dist/review.html`: 8 test viewports side by side, language and screen controls, RTL mirror and max length modes, overflow outlines, copy table with counts, client gaps, build checks, event log, deep links |
| 4 | Single file build, inlined subset fonts, ad zip guard | Done. `dist/index.html` 50.0 KB (English), zip 27.5 KB. Six script fixture build: 159 KB. Noto fonts pinned by version and sha512, subset per language, OFL notice kept inside each font |
| 5 | sheet2json and limit checks | Done. XLSX or CSV, template or loose layouts, errors by cell (for example `I14: Arabic "q3" is 97 characters; the limit is 90.`). Client template in `sheets/` (xlsx and csv, generated from config) |
| 6 | MRAID harness and reporting hooks, Worker shipped but disabled | Done. MRAID ready, viewable and exposure handling, `mraid.open` CTA, mock MRAID 3.0 harness; reporting off by default; Cloudflare Worker plus D1 schema in `worker/`, inert until enabled in three places |

Runtime is vanilla HTML, CSS and JS with no dependencies. Tooling is Node only (esbuild, subset-font, playwright-core as dev dependencies).

## QA checklist results (reconstructed section 9)

`npm run qa`, 28 Sep 2026, from a clean state: **PASS 28, FAIL 0, BLOCKED 7, NOT RUN 2.**

| # | Check | Result | Detail |
| --- | --- | --- | --- |
| A1 | Copy passes structure and limit checks | PASS | 0 errors; English placeholder, other five languages have no copy yet |
| A2 | No en dashes anywhere in the repo | PASS | source, config, content, docs and dist scanned |
| A3 | Unknown client details are empty hooks, not guesses | PASS | 24 empty hooks in config/client.json, plus Mandarin and Cantonese script |
| A4 | Unit tests | PASS | 51 passed, 0 failed |
| B1 | Single file, no external requests | PASS | index.html 50.0 KB, playable-mraid.html 50.1 KB |
| B2 | Fonts subset per language, every character covered | PASS | six script fixture build: Latin 9.8 KB, Simplified Chinese 6.6 KB, Traditional Chinese 6.9 KB, Arabic 8.1 KB, Devanagari 12.6 KB per weight, 2 weights |
| B3 | Zip structure | PASS | vec-quiz-ad.zip 27.5 KB |
| B3b | Zip within the placement size limit | BLOCKED | limit unknown until the placement specs arrive |
| B4 | Deterministic build | PASS | byte identical rebuild |
| B5 | Release build refuses placeholder copy and empty client details | PASS | refused with 15 blockers, as it should today |
| C1 | Loads clean at every test viewport | PASS | no console errors, failed or external requests, 8 viewports |
| C2 | English end to end | PASS | all right "You got 5 out of 5", all wrong "You got 0 out of 5", replay works |
| C3 | CTA and clickTag | PASS | uses the ad server clickTag; with no URL set shows a dev notice and goes nowhere |
| C4 | Placeholder copy fits every viewport and screen | PASS | 8 viewports x 12 screens |
| C5 | Copy padded to every limit still fits | PASS | all phone, tablet and landscape viewports. Note: the 300x250 MPU stress frame overflows on 3 screens at max length; only matters if an MPU is booked |
| C6 | Tap targets at least 44 x 44 px | PASS | measured with 0.5 px tolerance (buttons are exactly 44 px at the smallest sizes) |
| C7 | Keyboard operation | PASS | |
| C8 | Reduced motion | PASS | |
| D1 | Picker, six languages, each label in its own inlined font | PASS | fixture text, not client copy |
| D2 | Arabic mirrors right to left | PASS | dir rtl, logo right, progress left, text start aligned, Next on the left |
| D3 | Every language renders with inlined fonts only | PASS | Chromium platform font report, no system fallback |
| D4 | Every script fits phone, tablet and landscape viewports | PASS | fixture text |
| D5 | RTL mirror mode on English fits | PASS | |
| E1 | MRAID: ready, viewable, one view event, `mraid.open` CTA | PASS | 0 views before ready, 0 after ready, 1 after viewable twice |
| E2 | Web fallback | PASS | |
| E3 | Reporting ships disabled: zero network requests | PASS | 8 events recorded locally, 0 requests |
| E4 | Reporting when enabled | PASS | text/plain posts with language, question, answer, correctness and score |
| F1 | Review page renders and reports fit for every frame | PASS | 8 of 8 |
| F2 | Review deep links | PASS | |
| G1 | Real devices (iOS Safari, Android WebView) | NOT RUN | no devices in this environment |
| G2 | CM360 upload and DV360 approval | NOT RUN | needs Livewire's CM360 account; nothing was shared |
| G3 | Client copy in six languages, real Arabic, Hindi and Chinese | BLOCKED | copy and translations not received (were due 24 Sep) |
| G4 | Logo, colours, fonts, contrast | BLOCKED | brand assets not received |
| G5 | Placement sizes, zip limit, backup image | BLOCKED | "similar to the Mac's campaign", specs not received |
| G6 | CTA destination | BLOCKED | not received |
| G7 | Authorisation statement | BLOCKED | open question |
| G8 | Mandarin and Cantonese scripts | BLOCKED | asked 21 Sep, not confirmed |

What went wrong on the way and was fixed before the final run: sheet2json reported the template's optional empty rows (answers 3 and 4, question 5) as missing copy; button font sizes were overridden by a reset rule; `margin: 0` cancelled centring on wide screens; Arabic text was shrunk by the fit pass (tall font metrics); flex was clipping end screen text at 300x250 instead of letting the fit pass scale it. Two QA harness bugs (offscreen iframe throttling, a same page hash navigation) were test side and are fixed too.

## Assumptions (one line each)

- Sure: six languages are English plus Mandarin, Cantonese, Vietnamese, Arabic and Hindi (Livewire 17 Sep, your 21 Sep email).
- Sure: limits are 90 per question, 30 per answer, up to 4 answers, up to 5 questions (your 21 Sep email).
- Sure: end screen is score plus CTA with no data capture, and per language reporting matters (Livewire 17 Sep).
- Guessing: delivery is CM360 or DV360 HTML5 and/or in app MRAID, based on Livewire's 27 May answer for playables in general; both variants are built and nothing in config asserts it.
- Guessing: UI string limits (picker title 40, CTA 22 and so on) are my proposals, not yet agreed.
- Guessing: replay returns to the language picker, and feedback waits for a Next tap (both in config/engine.json).
- Guessing: characters are counted as Unicode code points, which matches Excel and Google Sheets.
- Chosen: Noto fonts for every script until brand fonts arrive (SIL OFL, safe to embed).
- Chosen: neutral grey placeholder palette, deliberately not a VEC brand guess.

## Waiting on the client (all empty hooks in config)

Logo (light and dark, SVG) and alt text; brand colours; brand font and web licence; CTA URL; placement DSP, ad server, environment, sizes, zip and HTML limits, backup image; whether an authorisation statement is required; Mandarin and Cantonese scripts; Arabic digits (Western or Arabic Indic); reporting endpoint and campaign id; all copy and translations, including the UI strings.

## Questions for Livewire (drafted here, not sent)

1. Copy: the UI strings need translating too (picker title, progress line, correct and incorrect, Next, See my score, score line, CTA, Play again). `sheets/vec-quiz-copy-template.xlsx` has one row for each, with limits.
2. Confirm Simplified Chinese for Mandarin and Traditional for Cantonese, and whether Traditional should use Hong Kong or Taiwan forms.
3. Placement: sizes, format, DSP, zip size limit, backup image.
4. CTA destination URL.
5. Does the ad need an authorisation statement, and in which languages?
6. Arabic score digits: Western (0 to 9) or Arabic Indic?
7. Reporting: is the client comfortable with anonymous counts posted to a Gamify run endpoint, and whose Cloudflare account hosts it?

## Next steps

1. Reconcile against the brief and the census reference (drop both into `vec-quiz/docs/`).
2. When the sheet arrives: `node tools/sheet2json.mjs <file> --dry-run`, fix anything it flags, run it for real, then `npm run check` and `npm run qa`.
3. Fill `config/client.json` as details arrive; `npm run build:release` must pass before anything goes to Livewire.
4. Device pass on iOS and Android, then a CM360 test upload via Livewire.

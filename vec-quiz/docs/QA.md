# QA checklist

`npm run qa` runs every automated item and writes `dist/qa/qa-report.md`. Items marked
manual need a device, an ad server account or client input.

This checklist was written for the build without access to section 9 of the Claude Code
brief, which was not reachable from the build environment. Reconcile it against the brief
before sign off.

## A. Content and config

| # | Check | How |
| --- | --- | --- |
| A1 | Copy passes structure and limit checks | `npm run check` |
| A2 | No en dashes anywhere in the repo | repo scan in `npm run check` |
| A3 | Unknown client details are empty hooks, not guesses | QA asserts the known unknowns are empty |
| A4 | Unit tests pass | `npm test` |

## B. Build

| # | Check | How |
| --- | --- | --- |
| B1 | Single file: everything inline, no external requests | ad zip guard on both variants |
| B2 | Fonts subset per language, every character covered | fixture build in all six scripts |
| B3 | Zip structure (root index.html, flat, allowed types, CRC) | ad zip guard |
| B3b | Zip within the placement size limit | blocked until the limit is known |
| B4 | Deterministic build | two builds compared byte for byte |
| B5 | Release build refuses placeholder copy and empty client details | `--release` must fail today |

## C. Playable (headless Chromium)

| # | Check |
| --- | --- |
| C1 | Loads with no console errors, failed or external requests at every test viewport |
| C2 | English end to end: answer, feedback, next, score (all right 5/5, all wrong 0/5), replay |
| C3 | CTA uses the ad server clickTag; with no URL set it shows a dev notice and goes nowhere |
| C4 | Placeholder copy fits every test viewport on every screen |
| C5 | Copy padded to every character limit still fits (phones, tablet, landscape) |
| C6 | Tap targets at least 44 x 44 px (0.5 px tolerance for sub pixel rounding) |
| C7 | Keyboard: Tab to answers, Enter answers, focus moves to Next |
| C8 | Reduced motion turns transitions off |

## D. Languages (fixture text in each script, not client copy)

| # | Check |
| --- | --- |
| D1 | Picker lists every language in order, each label drawn with its inlined font |
| D2 | Arabic mirrors right to left (dir, logo, progress, alignment, Next button) |
| D3 | Every language renders with inlined fonts only (Chromium platform font report) |
| D4 | Every script fits every phone, tablet and landscape viewport |
| D5 | RTL mirror mode on English fits |

## E. MRAID and reporting

| # | Check |
| --- | --- |
| E1 | MRAID: waits for ready and viewable, one view event, CTA through `mraid.open` |
| E2 | Web: view event on screen, environment reported as web |
| E3 | Reporting ships disabled: a full playthrough makes zero network requests |
| E4 | Reporting when enabled: text/plain posts with language, question, answer, correctness, score |

## F. Review page

| # | Check |
| --- | --- |
| F1 | Languages with status, every viewport frame renders and reports fit |
| F2 | Deep links restore the state |

## G. Manual or blocked

| # | Check | Needs |
| --- | --- | --- |
| G1 | iOS Safari and Android Chrome WebView | devices |
| G2 | CM360 upload and DV360 approval | Livewire's CM360 account |
| G3 | Client copy in all six languages, real Arabic, Hindi and Chinese | copy and translations |
| G4 | Logo, colours, fonts, contrast | brand assets |
| G5 | Placement sizes, zip limit, backup image | media specs |
| G6 | CTA destination | URL |
| G7 | Authorisation statement | client answer |
| G8 | Mandarin and Cantonese scripts | client confirmation |

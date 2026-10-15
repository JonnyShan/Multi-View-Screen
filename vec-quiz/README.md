# VEC quiz playable

Multilingual quiz playable for the VIC Gov VEC FY27 campaign (Livewire, built by Gamify).
Up to 5 questions, a language picker at the start (English, Mandarin, Cantonese,
Vietnamese, Arabic, Hindi), a score and call to action at the end, and optional per
language reporting.

Vanilla HTML, CSS and JS at runtime with no dependencies. Node is used for tooling only.
Languages and client details are added by dropping in JSON; nothing in `src/` changes.

**Status:** English runs end to end on placeholder copy. Everything the client has not
supplied yet is an empty hook in `config/`, never a guess. See `BUILD LOG.md`.

## Quick start

```sh
npm install
npm run dev        # builds, serves http://localhost:4173/review.html, rebuilds on every change
npm run check      # copy limits, structure, en dash scan, client details still empty
npm test           # unit tests
npm run qa         # the QA checklist (docs/QA.md) in Node and headless Chromium
npm run build      # dist/ only
```

Browser QA needs Chromium once: `npx playwright install chromium`.

## Layout

```
vec-quiz/
  config/
    client.json      client details; every unknown value is empty with a note (never guessed)
    languages.json   language registry: picker order, html lang, direction, font, numerals
    limits.json      copy limits: 90 per question, 30 per answer, 2 to 4 answers, up to 5 questions
    fonts.json       font sources pinned by npm version and sha512
    engine.json      engine behaviour and the test viewports
  content/
    quiz.json        structure shared by all languages: question order, answers, correct answer
    en.json          strings for one language, keyed like the sheet rows (placeholder for now)
  sheets/            copy template for the client (xlsx and csv, generated from config)
  assets/brand/      logo files go here once supplied
  src/
    index.html       playable shell
    styles.css       layout (logical properties, so Arabic mirrors) and the neutral placeholder palette
    js/content.js    content model and validation, shared by the playable and every tool
    js/engine.js     quiz state machine (pure, tested in Node)
    js/view.js       DOM rendering and text fitting
    js/ad-env.js     MRAID layer: ready and viewable, mraid.open, clickTag, web fallback
    js/report.js     reporting hooks (disabled unless config turns them on)
    js/review-hook.js  bridge for the review page (stripped from the ad build)
  review/            review page source
  harness/           MRAID harness source and mock MRAID 3.0 host
  tools/             build, check, sheet2json, zip guard, fonts, dev server, QA
  worker/            Cloudflare Worker for reporting, shipped disabled
  test/              node:test suites
  docs/QA.md         QA checklist
  dist/              build output (committed so a checkout previews without building)
```

## Content model

`content/quiz.json` holds the structure every language shares:

```json
{ "questions": [ { "id": "q1", "answers": ["q1.a1", "q1.a2", "q1.a3", "q1.a4"], "correct": "q1.a2" } ] }
```

`content/<code>.json` holds one language's strings under the same keys, plus the UI keys
listed in `config/limits.json` (`picker.title`, `question.progress`, `button.cta` and so on):

```json
{ "lang": "ar", "placeholder": false, "source": "sheet2json from copy.xlsx", "strings": { "q1": "...", "q1.a1": "..." } }
```

Tokens `{n}`, `{total}` and `{score}` are filled by the engine. Limits count Unicode code
points, spaces included, which is what Excel and Google Sheets show. Every string is set
with `textContent`, so copy can never inject markup.

## Adding a language

1. The six campaign languages are already registered in `config/languages.json`.
2. Drop in `content/<code>.json` (or run sheet2json, below).
3. `npm run check`. A language appears in the picker once its file passes.

Mandarin and Cantonese also need their script: the client has not yet confirmed
Simplified and Traditional, so `script`, `htmlLang` and `font` are empty for `cmn` and `yue`.
The `_pending` note on each says exactly what to set once it is confirmed.

A seventh language needs a registry entry (name, `htmlLang`, `dir`, `font`) and, for a new
script, a font family in `config/fonts.json`.

## Adding client details

Fill the empty values in `config/client.json` as they arrive: logo paths, brand colours,
CTA URL, placement sizes and zip limit, reporting endpoint. `npm run check` lists what is
still empty and which gaps block a release. `npm run build:release` refuses to ship while
copy is placeholder, a language is missing or a required detail is empty.

## sheet2json

```sh
node tools/sheet2json.mjs copy.xlsx --dry-run     # report only
node tools/sheet2json.mjs copy.xlsx               # writes content/ if there are no errors
node tools/sheet2json.mjs copy.csv --map "Simplified Chinese=cmn"
node tools/sheet2json.mjs --template              # regenerates sheets/ from config
```

It reads XLSX (preferred: always UTF-8) or CSV/TSV, finds the header row by its "English"
column, and understands either the template layout (a `Key` column) or a loose layout
(rows labelled "Question 1", "A", "B", or questions ending in "?" with answers below).
The correct answer comes from a `Correct` column (Y, Yes, TRUE, X, 1 or a tick) or a `*`
on the answer. Every problem is reported by cell, for example
`I14: Arabic "q3" is 97 characters; the limit is 90.` Nothing is written while there are
errors unless `--force` is given. Columns named by script ("Simplified Chinese") are not
mapped automatically while the script question is open.

## Build outputs

| File | Use |
| --- | --- |
| `dist/index.html` | The ad. One self contained file: CSS, JS, copy, logo and subset fonts inline. Declares `clickTag` and detects MRAID at runtime. |
| `dist/playable-mraid.html` | Same, with `<script src="mraid.js">` first, for MRAID networks that expect the tag. |
| `dist/vec-quiz-ad.zip` | `index.html` zipped for CM360 or DV360 upload. One zip per size once `placement.sizes` is set. |
| `dist/review.html` | Internal review page. Not for upload. |
| `dist/harness.html` | Internal MRAID harness. Not for upload. |
| `dist/build-report.json` | Sizes, languages, fonts, guard results. |

Fonts are Noto (SIL OFL), fetched from the npm registry by pinned version and sha512,
subset per language to exactly the characters in the copy, and inlined as WOFF2. Each
character is assigned to the language's script font or the Latin fallback; the build
stops if no font covers one. A licensed brand font can replace the Latin family.

## Ad zip guard

Runs on every build and on its own with `npm run zip`. It checks: `index.html` at the
root, no folders, junk or unsupported files, valid CRCs, no external URLs outside the
configured CTA and reporting endpoint, no stray script or stylesheet loads, the right
MRAID tag for each variant, a `clickTag` declaration, `ad.size` per placement size, no en
dashes, and the zip and HTML size limits. While a limit is unknown it reports the size
and says so, and a release build treats that as an error.

## MRAID and reporting

`src/js/ad-env.js` waits for MRAID `ready`, then tracks `viewableChange` and MRAID 3.0
`exposureChange`. The quiz renders immediately either way; only the `view` report and the
picker animation wait for viewability. The CTA uses `mraid.open()` in app, otherwise
`window.open()` with the ad server's `clickTag` when it set one. `dist/harness.html` runs
the MRAID build against a mock MRAID 3.0 host (auto or `?manual=1`).

Every event (`view`, `language_select`, `answer`, `complete`, `cta`, `replay`) goes through
`src/js/report.js`. It is recorded locally for QA and only sent when
`reporting.enabled` is true with an https endpoint. The matching Worker is in `worker/`,
shipped disabled; its README covers enabling it.

## Review page

`dist/review.html` shows every test viewport side by side from one set of controls:
language, screen (picker, each question answered or not, end with any score), an RTL
mirror mode, a max length mode that pads every string to its limit, and overflow
outlines. Tabs show the copy table with character counts, what is still waiting on the
client, the build checks and the reporting event log. State is kept in the URL hash, so a
link reproduces a view.

## Rules

- Unknown client details stay empty until supplied. No guesses, in config or in copy.
- No en dashes anywhere. `npm run check` scans the repo; the build and sheet2json reject them in copy.
- QA fixtures (sample text in each script) live only in `.qa-tmp/`; the build refuses them in `content/`.

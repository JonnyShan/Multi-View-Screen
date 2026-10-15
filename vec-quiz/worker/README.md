# Reporting Worker (disabled)

Livewire asked (17 Sep 2026) for a way to report results after the campaign, broken
out per language. This Worker is that backend. It ships **disabled** and nothing in the
playable talks to it until someone turns it on deliberately.

## What it records

Each quiz event adds 1 to an aggregate row in D1:

| Event | Fields |
| --- | --- |
| `view` | fired once when the ad becomes viewable |
| `language_select` | `lang` (and `auto: 1` when the picker was skipped) |
| `answer` | `lang`, `q` (question id), `a` (answer id), `ok` (1 correct, 0 wrong) |
| `complete` | `lang`, `score`, `total` |
| `cta` | `lang`, `score` |
| `replay` | `lang` |

No IP address, user agent, cookie or identifier is read or stored. Question and answer
ids (`q2`, `q2.a3`) map back to the copy in `content/`.

`GET /report` returns, per language: picker selections, completions, completion rate,
CTA clicks and rate, score distribution, and for each question the answer split and the
share answering correctly. `?format=csv` returns the raw aggregate rows for Excel.

## Turning it on (only once Livewire agrees an endpoint)

1. `npx wrangler d1 create vec-quiz-reporting` and paste the id into `database_id`.
2. `npx wrangler d1 execute vec-quiz-reporting --remote --file=worker/schema.sql`
3. `npx wrangler secret put REPORT_TOKEN` (a long random string, shared only with whoever pulls the report).
4. Add a route (or set `workers_dev = true`), set `ENABLED = "true"`, then `npx wrangler deploy` from `worker/`.
5. In `config/client.json` set `reporting.enabled` to `true`, `reporting.endpoint` to `https://<host>/e`
   and `reporting.campaignId`, rebuild, and check the review page event log shows `sent`.

Things to settle before step 4: who owns the Cloudflare account, whether the client is
comfortable with a third party endpoint in a government creative, and whether a
Cloudflare rate limiting rule should sit in front of `/e` (anyone can post fake events
to a public endpoint, which would skew the numbers but expose nothing).

## Testing

`npm test` exercises validation, the aggregate upsert and the report against an
in-memory D1 stand-in. No Cloudflare account is needed.

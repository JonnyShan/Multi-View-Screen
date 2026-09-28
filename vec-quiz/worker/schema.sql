-- VEC quiz reporting: one aggregate row per day, campaign, event, language, question,
-- answer, correctness, score and environment. No personal data is stored.
-- Apply with: npx wrangler d1 execute vec-quiz-reporting --file=worker/schema.sql
CREATE TABLE IF NOT EXISTS counts (
  day TEXT NOT NULL,
  cid TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT '',
  q TEXT NOT NULL DEFAULT '',
  a TEXT NOT NULL DEFAULT '',
  ok INTEGER NOT NULL DEFAULT -1,
  score INTEGER NOT NULL DEFAULT -1,
  env TEXT NOT NULL DEFAULT '',
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, cid, event, lang, q, a, ok, score, env)
);

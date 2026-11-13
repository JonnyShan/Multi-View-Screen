# Gamify demo leaderboard (Cloudflare Worker + D1)

A copy of `../leaderboard-worker` for the Gamify demo games on demos.gamify.com, kept apart from Livewire's live board so neither touches the other.

- Same API and checks as the Livewire one (`GET /top`, `POST /lap`, `POST /report`).
- Only accepts laps from `https://demos.gamify.com`, `https://jonnyshan.github.io` and `localhost`.
- Worker name `gamify-leaderboard`, D1 database `gamify-leaderboard`, binding `DB`. Free tier.
- Used by the Gamify golf (`game: gamify_golf`) and motorbike (`gamify_motogp_v1`) builds once its address is in their brand files.

Deploy with the dashboard: create D1 `gamify-leaderboard`, run `schema.sql` in its Console, create Worker `gamify-leaderboard`, paste `worker.js`, Deploy, then add the D1 binding `DB` and Deploy again.

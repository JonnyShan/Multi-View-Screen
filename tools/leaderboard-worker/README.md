# Worldwide leaderboard (Cloudflare Worker + D1)

A tiny server that keeps the best lap per set of initials for every phone and kiosk. The games call it when
`leaderboard.url` is set in their `js/brand.js`; until then each device keeps its own board.

- `worker.js`: the API.
  - `GET /top?game=<brand id>&limit=10` returns `[{ n, t }]`, fastest first.
  - `POST /lap` with `{ game, n, t }` stores a lap and returns `{ rank }`.
- `schema.sql`: the one table.
- `wrangler.toml`: Worker name and database binding.

The server checks each lap before storing it:
- Initials must be three letters or digits.
- Lap times between 40 s and 15 min are accepted.
- Each IP address can post 6 laps a minute.
- Laps are only accepted from `livewire.gamify.com` (and `localhost` for testing).

It runs on Cloudflare's free tier.

## Deploy with the dashboard (no tools)

1. **Create the database.** Cloudflare dashboard → Storage & Databases → D1 → Create → name it `redline-leaderboard`.
2. **Create the table.** Open the database → Console. Paste the contents of `schema.sql` and run it.
3. **Create the Worker.** Workers & Pages → Create → Worker → name it `redline-leaderboard` → Deploy. Then choose Edit code, replace everything with `worker.js`, and Deploy.
4. **Connect the database.** Open the Worker → Settings → Bindings → Add → D1 database. Set the variable name to `DB` and the database to `redline-leaderboard`. Deploy.
5. **Point the game at it.** Copy the Worker's address, e.g. `https://redline-leaderboard.<you>.workers.dev`. Set it as `leaderboard: { url: '…' }` in `motogp-livewire/js/brand.js`.

## Deploy with Wrangler

```sh
cd tools/leaderboard-worker
npx wrangler d1 create redline-leaderboard        # paste the printed database_id into wrangler.toml
npx wrangler d1 execute redline-leaderboard --remote --file schema.sql
npx wrangler deploy
```

## Test locally

```sh
npx wrangler d1 execute redline-leaderboard --local --file schema.sql
npx wrangler dev --local --port 8787
```

Then point `leaderboard.url` at `http://127.0.0.1:8787`.

## Clearing the board

Run this in the D1 console: `DELETE FROM laps WHERE game = 'livewire_motogp_v1';`

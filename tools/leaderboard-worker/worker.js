// Worldwide leaderboard for the RED LINE reskins: a Cloudflare Worker with a D1 database (binding DB).
//   GET  /top?game=<brand id>&limit=10   -> [{ n, t }]  best lap per set of initials, fastest first
//   POST /lap  { game, n, t }             -> { rank }    store a lap
// Laps are checked for shape and a plausible time (MIN_T..MAX_T seconds), and each address may post a few a minute.
const MIN_T = 40, MAX_T = 900, PER_MINUTE = 6;
const ALLOW = /^https:\/\/livewire\.gamify\.com$|^http:\/\/localhost(:\d+)?$/; // pages allowed to call it

const json = (body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': origin && ALLOW.test(origin) ? origin : 'https://livewire.gamify.com',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  },
});

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('origin');
    if (req.method === 'OPTIONS') return json({}, 204, origin);
    const gameOk = (g) => typeof g === 'string' && /^[a-z0-9_]{1,40}$/.test(g);

    if (req.method === 'GET' && url.pathname === '/top') {
      const game = url.searchParams.get('game'), limit = Math.min(50, Math.max(1, +url.searchParams.get('limit') || 10));
      if (!gameOk(game)) return json({ error: 'game' }, 400, origin);
      const { results } = await env.DB.prepare(
        'SELECT n, MIN(t) AS t FROM laps WHERE game = ? GROUP BY n ORDER BY t ASC LIMIT ?').bind(game, limit).all();
      return json(results, 200, origin);
    }

    if (req.method === 'POST' && url.pathname === '/lap') {
      if (origin && !ALLOW.test(origin)) return json({ error: 'origin' }, 403, origin);
      let b; try { b = await req.json(); } catch { return json({ error: 'json' }, 400, origin); }
      const n = typeof b.n === 'string' ? b.n.toUpperCase() : '', t = +b.t;
      if (!gameOk(b.game) || !/^[A-Z0-9]{3}$/.test(n) || !(t >= MIN_T && t <= MAX_T)) return json({ error: 'lap' }, 400, origin);
      const ip = req.headers.get('cf-connecting-ip') || '', now = Date.now();
      const recent = await env.DB.prepare('SELECT COUNT(*) AS c FROM laps WHERE ip = ? AND d > ?').bind(ip, now - 60000).first();
      if (recent && recent.c >= PER_MINUTE) return json({ error: 'slow down' }, 429, origin);
      await env.DB.prepare('INSERT INTO laps (game, n, t, d, ip) VALUES (?, ?, ?, ?, ?)').bind(b.game, n, Math.round(t * 1000) / 1000, now, ip).run();
      const ahead = await env.DB.prepare(
        'SELECT COUNT(*) AS c FROM (SELECT n, MIN(t) AS t FROM laps WHERE game = ? GROUP BY n) WHERE t < ?').bind(b.game, t).first();
      return json({ rank: (ahead ? ahead.c : 0) + 1 }, 200, origin);
    }
    return json({ error: 'not found' }, 404, origin);
  },
};

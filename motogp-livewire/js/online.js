// Worldwide leaderboard shared by every phone and kiosk (BRAND.leaderboard.url, served by
// tools/leaderboard-worker). Without a url, or when it can't be reached, the game keeps its board on this device.
import { BRAND } from './config.js';

const BASE = BRAND.leaderboard && BRAND.leaderboard.url ? BRAND.leaderboard.url.replace(/\/$/, '') : null;
export const enabled = !!BASE;

const timeout = (ms) => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined);

// Best lap per set of initials, fastest first: [{ n, t }], or null when offline.
export async function top(limit = 10) {
  if (!BASE) return null;
  try {
    const r = await fetch(`${BASE}/top?game=${encodeURIComponent(BRAND.id)}&limit=${limit}`, { signal: timeout(5000) });
    if (!r.ok) return null;
    const list = await r.json();
    return Array.isArray(list) ? list.filter(e => e && typeof e.n === 'string' && isFinite(e.t)) : null;
  } catch { return null; }
}

// Send a finished lap. Resolves to the server's answer ({ rank }) or null.
export async function submit(n, t) {
  if (!BASE) return null;
  try {
    const r = await fetch(`${BASE}/lap`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ game: BRAND.id, n, t: Math.round(t * 1000) / 1000 }), signal: timeout(5000),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

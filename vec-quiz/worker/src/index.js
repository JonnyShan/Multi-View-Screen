// VEC quiz reporting Worker (Cloudflare Workers, D1). SHIPPED DISABLED.
//
// It stays inert until three things are true: wrangler.toml sets ENABLED = "true",
// a route or workers.dev URL is configured, and a D1 database id is filled in.
// The playable only sends events when config/client.json reporting.enabled is true.
//
//   POST /e        one quiz event, a small JSON body posted as text/plain by sendBeacon
//   GET  /report   aggregated results as JSON, or CSV with ?format=csv
//                  needs "Authorization: Bearer <REPORT_TOKEN>" (a Worker secret)
//                  optional ?cid=<campaign>&from=YYYY-MM-DD&to=YYYY-MM-DD
//
// Privacy: counts only. The Worker never reads or stores IP addresses, user agents,
// cookies or any identifier; each event increments one row of an aggregate table.

export const EVENTS = ['view', 'language_select', 'answer', 'complete', 'cta', 'replay'];
const MAX_BODY_BYTES = 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function field(value, max, pattern) {
  if (value === undefined || value === null || value === '') return '';
  const s = String(value);
  if (s.length > max || !pattern.test(s)) throw new Error('invalid field');
  return s;
}

function smallInt(value) {
  return Number.isInteger(value) && value >= 0 && value <= 50 ? value : -1;
}

// Validates and normalises one event. Unknown fields are dropped.
export function validateEvent(input, languages) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'not an object' };
  if (!EVENTS.includes(input.e)) return { ok: false, error: 'unknown event' };
  let value;
  try {
    value = {
      event: input.e,
      cid: field(input.cid, 64, /^[A-Za-z0-9_.-]+$/),
      lang: field(input.lang, 16, /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
      q: field(input.q, 16, /^[A-Za-z0-9_.-]+$/),
      a: field(input.a, 24, /^[A-Za-z0-9_.-]+$/),
      ok: input.ok === 1 || input.ok === true ? 1 : input.ok === 0 || input.ok === false ? 0 : -1,
      score: smallInt(input.score),
      total: smallInt(input.total),
      env: field(input.env, 8, /^(mraid|web)$/)
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
  if (languages && languages.length && value.lang && !languages.includes(value.lang)) return { ok: false, error: 'unknown language' };
  if (value.event === 'answer' && (!value.q || !value.a || value.ok < 0)) return { ok: false, error: 'answer needs q, a and ok' };
  if (value.event === 'complete' && value.score < 0) return { ok: false, error: 'complete needs score' };
  return { ok: true, value };
}

// Turns aggregate rows into a per language breakdown for the client report.
export function summarise(rows) {
  const blank = () => ({ languageSelects: 0, completes: 0, ctas: 0, replays: 0, scores: {}, questions: {} });
  const out = { views: 0, overall: blank(), byLanguage: {} };
  for (const row of rows) {
    const n = Number(row.n) || 0;
    if (row.event === 'view') {
      out.views += n;
      continue;
    }
    const lang = row.lang || 'unknown';
    const buckets = [out.overall, (out.byLanguage[lang] = out.byLanguage[lang] || blank())];
    for (const b of buckets) {
      if (row.event === 'language_select') b.languageSelects += n;
      else if (row.event === 'complete') {
        b.completes += n;
        b.scores[row.score] = (b.scores[row.score] || 0) + n;
      } else if (row.event === 'cta') b.ctas += n;
      else if (row.event === 'replay') b.replays += n;
      else if (row.event === 'answer') {
        const q = (b.questions[row.q] = b.questions[row.q] || { answered: 0, correct: 0, answers: {} });
        q.answered += n;
        if (row.ok === 1) q.correct += n;
        q.answers[row.a] = (q.answers[row.a] || 0) + n;
      }
    }
  }
  const rates = (b) => {
    b.completionRate = b.languageSelects ? Math.round((b.completes / b.languageSelects) * 1000) / 1000 : null;
    b.ctaRate = b.completes ? Math.round((b.ctas / b.completes) * 1000) / 1000 : null;
    Object.values(b.questions).forEach((q) => {
      q.correctRate = q.answered ? Math.round((q.correct / q.answered) * 1000) / 1000 : null;
    });
  };
  rates(out.overall);
  Object.values(out.byLanguage).forEach(rates);
  return out;
}

function timingSafeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function csv(rows) {
  const cols = ['day', 'cid', 'event', 'lang', 'q', 'a', 'ok', 'score', 'env', 'n'];
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [cols.join(',')].concat(rows.map((r) => cols.map((c) => esc(r[c] === undefined ? '' : r[c])).join(','))).join('\n') + '\n';
}

async function ingest(request, env) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return new Response('Too large', { status: 413, headers: CORS });
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }
  const languages = String(env.LANGUAGES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const check = validateEvent(parsed, languages);
  if (!check.ok) return new Response(check.error, { status: 400, headers: CORS });
  const v = check.value;
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    'INSERT INTO counts (day, cid, event, lang, q, a, ok, score, env, n) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 1) ' +
    'ON CONFLICT (day, cid, event, lang, q, a, ok, score, env) DO UPDATE SET n = n + 1'
  ).bind(day, v.cid, v.event, v.lang, v.q, v.a, v.ok, v.score, v.env).run();
  return new Response(null, { status: 204, headers: CORS });
}

async function report(request, env, url) {
  const token = env.REPORT_TOKEN || '';
  const auth = request.headers.get('Authorization') || '';
  if (!token || !timingSafeEqual(auth, `Bearer ${token}`)) return new Response('Forbidden', { status: 403 });
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const from = day.test(url.searchParams.get('from') || '') ? url.searchParams.get('from') : '0000-00-00';
  const to = day.test(url.searchParams.get('to') || '') ? url.searchParams.get('to') : '9999-12-31';
  const cid = url.searchParams.get('cid');
  const stmt = cid
    ? env.DB.prepare('SELECT * FROM counts WHERE day >= ?1 AND day <= ?2 AND cid = ?3 ORDER BY day, lang, event, q, a').bind(from, to, cid)
    : env.DB.prepare('SELECT * FROM counts WHERE day >= ?1 AND day <= ?2 ORDER BY day, lang, event, q, a').bind(from, to);
  const { results } = await stmt.all();
  if (url.searchParams.get('format') === 'csv') {
    return new Response(csv(results), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
  }
  return Response.json({ from, to, cid: cid || null, summary: summarise(results) });
}

export default {
  async fetch(request, env) {
    if (env.ENABLED !== 'true') return new Response('Reporting is disabled', { status: 503 });
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === '/e' && request.method === 'POST') return ingest(request, env);
    if (url.pathname === '/report' && request.method === 'GET') return report(request, env, url);
    return new Response('Not found', { status: 404 });
  }
};

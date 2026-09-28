import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { validateEvent, summarise } from '../worker/src/index.js';

// In-memory stand-in for the D1 calls the Worker makes.
function fakeD1() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              assert.match(sql, /^INSERT INTO counts/);
              const [day, cid, event, lang, q, a, ok, score, env] = args;
              const key = JSON.stringify(args);
              const row = rows.get(key) || { day, cid, event, lang, q, a, ok, score, env, n: 0 };
              row.n += 1;
              rows.set(key, row);
              return { success: true };
            },
            async all() {
              const [from, to, cid] = args;
              return { results: [...rows.values()].filter((r) => r.day >= from && r.day <= to && (cid === undefined || r.cid === cid)) };
            }
          };
        }
      };
    }
  };
}

const post = (body) => new Request('https://r.test/e', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'Content-Type': 'text/plain' } });

test('events are validated and normalised', () => {
  assert.equal(validateEvent({ e: 'answer', lang: 'ar', q: 'q1', a: 'q1.a2', ok: 1 }).ok, true);
  assert.equal(validateEvent({ e: 'answer', lang: 'ar', q: 'q1' }).ok, false);
  assert.equal(validateEvent({ e: 'hack' }).ok, false);
  assert.equal(validateEvent({ e: 'view', lang: '<script>' }).ok, false);
  assert.equal(validateEvent({ e: 'complete', lang: 'hi' }).ok, false);
  assert.equal(validateEvent({ e: 'language_select', lang: 'fr' }, ['en', 'ar']).ok, false);
  const { value } = validateEvent({ e: 'complete', lang: 'vi', score: 4, total: 5, ip: '1.2.3.4', ua: 'x' });
  assert.equal(value.score, 4);
  assert.equal('ip' in value || 'ua' in value, false);
});

test('the Worker refuses everything while disabled', async () => {
  const res = await worker.fetch(post({ e: 'view' }), { ENABLED: 'false', DB: fakeD1() });
  assert.equal(res.status, 503);
  const res2 = await worker.fetch(post({ e: 'view' }), {});
  assert.equal(res2.status, 503);
});

test('enabled: events aggregate into counts and the report breaks out per language', async () => {
  const env = { ENABLED: 'true', DB: fakeD1(), LANGUAGES: 'en,ar,hi', REPORT_TOKEN: 'secret-token' };
  const events = [
    { e: 'view', env: 'mraid' },
    { e: 'language_select', lang: 'ar' },
    { e: 'answer', lang: 'ar', q: 'q1', a: 'q1.a2', ok: 1 },
    { e: 'answer', lang: 'ar', q: 'q1', a: 'q1.a1', ok: 0 },
    { e: 'answer', lang: 'ar', q: 'q1', a: 'q1.a2', ok: 1 },
    { e: 'complete', lang: 'ar', score: 4, total: 5 },
    { e: 'cta', lang: 'ar', score: 4 },
    { e: 'language_select', lang: 'hi' }
  ];
  for (const evt of events) assert.equal((await worker.fetch(post(evt), env)).status, 204);
  assert.equal((await worker.fetch(post({ e: 'language_select', lang: 'fr' }), env)).status, 400);
  assert.equal((await worker.fetch(post('not json'), env)).status, 400);
  assert.equal((await worker.fetch(post('x'.repeat(2000)), env)).status, 413);

  const denied = await worker.fetch(new Request('https://r.test/report'), env);
  assert.equal(denied.status, 403);
  const res = await worker.fetch(new Request('https://r.test/report', { headers: { Authorization: 'Bearer secret-token' } }), env);
  assert.equal(res.status, 200);
  const { summary } = await res.json();
  assert.equal(summary.views, 1);
  assert.equal(summary.byLanguage.ar.languageSelects, 1);
  assert.equal(summary.byLanguage.ar.completes, 1);
  assert.equal(summary.byLanguage.ar.completionRate, 1);
  assert.deepEqual(summary.byLanguage.ar.questions.q1, { answered: 3, correct: 2, answers: { 'q1.a2': 2, 'q1.a1': 1 }, correctRate: 0.667 });
  assert.equal(summary.byLanguage.hi.completionRate, 0);
  assert.equal(summary.overall.ctas, 1);

  const csvRes = await worker.fetch(new Request('https://r.test/report?format=csv', { headers: { Authorization: 'Bearer secret-token' } }), env);
  const csv = await csvRes.text();
  assert.match(csv.split('\n')[0], /^day,cid,event,lang,q,a,ok,score,env,n$/);
  assert.ok(csv.includes(',answer,ar,q1,q1.a2,1,-1,,2'));
});

test('the report is unavailable when no token is configured', async () => {
  const env = { ENABLED: 'true', DB: fakeD1() };
  const res = await worker.fetch(new Request('https://r.test/report', { headers: { Authorization: 'Bearer ' } }), env);
  assert.equal(res.status, 403);
});

test('summarise handles an empty table', () => {
  const s = summarise([]);
  assert.equal(s.views, 0);
  assert.equal(s.overall.completionRate, null);
});

// localStorage wrappers (private mode / blocked storage must never break the game).
import { BRAND } from './brand.js';

const KEY = BRAND.id + '_';

export function load(name, fallback) {
  try {
    const v = localStorage.getItem(KEY + name);
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function save(name, value) {
  try { localStorage.setItem(KEY + name, JSON.stringify(value)); return true; } catch { return false; }
}

export function remove(name) {
  try { localStorage.removeItem(KEY + name); } catch { /* ignore */ }
}

export function sessionGet(name) {
  try { return sessionStorage.getItem(KEY + name); } catch { return null; }
}

export function sessionSet(name, v) {
  try { sessionStorage.setItem(KEY + name, v); } catch { /* ignore */ }
}

export function fmtTime(t) {
  if (t == null || !isFinite(t)) return '-:--.---';
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, '0')}`;
}

export function fmtDelta(d) {
  if (d == null || !isFinite(d)) return '';
  return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(3);
}

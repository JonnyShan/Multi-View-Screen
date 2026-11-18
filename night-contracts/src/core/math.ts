/**
 * Pure math helpers for the 2D sim plane.
 *
 * Handedness: render maps sim (x, y, z) to three (x, z, y). That mapping is a
 * mirror, so with heading angle `a` (direction (cos a, sin a)):
 *   - the visual RIGHT of the heading is (-sin a,  cos a)
 *   - the visual LEFT  of the heading is ( sin a, -cos a)
 *   - increasing `a` turns visually RIGHT.
 * Keep all "left/right" logic going through `rightX/rightY` and `leftX/leftY`.
 */

export const TAU = Math.PI * 2;

export interface Vec2 {
  x: number;
  y: number;
}

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number): number => (b === a ? 0 : (v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number): number => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Wrap an angle to (-PI, PI]. */
export function wrapAngle(a: number): number {
  a = a % TAU;
  if (a <= -Math.PI) a += TAU;
  else if (a > Math.PI) a -= TAU;
  return a;
}

/** Shortest signed difference b - a. */
export const angleDiff = (a: number, b: number): number => wrapAngle(b - a);

/** Move `v` toward `target` by at most `step`. */
export function approach(v: number, target: number, step: number): number {
  if (v < target) return Math.min(target, v + step);
  return Math.max(target, v - step);
}

/** Frame-rate independent exponential smoothing factor. */
export const dampFactor = (rate: number, dt: number): number => 1 - Math.exp(-rate * dt);
export const damp = (v: number, target: number, rate: number, dt: number): number => v + (target - v) * dampFactor(rate, dt);
export const dampAngle = (a: number, target: number, rate: number, dt: number): number =>
  a + angleDiff(a, target) * dampFactor(rate, dt);

export const fwdX = (a: number): number => Math.cos(a);
export const fwdY = (a: number): number => Math.sin(a);
export const rightX = (a: number): number => -Math.sin(a);
export const rightY = (a: number): number => Math.cos(a);
export const leftX = (a: number): number => Math.sin(a);
export const leftY = (a: number): number => -Math.cos(a);

export const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(bx - ax, by - ay);
export const dist2 = (ax: number, ay: number, bx: number, by: number): number => (bx - ax) ** 2 + (by - ay) ** 2;

/** Axis-aligned box. */
export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const aabbContains = (b: AABB, x: number, y: number, pad = 0): boolean =>
  x >= b.minX - pad && x <= b.maxX + pad && y >= b.minY - pad && y <= b.maxY + pad;

/** Oriented box in the plane. */
export interface OBB {
  x: number;
  y: number;
  a: number;
  hl: number;
  hw: number;
}

/** Point in oriented box, with optional padding. */
export function obbContains(b: OBB, px: number, py: number, pad = 0): boolean {
  const dx = px - b.x;
  const dy = py - b.y;
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  const lx = dx * c + dy * s;
  const ly = -dx * s + dy * c;
  return Math.abs(lx) <= b.hl + pad && Math.abs(ly) <= b.hw + pad;
}

/** World point to box-local (x along heading, y along visual right). */
export function toLocal(b: OBB, px: number, py: number, out: Vec2): Vec2 {
  const dx = px - b.x;
  const dy = py - b.y;
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  out.x = dx * c + dy * s;
  out.y = -dx * s + dy * c;
  return out;
}

/** Box-local point to world. */
export function toWorld(b: OBB, lx: number, ly: number, out: Vec2): Vec2 {
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  out.x = b.x + lx * c - ly * s;
  out.y = b.y + lx * s + ly * c;
  return out;
}

/** Distance from a point to the surface of an OBB (0 when inside). */
export function obbDistance(b: OBB, px: number, py: number): number {
  const dx = px - b.x;
  const dy = py - b.y;
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  const lx = Math.abs(dx * c + dy * s) - b.hl;
  const ly = Math.abs(-dx * s + dy * c) - b.hw;
  return Math.hypot(Math.max(lx, 0), Math.max(ly, 0));
}

/**
 * Ray against oriented box. Returns distance along the (normalised) ray or -1.
 */
export function rayObb(ox: number, oy: number, dx: number, dy: number, b: OBB, maxDist: number): number {
  const c = Math.cos(b.a);
  const s = Math.sin(b.a);
  const rx = ox - b.x;
  const ry = oy - b.y;
  const lox = rx * c + ry * s;
  const loy = -rx * s + ry * c;
  const ldx = dx * c + dy * s;
  const ldy = -dx * s + dy * c;
  return raySlab(lox, loy, ldx, ldy, -b.hl, -b.hw, b.hl, b.hw, maxDist);
}

export function rayAabb(ox: number, oy: number, dx: number, dy: number, b: AABB, maxDist: number): number {
  return raySlab(ox, oy, dx, dy, b.minX, b.minY, b.maxX, b.maxY, maxDist);
}

function raySlab(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  maxDist: number,
): number {
  let tmin = 0;
  let tmax = maxDist;
  if (Math.abs(dx) < 1e-9) {
    if (ox < minX || ox > maxX) return -1;
  } else {
    let t1 = (minX - ox) / dx;
    let t2 = (maxX - ox) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return -1;
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < minY || oy > maxY) return -1;
  } else {
    let t1 = (minY - oy) / dy;
    let t2 = (maxY - oy) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return -1;
  }
  return tmin;
}

/** Closest point on segment ab to p, as parameter t in [0, 1]. */
export function segmentT(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  if (len2 < 1e-9) return 0;
  return clamp(((px - ax) * vx + (py - ay) * vy) / len2, 0, 1);
}

/** Quadratic bezier point. */
export function bezier2(p0: number, p1: number, p2: number, t: number): number {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

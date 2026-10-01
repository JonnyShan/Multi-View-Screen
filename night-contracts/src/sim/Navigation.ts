/**
 * Lane paths over the road graph and pure-pursuit steering. Shared by traffic,
 * target, escort and police AI.
 */
import { angleDiff, bezier2, clamp, dist } from '../core/math';
import type { RoadGraph } from '../world/RoadGraph';
import type { Car, Waypoint } from './Car';

/** Lane points along edge from->to, then the turn curve into to->next. */
export function laneWaypoints(g: RoadGraph, from: number, to: number, next: number, speed: number, turnSpeed: number): Waypoint[] {
  const e = g.edgeBetween(from, to);
  if (!e) return [];
  const H = g.half;
  const out: Waypoint[] = [];
  const a = g.lanePoint(e, from, H);
  const b = g.lanePoint(e, from, e.length - H);
  const mid = g.lanePoint(e, from, e.length / 2);
  out.push({ x: a.x, y: a.y, speed, node: -1, gate: -1, turn: 0 });
  out.push({ x: mid.x, y: mid.y, speed, node: -1, gate: -1, turn: 0 });
  const e2 = next >= 0 ? g.edgeBetween(to, next) : undefined;
  let turn = 0;
  if (e2) {
    const c = g.lanePoint(e2, to, H);
    turn = angleDiff(b.a, c.a);
    // control point: where the two lane lines cross (or the midpoint when straight)
    let cx = (b.x + c.x) / 2;
    let cy = (b.y + c.y) / 2;
    const d1x = Math.cos(b.a);
    const d1y = Math.sin(b.a);
    const d2x = Math.cos(c.a);
    const d2y = Math.sin(c.a);
    const den = d1x * d2y - d1y * d2x;
    if (Math.abs(den) > 0.2) {
      const tt = ((c.x - b.x) * d2y - (c.y - b.y) * d2x) / den;
      cx = b.x + d1x * tt;
      cy = b.y + d1y * tt;
    }
    const sharp = Math.abs(turn);
    const vTurn = sharp < 0.2 ? speed : sharp > 2.5 ? turnSpeed * 0.5 : turnSpeed + (speed - turnSpeed) * (1 - sharp / (Math.PI / 2)) * 0.3;
    out.push({ x: b.x, y: b.y, speed: Math.min(speed, vTurn * 1.25), node: -1, gate: to, turn });
    const n = sharp < 0.2 ? 1 : 4;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      out.push({ x: bezier2(b.x, cx, c.x, t), y: bezier2(b.y, cy, c.y, t), speed: vTurn, node: to, gate: -1, turn });
    }
  } else {
    out.push({ x: b.x, y: b.y, speed, node: -1, gate: -1, turn: 0 });
  }
  return out;
}

/** Waypoints for a node route [n0, n1, ...]. */
export function routeWaypoints(g: RoadGraph, route: number[], speed: number, turnSpeed: number): Waypoint[] {
  const out: Waypoint[] = [];
  for (let i = 0; i + 1 < route.length; i++) {
    out.push(...laneWaypoints(g, route[i], route[i + 1], i + 2 < route.length ? route[i + 2] : -1, speed, turnSpeed));
  }
  return out;
}

/** Advance past reached waypoints. */
export function advanceWaypoints(car: Car): void {
  const wps = car.waypoints;
  while (car.wpIndex < wps.length) {
    const w = wps[car.wpIndex];
    const next = wps[car.wpIndex + 1];
    const d = dist(car.x, car.y, w.x, w.y);
    let passed = d < 14;
    if (!passed && next) {
      // passed if we are beyond the plane through w facing next
      const dx = next.x - w.x;
      const dy = next.y - w.y;
      passed = (car.x - w.x) * dx + (car.y - w.y) * dy > 0;
    }
    if (!passed) break;
    car.wpIndex++;
  }
}

/** Point `look` units ahead along the waypoint polyline. */
export function lookaheadPoint(car: Car, look: number): { x: number; y: number; speed: number } {
  const wps = car.waypoints;
  let px = car.x;
  let py = car.y;
  let left = look;
  let speed = Infinity;
  for (let i = car.wpIndex; i < wps.length; i++) {
    const w = wps[i];
    const d = dist(px, py, w.x, w.y);
    speed = Math.min(speed, w.speed);
    if (d >= left) {
      const t = left / d;
      return { x: px + (w.x - px) * t, y: py + (w.y - py) * t, speed };
    }
    left -= d;
    px = w.x;
    py = w.y;
  }
  return { x: px, y: py, speed: speed === Infinity ? 0 : speed };
}

/** Pure pursuit steering angle toward a point. Positive steers right. */
export function steerToward(car: Car, tx: number, ty: number, maxSteer: number): number {
  const ang = Math.atan2(ty - car.y, tx - car.x);
  const alpha = angleDiff(car.a, ang);
  const ld = Math.max(10, dist(car.x, car.y, tx, ty));
  const s = Math.atan((2 * car.spec.wheelbase * Math.sin(alpha)) / ld);
  // reversing flips the steering sense
  return clamp(car.speed < -2 ? -s : s, -maxSteer, maxSteer);
}

export function remainingWaypoints(car: Car): number {
  return car.waypoints.length - car.wpIndex;
}

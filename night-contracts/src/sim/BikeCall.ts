/**
 * The whistle: the riderless bike stands itself up and rides to the player
 * along the roads in the left lane, slowing for traffic and squeezing past
 * stopped cars on the kerb side, then stops just short of them on its stand.
 * From far away it skips ahead to a road out of sight and rides in from there.
 */
import { angleDiff, clamp, dampAngle, dist, leftX, leftY } from '../core/math';
import type { RoadEdge, RoadGraph } from '../world/RoadGraph';
import type { BikeControls } from './Bike';
import type { Waypoint } from './Car';
import { laneWaypoints } from './Navigation';
import { setYaw } from './Physics';
import type { Sim } from './Sim';

const IDLE: BikeControls = { steer: 0, throttle: 0, brake: 0, drift: false };

/** Distance from node `n` to parameter `t` (measured from e.a) along an edge. */
const along = (e: RoadEdge, n: number, t: number): number => (n === e.a ? t : e.length - t);

function pathLength(g: RoadGraph, path: number[]): number {
  let len = 0;
  for (let i = 0; i + 1 < path.length; i++) len += g.edgeBetween(path[i], path[i + 1])?.length ?? Infinity;
  return len;
}

/** How far (x, y) is along an edge, travelling away from node `from`. */
function paramFrom(g: RoadGraph, e: RoadEdge, from: number, x: number, y: number): number {
  const n = g.nodes[from];
  return ((x - n.x) * e.dx + (y - n.y) * e.dy) * (e.a === from ? 1 : -1);
}

/** Lane waypoints from (fx, fy) to the road point nearest (tx, ty). Left-hand traffic. */
export function laneRoute(g: RoadGraph, fx: number, fy: number, tx: number, ty: number, speed: number, turnSpeed: number): Waypoint[] {
  const s = g.nearestEdge(fx, fy);
  const e = g.nearestEdge(tx, ty);
  const wp = (x: number, y: number): Waypoint => ({ x, y, speed, node: -1, gate: -1, turn: 0 });
  if (s.edge === e.edge) {
    const from = e.t >= s.t ? s.edge.a : s.edge.b;
    const p0 = g.lanePoint(s.edge, from, along(s.edge, from, s.t));
    const p1 = g.lanePoint(s.edge, from, along(s.edge, from, e.t));
    return [wp(p0.x, p0.y), wp(p1.x, p1.y)];
  }
  // leave the start edge by either end and enter the goal edge by either end: take the shortest
  let best: { sn: number; gn: number; path: number[]; len: number } | null = null;
  for (const sn of [s.edge.a, s.edge.b]) {
    for (const gn of [e.edge.a, e.edge.b]) {
      const path = sn === gn ? [sn] : g.path(sn, gn);
      if (path[path.length - 1] !== gn) continue;
      const len = along(s.edge, sn, s.t) + pathLength(g, path) + along(e.edge, gn, e.t);
      if (!best || len < best.len) best = { sn, gn, path, len };
    }
  }
  if (!best) return [wp(tx, ty)];
  const route = [g.other(s.edge, best.sn), ...best.path, g.other(e.edge, best.gn)];
  const startS = along(s.edge, route[0], s.t);
  const endS = along(e.edge, best.gn, e.t);
  const p0 = g.lanePoint(s.edge, route[0], startS);
  const out: Waypoint[] = [wp(p0.x, p0.y)];
  for (let i = 0; i + 1 < route.length; i++) {
    const last = i + 2 >= route.length;
    const edge = g.edgeBetween(route[i], route[i + 1])!;
    for (const p of laneWaypoints(g, route[i], route[i + 1], last ? -1 : route[i + 2], speed, turnSpeed)) {
      // skip lane points behind the bike on the first edge and past the target on the last
      if (i === 0 && p.node < 0 && paramFrom(g, edge, route[i], p.x, p.y) < startS + 6) continue;
      if (last && paramFrom(g, edge, route[i], p.x, p.y) > endS - 6) continue;
      out.push(p);
    }
  }
  const p1 = g.lanePoint(e.edge, best.gn, endS);
  out.push(wp(p1.x, p1.y));
  return out;
}

export class BikeCall {
  route: Waypoint[] = [];
  wp = 0;
  /** Where the bike will stop. */
  stopX = 0;
  stopY = 0;
  private goalX = 0;
  private goalY = 0;
  private wakeT = 0;
  private replanT = 0;
  private time = 0;
  private checkT = 0;
  private lastX = 0;
  private lastY = 0;
  private wanted = 0;
  private stuck = 0;
  private reverseT = 0;
  private blockedT = 0;
  private filterT = 0;

  constructor(private readonly sim: Sim) {}

  /** Whistle: wake the bike (if it is not already coming) and route it to the player. */
  start(): void {
    const b = this.sim.bike;
    const t = this.sim.t.bikeCall;
    if (!b.auto) {
      b.auto = true;
      b.parked = false;
      b.fallen = false;
      this.wakeT = t.standUpTime;
      this.time = 0;
      this.stuck = 0;
      this.reverseT = 0;
      this.blockedT = 0;
      this.filterT = 0;
    }
    this.plan();
    if (this.remaining() > t.maxRide) this.skipAhead(t.skipTo);
    this.lastX = b.x;
    this.lastY = b.y;
    this.checkT = 0;
    this.wanted = 0;
    this.replanT = 1;
  }

  stop(): void {
    this.sim.bike.auto = false;
    this.route.length = 0;
  }

  /** Road route to the player, then off the road to stop just short of them. */
  private plan(): void {
    const sim = this.sim;
    const b = sim.bike;
    const pl = sim.player;
    const t = sim.t.bikeCall;
    const r = laneRoute(sim.city.graph, b.x, b.y, pl.x, pl.y, t.speed, t.cornerSpeed);
    // lane points too close to the player would run them over
    while (r.length > 1 && dist(r[r.length - 1].x, r[r.length - 1].y, pl.x, pl.y) < t.stopShort + 4) r.pop();
    const last = r[r.length - 1];
    // leave the lane a little early so it pulls in at an angle rather than turning square
    const prev = r[r.length - 2];
    if (prev) {
      const sl = dist(prev.x, prev.y, last.x, last.y);
      const back = Math.min(t.pullIn, sl * 0.5);
      if (sl > 1) {
        last.x += ((prev.x - last.x) / sl) * back;
        last.y += ((prev.y - last.y) / sl) * back;
      }
    }
    const dx = pl.x - last.x;
    const dy = pl.y - last.y;
    const d = Math.hypot(dx, dy);
    let sx = last.x;
    let sy = last.y;
    if (d > t.stopShort) {
      let k = d - t.stopShort;
      const hit = sim.city.index.raycast(last.x, last.y, dx / d, dy / d, k, false);
      if (hit >= 0) k = Math.max(0, hit - 10);
      sx = last.x + (dx / d) * k;
      sy = last.y + (dy / d) * k;
      last.speed = Math.min(last.speed, t.approachSpeed);
      if (k > 2) r.push({ x: sx, y: sy, speed: 0, node: -1, gate: -1, turn: 0 });
    }
    r[r.length - 1].speed = 0;
    this.route = r;
    this.wp = 0;
    this.goalX = pl.x;
    this.goalY = pl.y;
    this.stopX = sx;
    this.stopY = sy;
  }

  /** Path length left from the bike to the stop point. */
  remaining(): number {
    const b = this.sim.bike;
    const r = this.route;
    if (this.wp >= r.length) return dist(b.x, b.y, this.stopX, this.stopY);
    let len = dist(b.x, b.y, r[this.wp].x, r[this.wp].y);
    for (let i = this.wp; i + 1 < r.length; i++) len += dist(r[i].x, r[i].y, r[i + 1].x, r[i + 1].y);
    return len;
  }

  /** Point `look` units ahead along the route. */
  private lookahead(look: number): { x: number; y: number; speed: number } {
    const b = this.sim.bike;
    const r = this.route;
    let px = b.x;
    let py = b.y;
    let left = look;
    let speed = Infinity;
    for (let i = this.wp; i < r.length; i++) {
      const w = r[i];
      const d = dist(px, py, w.x, w.y);
      speed = Math.min(speed, w.speed);
      if (d >= left) return { x: px + ((w.x - px) * left) / d, y: py + ((w.y - py) * left) / d, speed };
      left -= d;
      px = w.x;
      py = w.y;
    }
    return { x: this.stopX, y: this.stopY, speed: 0 };
  }

  private advance(): void {
    const b = this.sim.bike;
    const r = this.route;
    while (this.wp < r.length) {
      const w = r[this.wp];
      const next = r[this.wp + 1];
      let passed = dist(b.x, b.y, w.x, w.y) < 10;
      if (!passed && next) passed = (b.x - w.x) * (next.x - w.x) + (b.y - w.y) * (next.y - w.y) > 0;
      if (!passed) break;
      this.wp++;
    }
  }

  /**
   * Jump the bike to the route point `len` from the end, preferring one the
   * player cannot see, already riding. Used for long trips and when stuck.
   */
  private skipAhead(len: number): void {
    const sim = this.sim;
    const b = sim.bike;
    const r = this.route;
    if (r.length < 2) return;
    // walk back from the end of the route and collect candidate points
    const at = (want: number): { x: number; y: number; a: number } | null => {
      let acc = 0;
      for (let i = r.length - 1; i > 0; i--) {
        const d = dist(r[i - 1].x, r[i - 1].y, r[i].x, r[i].y);
        if (acc + d >= want) {
          const k = (want - acc) / d;
          return { x: r[i].x + (r[i - 1].x - r[i].x) * k, y: r[i].y + (r[i - 1].y - r[i].y) * k, a: Math.atan2(r[i].y - r[i - 1].y, r[i].x - r[i - 1].x) };
        }
        acc += d;
      }
      return null;
    };
    let pick: { x: number; y: number; a: number } | null = null;
    for (const want of [len, len + 150, len + 300, len - 150, len - 300]) {
      const p = want > 40 ? at(want) : null;
      if (!p) continue;
      pick ??= p;
      if (!sim.traffic.visible(p.x, p.y)) {
        pick = p;
        break;
      }
    }
    if (!pick) return;
    b.place(pick.x, pick.y, sim.city.heightAt(pick.x, pick.y), pick.a);
    b.riderless = true;
    b.auto = true;
    b.speed = sim.t.bikeCall.speed * 0.5;
    sim.bikeBody.setTranslation({ x: pick.x, y: pick.y, z: 0 }, true);
    sim.bikeBody.setLinvel({ x: Math.cos(pick.a) * b.speed, y: Math.sin(pick.a) * b.speed, z: 0 }, true);
    setYaw(sim.bikeBody, pick.a);
    this.wakeT = 0;
    this.plan();
  }

  private arrive(): void {
    const sim = this.sim;
    const b = sim.bike;
    b.speed = 0;
    b.yawRate = 0;
    b.cmdX = b.cmdY = 0;
    b.parked = true;
    b.auto = false;
    sim.bikeBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.route.length = 0;
    sim.emit({ type: 'bikeArrived', x: b.x, y: b.y });
  }

  /** Controls for this step. Clears `bike.auto` on arrival. */
  update(dt: number): BikeControls {
    const sim = this.sim;
    const b = sim.bike;
    const t = sim.t.bikeCall;
    this.time += dt;

    // stand up and turn towards the road first
    if (this.wakeT > 0) {
      this.wakeT -= dt;
      b.fallT = Math.max(0, b.fallT - dt / t.standUpTime);
      const lp = this.lookahead(30);
      if (dist(b.x, b.y, lp.x, lp.y) > 4) b.heading = b.velAngle = dampAngle(b.heading, Math.atan2(lp.y - b.y, lp.x - b.x), 7, dt);
      b.speed = 0;
      return IDLE;
    }
    b.fallT = 0;

    // the player walked off: route to where they are now
    this.replanT -= dt;
    if (this.replanT <= 0) {
      this.replanT = 1;
      if (dist(this.goalX, this.goalY, sim.player.x, sim.player.y) > 40) this.plan();
    }
    this.advance();
    const rem = this.remaining();
    if ((rem < 5 || dist(b.x, b.y, this.stopX, this.stopY) < 6) && Math.abs(b.speed) < 16) {
      this.arrive();
      return IDLE;
    }
    // stuck for good, or taking far too long: hop to a road near the player
    if (this.stuck >= 3 || this.time > t.giveUpTime) {
      this.stuck = 0;
      this.time = t.giveUpTime * 0.5;
      this.skipAhead(Math.min(rem * 0.5, 240));
      return IDLE;
    }

    const speed = b.speed;
    const lp = this.lookahead(16 + Math.abs(speed) * 0.3);
    let tx = lp.x;
    let ty = lp.y;
    if (this.filterT > 0) {
      // squeeze past stopped traffic on the kerb side
      this.filterT -= dt;
      const a = Math.atan2(ty - b.y, tx - b.x);
      tx += leftX(a) * t.filterOffset;
      ty += leftY(a) * t.filterOffset;
    }
    const alpha = angleDiff(b.heading, Math.atan2(ty - b.y, tx - b.x));

    // speed: corners ahead (each waypoint's limit, braking from here), the stop, and how far we have to turn
    let want = t.speed;
    const r = this.route;
    if (this.wp < r.length) {
      let acc = dist(b.x, b.y, r[this.wp].x, r[this.wp].y);
      for (let i = this.wp; i < r.length && acc < 220; i++) {
        want = Math.min(want, Math.sqrt(r[i].speed ** 2 + 2 * t.brake * acc));
        if (i + 1 < r.length) acc += dist(r[i].x, r[i].y, r[i + 1].x, r[i + 1].y);
      }
    }
    want = Math.min(want, Math.sqrt(2 * t.brake * 0.5 * Math.max(0, rem - 1)), 30 + 200 * Math.max(0, 1 - Math.abs(alpha) / 1.2));

    // traffic and people in the way
    const fx = Math.cos(b.heading);
    const fy = Math.sin(b.heading);
    let blocked = false;
    for (const c of sim.cars) {
      const dx = c.x - b.x;
      const dy = c.y - b.y;
      if (Math.abs(dx) > 140 || Math.abs(dy) > 140) continue;
      const ahead = dx * fx + dy * fy;
      if (ahead < 0 || ahead > 130) continue;
      if (Math.abs(dy * fx - dx * fy) > c.spec.hw + 6) continue;
      const cv = Math.max(0, c.vx * fx + c.vy * fy);
      const cap = cv + Math.max(0, ahead - c.spec.hl - 10) * 1.6;
      if (cap < want) {
        want = cap;
        if (cv < 30) blocked = true;
      }
    }
    for (const p of sim.peds.list) {
      if (!p.alive) continue;
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      if (Math.abs(dx) > 70 || Math.abs(dy) > 70) continue;
      const ahead = dx * fx + dy * fy;
      if (ahead < 0 || ahead > 60 || Math.abs(dy * fx - dx * fy) > 7) continue;
      want = Math.min(want, Math.max(0, ahead - 10) * 1.4);
    }
    if (blocked && want < 40) {
      this.blockedT += dt;
      if (this.blockedT > 0.7) {
        this.filterT = 2.5;
        this.blockedT = 0;
      }
    } else this.blockedT = Math.max(0, this.blockedT - dt);

    // wanted to move but did not: back out and try again
    this.checkT += dt;
    this.wanted += want * dt;
    if (this.checkT >= 1) {
      if (dist(b.x, b.y, this.lastX, this.lastY) < 8 && this.wanted > 25 && this.reverseT <= 0) {
        this.stuck++;
        this.reverseT = 0.8;
      }
      this.lastX = b.x;
      this.lastY = b.y;
      this.checkT = 0;
      this.wanted = 0;
    }
    if (this.reverseT > 0) {
      this.reverseT -= dt;
      return { steer: alpha > 0 ? -1 : 1, throttle: 0, brake: 1, drift: false };
    }

    const v = Math.max(25, Math.abs(speed));
    const ld = Math.max(8, dist(b.x, b.y, tx, ty));
    // right at the stop, hold the line and just brake
    const steer = rem < 12 ? 0 : clamp((2 * v * Math.sin(alpha)) / ld / Math.max(0.2, b.steerRateAt(speed)), -1, 1);
    const dv = want - speed;
    let throttle = dv > 2 ? clamp(dv / 30, 0.2, 1) : 0;
    let brake = dv < -3 ? clamp(-dv / 10, 0.3, 1) : 0;
    // never brake into reverse
    if (speed < 4 && want < 4) throttle = brake = 0;
    return { steer, throttle, brake, drift: false };
  }
}

/**
 * Civilian traffic: lane following node to node, slowing for turns, queueing
 * behind the car ahead, yielding at intersections, panicking when shot at,
 * and respawning out of sight. Parked cars wake up when disturbed.
 */
import type { CarModel } from '../config/tuning';
import { clamp, dist, fwdX, fwdY, rightX, rightY } from '../core/math';
import type { Car } from './Car';
import { advanceWaypoints, laneWaypoints, lookaheadPoint, steerToward } from './Navigation';
import { COLLISION } from './Physics';
import type { Sim } from './Sim';

const CIVIL_MODELS: CarModel[] = ['sedan', 'sedan', 'hatch', 'hatch', 'ute', 'van', 'suv'];
const CIVIL_COLOURS = [0xe9e6de, 0x1b1c20, 0x7a8088, 0xb8322c, 0x2b4a6e, 0xd8cfb8, 0x3c5a4a, 0x9aa3a8, 0x5c2a2a, 0xc9a24a, 0x2f3a44, 0xe0e4e8];

interface Occupant {
  id: number;
  axis: number;
  turn: number;
}

export interface CarPlan {
  nodes: number[];
  gen: number;
}

export class Traffic {
  readonly plans = new Map<number, CarPlan>();
  private readonly occ = new Map<number, Occupant[]>();
  private readonly desired: number;

  constructor(private readonly sim: Sim) {
    this.desired = Math.round(sim.t.traffic.count * sim.trafficScale);
  }

  init(): void {
    const sim = this.sim;
    for (let i = 0; i < this.desired; i++) {
      const sp = this.findSpawn(true);
      if (!sp) continue;
      const car = sim.spawnCar('civilian', sim.rng.pick(CIVIL_MODELS), sim.rng.pick(CIVIL_COLOURS), sp.x, sp.y, sp.a);
      this.startLane(car, sp.from, sp.to);
    }
    // parked cars in car parks
    const spots = [...sim.city.parking];
    const parked: typeof spots = [];
    const max = Math.round(sim.t.traffic.maxParked * sim.trafficScale);
    while (spots.length && parked.length < max) parked.push(spots.splice(sim.rng.int(0, spots.length - 1), 1)[0]);
    for (const p of parked) {
      const car = sim.spawnCar('civilian', sim.rng.pick(CIVIL_MODELS), sim.rng.pick(CIVIL_COLOURS), p.x, p.y, p.a);
      car.mode = 'parked';
      car.body.sleep();
    }
  }

  civilianCount(): number {
    let n = 0;
    for (const c of this.sim.cars) if (c.kind === 'civilian' && c.mode !== 'parked' && !c.dead) n++;
    return n;
  }

  /** Put a car on a lane travelling from -> to and plan ahead. */
  startLane(car: Car, from: number, to: number): void {
    const g = this.sim.city.graph;
    car.mode = 'traffic';
    car.waypoints = [];
    car.wpIndex = 0;
    car.personality = 0.85 + this.sim.rng.float() * 0.25;
    const plan: CarPlan = { nodes: [from, to], gen: 0 };
    this.plans.set(car.id, plan);
    this.extendPlan(plan);
    this.extendPlan(plan);
    this.generate(car, plan);
    this.generate(car, plan);
    // skip waypoints behind the car
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < Math.min(4, car.waypoints.length); i++) {
      const d = dist(car.x, car.y, car.waypoints[i].x, car.waypoints[i].y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    car.wpIndex = best;
    car.lastNode = from;
    car.nextNode = to;
    void g;
  }

  private extendPlan(plan: CarPlan): void {
    const g = this.sim.city.graph;
    const n = plan.nodes;
    const cur = n[n.length - 1];
    const prev = n[n.length - 2];
    const options = g.neighbours(cur).filter((v) => v !== prev);
    n.push(options.length ? this.sim.rng.pick(options) : prev);
  }

  private generate(car: Car, plan: CarPlan): void {
    const g = this.sim.city.graph;
    const t = this.sim.t.traffic;
    while (plan.nodes.length < plan.gen + 3) this.extendPlan(plan);
    const from = plan.nodes[plan.gen];
    const to = plan.nodes[plan.gen + 1];
    const next = plan.nodes[plan.gen + 2];
    const e = g.edgeBetween(from, to)!;
    car.waypoints.push(...laneWaypoints(g, from, to, next, e.speed, t.turnSpeed));
    plan.gen++;
  }

  update(dt: number): void {
    const sim = this.sim;
    const t = sim.t.traffic;
    const pl = sim.player;
    let active = 0;
    for (const car of sim.cars) {
      if (car.kind !== 'civilian') continue;
      if (car.dead) continue;
      if (car.mode === 'parked') {
        car.targetSpeed = 0;
        car.steer = 0;
        continue;
      }
      active++;
      if (car.mode === 'exit') {
        this.driveExit(car, dt);
        continue;
      }
      if (car.mode !== 'traffic') continue;
      this.driveLane(car, dt);
      // recycle far away cars
      const d = dist(car.x, car.y, pl.x, pl.y);
      if (d > t.despawnDistance || (car.jamT > t.respawnStuckTime && !this.visible(car.x, car.y))) this.respawn(car);
    }
    // top up if cars were destroyed
    if (active < this.desired && sim.tick % 30 === 0) {
      const sp = this.findSpawn(false);
      if (sp) {
        const car = sim.spawnCar('civilian', sim.rng.pick(CIVIL_MODELS), sim.rng.pick(CIVIL_COLOURS), sp.x, sp.y, sp.a);
        this.startLane(car, sp.from, sp.to);
      }
    }
  }

  private driveLane(car: Car, dt: number): void {
    const sim = this.sim;
    const t = sim.t.traffic;
    const plan = this.plans.get(car.id);
    if (!plan) return;
    advanceWaypoints(car);
    // keep a few edges of lookahead, drop old points
    while (car.waypoints.length - car.wpIndex < 10) this.generate(car, plan);
    if (car.wpIndex > 12) {
      car.waypoints.splice(0, car.wpIndex - 2);
      car.wpIndex = 2;
    }
    this.updateIntersections(car);

    const look = t.lookaheadBase + Math.abs(car.speed) * t.lookaheadPerSpeed;
    const tp = lookaheadPoint(car, look);
    let target = Math.min(tp.speed, this.cornerSpeed(car)) * car.personality;
    if (car.panicT > 0) {
      car.panicT -= dt;
      target *= t.panicSpeedMul;
    }
    // stop for the intersection if we do not hold it
    const gate = this.upcomingGate(car);
    let waitingForGate = false;
    if (gate && car.inIntersection !== gate.node) {
      if (this.tryEnter(car, gate.node, gate.turn)) {
        car.waitT = 0;
      } else {
        car.waitT += dt;
        if (car.waitT > t.intersectionTimeout || car.panicT > 0) {
          this.enter(car, gate.node, gate.turn);
          car.waitT = 0;
        } else {
          target = Math.min(target, Math.max(0, (gate.d - 6) * 1.6));
          waitingForGate = true;
        }
      }
    }
    const follow = this.followSpeed(car, target);
    // stuck behind something that is not moving: pull out and go around it
    const blocked = !waitingForGate && follow < 6 && this.blockerSpeed < 6;
    if (blocked) {
      car.blockedT += dt;
      car.jamT += dt;
    } else if (follow > 20) car.blockedT = Math.max(0, car.blockedT - dt);
    let tx = tp.x;
    let ty = tp.y;
    if (car.blockedT > t.overtakeAfter && car.overtakeT <= 0) {
      car.overtakeT = t.overtakeTime;
      car.blockedT = 0;
    }
    if (car.ghostT > 0) {
      target = Math.min(target, t.overtakeSpeed * 0.8);
    } else if (car.overtakeT > 0) {
      car.overtakeT -= dt;
      tx += rightX(car.a) * sim.t.world.laneOffset * 2;
      ty += rightY(car.a) * sim.t.world.laneOffset * 2;
      target = Math.min(target, Math.max(follow, t.overtakeSpeed * (this.blockerSpeed < 6 ? 1 : 0)));
    } else target = Math.min(target, follow);
    car.steer = steerToward(car, tx, ty, sim.t.car.maxSteer);
    car.targetSpeed = target;
    this.unstick(car, dt);
  }

  /** Limit speed before sharp curves ahead. */
  private cornerSpeed(car: Car): number {
    let v = Infinity;
    const wps = car.waypoints;
    let acc = dist(car.x, car.y, wps[car.wpIndex]?.x ?? car.x, wps[car.wpIndex]?.y ?? car.y);
    for (let i = car.wpIndex; i < wps.length && acc < 160; i++) {
      const w = wps[i];
      // v^2 = v_w^2 + 2 a d
      const allowed = Math.sqrt(w.speed * w.speed + 2 * this.sim.t.car.brake * 0.55 * acc);
      v = Math.min(v, allowed);
      if (i + 1 < wps.length) acc += dist(w.x, w.y, wps[i + 1].x, wps[i + 1].y);
    }
    return v;
  }

  /**
   * Recovery when wedged: reverse out, and if that keeps failing drive
   * through other cars for a moment (collisions with cars off) so nothing
   * stays jammed for good.
   */
  unstick(car: Car, dt: number): void {
    const t = this.sim.t.traffic;
    if (car.ghostT > 0) {
      car.ghostT -= dt;
      if (car.ghostT <= 0) this.sim.physics.setCollision(car.body, COLLISION.car);
    }
    if (car.reverseT > 0) {
      car.reverseT -= dt;
      car.targetSpeed = -40;
      car.steer = -car.steer;
      return;
    }
    if (Math.abs(car.speed) < 4 && car.targetSpeed > 20) {
      car.stuckT += dt;
      car.jamT += dt;
    } else {
      car.stuckT = Math.max(0, car.stuckT - dt * 2);
      if (Math.abs(car.speed) > 20) car.jamT = Math.max(0, car.jamT - dt * 0.5);
    }
    if (car.stuckT > t.stuckTime) {
      car.reverseT = t.reverseTime;
      car.stuckT = 0;
    }
    if (car.jamT > t.ghostAfter && car.ghostT <= 0) {
      car.ghostT = t.ghostTime;
      car.jamT = 0;
      this.sim.physics.setCollision(car.body, COLLISION.carGhost);
    }
  }

  private upcomingGate(car: Car): { node: number; d: number; turn: number } | null {
    const wps = car.waypoints;
    let acc = 0;
    let px = car.x;
    let py = car.y;
    for (let i = car.wpIndex; i < wps.length && acc < 90; i++) {
      const w = wps[i];
      acc += dist(px, py, w.x, w.y);
      px = w.x;
      py = w.y;
      if (acc > 90) return null;
      if (w.gate >= 0) {
        const n = this.sim.city.graph.nodes[w.gate];
        if (n.edges.length < 3) return null;
        return { node: w.gate, d: acc, turn: w.turn };
      }
      if (w.node >= 0) return null; // already in the curve
    }
    return null;
  }

  private updateIntersections(car: Car): void {
    if (car.inIntersection < 0) return;
    // release once we are on a lane point after the curve
    const w = car.waypoints[car.wpIndex];
    const prev = car.waypoints[car.wpIndex - 1];
    if (w && w.node !== car.inIntersection && prev && prev.node === car.inIntersection) this.leave(car);
    else if (w && w.node !== car.inIntersection && w.gate !== car.inIntersection && (!prev || prev.node !== car.inIntersection)) {
      const n = this.sim.city.graph.nodes[car.inIntersection];
      if (dist(car.x, car.y, n.x, n.y) > this.sim.city.half + 30) this.leave(car);
    }
  }

  private axisOf(car: Car): number {
    return Math.abs(Math.cos(car.a)) > 0.7 ? 0 : 1;
  }

  private tryEnter(car: Car, node: number, turn: number): boolean {
    const list = this.occ.get(node) ?? [];
    const alive = list.filter((o) => this.sim.carById(o.id) && !this.sim.carById(o.id)!.dead);
    if (alive.length !== list.length) this.occ.set(node, alive);
    const axis = this.axisOf(car);
    const ok = alive.length === 0 || alive.every((o) => o.axis === axis && o.turn < 0.5 && turn < 0.5);
    if (ok) this.enter(car, node, turn);
    return ok;
  }

  private enter(car: Car, node: number, turn: number): void {
    if (car.inIntersection === node) return;
    if (car.inIntersection >= 0) this.leave(car);
    const list = this.occ.get(node) ?? [];
    list.push({ id: car.id, axis: this.axisOf(car), turn });
    this.occ.set(node, list);
    car.inIntersection = node;
  }

  leave(car: Car): void {
    if (car.inIntersection < 0) return;
    const list = this.occ.get(car.inIntersection);
    if (list) {
      const i = list.findIndex((o) => o.id === car.id);
      if (i >= 0) list.splice(i, 1);
    }
    car.inIntersection = -1;
  }

  /** Speed of whatever limited the last followSpeed call. */
  blockerSpeed = 99;

  /** Speed allowed by whatever is ahead in our path. */
  followSpeed(car: Car, want: number): number {
    this.blockerSpeed = 99;
    const sim = this.sim;
    const t = sim.t.traffic;
    const fx = fwdX(car.a);
    const fy = fwdY(car.a);
    const rx = rightX(car.a);
    const ry = rightY(car.a);
    let limit = want;
    const reach = t.followGap + Math.max(0, car.speed) * 0.9 + car.spec.hl;
    const check = (ox: number, oy: number, ohl: number, ohw: number, ovx: number, ovy: number): void => {
      const dx = ox - car.x;
      const dy = oy - car.y;
      const lx = dx * fx + dy * fy;
      if (lx <= 0 || lx > reach + ohl) return;
      const ly = dx * rx + dy * ry;
      if (Math.abs(ly) > car.spec.hw + ohw + 4) return;
      const gap = lx - car.spec.hl - ohl - 8;
      const theirs = Math.max(0, ovx * fx + ovy * fy);
      const v = gap <= 0 ? 0 : Math.min(want, theirs + gap * 1.4);
      if (v < limit) {
        limit = v;
        this.blockerSpeed = Math.hypot(ovx, ovy);
      }
    };
    for (const o of sim.cars) {
      if (o === car) continue;
      if (Math.abs(o.x - car.x) > 260 || Math.abs(o.y - car.y) > 260) continue;
      const half = Math.max(o.spec.hl, o.spec.hw);
      check(o.x, o.y, half * 0.8, half * 0.8, o.vx, o.vy);
    }
    const pl = sim.player;
    if (pl.mode === 'riding') check(sim.bike.x, sim.bike.y, 8, 4, sim.bike.cmdX, sim.bike.cmdY);
    else check(pl.x, pl.y, 3, 3, pl.vx, pl.vy);
    if (sim.bike.riderless) check(sim.bike.x, sim.bike.y, 8, 5, 0, 0);
    for (const p of sim.peds.list) if (p.alive && p.onRoad) check(p.x, p.y, 3, 3, 0, 0);
    return limit;
  }

  private driveExit(car: Car, dt: number): void {
    const sim = this.sim;
    const g = sim.city.graph;
    const near = g.nearestEdge(car.x, car.y);
    const e = near.edge;
    const s = clamp(near.t + 60, sim.city.half + 10, e.length - sim.city.half - 10);
    const lp = g.lanePoint(e, e.a, s);
    car.steer = steerToward(car, lp.x, lp.y, sim.t.car.maxSteer);
    car.targetSpeed = car.limp ? sim.t.katana.limpSpeed : 90 * (car.panicT > 0 ? 1.3 : 1);
    car.panicT -= dt;
    this.unstick(car, dt);
    if (dist(car.x, car.y, lp.x, lp.y) < 30) this.startLane(car, e.a, e.b);
  }

  /** Wake a parked car (shot, cut or rammed). */
  disturb(car: Car): void {
    if (car.kind !== 'civilian' || car.dead) return;
    car.panicT = this.sim.t.traffic.panicTime;
    if (car.mode === 'parked') {
      car.mode = 'exit';
      car.body.wakeUp();
    }
  }

  /** Cars near a loud event floor it. */
  panicAround(x: number, y: number, radius: number): void {
    for (const c of this.sim.cars) {
      if (c.kind !== 'civilian' || c.dead) continue;
      if (dist(c.x, c.y, x, y) < radius) {
        if (c.mode === 'parked') {
          if (dist(c.x, c.y, x, y) < radius * 0.3) this.disturb(c);
        } else c.panicT = this.sim.t.traffic.panicTime;
      }
    }
  }

  visible(x: number, y: number): boolean {
    const pl = this.sim.player;
    const d = dist(x, y, pl.x, pl.y);
    if (d > 1300) return false;
    const hit = this.sim.city.index.raycast(pl.x, pl.y, (x - pl.x) / d, (y - pl.y) / d, d, true, 20);
    return hit < 0;
  }

  findSpawn(anywhere: boolean): { x: number; y: number; a: number; from: number; to: number } | null {
    const sim = this.sim;
    const g = sim.city.graph;
    const t = sim.t.traffic;
    const pl = sim.player;
    for (let tries = 0; tries < 40; tries++) {
      const e = sim.rng.pick(g.edges);
      const forward = sim.rng.chance(0.5);
      const from = forward ? e.a : e.b;
      const to = forward ? e.b : e.a;
      const s = sim.rng.range(g.half + 30, e.length - g.half - 30);
      const p = g.lanePoint(e, from, s);
      const d = dist(p.x, p.y, pl.x, pl.y);
      if (anywhere) {
        if (d < 220) continue;
      } else {
        if (d < t.spawnMin || d > t.spawnMax) continue;
        if (this.visible(p.x, p.y)) continue;
      }
      let clear = true;
      for (const c of sim.cars) {
        if (dist(c.x, c.y, p.x, p.y) < 80) {
          clear = false;
          break;
        }
      }
      if (!clear) continue;
      return { x: p.x, y: p.y, a: p.a, from, to };
    }
    return null;
  }

  respawn(car: Car): void {
    const sp = this.findSpawn(false);
    if (!sp) return;
    this.leave(car);
    car.body.setTranslation({ x: sp.x, y: sp.y, z: 0 }, true);
    car.body.setRotation({ x: 0, y: 0, z: Math.sin(sp.a / 2), w: Math.cos(sp.a / 2) }, true);
    car.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    car.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    car.x = car.px = sp.x;
    car.y = car.py = sp.y;
    car.a = car.pa = sp.a;
    car.vx = car.vy = car.w = car.speed = 0;
    car.stuckT = car.reverseT = car.panicT = car.waitT = car.jamT = car.blockedT = car.overtakeT = 0;
    if (car.ghostT > 0) {
      car.ghostT = 0;
      this.sim.physics.setCollision(car.body, COLLISION.car);
    }
    car.spinT = 0;
    car.blown = [false, false, false, false];
    car.limp = false;
    car.hp = car.maxHp;
    this.startLane(car, sp.from, sp.to);
  }

  forget(car: Car): void {
    this.leave(car);
    this.plans.delete(car.id);
  }
}

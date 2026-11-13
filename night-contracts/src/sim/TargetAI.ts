/**
 * Mission driving shared by the contract target, escorts and police: follow a
 * route of lane waypoints, overtake when urgent and blocked, stop at the end.
 */
import { dist, fwdX, fwdY, rightX, rightY } from '../core/math';
import type { Car } from './Car';
import { advanceWaypoints, lookaheadPoint, routeWaypoints, steerToward } from './Navigation';
import type { Sim } from './Sim';

export interface RouteOptions {
  speedMul: number;
  urgent: boolean;
  stopAtEnd: boolean;
}

/** Drive along car.waypoints. Returns true once the end is reached. */
export function driveRoute(sim: Sim, car: Car, dt: number, o: RouteOptions): boolean {
  const t = sim.t;
  advanceWaypoints(car);
  const wps = car.waypoints;
  if (car.wpIndex >= wps.length) {
    car.targetSpeed = 0;
    car.steer = 0;
    return true;
  }
  const last = wps[wps.length - 1];
  const toEnd = dist(car.x, car.y, last.x, last.y);
  if (o.stopAtEnd && toEnd < 10 && car.wpIndex >= wps.length - 2) {
    car.targetSpeed = 0;
    return true;
  }
  const look = t.traffic.lookaheadBase + Math.abs(car.speed) * t.traffic.lookaheadPerSpeed;
  const tp = lookaheadPoint(car, look);
  let tx = tp.x;
  let ty = tp.y;
  let want = tp.speed * o.speedMul;
  // brake for corners ahead
  let acc = dist(car.x, car.y, wps[car.wpIndex].x, wps[car.wpIndex].y);
  for (let i = car.wpIndex; i < wps.length && acc < 180; i++) {
    const w = wps[i];
    want = Math.min(want, Math.sqrt((w.speed * o.speedMul) ** 2 + 2 * t.car.brake * 0.6 * acc));
    if (i + 1 < wps.length) acc += dist(w.x, w.y, wps[i + 1].x, wps[i + 1].y);
  }
  if (o.stopAtEnd) want = Math.min(want, Math.sqrt(2 * t.car.brake * 0.45 * Math.max(0, toEnd - 6)));
  const follow = sim.traffic.followSpeed(car, want);
  if (o.urgent) {
    if (follow < want * 0.5 && car.speed < want * 0.7) car.backoffT = Math.max(car.backoffT, 1.6);
    if (car.backoffT > 0) {
      // swing out into the other lane to get past
      tx += rightX(car.a) * t.world.laneOffset * 2;
      ty += rightY(car.a) * t.world.laneOffset * 2;
      want = Math.max(follow, want * 0.8);
    } else want = follow;
  } else want = follow;
  car.backoffT = Math.max(0, car.backoffT - dt);
  car.steer = steerToward(car, tx, ty, t.car.maxSteer);
  car.targetSpeed = want;
  sim.traffic.unstick(car, dt);
  return false;
}

/** The graph node in front of a car (on its nearest edge). */
export function nodeAhead(sim: Sim, car: Car): number {
  const g = sim.city.graph;
  const near = g.nearestEdge(car.x, car.y);
  const e = near.edge;
  const a = g.nodes[e.a];
  const b = g.nodes[e.b];
  const fx = fwdX(car.a);
  const fy = fwdY(car.a);
  const da = (a.x - car.x) * fx + (a.y - car.y) * fy;
  const db = (b.x - car.x) * fx + (b.y - car.y) * fy;
  return da > db ? e.a : e.b;
}

/** Give a car a fresh route to a node from wherever it is. */
export function routeTo(sim: Sim, car: Car, goal: number, speed: number): void {
  const g = sim.city.graph;
  const start = nodeAhead(sim, car);
  const behind = g.nearestEdge(car.x, car.y).edge;
  const prev = behind.a === start ? behind.b : behind.a;
  const path = g.path(start, goal, new Set([prev]));
  const route = [prev, ...path];
  car.waypoints = routeWaypoints(g, route, speed, sim.t.traffic.turnSpeed);
  car.wpIndex = 0;
  // skip points behind the car
  while (car.wpIndex < car.waypoints.length - 1) {
    const w = car.waypoints[car.wpIndex];
    const dx = w.x - car.x;
    const dy = w.y - car.y;
    if (dx * fwdX(car.a) + dy * fwdY(car.a) > 8) break;
    car.wpIndex++;
  }
  car.routeGoal = goal;
}

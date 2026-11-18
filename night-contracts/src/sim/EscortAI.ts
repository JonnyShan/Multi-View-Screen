/**
 * Hostile driving: hunt the player, ram with lead and back off after a hit,
 * or hold alongside and shoot in bursts. Used by escorts and police.
 */
import { angleDiff, dist } from '../core/math';
import type { Car } from './Car';
import { steerToward } from './Navigation';
import type { Sim } from './Sim';
import { driveRoute, routeTo } from './TargetAI';

export interface HuntOptions {
  rams: boolean;
  shoots: boolean;
  spread: number;
  speedMul: number;
}

export function hasLineOfSight(sim: Sim, car: Car, range: number): boolean {
  const pl = sim.player;
  const d = dist(car.x, car.y, pl.x, pl.y);
  if (d > range) return false;
  return sim.city.index.raycast(car.x, car.y, (pl.x - car.x) / (d || 1), (pl.y - car.y) / (d || 1), d, true, 14) < 0;
}

export function huntPlayer(sim: Sim, car: Car, dt: number, o: HuntOptions): void {
  const pl = sim.player;
  const e = sim.t.escort;
  const d = dist(car.x, car.y, pl.x, pl.y);
  const los = d < e.engageRange && hasLineOfSight(sim, car, e.engageRange);
  car.fireT -= dt;

  if (pl.mode === 'dead') {
    car.targetSpeed = 0;
    return;
  }

  if (los && d < sim.t.heat.chaseDirectRange + (o.rams ? 120 : 0)) {
    // direct pursuit with lead
    const lead = Math.min(1.2, d / 300);
    let tx = pl.x + pl.vx * lead;
    let ty = pl.y + pl.vy * lead;
    let speed = Math.max(60, Math.hypot(pl.vx, pl.vy) * (o.rams ? e.ramSpeedMul : 1)) + (o.rams ? 60 : 20);
    if (!o.rams && o.shoots) {
      // hold a firing distance, slightly off to the side
      const desired = 130;
      const side = car.id % 2 === 0 ? 1 : -1;
      const ang = Math.atan2(pl.y - car.y, pl.x - car.x) + side * 0.5;
      tx = pl.x - Math.cos(ang) * desired;
      ty = pl.y - Math.sin(ang) * desired;
      speed = Math.hypot(pl.vx, pl.vy) + (d - desired) * 0.9;
    }
    if (car.backoffT > 0) {
      // peel away after a ram
      car.backoffT -= dt;
      tx = car.x + (car.x - pl.x);
      ty = car.y + (car.y - pl.y);
      speed = 70;
    }
    car.steer = steerToward(car, tx, ty, sim.t.car.maxSteer);
    car.targetSpeed = Math.min(car.spec.maxSpeed, Math.max(0, speed * o.speedMul));
    // avoid ploughing into buildings: slow if a wall is right ahead
    const wall = sim.city.index.raycast(car.x, car.y, Math.cos(car.a), Math.sin(car.a), 60, false, 4);
    if (wall >= 0 && wall < 40) car.targetSpeed = Math.min(car.targetSpeed, 40);
    sim.traffic.unstick(car, dt);
  } else {
    // navigate the road graph towards the player
    const goal = sim.city.graph.nearestNode(pl.x, pl.y).id;
    if (goal !== car.routeGoal || car.waypoints.length - car.wpIndex < 2 || sim.tick % 120 === car.id % 120) routeTo(sim, car, goal, sim.t.traffic.cruiseSpeed * 1.7);
    driveRoute(sim, car, dt, { speedMul: o.speedMul, urgent: true, stopAtEnd: false });
  }

  if (o.shoots && los && d < e.shootRange && car.backoffT <= 0) {
    const facing = Math.abs(angleDiff(car.a, Math.atan2(pl.y - car.y, pl.x - car.x)));
    if (car.burstLeft <= 0 && car.fireT <= 0 && facing < 2.2) {
      car.burstLeft = e.burstShots;
      car.fireT = 0;
    }
    if (car.burstLeft > 0 && car.fireT <= 0) {
      sim.combat.fireAtPlayer(car, o.spread);
      car.burstLeft--;
      car.fireT = car.burstLeft > 0 ? 1 / e.fireRate : e.burstGap;
    }
  } else car.burstLeft = 0;
}

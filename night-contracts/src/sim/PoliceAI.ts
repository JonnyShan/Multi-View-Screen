/**
 * Police response to heat: cruisers spawn out of sight at 2+ stars and chase,
 * shoot at 3+, and roadblocks appear ahead of the player at 4+.
 * Part of the isolated heat system: with heat disabled nothing spawns.
 */
import { dist, fwdX, fwdY } from '../core/math';
import type { Car } from './Car';
import { hasLineOfSight, huntPlayer } from './EscortAI';
import type { Sim } from './Sim';
import { driveRoute } from './TargetAI';

export class Police {
  private roadblockT = 0;
  private spawnT = 0;
  private sirenOn = false;

  constructor(private readonly sim: Sim) {}

  get units(): Car[] {
    return this.sim.cars.filter((c) => c.kind === 'police' && !c.dead);
  }

  clear(): void {
    for (const c of [...this.sim.cars]) if (c.kind === 'police') this.sim.removeCar(c);
    this.roadblockT = 0;
  }

  update(dt: number): void {
    const sim = this.sim;
    const h = sim.t.heat;
    const stars = sim.heat.stars;
    const units = this.units;
    const pl = sim.player;
    const want = h.policeByStar[stars] ?? 0;
    const chasing = units.filter((u) => u.mode === 'hunt');

    this.spawnT -= dt;
    if (sim.heat.enabled && chasing.length < want && this.spawnT <= 0 && pl.mode !== 'dead') {
      this.spawnCruiser();
      this.spawnT = 1.5;
    }

    let spotted = false;
    for (const u of units) {
      if (u.mode === 'hunt') {
        if (stars < 2) {
          u.mode = 'exit';
          u.siren = false;
          continue;
        }
        huntPlayer(sim, u, dt, { rams: true, shoots: stars >= h.shootStars, spread: sim.t.escort.spread * 1.3, speedMul: 1.05 });
        if (hasLineOfSight(sim, u, h.losRange)) spotted = true;
      } else if (u.mode === 'roadblock') {
        u.targetSpeed = 0;
        u.steer = 0;
        if (hasLineOfSight(sim, u, h.losRange * 0.6)) {
          spotted = true;
          if (stars >= h.shootStars) {
            u.fireT -= dt;
            if (u.fireT <= 0 && dist(u.x, u.y, pl.x, pl.y) < sim.t.escort.shootRange) {
              sim.combat.fireAtPlayer(u, sim.t.escort.spread * 1.5);
              u.fireT = 0.35 + sim.rng.float() * 0.6;
            }
          }
        }
        if (stars < h.roadblockStars && dist(u.x, u.y, pl.x, pl.y) > 700) sim.removeCar(u);
      } else if (u.mode === 'exit') {
        // cruise away and vanish once out of sight
        driveRoute(sim, u, dt, { speedMul: 1, urgent: false, stopAtEnd: false });
        if (u.waypoints.length - u.wpIndex < 2) u.targetSpeed = 0;
        if (dist(u.x, u.y, pl.x, pl.y) > h.despawnDistance || !sim.traffic.visible(u.x, u.y)) {
          if (dist(u.x, u.y, pl.x, pl.y) > 600) sim.removeCar(u);
        }
      }
      if (u.mode !== 'exit' && dist(u.x, u.y, pl.x, pl.y) > h.despawnDistance) sim.removeCar(u);
    }
    sim.heat.spotted = spotted;

    // roadblocks ahead of the player
    this.roadblockT -= dt;
    if (sim.heat.enabled && stars >= h.roadblockStars && this.roadblockT <= 0 && pl.mode === 'riding') {
      this.roadblockT = this.spawnRoadblock() ? h.roadblockInterval : 1.5;
    }

    const sirens = units.some((u) => u.siren);
    if (sirens !== this.sirenOn) {
      this.sirenOn = sirens;
      sim.emit({ type: 'siren', on: sirens });
    }
  }

  private spawnCruiser(): void {
    const sim = this.sim;
    const h = sim.t.heat;
    const g = sim.city.graph;
    const pl = sim.player;
    for (let tries = 0; tries < 30; tries++) {
      const e = sim.rng.pick(g.edges);
      const from = sim.rng.chance(0.5) ? e.a : e.b;
      const s = sim.rng.range(g.half + 30, e.length - g.half - 30);
      const p = g.lanePoint(e, from, s);
      const d = dist(p.x, p.y, pl.x, pl.y);
      if (d < h.spawnMin || d > h.spawnMax || sim.traffic.visible(p.x, p.y)) continue;
      if (sim.cars.some((c) => dist(c.x, c.y, p.x, p.y) < 70)) continue;
      const car = sim.spawnCar('police', 'police', 0xf4f4f2, p.x, p.y, p.a);
      car.mode = 'hunt';
      car.siren = true;
      car.rams = true;
      return;
    }
  }

  private spawnRoadblock(): boolean {
    const sim = this.sim;
    const g = sim.city.graph;
    const b = sim.bike;
    // the intersection ahead of the player, then one block further
    const fx = fwdX(b.heading);
    const fy = fwdY(b.heading);
    let best = -1;
    let bestScore = Infinity;
    for (const n of g.nodes) {
      if (n.kind !== 'grid') continue;
      const dx = n.x - b.x;
      const dy = n.y - b.y;
      const along = dx * fx + dy * fy;
      if (along < 480 || along > 1500) continue;
      const side = Math.abs(dx * fy - dy * fx);
      if (side > 300) continue;
      // prefer an intersection the player cannot see yet; far ones are hidden by the night anyway
      const seen = sim.traffic.visible(n.x, n.y) && along < 850;
      const score = side * 2 + along * 0.2 + (seen ? 2000 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = n.id;
      }
    }
    if (best < 0 || bestScore >= 2000) return false;
    const node = g.nodes[best];
    // park two cruisers across the approach road
    const ax = Math.abs(fx) > Math.abs(fy);
    const approachDir = ax ? Math.sign(fx) : Math.sign(fy);
    const cx = ax ? node.x - approachDir * (g.half + 30) : node.x;
    const cy = ax ? node.y : node.y - approachDir * (g.half + 30);
    const across = ax ? Math.PI / 2 : 0;
    for (const off of [-22, 22]) {
      const x = ax ? cx : cx + off;
      const y = ax ? cy + off : cy;
      if (sim.cars.some((c) => dist(c.x, c.y, x, y) < 30)) continue;
      const car = sim.spawnCar('police', 'police', 0xf4f4f2, x, y, across + (off > 0 ? 0.25 : -0.25));
      car.mode = 'roadblock';
      car.siren = true;
    }
    sim.emit({ type: 'toast', text: 'ROADBLOCK AHEAD', tone: 'red' });
    return true;
  }
}

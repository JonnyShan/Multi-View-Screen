/**
 * Pedestrians: simple walkers on footpath loops. They cross streets at
 * corners, scatter from gunfire and get knocked down by vehicles.
 */
import { clamp, dist } from '../core/math';
import type { FootLoop } from '../world/CityGenerator';
import type { Sim } from './Sim';

export type PedState = 'walk' | 'cross' | 'flee' | 'down';

export class Ped {
  x = 0;
  y = 0;
  z = 0;
  px = 0;
  py = 0;
  a = 0;
  pa = 0;
  loop = 0;
  s = 0;
  dir = 1;
  speed: number;
  state: PedState = 'walk';
  stateT = 0;
  alive = true;
  onRoad = false;
  fleeX = 0;
  fleeY = 0;
  crossX = 0;
  crossY = 0;
  crossLoop = 0;
  crossS = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  /** 0..1 skin/clothes variant for rendering. */
  look: number;
  walkPhase = 0;

  constructor(
    readonly id: number,
    speed: number,
    look: number,
  ) {
    this.speed = speed;
    this.look = look;
  }
}

function perimeter(l: FootLoop): number {
  return 2 * (l.maxX - l.minX + (l.maxY - l.minY));
}

function loopPoint(l: FootLoop, s: number): { x: number; y: number; a: number } {
  const w = l.maxX - l.minX;
  const h = l.maxY - l.minY;
  const p = 2 * (w + h);
  s = ((s % p) + p) % p;
  if (s < w) return { x: l.minX + s, y: l.minY, a: 0 };
  s -= w;
  if (s < h) return { x: l.maxX, y: l.minY + s, a: Math.PI / 2 };
  s -= h;
  if (s < w) return { x: l.maxX - s, y: l.maxY, a: Math.PI };
  s -= w;
  return { x: l.minX, y: l.maxY - s, a: -Math.PI / 2 };
}

export class Peds {
  readonly list: Ped[] = [];
  private nextId = 1;
  private readonly count: number;

  constructor(private readonly sim: Sim) {
    this.count = Math.round(sim.t.peds.count * sim.pedScale);
  }

  init(): void {
    for (let i = 0; i < this.count; i++) {
      const p = new Ped(this.nextId++, this.sim.t.peds.walkSpeed * (0.8 + this.sim.rng.float() * 0.4), this.sim.rng.float());
      this.list.push(p);
      this.place(p, true);
    }
  }

  private place(p: Ped, anywhere: boolean): void {
    const sim = this.sim;
    const t = sim.t.peds;
    const loops = sim.city.footLoops;
    for (let tries = 0; tries < 30; tries++) {
      const li = sim.rng.int(0, loops.length - 1);
      const l = loops[li];
      const s = sim.rng.range(0, perimeter(l));
      const pt = loopPoint(l, s);
      const d = dist(pt.x, pt.y, sim.player.x, sim.player.y);
      if (anywhere ? d > 120 && d < t.despawnDistance : d > t.spawnMin && d < t.spawnMax) {
        p.loop = li;
        p.s = s;
        p.dir = sim.rng.chance(0.5) ? 1 : -1;
        p.x = p.px = pt.x;
        p.y = p.py = pt.y;
        p.z = l.z;
        p.state = 'walk';
        p.alive = true;
        p.onRoad = false;
        p.stateT = 0;
        return;
      }
    }
  }

  scatter(x: number, y: number, radius: number): void {
    for (const p of this.list) {
      if (!p.alive || p.state === 'down') continue;
      if (dist(p.x, p.y, x, y) < radius) {
        p.state = 'flee';
        p.stateT = this.sim.t.peds.scatterTime;
        p.fleeX = x;
        p.fleeY = y;
      }
    }
  }

  /** Knock a ped down. Returns true if it was standing. */
  knock(p: Ped, vx: number, vy: number, byPlayer: boolean): boolean {
    if (!p.alive || p.state === 'down') return false;
    p.state = 'down';
    p.stateT = 6;
    p.vx = vx * 0.6;
    p.vy = vy * 0.6;
    p.vz = 30 + Math.hypot(vx, vy) * 0.15;
    this.sim.emit({ type: 'pedHit', x: p.x, y: p.y });
    if (byPlayer) this.sim.heat.add(this.sim.t.heat.pedHit, p.x, p.y);
    this.scatter(p.x, p.y, 200);
    return true;
  }

  update(dt: number): void {
    const sim = this.sim;
    const t = sim.t.peds;
    const loops = sim.city.footLoops;
    for (const p of this.list) {
      p.px = p.x;
      p.py = p.y;
      p.pa = p.a;
      p.stateT -= dt;
      const d = dist(p.x, p.y, sim.player.x, sim.player.y);
      if (d > t.despawnDistance || (p.state === 'down' && p.stateT <= 0 && d > 300)) {
        this.place(p, false);
        continue;
      }
      switch (p.state) {
        case 'walk': {
          const l = loops[p.loop];
          p.s += p.dir * p.speed * dt;
          const pt = loopPoint(l, p.s);
          p.a = p.dir > 0 ? pt.a : pt.a + Math.PI;
          p.x = pt.x;
          p.y = pt.y;
          p.z = l.z;
          p.walkPhase += dt * p.speed * 0.5;
          // occasionally cross to the neighbouring block at a corner
          if (sim.rng.chance(dt * 0.05)) this.tryCross(p);
          break;
        }
        case 'cross': {
          const dx = p.crossX - p.x;
          const dy = p.crossY - p.y;
          const dd = Math.hypot(dx, dy);
          p.onRoad = true;
          if (dd < 3) {
            p.loop = p.crossLoop;
            p.s = p.crossS;
            p.state = 'walk';
            p.onRoad = false;
          } else {
            p.x += (dx / dd) * p.speed * 1.2 * dt;
            p.y += (dy / dd) * p.speed * 1.2 * dt;
            p.a = Math.atan2(dy, dx);
            p.z = sim.city.heightAt(p.x, p.y) + (p.onRoad ? 0 : 1.2);
            p.walkPhase += dt * p.speed * 0.6;
          }
          break;
        }
        case 'flee': {
          let ax = p.x - p.fleeX;
          let ay = p.y - p.fleeY;
          const l = Math.hypot(ax, ay) || 1;
          ax /= l;
          ay /= l;
          const nx = p.x + ax * t.runSpeed * dt;
          const ny = p.y + ay * t.runSpeed * dt;
          if (sim.city.index.pointBlocked(nx, ny, 3) < 0) {
            p.x = nx;
            p.y = ny;
          } else {
            // slide along whichever axis is free
            if (sim.city.index.pointBlocked(nx, p.y, 3) < 0) p.x = nx;
            else if (sim.city.index.pointBlocked(p.x, ny, 3) < 0) p.y = ny;
          }
          p.a = Math.atan2(ay, ax);
          p.z = sim.city.heightAt(p.x, p.y);
          p.walkPhase += dt * t.runSpeed * 0.35;
          p.onRoad = true;
          if (p.stateT <= 0) this.rejoin(p);
          break;
        }
        case 'down': {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= Math.exp(-3 * dt);
          p.vy *= Math.exp(-3 * dt);
          const g = sim.city.heightAt(p.x, p.y);
          p.vz -= sim.t.player.gravity * dt;
          p.z = Math.max(g, p.z + p.vz * dt);
          p.onRoad = false;
          break;
        }
      }
    }
  }

  private tryCross(p: Ped): void {
    const sim = this.sim;
    const loops = sim.city.footLoops;
    const l = loops[p.loop];
    const gap = sim.city.half * 2 + sim.t.world.footpathWidth;
    // look for a loop across the road in the walking direction
    const ax = Math.cos(p.a);
    const ay = Math.sin(p.a);
    const tx = p.x + ay * gap * (p.dir > 0 ? -1 : 1);
    const ty = p.y - ax * gap * (p.dir > 0 ? -1 : 1);
    for (let i = 0; i < loops.length; i++) {
      if (i === p.loop) continue;
      const o = loops[i];
      if (tx >= o.minX - 12 && tx <= o.maxX + 12 && ty >= o.minY - 12 && ty <= o.maxY + 12) {
        // snap to the nearest point on that loop
        const cx = clamp(tx, o.minX, o.maxX);
        const cy = clamp(ty, o.minY, o.maxY);
        const onX = Math.min(Math.abs(cy - o.minY), Math.abs(cy - o.maxY)) < Math.min(Math.abs(cx - o.minX), Math.abs(cx - o.maxX));
        const sx = onX ? cx : Math.abs(cx - o.minX) < Math.abs(cx - o.maxX) ? o.minX : o.maxX;
        const sy = onX ? (Math.abs(cy - o.minY) < Math.abs(cy - o.maxY) ? o.minY : o.maxY) : cy;
        p.state = 'cross';
        p.crossX = sx;
        p.crossY = sy;
        p.crossLoop = i;
        p.crossS = this.paramOf(o, sx, sy);
        return;
      }
    }
    void l;
  }

  private paramOf(l: FootLoop, x: number, y: number): number {
    const w = l.maxX - l.minX;
    const h = l.maxY - l.minY;
    if (Math.abs(y - l.minY) < 1) return x - l.minX;
    if (Math.abs(x - l.maxX) < 1) return w + (y - l.minY);
    if (Math.abs(y - l.maxY) < 1) return w + h + (l.maxX - x);
    return 2 * w + h + (l.maxY - y);
  }

  private rejoin(p: Ped): void {
    // walk back onto the nearest footpath loop
    const loops = this.sim.city.footLoops;
    let best = 0;
    let bd = Infinity;
    let bx = 0;
    let by = 0;
    loops.forEach((o, i) => {
      const cx = clamp(p.x, o.minX, o.maxX);
      const cy = clamp(p.y, o.minY, o.maxY);
      // nearest point on the perimeter
      const dl = Math.min(cx - o.minX, o.maxX - cx, cy - o.minY, o.maxY - cy);
      let px = cx;
      let py = cy;
      if (dl === cx - o.minX) px = o.minX;
      else if (dl === o.maxX - cx) px = o.maxX;
      else if (dl === cy - o.minY) py = o.minY;
      else py = o.maxY;
      const d = dist(p.x, p.y, px, py);
      if (d < bd) {
        bd = d;
        best = i;
        bx = px;
        by = py;
      }
    });
    p.state = 'cross';
    p.crossX = bx;
    p.crossY = by;
    p.crossLoop = best;
    p.crossS = this.paramOf(loops[best], bx, by);
  }
}

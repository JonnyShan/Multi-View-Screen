/**
 * Weapons. The machine gun is hitscan with tracers, soft aim assist and tyre
 * blowouts; the katana cuts wheels (spin or limp), hits bodies and performs
 * the roof strike. Enemy bullets are projectiles so leading and dodging matter.
 */
import { angleDiff, dist, obbDistance, rayObb, toLocal, toWorld, type Vec2 } from '../core/math';
import type { Car } from './Car';
import type { Intent } from './Intent';
import type { Sim } from './Sim';

export interface Bullet {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  from: number;
}

const tmp: Vec2 = { x: 0, y: 0 };
const WHEELS: [number, number][] = [
  [1, -1],
  [1, 1],
  [-1, -1],
  [-1, 1],
];

export class Combat {
  readonly bullets: Bullet[] = [];

  constructor(private readonly sim: Sim) {}

  /** Local wheel position for index i (fl, fr, rl, rr). */
  wheelLocal(car: Car, i: number): Vec2 {
    return { x: (WHEELS[i][0] * car.spec.wheelbase) / 2, y: WHEELS[i][1] * car.spec.hw * 0.92 };
  }

  update(intent: Intent, dt: number): void {
    const sim = this.sim;
    const pl = sim.player;
    const g = sim.t.gun;
    pl.fireT = Math.max(-1, pl.fireT - dt);
    pl.slashT = Math.max(0, pl.slashT - dt);
    pl.slashAnim += dt;
    const canAct = pl.mode === 'riding' || pl.mode === 'foot' || pl.mode === 'roof';

    // reload
    if (pl.reloadT > 0) {
      pl.reloadT -= dt;
      if (pl.reloadT <= 0) pl.ammo = g.magazine;
    }

    // aim: mouse point or assist
    const forward = pl.mode === 'riding' ? sim.bike.heading : pl.facing;
    const target = intent.hasAim ? null : this.findAssistTarget(pl.x, pl.y, forward);
    pl.assistTarget = target ? target.id : -1;
    if (intent.hasAim) {
      pl.aimX = intent.aimX;
      pl.aimY = intent.aimY;
    } else if (target) {
      pl.aimX = target.x;
      pl.aimY = target.y;
    } else {
      pl.aimX = pl.x + Math.cos(forward) * 300;
      pl.aimY = pl.y + Math.sin(forward) * 300;
    }

    pl.firing = canAct && pl.mode !== 'roof' && intent.fire;
    if (pl.firing && pl.mode === 'foot') pl.facing = Math.atan2(pl.aimY - pl.y, pl.aimX - pl.x);
    if (pl.firing && pl.reloadT <= 0 && pl.ammo > 0) {
      while (pl.fireT <= 0 && pl.ammo > 0) {
        this.playerShot();
        pl.fireT += 1 / g.fireRate;
        pl.ammo--;
      }
      if (pl.ammo <= 0) {
        pl.reloadT = g.reloadTime;
        sim.emit({ type: 'reload' });
      }
    }
    if (pl.fireT < 0) pl.fireT = 0;

    if (intent.slash && canAct && pl.slashT <= 0) {
      pl.slashT = sim.t.katana.cooldown;
      pl.slashAnim = 0;
      if (pl.mode === 'roof') this.roofStrike();
      else this.slash();
    }
  }

  findAssistTarget(ox: number, oy: number, forward: number): Car | null {
    const sim = this.sim;
    const g = sim.t.gun;
    let best: Car | null = null;
    let bestScore = Infinity;
    for (const c of sim.cars) {
      if (c.dead) continue;
      const d = dist(ox, oy, c.x, c.y);
      if (d > g.assistRange || d < 4) continue;
      const hostile = c.kind === 'target' || c.kind === 'escort' || c.kind === 'police';
      const cone = hostile ? g.assistCone : g.assistConeCivil;
      const off = Math.abs(angleDiff(forward, Math.atan2(c.y - oy, c.x - ox)));
      if (off > cone) continue;
      if (sim.city.index.raycast(ox, oy, (c.x - ox) / d, (c.y - oy) / d, d, true, 12) >= 0) continue;
      const score = off / cone + d / g.assistRange * 0.5 + (hostile ? 0 : 1.5) + (c.kind === 'target' ? -0.4 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }

  private playerShot(): void {
    const sim = this.sim;
    const pl = sim.player;
    const g = sim.t.gun;
    const ox = pl.x;
    const oy = pl.y;
    const oz = pl.z + g.muzzleHeight;
    const base = Math.atan2(pl.aimY - oy, pl.aimX - ox);
    const a = base + (sim.rng.float() - 0.5) * 2 * g.spread;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = g.range;
    let hitCar: Car | null = null;
    for (const c of sim.cars) {
      if (Math.abs(c.x - ox) > g.range || Math.abs(c.y - oy) > g.range) continue;
      const d = rayObb(ox, oy, dx, dy, c, best);
      if (d >= 0 && d < best && d > 1) {
        best = d;
        hitCar = c;
      }
    }
    let hitPed = -1;
    for (let i = 0; i < sim.peds.list.length; i++) {
      const p = sim.peds.list[i];
      if (!p.alive || p.state === 'down') continue;
      const px = p.x - ox;
      const py = p.y - oy;
      const along = px * dx + py * dy;
      if (along <= 0 || along >= best) continue;
      const perp = Math.abs(px * dy - py * dx);
      if (perp < 3) {
        best = along;
        hitPed = i;
        hitCar = null;
      }
    }
    const wall = sim.city.index.raycast(ox, oy, dx, dy, best, false, oz);
    let hit: 'car' | 'wall' | 'ped' | 'none' = 'none';
    if (wall >= 0 && wall < best) {
      best = wall;
      hit = 'wall';
      hitCar = null;
      hitPed = -1;
    }
    const tx = ox + dx * best;
    const ty = oy + dy * best;
    let tz = sim.city.heightAt(tx, ty) + 6;
    if (hitCar) {
      hit = 'car';
      tz = sim.city.heightAt(tx, ty) + hitCar.spec.roof * 0.55;
      sim.damageCar(hitCar, g.damageCar, 'player', 'gun');
      // wheels
      toLocal(hitCar, tx, ty, tmp);
      for (let i = 0; i < 4; i++) {
        const w = this.wheelLocal(hitCar, i);
        if (!hitCar.blown[i] && Math.hypot(tmp.x - w.x, tmp.y - w.y) < g.wheelHitRadius && sim.rng.chance(g.tyreBlowChance)) {
          hitCar.blown[i] = true;
          hitCar.lastMethod = 'crash';
          sim.emit({ type: 'tyreBlown', car: hitCar.id, x: tx, y: ty });
          if (hitCar.kind !== 'civilian') sim.emit({ type: 'toast', text: 'TYRE OUT', tone: 'gold' });
          break;
        }
      }
    } else if (hitPed >= 0) {
      hit = 'ped';
      const p = sim.peds.list[hitPed];
      sim.peds.knock(p, dx * 60, dy * 60, true);
    } else if (hit === 'wall') {
      tz = oz;
      sim.emit({ type: 'sparks', x: tx, y: ty, z: tz, count: 4 });
    } else tz = oz - 4;
    sim.emit({ type: 'shot', x: ox, y: oy, z: oz, tx, ty, tz, hit, by: 'player' });
    sim.heat.add(sim.t.heat.shotFired, ox, oy);
    sim.traffic.panicAround(ox, oy, sim.t.traffic.panicRadius);
    sim.peds.scatter(ox, oy, sim.t.peds.scatterRadius);
    sim.contracts.onGunfire(ox, oy);
  }

  private slash(): void {
    const sim = this.sim;
    const pl = sim.player;
    const k = sim.t.katana;
    const riding = pl.mode === 'riding';
    const facing = riding ? sim.bike.heading : pl.facing;
    const arc = riding ? k.arcBike : k.arcFoot;
    let hitAny = false;
    // nearest car in reach
    let best: Car | null = null;
    let bestD = Infinity;
    for (const c of sim.cars) {
      if (c.dead) continue;
      const d = obbDistance(c, pl.x, pl.y);
      if (d > k.range) continue;
      // aim at the nearest point of the car, not its centre
      toLocal(c, pl.x, pl.y, tmp);
      toWorld(c, Math.max(-c.spec.hl, Math.min(c.spec.hl, tmp.x)), Math.max(-c.spec.hw, Math.min(c.spec.hw, tmp.y)), tmp);
      const off = Math.abs(angleDiff(facing, Math.atan2(tmp.y - pl.y, tmp.x - pl.x)));
      if (off > arc / 2 && d > 6) continue;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    if (best) {
      hitAny = true;
      // where the blade meets the car: the point on its box nearest the player
      toLocal(best, pl.x, pl.y, tmp);
      const hx = Math.max(-best.spec.hl, Math.min(best.spec.hl, tmp.x));
      const hy = Math.max(-best.spec.hw, Math.min(best.spec.hw, tmp.y));
      let wi = -1;
      let wd = Infinity;
      for (let i = 0; i < 4; i++) {
        const w = this.wheelLocal(best, i);
        const d = Math.hypot(hx - w.x, hy - w.y);
        if (d < wd) {
          wd = d;
          wi = i;
        }
      }
      if (wi >= 0 && wd < k.wheelRadius && !best.blown[wi]) {
        best.blown[wi] = true;
        const moving = Math.abs(best.speed) > k.spinMinSpeed;
        const side = WHEELS[wi][1];
        if (moving) {
          best.spinT = k.spinTime;
          best.body.setAngvel({ x: 0, y: 0, z: best.w + side * k.spinAngular * (best.speed >= 0 ? 1 : -1) }, true);
          best.w += side * k.spinAngular;
        } else {
          best.limp = true;
        }
        best.lastMethod = 'crash';
        sim.damageCar(best, 8, 'player', 'crash');
        best.lastMethod = 'crash';
        toWorld(best, this.wheelLocal(best, wi).x, this.wheelLocal(best, wi).y, tmp);
        sim.emit({ type: 'wheelCut', car: best.id, x: tmp.x, y: tmp.y, spin: moving });
        sim.emit({ type: 'toast', text: 'WHEEL CUT', tone: 'gold', sub: moving ? undefined : 'It limps away' });
        sim.emit({ type: 'sparks', x: tmp.x, y: tmp.y, z: 3, count: 18 });
      } else {
        sim.damageCar(best, k.damage, 'player', 'blade');
        sim.emit({ type: 'sparks', x: best.x, y: best.y, z: 6, count: 10 });
      }
    }
    for (const p of sim.peds.list) {
      if (!p.alive || p.state === 'down') continue;
      if (dist(p.x, p.y, pl.x, pl.y) < k.range && Math.abs(angleDiff(facing, Math.atan2(p.y - pl.y, p.x - pl.x))) < arc / 2) {
        sim.peds.knock(p, Math.cos(facing) * 40, Math.sin(facing) * 40, true);
        hitAny = true;
      }
    }
    sim.emit({ type: 'slash', x: pl.x, y: pl.y, a: facing, hit: hitAny });
  }

  private roofStrike(): void {
    const sim = this.sim;
    const pl = sim.player;
    const car = sim.carById(pl.roofCar);
    if (!car) return;
    sim.emit({ type: 'slash', x: pl.x, y: pl.y, a: car.a, hit: true });
    sim.emit({ type: 'roofStrike', car: car.id });
    sim.emit({ type: 'sparks', x: car.x, y: car.y, z: car.spec.roof, count: 30 });
    sim.killCar(car, 'roof');
    sim.leaveRoof(false);
  }

  /** Enemy shot with lead at the player. */
  fireAtPlayer(car: Car, spread: number): void {
    const sim = this.sim;
    const pl = sim.player;
    const e = sim.t.escort;
    const d = dist(car.x, car.y, pl.x, pl.y);
    const tt = d / e.bulletSpeed;
    const tx = pl.x + pl.vx * tt;
    const ty = pl.y + pl.vy * tt;
    const a = Math.atan2(ty - car.y, tx - car.x) + (sim.rng.float() - 0.5) * 2 * spread;
    const ox = car.x + Math.cos(a) * (car.spec.hw + 4);
    const oy = car.y + Math.sin(a) * (car.spec.hw + 4);
    const z = sim.city.heightAt(car.x, car.y) + car.spec.roof * 0.8;
    this.bullets.push({ x: ox, y: oy, z, px: ox, py: oy, vx: Math.cos(a) * e.bulletSpeed, vy: Math.sin(a) * e.bulletSpeed, life: 1.2, damage: e.bulletDamage, from: car.id });
    sim.emit({ type: 'shot', x: ox, y: oy, z, tx: ox + Math.cos(a) * 60, ty: oy + Math.sin(a) * 60, tz: z, hit: 'none', by: 'enemy' });
    sim.peds.scatter(car.x, car.y, 250);
    sim.traffic.panicAround(car.x, car.y, 300);
  }

  postUpdate(dt: number): void {
    const sim = this.sim;
    const pl = sim.player;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.px = b.x;
      b.py = b.y;
      const nx = b.x + b.vx * dt;
      const ny = b.y + b.vy * dt;
      b.life -= dt;
      let dead = b.life <= 0;
      const len = Math.hypot(nx - b.x, ny - b.y);
      const dx = (nx - b.x) / (len || 1);
      const dy = (ny - b.y) / (len || 1);
      // hit player
      if (!dead && pl.mode !== 'dead') {
        const px = pl.x - b.x;
        const py = pl.y - b.y;
        const along = px * dx + py * dy;
        const perp = Math.abs(px * dy - py * dx);
        const radius = pl.mode === 'riding' ? 6 : 4;
        if (along >= 0 && along <= len && perp < radius && Math.abs(pl.z + 7 - b.z) < 16) {
          sim.hurtPlayer(b.damage);
          sim.emit({ type: 'sparks', x: pl.x, y: pl.y, z: pl.z + 8, count: 3 });
          dead = true;
        }
      }
      if (!dead && sim.city.index.raycast(b.x, b.y, dx, dy, len, false, b.z) >= 0) {
        sim.emit({ type: 'sparks', x: nx, y: ny, z: b.z, count: 3 });
        dead = true;
      }
      if (dead) {
        this.bullets.splice(i, 1);
        continue;
      }
      b.x = nx;
      b.y = ny;
    }
  }
}

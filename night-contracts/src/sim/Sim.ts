/**
 * The game simulation. Pure and deterministic given a seed and an input log.
 * Renderers read its state; they never write to it.
 */
import type { CarModel, KillMethod, Tuning } from '../config/tuning';
import { RNG } from '../core/RNG';
import { angleDiff, clamp, dist, fwdX, fwdY, leftX, leftY, obbContains, obbDistance, toLocal, toWorld, type Vec2 } from '../core/math';
import { generateCity, placeByName, type City } from '../world/CityGenerator';
import { Weather } from '../world/Weather';
import { Bike } from './Bike';
import { BikeCall } from './BikeCall';
import { Car, type CarKind } from './Car';
import { Combat } from './Combat';
import { Contracts } from './Contracts';
import { Heat } from './Heat';
import type { Intent } from './Intent';
import { Peds } from './Peds';
import { COLLISION, Physics, setYaw, type Body } from './Physics';
import { Player } from './Player';
import { Police } from './PoliceAI';
import { Traffic } from './TrafficAI';
import type { SimEvent } from './events';

export interface SimOptions {
  seed?: number;
  /** Reuse a generated city (tests can share one). */
  city?: City;
  trafficScale?: number;
  pedScale?: number;
  /** Start with no traffic, peds or contracts (unit tests of single systems). */
  bare?: boolean;
  startHour?: number;
  cash?: number;
  contractIndex?: number;
  loop?: number;
}

const tmpV: Vec2 = { x: 0, y: 0 };

export class Sim {
  readonly t: Tuning;
  readonly dt: number;
  readonly city: City;
  readonly physics: Physics;
  readonly rng: RNG;
  readonly bike: Bike;
  readonly bikeCall: BikeCall;
  readonly player: Player;
  readonly bikeBody: Body;
  readonly footBody: Body;
  readonly events: SimEvent[] = [];
  readonly cars: Car[] = [];
  readonly traffic: Traffic;
  readonly peds: Peds;
  readonly heat: Heat;
  readonly combat: Combat;
  readonly contracts: Contracts;
  readonly police: Police;
  readonly weather: Weather;
  readonly trafficScale: number;
  readonly pedScale: number;
  tick = 0;
  time = 0;
  /** In-game clock in hours (0..24). */
  clock: number;
  clockPaused = false;
  /** Road wetness 0..1 (rain). */
  wet = 0;
  raining = false;
  private nextCarId = 1;
  private readonly carIndex = new Map<number, Car>();

  constructor(t: Tuning, opts: SimOptions = {}) {
    this.t = t;
    this.dt = 1 / t.sim.hz;
    const seed = opts.seed ?? t.world.seed;
    this.rng = new RNG(seed ^ 0x5eed);
    this.city = opts.city ?? generateCity(t, seed);
    this.physics = new Physics(this.dt);
    for (const c of this.city.colliders) this.physics.addStatic(c);
    this.clock = opts.startHour ?? t.time.startHour;
    this.weather = new Weather(t, this.rng.fork(77));
    this.raining = this.weather.raining;
    this.wet = this.weather.wet;
    this.trafficScale = opts.bare ? 0 : (opts.trafficScale ?? 1);
    this.pedScale = opts.bare ? 0 : (opts.pedScale ?? 1);

    this.bike = new Bike(t);
    this.bikeCall = new BikeCall(this);
    this.player = new Player(t);
    this.player.cash = opts.cash ?? 0;
    const spawn = this.spawnPoint();
    this.bike.place(spawn.x, spawn.y, this.city.heightAt(spawn.x, spawn.y), spawn.a);
    this.bikeBody = this.physics.createCapsuleBody(spawn.x, spawn.y, spawn.a, t.bike.halfLength, t.bike.radius, t.bike.mass, COLLISION.bike);
    this.footBody = this.physics.createBallBody(spawn.x, spawn.y, t.player.radius, 80, COLLISION.ghost);
    this.footBody.setEnabled(false);
    this.syncPlayerToBike();
    this.player.snapshot();

    this.heat = new Heat(t, (e) => this.emit(e));
    this.traffic = new Traffic(this);
    this.peds = new Peds(this);
    this.combat = new Combat(this);
    this.contracts = new Contracts(this, opts.contractIndex ?? 0, opts.loop ?? 0, !opts.bare);
    this.police = new Police(this);
    this.traffic.init();
    this.peds.init();
  }

  /** Safehouse spawn: on the road beside the safehouse, facing north in the left lane. */
  spawnPoint(): { x: number; y: number; a: number } {
    const p = placeByName(this.city, 'Safehouse');
    const a = Math.PI / 2;
    return { x: p.x + leftX(a) * this.t.world.laneOffset, y: p.y - 190, a };
  }

  emit(e: SimEvent): void {
    this.events.push(e);
  }

  // -------------------------------------------------------------- cars API
  spawnCar(kind: CarKind, model: CarModel, color: number, x: number, y: number, a: number, hp?: number): Car {
    const spec = this.t.car.specs[model];
    const body = this.physics.createBoxBody(x, y, a, spec.hl, spec.hw, spec.mass, COLLISION.car);
    const car = new Car(this.nextCarId++, kind, model, color, body, this.t, hp);
    car.x = car.px = x;
    car.y = car.py = y;
    car.a = car.pa = a;
    this.cars.push(car);
    this.carIndex.set(car.id, car);
    return car;
  }

  removeCar(car: Car): void {
    const i = this.cars.indexOf(car);
    if (i >= 0) this.cars.splice(i, 1);
    this.carIndex.delete(car.id);
    this.traffic.forget(car);
    this.physics.remove(car.body);
    if (this.player.roofCar === car.id && this.player.mode === 'roof') this.leaveRoof(false);
  }

  carById(id: number): Car | undefined {
    return this.carIndex.get(id);
  }

  /** Apply damage to a car with attribution. */
  damageCar(car: Car, amount: number, by: 'player' | 'env', method: KillMethod | null): void {
    if (car.dead || amount <= 0) return;
    if (by === 'player') {
      if (car.kind === 'civilian' && this.time - car.lastHitTime > 1.5) this.heat.add(this.t.heat.civilianCarDamaged, car.x, car.y);
      if (car.kind === 'police' && this.time - car.lastHitTime > 1.5) this.heat.add(this.t.heat.policeDamaged, car.x, car.y);
      car.lastHitBy = 'player';
      car.lastHitTime = this.time;
      if (method) car.lastMethod = method;
      if (car.kind === 'civilian') this.traffic.disturb(car);
      this.contracts.onCarAttacked(car);
    } else if (method) {
      if (this.time - car.lastHitTime > 6) car.lastHitBy = 'env';
      car.lastMethod = car.lastHitBy === 'player' && car.lastMethod ? car.lastMethod : method;
    }
    car.hp -= amount;
    if (car.hp <= 0) this.killCar(car);
    else if (car.hp < car.maxHp * this.t.car.fireAt) car.burning = true;
  }

  killCar(car: Car, method?: KillMethod): void {
    if (car.dead) return;
    car.hp = 0;
    car.dead = true;
    car.burning = true;
    car.mode = 'wreck';
    car.siren = false;
    car.explodeT = this.t.car.explodeDelay;
    if (method) {
      car.lastMethod = method;
      car.lastHitBy = 'player';
      car.lastHitTime = this.time;
    }
    this.traffic.leave(car);
    const byPlayer = car.lastHitBy === 'player' && this.time - car.lastHitTime < 12;
    if (byPlayer) {
      if (car.kind === 'civilian') this.heat.add(this.t.heat.civilianCarDestroyed, car.x, car.y);
      if (car.kind === 'police') this.heat.add(this.t.heat.policeDestroyed, car.x, car.y);
    }
    this.contracts.onCarKilled(car, byPlayer);
  }

  explode(x: number, y: number, z: number, source: Car | null): void {
    const c = this.t.car;
    this.emit({ type: 'explosion', x, y, z });
    this.traffic.panicAround(x, y, this.t.traffic.panicRadius);
    this.peds.scatter(x, y, this.t.peds.scatterRadius);
    const byPlayer = !!source && source.lastHitBy === 'player' && this.time - source.lastHitTime < 12;
    for (const o of this.cars) {
      if (o === source) continue;
      const d = dist(o.x, o.y, x, y);
      if (d > c.blastRadius) continue;
      const k = 1 - d / c.blastRadius;
      const dx = (o.x - x) / (d || 1);
      const dy = (o.y - y) / (d || 1);
      o.body.applyImpulse({ x: dx * c.blastImpulse * k * o.spec.mass * 0.4, y: dy * c.blastImpulse * k * o.spec.mass * 0.4, z: 0 }, true);
      o.body.applyTorqueImpulse({ x: 0, y: 0, z: (this.rng.float() - 0.5) * o.spec.mass * 300 * k }, true);
      if (!o.dead) this.damageCar(o, c.blastCarDamage * k, byPlayer ? 'player' : 'env', byPlayer ? (source?.lastMethod ?? 'gun') : 'crash');
    }
    const pl = this.player;
    const pd = dist(pl.x, pl.y, x, y);
    if (pd < c.blastRadius && pl.mode !== 'dead') {
      const k = 1 - pd / c.blastRadius;
      this.hurtPlayer(c.blastPlayerDamage * k);
      if (k > 0.45 && pl.mode === 'riding') this.throwRider(80, 60 + 200 * k);
    }
    for (const p of this.peds.list) {
      const d = dist(p.x, p.y, x, y);
      if (d < c.blastRadius * 0.8) this.peds.knock(p, (p.x - x) * 2, (p.y - y) * 2, byPlayer);
    }
  }

  // --------------------------------------------------------------- step
  step(intent: Intent): void {
    this.events.length = 0;
    this.tick++;
    this.time += this.dt;
    const dt = this.dt;
    const hours = this.clockPaused ? 0 : (this.t.time.gameMinutesPerSecond * dt) / 60;
    this.clock = (this.clock + hours) % 24;
    if (this.weather.update(dt, hours)) this.emit({ type: 'lightning' });
    this.raining = this.weather.raining;
    this.wet = this.weather.wet;

    this.bike.snapshot();
    this.player.snapshot();
    for (const c of this.cars) c.snapshot();

    this.updateBike(intent);
    this.updatePlayerPre(intent);
    this.combat.update(intent, dt);
    this.traffic.update(dt);
    this.contracts.update(intent, dt);
    this.police.update(dt);
    for (const c of this.cars) c.drive(this.t, dt, this.wet);

    this.physics.step();

    const bikeImpact = this.postBike();
    this.postPlayer();
    this.postCars(dt);
    // cars hitting the player are judged by relative speed first; only then
    // does a hard bike impact count as the rider crashing on their own
    this.dangerChecks();
    if (this.player.mode === 'riding' && bikeImpact.impact > this.t.bike.crashImpactSpeed) this.throwRider(bikeImpact.impact, bikeImpact.before);
    this.peds.update(dt);
    this.pedHits();
    this.combat.postUpdate(dt);
    this.heat.update(dt);
  }

  private postCars(dt: number): void {
    const c = this.t.car;
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      const impact = car.afterPhysics();
      const spinning = car.spinT > 0;
      const threshold = spinning ? c.impactThreshold * c.spinThresholdMul : c.impactThreshold;
      if (impact > threshold && !car.dead) {
        const dmg = (impact - threshold) * c.impactDamage * (spinning ? c.spinImpactMul : 1);
        const credit = spinning || (car.lastHitBy === 'player' && this.time - car.lastHitTime < 5) ? 'player' : 'env';
        this.emit({ type: 'impact', x: car.x, y: car.y, z: 6, strength: impact });
        this.emit({ type: 'sparks', x: car.x, y: car.y, z: 5, count: Math.min(24, Math.round(impact / 12)) });
        if (credit === 'player' && car.kind !== 'civilian') car.lastHitTime = this.time;
        this.damageCar(car, dmg, 'env', 'crash');
        if (credit === 'player') {
          car.lastHitBy = 'player';
          if (car.dead) this.contracts.onCarKilled(car, true);
        }
      }
      if (car.burning && !car.dead) this.damageCar(car, c.burnDps * dt, 'env', null);
      if (car.dead) {
        car.deadT += dt;
        if (car.explodeT > 0) {
          car.explodeT -= dt;
          if (car.explodeT <= 0 && !car.exploded) {
            car.exploded = true;
            this.explode(car.x, car.y, this.city.heightAt(car.x, car.y) + 6, car);
            car.body.applyImpulse({ x: 0, y: 0, z: 0 }, true);
          }
        }
        if (car.deadT > c.wreckLife && dist(car.x, car.y, this.player.x, this.player.y) > 500) this.removeCar(car);
      }
    }
  }

  // ------------------------------------------------------------------ bike
  private updateBike(intent: Intent): void {
    const riding = this.player.mode === 'riding';
    const b = this.bike;
    if (b.auto) {
      // whistled over: the autopilot drives until it arrives
      const ctl = this.bikeCall.update(this.dt);
      if (b.auto) {
        b.control(ctl, this.dt, this.wet);
        setYaw(this.bikeBody, b.heading);
        this.bikeBody.setLinvel({ x: b.cmdX, y: b.cmdY, z: 0 }, true);
        return;
      }
    }
    if (b.riderless && (b.fallen || b.parked) && Math.abs(b.speed) < 1) {
      b.speed = 0;
      this.bikeBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      b.cmdX = b.cmdY = 0;
      if (b.fallen) b.fallT = Math.min(1, b.fallT + this.dt * 2.5);
      return;
    }
    b.control(riding ? intent : { steer: 0, throttle: 0, brake: 0, drift: false }, this.dt, this.wet);
    setYaw(this.bikeBody, b.heading);
    this.bikeBody.setLinvel({ x: b.cmdX, y: b.cmdY, z: 0 }, true);
  }

  private postBike(): { impact: number; before: number } {
    const b = this.bike;
    const v = this.bikeBody.linvel();
    const p = this.bikeBody.translation();
    const before = Math.abs(b.speed);
    const impact = b.resolve(v.x, v.y);
    b.x = p.x;
    b.y = p.y;
    b.z = this.city.heightAt(b.x, b.y);
    const c = fwdX(b.heading) * 6;
    const s = fwdY(b.heading) * 6;
    b.pitch = Math.atan2(this.city.heightAt(b.x + c, b.y + s) - this.city.heightAt(b.x - c, b.y - s), 12);

    if (impact > 30) {
      this.emit({ type: 'impact', x: b.x, y: b.y, z: b.z + 4, strength: impact });
      this.emit({ type: 'sparks', x: b.x + b.impactNX * 8, y: b.y + b.impactNY * 8, z: b.z + 3, count: Math.min(30, Math.round(impact / 8)) });
    }
    return { impact, before };
  }

  // ---------------------------------------------------------------- player
  private syncPlayerToBike(): void {
    const pl = this.player;
    pl.x = this.bike.x;
    pl.y = this.bike.y;
    pl.z = this.bike.z;
    if (!pl.firing) pl.facing = this.bike.heading;
    pl.vx = this.bike.cmdX;
    pl.vy = this.bike.cmdY;
  }

  private enableFoot(x: number, y: number, collision: number): void {
    this.footBody.setEnabled(true);
    this.footBody.setTranslation({ x, y, z: 0 }, true);
    // carry the player's current velocity so the first step does not read as a wall hit
    this.footBody.setLinvel({ x: this.player.vx, y: this.player.vy, z: 0 }, true);
    this.physics.setCollision(this.footBody, collision);
  }

  throwRider(impact: number, speedBefore: number, dirX?: number, dirY?: number): void {
    const pl = this.player;
    const t = this.t;
    const b = this.bike;
    if (pl.mode !== 'riding') return;
    b.riderless = true;
    b.parked = false;
    pl.setMode('air');
    pl.thrown = true;
    pl.leaping = false;
    const dx = dirX ?? Math.cos(b.velAngle);
    const dy = dirY ?? Math.sin(b.velAngle);
    const sp = Math.max(speedBefore, impact) * t.crash.throwFactor;
    pl.vx = dx * sp * 0.6;
    pl.vy = dy * sp * 0.6;
    pl.vz = t.crash.throwVz;
    pl.z = b.z + 6;
    pl.pendingLandDamage = Math.min(t.crash.maxDamage, t.crash.baseDamage + Math.max(0, impact - t.bike.crashImpactSpeed) * t.crash.damagePerUnit);
    this.enableFoot(b.x - Math.cos(b.velAngle) * 4, b.y - Math.sin(b.velAngle) * 4, COLLISION.air);
    this.emit({ type: 'crash', x: b.x, y: b.y, z: b.z, speed: impact });
  }

  hurtPlayer(amount: number): void {
    const pl = this.player;
    if (pl.mode === 'dead' || amount <= 0) return;
    pl.health -= amount;
    pl.sinceHurt = 0;
    this.emit({ type: 'playerHurt', amount });
    if (pl.health <= 0) this.killPlayer();
  }

  killPlayer(): void {
    const pl = this.player;
    pl.health = 0;
    if (pl.mode === 'riding') {
      this.bike.riderless = true;
      this.enableFoot(this.bike.x, this.bike.y, COLLISION.air);
    }
    if (pl.mode === 'roof') this.enableFoot(pl.x, pl.y, COLLISION.air);
    pl.setMode('dead');
    pl.roofCar = -1;
    pl.deadT = this.t.player.deathTime;
    pl.firing = false;
    this.emit({ type: 'playerDied' });
    this.emit({ type: 'toast', text: 'WASTED', tone: 'red', sub: `Medical bill $${this.t.player.respawnCashPenalty}` });
    this.contracts.onPlayerDied();
  }

  respawn(): void {
    const pl = this.player;
    const sp = this.spawnPoint();
    this.bikeCall.stop();
    this.bike.place(sp.x, sp.y, this.city.heightAt(sp.x, sp.y), sp.a);
    this.bike.riderless = false;
    this.bikeBody.setTranslation({ x: sp.x, y: sp.y, z: 0 }, true);
    this.bikeBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    setYaw(this.bikeBody, sp.a);
    this.footBody.setEnabled(false);
    pl.health = this.t.player.maxHealth;
    pl.ammo = this.t.gun.magazine;
    pl.reloadT = 0;
    pl.cash = Math.max(0, pl.cash - this.t.player.respawnCashPenalty);
    pl.thrown = false;
    pl.leaping = false;
    pl.roofCar = -1;
    pl.setMode('riding');
    this.heat.reset();
    this.police.clear();
    this.syncPlayerToBike();
    pl.snapshot();
    this.bike.snapshot();
    this.emit({ type: 'respawn' });
  }

  private mount(): void {
    const b = this.bike;
    this.bikeCall.stop();
    b.riderless = false;
    b.parked = false;
    b.fallen = false;
    b.fallT = 0;
    b.speed = 0;
    b.heading = b.velAngle = b.heading;
    this.footBody.setEnabled(false);
    this.player.setMode('riding');
    this.syncPlayerToBike();
    this.emit({ type: 'mount' });
  }

  private dismountOrLeap(): void {
    const pl = this.player;
    const b = this.bike;
    const t = this.t;
    b.riderless = true;
    pl.firing = false;
    if (b.speed >= t.leap.minSpeed) {
      pl.setMode('air');
      pl.leaping = true;
      pl.thrown = false;
      pl.vx = Math.cos(b.velAngle) * b.speed * t.leap.forwardFactor;
      pl.vy = Math.sin(b.velAngle) * b.speed * t.leap.forwardFactor;
      pl.vz = t.leap.launchVz;
      pl.z = b.z + 4;
      pl.facing = b.velAngle;
      this.enableFoot(b.x, b.y, COLLISION.air);
      this.emit({ type: 'dismount' });
    } else {
      // step off on the kerb side; the bike stays upright on its stand
      b.fallen = false;
      b.parked = true;
      const a = b.heading;
      pl.setMode('foot');
      pl.vx = 0;
      pl.vy = 0;
      pl.z = b.z;
      this.enableFoot(b.x + leftX(a) * 9, b.y + leftY(a) * 9, COLLISION.foot);
      this.emit({ type: 'dismount' });
    }
  }

  private updatePlayerPre(intent: Intent): void {
    const pl = this.player;
    const t = this.t;
    const dt = this.dt;
    pl.modeT += dt;
    pl.sinceHurt += dt;
    pl.hitCooldown = Math.max(0, pl.hitCooldown - dt);
    pl.whistleT = Math.max(0, pl.whistleT - dt);
    if (pl.mode !== 'dead' && pl.sinceHurt > t.player.regenDelay) pl.health = Math.min(t.player.maxHealth, pl.health + t.player.regenRate * dt);

    switch (pl.mode) {
      case 'riding':
        if (intent.jump || intent.interact) this.dismountOrLeap();
        break;
      case 'foot': {
        const m = Math.min(1, Math.hypot(intent.moveX, intent.moveY));
        const tx = intent.moveX * t.player.runSpeed;
        const ty = intent.moveY * t.player.runSpeed;
        const k = t.player.accel * dt;
        const dx = tx - pl.vx;
        const dy = ty - pl.vy;
        const d = Math.hypot(dx, dy);
        if (d <= k) {
          pl.vx = tx;
          pl.vy = ty;
        } else {
          pl.vx += (dx / d) * k;
          pl.vy += (dy / d) * k;
        }
        if (m > 0.1 && !pl.firing) {
          const want = Math.atan2(intent.moveY, intent.moveX);
          pl.facing += clamp(angleDiff(pl.facing, want), -t.player.turnRate * dt, t.player.turnRate * dt);
        }
        this.footBody.setLinvel({ x: pl.vx, y: pl.vy, z: 0 }, true);
        if (intent.interact || intent.jump) {
          if (dist(pl.x, pl.y, this.bike.x, this.bike.y) < t.player.remountRange) this.mount();
          else this.whistle();
        }
        break;
      }
      case 'air':
        pl.vz -= t.player.gravity * dt;
        this.footBody.setLinvel({ x: pl.vx, y: pl.vy, z: 0 }, true);
        break;
      case 'down':
        pl.vx *= Math.exp(-4 * dt);
        pl.vy *= Math.exp(-4 * dt);
        this.footBody.setLinvel({ x: pl.vx, y: pl.vy, z: 0 }, true);
        pl.downT -= dt;
        if (pl.downT <= 0) {
          pl.setMode('foot');
          this.physics.setCollision(this.footBody, COLLISION.foot);
        }
        break;
      case 'dead':
        pl.vx *= Math.exp(-3 * dt);
        pl.vy *= Math.exp(-3 * dt);
        if (this.footBody.isEnabled()) this.footBody.setLinvel({ x: pl.vx, y: pl.vy, z: 0 }, true);
        pl.deadT -= dt;
        if (pl.deadT <= 0) this.respawn();
        break;
      case 'roof': {
        pl.roofT -= dt;
        if (intent.jump || intent.interact) this.leaveRoof(false);
        else if (pl.roofT <= 0) {
          this.emit({ type: 'roofFail' });
          this.emit({ type: 'toast', text: 'THROWN OFF', tone: 'red' });
          this.leaveRoof(true);
        }
        break;
      }
    }
  }

  private postPlayer(): void {
    const pl = this.player;
    const dt = this.dt;
    if (pl.mode === 'riding') {
      this.syncPlayerToBike();
      return;
    }
    if (pl.mode === 'roof') {
      const car = this.carById(pl.roofCar);
      if (!car) {
        this.leaveRoof(false);
        return;
      }
      toWorld(car, pl.roofLX, pl.roofLY, tmpV);
      pl.x = tmpV.x;
      pl.y = tmpV.y;
      pl.z = this.city.heightAt(car.x, car.y) + car.spec.roof;
      pl.vx = car.vx;
      pl.vy = car.vy;
      pl.facing = car.a;
      return;
    }
    if (this.footBody.isEnabled()) {
      const p = this.footBody.translation();
      const v = this.footBody.linvel();
      pl.x = p.x;
      pl.y = p.y;
      if (pl.mode === 'air') {
        // keep the ballistic velocity unless a wall stopped us
        if (Math.abs(v.x - pl.vx) > 2) pl.vx = v.x;
        if (Math.abs(v.y - pl.vy) > 2) pl.vy = v.y;
      } else {
        pl.vx = v.x;
        pl.vy = v.y;
      }
    }
    const ground = this.city.heightAt(pl.x, pl.y) + (pl.mode === 'air' ? 0 : this.kerbAt(pl.x, pl.y));
    if (pl.mode === 'air') {
      pl.z += pl.vz * dt;
      if (pl.leaping && pl.vz < 0) {
        for (const car of this.cars) {
          if (car.dead) continue;
          const roof = this.city.heightAt(car.x, car.y) + car.spec.roof;
          if (pl.z <= roof + 1 && pl.z >= roof - 8 && obbContains(car, pl.x, pl.y, 3)) {
            this.landOnRoof(car);
            return;
          }
        }
      }
      if (pl.z <= ground) {
        pl.z = ground;
        this.land();
      }
    } else {
      pl.z = ground;
    }
  }

  /** Footpaths are raised by the kerb height. */
  private kerbAt(x: number, y: number): number {
    const H = this.city.half;
    const P = this.city.pitch;
    const lx = ((x % P) + P) % P;
    const ly = ((y % P) + P) % P;
    const onRoadX = lx < H || lx > P - H;
    const onRoadY = ly < H || ly > P - H;
    if (onRoadX || onRoadY) return 0;
    if (y < -H || y > this.city.northEdge || x < -H || x > this.city.size + H) return 0;
    return this.t.world.kerbHeight;
  }

  private landOnRoof(car: Car): void {
    const pl = this.player;
    toLocal(car, pl.x, pl.y, tmpV);
    pl.roofLX = clamp(tmpV.x, -car.spec.hl * 0.5, car.spec.hl * 0.5);
    pl.roofLY = clamp(tmpV.y, -car.spec.hw * 0.4, car.spec.hw * 0.4);
    pl.roofCar = car.id;
    pl.roofT = this.t.leap.roofTime;
    pl.leaping = false;
    pl.vz = 0;
    pl.setMode('roof');
    this.footBody.setEnabled(false);
    this.emit({ type: 'roofLand', car: car.id });
    this.emit({ type: 'toast', text: 'ON THE ROOF', tone: 'gold', sub: 'Strike now' });
    this.contracts.onCarAttacked(car);
    if (car.kind === 'civilian') this.traffic.disturb(car);
  }

  /** Leave the roof: thrown (failed) or a controlled hop. */
  leaveRoof(thrown: boolean): void {
    const pl = this.player;
    const car = this.carById(pl.roofCar);
    const a = car ? car.a : pl.facing;
    const side = this.rng.chance(0.5) ? 1 : -1;
    const sp = thrown ? this.t.leap.roofThrowSpeed : 50;
    pl.vx = (car?.vx ?? 0) * 0.5 + Math.cos(a + (side * Math.PI) / 2) * sp;
    pl.vy = (car?.vy ?? 0) * 0.5 + Math.sin(a + (side * Math.PI) / 2) * sp;
    pl.vz = thrown ? 40 : 55;
    pl.thrown = thrown;
    pl.pendingLandDamage = thrown ? this.t.leap.roofFailDamage : 0;
    pl.leaping = false;
    pl.roofCar = -1;
    pl.setMode('air');
    const ox = car ? car.x + Math.cos(a + (side * Math.PI) / 2) * (car.spec.hw + 6) : pl.x;
    const oy = car ? car.y + Math.sin(a + (side * Math.PI) / 2) * (car.spec.hw + 6) : pl.y;
    this.enableFoot(ox, oy, COLLISION.air);
    pl.x = ox;
    pl.y = oy;
  }

  private land(): void {
    const pl = this.player;
    const t = this.t;
    const hs = Math.hypot(pl.vx, pl.vy);
    let dmg = 0;
    if (pl.thrown) dmg = pl.pendingLandDamage;
    else if (hs > t.leap.safeLandSpeed) dmg = Math.min(t.leap.landDamageMax, (hs - t.leap.safeLandSpeed) * t.leap.landDamagePerUnit);
    const hard = pl.thrown || hs > t.leap.safeLandSpeed;
    pl.thrown = false;
    pl.leaping = false;
    pl.pendingLandDamage = 0;
    pl.vz = 0;
    this.emit({ type: 'land', x: pl.x, y: pl.y, hard });
    if (hard) {
      pl.setMode('down');
      pl.downT = t.player.knockdownTime;
      pl.vx *= 0.5;
      pl.vy *= 0.5;
    } else {
      pl.setMode('foot');
    }
    this.physics.setCollision(this.footBody, COLLISION.foot);
    if (dmg > 0) this.hurtPlayer(dmg);
  }

  /** Whistle for the bike: it rides itself over (BikeCall). */
  private whistle(): void {
    const pl = this.player;
    if (pl.whistleT > 0) return;
    pl.whistleT = this.t.bikeCall.whistleTime;
    this.emit({ type: 'whistle', x: pl.x, y: pl.y });
    if (!this.bike.auto) this.emit({ type: 'toast', text: 'BIKE ON THE WAY', tone: 'gold' });
    this.bikeCall.start();
  }

  // ---------------------------------------------------------------- danger
  /** Car versus player by relative speed: push, knock off and hurt, or kill. */
  private dangerChecks(): void {
    const pl = this.player;
    const t = this.t.danger;
    if (pl.mode === 'dead' || pl.mode === 'roof' || pl.mode === 'air' || pl.hitCooldown > 0) return;
    const riding = pl.mode === 'riding';
    const r = riding ? this.t.bike.radius + 2 : this.t.player.radius + 1.5;
    const hl = riding ? this.t.bike.halfLength : 0;
    const fx = Math.cos(this.bike.heading) * hl;
    const fy = Math.sin(this.bike.heading) * hl;
    const pvx = riding ? this.bike.cmdX : pl.vx;
    const pvy = riding ? this.bike.cmdY : pl.vy;
    for (const car of this.cars) {
      if (Math.abs(car.x - pl.x) > 60 || Math.abs(car.y - pl.y) > 60) continue;
      const d = riding ? Math.min(obbDistance(car, pl.x, pl.y), obbDistance(car, pl.x + fx, pl.y + fy), obbDistance(car, pl.x - fx, pl.y - fy)) : obbDistance(car, pl.x, pl.y);
      if (d > r) continue;
      let nx = pl.x - car.x;
      let ny = pl.y - car.y;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const rvx = car.vx - pvx;
      const rvy = car.vy - pvy;
      const closing = rvx * nx + rvy * ny;
      const carPart = car.vx * nx + car.vy * ny;
      if (closing < t.light) continue;
      // the player drove into a slow car: that is a crash, handled by the bike
      if (riding && carPart < closing * 0.45) continue;
      pl.hitCooldown = t.hitCooldown;
      if (car.kind === 'escort' || car.kind === 'police') car.backoffT = this.t.escort.backoffTime;
      this.emit({ type: 'impact', x: pl.x, y: pl.y, z: pl.z + 5, strength: closing });
      if (closing >= t.heavy) {
        if (riding) this.throwRider(closing, closing, nx, ny);
        else {
          pl.vx = nx * closing * 0.7;
          pl.vy = ny * closing * 0.7;
        }
        this.killPlayer();
        return;
      }
      const k = (closing - t.light) / (t.heavy - t.light);
      const dmg = t.mediumMinDamage + (t.mediumMaxDamage - t.mediumMinDamage) * k;
      if (riding) {
        this.throwRider(closing * 0.6, closing * 0.8, nx, ny);
        pl.pendingLandDamage = 0;
      } else {
        pl.setMode('down');
        pl.downT = this.t.player.knockdownTime;
        pl.vx = nx * closing * 0.6;
        pl.vy = ny * closing * 0.6;
      }
      this.hurtPlayer(dmg);
      return;
    }
  }

  /** Vehicles knocking pedestrians over. */
  private pedHits(): void {
    const kt = this.t.peds.knockSpeed;
    const b = this.bike;
    const bikeSpeed = Math.abs(b.speed);
    for (const p of this.peds.list) {
      if (!p.alive || p.state === 'down') continue;
      if (bikeSpeed > kt && dist(p.x, p.y, b.x, b.y) < 7) {
        this.peds.knock(p, b.cmdX, b.cmdY, this.player.mode === 'riding');
        continue;
      }
      for (const car of this.cars) {
        if (Math.abs(car.x - p.x) > 30 || Math.abs(car.y - p.y) > 30) continue;
        if (Math.abs(car.speed) > kt && obbDistance(car, p.x, p.y) < 2.5) {
          this.peds.knock(p, car.vx, car.vy, false);
          break;
        }
      }
    }
  }
}

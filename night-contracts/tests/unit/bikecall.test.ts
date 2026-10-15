/** E on foot whistles and the riderless bike rides itself over (sim/BikeCall). */
import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { clamp, dist } from '../../src/core/math';
import { emptyIntent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { Sim, type SimOptions } from '../../src/sim/Sim';
import { generateCity, type City } from '../../src/world/CityGenerator';

const t = cloneTuning();
let city: City;

beforeAll(async () => {
  await initPhysics();
  city = generateCity(t, t.world.seed);
});

/** Nearest point on a footpath (so the player is never inside a building). */
function footpath(sim: Sim, x: number, y: number): { x: number; y: number } {
  let best = { x, y };
  let bd = Infinity;
  for (const o of sim.city.footLoops) {
    const cx = clamp(x, o.minX, o.maxX);
    const cy = clamp(y, o.minY, o.maxY);
    const edges = [
      { x: o.minX, y: cy },
      { x: o.maxX, y: cy },
      { x: cx, y: o.minY },
      { x: cx, y: o.maxY },
    ];
    for (const p of edges) {
      const d = dist(x, y, p.x, p.y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
  }
  return best;
}

/** Step off the bike, then stand the player at (x, y). */
function onFootAt(sim: Sim, x: number, y: number): void {
  if (sim.player.mode === 'riding') {
    const off = emptyIntent();
    off.interact = true;
    sim.step(off);
  }
  expect(sim.player.mode).toBe('foot');
  sim.footBody.setTranslation({ x, y, z: 0 }, true);
  sim.player.x = x;
  sim.player.y = y;
  sim.step(emptyIntent());
}

interface Trip {
  arrived: boolean;
  seconds: number;
  /** Steps the bike spent inside a building footprint. */
  inside: number;
  /** Biggest single-step jump in position (a skip ahead). */
  maxJump: number;
}

/** Press E (the jump action on foot) and step until the bike arrives. */
function whistle(sim: Sim, seconds: number): Trip {
  const w = emptyIntent();
  w.jump = true;
  let px = sim.bike.x;
  let py = sim.bike.y;
  sim.step(w);
  const trip: Trip = { arrived: false, seconds: 0, inside: 0, maxJump: dist(px, py, sim.bike.x, sim.bike.y) };
  for (let k = 0; k < seconds * 60 && !trip.arrived; k++) {
    px = sim.bike.x;
    py = sim.bike.y;
    sim.step(emptyIntent());
    trip.maxJump = Math.max(trip.maxJump, dist(px, py, sim.bike.x, sim.bike.y));
    if (sim.events.some((e) => e.type === 'bikeArrived')) trip.arrived = true;
    if (sim.city.index.pointBlocked(sim.bike.x, sim.bike.y, -2) >= 0) trip.inside++;
    trip.seconds = k / 60;
  }
  return trip;
}

function expectReady(sim: Sim, trip: Trip): void {
  expect(trip.arrived).toBe(true);
  expect(trip.inside).toBe(0);
  expect(sim.bike.auto).toBe(false);
  expect(sim.bike.parked).toBe(true);
  expect(sim.bike.fallen).toBe(false);
  const d = dist(sim.bike.x, sim.bike.y, sim.player.x, sim.player.y);
  expect(d).toBeLessThan(t.player.remountRange);
  expect(d).toBeGreaterThan(4);
  // and E now gets you on
  const on = emptyIntent();
  on.jump = true;
  sim.step(on);
  expect(sim.player.mode).toBe('riding');
}

const bare = (o: SimOptions = {}): Sim => new Sim(t, { city, bare: true, ...o });

describe('Whistle for the bike', () => {
  it('rides over from up the street and stops beside you', () => {
    const sim = bare();
    const p = footpath(sim, sim.bike.x + 40, sim.bike.y + 330);
    onFootAt(sim, p.x, p.y);
    const trip = whistle(sim, 15);
    expectReady(sim, trip);
    expect(trip.maxJump).toBeLessThan(20);
  });

  it('turns corners to reach you a couple of blocks away', () => {
    const sim = bare();
    const p = footpath(sim, sim.bike.x + t.world.blockSize, sim.bike.y + t.world.blockSize);
    onFootAt(sim, p.x, p.y);
    const trip = whistle(sim, 20);
    expectReady(sim, trip);
    expect(trip.maxJump).toBeLessThan(20);
  });

  it('picks itself up after a crash', () => {
    const sim = bare();
    const go = emptyIntent();
    go.throttle = 1;
    for (let k = 0; k < 60 * 20 && sim.player.mode === 'riding'; k++) sim.step(go);
    expect(sim.bike.riderless).toBe(true);
    for (let k = 0; k < 60 * 4 && sim.player.mode !== 'foot'; k++) sim.step(emptyIntent());
    expect(sim.player.mode).toBe('foot');
    expect(sim.bike.fallen).toBe(true);
    // walk off a little way so it has to ride
    const p = footpath(sim, sim.player.x + 120, sim.player.y - 200);
    onFootAt(sim, p.x, p.y);
    const trip = whistle(sim, 20);
    expectReady(sim, trip);
  });

  it('from across the city it appears out of sight and rides in', () => {
    const sim = bare();
    const p = footpath(sim, sim.bike.x + t.world.blockSize * 5, sim.bike.y + t.world.blockSize * 4);
    onFootAt(sim, p.x, p.y);
    const trip = whistle(sim, 20);
    expectReady(sim, trip);
    expect(trip.maxJump).toBeGreaterThan(300);
  });

  it('gets through traffic', () => {
    const sim = new Sim(t, { city, trafficScale: 1, pedScale: 1 });
    for (let k = 0; k < 60 * 3; k++) sim.step(emptyIntent());
    const p = footpath(sim, sim.bike.x + t.world.blockSize, sim.bike.y + t.world.blockSize * 1.5);
    onFootAt(sim, p.x, p.y);
    const trip = whistle(sim, 30);
    expectReady(sim, trip);
  });

  it('whistling again only restarts the pose after it ends', () => {
    const sim = bare();
    const p = footpath(sim, sim.bike.x + 40, sim.bike.y + 330);
    onFootAt(sim, p.x, p.y);
    const w = emptyIntent();
    w.jump = true;
    sim.step(w);
    expect(sim.events.some((e) => e.type === 'whistle')).toBe(true);
    expect(sim.bike.auto).toBe(true);
    sim.step(emptyIntent());
    sim.step(w);
    expect(sim.events.some((e) => e.type === 'whistle')).toBe(false);
  });
});

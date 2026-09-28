import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { Heat } from '../../src/sim/Heat';
import { emptyIntent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { generateCity } from '../../src/world/CityGenerator';

const t = cloneTuning();
const city = generateCity(t);

beforeAll(async () => {
  await initPhysics();
});

function run(sim: Sim, seconds: number, each?: () => void): void {
  const i = emptyIntent();
  for (let k = 0; k < seconds * 60; k++) {
    sim.step(i);
    each?.();
  }
}

describe('Heat meter', () => {
  it('rises with crimes, caps at five stars and decays after a delay', () => {
    const events: number[] = [];
    const h = new Heat(t, (e) => e.type === 'heat' && events.push(e.stars));
    h.add(t.heat.killLoud);
    expect(h.stars).toBe(1);
    h.add(t.heat.civilianCarDestroyed);
    expect(h.stars).toBe(2);
    h.add(10);
    expect(h.stars).toBe(5);
    expect(events).toEqual([1, 2, 5]);
    for (let k = 0; k < 60 * (t.heat.decayDelay - 1); k++) h.update(1 / 60);
    expect(h.stars).toBe(5);
    for (let k = 0; k < 60 * 40; k++) h.update(1 / 60);
    expect(h.stars).toBe(0);
  });
  it('does not decay while the police can see you', () => {
    const h = new Heat(t, () => {});
    h.add(3);
    h.spotted = true;
    for (let k = 0; k < 60 * 30; k++) h.update(1 / 60);
    expect(h.stars).toBe(3);
  });
  it('can be switched off', () => {
    const tt = cloneTuning();
    tt.heat.enabled = false;
    const h = new Heat(tt, () => {});
    h.add(5);
    expect(h.stars).toBe(0);
  });
});

describe('Police', () => {
  it('sends cruisers at two stars that chase with sirens', () => {
    const sim = new Sim(t, { city, bare: true });
    sim.heat.add(2.2);
    run(sim, 6);
    const units = sim.police.units;
    expect(units.length).toBeGreaterThanOrEqual(t.heat.policeByStar[2]);
    expect(units.every((u) => u.mode === 'hunt' && u.siren)).toBe(true);
    // they close in on the player
    const d0 = Math.min(...units.map((u) => Math.hypot(u.x - sim.player.x, u.y - sim.player.y)));
    run(sim, 15);
    const d1 = Math.min(...sim.police.units.map((u) => Math.hypot(u.x - sim.player.x, u.y - sim.player.y)));
    expect(d1).toBeLessThan(d0);
  });

  it('shoots at three stars', () => {
    const sim = new Sim(t, { city, bare: true });
    sim.heat.add(3.5);
    let enemyShots = 0;
    run(sim, 40, () => {
      sim.heat.value = Math.max(sim.heat.value, 3.5);
      enemyShots += sim.events.filter((e) => e.type === 'shot' && e.by === 'enemy').length;
    });
    expect(enemyShots).toBeGreaterThan(0);
  });

  it('sets up roadblocks ahead at four stars', () => {
    const sim = new Sim(t, { city, bare: true });
    sim.heat.add(4.5);
    // ride north along a long street so there is an intersection ahead
    const i = emptyIntent();
    let roadblocks = 0;
    for (let k = 0; k < 60 * 4; k++) {
      i.throttle = sim.bike.speed < 150 ? 1 : 0;
      sim.heat.value = Math.max(sim.heat.value, 4.5);
      sim.step(i);
      roadblocks = Math.max(roadblocks, sim.cars.filter((c) => c.kind === 'police' && c.mode === 'roadblock').length);
    }
    expect(roadblocks).toBeGreaterThanOrEqual(1);
  });

  it('gives up when the heat drops out of sight', () => {
    const sim = new Sim(t, { city, bare: true });
    sim.heat.add(2.2);
    run(sim, 5);
    expect(sim.police.units.length).toBeGreaterThan(0);
    sim.heat.value = 1.2;
    run(sim, 60);
    expect(sim.police.units.filter((u) => u.mode === 'hunt').length).toBe(0);
  });

  it('spawns nothing with heat switched off', () => {
    const tt = cloneTuning();
    tt.heat.enabled = false;
    const sim = new Sim(tt, { city, bare: true });
    sim.heat.add(5);
    run(sim, 10);
    expect(sim.police.units.length).toBe(0);
  });

  it('a loud contract kill brings the police', () => {
    const sim = new Sim(t, { city, trafficScale: 0.5, pedScale: 0 });
    const i = emptyIntent();
    for (let k = 0; k < 60 * 120 && sim.contracts.state !== 'meeting'; k++) {
      i.answer = sim.contracts.state === 'ringing';
      sim.step(i);
    }
    expect(sim.contracts.state).toBe('meeting');
    // spray the gun for a bit (loud), then finish the target with it
    const fire = emptyIntent();
    fire.fire = true;
    for (let k = 0; k < 60 * 2; k++) sim.step(fire);
    sim.damageCar(sim.contracts.target!, 999, 'player', 'gun');
    expect(sim.heat.stars).toBeGreaterThanOrEqual(2);
    run(sim, 8);
    expect(sim.police.units.length).toBeGreaterThan(0);
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { dist } from '../../src/core/math';
import type { ContractState } from '../../src/sim/Contracts';
import { emptyIntent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { loopScale, payout } from '../../src/sim/Scoring';
import { Sim } from '../../src/sim/Sim';
import { generateCity, placeByName } from '../../src/world/CityGenerator';

const t = cloneTuning();
const city = generateCity(t);

beforeAll(async () => {
  await initPhysics();
});

function makeSim(opts: { contractIndex?: number; loop?: number } = {}): Sim {
  const sim = new Sim(t, { city, pedScale: 0, trafficScale: 0.5, ...opts });
  sim.heat.enabled = false;
  return sim;
}

/** Step until the contract reaches a state (or time runs out). Returns the states seen. */
function until(sim: Sim, state: ContractState, seconds: number, answer = true): ContractState[] {
  const seen: ContractState[] = [sim.contracts.state];
  const i = emptyIntent();
  for (let k = 0; k < seconds * 60; k++) {
    i.answer = answer && sim.contracts.state === 'ringing';
    sim.step(i);
    if (seen[seen.length - 1] !== sim.contracts.state) seen.push(sim.contracts.state);
    if (sim.contracts.state === state) break;
  }
  return seen;
}

describe('Scoring', () => {
  it('applies the kill method multipliers and civilian penalty', () => {
    expect(payout(t, 12000, 'gun', 0).total).toBe(12000);
    expect(payout(t, 12000, 'blade', 0).total).toBe(18000);
    expect(payout(t, 12000, 'crash', 0).total).toBe(19200);
    expect(payout(t, 12000, 'roof', 0).total).toBe(24000);
    expect(payout(t, 12000, 'roof', 2).total).toBe(20000);
    expect(payout(t, 1000, 'gun', 5).total).toBe(0);
  });
  it('scales by 1.5x per loop', () => {
    expect(loopScale(t, 0)).toBe(1);
    expect(loopScale(t, 1)).toBe(1.5);
    expect(loopScale(t, 2)).toBeCloseTo(2.25);
  });
});

describe('Contract state machine', () => {
  it('rings, briefs, the target arrives and parks, then escapes if left alone', () => {
    const sim = makeSim();
    // keep the player out of the way at the safehouse
    const seen = until(sim, 'failed', 260);
    expect(seen).toEqual(['idle', 'ringing', 'briefed', 'arriving', 'meeting', 'moving', 'failed']);
    expect(sim.contracts.failReason).toBe('Target escaped');
    expect(sim.contracts.index).toBe(0);
  });

  it('parks the target near the meeting place', () => {
    const sim = makeSim();
    until(sim, 'meeting', 120);
    expect(sim.contracts.state).toBe('meeting');
    const place = placeByName(city, 'Casino Strip');
    const car = sim.contracts.target!;
    for (let k = 0; k < 90; k++) sim.step(emptyIntent());
    expect(dist(car.x, car.y, place.x, place.y)).toBeLessThan(260);
    expect(Math.abs(car.speed)).toBeLessThan(5);
    expect(sim.contracts.state).toBe('meeting');
  });

  it('pays out and advances when the target dies', () => {
    const sim = makeSim();
    until(sim, 'meeting', 120);
    const cash = sim.player.cash;
    const car = sim.contracts.target!;
    sim.damageCar(car, 999, 'player', 'blade');
    expect(sim.contracts.state).toBe('success');
    expect(sim.contracts.lastResult!.method).toBe('blade');
    expect(sim.player.cash - cash).toBe(18000);
    expect(sim.contracts.index).toBe(1);
    // next contract rings after the delay
    until(sim, 'ringing', t.contracts.nextDelay + 2, false);
    expect(sim.contracts.state).toBe('ringing');
    expect(sim.contracts.def.target).toBe('Lena Kasai');
  });

  it('alerts the target when the player gets close and the escorts hunt', () => {
    const sim = makeSim({ contractIndex: 1 });
    until(sim, 'meeting', 150);
    expect(sim.contracts.escorts.length).toBe(1);
    const car = sim.contracts.target!;
    // drop the player beside the target
    const x = car.x - Math.cos(car.a) * 80;
    const y = car.y - Math.sin(car.a) * 80;
    sim.bike.place(x, y, sim.city.heightAt(x, y), car.a);
    sim.bikeBody.setTranslation({ x, y, z: 0 }, true);
    sim.step(emptyIntent());
    sim.step(emptyIntent());
    expect(sim.contracts.alerted).toBe(true);
    expect(sim.contracts.state).toBe('moving');
    expect(sim.contracts.escorts[0].mode).toBe('hunt');
  });

  it('fails the contract if the player dies', () => {
    const sim = makeSim();
    until(sim, 'briefed', 30);
    sim.hurtPlayer(999);
    expect(sim.contracts.state).toBe('failed');
    expect(sim.contracts.failReason).toBe('You died');
  });

  it('loops after the third contract with 1.5x fee and HP', () => {
    const sim = makeSim({ contractIndex: 3, loop: 1 });
    expect(sim.contracts.def.target).toBe('Viktor Rane');
    expect(sim.contracts.fee).toBe(18000);
    until(sim, 'arriving', 90);
    expect(sim.contracts.target!.maxHp).toBe(180);
  });

  it('counts civilian cars destroyed during the contract against the fee', () => {
    const sim = makeSim();
    until(sim, 'briefed', 30);
    const civ = sim.cars.find((c) => c.kind === 'civilian' && !c.dead)!;
    sim.damageCar(civ, 999, 'player', 'gun');
    until(sim, 'meeting', 120);
    sim.damageCar(sim.contracts.target!, 999, 'player', 'gun');
    expect(sim.contracts.lastResult!.civilians).toBe(1);
    expect(sim.contracts.lastResult!.total).toBe(12000 - 2000);
  });
});

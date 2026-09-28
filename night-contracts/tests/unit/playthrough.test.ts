/**
 * The v0.1 definition of done, played through the sim: take the three
 * contracts in order with three different kill methods, get chased by the
 * police after the loud one, die and respawn, and see cash and heat change.
 */
import { beforeAll, expect, it } from 'vitest';
import { cloneTuning, type KillMethod } from '../../src/config/tuning';
import { rightX, rightY } from '../../src/core/math';
import type { Car } from '../../src/sim/Car';
import type { ContractState } from '../../src/sim/Contracts';
import { emptyIntent, type Intent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';

const t = cloneTuning();

beforeAll(async () => {
  await initPhysics();
});

function waitFor(sim: Sim, state: ContractState, seconds: number): void {
  const i = emptyIntent();
  for (let k = 0; k < seconds * 60 && sim.contracts.state !== state; k++) {
    i.answer = sim.contracts.state === 'ringing';
    sim.step(i);
  }
  expect(sim.contracts.state).toBe(state);
}

function placeBike(sim: Sim, x: number, y: number, a: number, speed: number): void {
  sim.bike.place(x, y, sim.city.heightAt(x, y), a);
  sim.bike.speed = speed;
  sim.bike.velAngle = a;
  sim.bikeBody.setTranslation({ x, y, z: 0 }, true);
  sim.player.x = x;
  sim.player.y = y;
}

it('three contracts, three kill methods, a police chase, a death and a respawn', () => {
  const sim = new Sim(t, { trafficScale: 0.4, pedScale: 0, cash: 2500 });
  const methods: KillMethod[] = [];
  const payouts: number[] = [];
  const record = (): void => {
    for (const e of sim.events) {
      if (e.type === 'targetDown') {
        methods.push(e.method);
        payouts.push(e.payout);
      }
    }
  };
  const step = (i: Intent = emptyIntent()): void => {
    sim.step(i);
    record();
  };

  // ---- contract 1: Viktor Rane, gunned down (loud)
  waitFor(sim, 'meeting', 150);
  let target = sim.contracts.target!;
  placeBike(sim, target.x - Math.cos(target.a) * 175, target.y - Math.sin(target.a) * 175, target.a, 0);
  const fire = emptyIntent();
  fire.fire = true;
  for (let k = 0; k < 60 * 20 && !target.dead; k++) {
    // keep the bike pointed at the target so aim assist holds it
    sim.bike.heading = Math.atan2(target.y - sim.bike.y, target.x - sim.bike.x);
    step(fire);
  }
  expect(target.dead).toBe(true);
  expect(methods[0]).toBe('gun');
  expect(sim.heat.stars).toBeGreaterThanOrEqual(2);
  for (let k = 0; k < 60 * 10 && sim.police.units.length === 0; k++) step();
  expect(sim.police.units.length).toBeGreaterThan(0);

  // ---- die and respawn
  const cashBeforeDeath = sim.player.cash;
  sim.hurtPlayer(999);
  expect(sim.player.mode).toBe('dead');
  for (let k = 0; k < Math.ceil(t.player.deathTime * 60) + 5; k++) step();
  expect(sim.player.mode).toBe('riding');
  expect(sim.player.cash).toBe(cashBeforeDeath - t.player.respawnCashPenalty);
  expect(sim.heat.stars).toBe(0);
  expect(sim.police.units.length).toBe(0);

  // ---- contract 2: Lena Kasai, blade work beside the SUV
  waitFor(sim, 'meeting', 150);
  target = sim.contracts.target!;
  expect(target.model).toBe('suv');
  const slash = emptyIntent();
  for (let k = 0; k < 60 * 20 && !target.dead; k++) {
    const side = target.spec.hw + 9;
    placeBike(sim, target.x + rightX(target.a) * side, target.y + rightY(target.a) * side, target.a, Math.max(0, target.speed));
    slash.slash = k % 30 === 0;
    step(slash);
    if (sim.player.mode === 'dead') break;
  }
  expect(target.dead).toBe(true);
  expect(methods[1]).toBe('blade');

  // ---- contract 3: Judge Ormond, roof strike on the limo
  waitFor(sim, 'meeting', 160);
  // get back on the bike if the fight left us on foot
  for (let k = 0; k < 60 * 6 && sim.player.mode !== 'riding'; k++) {
    if (sim.player.mode === 'foot') {
      placeBike(sim, sim.player.x + 10, sim.player.y, 0, 0);
      const mount = emptyIntent();
      mount.interact = true;
      step(mount);
    } else step();
  }
  expect(sim.player.mode).toBe('riding');

  target = sim.contracts.target!;
  expect(target.model).toBe('limo');
  const car: Car = target;
  placeBike(sim, car.x - Math.cos(car.a) * 150, car.y - Math.sin(car.a) * 150, car.a, 260);
  const jump = emptyIntent();
  jump.jump = true;
  step(jump);
  const trace: string[] = [];
  for (let k = 0; k < 120 && sim.player.mode !== 'roof'; k++) {
    step();
    if (k % 6 === 0) trace.push(`${k}:${sim.player.mode} z=${sim.player.z.toFixed(1)} p=${sim.player.x.toFixed(0)},${sim.player.y.toFixed(0)} car=${car.x.toFixed(0)},${car.y.toFixed(0)} hp=${sim.player.health.toFixed(0)}`);
  }
  if (sim.player.mode !== 'roof') console.log(trace.join('\n'));
  expect(sim.player.mode).toBe('roof');
  expect(sim.player.roofCar).toBe(car.id);
  const strike = emptyIntent();
  strike.slash = true;
  step(strike);
  expect(car.dead).toBe(true);
  expect(methods[2]).toBe('roof');

  // three different methods, cash reflects the payouts, the contracts loop
  expect(new Set(methods).size).toBe(3);
  expect(payouts[0]).toBe(12000);
  // blade work pays 1.5x, less $2,000 for any civilian car wrecked in the fight
  expect((37500 - payouts[1]) % t.scoring.civilianPenalty).toBe(0);
  expect(payouts[2]).toBeGreaterThan(0);
  expect(sim.player.cash).toBe(2500 + payouts[0] - t.player.respawnCashPenalty + payouts[1] + payouts[2]);
  expect(sim.contracts.index).toBe(3);
  expect(sim.contracts.loop).toBe(1);
}, 300_000);

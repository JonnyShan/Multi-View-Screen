import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning, KMH } from '../../src/config/tuning';
import { Bike } from '../../src/sim/Bike';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { emptyIntent } from '../../src/sim/Intent';

const t = cloneTuning();
const dt = 1 / 60;

describe('Bike handling curves', () => {
  it('accelerates briskly then tops out near 150 km/h', () => {
    const b = new Bike(t);
    let time100 = -1;
    for (let i = 0; i < 60 * 30; i++) {
      b.control({ steer: 0, throttle: 1, brake: 0, drift: false }, dt, 0);
      if (time100 < 0 && b.speed >= 100 * KMH) time100 = i * dt;
    }
    expect(time100).toBeGreaterThan(2.5);
    expect(time100).toBeLessThan(3.6);
    expect(b.speed / KMH).toBeGreaterThan(145);
    expect(b.speed / KMH).toBeLessThanOrEqual(150.5);
  });
  it('accel falls off with speed and steering authority drops', () => {
    const b = new Bike(t);
    expect(b.accelAt(0)).toBeGreaterThan(b.accelAt(200));
    expect(b.accelAt(t.bike.topSpeed)).toBeCloseTo(0);
    expect(b.steerRateAt(0)).toBe(0);
    expect(b.steerRateAt(80)).toBeGreaterThan(b.steerRateAt(500));
  });
  it('brakes to a stop then reverses slowly', () => {
    const b = new Bike(t);
    b.speed = 300;
    let i = 0;
    while (b.speed > 0 && i++ < 600) b.control({ steer: 0, throttle: 0, brake: 1, drift: false }, dt, 0);
    expect(i * dt).toBeLessThan(2);
    for (let k = 0; k < 300; k++) b.control({ steer: 0, throttle: 0, brake: 1, drift: false }, dt, 0);
    expect(b.speed).toBeLessThan(0);
    expect(b.speed).toBeGreaterThanOrEqual(-t.bike.reverseMax - 1e-6);
  });
  it('steering right increases heading and leans right', () => {
    const b = new Bike(t);
    b.speed = 200;
    for (let k = 0; k < 30; k++) b.control({ steer: 1, throttle: 0.5, brake: 0, drift: false }, dt, 0);
    expect(b.heading).toBeGreaterThan(0.2);
    expect(b.lean).toBeGreaterThan(0.1);
  });
  it('drift makes the velocity lag the heading and skids', () => {
    const b = new Bike(t);
    b.speed = 300;
    let maxSlip = 0;
    for (let k = 0; k < 40; k++) {
      b.control({ steer: 1, throttle: 1, brake: 0, drift: true }, dt, 0);
      maxSlip = Math.max(maxSlip, Math.abs(b.heading - b.velAngle));
    }
    expect(maxSlip).toBeGreaterThan(t.bike.skidAngle);
    expect(b.skidding).toBe(true);
  });
  it('wet roads reduce grip', () => {
    const dry = new Bike(t);
    const wet = new Bike(t);
    dry.speed = wet.speed = 300;
    let sd = 0;
    let sw = 0;
    for (let k = 0; k < 30; k++) {
      dry.control({ steer: 1, throttle: 0, brake: 0, drift: false }, dt, 0);
      wet.control({ steer: 1, throttle: 0, brake: 0, drift: false }, dt, 1);
      sd = Math.max(sd, Math.abs(dry.heading - dry.velAngle));
      sw = Math.max(sw, Math.abs(wet.heading - wet.velAngle));
    }
    expect(sw).toBeGreaterThan(sd);
  });
});

describe('Bike in the city', () => {
  beforeAll(async () => {
    await initPhysics();
  });
  it('rides forward and throws the rider on a hard wall hit', () => {
    const sim = new Sim(t);
    const i = emptyIntent();
    i.throttle = 1;
    let crashed = false;
    for (let k = 0; k < 60 * 20 && !crashed; k++) {
      sim.step(i);
      if (sim.events.some((e) => e.type === 'crash')) crashed = true;
    }
    // riding straight north from the safehouse ends at the north boundary wall
    expect(crashed).toBe(true);
    expect(sim.player.mode === 'air' || sim.player.mode === 'down').toBe(true);
    expect(sim.bike.riderless).toBe(true);
  });
  it('is deterministic for the same input log', () => {
    const run = (): string => {
      const sim = new Sim(t);
      const i = emptyIntent();
      for (let k = 0; k < 600; k++) {
        i.throttle = k % 120 < 90 ? 1 : 0;
        i.steer = Math.sin(k * 0.02);
        i.drift = k % 200 > 150;
        sim.step(i);
      }
      return [sim.bike.x, sim.bike.y, sim.bike.heading, sim.bike.speed].map((v) => v.toFixed(6)).join(',');
    };
    expect(run()).toBe(run());
  });
});

import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tuning } from '../../src/config/tuning';
import { CameraRig, wideFov } from '../../src/render/CameraRig';
import type { Sim } from '../../src/sim/Sim';

interface Ride {
  sim: Sim;
  step: (dt: number) => void;
  /** Speeding up in units/s2, negative brakes. */
  accel: number;
}

/** A bike riding north through an empty, flat city. */
function ridingSim(speed: number, yawRate = 0): Ride {
  const a = Math.PI / 2;
  const bike = { px: 0, py: 0, pz: 0, x: 0, y: 0, z: 0, speed, heading: a, velAngle: a, yawRate, lean: 0 };
  const sim = {
    player: { mode: 'riding', px: 0, py: 0, pz: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0 },
    bike,
    cars: [],
    city: { index: { raycast: () => -1 }, heightAt: () => 0 },
  } as unknown as Sim;
  const r: Ride = {
    sim,
    accel: 0,
    step: (dt) => {
      bike.speed = Math.max(0, bike.speed + r.accel * dt);
      bike.py = bike.y;
      bike.y += bike.speed * dt;
    },
  };
  return r;
}

/** Ride for `secs` at `hz` frames per second. */
function ride(rig: CameraRig, sim: Sim, step: (dt: number) => void, hz: number, secs: number): void {
  const dt = 1 / hz;
  for (let i = 0; i < Math.round(secs * hz); i++) {
    step(dt);
    rig.update(sim, 1, dt);
  }
}

/** Horizontal distance from the camera to the bike after a steady ride, then `secs` at `accel`. */
function trail(speed: number, hz: number, secs = 0, accel = 0): number {
  const rig = new CameraRig(tuning);
  const r = ridingSim(speed);
  ride(rig, r.sim, r.step, hz, 3);
  r.accel = accel;
  ride(rig, r.sim, r.step, hz, secs);
  return Math.hypot(rig.camera.position.x - r.sim.bike.x, rig.camera.position.z - r.sim.bike.y);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('wideFov', () => {
  it('leaves 16:9 and narrower screens alone', () => {
    expect(wideFov(62, 16 / 9, 16 / 9, 0.5)).toBe(62);
    expect(wideFov(62, 4 / 3, 16 / 9, 0.5)).toBe(62);
  });

  it('narrows the vertical angle on a wide phone, between holding height and holding width', () => {
    const aspect = 844 / 390;
    const v = wideFov(62, aspect, 16 / 9, 0.5);
    const holdWidth = wideFov(62, aspect, 16 / 9, 1);
    expect(v).toBeLessThan(62);
    expect(v).toBeGreaterThan(holdWidth);
    expect(v).toBeCloseTo(57.1, 1);
    // holding width gives the same horizontal angle as 16:9
    const h = (f: number, asp: number): number => Math.atan(Math.tan((f * Math.PI) / 360) * asp);
    expect(h(holdWidth, aspect)).toBeCloseTo(h(62, 16 / 9), 6);
  });
});

describe('chase camera', () => {
  it('holds the tuned distance at speed instead of trailing behind', () => {
    const c = tuning.camera;
    const top = tuning.bike.topSpeed;
    const want = c.distanceFast;
    for (const hz of [30, 60, 120]) {
      expect(trail(top, hz)).toBeCloseTo(want, 0);
    }
    expect(trail(0, 60)).toBeCloseTo(c.distance, 0);
  });
});

describe('chase camera feel', () => {
  it('eases back on the throttle and in on the brakes, the same at any frame rate', () => {
    const c = tuning.camera;
    // speed up from 0 for 2 s, then compare with a steady ride at the speed it reached
    const accel = 95;
    for (const hz of [30, 120]) {
      const pull = trail(0, hz, 2, accel) - trail(accel * 2, hz);
      expect(pull).toBeGreaterThan(accel * c.accelPull * 0.6);
      expect(pull).toBeLessThan(accel * c.accelPull + 0.1);
    }
    expect(trail(0, 30, 2, accel)).toBeCloseTo(trail(0, 120, 2, accel), 0);
    // hard braking from top speed for half a second pulls in by the full dive
    const top = tuning.bike.topSpeed;
    const speedAfter = top - 250 * 0.5;
    const dive = trail(speedAfter, 60) - trail(top, 60, 0.5, -250);
    expect(dive).toBeGreaterThan(c.brakeDiveMax * 0.5);
    expect(dive).toBeLessThan(c.brakeDiveMax + 1);
  });

  it('shakes by the same amount at any frame rate', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const offset = (hz: number): number[] => {
      const still = ridingSim(0);
      const none = (): void => {};
      const calm = new CameraRig(tuning);
      const shaken = new CameraRig(tuning);
      ride(calm, still.sim, still.step, hz, 1);
      ride(shaken, still.sim, none, hz, 1);
      shaken.shake(0.8);
      ride(calm, still.sim, still.step, hz, 0.2);
      ride(shaken, still.sim, none, hz, 0.2);
      const a = calm.camera.position;
      const b = shaken.camera.position;
      return [b.x - a.x, b.y - a.y, b.z - a.z];
    };
    const slow = offset(30);
    const fast = offset(120);
    expect(Math.hypot(...slow)).toBeGreaterThan(0.1);
    for (let i = 0; i < 3; i++) expect(fast[i]).toBeCloseTo(slow[i], 2);
  });

  it('looks a little toward the inside of a turn', () => {
    const c = tuning.camera;
    const yawOf = (yawRate: number): number => {
      const rig = new CameraRig(tuning);
      const r = ridingSim(100, yawRate);
      ride(rig, r.sim, r.step, 60, 3);
      const dir = rig.camera.getWorldDirection(new THREE.Vector3());
      return Math.atan2(dir.z, dir.x) - rig.yaw;
    };
    const straight = yawOf(0);
    // a positive yaw rate turns right, toward a larger yaw
    expect(yawOf(1) - straight).toBeGreaterThan(0.02);
    expect(yawOf(-1) - straight).toBeLessThan(-0.02);
    expect(yawOf(10) - straight).toBeLessThan(c.turnLookMax);
  });
});

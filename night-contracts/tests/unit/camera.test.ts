import { describe, expect, it } from 'vitest';
import { tuning } from '../../src/config/tuning';
import { CameraRig, wideFov } from '../../src/render/CameraRig';
import type { Sim } from '../../src/sim/Sim';

/** A bike riding north at a steady speed through an empty, flat city. */
function ridingSim(speed: number): { sim: Sim; step: (dt: number) => void } {
  const a = Math.PI / 2;
  const bike = { px: 0, py: 0, pz: 0, x: 0, y: 0, z: 0, speed, heading: a, velAngle: a, yawRate: 0, lean: 0 };
  const sim = {
    player: { mode: 'riding', px: 0, py: 0, pz: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0 },
    bike,
    cars: [],
    city: { index: { raycast: () => -1 }, heightAt: () => 0 },
  } as unknown as Sim;
  const step = (dt: number): void => {
    bike.py = bike.y;
    bike.y += speed * dt;
  };
  return { sim, step };
}

/** Horizontal distance from the camera to the bike after riding for `secs` at `hz`. */
function trail(speed: number, hz: number, secs = 3): number {
  const rig = new CameraRig(tuning);
  const { sim, step } = ridingSim(speed);
  const dt = 1 / hz;
  for (let i = 0; i < secs * hz; i++) {
    step(dt);
    rig.update(sim, 1, dt);
  }
  return Math.hypot(rig.camera.position.x - sim.bike.x, rig.camera.position.z - sim.bike.y);
}

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

import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { ContactShadows } from '../../src/render/ContactShadows';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { generateCity } from '../../src/world/CityGenerator';
import { lightingAt } from '../../src/world/DayNight';

const t = cloneTuning();
const city = generateCity(t);
const far = new THREE.Vector3(0, 5000, 0);

beforeAll(async () => {
  await initPhysics();
});

interface Blob {
  x: number;
  y: number;
  z: number;
  w: number;
  opacity: number;
}

function blobs(cs: ContactShadows): Blob[] {
  const out: Blob[] = [];
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const shape = cs.mesh.geometry.getAttribute('aShape');
  for (let i = 0; i < cs.mesh.count; i++) {
    cs.mesh.getMatrixAt(i, m);
    m.decompose(p, q, s);
    // three (x, y, z) back to sim (x, z, y)
    out.push({ x: p.x, y: p.z, z: p.y, w: s.x, opacity: shape.getY(i) });
  }
  return out;
}

/** The rider off the bike, `h` above the road beside it. */
function rider(sim: Sim, h: number): void {
  const pl = sim.player;
  pl.setMode(h > 0 ? 'air' : 'foot');
  pl.x = pl.px = sim.bike.x + 30;
  pl.y = pl.py = sim.bike.y;
  pl.z = pl.pz = city.heightAt(pl.x, pl.y) + sim.kerbAt(pl.x, pl.y) + h;
}

describe('Contact shadows', () => {
  it('puts a blob on the road under the bike', () => {
    const sim = new Sim(t, { city, bare: true });
    const cs = new ContactShadows();
    cs.update(sim, 1, lightingAt(23), far, false);
    const [b] = blobs(cs);
    expect(cs.mesh.count).toBe(1);
    expect(Math.hypot(b.x - sim.bike.x, b.y - sim.bike.y)).toBeLessThan(0.01);
    expect(b.z).toBeCloseTo(city.heightAt(b.x, b.y) + 0.35, 3);
  });

  it('fades and spreads as the rider leaves the ground, and goes on a long jump', () => {
    const sim = new Sim(t, { city, bare: true });
    const cs = new ContactShadows();
    const at = (h: number): Blob | undefined => {
      rider(sim, h);
      cs.update(sim, 1, lightingAt(23), far, false);
      return blobs(cs)[1];
    };
    const ground = at(0)!;
    const mid = at(20)!;
    expect(mid.opacity).toBeCloseTo(ground.opacity * 0.5, 3);
    expect(mid.w).toBeGreaterThan(ground.w);
    expect(Math.abs(mid.z - ground.z)).toBeLessThan(0.01);
    expect(at(45)).toBeUndefined();
  });

  it('leans away from the sun by day and stays put at night', () => {
    const sim = new Sim(t, { city, bare: true });
    const cs = new ContactShadows();
    const day = lightingAt(14);
    cs.update(sim, 1, day, far, false);
    const [b] = blobs(cs);
    const dx = b.x - sim.bike.x;
    const dy = b.y - sim.bike.y;
    expect(dx * day.lightDir[0] + dy * day.lightDir[1]).toBeLessThan(0);
    expect(Math.hypot(dx, dy)).toBeGreaterThan(0.5);
    expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(6.001);
    cs.update(sim, 1, lightingAt(23), far, false);
    const [n] = blobs(cs);
    expect(Math.hypot(n.x - sim.bike.x, n.y - sim.bike.y)).toBeLessThan(0.01);
  });
});

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { buildBikeModel } from '../../src/render/BikeView';
import { GlbRiderView } from '../../src/render/GlbRiderView';
import type { Sim } from '../../src/sim/Sim';

/** A bare Mixamo-style skeleton (no mesh), in game units. */
function rig(): THREE.Group {
  const root = new THREE.Group();
  const bone = (name: string, parent: THREE.Object3D, x: number, y: number, z: number): THREE.Bone => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    parent.add(b);
    return b;
  };
  const hips = bone('Hips', root, 0, 9, 0);
  const chest = bone('Spine', bone('Spine01', bone('Spine02', hips, 0, 0.8, 0), 0, 0.8, 0), 0, 0.8, 0);
  bone('Head', bone('Neck', chest, 0, 1.2, 0), 0, 0.8, 0);
  for (const [s, side] of [
    [1, 'Left'],
    [-1, 'Right'],
  ] as const) {
    bone(`${side}Hand`, bone(`${side}ForeArm`, bone(`${side}Arm`, chest, s * 1.2, 0.9, 0), s * 2, 0, 0), s * 2, 0, 0);
    bone(`${side}ToeBase`, bone(`${side}Foot`, bone(`${side}Leg`, bone(`${side}UpLeg`, hips, s * 0.7, -0.4, 0), 0, -3.5, 0), 0, -3.5, 0), 0, -0.5, 1);
  }
  return root;
}

/** Riding at a steady lean and yaw rate, optionally firing out to one side. */
function riding(firing: boolean, yawRate = 0, lean = 0.7): Sim {
  return {
    player: { mode: 'riding', x: 0, y: 0, vx: 120, vy: 0, slashAnim: 1, firing, whistleT: 0, aimX: 0, aimY: 80 },
    bike: { lean, pLean: lean, heading: 0, yawRate },
  } as unknown as Sim;
}

/** The head's turn on `parent` (Neck or Spine, the chest). */
function headOn(scene: THREE.Object3D, parent: string): THREE.Quaternion {
  const head = scene.getObjectByName('Head')!;
  const p = scene.getObjectByName(parent)!;
  return p.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(head.getWorldQuaternion(new THREE.Quaternion()));
}

/** Update a rider `frames` times; `each` may change the sim before frame i and sees the scene after it. */
function ride(sim: Sim, frames: number, each?: (i: number, scene: THREE.Group) => void): THREE.Group {
  const scene = rig();
  const view = new GlbRiderView(buildBikeModel(false), scene, []);
  for (let i = 0; i < frames; i++) {
    view.update(sim, 1, 1 / 60);
    each?.(i, scene);
  }
  return scene;
}

/** The head's turn on the neck after `frames` updates. */
function headAfter(sim: Sim, frames: number): THREE.Quaternion {
  return headOn(ride(sim, frames), 'Neck');
}

/** Where the head looks, in world space (the model faces +z, so its right is -x). */
function headForward(scene: THREE.Object3D): THREE.Vector3 {
  return new THREE.Vector3(0, 0, 1).applyQuaternion(scene.getObjectByName('Head')!.getWorldQuaternion(new THREE.Quaternion()));
}

describe('Rider on the bike', () => {
  // three's mixer leaves a bone alone while its value is unchanged, so layers on a held pose used to pile up
  it('holds its head steady through a long corner', () => {
    const first = headAfter(riding(false), 10);
    for (const frames of [13, 40, 600]) expect(first.angleTo(headAfter(riding(false), frames))).toBeLessThan(1e-4);
  });

  it('holds its head steady while shooting through a corner', () => {
    const settled = headAfter(riding(true), 300);
    for (const frames of [303, 340, 600]) expect(settled.angleTo(headAfter(riding(true), frames))).toBeLessThan(1e-3);
  });

  it('glances a little into a right turn', () => {
    const straight = ride(riding(false), 120);
    const turning = ride(riding(false, 2), 120);
    const glance = headOn(straight, 'Spine').angleTo(headOn(turning, 'Spine'));
    expect(glance).toBeGreaterThan(0.1);
    expect(glance).toBeLessThan(0.16);
    expect(headForward(turning).x).toBeLessThan(headForward(straight).x);
  });

  it('looks along the aim, not the turn, while shooting', () => {
    const straight = headOn(ride(riding(true), 300), 'Spine');
    expect(straight.angleTo(headOn(ride(riding(true, 2), 300), 'Spine'))).toBeLessThan(1e-3);
  });

  it('settles into the same head motion through quick bends', () => {
    const still = headOn(ride(riding(false, 0, 0), 2), 'Spine');
    const sim = riding(false);
    const seen: THREE.Quaternion[] = [];
    let worst = 0;
    ride(sim, 600, (i, scene) => {
      const q = headOn(scene, 'Spine');
      seen.push(q);
      worst = Math.max(worst, still.angleTo(q));
      // flip the bend every half second
      const s = Math.floor((i + 1) / 30) % 2 ? -1 : 1;
      sim.bike.lean = sim.bike.pLean = 0.7 * s;
      sim.bike.yawRate = 2 * s;
    });
    expect(worst).toBeLessThan(0.6);
    expect(seen[119].angleTo(seen[599])).toBeLessThan(1e-3);
  });

  it('never turns its head far off the chest, whatever piles up', () => {
    const still = headOn(ride(riding(false, 0, 0), 2), 'Spine');
    // a lean no bike reaches, while shooting out to the side
    expect(still.angleTo(headOn(ride(riding(true, 3, 4), 60), 'Spine'))).toBeLessThan(1.2 + 1e-3);
  });
});

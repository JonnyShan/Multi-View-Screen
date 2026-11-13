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

/** Riding at a steady lean, optionally firing out to one side. */
function riding(firing: boolean): Sim {
  return {
    player: { mode: 'riding', x: 0, y: 0, vx: 120, vy: 0, slashAnim: 1, firing, whistleT: 0, aimX: 0, aimY: 80 },
    bike: { lean: 0.7, pLean: 0.7, heading: 0 },
  } as unknown as Sim;
}

/** The head's turn on the neck after `frames` updates. */
function headAfter(sim: Sim, frames: number): THREE.Quaternion {
  const scene = rig();
  const view = new GlbRiderView(buildBikeModel(false), scene, []);
  for (let i = 0; i < frames; i++) view.update(sim, 1, 1 / 60);
  const head = scene.getObjectByName('Head')!;
  const neck = scene.getObjectByName('Neck')!;
  return neck.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(head.getWorldQuaternion(new THREE.Quaternion()));
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
});

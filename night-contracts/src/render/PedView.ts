/** Instanced pedestrians: torso and head in one mesh, legs swinging in another. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Sim } from '../sim/Sim';
import { srgb, yawToThree } from './Shared';

const CLOTHES = [0xece6da, 0x2b4a6e, 0xb8322c, 0x3c5a4a, 0xd9a441, 0x1b1c20, 0x9fd3c7, 0xeeb8b0, 0x6f6a62, 0xf2c4a0];
const SKIN = [0xe8c4a0, 0xc99a70, 0x8a5a3a, 0x5a3a26, 0xf0d2b4];

export class PedView {
  readonly group = new THREE.Group();
  private readonly bodies: THREE.InstancedMesh;
  private readonly heads: THREE.InstancedMesh;
  private readonly legs: THREE.InstancedMesh;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly q2 = new THREE.Quaternion();
  private readonly p = new THREE.Vector3();
  private readonly s = new THREE.Vector3(1, 1, 1);
  private readonly c = new THREE.Color();
  private readonly yAxis = new THREE.Vector3(0, 1, 0);
  private readonly xAxis = new THREE.Vector3(1, 0, 0);

  constructor(capacity: number) {
    const torso = mergeGeometries([
      new THREE.CapsuleGeometry(1.25, 3.4, 3, 8).translate(0, 9.2, 0),
      new THREE.CapsuleGeometry(0.42, 3.6, 2, 6).translate(1.55, 9.0, 0),
      new THREE.CapsuleGeometry(0.42, 3.6, 2, 6).translate(-1.55, 9.0, 0),
    ])!;
    this.bodies = new THREE.InstancedMesh(torso, new THREE.MeshStandardMaterial({ roughness: 0.8 }), capacity);
    const head = new THREE.SphereGeometry(1.0, 10, 8).translate(0, 12.9, 0);
    this.heads = new THREE.InstancedMesh(head, new THREE.MeshStandardMaterial({ roughness: 0.7 }), capacity);
    const leg = new THREE.CapsuleGeometry(0.55, 5.4, 2, 6).translate(0, -3.3, 0);
    this.legs = new THREE.InstancedMesh(leg, new THREE.MeshStandardMaterial({ color: srgb(0x2a2b30), roughness: 0.85 }), capacity * 2);
    for (const im of [this.bodies, this.heads, this.legs]) {
      im.count = 0;
      im.frustumCulled = false;
      im.castShadow = true;
    }
    this.bodies.name = 'ped-bodies';
    this.heads.name = 'ped-heads';
    this.legs.name = 'ped-legs';
    this.group.add(this.bodies, this.heads, this.legs);
  }

  update(sim: Sim, alpha: number): void {
    let n = 0;
    let ln = 0;
    const cap = this.bodies.instanceMatrix.count;
    for (const p of sim.peds.list) {
      if (!p.alive || n >= cap) continue;
      const x = p.px + (p.x - p.px) * alpha;
      const y = p.py + (p.y - p.py) * alpha;
      this.q.setFromAxisAngle(this.yAxis, yawToThree(p.a));
      const down = p.state === 'down';
      if (down) this.q.multiply(this.q2.setFromAxisAngle(this.xAxis, -Math.PI / 2));
      const bob = down ? 1 : Math.abs(Math.sin(p.walkPhase)) * 0.5;
      this.p.set(x, p.z + bob, y);
      this.m.compose(this.p, this.q, this.s);
      this.bodies.setMatrixAt(n, this.m);
      this.bodies.setColorAt(n, this.c.setHex(CLOTHES[Math.floor(p.look * CLOTHES.length) % CLOTHES.length], THREE.SRGBColorSpace));
      this.heads.setMatrixAt(n, this.m);
      this.heads.setColorAt(n, this.c.setHex(SKIN[Math.floor(p.look * 97) % SKIN.length], THREE.SRGBColorSpace));
      for (const side of [-1, 1]) {
        const swing = down ? 0.2 * side : Math.sin(p.walkPhase) * 0.7 * side;
        const hip = new THREE.Vector3(side * 0.7, 6.8, 0).applyQuaternion(this.q).add(this.p);
        const lq = this.q.clone().multiply(this.q2.setFromAxisAngle(this.xAxis, swing));
        this.m.compose(hip, lq, this.s);
        this.legs.setMatrixAt(ln++, this.m);
      }
      n++;
    }
    for (const im of [this.bodies, this.heads]) {
      im.count = n;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
    this.legs.count = ln;
    this.legs.instanceMatrix.needsUpdate = true;
  }
}

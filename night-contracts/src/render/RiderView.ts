/**
 * The rider: black leathers, black full-face helmet, katana on his back and a
 * compact machine gun. Built in code as a rigidly skinned mesh so it renders
 * in two draw calls and poses through named bones (`hand_r` socket etc.), the
 * same way a rigged GLB would.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Sim } from '../sim/Sim';
import type { BikeModel } from './BikeView';
import { srgb, yawToThree } from './Shared';

const BONES: [name: string, parent: string | null, x: number, y: number, z: number][] = [
  ['hips', null, 0, 7.6, 0],
  ['spine', 'hips', 0, 0.9, 0],
  ['chest', 'spine', 0, 1.9, 0],
  ['neck', 'chest', 0, 1.8, 0],
  ['head', 'neck', 0, 0.6, 0],
  ['shoulder_l', 'chest', 1.55, 1.3, 0],
  ['elbow_l', 'shoulder_l', 0, -2.6, 0],
  ['hand_l', 'elbow_l', 0, -2.4, 0],
  ['shoulder_r', 'chest', -1.55, 1.3, 0],
  ['elbow_r', 'shoulder_r', 0, -2.6, 0],
  ['hand_r', 'elbow_r', 0, -2.4, 0],
  ['hip_l', 'hips', 0.8, -0.3, 0],
  ['knee_l', 'hip_l', 0, -3.3, 0],
  ['foot_l', 'knee_l', 0, -3.3, 0],
  ['hip_r', 'hips', -0.8, -0.3, 0],
  ['knee_r', 'hip_r', 0, -3.3, 0],
  ['foot_r', 'knee_r', 0, -3.3, 0],
];

type BoneName = (typeof BONES)[number][0];
type Pose = Partial<Record<BoneName, [number, number, number]>>;

const LEATHER = 0x121316;
const PANEL = 0x34373d;
const STITCH = 0x5a1414;

export interface RiderModel {
  root: THREE.Group;
  bones: Record<string, THREE.Bone>;
  katana: THREE.Group;
  saya: THREE.Mesh;
  gun: THREE.Group;
  muzzle: THREE.Object3D;
}

function piece(geo: THREE.BufferGeometry, boneIndex: number, color: number, m: THREE.Matrix4): THREE.BufferGeometry {
  const g = (geo.index ? geo.toNonIndexed() : geo).clone();
  g.applyMatrix4(m);
  g.deleteAttribute('uv');
  const n = g.getAttribute('position').count;
  const c = srgb(color);
  const col = new Float32Array(n * 3);
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
    si[i * 4] = boneIndex;
    sw[i * 4] = 1;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  return g;
}

/** Transform placing a Y-aligned primitive between two points. */
function between(a: THREE.Vector3, b: THREE.Vector3): THREE.Matrix4 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1));
}

export function buildRiderModel(): RiderModel {
  const root = new THREE.Group();
  root.name = 'rider';
  const bones: Record<string, THREE.Bone> = {};
  const list: THREE.Bone[] = [];
  const world: Record<string, THREE.Vector3> = {};
  for (const [name, parent, x, y, z] of BONES) {
    const b = new THREE.Bone();
    b.name = name;
    b.rotation.order = 'YXZ';
    b.position.set(x, y, z);
    bones[name] = b;
    list.push(b);
    if (parent) bones[parent].add(b);
    world[name] = new THREE.Vector3(x, y, z).add(parent ? world[parent] : new THREE.Vector3());
  }
  const idx = (n: string): number => list.indexOf(bones[n]);
  const W = (n: string): THREE.Vector3 => world[n].clone();
  const T = (x: number, y: number, z: number): THREE.Matrix4 => new THREE.Matrix4().makeTranslation(x, y, z);

  const suit: THREE.BufferGeometry[] = [];
  const shell: THREE.BufferGeometry[] = [];
  // torso
  suit.push(piece(new THREE.BoxGeometry(2.7, 1.7, 1.8), idx('hips'), LEATHER, T(0, 7.5, 0)));
  suit.push(piece(new THREE.CapsuleGeometry(1.05, 0.9, 4, 10), idx('spine'), LEATHER, T(0, 9.0, 0)));
  suit.push(piece(new THREE.BoxGeometry(3.1, 2.6, 1.95), idx('chest'), LEATHER, T(0, 10.9, 0.05)));
  suit.push(piece(new THREE.BoxGeometry(2.2, 1.9, 0.5), idx('chest'), PANEL, T(0, 10.9, 1.0)));
  // aero hump on the back
  suit.push(piece(new THREE.CapsuleGeometry(0.7, 1.2, 4, 8), idx('chest'), LEATHER, new THREE.Matrix4().makeRotationX(0.3).setPosition(0, 11.6, -1.0)));
  // spine protector stripe
  suit.push(piece(new THREE.BoxGeometry(0.5, 3.4, 0.2), idx('chest'), STITCH, T(0, 10.2, -1.0)));
  suit.push(piece(new THREE.CylinderGeometry(0.5, 0.55, 0.8, 8), idx('neck'), LEATHER, T(0, 12.3, 0)));
  for (const s of ['l', 'r'] as const) {
    const sx = s === 'l' ? 1 : -1;
    // shoulder armour
    suit.push(piece(new THREE.SphereGeometry(0.85, 10, 8), idx(`shoulder_${s}`), PANEL, T(sx * 1.6, 11.8, 0)));
    const sh = W(`shoulder_${s}`);
    const el = W(`elbow_${s}`);
    const ha = W(`hand_${s}`);
    suit.push(piece(new THREE.CapsuleGeometry(0.55, 1.8, 4, 8), idx(`shoulder_${s}`), LEATHER, between(sh, el)));
    suit.push(piece(new THREE.CapsuleGeometry(0.5, 1.7, 4, 8), idx(`elbow_${s}`), LEATHER, between(el, ha)));
    suit.push(piece(new THREE.SphereGeometry(0.52, 8, 6), idx(`elbow_${s}`), PANEL, T(el.x, el.y, el.z - 0.2)));
    suit.push(piece(new THREE.BoxGeometry(0.75, 1.0, 0.9), idx(`hand_${s}`), PANEL, T(ha.x, ha.y - 0.4, ha.z)));
    const hp = W(`hip_${s}`);
    const kn = W(`knee_${s}`);
    const ft = W(`foot_${s}`);
    suit.push(piece(new THREE.CapsuleGeometry(0.8, 2.3, 4, 10), idx(`hip_${s}`), LEATHER, between(hp, kn)));
    suit.push(piece(new THREE.CapsuleGeometry(0.62, 2.4, 4, 8), idx(`knee_${s}`), LEATHER, between(kn, ft)));
    // knee slider
    suit.push(piece(new THREE.BoxGeometry(0.9, 1.1, 0.5), idx(`knee_${s}`), PANEL, T(kn.x + sx * 0.25, kn.y, kn.z + 0.55)));
    // boot
    suit.push(piece(new THREE.BoxGeometry(0.95, 1.2, 2.1), idx(`foot_${s}`), 0x0a0a0c, T(ft.x, ft.y - 0.2, ft.z + 0.45)));
    // leg stripe
    suit.push(piece(new THREE.BoxGeometry(0.12, 2.8, 0.3), idx(`hip_${s}`), STITCH, T(hp.x + sx * 0.78, (hp.y + kn.y) / 2, 0)));
  }
  // helmet shell and visor on the head bone
  shell.push(piece(new THREE.SphereGeometry(1.32, 18, 14), idx('head'), 0x0b0b0d, T(0, 13.55, 0.05)));
  shell.push(piece(new THREE.BoxGeometry(1.9, 0.9, 1.0), idx('head'), 0x0b0b0d, T(0, 12.75, 0.75)));
  const visor = new THREE.SphereGeometry(1.36, 18, 10, Math.PI / 2 - 0.95, 1.9, 1.15, 0.7);
  shell.push(piece(visor, idx('head'), 0x1d2530, T(0, 13.55, 0.05)));
  // small spoiler
  shell.push(piece(new THREE.BoxGeometry(1.2, 0.25, 0.6), idx('head'), 0x0b0b0d, T(0, 14.6, -1.05)));

  const suitGeo = mergeGeometries(suit, false)!;
  const shellGeo = mergeGeometries(shell, false)!;
  const skeleton = new THREE.Skeleton(list);
  const suitMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.08 });
  const shellMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.1, metalness: 0.45 });
  const suitMesh = new THREE.SkinnedMesh(suitGeo, suitMat);
  const shellMesh = new THREE.SkinnedMesh(shellGeo, shellMat);
  suitMesh.add(bones.hips);
  root.add(suitMesh, shellMesh);
  root.updateMatrixWorld(true);
  suitMesh.bind(skeleton);
  shellMesh.bind(skeleton);
  for (const m of [suitMesh, shellMesh]) {
    m.frustumCulled = false;
    m.castShadow = true;
  }

  // katana: handle, tsuba and blade; sheathed on the back by default
  const katana = new THREE.Group();
  katana.name = 'katana';
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.15, metalness: 1, emissive: 0x223344, emissiveIntensity: 0.2 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 8.6, 0.42).translate(0, 5.1, 0), steel);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.6, 0.38).translate(0, -0.5, 0), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.8 }));
  const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 12).translate(0, 0.85, 0), new THREE.MeshStandardMaterial({ color: srgb(0xd9a441), metalness: 1, roughness: 0.3 }));
  katana.add(blade, handle, tsuba);
  const saya = new THREE.Mesh(new THREE.BoxGeometry(0.34, 8.8, 0.62).translate(0, 5.2, 0), new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.35, metalness: 0.3 }));
  saya.name = 'saya';
  bones.chest.add(saya);
  // diagonal across the back, handle over the right shoulder
  saya.position.set(-1.1, 2.0, -1.3);
  saya.rotation.set(0, 0, -Math.PI + 0.62);

  // compact machine gun
  const gun = new THREE.Group();
  gun.name = 'smg';
  const gm = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.45, metalness: 0.7 });
  gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 3.0).translate(0, 0, 0.6), gm));
  gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 0.55).translate(0, -1.0, 0.9), gm));
  gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.5).translate(0, -0.7, -0.3), gm));
  gun.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 6).rotateX(Math.PI / 2).translate(0, 0.15, 2.7), gm));
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, 0.15, 3.5);
  gun.add(muzzle);

  return { root, bones, katana, saya, gun, muzzle };
}

const POSES: Record<string, Pose> = {
  ride: {
    hips: [0.25, 0, 0],
    spine: [0.45, 0, 0],
    chest: [0.35, 0, 0],
    neck: [-0.55, 0, 0],
    head: [-0.35, 0, 0],
    shoulder_l: [-1.95, 0, 0.22],
    elbow_l: [0.45, 0, 0],
    shoulder_r: [-1.95, 0, -0.22],
    elbow_r: [0.45, 0, 0],
    hip_l: [-1.3, 0, 0.28],
    knee_l: [1.75, 0, 0],
    foot_l: [-0.35, 0, 0],
    hip_r: [-1.3, 0, -0.28],
    knee_r: [1.75, 0, 0],
    foot_r: [-0.35, 0, 0],
  },
  idle: {
    spine: [0.05, 0, 0],
    shoulder_l: [0.05, 0, 0.12],
    shoulder_r: [0.05, 0, -0.12],
    elbow_l: [-0.25, 0, 0],
    elbow_r: [-0.25, 0, 0],
  },
  air: {
    hips: [0.3, 0, 0],
    spine: [0.2, 0, 0],
    shoulder_l: [-0.6, 0, 1.3],
    shoulder_r: [-1.2, 0, -1.2],
    elbow_r: [-0.9, 0, 0],
    hip_l: [-1.4, 0, 0.2],
    knee_l: [1.9, 0, 0],
    hip_r: [-0.7, 0, -0.2],
    knee_r: [1.2, 0, 0],
  },
  roof: {
    hips: [0.4, 0, 0],
    spine: [0.4, 0, 0],
    neck: [-0.5, 0, 0],
    shoulder_l: [-0.9, 0, 0.6],
    shoulder_r: [-2.6, 0, -0.5],
    elbow_r: [-0.8, 0, 0],
    hip_l: [-1.6, 0, 0.35],
    knee_l: [2.3, 0, 0],
    foot_l: [-0.6, 0, 0],
    hip_r: [-1.2, 0, -0.35],
    knee_r: [2.2, 0, 0],
    foot_r: [-0.8, 0, 0],
  },
  down: {
    shoulder_l: [-0.3, 0, 1.4],
    shoulder_r: [0.4, 0, -1.2],
    hip_l: [-0.3, 0, 0.3],
    hip_r: [0.2, 0, -0.15],
    knee_l: [0.6, 0, 0],
    neck: [0.2, 0.5, 0],
  },
};

export class RiderView {
  readonly model: RiderModel;
  private runPhase = 0;
  private blend = new Map<string, THREE.Euler>();
  private katanaInHand = false;
  private gunInHand = false;
  private readonly tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');

  constructor(private readonly bike: BikeModel) {
    this.model = buildRiderModel();
    for (const [name] of BONES) this.blend.set(name, new THREE.Euler());
    this.holsterGun();
    this.sheathKatana();
  }

  private sheathKatana(): void {
    const k = this.model.katana;
    this.model.saya.add(k);
    k.position.set(0, -0.4, 0);
    k.rotation.set(0, 0, 0);
    this.katanaInHand = false;
  }

  private drawKatana(): void {
    const k = this.model.katana;
    this.model.bones.hand_r.add(k);
    k.position.set(0, -0.5, 0.3);
    k.rotation.set(Math.PI / 2 + 0.2, 0, 0);
    this.katanaInHand = true;
  }

  private holsterGun(): void {
    const g = this.model.gun;
    this.model.bones.hip_r.add(g);
    g.position.set(-0.95, -1.4, 0.1);
    g.rotation.set(Math.PI / 2, 0, 0);
    this.gunInHand = false;
  }

  private handGun(): void {
    const g = this.model.gun;
    this.model.bones.hand_r.add(g);
    g.position.set(0, -0.7, 0.4);
    g.rotation.set(Math.PI / 2, 0, 0);
    this.gunInHand = true;
  }

  private target(pose: Pose, out: Map<string, THREE.Euler>, w: number): void {
    for (const [name] of BONES) {
      const r = pose[name as BoneName] ?? [0, 0, 0];
      const e = out.get(name)!;
      e.x += (r[0] - e.x) * w;
      e.y += (r[1] - e.y) * w;
      e.z += (r[2] - e.z) * w;
    }
  }

  update(sim: Sim, alpha: number, dt: number): void {
    const pl = sim.player;
    const m = this.model;
    const riding = pl.mode === 'riding';
    // parent: bike lean pivot while riding, scene otherwise
    if (riding && m.root.parent !== this.bike.leanPivot) {
      this.bike.leanPivot.add(m.root);
    } else if (!riding && m.root.parent === this.bike.leanPivot) {
      this.bike.root.parent?.add(m.root);
    }

    const w = Math.min(1, dt * 14);
    const pose: Pose = {};
    const slashing = pl.slashAnim < 0.34;
    if (riding) {
      Object.assign(pose, POSES.ride);
      const lean = sim.bike.lean;
      pose.hips = [0.25, 0, -lean * 0.25];
      pose.chest = [0.35, 0, -lean * 0.2];
      pose.head = [-0.35, 0, lean * 0.4];
      m.root.position.set(-lean * 0.6, this.bike.seat.y - 7.6 + 0.1, this.bike.seat.z);
      m.root.rotation.set(0, 0, 0);
    } else {
      const x = pl.px + (pl.x - pl.px) * alpha;
      const y = pl.py + (pl.y - pl.py) * alpha;
      const z = pl.pz + (pl.z - pl.pz) * alpha;
      m.root.position.set(x, z, y);
      m.root.rotation.set(0, yawToThree(pl.facing), 0);
      const speed = Math.hypot(pl.vx, pl.vy);
      if (pl.mode === 'foot') {
        if (speed > 4) {
          this.runPhase += dt * (4 + speed * 0.16);
          const s = Math.sin(this.runPhase);
          const c = Math.cos(this.runPhase);
          const k = Math.min(1, speed / 45);
          pose.spine = [0.18 * k, 0, 0];
          pose.hip_l = [-s * 0.95 * k, 0, 0.04];
          pose.hip_r = [s * 0.95 * k, 0, -0.04];
          pose.knee_l = [Math.max(0, c) * 1.5 * k + 0.15, 0, 0];
          pose.knee_r = [Math.max(0, -c) * 1.5 * k + 0.15, 0, 0];
          pose.shoulder_l = [s * 0.8 * k, 0, 0.12];
          pose.shoulder_r = [-s * 0.8 * k, 0, -0.12];
          pose.elbow_l = [-0.9 * k - 0.2, 0, 0];
          pose.elbow_r = [-0.9 * k - 0.2, 0, 0];
          m.root.position.y += Math.abs(Math.sin(this.runPhase)) * 0.6 * k;
        } else Object.assign(pose, POSES.idle);
      } else if (pl.mode === 'air') {
        Object.assign(pose, POSES.air);
        if (pl.thrown) m.root.rotation.x = -Math.min(1.2, pl.modeT * 3);
      } else if (pl.mode === 'roof') {
        Object.assign(pose, POSES.roof);
      } else if (pl.mode === 'down' || pl.mode === 'dead') {
        Object.assign(pose, POSES.down);
        m.root.rotation.x = -Math.PI / 2;
        m.root.position.y += 1.2;
      }
    }

    // weapons
    const shooting = pl.firing && pl.mode !== 'dead' && pl.mode !== 'down';
    if (slashing) {
      if (!this.katanaInHand) this.drawKatana();
      const t = pl.slashAnim / 0.34;
      const sw = Math.sin(t * Math.PI);
      pose.shoulder_r = [-2.4 + t * 1.6, 0, -0.9 + t * 1.9];
      pose.elbow_r = [-0.6 + sw * 0.4, 0, 0];
      pose.chest = [(pose.chest?.[0] ?? 0) + 0.1, -0.5 + t * 1.0, pose.chest?.[2] ?? 0];
    } else if (this.katanaInHand) this.sheathKatana();

    if (shooting && !slashing) {
      if (!this.gunInHand) this.handGun();
      // aim yaw relative to the body
      const bodyYaw = riding ? sim.bike.heading : pl.facing;
      const aimYaw = Math.atan2(pl.aimY - pl.y, pl.aimX - pl.x);
      let rel = aimYaw - bodyYaw;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      rel = THREE.MathUtils.clamp(rel, -1.9, 1.9);
      const torsoPitch = riding ? 1.05 : 0.05;
      // increasing sim angle turns right; right of a +z model is -x which is a negative yaw about three y
      pose.chest = [pose.chest?.[0] ?? 0, -rel * 0.45, pose.chest?.[2] ?? 0];
      pose.shoulder_r = [-Math.PI / 2 - torsoPitch * 0.9, -rel * 0.55, riding ? -0.35 : -0.1];
      pose.elbow_r = [0, 0, 0];
    } else if (this.gunInHand && !shooting) this.holsterGun();

    this.target(pose, this.blend, w);
    for (const [name] of BONES) {
      const e = this.blend.get(name)!;
      this.tmpEuler.set(e.x, e.y, e.z);
      m.bones[name].rotation.copy(this.tmpEuler);
    }
  }
}

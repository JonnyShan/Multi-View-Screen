/**
 * The superbike: black and gunmetal fairings, thin gold pinstripes, red belly
 * pan. Built from code as a placeholder behind the AssetRegistry; a GLB with
 * `wheel_f`, `wheel_r` style nodes can replace it later.
 */
import * as THREE from 'three';
import type { Sim } from '../sim/Sim';
import { findNode } from './AssetRegistry';
import { srgb, yawToThree } from './Shared';

const BLACK = 0x0c0d10;
const GUNMETAL = 0x3a3d44;
const GOLD = 0xd9a441;
const RED = 0xe0262b;

export interface BikeModel {
  root: THREE.Group;
  /** Rotates with lean around the contact line. */
  leanPivot: THREE.Group;
  frontWheel: THREE.Object3D;
  rearWheel: THREE.Object3D;
  steer: THREE.Object3D;
  headlight: THREE.Mesh;
  taillight: THREE.Mesh;
  /** Where the rider's pelvis sits, in lean-pivot space. */
  seat: THREE.Vector3;
  /** Extra x rotation on the front wheel to undo the fork rake (code model only). */
  frontRake: number;
}

/**
 * Wrap a handed-off bike GLB. Uses nodes named wheel_f / wheel_r (or
 * wheel_front / wheel_rear), fork, light_head_l/r, light_tail_l/r and seat
 * when present; anything missing gets a sensible stand-in.
 */
export function bikeFromGlb(scene: THREE.Object3D): BikeModel {
  const root = new THREE.Group();
  root.name = 'bike';
  const leanPivot = new THREE.Group();
  root.add(leanPivot);
  leanPivot.add(scene);
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  const frontWheel = findNode(scene, 'wheel_f', 'wheel_front', 'wheel_fl') ?? new THREE.Object3D();
  const rearWheel = findNode(scene, 'wheel_r', 'wheel_rear', 'wheel_rl', 'wheel_rr') ?? new THREE.Object3D();
  const steer = findNode(scene, 'fork', 'steer', 'handlebar') ?? new THREE.Object3D();
  const lamp = (names: string[], color: THREE.Color, fallback: THREE.Vector3): THREE.Mesh => {
    const node = findNode(scene, ...names);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.25), new THREE.MeshBasicMaterial({ color }));
    if (node) {
      node.updateWorldMatrix(true, false);
      const p = new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
      leanPivot.worldToLocal(p);
      m.position.copy(p);
    } else m.position.copy(fallback);
    leanPivot.add(m);
    return m;
  };
  const headlight = lamp(['light_head_l', 'light_head', 'headlight'], new THREE.Color(4, 4, 3.6), new THREE.Vector3(0, 6.25, 8.05));
  const taillight = lamp(['light_tail_l', 'light_tail', 'taillight'], new THREE.Color(3.2, 0.12, 0.08), new THREE.Vector3(0, 8.25, -7.75));
  const seatNode = findNode(scene, 'seat');
  const seat = new THREE.Vector3(0, 7.7, -1.9);
  if (seatNode) {
    seatNode.updateWorldMatrix(true, false);
    seat.setFromMatrixPosition(seatNode.matrixWorld);
    leanPivot.worldToLocal(seat);
  }
  return { root, leanPivot, frontWheel, rearWheel, steer, headlight, taillight, seat, frontRake: 0 };
}

function sideShape(points: [number, number][]): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
  s.closePath();
  return s;
}

/** Extrude a side profile (z forward, y up) symmetrically across x. */
function profile(points: [number, number][], width: number, bevel = 0.6): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(sideShape(points), {
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 2,
    curveSegments: 4,
  });
  // shape lies in XY (x = our z forward, y = up); extrusion along +Z = our x
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2);
  return g;
}

export function buildBikeModel(physical: boolean): BikeModel {
  const root = new THREE.Group();
  root.name = 'bike';
  const leanPivot = new THREE.Group();
  root.add(leanPivot);

  const paint = physical
    ? new THREE.MeshPhysicalMaterial({ color: srgb(BLACK), roughness: 0.45, metalness: 0.05, clearcoat: 0.55, clearcoatRoughness: 0.12, envMapIntensity: 0.35 })
    : new THREE.MeshStandardMaterial({ color: srgb(BLACK), roughness: 0.42, metalness: 0.08, envMapIntensity: 0.35 });
  const gunmetal = new THREE.MeshStandardMaterial({ color: srgb(GUNMETAL), roughness: 0.35, metalness: 0.85 });
  const gold = new THREE.MeshStandardMaterial({ color: srgb(GOLD), roughness: 0.3, metalness: 1, emissive: srgb(GOLD), emissiveIntensity: 0.05 });
  const red = physical
    ? new THREE.MeshPhysicalMaterial({ color: srgb(RED), roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 })
    : new THREE.MeshStandardMaterial({ color: srgb(RED), roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: srgb(0x121212), roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: srgb(0x1a2430), roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55 });

  const R = 2.6; // wheel radius
  const wheelZ = 5.7;

  // main fairing, tank and tail
  const body = profile(
    [
      [8.1, 5.9],
      [7.2, 7.5],
      [5.8, 8.4],
      [3.2, 8.7],
      [1.2, 8.3],
      [-1.6, 7.5],
      [-3.6, 7.7],
      [-6.2, 8.6],
      [-7.7, 8.5],
      [-7.2, 7.6],
      [-4.6, 6.8],
      [-2.4, 5.6],
      [0.2, 4.4],
      [3.6, 4.2],
      [6.4, 4.4],
      [7.8, 5.1],
    ],
    3.3,
    0.7,
  );
  const bodyMesh = new THREE.Mesh(body, paint);
  bodyMesh.castShadow = true;
  leanPivot.add(bodyMesh);

  // gunmetal side panels over the tank
  const panel = profile(
    [
      [6.6, 6.6],
      [4.8, 7.6],
      [2.0, 7.7],
      [0.6, 6.0],
      [3.0, 5.2],
      [5.8, 5.3],
    ],
    3.55,
    0.35,
  );
  const panelMesh = new THREE.Mesh(panel, gunmetal);
  leanPivot.add(panelMesh);

  // red belly pan
  const belly = profile(
    [
      [5.8, 4.4],
      [3.4, 4.2],
      [0.3, 4.4],
      [-1.0, 3.4],
      [0.8, 2.3],
      [4.6, 2.4],
      [6.2, 3.3],
    ],
    3.0,
    0.5,
  );
  const bellyMesh = new THREE.Mesh(belly, red);
  leanPivot.add(bellyMesh);

  // gold pinstripes along both flanks
  const stripePts = [
    new THREE.Vector3(0, 6.9, 7.6),
    new THREE.Vector3(0, 7.4, 5.2),
    new THREE.Vector3(0, 7.25, 2.0),
    new THREE.Vector3(0, 6.9, -1.8),
    new THREE.Vector3(0, 7.4, -4.4),
    new THREE.Vector3(0, 7.95, -7.2),
  ];
  for (const side of [-1, 1]) {
    const pts = stripePts.map((p) => new THREE.Vector3(side * 1.78, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.TubeGeometry(curve, 40, 0.09, 4, false);
    leanPivot.add(new THREE.Mesh(tube, gold));
    const pts2 = stripePts.slice(0, 4).map((p) => new THREE.Vector3(side * 1.72, p.y - 0.45, p.z - 0.2));
    leanPivot.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 24, 0.06, 4, false), gold));
  }

  // seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 3.6).translate(0, 7.7, -2.4), new THREE.MeshStandardMaterial({ color: srgb(0x17181b), roughness: 0.8 }));
  seat.rotation.x = 0.08;
  leanPivot.add(seat);

  // windscreen
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 0.25), glass);
  screen.position.set(0, 9.0, 5.4);
  screen.rotation.x = -0.9;
  leanPivot.add(screen);

  // engine block and frame spars
  leanPivot.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 3.2).translate(0, 4.8, 1.6), gunmetal));
  const spar = new THREE.BoxGeometry(0.5, 0.9, 6.2);
  for (const side of [-1, 1]) {
    const m = new THREE.Mesh(spar, gunmetal);
    m.position.set(side * 1.45, 6.6, 1.7);
    m.rotation.x = -0.28;
    leanPivot.add(m);
  }
  // swingarm
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 5.8), gunmetal);
    arm.position.set(side * 1.1, 3.4, -2.9);
    arm.rotation.x = 0.14;
    leanPivot.add(arm);
  }
  // exhaust (right side is -x for a +z facing model)
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 4.6, 10), gunmetal);
  exhaust.rotation.x = Math.PI / 2 - 0.35;
  exhaust.position.set(-1.7, 4.8, -4.6);
  leanPivot.add(exhaust);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.8, 10), gold);
  tip.rotation.x = Math.PI / 2 - 0.35;
  tip.position.set(-1.7, 5.6, -6.8);
  leanPivot.add(tip);

  // lights
  const headlight = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 3.6) }));
  headlight.position.set(0, 6.25, 8.05);
  headlight.rotation.x = -0.3;
  leanPivot.add(headlight);
  const taillight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 0.12, 0.08) }));
  taillight.position.set(0, 8.25, -7.75);
  leanPivot.add(taillight);

  // steering: fork, bars, front wheel
  const steer = new THREE.Group();
  steer.position.set(0, 8.2, 4.3);
  // raked forward: the fork runs down and ahead of the steering head
  steer.rotation.x = -0.42;
  leanPivot.add(steer);
  const forkLen = (8.2 - R) / Math.cos(0.42);
  for (const side of [-1, 1]) {
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, forkLen, 8), gold);
    fork.position.set(side * 1.05, -forkLen / 2, 0);
    steer.add(fork);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 6), gunmetal);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(side * 1.9, 0.2, -0.3);
    steer.add(bar);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.2), paint);
    mirror.position.set(side * 2.3, 0.9, 0.6);
    steer.add(mirror);
  }

  const makeWheel = (): THREE.Group => {
    const w = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(R - 0.55, 0.62, 8, 20), rubber);
    tyre.rotation.y = Math.PI / 2;
    tyre.castShadow = true;
    w.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.95, R - 0.95, 0.45, 20, 1, true), gunmetal);
    rim.rotation.z = Math.PI / 2;
    w.add(rim);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 16), gold);
    disc.rotation.z = Math.PI / 2;
    w.add(disc);
    for (let k = 0; k < 5; k++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.2, R - 1, 0.35), gunmetal);
      spoke.position.y = (R - 1) / 2;
      const holder = new THREE.Group();
      holder.rotation.x = (k / 5) * Math.PI * 2;
      holder.add(spoke);
      w.add(holder);
    }
    return w;
  };
  const frontWheel = makeWheel();
  // place the front wheel at the fork bottom in steer space
  frontWheel.position.set(0, -forkLen, 0);
  // keep the wheel upright despite the rake
  frontWheel.rotation.order = 'YXZ';
  steer.add(frontWheel);
  const rearWheel = makeWheel();
  rearWheel.position.set(0, R, -wheelZ);
  leanPivot.add(rearWheel);

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });

  return { root, leanPivot, frontWheel, rearWheel, steer, headlight, taillight, seat: new THREE.Vector3(0, 7.7, -1.9), frontRake: 0.42 };
}

export class BikeView {
  readonly model: BikeModel;
  readonly spot: THREE.SpotLight;
  private steerVis = 0;

  constructor(physical: boolean, glb: THREE.Object3D | null = null) {
    this.model = glb ? bikeFromGlb(glb) : buildBikeModel(physical);
    this.spot = new THREE.SpotLight(0xf4f2ff, 0, 900, 0.5, 0.45, 1.3);
    this.spot.position.set(0, 6.4, 8.2);
    this.spot.target.position.set(0, 0, 60);
    this.model.leanPivot.add(this.spot, this.spot.target);
  }

  update(sim: Sim, alpha: number, dt: number, night: number): void {
    const b = sim.bike;
    const r = this.model.root;
    const x = b.px + (b.x - b.px) * alpha;
    const y = b.py + (b.y - b.py) * alpha;
    const z = b.pz + (b.z - b.pz) * alpha;
    let dh = b.heading - b.pHeading;
    if (dh > Math.PI) dh -= Math.PI * 2;
    if (dh < -Math.PI) dh += Math.PI * 2;
    const heading = b.pHeading + dh * alpha;
    const lean = b.pLean + (b.lean - b.pLean) * alpha;
    r.position.set(x, z, y);
    r.rotation.set(0, yawToThree(heading), 0);
    // pitch on ramps: positive sim pitch = nose up; model forward is +z so rotate about x negative
    this.model.leanPivot.rotation.set(-b.pitch, 0, 0);
    // lean: positive lean = right; right of a +z model is -x, rolling right is +z rotation
    const fall = b.fallen ? b.fallT : 0;
    this.model.leanPivot.rotation.z = lean + fall * 1.35 * Math.sign(lean || 1);
    const steerTarget = sim.player.mode === 'riding' ? THREE.MathUtils.clamp(b.yawRate * 0.12, -0.35, 0.35) : 0;
    this.steerVis += (steerTarget - this.steerVis) * Math.min(1, dt * 10);
    this.model.steer.rotation.y = -this.steerVis;
    this.model.frontWheel.rotation.x = b.wheelSpin + this.model.frontRake;
    this.model.rearWheel.rotation.x = b.wheelSpin;
    const on = !b.fallen;
    this.spot.intensity = on ? 2600 * (0.2 + night * 0.8) : 0;
    const brake = b.speed > 5 && sim.player.mode === 'riding' ? 1 : 0.6;
    (this.model.taillight.material as THREE.MeshBasicMaterial).color.setRGB(3.2 * brake, 0.12, 0.08);
  }
}

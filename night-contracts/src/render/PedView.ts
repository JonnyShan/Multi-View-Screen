/**
 * Pedestrians: instanced people built from rigid parts (torso and hips, a
 * head with one of four hairstyles, upper arms, forearms with hands, thighs,
 * shins with shoes), posed every frame with a walk or run cycle. One draw
 * call per part type. A per-instance palette colours skin, top, bottoms,
 * hair, shoes and an accent, so a crowd of a few dozen reads as individuals.
 * Some carry umbrellas in the rain; a few walk along on the phone.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Ped } from '../sim/Peds';
import type { Sim } from '../sim/Sim';
import { yawToThree } from './Shared';

// palette slots, resolved per vertex in the shader
const SKIN = 0;
const TOP = 1;
const BOTTOM = 2;
const HAIR = 3;
const SHOE = 4;
/** Top colour, or skin with short sleeves. */
const SLEEVE = 5;
/** Bottoms colour, or skin with shorts or a skirt. */
const SHIN = 6;
const DARK = 7;
const ACCENT = 8;
const SOLE = 9;
const LIP = 10;

const SKINS = [0xf3d6be, 0xe8bf9a, 0xd29c74, 0xb07650, 0x8a5636, 0x64391f, 0x4a2a17];
const HAIRS = [0x16110d, 0x16110d, 0x2d1d12, 0x4a2e1a, 0x6b3f22, 0x8e5a2e, 0xc9a266, 0xa9a39a, 0x2b6f73, 0x9c3b62];
const TOPS = [0xd8d4ca, 0x17181b, 0x3a3d44, 0x22324d, 0x9e2a2b, 0xc99a2e, 0x4c5a36, 0x1f6b6b, 0xc8b89a, 0x5e1f2c, 0x456c96, 0xd98a9e, 0xe07b39, 0x6a4c8c];
const BOTTOMS = [0x2c3c58, 0x2c3c58, 0x151618, 0x34363b, 0x8f8062, 0x1f2638, 0x5b5d63, 0x4a3326, 0xd9d4c8];
const SHOES = [0xd2cfc8, 0xd2cfc8, 0x121212, 0x121212, 0x4a2e1c, 0x7a7c80, 0xa3262a];
const ACCENTS = [0xd8d4ca, 0xd8d4ca, 0x17181b, 0xc99a2e, 0x9e2a2b, 0x1f6b6b, 0x456c96];

// skeleton (units, 8 = 1 m): feet at y = 0, facing +z, left is +x
const HIP_X = 0.62;
const HIP_Y = 7.0;
const THIGH = 3.55;
const SHIN_LEN = 3.0;
const UPPER_ARM = 2.45;
const FOREARM = 2.15;
const NECK_Y = 12.15;
const SHOULDER = { broad: { x: 1.44, y: 11.25 }, slim: { x: 1.3, y: 11.1 } };

type Build = 'broad' | 'slim';
type Hair = 'short' | 'long' | 'bun' | 'cap';
const HAIR_STYLES: Hair[] = ['short', 'long', 'bun', 'cap'];

interface Look {
  build: Build;
  hair: Hair;
  /** skin.rgb, shortSleeves, top.rgb, bareLegs, bottom.rgb, hair.rgb, shoe.rgb, accent.rgb */
  pal: Float32Array;
  scale: number;
  /** Limb thickness (side to side and front to back). */
  girth: number;
  umbrella: boolean;
  phone: boolean;
  /** Walk style: stride and arm swing. */
  stride: number;
  swing: number;
}

// --------------------------------------------------------------- geometry
/** Tag a primitive with a palette slot and bake a transform. */
function part(geo: THREE.BufferGeometry, slot: number, m?: THREE.Matrix4): THREE.BufferGeometry {
  if (m) geo.applyMatrix4(m);
  geo.deleteAttribute('uv');
  const n = geo.getAttribute('position').count;
  geo.setAttribute('slot', new THREE.BufferAttribute(new Float32Array(n).fill(slot), 1));
  return geo;
}

const T = (x: number, y: number, z: number): THREE.Matrix4 => new THREE.Matrix4().makeTranslation(x, y, z);
const TRS = (x: number, y: number, z: number, rx: number, ry: number, rz: number, sx = 1, sy = 1, sz = 1): THREE.Matrix4 =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));

/** Surface of revolution from [radius, y] pairs listed bottom to top, squashed front to back. */
function lathe(profile: [number, number][], segs: number, sz: number): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segs,
  );
  g.scale(1, 1, sz);
  return g;
}

/** A tapered limb hanging from its joint at the origin down to -len, with round ends so bent joints stay closed. */
function limb(len: number, r0: number, r1: number, segs: number): THREE.BufferGeometry {
  return lathe(
    [
      [0.001, -len - r1],
      [r1 * 0.8, -len - r1 * 0.6],
      [r1, -len],
      [(r0 + r1) * 0.5, -len * 0.5],
      [r0, 0],
      [r0 * 0.8, r0 * 0.6],
      [0.001, r0],
    ],
    segs,
    1,
  );
}

function bodyGeometry(build: Build): THREE.BufferGeometry {
  const broad = build === 'broad';
  const sh = SHOULDER[build];
  const parts: THREE.BufferGeometry[] = [];
  const torso = broad
    ? lathe([[0.96, 8.1], [1.05, 8.5], [1.17, 9.2], [1.31, 9.9], [1.4, 10.6], [1.42, 11.0], [1.3, 11.36], [0.9, 11.62], [0.4, 11.78]], 12, 0.6)
    : lathe([[0.86, 8.15], [0.9, 8.6], [1.0, 9.3], [1.13, 9.95], [1.17, 10.45], [1.14, 10.9], [1.05, 11.2], [0.76, 11.48], [0.36, 11.64]], 12, 0.64);
  parts.push(part(torso, TOP));
  const hips = broad
    ? lathe([[0.001, 6.45], [0.55, 6.52], [0.88, 6.7], [1.0, 7.0], [1.04, 7.4], [1.0, 7.9], [0.93, 8.35]], 12, 0.66)
    : lathe([[0.001, 6.5], [0.55, 6.57], [0.92, 6.76], [1.06, 7.1], [1.08, 7.5], [0.97, 7.95], [0.84, 8.4]], 12, 0.68);
  parts.push(part(hips, BOTTOM));
  // shoulders round off where the arms join
  for (const s of [1, -1]) parts.push(part(new THREE.SphereGeometry(broad ? 0.45 : 0.4, 8, 5), TOP, T(s * (sh.x - 0.04), sh.y, 0)));
  parts.push(part(new THREE.CylinderGeometry(broad ? 0.33 : 0.29, broad ? 0.37 : 0.32, 1.0, 8, 1, true), SKIN, T(0, 11.85, 0.02)));
  if (broad) {
    // open jacket over a shirt, a collar and a belt
    parts.push(part(new THREE.BoxGeometry(0.46, 2.5, 0.12), ACCENT, TRS(0, 10.05, 0.8, -0.1, 0, 0)));
    parts.push(part(new THREE.CylinderGeometry(0.5, 0.58, 0.28, 10, 1, true), ACCENT, T(0, 11.62, 0.02)));
    parts.push(part(new THREE.CylinderGeometry(1.03, 1.03, 0.2, 12, 1, true), DARK, TRS(0, 8.3, 0, 0, 0, 0, 1, 1, 0.66)));
  } else {
    // a scoop neckline and a fitted waist band
    parts.push(part(new THREE.SphereGeometry(0.42, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), SKIN, TRS(0, 11.38, 0.5, -0.5, 0, 0, 1, 0.55, 0.5)));
    parts.push(part(new THREE.CylinderGeometry(0.91, 0.89, 0.18, 12, 1, true), ACCENT, TRS(0, 8.42, 0, 0, 0, 0, 1, 1, 0.66)));
  }
  return mergeGeometries(parts)!;
}

function headGeometry(hair: Hair): THREE.BufferGeometry {
  const p: THREE.BufferGeometry[] = [];
  // face and skull
  p.push(part(new THREE.SphereGeometry(0.8, 12, 9), SKIN, TRS(0, 0.88, 0.02, 0, 0, 0, 0.88, 1, 1.02)));
  p.push(part(new THREE.SphereGeometry(0.56, 8, 6), SKIN, TRS(0, 0.42, 0.14, 0, 0, 0, 0.9, 0.78, 0.95)));
  p.push(part(new THREE.BoxGeometry(0.16, 0.3, 0.22), SKIN, TRS(0, 0.7, 0.8, -0.25, 0, 0)));
  for (const s of [1, -1]) {
    p.push(part(new THREE.SphereGeometry(0.2, 5, 4), SKIN, TRS(s * 0.7, 0.8, -0.02, 0, 0, 0, 0.5, 1.2, 0.8)));
    p.push(part(new THREE.SphereGeometry(0.085, 5, 3), DARK, T(s * 0.26, 0.9, 0.72)));
    p.push(part(new THREE.BoxGeometry(0.28, 0.06, 0.1), HAIR, TRS(s * 0.26, 1.04, 0.74, 0, 0, s * -0.08)));
  }
  p.push(part(new THREE.BoxGeometry(0.3, 0.06, 0.06), LIP, T(0, 0.45, 0.68)));
  // hair: a cap tipped back so it clears the forehead and covers the nape
  const cap = new THREE.SphereGeometry(0.86, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.58);
  p.push(part(cap, HAIR, TRS(0, 0.92, -0.04, -0.42, 0, 0, 0.9, 1, 1.04)));
  if (hair === 'long') {
    p.push(part(new THREE.CapsuleGeometry(0.5, 1.3, 3, 8), HAIR, TRS(0, 0.18, -0.5, 0.08, 0, 0, 1.45, 1, 0.55)));
    for (const s of [1, -1]) p.push(part(new THREE.BoxGeometry(0.18, 1.05, 0.42), HAIR, TRS(s * 0.7, 0.42, 0.06, 0, 0, s * 0.06)));
  } else if (hair === 'bun') {
    p.push(part(new THREE.SphereGeometry(0.36, 8, 6), HAIR, T(0, 1.42, -0.52)));
  } else if (hair === 'cap') {
    p.push(part(new THREE.SphereGeometry(0.9, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), ACCENT, TRS(0, 1.02, 0, 0, 0, 0, 0.93, 0.78, 1.02)));
    p.push(part(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 12), ACCENT, TRS(0, 1.1, 0.78, 0.12, 0, 0, 1, 1, 1.25)));
  }
  return mergeGeometries(p)!;
}

function forearmGeometry(): THREE.BufferGeometry {
  return mergeGeometries([
    part(limb(FOREARM, 0.31, 0.24, 7), SLEEVE),
    // a mitten hand, thin side to side
    part(new THREE.SphereGeometry(1, 6, 5), SKIN, TRS(0, -FOREARM - 0.58, 0.03, 0, 0, 0, 0.17, 0.6, 0.34)),
  ])!;
}

function shinGeometry(): THREE.BufferGeometry {
  return mergeGeometries([
    part(limb(SHIN_LEN, 0.42, 0.28, 7), SHIN),
    part(new THREE.CapsuleGeometry(0.3, 1.25, 3, 8), SHOE, TRS(0, -SHIN_LEN - 0.12, 0.42, Math.PI / 2, 0, 0, 1.32, 1, 0.95)),
    part(new THREE.BoxGeometry(0.8, 0.1, 1.8), SOLE, T(0, -SHIN_LEN - 0.36, 0.42)),
  ])!;
}

function umbrellaGeometry(): THREE.BufferGeometry {
  return mergeGeometries([
    part(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 5, 1, true), DARK, T(0, 2.3, 0)),
    part(new THREE.ConeGeometry(2.7, 0.95, 8, 1, true), ACCENT, T(0, 4.35, 0)),
    part(new THREE.SphereGeometry(0.12, 5, 3), DARK, T(0, 4.85, 0)),
  ])!;
}

// --------------------------------------------------------------- material
function paletteMaterial(side: THREE.Side = THREE.FrontSide): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, side });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float slot;
attribute vec4 palSkin;
attribute vec4 palTop;
attribute vec3 palBottom;
attribute vec3 palHair;
attribute vec3 palShoe;
attribute vec3 palAccent;
varying vec3 vPal;
varying float vRough;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
int s = int(slot + 0.5);
vRough = 0.86;
if (s == ${SKIN}) { vPal = palSkin.rgb; vRough = 0.55; }
else if (s == ${TOP}) vPal = palTop.rgb;
else if (s == ${BOTTOM}) vPal = palBottom;
else if (s == ${HAIR}) { vPal = palHair; vRough = 0.5; }
else if (s == ${SHOE}) { vPal = palShoe; vRough = 0.45; }
else if (s == ${SLEEVE}) { vPal = mix(palTop.rgb, palSkin.rgb, palSkin.a); vRough = mix(0.86, 0.55, palSkin.a); }
else if (s == ${SHIN}) { vPal = mix(palBottom, palSkin.rgb, palTop.a); vRough = mix(0.86, 0.55, palTop.a); }
else if (s == ${DARK}) { vPal = vec3(0.012, 0.011, 0.01); vRough = 0.3; }
else if (s == ${ACCENT}) vPal = palAccent;
else if (s == ${SOLE}) { vPal = vec3(0.52, 0.5, 0.47); vRough = 0.7; }
else { vPal = palSkin.rgb * vec3(0.66, 0.46, 0.44); vRough = 0.45; }`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vPal;
varying float vRough;`,
      )
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vPal;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = vRough;');
  };
  m.customProgramCacheKey = () => `ped-palette-${side}`;
  return m;
}

const PAL: [name: string, size: number][] = [
  ['palSkin', 4],
  ['palTop', 4],
  ['palBottom', 3],
  ['palHair', 3],
  ['palShoe', 3],
  ['palAccent', 3],
];

/** One instanced part with its per-instance palette. */
class Batch {
  readonly mesh: THREE.InstancedMesh;
  private readonly attrs: THREE.InstancedBufferAttribute[];
  private n = 0;

  constructor(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    private readonly cap: number,
    name: string,
  ) {
    this.attrs = PAL.map(([key, size]) => {
      const a = new THREE.InstancedBufferAttribute(new Float32Array(cap * size), size);
      a.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute(key, a);
      return a;
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, cap);
    this.mesh.name = name;
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = true;
  }

  begin(): void {
    this.n = 0;
  }

  push(m: THREE.Matrix4, pal: Float32Array): void {
    if (this.n >= this.cap) return;
    this.mesh.setMatrixAt(this.n, m);
    let o = 0;
    for (const a of this.attrs) {
      const arr = a.array as Float32Array;
      const size = a.itemSize;
      for (let k = 0; k < size; k++) arr[this.n * size + k] = pal[o + k];
      o += size;
    }
    this.n++;
  }

  end(): void {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    for (const a of this.attrs) a.needsUpdate = true;
  }
}

/** Deterministic 0..1 values from a ped's look seed. */
const hash = (look: number, k: number): number => {
  const v = Math.sin((look * 91.7 + k * 13.37) * 127.1) * 43758.5453;
  return v - Math.floor(v);
};

function makeLook(p: Ped): Look {
  const h = (k: number): number => hash(p.look, k);
  const pick = <T,>(list: readonly T[], k: number): T => list[Math.floor(h(k) * list.length) % list.length];
  const build: Build = h(1) < 0.5 ? 'broad' : 'slim';
  const r = h(2);
  const hair: Hair = build === 'broad' ? (r < 0.5 ? 'short' : r < 0.78 ? 'cap' : r < 0.9 ? 'bun' : 'long') : r < 0.45 ? 'long' : r < 0.7 ? 'bun' : r < 0.9 ? 'short' : 'cap';
  const c = new THREE.Color();
  const pal = new Float32Array(20);
  const put = (o: number, hex: number): void => {
    c.setHex(hex, THREE.SRGBColorSpace);
    pal[o] = c.r;
    pal[o + 1] = c.g;
    pal[o + 2] = c.b;
  };
  put(0, pick(SKINS, 3));
  pal[3] = h(4) < 0.4 ? 1 : 0; // short sleeves
  const top = pick(TOPS, 5);
  put(4, top);
  pal[7] = h(6) < (build === 'slim' ? 0.32 : 0.14) ? 1 : 0; // shorts or a skirt
  let bottom = pick(BOTTOMS, 7);
  if (bottom === top) bottom = BOTTOMS[0];
  put(8, bottom);
  put(11, pick(HAIRS, 8));
  put(14, pick(SHOES, 9));
  let accent = pick(ACCENTS, 10);
  if (accent === top) accent = top === 0xd8d4ca ? 0x17181b : 0xd8d4ca;
  put(17, accent);
  return {
    build,
    hair,
    pal,
    scale: (build === 'slim' ? 0.94 : 1) * (0.95 + h(11) * 0.1),
    girth: (build === 'slim' ? 0.95 : 1.12) * (0.94 + h(16) * 0.14),
    umbrella: h(12) < 0.6,
    phone: h(13) < 0.12,
    stride: 0.85 + h(14) * 0.3,
    swing: 0.7 + h(15) * 0.6,
  };
}

// ------------------------------------------------------------------- view
export class PedView {
  readonly group = new THREE.Group();
  private readonly bodies: Record<Build, Batch>;
  private readonly heads: Record<Hair, Batch>;
  private readonly upperArms: Batch;
  private readonly forearms: Batch;
  private readonly thighs: Batch;
  private readonly shins: Batch;
  private readonly umbrellas: Batch;
  private readonly batches: Batch[];
  private readonly looks = new Map<number, Look>();
  private readonly frustum = new THREE.Frustum();
  private readonly projView = new THREE.Matrix4();
  private readonly sphere = new THREE.Sphere();
  private readonly root = new THREE.Matrix4();
  private readonly local = new THREE.Matrix4();
  private readonly m = new THREE.Matrix4();
  private readonly ua = new THREE.Matrix4();
  private readonly th = new THREE.Matrix4();
  private readonly limbM = new THREE.Matrix4();
  private readonly e = new THREE.Euler();
  private readonly v = new THREE.Vector3();
  private readonly s = new THREE.Vector3();

  constructor(capacity: number) {
    const mat = paletteMaterial();
    const cap = capacity;
    this.bodies = { broad: new Batch(bodyGeometry('broad'), mat, cap, 'ped-body-broad'), slim: new Batch(bodyGeometry('slim'), mat, cap, 'ped-body-slim') };
    this.heads = Object.fromEntries(HAIR_STYLES.map((hs) => [hs, new Batch(headGeometry(hs), mat, cap, `ped-head-${hs}`)])) as Record<Hair, Batch>;
    this.upperArms = new Batch(part(limb(UPPER_ARM, 0.42, 0.33, 7), TOP), mat, cap * 2, 'ped-upper-arms');
    this.forearms = new Batch(forearmGeometry(), mat, cap * 2, 'ped-forearms');
    this.thighs = new Batch(part(limb(THIGH, 0.6, 0.43, 8), BOTTOM), mat, cap * 2, 'ped-thighs');
    this.shins = new Batch(shinGeometry(), mat, cap * 2, 'ped-shins');
    this.umbrellas = new Batch(umbrellaGeometry(), paletteMaterial(THREE.DoubleSide), cap, 'ped-umbrellas');
    this.batches = [...Object.values(this.bodies), ...Object.values(this.heads), this.upperArms, this.forearms, this.thighs, this.shins, this.umbrellas];
    for (const b of this.batches) this.group.add(b.mesh);
  }

  /** parent x T(x, y, z) x Rx(rx) x Rz(rz) */
  private joint(out: THREE.Matrix4, parent: THREE.Matrix4, x: number, y: number, z: number, rx: number, rz: number): THREE.Matrix4 {
    this.e.set(rx, 0, rz, 'XYZ');
    this.local.makeRotationFromEuler(this.e).setPosition(x, y, z);
    return out.multiplyMatrices(parent, this.local);
  }

  /** A limb matrix thickened by `g` across its length (children keep the unscaled joint). */
  private thick(src: THREE.Matrix4, g: number): THREE.Matrix4 {
    return this.limbM.copy(src).scale(this.s.set(g, 1, g));
  }

  update(sim: Sim, alpha: number, cam?: THREE.Camera, range = 900): void {
    for (const b of this.batches) b.begin();
    if (cam) {
      cam.updateMatrixWorld();
      this.frustum.setFromProjectionMatrix(this.projView.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    }
    const rain = sim.raining || sim.wet > 0.6;
    for (const p of sim.peds.list) {
      if (!p.alive) continue;
      const x = p.px + (p.x - p.px) * alpha;
      const y = p.py + (p.y - p.py) * alpha;
      if (cam) {
        if (cam.position.distanceToSquared(this.v.set(x, p.z + 7, y)) > range * range) continue;
        if (!this.frustum.intersectsSphere(this.sphere.set(this.v, 10))) continue;
      }
      let look = this.looks.get(p.id);
      if (!look) {
        look = makeLook(p);
        this.looks.set(p.id, look);
      }
      this.pose(p, look, x, y, rain);
    }
    for (const b of this.batches) b.end();
  }

  private pose(p: Ped, look: Look, x: number, y: number, rain: boolean): void {
    const down = p.state === 'down';
    const run = p.state === 'flee';
    const ph = p.walkPhase;
    const sn = Math.sin(ph);
    const cs = Math.cos(ph);
    const sh = SHOULDER[look.build];
    const pal = look.pal;

    // gait
    const legA = (run ? 0.8 : 0.42) * look.stride;
    const kneeA = run ? 1.45 : 0.6;
    const armA = (run ? 0.95 : 0.3) * (run ? 1 : look.swing);
    const elbow0 = run ? 1.35 : 0.22;
    const bob = down ? 0 : Math.abs(cs) * (run ? 0.45 : 0.16);
    const lean = run ? 0.22 : 0.03;

    const root = this.root;
    root.makeRotationY(yawToThree(p.a));
    root.setPosition(x, p.z + bob, y);
    if (down) {
      // flat on their back
      this.local.makeRotationX(-Math.PI / 2).setPosition(0, 1.0, 0);
      root.multiply(this.local);
    } else if (lean) root.multiply(this.local.makeRotationX(lean));
    root.scale(this.s.setScalar(look.scale));

    // body with a little side to side sway, head steady
    const sway = down ? 0 : sn * 0.035;
    this.joint(this.m, root, 0, 0, 0, 0, sway);
    this.bodies[look.build].push(this.m, pal);
    this.joint(this.m, root, 0, NECK_Y, 0, down ? 0 : -lean * 0.6 - 0.02 * Math.cos(ph * 2), -sway * 0.5);
    this.heads[look.hair].push(this.m, pal);

    // legs
    for (const side of [1, -1]) {
      const s = side === 1 ? sn : -sn;
      const c = side === 1 ? cs : -cs;
      const swing = down ? -0.1 - side * 0.05 : -s * legA;
      const knee = down ? 0.25 : 0.1 + kneeA * Math.max(0, c);
      this.joint(this.th, root, side * HIP_X, HIP_Y, 0, swing, down ? side * 0.18 : side * 0.02);
      this.thighs.push(this.thick(this.th, look.girth), pal);
      this.joint(this.m, this.th, 0, -THIGH, 0, knee, 0);
      this.shins.push(this.thick(this.m, look.girth), pal);
    }

    // arms: opposite to the legs; the right hand may hold an umbrella or a phone
    const umbrella = rain && look.umbrella && !down && !run;
    for (const side of [1, -1]) {
      const s = side === 1 ? sn : -sn;
      let swing = down ? -0.2 : s * armA;
      let abduct = down ? side * 1.25 : side * 0.1;
      let bend = down ? 0.3 : elbow0 + 0.25 * Math.max(0, -s);
      if (side === -1 && umbrella) {
        swing = -0.75;
        abduct = 0.18;
        bend = 1.3;
      } else if (side === -1 && look.phone && !down && !run) {
        swing = -1.0;
        abduct = 0.38;
        bend = 2.36;
      }
      this.joint(this.ua, root, side * sh.x, sh.y, 0, swing, abduct);
      this.upperArms.push(this.thick(this.ua, look.girth), pal);
      this.joint(this.m, this.ua, 0, -UPPER_ARM, 0, -bend, 0);
      this.forearms.push(this.thick(this.m, look.girth), pal);
      if (side === -1 && umbrella) {
        // shaft straight up from the hand
        this.v.set(0, -FOREARM - 0.5, 0.1).applyMatrix4(this.m);
        this.m.makeRotationY(yawToThree(p.a)).setPosition(this.v);
        this.m.scale(this.s.setScalar(look.scale));
        this.umbrellas.push(this.m, pal);
      }
    }
  }
}

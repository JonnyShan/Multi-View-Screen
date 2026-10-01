/**
 * Instanced cars: one body mesh per model (paint tinted per instance), shared
 * wheels, head and tail lights, headlight beams and ground pools, police light
 * bars, smoke and fire handled by FXView. No brand badges anywhere.
 */
import * as THREE from 'three';
import type { CarModel, CarSpec, Tuning } from '../config/tuning';
import type { Car } from '../sim/Car';
import type { Sim } from '../sim/Sim';
import type { AssetRegistry, CarAsset } from './AssetRegistry';
import { billboardMaterial, radialTexture } from './LampsView';
import { srgb, yawToThree } from './Shared';

const CAP = 48;
const MODELS: CarModel[] = ['sedan', 'suv', 'limo', 'police', 'hatch', 'ute', 'van'];

interface Shape {
  hood: number;
  trunk: number;
  belt: number;
  glassFront: number;
  glassRear: number;
  bed?: number;
}

const SHAPES: Record<CarModel, Shape> = {
  sedan: { hood: 9, trunk: 7, belt: 0.58, glassFront: 6.5, glassRear: 5 },
  police: { hood: 9, trunk: 7, belt: 0.58, glassFront: 6.5, glassRear: 5 },
  limo: { hood: 9.5, trunk: 7.5, belt: 0.6, glassFront: 6.5, glassRear: 5 },
  suv: { hood: 7.5, trunk: 1.2, belt: 0.56, glassFront: 5, glassRear: 1.5 },
  hatch: { hood: 6.5, trunk: 1.5, belt: 0.58, glassFront: 5.5, glassRear: 3 },
  ute: { hood: 7.5, trunk: 0, belt: 0.58, glassFront: 5, glassRear: 1.2, bed: 17 },
  van: { hood: 3.5, trunk: 0.6, belt: 0.44, glassFront: 5, glassRear: 0.5 },
};

function extrudeProfile(points: [number, number][], width: number, color: THREE.Color, bevel = 0.5): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 1, curveSegments: 2 });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2);
  const n = g.getAttribute('position').count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    col[i * 3] = color.r;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  return g.index ? g.toNonIndexed() : g;
}

function coloredBox(w: number, h: number, d: number, x: number, y: number, z: number, color: THREE.Color): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed();
  const n = g.getAttribute('position').count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([color.r, color.g, color.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  return g;
}

function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0;
  for (const p of parts) total += p.getAttribute('position').count;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  let o = 0;
  for (const p of parts) {
    const n = p.getAttribute('position').count;
    pos.set(p.getAttribute('position').array as Float32Array, o * 3);
    nor.set(p.getAttribute('normal').array as Float32Array, o * 3);
    col.set(p.getAttribute('color').array as Float32Array, o * 3);
    o += n;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return g;
}

/** Code-built placeholder body for a model, forward +Z, ground at y = 0. */
export function buildCarBody(model: CarModel, spec: CarSpec): THREE.BufferGeometry {
  const sh = SHAPES[model];
  const hl = spec.hl;
  const w = spec.hw * 2;
  const roof = spec.roof;
  const belt = roof * sh.belt;
  const paint = new THREE.Color(1, 1, 1);
  const glass = srgb(0x0b0e12);
  const trim = srgb(0x1a1b1e);
  const parts: THREE.BufferGeometry[] = [];
  const clearance = 1.6;
  // lower body with a sloped nose and tail
  parts.push(
    extrudeProfile(
      [
        [hl, clearance + 0.8],
        [hl + 0.2, belt - 1.6],
        [hl - sh.hood * 0.35, belt - 0.2],
        [hl - sh.hood, belt],
        [-hl + sh.trunk, belt + 0.2],
        [-hl + 0.2, belt - 0.6],
        [-hl, clearance + 0.8],
        [-hl + 2, clearance],
        [hl - 2, clearance],
      ],
      w,
      paint,
      0.6,
    ),
  );
  // greenhouse (dark glass) and roof panel
  const gf = hl - sh.hood;
  const gr = -hl + sh.trunk + (sh.bed ?? 0);
  const topF = gf - sh.glassFront;
  const topR = gr + sh.glassRear;
  parts.push(
    extrudeProfile(
      [
        [gf, belt - 0.2],
        [topF, roof - 0.5],
        [topR, roof - 0.5],
        [gr, belt - 0.2],
      ],
      w * 0.86,
      glass,
      0.4,
    ),
  );
  parts.push(coloredBox(w * 0.84, 0.7, Math.max(2, topF - topR), 0, roof - 0.35, (topF + topR) / 2, paint));
  // pillars between windows
  const pillarZ = (topF + topR) / 2;
  for (const s of [-1, 1]) parts.push(coloredBox(0.4, roof - belt - 0.4, 1.2, s * w * 0.43, (roof + belt) / 2, pillarZ, paint));
  // ute bed walls
  if (sh.bed) {
    const bz0 = -hl + 0.4;
    const bz1 = -hl + sh.bed;
    for (const s of [-1, 1]) parts.push(coloredBox(0.6, 2.2, sh.bed, s * (w / 2 - 0.4), belt + 1.1, (bz0 + bz1) / 2, paint));
    parts.push(coloredBox(w - 0.4, 2.2, 0.6, 0, belt + 1.1, bz0, paint));
    parts.push(coloredBox(w - 1.2, 0.3, sh.bed - 1, 0, belt + 0.1, (bz0 + bz1) / 2, trim));
  }
  // bumpers and grille (dark trim)
  parts.push(coloredBox(w * 0.96, 1.4, 1.0, 0, clearance + 1.2, hl, trim));
  parts.push(coloredBox(w * 0.96, 1.4, 1.0, 0, clearance + 1.2, -hl, trim));
  parts.push(coloredBox(w * 0.5, 1.2, 0.3, 0, belt - 2.4, hl + 0.25, trim));
  // side skirts
  for (const s of [-1, 1]) parts.push(coloredBox(0.5, 1.0, hl * 1.4, s * w * 0.49, clearance + 0.6, 0, trim));
  // police: dark lower doors and light bar base
  if (model === 'police') {
    for (const s of [-1, 1]) parts.push(coloredBox(0.3, belt - clearance - 1.2, hl * 0.9, s * (w / 2 + 0.05), (belt + clearance) / 2, -1, srgb(0x0f1012)));
    parts.push(coloredBox(w * 0.7, 0.8, 2.2, 0, roof + 0.4, (topF + topR) / 2 + 1, trim));
  }
  return mergeAll(parts);
}

/** Wheel positions (local x, y, z) for a spec. */
export function wheelPositions(spec: CarSpec): THREE.Vector3[] {
  const r = 2.8;
  const x = spec.hw - 1.4;
  const z = spec.wheelbase / 2;
  return [new THREE.Vector3(x, r, z), new THREE.Vector3(-x, r, z), new THREE.Vector3(x, r, -z), new THREE.Vector3(-x, r, -z)];
}

interface ModelMeshes {
  bodies: THREE.InstancedMesh[];
  /** Far bodies from a GLB that has them. */
  far: THREE.InstancedMesh[];
  /** A GLB's own wheels (near and far) and axles; code-built cars share `CarView.wheels`. */
  wheelNear: THREE.InstancedMesh | null;
  wheelFar: THREE.InstancedMesh | null;
  axles: THREE.Vector3[] | null;
  head: THREE.Vector3 | null;
  tail: THREE.Vector3 | null;
  nNear: number;
  nFar: number;
  wNear: number;
  wFar: number;
}

/** Past this distance a GLB car uses its far body and wheels. */
const LOD_DISTANCE = 360;

export class CarView {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<CarModel, ModelMeshes>();
  private readonly wheels: THREE.InstancedMesh;
  private readonly heads: THREE.InstancedMesh;
  private readonly tails: THREE.InstancedMesh;
  private readonly beams: THREE.InstancedMesh;
  private readonly pools: THREE.InstancedMesh;
  private readonly bars: THREE.InstancedMesh;
  private readonly sirenRed: THREE.InstancedMesh;
  private readonly sirenBlue: THREE.InstancedMesh;
  private readonly sirenOpacity = { value: 1 };
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly q2 = new THREE.Quaternion();
  private readonly s = new THREE.Vector3();
  private readonly p = new THREE.Vector3();
  private readonly c = new THREE.Color();
  private readonly yAxis = new THREE.Vector3(0, 1, 0);
  private readonly xAxis = new THREE.Vector3(1, 0, 0);
  private readonly zAxis = new THREE.Vector3(0, 0, 1);
  private readonly poolOpacity = { value: 1 };
  private time = 0;

  constructor(
    t: Tuning,
    assets: AssetRegistry,
    castShadow: boolean,
  ) {
    this.group.name = 'cars';
    const paintMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 0.55, envMapIntensity: 1.2 });
    const instanced = (part: { geometry: THREE.BufferGeometry; material: THREE.Material }, cap: number, shadow: boolean, name: string): THREE.InstancedMesh => {
      const im = new THREE.InstancedMesh(part.geometry, part.material, cap);
      im.count = 0;
      im.castShadow = shadow;
      im.frustumCulled = false;
      im.name = name;
      return im;
    };
    for (const model of MODELS) {
      const asset: CarAsset | null = assets.car(model);
      const bodies: THREE.InstancedMesh[] = [];
      const far: THREE.InstancedMesh[] = [];
      let wheelNear: THREE.InstancedMesh | null = null;
      let wheelFar: THREE.InstancedMesh | null = null;
      if (asset) {
        for (const part of asset.parts) bodies.push(instanced(part, CAP, castShadow, `car-${model}`));
        for (const part of asset.far ?? []) far.push(instanced(part, CAP, false, `car-${model}-far`));
        if (asset.wheel) {
          wheelNear = instanced(asset.wheel.near, CAP * 4, castShadow, `car-${model}-wheels`);
          if (asset.wheel.far) wheelFar = instanced(asset.wheel.far, CAP * 4, false, `car-${model}-wheels-far`);
        }
      } else {
        const im = new THREE.InstancedMesh(buildCarBody(model, t.car.specs[model]), paintMat, CAP);
        im.count = 0;
        im.castShadow = castShadow;
        im.receiveShadow = true;
        im.frustumCulled = false;
        im.name = `car-${model}`;
        bodies.push(im);
      }
      for (const b of [...bodies, ...far]) this.group.add(b);
      if (wheelNear) this.group.add(wheelNear);
      if (wheelFar) this.group.add(wheelFar);
      this.meshes.set(model, {
        bodies,
        far,
        wheelNear,
        wheelFar,
        axles: asset?.wheel?.axles ?? null,
        head: asset?.lights?.head ?? null,
        tail: asset?.lights?.tail ?? null,
        nNear: 0,
        nFar: 0,
        wNear: 0,
        wFar: 0,
      });
    }
    const wheelGeo = new THREE.CylinderGeometry(2.8, 2.8, 1.8, 12).rotateZ(Math.PI / 2);
    this.wheels = new THREE.InstancedMesh(wheelGeo, new THREE.MeshStandardMaterial({ color: srgb(0x141414), roughness: 0.85 }), CAP * 4 * 2);
    this.wheels.count = 0;
    this.wheels.frustumCulled = false;
    this.wheels.name = 'car-wheels';
    const lamp = new THREE.BoxGeometry(2.6, 1.0, 0.3);
    this.heads = new THREE.InstancedMesh(lamp, new THREE.MeshBasicMaterial({ color: 0xffffff }), CAP * 2 * 2);
    this.tails = new THREE.InstancedMesh(lamp, new THREE.MeshBasicMaterial({ color: 0xffffff }), CAP * 2 * 2);
    for (const im of [this.heads, this.tails]) {
      im.count = 0;
      im.frustumCulled = false;
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(im.instanceMatrix.count * 3), 3);
    }
    this.heads.name = 'car-headlights';
    this.tails.name = 'car-taillights';
    // headlight beams: soft additive cones
    const beamGeo = new THREE.CylinderGeometry(0.6, 9, 70, 10, 1, true).translate(0, -35, 0).rotateX(-Math.PI / 2);
    const beamMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: this.poolOpacity },
      vertexShader: /* glsl */ `
        varying float vK;
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          vK = clamp(position.z / 70.0, 0.0, 1.0);
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vK;
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          float edge = pow(abs(dot(vN, vV)), 2.0);
          float fade = (1.0 - vK) * (1.0 - vK);
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * edge * fade * uOpacity * 0.12, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.beams = new THREE.InstancedMesh(beamGeo, beamMat, CAP * 2);
    this.beams.count = 0;
    this.beams.frustumCulled = false;
    this.beams.name = 'car-beams';
    const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshBasicMaterial({
      map: radialTexture(),
      color: srgb(0xfff4e0).multiplyScalar(0.5),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -6,
    });
    this.pools = new THREE.InstancedMesh(poolGeo, poolMat, CAP);
    this.pools.count = 0;
    this.pools.frustumCulled = false;
    this.pools.name = 'car-light-pools';
    const barGeo = new THREE.BoxGeometry(3.2, 1.1, 1.8);
    this.bars = new THREE.InstancedMesh(barGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), CAP * 2);
    this.bars.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 2 * 3), 3);
    this.bars.count = 0;
    this.bars.frustumCulled = false;
    this.bars.name = 'police-bars';
    const quad = new THREE.PlaneGeometry(1, 1);
    this.sirenRed = new THREE.InstancedMesh(quad, billboardMaterial(new THREE.Color(1.6, 0.08, 0.05), this.sirenOpacity), CAP);
    this.sirenBlue = new THREE.InstancedMesh(quad, billboardMaterial(new THREE.Color(0.08, 0.3, 1.8), this.sirenOpacity), CAP);
    for (const im of [this.sirenRed, this.sirenBlue]) {
      im.count = 0;
      im.frustumCulled = false;
    }
    this.sirenRed.name = 'siren-red';
    this.sirenBlue.name = 'siren-blue';
    this.group.add(this.wheels, this.heads, this.tails, this.beams, this.pools, this.bars, this.sirenRed, this.sirenBlue);
  }

  update(sim: Sim, alpha: number, dt: number, night: number, camPos: THREE.Vector3): void {
    this.time += dt;
    const counts = new Map<CarModel, number>();
    for (const model of MODELS) counts.set(model, 0);
    let wi = 0;
    let hi = 0;
    let ti = 0;
    let bi = 0;
    let pi = 0;
    let bari = 0;
    let sr = 0;
    let sb = 0;
    const lightsOn = night > 0.25;
    this.poolOpacity.value = THREE.MathUtils.smoothstep(night, 0.2, 0.7);
    for (const mm of this.meshes.values()) mm.nNear = mm.nFar = mm.wNear = mm.wFar = 0;
    for (const car of sim.cars) {
      const k = counts.get(car.model)!;
      if (k >= CAP) continue;
      counts.set(car.model, k + 1);
      const x = car.px + (car.x - car.px) * alpha;
      const y = car.py + (car.y - car.py) * alpha;
      let da = car.a - car.pa;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      const a = car.pa + da * alpha;
      const z = sim.city.heightAt(x, y);
      // body roll into corners and a sag onto blown tyres
      const roll = THREE.MathUtils.clamp(car.w * car.speed * 0.00035, -0.06, 0.06);
      const sag = car.blownCount > 0 ? 0.04 * (car.blown[0] || car.blown[2] ? 1 : -1) : 0;
      this.q.setFromAxisAngle(this.yAxis, yawToThree(a));
      this.q2.setFromAxisAngle(this.zAxis, roll + sag);
      this.q.multiply(this.q2);
      this.p.set(x, z, y);
      this.m.compose(this.p, this.q, this.s.set(1, 1, 1));
      const mm = this.meshes.get(car.model)!;
      const near = !mm.far.length || camPos.distanceToSquared(this.p) < LOD_DISTANCE * LOD_DISTANCE;
      const slot = near ? mm.nNear++ : mm.nFar++;
      if (car.dead) this.c.setRGB(0.05, 0.045, 0.04);
      else this.c.setHex(car.color, THREE.SRGBColorSpace);
      for (const body of near ? mm.bodies : mm.far) {
        body.setMatrixAt(slot, this.m);
        body.setColorAt(slot, this.c);
      }
      // wheels: the model's own (right-hand ones turned round), or the shared code-built ones
      const own = mm.axles ? (near || !mm.wheelFar ? mm.wheelNear : mm.wheelFar) : null;
      const wpos = mm.axles ?? wheelPositions(car.spec);
      for (let w = 0; w < 4; w++) {
        const target = own ?? this.wheels;
        const idx = own ? (own === mm.wheelNear ? mm.wNear : mm.wFar) : wi;
        if (idx >= target.instanceMatrix.count) break;
        const lp = wpos[w].clone();
        if (car.blown[w]) lp.y -= 1.1;
        lp.applyQuaternion(this.q).add(this.p);
        const wq = this.q.clone();
        if (w < 2 && !car.dead) wq.multiply(this.q2.setFromAxisAngle(this.yAxis, -car.steer * 0.8));
        const flip = own !== null && wpos[w].x < 0;
        if (flip) wq.multiply(this.q2.setFromAxisAngle(this.yAxis, Math.PI));
        wq.multiply(this.q2.setFromAxisAngle(this.xAxis, flip ? -car.wheelSpin : car.wheelSpin));
        this.m.compose(lp, wq, this.s.set(1, car.blown[w] ? 0.7 : 1, car.blown[w] ? 0.7 : 1));
        target.setMatrixAt(idx, this.m);
        if (!own) wi++;
        else if (own === mm.wheelNear) mm.wNear++;
        else mm.wFar++;
      }
      // lights
      const beamsNear = camPos.distanceToSquared(this.p) < 1400 * 1400;
      const hl = car.spec.hl;
      const hw = car.spec.hw;
      if (!car.dead) {
        for (const s of [-1, 1]) {
          const hp = (mm.head ? new THREE.Vector3(s * Math.abs(mm.head.x), mm.head.y, mm.head.z + 0.1) : new THREE.Vector3(s * (hw - 2.4), 5.0, hl + 0.1)).applyQuaternion(this.q).add(this.p);
          this.m.compose(hp, this.q, this.s.set(1, 1, 1));
          this.heads.setMatrixAt(hi, this.m);
          const hk = lightsOn ? 4.5 : 0.8;
          this.heads.setColorAt(hi++, this.c.setRGB(hk, hk * 0.97, hk * 0.9));
          const tp = (mm.tail ? new THREE.Vector3(s * Math.abs(mm.tail.x), mm.tail.y, mm.tail.z - 0.1) : new THREE.Vector3(s * (hw - 2.2), car.spec.roof * 0.5, -hl - 0.1)).applyQuaternion(this.q).add(this.p);
          this.m.compose(tp, this.q, this.s.set(1, 1, 1));
          this.tails.setMatrixAt(ti, this.m);
          const tk = car.brakeLight ? 4 : lightsOn ? 1.6 : 0.5;
          this.tails.setColorAt(ti++, this.c.setRGB(tk, tk * 0.04, tk * 0.03));
          if (lightsOn && beamsNear && bi < this.beams.instanceMatrix.count) {
            this.m.compose(hp, this.q, this.s.set(1, 1, 1));
            this.beams.setMatrixAt(bi++, this.m);
          }
        }
        if (lightsOn && beamsNear && pi < CAP) {
          const pp = new THREE.Vector3(0, 0.6, hl + 34).applyQuaternion(this.q).add(this.p);
          this.m.compose(pp, this.q, this.s.set(34, 1, 60));
          this.pools.setMatrixAt(pi++, this.m);
        }
        if (car.model === 'police' && car.siren) {
          const phase = Math.floor(this.time * 7 + car.id) % 2;
          for (const s of [-1, 1]) {
            const bp = new THREE.Vector3(s * 2.2, car.spec.roof + 1.1, 1).applyQuaternion(this.q).add(this.p);
            this.m.compose(bp, this.q, this.s.set(1, 1, 1));
            this.bars.setMatrixAt(bari, this.m);
            const on = (s > 0) === (phase === 0);
            this.bars.setColorAt(bari++, on ? (s > 0 ? this.c.setRGB(5, 0.2, 0.15) : this.c.setRGB(0.2, 0.6, 6)) : this.c.setRGB(0.05, 0.05, 0.05));
            if (on) {
              this.m.compose(bp, this.q, this.s.set(22, 22, 22));
              if (s > 0) this.sirenRed.setMatrixAt(sr++, this.m);
              else this.sirenBlue.setMatrixAt(sb++, this.m);
            }
          }
        }
      }
    }
    const finish = (im: THREE.InstancedMesh, n: number): void => {
      im.count = n;
      im.visible = n > 0;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    };
    for (const mm of this.meshes.values()) {
      for (const body of mm.bodies) finish(body, mm.nNear);
      for (const body of mm.far) finish(body, mm.nFar);
      if (mm.wheelNear) finish(mm.wheelNear, mm.wNear);
      if (mm.wheelFar) finish(mm.wheelFar, mm.wFar);
    }
    finish(this.wheels, wi);
    finish(this.heads, hi);
    finish(this.tails, ti);
    finish(this.beams, bi);
    finish(this.pools, pi);
    finish(this.bars, bari);
    finish(this.sirenRed, sr);
    finish(this.sirenBlue, sb);
    this.sirenOpacity.value = 0.5 + 0.5 * THREE.MathUtils.smoothstep(night, 0.1, 0.6);
  }

  /** Test helper: which models are visible. */
  static models(): CarModel[] {
    return MODELS;
  }

  static carOf(sim: Sim, id: number): Car | undefined {
    return sim.carById(id);
  }
}

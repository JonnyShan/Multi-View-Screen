/**
 * Effects: skid marks, sparks, smoke, fire, explosions, tracers, muzzle
 * flashes and the katana slash arc. Pools only, nothing allocated per frame.
 */
import * as THREE from 'three';
import type { SimEvent } from '../sim/events';
import type { Sim } from '../sim/Sim';
import { radialTexture } from './LampsView';
import { srgb } from './Shared';

let starTex: THREE.Texture | null = null;
/** A small spiky star with a hot core for muzzle flashes and glints; like the radial sprite, the shape is all in alpha. */
function starTexture(): THREE.Texture {
  if (starTex) return starTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 13);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 64, 64);
  // six uneven spikes, tapering to nothing
  const spikes = [30, 17, 25, 14, 28, 19];
  spikes.forEach((len, i) => {
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate((i / spikes.length) * Math.PI * 2 + 0.2);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(len, 0);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  starTex = new THREE.CanvasTexture(c);
  starTex.colorSpace = THREE.SRGBColorSpace;
  return starTex;
}

class Particles {
  readonly points: THREE.Points;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly col: Float32Array;
  private readonly size: Float32Array;
  private readonly life: Float32Array;
  private readonly maxLife: Float32Array;
  private readonly grow: Float32Array;
  private readonly baseColor: Float32Array;
  /** Sprite turn per particle, only for pools made with `spin`. */
  private readonly rot: Float32Array | null;
  private next = 0;

  constructor(
    readonly capacity: number,
    additive: boolean,
    private readonly gravity: number,
    private readonly drag: number,
    map: THREE.Texture = radialTexture(),
    spin = false,
  ) {
    this.pos = new Float32Array(capacity * 3);
    this.vel = new Float32Array(capacity * 3);
    this.col = new Float32Array(capacity * 4);
    this.size = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity).fill(1);
    this.grow = new Float32Array(capacity);
    this.baseColor = new Float32Array(capacity * 4);
    this.rot = spin ? new Float32Array(capacity) : null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    if (this.rot) g.setAttribute('aRot', new THREE.BufferAttribute(this.rot, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uMap: { value: map }, uScale: { value: 400 } },
      vertexShader: /* glsl */ `
        attribute vec4 aColor;
        attribute float aSize;
        uniform float uScale;
        varying vec4 vColor;
        ${spin ? 'attribute float aRot;\n        varying vec2 vSpin;' : ''}
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale / max(1.0, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          // spent particles go past the far plane so they cost no pixels
          if (aColor.a <= 0.0) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
          ${spin ? 'vSpin = vec2(cos(aRot), sin(aRot));' : ''}
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec4 vColor;
        ${spin ? 'varying vec2 vSpin;' : ''}
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          ${spin ? 'vec2 pc = gl_PointCoord - 0.5;\n          vec2 uv = vec2(pc.x * vSpin.x - pc.y * vSpin.y, pc.x * vSpin.y + pc.y * vSpin.x) + 0.5;' : 'vec2 uv = gl_PointCoord;'}
          float a = texture2D(uMap, uv).a * vColor.a;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor.rgb * ${additive ? 'a' : '1.0'}, ${additive ? '1.0' : 'a'});
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      fog: true,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
  }

  setScale(s: number): void {
    (this.points.material as THREE.ShaderMaterial).uniforms.uScale.value = s;
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, life: number, r: number, g: number, b: number, a: number, grow = 0, rot = 0): void {
    const i = this.next;
    this.next = (this.next + 1) % this.capacity;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.size[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.grow[i] = grow;
    this.baseColor.set([r, g, b, a], i * 4);
    if (this.rot) this.rot[i] = rot;
  }

  update(dt: number): void {
    const damp = Math.exp(-this.drag * dt);
    let alive = 0;
    for (let i = 0; i < this.capacity; i++) {
      if (this.life[i] <= 0) {
        this.col[i * 4 + 3] = 0;
        continue;
      }
      alive++;
      this.life[i] -= dt;
      const k = Math.max(0, this.life[i] / this.maxLife[i]);
      this.vel[i * 3 + 1] -= this.gravity * dt;
      this.vel[i * 3] *= damp;
      this.vel[i * 3 + 1] *= damp;
      this.vel[i * 3 + 2] *= damp;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] += this.grow[i] * dt;
      this.col[i * 4] = this.baseColor[i * 4];
      this.col[i * 4 + 1] = this.baseColor[i * 4 + 1];
      this.col[i * 4 + 2] = this.baseColor[i * 4 + 2];
      this.col[i * 4 + 3] = this.baseColor[i * 4 + 3] * k;
    }
    // an idle pool skips its draw call
    this.points.visible = alive > 0;
    const g = this.points.geometry;
    g.getAttribute('position').needsUpdate = true;
    g.getAttribute('aColor').needsUpdate = true;
    g.getAttribute('aSize').needsUpdate = true;
    if (this.rot) g.getAttribute('aRot').needsUpdate = true;
  }
}

class SkidMarks {
  readonly mesh: THREE.Mesh;
  private readonly pos: Float32Array;
  private next = 0;
  private readonly last = new Map<string, THREE.Vector3>();

  constructor(private readonly capacity: number) {
    this.pos = new Float32Array(capacity * 6 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.mesh = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
    );
    this.mesh.frustumCulled = false;
    this.mesh.name = 'skid-marks';
  }

  add(key: string, x: number, y: number, z: number, width: number, active: boolean): void {
    const prev = this.last.get(key);
    if (!active) {
      this.last.delete(key);
      return;
    }
    const cur = new THREE.Vector3(x, z + 0.25, y);
    if (!prev) {
      this.last.set(key, cur);
      return;
    }
    const dx = cur.x - prev.x;
    const dz = cur.z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 2) return;
    if (len > 60) {
      this.last.set(key, cur);
      return;
    }
    const nx = (-dz / len) * width * 0.5;
    const nz = (dx / len) * width * 0.5;
    const i = this.next;
    this.next = (this.next + 1) % this.capacity;
    const q = [prev.x - nx, prev.y, prev.z - nz, prev.x + nx, prev.y, prev.z + nz, cur.x + nx, cur.y, cur.z + nz, prev.x - nx, prev.y, prev.z - nz, cur.x + nx, cur.y, cur.z + nz, cur.x - nx, cur.y, cur.z - nz];
    // make sure the quad faces up
    const up = (q[3] - q[0]) * (q[8] - q[2]) - (q[5] - q[2]) * (q[6] - q[0]);
    if (up > 0) {
      [q[3], q[6]] = [q[6], q[3]];
      [q[4], q[7]] = [q[7], q[4]];
      [q[5], q[8]] = [q[8], q[5]];
      [q[12], q[15]] = [q[15], q[12]];
      [q[13], q[16]] = [q[16], q[13]];
      [q[14], q[17]] = [q[17], q[14]];
    }
    this.pos.set(q, i * 18);
    this.mesh.geometry.getAttribute('position').needsUpdate = true;
    this.last.set(key, cur);
  }
}

interface Tracer {
  a: THREE.Vector3;
  b: THREE.Vector3;
  life: number;
  maxLife: number;
  /** Length of a bolt whose head runs from a to b over its life; 0 draws the whole of a to b. */
  bolt: number;
  color: THREE.Color;
}

const TRACERS = 64;
/** How long the katana arc lasts (s). */
const SLASH_TIME = 0.16;
/** Speed of a player's bolt (units/s), and how long a bolt may last. */
const BOLT_SPEED = 5000;
const BOLT_LIFE: [number, number] = [0.04, 0.12];
const _m = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _head = new THREE.Vector3();
const _tail = new THREE.Vector3();
const _side = new THREE.Vector3();

/** What FX needs from the rider view: where the body is and where the gun's muzzle is. */
export interface RiderAnchor {
  readonly root: THREE.Object3D;
  readonly muzzle: THREE.Object3D;
}

export class FXView {
  readonly group = new THREE.Group();
  private readonly sparks = new Particles(600, true, 220, 1.5);
  private readonly fire = new Particles(500, true, -30, 1.2);
  private readonly smoke = new Particles(700, false, -14, 0.8);
  /** Muzzle flashes and hit glints: spiky stars at a random turn. */
  private readonly flashes = new Particles(32, true, 0, 0, starTexture(), true);
  private readonly skids = new SkidMarks(1600);
  private readonly tracers: Tracer[] = [];
  private tracerN = 0;
  private readonly tracerMesh: THREE.Mesh;
  private readonly tracerPos = new Float32Array(TRACERS * 6 * 3);
  private readonly tracerCol = new Float32Array(TRACERS * 6 * 3);
  private readonly flash: THREE.PointLight;
  private flashT = 0;
  /** Player shots this frame, waiting for the rider to be posed so they leave the muzzle (origin xyz, target xyz, in three space). */
  private readonly shotQueue = new Float32Array(4 * 6);
  private shotN = 0;
  private readonly boom: THREE.PointLight;
  private boomT = 0;
  private readonly slash: THREE.Mesh;
  private readonly slashU = { uSweep: { value: 0 }, uFlip: { value: 0 } };
  private slashT = 0;
  private slashRiding = false;
  private emitAcc = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly rider: RiderAnchor,
  ) {
    this.group.name = 'fx';
    this.sparks.points.name = 'sparks';
    this.fire.points.name = 'fire';
    this.smoke.points.name = 'smoke';
    this.flashes.points.name = 'muzzle-flashes';
    this.group.add(this.skids.mesh, this.smoke.points, this.fire.points, this.sparks.points, this.flashes.points);
    for (let i = 0; i < TRACERS; i++) this.tracers.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), life: 0, maxLife: 1, bolt: 0, color: new THREE.Color() });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.tracerPos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.tracerCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.tracerMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    this.tracerMesh.frustumCulled = false;
    this.tracerMesh.name = 'tracers';
    this.group.add(this.tracerMesh);
    this.flash = new THREE.PointLight(0xffc070, 0, 90, 1.6);
    this.boom = new THREE.PointLight(0xff8a30, 0, 520, 1.6);
    this.group.add(this.flash, this.boom);
    // the katana arc: a band that sweeps across with the blade and trails off behind it, brightest at the tip
    const arc = new THREE.RingGeometry(9, 19, 24, 1, -1.2, 2.4).rotateX(-Math.PI / 2);
    const arcMat = new THREE.ShaderMaterial({
      uniforms: { ...this.slashU, uColor: { value: new THREE.Color(0.9, 1.05, 1.3) } },
      vertexShader: /* glsl */ `
        varying vec2 vArc;
        void main() {
          // x: across the arc, 0 at its right end and 1 at its left; y: from the inner edge out to the blade tip
          vArc = vec2((atan(-position.z, position.x) + 1.2) / 2.4, (length(position.xz) - 9.0) / 10.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uSweep;
        uniform float uFlip;
        uniform vec3 uColor;
        varying vec2 vArc;
        void main() {
          float t = mix(vArc.x, 1.0 - vArc.x, uFlip);
          float trail = smoothstep(uSweep - 0.5, uSweep, t) * (1.0 - smoothstep(uSweep - 0.04, uSweep, t));
          // a thin bright edge just inside the tip, falling off towards the hilt
          float a = pow(vArc.y, 4.0) * (1.0 - smoothstep(0.88, 1.0, vArc.y)) * trail;
          gl_FragColor = vec4(uColor * a, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.slash = new THREE.Mesh(arc, arcMat);
    // roll about the arc's own centre line for a diagonal stroke, then turn to face
    this.slash.rotation.order = 'YXZ';
    this.slash.visible = false;
    this.slash.name = 'slash-arc';
    this.group.add(this.slash);
  }

  private addTracer(ax: number, ay: number, az: number, bx: number, by: number, bz: number, life: number, bolt: number, r: number, g: number, b: number): void {
    if (this.tracerN >= TRACERS) return;
    const tr = this.tracers[this.tracerN++];
    tr.a.set(ax, ay, az);
    tr.b.set(bx, by, bz);
    tr.life = tr.maxLife = life;
    tr.bolt = bolt;
    tr.color.setRGB(r, g, b);
  }

  /** A muzzle flash or hit glint: a spiky star at a random turn that lasts a frame or two. */
  private flashAt(x: number, y: number, z: number, size: number, r: number, g: number, b: number): void {
    this.flashes.emit(x, y, z, 0, 0, 0, size + (Math.random() - 0.5) * 2, 0.05, r, g, b, 1, 0, Math.random() * Math.PI * 2);
  }

  /** A queued player shot, now that the gun is in the rider's hand: flash, light and bolt from the muzzle. */
  private playerShot(q: Float32Array, o: number): void {
    const a = _a.set(q[o], q[o + 1], q[o + 2]);
    const b = _b.set(q[o + 3], q[o + 4], q[o + 5]);
    const m = this.rider.muzzle.getWorldPosition(_m);
    // a gun not yet in hand (or a rider mid tumble) is nowhere near the shot: start just ahead of the body instead
    if (m.distanceToSquared(a) > 20 * 20) m.copy(a).addScaledVector(_dir.subVectors(b, a).normalize(), 5);
    const dir = _dir.subVectors(b, m);
    const len = dir.length();
    dir.divideScalar(Math.max(len, 0.001));
    this.flashAt(m.x + dir.x * 0.8, m.y + dir.y * 0.8, m.z + dir.z * 0.8, 4.5, 1.8, 1.3, 0.6);
    // the light sits out ahead of the barrel, so it lights the street more than the rider's chest
    this.flash.position.copy(m).addScaledVector(dir, 8);
    this.flash.position.y += 2;
    this.flash.intensity = 220;
    this.flashT = 0.05;
    this.addTracer(m.x, m.y, m.z, b.x, b.y, b.z, THREE.MathUtils.clamp(len / BOLT_SPEED, BOLT_LIFE[0], BOLT_LIFE[1]), 70, 2.0, 1.5, 0.8);
  }

  onEvent(e: SimEvent, sim: Sim): void {
    switch (e.type) {
      case 'sparks':
        for (let i = 0; i < e.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 40 + Math.random() * 140;
          this.sparks.emit(e.x, e.z, e.y, Math.cos(a) * s, 30 + Math.random() * 90, Math.sin(a) * s, 3, 0.35 + Math.random() * 0.4, 3, 1.6, 0.5, 1);
        }
        break;
      case 'shot': {
        if (e.by === 'player') {
          // the gun is posed after events arrive, so the flash and bolt wait for update
          if (this.shotN < 4) this.shotQueue.set([e.x, e.z, e.y, e.tx, e.tz, e.ty], this.shotN++ * 6);
        } else {
          this.flashAt(e.x, e.z, e.y, 4, 1.8, 0.9, 0.4);
          this.addTracer(e.x, e.z, e.y, e.tx, e.tz, e.ty, BOLT_LIFE[0], 40, 2.4, 0.7, 0.35);
        }
        if (e.hit === 'car' || e.hit === 'wall') {
          // a short glint where it struck, sparks off metal, a puff of dust off walls
          this.flashAt(e.tx, e.tz, e.ty, 3, 1.6, 1.3, 0.9);
          for (let i = 0; i < 3; i++) this.sparks.emit(e.tx, e.tz, e.ty, (Math.random() - 0.5) * 120, Math.random() * 80, (Math.random() - 0.5) * 120, 2.4, 0.25, 3, 1.8, 0.6, 1);
          if (e.hit === 'wall') this.smoke.emit(e.tx, e.tz, e.ty, (Math.random() - 0.5) * 10, 6 + Math.random() * 8, (Math.random() - 0.5) * 10, 4, 0.6, 0.42, 0.4, 0.37, 0.35, 10);
        }
        break;
      }
      case 'explosion': {
        this.boom.position.set(e.x, e.z + 10, e.y);
        this.boom.intensity = 16000;
        this.boomT = 0.7;
        for (let i = 0; i < 70; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 120;
          this.fire.emit(e.x, e.z + 4, e.y, Math.cos(a) * s, 30 + Math.random() * 110, Math.sin(a) * s, 20 + Math.random() * 17, 0.5 + Math.random() * 0.5, 2.6, 0.9, 0.2, 0.7, 25);
        }
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 70;
          this.smoke.emit(e.x, e.z + 8, e.y, Math.cos(a) * s, 20 + Math.random() * 50, Math.sin(a) * s, 30, 2.5 + Math.random() * 1.5, 0.05, 0.045, 0.04, 0.9, 26);
        }
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 80 + Math.random() * 220;
          this.sparks.emit(e.x, e.z + 5, e.y, Math.cos(a) * s, 60 + Math.random() * 160, Math.sin(a) * s, 4, 0.8 + Math.random() * 0.6, 3, 1.4, 0.4, 1);
        }
        break;
      }
      case 'slash': {
        // on foot the blade comes down from the right, on the bike from the left and out to the right
        this.slashRiding = sim.player.mode === 'riding';
        this.slash.rotation.set(this.slashRiding ? 0.3 : -0.3, -e.a, 0);
        this.slashU.uFlip.value = this.slashRiding ? 1 : 0;
        this.slashT = SLASH_TIME;
        break;
      }
      case 'wheelCut':
      case 'tyreBlown':
        for (let i = 0; i < 12; i++) this.smoke.emit(e.x, 3, e.y, (Math.random() - 0.5) * 30, 10 + Math.random() * 20, (Math.random() - 0.5) * 30, 10, 1.2, 0.5, 0.5, 0.5, 0.6, 14);
        break;
      default:
        break;
    }
  }

  update(sim: Sim, dt: number, height: number): void {
    this.sparks.setScale(height * 0.9);
    this.fire.setScale(height * 0.9);
    this.smoke.setScale(height * 0.9);
    // continuous emitters
    this.emitAcc += dt;
    const tick = this.emitAcc > 1 / 30;
    if (tick) this.emitAcc = 0;
    const b = sim.bike;
    // bike rear wheel skid and tyre smoke
    const rx = b.x - Math.cos(b.heading) * 5.7;
    const ry = b.y - Math.sin(b.heading) * 5.7;
    this.skids.add('bike', rx, ry, b.z, 1.6, b.skidding && !b.riderless);
    if (b.skidding && tick && Math.abs(b.speed) > 60) this.smoke.emit(rx, b.z + 2, ry, 0, 8, 0, 8, 1.1, 0.55, 0.55, 0.55, 0.5, 16);
    for (const car of sim.cars) {
      const sliding = car.spinT > 0 || (Math.abs(car.vx * -Math.sin(car.a) + car.vy * Math.cos(car.a)) > 40 && Math.abs(car.speed) > 20);
      for (const side of [-1, 1]) {
        const wx = car.x - Math.cos(car.a) * car.spec.wheelbase * 0.5 - Math.sin(car.a) * side * car.spec.hw * 0.9;
        const wy = car.y - Math.sin(car.a) * car.spec.wheelbase * 0.5 + Math.cos(car.a) * side * car.spec.hw * 0.9;
        this.skids.add(`${car.id}:${side}`, wx, wy, sim.city.heightAt(wx, wy), 2, sliding && !car.dead);
      }
      if (!tick) continue;
      const ratio = car.hp / car.maxHp;
      const z = sim.city.heightAt(car.x, car.y);
      const fx = car.x + Math.cos(car.a) * car.spec.hl * 0.6;
      const fy = car.y + Math.sin(car.a) * car.spec.hl * 0.6;
      if (ratio < sim.t.car.smokeAt || car.dead) {
        const dark = car.dead || car.burning ? 0.06 : 0.35;
        this.smoke.emit(fx, z + car.spec.roof * 0.7, fy, (Math.random() - 0.5) * 6, 14 + Math.random() * 8, (Math.random() - 0.5) * 6, 9, car.dead ? 3 : 1.8, dark, dark, dark * 1.05, car.dead ? 0.5 : 0.4, 12);
      }
      if (car.burning) {
        this.fire.emit(fx + (Math.random() - 0.5) * 6, z + car.spec.roof * 0.6, fy + (Math.random() - 0.5) * 6, 0, 22 + Math.random() * 20, 0, 10 + Math.random() * 7, 0.5, 2.6, 0.9, 0.2, 0.8, 8);
      }
      if (car.spinT > 0 && Math.abs(car.speed) + Math.abs(car.w) * 20 > 40) {
        this.smoke.emit(car.x, z + 2, car.y, 0, 6, 0, 10, 1.3, 0.6, 0.6, 0.6, 0.4, 20);
      }
    }
    // the rider has been posed for this frame: player shots leave the muzzle
    for (let i = 0; i < this.shotN; i++) this.playerShot(this.shotQueue, i * 6);
    this.shotN = 0;
    this.sparks.update(dt);
    this.fire.update(dt);
    this.smoke.update(dt);
    this.flashes.update(dt);

    // enemy bullets as short streaks, drawn this frame only
    for (const bl of sim.combat.bullets) this.addTracer(bl.px, bl.z, bl.py, bl.x, bl.z, bl.y, dt * 1.01, 0, 3, 0.8, 0.4);
    this.updateTracers(dt);

    this.flashT -= dt;
    if (this.flashT <= 0) this.flash.intensity = 0;
    this.boomT -= dt;
    this.boom.intensity = this.boomT > 0 ? 16000 * (this.boomT / 0.7) ** 2 : 0;
    this.slashT -= dt;
    this.slash.visible = this.slashT > 0;
    if (this.slash.visible) {
      // follow the rider (a fast bike would leave the arc behind), chest high
      this.rider.root.updateWorldMatrix(true, false);
      this.rider.root.localToWorld(this.slash.position.set(0, this.slashRiding ? 12 : 8, 0));
      // the sweep crosses the arc in the first half, then its trail runs off the end
      this.slashU.uSweep.value = (1 - this.slashT / SLASH_TIME) * 2;
    }
  }

  private updateTracers(dt: number): void {
    const cam = this.camera.position;
    const dir = _dir;
    const head = _head;
    const tail = _tail;
    const side = _side;
    const pos = this.tracerPos;
    const col = this.tracerCol;
    let n = 0;
    for (let i = this.tracerN - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.life -= dt;
      if (tr.life <= 0) {
        // swap the last live tracer into this slot
        this.tracers[i] = this.tracers[--this.tracerN];
        this.tracers[this.tracerN] = tr;
        continue;
      }
      dir.subVectors(tr.b, tr.a);
      const len = dir.length();
      if (len < 0.01) continue;
      dir.divideScalar(len);
      if (tr.bolt > 0) {
        const d = len * (1 - tr.life / tr.maxLife);
        head.copy(tr.a).addScaledVector(dir, d);
        tail.copy(tr.a).addScaledVector(dir, Math.max(0, d - tr.bolt));
      } else {
        head.copy(tr.b);
        tail.copy(tr.a);
      }
      side.addVectors(head, tail).multiplyScalar(0.5).sub(cam);
      side.crossVectors(dir, side).normalize();
      // about two pixels wide at any distance, a touch more up close
      const wt = Math.max(0.15, tail.distanceTo(cam) * 0.0022);
      const wh = Math.max(0.15, head.distanceTo(cam) * 0.0022);
      // two triangles, dark at the tail and full colour at the head
      const o = n * 18;
      const c = tr.color;
      for (let k = 0; k < 6; k++) {
        const atHead = k === 2 || k === 4 || k === 5;
        const p = atHead ? head : tail;
        const w = (k === 1 || k === 2 || k === 4 ? 1 : -1) * (atHead ? wh : wt);
        pos[o + k * 3] = p.x + side.x * w;
        pos[o + k * 3 + 1] = p.y + side.y * w;
        pos[o + k * 3 + 2] = p.z + side.z * w;
        col[o + k * 3] = atHead ? c.r : 0;
        col[o + k * 3 + 1] = atHead ? c.g : 0;
        col[o + k * 3 + 2] = atHead ? c.b : 0;
      }
      n++;
    }
    this.tracerPos.fill(0, n * 18);
    this.tracerMesh.visible = n > 0;
    const g = this.tracerMesh.geometry;
    g.getAttribute('position').needsUpdate = true;
    g.getAttribute('color').needsUpdate = true;
    g.setDrawRange(0, n * 6);
  }

  static dim(): THREE.Color {
    return srgb(0x000000);
  }
}

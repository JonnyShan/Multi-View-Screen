/**
 * Effects: skid marks, sparks, smoke, fire, explosions, tracers, muzzle
 * flashes and the katana slash arc. Pools only, nothing allocated per frame.
 */
import * as THREE from 'three';
import type { SimEvent } from '../sim/events';
import type { Sim } from '../sim/Sim';
import { radialTexture } from './LampsView';
import { srgb } from './Shared';

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
  private next = 0;

  constructor(
    readonly capacity: number,
    additive: boolean,
    private readonly gravity: number,
    private readonly drag: number,
  ) {
    this.pos = new Float32Array(capacity * 3);
    this.vel = new Float32Array(capacity * 3);
    this.col = new Float32Array(capacity * 4);
    this.size = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity).fill(1);
    this.grow = new Float32Array(capacity);
    this.baseColor = new Float32Array(capacity * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uMap: { value: radialTexture() }, uScale: { value: 400 } },
      vertexShader: /* glsl */ `
        attribute vec4 aColor;
        attribute float aSize;
        uniform float uScale;
        varying vec4 vColor;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale / max(1.0, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec4 vColor;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          float a = texture2D(uMap, gl_PointCoord).r * vColor.a;
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

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, life: number, r: number, g: number, b: number, a: number, grow = 0): void {
    const i = this.next;
    this.next = (this.next + 1) % this.capacity;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.size[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.grow[i] = grow;
    this.baseColor.set([r, g, b, a], i * 4);
  }

  update(dt: number): void {
    const damp = Math.exp(-this.drag * dt);
    for (let i = 0; i < this.capacity; i++) {
      if (this.life[i] <= 0) {
        this.col[i * 4 + 3] = 0;
        continue;
      }
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
    const g = this.points.geometry;
    g.getAttribute('position').needsUpdate = true;
    g.getAttribute('aColor').needsUpdate = true;
    g.getAttribute('aSize').needsUpdate = true;
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
  color: THREE.Color;
}

export class FXView {
  readonly group = new THREE.Group();
  private readonly sparks = new Particles(600, true, 220, 1.5);
  private readonly fire = new Particles(500, true, -30, 1.2);
  private readonly smoke = new Particles(700, false, -14, 0.8);
  private readonly skids = new SkidMarks(1600);
  private readonly tracers: Tracer[] = [];
  private readonly tracerMesh: THREE.Mesh;
  private readonly tracerPos = new Float32Array(64 * 6 * 3);
  private readonly tracerCol = new Float32Array(64 * 6 * 3);
  private readonly flash: THREE.PointLight;
  private flashT = 0;
  private readonly boom: THREE.PointLight;
  private boomT = 0;
  private readonly slash: THREE.Mesh;
  private slashT = 0;
  private emitAcc = 0;

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.group.name = 'fx';
    this.sparks.points.name = 'sparks';
    this.fire.points.name = 'fire';
    this.smoke.points.name = 'smoke';
    this.group.add(this.skids.mesh, this.smoke.points, this.fire.points, this.sparks.points);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.tracerPos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.tracerCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.tracerMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    this.tracerMesh.frustumCulled = false;
    this.tracerMesh.name = 'tracers';
    this.group.add(this.tracerMesh);
    this.flash = new THREE.PointLight(0xffc070, 0, 160, 1.6);
    this.boom = new THREE.PointLight(0xff8a30, 0, 700, 1.4);
    this.group.add(this.flash, this.boom);
    const arc = new THREE.RingGeometry(14, 19, 24, 1, -1.2, 2.4).rotateX(-Math.PI / 2);
    this.slash = new THREE.Mesh(arc, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.6, 3), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    this.slash.name = 'slash-arc';
    this.group.add(this.slash);
  }

  onEvent(e: SimEvent, sim: Sim): void {
    switch (e.type) {
      case 'sparks':
        for (let i = 0; i < e.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 40 + Math.random() * 140;
          this.sparks.emit(e.x, e.z, e.y, Math.cos(a) * s, 30 + Math.random() * 90, Math.sin(a) * s, 2.2, 0.35 + Math.random() * 0.4, 3, 1.6, 0.5, 1);
        }
        break;
      case 'shot': {
        const a = new THREE.Vector3(e.x, e.z, e.y);
        const b = new THREE.Vector3(e.tx, e.tz, e.ty);
        this.tracers.push({ a, b, life: e.by === 'player' ? 0.06 : 0.1, color: e.by === 'player' ? new THREE.Color(3, 2.2, 1.1) : new THREE.Color(3, 0.7, 0.4) });
        if (this.tracers.length > 60) this.tracers.shift();
        if (e.by === 'player') {
          this.flash.position.copy(a);
          this.flash.intensity = 1600;
          this.flashT = 0.05;
          this.sparks.emit(e.x, e.z, e.y, 0, 0, 0, 7, 0.05, 4, 3, 1.5, 1);
        }
        if (e.hit === 'car' || e.hit === 'wall') for (let i = 0; i < 3; i++) this.sparks.emit(e.tx, e.tz, e.ty, (Math.random() - 0.5) * 120, Math.random() * 80, (Math.random() - 0.5) * 120, 1.8, 0.25, 3, 1.8, 0.6, 1);
        break;
      }
      case 'explosion': {
        this.boom.position.set(e.x, e.z + 10, e.y);
        this.boom.intensity = 90000;
        this.boomT = 0.7;
        for (let i = 0; i < 70; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 120;
          this.fire.emit(e.x, e.z + 4, e.y, Math.cos(a) * s, 30 + Math.random() * 110, Math.sin(a) * s, 16 + Math.random() * 14, 0.6 + Math.random() * 0.5, 4, 1.8, 0.5, 1, 20);
        }
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = Math.random() * 70;
          this.smoke.emit(e.x, e.z + 8, e.y, Math.cos(a) * s, 20 + Math.random() * 50, Math.sin(a) * s, 30, 2.5 + Math.random() * 1.5, 0.08, 0.075, 0.07, 0.85, 26);
        }
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 80 + Math.random() * 220;
          this.sparks.emit(e.x, e.z + 5, e.y, Math.cos(a) * s, 60 + Math.random() * 160, Math.sin(a) * s, 3, 0.8 + Math.random() * 0.6, 3, 1.4, 0.4, 1);
        }
        break;
      }
      case 'slash': {
        const pl = sim.player;
        this.slash.position.set(e.x, pl.z + 8, e.y);
        this.slash.rotation.set(0, -e.a, 0);
        this.slashT = 0.16;
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
    if (b.skidding && tick && Math.abs(b.speed) > 60) this.smoke.emit(rx, b.z + 2, ry, 0, 8, 0, 8, 1.1, 0.55, 0.55, 0.55, 0.35, 16);
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
        this.fire.emit(fx + (Math.random() - 0.5) * 6, z + car.spec.roof * 0.6, fy + (Math.random() - 0.5) * 6, 0, 22 + Math.random() * 20, 0, 7 + Math.random() * 5, 0.5, 4, 1.6, 0.4, 1, 6);
      }
      if (car.spinT > 0 && Math.abs(car.speed) + Math.abs(car.w) * 20 > 40) {
        this.smoke.emit(car.x, z + 2, car.y, 0, 6, 0, 10, 1.3, 0.6, 0.6, 0.6, 0.4, 20);
      }
    }
    this.sparks.update(dt);
    this.fire.update(dt);
    this.smoke.update(dt);

    // enemy bullets as short streaks
    for (const bl of sim.combat.bullets) {
      this.tracers.push({ a: new THREE.Vector3(bl.px, bl.z, bl.py), b: new THREE.Vector3(bl.x, bl.z, bl.y), life: dt * 0.99, color: new THREE.Color(3, 0.8, 0.4) });
    }
    this.updateTracers(dt);

    this.flashT -= dt;
    if (this.flashT <= 0) this.flash.intensity = 0;
    this.boomT -= dt;
    this.boom.intensity = this.boomT > 0 ? 90000 * (this.boomT / 0.7) ** 2 : 0;
    this.slashT -= dt;
    (this.slash.material as THREE.MeshBasicMaterial).opacity = Math.max(0, this.slashT / 0.16);
  }

  private updateTracers(dt: number): void {
    const cam = this.camera.position;
    let n = 0;
    const dir = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    const side = new THREE.Vector3();
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.life -= dt;
      if (tr.life <= 0) {
        this.tracers.splice(i, 1);
        continue;
      }
      if (n >= 64) continue;
      dir.subVectors(tr.b, tr.a);
      toCam.subVectors(cam, tr.a);
      side.crossVectors(dir, toCam).normalize().multiplyScalar(0.35);
      const v = [
        tr.a.x - side.x, tr.a.y - side.y, tr.a.z - side.z,
        tr.a.x + side.x, tr.a.y + side.y, tr.a.z + side.z,
        tr.b.x + side.x, tr.b.y + side.y, tr.b.z + side.z,
        tr.a.x - side.x, tr.a.y - side.y, tr.a.z - side.z,
        tr.b.x + side.x, tr.b.y + side.y, tr.b.z + side.z,
        tr.b.x - side.x, tr.b.y - side.y, tr.b.z - side.z,
      ];
      this.tracerPos.set(v, n * 18);
      for (let k = 0; k < 6; k++) this.tracerCol.set([tr.color.r, tr.color.g, tr.color.b], n * 18 + k * 3);
      n++;
    }
    this.tracerPos.fill(0, n * 18);
    const g = this.tracerMesh.geometry;
    g.getAttribute('position').needsUpdate = true;
    g.getAttribute('color').needsUpdate = true;
    g.setDrawRange(0, n * 6);
  }

  static dim(): THREE.Color {
    return srgb(0x000000);
  }
}

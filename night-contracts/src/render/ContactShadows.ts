/**
 * Contact shadows: a soft dark blob on the ground under every car, the bike,
 * the rider and each pedestrian, so nothing floats on tiers without shadow
 * maps or at night under the street lamps. One instanced draw for the lot.
 * Blobs fade and spread as their owner leaves the ground, tilt onto ramps,
 * and by day lean a little away from the sun.
 */
import * as THREE from 'three';
import type { Sim } from '../sim/Sim';
import type { Lighting } from '../world/DayNight';
import { yawToThree } from './Shared';

const CAP = 160;
/** Height above the ground at which a blob has faded out. */
const FADE_HEIGHT = 40;
/** Blobs sit just over the asphalt; polygon offset keeps them off it at range. */
const LIFT = 0.35;
const CAR_RANGE = 1200;
const PED_RANGE = 700;
/** Distance over which far blobs fade out before they are dropped. */
const RANGE_FADE = 250;
/** Steeper than this is a deck edge, not a ramp: lie flat. */
const MAX_SLOPE = 0.25;

export class ContactShadows {
  readonly mesh: THREE.InstancedMesh;
  /** Per instance: inner (0 round, towards 1 a rounded box) and opacity. */
  private readonly shape: THREE.InstancedBufferAttribute;
  private readonly strength = { value: 0.85 };
  private n = 0;
  private offX = 0;
  private offY = 0;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly tilt = new THREE.Quaternion();
  private readonly p = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private readonly nrm = new THREE.Vector3();
  private readonly up = new THREE.Vector3(0, 1, 0);

  constructor() {
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    this.shape = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 2), 2);
    this.shape.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aShape', this.shape);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uStrength: this.strength },
      vertexShader: /* glsl */ `
        attribute vec2 aShape;
        varying vec2 vQ;
        varying vec2 vShape;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vQ = uv * 2.0 - 1.0;
          vShape = aShape;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uStrength;
        varying vec2 vQ;
        varying vec2 vShape;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          // rounded box of half size 'inner' with a soft rim out to the quad edge
          float d = length(max(abs(vQ) - vShape.x, 0.0)) / (1.0 - vShape.x);
          float a = 1.0 - smoothstep(0.0, 1.0, d);
          a *= a * vShape.y * uStrength;
          // thin out into the fog instead of tinting it
          #ifdef USE_FOG
            #ifdef FOG_EXP2
              a *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
            #else
              a *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
            #endif
          #endif
          gl_FragColor = vec4(0.0, 0.0, 0.0, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      fog: true,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, CAP);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    // after the additive light pools on the ground (-2) so a car darkens the pool it stands in,
    // before beams, smoke, sparks and rain (0)
    this.mesh.renderOrder = -1;
    this.mesh.name = 'contact-shadows';
  }

  /** `mapped`: the tier has real shadow maps, so by day the blobs only ground things. */
  update(sim: Sim, alpha: number, l: Lighting, camPos: THREE.Vector3, mapped: boolean): void {
    this.n = 0;
    const night = l.night;
    const day = mapped ? 0.4 : 0.6;
    this.strength.value = day + (0.85 - day) * night;
    // by day the blob leans away from the sun; at night lamps come from every side
    const [lx, ly, lz] = l.lightDir;
    const k = (3 / Math.max(lz, 0.2)) * (1 - night) * (sim.raining ? 0.4 : 1);
    this.offX = -lx * k;
    this.offY = -ly * k;
    const len = Math.hypot(this.offX, this.offY);
    if (len > 6) {
      this.offX *= 6 / len;
      this.offY *= 6 / len;
    }
    const cx = camPos.x;
    const cy = camPos.z;

    // the bike, shifted towards its lean (and lying on its side once fallen)
    const b = sim.bike;
    let dh = b.heading - b.pHeading;
    if (dh > Math.PI) dh -= Math.PI * 2;
    if (dh < -Math.PI) dh += Math.PI * 2;
    const ba = b.pHeading + dh * alpha;
    const lean0 = b.pLean + (b.lean - b.pLean) * alpha;
    const lean = lean0 + (b.fallSide * 1.42 - lean0) * b.fallT;
    const shift = Math.sin(lean) * 4;
    const bx = b.px + (b.x - b.px) * alpha - Math.sin(ba) * shift;
    const by = b.py + (b.y - b.py) * alpha + Math.cos(ba) * shift;
    this.put(sim, bx, by, b.pz + (b.z - b.pz) * alpha, ba, 7 + 5 * b.fallT, 18, 0.25, 0.85);

    // the rider when off the bike (on a car roof the car's blob does the job)
    const pl = sim.player;
    if (pl.mode === 'foot' || pl.mode === 'air' || pl.mode === 'down' || pl.mode === 'dead') {
      const lying = pl.mode === 'down' || pl.mode === 'dead';
      const size = lying ? 10 : 7;
      this.put(sim, pl.px + (pl.x - pl.px) * alpha, pl.py + (pl.y - pl.py) * alpha, pl.pz + (pl.z - pl.pz) * alpha, pl.facing, size, size, 0.15, 0.7);
    }

    for (const car of sim.cars) {
      const x = car.px + (car.x - car.px) * alpha;
      const y = car.py + (car.y - car.py) * alpha;
      const fade = this.rangeFade(x - cx, y - cy, CAR_RANGE);
      if (fade <= 0) continue;
      let da = car.a - car.pa;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      const inner = mapped ? 0.4 + 0.15 * night : 0.55;
      this.put(sim, x, y, 0, car.pa + da * alpha, car.spec.hw * 2.4, car.spec.hl * 2.2, inner, 0.7 * fade);
    }

    for (const p of sim.peds.list) {
      if (!p.alive) continue;
      let x = p.px + (p.x - p.px) * alpha;
      let y = p.py + (p.y - p.py) * alpha;
      const fade = this.rangeFade(x - cx, y - cy, PED_RANGE);
      if (fade <= 0) continue;
      if (p.state === 'down') {
        // the body lies back from the feet along minus facing
        x -= Math.cos(p.a) * 6.5;
        y -= Math.sin(p.a) * 6.5;
        this.put(sim, x, y, p.z, p.a, 7, 16, 0.2, 0.7 * fade);
      } else this.put(sim, x, y, p.z, p.a, 7, 7, 0.15, 0.8 * fade);
    }

    const im = this.mesh;
    im.count = this.n;
    im.visible = this.n > 0;
    im.instanceMatrix.needsUpdate = true;
    this.shape.needsUpdate = true;
  }

  /** 1 inside range, easing to 0 at its edge. */
  private rangeFade(dx: number, dy: number, range: number): number {
    const d = Math.hypot(dx, dy);
    return Math.min(1, (range - d) / RANGE_FADE);
  }

  /**
   * One blob centred on sim (x, y), long axis along heading `a`, on the road
   * or pavement there. `z` is the owner's base height, for the fade and spread
   * as it leaves the ground (0 for things that never do).
   */
  private put(sim: Sim, x: number, y: number, z: number, a: number, w: number, len: number, inner: number, opacity: number): void {
    if (this.n >= CAP) return;
    const city = sim.city;
    const kerb = sim.kerbAt(x, y);
    let g = city.heightAt(x, y) + kerb;
    const h = Math.max(0, z - g);
    const fade = 1 - h / FADE_HEIGHT;
    if (fade <= 0.02) return;
    const spread = 1 + h / (FADE_HEIGHT * 1.5);
    const sx = x + this.offX;
    const sy = y + this.offY;
    // follow the slope on ramps
    const gx = (city.heightAt(sx + 3, sy) - city.heightAt(sx - 3, sy)) / 6;
    const gy = (city.heightAt(sx, sy + 3) - city.heightAt(sx, sy - 3)) / 6;
    this.q.setFromAxisAngle(this.up, yawToThree(a));
    if ((gx !== 0 || gy !== 0) && Math.abs(gx) < MAX_SLOPE && Math.abs(gy) < MAX_SLOPE) {
      this.tilt.setFromUnitVectors(this.up, this.nrm.set(-gx, 1, -gy).normalize());
      this.q.premultiply(this.tilt);
      g = city.heightAt(sx, sy) + kerb;
    }
    this.m.compose(this.p.set(sx, g + LIFT, sy), this.q, this.s.set(w * spread, 1, len * spread));
    this.mesh.setMatrixAt(this.n, this.m);
    this.shape.setXY(this.n, inner, opacity * fade);
    this.n++;
  }
}

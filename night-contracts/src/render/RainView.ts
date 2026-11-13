/**
 * Rain: streaks that wrap around a box held out ahead of the camera, computed
 * in the vertex shader so the CPU does nothing per drop. They slant with the
 * camera's speed and pick up the nearest street lamps and the bike's
 * headlight. Splashes are small rings on the ground in view ahead.
 */
import * as THREE from 'three';
import { SODIUM } from './LampsView';
import { globalUniforms, srgb } from './Shared';

/** Most street lamps that light the rain: the nearest of the lamps' real lights (fewer on low quality). */
const RAIN_LAMPS = 6;
/** How far ahead of the camera the drop box sits, so more of it is in view. */
const AHEAD = 84;
/** Fall velocity of a drop (units/s), before its own random extra. */
const FALL = new THREE.Vector3(40, -700, 0);

/** Light on a drop or splash at `p`: the nearest `n` street lamps (w is how lit each is) and the headlight beam. */
const rainLightGlsl = (n: number): string => /* glsl */ `
  uniform vec4 uLamps[${n}];
  uniform vec3 uSodium;
  uniform vec3 uHeadPos;
  uniform vec3 uHeadDir;
  uniform float uHead;
  uniform float uNight;
  vec3 rainLight(vec3 p) {
    float lamp = 0.0;
    for (int i = 0; i < ${n}; i++) {
      vec3 d = p - uLamps[i].xyz;
      lamp += uLamps[i].w / (1.0 + dot(d, d) / 4900.0);
    }
    vec3 h = p - uHeadPos;
    float along = dot(h, uHeadDir);
    float beam = smoothstep(0.9, 0.97, along / max(length(h), 1.0)) * (1.0 - smoothstep(120.0, 380.0, along));
    return uSodium * lamp * 0.7 + vec3(1.0, 0.98, 0.92) * beam * uHead * 1.2;
  }
`;

export class RainView {
  readonly group = new THREE.Group();
  private readonly drops: THREE.Mesh;
  private readonly splashes: THREE.Mesh;
  private readonly uniforms = {
    uTime: globalUniforms.uTime,
    uNight: globalUniforms.uNight,
    uCam: { value: new THREE.Vector3() },
    uCenter: { value: new THREE.Vector3() },
    uFwd: { value: new THREE.Vector3(0, 0, 1) },
    uGround: { value: 0 },
    uIntensity: { value: 0 },
    uBox: { value: new THREE.Vector3(280, 200, 280) },
    uTail: { value: new THREE.Vector3(0, 1, 0) },
    uLen: { value: 14 },
    uLamps: { value: [] as THREE.Vector4[] },
    uSodium: { value: srgb(SODIUM) },
    uHeadPos: { value: new THREE.Vector3() },
    uHeadDir: { value: new THREE.Vector3(0, 0, 1) },
    uHead: { value: 0 },
  };
  private readonly lastCam = new THREE.Vector3();
  private readonly camVel = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private hasLast = false;

  constructor(
    count: number,
    private readonly lamps: { readonly lights: THREE.PointLight[]; readonly lit: number },
    private readonly headlight: THREE.SpotLight,
  ) {
    this.group.name = 'rain';
    const lampN = Math.max(1, Math.min(RAIN_LAMPS, lamps.lights.length));
    for (let i = 0; i < lampN; i++) this.uniforms.uLamps.value.push(new THREE.Vector4(0, -1e5, 0, 0));
    // each drop is a thin quad; random seeds packed in a per-vertex attribute
    const pos = new Float32Array(count * 4 * 3);
    const seed = new Float32Array(count * 4 * 3);
    const idx = new Uint32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const sx = Math.random();
      const sy = Math.random();
      const sz = Math.random();
      const corners = [
        [-0.5, 0],
        [0.5, 0],
        [0.5, 1],
        [-0.5, 1],
      ];
      for (let c = 0; c < 4; c++) {
        pos.set([corners[c][0], corners[c][1], 0], (i * 4 + c) * 3);
        seed.set([sx, sy, sz], (i * 4 + c) * 3);
      }
      idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    // additive with straight alpha draws as (SRC_ALPHA, ONE): the colour carries the fade and alpha stays 1, or it is applied twice
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform vec3 uCam;
        uniform vec3 uCenter;
        uniform vec3 uBox;
        uniform float uIntensity;
        uniform vec3 uTail;
        uniform float uLen;
        varying float vA;
        varying vec2 vQ;
        varying vec3 vCol;
        ${rainLightGlsl(lampN)}
        void main() {
          vec3 p = aSeed * uBox;
          p.y -= uTime * (620.0 + aSeed.z * 220.0);
          p.x += uTime * 40.0;
          vec3 origin = uCenter - uBox * 0.5;
          p = mod(p - origin, uBox) + origin;
          // drops fade out near the box edges
          vec3 rel = (p - uCenter) / (uBox * 0.5);
          vA = (1.0 - smoothstep(0.7, 1.0, max(abs(rel.x), abs(rel.z)))) * uIntensity * step(aSeed.x * 0.999, uIntensity);
          // and right up against the lens, where one drop would fill the screen
          vA *= smoothstep(6.0, 24.0, length(p - uCam));
          // the tail trails back along the drop's path as seen from the moving camera
          vec3 side = cross(uTail, normalize(uCam - p));
          side /= max(length(side), 0.001);
          vec3 wp = p + side * position.x * 0.35 + uTail * position.y * uLen;
          vQ = position.xy;
          vCol = mix(vec3(0.62, 0.68, 0.78), vec3(0.9, 0.72, 0.5), uNight * 0.4) * (0.5 - uNight * 0.3) + rainLight(p);
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        varying vec2 vQ;
        varying vec3 vCol;
        void main() {
          // thin across, brightest at the head and fading up the tail
          float a = vA * 0.6 * (1.0 - abs(vQ.x) * 2.0) * (1.0 - vQ.y * 0.8);
          if (a < 0.005) discard;
          gl_FragColor = vec4(vCol * a, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.drops = new THREE.Mesh(g, mat);
    this.drops.frustumCulled = false;
    this.drops.name = 'rain-drops';
    this.group.add(this.drops);

    // splashes: expanding rings on the ground in view ahead of the camera
    const sc = Math.round(count / 6);
    const sp = new Float32Array(sc * 4 * 3);
    const ss = new Float32Array(sc * 4 * 3);
    const si = new Uint32Array(sc * 6);
    for (let i = 0; i < sc; i++) {
      const a = Math.random();
      const b = Math.random();
      const c = Math.random();
      const cs = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
      for (let k = 0; k < 4; k++) {
        sp.set([cs[k][0], 0, cs[k][1]], (i * 4 + k) * 3);
        ss.set([a, b, c], (i * 4 + k) * 3);
      }
      si.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4, i * 4 + 3, i * 4 + 2], i * 6);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aSeed', new THREE.BufferAttribute(ss, 3));
    sg.setIndex(new THREE.BufferAttribute(si, 1));
    const smat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform vec3 uCam;
        uniform vec3 uFwd;
        uniform float uGround;
        uniform float uIntensity;
        varying vec2 vUv;
        varying float vT;
        varying vec3 vCol;
        ${rainLightGlsl(lampN)}
        void main() {
          float t = fract(uTime * 1.7 + aSeed.z);
          vT = t;
          float cycle = floor(uTime * 1.7 + aSeed.z);
          vec2 r = fract(aSeed.xy + vec2(cycle * 0.137, cycle * 0.291));
          // a wedge of road ahead, wider further out
          float f = 25.0 + r.y * 240.0;
          vec3 right = vec3(-uFwd.z, 0.0, uFwd.x);
          vec3 c = vec3(uCam.x, uGround + 0.4, uCam.z) + uFwd * f + right * (r.x - 0.5) * (40.0 + f * 1.4);
          vUv = position.xz;
          float size = 0.4 + t * 1.6;
          vec3 wp = c + vec3(position.x, 0.0, position.z) * size * step(aSeed.x, uIntensity);
          vCol = vec3(0.7, 0.75, 0.85) * (1.0 - uNight * 0.6) + rainLight(c);
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying float vT;
        varying vec3 vCol;
        void main() {
          float d = length(vUv);
          float ring = smoothstep(0.7, 0.9, d) * (1.0 - smoothstep(0.9, 1.0, d));
          float a = ring * (1.0 - vT) * 0.2;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vCol * a, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.splashes = new THREE.Mesh(sg, smat);
    this.splashes.frustumCulled = false;
    this.splashes.name = 'rain-splashes';
    this.group.add(this.splashes);
  }

  /** `ground` is the height of the road under the camera's focus. */
  update(camera: THREE.Camera, dt: number, rain: number, _wet: number, ground: number): void {
    const u = this.uniforms;
    // eases in and out over a second or so, at any frame rate
    u.uIntensity.value += (rain - u.uIntensity.value) * Math.min(1, dt * 1.2);
    const on = u.uIntensity.value > 0.01;
    this.drops.visible = on;
    this.splashes.visible = on;
    const cam = camera.position;
    // camera velocity, eased; a jump (a cut, a respawn) is not a speed
    if (this.hasLast && dt > 0) {
      const v = this.tmp.subVectors(cam, this.lastCam).divideScalar(dt);
      if (v.lengthSq() < 1500 * 1500) this.camVel.lerp(v, Math.min(1, dt * 8));
    }
    this.lastCam.copy(cam);
    this.hasLast = true;
    if (!on) return;
    u.uCam.value.copy(cam);
    const fwd = camera.getWorldDirection(u.uFwd.value);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, 1);
    fwd.normalize();
    u.uCenter.value.copy(cam).addScaledVector(fwd, AHEAD);
    u.uGround.value = ground;
    // streaks trail back along the drop's path relative to the camera, so they slant at you at speed
    const rel = this.tmp.copy(FALL).sub(this.camVel);
    const speed = rel.length();
    u.uTail.value.copy(rel).divideScalar(-Math.max(speed, 1));
    u.uLen.value = 14 * THREE.MathUtils.clamp(speed / 700, 1, 1.6);
    const lights = this.lamps.lights;
    for (let i = 0; i < u.uLamps.value.length; i++) {
      const l = u.uLamps.value[i];
      if (i < lights.length) l.set(lights[i].position.x, lights[i].position.y, lights[i].position.z, this.lamps.lit);
      else l.set(0, -1e5, 0, 0);
    }
    const h = this.headlight;
    h.getWorldPosition(u.uHeadPos.value);
    h.target.getWorldPosition(u.uHeadDir.value).sub(u.uHeadPos.value).normalize();
    u.uHead.value = h.intensity > 0 ? globalUniforms.uNight.value : 0;
  }
}

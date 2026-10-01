/**
 * Rain: streaks that wrap around a box following the camera, computed in the
 * vertex shader so the CPU does nothing per drop. Splashes are small rings on
 * the ground near the camera.
 */
import * as THREE from 'three';
import { globalUniforms } from './Shared';

export class RainView {
  readonly group = new THREE.Group();
  private readonly drops: THREE.Mesh;
  private readonly splashes: THREE.Mesh;
  private readonly uniforms = {
    uTime: globalUniforms.uTime,
    uCam: { value: new THREE.Vector3() },
    uIntensity: { value: 0 },
    uBox: { value: new THREE.Vector3(360, 220, 360) },
  };

  constructor(count: number) {
    this.group.name = 'rain';
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
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform vec3 uCam;
        uniform vec3 uBox;
        uniform float uIntensity;
        varying float vA;
        void main() {
          vec3 p = aSeed * uBox;
          p.y -= uTime * (620.0 + aSeed.z * 220.0);
          p.x += uTime * 40.0;
          vec3 origin = uCam - uBox * 0.5;
          p = mod(p - origin, uBox) + origin;
          // drops fade out near the box edges
          vec3 rel = (p - uCam) / (uBox * 0.5);
          vA = (1.0 - smoothstep(0.7, 1.0, max(abs(rel.x), abs(rel.z)))) * uIntensity * step(aSeed.x * 0.999, uIntensity);
          vec3 toCam = normalize(uCam - p);
          vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), toCam));
          vec3 wp = p + side * position.x * 0.35 + vec3(0.12, 1.0, 0.0) * position.y * 14.0;
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          if (vA < 0.01) discard;
          gl_FragColor = vec4(vec3(0.62, 0.68, 0.78) * vA * 0.5, vA * 0.5);
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

    // splashes: expanding rings on the ground around the camera
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
        uniform float uIntensity;
        varying vec2 vUv;
        varying float vT;
        void main() {
          float t = fract(uTime * 1.7 + aSeed.z);
          vT = t;
          float cycle = floor(uTime * 1.7 + aSeed.z);
          vec2 r = fract(aSeed.xy + vec2(cycle * 0.137, cycle * 0.291));
          vec3 c = vec3(uCam.x + (r.x - 0.5) * 300.0, 0.4, uCam.z + (r.y - 0.5) * 300.0);
          vUv = position.xz;
          float size = 0.4 + t * 1.6;
          vec3 wp = c + vec3(position.x, 0.0, position.z) * size * step(aSeed.x, uIntensity);
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying float vT;
        void main() {
          float d = length(vUv);
          float ring = smoothstep(0.7, 0.9, d) * (1.0 - smoothstep(0.9, 1.0, d));
          float a = ring * (1.0 - vT) * 0.16;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vec3(0.7, 0.75, 0.85) * a, a);
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

  update(camera: THREE.Camera, _dt: number, rain: number, _wet: number): void {
    this.uniforms.uCam.value.copy(camera.position);
    this.uniforms.uIntensity.value += (rain - this.uniforms.uIntensity.value) * 0.02;
    const on = this.uniforms.uIntensity.value > 0.01;
    this.drops.visible = on;
    this.splashes.visible = on;
  }
}

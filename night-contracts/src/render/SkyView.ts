/**
 * Sky dome (gradient, sun and moon discs, stars, horizon glow), scene lights
 * driven by the time of day, and the ocean surface.
 */
import * as THREE from 'three';
import type { Lighting } from '../world/DayNight';
import { globalUniforms, srgb } from './Shared';

export class SkyView {
  readonly dome: THREE.Mesh;
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  private readonly uniforms = {
    uZenith: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uGlow: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color() },
    uIsSun: { value: 1 },
    uStars: { value: 0 },
    uFlash: { value: 0 },
    uTime: globalUniforms.uTime,
  };

  constructor(scene: THREE.Scene, shadows: boolean, shadowSize: number) {
    const geo = new THREE.SphereGeometry(4600, 32, 16);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uZenith;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform float uIsSun;
        uniform float uStars;
        uniform float uFlash;
        uniform float uTime;
        varying vec3 vDir;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, -0.2, 1.0);
          float t = pow(max(h, 0.0), 0.55);
          vec3 col = mix(uHorizon, uZenith, t);
          // warm band just above the horizon
          float band = exp(-max(h, 0.0) * 9.0) * (1.0 - smoothstep(-0.05, 0.0, -h) * 0.0);
          float toward = 0.5 + 0.5 * dot(normalize(vec3(uSunDir.x, 0.0, uSunDir.z)), normalize(vec3(d.x, 0.0, d.z)));
          col += uGlow * band * mix(0.35, 1.0, toward * uIsSun + (1.0 - uIsSun) * 0.6);
          // below the horizon fade to the horizon colour
          col = mix(col, uHorizon * 0.7, smoothstep(0.0, -0.15, h));
          // sun or moon disc
          float cosA = dot(d, normalize(uSunDir));
          float disc = smoothstep(uIsSun > 0.5 ? 0.9994 : 0.99965, 1.0, cosA);
          float halo = pow(max(cosA, 0.0), uIsSun > 0.5 ? 300.0 : 900.0) * (uIsSun > 0.5 ? 1.2 : 0.4);
          col += uSunColor * (disc * (uIsSun > 0.5 ? 8.0 : 2.2) + halo);
          // stars
          if (uStars > 0.01 && h > 0.05) {
            vec3 g = floor(d * 380.0);
            float s = hash(g);
            float tw = 0.6 + 0.4 * sin(uTime * 2.0 + s * 40.0);
            col += vec3(0.8, 0.85, 1.0) * step(0.9975, s) * uStars * tw * smoothstep(0.05, 0.3, h);
          }
          col += vec3(0.6, 0.7, 1.0) * uFlash;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    this.dome = new THREE.Mesh(geo, mat);
    this.dome.name = 'sky';
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -10;
    scene.add(this.dome);

    this.hemi = new THREE.HemisphereLight(0x223355, 0x111111, 0.5);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = shadows;
    if (shadows) {
      this.sun.shadow.mapSize.set(shadowSize, shadowSize);
      const cam = this.sun.shadow.camera;
      cam.left = -420;
      cam.right = 420;
      cam.top = 420;
      cam.bottom = -420;
      cam.near = 10;
      cam.far = 2400;
      this.sun.shadow.bias = -0.0004;
      this.sun.shadow.normalBias = 1.2;
    }
    scene.add(this.sun);
    scene.add(this.sun.target);
  }

  update(l: Lighting, focus: THREE.Vector3, camPos: THREE.Vector3, flash: number): void {
    this.dome.position.copy(camPos);
    const u = this.uniforms;
    u.uZenith.value.setHex(l.zenith, THREE.SRGBColorSpace);
    u.uHorizon.value.setHex(l.horizon, THREE.SRGBColorSpace);
    u.uGlow.value.setHex(l.glow, THREE.SRGBColorSpace).multiplyScalar(0.55);
    // sim (x, y, z) -> three (x, z, y)
    u.uSunDir.value.set(l.lightDir[0], l.lightDir[2], l.lightDir[1]).normalize();
    u.uSunColor.value.setHex(l.sunColor, THREE.SRGBColorSpace);
    u.uIsSun.value = l.night < 0.6 ? 1 : 0;
    u.uStars.value = l.starAlpha;
    u.uFlash.value = flash;

    this.hemi.color.setHex(l.hemiSky, THREE.SRGBColorSpace);
    this.hemi.groundColor.setHex(l.hemiGround, THREE.SRGBColorSpace);
    this.hemi.intensity = l.hemiIntensity + flash * 2;
    this.sun.color.setHex(l.sunColor, THREE.SRGBColorSpace);
    this.sun.intensity = l.sunIntensity + flash * 4;
    const d = u.uSunDir.value;
    this.sun.position.set(focus.x + d.x * 1200, focus.y + d.y * 1200, focus.z + d.z * 1200);
    this.sun.target.position.copy(focus);
    this.sun.target.updateMatrixWorld();
  }
}

export class WaterView {
  readonly mesh: THREE.Mesh;
  private readonly uniforms = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uTime: globalUniforms.uTime,
    uSky: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3() },
    uSunColor: { value: new THREE.Color() },
    uShore: { value: 0 },
    uNight: globalUniforms.uNight,
    uCam: globalUniforms.uCamPos,
    uGlow: { value: new THREE.Color() },
  };

  constructor(shoreY: number, minX: number, maxX: number) {
    const depth = 5000;
    const geo = new THREE.PlaneGeometry(maxX - minX + 6000, depth, 1, 1).rotateX(-Math.PI / 2);
    geo.translate((minX + maxX) / 2, -3, shoreY - depth / 2 + 40);
    this.uniforms.uShore.value = shoreY;
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fog: true,
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uSky;
        uniform vec3 uHorizon;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform vec3 uGlow;
        uniform float uShore;
        uniform float uNight;
        uniform vec3 uCam;
        varying vec3 vWorld;
        #include <common>
        #include <fog_pars_fragment>
        vec2 wave(vec2 p, vec2 dir, float freq, float speed) {
          float ph = dot(p, dir) * freq + uTime * speed;
          return dir * cos(ph) * freq;
        }
        void main() {
          vec2 p = vWorld.xz;
          vec2 g = wave(p, normalize(vec2(0.3, 1.0)), 0.021, 1.1) * 3.0
                 + wave(p, normalize(vec2(-0.7, 0.8)), 0.047, 1.7) * 1.4
                 + wave(p, normalize(vec2(0.9, 0.2)), 0.11, 2.6) * 0.5
                 + wave(p, normalize(vec2(-0.2, -1.0)), 0.23, 3.3) * 0.25;
          vec3 n = normalize(vec3(-g.x, 1.0, -g.y) + vec3(0.0, 1.5, 0.0));
          vec3 v = normalize(uCam - vWorld);
          float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
          vec3 deep = mix(vec3(0.02, 0.09, 0.12), vec3(0.01, 0.025, 0.04), uNight);
          vec3 refl = mix(uHorizon, uSky, 0.35) + uGlow * 0.25;
          vec3 col = mix(deep, refl, fres);
          vec3 h = normalize(normalize(uSunDir) + v);
          float spec = pow(max(dot(n, h), 0.0), uNight > 0.5 ? 180.0 : 400.0);
          col += uSunColor * spec * (uNight > 0.5 ? 1.6 : 5.0);
          // foam near the shore
          float dShore = uShore - vWorld.z;
          float foam = smoothstep(26.0, 0.0, dShore + sin(p.x * 0.05 + uTime * 1.3) * 5.0);
          col = mix(col, vec3(0.8, 0.82, 0.8) * (1.0 - uNight * 0.75), foam * 0.7);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = 'ocean';
  }

  update(l: Lighting): void {
    const u = this.uniforms;
    u.uSky.value.setHex(l.zenith, THREE.SRGBColorSpace);
    u.uHorizon.value.setHex(l.horizon, THREE.SRGBColorSpace);
    u.uGlow.value.setHex(l.glow, THREE.SRGBColorSpace);
    u.uSunDir.value.set(l.lightDir[0], l.lightDir[2], l.lightDir[1]).normalize();
    u.uSunColor.value.copy(srgb(l.sunColor));
  }
}

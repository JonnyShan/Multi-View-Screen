// Post-processing (bloom + cinematic final pass) and particle effects.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import * as TX from './textures.js';

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uAspect: { value: 1 },
    uTime: { value: 0 },
    uSpeed: { value: 0 },
    uExposure: { value: 0.9 },
    uVignette: { value: 0.9 },
    uGrain: { value: 0.035 },
    uSat: { value: 1.08 },
    uFade: { value: 0 },
    uFlash: { value: 0 },
    uSun: { value: new THREE.Vector2(-1, -1) },
    uSunOn: { value: 0 },
    uLines: { value: 0 },
    tRays: { value: null },
    uRaysOn: { value: 0 },
    tDirt: { value: null },
    uDirt: { value: 0.35 },
    uSharpen: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse, tRays, tDirt;
    uniform vec2 uRes; uniform float uAspect, uTime, uSpeed, uExposure, uVignette, uGrain, uSat, uFade, uFlash, uSunOn, uLines, uRaysOn, uDirt, uSharpen;
    uniform vec2 uSun;
    varying vec2 vUv;
    vec3 RRTAndODTFit(vec3 v){ vec3 a = v*(v+0.0245786)-0.000090537; vec3 b = v*(0.983729*v+0.4329510)+0.238081; return a/b; }
    vec3 aces(vec3 c){
      const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));
      const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));
      c = I*c; c = RRTAndODTFit(c); c = O*c; return clamp(c,0.0,1.0);
    }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    float lum(vec3 c){ return dot(c, vec3(0.2126,0.7152,0.0722)); }
    void main(){
      vec2 uv = vUv;
      vec2 asp = vec2(uAspect, 1.0);
      vec2 focus = vec2(0.5, 0.56);
      vec2 dir = uv - focus;
      float r = length((uv-0.5)*asp) / length(0.5*asp);
      float blur = uSpeed * 0.07 * smoothstep(0.2, 1.0, r);
      float ca = (0.0012 + uSpeed*0.0035) * r;
      vec3 col;
      if (blur < 0.0005) {
        col = vec3(texture2D(tDiffuse, focus + dir*(1.0+ca)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, focus + dir*(1.0-ca)).b);
      } else {
        col = vec3(0.0);
        for (int i = 0; i < 7; i++) {
          float t = float(i)/6.0;
          vec2 o = dir*(1.0 - blur*t);
          col += vec3(texture2D(tDiffuse, focus + o*(1.0+ca)).r, texture2D(tDiffuse, focus + o).g, texture2D(tDiffuse, focus + o*(1.0-ca)).b);
        }
        col /= 7.0;
      }
      // Luma sharpening (relative, so it is safe on HDR values and fades out under the speed blur).
      if (uSharpen > 0.0) {
        vec2 px = 1.0 / uRes;
        float lc = lum(texture2D(tDiffuse, uv).rgb);
        float ln = 0.25 * (lum(texture2D(tDiffuse, uv + vec2(px.x, 0.0)).rgb) + lum(texture2D(tDiffuse, uv - vec2(px.x, 0.0)).rgb)
          + lum(texture2D(tDiffuse, uv + vec2(0.0, px.y)).rgb) + lum(texture2D(tDiffuse, uv - vec2(0.0, px.y)).rgb));
        float sh = clamp((lc - ln) / (ln + 0.05), -0.5, 0.5);
        col *= 1.0 + sh * uSharpen * (1.0 - smoothstep(0.0, 0.02, blur));
      }
      // Sun shafts through the trees and stands, and the grime on the lens they light up.
      if (uRaysOn > 0.0) {
        vec3 rays = texture2D(tRays, uv).rgb * uRaysOn;
        col += rays;
        float d0s = length((uv - uSun) * asp);
        float glow = lum(rays) * 1.2 + uSunOn * exp(-d0s * 3.0) * 0.5;
        col += texture2D(tDirt, uv).rgb * vec3(1.0, 0.8, 0.6) * glow * uDirt;
      }
      // Sun flare, occluded by what's actually on screen at the sun.
      if (uSunOn > 0.0) {
        float occ = 0.0;
        for (int k = -2; k <= 2; k++) occ += lum(texture2D(tDiffuse, uSun + vec2(float(k)*0.003, 0.0)).rgb);
        float vis = smoothstep(1.4, 5.0, occ/5.0) * uSunOn;
        vec2 toC = vec2(0.5) - uSun;
        vec3 fl = vec3(0.0);
        float d0 = length((uv-uSun)*asp);
        fl += vec3(1.0,0.72,0.42) * exp(-d0*12.0) * 0.4;
        fl += vec3(1.0,0.55,0.3) * exp(-abs(uv.y-uSun.y)*160.0) * exp(-abs(uv.x-uSun.x)*uAspect*2.2) * 0.9;
        fl += vec3(0.9,0.5,0.25) * smoothstep(0.07,0.03,length((uv-(uSun+toC*0.55))*asp)) * 0.10;
        fl += vec3(0.4,0.6,0.9) * smoothstep(0.04,0.015,length((uv-(uSun+toC*1.1))*asp)) * 0.12;
        fl += vec3(0.9,0.7,0.4) * smoothstep(0.11,0.09,length((uv-(uSun+toC*1.45))*asp)) * 0.06;
        fl += vec3(1.0,0.4,0.2) * smoothstep(0.025,0.01,length((uv-(uSun+toC*1.8))*asp)) * 0.15;
        col += fl * vis;
      }
      col = aces(col * uExposure);
      col = toSRGB(col);
      float l = dot(col, vec3(0.299,0.587,0.114));
      col = mix(col, col*vec3(0.93,1.0,1.07), (1.0-l)*0.35);
      col = mix(col, col*vec3(1.06,1.0,0.9), l*0.45);
      col = mix(vec3(l), col, uSat);
      col = mix(col, col*col*(3.0-2.0*col), 0.22);
      // speed lines at the frame edges
      if (uLines > 0.0) {
        float ang = atan(dir.y, dir.x);
        float id = floor(ang*120.0);
        float h = hash(vec2(id, 3.1));
        float seg = fract(r*1.6 - uTime*(4.0+h*6.0) + h*10.0);
        float line = step(0.93, h) * smoothstep(0.55, 1.0, r) * smoothstep(0.0,0.1,seg) * smoothstep(0.45,0.1,seg);
        col = mix(col, vec3(1.0,0.95,0.85), line * uLines * 0.35);
      }
      col *= mix(1.0, smoothstep(1.3, 0.3, r), uVignette);
      col += (hash(uv*uRes + fract(uTime)*61.0) - 0.5) * uGrain;
      col = mix(col, vec3(1.0,0.97,0.9), uFlash);
      col *= 1.0 - uFade;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

// Screen-space crepuscular rays: bright sky around the sun, radially smeared toward it at quarter res.
const RayMaskShader = {
  uniforms: { tDiffuse: { value: null }, uSun: { value: new THREE.Vector2() }, uAspect: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uSun; uniform float uAspect; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float m = smoothstep(1.4, 5.0, l);
      float d = length((vUv - uSun) * vec2(uAspect, 1.0));
      m *= smoothstep(0.85, 0.0, d);
      gl_FragColor = vec4(min(c, vec3(8.0)) * m, 1.0);
    }`,
};
const RayBlurShader = {
  uniforms: { tDiffuse: { value: null }, uSun: { value: new THREE.Vector2() }, uStep: { value: 1 }, uDecay: { value: 0.955 }, uWeight: { value: 0.06 } },
  vertexShader: RayMaskShader.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uSun; uniform float uStep, uDecay, uWeight; varying vec2 vUv;
    void main(){
      vec2 delta = (vUv - uSun) * uStep / 28.0;
      vec2 p = vUv; float w = 1.0; vec3 sum = vec3(0.0);
      for (int i = 0; i < 28; i++) { sum += texture2D(tDiffuse, p).rgb * w; p -= delta; w *= uDecay; }
      gl_FragColor = vec4(sum * uWeight, 1.0);
    }`,
};

class RaysPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
    const opt = { type: THREE.HalfFloatType, depthBuffer: false };
    this.a = new THREE.WebGLRenderTarget(1, 1, opt);
    this.b = new THREE.WebGLRenderTarget(1, 1, opt);
    this.mask = new THREE.ShaderMaterial(RayMaskShader);
    this.blur = new THREE.ShaderMaterial(RayBlurShader);
    this.blur2 = new THREE.ShaderMaterial(RayBlurShader);
    this.blur2.uniforms = THREE.UniformsUtils.clone(RayBlurShader.uniforms);
    this.quad = new FullScreenQuad(this.mask);
    this.sun = new THREE.Vector2();
    this.on = 0;
  }

  get texture() { return this.a.texture; }

  setSize(w, h) {
    const rw = Math.max(1, Math.round(w / 4)), rh = Math.max(1, Math.round(h / 4));
    this.a.setSize(rw, rh); this.b.setSize(rw, rh);
    this.mask.uniforms.uAspect.value = w / h;
  }

  render(renderer, writeBuffer, readBuffer) {
    if (this.on <= 0) return;
    this.mask.uniforms.tDiffuse.value = readBuffer.texture;
    this.mask.uniforms.uSun.value.copy(this.sun);
    this.quad.material = this.mask;
    renderer.setRenderTarget(this.a); this.quad.render(renderer);
    const u1 = this.blur.uniforms;
    u1.tDiffuse.value = this.a.texture; u1.uSun.value.copy(this.sun); u1.uStep.value = 0.9; u1.uWeight.value = 0.022; u1.uDecay.value = 0.96;
    this.quad.material = this.blur;
    renderer.setRenderTarget(this.b); this.quad.render(renderer);
    const u2 = this.blur2.uniforms;
    u2.tDiffuse.value = this.b.texture; u2.uSun.value.copy(this.sun); u2.uStep.value = 0.3; u2.uWeight.value = 0.03; u2.uDecay.value = 0.985;
    this.quad.material = this.blur2;
    renderer.setRenderTarget(this.a); this.quad.render(renderer);
  }

  dispose() { this.a.dispose(); this.b.dispose(); this.mask.dispose(); this.blur.dispose(); this.blur2.dispose(); this.quad.dispose(); }
}

export class Post {
  constructor(renderer, scene, camera, quality) {
    this.renderer = renderer;
    const w = innerWidth, h = innerHeight;
    const rt = new THREE.WebGLRenderTarget(w * renderer.getPixelRatio(), h * renderer.getPixelRatio(), {
      type: THREE.HalfFloatType, samples: quality.msaa,
    });
    this.composer = new EffectComposer(renderer, rt);
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);
    this.rays = quality.rays ? new RaysPass() : null;
    if (this.rays) this.composer.addPass(this.rays);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.55, 1.05);
    this.composer.addPass(this.bloom);
    this.final = new ShaderPass(FinalShader);
    this.composer.addPass(this.final);
    this.u = this.final.uniforms;
    this.u.uSharpen.value = quality.sharpen;
    if (this.rays) {
      this.u.tRays.value = this.rays.texture;
      this.u.tDirt.value = TX.lensDirtTexture();
    }
    this.setSize(w, h);
  }

  setCamera(cam) { this.renderPass.camera = cam; }

  setSize(w, h) {
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.u.uRes.value.set(w * this.renderer.getPixelRatio(), h * this.renderer.getPixelRatio());
    this.u.uAspect.value = w / h;
  }

  // Sun position in UV space and how much of it should drive the shafts (fades as it leaves the frame).
  setRays(sunUv, on) {
    if (!this.rays) return;
    this.rays.sun.copy(sunUv);
    this.rays.on = on;
    this.u.uRaysOn.value = on;
  }

  render(dt) {
    this.u.uTime.value += dt;
    this.composer.render(dt);
  }
}

// ---------------------------------------------------------------------------
// GPU-light particles (CPU sim, one draw call per system).
export class Particles {
  constructor(scene, max, { additive = true, size = 0.12, texture } = {}) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max).fill(1);
    this.vel = new Float32Array(max * 3);
    this.floor = new Float32Array(max);
    this.sizeArr = new Float32Array(max);
    this.cursor = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.sizeArr, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uMap: { value: texture || TX.radialTexture() }, uScale: { value: innerHeight / 2 } },
      vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uScale;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = size*uScale/max(0.1,-mv.z); vC = color; vA = step(0.0001,size); }`,
      fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(uMap, gl_PointCoord); if (t.a*vA < 0.02) discard; gl_FragColor = vec4(vC*t.rgb, t.a*vA); }`,
    });
    this.material = mat;
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.baseSize = size;
    this.additive = additive;
    scene.add(this.points);
  }

  emit(p, v, life, color, size = this.baseSize, floorY = -1e9) {
    const i = this.cursor; this.cursor = (this.cursor + 1) % this.max;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.col.set([color.r, color.g, color.b], i * 3);
    this.life[i] = life; this.maxLife[i] = life; this.sizeArr[i] = size; this.floor[i] = floorY;
  }

  update(dt, gravity = -9.8, drag = 0) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.sizeArr[i] = 0; continue; }
      this.life[i] -= dt;
      const k = i * 3;
      this.vel[k + 1] += gravity * dt;
      if (drag) { const d = Math.exp(-drag * dt); this.vel[k] *= d; this.vel[k + 1] *= d; this.vel[k + 2] *= d; }
      this.pos[k] += this.vel[k] * dt; this.pos[k + 1] += this.vel[k + 1] * dt; this.pos[k + 2] += this.vel[k + 2] * dt;
      if (this.pos[k + 1] < this.floor[i]) { this.pos[k + 1] = this.floor[i]; this.vel[k + 1] *= -0.35; this.vel[k] *= 0.6; this.vel[k + 2] *= 0.6; }
      const f = this.life[i] / this.maxLife[i];
      if (this.additive) { this.col[k] *= 0.985; this.col[k + 1] *= 0.955; this.col[k + 2] *= 0.9; }
      this.sizeArr[i] = this.additive ? this.sizeArr[i] : this.sizeArr[i] * (1 + dt * 1.5);
      if (this.life[i] <= 0) this.sizeArr[i] = 0;
      else if (f < 0.2 && this.additive) this.sizeArr[i] *= 0.9;
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.attributes.size.needsUpdate = true;
  }

  resize(pixelRatio, fovDeg = 65) {
    this.material.uniforms.uScale.value = innerHeight * pixelRatio / 2 / Math.tan(fovDeg * Math.PI / 360);
  }
}

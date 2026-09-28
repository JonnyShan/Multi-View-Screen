/**
 * Post-processing: bloom for lamps, headlights and neon, ACES tone mapping,
 * then a colour grade that blends per-time-of-day LUTs, plus a light vignette.
 * Phones get a quarter-resolution bloom and the LUT only.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { QualitySettings } from './Quality';

type Rgb = [number, number, number];

interface Grade {
  shadows: Rgb;
  highlights: Rgb;
  contrast: number;
  saturation: number;
  lift: number;
}

/** LUT keyframes: night, dawn/dusk, day, golden hour. */
const GRADES: Grade[] = [
  { shadows: [0.86, 0.97, 1.1], highlights: [1.1, 1.0, 0.86], contrast: 1.12, saturation: 0.92, lift: -0.01 },
  { shadows: [0.95, 0.93, 1.06], highlights: [1.08, 0.98, 0.9], contrast: 1.06, saturation: 1.0, lift: 0 },
  { shadows: [0.97, 0.99, 1.03], highlights: [1.04, 1.01, 0.96], contrast: 1.08, saturation: 1.06, lift: 0 },
  { shadows: [0.94, 0.95, 1.06], highlights: [1.14, 1.0, 0.8], contrast: 1.1, saturation: 1.05, lift: 0.005 },
];

function makeLut(g: Grade, size = 24): THREE.Data3DTexture {
  const data = new Uint8Array(size * size * size * 4);
  let i = 0;
  for (let b = 0; b < size; b++) {
    for (let gg = 0; gg < size; gg++) {
      for (let r = 0; r < size; r++) {
        let cr = r / (size - 1);
        let cg = gg / (size - 1);
        let cb = b / (size - 1);
        const lum = 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;
        const hw = Math.min(1, Math.max(0, (lum - 0.25) / 0.55));
        const sw = 1 - hw;
        cr *= g.shadows[0] * sw + g.highlights[0] * hw;
        cg *= g.shadows[1] * sw + g.highlights[1] * hw;
        cb *= g.shadows[2] * sw + g.highlights[2] * hw;
        const l2 = 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;
        cr = l2 + (cr - l2) * g.saturation;
        cg = l2 + (cg - l2) * g.saturation;
        cb = l2 + (cb - l2) * g.saturation;
        const con = (v: number): number => (v - 0.5) * g.contrast + 0.5 + g.lift;
        data[i++] = Math.round(Math.min(1, Math.max(0, con(cr))) * 255);
        data[i++] = Math.round(Math.min(1, Math.max(0, con(cg))) * 255);
        data[i++] = Math.round(Math.min(1, Math.max(0, con(cb))) * 255);
        data[i++] = 255;
      }
    }
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    lut0: { value: null as THREE.Data3DTexture | null },
    lut1: { value: null as THREE.Data3DTexture | null },
    lut2: { value: null as THREE.Data3DTexture | null },
    lut3: { value: null as THREE.Data3DTexture | null },
    weights: { value: new THREE.Vector4(1, 0, 0, 0) },
    vignette: { value: 0.28 },
    lutSize: { value: 24 },
    flash: { value: 0 },
    hurt: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    precision highp sampler3D;
    uniform sampler2D tDiffuse;
    uniform sampler3D lut0;
    uniform sampler3D lut1;
    uniform sampler3D lut2;
    uniform sampler3D lut3;
    uniform vec4 weights;
    uniform float vignette;
    uniform float lutSize;
    uniform float flash;
    uniform float hurt;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 uvw = clamp(c.rgb, 0.0, 1.0) * ((lutSize - 1.0) / lutSize) + 0.5 / lutSize;
      vec3 g = texture(lut0, uvw).rgb * weights.x + texture(lut1, uvw).rgb * weights.y + texture(lut2, uvw).rgb * weights.z + texture(lut3, uvw).rgb * weights.w;
      float wsum = max(0.0001, weights.x + weights.y + weights.z + weights.w);
      g /= wsum;
      vec2 d = vUv - 0.5;
      float v = 1.0 - dot(d, d) * vignette * 2.2;
      g *= v;
      g += vec3(0.8, 0.85, 1.0) * flash;
      float edge = smoothstep(0.25, 0.75, length(d) * 1.4);
      g = mix(g, g * vec3(1.0, 0.25, 0.2) + vec3(0.25, 0.0, 0.0), hurt * edge);
      gl_FragColor = vec4(g, c.a);
    }
  `,
};

export class PostFX {
  readonly composer: EffectComposer | null;
  private readonly bloom: UnrealBloomPass | null;
  private readonly grade: ShaderPass | null;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    q: QualitySettings,
  ) {
    if (!renderer.capabilities.isWebGL2) {
      this.composer = null;
      this.bloom = null;
      this.grade = null;
      return;
    }
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: q.msaa });
    this.composer = new EffectComposer(renderer, target);
    this.composer.addPass(new RenderPass(scene, camera));
    if (q.bloom !== 'off') {
      const div = q.bloom === 'cheap' ? 4 : 2;
      this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / div, size.y / div), 0.55, 0.45, 0.82);
      // keep the bloom chain at reduced resolution whatever size the composer asks for
      const bloom = this.bloom;
      const setSize = bloom.setSize.bind(bloom);
      bloom.setSize = (w: number, h: number) => setSize(Math.max(1, Math.round(w / div)), Math.max(1, Math.round(h / div)));
      this.composer.addPass(this.bloom);
    } else this.bloom = null;
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader);
    const u = this.grade.uniforms;
    u.lut0.value = makeLut(GRADES[0]);
    u.lut1.value = makeLut(GRADES[1]);
    u.lut2.value = makeLut(GRADES[2]);
    u.lut3.value = makeLut(GRADES[3]);
    this.composer.addPass(this.grade);
  }

  setSize(w: number, h: number): void {
    if (!this.composer) return;
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
  }

  update(weights: [number, number, number, number], night: number, flash: number, hurt: number): void {
    if (this.bloom) {
      this.bloom.strength = 0.25 + night * 0.25;
      this.bloom.threshold = 0.92;
    }
    if (this.grade) {
      this.grade.uniforms.weights.value.set(...weights);
      this.grade.uniforms.flash.value = flash;
      this.grade.uniforms.hurt.value = hurt;
    }
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this.composer) this.composer.render();
    else this.renderer.render(scene, camera);
  }
}

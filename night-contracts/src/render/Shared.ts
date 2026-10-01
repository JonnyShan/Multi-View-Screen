/**
 * Shared render helpers: coordinate mapping, global shader uniforms and the
 * custom materials (procedural facades, wet asphalt).
 */
import * as THREE from 'three';

/** Sim (x, y, z) to three (x, z, y). */
export function toThree(x: number, y: number, z: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(x, z, y);
}

/** Rotation about three Y for a model facing +Z to face sim heading `a`. */
export const yawToThree = (a: number): number => Math.PI / 2 - a;

export const srgb = (hex: number): THREE.Color => new THREE.Color().setHex(hex, THREE.SRGBColorSpace);

/** Uniforms shared by every custom shader. Update once per frame. */
export const globalUniforms = {
  uTime: { value: 0 },
  uNight: { value: 1 },
  uWet: { value: 0 },
  uRain: { value: 0 },
  uCamPos: { value: new THREE.Vector3() },
};

const GLSL_HASH = /* glsl */ `
float nc_hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float nc_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = nc_hash(i);
  float b = nc_hash(i + vec2(1.0, 0.0));
  float c = nc_hash(i + vec2(0.0, 1.0));
  float d = nc_hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float nc_band(float x, float a, float b) {
  float w = max(fwidth(x), 1e-4);
  return smoothstep(a - w, a + w, x) - smoothstep(b - w, b + w, x);
}
`;

/**
 * Building material: vertex colour is the wall tint, `aFuv` is facade space
 * (x = window columns, y = storeys) and `aFacade` = (style, seed, litRatio).
 * Windows, mullions and lit interiors are procedural, antialiased with fwidth.
 */
export function createBuildingMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.35 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = globalUniforms.uNight;
    shader.uniforms.uWet = globalUniforms.uWet;
    shader.uniforms.uTime = globalUniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aFuv;\nattribute vec3 aFacade;\nvarying vec2 vFuv;\nvarying vec3 vFacade;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFuv = aFuv;\nvFacade = aFacade;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vFuv;
varying vec3 vFacade;
uniform float uNight;
uniform float uWet;
uniform float uTime;
${GLSL_HASH}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float nc_style = floor(vFacade.x + 0.5);
vec2 nc_f = fract(vFuv);
vec2 nc_id = floor(vFuv);
float nc_win = 0.0;
float nc_frame = 0.0;
if (nc_style > 0.5 && nc_style < 1.5) {
  // art deco ribbon: continuous horizontal glazing with thin mullions
  nc_win = nc_band(nc_f.y, 0.34, 0.84) * (1.0 - nc_band(nc_f.x, -0.02, 0.05));
  nc_frame = nc_band(nc_f.y, 0.9, 0.97) * 0.5;
} else if (nc_style > 1.5 && nc_style < 2.5) {
  // punched windows between pilasters
  nc_win = nc_band(nc_f.x, 0.24, 0.76) * nc_band(nc_f.y, 0.3, 0.84);
  nc_frame = nc_band(nc_f.y, 0.24, 0.3) * nc_band(nc_f.x, 0.2, 0.8);
} else if (nc_style > 2.5 && nc_style < 3.5) {
  // curtain wall with spandrels
  nc_win = (1.0 - nc_band(nc_f.x, -0.03, 0.03)) * nc_band(nc_f.y, 0.12, 0.93);
} else if (nc_style > 3.5) {
  // shopfront
  nc_win = nc_band(nc_f.x, 0.05, 0.95) * nc_band(nc_f.y, 0.1, 0.7);
  nc_frame = nc_band(nc_f.y, 0.78, 0.95);
}
float nc_seed = floor(vFacade.y + 0.5);
float nc_h = nc_hash(nc_id + vec2(nc_seed * 1.37, nc_seed * 0.71));
float nc_h2 = nc_hash(nc_id.yx * 1.13 + vec2(nc_seed * 0.53, 7.1));
float nc_lit = step(nc_h, nc_style > 3.5 ? 0.65 : vFacade.z);
vec3 nc_glass = mix(vec3(0.035, 0.05, 0.065), vec3(0.09, 0.13, 0.16), nc_h2 * (1.0 - uNight));
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.72, nc_frame);
diffuseColor.rgb = mix(diffuseColor.rgb, nc_glass, nc_win);
diffuseColor.rgb *= 1.0 - 0.28 * uWet * (1.0 - nc_win);
`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
float nc_shop_r = step(3.5, nc_style);
roughnessFactor = mix(roughnessFactor, mix(0.16, 0.3, nc_shop_r), nc_win);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.55, uWet);
`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
vec3 nc_warm = mix(vec3(1.0, 0.62, 0.3), vec3(1.0, 0.82, 0.55), nc_h2);
vec3 nc_cool = vec3(0.7, 0.82, 1.0);
vec3 nc_col = mix(nc_warm, nc_cool, step(0.82, nc_h2));
float nc_shop = step(3.5, nc_style);
float nc_inner = mix(1.0, 0.55 + 0.45 * smoothstep(0.1, 0.7, nc_f.y), nc_shop);
totalEmissiveRadiance += nc_win * nc_lit * nc_col * uNight * nc_inner * mix(0.18 + 0.5 * nc_h, 0.22 + 0.25 * nc_h, nc_shop);
`,
      );
  };
  mat.customProgramCacheKey = () => 'nc-building';
  return mat;
}

/**
 * Asphalt: procedural grain plus puddles when wet (dark, near mirror).
 * Uses world position so it tiles seamlessly.
 */
export function createRoadMaterial(color: number, grain = 1): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ color: srgb(color), roughness: 0.92, metalness: 0.0, envMapIntensity: 0.9 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWet = globalUniforms.uWet;
    shader.uniforms.uGrain = { value: grain };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNcWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvNcWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    // worldpos_vertex only runs with some defines; make sure vNcWorld is set
    shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', '#include <fog_vertex>\nvNcWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vNcWorld;\nuniform float uWet;\nuniform float uGrain;\n${GLSL_HASH}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
vec2 nc_p = vNcWorld.xz;
float nc_g = nc_noise(nc_p * 0.9) * 0.5 + nc_noise(nc_p * 0.13) * 0.5;
diffuseColor.rgb *= mix(1.0, 0.82 + 0.3 * nc_g, uGrain);
float nc_pud = smoothstep(0.62 - 0.22 * uWet, 0.7 - 0.2 * uWet, nc_noise(nc_p * 0.018) * 0.7 + nc_noise(nc_p * 0.07) * 0.3) * uWet;
diffuseColor.rgb *= 1.0 - 0.45 * uWet;
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.55, nc_pud);
`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.38, uWet);
roughnessFactor = mix(roughnessFactor, 0.04, nc_pud);
`,
      );
  };
  mat.customProgramCacheKey = () => `nc-road-${grain}`;
  return mat;
}

/** Palm frond / foliage sway in the vertex shader (instanced). */
export function addWindSway(mat: THREE.Material, strength: number, key: string): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = globalUniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
#ifdef USE_INSTANCING
float nc_phase = instanceMatrix[3].x * 0.013 + instanceMatrix[3].z * 0.017;
#else
float nc_phase = 0.0;
#endif
float nc_k = max(0.0, position.y) * ${strength.toFixed(4)};
transformed.x += sin(uTime * 1.3 + nc_phase) * nc_k;
transformed.z += cos(uTime * 1.1 + nc_phase * 1.3) * nc_k * 0.7;
`,
    );
  };
  mat.customProgramCacheKey = () => `nc-sway-${key}`;
}

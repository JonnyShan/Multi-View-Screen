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
float nc_band(float x, float a, float b, float w) {
  return smoothstep(a - w, a + w, x) - smoothstep(b - w, b + w, x);
}
float nc_band(float x, float a, float b) {
  return nc_band(x, a, b, max(fwidth(x), 1e-4));
}
`;

/** 3 x 5 capitals for the painted and lit shop signs, rows top first. */
const GLYPHS: Record<string, string> = {
  A: '.#./#.#/###/#.#/#.#', B: '##./#.#/##./#.#/##.', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.',
  E: '###/#../##./#../###', F: '###/#../##./#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#',
  I: '###/.#./.#./.#./###', J: '..#/..#/..#/#.#/.#.', K: '#.#/#.#/##./#.#/#.#', L: '#../#../#../#../###',
  M: '#.#/###/###/#.#/#.#', N: '##./#.#/#.#/#.#/#.#', O: '.#./#.#/#.#/#.#/.#.', P: '##./#.#/##./#../#..',
  Q: '.#./#.#/#.#/##./.##', R: '##./#.#/##./#.#/#.#', S: '.##/#../.#./..#/##.', T: '###/.#./.#./.#./.#.',
  U: '#.#/#.#/#.#/#.#/###', V: '#.#/#.#/#.#/#.#/.#.', W: '#.#/#.#/###/###/#.#', X: '#.#/#.#/.#./#.#/#.#',
  Y: '#.#/#.#/.#./.#./.#.', Z: '###/..#/.#./#../###',
};

/** Generic shop words, at most six letters. Never brand names. */
const SHOP_WORDS = ['CAFE', 'BAR', 'DELI', 'BAKERY', 'MARKET', 'PIZZA', 'BOOKS', 'SUSHI', 'DINER', 'RAMEN', 'KEBAB', 'VIDEO', 'ARCADE', 'SHOES', 'BARBER', 'TACOS'];

function glslSigns(): string {
  const letters = Object.keys(GLYPHS).sort();
  const bits = letters.map((k) => [...GLYPHS[k].replaceAll('/', '')].reduce((m, c, i) => (c === '#' ? m | (1 << i) : m), 0));
  const text = SHOP_WORDS.flatMap((w) => [...w.padEnd(6, ' ')].map((c) => (c === ' ' ? 0 : letters.indexOf(c))));
  return /* glsl */ `
const int NC_WORDS = ${SHOP_WORDS.length};
const int NC_GLYPH[${bits.length}] = int[${bits.length}](${bits.join(', ')});
const int NC_TEXT[${text.length}] = int[${text.length}](${text.join(', ')});
const int NC_LEN[${SHOP_WORDS.length}] = int[${SHOP_WORDS.length}](${SHOP_WORDS.map((w) => w.length).join(', ')});
const vec3 NC_ROOM[6] = vec3[6](vec3(1.0, 0.86, 0.66), vec3(1.0, 0.72, 0.76), vec3(0.66, 1.0, 0.82), vec3(1.0, 0.9, 0.52), vec3(0.82, 0.9, 1.0), vec3(1.0, 0.74, 0.55));
const vec3 NC_NEON[6] = vec3[6](vec3(1.0, 0.25, 0.6), vec3(0.2, 0.95, 0.85), vec3(1.0, 0.6, 0.15), vec3(0.6, 1.0, 0.2), vec3(1.0, 0.95, 0.88), vec3(0.62, 0.38, 1.0));
`;
}

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
      .replace('#include <common>', '#include <common>\nattribute vec2 aFuv;\nattribute vec3 aFacade;\nvarying vec2 vFuv;\nvarying vec3 vFacade;\nvarying float vNcY;')
      // chunk meshes sit at identity, so position.y is the height above sea level
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFuv = aFuv;\nvFacade = aFacade;\nvNcY = position.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vFuv;
varying vec3 vFacade;
varying float vNcY;
uniform float uNight;
uniform float uWet;
uniform float uTime;
${GLSL_HASH}
${glslSigns()}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float nc_style = floor(vFacade.x + 0.5);
vec2 nc_f = fract(vFuv);
vec2 nc_id = floor(vFuv);
float nc_win = 0.0;
float nc_frame = 0.0;
float nc_seed = floor(vFacade.y + 0.5);
// widths from the unwrapped coordinate: fract() jumps at every storey and column edge
vec2 nc_fwv = max(fwidth(vFuv), vec2(1e-4));
float nc_fw = nc_fwv.y;
// detail inside a pane fades to its average once a storey is a few pixels tall
float nc_det = 1.0 - smoothstep(0.06, 0.25, nc_fw);
// sill and head of the glazing within a storey
vec2 nc_pane = vec2(0.0, 1.0);
// shopfront paint over the wall (shutters, fascia boards) and the shop's own light
vec4 nc_paint = vec4(0.0);
vec3 nc_em = vec3(0.0);
if (nc_style > 0.5 && nc_style < 1.5) {
  // art deco ribbon: continuous horizontal glazing with thin mullions
  nc_win = nc_band(nc_f.y, 0.34, 0.84, nc_fw) * (1.0 - nc_band(nc_f.x, -0.02, 0.05, nc_fwv.x));
  nc_frame = nc_band(nc_f.y, 0.9, 0.97, nc_fw) * 0.5;
  nc_pane = vec2(0.34, 0.84);
} else if (nc_style > 1.5 && nc_style < 2.5) {
  // punched windows between pilasters
  nc_win = nc_band(nc_f.x, 0.24, 0.76, nc_fwv.x) * nc_band(nc_f.y, 0.3, 0.84, nc_fw);
  nc_frame = nc_band(nc_f.y, 0.24, 0.3, nc_fw) * nc_band(nc_f.x, 0.2, 0.8, nc_fwv.x);
  nc_pane = vec2(0.3, 0.84);
} else if (nc_style > 2.5 && nc_style < 3.5) {
  // curtain wall with spandrels
  nc_win = (1.0 - nc_band(nc_f.x, -0.03, 0.03, nc_fwv.x)) * nc_band(nc_f.y, 0.12, 0.93, nc_fw);
  nc_pane = vec2(0.12, 0.93);
} else if (nc_style > 3.5) {
  // shopfronts: two 38 unit columns make a unit, open and lit or behind a roller shutter
  float nc_ux = fract(vFuv.x * 0.5);
  float nc_unit = floor(vFuv.x * 0.5);
  float nc_uh = nc_hash(vec2(nc_unit * 0.37 + 1.3, nc_seed * 0.71));
  float nc_open = step(nc_uh, mix(0.92, 0.6, uNight));
  float nc_ground = step(vFuv.y, 1.0);
  float nc_glaze = nc_band(nc_f.x, 0.04, 0.96, nc_fwv.x) * nc_band(nc_f.y, 0.06, 0.74, nc_fw) * nc_ground;
  nc_frame = nc_band(nc_f.y, 0.74, 0.8, nc_fw) * nc_ground;
  nc_pane = vec2(0.06, 0.74);
  // a glazed door in the first column of each unit
  float nc_dx = step(nc_ux, 0.5);
  float nc_dglass = nc_dx * nc_band(nc_f.x, 0.335, 0.665, nc_fwv.x) * nc_band(nc_f.y, 0.06, 0.625, nc_fw);
  float nc_dframe = nc_dx * nc_band(nc_f.x, 0.3, 0.7, nc_fwv.x) * nc_band(nc_f.y, 0.06, 0.66, nc_fw) - nc_dglass;
  nc_win = nc_glaze * nc_open * (1.0 - nc_dframe);
  nc_paint = vec4(0.03, 0.03, 0.035, nc_dframe * nc_glaze * nc_open);
  // inside: a lit back wall, two shelves of goods, a counter and ceiling lights
  vec3 nc_back = NC_ROOM[int(fract(nc_uh * 7.31) * 5.999)];
  float nc_gh = nc_hash(floor(vFuv * vec2(9.0, 14.0)) + nc_seed);
  vec3 nc_goods = 0.5 + 0.5 * cos(6.283 * (nc_gh + vec3(0.0, 0.33, 0.67)));
  vec3 nc_in = mix(nc_back, nc_back * (0.3 + 0.9 * nc_goods), (nc_band(nc_f.y, 0.39, 0.47, nc_fw) + nc_band(nc_f.y, 0.53, 0.61, nc_fw)) * step(0.25, nc_gh) * 0.85);
  nc_in *= 1.0 - 0.65 * (nc_band(nc_f.y, 0.36, 0.39, nc_fw) + nc_band(nc_f.y, 0.5, 0.53, nc_fw));
  nc_in *= 1.0 - 0.55 * nc_band(nc_f.y, 0.1, 0.22, nc_fw);
  nc_in *= 1.0 + 0.4 * nc_band(nc_f.y, 0.66, 0.74, nc_fw);
  nc_in = mix(nc_in, nc_back * 0.85, nc_dglass);
  nc_in = mix(nc_back * 0.75, nc_in, nc_det);
  // the room falls off towards the floor and the sides of each bay
  nc_in *= (0.6 + 0.4 * smoothstep(0.0, 0.5, nc_f.y)) * (1.0 - 0.3 * (2.0 * nc_f.x - 1.0) * (2.0 * nc_f.x - 1.0));
  // kept under the bloom: a whole lit shopfront blooming would wash out the street
  nc_em = nc_win * nc_in * mix(0.12, 0.32 + 0.3 * fract(nc_uh * 3.7), uNight);
  // shut units: a ribbed roller shutter over the whole front
  float nc_shut = (1.0 - nc_open) * nc_band(nc_ux, 0.015, 0.985, nc_fwv.x * 0.5) * nc_band(vFuv.y, 0.02, 0.8, nc_fw);
  float nc_ridge = mix(0.91, 0.82 + 0.18 * abs(fract(nc_f.y * 36.0) * 2.0 - 1.0), 1.0 - smoothstep(0.2, 0.45, nc_fw * 36.0));
  nc_paint = mix(nc_paint, vec4(vec3(0.32 + 0.13 * fract(nc_uh * 17.3)) * vec3(0.97, 1.0, 1.04) * nc_ridge, 1.0), nc_shut);
  // fascia sign between the awning (23 to 24.5 up) and the cornice (from 29.4)
  float nc_sign = nc_band(vFuv.y, 0.89, 1.03, nc_fw) * nc_band(nc_ux, 0.04, 0.96, nc_fwv.x * 0.5);
  float nc_sh = nc_hash(vec2(nc_unit * 0.53 + 4.1, nc_seed * 0.37 + 0.9));
  vec3 nc_neon = NC_NEON[int(fract(nc_sh * 7.7) * 5.999)];
  // the same brightness for every colour, so pink and violet bloom like lime
  vec3 nc_neonL = nc_neon / max(dot(nc_neon, vec3(0.2126, 0.7152, 0.0722)), 0.25);
  // letter cells 0.8 wide and 0.68 tall, three cells per letter and two between
  int nc_wi = min(int(fract(nc_sh * 13.3) * float(NC_WORDS)), NC_WORDS - 1);
  float nc_wlen = float(NC_LEN[nc_wi] * 5 - 2);
  vec2 nc_gp = vec2((nc_ux - 0.5) * 76.0 / 0.8 + nc_wlen * 0.5, (vFuv.y * 28.0 - 25.25) / 0.68);
  float nc_gfw = max(nc_fwv.x * 47.5, nc_fw * 41.2);
  float nc_ink = 0.0;
  if (nc_sign > 0.0 && nc_gp.x >= 0.0 && nc_gp.x < nc_wlen && nc_gp.y >= 0.0 && nc_gp.y < 5.0) {
    int nc_cx = int(nc_gp.x);
    int nc_li = nc_cx / 5;
    int nc_lc = nc_cx - nc_li * 5;
    if (nc_lc < 3) {
      int nc_g = NC_GLYPH[NC_TEXT[nc_wi * 6 + nc_li]];
      nc_ink = float((nc_g >> ((4 - int(nc_gp.y)) * 3 + nc_lc)) & 1);
    }
  }
  // far away the letters blur into an even tint over the word
  nc_ink = mix(nc_ink, 0.45 * nc_band(nc_gp.x, 0.0, nc_wlen, nc_fwv.x * 47.5) * nc_band(nc_gp.y, 0.0, 5.0, nc_fw * 41.2), smoothstep(0.4, 0.9, nc_gfw));
  // lit letters on a dark board, a light box with dark letters, or a painted board
  float nc_slit = step(nc_sh, 0.55);
  float nc_sbox = step(0.55, nc_sh) * step(nc_sh, 0.8);
  float nc_sboard = step(0.8, nc_sh);
  vec3 nc_salb = nc_slit * mix(vec3(0.035), nc_neon * 0.35, nc_ink) + nc_sbox * mix(vec3(0.7, 0.68, 0.62), nc_neon * 0.06, nc_ink) + nc_sboard * mix(nc_back * 0.1, vec3(0.75, 0.66, 0.48), nc_ink);
  nc_paint = mix(nc_paint, vec4(nc_salb, 1.0), nc_sign);
  // painted boards get a small lamp over them at night
  nc_em += nc_sign * (nc_slit * nc_ink * nc_neonL * mix(0.25, 1.15, uNight) + nc_sbox * (1.0 - nc_ink) * vec3(1.0, 0.93, 0.8) * mix(0.1, 0.55, uNight) + nc_sboard * nc_salb * 0.3 * uNight);
}
float nc_shop = step(3.5, nc_style);
float nc_curtain = step(2.5, nc_style) * (1.0 - nc_shop);
float nc_h = nc_hash(nc_id + vec2(nc_seed * 1.37, nc_seed * 0.71));
float nc_h2 = nc_hash(nc_id.yx * 1.13 + vec2(nc_seed * 0.53, 7.1));
float nc_h3 = nc_hash(nc_id * 0.71 + vec2(nc_seed * 0.29, 3.7));
// towers light whole office floors and fewer single panes
float nc_ratio = vFacade.z * mix(1.0, 0.4, nc_curtain);
float nc_floor = nc_curtain * step(nc_hash(vec2(nc_id.y * 0.37, nc_seed * 0.13 + 1.7)), 0.25);
float nc_lit = max(step(nc_h, nc_ratio), nc_floor);
// 0 to 1 over the lit panes, so the brightest of them reach the bloom
float nc_hl = mix(nc_h / max(nc_ratio, 0.05), 0.15 + 0.6 * nc_hash(vec2(nc_id.y, nc_seed)), nc_floor);
// pane space: 0 at the sill, 1 at the head
float nc_py = clamp((nc_f.y - nc_pane.x) / (nc_pane.y - nc_pane.x), 0.0, 1.0);
float nc_pyw = nc_fw / (nc_pane.y - nc_pane.x);
// blinds on about half the panes, pulled down to a different height on each
float nc_bedge = mix(0.3, 0.8, fract(nc_h3 * 7.3));
float nc_blind = step(nc_h3, 0.5) * (1.0 - nc_shop) * (1.0 - nc_floor) * mix(1.0 - nc_bedge, nc_band(nc_py, nc_bedge, 2.0, nc_pyw), nc_det);
// glass tint per building: blue grey, bronze or green grey
float nc_bt = nc_hash(vec2(nc_seed * 0.61, 5.3));
vec3 nc_tint = nc_bt < 0.45 ? vec3(0.86, 1.0, 1.14) : (nc_bt < 0.72 ? vec3(1.3, 1.0, 0.7) : vec3(0.88, 1.1, 0.96));
vec3 nc_glass = mix(vec3(0.035, 0.05, 0.065), vec3(0.09, 0.13, 0.16), nc_h2 * (1.0 - uNight)) * mix(vec3(1.0), nc_tint, 1.0 - nc_shop);
// the room reads darker at the bottom of each pane, blinds paler (but not at night)
nc_glass *= 1.0 - 0.25 * mix(0.33, nc_band(nc_py, -1.0, 0.33, nc_pyw), nc_det) * (1.0 - nc_shop);
nc_glass = mix(nc_glass, vec3(0.3, 0.28, 0.25) * (0.7 + 0.3 * nc_h2) * (1.0 - 0.75 * uNight), nc_blind);
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.72, nc_frame);
diffuseColor.rgb = mix(diffuseColor.rgb, nc_glass, nc_win);
diffuseColor.rgb = mix(diffuseColor.rgb, nc_paint.rgb, nc_paint.a);
// at night the walls fall off into the dark above the street lights
float nc_street = exp(-max(vNcY - 8.0, 0.0) / 90.0);
diffuseColor.rgb *= mix(vec3(1.0), mix(vec3(0.3), vec3(1.08, 0.98, 0.86), nc_street), uNight * (1.0 - nc_win));
diffuseColor.rgb *= 1.0 - 0.28 * uWet * (1.0 - nc_win);
`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, mix(mix(0.08, 0.3, nc_h2), 0.4, nc_shop), nc_win);
roughnessFactor = mix(roughnessFactor, 0.5, nc_paint.a);
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.55, uWet);
`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
vec3 nc_warm = mix(vec3(1.0, 0.62, 0.3), vec3(1.0, 0.82, 0.55), nc_h2);
vec3 nc_cool = vec3(0.7, 0.82, 1.0);
vec3 nc_col = mix(mix(nc_warm, nc_cool, step(0.82, nc_h2)), vec3(0.85, 0.92, 1.0), nc_floor);
// a glow under the ceiling, dark furniture along the sill, blinds lit from behind
float nc_room = mix(0.7, mix(0.55, 1.0, smoothstep(0.3, 0.95, nc_py)) * (1.0 - 0.55 * nc_band(nc_py, -1.0, 0.15, nc_pyw)), nc_det);
nc_room *= 1.0 - 0.6 * nc_blind;
nc_col *= mix(vec3(1.0), vec3(1.0, 0.88, 0.7), nc_blind);
// the odd room lit only by a television
float nc_tv = step(0.965, nc_h2) * (1.0 - nc_floor) * (1.0 - nc_shop);
nc_col = mix(nc_col, vec3(0.42, 0.6, 1.0) * (0.55 + 0.3 * sin(uTime * 9.0 + nc_h * 60.0) + 0.15 * sin(uTime * 23.0 + nc_h * 31.0)), nc_tv);
totalEmissiveRadiance += nc_win * nc_lit * nc_col * uNight * nc_room * (0.55 + 0.95 * nc_hl) * (1.0 - nc_shop) + nc_em;
// about a fifth of buildings hide coloured uplights on the shop cornice (32 up)
float nc_ws = nc_hash(vec2(nc_seed * 0.37, 11.3));
vec3 nc_wcol = nc_ws < 0.08 ? vec3(1.0, 0.35, 0.65) : (nc_ws < 0.16 ? vec3(0.25, 0.85, 0.8) : (nc_ws < 0.22 ? vec3(0.6, 0.4, 1.0) : vec3(0.0)));
float nc_wy = vNcY - 32.0;
// one fitting per column edge, each cone widening as it climbs until they merge
float nc_cone = 1.0 - smoothstep(0.4, 1.0, min(nc_f.x, 1.0 - nc_f.x) * 22.0 / (2.0 + 0.3 * max(nc_wy, 0.0)));
// fades over about two storeys and stops by the fifth, so towers keep dark tops
float nc_wash = 0.45 * exp(-max(nc_wy, 0.0) / 45.0) * (1.0 - smoothstep(70.0, 130.0, nc_wy)) * step(0.0, nc_wy);
totalEmissiveRadiance += nc_wcol * uNight * nc_wash * step(0.5, vFacade.x) * (1.0 - nc_win) * mix(0.2, 1.0, nc_cone);
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

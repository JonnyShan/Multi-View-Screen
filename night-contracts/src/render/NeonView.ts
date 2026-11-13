/**
 * Neon signs: a few flat ones on facades and about a hundred blades standing
 * out from the walls over the shopfronts. Every letter comes from one glyph
 * atlas drawn once at runtime with the bundled font (red holds the coloured
 * tube and its glow, green the white-hot core), so all the lettering is one
 * mesh tinted per vertex. The dark boards are a second mesh, and the light the
 * blades pool on the pavement and the wall behind them a third (instanced and
 * culled like the lamps): three draw calls however many signs there are.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import { hash01 } from '../core/RNG';
import type { City } from '../world/CityGenerator';
import { GeoBuilder } from './GeoBuilder';
import { InstanceCuller } from './InstanceCuller';
import { radialTexture } from './LampsView';
import { globalUniforms, srgb } from './Shared';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&';
/** Atlas cell size in pixels and cells per row; the cell after the glyphs holds a straight tube for blade borders. */
const CELL = 128;
const COLS = 8;
const TUBE = GLYPHS.length;
const FONT = '600 88px "Teko", "Chakra Petch", sans-serif';
/** Stacked letters sit this many cap heights apart; flat words add this much between letters. */
const STACK = 1.3;
const TRACK = 0.14;
/** Board thickness of a blade, and how far the lettering stands off a board. */
const BLADE_T = 2.4;
const FACE_OFF = 0.3;
const BORDERS = [0xfff1d6, 0xff4fa8, 0x3ee0cf, 0xffa53d];

interface GlyphMetrics {
  /** Cap height in pixels. */
  cap: number;
  /** Advance of each glyph in cap heights. */
  advance: Map<string, number>;
}

/** Paints the glyph atlas and returns the metrics the layout needs. */
function paintAtlas(c: HTMLCanvasElement): GlyphMetrics {
  const ctx = c.getContext('2d')!;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cap = ctx.measureText('H').actualBoundingBoxAscent || 52;
  const advance = new Map<string, number>();
  // red: the coloured tube and its glow; green: the hot core, added on top
  const passes: [number, string, number, GlobalCompositeOperation][] = [
    [16, '#f00', 7, 'source-over'],
    [5, '#f00', 4.5, 'source-over'],
    [0, '#0f0', 1.8, 'lighter'],
  ];
  const cell = (i: number, stroke: (cx: number, cy: number) => void): void => {
    const x0 = (i % COLS) * CELL;
    const y0 = Math.floor(i / COLS) * CELL;
    for (const [blur, style, width, op] of passes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0 + 1, y0 + 1, CELL - 2, CELL - 2);
      ctx.clip();
      ctx.globalCompositeOperation = op;
      ctx.shadowColor = style;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      stroke(x0 + CELL / 2, y0 + CELL / 2);
      ctx.restore();
    }
  };
  [...GLYPHS].forEach((ch, i) => {
    advance.set(ch, ctx.measureText(ch).width / cap);
    cell(i, (cx, cy) => ctx.strokeText(ch, cx, cy + cap / 2));
  });
  cell(TUBE, (cx, cy) => {
    ctx.beginPath();
    ctx.moveTo(cx - CELL, cy);
    ctx.lineTo(cx + CELL, cy);
    ctx.stroke();
  });
  return { cap, advance };
}

/** Lettering vertices: position, atlas uv, colour, and (sign index, letter state). */
class LetterBuilder {
  private readonly pos: number[] = [];
  private readonly uv: number[] = [];
  private readonly col: number[] = [];
  private readonly sign: number[] = [];
  private readonly idx: number[] = [];

  /** Atlas cell `cell` on a quad centred on `c`, spanning ±`a` (texture u) and ±`b` (texture v); a x b faces the reader. */
  quad(c: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, cell: number, color: THREE.Color, sign: number, state: number): void {
    const base = this.pos.length / 3;
    const size = COLS * CELL;
    const x = (cell % COLS) * CELL;
    const y = Math.floor(cell / COLS) * CELL;
    const u0 = (x + 0.5) / size;
    const u1 = (x + CELL - 0.5) / size;
    const v0 = 1 - (y + CELL - 0.5) / size;
    const v1 = 1 - (y + 0.5) / size;
    const corners: [number, number, number, number][] = [
      [-1, -1, u0, v0],
      [1, -1, u1, v0],
      [1, 1, u1, v1],
      [-1, 1, u0, v1],
    ];
    for (const [sa, sb, u, v] of corners) {
      this.pos.push(c.x + a.x * sa + b.x * sb, c.y + a.y * sa + b.y * sb, c.z + a.z * sa + b.z * sb);
      this.uv.push(u, v);
      this.col.push(color.r, color.g, color.b);
      this.sign.push(sign, state);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aSign', new THREE.Float32BufferAttribute(this.sign, 2));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    return g;
  }
}

export class NeonView {
  readonly group = new THREE.Group();
  readonly culler: InstanceCuller;
  private readonly on = { value: 1 };
  /** The sign that is sputtering (index) and how bright it is right now. */
  private readonly flicker = { value: new THREE.Vector2(-1, 1) };
  private readonly poolOpacity = { value: 1 };
  private readonly count: number;
  private flickerIdx = -1;
  private flickerT = 0;

  constructor(city: City, t: Tuning) {
    this.group.name = 'neon';
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = COLS * CELL;
    const metrics = paintAtlas(canvas);
    const atlas = new THREE.CanvasTexture(canvas);
    atlas.colorSpace = THREE.SRGBColorSpace;
    atlas.anisotropy = 4;
    // main.ts waits for the font; should it ever arrive late, repaint with the right shapes
    if (document.fonts && !document.fonts.check(FONT)) {
      void document.fonts.load(FONT).then(() => {
        paintAtlas(canvas);
        atlas.needsUpdate = true;
      });
    }

    const letters = new LetterBuilder();
    const boards = new GeoBuilder();
    const pools: { m: THREE.Matrix4; color: THREE.Color }[] = [];
    const c = new THREE.Vector3();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const xAxis = new THREE.Vector3(1, 0, 0);
    const face = new THREE.Vector3();
    const right = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    /** Glyph quad size in cap heights. */
    const glyphQuad = CELL / metrics.cap;
    const wallGap = t.world.blades.wallGap;

    city.neon.forEach((n, i) => {
      const text = [...n.text].filter((ch) => metrics.advance.has(ch));
      if (!text.length) return;
      const color = srgb(n.color);
      const nx = Math.cos(n.a);
      const ny = Math.sin(n.a);
      // a few blades have one letter buzzing or burnt out
      const bad = n.blade && hash01(i, 11) < 0.14 ? Math.floor(hash01(i, 12) * text.length) : -1;
      const badState = hash01(i, 13) < 0.5 ? 1 : 2;
      // fit the word in the board with a margin (more at the ends of a blade, clear of its border)
      const pad = 0.2 * Math.min(n.w, n.h);
      const padEnd = n.blade ? pad + 2.5 : pad;
      const widest = Math.max(...text.map((ch) => metrics.advance.get(ch)!));
      const run = text.reduce((sum, ch) => sum + metrics.advance.get(ch)!, 0) + TRACK * (text.length - 1);
      const cap = n.vertical ? Math.min((n.h - 2 * padEnd) / (text.length * STACK - (STACK - 1)), (n.w - 2 * pad) / widest) : Math.min(n.h - 2 * pad, (n.w - 2 * pad) / run);
      const half = (glyphQuad * cap) / 2;

      /** Letters (and a blade's border) on one face, given its centre and outward normal. */
      const letter = (centre: THREE.Vector3, normal: THREE.Vector3, border: number): void => {
        // the reader's right, so that right x up faces them
        right.set(normal.z, 0, -normal.x);
        let x = -run / 2;
        text.forEach((ch, k) => {
          const adv = metrics.advance.get(ch)!;
          const along = n.vertical ? 0 : (x + adv / 2) * cap;
          const lift = n.vertical ? ((text.length - 1) / 2 - k) * STACK * cap : 0;
          x += adv + TRACK;
          c.copy(centre).addScaledVector(right, along).addScaledVector(up, lift);
          letters.quad(c, a.copy(right).multiplyScalar(half), b.copy(up).multiplyScalar(half), GLYPHS.indexOf(ch), color, i, k === bad ? badState : 0);
        });
        if (border < 0) return;
        // a straight tube round the edge, inset a little
        const bc = srgb(BORDERS[border]);
        const tube = 4.5;
        const hw = n.w / 2 - 1.4;
        const hh = n.h / 2 - 1.4;
        for (const sy of [-1, 1]) {
          c.copy(centre).addScaledVector(up, sy * hh);
          letters.quad(c, a.copy(right).multiplyScalar(hw), b.copy(up).multiplyScalar(tube), TUBE, bc, i, 0);
        }
        for (const sx of [-1, 1]) {
          c.copy(centre).addScaledVector(right, sx * hw);
          letters.quad(c, a.copy(up).multiplyScalar(hh), b.copy(right).multiplyScalar(-tube), TUBE, bc, i, 0);
        }
      };

      // dark painted board, with a hint of the sign's colour by day
      const paint = srgb(0x15161a).lerp(color, 0.1);
      if (!n.blade) {
        face.set(nx, 0, ny);
        letter(new THREE.Vector3(n.x + nx * 1.8, n.z, n.y + ny * 1.8), face, -1);
        // backing board: a thin box a little bigger than the sign
        const bw = n.w / 2 + 3;
        const bh = n.h / 2 + 3;
        const px = -ny;
        const py = nx;
        const cx = n.x + nx * 0.5;
        const cy = n.y + ny * 0.5;
        const x0 = Math.min(cx - px * bw, cx + px * bw) - Math.abs(nx) * 1;
        const x1 = Math.max(cx - px * bw, cx + px * bw) + Math.abs(nx) * 1;
        const y0 = Math.min(cy - py * bw, cy + py * bw) - Math.abs(ny) * 1;
        const y1 = Math.max(cy - py * bw, cy + py * bw) + Math.abs(ny) * 1;
        boards.box(x0, n.z - bh, y0, x1, n.z + bh, y1, paint, null, 0b111111);
        return;
      }

      // blade: lettered on both faces, which look up and down the street
      const border = hash01(i, 14) < 0.55 ? Math.floor(hash01(i, 15) * BORDERS.length) : -1;
      for (const side of [-1, 1]) {
        face.set(-ny * side, 0, nx * side);
        letter(new THREE.Vector3(n.x, n.z, n.y).addScaledVector(face, BLADE_T / 2 + FACE_OFF), face, border);
      }
      const hx = (Math.abs(nx) * n.w + Math.abs(ny) * BLADE_T) / 2;
      const hy = (Math.abs(ny) * n.w + Math.abs(nx) * BLADE_T) / 2;
      boards.box(n.x - hx, n.z - n.h / 2, n.y - hy, n.x + hx, n.z + n.h / 2, n.y + hy, paint, null, 0b111111);
      // two brackets back to the wall
      const reach = wallGap + 0.5;
      const bx = n.x - nx * (n.w / 2 + reach / 2);
      const by = n.y - ny * (n.w / 2 + reach / 2);
      const kx = Math.abs(nx) * (reach / 2) + Math.abs(ny) * 0.5;
      const ky = Math.abs(ny) * (reach / 2) + Math.abs(nx) * 0.5;
      for (const z of [n.z + n.h / 2 - 4, n.z - n.h / 2 + 4]) boards.box(bx - kx, z - 0.6, by - ky, bx + kx, z + 0.6, by + ky, 0x2a2b30, null, 0b111111);

      // coloured light pooled on the pavement below, and washed on the wall behind
      const gx = n.x + nx * 7;
      const gy = n.y + ny * 7;
      q.setFromAxisAngle(xAxis, -Math.PI / 2);
      s.set(Math.abs(nx) * 44 + Math.abs(ny) * 70, Math.abs(ny) * 44 + Math.abs(nx) * 70, 1);
      pools.push({ m: new THREE.Matrix4().compose(c.set(gx, city.heightAt(gx, gy) + 1.4, gy), q, s), color: color.clone().multiplyScalar(0.45) });
      const wx = n.x - nx * (n.w / 2 + wallGap - 0.6);
      const wy = n.y - ny * (n.w / 2 + wallGap - 0.6);
      q.setFromAxisAngle(up, Math.PI / 2 - n.a);
      pools.push({ m: new THREE.Matrix4().compose(c.set(wx, n.z, wy), q, s.set(40, n.h + 34, 1)), color: color.clone().multiplyScalar(0.26) });
    });
    this.count = city.neon.length;

    const signMat = new THREE.ShaderMaterial({
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uMap: { value: atlas }, uOn: this.on, uFlicker: this.flicker, uTime: globalUniforms.uTime },
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute vec2 aSign;
        uniform float uOn;
        uniform vec2 uFlicker;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vK;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vUv = uv;
          vColor = aColor;
          float k = abs(aSign.x - uFlicker.x) < 0.5 ? uFlicker.y : 1.0;
          // a buzzing letter drops out in short random beats; a burnt-out one barely glows
          float beat = fract(sin(floor(uTime * 9.0) + aSign.x * 7.13) * 43758.5453);
          k *= aSign.y > 1.5 ? 0.05 : aSign.y > 0.5 && beat < 0.3 ? 0.1 : 1.0;
          vK = uOn * k;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vK;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          vec2 t = texture2D(uMap, vUv).rg;
          vec3 c = (vColor * t.r + vec3(0.75, 0.7, 0.64) * t.g) * vK;
          #ifdef USE_FOG
            // additive, so fade out into the fog rather than towards its colour
            #ifdef FOG_EXP2
              c *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
            #else
              c *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
            #endif
          #endif
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const signs = new THREE.Mesh(letters.build(), signMat);
    signs.name = 'neon-signs';
    const back = new THREE.Mesh(boards.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }));
    back.name = 'neon-boards';
    this.group.add(back, signs);

    const poolMat = new THREE.MeshBasicMaterial({
      map: radialTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    poolMat.onBeforeCompile = (sh) => {
      sh.uniforms.uOpacity = this.poolOpacity;
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uOpacity;').replace('#include <opaque_fragment>', 'outgoingLight *= uOpacity;\n#include <opaque_fragment>');
    };
    const glow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), poolMat, Math.max(1, pools.length));
    pools.forEach((p, k) => {
      glow.setMatrixAt(k, p.m);
      glow.setColorAt(k, p.color);
    });
    glow.count = pools.length;
    glow.name = 'neon-light';
    this.group.add(glow);
    this.culler = new InstanceCuller(
      pools.map((p) => ({ x: p.m.elements[12], z: p.m.elements[14] })),
      60,
    );
    if (pools.length) this.culler.add(glow);
  }

  update(dt: number, night: number, time: number, wet: number): void {
    const on = 0.35 + 0.65 * THREE.MathUtils.smoothstep(night, 0.1, 0.6);
    this.on.value = on * 1.8;
    this.poolOpacity.value = THREE.MathUtils.smoothstep(night, 0.25, 0.7) * (0.9 + wet * 0.3);
    // now and then one sign sputters for half a second
    this.flickerT -= dt;
    if (this.flickerT <= 0) {
      this.flickerIdx = this.count ? Math.floor(hash01(Math.floor(time * 1000), 5) * this.count) : -1;
      this.flickerT = 2 + ((time * 7.3) % 5);
    }
    const sputter = this.flickerT > 1.5 && Math.sin(time * 60) <= 0.2;
    this.flicker.value.set(this.flickerIdx, sputter ? 0.15 : 1);
  }
}

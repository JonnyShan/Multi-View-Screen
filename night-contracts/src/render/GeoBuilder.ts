/**
 * Accumulates triangles into one BufferGeometry (three space, y up) so whole
 * city chunks render in a single draw call.
 */
import * as THREE from 'three';

const tmpColor = new THREE.Color();

export interface FacadeInfo {
  style: number;
  seed: number;
  lit: number;
  /** World units per window column. */
  colWidth: number;
  storey: number;
}

export class GeoBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private fuv: number[] = [];
  private fac: number[] = [];
  private uv: number[] = [];
  private idx: number[] = [];
  private withFacade: boolean;

  constructor(opts: { facade?: boolean } = {}) {
    this.withFacade = !!opts.facade;
  }

  get vertexCount(): number {
    return this.pos.length / 3;
  }

  private vertex(x: number, y: number, z: number, nx: number, ny: number, nz: number, c: THREE.Color, fu: number, fv: number, f: FacadeInfo | null, u = 0, v = 0): void {
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.col.push(c.r, c.g, c.b);
    this.uv.push(u, v);
    if (this.withFacade) {
      this.fuv.push(fu, fv);
      this.fac.push(f ? f.style : 0, f ? f.seed : 0, f ? f.lit : 0);
    }
  }

  /**
   * Quad from four corners given counter-clockwise as seen from the front.
   * `fu`/`fv` are facade coordinates for each corner.
   */
  quad(
    p: [number, number, number][],
    n: [number, number, number],
    color: number | THREE.Color,
    facade: FacadeInfo | null = null,
    fuv: [number, number][] | null = null,
    uv: [number, number][] | null = null,
  ): void {
    const c = typeof color === 'number' ? tmpColor.setHex(color, THREE.SRGBColorSpace) : color;
    const base = this.vertexCount;
    for (let i = 0; i < 4; i++) {
      const f = fuv ? fuv[i] : [0, 0];
      const t = uv ? uv[i] : [0, 0];
      this.vertex(p[i][0], p[i][1], p[i][2], n[0], n[1], n[2], c, f[0], f[1], facade, t[0], t[1]);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  /** Triangle, counter-clockwise from the front, flat normal computed. */
  tri(a: [number, number, number], b: [number, number, number], c: [number, number, number], color: number | THREE.Color): void {
    const col = typeof color === 'number' ? tmpColor.setHex(color, THREE.SRGBColorSpace) : color;
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    const base = this.vertexCount;
    this.vertex(a[0], a[1], a[2], nx, ny, nz, col, 0, 0, null);
    this.vertex(b[0], b[1], b[2], nx, ny, nz, col, 0, 0, null);
    this.vertex(c[0], c[1], c[2], nx, ny, nz, col, 0, 0, null);
    this.idx.push(base, base + 1, base + 2);
  }

  /**
   * Axis-aligned box in three space. `faces` bitmask: 1 +x, 2 -x, 4 +y (top),
   * 8 -y (bottom), 16 +z, 32 -z. Facade UVs are applied to the four walls.
   */
  box(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    color: number | THREE.Color,
    facade: FacadeInfo | null = null,
    faces = 0b111101,
    topColor?: number | THREE.Color,
  ): void {
    const fu = (d: number): number => (facade ? d / facade.colWidth : 0);
    const fv = (h: number): number => (facade ? h / facade.storey : 0);
    const off = facade ? (facade.seed % 7) * 0.37 : 0;
    // +x wall (runs along z)
    if (faces & 1)
      this.quad(
        [
          [x1, y0, z1],
          [x1, y0, z0],
          [x1, y1, z0],
          [x1, y1, z1],
        ],
        [1, 0, 0],
        color,
        facade,
        [
          [off + fu(0), fv(y0)],
          [off + fu(z1 - z0), fv(y0)],
          [off + fu(z1 - z0), fv(y1)],
          [off + fu(0), fv(y1)],
        ],
      );
    if (faces & 2)
      this.quad(
        [
          [x0, y0, z0],
          [x0, y0, z1],
          [x0, y1, z1],
          [x0, y1, z0],
        ],
        [-1, 0, 0],
        color,
        facade,
        [
          [off + fu(0), fv(y0)],
          [off + fu(z1 - z0), fv(y0)],
          [off + fu(z1 - z0), fv(y1)],
          [off + fu(0), fv(y1)],
        ],
      );
    if (faces & 16)
      this.quad(
        [
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
        [0, 0, 1],
        color,
        facade,
        [
          [off + fu(0), fv(y0)],
          [off + fu(x1 - x0), fv(y0)],
          [off + fu(x1 - x0), fv(y1)],
          [off + fu(0), fv(y1)],
        ],
      );
    if (faces & 32)
      this.quad(
        [
          [x1, y0, z0],
          [x0, y0, z0],
          [x0, y1, z0],
          [x1, y1, z0],
        ],
        [0, 0, -1],
        color,
        facade,
        [
          [off + fu(0), fv(y0)],
          [off + fu(x1 - x0), fv(y0)],
          [off + fu(x1 - x0), fv(y1)],
          [off + fu(0), fv(y1)],
        ],
      );
    const tc = topColor ?? color;
    if (faces & 4)
      this.quad(
        [
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y1, z0],
          [x0, y1, z0],
        ],
        [0, 1, 0],
        tc,
      );
    if (faces & 8)
      this.quad(
        [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y0, z1],
          [x0, y0, z1],
        ],
        [0, -1, 0],
        color,
      );
  }

  /** Upward facing quad at height y over an x/z rectangle (with tiling uv in world units). */
  flat(x0: number, z0: number, x1: number, z1: number, y: number, color: number | THREE.Color): void {
    this.quad(
      [
        [x0, y, z1],
        [x1, y, z1],
        [x1, y, z0],
        [x0, y, z0],
      ],
      [0, 1, 0],
      color,
      null,
      null,
      [
        [x0, z1],
        [x1, z1],
        [x1, z0],
        [x0, z0],
      ],
    );
  }

  /** Append another geometry transformed by a matrix, tinted a solid colour. */
  addGeometry(g: THREE.BufferGeometry, m: THREE.Matrix4, color: number | THREE.Color): void {
    const c = typeof color === 'number' ? tmpColor.setHex(color, THREE.SRGBColorSpace).clone() : color.clone();
    const geo = g.index ? g.toNonIndexed() : g;
    const p = geo.getAttribute('position');
    const n = geo.getAttribute('normal');
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    const v = new THREE.Vector3();
    const nv = new THREE.Vector3();
    const base = this.vertexCount;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m);
      nv.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
      this.vertex(v.x, v.y, v.z, nv.x, nv.y, nv.z, c, 0, 0, null);
      this.idx.push(base + i);
    }
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    if (this.withFacade) {
      g.setAttribute('aFuv', new THREE.Float32BufferAttribute(this.fuv, 2));
      g.setAttribute('aFacade', new THREE.Float32BufferAttribute(this.fac, 3));
    }
    g.setIndex(this.vertexCount > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

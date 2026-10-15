/**
 * Art deco buildings assembled from a modular kit (plinth, floor bands,
 * window bands, cornices, fins, balconies, roof kit) and merged per chunk.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import { hash01 } from '../core/RNG';
import { FACADE, type Building, type City } from '../world/CityGenerator';
import { GeoBuilder, type FacadeInfo } from './GeoBuilder';
import { createBuildingMaterial, srgb } from './Shared';

const ROOF = 0x5c5a56;
const tmp = new THREE.Color();

function shade(hex: number, k: number): THREE.Color {
  return tmp.setHex(hex, THREE.SRGBColorSpace).clone().multiplyScalar(k);
}

export class BuildingsView {
  readonly group = new THREE.Group();
  readonly material = createBuildingMaterial();
  /** Emissive neon strips along some roof lines. */
  readonly strips: THREE.Mesh;
  readonly beacons: THREE.Vector3[] = [];
  private readonly stripBuilder = new GeoBuilder();
  private readonly cyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1);
  private readonly boxGeo = new THREE.BoxGeometry(1, 1, 1);
  private readonly cone = new THREE.ConeGeometry(1, 1, 4, 1);

  constructor(
    private readonly city: City,
    private readonly t: Tuning,
    castShadow: boolean,
  ) {
    this.group.name = 'buildings';
    const chunkSize = city.pitch * 2;
    const chunks = new Map<string, GeoBuilder>();
    const chunkFor = (x: number, y: number): GeoBuilder => {
      const key = `${Math.floor(x / chunkSize)},${Math.floor(y / chunkSize)}`;
      let g = chunks.get(key);
      if (!g) {
        g = new GeoBuilder({ facade: true });
        chunks.set(key, g);
      }
      return g;
    };
    for (const b of city.buildings) {
      const g = chunkFor((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2);
      this.addBuilding(g, b);
    }
    this.addVillas(chunkFor);
    this.addMarinaAndDocks(chunkFor);

    for (const g of chunks.values()) {
      if (g.vertexCount === 0) continue;
      const mesh = new THREE.Mesh(g.build(), this.material);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    const stripMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: true });
    this.strips = new THREE.Mesh(this.stripBuilder.build(), stripMat);
    this.strips.name = 'neon-strips';
    this.group.add(this.strips);
  }

  private facade(b: Building, style: number, colWidth = 22): FacadeInfo {
    return { style, seed: b.seed, lit: b.lit, colWidth, storey: this.t.world.storeyHeight };
  }

  private addBuilding(g: GeoBuilder, b: Building): void {
    const storey = this.t.world.storeyHeight;
    const wall = srgb(b.color);
    const trim = srgb(b.trim);
    const roofC = shade(ROOF, 1);
    if (b.roof === 'pagoda') {
      this.addTemple(g, b);
      return;
    }
    b.tiers.forEach((tier, ti) => {
      const isPlinth = ti === 0;
      const f = this.facade(b, tier.facade, isPlinth ? 38 : tier.facade === FACADE.curtain ? 16 : 22);
      const colour = isPlinth ? shade(b.trim === 0x3e5a64 ? 0x3e5a64 : b.color, 0.78) : wall;
      // walls + roof slab
      g.box(tier.minX, tier.z0, tier.minY, tier.maxX, tier.z1, tier.maxY, colour, f, 0b110111, roofC);
      // cornice at the top of each tier
      const o = isPlinth ? 1.8 : 2.4;
      const ch = isPlinth ? 2.6 : 3.6;
      g.box(tier.minX - o, tier.z1 - ch, tier.minY - o, tier.maxX + o, tier.z1, tier.maxY + o, trim, null, 0b111111, shade(b.trim, 0.8));
      if (isPlinth) {
        // awning band over the shopfronts
        g.box(tier.minX - 4, tier.z1 - 9, tier.minY - 4, tier.maxX + 4, tier.z1 - 7.5, tier.maxY + 4, shade(b.trim, 0.6), null, 0b111111);
      }
      // deco fins on the corners of taller tiers
      if (!isPlinth && tier.z1 - tier.z0 > storey * 5 && tier.facade !== FACADE.curtain) {
        const fw = 5;
        const fo = 1.6;
        const corners: [number, number][] = [
          [tier.minX, tier.minY],
          [tier.maxX, tier.minY],
          [tier.minX, tier.maxY],
          [tier.maxX, tier.maxY],
        ];
        for (const [cx, cy] of corners) {
          g.box(cx - fw / 2 - fo * Math.sign(cx - (tier.minX + tier.maxX) / 2) * -0, tier.z0, cy - fw / 2, cx + fw / 2, tier.z1 + 3, cy + fw / 2, trim, null, 0b111111);
        }
        // a central vertical fin on the wider faces
        const wx = tier.maxX - tier.minX;
        const wy = tier.maxY - tier.minY;
        if (wx > 120) {
          const mx = (tier.minX + tier.maxX) / 2;
          g.box(mx - 3, tier.z0, tier.minY - fo, mx + 3, tier.z1 + 6, tier.minY, trim, null, 0b111111);
          g.box(mx - 3, tier.z0, tier.maxY, mx + 3, tier.z1 + 6, tier.maxY + fo, trim, null, 0b111111);
        }
        if (wy > 120) {
          const my = (tier.minY + tier.maxY) / 2;
          g.box(tier.minX - fo, tier.z0, my - 3, tier.minX, tier.z1 + 6, my + 3, trim, null, 0b111111);
          g.box(tier.maxX, tier.z0, my - 3, tier.maxX + fo, tier.z1 + 6, my + 3, trim, null, 0b111111);
        }
      }
    });

    const body = b.tiers[1] ?? b.tiers[0];
    // balconies on low and mid rise
    if (b.balconies && b.floors >= 3) {
      const wx = body.maxX - body.minX;
      const wy = body.maxY - body.minY;
      const alongX = wx >= wy;
      for (let f = 2; f < b.floors; f++) {
        const z = f * storey + 4;
        if (alongX) {
          for (const side of [-1, 1]) {
            const y = side < 0 ? body.minY : body.maxY;
            const y0 = side < 0 ? y - 6 : y;
            const y1 = side < 0 ? y : y + 6;
            g.box(body.minX + 10, z, y0, body.maxX - 10, z + 1.4, y1, trim, null, 0b111111);
            const ry0 = side < 0 ? y0 : y1 - 0.8;
            g.box(body.minX + 10, z + 1.4, ry0, body.maxX - 10, z + 5, ry0 + 0.8, shade(b.trim, 0.85), null, 0b110011);
          }
        } else {
          for (const side of [-1, 1]) {
            const x = side < 0 ? body.minX : body.maxX;
            const x0 = side < 0 ? x - 6 : x;
            const x1 = side < 0 ? x : x + 6;
            g.box(x0, z, body.minY + 10, x1, z + 1.4, body.maxY - 10, trim, null, 0b111111);
            const rx0 = side < 0 ? x0 : x1 - 0.8;
            g.box(rx0, z + 1.4, body.minY + 10, rx0 + 0.8, z + 5, body.maxY - 10, shade(b.trim, 0.85), null, 0b001111);
          }
        }
      }
    }

    // roof kit on the top tier
    const top = b.tiers[b.tiers.length - 1];
    const rx = (top.minX + top.maxX) / 2;
    const ry = (top.minY + top.maxY) / 2;
    const rw = top.maxX - top.minX;
    const rd = top.maxY - top.minY;
    const z = top.z1;
    const h = (k: number): number => hash01(b.seed, k);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const place = (geo: THREE.BufferGeometry, x: number, y: number, zz: number, sx: number, sy: number, sz: number, color: number | THREE.Color): void => {
      p.set(x, zz, y);
      s.set(sx, sz, sy);
      m.compose(p, q.identity(), s);
      g.addGeometry(geo, m, color);
    };
    // AC units
    const acN = 1 + Math.floor(h(1) * 4);
    for (let k = 0; k < acN; k++) {
      const ax = rx + (h(10 + k) - 0.5) * rw * 0.6;
      const ay = ry + (h(20 + k) - 0.5) * rd * 0.6;
      place(this.boxGeo, ax, ay, z + 3, 12, 8, 6, 0x9a9a96);
    }
    if (b.roof === 'tank') {
      const tx = rx + (h(3) - 0.5) * rw * 0.4;
      const ty = ry + (h(4) - 0.5) * rd * 0.4;
      for (const [lx, ly] of [
        [-4, -4],
        [4, -4],
        [-4, 4],
        [4, 4],
      ])
        place(this.boxGeo, tx + lx, ty + ly, z + 5, 1.2, 1.2, 10, 0x4a3a2c);
      place(this.cyl, tx, ty, z + 17, 8, 8, 14, 0x7a5a3e);
      place(this.cone, tx, ty, z + 26, 8.5, 8.5, 4, 0x4a3a2c);
    } else if (b.roof === 'antenna') {
      const mastH = 60 + h(5) * 90;
      place(this.boxGeo, rx, ry, z + mastH / 2, 2.4, 2.4, mastH, 0x8a8a8a);
      place(this.boxGeo, rx, ry, z + mastH * 0.4, 10, 10, 1, 0x8a8a8a);
      this.beacons.push(new THREE.Vector3(rx, z + mastH + 1, ry));
    } else if (b.roof === 'deco') {
      // stepped art deco crown with a spire
      const cw = Math.min(rw, rd) * 0.5;
      place(this.boxGeo, rx, ry, z + 8, cw, cw, 16, wall);
      place(this.boxGeo, rx, ry, z + 16 + 1.5, cw + 3, cw + 3, 3, trim);
      place(this.boxGeo, rx, ry, z + 26, cw * 0.55, cw * 0.55, 16, wall);
      place(this.cone, rx, ry, z + 34 + 20, 4, 4, 40, trim);
      this.beacons.push(new THREE.Vector3(rx, z + 74, ry));
    }

    // neon strip on some roof lines
    if (b.floors >= 8 && h(7) < 0.28) {
      const colours = [0xffa53d, 0xfff1d6, 0x3ee0cf, 0xff3b30];
      const c = shade(colours[Math.floor(h(8) * colours.length)], 2.2);
      const y0 = top.z1 - 5.2;
      const y1 = top.z1 - 4.2;
      const o = 2.6;
      this.stripBuilder.box(top.minX - o, y0, top.minY - o, top.maxX + o, y1, top.maxY + o, c, null, 0b110011);
    }
  }

  private addTemple(g: GeoBuilder, b: Building): void {
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const stone = srgb(0xb8ad98);
    const red = srgb(0x8e2a22);
    const tile = srgb(0x23282c);
    const gold = shade(0xd9a441, 1.1);
    const half = (b.maxX - b.minX) / 2;
    // stone platform with steps
    g.box(cx - half - 12, 0, cy - half - 12, cx + half + 12, 8, cy + half + 12, stone, null, 0b111111);
    let z = 8;
    let hw = half - 10;
    for (let k = 0; k < 3; k++) {
      const wallH = k === 0 ? 34 : 22;
      g.box(cx - hw, z, cy - hw, cx + hw, z + wallH, cy + hw, red, null, 0b110111);
      // columns
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) g.box(cx + sx * hw - 3, z, cy + sy * hw - 3, cx + sx * hw + 3, z + wallH, cy + sy * hw + 3, shade(0x5a1a16, 1), null, 0b111111);
      z += wallH;
      // sweeping roof: truncated pyramid with overhang
      const over = hw + 26 - k * 4;
      const topHw = hw * 0.55;
      const rh = 18;
      const p = (x: number, y: number, zz: number): [number, number, number] => [cx + x, zz, cy + y];
      // four sloped faces (CCW from outside)
      g.quad([p(-over, over, z), p(over, over, z), p(topHw, topHw, z + rh), p(-topHw, topHw, z + rh)], [0, 0.7, 0.7], tile);
      g.quad([p(over, -over, z), p(-over, -over, z), p(-topHw, -topHw, z + rh), p(topHw, -topHw, z + rh)], [0, 0.7, -0.7], tile);
      g.quad([p(over, over, z), p(over, -over, z), p(topHw, -topHw, z + rh), p(topHw, topHw, z + rh)], [0.7, 0.7, 0], tile);
      g.quad([p(-over, -over, z), p(-over, over, z), p(-topHw, topHw, z + rh), p(-topHw, -topHw, z + rh)], [-0.7, 0.7, 0], tile);
      // underside so the eaves are not see-through
      g.quad([p(-over, -over, z), p(over, -over, z), p(over, over, z), p(-over, over, z)], [0, -1, 0], shade(0x3a1210, 1));
      // gold trim along the eaves
      g.box(cx - over, z - 1.5, cy - over - 1, cx + over, z, cy - over + 1, gold, null, 0b111111);
      g.box(cx - over, z - 1.5, cy + over - 1, cx + over, z, cy + over + 1, gold, null, 0b111111);
      g.box(cx - over - 1, z - 1.5, cy - over, cx - over + 1, z, cy + over, gold, null, 0b111111);
      g.box(cx + over - 1, z - 1.5, cy - over, cx + over + 1, z, cy + over, gold, null, 0b111111);
      z += rh;
      g.box(cx - topHw, z - 1, cy - topHw, cx + topHw, z, cy + topHw, tile, null, 0b000100);
      hw = hw * 0.62;
    }
    // finial
    g.box(cx - 2, z, cy - 2, cx + 2, z + 30, cy + 2, gold, null, 0b110111);
    // lanterns glow at the entrance (neon strip builder, emissive)
    const lantern = shade(0xff7a3a, 2.4);
    for (const sx of [-1, 1]) this.stripBuilder.box(cx + sx * 40 - 3, 14, cy - half - 16, cx + sx * 40 + 3, 22, cy - half - 10, lantern, null, 0b111111);
  }

  private addVillas(chunkFor: (x: number, y: number) => GeoBuilder): void {
    for (const v of this.city.villas) {
      const g = chunkFor(v.x, v.y);
      const f: FacadeInfo = { style: FACADE.punched, seed: Math.abs(Math.floor(v.x * 7 + v.y)) % 251, lit: 0.55, colWidth: 20, storey: this.t.world.storeyHeight };
      const x0 = v.x - v.w / 2;
      const x1 = v.x + v.w / 2;
      const y0 = v.y - v.d / 2;
      const y1 = v.y + v.d / 2;
      g.box(x0, v.z - 20, y0, x1, v.z + v.h, y1, srgb(v.color), f, 0b110111, srgb(0x8a8680));
      g.box(x0 - 6, v.z + v.h, y0 - 6, x1 + 6, v.z + v.h + 3, y1 + 6, srgb(0xf4f1ea), null, 0b111111);
      // terrace
      g.box(x0 - 20, v.z - 20, y0 - 24, x1 + 4, v.z + 1, y0, srgb(0xd8cfbe), null, 0b111111);
    }
  }

  private addMarinaAndDocks(chunkFor: (x: number, y: number) => GeoBuilder): void {
    const c = this.city;
    const deck = srgb(0x6b5a46);
    for (const p of c.piers) {
      const g = chunkFor((p.minX + p.maxX) / 2, p.maxY);
      g.box(p.minX, 0.5, p.minY, p.maxX, 3, p.maxY, deck, null, 0b111111);
      for (let y = p.minY + 10; y < p.maxY; y += 40) {
        g.box(p.minX - 1, -8, y - 1, p.minX + 1, 3, y + 1, deck, null, 0b110011);
        g.box(p.maxX - 1, -8, y - 1, p.maxX + 1, 3, y + 1, deck, null, 0b110011);
      }
    }
    const m = new THREE.Matrix4();
    for (const b of c.boats) {
      const g = chunkFor(b.x, b.y);
      const hull = new THREE.BoxGeometry(b.l * 0.28, 5, b.l);
      m.makeRotationY(Math.PI / 2 - b.a).setPosition(b.x, 1.5, b.y);
      g.addGeometry(hull, m, b.color);
      const cab = new THREE.BoxGeometry(b.l * 0.2, 6, b.l * 0.35);
      m.makeRotationY(Math.PI / 2 - b.a).setPosition(b.x, 7, b.y);
      g.addGeometry(cab, m, 0xe8e4da);
      const mast = new THREE.BoxGeometry(0.8, 40, 0.8);
      m.makeRotationY(0).setPosition(b.x, 24, b.y);
      g.addGeometry(mast, m, 0xd0d0d0);
    }
    // gantry cranes over the docks
    for (const cr of c.cranes) {
      const g = chunkFor(cr.x, cr.y);
      const col = srgb(0xc7862f);
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) g.box(cr.x + sx * 30 - 3, 0, cr.y + sy * 24 - 3, cr.x + sx * 30 + 3, cr.h * 0.7, cr.y + sy * 24 + 3, col, null, 0b111111);
      }
      g.box(cr.x - 36, cr.h * 0.7, cr.y - 30, cr.x + 36, cr.h * 0.7 + 10, cr.y + 30, col, null, 0b111111);
      g.box(cr.x - 5, cr.h * 0.7 + 10, cr.y - 200, cr.x + 5, cr.h * 0.7 + 18, cr.y + 120, col, null, 0b111111);
      this.beacons.push(new THREE.Vector3(cr.x, cr.h * 0.7 + 20, cr.y - 198));
    }
  }
}

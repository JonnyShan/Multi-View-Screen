/**
 * Seeded city generator. Produces pure data: blocks, buildings, colliders,
 * lamps, palms, props, neon, places and the coastal kit. The same seed always
 * produces the same city.
 *
 * Layout (sim plane, y is "north" on the map):
 *   - 8 x 8 grid of blocks between road centrelines at multiples of the pitch.
 *   - A row of low lots (row -1) south of row 0, then the raised coastal
 *     boulevard one pitch south of row 0, then the beach and the ocean.
 *   - Hills with villas north of the grid, rail yard west, docks and marina east.
 */
import type { Tuning } from '../config/tuning';
import { RNG, hash01 } from '../core/RNG';
import { rayAabb, type AABB } from '../core/math';
import { RoadGraph } from './RoadGraph';

export type BlockKind =
  | 'tower'
  | 'split'
  | 'quad'
  | 'plaza'
  | 'carpark'
  | 'skyline'
  | 'casino'
  | 'temple'
  | 'market'
  | 'railyard'
  | 'safehouse'
  | 'lot';

/** Facade styles understood by the building shader. */
export const FACADE = { plain: 0, ribbon: 1, punched: 2, curtain: 3, shop: 4 } as const;

export interface Tier extends AABB {
  z0: number;
  z1: number;
  facade: number;
}

export interface Building extends AABB {
  id: number;
  height: number;
  floors: number;
  tiers: Tier[];
  color: number;
  trim: number;
  roof: 'flat' | 'tank' | 'antenna' | 'deco' | 'pagoda';
  seed: number;
  lit: number;
  balconies: boolean;
}

export interface Block extends AABB {
  bi: number;
  bj: number;
  kind: BlockKind;
  buildings: number[];
  alleys: AABB[];
}

export type ColliderKind = 'building' | 'wall' | 'barrier' | 'bollard' | 'prop' | 'container';

export interface StaticCollider extends AABB {
  kind: ColliderKind;
  /** Top height, used for line of sight and rendering helpers. */
  top: number;
  blocksSight: boolean;
}

export interface Lamp {
  x: number;
  y: number;
  z: number;
  /** Direction the arm points (sim heading angle). */
  a: number;
}

export interface Palm {
  x: number;
  y: number;
  z: number;
  h: number;
  lean: number;
  leanDir: number;
  seed: number;
}

export type PropKind = 'bench' | 'bin' | 'busstop' | 'barrier' | 'fence' | 'planter' | 'fountain' | 'boxcar' | 'container' | 'rail' | 'kiosk' | 'bollard' | 'tree';

export interface Prop {
  kind: PropKind;
  x: number;
  y: number;
  z: number;
  a: number;
  /** Generic size parameters (length, width, height) where relevant. */
  l: number;
  w: number;
  h: number;
  color: number;
}

export interface NeonSign {
  x: number;
  y: number;
  z: number;
  /** Outward normal angle of the facade it hangs on. */
  a: number;
  w: number;
  h: number;
  text: string;
  color: number;
  vertical: boolean;
}

export interface Place {
  name: string;
  node: number;
  x: number;
  y: number;
}

export interface ParkingSpot {
  x: number;
  y: number;
  a: number;
}

export interface Villa {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: number;
}

export interface Pier {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Boat {
  x: number;
  y: number;
  a: number;
  l: number;
  color: number;
}

export interface Crane {
  x: number;
  y: number;
  a: number;
  h: number;
}

/** A closed footpath loop that pedestrians walk around. */
export interface FootLoop {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  z: number;
}

export interface City {
  seed: number;
  pitch: number;
  half: number;
  size: number;
  bounds: AABB;
  graph: RoadGraph;
  blocks: Block[];
  buildings: Building[];
  colliders: StaticCollider[];
  lamps: Lamp[];
  palms: Palm[];
  props: Prop[];
  neon: NeonSign[];
  places: Place[];
  parking: ParkingSpot[];
  villas: Villa[];
  piers: Pier[];
  boats: Boat[];
  cranes: Crane[];
  footLoops: FootLoop[];
  boulevardY: number;
  boulevardZ: number;
  beachMinY: number;
  shoreY: number;
  northEdge: number;
  heightAt(x: number, y: number): number;
  index: CityIndex;
}

export const BUILDING_COLOURS = [0xefe3c8, 0xf2c4a0, 0x9fd3c7, 0xeeb8b0, 0xf3e1a0, 0xe8e4da, 0xbfe3c0, 0xa9c9e0, 0xe9a58c, 0xf5efe2];
const TRIMS = [0xf7f3ea, 0xdfd6c4, 0x6f8f8c, 0xcf9c7c, 0x3e5a64];
const NEON_COLOURS = { amber: 0xffa53d, red: 0xff3b30, teal: 0x3ee0cf, white: 0xfff1d6, green: 0x3ddc84 };

/** Uniform grid over static colliders for fast point and ray queries. */
export class CityIndex {
  private readonly cells: number[][];
  private readonly cols: number;
  private readonly rows: number;
  private stamp = 0;
  private readonly marks: Uint32Array;

  constructor(
    private readonly colliders: StaticCollider[],
    private readonly b: AABB,
    private readonly cell = 128,
  ) {
    this.cols = Math.ceil((b.maxX - b.minX) / cell) + 1;
    this.rows = Math.ceil((b.maxY - b.minY) / cell) + 1;
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);
    this.marks = new Uint32Array(colliders.length);
    colliders.forEach((c, i) => {
      const x0 = this.cx(c.minX);
      const x1 = this.cx(c.maxX);
      const y0 = this.cy(c.minY);
      const y1 = this.cy(c.maxY);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.cells[y * this.cols + x].push(i);
    });
  }

  private cx(x: number): number {
    return Math.max(0, Math.min(this.cols - 1, Math.floor((x - this.b.minX) / this.cell)));
  }

  private cy(y: number): number {
    return Math.max(0, Math.min(this.rows - 1, Math.floor((y - this.b.minY) / this.cell)));
  }

  /** First collider containing the point (with padding), or -1. */
  pointBlocked(x: number, y: number, pad = 0, sightOnly = false): number {
    for (const i of this.cells[this.cy(y) * this.cols + this.cx(x)]) {
      const c = this.colliders[i];
      if (sightOnly && !c.blocksSight) continue;
      if (x >= c.minX - pad && x <= c.maxX + pad && y >= c.minY - pad && y <= c.maxY + pad) return i;
    }
    return -1;
  }

  /** Distance to the first collider hit along a normalised ray, or -1. */
  raycast(ox: number, oy: number, dx: number, dy: number, maxDist: number, sightOnly = true, minTop = 0): number {
    this.stamp++;
    let best = -1;
    const steps = Math.ceil(maxDist / (this.cell * 0.5)) + 1;
    for (let s = 0; s <= steps; s++) {
      const t = Math.min(maxDist, s * this.cell * 0.5);
      const px = ox + dx * t;
      const py = oy + dy * t;
      const x = this.cx(px);
      const y = this.cy(py);
      for (let oyc = -1; oyc <= 1; oyc++) {
        for (let oxc = -1; oxc <= 1; oxc++) {
          const xx = x + oxc;
          const yy = y + oyc;
          if (xx < 0 || yy < 0 || xx >= this.cols || yy >= this.rows) continue;
          for (const i of this.cells[yy * this.cols + xx]) {
            if (this.marks[i] === this.stamp) continue;
            this.marks[i] = this.stamp;
            const c = this.colliders[i];
            if (sightOnly && !c.blocksSight) continue;
            if (c.top < minTop) continue;
            const d = rayAabb(ox, oy, dx, dy, c, maxDist);
            if (d >= 0 && (best < 0 || d < best)) best = d;
          }
        }
      }
      if (best >= 0 && best < t) break;
    }
    return best;
  }

  /** Indices of colliders overlapping a box. */
  query(box: AABB, out: number[] = []): number[] {
    this.stamp++;
    out.length = 0;
    for (let y = this.cy(box.minY); y <= this.cy(box.maxY); y++) {
      for (let x = this.cx(box.minX); x <= this.cx(box.maxX); x++) {
        for (const i of this.cells[y * this.cols + x]) {
          if (this.marks[i] === this.stamp) continue;
          this.marks[i] = this.stamp;
          const c = this.colliders[i];
          if (c.maxX >= box.minX && c.minX <= box.maxX && c.maxY >= box.minY && c.minY <= box.maxY) out.push(i);
        }
      }
    }
    return out;
  }
}

interface Themes {
  [key: string]: BlockKind;
}

export function generateCity(t: Tuning, seed = t.world.seed): City {
  const w = t.world;
  const rng = new RNG(seed);
  const graph = new RoadGraph(t);
  const P = graph.pitch;
  const H = graph.half;
  const NX = w.blocksX;
  const NY = w.blocksY;
  const size = NX * P;
  const fp = w.footpathWidth;
  const storey = w.storeyHeight;
  const bz = w.boulevardElevation;
  const boulevardY = -P;
  const beachTop = boulevardY - H - 6;
  const shoreY = beachTop - w.beachDepth;
  const northEdge = size + H;

  const blocks: Block[] = [];
  const buildings: Building[] = [];
  const colliders: StaticCollider[] = [];
  const lamps: Lamp[] = [];
  const palms: Palm[] = [];
  const props: Prop[] = [];
  const neon: NeonSign[] = [];
  const parking: ParkingSpot[] = [];
  const villas: Villa[] = [];
  const piers: Pier[] = [];
  const boats: Boat[] = [];
  const cranes: Crane[] = [];
  const footLoops: FootLoop[] = [];

  const heightAt = (x: number, y: number): number => {
    if (x < -H - 40 || x > size + H + 40) return 0;
    if (y >= boulevardY - H - 1 && y <= boulevardY + H) return bz;
    if (y > boulevardY + H && y < -H) {
      for (const c of w.rampColumns) {
        if (Math.abs(x - c * P) <= H) return (bz * (-H - y)) / (P - 2 * H);
      }
    }
    return 0;
  };

  const addCollider = (minX: number, minY: number, maxX: number, maxY: number, kind: ColliderKind, top: number, blocksSight = true): void => {
    colliders.push({ minX, minY, maxX, maxY, kind, top, blocksSight });
  };

  // ---------------------------------------------------------------- themes
  const themes: Themes = {
    '4,4': 'casino',
    '3,4': 'tower',
    '5,2': 'skyline',
    '6,6': 'temple',
    '2,5': 'market',
    '0,6': 'railyard',
    '0,7': 'railyard',
    '1,1': 'safehouse',
    '2,2': 'plaza',
    '5,6': 'carpark',
  };
  const neonBlocks: Record<string, { text: string; color: number }[]> = {
    '4,4': [{ text: 'CASINO', color: NEON_COLOURS.amber }],
    '3,4': [{ text: 'HOTEL', color: NEON_COLOURS.red }],
    '3,3': [{ text: 'BAR', color: NEON_COLOURS.amber }],
    '2,5': [
      { text: 'NOODLES', color: NEON_COLOURS.teal },
      { text: 'OPEN', color: NEON_COLOURS.red },
    ],
    '1,5': [{ text: 'KARAOKE', color: NEON_COLOURS.amber }],
    '6,1': [{ text: 'MOTEL', color: NEON_COLOURS.red }],
    '4,0': [{ text: 'DINER', color: NEON_COLOURS.teal }],
  };

  const pickKind = (bi: number, bj: number): BlockKind => {
    const key = `${bi},${bj}`;
    if (themes[key]) return themes[key];
    const r = rng.float();
    const m = w.blockMix;
    if (r < m.split) return 'split';
    if (r < m.split + m.quad) return 'quad';
    if (r < m.split + m.quad + m.plaza) return 'plaza';
    if (r < m.split + m.quad + m.plaza + m.carpark) return 'carpark';
    return 'tower';
  };

  const floorsFor = (range: [number, number], bi: number, bj: number): number => {
    // lower near the coast and the edges, taller in the middle
    const cxn = Math.abs(bi + 0.5 - NX / 2) / (NX / 2);
    const cyn = bj / NY;
    const centre = 1 - Math.min(1, cxn * 0.7 + Math.abs(cyn - 0.55) * 0.9);
    const coast = Math.min(1, 0.35 + bj * 0.22);
    const k = Math.max(0, Math.min(1, centre * coast * 1.1 + rng.range(-0.15, 0.15)));
    return Math.round(range[0] + (range[1] - range[0]) * k);
  };

  const addBuilding = (
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    floors: number,
    opts: Partial<Pick<Building, 'roof' | 'color' | 'balconies'>> & { facade?: number; setbacks?: boolean } = {},
  ): Building => {
    const id = buildings.length;
    const height = floors * storey + 6;
    const facade = opts.facade ?? (floors > 16 ? rng.pick([FACADE.ribbon, FACADE.curtain, FACADE.punched]) : rng.pick([FACADE.ribbon, FACADE.punched, FACADE.ribbon]));
    const tiers: Tier[] = [];
    // ground floor shopfront plinth
    tiers.push({ minX, minY, maxX, maxY, z0: 0, z1: storey + 4, facade: FACADE.shop });
    const inset = 3;
    let z0 = storey + 4;
    const body = { minX: minX + inset, minY: minY + inset, maxX: maxX - inset, maxY: maxY - inset };
    const setbacks = (opts.setbacks ?? floors >= 14) && maxX - minX > 140 && maxY - minY > 140;
    if (setbacks) {
      const z1 = z0 + Math.round((floors - 1) * 0.66) * storey;
      tiers.push({ ...body, z0, z1, facade });
      z0 = z1;
      const s1 = rng.range(18, 34);
      const z2 = z0 + Math.round((floors - 1) * 0.22) * storey;
      tiers.push({ minX: body.minX + s1, minY: body.minY + s1, maxX: body.maxX - s1, maxY: body.maxY - s1, z0, z1: z2, facade });
      z0 = z2;
      const s2 = s1 + rng.range(18, 30);
      tiers.push({ minX: body.minX + s2, minY: body.minY + s2, maxX: body.maxX - s2, maxY: body.maxY - s2, z0, z1: height, facade });
    } else {
      tiers.push({ ...body, z0, z1: height, facade });
    }
    const b: Building = {
      id,
      minX,
      minY,
      maxX,
      maxY,
      height,
      floors,
      tiers,
      color: opts.color ?? rng.pick(BUILDING_COLOURS),
      trim: rng.pick(TRIMS),
      roof: opts.roof ?? (floors > 20 ? 'antenna' : floors > 8 ? rng.pick(['tank', 'deco', 'flat'] as const) : rng.pick(['flat', 'tank'] as const)),
      seed: rng.u32() % 251,
      lit: rng.range(0.22, 0.5),
      balconies: opts.balconies ?? (floors < 14 && rng.chance(0.45)),
    };
    buildings.push(b);
    addCollider(minX, minY, maxX, maxY, 'building', height, true);
    return b;
  };

  const addBollards = (x0: number, y0: number, x1: number, y1: number): void => {
    // bollards across an alley mouth from (x0, y0) to (x1, y1)
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.floor(len / w.bollardGap));
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 + ((y1 - y0) * k) / n;
      const r = w.bollardRadius;
      addCollider(x - r, y - r, x + r, y + r, 'bollard', 7, false);
      props.push({ kind: 'bollard', x, y, z: 0, a: 0, l: r, w: r, h: 7, color: 0x2a2b30 });
    }
  };

  const addPalm = (x: number, y: number, z = 0, tall = 1): void => {
    palms.push({
      x,
      y,
      z,
      h: rng.range(70, 110) * tall,
      lean: rng.range(0.02, 0.16),
      leanDir: rng.range(0, Math.PI * 2),
      seed: rng.u32() % 10000,
    });
  };

  const addNeon = (b: Building, text: string, color: number): void => {
    // hang on the facade facing the widest road side (pick deterministically)
    const side = rng.int(0, 3);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const vertical = rng.chance(0.4) && text.length <= 7;
    const len = text.length * (vertical ? 13 : 12) + 14;
    const hgt = vertical ? len : 22;
    const wid = vertical ? 22 : len;
    const z = Math.min(b.height - hgt / 2 - 8, storey * rng.range(2.2, 4.5));
    const off = 3.5;
    const pos = [
      { x: b.maxX + off, y: cy, a: 0 },
      { x: cx, y: b.maxY + off, a: Math.PI / 2 },
      { x: b.minX - off, y: cy, a: Math.PI },
      { x: cx, y: b.minY - off, a: -Math.PI / 2 },
    ][side];
    neon.push({ x: pos.x, y: pos.y, z, a: pos.a, w: wid, h: hgt, text, color, vertical });
  };

  // ---------------------------------------------------------------- blocks
  for (let bj = 0; bj < NY; bj++) {
    for (let bi = 0; bi < NX; bi++) {
      const kind = pickKind(bi, bj);
      const minX = bi * P + H;
      const minY = bj * P + H;
      const maxX = minX + w.blockSize;
      const maxY = minY + w.blockSize;
      const block: Block = { bi, bj, kind, minX, minY, maxX, maxY, buildings: [], alleys: [] };
      blocks.push(block);
      footLoops.push({ minX: minX + fp / 2, minY: minY + fp / 2, maxX: maxX - fp / 2, maxY: maxY - fp / 2, z: w.kerbHeight });
      const zx0 = minX + fp;
      const zy0 = minY + fp;
      const zx1 = maxX - fp;
      const zy1 = maxY - fp;
      const zw = zx1 - zx0;
      const aw = w.alleyWidth;
      const key = `${bi},${bj}`;

      switch (kind) {
        case 'tower':
        case 'casino': {
          const floors = kind === 'casino' ? 18 : floorsFor(w.floors.tower, bi, bj);
          const b = addBuilding(zx0, zy0, zx1, zy1, floors, kind === 'casino' ? { facade: FACADE.curtain, roof: 'deco', color: 0xf3e1a0 } : {});
          block.buildings.push(b.id);
          break;
        }
        case 'skyline': {
          const b = addBuilding(zx0 + 10, zy0 + 10, zx1 - 10, zy1 - 10, w.floors.skyline[0], { roof: 'antenna', facade: FACADE.curtain, setbacks: true, color: 0xe8e4da });
          block.buildings.push(b.id);
          break;
        }
        case 'split':
        case 'safehouse': {
          const alongX = kind === 'safehouse' ? true : rng.chance(0.5);
          const mid = zw / 2;
          if (alongX) {
            // alley runs east-west through the middle
            const a0 = zy0 + mid - aw / 2;
            const a1 = zy0 + mid + aw / 2;
            const f1 = kind === 'safehouse' ? 2 : floorsFor(w.floors.split, bi, bj);
            const f2 = kind === 'safehouse' ? 6 : floorsFor(w.floors.split, bi, bj);
            const b1 = addBuilding(zx0, zy0, zx1, a0, f1, kind === 'safehouse' ? { color: 0x9aa3a8, roof: 'flat', facade: FACADE.plain } : {});
            const b2 = addBuilding(zx0, a1, zx1, zy1, f2);
            block.buildings.push(b1.id, b2.id);
            block.alleys.push({ minX, minY: a0, maxX, maxY: a1 });
            addBollards(minX + 2, a0 + 3, minX + 2, a1 - 3);
            addBollards(maxX - 2, a0 + 3, maxX - 2, a1 - 3);
          } else {
            const a0 = zx0 + mid - aw / 2;
            const a1 = zx0 + mid + aw / 2;
            const b1 = addBuilding(zx0, zy0, a0, zy1, floorsFor(w.floors.split, bi, bj));
            const b2 = addBuilding(a1, zy0, zx1, zy1, floorsFor(w.floors.split, bi, bj));
            block.buildings.push(b1.id, b2.id);
            block.alleys.push({ minX: a0, minY, maxX: a1, maxY });
            addBollards(a0 + 3, minY + 2, a1 - 3, minY + 2);
            addBollards(a0 + 3, maxY - 2, a1 - 3, maxY - 2);
          }
          break;
        }
        case 'quad':
        case 'market': {
          const mid = zw / 2;
          const a0 = mid - aw / 2;
          const a1 = mid + aw / 2;
          const rects = [
            [zx0, zy0, zx0 + a0, zy0 + a0],
            [zx0 + a1, zy0, zx1, zy0 + a0],
            [zx0, zy0 + a1, zx0 + a0, zy1],
            [zx0 + a1, zy0 + a1, zx1, zy1],
          ];
          for (const r of rects) {
            const floors = kind === 'market' ? rng.int(2, 4) : floorsFor(w.floors.quad, bi, bj);
            const b = addBuilding(r[0], r[1], r[2], r[3], floors, kind === 'market' ? { facade: FACADE.punched } : {});
            block.buildings.push(b.id);
          }
          block.alleys.push({ minX, minY: zy0 + a0, maxX, maxY: zy0 + a1 }, { minX: zx0 + a0, minY, maxX: zx0 + a1, maxY });
          addBollards(minX + 2, zy0 + a0 + 3, minX + 2, zy0 + a1 - 3);
          addBollards(maxX - 2, zy0 + a0 + 3, maxX - 2, zy0 + a1 - 3);
          addBollards(zx0 + a0 + 3, minY + 2, zx0 + a1 - 3, minY + 2);
          addBollards(zx0 + a0 + 3, maxY - 2, zx0 + a1 - 3, maxY - 2);
          break;
        }
        case 'plaza': {
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          addCollider(cx - 26, cy - 26, cx + 26, cy + 26, 'prop', 10, false);
          props.push({ kind: 'fountain', x: cx, y: cy, z: 0, a: 0, l: 26, w: 26, h: 10, color: 0xd8d0c0 });
          for (let gx = -1; gx <= 1; gx++) {
            for (let gy = -1; gy <= 1; gy++) {
              if (gx === 0 && gy === 0) continue;
              const px = cx + gx * 110;
              const py = cy + gy * 110;
              if (rng.chance(0.75)) addPalm(px + rng.range(-8, 8), py + rng.range(-8, 8), 0, 1.05);
              else props.push({ kind: 'tree', x: px, y: py, z: 0, a: 0, l: 22, w: 22, h: 46, color: 0x2e4a2c });
            }
          }
          for (let k = 0; k < 4; k++) {
            const a = (k * Math.PI) / 2;
            props.push({ kind: 'bench', x: cx + Math.cos(a) * 52, y: cy + Math.sin(a) * 52, z: 0, a: a + Math.PI / 2, l: 12, w: 4, h: 4, color: 0x5a3c28 });
          }
          props.push({ kind: 'kiosk', x: cx + 120, y: cy - 150, z: 0, a: 0, l: 16, w: 12, h: 20, color: 0xd9a441 });
          addCollider(cx + 112, cy - 156, cx + 128, cy - 144, 'prop', 20, false);
          break;
        }
        case 'carpark': {
          const rowsY = [zy0 + 40, zy0 + 110, zy1 - 110, zy1 - 40];
          for (const ry of rowsY) {
            for (let x = zx0 + 24; x < zx1 - 20; x += 26) {
              if (rng.chance(0.55)) parking.push({ x, y: ry, a: Math.PI / 2 + (rng.chance(0.5) ? Math.PI : 0) });
            }
          }
          props.push({ kind: 'kiosk', x: zx0 + 14, y: (zy0 + zy1) / 2, z: 0, a: 0, l: 14, w: 14, h: 22, color: 0xe8e4da });
          addCollider(zx0 + 7, (zy0 + zy1) / 2 - 7, zx0 + 21, (zy0 + zy1) / 2 + 7, 'prop', 22, false);
          break;
        }
        case 'temple': {
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const b = addBuilding(cx - 90, cy - 90, cx + 90, cy + 90, 3, { roof: 'pagoda', facade: FACADE.plain, color: 0x8e2a22 });
          block.buildings.push(b.id);
          for (const [gx, gy] of [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ]) {
            props.push({ kind: 'tree', x: cx + gx * 140, y: cy + gy * 140, z: 0, a: 0, l: 26, w: 26, h: 50, color: 0x263f28 });
          }
          break;
        }
        case 'railyard': {
          for (let k = 0; k < 5; k++) {
            const x = zx0 + 30 + k * 72;
            props.push({ kind: 'rail', x, y: (minY + maxY) / 2, z: 0, a: Math.PI / 2, l: w.blockSize + 40, w: 12, h: 1, color: 0x55504a });
            if (k % 2 === 0 || rng.chance(0.5)) {
              const y0 = zy0 + rng.range(10, 120);
              const len = rng.range(90, 180);
              const col = rng.pick([0x7a3b2a, 0x3d4f5c, 0x6b6456, 0x2f4a3a]);
              props.push({ kind: 'boxcar', x, y: y0 + len / 2, z: 0, a: Math.PI / 2, l: len, w: 22, h: 30, color: col });
              addCollider(x - 11, y0, x + 11, y0 + len, 'container', 30, true);
            }
          }
          break;
        }
        default:
          break;
      }

      if (neonBlocks[key]) {
        const hosts = block.buildings.length ? block.buildings : [];
        neonBlocks[key].forEach((n, k) => {
          if (hosts.length) addNeon(buildings[hosts[k % hosts.length]], n.text, n.color);
        });
      }

      // palms along the kerb, more of them near the coast
      const palmy = bj <= 2 || kind === 'plaza' || rng.chance(0.3);
      if (palmy && kind !== 'railyard') {
        const inset = 8;
        const spacing = 92;
        const sides: [number, number, number, number][] = [
          [minX + 40, minY + inset, maxX - 40, minY + inset],
          [minX + 40, maxY - inset, maxX - 40, maxY - inset],
          [minX + inset, minY + 40, minX + inset, maxY - 40],
          [maxX - inset, minY + 40, maxX - inset, maxY - 40],
        ];
        for (const [x0, y0, x1, y1] of sides) {
          if (bj > 2 && rng.chance(0.5)) continue;
          const len = Math.hypot(x1 - x0, y1 - y0);
          const n = Math.floor(len / spacing);
          for (let k = 0; k <= n; k++) {
            const x = x0 + ((x1 - x0) * k) / n;
            const y = y0 + ((y1 - y0) * k) / n;
            const inAlley = block.alleys.some((a) => x >= a.minX - 8 && x <= a.maxX + 8 && y >= a.minY - 8 && y <= a.maxY + 8);
            if (!inAlley) addPalm(x, y, w.kerbHeight);
          }
        }
      }

      // street furniture
      if (kind !== 'railyard' && rng.chance(0.5)) {
        props.push({ kind: 'bin', x: minX + 14, y: minY + rng.range(60, 300), z: w.kerbHeight, a: 0, l: 2.5, w: 2.5, h: 7, color: 0x2b3a34 });
      }
      if (kind !== 'railyard' && rng.chance(0.18)) {
        props.push({ kind: 'busstop', x: (minX + maxX) / 2 + rng.range(-80, 80), y: minY + 10, z: w.kerbHeight, a: 0, l: 26, w: 8, h: 20, color: 0x2d3136 });
      }
    }
  }

  // ------------------------------------------------ low lots south of row 0
  const lotMinY = boulevardY + H;
  const lotMaxY = -H;
  const lotRanges: [number, number][] = [];
  for (let k = 0; k + 1 < w.rampColumns.length; k++) lotRanges.push([w.rampColumns[k] * P + H, w.rampColumns[k + 1] * P - H]);
  lotRanges.forEach(([x0, x1], side) => {
    footLoops.push({ minX: x0 + fp / 2, minY: lotMinY + fp / 2, maxX: x1 - fp / 2, maxY: lotMaxY - fp / 2, z: w.kerbHeight });
    const block: Block = { bi: side, bj: -1, kind: 'lot', minX: x0, minY: lotMinY, maxX: x1, maxY: lotMaxY, buildings: [], alleys: [] };
    blocks.push(block);
    const n = 4;
    const lw = (x1 - x0 - (n - 1) * w.alleyWidth) / n;
    for (let k = 0; k < n; k++) {
      const a = x0 + k * (lw + w.alleyWidth);
      const b = a + lw;
      const docks = side === 1;
      const use = docks ? (k === 3 ? 'warehouse' : 'containers') : ['park', 'shops', 'carpark', 'shops'][k];
      if (use === 'shops') {
        const b1 = addBuilding(a + fp, lotMaxY - fp - 150, b - fp, lotMaxY - fp, rng.int(2, 4), { facade: FACADE.punched });
        block.buildings.push(b1.id);
        for (let x = a + 30; x < b - 20; x += 80) addPalm(x, lotMinY + 30, 0);
      } else if (use === 'warehouse') {
        const b1 = addBuilding(a + fp, lotMinY + 40, b - fp, lotMaxY - fp, 3, { facade: FACADE.plain, color: 0xb8b2a4, roof: 'flat' });
        block.buildings.push(b1.id);
      } else if (use === 'park') {
        for (let x = a + 40; x < b - 30; x += 70) for (let y = lotMinY + 50; y < lotMaxY - 40; y += 90) addPalm(x + rng.range(-10, 10), y + rng.range(-10, 10), 0, 1.1);
        props.push({ kind: 'bench', x: (a + b) / 2, y: lotMaxY - 40, z: 0, a: 0, l: 12, w: 4, h: 4, color: 0x5a3c28 });
      } else if (use === 'carpark') {
        for (let x = a + 26; x < b - 20; x += 26) {
          if (rng.chance(0.6)) parking.push({ x, y: lotMinY + 70, a: Math.PI / 2 });
          if (rng.chance(0.6)) parking.push({ x, y: lotMaxY - 90, a: -Math.PI / 2 });
        }
      } else if (use === 'containers') {
        for (let y = lotMinY + 40; y < lotMaxY - 70; y += 34) {
          for (let x = a + 30; x < b - 60; x += 70) {
            if (!rng.chance(0.7)) continue;
            const stack = rng.int(1, 3);
            const col = rng.pick([0xa0412d, 0x2f6f73, 0xd9c9a0, 0x6e7479, 0x365c8a, 0xc7862f]);
            props.push({ kind: 'container', x: x + 24, y: y + 10, z: 0, a: 0, l: 48, w: 20, h: 21 * stack, color: col });
            addCollider(x, y, x + 48, y + 20, 'container', 21 * stack, stack > 1);
          }
        }
      }
      if (k < n - 1) block.alleys.push({ minX: b, minY: lotMinY, maxX: b + w.alleyWidth, maxY: lotMaxY });
    }
  });
  cranes.push({ x: 5.2 * P, y: boulevardY - H - 60, a: 0, h: 300 }, { x: 6.6 * P, y: boulevardY - H - 60, a: 0, h: 280 });

  // ------------------------------------------------ boundary walls and barriers
  const wallT = 20;
  addCollider(-H - wallT, boulevardY - H - wallT, -H, northEdge + wallT, 'wall', 40, false);
  addCollider(size + H, boulevardY - H - wallT, size + H + wallT, northEdge + wallT, 'wall', 40, false);
  addCollider(-H - wallT, northEdge, size + H + wallT, northEdge + wallT, 'wall', 40, false);
  // boulevard south barrier (beach side)
  addCollider(-H - wallT, boulevardY - H - 5, size + H + wallT, boulevardY - H, 'barrier', bz + 8, false);
  // boulevard north edge, open where ramps join
  const openings = w.rampColumns.map((c) => [c * P - H, c * P + H]);
  let cursor = -H;
  for (const [o0, o1] of openings.sort((p, q) => p[0] - q[0])) {
    if (o0 > cursor) addCollider(cursor, boulevardY + H, o0, boulevardY + H + 5, 'barrier', bz + 8, false);
    cursor = Math.max(cursor, o1);
  }
  if (cursor < size + H) addCollider(cursor, boulevardY + H, size + H, boulevardY + H + 5, 'barrier', bz + 8, false);
  // ramp side walls
  for (const c of w.rampColumns) {
    const x = c * P;
    addCollider(x - H - 5, boulevardY + H, x - H, -H - 30, 'barrier', bz, false);
    addCollider(x + H, boulevardY + H, x + H + 5, -H - 30, 'barrier', bz, false);
  }
  // barrier and fence props along the boulevard
  for (let x = -H + 8; x < size + H; x += 16) {
    props.push({ kind: 'barrier', x, y: boulevardY - H - 2.5, z: bz, a: 0, l: 16, w: 5, h: 7, color: 0xbdb6a8 });
    props.push({ kind: 'fence', x, y: boulevardY - H - 2.5, z: bz + 7, a: 0, l: 16, w: 1, h: 9, color: 0x111214 });
    const inOpening = openings.some(([o0, o1]) => x > o0 - 8 && x < o1 + 8);
    if (!inOpening) props.push({ kind: 'barrier', x, y: boulevardY + H + 2.5, z: bz, a: 0, l: 16, w: 5, h: 7, color: 0xbdb6a8 });
  }
  for (const c of w.rampColumns) {
    for (let y = boulevardY + H + 8; y < -H - 30; y += 16) {
      const z = heightAt(c * P, y);
      for (const s of [-1, 1]) {
        if (c * P + s * (H + 2.5) < -H || c * P + s * (H + 2.5) > size + H) continue;
        props.push({ kind: 'barrier', x: c * P + s * (H + 2.5), y, z, a: Math.PI / 2, l: 16, w: 5, h: 7, color: 0xbdb6a8 });
      }
    }
  }

  // ------------------------------------------------ lamps
  const inCity = (x: number, y: number): boolean => x > -H && x < size + H && y > boulevardY + H && y < northEdge;
  for (const n of graph.nodes) {
    if (n.kind !== 'grid') continue;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const x = n.x + sx * (H + w.lampInset);
        const y = n.y + sy * (H + w.lampInset);
        if (!inCity(x, y)) continue;
        if (n.gj === 0 && sy < 0 && w.rampColumns.includes(n.gi)) continue;
        lamps.push({ x, y, z: w.kerbHeight, a: Math.atan2(-sy, -sx) });
      }
    }
  }
  // mid-block lamps, alternating sides
  for (const e of graph.edges) {
    if (e.kind !== 'street') continue;
    const a = graph.nodes[e.a];
    const b = graph.nodes[e.b];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const s = hash01(e.id, 3) < 0.5 ? -1 : 1;
    const px = mx + (e.dy !== 0 ? s * (H + w.lampInset) : 0);
    const py = my + (e.dx !== 0 ? s * (H + w.lampInset) : 0);
    if (!inCity(px, py)) continue;
    lamps.push({ x: px, y: py, z: w.kerbHeight, a: Math.atan2(my - py, mx - px) });
  }
  for (let x = -H + 60; x < size + H - 30; x += 150) {
    lamps.push({ x, y: boulevardY - H + 4, z: bz, a: Math.PI / 2 });
    const x2 = x + 75;
    if (!openings.some(([o0, o1]) => x2 > o0 - 10 && x2 < o1 + 10)) lamps.push({ x: x2, y: boulevardY + H - 4, z: bz, a: -Math.PI / 2 });
  }

  // ------------------------------------------------ beach, marina, palms by the sea
  for (let x = -H - 200; x < size + H + 200; x += 70) {
    addPalm(x + rng.range(-15, 15), beachTop - rng.range(20, 60), 0, 1.25);
    if (rng.chance(0.4)) addPalm(x + rng.range(-20, 20), beachTop - rng.range(90, 160), 0, 1.1);
  }
  const marinaX0 = 5.3 * P;
  for (let k = 0; k < 5; k++) {
    const px = marinaX0 + k * 150;
    const pier: Pier = { minX: px - 9, minY: shoreY - 420, maxX: px + 9, maxY: beachTop };
    piers.push(pier);
    for (let b = 0; b < 5; b++) {
      if (!rng.chance(0.75)) continue;
      const side = b % 2 === 0 ? -1 : 1;
      boats.push({ x: px + side * 32, y: shoreY - 60 - b * 70, a: Math.PI / 2 + rng.range(-0.05, 0.05), l: rng.range(50, 80), color: rng.pick([0xf2f0ea, 0xe8e4da, 0xdfe7ea, 0x1d2f45]) });
    }
  }

  // ------------------------------------------------ hills and villas to the north
  for (let k = 0; k < 70; k++) {
    const x = rng.range(-500, size + 500);
    const y = northEdge + rng.range(120, 1300);
    const z = hillHeight(x, y, northEdge);
    villas.push({ x, y, z, w: rng.range(60, 120), d: rng.range(50, 90), h: rng.range(26, 56), color: rng.pick([0xf5efe2, 0xefe3c8, 0xf2c4a0, 0xe8e4da]) });
  }
  for (let k = 0; k < 120; k++) {
    const x = rng.range(-600, size + 600);
    const y = northEdge + rng.range(60, 1300);
    addPalm(x, y, hillHeight(x, y, northEdge), 1.1);
  }

  // ------------------------------------------------ places
  const placeDefs: [string, number, number][] = [
    ['Safehouse', 1, 1],
    ['Casino Strip', 4, 4],
    ['Harbour Docks', 8, -1],
    ['Old Temple', 6, 6],
    ['Neon Market', 2, 5],
    ['Rail Yard', 0, 7],
    ['Skyline Tower', 5, 2],
  ];
  const places: Place[] = placeDefs.map(([name, gi, gj]) => {
    const n = graph.nodeAt(gi, gj);
    return { name, node: n.id, x: n.x, y: n.y };
  });

  // solid street furniture: palm trunks and lamp posts in the drivable city
  if (w.solidStreetFurniture) {
    for (const p of palms) {
      if (p.y > boulevardY + H && p.y < northEdge && p.x > -H && p.x < size + H) addCollider(p.x - 2.4, p.y - 2.4, p.x + 2.4, p.y + 2.4, 'prop', p.h, false);
    }
    for (const l of lamps) addCollider(l.x - 1.6, l.y - 1.6, l.x + 1.6, l.y + 1.6, 'prop', w.lampHeight, false);
  }

  const bounds: AABB = { minX: -H - 600, minY: shoreY - 800, maxX: size + H + 600, maxY: northEdge + 1400 };
  const index = new CityIndex(colliders, bounds);

  return {
    seed,
    pitch: P,
    half: H,
    size,
    bounds,
    graph,
    blocks,
    buildings,
    colliders,
    lamps,
    palms,
    props,
    neon,
    places,
    parking,
    villas,
    piers,
    boats,
    cranes,
    footLoops,
    boulevardY,
    boulevardZ: bz,
    beachMinY: shoreY,
    shoreY,
    northEdge,
    heightAt,
    index,
  };
}

/** Hill terrain north of the grid (decorative). */
export function hillHeight(x: number, y: number, northEdge: number): number {
  const d = y - northEdge - 40;
  if (d <= 0) return 0;
  const base = Math.pow(Math.min(1, d / 1300), 1.4) * 420;
  const wobble = Math.sin(x * 0.0021) * 40 + Math.sin(x * 0.0057 + y * 0.003) * 22;
  return Math.max(0, base + wobble * Math.min(1, d / 300));
}

export function placeByName(city: City, name: string): Place {
  const p = city.places.find((q) => q.name === name);
  if (!p) throw new Error(`Unknown place ${name}`);
  return p;
}

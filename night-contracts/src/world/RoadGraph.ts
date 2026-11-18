/**
 * Road network as a graph of intersections. Pure data, no rendering.
 *
 * Grid nodes sit at road centreline crossings (i * pitch, j * pitch) for
 * i, j in 0..blocks. Boulevard nodes run along the raised coastal road one
 * pitch south of row 0. Ramps join the boulevard to row 0 on rampColumns.
 */
import type { Tuning } from '../config/tuning';
import { leftX, leftY } from '../core/math';

export type EdgeKind = 'street' | 'boulevard' | 'ramp';

export interface RoadNode {
  id: number;
  x: number;
  y: number;
  z: number;
  gi: number;
  gj: number;
  edges: number[];
  kind: 'grid' | 'boulevard';
}

export interface RoadEdge {
  id: number;
  a: number;
  b: number;
  length: number;
  /** Unit direction from a to b. */
  dx: number;
  dy: number;
  kind: EdgeKind;
  speed: number;
}

export class RoadGraph {
  readonly nodes: RoadNode[] = [];
  readonly edges: RoadEdge[] = [];
  readonly pitch: number;
  readonly half: number;
  readonly laneOffset: number;
  readonly nx: number;
  readonly ny: number;
  private readonly edgeIndex = new Map<number, number>();

  constructor(t: Tuning) {
    const w = t.world;
    this.pitch = w.blockSize + w.roadWidth;
    this.half = w.roadWidth / 2;
    this.laneOffset = w.laneOffset;
    this.nx = w.blocksX + 1;
    this.ny = w.blocksY + 1;
    const P = this.pitch;

    for (let j = 0; j < this.ny; j++) {
      for (let i = 0; i < this.nx; i++) {
        this.nodes.push({ id: this.nodes.length, x: i * P, y: j * P, z: 0, gi: i, gj: j, edges: [], kind: 'grid' });
      }
    }
    for (let i = 0; i < this.nx; i++) {
      this.nodes.push({ id: this.nodes.length, x: i * P, y: -P, z: w.boulevardElevation, gi: i, gj: -1, edges: [], kind: 'boulevard' });
    }

    const street = t.traffic.cruiseSpeed;
    for (let j = 0; j < this.ny; j++) {
      for (let i = 0; i < this.nx; i++) {
        if (i + 1 < this.nx) this.addEdge(this.gridId(i, j), this.gridId(i + 1, j), 'street', street);
        if (j + 1 < this.ny) this.addEdge(this.gridId(i, j), this.gridId(i, j + 1), 'street', street);
      }
    }
    for (let i = 0; i + 1 < this.nx; i++) this.addEdge(this.boulevardId(i), this.boulevardId(i + 1), 'boulevard', t.traffic.boulevardSpeed);
    for (const c of w.rampColumns) this.addEdge(this.boulevardId(c), this.gridId(c, 0), 'ramp', street);
  }

  gridId(i: number, j: number): number {
    return j * this.nx + i;
  }

  boulevardId(i: number): number {
    return this.nx * this.ny + i;
  }

  /** Node id for grid coords, with gj = -1 meaning the boulevard. */
  nodeAt(gi: number, gj: number): RoadNode {
    return this.nodes[gj < 0 ? this.boulevardId(gi) : this.gridId(gi, gj)];
  }

  private addEdge(a: number, b: number, kind: EdgeKind, speed: number): void {
    const na = this.nodes[a];
    const nb = this.nodes[b];
    const length = Math.hypot(nb.x - na.x, nb.y - na.y);
    const e: RoadEdge = { id: this.edges.length, a, b, length, dx: (nb.x - na.x) / length, dy: (nb.y - na.y) / length, kind, speed };
    this.edges.push(e);
    na.edges.push(e.id);
    nb.edges.push(e.id);
    this.edgeIndex.set(a * 4096 + b, e.id);
    this.edgeIndex.set(b * 4096 + a, e.id);
  }

  edgeBetween(a: number, b: number): RoadEdge | undefined {
    const id = this.edgeIndex.get(a * 4096 + b);
    return id === undefined ? undefined : this.edges[id];
  }

  other(e: RoadEdge, n: number): number {
    return e.a === n ? e.b : e.a;
  }

  neighbours(n: number): number[] {
    return this.nodes[n].edges.map((e) => this.other(this.edges[e], n));
  }

  nearestNode(x: number, y: number): RoadNode {
    let best = this.nodes[0];
    let bd = Infinity;
    for (const n of this.nodes) {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    return best;
  }

  /** Nearest point on any edge centreline. */
  nearestEdge(x: number, y: number): { edge: RoadEdge; t: number; dist: number } {
    let best = { edge: this.edges[0], t: 0, dist: Infinity };
    for (const e of this.edges) {
      const a = this.nodes[e.a];
      const t = Math.max(0, Math.min(e.length, (x - a.x) * e.dx + (y - a.y) * e.dy));
      const px = a.x + e.dx * t;
      const py = a.y + e.dy * t;
      const d = Math.hypot(px - x, py - y);
      if (d < best.dist) best = { edge: e, t, dist: d };
    }
    return best;
  }

  /** Lane point at distance `s` along edge travelling from node `from`. Left-hand traffic. */
  lanePoint(e: RoadEdge, from: number, s: number, offset = this.laneOffset): { x: number; y: number; a: number } {
    const forward = e.a === from;
    const n = this.nodes[from];
    const dx = forward ? e.dx : -e.dx;
    const dy = forward ? e.dy : -e.dy;
    const a = Math.atan2(dy, dx);
    return { x: n.x + dx * s + leftX(a) * offset, y: n.y + dy * s + leftY(a) * offset, a };
  }

  /** Shortest path by edge length (Dijkstra; the graph is tiny). */
  path(from: number, to: number, avoid?: Set<number>): number[] {
    const n = this.nodes.length;
    const distArr = new Float64Array(n).fill(Infinity);
    const prev = new Int32Array(n).fill(-1);
    const done = new Uint8Array(n);
    distArr[from] = 0;
    for (;;) {
      let u = -1;
      let bd = Infinity;
      for (let i = 0; i < n; i++) {
        if (!done[i] && distArr[i] < bd) {
          bd = distArr[i];
          u = i;
        }
      }
      if (u < 0 || u === to) break;
      done[u] = 1;
      for (const eid of this.nodes[u].edges) {
        const e = this.edges[eid];
        const v = this.other(e, u);
        if (avoid?.has(v) && v !== to) continue;
        const nd = distArr[u] + e.length;
        if (nd < distArr[v]) {
          distArr[v] = nd;
          prev[v] = u;
        }
      }
    }
    if (from !== to && prev[to] < 0) return [from];
    const out: number[] = [];
    for (let v = to; v !== -1; v = prev[v]) {
      out.push(v);
      if (v === from) break;
    }
    return out.reverse();
  }

  /** Graph distance in hops (BFS). */
  hops(from: number): Int32Array {
    const d = new Int32Array(this.nodes.length).fill(-1);
    const q = [from];
    d[from] = 0;
    while (q.length) {
      const u = q.shift()!;
      for (const v of this.neighbours(u)) {
        if (d[v] < 0) {
          d[v] = d[u] + 1;
          q.push(v);
        }
      }
    }
    return d;
  }
}

/**
 * Static ground level of the city: terrain, roads, markings, footpaths,
 * the raised boulevard and ramps, beach and hills. Everything is merged into a
 * handful of meshes.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import { hillHeight, type City } from '../world/CityGenerator';
import { GeoBuilder } from './GeoBuilder';
import { createRoadMaterial, srgb } from './Shared';

const ASPHALT = 0x34353b;
const CONCRETE = 0x8d8a84;
const KERB = 0xa6a29a;
const PAVING = 0x9c8e7a;
const GRAVEL = 0x4e4a44;
const SAND = 0xd9c6a0;
const WALL = 0x9a948a;
const YELLOW = 0xe8b830;
const WHITE = 0xe6e2da;

export class CityView {
  readonly group = new THREE.Group();

  constructor(
    private readonly city: City,
    private readonly t: Tuning,
  ) {
    this.group.name = 'city-ground';
    this.buildGround();
    this.buildRoads();
    this.buildFootpaths();
    this.buildBoulevard();
    this.buildHills();
  }

  private buildGround(): void {
    const c = this.city;
    const g = new GeoBuilder();
    const b = c.bounds;
    // dark earth under everything north of the beach
    g.flat(b.minX - 2000, c.boulevardY - c.half, b.maxX + 2000, b.maxY + 2000, -0.4, 0x2b2a24);
    const mesh = new THREE.Mesh(g.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    mesh.receiveShadow = true;
    mesh.name = 'ground';
    this.group.add(mesh);

    // beach slopes gently from the sea wall into the water
    const s = new GeoBuilder();
    const top = c.boulevardY - c.half - 6;
    const x0 = b.minX - 2000;
    const x1 = b.maxX + 2000;
    s.quad(
      [
        [x0, 0.2, top],
        [x0, -6, c.shoreY - 60],
        [x1, -6, c.shoreY - 60],
        [x1, 0.2, top],
      ],
      [0, 1, 0],
      SAND,
    );
    const sand = new THREE.Mesh(s.build(), createRoadMaterial(SAND, 0.6));
    (sand.material as THREE.MeshStandardMaterial).vertexColors = true;
    (sand.material as THREE.MeshStandardMaterial).color.set(0xffffff);
    sand.receiveShadow = true;
    sand.name = 'beach';
    this.group.add(sand);
  }

  private buildRoads(): void {
    const c = this.city;
    const w = this.t.world;
    const P = c.pitch;
    const H = c.half;
    const size = c.size;
    const road = new GeoBuilder();
    const marks = new GeoBuilder();
    const ry = 0.05;
    const my = 0.12;

    for (let j = 0; j <= w.blocksY; j++) road.flat(-H, j * P - H, size + H, j * P + H, ry, ASPHALT);
    for (let i = 0; i <= w.blocksX; i++) road.flat(i * P - H, -H, i * P + H, size + H, ry + 0.01, ASPHALT);
    // boulevard deck and ramps
    const by = c.boulevardY;
    const bz = c.boulevardZ;
    road.flat(-H - 30, by - H, size + H + 30, by + H, bz + ry, ASPHALT);
    for (const col of w.rampColumns) {
      const x = col * P;
      road.quad(
        [
          [x - H, bz + ry, by + H],
          [x - H, ry, -H],
          [x + H, ry, -H],
          [x + H, bz + ry, by + H],
        ],
        [0, 1, 0],
        ASPHALT,
      );
    }
    const roadMesh = new THREE.Mesh(road.build(), createRoadMaterial(ASPHALT, 1));
    (roadMesh.material as THREE.MeshStandardMaterial).vertexColors = true;
    (roadMesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
    roadMesh.receiveShadow = true;
    roadMesh.name = 'roads';
    this.group.add(roadMesh);

    // markings along every edge: double yellow centre line, white edge dashes
    const g = c.graph;
    const line = (ax: number, ay: number, bx: number, by2: number, off: number, width: number, color: number, dash = 0, gap = 0): void => {
      const len = Math.hypot(bx - ax, by2 - ay);
      const dx = (bx - ax) / len;
      const dy = (by2 - ay) / len;
      const nx = -dy;
      const ny = dx;
      const step = dash > 0 ? dash + gap : len;
      for (let s = 0; s < len - 0.1; s += step) {
        const e = Math.min(len, s + (dash > 0 ? dash : len));
        const p0x = ax + dx * s + nx * off;
        const p0y = ay + dy * s + ny * off;
        const p1x = ax + dx * e + nx * off;
        const p1y = ay + dy * e + ny * off;
        const h0 = c.heightAt(p0x, p0y) + my;
        const h1 = c.heightAt(p1x, p1y) + my;
        const hw = width / 2;
        // corners in three space (x, h, y)
        const q: [number, number, number][] = [
          [p0x - nx * hw, h0, p0y - ny * hw],
          [p1x - nx * hw, h1, p1y - ny * hw],
          [p1x + nx * hw, h1, p1y + ny * hw],
          [p0x + nx * hw, h0, p0y + ny * hw],
        ];
        // make sure the quad faces up
        const ux = q[1][0] - q[0][0];
        const uz = q[1][2] - q[0][2];
        const vx = q[3][0] - q[0][0];
        const vz = q[3][2] - q[0][2];
        const up = uz * vx - ux * vz;
        marks.quad(up >= 0 ? q : [q[0], q[3], q[2], q[1]], [0, 1, 0], color);
      }
    };

    for (const e of g.edges) {
      const a = g.nodes[e.a];
      const b = g.nodes[e.b];
      const inset = H + 16;
      const ax = a.x + e.dx * (a.kind === 'boulevard' && a.edges.length <= 2 ? 0 : inset);
      const ay = a.y + e.dy * (a.kind === 'boulevard' && a.edges.length <= 2 ? 0 : inset);
      const bx = b.x - e.dx * (b.kind === 'boulevard' && b.edges.length <= 2 ? 0 : inset);
      const by2 = b.y - e.dy * (b.kind === 'boulevard' && b.edges.length <= 2 ? 0 : inset);
      line(ax, ay, bx, by2, 1.3, 0.9, YELLOW);
      line(ax, ay, bx, by2, -1.3, 0.9, YELLOW);
      line(ax, ay, bx, by2, H - 5, 0.8, WHITE, 18, 14);
      line(ax, ay, bx, by2, -(H - 5), 0.8, WHITE, 18, 14);
    }

    // zebra crossings and stop lines at grid intersections
    for (const n of g.nodes) {
      if (n.kind !== 'grid') continue;
      for (const eid of n.edges) {
        const e = g.edges[eid];
        const dirx = e.a === n.id ? e.dx : -e.dx;
        const diry = e.a === n.id ? e.dy : -e.dy;
        const nx = -diry;
        const ny = dirx;
        const c0 = H + 2;
        const c1 = H + 13;
        for (let s = -H + 6; s < H - 4; s += 7) {
          const px = n.x + nx * s;
          const py = n.y + ny * s;
          line(px + dirx * c0, py + diry * c0, px + dirx * c1, py + diry * c1, 0, 3.4, WHITE);
        }
      }
    }

    // car park bays
    for (const b of c.blocks) {
      if (b.kind !== 'carpark') continue;
      const zx0 = b.minX + w.footpathWidth;
      const zx1 = b.maxX - w.footpathWidth;
      const zy0 = b.minY + w.footpathWidth;
      const zy1 = b.maxY - w.footpathWidth;
      for (const ry2 of [zy0 + 40, zy0 + 110, zy1 - 110, zy1 - 40]) {
        for (let x = zx0 + 11; x < zx1 - 10; x += 26) line(x, ry2 - 20, x, ry2 + 20, 0, 0.8, WHITE);
      }
    }

    const markMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, emissive: 0x111111, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const markMesh = new THREE.Mesh(marks.build(), markMat);
    markMesh.name = 'markings';
    markMesh.receiveShadow = true;
    this.group.add(markMesh);
  }

  private buildFootpaths(): void {
    const c = this.city;
    const w = this.t.world;
    const g = new GeoBuilder();
    const k = w.kerbHeight;
    for (const b of c.blocks) {
      const top =
        b.kind === 'plaza' || b.kind === 'temple' ? PAVING : b.kind === 'railyard' ? GRAVEL : b.kind === 'carpark' ? 0x3a3b40 : CONCRETE;
      g.box(b.minX, 0, b.minY, b.maxX, k, b.maxY, KERB, null, 0b110111, top);
      // inner surface detail: a darker service yard behind the footpath
      if (b.kind === 'lot' || b.kind === 'carpark') {
        g.flat(b.minX + w.footpathWidth, b.minY + w.footpathWidth, b.maxX - w.footpathWidth, b.maxY - w.footpathWidth, k + 0.05, 0x34353a);
      }
      if (b.kind === 'plaza' || b.kind === 'temple') {
        // paving grid lines as slightly darker strips
        for (let x = b.minX + 40; x < b.maxX; x += 40) g.flat(x - 0.6, b.minY + 4, x + 0.6, b.maxY - 4, k + 0.04, 0x857866);
        for (let y = b.minY + 40; y < b.maxY; y += 40) g.flat(b.minX + 4, y - 0.6, b.maxX - 4, y + 0.6, k + 0.04, 0x857866);
      }
    }
    const mesh = new THREE.Mesh(g.build(), createRoadMaterial(CONCRETE, 0.35));
    (mesh.material as THREE.MeshStandardMaterial).vertexColors = true;
    (mesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
    mesh.receiveShadow = true;
    mesh.name = 'footpaths';
    this.group.add(mesh);
  }

  private buildBoulevard(): void {
    const c = this.city;
    const w = this.t.world;
    const P = c.pitch;
    const H = c.half;
    const by = c.boulevardY;
    const bz = c.boulevardZ;
    const g = new GeoBuilder();
    const x0 = -H - 30;
    const x1 = c.size + H + 30;
    // sea wall facing the beach (south = -sim y = -three z)
    g.quad(
      [
        [x1, -2, by - H],
        [x0, -2, by - H],
        [x0, bz, by - H],
        [x1, bz, by - H],
      ],
      [0, 0, -1],
      WALL,
    );
    // decorative pilasters on the sea wall
    for (let x = x0 + 40; x < x1; x += 80) g.box(x - 3, -2, by - H - 2, x + 3, bz, by - H, 0xb0a998, null, 0b110011);
    // retaining wall facing the low lots (north), with ramp openings
    const openings = w.rampColumns.map((col) => [col * P - H, col * P + H]).sort((a, b) => a[0] - b[0]);
    let cur = x0;
    const wallSeg = (a: number, b: number): void => {
      if (b - a < 1) return;
      g.quad(
        [
          [a, 0, by + H],
          [b, 0, by + H],
          [b, bz, by + H],
          [a, bz, by + H],
        ],
        [0, 0, 1],
        WALL,
      );
    };
    for (const [o0, o1] of openings) {
      wallSeg(cur, o0);
      cur = Math.max(cur, o1);
    }
    wallSeg(cur, x1);
    // ramp side walls
    for (const col of w.rampColumns) {
      const x = col * P;
      for (const s of [-1, 1]) {
        const wx = x + s * H;
        const n: [number, number, number] = [s, 0, 0];
        const pts: [number, number, number][] =
          s > 0
            ? [
                [wx, 0, -H],
                [wx, 0, by + H],
                [wx, bz, by + H],
                [wx, 0.5, -H],
              ]
            : [
                [wx, 0, by + H],
                [wx, 0, -H],
                [wx, 0.5, -H],
                [wx, bz, by + H],
              ];
        g.quad(pts, n, WALL);
      }
    }
    // the end caps of the deck
    g.box(x0 - 10, -2, by - H, x0, bz + 8, by + H, WALL, null, 0b111111);
    g.box(x1, -2, by - H, x1 + 10, bz + 8, by + H, WALL, null, 0b111111);
    // city boundary walls (low, with a fence prop on top in PropsView)
    const edge = 16;
    g.box(-H - edge, 0, by + H, -H, 14, c.northEdge + edge, 0x6f6a62, null, 0b111101);
    g.box(c.size + H, 0, by + H, c.size + H + edge, 14, c.northEdge + edge, 0x6f6a62, null, 0b111101);
    g.box(-H - edge, 0, c.northEdge, c.size + H + edge, 14, c.northEdge + edge, 0x6f6a62, null, 0b111101);

    const mat = createRoadMaterial(WALL, 0.5);
    mat.vertexColors = true;
    mat.color.set(0xffffff);
    const mesh = new THREE.Mesh(g.build(), mat);
    mesh.name = 'boulevard';
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.group.add(mesh);
  }

  private buildHills(): void {
    const c = this.city;
    const x0 = c.bounds.minX - 1500;
    const x1 = c.bounds.maxX + 1500;
    const y0 = c.northEdge + 20;
    const y1 = c.northEdge + 2200;
    const nx = 60;
    const ny = 30;
    const geo = new THREE.PlaneGeometry(x1 - x0, y1 - y0, nx, ny);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.getAttribute('position');
    const colors: number[] = [];
    const cA = srgb(0x3b4430);
    const cB = srgb(0x5a5a3e);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (x0 + x1) / 2;
      const y = pos.getZ(i) + (y0 + y1) / 2;
      const h = hillHeight(x, y, c.northEdge);
      pos.setXYZ(i, x, h - 0.5, y);
      tmp.copy(cA).lerp(cB, Math.min(1, h / 400));
      colors.push(tmp.r, tmp.g, tmp.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    // PlaneGeometry after rotateX(-90) has normals up; our y flip keeps winding correct
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    mesh.name = 'hills';
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }
}

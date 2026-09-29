// Kentucky River Circuit: spline, lookups and track-side geometry.
import * as THREE from 'three';
import { LANES, QUALITY } from './config.js';
import * as TX from './textures.js';

// [x, z, elevation]. Clockwise. s = 0 is the start/finish line on the main straight.
export const CONTROL = [
  [-100, 0, 0], [150, 0, 0], [400, 0, 0], [485, 12, 0], [505, 75, 1], [455, 125, 4],
  [360, 190, 9], [330, 270, 13], [380, 340, 16], [440, 420, 19], [420, 510, 19], [340, 575, 16],
  [220, 600, 12], [80, 570, 8], [20, 490, 6], [70, 410, 5], [40, 330, 4],
  [-40, 300, 3], [-100, 318, 3], [-160, 300, 3], [-260, 340, 2], [-340, 420, 2], [-440, 425, 2], [-520, 350, 1],
  [-560, 220, 0], [-520, 90, 0], [-440, 20, 0], [-300, 2, 0],
];

// Named sections for HUD call-outs and scenery (arc-length ranges on this layout).
export const SECTIONS = [
  { s0: 540, s1: 720, name: 'Lawrenceburg Hairpin', num: 1 },
  { s0: 790, s1: 1000, name: 'Ridge Esses', num: 2 },
  { s0: 1060, s1: 1230, name: 'The Palisades', num: 3 },
  { s0: 1260, s1: 1600, name: 'Warehouse Row', num: 4 },
  { s0: 1630, s1: 1740, name: 'Tyrone Hairpin', num: 5 },
  { s0: 1760, s1: 1990, name: 'Mill Creek', num: 6 },
  { s0: 2000, s1: 2110, name: 'Quarry Chicane', num: 7 },
  { s0: 2150, s1: 2420, name: 'Bluegrass Bend', num: 8 },
  { s0: 2430, s1: 2960, name: 'Home Sweep', num: 9 },
];
// Timing sectors end at these arc lengths (last = finish line).
export const SECTORS = [1060, 2000];

const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

function smoothCircular(arr, radius, passes = 1) {
  const N = arr.length;
  let a = Float64Array.from(arr);
  for (let p = 0; p < passes; p++) {
    const b = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += a[(i + k + N) % N];
      b[i] = sum / (2 * radius + 1);
    }
    a = b;
  }
  return a;
}

export class Track {
  constructor() {
    const pts = CONTROL.map(([x, z, y]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    curve.arcLengthDivisions = 6000;
    const L = curve.getLength();
    const N = Math.round(L / 2);
    const sp = curve.getSpacedPoints(N);
    this.N = N;
    this.length = L;
    this.ds = L / N;

    const X = new Float64Array(N), Z = new Float64Array(N);
    let Y = new Float64Array(N);
    for (let i = 0; i < N; i++) { X[i] = sp[i].x; Y[i] = sp[i].y; Z[i] = sp[i].z; }
    Y = smoothCircular(Y, 8, 3);

    const TXa = new Float64Array(N), TZa = new Float64Array(N), H = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const a = (i - 1 + N) % N, b = (i + 1) % N;
      let tx = X[b] - X[a], tz = Z[b] - Z[a];
      const l = Math.hypot(tx, tz) || 1;
      TXa[i] = tx / l; TZa[i] = tz / l;
      H[i] = Math.atan2(TXa[i], TZa[i]);
    }
    let K = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const a = (i - 2 + N) % N, b = (i + 2) % N;
      K[i] = -wrap(H[b] - H[a]) / (4 * this.ds); // + = right-hand turn
    }
    K = smoothCircular(K, 4, 2);
    const SL = new Float64Array(N);
    for (let i = 0; i < N; i++) SL[i] = (Y[(i + 1) % N] - Y[(i - 1 + N) % N]) / (2 * this.ds);

    Object.assign(this, { X, Y, Z, TX: TXa, TZ: TZa, K, SL });

    // Kerb / gravel masks and wall limits.
    const absK = K.map(Math.abs);
    const dilate = (mask, r) => {
      const out = new Uint8Array(N);
      for (let i = 0; i < N; i++) if (mask[i]) for (let k = -r; k <= r; k++) out[(i + k + N) % N] = 1;
      return out;
    };
    this.kerb = dilate(absK.map(k => k > 1 / 240 ? 1 : 0), 6);
    this.gravel = dilate(absK.map(k => k > 1 / 170 ? 1 : 0), 14);
    // Which side the corner is on (sign of the nearest strong curvature), smoothed.
    const side = smoothCircular(K, 20, 1);
    this.turnSide = new Int8Array(N);
    for (let i = 0; i < N; i++) this.turnSide[i] = side[i] >= 0 ? 1 : -1;

    // Inside limits so ribbons never fold over the centre of a tight corner.
    const lim = new Float64Array(N);
    for (let i = 0; i < N; i++) lim[i] = Math.min(LANES.wall, 0.85 / Math.max(absK[i], 1e-4));
    const limMin = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let m = LANES.wall;
      for (let k = -12; k <= 12; k++) m = Math.min(m, lim[(i + k + N) % N]);
      limMin[i] = m;
    }
    this.wallR = new Float64Array(N); this.wallL = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      // right-hand corner -> inside is +x (right)
      if (K[i] > 0) { this.wallR[i] = limMin[i]; this.wallL[i] = LANES.wall; }
      else { this.wallL[i] = limMin[i]; this.wallR[i] = LANES.wall; }
    }
    this.wallR = smoothCircular(this.wallR, 6, 2);
    this.wallL = smoothCircular(this.wallL, 6, 2);

    this.corners = this.#findCorners();
    this.#buildGrid();
  }

  #findCorners() {
    const { N, K } = this;
    const out = [];
    let i = 0;
    // Walk the lap; a corner is a run with |k| > 1/260.
    const on = (j) => Math.abs(K[(j + N) % N]) > 1 / 260;
    let start = 0; while (on(start)) start++;
    for (let n = 0; n < N; n++) {
      const j = (start + n) % N;
      if (on(j) && !on(j - 1)) i = j;
      if (on(j) && !on(j + 1)) {
        let peak = i, pk = 0;
        for (let m = i; m !== (j + 1) % N; m = (m + 1) % N) if (Math.abs(K[m]) > pk) { pk = Math.abs(K[m]); peak = m; }
        const len = ((j - i + N) % N) * this.ds;
        if (len > 25) out.push({ s0: i * this.ds, s1: j * this.ds, apex: peak * this.ds, dir: K[peak] > 0 ? 'R' : 'L', radius: 1 / pk });
      }
    }
    out.sort((a, b) => a.s0 - b.s0);
    // Merge very close corners (esses/chicane pieces count as one named complex).
    const merged = [];
    for (const c of out) {
      const prev = merged[merged.length - 1];
      if (prev && c.s0 - prev.s1 < 40) { prev.s1 = c.s1; prev.radius = Math.min(prev.radius, c.radius); }
      else merged.push({ ...c });
    }
    return merged;
  }

  #buildGrid() {
    this.cell = 50;
    this.grid = new Map();
    for (let i = 0; i < this.N; i++) {
      const k = `${Math.floor(this.X[i] / this.cell)},${Math.floor(this.Z[i] / this.cell)}`;
      if (!this.grid.has(k)) this.grid.set(k, []);
      this.grid.get(k).push(i);
    }
  }

  // Nearest point on the centreline to world (x, z). Returns distance, arc length, lateral sign, elevation.
  nearest(x, z, radiusCells = 2, out = {}) {
    const cx = Math.floor(x / this.cell), cz = Math.floor(z / this.cell);
    let best = Infinity, bi = -1;
    for (let a = -radiusCells; a <= radiusCells; a++) for (let b = -radiusCells; b <= radiusCells; b++) {
      const list = this.grid.get(`${cx + a},${cz + b}`);
      if (!list) continue;
      for (const i of list) {
        const dx = x - this.X[i], dz = z - this.Z[i];
        const d = dx * dx + dz * dz;
        if (d < best) { best = d; bi = i; }
      }
    }
    if (bi < 0) { out.d = Infinity; return out; }
    // refine on the neighbouring segments
    const N = this.N;
    let bd = Infinity, bs = 0, by = 0, blat = 0;
    for (const [i0, i1] of [[(bi - 1 + N) % N, bi], [bi, (bi + 1) % N]]) {
      const ax = this.X[i0], az = this.Z[i0], ex = this.X[i1] - ax, ez = this.Z[i1] - az;
      const l2 = ex * ex + ez * ez;
      let t = ((x - ax) * ex + (z - az) * ez) / l2; t = Math.max(0, Math.min(1, t));
      const px = ax + ex * t, pz = az + ez * t;
      const d = Math.hypot(x - px, z - pz);
      if (d < bd) {
        bd = d;
        bs = (i0 + t) * this.ds;
        by = this.Y[i0] + (this.Y[i1] - this.Y[i0]) * t;
        // lateral sign: right = (-tz, tx)
        blat = (x - px) * -this.TZ[i0] + (z - pz) * this.TX[i0];
      }
    }
    out.d = bd; out.s = bs; out.y = by; out.lat = blat; out.i = bi;
    return out;
  }

  wrapS(s) { const L = this.length; return ((s % L) + L) % L; }

  // Interpolated frame at arc length s.
  frame(s, o = {}) {
    s = this.wrapS(s);
    const f = s / this.ds;
    const i0 = Math.floor(f) % this.N, i1 = (i0 + 1) % this.N, t = f - Math.floor(f);
    const L = (a) => a[i0] + (a[i1] - a[i0]) * t;
    o.x = L(this.X); o.y = L(this.Y); o.z = L(this.Z);
    let tx = L(this.TX), tz = L(this.TZ);
    const l = Math.hypot(tx, tz); tx /= l; tz /= l;
    o.tx = tx; o.tz = tz; o.rx = -tz; o.rz = tx;
    o.k = L(this.K); o.slope = L(this.SL);
    o.wallL = L(this.wallL); o.wallR = L(this.wallR);
    o.i = i0;
    return o;
  }

  toWorld(s, lat, v = new THREE.Vector3(), up = 0) {
    const f = this.frame(s, _f);
    return v.set(f.x + f.rx * lat, f.y + up, f.z + f.rz * lat);
  }

  // Surface under lateral offset x at arc length s.
  surface(s, x, o = {}) {
    const i = Math.floor(this.wrapS(s) / this.ds) % this.N;
    const ax = Math.abs(x);
    const outsideSide = -this.turnSide[i];
    const onOutside = Math.sign(x) === outsideSide;
    if (ax <= LANES.road) { o.type = 'road'; o.grip = 1; o.drag = 0; }
    else if (ax <= LANES.kerb && this.kerb[i]) { o.type = 'kerb'; o.grip = 0.94; o.drag = 0.2; }
    else if (ax <= LANES.runoff) { o.type = 'runoff'; o.grip = 0.86; o.drag = 0.6; }
    else if (this.gravel[i] && onOutside) { o.type = 'gravel'; o.grip = 0.35; o.drag = 9; }
    else { o.type = 'grass'; o.grip = 0.5; o.drag = 5; }
    o.wallL = this.wallL[i]; o.wallR = this.wallR[i];
    return o;
  }

  sectionAt(s) {
    s = this.wrapS(s);
    for (const c of SECTIONS) if (s >= c.s0 && s <= c.s1) return c;
    return null;
  }
}
const _f = {};

// ---------------------------------------------------------------------------
// Geometry

function maskRanges(N, mask) {
  const out = [];
  if (mask.every(v => v)) return [[0, N - 1]];
  let start = 0; while (mask[start]) start++;
  let run = -1;
  for (let n = 0; n <= N; n++) {
    const i = (start + n) % N;
    const on = n < N && mask[i];
    if (on && run < 0) run = start + n;
    if (!on && run >= 0) { out.push([run, start + n - 1]); run = -1; }
  }
  return out;
}

// Builds a strip along [i0..i1] (indices may exceed N; wrapped). fn(i, which) -> [x, y, z] in world.
// Vertex 0 must be left of (or below) vertex 1 so faces point up (or toward -right for walls).
// wall: u runs along the track, v up the wall. mirror: flip u so text reads correctly from the other side.
function strip(track, i0, i1, fn, scale, { wall = false, mirror = false } = {}) {
  const N = track.N;
  const count = Math.min(i1 - i0 + 1, N) + (i1 - i0 + 1 >= N ? 1 : 0);
  const pos = new Float32Array(count * 6), uv = new Float32Array(count * 4);
  const s0 = i0 * track.ds;
  for (let n = 0; n < count; n++) {
    const i = (i0 + n) % N;
    pos.set(fn(i, 0), n * 6); pos.set(fn(i, 1), n * 6 + 3);
    const along = (s0 + n * track.ds) / scale * (mirror ? -1 : 1);
    if (wall) uv.set([along, 0, along, 1], n * 4);
    else uv.set([0, along, 1, along], n * 4);
  }
  const idx = [];
  for (let n = 0; n < count - 1; n++) {
    const a = n * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function merge(geoms) {
  // Lightweight merge for non-indexed + indexed strips with position/uv only.
  let vCount = 0, iCount = 0;
  for (const g of geoms) { vCount += g.attributes.position.count; iCount += g.index.count; }
  const pos = new Float32Array(vCount * 3), uv = new Float32Array(vCount * 2), nor = new Float32Array(vCount * 3);
  const idx = new Uint32Array(iCount);
  let vo = 0, io = 0;
  for (const g of geoms) {
    pos.set(g.attributes.position.array, vo * 3);
    uv.set(g.attributes.uv.array, vo * 2);
    nor.set(g.attributes.normal.array, vo * 3);
    const gi = g.index.array;
    for (let k = 0; k < gi.length; k++) idx[io + k] = gi[k] + vo;
    vo += g.attributes.position.count; io += gi.length;
    g.dispose();
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  m.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  m.setIndex(new THREE.BufferAttribute(idx, 1));
  return m;
}

export function buildTrackMeshes(track) {
  const group = new THREE.Group();
  const N = track.N;
  const P = (i, lat, up = 0) => {
    const rx = -track.TZ[i], rz = track.TX[i];
    return [track.X[i] + rx * lat, track.Y[i] + up, track.Z[i] + rz * lat];
  };
  const all = new Uint8Array(N).fill(1);

  // Road
  const road = strip(track, 0, N - 1, (i, w) => P(i, w ? LANES.road : -LANES.road, 0.02), 26);
  const asp = TX.asphaltSet(QUALITY.texScale);
  const roadMat = new THREE.MeshStandardMaterial({
    map: asp.map, normalMap: asp.normalMap, normalScale: new THREE.Vector2(0.25, 0.25),
    roughnessMap: asp.roughnessMap, roughness: 1, metalness: 0.0, envMapIntensity: 1.0,
  });
  const roadMesh = new THREE.Mesh(road, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // Run-off (both sides, clamped on the inside of tight corners)
  const runL = strip(track, 0, N - 1, (i, w) => P(i, w ? -LANES.road : -Math.min(LANES.runoff, track.wallL[i]), 0.0), 12);
  const runR = strip(track, 0, N - 1, (i, w) => P(i, w ? Math.min(LANES.runoff, track.wallR[i]) : LANES.road, 0.0), 12);
  const runMesh = new THREE.Mesh(merge([runL, runR]), new THREE.MeshStandardMaterial({ map: TX.runoffTexture(), roughness: 0.9 }));
  runMesh.receiveShadow = true;
  group.add(runMesh);

  // Kerbs (raised a touch)
  const kerbGeoms = [];
  for (const [a, b] of maskRanges(N, track.kerb)) {
    kerbGeoms.push(strip(track, a, b, (i, w) => P(i, w ? -LANES.road + 0.05 : -LANES.kerb, 0.045), 2.4));
    kerbGeoms.push(strip(track, a, b, (i, w) => P(i, w ? LANES.kerb : LANES.road - 0.05, 0.045), 2.4));
  }
  if (kerbGeoms.length) {
    const kerbMesh = new THREE.Mesh(merge(kerbGeoms), new THREE.MeshStandardMaterial({ map: TX.kerbTexture(), roughness: 0.55 }));
    kerbMesh.receiveShadow = true;
    group.add(kerbMesh);
  }

  // Grass verges and gravel traps
  const grassG = [], gravelG = [];
  for (const sideSign of [-1, 1]) {
    const gravelMask = new Uint8Array(N);
    for (let i = 0; i < N; i++) gravelMask[i] = track.gravel[i] && (-track.turnSide[i] === sideSign) ? 1 : 0;
    const grassMask = gravelMask.map(v => 1 - v);
    const wall = sideSign > 0 ? track.wallR : track.wallL;
    const mk = (i, w) => {
      const inner = Math.min(LANES.runoff, wall[i]);
      const outer = wall[i] + 1.5;
      return sideSign > 0 ? P(i, w ? outer : inner, -0.01) : P(i, w ? -inner : -outer, -0.01);
    };
    for (const [a, b] of maskRanges(N, gravelMask)) gravelG.push(strip(track, a, b + 1, mk, 10));
    for (const [a, b] of maskRanges(N, grassMask)) grassG.push(strip(track, a, b + 1, mk, 18));
  }
  const grassMesh = new THREE.Mesh(merge(grassG), new THREE.MeshStandardMaterial({ map: TX.grassTexture(QUALITY.texScale), roughness: 0.95 }));
  grassMesh.receiveShadow = true;
  group.add(grassMesh);
  if (gravelG.length) {
    const gm = new THREE.Mesh(merge(gravelG), new THREE.MeshStandardMaterial({ map: TX.gravelTexture(), roughness: 1 }));
    gm.receiveShadow = true;
    group.add(gm);
  }

  // Barriers: branded air-fence on corner outsides, armco elsewhere; catch-fence above.
  const armG = [], airFront = [], airTop = [], fenceG = [];
  const postPts = [];
  for (const sideSign of [-1, 1]) {
    const wall = sideSign > 0 ? track.wallR : track.wallL;
    const airMask = new Uint8Array(N), armMask = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const outside = -track.turnSide[i] === sideSign;
      const ok = wall[i] > 18; // skip barrier visuals deep inside hairpins
      airMask[i] = ok && outside && track.gravel[i] ? 1 : 0;
      armMask[i] = ok && !airMask[i] ? 1 : 0;
    }
    const at = (i, lat, up) => P(i, sideSign * lat, up);
    for (const [a, b] of maskRanges(N, armMask)) {
      armG.push(strip(track, a, b + 1, (i, w) => at(i, wall[i], w ? 1.0 : 0.35), 4, { wall: true }));
    }
    for (const [a, b] of maskRanges(N, airMask)) {
      airFront.push(strip(track, a, b + 1, (i, w) => at(i, wall[i] - 0.5, w ? 1.5 : 0.0), 12, { wall: true, mirror: sideSign < 0 }));
      airTop.push(strip(track, a, b + 1, (i, w) => at(i, wall[i] + ((w ? 1 : -1) * sideSign > 0 ? 0.6 : -0.5), 1.5), 12));
    }
    const fenceMask = new Uint8Array(N);
    for (let i = 0; i < N; i++) fenceMask[i] = wall[i] > 18 ? 1 : 0;
    for (const [a, b] of maskRanges(N, fenceMask)) {
      fenceG.push(strip(track, a, b + 1, (i, w) => at(i, wall[i] + 0.8, w ? 4.6 : 1.0), 3, { wall: true }));
      for (let i = a; i <= b; i += 3) postPts.push(at(i % N, wall[i % N] + 0.8, 0));
    }
  }
  const armMat = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 0.85, roughness: 0.32, side: THREE.DoubleSide });
  if (armG.length) group.add(new THREE.Mesh(merge(armG), armMat));
  if (airFront.length) {
    const airTex = TX.airfenceTexture();
    const af = new THREE.Mesh(merge(airFront), new THREE.MeshStandardMaterial({ map: airTex, roughness: 0.6, side: THREE.DoubleSide }));
    af.castShadow = true;
    group.add(af);
    group.add(new THREE.Mesh(merge(airTop), new THREE.MeshStandardMaterial({ color: 0x6d171c, roughness: 0.6, side: THREE.DoubleSide })));
  }
  if (fenceG.length) {
    const fenceTex = TX.fenceTexture();
    const fm = new THREE.Mesh(merge(fenceG), new THREE.MeshStandardMaterial({
      map: fenceTex, alphaTest: 0.35, transparent: false, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6,
    }));
    group.add(fm);
    const post = new THREE.CylinderGeometry(0.05, 0.05, 4.6, 5);
    post.translate(0, 2.3, 0);
    const posts = new THREE.InstancedMesh(post, new THREE.MeshStandardMaterial({ color: 0x8c8f93, metalness: 0.7, roughness: 0.4 }), postPts.length);
    const m = new THREE.Matrix4();
    postPts.forEach((p, n) => { m.makeTranslation(p[0], p[1], p[2]); posts.setMatrixAt(n, m); });
    group.add(posts);
  }

  // Start/finish chequer + grid box
  const chequer = new THREE.Mesh(
    new THREE.PlaneGeometry(LANES.road * 2, 1.6),
    new THREE.MeshStandardMaterial({ map: TX.chequerTexture(), roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  const f0 = track.frame(0);
  chequer.rotation.x = -Math.PI / 2;
  chequer.rotation.z = Math.atan2(f0.tx, f0.tz) + Math.PI / 2;
  chequer.position.set(f0.x, f0.y + 0.03, f0.z);
  chequer.receiveShadow = true;
  group.add(chequer);

  const gridMat = new THREE.MeshBasicMaterial({ color: 0xe9e4d8, polygonOffset: true, polygonOffsetFactor: -2 });
  for (let n = 0; n < 4; n++) {
    const s = track.length - 14 - n * 9;
    const lat = n % 2 ? 3.2 : -3.2;
    const fr = track.frame(s);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.25), gridMat);
    bar.rotation.x = -Math.PI / 2;
    bar.rotation.z = Math.atan2(fr.tx, fr.tz) + Math.PI / 2;
    const p = track.toWorld(s, lat);
    bar.position.set(p.x, p.y + 0.03, p.z);
    group.add(bar);
  }

  return group;
}

// Rubber laid down on the racing line, heavier into braking zones and apexes, plus skid marks.
export function buildRubber(track, ap) {
  const N = track.N, ds = track.ds;
  const P = (i, lat, up) => {
    const rx = -track.TZ[i], rz = track.TX[i];
    return [track.X[i] + rx * lat, track.Y[i] + up, track.Z[i] + rz * lat];
  };
  const lim = LANES.road - 0.35;
  const cl = (v) => Math.max(-lim, Math.min(lim, v));
  const pos = [], uv = [], col = [], idx = [];
  const quad = (i, xa, xb, ua, ub, v, a) => {
    pos.push(...P(i, cl(xa), 0.03), ...P(i, cl(xb), 0.03));
    uv.push(ua, v, ub, v);
    col.push(1, 1, 1, a, 1, 1, 1, a);
  };
  const link = (n0, count) => {
    for (let n = 0; n < count - 1; n++) {
      const a = n0 + n * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
  };
  // Racing-line groove
  const inten = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const brake = Math.max(0, Math.min(1, (ap.vmax[i] - ap.vmax[(i + 8) % N]) / 5));
    const corner = Math.max(0, Math.min(1, Math.abs(track.K[i]) * 60));
    inten[i] = Math.min(1, 0.35 + 0.35 * corner + 0.45 * brake);
  }
  const sm = new Float32Array(N);
  for (let i = 0; i < N; i++) { let a = 0; for (let j = -6; j <= 6; j++) a += inten[(i + j + N) % N]; sm[i] = a / 13; }
  const n0 = pos.length / 3;
  for (let n = 0; n <= N; n++) {
    const i = n % N, x = ap.line[i];
    quad(i, x - 1.9, x + 1.9, 0, 0.75, n * ds / 40, sm[i]);
  }
  link(n0, N + 1);
  // Skid marks where the braking is hardest
  const r = TX.rng(99);
  for (let i = 0; i < N; i++) {
    const drop = ap.vmax[i] - ap.vmax[(i + 10) % N];
    if (drop < 3.5 || r() > 0.06) continue;
    const len = Math.round((10 + r() * 30) / ds), off = (r() - 0.5) * 1.4, wv = r() * 6, amp = 0.1 + r() * 0.25;
    const start = pos.length / 3;
    for (let n = 0; n <= len; n++) {
      const j = (i + n) % N, t = n / len;
      const x = ap.line[j] + off + Math.sin(t * wv) * amp;
      const a = Math.min(1, t * 6) * Math.min(1, (1 - t) * 3) * (0.5 + r() * 0.15);
      quad(j, x - 0.08, x + 0.08, 0.82, 0.96, n * ds / 20, a);
    }
    link(start, len + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    map: TX.rubberTexture(), vertexColors: true, transparent: true, depthWrite: false,
    roughness: 0.5, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;
  return mesh;
}

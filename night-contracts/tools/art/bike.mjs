// Bike: generated GLB (Tripo, see ASSETS.md) -> assets/models/bike/bike.glb.
// Scales to metres, stands it on the ground, cuts the wheels out into wheel_f /
// wheel_r nodes pivoting on their axles, closes the tyres with a rubber core, and
// adds seat, light and rider mount points.
// usage: node tools/art/bike.mjs raw.glb [out.glb]
import { bakeNodes, countTris, darkTexel, finish, hsv, io, mat, paintMetalRough, plainMaterials, shrinkTextures, splitPrimitive, transformAll, uvMask } from './lib.mjs';

const [src, out = 'assets/models/bike/bike.glb'] = process.argv.slice(2);
// measured on the raw model (model units, +Z forward, ground at y = -0.2723)
const S = 2.056; // wheelbase 0.678 units -> 1.39 m
const GROUND = -0.2723;
const m = (x, y, z) => [x * S, (y - GROUND) * S, z * S];
// Centres and tread radii are circles fitted to each tyre's tread (dark texels near the
// centre plane, outliers dropped); a wheel spun off centre sinks into the road and lifts.
// `tyre` is the rubber core in metres from the axle: the tread has gaps (none at all on
// top of the front tyre), and a spinning wheel carries them round to where they show.
const WHEELS = [
  { name: 'wheel_f', centre: m(0, -0.1256, 0.3435), tread: 0.1458 * S, halfWidth: 0.046 * S, tyre: { inner: 0.235, half: 0.08 } },
  { name: 'wheel_r', centre: m(0, -0.1116, -0.3331), tread: 0.1592 * S, halfWidth: 0.06 * S, tyre: { inner: 0.235, half: 0.105 } },
];
const POINTS = {
  seat: m(0, 0.145, -0.13),
  light_head_l: m(0, 0.02, 0.385),
  light_tail_l: m(0, 0.212, -0.382),
  grip_l: m(0.12, 0.076, 0.19),
  grip_r: m(-0.12, 0.076, 0.19),
  peg_l: m(0.13, -0.083, -0.145),
  peg_r: m(-0.13, -0.083, -0.145),
};

const doc = await io.read(src);
const prims = bakeNodes(doc);
if (prims.length !== 1) throw new Error(`expected one primitive, got ${prims.length}`);
transformAll(prims, mat.mul(mat.translate(0, -GROUND * S, 0), mat.scale(S)));
const pos = prims[0].getAttribute('POSITION');
const corner = [0, 0, 0];
/** Is a point inside the tyre: within the tread, and in the outer tenth within its rounded shoulders? */
function inTyre(w, x, y, z) {
  const r = Math.hypot(z - w.centre[2], y - w.centre[1]) / w.tread;
  if (r >= 1.015) return false;
  const k = Math.max(0, (r - 0.9) / 0.12);
  return Math.abs(x) < w.halfWidth * Math.sqrt(Math.max(0, 1 - k * k));
}
// a triangle spins with a wheel when every corner is inside the tyre; the mudguard
// hugging the tread and its edges round the shoulders stay with the body
const parts = splitPrimitive(doc, prims[0], (x, y, z, i0, i1, i2) => {
  for (const w of WHEELS) {
    if (!inTyre(w, x, y, z)) continue;
    if ([i0, i1, i2].every((i) => (pos.getElement(i, corner), inTyre(w, ...corner)))) return w.name;
  }
  return 'body';
});

const root = doc.getRoot();
for (const s of root.listScenes()) for (const n of s.listChildren()) n.dispose();
for (const mesh of root.listMeshes()) mesh.dispose();
const scene = root.listScenes()[0] ?? doc.createScene('scene');
const bike = doc.createNode('bike');
scene.addChild(bike);
bike.addChild(doc.createNode('body').setMesh(doc.createMesh('body').addPrimitive(parts.body)));
for (const w of WHEELS) {
  const p = parts[w.name];
  if (!p) throw new Error(`no triangles in ${w.name}`);
  transformAll([p], mat.translate(-w.centre[0], -w.centre[1], -w.centre[2]));
  roundTyre(p, w.tread);
  bike.addChild(doc.createNode(w.name).setTranslation(w.centre).setMesh(doc.createMesh(w.name).addPrimitive(p)));
}
for (const [name, p] of Object.entries(POINTS)) bike.addChild(doc.createNode(name).setTranslation(p));
// The generated metal map is patchy mirror metal; paint one from the colours
// instead so the black paint, gold forks and red stripes read as they should.
const tyres = uvMask();
for (const w of WHEELS) tyres.paint(parts[w.name], (x, y, z) => Math.hypot(y, z) > w.tread * 0.75);
const rubber = await darkTexel(parts.wheel_f.getMaterial(), tyres);
for (const w of WHEELS) addTyreCore(parts[w.name], { ...w.tyre, crown: w.tread - 0.003 }, rubber);
plainMaterials(doc);
for (const mtl of root.listMaterials()) {
  await paintMetalRough(doc, mtl, (r, g, b, u, v) => {
    const [hue, sat, val] = hsv(r, g, b);
    if (val < 0.3 && tyres.at(u, v)) return [0, 0.85]; // rubber
    if (sat > 0.3 && val > 0.3 && hue > 25 && hue < 65) return [1, 0.3]; // gold forks, rims, calipers
    if (sat > 0.45 && val > 0.25 && (hue < 20 || hue > 340)) return [0, 0.3]; // red paint
    if (sat < 0.2 && val > 0.45) return [0.9, 0.3]; // bright metal: discs, frame, exhaust
    if (sat < 0.2 && val > 0.22) return [0.6, 0.4]; // darker metal
    return [0, 0.3]; // glossy black paint and plastics
  });
}
await shrinkTextures(doc, 1024);
await finish(doc, out);
console.log(`rubber core uv ${rubber.map((v) => v.toFixed(4)).join(', ')}`);
console.log(`wrote ${out}: body ${countTris(parts.body)} tris, wheels ${WHEELS.map((w) => countTris(parts[w.name])).join(' + ')}`);

/** Pull anything past the tread back onto it, so nothing pokes out below the tyre as it turns. */
function roundTyre(prim, tread) {
  const pos = prim.getAttribute('POSITION');
  const v = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, v);
    const r = Math.hypot(v[1], v[2]);
    if (r > tread) pos.setElement(i, [v[0], (v[1] * tread) / r, (v[2] * tread) / r]);
  }
}

/**
 * Append a closed rubber ring inside a tyre (axle at the origin, rolling about x), an
 * elliptical section from `inner` to `crown` and `half` either side, all on one dark
 * texel. It sits just under the tread, so it only shows through the tread's gaps.
 */
function addTyreCore(prim, { inner, crown, half }, uv, seg = 48, ring = 16) {
  const rc = (inner + crown) / 2, a = (crown - inner) / 2;
  const P = [], N = [], T = [], I = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t);
    for (let j = 0; j < ring; j++) {
      const p = (j / ring) * Math.PI * 2, cp = Math.cos(p), sp = Math.sin(p);
      const r = rc + a * cp;
      P.push(half * sp, r * st, r * ct);
      const nr = cp / a, nx = sp / half, l = Math.hypot(nr, nx);
      N.push(nx / l, (nr / l) * st, (nr / l) * ct);
      T.push(uv[0], uv[1]);
    }
  }
  const base = prim.getAttribute('POSITION').getCount();
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < ring; j++) {
      const a0 = base + i * ring + j, a1 = base + i * ring + ((j + 1) % ring);
      const b0 = base + ((i + 1) % seg) * ring + j, b1 = base + ((i + 1) % seg) * ring + ((j + 1) % ring);
      I.push(a0, a1, b0, a1, b1, b0);
    }
  }
  const buffer = doc.getRoot().listBuffers()[0];
  for (const [semantic, extra] of [['POSITION', P], ['NORMAL', N], ['TEXCOORD_0', T]]) {
    const old = prim.getAttribute(semantic);
    const was = old.getArray();
    if (!(was instanceof Float32Array)) throw new Error(`${semantic} is not float`);
    const next = new Float32Array(was.length + extra.length);
    next.set(was);
    next.set(extra, was.length);
    prim.setAttribute(semantic, doc.createAccessor().setType(old.getType()).setArray(next).setBuffer(buffer));
  }
  const was = prim.getIndices().getArray();
  const next = new Uint32Array(was.length + I.length);
  next.set(was);
  next.set(I, was.length);
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(next).setBuffer(buffer));
}

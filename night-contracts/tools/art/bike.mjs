// Bike: generated GLB (Tripo, see ASSETS.md) -> assets/models/bike/bike.glb.
// Scales to metres, stands it on the ground, cuts the wheels out into wheel_f /
// wheel_r nodes pivoting on their axles, and adds seat, light and rider mount points.
// usage: node tools/art/bike.mjs raw.glb [out.glb]
import { bakeNodes, countTris, finish, hsv, io, mat, paintMetalRough, plainMaterials, shrinkTextures, splitPrimitive, transformAll, uvMask } from './lib.mjs';

const [src, out = 'assets/models/bike/bike.glb'] = process.argv.slice(2);
// measured on the raw model (model units, +Z forward, ground at y = -0.2723)
const S = 2.056; // wheelbase 0.678 units -> 1.39 m
const GROUND = -0.2723;
const m = (x, y, z) => [x * S, (y - GROUND) * S, z * S];
const WHEELS = [
  { name: 'wheel_f', centre: m(0, -0.122, 0.345), r: 0.15 * S * 1.01, halfWidth: 0.046 * S },
  { name: 'wheel_r', centre: m(0, -0.115, -0.333), r: 0.157 * S * 1.01, halfWidth: 0.06 * S },
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
const parts = splitPrimitive(doc, prims[0], (x, y, z) => {
  for (const w of WHEELS) {
    const dz = z - w.centre[2], dy = y - w.centre[1];
    if (Math.abs(x) < w.halfWidth && dz * dz + dy * dy < w.r * w.r) return w.name;
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
  bike.addChild(doc.createNode(w.name).setTranslation(w.centre).setMesh(doc.createMesh(w.name).addPrimitive(p)));
}
for (const [name, p] of Object.entries(POINTS)) bike.addChild(doc.createNode(name).setTranslation(p));
// The generated metal map is patchy mirror metal; paint one from the colours
// instead so the black paint, gold forks and red stripes read as they should.
const tyres = uvMask();
for (const w of WHEELS) tyres.paint(parts[w.name], (x, y, z) => Math.hypot(y, z) > w.r * 0.75);
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
console.log(`wrote ${out}: body ${countTris(parts.body)} tris, wheels ${WHEELS.map((w) => countTris(parts[w.name])).join(' + ')}`);

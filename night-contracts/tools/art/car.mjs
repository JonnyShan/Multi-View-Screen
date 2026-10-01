// Cars: generated GLB (see ASSETS.md) -> assets/models/cars/<file>.glb.
// Scales to metres with the axles centred on the origin, cuts the four wheels
// out, keeps the front-left one as a template (`wheel`, axle at the origin,
// outer face towards +x), marks the axles (`wheel_fl` ...) and lamps, thins the
// body out for instancing, and adds far versions (`body_lod1`, `wheel_lod1`).
// usage: node tools/art/car.mjs <model> raw.glb [out.glb]
import { MeshoptSimplifier } from 'meshoptimizer';
import { compactPrimitive, simplifyPrimitive, weld } from '@gltf-transform/functions';
import { countTris, finish, io, lumaSampler, mat, plainMaterials, shrinkTextures, splitPrimitive, transformAll } from './lib.mjs';

/**
 * Measured on each raw model with tools/art/measure.mjs, in its own units after
 * `rotY` (+Z forward, ground at y = 0). `scale` takes the length to the car's
 * physics length (tuning `car.specs`).
 */
const CARS = {
  sedan: {
    file: 'sedan',
    scale: 4.057, // 1.171 long -> 4.75 m, the sedan's physics length
    centreX: -0.003,
    axleFront: 0.3895,
    axleRear: -0.294,
    wheel: { r: 0.1, y: 0.1, x: 0.19, xIn: 0.145 },
    head: [0.17, 0.145, 0.575],
    tail: [0.17, 0.2, -0.545],
    bodyTris: 6500,
  },
  suv: {
    file: 'suv',
    scale: 4.286, // 1.1666 -> 5 m
    centreX: 0.0028,
    axleFront: 0.3285,
    axleRear: -0.3399,
    wheel: { r: 0.1203, y: 0.1203, x: 0.1955, xIn: 0.1414 },
    head: [0.187, 0.272, 0.503],
    tail: [0.21, 0.251, -0.586],
    bodyTris: 6500,
  },
  limo: {
    file: 'limo',
    rotY: Math.PI / 2, // generated facing -X
    scale: 6.0935, // 1.1898 -> 7.25 m
    centreX: 0.0077,
    axleFront: 0.457,
    axleRear: -0.3934,
    wheel: { r: 0.0689, y: 0.0689, x: 0.1251, xIn: 0.0941 },
    head: [0.12, 0.096, 0.569],
    tail: [0.127, 0.134, -0.581],
    bodyTris: 8000,
  },
  police: {
    file: 'police',
    scale: 4.178, // 1.1669 -> 4.875 m
    centreX: -0.0035,
    axleFront: 0.3203,
    axleRear: -0.3213,
    wheel: { r: 0.1068, y: 0.1068, x: 0.1867, xIn: 0.1386 },
    head: [0.167, 0.162, 0.51],
    tail: [0.176, 0.227, -0.563],
    bar: [0.093, 0.385, -0.082], // roof light bar, near its left end, on top
    bodyTris: 6500,
  },
  hatch: {
    file: 'civ-hatch',
    scale: 3.4765, // 1.1506 -> 4 m
    centreX: -0.0052,
    axleFront: 0.3167,
    axleRear: -0.3864,
    wheel: { r: 0.1167, y: 0.1167, x: 0.2084, xIn: 0.1559 },
    head: [0.189, 0.215, 0.515],
    tail: [0.195, 0.268, -0.544],
    bodyTris: 6000,
  },
  ute: {
    file: 'civ-ute',
    scale: 4.5084, // 1.1645 -> 5.25 m
    centreX: 0.0008,
    axleFront: 0.3493,
    axleRear: -0.3378,
    wheel: { r: 0.1085, y: 0.1085, x: 0.1653, xIn: 0.1165 },
    head: [0.166, 0.238, 0.514],
    tail: [0.187, 0.224, -0.587],
    bodyTris: 6500,
  },
  van: {
    file: 'civ-van',
    scale: 4.6435, // 1.1306 -> 5.25 m
    centreX: -0.0001,
    axleFront: 0.33,
    axleRear: -0.3708,
    wheel: { r: 0.0907, y: 0.0907, x: 0.1713, xIn: 0.1304 },
    head: [0.17, 0.21, 0.488],
    tail: [0.197, 0.215, -0.591],
    bodyTris: 6000,
  },
};

const [model, src, outArg] = process.argv.slice(2);
const c = CARS[model];
if (!c) throw new Error(`unknown car ${model}; add its measurements to CARS`);
const out = outArg ?? `assets/models/cars/${c.file}.glb`;
const S = c.scale;
const midZ = (c.axleFront + c.axleRear) / 2;
const m = (x, y, z) => [(x - c.centreX) * S, y * S, (z - midZ) * S];
const axles = {
  wheel_fl: m(c.wheel.x + c.centreX, c.wheel.y, c.axleFront),
  wheel_fr: m(-c.wheel.x + c.centreX, c.wheel.y, c.axleFront),
  wheel_rl: m(c.wheel.x + c.centreX, c.wheel.y, c.axleRear),
  wheel_rr: m(-c.wheel.x + c.centreX, c.wheel.y, c.axleRear),
};
const R = c.wheel.r * S;
const xIn = c.wheel.xIn * S;

const doc = await io.read(src);
const root = doc.getRoot();
const { bakeNodes } = await import('./lib.mjs');
const prims = bakeNodes(doc);
if (prims.length !== 1) throw new Error(`expected one primitive, got ${prims.length}`);
transformAll(prims, mat.mul(mat.scale(S), mat.mul(mat.translate(-c.centreX, 0, -midZ), mat.rotY(c.rotY ?? 0))));
const luma = await lumaSampler(prims[0]);
// inside 0.8 R: wheel (rim, spokes, hub). Out to the tread (1.04 R): wheel unless it is
// paint-bright, so the arch lip stays on the body; the dark arch lining beyond stays too.
const parts = splitPrimitive(doc, prims[0], (x, y, z, i0, i1, i2) => {
  if (Math.abs(x) < xIn) return 'body';
  for (const [name, p] of Object.entries(axles)) {
    if (Math.sign(x) !== Math.sign(p[0])) continue;
    const r = Math.hypot(z - p[2], y - p[1]) / R;
    if (r < 0.8 || (r < 1.04 && luma(i0, i1, i2) < 0.7)) return name;
  }
  return 'body';
});
for (const k of Object.keys(axles)) if (!parts[k]) throw new Error(`no triangles in ${k}`);

for (const s of root.listScenes()) for (const n of s.listChildren()) n.dispose();
for (const mesh of root.listMeshes()) mesh.dispose();
const scene = root.listScenes()[0];
const car = doc.createNode('car');
scene.addChild(car);
car.addChild(doc.createNode('body').setMesh(doc.createMesh('body').addPrimitive(parts.body)));
const tpl = parts.wheel_fl;
const fl = axles.wheel_fl;
transformAll([tpl], mat.translate(-fl[0], -fl[1], -fl[2]));
car.addChild(doc.createNode('wheel').setMesh(doc.createMesh('wheel').addPrimitive(tpl)));
for (const [name, p] of Object.entries(axles)) car.addChild(doc.createNode(name).setTranslation(p));
car.addChild(doc.createNode('light_head_l').setTranslation(m(...c.head)));
car.addChild(doc.createNode('light_tail_l').setTranslation(m(...c.tail)));
if (c.bar) car.addChild(doc.createNode('light_bar_l').setTranslation(m(...c.bar)));

await MeshoptSimplifier.ready;
await doc.transform(weld());
const nodeMesh = (name) => car.listChildren().find((n) => n.getName() === name).getMesh();
/** Thin a node's primitive to about `tris` triangles; `copyAs` keeps the original and adds a new node. */
function thin(name, tris, error, copyAs) {
  const src = nodeMesh(name).listPrimitives()[0];
  const prim = copyAs ? src.clone() : src;
  const before = countTris(prim);
  simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: Math.min(1, tris / before), error, lockBorder: false });
  if (copyAs) car.addChild(doc.createNode(copyAs).setMesh(doc.createMesh(copyAs).addPrimitive(prim)));
  return `${copyAs ?? name} ${before} -> ${countTris(prim)}`;
}
/** Far versions ignore seams and topology (meshopt sloppy), which UV-heavy generated meshes need. */
function thinSloppy(name, tris, copyAs) {
  const prim = nodeMesh(name).listPrimitives()[0].clone();
  const pos = prim.getAttribute('POSITION').getArray();
  const idx = prim.getIndices().getArray();
  const before = idx.length / 3;
  const [next] = MeshoptSimplifier.simplifySloppy(new Uint32Array(idx), pos instanceof Float32Array ? pos : new Float32Array(pos), 3, null, Math.min(idx.length, tris * 3), 1);
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(next).setBuffer(root.listBuffers()[0]));
  compactPrimitive(prim);
  car.addChild(doc.createNode(copyAs).setMesh(doc.createMesh(copyAs).addPrimitive(prim)));
  return `${copyAs} ${before} -> ${countTris(prim)}`;
}
const report = [thinSloppy('body', 1100, 'body_lod1'), thinSloppy('wheel', 90, 'wheel_lod1'), thin('body', c.bodyTris, 0.004), thin('wheel', 600, 0.05)];
plainMaterials(doc);
await shrinkTextures(doc, 1024);
await finish(doc, out);
console.log(`wrote ${out}: ${report.join(', ')} tris`);

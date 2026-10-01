// Measures a raw generated car for tools/art/car.mjs: length, centre, axles and
// wheel size from the dark tyre triangles that touch the ground, tail lamps from
// the red at the back, and the front of the body at headlight height (`headY`, a
// fraction of the height, read off the concept image).
// usage: node tools/art/measure.mjs raw.glb [rotY radians] [headY]
import { bakeNodes, colourSampler, hsv, io, lumaSampler, mat, transformAll } from './lib.mjs';

const [src, rot = '0', headFrac = '0.4'] = process.argv.slice(2);
const doc = await io.read(src);
const prims = bakeNodes(doc);
if (+rot) transformAll(prims, mat.rotY(+rot));
const prim = prims[0];
const pos = prim.getAttribute('POSITION');
const idx = prim.getIndices();
const luma = await lumaSampler(prim);
const colour = await colourSampler(prim);
const tris = [];
const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let t = 0; t < idx.getCount(); t += 3) {
  const i0 = idx.getScalar(t), i1 = idx.getScalar(t + 1), i2 = idx.getScalar(t + 2);
  pos.getElement(i0, a);
  pos.getElement(i1, b);
  pos.getElement(i2, c);
  const ctr = [0, 1, 2].map((k) => (a[k] + b[k] + c[k]) / 3);
  for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], a[k], b[k], c[k]);
    max[k] = Math.max(max[k], a[k], b[k], c[k]);
  }
  const [hue, sat, val] = hsv(...colour(i0, i1, i2));
  const red = sat > 0.45 && val > 0.25 && (hue < 18 || hue > 342);
  tris.push({ x: ctr[0], y: ctr[1], z: ctr[2], ylo: Math.min(a[1], b[1], c[1]), zlo: Math.min(a[2], b[2], c[2]), zhi: Math.max(a[2], b[2], c[2]), l: luma(i0, i1, i2), red });
}
const L = max[2] - min[2];
const centreX = (min[0] + max[0]) / 2;
const halfW = (max[0] - min[0]) / 2;
const midZ = (min[2] + max[2]) / 2;
const median = (v) => v.sort((p, q) => p - q)[Math.floor(v.length / 2)];
const dark = tris.filter((t) => t.l < 0.35);
const wheels = [];
for (const sx of [1, -1]) {
  for (const sz of [1, -1]) {
    const mine = dark.filter((t) => Math.sign(t.x - centreX) === sx && Math.sign(t.z - midZ) === sz);
    // tyre contact: dark triangles reaching the ground
    const ground = mine.filter((t) => t.ylo < 0.006 * L && Math.abs(t.x - centreX) > 0.4 * halfW);
    if (!ground.length) throw new Error(`no tyre on the ground at side ${sx}, end ${sz}`);
    const zc = median(ground.map((t) => t.z));
    // the tyre profile near the ground: half width w at height y gives r = (w^2 + y^2) / 2y
    let r = 0.25 * max[1];
    for (let pass = 0; pass < 3; pass++) {
      const est = [];
      for (let y = 0.08 * r; y < 0.45 * r; y += 0.03 * r) {
        const band = mine.filter((t) => Math.abs(t.y - y) < 0.03 * r && Math.abs(t.z - zc) < 1.3 * r && Math.abs(t.x - centreX) > 0.4 * halfW);
        if (band.length < 4) continue;
        const w = (Math.max(...band.map((t) => t.zhi)) - Math.min(...band.map((t) => t.zlo))) / 2;
        est.push((w * w + y * y) / (2 * y));
      }
      if (est.length) r = median(est);
    }
    const tyre = mine.filter((t) => t.y < 1.6 * r && Math.abs(t.z - zc) < 0.9 * r && Math.abs(t.x - centreX) > 0.3 * halfW);
    const xs = tyre.map((t) => Math.abs(t.x - centreX)).sort((p, q) => p - q);
    // the inner face is hidden among suspension and arch liners: take the tread as 0.8 r wide
    const xOut = xs[Math.floor(xs.length * 0.98)];
    wheels.push({ sx, sz, zc, r, xOut, xIn: xOut - 0.8 * r });
  }
}
const avg = (k, f = () => true) => { const v = wheels.filter(f).map((w) => w[k]); return v.reduce((p, q) => p + q, 0) / v.length; };
const r = avg('r');
const out = {
  length: +L.toFixed(4), centreX: +centreX.toFixed(4), halfWidth: +halfW.toFixed(4), height: +max[1].toFixed(4),
  axleFront: +avg('zc', (w) => w.sz > 0).toFixed(4), axleRear: +avg('zc', (w) => w.sz < 0).toFixed(4),
  wheel: { r: +r.toFixed(4), y: +r.toFixed(4), x: +(avg('xOut') - 0.35 * r).toFixed(4), xIn: +avg('xIn').toFixed(4) },
  front: +max[2].toFixed(4), rear: +min[2].toFixed(4),
};
// tail lamps: red triangles near the back, left side (+x)
const tail = tris.filter((t) => t.red && t.z < min[2] + 0.1 * L && t.x - centreX > 0.25 * halfW);
if (tail.length) out.tail = [median(tail.map((t) => t.x - centreX)), median(tail.map((t) => t.y)), Math.min(...tail.map((t) => t.z))].map((v) => +v.toFixed(3));
// headlights: the front of the body at headY of the height, 0.68 of the half width out
const hy = +headFrac * max[1], hx = 0.68 * halfW;
const nose = tris.filter((t) => Math.abs(t.y - hy) < 0.03 * max[1] && Math.abs(t.x - centreX - hx) < 0.12 * halfW && t.z > midZ);
if (nose.length) out.head = [hx, hy, Math.max(...nose.map((t) => t.zhi))].map((v) => +v.toFixed(3));
console.log(JSON.stringify(out));
for (const w of wheels) console.log(`  side ${w.sx} end ${w.sz}: z ${w.zc.toFixed(3)} r ${w.r.toFixed(3)} x ${w.xIn.toFixed(3)}..${w.xOut.toFixed(3)}`);

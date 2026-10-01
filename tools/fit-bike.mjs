// Fits a generated bike model (image-to-3D output) into the game's bike space, so it can replace assets/bike-ai.glb:
// one mesh, length on x with the front at -x, up +y, the bike's left at +z, scaled and moved so its axles sit where
// the game's rider rig expects them (front -0.656, rear 0.668, tyres touching y = -0.4987; 1.073 m per unit in game).
// It prints the wheel centres to paste into AI.wheels in js/bike.js. Run it before recolour-model and compress-models.
//
//   node tools/fit-bike.mjs <in.glb> <out.glb> [--front +x|-x|+z|-z]
//
// --front is the axis the bike's nose points along in the source file (after its own node transforms). Check it by
// opening the model in any glTF viewer; image-to-3D tools usually give +x or -z.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { clearNodeTransform, transformMesh, prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const argv = process.argv.slice(2), [inp, out] = argv;
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
if (!inp || !out) { console.error('usage: node tools/fit-bike.mjs <in.glb> <out.glb> [--front +x|-x|+z|-z]'); process.exit(1); }
const REF = { front: -0.656, rear: 0.668, ground: -0.4987 };

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
const meshes = doc.getRoot().listMeshes();
if (meshes.length !== 1 || meshes[0].listPrimitives().length !== 1) {
  console.error(`expected one mesh with one primitive, found ${meshes.length} mesh(es); the game splits a single fused mesh`);
  process.exit(1);
}
for (const n of doc.getRoot().listNodes()) if (n.getMesh()) clearNodeTransform(n);
const mesh = meshes[0];
const colMajor = (r) => [r[0], r[4], r[8], 0, r[1], r[5], r[9], 0, r[2], r[6], r[10], 0, r[3], r[7], r[11], 1];

// 1) orientation (proper rotations about y, so nothing is mirrored)
const ROT = {
  '+x': [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0], // nose +x: turn 180 degrees
  '-x': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  '+z': [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0], // nose +z: turn 90 degrees
  '-z': [0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0],
}[opt('front', '+x')];
if (!ROT) { console.error('--front must be +x, -x, +z or -z'); process.exit(1); }
transformMesh(mesh, colMajor(ROT));

// 2) measure the wheels: circle fit to the bottom arc of each tyre in the side silhouette
const points = () => {
  const a = mesh.listPrimitives()[0].getAttribute('POSITION'), P = [], v = [0, 0, 0];
  for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); P.push([...v]); }
  return P;
};
function circle(pts) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  for (const [x, y] of pts) { const z = x * x + y * y; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z; }
  const M = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, pts.length, sz]];
  for (let i = 0; i < 3; i++) {
    let p = i; for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < 3; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c < 4; c++) M[r][c] -= f * M[i][c]; }
  }
  const cx = M[0][3] / M[0][0] / 2, cy = M[1][3] / M[1][1] / 2;
  return { cx, cy, r: Math.sqrt(M[2][3] / M[2][2] + cx * cx + cy * cy) };
}
function wheels(P) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; // (no spread: models can have millions of vertices)
  for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
  const len = x1 - x0, zMid = (z0 + z1) / 2;
  const side = P.filter(p => Math.abs(p[2] - zMid) < 0.06 * len);
  const fit = (a, b) => {
    const bins = 160, env = [];
    for (let i = 0; i < bins; i++) {
      const lo = a + (b - a) * i / bins, hi = a + (b - a) * (i + 1) / bins;
      let best = null; for (const p of side) if (p[0] >= lo && p[0] < hi && (!best || p[1] < best[1])) best = p;
      if (best) env.push([best[0], best[1]]);
    }
    const yMin = env.reduce((m, e) => Math.min(m, e[1]), Infinity);
    const flat = env.filter(e => e[1] < yMin + 0.004 * len);
    let c = { cx: flat.reduce((s, e) => s + e[0], 0) / flat.length, cy: yMin + 0.15 * len, r: 0.15 * len };
    for (let it = 0; it < 6; it++) {
      const pts = env.filter(e => Math.abs(e[0] - c.cx) < 0.85 * c.r && e[1] < c.cy - 0.2 * c.r
        && Math.abs(Math.hypot(e[0] - c.cx, e[1] - c.cy) - c.r) < 0.12 * c.r + (it ? 0 : 0.1 * len));
      if (pts.length < 6) break;
      c = circle(pts);
    }
    return { ...c, yMin };
  };
  return { front: fit(x0, x0 + 0.42 * len), rear: fit(x1 - 0.42 * len, x1), zMid };
}
let W = wheels(points());

// 3) scale and move onto the reference axles and ground
const s = (REF.rear - REF.front) / (W.rear.cx - W.front.cx);
const tx = REF.front - W.front.cx * s, ty = REF.ground - Math.min(W.front.yMin, W.rear.yMin) * s, tz = -W.zMid * s;
transformMesh(mesh, colMajor([s, 0, 0, tx, 0, s, 0, ty, 0, 0, s, tz]));
W = wheels(points());

await doc.transform(prune());
await io.write(out, doc);
const f = (w) => `cx: ${w.cx.toFixed(3)}, cy: ${w.cy.toFixed(3)}, tyre radius ${w.r.toFixed(3)}`;
console.log(`wrote ${out} (scaled x${s.toFixed(3)})`);
console.log(`front wheel: ${f(W.front)}\nrear wheel:  ${f(W.rear)}`);
console.log('Paste cx/cy into AI.wheels in js/bike.js. Set rim just inside the tyre (about 0.8 x tyre radius) and tyre just');
console.log('outside it, then check grips, pegs and decals on the title screen (?auto=bike&ang=1.57&q=high).');

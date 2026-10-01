// Copies the textures of a retextured copy of a model back onto the original, keeping the original's rig and UVs.
// For when a retexture service (e.g. Meshy retexture via Higgsfield) returns the same mesh, triangle for triangle,
// but with a new UV layout and no skeleton. Each texel of the original's UV layout is filled from the matching spot
// on the retextured copy; normal maps are turned into the original's tangent frames, so bumps stay the right way up.
//
//   node tools/transfer-textures.mjs <original.glb> <retextured.glb> <out.glb> [--size 2048]
//
// Writes base colour, metal/roughness and normal maps (whichever the retextured copy has) and drops the original's
// emissive map. Then compress the result with compress-models.mjs.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const argv = process.argv.slice(2), [origPath, retexPath, out] = argv;
const SIZE = +(argv[argv.indexOf('--size') + 1] || 0) || 2048;
if (!origPath || !retexPath || !out) { console.error('usage: node tools/transfer-textures.mjs <original.glb> <retextured.glb> <out.glb> [--size 2048]'); process.exit(1); }

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [A, B] = [await io.read(origPath), await io.read(retexPath)];
const primOf = (doc) => {
  const prims = doc.getRoot().listMeshes().flatMap(m => m.listPrimitives());
  if (prims.length !== 1) { console.error('expected one mesh primitive in each file'); process.exit(1); }
  return prims[0];
};
const pa = primOf(A), pb = primOf(B);
const read = (p) => {
  const pos = p.getAttribute('POSITION'), uv = p.getAttribute('TEXCOORD_0'), idx = p.getIndices();
  const n = idx ? idx.getCount() : pos.getCount();
  const tri = new Uint32Array(n);
  for (let i = 0; i < n; i++) tri[i] = idx ? idx.getScalar(i) : i;
  const P = new Float64Array(pos.getCount() * 3), U = new Float64Array(uv.getCount() * 2), v = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, v); P.set(v, i * 3); }
  for (let i = 0; i < uv.getCount(); i++) { uv.getElement(i, v); U[i * 2] = v[0]; U[i * 2 + 1] = v[1]; }
  return { tri, P, U };
};
const ga = read(pa), gb = read(pb);
if (ga.tri.length !== gb.tri.length) { console.error(`triangle counts differ (${ga.tri.length / 3} vs ${gb.tri.length / 3}): not the same mesh`); process.exit(1); }

// The copy may be rescaled and moved: fit scale + offset from the bounding boxes, then check every corner matches.
const bbox = (P) => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[i + k]); mx[k] = Math.max(mx[k], P[i + k]); } return { mn, mx }; };
const ba = bbox(ga.P), bb = bbox(gb.P);
const scale = (bb.mx[1] - bb.mn[1]) / (ba.mx[1] - ba.mn[1]);
const off = [0, 1, 2].map(k => (bb.mn[k] + bb.mx[k]) / 2 - (ba.mn[k] + ba.mx[k]) / 2 * scale);
let worst = 0;
for (let i = 0; i < ga.tri.length; i++) {
  const a = ga.tri[i] * 3, b = gb.tri[i] * 3;
  worst = Math.max(worst, Math.hypot(...[0, 1, 2].map(k => ga.P[a + k] * scale + off[k] - gb.P[b + k])));
}
const tol = (ba.mx[1] - ba.mn[1]) * scale * 1e-3;
if (worst > tol) { console.error(`triangles don't line up (worst corner off by ${worst.toExponential(2)}): not the same mesh in the same order`); process.exit(1); }
console.log(`${ga.tri.length / 3} triangles match (worst corner ${worst.toExponential(1)}, copy scaled x${scale.toFixed(4)})`);

// Per-triangle tangent frame (columns T, B, N; orthonormal, handedness kept) from positions and UVs.
function frame(g, t) {
  const i0 = g.tri[t * 3] , i1 = g.tri[t * 3 + 1], i2 = g.tri[t * 3 + 2];
  const p = (i, k) => g.P[i * 3 + k], u = (i, k) => g.U[i * 2 + k];
  const e1 = [0, 1, 2].map(k => p(i1, k) - p(i0, k)), e2 = [0, 1, 2].map(k => p(i2, k) - p(i0, k));
  const du1 = u(i1, 0) - u(i0, 0), dv1 = u(i1, 1) - u(i0, 1), du2 = u(i2, 0) - u(i0, 0), dv2 = u(i2, 1) - u(i0, 1);
  const r = 1 / ((du1 * dv2 - du2 * dv1) || 1e-12);
  let T = [0, 1, 2].map(k => (e1[k] * dv2 - e2[k] * dv1) * r), Bt = [0, 1, 2].map(k => (e2[k] * du1 - e1[k] * du2) * r);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map(x => x / l); };
  const N = norm(cross(e1, e2));
  T = norm(T.map((x, k) => x - N[k] * dot(N, T)));
  const hand = dot(cross(N, T), Bt) < 0 ? -1 : 1;
  const Bn = cross(N, T).map(x => x * hand);
  return [T, Bn, N];
}

const decode = async (tex) => {
  const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().resize(SIZE, SIZE).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const matB = pb.getMaterial(), matA = pa.getMaterial();
const slots = [['base', matB.getBaseColorTexture()], ['mr', matB.getMetallicRoughnessTexture()], ['normal', matB.getNormalTexture()]].filter(s => s[1]);
const src = {}; for (const [k, t] of slots) src[k] = await decode(t);
const dst = {}; for (const k in src) dst[k] = new Uint8Array(SIZE * SIZE * 3);
const filled = new Uint8Array(SIZE * SIZE);
const sample = (img, u, v, o) => { // bilinear, clamped
  const x = Math.min(img.w - 1, Math.max(0, u * img.w - 0.5)), y = Math.min(img.h - 1, Math.max(0, v * img.h - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(img.w - 1, x0 + 1), y1 = Math.min(img.h - 1, y0 + 1), fx = x - x0, fy = y - y0;
  for (let c = 0; c < 3; c++) {
    const g = (xx, yy) => img.data[(yy * img.w + xx) * 3 + c];
    o[c] = (g(x0, y0) * (1 - fx) + g(x1, y0) * fx) * (1 - fy) + (g(x0, y1) * (1 - fx) + g(x1, y1) * fx) * fy;
  }
  return o;
};

// Rasterise each triangle in the original's UV space and pull the matching texels from the copy.
const px = [0, 0, 0], nb = [0, 0, 0];
for (let t = 0; t < ga.tri.length / 3; t++) {
  const ua = [0, 1, 2].map(k => [ga.U[ga.tri[t * 3 + k] * 2] * SIZE, ga.U[ga.tri[t * 3 + k] * 2 + 1] * SIZE]);
  const ub = [0, 1, 2].map(k => [gb.U[gb.tri[t * 3 + k] * 2], gb.U[gb.tri[t * 3 + k] * 2 + 1]]);
  let R = null;
  if (src.normal) { // rotate normals from the copy's tangent frame into the original's: R = Fa^T * Fb
    const Fa = frame(ga, t), Fb = frame(gb, t);
    R = [0, 1, 2].map(i => [0, 1, 2].map(j => Fa[i][0] * Fb[j][0] + Fa[i][1] * Fb[j][1] + Fa[i][2] * Fb[j][2]));
  }
  const x0 = Math.max(0, Math.floor(Math.min(ua[0][0], ua[1][0], ua[2][0]))), x1 = Math.min(SIZE - 1, Math.ceil(Math.max(ua[0][0], ua[1][0], ua[2][0])));
  const y0 = Math.max(0, Math.floor(Math.min(ua[0][1], ua[1][1], ua[2][1]))), y1 = Math.min(SIZE - 1, Math.ceil(Math.max(ua[0][1], ua[1][1], ua[2][1])));
  const d = (ua[1][1] - ua[2][1]) * (ua[0][0] - ua[2][0]) + (ua[2][0] - ua[1][0]) * (ua[0][1] - ua[2][1]);
  if (Math.abs(d) < 1e-12) continue;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const cx = x + 0.5, cy = y + 0.5;
    const w0 = ((ua[1][1] - ua[2][1]) * (cx - ua[2][0]) + (ua[2][0] - ua[1][0]) * (cy - ua[2][1])) / d;
    const w1 = ((ua[2][1] - ua[0][1]) * (cx - ua[2][0]) + (ua[0][0] - ua[2][0]) * (cy - ua[2][1])) / d;
    const w2 = 1 - w0 - w1;
    if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
    const u = w0 * ub[0][0] + w1 * ub[1][0] + w2 * ub[2][0], v = w0 * ub[0][1] + w1 * ub[1][1] + w2 * ub[2][1];
    const o = (y * SIZE + x) * 3;
    for (const k in src) {
      sample(src[k], u, v, px);
      if (k === 'normal') {
        for (let c = 0; c < 3; c++) nb[c] = px[c] / 127.5 - 1;
        let n = [0, 1, 2].map(i => R[i][0] * nb[0] + R[i][1] * nb[1] + R[i][2] * nb[2]);
        const l = Math.hypot(...n) || 1; n = n.map(c => c / l);
        for (let c = 0; c < 3; c++) dst[k][o + c] = Math.round((n[c] + 1) * 127.5);
      } else for (let c = 0; c < 3; c++) dst[k][o + c] = px[c];
    }
    filled[y * SIZE + x] = 1;
  }
}
// Pad the islands outwards so mipmaps and filtering don't pull in black from the gaps.
for (let pass = 0; pass < 8; pass++) {
  const add = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    if (filled[y * SIZE + x]) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < SIZE && yy < SIZE && filled[yy * SIZE + xx]) { add.push([y * SIZE + x, yy * SIZE + xx]); break; }
    }
  }
  for (const [i, j] of add) { for (const k in dst) for (let c = 0; c < 3; c++) dst[k][i * 3 + c] = dst[k][j * 3 + c]; filled[i] = 1; }
}
const cover = filled.reduce((s, f) => s + f, 0) / filled.length;

// Put the new maps on the original's material.
const jpeg = async (buf) => new Uint8Array(await sharp(Buffer.from(buf), { raw: { width: SIZE, height: SIZE, channels: 3 } }).jpeg({ quality: 92 }).toBuffer());
const mk = async (k) => A.createTexture(k).setImage(await jpeg(dst[k])).setMimeType('image/jpeg');
if (dst.base) matA.setBaseColorTexture(await mk('base'));
if (dst.mr) matA.setMetallicRoughnessTexture(await mk('mr')).setRoughnessFactor(1).setMetallicFactor(1);
if (dst.normal) matA.setNormalTexture(await mk('normal'));
matA.setEmissiveTexture(null).setEmissiveFactor([0, 0, 0]);
for (const t of A.getRoot().listTextures()) if (!t.listParents().some(p => p !== A.getRoot())) t.dispose();
await io.write(out, A);
console.log(`wrote ${out}: ${Object.keys(dst).join(', ')} at ${SIZE}px (${(cover * 100).toFixed(0)}% of the atlas covered)`);

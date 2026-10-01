// Shared helpers for turning generated GLBs into game assets (see ASSETS.md).
// Game conventions: metres, Y up, forward +Z, pivot at ground centre.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { clearNodeTransform, compactPrimitive, dedup, prune, quantize, reorder, textureCompress, transformPrimitive } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

/** sRGB bytes [r, g, b] of a primitive's base colour at the centre of a triangle's UVs. */
export async function colourSampler(prim) {
  const tex = prim.getMaterial()?.getBaseColorTexture();
  const uv = prim.getAttribute('TEXCOORD_0');
  if (!tex || !uv) return () => [128, 128, 128];
  const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const t = [0, 0];
  return (i0, i1, i2) => {
    let u = 0, v = 0;
    for (const i of [i0, i1, i2]) {
      uv.getElement(i, t);
      u += t[0] / 3;
      v += t[1] / 3;
    }
    const x = Math.min(info.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * info.width)));
    const y = Math.min(info.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * info.height)));
    const k = (y * info.width + x) * 3;
    return [data[k], data[k + 1], data[k + 2]];
  };
}

/**
 * Luma (0 to 1) of a primitive's base colour at the centre of a triangle's UVs,
 * to tell dark rubber from paint when cutting wheels out.
 */
export async function lumaSampler(prim) {
  const colour = await colourSampler(prim);
  return (i0, i1, i2) => {
    const [r, g, b] = colour(i0, i1, i2);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
}

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
export const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

/** Column-major 4x4 helpers (glTF order). */
export const mat = {
  identity: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  translate: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
  scale: (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1],
  rotY: (a) => [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1],
  mul(a, b) {
    const o = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return o;
  },
};

/** Bake every node transform into the meshes (static models only) and return all primitives. */
export function bakeNodes(doc) {
  const visit = (n) => {
    clearNodeTransform(n);
    for (const c of n.listChildren()) visit(c);
  };
  for (const s of doc.getRoot().listScenes()) for (const n of s.listChildren()) visit(n);
  const prims = [];
  for (const m of doc.getRoot().listMeshes()) prims.push(...m.listPrimitives());
  return prims;
}

export function transformAll(prims, m) {
  for (const p of prims) transformPrimitive(p, m);
}

/** Call `fn(cx, cy, cz, i0, i1, i2)` (centroid and vertex indices) for every triangle of a primitive. */
function eachTriangle(prim, fn) {
  const pos = prim.getAttribute('POSITION');
  const idx = prim.getIndices();
  const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
  const n = idx ? idx.getCount() : pos.getCount();
  for (let t = 0; t < n; t += 3) {
    const i0 = idx ? idx.getScalar(t) : t, i1 = idx ? idx.getScalar(t + 1) : t + 1, i2 = idx ? idx.getScalar(t + 2) : t + 2;
    pos.getElement(i0, a);
    pos.getElement(i1, b);
    pos.getElement(i2, c);
    fn((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3, i0, i1, i2);
  }
}

/**
 * Split a primitive's triangles by `classify(cx, cy, cz, i0, i1, i2)` (centroid
 * and vertex indices) into new compacted primitives keyed by the returned name.
 */
export function splitPrimitive(doc, prim, classify) {
  const buffer = doc.getRoot().listBuffers()[0];
  const groups = new Map();
  eachTriangle(prim, (cx, cy, cz, i0, i1, i2) => {
    const key = classify(cx, cy, cz, i0, i1, i2);
    let g = groups.get(key);
    if (!g) groups.set(key, (g = []));
    g.push(i0, i1, i2);
  });
  const out = {};
  for (const [key, list] of groups) {
    const p = prim.clone();
    p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(list)).setBuffer(buffer));
    compactPrimitive(p);
    out[key] = p;
  }
  return out;
}

export function countTris(prim) {
  const idx = prim.getIndices();
  return (idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3;
}

/**
 * Drop the material extensions that make three.js build the costlier
 * MeshPhysicalMaterial (specular, ior), and any glow.
 */
export function plainMaterials(doc) {
  for (const m of doc.getRoot().listMaterials()) {
    for (const e of m.listExtensions()) m.setExtension(e.extensionName, null);
    m.setEmissiveTexture(null).setEmissiveFactor([0, 0, 0]);
  }
  for (const e of doc.getRoot().listExtensionsUsed()) if (e.extensionName.startsWith('KHR_materials_')) e.dispose();
}

/**
 * A coverage mask in UV space: `paint(prim, keep)` paints every triangle of a
 * primitive for which `keep(cx, cy, cz, i0, i1, i2)` holds; `at(u, v)` reads it.
 */
export function uvMask(size = 1024) {
  const mask = new Uint8Array(size * size);
  const a = [0, 0], b = [0, 0], c = [0, 0];
  const fill = (uv, i0, i1, i2) => {
    uv.getElement(i0, a);
    uv.getElement(i1, b);
    uv.getElement(i2, c);
    const ax = a[0] * size, ay = a[1] * size, bx = b[0] * size, by = b[1] * size, cx = c[0] * size, cy = c[1] * size;
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area) < 1e-9) return;
    // about a texel of slack so slivers and seams are covered
    const pad = 1.5 / Math.sqrt(Math.abs(area));
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)) - 1), x1 = Math.min(size - 1, Math.ceil(Math.max(ax, bx, cx)) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)) - 1), y1 = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy)) + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
        const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
        if (w0 >= -pad && w1 >= -pad && 1 - w0 - w1 >= -pad) mask[y * size + x] = 1;
      }
    }
  };
  return {
    paint(prim, keep = () => true) {
      const uv = prim.getAttribute('TEXCOORD_0');
      eachTriangle(prim, (cx, cy, cz, i0, i1, i2) => keep(cx, cy, cz, i0, i1, i2) && fill(uv, i0, i1, i2));
    },
    at(u, v) {
      const x = Math.min(size - 1, Math.max(0, Math.floor(u * size)));
      const y = Math.min(size - 1, Math.max(0, Math.floor(v * size)));
      return mask[y * size + x] === 1;
    },
  };
}

/** Hue (degrees), saturation and value (0 to 1) of an sRGB byte colour. */
export function hsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let hue = 0;
  if (d > 0) {
    if (max === r) hue = ((g - b) / d + 6) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
  }
  return [hue * 60, max ? d / max : 0, max / 255];
}

/**
 * Replace a material's metal and roughness map with one painted from its
 * colour map: `pick(r, g, b, u, v)` returns [metal, rough] (0 to 1) per texel.
 * Generated maps tend to mark random patches as mirror metal, which renders
 * as bare reflection with none of the colour map showing.
 */
export async function paintMetalRough(doc, material, pick) {
  const { data, info } = await sharp(Buffer.from(material.getBaseColorTexture().getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 3;
      const [metal, rough] = pick(data[k], data[k + 1], data[k + 2], (x + 0.5) / w, (y + 0.5) / h);
      out[k] = 255;
      out[k + 1] = Math.round(rough * 255);
      out[k + 2] = Math.round(metal * 255);
    }
  }
  // soften texel noise from the generated colour map
  const png = await sharp(out, { raw: { width: w, height: h, channels: 3 } }).median(3).png().toBuffer();
  material.setMetallicRoughnessTexture(doc.createTexture(`${material.getName()}_mr`).setImage(new Uint8Array(png)).setMimeType('image/png'));
  material.setMetallicFactor(1).setRoughnessFactor(1);
}

async function colourMap(material) {
  const { data, info } = await sharp(Buffer.from(material.getBaseColorTexture().getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Corners and UVs of a triangle, and its face normal. */
function triangle(pos, uv, i0, i1, i2) {
  const P = [i0, i1, i2].map((i) => pos.getElement(i, [0, 0, 0]));
  const T = [i0, i1, i2].map((i) => uv.getElement(i, [0, 0]));
  const e1 = [0, 1, 2].map((k) => P[1][k] - P[0][k]), e2 = [0, 1, 2].map((k) => P[2][k] - P[0][k]);
  const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  const len = Math.hypot(...n) || 1;
  return { P, T, n: n.map((v) => v / len) };
}

/** Visit the pixels of a 2D triangle (a, b, c in pixels) with their barycentric weights. */
function raster(a, b, c, w, h, fn, pad = 0) {
  const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  if (Math.abs(area) < 1e-9) return;
  const slack = pad / Math.sqrt(Math.abs(area));
  const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])) - 1), x1 = Math.min(w - 1, Math.ceil(Math.max(a[0], b[0], c[0])) + 1);
  const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])) - 1), y1 = Math.min(h - 1, Math.ceil(Math.max(a[1], b[1], c[1])) + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((b[0] - px) * (c[1] - py) - (b[1] - py) * (c[0] - px)) / area;
      const w1 = ((c[0] - px) * (a[1] - py) - (c[1] - py) * (a[0] - px)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 >= -slack && w1 >= -slack && w2 >= -slack) fn(x, y, w0, w1, w2);
    }
  }
}

/**
 * Orthographic view of a car's back (x to the left, y up, metres) with a 10 cm
 * grid (every 50 cm brighter, the centre line and ground red), for picking
 * `blank` boxes in tools/art/car.mjs.
 */
export async function renderBack(prim, file, pxPerM = 400) {
  const pos = prim.getAttribute('POSITION'), uv = prim.getAttribute('TEXCOORD_0'), idx = prim.getIndices();
  const tex = await colourMap(prim.getMaterial());
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], e = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, e);
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], e[k]);
      max[k] = Math.max(max[k], e[k]);
    }
  }
  const W = Math.ceil((max[0] - min[0]) * pxPerM) + 1, H = Math.ceil(max[1] * pxPerM) + 1;
  const img = Buffer.alloc(W * H * 3, 40);
  const depth = new Float32Array(W * H).fill(Infinity);
  const sx = (x) => (max[0] - x) * pxPerM, sy = (y) => (max[1] - y) * pxPerM;
  for (let t = 0; t < idx.getCount(); t += 3) {
    const { P, T } = triangle(pos, uv, idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2));
    const [a, b, c] = P.map((p) => [sx(p[0]), sy(p[1])]);
    raster(a, b, c, W, H, (x, y, w0, w1, w2) => {
      const z = w0 * P[0][2] + w1 * P[1][2] + w2 * P[2][2];
      const k = y * W + x;
      if (z >= depth[k]) return;
      depth[k] = z;
      const u = w0 * T[0][0] + w1 * T[1][0] + w2 * T[2][0], v = w0 * T[0][1] + w1 * T[1][1] + w2 * T[2][1];
      const tx = Math.min(tex.w - 1, Math.max(0, Math.floor((u - Math.floor(u)) * tex.w))), ty = Math.min(tex.h - 1, Math.max(0, Math.floor((v - Math.floor(v)) * tex.h)));
      const src = (ty * tex.w + tx) * 3;
      img[k * 3] = tex.data[src];
      img[k * 3 + 1] = tex.data[src + 1];
      img[k * 3 + 2] = tex.data[src + 2];
    });
  }
  const line = (k, rgb) => {
    for (let c = 0; c < 3; c++) img[k * 3 + c] = (img[k * 3 + c] + rgb[c]) >> 1;
  };
  for (let g = Math.ceil(min[0] * 10); g <= Math.floor(max[0] * 10); g++) {
    const x = Math.round(sx(g / 10));
    for (let y = 0; y < H; y++) line(y * W + x, g === 0 ? [255, 0, 0] : g % 5 === 0 ? [0, 255, 255] : [0, 120, 255]);
  }
  for (let g = 0; g <= Math.floor(max[1] * 10); g++) {
    const y = Math.min(H - 1, Math.round(sy(g / 10)));
    for (let x = 0; x < W; x++) line(y * W + x, g === 0 ? [255, 0, 0] : g % 5 === 0 ? [0, 255, 255] : [0, 120, 255]);
  }
  await sharp(img, { raw: { width: W, height: H, channels: 3 } }).png().toFile(file);
  // pixel (px, py) is x = left - px / pxPerM, y = top - py / pxPerM
  return { left: max[0], top: max[1], pxPerM };
}

/**
 * Paint over made-up marks (plate text, badge dots) on a car's back: every
 * texel whose surface point lies in one of the boxes [x0, x1, y0, y1, fill?]
 * (metres, x to the left) on a back-facing triangle within `depth` of the
 * rearmost point takes one colour: the median of the box's light texels
 * (`light`, the default: paint behind dark marks), dark texels (`dark`: a black
 * panel behind light marks) or all of them (`all`: a lamp lens).
 */
export async function blankBack(doc, prim, boxes, depth = 0.35) {
  const material = prim.getMaterial();
  const tex = await colourMap(material);
  const pos = prim.getAttribute('POSITION'), uv = prim.getAttribute('TEXCOORD_0'), idx = prim.getIndices();
  let minZ = Infinity;
  const e = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) minZ = Math.min(minZ, pos.getElement(i, e)[2]);
  const hits = boxes.map(() => new Set());
  for (let t = 0; t < idx.getCount(); t += 3) {
    const { P, T, n } = triangle(pos, uv, idx.getScalar(t), idx.getScalar(t + 1), idx.getScalar(t + 2));
    if (n[2] > -0.25 || Math.min(P[0][2], P[1][2], P[2][2]) > minZ + depth) continue;
    const [a, b, c] = T.map(([u, v]) => [u * tex.w, v * tex.h]);
    raster(a, b, c, tex.w, tex.h, (x, y, w0, w1, w2) => {
      const px = w0 * P[0][0] + w1 * P[1][0] + w2 * P[2][0], py = w0 * P[0][1] + w1 * P[1][1] + w2 * P[2][1];
      boxes.forEach(([x0, x1, y0, y1], i) => {
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) hits[i].add(y * tex.w + x);
      });
    }, 1);
  }
  const report = [];
  const luma = (k) => 0.2126 * tex.data[k * 3] + 0.7152 * tex.data[k * 3 + 1] + 0.0722 * tex.data[k * 3 + 2];
  hits.forEach((set, i) => {
    const all = [...set];
    const mode = boxes[i][4] ?? 'light';
    const some = mode === 'light' ? all.filter((k) => luma(k) > 140) : mode === 'dark' ? all.filter((k) => luma(k) < 90) : all;
    const pick = some.length > all.length * 0.1 ? some : all;
    const fill = [0, 1, 2].map((c) => pick.map((k) => tex.data[k * 3 + c]).sort((p, q) => p - q)[Math.floor(pick.length / 2)] ?? 200);
    for (const k of all) for (let c = 0; c < 3; c++) tex.data[k * 3 + c] = fill[c];
    report.push(`${boxes[i].join(',')}: ${all.length} texels -> rgb(${fill.join(',')})`);
  });
  const png = await sharp(tex.data, { raw: { width: tex.w, height: tex.h, channels: 3 } }).png().toBuffer();
  material.getBaseColorTexture().setImage(new Uint8Array(png)).setMimeType('image/png');
  return report;
}

/** Shrink and re-encode every texture as JPEG: colour maps at `size`, the rest (normal, metal and roughness) at half. */
export async function shrinkTextures(doc, size = 1024, quality = 84) {
  await doc.transform(
    textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [size, size], quality, slots: /^baseColorTexture$/ }),
    textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [size / 2, size / 2], quality, slots: /^(?!baseColorTexture$)/ }),
  );
}

/**
 * Prune, then write with meshopt compression (EXT_meshopt_compression; the
 * game's loader has the decoder). Normals, UVs and skin weights are quantized;
 * positions stay float so node transforms (axles, mount points) are untouched.
 */
export async function finish(doc, file) {
  // keep empty nodes: they mark axles, lamps, the seat and the rider's grips and pegs
  await doc.transform(
    prune({ keepLeaves: true }),
    dedup(),
    reorder({ encoder: MeshoptEncoder, target: 'size' }),
    quantize({ pattern: /^(NORMAL|TEXCOORD_0|JOINTS_0|WEIGHTS_0)$/, quantizeNormal: 8, quantizeTexcoord: 12 }),
  );
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      if (idx && idx.getArray() instanceof Uint32Array && prim.getAttribute('POSITION').getCount() < 65536) idx.setArray(new Uint16Array(idx.getArray()));
    }
  }
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  await io.write(file, doc);
}

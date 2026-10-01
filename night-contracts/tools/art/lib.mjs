// Shared helpers for turning generated GLBs into game assets (see ASSETS.md).
// Game conventions: metres, Y up, forward +Z, pivot at ground centre.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { clearNodeTransform, compactPrimitive, dedup, prune, textureCompress, transformPrimitive } from '@gltf-transform/functions';
import sharp from 'sharp';

/**
 * Luma (0 to 1) of a primitive's base colour at the centre of a triangle's UVs,
 * to tell dark rubber from paint when cutting wheels out.
 */
export async function lumaSampler(prim) {
  const tex = prim.getMaterial()?.getBaseColorTexture();
  const uv = prim.getAttribute('TEXCOORD_0');
  if (!tex || !uv) return () => 0.5;
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
    return (0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2]) / 255;
  };
}

export const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

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

/** Shrink and re-encode every texture as JPEG. */
export async function shrinkTextures(doc, size = 1024, quality = 84) {
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [size, size], quality }));
}

export async function finish(doc, file) {
  // keep empty nodes: they mark axles, lamps, the seat and the rider's grips and pegs
  await doc.transform(prune({ keepLeaves: true }), dedup());
  await io.write(file, doc);
}

// Dump a model's textures, plus each vertex's position, UV and strongest bone, for recolor.py.
// Usage: node dump-uvs.mjs <model.glb> <out prefix>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const [f, out] = process.argv.slice(2);
const doc = await io.read(f); const root = doc.getRoot();
const mat = root.listMaterials()[0];
const slots = { base: mat.getBaseColorTexture(), mr: mat.getMetallicRoughnessTexture(), normal: mat.getNormalTexture() };
for (const [k, t] of Object.entries(slots)) if (t) fs.writeFileSync(`${out}_${k}.${t.getMimeType().split('/')[1]}`, t.getImage());
console.log('mat', mat.getName(), 'baseFactor', mat.getBaseColorFactor(), 'metal', mat.getMetallicFactor(), 'rough', mat.getRoughnessFactor(), Object.entries(slots).map(([k, t]) => k + ':' + (t ? t.getName() + ' ' + t.getSize() : 'none')).join(' | '));
console.log('textures', root.listTextures().map(t => t.getName()));
const skin = root.listSkins()[0]; const joints = skin.listJoints().map(j => j.getName());
const prim = root.listMeshes()[0].listPrimitives()[0];
const pos = prim.getAttribute('POSITION').getArray(), uv = prim.getAttribute('TEXCOORD_0').getArray(), J = prim.getAttribute('JOINTS_0').getArray(), W = prim.getAttribute('WEIGHTS_0').getArray();
const idx = prim.getIndices().getArray();
const dom = new Uint8Array(uv.length / 2);
for (let v = 0; v < dom.length; v++) { let b = 0, bw = -1; for (let k = 0; k < 4; k++) if (W[v * 4 + k] > bw) { bw = W[v * 4 + k]; b = J[v * 4 + k]; } dom[v] = b; }
fs.writeFileSync(`${out}_tris.json`, JSON.stringify({ joints, pos: Array.from(pos), uv: Array.from(uv), dom: Array.from(dom), idx: Array.from(idx) }));
console.log('verts', dom.length, 'tris', idx.length / 3);

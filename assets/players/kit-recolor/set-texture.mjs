// Replace a model's base colour texture (same UVs), keeping everything else.
// Usage: node set-texture.mjs <model.glb> <texture.webp> <out.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const [src, img, dst] = process.argv.slice(2);
const doc = await io.read(src);
const t = doc.getRoot().listMaterials()[0].getBaseColorTexture();
t.setImage(new Uint8Array(fs.readFileSync(img))).setMimeType('image/webp');
await io.write(dst, doc);
console.log(dst, fs.statSync(src).size, '->', fs.statSync(dst).size);

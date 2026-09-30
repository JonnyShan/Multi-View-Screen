// Shrinks a .glb for the game: textures resized and re-encoded as JPEG, geometry quantised and meshopt-compressed.
// The game decodes these with vendor/meshopt/meshopt_decoder.module.js (see loadModel in js/main.js).
//
//   node tools/compress-models.mjs <in.glb> <out.glb> [--base 2048] [--maps 1024] [--quality 80]
//
// --base   max size of base-colour textures (px)
// --maps   max size of every other texture: normal, metal/roughness, occlusion (px)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, reorder, quantize, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { statSync } from 'node:fs';

const [inp, out, ...rest] = process.argv.slice(2);
if (!inp || !out) { console.error('usage: node tools/compress-models.mjs <in.glb> <out.glb> [--base 2048] [--maps 1024] [--quality 80]'); process.exit(1); }
const opt = { base: 2048, maps: 1024, quality: 80 };
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = +rest[i + 1];

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inp);
const skinned = doc.getRoot().listSkins().length > 0;

await doc.transform(
  dedup(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: opt.quality, resize: [opt.base, opt.base], slots: /^baseColorTexture$/ }),
  // detail maps only: a texture that is also used as base colour (e.g. by KHR_materials_specular) keeps --base
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: Math.min(92, opt.quality + 4), resize: [opt.maps, opt.maps], slots: /^(normalTexture|metallicRoughnessTexture|occlusionTexture)$/ }),
  reorder({ encoder: MeshoptEncoder }),
  // 14-bit positions: under 0.2 mm on a 2 m bike. The game bakes the dequantisation transform back into the
  // geometry on load, so code that reads vertex positions still sees the original coordinates. Skinned meshes keep
  // float positions (their transform would land in the bind matrices, which the game can't undo).
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8, pattern: skinned ? /^(?!POSITION$)/ : /.*/ }),
);
doc.createExtension(EXTMeshoptCompression).setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write(out, doc);

const mb = (f) => (statSync(f).size / 1e6).toFixed(2) + ' MB';
console.log(`${inp} ${mb(inp)} -> ${out} ${mb(out)}`);

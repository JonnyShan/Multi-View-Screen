// Prints what is inside .glb files: nodes, vertex attributes and texture sizes.
//   node tools/inspect.mjs <file.glb> [...]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f); const root = doc.getRoot();
  console.log(f);
  for (const n of root.listNodes()) console.log('  node', n.getName(), 'mesh', !!n.getMesh(), 'skin', !!n.getSkin(), 'T', n.getTranslation().map(v=>+v.toFixed(3)), 'R', n.getRotation().map(v=>+v.toFixed(3)), 'S', n.getScale().map(v=>+v.toFixed(3)));
  for (const m of root.listMeshes()) for (const p of m.listPrimitives()) console.log('  prim', p.listSemantics().map(s => s + ':' + p.getAttribute(s).getComponentType() + 'x' + p.getAttribute(s).getElementSize()).join(' '), 'verts', p.getAttribute('POSITION').getCount(), 'idx', p.getIndices()?.getCount());
  for (const t of root.listTextures()) console.log('  tex', t.getMimeType(), t.getSize(), (t.getImage().byteLength/1e6).toFixed(2)+'MB');
}

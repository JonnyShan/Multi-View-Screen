// Rider: generated rigged GLBs (Meshy via Higgsfield, see ASSETS.md) -> assets/models/rider/rider.glb.
// Each move came back on its own auto-rig, so every clip is retargeted onto the
// base file's skeleton in world space (rest-pose relative), then renamed for the game.
// usage: node tools/art/rider.mjs base.glb name=clip.glb ... [--out file]
import { finish, hsv, io, paintMetalRough, plainMaterials, shrinkTextures, uvMask } from './lib.mjs';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args.splice(outIdx, 2)[1] : 'assets/models/rider/rider.glb';
const [basePath, baseName, ...rest] = args;
const sources = rest.map((a) => a.split('='));

// --- quaternion helpers ([x, y, z, w]) ---
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qinv = (q) => [-q[0], -q[1], -q[2], q[3]];
const qnorm = (q) => {
  const l = Math.hypot(...q) || 1;
  return q.map((v) => v / l);
};
function qslerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const bb = d < 0 ? b.map((v) => -v) : b;
  d = Math.abs(d);
  if (d > 0.9995) return qnorm(a.map((v, i) => v + (bb[i] - v) * t));
  const th = Math.acos(d), s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
  return a.map((v, i) => v * wa + bb[i] * wb);
}

/** Skeleton info: bones by name with parent names and rest local TRS. */
function skeleton(doc) {
  const skin = doc.getRoot().listSkins()[0];
  const joints = skin.listJoints();
  const names = new Set(joints.map((j) => j.getName()));
  const bones = new Map();
  for (const j of joints) {
    const parent = j.getParentNode();
    bones.set(j.getName(), { node: j, parent: parent && names.has(parent.getName()) ? parent.getName() : null, t: j.getTranslation(), r: j.getRotation() });
  }
  // world rest rotations (joints are listed parents first in these files, but walk to be safe)
  const world = new Map();
  const wr = (name) => {
    if (world.has(name)) return world.get(name);
    const b = bones.get(name);
    const w = b.parent ? qmul(wr(b.parent), b.r) : b.r;
    world.set(name, w);
    return w;
  };
  for (const n of bones.keys()) wr(n);
  return { bones, world, order: [...bones.keys()] };
}

/** Sample an animation's channels into per-time local rotations (and hips translation). */
function sampleAnimation(anim) {
  const rot = new Map(), trans = new Map();
  let times = null;
  for (const ch of anim.listChannels()) {
    const s = ch.getSampler();
    const input = Array.from(s.getInput().getArray());
    const output = s.getOutput();
    const n = ch.getTargetNode()?.getName();
    const path = ch.getTargetPath();
    const vals = [];
    const el = path === 'rotation' ? [0, 0, 0, 0] : [0, 0, 0];
    for (let i = 0; i < output.getCount(); i++) vals.push(output.getElement(i, el.slice()));
    if (path === 'rotation') rot.set(n, { input, vals });
    if (path === 'translation') trans.set(n, { input, vals });
    if (!times || input.length > times.length) times = input;
  }
  const at = (track, t, lerp) => {
    const { input, vals } = track;
    if (t <= input[0]) return vals[0];
    if (t >= input[input.length - 1]) return vals[vals.length - 1];
    let i = 1;
    while (input[i] < t) i++;
    const k = (t - input[i - 1]) / (input[i] - input[i - 1]);
    return lerp(vals[i - 1], vals[i], k);
  };
  return {
    times,
    rot: (name, t) => (rot.has(name) ? at(rot.get(name), t, qslerp) : null),
    trans: (name, t) => (trans.has(name) ? at(trans.get(name), t, (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)) : null),
  };
}

const HIPS = 'Hips';
/** hips motion kept per clip: y bob for locomotion, the drop for the knockdown, none for the jump */
const KEEP_Y = { idle: true, run: true, walk: true, slash: true, fall: true, jump: false };

function retarget(target, tgtSkel, srcSkel, anim, name) {
  const smp = sampleAnimation(anim);
  const buffer = target.getRoot().listBuffers()[0];
  const out = target.createAnimation(name);
  const times = smp.times;
  const tgtNames = tgtSkel.order.filter((n) => srcSkel.bones.has(n));
  const rotOut = new Map(tgtNames.map((n) => [n, []]));
  const hipsOut = [];
  const srcHipsRest = srcSkel.bones.get(HIPS).t;
  const tgtHipsRest = tgtSkel.bones.get(HIPS).t;
  for (const t of times) {
    const sw = new Map(), tw = new Map();
    for (const n of srcSkel.order) {
      const b = srcSkel.bones.get(n);
      const local = smp.rot(n, t) ?? b.r;
      sw.set(n, b.parent ? qmul(sw.get(b.parent), local) : local);
    }
    for (const n of tgtSkel.order) {
      const b = tgtSkel.bones.get(n);
      let w;
      if (sw.has(n)) w = qmul(qmul(sw.get(n), qinv(srcSkel.world.get(n))), tgtSkel.world.get(n));
      else w = b.parent ? qmul(tw.get(b.parent), b.r) : b.r;
      tw.set(n, qnorm(w));
      if (rotOut.has(n)) rotOut.get(n).push(...qnorm(b.parent ? qmul(qinv(tw.get(b.parent)), tw.get(n)) : tw.get(n)));
    }
    const ht = smp.trans(HIPS, t) ?? srcHipsRest;
    const dy = KEEP_Y[name] ? ht[1] - srcHipsRest[1] : 0;
    hipsOut.push(tgtHipsRest[0], tgtHipsRest[1] + dy, tgtHipsRest[2]);
  }
  const input = target.createAccessor().setType('SCALAR').setArray(new Float32Array(times)).setBuffer(buffer);
  const add = (node, path, arr, type) => {
    const sampler = target.createAnimationSampler().setInput(input).setOutput(target.createAccessor().setType(type).setArray(new Float32Array(arr)).setBuffer(buffer)).setInterpolation('LINEAR');
    out.addSampler(sampler).addChannel(target.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(sampler));
  };
  for (const n of tgtNames) add(tgtSkel.bones.get(n).node, 'rotation', rotOut.get(n), 'VEC4');
  add(tgtSkel.bones.get(HIPS).node, 'translation', hipsOut, 'VEC3');
  return times.length;
}

const target = await io.read(basePath);
const tgtSkel = skeleton(target);
const own = target.getRoot().listAnimations();
// the base file's own clip goes through the same path (drops scale tracks and root drift)
const report = [];
for (const a of own) {
  report.push(`${baseName}:${retarget(target, tgtSkel, tgtSkel, a, baseName)}`);
  a.dispose();
}
for (const [name, file] of sources) {
  const src = await io.read(file);
  const srcSkel = skeleton(src);
  const anim = src.getRoot().listAnimations()[0];
  report.push(`${name}:${retarget(target, tgtSkel, srcSkel, anim, name)}`);
}
// The generated material is all metal with the colour map reused as glow,
// which renders as a bronze statue. Leather instead, with a glossy helmet
// (triangles skinned to the head).
plainMaterials(target);
const helmet = uvMask();
const skin = target.getRoot().listSkins()[0];
const headJoints = new Set(skin.listJoints().flatMap((j, i) => (/head/i.test(j.getName()) ? [i] : [])));
const jw = [0, 0, 0, 0], ww = [0, 0, 0, 0];
for (const mesh of target.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const joints = prim.getAttribute('JOINTS_0'), weights = prim.getAttribute('WEIGHTS_0');
    if (!joints || !weights) continue;
    const onHead = (i) => {
      joints.getElement(i, jw);
      weights.getElement(i, ww);
      let head = 0, all = 0;
      for (let k = 0; k < 4; k++) {
        all += ww[k];
        if (headJoints.has(jw[k])) head += ww[k];
      }
      return all > 0 && head / all > 0.5;
    };
    helmet.paint(prim, (x, y, z, i0, i1, i2) => onHead(i0) && onHead(i1) && onHead(i2));
  }
}
for (const m of target.getRoot().listMaterials()) {
  await paintMetalRough(target, m, (r, g, b, u, v) => {
    const [hue, sat, val] = hsv(r, g, b);
    if (helmet.at(u, v)) return [0, val < 0.25 ? 0.15 : 0.3]; // helmet shell and visor
    if (sat > 0.4 && val > 0.2 && (hue < 25 || hue > 335)) return [0, 0.4]; // red piping
    if (sat < 0.25 && val > 0.3) return [0, 0.35]; // armour panels
    return [0, 0.45]; // leather, with a sheen that catches street lights
  });
}
await shrinkTextures(target, 1024);
await finish(target, out);
console.log(`wrote ${out}; clips (keyframes): ${report.join(' ')}`);

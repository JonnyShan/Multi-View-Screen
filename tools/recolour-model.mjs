// Repaints the livery baked into a model's base-colour texture: every pixel in a colour family (red, cream...) is
// moved to a new brand colour, keeping its shading. For a bike reskin, run it on the bike and rider, then compress.
//
//   node tools/recolour-model.mjs <in.glb> <out.glb> --map red=#CBFE00 --map cream=#1A1A1A [--map white=#F1F1F1]
//
// Families (hue in degrees, saturation and value 0..1):
//   red    hue < 20 or > 330, saturation > 0.35          (Wild Turkey red panels)
//   cream  hue 20-60, saturation 0.12-0.5, value > 0.5   (cream stripes and trims)
//   gold   hue 28-58, saturation > 0.5, value > 0.35     (gold wheels and anodised parts)
//   white  saturation < 0.12, value > 0.78               (white panels)
//   lime   hue 55-100, saturation > 0.3, value > 0.25    (yellow-green paint, e.g. a generated Livewire bike)
// Blacks, greys and metals are left alone. Edges blend softly, so anti-aliased borders stay clean.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const [inp, out, ...rest] = process.argv.slice(2);
if (!inp || !out) { console.error('usage: node tools/recolour-model.mjs <in.glb> <out.glb> --map red=#CBFE00 [--map cream=#1A1A1A] ...'); process.exit(1); }
const maps = {};
for (let i = 0; i < rest.length; i += 2) if (rest[i] === '--map') { const [k, v] = rest[i + 1].split('='); maps[k] = v; }

const hex = (c) => { const n = parseInt(c.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => v / 255); };
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// weight 0..1 of each family for a pixel (h in degrees, s, v)
const FAMILY = {
  red: (h, s, v) => (h < 20 || h > 330 ? 1 : h < 30 ? 1 - (h - 20) / 10 : h > 320 ? (h - 320) / 10 : 0) * smooth(0.25, 0.45, s) * smooth(0.06, 0.14, v),
  cream: (h, s, v) => (h >= 20 && h <= 60 ? 1 : 0) * smooth(0.08, 0.16, s) * (1 - smooth(0.45, 0.55, s)) * smooth(0.42, 0.55, v),
  gold: (h, s, v) => (h >= 28 && h <= 58 ? 1 : 0) * smooth(0.45, 0.55, s) * smooth(0.3, 0.4, v),
  white: (h, s, v) => (1 - smooth(0.08, 0.16, s)) * smooth(0.7, 0.82, v),
  lime: (h, s, v) => (h >= 55 && h <= 100 ? 1 : h > 48 && h < 55 ? (h - 48) / 7 : h > 100 && h < 108 ? (108 - h) / 8 : 0) * smooth(0.2, 0.32, s) * smooth(0.18, 0.28, v),
};
for (const k of Object.keys(maps)) if (!FAMILY[k]) { console.error(`unknown family "${k}" (use ${Object.keys(FAMILY).join(', ')})`); process.exit(1); }

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
const done = new Set();
for (const mat of doc.getRoot().listMaterials()) {
  const tex = mat.getBaseColorTexture();
  if (!tex || done.has(tex)) continue;
  done.add(tex);
  const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // reference brightness of each family = median value of its confident pixels, so shading maps relative to it
  const samples = Object.fromEntries(Object.keys(maps).map(k => [k, []]));
  const hsv = (r, g, b) => {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d > 1e-6) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return [(h + 360) % 360, mx ? d / mx : 0, mx];
  };
  for (let i = 0; i < data.length; i += 3 * 37) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255, [h, s, v] = hsv(r, g, b);
    for (const k in samples) if (FAMILY[k](h, s, v) > 0.9) samples[k].push(lum([r, g, b]));
  }
  const ref = Object.fromEntries(Object.entries(samples).map(([k, a]) => [k, a.length ? a.sort((x, y) => x - y)[a.length >> 1] : 0.5]));
  const target = Object.fromEntries(Object.entries(maps).map(([k, c]) => [k, hex(c)]));
  let changed = 0;
  for (let i = 0; i < data.length; i += 3) {
    let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const [h, s, v] = hsv(r, g, b), L = lum([r, g, b]);
    for (const k in target) {
      const w = FAMILY[k](h, s, v);
      if (w <= 0) continue;
      const t = target[k], shade = Math.min(1.6, L / Math.max(0.02, ref[k]));
      // keep the relative shading: darker than the family's usual tone stays darker on the new colour
      const nr = Math.min(1, t[0] * shade), ng = Math.min(1, t[1] * shade), nb = Math.min(1, t[2] * shade);
      r += (nr - r) * w; g += (ng - g) * w; b += (nb - b) * w;
      changed += w > 0.5;
    }
    data[i] = r * 255; data[i + 1] = g * 255; data[i + 2] = b * 255;
  }
  tex.setImage(new Uint8Array(await sharp(data, { raw: info }).jpeg({ quality: 92 }).toBuffer())).setMimeType('image/jpeg');
  console.log(`${tex.getName() || 'texture'} ${info.width}x${info.height}: ${(100 * changed / (data.length / 3)).toFixed(1)}% repainted (reference tones ${JSON.stringify(Object.fromEntries(Object.entries(ref).map(([k, x]) => [k, +x.toFixed(3)])))})`);
}
await io.write(out, doc);
console.log(`wrote ${out}`);

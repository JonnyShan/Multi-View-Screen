# Recolour a model's kit in its texture: pixels of the chosen body parts that are cloth-white (or the umpire's grey)
# become the team colour, keeping the folds and shading. Pads, gloves, boots, skin and black trim are left alone.
# Needs Pillow, NumPy and SciPy, plus Node with @gltf-transform/core and @gltf-transform/extensions. In a scratch folder:
#   node dump-uvs.mjs assets/players/rival-bowler.glb rival-bowler    -> rival-bowler_tris.json (positions, UVs, bones)
#   cp assets/players/rival-bowler.webp rival-bowler_base.webp        (each model's texture is the .webp beside it)
#   python3 recolor.py rival-bowler                                    -> rival-bowler_recol.webp
# then copy rival-bowler_recol.webp over assets/players/rival-bowler.webp.
import json, sys, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
GROUP = {'Hips':'pants','LeftUpLeg':'pants','RightUpLeg':'pants','LeftLeg':'shin','RightLeg':'shin','LeftFoot':'foot','RightFoot':'foot','LeftToeBase':'foot','RightToeBase':'foot',
         'Spine02':'shirt','Spine01':'shirt','Spine':'shirt','LeftShoulder':'shirt','RightShoulder':'shirt','LeftArm':'sleeve','RightArm':'sleeve','LeftForeArm':'fore','RightForeArm':'fore',
         'LeftHand':'hand','RightHand':'hand','neck':'neck','Head':'head','head_end':'head','headfront':'head'}
CFG = {
  'rival-bowler': dict(groups={'pants','shin','shirt','sleeve','neck'}, pad=None, color='#2563EB', mode='white'),
  'rival-batter': dict(groups={'pants','shin','shirt','sleeve','neck'}, pad=0.70, color='#2563EB', mode='white'),
  'umpire':       dict(groups={'shirt','sleeve','fore','neck'}, pad=None, color='#E8407A', mode='grey'),
}
def s2l(c): c = np.asarray(c, np.float64); return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def l2s(c): c = np.clip(c, 0, 1); return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)
m = sys.argv[1]; cfg = CFG[m]
d = json.load(open(f'{m}_tris.json'))
uv = np.array(d['uv']).reshape(-1, 2); pos = np.array(d['pos']).reshape(-1, 3); dom = d['dom']; idx = np.array(d['idx']).reshape(-1, 3)
base = Image.open(f'{m}_base.webp').convert('RGB'); S = base.width
lab = Image.new('L', (S, S), 0); dr = ImageDraw.Draw(lab)
for t in idx:
    gs = [GROUP.get(d['joints'][dom[v]], 'head') for v in t]; g = max(set(gs), key=gs.count)
    kit = g in cfg['groups']
    if kit and cfg['pad'] is not None and g in ('pants', 'shin') and pos[t, 1].mean() < cfg['pad']: kit = False
    dr.polygon([(uv[v][0] * S, uv[v][1] * S) for v in t], fill=2 if kit else 1)
L = np.array(lab)
# grow the islands into the gaps so mip-mapping at island edges doesn't pull in the old colour
_, (iy, ix) = ndimage.distance_transform_edt(L == 0, return_indices=True)
L = L[iy, ix]
a = np.asarray(base).astype(np.float64) / 255
mx, mn = a.max(-1), a.min(-1); sat = (mx - mn) / (mx + 1e-6)
smooth = lambda x, e0, e1: np.clip((x - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((x - e0) / (e1 - e0), 0, 1))
if cfg['mode'] == 'white': w = smooth(mx, 0.32, 0.55) * (1 - smooth(sat, 0.12, 0.24))
else:                      w = smooth(mx, 0.12, 0.22) * (1 - smooth(mx, 0.86, 0.95)) * (1 - smooth(sat, 0.1, 0.2))
w *= (L == 2)
lin = s2l(a); Y = lin @ np.array([0.2126, 0.7152, 0.0722])
Yw = np.median(Y[w > 0.9]) if (w > 0.9).any() else 0.6
T = s2l(np.array([int(cfg['color'][i:i + 2], 16) / 255 for i in (1, 3, 5)]))
k = (Y / Yw)[..., None]
new = T * np.minimum(k, 1) + np.maximum(k - 1, 0) * (T + (1 - T) * 0.35)   # folds darken; highlights get a touch of sheen
out = l2s(lin * (1 - w[..., None]) + new * w[..., None])
img = Image.fromarray((out * 255 + 0.5).astype(np.uint8))
img.save(f'{m}_recol.webp', quality=88, method=6)
img.resize((512, 512)).save(f'{m}_recol_prev.jpg', quality=85)
print(m, 'recoloured px', int((w > 0.5).sum()), 'Yw', round(float(Yw), 3))

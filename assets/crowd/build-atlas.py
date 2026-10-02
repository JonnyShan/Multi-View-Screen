# Build the crowd atlas from AI sprite sheets (8 x 2 grids of fans, transparent background).
# Inputs (not committed, 4K PNGs generated on Higgsfield with GPT Image 2.5):
#   seatA_raw.png, seatB_raw.png    seated fans in their seats      (jobs 3403c509-7af8-4f7b-a3bd-ac65ce263193, 76b49140-cf44-4e00-b607-18c86520cb16)
#   cheerA_raw.png, cheerB_raw.png  the same fans standing to cheer (jobs 8d4e2c65-6118-4038-b0ea-78c0f568313e, bc52d391-fe6d-4829-be16-0d609fc240db)
# Output: fans.webp + fans.json (cell layout). Seated cells are 0.95 m x 1.6 m, cheering cells 1.1 m x 2.3 m,
# each with the fan's feet / seat legs on the cell's bottom edge.
import numpy as np, json
from PIL import Image
SHEETS = [('seatA_raw.png', 'cheerA_raw.png'), ('seatB_raw.png', 'cheerB_raw.png')]
IDLE = dict(w=0.95, h=1.6, P=150, ref=1.28)       # ref: typical seated height (floor to head top), metres
CHEER = dict(w=1.1, h=2.3, P=112, ref=1.72)       # ref: typical standing height to the head top
COLS = 8
def load(n): return np.asarray(Image.open(n).convert('RGBA')).astype(np.float32)
def split(sum_, n, size):
    cuts, step = [0], size / n
    for k in range(1, n):
        c = int(k * step); lo, hi = int(c - step * 0.35), int(c + step * 0.35)
        cuts.append(lo + int(np.argmin(sum_[lo:hi])))
    return cuts + [size]
def cells(img):
    m = img[..., 3] > 24
    H, W = m.shape
    rc, out = split(m.sum(1), 2, H), []
    for r in range(2):
        band = m[rc[r]:rc[r + 1]]
        cc = split(band.sum(0), 8, W)
        for c in range(8):
            sub = band[:, cc[c]:cc[c + 1]]
            if sub.sum() < 2000: out.append(None); continue           # empty cell
            ys, xs = np.nonzero(sub)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            legs = sub[y1 - int((y1 - y0) * 0.25):y1]
            lx = np.nonzero(legs)[1].mean()                              # horizontal anchor: the legs / seat stem
            hb = sub[:, max(0, int(lx - (x1 - x0) * 0.08)):int(lx + (x1 - x0) * 0.08)]
            hy = np.nonzero(hb.any(1))[0].min()                          # head top, near the centre line
            out.append(dict(Y0=rc[r] + y0, Y1=rc[r] + y1, X0=cc[c] + x0, X1=cc[c] + x1, ax=cc[c] + lx, head=rc[r] + hy))
    return out
fans = []                                                                # (idle img, idle cell, cheer img, cheer cell)
for si, sc in SHEETS:
    a, b = load(si), load(sc)
    ca, cb = cells(a), cells(b)
    for i in range(16):
        if ca[i] is None: continue
        fans.append((a, ca[i], b if cb[i] is not None else None, cb[i]))
def scale(cl, ref):
    return np.median([c['Y1'] - c['head'] for c in cl]) / ref           # px per metre in the source sheet
src_scale = {}
for f in fans:
    for img, key, ref in [(f[0], 1, IDLE['ref']), (f[2], 3, CHEER['ref'])]:
        if img is not None and id(img) not in src_scale:
            src_scale[id(img)] = scale([g[key] for g in fans if g[key - 1] is img and g[key] is not None], ref)
print('fans', len(fans), 'px/m', [round(v) for v in src_scale.values()])
n = len(fans); rows = (n + COLS - 1) // COLS
iw, ih = round(IDLE['w'] * IDLE['P']), round(IDLE['h'] * IDLE['P'])
cw, ch = round(CHEER['w'] * CHEER['P']), round(CHEER['h'] * CHEER['P'])
W = max(iw, cw) * COLS; H = ih * rows + ch * rows
atlas = np.zeros((H, W, 4), np.float32)
def keep_main(crop, ax):
    # drop bits of neighbouring fans that leaked into this cell: keep only the region connected to the fan's centre line
    m = crop[::4, ::4, 3] > 24
    seed = np.zeros_like(m); c = int(ax / 4)
    seed[:, max(0, c - 3):c + 4] = m[:, max(0, c - 3):c + 4]
    while True:
        grown = seed.copy()
        grown[1:] |= seed[:-1]; grown[:-1] |= seed[1:]; grown[:, 1:] |= seed[:, :-1]; grown[:, :-1] |= seed[:, 1:]
        grown &= m
        if (grown == seed).all(): break
        seed = grown
    keep = np.repeat(np.repeat(seed, 4, 0), 4, 1)[:crop.shape[0], :crop.shape[1]]
    k2 = keep.copy()                                                  # grow back one block so soft edges survive
    k2[4:] |= keep[:-4]; k2[:-4] |= keep[4:]; k2[:, 4:] |= keep[:, :-4]; k2[:, :-4] |= keep[:, 4:]
    out = crop.copy(); out[~k2] = 0
    return out
def place(img, c, s, P, CWp, CHp, ox0, oy0):
    k = P / s
    crop = keep_main(img[c['Y0']:c['Y1'], c['X0']:c['X1']], c['ax'] - c['X0'])
    w, h, ax = (c['X1'] - c['X0']) * k, (c['Y1'] - c['Y0']) * k, (c['ax'] - c['X0']) * k
    fit = min(1.0, (CHp - 2) / h, (CWp / 2 - 1) / max(ax, 1), (CWp / 2 - 1) / max(w - ax, 1))
    w, h, ax = w * fit, h * fit, ax * fit
    pm = crop.copy(); pm[..., :3] *= pm[..., 3:] / 255                  # premultiply before resizing
    pm = np.asarray(Image.fromarray(pm.astype(np.uint8), 'RGBA').resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)).astype(np.float32)
    ox = ox0 + round(CWp / 2 - ax); oy = oy0 + CHp - 1 - pm.shape[0]
    x0, y0 = max(ox, ox0), max(oy, oy0)
    atlas[y0:oy + pm.shape[0], x0:ox + pm.shape[1]] = pm[y0 - oy:, x0 - ox:]
    return fit
for i, (a, ca, b, cb) in enumerate(fans):
    col, row = i % COLS, i // COLS
    f1 = place(a, ca, src_scale[id(a)], IDLE['P'], iw, ih, col * iw, row * ih)
    if b is None: b, cb = a, ca                                          # no cheering frame: stay seated
    f2 = place(b, cb, src_scale[id(b)], CHEER['P'], cw, ch, col * cw, rows * ih + row * ch)
    if min(f1, f2) < 0.97: print('fan', i, 'shrunk', round(f1, 2), round(f2, 2))
a = atlas[..., 3:]
rgb = np.where(a > 0, atlas[..., :3] / np.maximum(a, 1e-3) * 255, 0)
known = (a[..., 0] > 8).astype(np.float32)
fill, wsum = rgb * known[..., None], known.copy()
sh = lambda x, dy, dx: np.roll(np.roll(x, dy, 0), dx, 1)
for it in range(24):                                                   # bleed colour outward so mipmaps keep clean edges
    nf = sum(sh(fill, dy, dx) for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)])
    nw = sum(sh(wsum, dy, dx) for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)])
    grow = (wsum == 0) & (nw > 0)
    fill[grow] = nf[grow]; wsum[grow] = nw[grow]
col = np.where(wsum[..., None] > 0, fill / np.maximum(wsum[..., None], 1e-3), 30)
out = np.concatenate([np.clip(col, 0, 255), a], -1).astype(np.uint8)
Image.fromarray(out, 'RGBA').save('fans.png')
Image.fromarray(out, 'RGBA').save('fans.webp', quality=80, alpha_quality=80, method=6)
prev = Image.new('RGBA', (W, H), (90, 90, 100, 255)); prev.alpha_composite(Image.fromarray(out, 'RGBA'))
prev.convert('RGB').save('fans_preview.jpg', quality=85)
json.dump(dict(fans=n, cols=COLS, rows=rows, W=W, H=H, idle=[iw, ih, IDLE['w'], IDLE['h']], cheer=[cw, ch, CHEER['w'], CHEER['h']]), open('fans.json', 'w'))
print('atlas', W, 'x', H, open('fans.json').read())

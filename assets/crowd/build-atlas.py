# Build the crowd atlas: 16 fans x {idle, cheer} cut from two 8x2 AI sprite sheets.
# Inputs (not committed, 4K PNGs with transparency): idle_raw.png and cheer_raw.png, generated on Higgsfield
# with GPT Image 2.5 (jobs c760b094-c4f6-4124-9d91-343f2e0165d8 and c010ef29-98a5-481a-b10f-956493531581).
# Usage: python3 build-atlas.py [px_per_metre=160]  ->  fans.webp
# Cell = 1.1 m x 2.3 m of world space at P px/m, feet on the cell's bottom edge.
import numpy as np, json, sys
from PIL import Image
P = int(sys.argv[1]) if len(sys.argv) > 1 else 160
CW, CH = round(1.1 * P), round(2.3 * P)
def load(n):
    a = np.asarray(Image.open(n).convert('RGBA')).astype(np.float32)
    return a
def split(sum_, n, size):
    cuts = [0]
    step = size / n
    for k in range(1, n):
        c = int(k * step); lo, hi = int(c - step * 0.35), int(c + step * 0.35)
        cuts.append(lo + int(np.argmin(sum_[lo:hi])))
    cuts.append(size)
    return cuts
def cells(img):
    m = img[..., 3] > 24
    H, W = m.shape
    rc = split(m.sum(1), 2, H)
    out = []
    for r in range(2):
        band = m[rc[r]:rc[r + 1]]
        cc = split(band.sum(0), 8, W)
        for c in range(8):
            sub = band[:, cc[c]:cc[c + 1]]
            ys, xs = np.nonzero(sub)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            # horizontal anchor: centroid of the legs (lowest 30% of the figure)
            legs = sub[y1 - int((y1 - y0) * 0.3):y1]
            lx = np.nonzero(legs)[1].mean()
            # head top: topmost pixel in a narrow band around the leg centre (arms are off to the sides)
            hb = sub[:, max(0, int(lx - (x1 - x0) * 0.08)):int(lx + (x1 - x0) * 0.08)]
            hy = np.nonzero(hb.any(1))[0].min()
            out.append(dict(Y0=rc[r] + y0, Y1=rc[r] + y1, X0=cc[c] + x0, X1=cc[c] + x1, ax=cc[c] + lx, head=rc[r] + hy))
    return out
idle, cheer = load('idle_raw.png'), load('cheer_raw.png')
ci, cc = cells(idle), cells(cheer)
hi = np.array([c['Y1'] - c['head'] for c in ci]); hc = np.array([c['Y1'] - c['head'] for c in cc])
s_idle = np.median(hi) / 1.72
ratios = hc / hi
s_cheer = s_idle * np.median(ratios)
print('px/m idle %.1f cheer %.1f; ratio per fan' % (s_idle, s_cheer), np.round(ratios, 2))
atlas = np.zeros((CH * 4, CW * 8, 4), np.float32)
for sheet, (img, cl, s) in enumerate([(idle, ci, s_idle), (cheer, cc, s_cheer)]):
    for i, c in enumerate(cl):
        k = P / s
        crop = img[c['Y0']:c['Y1'], c['X0']:c['X1']]
        w, h = (c['X1'] - c['X0']) * k, (c['Y1'] - c['Y0']) * k
        ax = (c['ax'] - c['X0']) * k
        fit = min(1.0, (CH - 2) / h, (CW / 2 - 1) / max(ax, 1), (CW / 2 - 1) / max(w - ax, 1))
        if fit < 1: print('fan', i, 'sheet', sheet, 'shrunk to fit', round(fit, 2))
        k *= fit; w, h, ax = w * fit, h * fit, ax * fit
        im = Image.fromarray(crop.astype(np.uint8), 'RGBA')
        # premultiply before resizing so edges don't pick up the transparent pixels' colour
        pm = np.asarray(im).astype(np.float32); pm[..., :3] *= pm[..., 3:] / 255
        pm = Image.fromarray(pm.astype(np.uint8), 'RGBA').resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)
        pm = np.asarray(pm).astype(np.float32)
        row, col = sheet * 2 + i // 8, i % 8
        ox = col * CW + round(CW / 2 - ax); oy = row * CH + CH - 1 - pm.shape[0]
        atlas[oy:oy + pm.shape[0], ox:ox + pm.shape[1]] = pm
# un-premultiply, then bleed colour into the transparent area so mipmaps don't darken the edges
a = atlas[..., 3:]
rgb = np.where(a > 0, atlas[..., :3] / np.maximum(a, 1e-3) * 255, 0)
known = (a[..., 0] > 8).astype(np.float32)
fill, wsum = rgb * known[..., None], known.copy()
for it in range(24):
    sh = lambda x, dy, dx: np.roll(np.roll(x, dy, 0), dx, 1)
    nf = sum(sh(fill, dy, dx) for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)])
    nw = sum(sh(wsum, dy, dx) for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)])
    grow = (wsum == 0) & (nw > 0)
    fill[grow] = nf[grow]; wsum[grow] = nw[grow]
col = np.where(wsum[..., None] > 0, fill / np.maximum(wsum[..., None], 1e-3), 40)
out = np.concatenate([np.clip(col, 0, 255), a], -1).astype(np.uint8)
Image.fromarray(out, 'RGBA').save('fans.png')
Image.fromarray(out, 'RGBA').save('fans.webp', quality=80, alpha_quality=80, method=6)
prev = Image.new('RGBA', (out.shape[1], out.shape[0]), (90, 90, 100, 255)); prev.alpha_composite(Image.fromarray(out, 'RGBA'))
prev.convert('RGB').save('fans_preview.jpg', quality=85)
print('atlas', out.shape[1], 'x', out.shape[0], 'cell', CW, CH)

#!/usr/bin/env python3
"""Composite generated base items into exact-dimension game sprites.
Each piece = canvas of (cols*UNIT, rows*UNIT). Items are trimmed to content, cover-fit
into their cell box, composited, then the whole sprite is edge-filled to fully opaque so
every solid cell paints with no field-green showing."""
from PIL import Image, ImageDraw
import numpy as np, os

SRC = "/tmp/oai"; OUT = "/tmp/oai_out"; os.makedirs(OUT, exist_ok=True)
UNIT = 256

# piece -> (cols, rows, [ (item, cx, cy, cw, ch) ... ])
PIECES = {
    "sub":       (4, 1, [("sub", 0, 0, 4, 1)]),
    "shampoo":   (1, 2, [("shampoo", 0, 0, 1, 2)]),
    "toilet":    (1, 1, [("toilet", 0, 0, 1, 1)]),
    "toast":     (2, 3, [("toast", 0, 0, 1, 1), ("toast", 0, 1, 1, 1), ("toast", 1, 1, 1, 1), ("toast", 1, 2, 1, 1)]),
    "eggs":      (2, 3, [("eggcarton", 0, 0, 1, 2), ("milk", 1, 1, 1, 2)]),
    "banana":    (2, 3, [("drink", 0, 0, 1, 2), ("burger", 0, 2, 1, 1), ("fries", 1, 2, 1, 1)]),
    "groceries": (3, 2, [("dumpling", 0, 0, 1, 1), ("salad", 1, 0, 1, 1), ("springroll", 2, 0, 1, 1), ("takeout", 1, 1, 1, 1)]),
}
CELLS = {
    "sub": [[1,1,1,1]], "shampoo": [[1],[1]], "toilet": [[1]],
    "toast": [[1,0],[1,1],[0,1]], "eggs": [[1,0],[1,1],[0,1]],
    "banana": [[1,0],[1,0],[1,1]], "groceries": [[1,1,1],[0,1,0]],
}

def trim(im):
    a = np.asarray(im); al = a[:, :, 3]
    ys, xs = np.where(al > 16)
    if len(xs) == 0: return im
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def cover(im, W, H):
    im = trim(im); iw, ih = im.size
    s = max(W / iw, H / ih); nw, nh = max(1, round(iw * s)), max(1, round(ih * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    x = (nw - W) // 2; y = (nh - H) // 2
    return im.crop((x, y, x + W, y + H))

def edge_fill(a):
    rgb = a[:, :, :3].astype(np.int16); al = a[:, :, 3]
    filled = rgb.copy(); m = al > 16
    if not m.any(): return a
    while not m.all():
        prev = int(m.sum())
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,0),(0,-1)]:
            sm = np.roll(np.roll(m, dy, 0), dx, 1); sr = np.roll(np.roll(filled, dy, 0), dx, 1)
            take = (~m) & sm; filled[take] = sr[take]; m = m | take
        if int(m.sum()) == prev: break
    return np.dstack([np.clip(filled, 0, 255).astype(np.uint8), np.full(al.shape, 255, np.uint8)])

def build(name):
    cols, rows, items = PIECES[name]
    canvas = Image.new("RGBA", (cols * UNIT, rows * UNIT), (0, 0, 0, 0))
    for item, cx, cy, cw, ch in items:
        im = Image.open(f"{SRC}/{item}.png").convert("RGBA")
        fit = cover(im, cw * UNIT, ch * UNIT)
        canvas.alpha_composite(fit, (cx * UNIT, cy * UNIT))
    out = Image.fromarray(edge_fill(np.asarray(canvas)), "RGBA")
    out.save(f"{OUT}/{name}.png")
    return out

def montage():
    FIELD = (94, 157, 97); C = 64
    tiles = []
    for name in ["sub", "shampoo", "toilet", "toast", "eggs", "banana", "groceries"]:
        spr = Image.open(f"{OUT}/{name}.png").convert("RGBA"); cells = CELLS[name]
        r = len(cells); c = len(cells[0]); sw = spr.width / c; sh = spr.height / r
        img = Image.new("RGBA", (c * C, r * C), FIELD + (255,))
        for y in range(r):
            for x in range(c):
                if not cells[y][x]: continue
                t = spr.crop((round(x*sw), round(y*sh), round((x+1)*sw), round((y+1)*sh))).resize((C, C))
                img.alpha_composite(t, (x*C, y*C))
        d = ImageDraw.Draw(img)
        for x in range(c+1): d.line([(x*C,0),(x*C,r*C)], fill=(0,0,0,50))
        for y in range(r+1): d.line([(0,y*C),(c*C,y*C)], fill=(0,0,0,50))
        tiles.append((name, img))
    pad = 14; lbl = 18; mh = max(i.height for _, i in tiles)
    W = sum(i.width for _, i in tiles) + pad * (len(tiles)+1); H = mh + lbl + pad*2
    cv = Image.new("RGB", (W, H), FIELD); d = ImageDraw.Draw(cv); x = pad
    for name, img in tiles:
        cv.paste(img.convert("RGB"), (x, pad+lbl)); d.text((x, pad), name, fill=(0,0,0)); x += img.width + pad
    cv.save("/tmp/oai_montage.png"); print("montage saved", cv.size)

if __name__ == "__main__":
    for n in PIECES: build(n); print("built", n)
    montage()

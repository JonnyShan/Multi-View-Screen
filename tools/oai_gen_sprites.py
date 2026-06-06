#!/usr/bin/env python3
import os, sys, json, base64, urllib.request, time

KEY = os.environ["OPENAI_API_KEY"]
MODEL = os.environ.get("OAI_MODEL", "gpt-image-1")
OUT = "/tmp/oai"; os.makedirs(OUT, exist_ok=True)

STYLE = ("Detailed 16-bit pixel-art video game food item sprite, bright saturated colors, "
         "bold clean dark outline, soft flat cel shading, centered, front view, "
         "transparent background, no plate, no tray, no shadow, no text, no border, fills the frame.")

ITEMS = {
    "sub":       ("A long submarine sandwich on a sesame roll, side view, packed with lettuce, tomato, cheese and sliced meat, filling the frame horizontally.", "1024x1024"),
    "shampoo":   ("A tall pink shampoo pump bottle, front view, glossy plastic.", "1024x1536"),
    "toilet":    ("A single roll of white toilet paper standing upright, front view.", "1024x1024"),
    "toast":     ("A square slice of avocado toast, thick mashed green avocado on golden toasted sourdough bread, top-down view.", "1024x1024"),
    "eggcarton": ("An open egg carton seen from above, six white eggs arranged in two columns of three, tall portrait orientation.", "1024x1536"),
    "milk":      ("A tall white milk carton with a simple blue label, front view, slightly glossy.", "1024x1536"),
    "drink":     ("A tall soft-drink fountain cup with a domed lid and a straw, front view.", "1024x1536"),
    "burger":    ("A classic cheeseburger with sesame bun, lettuce and tomato, front view.", "1024x1024"),
    "fries":     ("A red carton of golden french fries, front view.", "1024x1024"),
    "dumpling":  ("A round bamboo steamer basket full of dumplings, top-down view.", "1024x1024"),
    "salad":     ("A round bowl of fresh green salad with tomato, top-down view.", "1024x1024"),
    "springroll":("Three crispy golden spring rolls stacked, top-down view.", "1024x1024"),
    "takeout":   ("A white Chinese takeout noodle box with a red pagoda design and chopsticks, front view.", "1024x1024"),
}

def gen(name, prompt, size):
    out = f"{OUT}/{name}.png"
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print("skip", name); return
    body = json.dumps({"model": MODEL, "prompt": prompt + " " + STYLE, "size": size,
                       "background": "transparent", "output_format": "png", "quality": "high", "n": 1}).encode()
    req = urllib.request.Request("https://api.openai.com/v1/images/generations", data=body,
                                 headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.load(r)
            open(out, "wb").write(base64.b64decode(d["data"][0]["b64_json"]))
            print("OK", name, size); return
        except urllib.error.HTTPError as e:
            b = e.read().decode()[:200]
            if e.code in (520, 502, 503, 500, 429):
                print("retry", name, e.code); time.sleep(5); continue
            print("FAIL", name, e.code, b); return
        except Exception as e:
            print("err", name, e); time.sleep(5)
    print("GAVEUP", name)

if __name__ == "__main__":
    only = sys.argv[1:] if len(sys.argv) > 1 else list(ITEMS)
    for n in only:
        p, s = ITEMS[n]; gen(n, p, s)

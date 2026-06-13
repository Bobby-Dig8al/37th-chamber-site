# Render a static preview of the cloud from a layout.json dumped from the live sim.
import json, os
from PIL import Image, ImageDraw, ImageFont

S = 2
W, H = 1000*S, 600*S
BG = (8, 8, 10)
here = os.path.dirname(__file__)
L = json.load(open(os.path.join(here, "layout.json"), encoding="utf-8"))

img = Image.new("RGB", (W, H), BG)
edge_layer = Image.new("RGBA", (W, H), (0,0,0,0))
ed = ImageDraw.Draw(edge_layer)
for x1,y1,x2,y2 in L["lines"]:
    ed.line([x1*S, y1*S, x2*S, y2*S], fill=(255,214,10,32), width=S)
img = Image.alpha_composite(img.convert("RGBA"), edge_layer).convert("RGB")

d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("arial.ttf", 11*S); fseed = ImageFont.truetype("arialbd.ttf", 12*S)
except Exception:
    font = ImageFont.load_default(); fseed = font

def rgb(s):
    if s.startswith("#"):
        return tuple(int(s[i:i+2],16) for i in (1,3,5))
    return tuple(int(v) for v in s[s.find("(")+1:s.find(")")].split(","))

for n in L["nodes"]:
    cx, cy, rr = n["x"]*S, n["y"]*S, n["r"]*S
    if n.get("seed"):
        d.ellipse([cx-rr-5*S, cy-rr-5*S, cx+rr+5*S, cy+rr+5*S], outline=(43,108,255), width=2*S)
    d.ellipse([cx-rr, cy-rr, cx+rr, cy+rr], fill=rgb(n["fill"]), outline=BG, width=max(1,S))

for n in L["nodes"]:
    if not (n.get("show") or n.get("seed")):
        continue
    cx, cy, rr = n["x"]*S, n["y"]*S, n["r"]*S
    f = fseed if n.get("seed") else font
    tb = d.textbbox((0,0), n["label"], font=f); tw = tb[2]-tb[0]
    ly = cy + rr + 4*S if n["y"] < 560 else cy - rr - 14*S
    fill = (243,238,222) if n.get("seed") else (160,154,121)
    d.text((cx-tw/2, ly), n["label"], fill=fill, font=f)

img = img.resize((1000,600), Image.LANCZOS)
import sys
out = os.path.join(here, "..", sys.argv[1] if len(sys.argv)>1 else "preview.png")
img.save(out)
print("wrote", out, "nodes", len(L["nodes"]), "edges", len(L["lines"]))

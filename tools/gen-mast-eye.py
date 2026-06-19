#!/usr/bin/env python3
"""Generate assets/mast-eye.js from the staged series files.

Each per-day eye(canvas,opts) factory is lifted VERBATIM from
assets/widgets/series/<n>-<name>.html (the reviewed sources) — no transcription.
Then we wire:
  - REND:     every available renderer, keyed by slug
  - ROTATION: the 7-day lineup indexed by Date.getDay() (0=Sun..6=Sat)
  - dispatch: ?eye=<slug> previews ANY renderer; ?day=0..6 or getDay() drives rotation.

Run from anywhere:  python tools/gen-mast-eye.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "assets", "widgets", "series")
OUT = os.path.join(ROOT, "assets", "mast-eye.js")

# every available renderer (slug, filename) — generated whether or not it's in rotation
RENDERERS = [
    ("ice-seed",        "1-mon-ice-seed.html"),
    ("first-facets",    "2-tue-first-facets.html"),   # dropped from rotation ("the eh") — kept available
    ("crystal-bloom",   "3-wed-crystal-bloom.html"),
    ("teal-nebula",     "4-thu-teal-nebula.html"),
    ("shattered-glass", "5-fri-shattered-glass.html"),
    ("sapphire-jewel",  "6-sat-sapphire-jewel.html"),
    ("summit",          "7-sun-the-summit.html"),
    ("sapphire-fill",   "8-sun-full-kaleidoscope.html"),   # FILLED sapphire jewel (operator fav) — no black wedges
    ("shattered-fill",  "9-sun-shattered-fill.html"),      # FILLED shattered glass
    ("teal-fill",       "10-sun-teal-fill.html"),          # FILLED teal nebula
]

# the 7-day rotation, indexed by Date.getDay(): 0=Sun .. 6=Sat
ROTATION = [
    "sapphire-fill",   # 0 Sun — FILLED sapphire jewel kaleidoscope (no black wedges) — operator fav
    "ice-seed",        # 1 Mon
    "summit",          # 2 Tue — classic Summit repurposed into the freed slot (was first-facets)
    "crystal-bloom",   # 3 Wed
    "teal-nebula",     # 4 Thu
    "shattered-glass", # 5 Fri
    "sapphire-jewel",  # 6 Sat
]

def brace_match(text, i):
    depth = 0
    while i < len(text):
        c = text[i]
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return i
        i += 1
    raise ValueError("unbalanced braces")

def fnname(slug):
    return "eye_" + slug.replace("-", "_")

def extract(path, slug):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.search(r'function\s+eye\s*\(\s*canvas\s*,\s*opts\s*\)\s*\{', text)
    if not m: raise ValueError("no eye() factory in " + path)
    bs = text.index('{', m.start()); be = brace_match(text, bs)
    fn = re.sub(r'function\s+eye\s*\(', 'function ' + fnname(slug) + '(', text[m.start():be + 1], count=1)
    matches = list(re.finditer(r'var\s+[Oo][Pp][Tt][Ss]\s*=\s*\{', text))
    if not matches: raise ValueError("no OPTS/opts in " + path)
    mo = matches[-1]; obs = text.index('{', mo.start()); obe = brace_match(text, obs)
    return fn, text[obs:obe + 1]

factories, optsmap = {}, {}
for slug, fname in RENDERERS:
    fn, opts = extract(os.path.join(SRC, fname), slug)
    factories[slug] = fn; optsmap[slug] = opts
    print("[ok] %-16s fn=%5d%s" % (slug, len(fn), "  [rotation]" if slug in ROTATION else "  (available)"))

out = []
out.append("""/* THE MAST EYE — the all-seeing eye, rendered on canvas (HOMEPAGE HERO ONLY).
   White almond glow = the sclera; a turning crystalline KALEIDOSCOPE = the iris.
   The iris EVOLVES by day-of-week; Sunday is the FULL-BLOOM kaleidoscope (no black,
   rotating). For his mother, who loved kaleidoscopes.

   GENERATED — do not hand-edit. Each renderer is lifted VERBATIM from
   assets/widgets/series/<n>-<name>.html. Regenerate with: python tools/gen-mast-eye.py
   Honors prefers-reduced-motion. Transparent canvas; the blue glow is CSS.
   Preview ANY renderer:  ?eye=<slug>  (kaleido | summit | ice-seed | first-facets |
   crystal-bloom | teal-nebula | shattered-glass | sapphire-jewel)
   Preview a rotation day: ?day=0..6   (0=Sun .. 6=Sat) */
(function(){
  "use strict";
""")
for slug, _ in RENDERERS:
    out.append("  /* ---- " + slug + " ---- */")
    out.append(factories[slug]); out.append("")
out.append("  /* every available renderer, keyed by slug */")
out.append("  var REND = {")
for slug, _ in RENDERERS:
    out.append("    '" + slug + "': { mount:" + fnname(slug) + ", opts:" + optsmap[slug] + " },")
out.append("  };")
out.append("")
out.append("  /* the 7-day rotation, indexed by Date.getDay(): 0=Sun .. 6=Sat */")
out.append("  var ROTATION = [" + ", ".join("'" + s + "'" for s in ROTATION) + "];")
out.append("""
  function mountSlug(canvas, slug){
    var d = REND[slug];
    if(!canvas || !d) return null;
    canvas.setAttribute('data-eye', slug);
    d.mount(canvas, d.opts);
    return slug;
  }
  function mountIndex(canvas, i){ return mountSlug(canvas, ROTATION[((i%7)+7)%7]); }
  function autoMount(canvas){
    try{
      var p = new URLSearchParams(location.search);
      var eq = p.get('eye');
      if(eq && REND[eq]) return mountSlug(canvas, eq);
      var dq = p.get('day');
      var idx = (dq!==null && /^[0-6]$/.test(dq)) ? +dq : (new Date()).getDay();
      return mountIndex(canvas, idx);
    }catch(e){ return mountIndex(canvas, (new Date()).getDay()); }
  }

  if(typeof window!=='undefined'){
    window.MastEye = { REND:REND, ROTATION:ROTATION, mountSlug:mountSlug, mountIndex:mountIndex };
  }
  var cv = document.querySelector('canvas.mast-eye-canvas');
  if(cv){ autoMount(cv); }
})();
""")
with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
daynames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
print("ROTATION:", " ".join("%s=%s" % (daynames[i], ROTATION[i]) for i in range(7)))
print("[written]", OUT)

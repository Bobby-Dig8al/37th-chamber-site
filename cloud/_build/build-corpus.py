#!/usr/bin/env python3
"""
Build the connected-papers cloud corpus from OpenAlex — REAL DATA ONLY.

Seed: the DNGR / Interstellar gravitational-lensing paper (James, von Tunzelmann,
Franklin & Thorne 2015), OpenAlex W2088237123.

We build a two-generation lineage neighborhood:
  - ROOTS   (gen -1): works the seed *cites*        (filter cited_by:SEED)
  - SEED    (gen  0): the origin paper
  - BRANCHES(gen +1): works that *cite* the seed     (filter cites:SEED)

Edges = real citation links among the selected node set (A cites B), derived from
each work's `referenced_works`. No fabricated numbers, no invented relationships.
"""
import json, sys, time, urllib.parse, urllib.request

SEED = "W2088237123"
MAILTO = "krsullivan512@gmail.com"
BASE = "https://api.openalex.org/works"
N_BRANCHES = 26   # most-cited descendants (after relevance filter)
N_ROOTS = 14      # most-cited ancestors (after relevance filter)
OVERFETCH = 60    # pull extra candidates, then trim to the relevant top-N

# Keep a work only if a concept name contains one of these — keeps the map a
# physics/astro field map, drops generic CS/rendering/numerical-methods textbooks
# that rank high on raw citation count but aren't this neighborhood.
RELEVANT = ("black hole", "relativ", "gravitation", "lens", "astrophys",
            "astronom", "spacetime", "space-time", "photon", "accretion",
            "cosmolog", "horizon", "kerr", "schwarzschild", "metric tensor",
            "geodesic", "wormhole", "shadow", "quasar", "gravity")

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": f"37th-chamber-cloud (mailto:{MAILTO})"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except Exception as e:
            sys.stderr.write(f"retry {attempt}: {e}\n")
            time.sleep(2 + attempt * 2)
    raise SystemExit(f"failed: {url}")

def oid(full):  # "https://openalex.org/W123" -> "W123"
    return full.rsplit("/", 1)[-1] if full else None

def _surname(display):
    return display.split()[-1] if display and display.split() else ""

def last_name(authorships):
    # Prefer the first author; if their surname isn't Latin (e.g. Cyrillic record
    # variant), fall back to the first co-author with an ASCII surname.
    if not authorships:
        return "Unknown"
    first = _surname(authorships[0]["author"]["display_name"].strip())
    if first and first.isascii():
        return first
    for a in authorships[1:]:
        s = _surname(a["author"]["display_name"].strip())
        if s and s.isascii():
            return s
    return first or "Unknown"

def norm_title(t):
    return "".join(ch for ch in (t or "").lower() if ch.isalnum())

def best_url(w):
    ids = w.get("ids", {}) or {}
    if ids.get("doi"):
        return ids["doi"]                      # already a https://doi.org/... URL
    loc = (w.get("primary_location") or {})
    if loc.get("landing_page_url"):
        return loc["landing_page_url"]
    return w["id"]                             # openalex landing

SELECT = "id,title,publication_year,cited_by_count,authorships,referenced_works,ids,primary_location,concepts"

def relevant(w):
    for c in (w.get("concepts") or []):
        name = (c.get("display_name") or "").lower()
        if any(k in name for k in RELEVANT):
            return True
    return False

def fetch_seed():
    return get(f"{BASE}/{SEED}?mailto={MAILTO}&select={SELECT}")

def fetch_list(filt, n):
    url = (f"{BASE}?filter={filt}&sort=cited_by_count:desc"
           f"&per-page={OVERFETCH}&mailto={MAILTO}&select={SELECT}")
    results = get(url).get("results", [])
    return [w for w in results if relevant(w)][:n]

def node_from(w, gen):
    return {
        "id": oid(w["id"]),
        "title": (w.get("title") or "Untitled").replace("<i>", "").replace("</i>", ""),
        "author": last_name(w.get("authorships")),
        "year": w.get("publication_year"),
        "citations": w.get("cited_by_count", 0),
        "gen": gen,
        "url": best_url(w),
        "_refs": [oid(r) for r in (w.get("referenced_works") or [])],
    }

def main():
    seed_w = fetch_seed()
    roots = fetch_list(f"cited_by:{SEED}", N_ROOTS)
    branches = fetch_list(f"cites:{SEED}", N_BRANCHES)

    nodes = {}
    seen_titles = set()

    def add(w, gen):
        i = oid(w["id"])
        nt = norm_title(w.get("title"))
        if i in nodes or (nt and nt in seen_titles):
            return
        seen_titles.add(nt)
        nodes[i] = node_from(w, gen)

    add(seed_w, 0)
    for w in roots:
        add(w, -1)
    for w in branches:
        add(w, 1)

    ids = set(nodes.keys())
    edges = []
    seen = set()
    for nid, n in nodes.items():
        for r in n["_refs"]:
            if r in ids and r != nid:
                key = (nid, r)
                if key not in seen:
                    seen.add(key)
                    edges.append({"s": nid, "t": r})  # nid cites r

    for n in nodes.values():
        n.pop("_refs", None)

    out = {
        "seed": SEED,
        "source": "OpenAlex (api.openalex.org) — fetched live, real citation data",
        "nodes": list(nodes.values()),
        "edges": edges,
    }
    with open(sys.argv[1] if len(sys.argv) > 1 else "data.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    sys.stderr.write(f"nodes={len(out['nodes'])} edges={len(out['edges'])}\n")

if __name__ == "__main__":
    main()

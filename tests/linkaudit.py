#!/usr/bin/env python3
"""
Walk every .html under repo root, extract every href and src, and verify each
internal target resolves to a real file or directory-index. Reports broken links
grouped by source. Exits 0 if clean, 1 if anything is broken.

Run from repo root: python tests/linkaudit.py
"""
import os, re, sys
from urllib.parse import urlparse, unquote

ROOT = os.path.abspath(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HREF_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)


def resolve(src_file, target):
    if target.startswith(("mailto:", "tel:", "javascript:", "data:")):
        return ("special", target)
    # protocol-relative // -> external (e.g. //gc.zgo.at/count.js)
    if target.startswith("//"):
        return ("external", target)
    # JS template literals or unresolved interpolation -> skip
    if "${" in target or "{{" in target:
        return ("dynamic", target)
    p = urlparse(target)
    if p.scheme in ("http", "https"):
        return ("external", target)
    if target.startswith("#"):
        return ("anchor", target)
    path_only = unquote(p.path)
    if not path_only:
        return ("anchor", target)
    if path_only.startswith("/"):
        fs = os.path.join(ROOT, path_only.lstrip("/"))
    else:
        fs = os.path.normpath(os.path.join(os.path.dirname(src_file), path_only))
    if fs.endswith(("/", os.sep)) or os.path.isdir(fs):
        return ("internal", os.path.join(fs, "index.html"))
    return ("internal", fs)


def main():
    broken = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [
            d for d in dirnames if d not in (".git", "_trash", "node_modules", "tests")
        ]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            try:
                with open(full, "r", encoding="utf-8", errors="replace") as f:
                    for lineno, line in enumerate(f, 1):
                        for m in HREF_RE.finditer(line):
                            target = m.group(1).strip()
                            if not target:
                                continue
                            kind, resolved = resolve(full, target)
                            if kind in ("special", "external", "anchor", "dynamic"):
                                continue
                            if os.path.exists(resolved):
                                continue
                            if not resolved.endswith(".html") and os.path.exists(
                                resolved + ".html"
                            ):
                                continue
                            sep = os.sep
                            rel_src = os.path.relpath(full, ROOT).replace(sep, "/")
                            rel_tgt = os.path.relpath(resolved, ROOT).replace(sep, "/")
                            broken.append((rel_src, lineno, target, rel_tgt))
            except Exception as e:
                print(f"  ERR reading {full}: {e}", file=sys.stderr)

    if not broken:
        print("LINKS-RESOLVE AUDIT: PASS - no broken internal links found")
        return 0

    print(f"LINKS-RESOLVE AUDIT: {len(broken)} broken internal links\n")
    by_src = {}
    for s, ln, t, r in broken:
        by_src.setdefault(s, []).append((ln, t, r))
    for src in sorted(by_src):
        print(f"\n[{src}]")
        for ln, t, r in sorted(by_src[src]):
            print(f"  L{ln:>5}  href={t}")
            print(f"          -> {r}  (missing)")
    return 1


if __name__ == "__main__":
    sys.exit(main())

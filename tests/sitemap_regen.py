#!/usr/bin/env python3
"""
Regenerate sitemap.xml from the on-disk page tree.

Walks every .html, includes pages that are real user-facing routes,
skips: assets/, tests/, _trash/, .git/, 404.html, error pages, pages
that carry `<meta name="robots" content="noindex...">`, and redirect
stubs (detected by `<meta http-equiv="refresh">`).

Uses the file's last git-commit date as <lastmod>. Falls back to the
filesystem mtime if a file is untracked.

Output is a complete sitemap.xml at repo root. Run with --check to
verify on-disk sitemap matches what regen would produce (CI-friendly):

  python tests/sitemap_regen.py          # rewrites sitemap.xml
  python tests/sitemap_regen.py --check  # diff only; exit 1 if drift
"""
import os, re, sys, subprocess
from datetime import datetime, timezone

SITE = "https://37th-chamber.com"
ROOT = os.path.abspath(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

NOINDEX_RE = re.compile(
    r"""<meta\s+name=["']robots["']\s+content=["'][^"']*noindex""", re.I
)
REDIRECT_RE = re.compile(r"""<meta\s+http-equiv=["']refresh["']""", re.I)

SKIP_DIRS = {".git", "_trash", "node_modules", "tests", "assets", "docs"}
SKIP_FILES = {"404.html"}


def is_excluded(rel_path):
    parts = rel_path.replace("\\", "/").split("/")
    if any(p in SKIP_DIRS for p in parts):
        return True
    if parts[-1] in SKIP_FILES:
        return True
    return False


def is_indexable(full_path):
    """Read enough of the head to decide. Skip files with noindex or refresh redirect."""
    try:
        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            head = f.read(4096)
    except Exception:
        return False
    if NOINDEX_RE.search(head):
        return False
    if REDIRECT_RE.search(head):
        return False
    return True


def url_for(rel_path):
    rel = rel_path.replace("\\", "/")
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
        if rel == "":
            return SITE + "/"
        return SITE + "/" + rel
    return SITE + "/" + rel


def lastmod_for(full_path):
    """Last git commit date of this file; mtime fallback if untracked."""
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", full_path],
            cwd=ROOT,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if out:
            return out.split("T", 1)[0]
    except subprocess.CalledProcessError:
        pass
    mtime = os.path.getmtime(full_path)
    return datetime.fromtimestamp(mtime, tz=timezone.utc).date().isoformat()


def collect():
    entries = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT)
            if is_excluded(rel):
                continue
            if not is_indexable(full):
                continue
            entries.append((url_for(rel), lastmod_for(full)))
    # Stable, human-friendly ordering: homepage first, then alphabetical.
    entries.sort(key=lambda e: (e[0] != SITE + "/", e[0]))
    return entries


def render(entries):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, lastmod in entries:
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    lines.append("")
    return "\n".join(lines)


def main():
    check_only = "--check" in sys.argv
    entries = collect()
    rendered = render(entries)
    target = os.path.join(ROOT, "sitemap.xml")
    if check_only:
        try:
            current = open(target, "r", encoding="utf-8").read()
        except FileNotFoundError:
            current = ""
        if current == rendered:
            print(f"SITEMAP CHECK: PASS - {len(entries)} URLs, in sync")
            return 0
        print(f"SITEMAP CHECK: DRIFT - regen would change sitemap.xml")
        print(f"  current: {current.count('<loc>')} URLs / regen: {len(entries)} URLs")
        return 1
    with open(target, "w", encoding="utf-8", newline="\n") as f:
        f.write(rendered)
    print(f"SITEMAP WROTE: {target}  ({len(entries)} URLs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

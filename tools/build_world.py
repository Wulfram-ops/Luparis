#!/usr/bin/env python3
"""Rebuild the world map of the site from an Azgaar "Full JSON" export of Luparis.

    python3 tools/build_world.py Luparis_Full.json            # writes into the repository root
    python3 tools/build_world.py Luparis_Full.json --out /tmp/w --chrome /usr/bin/google-chrome

Steps: world_data.prepare() reads and corrects the export, world_flat.render() draws the
flat atlas style into world-full.svg (not versioned) and world-burgs.json, then
world_raster.rasterize() makes world-hi.webp, world-lo.webp and the interactive world.svg.
Dependencies: tools/requirements.txt, then `python3 -m playwright install chromium`
if no Chrome is installed.
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import world_data  # noqa: E402
import world_flat  # noqa: E402
import world_raster  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("export", type=Path, help="Azgaar Full JSON export (Luparis_Full_*.json)")
    ap.add_argument("--out", type=Path, default=ROOT, help="output folder (default: the repository root)")
    ap.add_argument("--chrome", help="path to Chrome/Chromium (default: system Chrome, else Playwright's)")
    ap.add_argument("--lo-quality", type=int, default=70, help="WebP quality of world-lo.webp (default 70)")
    args = ap.parse_args()
    if not args.export.is_file():
        ap.error(f"export not found: {args.export}")
    args.out.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    w = world_data.prepare(args.export)
    full = args.out / "world-full.svg"
    n = world_flat.render(w, full, args.out / "world-burgs.json")
    print(f"map drawn: {n} burgs, {full.stat().st_size // 1024} KB of SVG ({time.time() - t0:.1f} s)")
    size = world_raster.rasterize(full, args.out, args.chrome or world_raster.find_chrome(), args.lo_quality)
    for name in ("world-hi.webp", "world-lo.webp", "world.svg", "world-burgs.json"):
        print(f"  {name}: {(args.out / name).stat().st_size // 1024} KB")
    print(f"done: {size[0]}×{size[1]} px ({time.time() - t0:.1f} s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

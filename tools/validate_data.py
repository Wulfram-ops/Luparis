#!/usr/bin/env python3
"""Check that the data files the site reads have the shape the JavaScript expects.

    python3 tools/validate_data.py

Checks srd-monsters.json, srd-details.json, world-burgs.json, world.svg and the rules pages.
Exits 1 and lists the problems if anything is off.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIZES = {"T", "S", "M", "L", "H", "G"}
CRS = {"0", "1/8", "1/4", "1/2", *map(str, range(1, 31))}
errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def load(name: str):
    try:
        return json.loads((ROOT / name).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        err(f"{name}: unreadable ({e})")
        return None


def check_monsters() -> set[str]:
    data = load("srd-monsters.json")
    ids: set[str] = set()
    if not isinstance(data, list) or not data:
        err("srd-monsters.json: expected a non-empty list")
        return ids
    for i, m in enumerate(data):
        where = f"srd-monsters.json[{i}]"
        if not isinstance(m, dict):
            err(f"{where}: not an object")
            continue
        if not isinstance(m.get("id"), str) or not m["id"]:
            err(f"{where}: missing id")
        elif m["id"] in ids:
            err(f"{where}: duplicate id {m['id']}")
        else:
            ids.add(m["id"])
        n = m.get("n")
        if not (isinstance(n, list) and len(n) == 2 and all(isinstance(x, str) and x for x in n)):
            err(f"{where}: n must be [english, french]")
        if m.get("fp") not in CRS:
            err(f"{where}: bad challenge rating {m.get('fp')!r}")
        if m.get("sz") not in SIZES:
            err(f"{where}: bad size {m.get('sz')!r}")
        for k in ("ca", "pv", "init"):
            if not isinstance(m.get(k), int):
                err(f"{where}: {k} must be an integer")
        if not isinstance(m.get("hab", []), list):
            err(f"{where}: hab must be a list")
        for a in m.get("atk", []) or []:
            if not all(isinstance(a.get(k), int) for k in ("k", "ab", "nd", "dd", "mod")):
                err(f"{where}: attack {a.get('n')!r} has non-integer fields")
    return ids


def check_details(ids: set[str]) -> None:
    data = load("srd-details.json")
    if not isinstance(data, dict):
        err("srd-details.json: expected an object keyed by monster id")
        return
    srd_ids = {i for i in ids if i.startswith("s-")}
    missing = srd_ids - data.keys()
    if missing:
        err(f"srd-details.json: no stat block for {len(missing)} SRD monsters, e.g. {sorted(missing)[:3]}")
    for k, v in data.items():
        if not isinstance(v, dict) or not isinstance(v.get("ab"), list) or len(v["ab"]) != 6:
            err(f"srd-details.json[{k}]: ab must hold the six ability scores")
        for sec in ("tr", "act", "leg", "rea"):
            if not all(isinstance(x, list) and len(x) == 2 for x in v.get(sec, [])):
                err(f"srd-details.json[{k}]: {sec} must be a list of [name, text]")


def check_luparis(ids: set[str]) -> None:
    data = load("srd-luparis.json")
    if not isinstance(data, dict):
        err("srd-luparis.json: expected an object keyed by monster id")
        return
    missing = {i for i in ids if i.startswith("s-")} - data.keys()
    if missing:
        err(f"srd-luparis.json: no Luparis stat block for {len(missing)} SRD monsters, e.g. {sorted(missing)[:3]}")
    for k, v in data.items():
        if v.get("mx") is not None and len(v["mx"]) != 9:
            err(f"srd-luparis.json[{k}]: mx must hold the nine cells")
        for sec in ("tr", "act", "leg", "rea"):
            if not all(isinstance(x, list) and len(x) in (4, 5) for x in v.get(sec, [])):
                err(f"srd-luparis.json[{k}]: {sec} entries must be [name en, name fr, text en, text fr, extra?]")
            for x in v.get(sec, []):
                rc = x[4].get("rc") if len(x) == 5 and isinstance(x[4], dict) else None
                if len(x) == 5 and not (rc and all(isinstance(rc.get(f), int) for f in ("t", "d"))):
                    err(f"srd-luparis.json[{k}]: {x[0]} has a malformed recharge")
        for a in v.get("atk", []):
            if not all(isinstance(a.get(f), int) for f in ("ab", "nd", "dd", "mod")):
                err(f"srd-luparis.json[{k}]: attack {a.get('n')} has non-integer fields")


def check_world() -> None:
    burgs = load("world-burgs.json")
    if not isinstance(burgs, list) or not burgs:
        err("world-burgs.json: expected a non-empty list")
    else:
        seen = set()
        for b in burgs:
            if not all(k in b for k in ("i", "n", "x", "y", "c")):
                err(f"world-burgs.json: burg {b.get('n')!r} misses a field")
            elif b["c"] not in ("cap", "city", "town"):
                err(f"world-burgs.json: burg {b['n']!r} has class {b['c']!r}")
            if b.get("i") in seen:
                err(f"world-burgs.json: duplicate burg id {b.get('i')}")
            seen.add(b.get("i"))
            if not (0 <= b.get("x", -1) <= 1920 and 0 <= b.get("y", -1) <= 945):
                err(f"world-burgs.json: burg {b.get('n')!r} lies outside the map")
    svg = (ROOT / "world.svg").read_text(encoding="utf-8")
    for gid in ("w-borders", "w-burgs", "w-slabels"):
        if f'id="{gid}"' not in svg:
            err(f"world.svg: layer {gid} is missing")
    for img in ("world-lo.webp", "world-hi.webp"):
        if not (ROOT / img).is_file():
            err(f"{img} is missing")


def check_rules() -> None:
    ids = {}
    for lang in ("en", "fr"):
        page = (ROOT / "rules" / f"{lang}.html").read_text(encoding="utf-8")
        ids[lang] = re.findall(r'<h2 id="([^"]+)"', page)
        if not ids[lang]:
            err(f"rules/{lang}.html: no chapters")
    if ids.get("en") != ids.get("fr"):
        err("rules: the English and French chapters differ")


def main() -> int:
    ids = check_monsters()
    check_details(ids)
    check_luparis(ids)
    check_world()
    check_rules()
    if errors:
        print(f"{len(errors)} problem(s):")
        for e in errors[:50]:
            print("  - " + e)
        return 1
    print("Data files OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

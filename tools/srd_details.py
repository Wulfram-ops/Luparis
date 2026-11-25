"""Build srd-details.json: the full SRD 5.1 stat block text (CC BY 4.0) of every creature,
keyed like the ids of srd-monsters.json ("s-<index>"). The site loads it only when a
monster sheet is opened.

    python3 tools/srd_details.py 5e-SRD-Monsters.json srd-details.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

def dmgl(x): return ', '.join(v if isinstance(v,str) else v.get('name','') for v in x)


def usage(a: dict) -> str:
    """The usage limit of an action, as the SRD prints it after the name: (Recharge 5–6), (3/Day)…"""
    u = a.get("usage") or {}
    if "(" in a.get("name", "") and ("Recharge" in a["name"] or "/Day" in a["name"]):
        return ""
    if u.get("type") == "recharge on roll":
        lo = int(u.get("min_value") or 6)
        return " (Recharge 6)" if lo >= 6 else f" (Recharge {lo}–6)"
    if u.get("type") == "per day":
        return f" ({u.get('times', 1)}/Day)"
    if u.get("type") == "recharge after rest":
        return " (Recharges after a Short or Long Rest)"
    return ""


def build(d: list) -> dict:
    out = {}
    for m in d:
        pr=m.get('proficiencies',[])
        sv=', '.join(p['proficiency']['name'].replace('Saving Throw: ','').title()+f" +{p['value']}" for p in pr if p['proficiency']['name'].startswith('Saving'))
        sk=', '.join(p['proficiency']['name'].replace('Skill: ','')+f" +{p['value']}" for p in pr if p['proficiency']['name'].startswith('Skill'))
        sen=', '.join(f"{k.replace('_',' ')} {v}" for k,v in m.get('senses',{}).items())
        spd=', '.join((k+' ' if k!='walk' else '')+str(v) for k,v in m.get('speed',{}).items() if k!='hover')+(' (hover)' if m.get('speed',{}).get('hover') else '')
        L=lambda key:[[a['name']+usage(a),a.get('desc','')] for a in m.get(key,[]) or []]
        out['s-'+m['index']]=dict(al=m.get('alignment',''),sub=m.get('subtype') or '',hd=m.get('hit_dice',''),spd=spd,ab=[m[k] for k in ('strength','dexterity','constitution','intelligence','wisdom','charisma')],
            sv=sv,sk=sk,vul=dmgl(m.get('damage_vulnerabilities',[])),res=dmgl(m.get('damage_resistances',[])),imm=dmgl(m.get('damage_immunities',[])),cimm=dmgl(m.get('condition_immunities',[])),
            sen=sen,lng=m.get('languages',''),xp=m.get('xp',0),tr=L('special_abilities'),act=L('actions'),leg=L('legendary_actions'),rea=L('reactions'))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="5e-SRD-Monsters.json (2014 edition)")
    ap.add_argument("output", type=Path, help="where to write srd-details.json")
    args = ap.parse_args()
    with args.source.open(encoding="utf-8") as fh:
        out = build(json.load(fh))
    args.output.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(out)} stat blocks written to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

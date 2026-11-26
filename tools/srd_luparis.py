#!/usr/bin/env python3
"""Turn the SRD 5.1 stat blocks (srd-details.json) into Luparis stat blocks (srd-luparis.json).

    python3 tools/srd_luparis.py                       # write srd-luparis.json
    python3 tools/srd_luparis.py --templates out.json  # list the texts that still need a French version

What changes, following the Luparis rules (chapter 10, "Convertir un monstre de D&D"):
- the six D&D abilities become the nine cells of the Matrix (intention × domain);
- saving throws become domains (Physical, Mental, Social), skills keep their name;
- distances are given in tiles (1 tile = 5 ft), healing in boxes (hit points ÷ (4 + CR));
- attack bonuses drop the D&D proficiency (to hit = modifier only, like a character's Matrix cell);
- save DCs use Tier instead of the D&D proficiency (8 + modifier + Tier);
- weapon damage is Tier dice of the weapon die + Tier (as srd.py does); other damage keeps its D&D dice;
- spellcasting becomes a shared Luparis repertoire of schools, Mana and effects (tools/monster_magic.py);
- every dragon is chaotic neutral in Luparis.

Every ability text is cut into a template (numbers and game terms replaced by numbered slots)
and the slots are filled back in English or French. French templates live in
tools/srd_fr.json ({"names": {english: french}, "texts": {template id: french template}});
a text without a French template keeps its English Luparis version.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

from monster_magic import repertoire

ROOT = Path(__file__).resolve().parent.parent
FR_FILE = Path(__file__).resolve().parent / "srd_fr.json"

ABIL = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
SHORT = {"Str": 0, "Dex": 1, "Con": 2, "Int": 3, "Wis": 4, "Cha": 5}
DOMAIN = {0: "phy", 1: "phy", 2: "phy", 3: "men", 4: "men", 5: "soc"}
DOM_N = {"phy": ("Physical", "Physique", "physique"), "men": ("Mental", "Mental", "mentale"), "soc": ("Social", "Social", "sociale")}
# the cell an ability check uses: (intention, domain)
CHECK_CELL = {0: ("pui", "phy"), 1: ("fin", "phy"), 2: ("res", "phy"), 3: ("pui", "men"), 4: ("fin", "men"), 5: ("fin", "soc")}
INT_N = {"pui": ("Power", "Puissance"), "fin": ("Finesse", "Finesse"), "res": ("Resilience", "Résistance")}

DMG = {
    "acid": "d'acide", "bludgeoning": "contondants", "cold": "de froid", "fire": "de feu", "force": "de force",
    "lightning": "de foudre", "necrotic": "nécrotiques", "piercing": "perforants", "poison": "de poison",
    "psychic": "psychiques", "radiant": "radiants", "slashing": "tranchants", "thunder": "de tonnerre",
}
DMG_NOUN = {
    "acid": "acide", "bludgeoning": "contondant", "cold": "froid", "fire": "feu", "force": "force",
    "lightning": "foudre", "necrotic": "nécrotique", "piercing": "perforant", "poison": "poison",
    "psychic": "psychique", "radiant": "radiant", "slashing": "tranchant", "thunder": "tonnerre",
}
COND = {
    "Blinded": "aveuglé", "Charmed": "charmé", "Deafened": "assourdi", "Exhaustion": "épuisement",
    "Frightened": "effrayé", "Grappled": "agrippé", "Incapacitated": "neutralisé", "Invisible": "invisible",
    "Paralyzed": "paralysé", "Petrified": "pétrifié", "Poisoned": "empoisonné", "Prone": "à terre",
    "Restrained": "entravé", "Stunned": "étourdi", "Unconscious": "inconscient",
}
SKILL = {
    "Acrobatics": "Acrobaties", "Arcana": "Arcanes", "Athletics": "Athlétisme", "Deception": "Tromperie",
    "History": "Histoire", "Insight": "Intuition", "Intimidation": "Intimidation", "Investigation": "Investigation",
    "Medicine": "Médecine", "Nature": "Nature", "Perception": "Perception", "Performance": "Représentation",
    "Persuasion": "Persuasion", "Religion": "Religion", "Sleight of Hand": "Escamotage", "Stealth": "Discrétion",
    "Survival": "Survie", "Animal Handling": "Dressage",
}
ALIGN = {
    "lawful good": "loyal bon", "neutral good": "neutre bon", "chaotic good": "chaotique bon",
    "lawful neutral": "loyal neutre", "neutral": "neutre", "chaotic neutral": "chaotique neutre",
    "lawful evil": "loyal mauvais", "neutral evil": "neutre mauvais", "chaotic evil": "chaotique mauvais",
    "unaligned": "sans alignement", "any alignment": "tout alignement", "any non-good alignment": "tout alignement non bon",
    "any non-lawful alignment": "tout alignement non loyal", "any chaotic alignment": "tout alignement chaotique",
    "any evil alignment": "tout alignement mauvais",
}
SPEED = {"swim": ("swim", "nage"), "fly": ("fly", "vol"), "burrow": ("burrow", "fouissement"), "climb": ("climb", "escalade")}
SENSE = {"darkvision": ("darkvision", "vision dans le noir"), "blindsight": ("blindsight", "vision aveugle"),
         "truesight": ("truesight", "vision véritable"), "tremorsense": ("tremorsense", "perception des vibrations")}
LANG = {
    "Common": "commun", "Draconic": "draconique", "Deep Speech": "profond", "Auran": "aérien", "Aquan": "aquatique",
    "Ignan": "igné", "Terran": "terreux", "Abyssal": "abyssal", "Infernal": "infernal", "Celestial": "céleste",
    "Sylvan": "sylvestre", "Elvish": "elfique", "Dwarvish": "nain", "Giant": "géant", "Gnomish": "gnome",
    "Goblin": "gobelin", "Orc": "orc", "Undercommon": "commun des profondeurs", "Primordial": "primordial",
    "Gnoll": "gnoll", "Sahuagin": "sahuagin", "Sphinx": "sphinx", "Otyugh": "otyugh", "Blink Dog": "chien clignotant",
    "Giant Eagle": "aigle géant", "Giant Elk": "élan géant", "Giant Owl": "chouette géante", "Druidic": "druidique",
    "Thieves' cant": "argot des voleurs", "infernal": "infernal", "all": "toutes", "Worg": "worg", "Winter Wolf": "loup arctique",
}
LANG_PHRASE = [
    (r"^any one language \(usually Common\)$", "une langue (souvent le commun)"),
    (r"^any (\w+) languages$", lambda m: f"{ {'two':'deux','four':'quatre','six':'six'}.get(m[1], m[1]) } langues au choix"),
    (r"^one language known by its creator$", "une langue de son créateur"),
    (r"^(?:the |any )?languages it knew in life$", "les langues qu'il parlait de son vivant"),
    (r"^understands all languages it spoke in life but can't speak$", "comprend les langues qu'il parlait de son vivant sans les parler"),
    (r"^understands the languages of its creator but can't speak$", "comprend les langues de son créateur sans les parler"),
    (r"^understands commands given in any language but can't speak$", "comprend les ordres dans toute langue sans parler"),
    (r"^Common plus up to five other languages$", "commun et jusqu'à cinq autres langues"),
]

CR_NUM = {"1/8": 0.125, "1/4": 0.25, "1/2": 0.5}


def cr_num(fp: str) -> float:
    return CR_NUM.get(fp) or float(fp)


def tier(c: float) -> int:
    return max(1, min(5, int(1 + c / 4.5 + 0.5)))


def dnd_prof(c: float) -> int:
    return 2 if c < 5 else 3 if c < 9 else 4 if c < 13 else 5 if c < 17 else 6 if c < 21 else 7 if c < 25 else 8 if c < 29 else 9


def mod(score: int) -> int:
    return (score - 10) // 2


def tiles(ft: int) -> int:
    return max(1, -(-ft // 5))


# ---------------------------------------------------------------- slots
class Ctx:
    """Numbers of one creature, used to convert the slots of its texts."""

    def __init__(self, m: dict, d: dict):
        self.c = cr_num(m["fp"])
        self.t = tier(self.c)
        self.pb = dnd_prof(self.c)
        self.hp_box = 4 + self.c
        en = m["n"][0]
        words = [w for w in re.split(r"[ ,]+", en.lower()) if w]
        self.self_names = sorted({en.lower(), words[-1], *([" ".join(words[-2:])] if len(words) > 1 else [])}, key=len, reverse=True)

    def dc(self, n: int) -> int:
        return n - self.pb + self.t

    def hit(self, n: int) -> int:
        return n - self.pb

    def boxes(self, hp: float) -> int:
        return 0 if hp <= 0 else max(1, round(hp / self.hp_box))


def dice(nd: str, sign: str | None, k: str | None) -> str:
    return nd.replace(" ", "") + (f"{sign}{k}" if k else "")


SLOT_PATTERNS = [
    # DC 15 Dexterity saving throw
    ("save", re.compile(r"DC (\d+) (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw")),
    # DC 15 Strength (Athletics) check
    ("dccheck", re.compile(r"DC (\d+) (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)(?: \(([A-Z][a-z]+(?: [a-z]+ [A-Z][a-z]+)?)\))? check")),
    # Wisdom (Perception) check
    ("check", re.compile(r"(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) \(([A-Z][a-z]+(?: [a-z]+ [A-Z][a-z]+)?)\) check")),
    # 13 (2d8 + 4) piercing damage   /   7 (2d6) damage
    ("dmg", re.compile(r"(\d+) \((\d+d\d+)(?: ([+-]) (\d+))?\) (acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)? ?damage")),
    # 1 piercing damage
    ("flat", re.compile(r"\b(\d+) (acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder) damage")),
    # regains 10 hit points / 22 (4d8 + 4) hit points
    ("hpdice", re.compile(r"(\d+) \((\d+d\d+)(?: ([+-]) (\d+))?\) hit points")),
    ("hp", re.compile(r"\b(\d+) hit points")),
    # +7 to hit
    ("hit", re.compile(r"\+(\d+) to hit")),
    # spell save DC 14 / escape DC 13 / DC 12
    ("dc", re.compile(r"\bDC (\d+)")),
    # 60-foot cone / 30 feet / 10 ft.
    ("dist", re.compile(r"(\d+)(?:-| )(foot|feet|ft\.?)(?=[\s,.;:)]|$)")),
]


def slot_text(kind: str, g: tuple, cx: Ctx, lang: str, recharge: bool = False) -> str:
    fr = lang == "fr"
    if kind == "dmg" and recharge:
        # recharge abilities: Tier dice per turn of recharge, chosen at the table (1 to 3 turns)
        die = g[1].split("d")[1]
        per = f"{cx.t}d{die}"
        ty = g[4]
        if fr:
            return (f"dégâts {DMG[ty]} " if ty else "dégâts ") + f"({per} par tour de recharge)"
        return (f"{ty} damage " if ty else "damage ") + f"({per} per turn of recharge)"
    if kind == "save":
        a = ABIL.index(g[1])
        dom = DOM_N[DOMAIN[a]]
        return f"sauvegarde {dom[2]} DD {cx.dc(int(g[0]))}" if fr else f"DC {cx.dc(int(g[0]))} {dom[0]} save"
    if kind in ("dccheck", "check"):
        if kind == "dccheck":
            dc, ab, sk = cx.dc(int(g[0])), ABIL.index(g[1]), g[2]
        else:
            dc, ab, sk = None, ABIL.index(g[0]), g[1]
        i, d = CHECK_CELL[ab]
        cell = f"{INT_N[i][1]} {DOM_N[d][2]}" if fr else f"{DOM_N[d][0]} {INT_N[i][0]}"
        skn = (SKILL.get(sk, sk) if fr else sk) if sk else ""
        s = (f"test de {cell}" + (f" ({skn})" if skn else "")) if fr else (f"{cell}" + (f" ({skn})" if skn else "") + " check")
        return (s + f" DD {dc}") if (dc and fr) else (f"DC {dc} " + s if dc else s)
    if kind == "dmg":
        dd = dice(g[1], g[2], g[3])
        ty = g[4]
        if not ty:
            return f"{dd} de dégâts" if fr else f"{dd} damage"
        return f"{dd} dégâts {DMG[ty]}" if fr else f"{dd} {ty} damage"
    if kind == "flat":
        return f"{g[0]} dégât{'s' if int(g[0]) > 1 else ''} {DMG[g[1]]}" if fr else f"{g[0]} {g[1]} damage"
    if kind in ("hpdice", "hp"):
        hp = float(g[0])
        n = cx.boxes(hp)
        return f"{n} case{'s' if n > 1 else ''}" if fr else f"{n} box{'es' if n != 1 else ''}"
    if kind == "hit":
        v = cx.hit(int(g[0]))
        return f"{v:+d}" if fr else f"{v:+d} to hit"
    if kind == "dc":
        return f"DD {cx.dc(int(g[0]))}" if fr else f"DC {cx.dc(int(g[0]))}"
    if kind == "dist":
        n = tiles(int(g[0]))
        if fr:
            return f"{n} case{'s' if n > 1 else ''}"
        return f"{n}-tile" if g[1] == "foot" else f"{n} tile{'s' if n > 1 else ''}"
    raise ValueError(kind)


def templatize(text: str, cx: Ctx) -> tuple[str, list]:
    """Replace slots by {1}, {2}… (in reading order) and the creature's own name by {S}."""
    found = []
    taken = [False] * len(text)
    for kind, rx in SLOT_PATTERNS:
        for m in rx.finditer(text):
            if any(taken[m.start():m.end()]):
                continue
            for i in range(m.start(), m.end()):
                taken[i] = True
            found.append((m.start(), m.end(), kind, m.groups()))
    found.sort()
    out, slots, pos = [], [], 0
    for a, b, kind, g in found:
        out.append(text[pos:a])
        slots.append((kind, g))
        out.append("{" + str(len(slots)) + "}")
        pos = b
    out.append(text[pos:])
    t = "".join(out)
    for nm in cx.self_names:
        t = re.sub(r"\b[Tt]he " + re.escape(nm) + r"\b", "{S}", t)
    return t, slots


def tid(template: str) -> str:
    return hashlib.sha1(template.encode("utf-8")).hexdigest()[:10]


def fill(template: str, slots: list, cx: Ctx, lang: str, self_en: str, recharge: bool = False) -> str:
    def rep(m):
        k = m.group(1)
        if k == "S":
            return "la créature" if lang == "fr" else self_en
        i = int(k) - 1
        return slot_text(slots[i][0], slots[i][1], cx, lang, recharge) if i < len(slots) else m.group(0)

    s = re.sub(r"\{(S|\d+)\}", rep, template)
    if lang != "fr":
        s = re.sub(r"(^|[.!?]\s+)the ", lambda m: m.group(1) + "The ", s)
    return s


# ---------------------------------------------------------------- attacks
ATK_RX = re.compile(
    r"^(Melee or Ranged|Melee|Ranged) (Weapon|Spell) Attack: \+(\d+) to hit, (.*?)(?:, (one [^.]*?|[^,.]*targets?[^.]*?))?\. Hit: (.*)$",
    re.S,
)
MAIN_DMG = re.compile(r"^(\d+) \((\d+)d(\d+)(?: ([+-]) (\d+))?\) (\w+) damage")


def attack(name: str, text: str, cx: Ctx) -> dict | None:
    m = ATK_RX.match(text)
    if not m:
        return None
    kind, _, to_hit, rng, target, hit = m.groups()
    md = MAIN_DMG.match(hit)
    a = {"kind": kind, "ab": cx.hit(int(to_hit)), "rng": rng, "target": target or ""}
    if md:
        die = int(md[3])
        a.update(nd=cx.t, dd=die, mod=cx.t, ty=md[6] if md[6] in DMG else "")
        rest = hit[md.end():].strip()
        # "plus 7 (2d6) fire damage" rides along with the hit: kept as extra dice (D&D values)
        mp = re.match(r"^,? ?plus (\d+) \((\d+d\d+)(?: ([+-]) (\d+))?\) (\w+) damage", rest)
        if mp and mp[5] in DMG:
            a["plus"] = [dice(mp[2], mp[3], mp[4]), mp[5]]
            rest = rest[mp.end():].strip()
        rest = re.sub(r"^[.,]\s*", "", rest)
    else:
        a.update(nd=0, dd=0, mod=0, ty="")
        rest = hit.strip()
    a["rest"] = rest
    return a


def range_text(rng: str, cx: Ctx, lang: str) -> str:
    fr = lang == "fr"
    parts = []
    for p in [x.strip() for x in re.split(r",| or ", rng) if x.strip()]:
        m = re.match(r"reach (\d+) ft\.?", p)
        if m:
            n = tiles(int(m[1]))
            parts.append(f"allonge {n} case{'s' if n > 1 else ''}" if fr else f"reach {n} tile{'s' if n > 1 else ''}")
            continue
        m = re.match(r"range (\d+)/(\d+) ft\.?", p)
        if m:
            parts.append(f"portée {tiles(int(m[1]))}/{tiles(int(m[2]))} cases" if fr else f"range {tiles(int(m[1]))}/{tiles(int(m[2]))} tiles")
            continue
        m = re.match(r"range (\d+) ft\.?", p)
        if m:
            parts.append(f"portée {tiles(int(m[1]))} cases" if fr else f"range {tiles(int(m[1]))} tiles")
            continue
        parts.append(p)
    return (" ou " if fr else " or ").join(parts)


TARGET_FR = {
    "one target": "une cible", "one creature": "une créature",
    "one target in the swarm's space": "une cible dans l'espace de la nuée",
    "one creature in the swarm's space": "une créature dans l'espace de la nuée",
    "one prone creature": "une créature à terre",
    "one Large or smaller creature": "une créature G ou moins",
    "one Medium or smaller creature": "une créature M ou moins",
    "one willing creature, or a creature that is grappled by the vampire, incapacitated, or restrained":
        "une créature consentante, agrippée, neutralisée ou entravée",
    "one target not grappled by the crocodile": "une cible qu'il n'agrippe pas",
}
KIND_FR = {"Melee": "Corps à corps", "Ranged": "Distance", "Melee or Ranged": "Corps à corps ou distance"}


# ---------------------------------------------------------------- header fields
def cells(ab: list[int]) -> list[int]:
    """The nine cells (Power, Finesse, Resilience × Physical, Mental, Social), row by row."""
    s, d, c, i, w, h = (mod(x) for x in ab)
    avg = lambda a, b: (a + b) // 2  # noqa: E731
    return [s, i, h, d, avg(i, w), h, c, w, avg(w, h)]


def speed(s: str, lang: str) -> str:
    out = []
    for p in [x.strip() for x in s.split(",") if x.strip()]:
        m = re.match(r"(?:(swim|fly|burrow|climb) )?(\d+) ft\.( \(hover\))?", p)
        if not m:
            out.append(p)
            continue
        n = tiles(int(m[2]))
        lab = SPEED[m[1]][1 if lang == "fr" else 0] if m[1] else ""
        hov = (" (stationnaire)" if lang == "fr" else " (hover)") if m[3] else ""
        unit = "case" if lang == "fr" else "tile"
        out.append(f"{lab + ' ' if lab else ''}{n} {unit}{'s' if n > 1 else ''}{hov}")
    return ", ".join(out)


def senses(s: str, lang: str) -> str:
    out = []
    for p in [x.strip() for x in s.split(",") if x.strip()]:
        m = re.match(r"passive perception (\d+)", p, re.I)
        if m:
            out.append(f"Perception passive {m[1]}" if lang == "fr" else f"passive Perception {m[1]}")
            continue
        m = re.match(r"(darkvision|blindsight|truesight|tremorsense) (\d+) ft\.(.*)", p)
        if m:
            n = tiles(int(m[2]))
            extra = ""
            if "blind beyond" in m[3]:
                extra = " (aveugle au-delà)" if lang == "fr" else " (blind beyond)"
            unit = "case" if lang == "fr" else "tile"
            out.append(f"{SENSE[m[1]][1 if lang == 'fr' else 0]} {n} {unit}{'s' if n > 1 else ''}{extra}")
            continue
        out.append(p)
    return ", ".join(out)


def languages(s: str, lang: str) -> str:
    if lang != "fr" or not s:
        return re.sub(r"telepathy (\d+) ft\.", lambda m: f"telepathy {tiles(int(m[1]))} tiles", s)
    out = []
    tail = []
    # "understands Common, Elvish, and Sylvan but can't speak" spans several commas: handle it first
    special = {
        "understands commands given in any language but can't speak": "comprend les ordres dans toute langue sans parler",
        "understands the languages of its creator but can't speak": "comprend les langues de son créateur sans les parler",
        "understands all languages it knew in life but can't speak": "comprend les langues qu'il parlait de son vivant sans les parler",
        "understands all languages it spoke in life but can't speak": "comprend les langues qu'il parlait de son vivant sans les parler",
    }
    for en, frs in special.items():
        if en in s:
            tail.append(frs)
            s = s.replace(en, "").strip(", ")
    mu = re.search(r"(?:^|, )understands ([^;]+?) but (?:can't|doesn't) speak(?: it)?", s)
    if mu:
        names = [LANG.get(x.strip(), x.strip()) for x in re.split(r",? and |, ", mu[1]) if x.strip()]
        tail.append("comprend " + (", ".join(names[:-1]) + " et " + names[-1] if len(names) > 1 else names[0]) + " sans les parler")
        s = (s[:mu.start()] + s[mu.end():]).strip(", ")
    for p in [x.strip() for x in s.split(",") if x.strip()]:
        if p == "any one language":
            out.append("une langue au choix")
            continue
        m = re.match(r"telepathy (\d+) ft\.(.*)", p)
        if m:
            out.append(f"télépathie {tiles(int(m[1]))} cases" + (" (avec qui comprend l'abyssal)" if "Abyssal" in m[2] else ""))
            continue
        done = False
        for rx, rp in LANG_PHRASE:
            mm = re.match(rx, p)
            if mm:
                out.append(rp(mm) if callable(rp) else rp)
                done = True
                break
        if done:
            continue
        m = re.match(r"(?:and )?understands? (.+?)(?: but (?:can't|doesn't) speak(?: it)?)?$", p)
        if m and p.startswith(("understand", "and")):
            names = [LANG.get(x.strip(), x.strip()) for x in re.split(r" and |,", m[1]) if x.strip()]
            speaks = "can't" in p or "doesn't" in p
            out.append("comprend " + " et ".join(names) + (" sans le parler" if speaks else ""))
            continue
        m = re.match(r"(.+?) plus any two languages$", p)
        if m:
            out.append(f"{LANG.get(m[1], m[1])} et deux langues au choix")
            continue
        out.append(LANG.get(p, p))
    return ", ".join(out + tail)


def dmg_list(s: str, lang: str) -> str:
    if not s or lang != "fr":
        return s
    t = s
    t = t.replace("bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered", "contondant, perforant et tranchant d'armes non magiques et non argentées")
    t = t.replace("bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine", "contondant, perforant et tranchant d'armes non magiques et non en adamantium")
    t = t.replace("bludgeoning, piercing, and slashing from nonmagical attacks (from stoneskin)", "contondant, perforant et tranchant d'attaques non magiques (peau de pierre)")
    t = t.replace("bludgeoning, piercing, and slashing from nonmagical weapons", "contondant, perforant et tranchant d'armes non magiques")
    t = t.replace("piercing and slashing from nonmagical weapons that aren't adamantine", "perforant et tranchant d'armes non magiques et non en adamantium")
    t = t.replace("piercing from magic weapons wielded by good creatures", "perforant d'armes magiques maniées par des créatures bonnes")
    t = t.replace("damage from spells", "dégâts des sorts")
    for en, fr in DMG_NOUN.items():
        t = re.sub(rf"\b{en}\b", fr, t)
    return t


def alignment(a: str, is_dragon: bool, lang: str) -> str:
    if is_dragon:
        a = "chaotic neutral"
    if lang != "fr":
        return a
    m = re.match(r"neutral good \((\d+)%\) or neutral evil \((\d+)%\)", a)
    if m:
        return f"neutre bon ({m[1]} %) ou neutre mauvais ({m[2]} %)"
    return ALIGN.get(a, a)


# ---------------------------------------------------------------- build
def convert(m: dict, d: dict, fr: dict, missing: dict | None) -> dict:
    cx = Ctx(m, d)
    is_dragon = m.get("type") == "dragon"
    self_en = "the " + cx.self_names[-1] if cx.self_names else "it"
    names = fr.get("names", {})
    texts = fr.get("texts", {})

    def both(text: str, where: str, recharge: bool = False) -> list[str]:
        t, slots = templatize(text, cx)
        i = tid(t)
        en = fill(t, slots, cx, "en", self_en, recharge)
        if i in texts:
            fr_t = fill(texts[i], slots, cx, "fr", self_en, recharge)
        else:
            fr_t = en
            if missing is not None:
                e = missing.setdefault(i, {"id": i, "en": t, "n": 0, "ex": f"{m['n'][0]} · {where}", "slots": [s[0] for s in slots]})
                e["n"] += 1
        return [en, fr_t]

    def tidy(pair: list[str], text: list[str]) -> list[str]:
        """Drop a French text's leading repeat of the ability's own name ("Charge : …", "Souffle de feu en cône…")."""
        base = re.sub(r"\s*\(.*$", "", pair[1])
        t = text[1]
        if base and t.lower().startswith(base.lower()):
            rest = t[len(base):]
            if rest.startswith(" : "):
                t = rest[3:]
            elif re.match(r"^ (en|sur|d'|de) ", rest):
                t = rest[1:]
            t = t[:1].upper() + t[1:]
        return [text[0], t]

    def recharge_of(n: str, t: str) -> dict | None:
        """Recharge abilities that deal damage: the table chooses 1 to 3 turns of recharge, Tier dice per turn."""
        if not re.search(r"\(Recharge", n):
            return None
        _, slots = templatize(t, cx)
        d = next((g for k, g in slots if k == "dmg"), None)
        if not d:
            return None
        return {"t": cx.t, "d": int(d[1].split("d")[1]), "ty": [d[4] or "", DMG.get(d[4] or "", "")]}

    def entry(n: str, t: str) -> list:
        np_ = name_pair(n)
        if n.startswith("Cast a Spell"):
            return np_ + ["Cast one repertoire spell and pay its Mana cost.", "Lancer un sort du répertoire et payer son coût en Mana."]
        if n == "Limited Magic Immunity":
            return np_ + [
                "Unless willing, the creature ignores spells cast at school Tiers 1-4. It has advantage on saves against other magic.",
                "Sauf si elle y consent, la créature ignore les sorts des écoles de Tier 1 à 4. Elle a l'avantage aux sauvegardes contre les autres effets magiques.",
            ]
        if n == "Cantrip":
            return np_ + ["Cast a free repertoire spell.", "Lancer un sort gratuit du répertoire."]
        if n == "Divine Eminence":
            return np_ + [
                "Infuse one weapon strike with Surge before rolling. Each Mana adds 1d8 radiant, up to the school Tier.",
                "Infuser un coup avec Afflux avant le jet. Chaque Mana ajoute 1d8 radiant, dans la limite du Tier de l'école.",
            ]
        if n == "Spell Storing":
            return np_ + [
                "The amulet wearer can pay for and store one school spell of value 4 or less. The guardian releases it once on command or on the chosen trigger, using the caster's statistics.",
                "Le porteur de l'amulette peut payer et stocker un sort d'école de valeur 4 ou moins. Le gardien le libère une fois sur ordre ou au déclencheur choisi, avec les statistiques du lanceur.",
            ]
        rc = recharge_of(n, t)
        e = np_ + tidy(np_, both(t, n, bool(rc)))
        if rc:
            base_en = re.sub(r"\s*\(Recharge[^)]*\)", "", e[0])
            base_fr = re.sub(r"\s*\(Recharge[^)]*\)", "", e[1])
            e[0], e[1] = base_en + " (recharge 1–3 turns)", base_fr + " (recharge 1 à 3 tours)"
            e.append({"rc": rc})
        return e

    def name_pair(n: str) -> list[str]:
        base = n
        extra = ""
        mm = re.match(r"^(.*?)\s*\((.*)\)$", n)
        if mm:
            base, extra = mm[1], mm[2]
        fr_base = names.get(base)
        if fr_base is None and missing is not None:
            missing.setdefault("name:" + base, {"id": "name:" + base, "en": base, "n": 0, "ex": m["n"][0]})["n"] += 1
        fr_extra = extra
        if extra:
            fr_extra = re.sub(r"Recharge (\d)[–-](\d)", r"Recharge \1–\2", extra)
            fr_extra = re.sub(r"Costs (\d) Actions", r"coûte \1 actions", fr_extra)
            fr_extra = re.sub(r"(\d+)/Day", r"\1/jour", fr_extra)
            fr_extra = re.sub(r"(\d+)/Turn", r"\1/tour", fr_extra)
            fr_extra = fr_extra.replace("Recharges after a Short or Long Rest", "après un repos court ou long")
            fr_extra = fr_extra.replace("Recharges after a Long Rest", "après un repos long")
            for fm in ("Humanoid", "Beast", "Bat", "Wolf", "Rat", "Boar", "Bear", "Tiger", "Hybrid", "Mist", "Vampire", "Form"):
                pass
            fr_extra = names.get("(" + extra + ")", fr_extra)
        en_full = n
        fr_full = (fr_base or base) + (f" ({fr_extra})" if extra else "")
        return [en_full, fr_full]

    out = {
        "al": [alignment(d.get("al", ""), is_dragon, "en"), alignment(d.get("al", ""), is_dragon, "fr")],
        "spd": [speed(d.get("spd", ""), "en"), speed(d.get("spd", ""), "fr")],
        "sen": [senses(d.get("sen", ""), "en"), senses(d.get("sen", ""), "fr")],
        "lng": [languages(d.get("lng", ""), "en"), languages(d.get("lng", ""), "fr")],
        "mx": cells(d["ab"]) if d.get("ab") else None,
        "sv": sorted({DOMAIN[SHORT[x.split()[0]]] for x in (d.get("sv") or "").split(",") if x.strip()}),
        "sk": [[x.split(" +")[0].strip(), SKILL.get(x.split(" +")[0].strip(), x.split(" +")[0].strip())] for x in (d.get("sk") or "").split(",") if x.strip()],
        "res": [d.get("res", ""), dmg_list(d.get("res", ""), "fr")],
        "imm": [d.get("imm", ""), dmg_list(d.get("imm", ""), "fr")],
        "vul": [d.get("vul", ""), dmg_list(d.get("vul", ""), "fr")],
        "cimm": [", ".join(x.strip().lower() for x in (d.get("cimm") or "").split(",") if x.strip()),
                 ", ".join(COND.get(x.strip(), x.strip().lower()) for x in (d.get("cimm") or "").split(",") if x.strip())],
        "mast": cx.t,
        "atk": [], "tr": [], "act": [], "leg": [], "rea": [],
    }
    for n, t in d.get("tr", []):
        if "Spellcasting" in n:
            spells = repertoire(t)
            tiers = {}
            for spell in spells:
                school = spell["school"]
                tiers[school] = max(1, tiers.get(school, 0), spell["cost"])
            primary = max(tiers, key=lambda school: sum(s["school"] == school for s in spells))
            tiers[primary] = max(tiers[primary], cx.t)
            res_men = out["mx"][7] if out.get("mx") else 0
            mana = sum([0, 2, 6, 14, 24, 36][v] for v in tiers.values()) + res_men * (max(tiers.values()) // 2)
            out["magic"] = {"tiers": tiers, "mana": mana, "spells": spells}
        else:
            out["tr"].append(entry(n, t))
    for n, t in d.get("act", []):
        a = attack(n, t, cx)
        if a:
            rest = both(a["rest"], n) if a["rest"] else ["", ""]
            out["atk"].append({
                "n": name_pair(n), "ab": a["ab"], "nd": a["nd"], "dd": a["dd"], "mod": a["mod"],
                "ty": [a["ty"], DMG.get(a["ty"], "")],
                "how": [f"{a['kind']}, {range_text(a['rng'], cx, 'en')}" + (f", {a['target']}" if a["target"] else ""),
                        f"{KIND_FR[a['kind']]}, {range_text(a['rng'], cx, 'fr')}" + (f", {TARGET_FR.get(a['target'], a['target'])}" if a["target"] else "")],
                "plus": [f"+ {a['plus'][0]} {a['plus'][1]}", f"+ {a['plus'][0]} {DMG[a['plus'][1]]}"] if a.get("plus") else None,
                "rest": rest,
            })
        else:
            out["act"].append(entry(n, t))
    for n, t in d.get("leg", []):
        out["leg"].append(entry(n, t))
    for n, t in d.get("rea", []):
        out["rea"].append(entry(n, t))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--templates", type=Path, help="write the untranslated texts and names to this file instead")
    ap.add_argument("--check", action="store_true", help="exit 1 if srd-luparis.json is out of date")
    args = ap.parse_args()
    mons = {m["id"]: m for m in json.loads((ROOT / "srd-monsters.json").read_text(encoding="utf-8"))}
    det = json.loads((ROOT / "srd-details.json").read_text(encoding="utf-8"))
    fr = json.loads(FR_FILE.read_text(encoding="utf-8")) if FR_FILE.exists() else {}
    missing: dict = {}
    out = {k: convert(mons[k], d, fr, missing) for k, d in det.items() if k in mons}
    # The starter bestiary also has a banshee, absent from the SRD.
    out["d22"] = json.loads((ROOT / "tools/banshee.json").read_text(encoding="utf-8"))
    if args.templates:
        items = sorted(missing.values(), key=lambda e: (-e["n"], e["id"]))
        args.templates.write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{sum(1 for e in items if not e['id'].startswith('name:'))} texts and "
              f"{sum(1 for e in items if e['id'].startswith('name:'))} names without French → {args.templates}")
        return 0
    text = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    target = ROOT / "srd-luparis.json"
    if args.check:
        ok = target.exists() and target.read_text(encoding="utf-8") == text
        print("srd-luparis.json is up to date." if ok else "Out of date: srd-luparis.json — run python3 tools/srd_luparis.py")
        return 0 if ok else 1
    target.write_text(text, encoding="utf-8")
    n_missing = sum(1 for e in missing.values() if not e["id"].startswith("name:"))
    print(f"{len(out)} stat blocks → srd-luparis.json ({len(text) // 1024} KB); {n_missing} texts still in English for French")
    return 0


if __name__ == "__main__":
    sys.exit(main())

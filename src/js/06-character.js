window.addEventListener('hashchange', route);
Object.assign(T.en, {
  tab_sheet: 'Character',
  sk_name: 'Name',
  sk_people: 'People',
  sk_xp: 'XP earned',
  sk_level: 'Level',
  sk_spent: 'XP spent',
  sk_left: 'XP left',
  sk_over: 'Over budget by',
  sk_don: 'Talents',
  sk_matrix: 'Matrix of Intents',
  sk_dv: 'Hit die',
  sk_schools: 'Schools of magic',
  sk_fams: 'Weapon families',
  sk_def: 'Defense',
  sk_armor: 'Armor',
  sk_shield: 'Shield',
  sk_eva: 'Evasion',
  sk_armv: 'Armor value',
  sk_minor: 'Minor',
  sk_major: 'Major',
  sk_severe: 'Severe',
  sk_init: 'Initiative',
  sk_res: 'Vitality and resources',
  sk_vit: 'Vitality',
  sk_st: 'Stamina',
  sk_short: 'Short rest',
  sk_long: 'Long rest',
  sk_atk: 'Attacks and spells',
  sk_target: 'Target Evasion',
  sk_attack: 'Attack',
  sk_damage: 'Damage',
  sk_addw: 'Add a weapon',
  sk_wname: 'Weapon name',
  sk_fam: 'Family',
  sk_size: 'Size',
  sk_add: 'Add',
  sk_remove: 'Remove',
  sk_spell: 'basic spell',
  sk_dc: 'DC',
  sk_nospell: 'Buy a Tier in a school to get its spells.',
  sk_log: 'Rolls',
  sk_nolog: 'Your rolls will show up here.',
  sk_hit: 'Hit',
  sk_miss: 'Miss',
  sk_crit: 'Critical!',
  sk_notes: 'Notes',
  sk_io: 'Save or share the sheet',
  sk_copy: 'Copy the sheet',
  sk_import: 'Import pasted sheet',
  sk_new: 'New character',
  sk_copied: 'Sheet copied.',
  sk_bad: 'This text is not a valid sheet.',
  sk_done: 'Sheet imported.',
  sk_demo: 'Example character: change anything, the sheet recalculates.',
  sk_costs:
    'XP costs, v0.4: each of the 6 stats costs 20, 40, 80, 160… per +1 (cap +3 to level 5, +5 to 10, +7 to 15), and −1 gives back 20; Fleet-footed 40 per rank; armor training light 20, medium 60, heavy 140 in total; shield training 40; Tiers 1 to 5 cost 40, 80, 160, 240, 320 (840 in total); schools, weapon families and the Apex are disciplines: the highest costs ×1, the 2nd ×1.5, the 3rd ×2, the next ones ×3; hit die d8, d10, d12 cost 80, 240, 480 in total. Level = XP earned ÷ 100. Tier 2 from level 3, Tier 3 from 5, Tier 4 from 11, Tier 5 from 17.',
  sk_mb: b => `Mastery +${b}`,
  sk_next: n => `next +${n} XP`,
  sk_lock: (tt, l) => `Tier ${tt} from level ${l}`,
  sk_fx: n => `effects up to ${n}`,
  sk_unm: 'not mastered',
  sz: {
    one: 'One-handed (d6)',
    poly1: 'Versatile, one hand (d8)',
    poly2: 'Versatile, two hands (d10)',
    two: 'Two-handed (d12)',
  },
  it: ['Power', 'Finesse', 'Resilience'],
  dm: ['Physical', 'Mental', 'Social'],
  hint: {
    P_phy: 'Strength',
    F_phy: 'Evasion',
    R_phy: 'Thresholds, Stamina',
    P_men: 'Offensive spells',
    F_men: 'Perception',
    R_men: 'Mana',
    P_soc: 'Authority',
    F_soc: 'Persuasion',
    R_soc: 'Composure',
  },
});
Object.assign(T.fr, {
  tab_sheet: 'Personnage',
  sk_name: 'Nom',
  sk_people: 'Peuple',
  sk_xp: 'XP gagnée',
  sk_level: 'Niveau',
  sk_spent: 'XP dépensée',
  sk_left: 'XP restante',
  sk_over: 'Budget dépassé de',
  sk_don: 'Talents',
  sk_matrix: 'Matrice des intentions',
  sk_dv: 'Dé de vie',
  sk_schools: 'Écoles de magie',
  sk_fams: "Familles d'armes",
  sk_def: 'Défense',
  sk_armor: 'Armure',
  sk_shield: 'Bouclier',
  sk_eva: 'Esquive',
  sk_armv: "Valeur d'armure",
  sk_minor: 'Mineur',
  sk_major: 'Majeur',
  sk_severe: 'Sévère',
  sk_init: 'Initiative',
  sk_res: 'Vitalité et ressources',
  sk_vit: 'Vitalité',
  sk_st: 'Souffle',
  sk_short: 'Repos court',
  sk_long: 'Repos long',
  sk_atk: 'Attaques et sorts',
  sk_target: 'Esquive de la cible',
  sk_attack: 'Attaque',
  sk_damage: 'Dégâts',
  sk_addw: 'Ajouter une arme',
  sk_wname: "Nom de l'arme",
  sk_fam: 'Famille',
  sk_size: 'Gabarit',
  sk_add: 'Ajouter',
  sk_remove: 'Retirer',
  sk_spell: 'sort de base',
  sk_dc: 'DD',
  sk_nospell: 'Achète un Tier dans une école pour obtenir ses sorts.',
  sk_log: 'Jets',
  sk_nolog: "Tes jets s'afficheront ici.",
  sk_hit: 'Touché',
  sk_miss: 'Raté',
  sk_crit: 'Critique !',
  sk_notes: 'Notes',
  sk_io: 'Sauvegarder ou partager la fiche',
  sk_copy: 'Copier la fiche',
  sk_import: 'Importer la fiche collée',
  sk_new: 'Nouveau personnage',
  sk_copied: 'Fiche copiée.',
  sk_bad: "Ce texte n'est pas une fiche valide.",
  sk_done: 'Fiche importée.',
  sk_demo: "Personnage d'exemple : change ce que tu veux, la fiche recalcule tout.",
  sk_costs:
    "Coûts en XP, v0.4 : chacune des 6 stats coûte 20, 40, 80, 160… par +1 (plafond +3 jusqu'au niveau 5, +5 jusqu'au 10, +7 jusqu'au 15), et −1 rend 20 ; Pas rapide 40 par rang ; entraînement aux armures légères 20, intermédiaires 60, lourdes 140 au total ; aux boucliers 40 ; les Tiers 1 à 5 coûtent 40, 80, 160, 240, 320 (840 au total) ; écoles, familles d'armes et Apex sont des disciplines : la plus haute coûte ×1, la 2e ×1,5, la 3e ×2, les suivantes ×3 ; dé de vie d8, d10, d12 : 80, 240, 480 au total. Niveau = XP gagnée ÷ 100. Tier 2 dès le niveau 3, Tier 3 dès le 5, Tier 4 dès le 11, Tier 5 dès le 17.",
  sk_mb: b => `Maîtrise +${b}`,
  sk_next: n => `suivant +${n} XP`,
  sk_lock: (tt, l) => `Tier ${tt} dès le niveau ${l}`,
  sk_fx: n => `effets jusqu'à ${n}`,
  sk_unm: 'non maîtrisée',
  sz: {
    one: 'À une main (d6)',
    poly1: 'Polyvalente, une main (d8)',
    poly2: 'Polyvalente, deux mains (d10)',
    two: 'À deux mains (d12)',
  },
  it: ['Puissance', 'Finesse', 'Résistance'],
  dm: ['physique', 'mentale', 'sociale'],
  dmH: ['Physique', 'Mental', 'Social'],
  hint: {
    P_phy: 'Force',
    F_phy: 'Esquive',
    R_phy: 'Seuils, Souffle',
    P_men: 'Sorts offensifs',
    F_men: 'Perception',
    R_men: 'Mana',
    P_soc: 'Autorité',
    F_soc: 'Persuasion',
    R_soc: 'Sang-froid',
  },
});
const stCost = v => (v < 0 ? -20 * -v : 20 * (2 ** v - 1));
const COST = {
    pas: 40,
    cell: [0, 5, 15, 35, 75, 155],
    prof: { arm: [0, 20, 60, 140], shd: 40 },
    tier: [0, 40, 120, 280, 520, 840],
    dv: { 6: 0, 8: 80, 10: 240, 12: 480 },
    mult: [1, 1.5, 2, 3],
  },
  GATE = [1, 1, 3, 5, 11, 17],
  MANA = [0, 2, 6, 14, 24, 36],
  STAM = [0, 1, 3, 7, 12, 18];
const INT = ['P', 'F', 'R'],
  DOM = ['phy', 'men', 'soc'];
const TAL = {
    sneak: {
      g: 'mar',
      c: [40, 80, 160],
      n: ['Sneak strike', 'Coup en traître'],
      r: [
        [
          'Once per turn, when you hit with Physical Finesse a target you have advantage against, or that an ally threatens in melee: +1 Mastery die.',
          "Une fois par tour, quand tu touches en Finesse physique une cible contre qui tu as l'avantage, ou qu'un allié menace au contact : +1 dé de Maîtrise.",
        ],
        ['+2 Mastery dice instead.', '+2 dés de Maîtrise à la place.'],
        ['+3 Mastery dice instead.', '+3 dés de Maîtrise à la place.'],
      ],
    },
    second: {
      g: 'mar',
      c: [40, 80],
      n: ['Second wind', 'Second souffle'],
      r: [
        [
          'Bonus action, once per short rest: regain 1 box and 2 Stamina.',
          'Action bonus, une fois par repos court : tu regagnes 1 case et 2 Souffle.',
        ],
        ['2 boxes and 4 Stamina, twice per short rest.', '2 cases et 4 Souffle, deux fois par repos court.'],
      ],
      q: ['Resilience +3', 'Résistance +3'],
      rq: { st: 'R', v: 3 },
    },
    dodge: {
      g: 'mar',
      c: [80],
      n: ['Uncanny dodge', 'Esquive instinctive'],
      r: [
        [
          'Reaction when a hit you can see lands, 2 Stamina: its damage is halved before the thresholds. Once per round.',
          'Réaction quand un coup que tu vois venir te touche, 2 Souffle : ses dégâts sont divisés par deux avant les seuils. Une fois par round.',
        ],
      ],
      q: ['Finesse +3', 'Finesse +3'],
      rq: { st: 'F', v: 3 },
    },
    pas: {
      g: 'mar',
      c: [40, 40],
      n: ['Fleet-footed', 'Pas rapide'],
      r: [
        ['+2 tiles of movement.', '+2 cases de déplacement.'],
        ['+4 tiles of movement in total.', '+4 cases de déplacement au total.'],
      ],
    },
    beast: {
      g: 'pac',
      c: [40, 80, 160],
      n: ['Companion', 'Compagnon'],
      r: [
        [
          'A beast bound to you (Bestiary, CR 1/4 or less). It acts on your initiative when you command it (bonus action); otherwise it only defends itself. If it dies, a new one answers an 8-hour ritual.',
          'Une bête liée à toi (Bestiaire, FP 1/4 au plus). Elle agit à ton initiative sur ton ordre (action bonus) ; sinon elle se défend seulement. Si elle meurt, une autre répond à un rituel de 8 heures.',
        ],
        ['CR 1 or less; you share its senses as an action.', 'FP 1 au plus ; tu partages ses sens par une action.'],
        ['CR 3 or less; it acts on its own without a command.', 'FP 3 au plus ; elle agit seule, sans ordre.'],
      ],
    },
    pact: {
      g: 'pac',
      c: [40, 80, 160],
      n: ['Pact', 'Pacte'],
      r: [
        [
          'You are bound to an entity met in the story. Favors: rank + 1 per long rest. Spend a Favor to pay 2 Mana or 2 Stamina of a cost, to gain +1 Mastery on a roll (before rolling), or to call on a gift of your entity. Each Favor spent adds 1 Debt. Rank 1 gift of your entity.',
          "Tu es lié à une entité rencontrée dans le récit. Faveurs : rang + 1 par repos long. Une Faveur paie 2 Mana ou 2 Souffle d'un coût, donne +1 Maîtrise à un jet (avant de lancer) ou appelle un don de ton entité. Chaque Faveur dépensée ajoute 1 Dette. Don de rang 1 de ton entité.",
        ],
        ['Rank 2 gift of your entity.', 'Don de rang 2 de ton entité.'],
        [
          'Rank 3 gift of your entity; your Debt threshold rises by 2.',
          'Don de rang 3 de ton entité ; ton seuil de Dette monte de 2.',
        ],
      ],
    },
  },
  TALG = { mar: ['Martial', 'Martiaux'], pac: ['Bonds and pacts', 'Liens et pactes'] },
  STANCES = [],
  SFC = [20, 40, 80],
  PATR = {
    fiend: {
      n: ['Fiend', 'Fiélon'],
      d: ['Infernal bargains, fire and ambition.', 'Marchés infernaux, feu et ambition.'],
      g: [
        [
          'When you drop an enemy to 0 boxes, regain 2 Stamina or 2 Mana.',
          'Quand tu fais tomber un ennemi à 0 case, tu regagnes 2 Souffle ou 2 Mana.',
        ],
        ['Resistance to fire.', 'Résistance au feu.'],
        [
          '1 Favor when you hit: the blow costs 1 more box (once per round).',
          '1 Faveur quand tu touches : le coup coûte 1 case de plus (une fois par round).',
        ],
      ],
    },
    fey: {
      n: ['Archfey', 'Fée'],
      d: ['Whims, glamour and old oaths.', 'Caprices, enchantements et vieux serments.'],
      g: [
        [
          '1 Favor: light control (pushed or slowed) on a creature you see, no roll to hit, Mental save against your DC.',
          "1 Faveur : contrôle léger (repoussé ou ralenti) sur une créature visible, sans jet d'attaque, sauvegarde mentale contre ton DD.",
        ],
        [
          'Advantage against charmed; you cannot be put to sleep by magic.',
          "Avantage contre l'état charmé ; la magie ne peut pas t'endormir.",
        ],
        [
          'Reaction, 1 Favor, when you lose a box: you become invisible until the end of your next turn.',
          "Réaction, 1 Faveur, quand tu perds une case : tu deviens invisible jusqu'à la fin de ton prochain tour.",
        ],
      ],
    },
    abyss: {
      n: ['Great Old One', 'Grand Ancien'],
      d: ['Whispers from beyond the stars.', "Murmures venus d'au-delà des étoiles."],
      g: [
        [
          'Telepathy with any creature within 30 ft that speaks a language.',
          'Télépathie avec toute créature à 30 pieds qui parle une langue.',
        ],
        [
          'Advantage against charmed and frightened; resistance to psychic damage.',
          'Avantage contre charmé et effrayé ; résistance aux dégâts psychiques.',
        ],
        [
          '1 Favor: a creature you see is frightened or charmed until the end of its next turn (Mental Resilience against your DC).',
          "1 Faveur : une créature visible est effrayée ou charmée jusqu'à la fin de son prochain tour (Résistance mentale contre ton DD).",
        ],
      ],
    },
    celestial: {
      n: ['Celestial', 'Céleste'],
      d: ['A bright and demanding light.', 'Une lumière éclatante et exigeante.'],
      g: [
        [
          '1 Favor, bonus action: an ally within 30 ft regains 1 box.',
          '1 Faveur, action bonus : un allié à 30 pieds regagne 1 case.',
        ],
        [
          'Resistance to radiant damage; you shed light at will.',
          'Résistance aux dégâts radiants ; tu émets de la lumière à volonté.',
        ],
        [
          '2 Favors, action: an ally at 0 boxes within 30 ft gets up with 2 boxes.',
          '2 Faveurs, action : un allié à 0 case à 30 pieds se relève avec 2 cases.',
        ],
      ],
    },
    dead: {
      n: ['The Dead', 'Les Morts'],
      d: ['Ghosts, liches and forgotten tombs.', 'Spectres, liches et tombeaux oubliés.'],
      g: [
        [
          'You see spirits and can ask a corpse three questions once per long rest.',
          'Tu vois les esprits et peux poser trois questions à un cadavre une fois par repos long.',
        ],
        [
          'Resistance to necrotic damage; advantage against poisoned.',
          "Résistance aux dégâts nécrotiques ; avantage contre l'état empoisonné.",
        ],
        [
          'Once per long rest, when you drop to 0 boxes, you stay up with 1 box until the end of your next turn, then fall.',
          "Une fois par repos long, quand tu tombes à 0 case, tu restes debout avec 1 case jusqu'à la fin de ton prochain tour, puis tu tombes.",
        ],
      ],
    },
    dragon: {
      n: ['Elder dragon', 'Dragon ancien'],
      d: ['A wyrm older than kingdoms.', 'Un dragon plus vieux que les royaumes.'],
      g: [
        [
          'Draconic scales: natural armor 2 (keep the better of natural and worn armor).',
          'Écailles draconiques : armure naturelle 2 (on garde la meilleure entre armure naturelle et portée).',
        ],
        [
          "1 Favor, action: breath in a 15 ft cone, your rank × d8 damage of your dragon's element, Physical Finesse save for half.",
          "1 Faveur, action : souffle en cône de 15 pieds, ton rang × d8 dégâts de l'élément de ton dragon, Finesse physique pour moitié.",
        ],
        [
          '2 Favors, bonus action: wings for 1 minute (flight at your speed).',
          '2 Faveurs, action bonus : des ailes pour 1 minute (vol à ta vitesse).',
        ],
      ],
    },
  };
function talReq(T, c) {
  const q = T.rq;
  if (!q) return true;
  if (q.st) return ((c.st || {})[q.st] || 0) >= q.v;
  if (q.fam) return ((c.fam || {})[q.fam] || 0) >= q.v;
  if (q.sch) return Object.values(c.sch || {}).some(v => v >= q.sch);
  return true;
}
const favMax = c => ((c.tal || {}).pact || 0) + 1,
  debtMax = c => {
    const r = (c.tal || {}).pact || 0;
    return 3 * r + (r >= 3 ? 2 : 0);
  };
function talCost(c) {
  let s = 0;
  for (const k in c.tal || {}) {
    const T = TAL[k];
    if (T) for (let i = 0; i < Math.min(c.tal[k], T.c.length); i++) s += T.c[i];
  }
  for (const f of c.sf || []) for (let i = 0; i < Math.min(f.r || 0, 3); i++) s += SFC[i];
  return s;
}
const stCap = (c = C) => {
  const L = lvl(c);
  return L <= 5 ? 3 : L <= 10 ? 5 : L <= 15 ? 7 : 99;
};
function syncCells(c) {
  const S = c.st;
  c.cells = Object.fromEntries(INT.flatMap(i => DOM.map(d => [i + '_' + d, (S[i] || 0) + (S[d] || 0)])));
}
function stFromCells(cl) {
  const g = k => +(cl && cl[k]) || 0,
    all = INT.flatMap(i => DOM.map(d => g(i + '_' + d))),
    m = all.reduce((a, b) => a + b, 0) / 9,
    cl3 = v => Math.max(-1, Math.min(3, Math.round(v))),
    S = {};
  for (const i of INT) S[i] = cl3(DOM.reduce((a, d) => a + g(i + '_' + d), 0) / 3 - m / 2);
  for (const d of DOM) S[d] = cl3(INT.reduce((a, i) => a + g(i + '_' + d), 0) / 3 - m / 2);
  return S;
}
const SDIE = { afflux: 12, creuset: 8, mirage: 8, horizon: 6, eidolon: 8, egide: 8, harmonie: 6 };
const SCH = {
  afflux: ['Surge', 'Afflux'],
  creuset: ['Crucible', 'Creuset'],
  mirage: ['Mirage', 'Mirage'],
  horizon: ['Horizon', 'Horizon'],
  eidolon: ['Eidolon', 'Eidolon'],
  egide: ['Aegis', 'Égide'],
  harmonie: ['Harmony', 'Harmonie'],
};
const FAM = {
  taille: { n: ['Cutting', 'Taille'], c: 'P_phy' },
  estoc: { n: ['Thrusting', 'Estoc'], c: 'F_phy' },
  cont: { n: ['Blunt', 'Contondantes'], c: 'P_phy' },
  hast: { n: ['Polearms', 'Hast'], c: 'P_phy' },
  tir: { n: ['Ranged and thrown', 'Tir et jet'], c: 'F_phy' },
  martial: {
    n: ['Martial arts', 'Arts martiaux'],
    c: 'F_phy',
    sz: { one: ['One hand busy', 'Une main occupée'], poly1: ['Both hands free', 'Mains libres'] },
  },
  nat: {
    n: ['Natural weapons', 'Armes naturelles'],
    c: 'P_phy',
    sz: {
      one: ['Small (claws, beak)', 'Petite (griffes, bec)'],
      poly1: ['Medium (fangs, horns)', 'Moyenne (crocs, cornes)'],
      poly2: ['Large (tail, tusks)', 'Grande (queue, défenses)'],
      two: ['Huge (crushing jaws)', 'Énorme (mâchoire broyante)'],
    },
  },
};
function szLabel(f, k) {
  const o = FAM[f] && FAM[f].sz;
  return o ? (o[k] ? tr(o[k]) : '') : T[lang].sz[k];
}
function szKeys(f) {
  const o = FAM[f] && FAM[f].sz;
  return o ? Object.keys(o) : Object.keys(SZ);
}
const SZ = { one: 6, poly1: 8, poly2: 10, two: 12 };
const ARM = {
  none: [['None', 'Aucune'], 0, 'l'],
  cuir: [['Leather', 'Cuir'], 1, 'l'],
  clou: [['Studded leather', 'Cuir clouté'], 2, 'l'],
  chem: [['Chain shirt', 'Chemise de mailles'], 3, 'm'],
  cuira: [['Breastplate, scale', 'Cuirasse, écailles'], 4, 'm'],
  demi: [['Half plate', 'Demi-plate'], 5, 'm'],
  cotte: [['Chain mail', 'Cotte de mailles'], 6, 'h'],
  clib: [['Splint', 'Clibanion'], 7, 'h'],
  harn: [['Plate', 'Harnois'], 8, 'h'],
};
const SHD = {
  none: [['None', 'Aucun'], 0],
  bocle: [['Buckler', 'Bocle'], 0],
  rond: [['Small shield', 'Rondache'], 1],
  ecu: [['Heater shield', 'Écu'], 1],
  grand: [['Large shield', 'Grand bouclier'], 2],
  pavois: [['Tower shield', 'Pavois'], 2],
};
const blankC = () => ({
  id: tid(),
  camp: '',
  name: '',
  people: '',
  xp: 150,
  st: { P: 0, F: 0, R: 0, phy: 0, men: 0, soc: 0 },
  tal: {},
  sf: [],
  stances: [],
  cells: Object.fromEntries(INT.flatMap(i => DOM.map(d => [i + '_' + d, 0]))),
  dv: 6,
  sch: Object.fromEntries(Object.keys(SCH).map(k => [k, 0])),
  apex: 0,
  prof: { arm: 0, shd: 0 },
  fam: Object.fromEntries(Object.keys(FAM).map(k => [k, 0])),
  armor: 'none',
  shield: 'none',
  weapons: [],
  used: { hp: 0, mana: 0, st: 0 },
  notes: '',
  demo: false,
});
function demoC() {
  const c = blankC();
  Object.assign(c, {
    camp: lang === 'fr' ? 'Exemple' : 'Example',
    name: 'Kael',
    people: lang === 'fr' ? 'Humain' : 'Human',
    xp: 300,
    dv: 8,
    prof: { arm: 2, shd: 0 },
    armor: 'chem',
    shield: 'none',
    demo: true,
  });
  c.st = { P: 1, F: 0, R: 1, phy: 1, men: 0, soc: -1 };
  syncCells(c);
  c.fam.taille = 1;
  c.weapons = [
    { n: lang === 'fr' ? 'Épée longue' : 'Longsword', f: 'taille', s: 'poly2' },
    { n: lang === 'fr' ? 'Dague' : 'Dagger', f: 'estoc', s: 'one' },
  ];
  return c;
}
let CH;
try {
  CH = lsGet('luparis-chars', null);
} catch (e) {}
if (!CH || !Array.isArray(CH.list) || !CH.list.length) {
  let old;
  try {
    old = lsGet('luparis-sheet', null);
  } catch (e) {}
  CH = { list: [old && old.cells ? old : demoC()], active: null };
}
for (const c of CH.list) {
  if (!c.prof) c.prof = { arm: armNeed(c.armor || 'none'), shd: c.shield && c.shield !== 'none' ? 1 : 0 };
  if (c.sch && c.sch.apex != null) {
    if (c.sch.apex > 0 && !c.apex) c.apex = c.sch.apex;
    delete c.sch.apex;
  }
  if (c.apex == null) c.apex = 0;
  for (const k of Object.keys(FAM)) if (c.fam && c.fam[k] == null) c.fam[k] = 0;
  if (!c.id) c.id = tid();
  if (c.camp == null) c.camp = c.demo ? (lang === 'fr' ? 'Exemple' : 'Example') : '';
  if (!c.used) c.used = { hp: 0, mana: 0, st: 0 };
  if (!c.st) c.st = stFromCells(c.cells);
  if (!c.tal || typeof c.tal !== 'object') c.tal = {};
  for (const k in c.tal) if (!TAL[k]) delete c.tal[k];
  if (c.pas) {
    c.tal.pas = Math.max(c.tal.pas || 0, c.pas);
  }
  delete c.pas;
  if (!Array.isArray(c.sf)) c.sf = [];
  if (!Array.isArray(c.stances)) c.stances = [];
  syncCells(c);
}
let C = CH.list.find(c => c.id === CH.active) || CH.list[0];
campSync();
if (!CH.list.some(c => c.id === CH.active)) CH.active = null;
var saveCT = 0,
  handQ = 0,
  handGen = 0;
function saveCNow() {
  clearTimeout(saveCT);
  saveCT = 0;
  lsSet('luparis-chars', CH);
}
function saveC() {
  if (MP.role === 'player') {
    if (typeof mpSendChar === 'function') mpSendChar();
  } else {
    clearTimeout(saveCT);
    saveCT = setTimeout(saveCNow, 250);
    if (MP.role === 'host' && typeof mpPush === 'function') mpPush();
  }
  if (typeof renderPlace === 'function') renderPlace();
  if (typeof renderHand === 'function' && !handQ) {
    const g = handGen;
    handQ = requestAnimationFrame(() => {
      handQ = 0;
      if (handGen === g) renderHand();
    });
  }
}
const lvl = (c = C) => Math.max(1, Math.floor((+c.xp || 0) / 100)),
  mb = tier => (tier > 0 ? tier + 1 : 0),
  sgn = v => (v >= 0 ? '+' : '') + v;
function discs(c = C) {
  return [
    ...Object.keys(c.sch).map(k => ['sch', k, c.sch[k]]),
    ...Object.keys(c.fam).map(k => ['fam', k, c.fam[k]]),
    ['apx', 'apex', c.apex || 0],
  ]
    .filter(d => d[2] > 0)
    .sort((a, b) => b[2] - a[2]);
}
function discCost(c = C) {
  return discs(c).reduce((s, d, i) => s + Math.round(COST.tier[d[2]] * COST.mult[Math.min(i, 3)]), 0);
}
function spent() {
  const pr = C.prof || {};
  let s = discCost() + COST.prof.arm[pr.arm || 0] + (pr.shd ? COST.prof.shd : 0);
  for (const k in C.st) s += stCost(C.st[k]);
  return s + talCost(C) + COST.dv[C.dv];
}
function armNeed(k) {
  return k === 'none' ? 0 : { l: 1, m: 2, h: 3 }[(ARM[k] || ARM.none)[2]];
}
function derived(c = C) {
  const L = lvl(c),
    a = ARM[c.armor] || ARM.none,
    cl = c.cells,
    pr = c.prof || { arm: 0, shd: 0 },
    armOk = armNeed(c.armor) <= (pr.arm || 0),
    shdOk = c.shield === 'none' || !!pr.shd,
    cap = a[2] === 'l' ? 5 : a[2] === 'm' ? 2 : 1,
    nat = Math.max(2 * (c.apex || 0), (c.tal || {}).pact && c.patron === 'dragon' ? 2 : 0),
    av = Math.max(armOk ? a[1] : 0, nat);
  const eva = 10 + Math.min(cl.F_phy, cap) + (shdOk ? (SHD[c.shield] || SHD.none)[1] : 0) - (armOk ? 0 : 2),
    base = c.dv + L + cl.R_phy,
    ts = Object.values(c.sch),
    maxT = Math.max(0, ...ts);
  return {
    L,
    eva,
    av,
    armOk,
    shdOk,
    minor: av,
    major: base + av,
    severe: 2 * base + av,
    hp: 1 + Math.ceil((L * c.dv) / 12),
    mana: ts.reduce((s, x) => s + MANA[x], 0) + cl.R_men * Math.floor(maxT / 2),
    nat,
    st: Math.max(0, Object.values(c.fam).reduce((s, x) => s + STAM[x], 0) + STAM[c.apex || 0] + cl.R_phy),
    init: cl.F_phy,
    mv: 6 + 2 * ((c.tal || {}).pas || 0) - (armOk && a[2] === 'h' ? 2 : 0),
  };
}
function cellName(k) {
  const [i, d] = k.split('_');
  const ii = INT.indexOf(i),
    di = DOM.indexOf(d);
  return lang === 'fr' ? `${T.fr.it[ii]} ${T.fr.dm[di]}` : `${T.en.dm[di]} ${T.en.it[ii]}`;
}
const DIFF = [
  ['trivial', 0, ['Trivial', 'Trivial']],
  ['easy', 5, ['Easy', 'Facile']],
  ['medium', 10, ['Medium', 'Moyen']],
  ['hard', 15, ['Hard', 'Difficile']],
  ['deadly', 25, ['Deadly', 'Mortel']],
  ['impossible', 50, ['Impossible', 'Impossible']],
];
function campsGet() {
  try {
    return lsGet('luparis-camps', null) || {};
  } catch (e) {
    return {};
  }
}
function campsPut(o) {
  lsSet('luparis-camps', o);
}
function campRec(o, name) {
  if (!o[name]) {
    const xs = CH.list.filter(c => (c.camp || '') === name).map(c => +c.xp || 0);
    o[name] = { xp: xs.length ? Math.max(...xs) : 150, log: [] };
  }
  return o[name];
}
function campSync() {
  const o = campsGet();
  let ch = false;
  for (const c of CH.list) {
    const r = c.camp && o[c.camp];
    if (r && c.xp !== r.xp) {
      c.xp = r.xp;
      ch = true;
    }
  }
  if (ch) lsSet('luparis-chars', CH);
}
function campAward(name, x, label) {
  if (!name) return;
  const o = campsGet(),
    r = campRec(o, name);
  r.xp = Math.max(0, r.xp + x);
  r.log.unshift({ d: Date.now(), l: String(label || '').slice(0, 80), x });
  r.log = r.log.slice(0, 60);
  campsPut(o);
  campSync();
  if (CH.active) renderSheet();
  else renderList();
  if (typeof renderHand === 'function') renderHand();
}
function campPanel() {
  const o = campsGet(),
    names = camps();
  if (!names.length) return '';
  const ti = lang === 'fr' ? 1 : 0;
  return (
    `<section class="card campgm"><h3>${L2('Campaign XP', 'XP de campagne')} <span class="pill">${L2('GM', 'MJ')}</span></h3><p class="small">${L2('Every character of a campaign shares its XP. Only the game master awards it here, or when ending a fight.', "Tous les personnages d'une campagne partagent son XP. Seul le MJ l'attribue, ici ou à la fin d'un combat.")}</p>` +
    names
      .map(n => {
        const r = o[n] || { xp: Math.max(150, ...CH.list.filter(c => c.camp === n).map(c => +c.xp || 0)), log: [] };
        return `<div class="campx"><div class="cxh"><b>${esc(n)}</b> <span class="pill">${r.xp} XP · ${L2('level', 'niveau')} ${Math.max(1, Math.floor(r.xp / 100))}</span></div>
  <div class="chips">${DIFF.map(d => `<button type="button" class="chip" data-cxa="${esc(n)}" data-x="${d[1]}" data-l="${d[0]}">${esc(d[2][ti])} +${d[1]}</button>`).join('')}</div>
  <form class="row cxf" data-cxf="${esc(n)}"><input type="number" step="1" placeholder="±XP" aria-label="${L2('XP to add or remove', 'XP à ajouter ou retirer')}"><input placeholder="${L2('Reason (quest, session…)', 'Raison (quête, séance…)')}" maxlength="80"><button type="submit">${L2('Apply', 'Appliquer')}</button></form>
  ${
    r.log.length
      ? `<ul class="cxlog">${r.log
          .slice(0, 5)
          .map(
            e =>
              `<li><span>${new Date(e.d).toLocaleDateString(lang)}</span> ${esc(DIFF.find(d => d[0] === e.l) ? DIFF.find(d => d[0] === e.l)[2][ti] : e.l)} <b>${e.x >= 0 ? '+' : ''}${e.x}</b></li>`,
          )
          .join('')}</ul>`
      : ''
  }</div>`;
      })
      .join('') +
    '</section>'
  );
}
function camps() {
  return [...new Set(CH.list.map(c => c.camp || ''))].filter(Boolean).sort((a, b) => a.localeCompare(b, lang));
}
function renderList() {
  const groups = [...camps(), ''].filter(g => CH.list.some(c => (c.camp || '') === g)),
    nn = $('c_nn') ? $('c_nn').value : '',
    nc = $('c_nc') ? $('c_nc').value : '';
  $('c_listv').innerHTML =
    `<div class="bhead"><h2>${t('sk_chars')}</h2><span class="small">${t('sk_nchars')(CH.list.length)}</span></div>
 <form class="newc" id="c_nf"><label>${t('sk_name')}<input id="c_nn" required></label><label>${t('sk_camp')}<input id="c_nc" list="c_camps"></label><div class="row"><button class="go" type="submit">${t('sk_create')}</button></div></form>` +
    campPanel() +
    groups
      .map(
        g =>
          `<h3 class="camp">${esc(g || t('sk_nocamp'))}</h3><div class="ccards">` +
          CH.list
            .filter(c => (c.camp || '') === g)
            .map(c => {
              const D = derived(c);
              return `<div class="cc"><div class="cn">${esc(c.name || '?')}</div><div class="cs">${esc(c.people || '')}${c.people ? ' · ' : ''}${t('sk_level')} ${D.L} · ${t('sk_eva')} ${D.eva} · ${t('sk_vit')} ${D.hp}</div><button type="button" data-open="${esc(c.id)}">${t('sk_open')}</button></div>`;
            })
            .join('') +
          '</div>',
      )
      .join('') +
    (CH.list.length ? '' : `<p class="small">${t('sk_empty')}</p>`);
  $('c_nn').value = nn;
  $('c_nc').value = nc;
}
function renderSheet() {
  $('c_camps').innerHTML = camps()
    .map(x => opt(x, x))
    .join('');
  if (!CH.active || !C) {
    $('c_sheetv').hidden = true;
    $('c_listv').hidden = false;
    renderList();
    return;
  }
  $('c_sheetv').hidden = false;
  $('c_listv').hidden = true;
  const D = derived(),
    sp = spent(),
    left = (+C.xp || 0) - sp;
  for (const [id, v] of [
    ['c_name', C.name],
    ['c_people', C.people],
    ['c_camp', C.camp || ''],
    ['c_xp', C.xp],
    ['c_notes', C.notes],
  ]) {
    const e = $(id);
    if (document.activeElement !== e) e.value = v;
  }
  $('c_demo').textContent = C.demo ? t('sk_demo') : '';
  {
    const cr = C.camp && campsGet()[C.camp],
      e = $('c_xp');
    e.readOnly = !!cr;
    e.title = cr
      ? L2(
          'Campaign XP, managed by the GM in the character list.',
          'XP de campagne, gérée par le MJ dans la liste des personnages.',
        )
      : '';
  }
  $('c_sum').innerHTML =
    `<span class="pill">${t('sk_level')} <b>${D.L}</b></span><span class="pill">${t('sk_spent')} <b>${sp}</b></span>` +
    (left >= 0
      ? `<span class="pill">${t('sk_left')} <b>${left}</b></span>`
      : `<span class="pill bad">${t('sk_over')} <b>${-left}</b></span>`);
  const hd = lang === 'fr' ? T.fr.dmH : T.en.dm;
  const cap = stCap(),
    S = C.st,
    stB = (k, name) => {
      const v = S[k];
      return `<div class="sth"><b>${esc(name)}</b><div class="stp"><button type="button" data-stat="${k}" data-d="-1" aria-label="${esc(name)} −"${v <= -1 ? ' disabled' : ''}>−</button><span class="sv${v > cap ? ' bad' : ''}">${sgn(v)}</span><button type="button" data-stat="${k}" data-d="1" aria-label="${esc(name)} +"${v >= cap ? ' disabled' : ''}>+</button></div><small>${v < cap ? t('sk_next')(stCost(v + 1) - stCost(v)) : L2('cap', 'plafond')}</small></div>`;
    };
  $('c_mx').innerHTML =
    `<p class="small">${L2(`Each cell = its row + its column. Stats from −1 to ${cap > 50 ? 'no limit' : '+' + cap} at level ${D.L} (cap +3 up to level 5, +5 up to 10, +7 up to 15, none beyond). Each +1 costs double the previous (20, 40, 80…). A stat at −1 gives back 20 XP.`, `Chaque case = sa ligne + sa colonne. Stats de −1 à ${cap > 50 ? 'sans limite' : '+' + cap} au niveau ${D.L} (plafond +3 jusqu'au niveau 5, +5 jusqu'au 10, +7 jusqu'au 15, aucun au-delà). Chaque +1 coûte le double du précédent (20, 40, 80…). Une stat à −1 rend 20 XP.`)}</p><div class="mx"><span></span>${DOM.map((d, di) => stB(d, hd[di])).join('')}` +
    INT.map(
      (i, ii) =>
        stB(i, T[lang].it[ii]) +
        DOM.map(d => {
          const k = i + '_' + d,
            v = C.cells[k];
          return `<div class="cell" title="${esc(cellName(k))}"><div class="v">${sgn(v)}</div><div class="c">${esc(T[lang].hint[k])}</div></div>`;
        }).join(''),
    ).join('') +
    '</div>' +
    (Object.values(S).some(v => v > cap)
      ? `<p class="warn">${L2('A stat is above the cap for this level.', 'Une stat dépasse le plafond de ce niveau.')}</p>`
      : '');
  $('c_dv').innerHTML = [6, 8, 10, 12]
    .map(
      d =>
        `<button type="button" data-dv="${d}" aria-pressed="${C.dv === d}">d${d}<small>${COST.dv[d]} XP</small></button>`,
    )
    .join('');
  const tierRow = (grp, k, name, v) => {
    const lock = GATE.findIndex((l, ti) => ti > 0 && D.L < l);
    const rk = v ? discs().findIndex(d => d[0] === grp && d[1] === k) : -1,
      rm = rk >= 0 ? COST.mult[Math.min(rk, 3)] : 0;
    return `<div class="tr"><div><div class="tn">${esc(name)}${rk >= 0 ? ` <span class="small">(${rk + 1}${lang === 'fr' ? (rk ? 'e' : 're') : ['st', 'nd', 'rd'][rk] || 'th'} ${L2('discipline', 'discipline')}, ×${String(rm).replace('.', lang === 'fr' ? ',' : '.')})</span>` : ''}</div><div class="ti">${v ? t('sk_mb')(mb(v)) + (grp === 'sch' ? ' · ' + esc(t('sk_fx')(v)) + ' · Mana ' + MANA[v] : ` · ${t('sk_st')} ${STAM[v]}`) : '—'}</div></div>
  <div class="pips">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-${grp}="${k}" data-t="${n}" aria-pressed="${n <= v}" aria-label="${esc(name)} Tier ${n}"${D.L < GATE[n] ? ' disabled' : ''}>${n}</button>`).join('')}</div></div>`;
  };
  const nl = GATE.findIndex((l, ti) => ti > 0 && D.L < l),
    ln = nl > 0 ? `<p class="lockn">${esc(t('sk_lock')(nl, GATE[nl]))}</p>` : '';
  $('c_sch').innerHTML =
    ln +
    Object.keys(SCH)
      .map(k => tierRow('sch', k, tr(SCH[k]), C.sch[k]))
      .join('');
  $('c_fam').innerHTML =
    ln +
    Object.keys(FAM)
      .map(k => tierRow('fam', k, tr(FAM[k].n), C.fam[k]))
      .join('');
  $('c_apx').innerHTML = tierRow('apx', 'apex', 'Apex', C.apex || 0);
  $('c_apxn').textContent =
    L2(
      'Abnormal physical power. Each Tier adds Breath like a weapon family and grants natural armor 2 × Tier (keep the better of natural and worn armor).',
      "Puissance physique anormale. Chaque Tier ajoute du Souffle comme une famille d'armes et donne une armure naturelle de 2 × Tier (on garde la meilleure entre armure naturelle et armure portée).",
    ) + (C.apex ? ` ${L2('Natural armor', 'Armure naturelle')} : ${2 * C.apex}.` : '');
  $('c_armor').innerHTML = Object.keys(ARM)
    .map(k => opt(k, `${tr(ARM[k][0])} (${ARM[k][1]})`, k === C.armor))
    .join('');
  $('c_shield').innerHTML = Object.keys(SHD)
    .map(k => opt(k, `${tr(SHD[k][0])}${SHD[k][1] ? ' (+' + SHD[k][1] + ')' : ''}`, k === C.shield))
    .join('');
  const st = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  {
    const pr = C.prof || (C.prof = { arm: 0, shd: 0 }),
      lv = [L2('None', 'Aucun'), L2('Light', 'Légères'), L2('Medium', 'Intermédiaires'), L2('Heavy', 'Lourdes')];
    $('c_prof').innerHTML =
      `<div class="prof"><span class="small">${L2('Armor training', 'Entraînement aux armures')}</span><div class="seg">${lv.map((n, i) => `<button type="button" data-prof="arm" data-v="${i}" aria-pressed="${(pr.arm || 0) === i}">${n}<small>${COST.prof.arm[i]} XP</small></button>`).join('')}</div><label class="ck"><input type="checkbox" data-prof="shd"${pr.shd ? ' checked' : ''}> ${L2('Shield training', 'Entraînement aux boucliers')} (${COST.prof.shd} XP)</label>${D.armOk ? '' : `<p class="warn">${L2('Not trained for this armor: no armor value and −2 Evasion.', "Pas d'entraînement pour cette armure : aucune valeur d'armure et −2 à l'Esquive.")}</p>`}${D.shdOk ? '' : `<p class="warn">${L2('Not trained for shields: no bonus, no Parry.', "Pas d'entraînement aux boucliers : ni bonus ni Parade.")}</p>`}</div>`;
  }
  $('c_def').innerHTML =
    st(t('sk_eva'), D.eva) +
    st(t('sk_armv'), D.av) +
    st(t('sk_minor'), D.minor) +
    st(t('sk_major'), D.major) +
    st(t('sk_severe'), D.severe) +
    st(t('sk_init'), sgn(D.init)) +
    st(L2('Speed', 'Déplacement'), `${D.mv} ${L2('tiles', 'cases')}`);
  {
    const TGL = [0, 1, 5, 11],
      ti = lang === 'fr' ? 1 : 0,
      TT = C.tal || (C.tal = {});
    let h = '';
    for (const g in TALG) {
      h += `<h4 class="tg">${esc(TALG[g][ti])}</h4>`;
      for (const k in TAL) {
        const T = TAL[k];
        if (T.g !== g) continue;
        const v = TT[k] || 0,
          txt = (v ? T.r.slice(0, v) : T.r.slice(0, 1)).map(x => x[ti]).join(' ');
        const rok = talReq(T, C);
        h += `<div class="tr"><div><div class="tn">${esc(T.n[ti])}${T.q ? ` <span class="small${rok ? '' : ' bad'}">(${L2('requires', 'prérequis')} : ${esc(T.q[ti])})</span>` : ''}</div><div class="ti${v ? '' : ' off'}">${esc(txt)}</div>`;
        if (k === 'stance' && v) {
          const kn = C.stances || [];
          h += `<div class="chips">${STANCES.map((st, n) => `<button type="button" class="chip${kn.includes(n) ? ' on' : ''}" data-stc="${n}" title="${esc(st[2 + ti])}" aria-pressed="${kn.includes(n)}"${!kn.includes(n) && kn.length >= v ? ' disabled' : ''}>${esc(st[ti])}</button>`).join('')}</div><div class="ti small">${kn.length}/${v} ${L2('known', 'connues')}${kn.length ? ' · ' + kn.map(n => esc(STANCES[n][ti]) + ' : ' + esc(STANCES[n][2 + ti])).join(' · ') : ''}</div>`;
        }
        h += `</div><div class="pips">${T.c.map((c, n) => `<button type="button" data-tal="${k}" data-t="${n + 1}" aria-pressed="${n < v}" title="${c} XP" aria-label="${esc(T.n[ti])} ${n + 1}"${D.L < TGL[n + 1] || (!rok && n >= v) ? ' disabled' : ''}>${n + 1}</button>`).join('')}</div></div>`;
        if (k === 'pact' && v) {
          const P = PATR[C.patron],
            U = C.used || (C.used = { hp: 0, mana: 0, st: 0 }),
            fm = favMax(C),
            fl = Math.max(0, fm - (U.fav || 0)),
            dm = debtMax(C),
            db = C.debt || 0,
            due = db >= dm;
          h +=
            `<div class="pact"><div class="sfrow"><select data-patr="1" aria-label="${L2('Entity', 'Entité')}"><option value="">${L2('— choose the entity —', "— choisir l'entité —")}</option>${Object.keys(
              PATR,
            )
              .map(p => `<option value="${p}"${p === C.patron ? ' selected' : ''}>${esc(PATR[p].n[ti])}</option>`)
              .join(
                '',
              )}</select><input data-patn="1" value="${esc(C.patronN || '')}" placeholder="${L2('Its name', 'Son nom')}" aria-label="${L2('Its name', 'Son nom')}"></div>` +
            (P
              ? `<p class="small"><i>${esc(P.d[ti])}</i></p><ul class="gifts">${P.g
                  .slice(0, v)
                  .map((g, n) => `<li><b>${L2('Rank', 'Rang')} ${n + 1}</b> · ${esc(g[ti])}</li>`)
                  .join('')}</ul>`
              : '') +
            `<div class="trk"><div><b>${L2('Favors', 'Faveurs')}</b><div class="small">${L2('each one spent: +1 Debt', 'chacune dépensée : +1 Dette')}</div></div><div class="ctl"><button type="button" data-fav="1" aria-label="${L2('Spend a Favor', 'Dépenser une Faveur')}"${!fl || due ? ' disabled' : ''}>−</button><span class="num">${due ? 0 : fl} / ${fm}</span><button type="button" data-fav="-1" aria-label="${L2('Regain a Favor', 'Rendre une Faveur')}">+</button></div></div>` +
            `<div class="trk"><div><b>${L2('Debt', 'Dette')}</b><div class="bar2"><i style="width:${Math.min(100, Math.round((100 * db) / dm))}%;background:#7a2a4a"></i></div></div><div class="ctl"><button type="button" data-debt="-1" aria-label="${L2('Debt', 'Dette')} −">−</button><span class="num">${db} / ${dm}</span><button type="button" data-debt="1" aria-label="${L2('Debt', 'Dette')} +">+</button></div></div>` +
            (due
              ? `<p class="warn">${L2('The entity calls in its due: a service to perform. No Favors until it is done.', "L'entité réclame son dû : un service à rendre. Plus de Faveurs tant qu'il n'est pas rendu.")}</p><button type="button" class="go" data-paid="1">${L2('Service done', 'Service rendu')}</button>`
              : '') +
            `</div>`;
        }
      }
    }
    h +=
      `<h4 class="tg">${L2('Expertise', 'Savoir-faire')}</h4><p class="small">${L2('A precise field (lockpicking, tracking, history…): +2, +4, +6 to its checks, for 20, 40, 80 XP.', 'Un domaine précis (crochetage, pistage, histoire…) : +2, +4, +6 à ses tests, pour 20, 40, 80 XP.')}</p>` +
      (C.sf || [])
        .map(
          (f, i) =>
            `<div class="tr"><div class="sfrow"><input data-sfn="${i}" value="${esc(f.n || '')}" placeholder="${L2('Field', 'Domaine')}" aria-label="${L2('Field', 'Domaine')}"><b>+${2 * (f.r || 0)}</b></div><div class="pips">${[1, 2, 3].map(n => `<button type="button" data-sf="${i}" data-t="${n}" aria-pressed="${n <= (f.r || 0)}" title="${SFC[n - 1]} XP"${D.L < TGL[n] ? ' disabled' : ''}>${n}</button>`).join('')}<button type="button" data-sfdel="${i}" aria-label="${L2('Remove', 'Retirer')}">×</button></div></div>`,
        )
        .join('') +
      `<button type="button" data-sfadd="1">+ ${L2('Add a field', 'Ajouter un domaine')}</button>`;
    $('c_don').innerHTML = h;
  }
  if (!C.used) C.used = { hp: 0, mana: 0, st: 0 };
  const U = C.used,
    cur = {};
  for (const [k, m] of [
    ['hp', D.hp],
    ['mana', D.mana],
    ['st', D.st],
  ]) {
    U[k] = Math.max(0, Math.min(m, +U[k] || 0));
    cur[k] = m - U[k];
  }
  const trk = (k, lab, m, cls) =>
    `<div class="trk"><div><b>${lab}</b><div class="bar2 ${cls}"><i style="width:${m ? Math.round((100 * cur[k]) / m) : 0}%"></i></div></div><div class="ctl"><button type="button" data-trk="${k}" data-d="-1" aria-label="${lab} −">−</button><span class="num">${cur[k]} / ${m}</span><button type="button" data-trk="${k}" data-d="1" aria-label="${lab} +">+</button></div></div>`;
  $('c_trk').innerHTML =
    trk('hp', t('sk_vit'), D.hp, 'hp') + trk('mana', 'Mana', D.mana, 'mn') + trk('st', t('sk_st'), D.st, '');
  $('c_wfam').innerHTML = Object.keys(FAM)
    .map(k => opt(k, tr(FAM[k].n), k === $('c_wfam').value))
    .join('');
  {
    const f = $('c_wfam').value || 'taille',
      ks = szKeys(f),
      cur = ks.includes($('c_wsz').value) ? $('c_wsz').value : ks.includes('poly1') ? 'poly1' : ks[0];
    $('c_wsz').innerHTML = ks.map(k => opt(k, szLabel(f, k) + ` (d${SZ[k]})`, k === cur)).join('');
  }
  const w = C.weapons
    .map((x, i) => {
      const tier = C.fam[x.f] || 0,
        mod = C.cells[FAM[x.f].c],
        ab = mod + mb(tier),
        nd = Math.max(1, tier),
        dd = SZ[x.s];
      return `<div class="atk"><div><div class="an">${esc(x.n)}</div><div class="ad">${esc(tr(FAM[x.f].n))} · ${esc(szLabel(x.f, x.s))} · ${tier ? 'Tier ' + tier : esc(t('sk_unm'))}<br>${t('sk_attack')} ${sgn(ab)} · ${t('sk_damage')} ${nd}d${dd}${mod ? sgn(mod) : ''}</div></div>
  <div class="ab"><button type="button" class="go" data-roll="atk" data-i="${i}">${t('sk_attack')}</button><button type="button" data-roll="dmg" data-i="${i}">${t('sk_damage')}</button><button type="button" data-wdel="${i}" aria-label="${t('sk_remove')} ${esc(x.n)}">×</button></div></div>`;
    })
    .join('');
  const sMod = C.cells.P_men,
    s = Object.keys(SCH)
      .filter(k => C.sch[k] > 0)
      .map(k => {
        const tier = C.sch[k],
          ab = sMod + mb(tier);
        return `<div class="atk"><div><div class="an">${esc(tr(SCH[k]))} — ${t('sk_spell')}</div><div class="ad">Tier ${tier} · ${esc(t('sk_fx')(tier))} · ${t('sk_dc')} ${8 + ab}<br>${t('sk_attack')} ${sgn(ab)} · ${t('sk_damage')} ${tier}d8</div></div>
  <div class="ab"><button type="button" class="go" data-roll="satk" data-k="${k}">${t('sk_attack')}</button><button type="button" data-roll="sdmg" data-k="${k}">${t('sk_damage')}</button></div></div>`;
      })
      .join('');
  $('c_atk').innerHTML = w + (s || `<p class="small">${t('sk_nospell')}</p>`);
  if (typeof renderInv === 'function') renderInv();
}
const LOG = [];
let lastCrit = {};
const dRoll = n => 1 + Math.floor(Math.random() * n);
let RL = [],
  rlOpen = true;
try {
  RL = lsGet('luparis-rolls', null) || [];
  RL = Array.isArray(RL)
    ? RL.slice(0, 40).map(r => ({
        h: safeRoll((r && r.h) || ''),
        s: String((r && r.s) || ''),
        t: +(r && r.t) || Date.now(),
      }))
    : [];
  const o = localStorage.getItem('luparis-rolls-open');
  if (o != null) rlOpen = JSON.parse(o);
} catch (e) {}
function rlRender() {
  const el = document.getElementById('rl_list');
  if (!el) return;
  const P = document.getElementById('rolls');
  P.classList.toggle('min', !rlOpen);
  document.getElementById('rl_tog').setAttribute('aria-expanded', rlOpen);
  document.getElementById('rl_ttl').textContent = L2('Rolls', 'Jets');
  document.getElementById('rl_cnt').textContent = RL.length ? '(' + RL.length + ')' : '';
  document.getElementById('rl_clr').textContent = L2('Clear', 'Effacer');
  document.getElementById('rl_clr').hidden = !RL.length || !rlOpen;
  el.innerHTML = RL.length
    ? RL.map(
        (r, i) =>
          `<li class="${i === 0 ? 'new' : ''}"><span class="rlw">${new Date(r.t).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}${r.s ? ' · ' + esc(r.s) : ''}</span>${r.h}</li>`,
      ).join('')
    : `<li class="small">${t('sk_nolog')}</li>`;
}
// roll lines are HTML; anything that came from another computer keeps only b/i/br and span.cr|ko|small, as text
function safeRoll(h) {
  const t = document.createElement('template');
  t.innerHTML = String(h).slice(0, 2000);
  const out = document.createElement('div');
  (function walk(src, dst) {
    for (const n of src.childNodes) {
      if (n.nodeType === 3) {
        dst.append(n.textContent);
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tg = n.tagName.toLowerCase();
      let e = null;
      if (tg === 'b' || tg === 'i' || tg === 'br') e = document.createElement(tg);
      else if (tg === 'span') {
        e = document.createElement('span');
        const c = (n.getAttribute('class') || '').split(/\s+/).filter(x => x === 'cr' || x === 'ko' || x === 'small');
        if (c.length) e.className = c.join(' ');
      }
      if (e) {
        dst.append(e);
        walk(n, e);
      } else walk(n, dst);
    }
  })(t.content, out);
  return out.innerHTML;
}
function pushRoll(h, src, remote) {
  if (remote) h = safeRoll(h);
  RL.unshift({ h, s: src || '', t: Date.now() });
  if (RL.length > 40) RL.length = 40;
  if (MP.role === 'player' && !remote && typeof mpSend === 'function') mpSend({ type: 'roll', h, s: src || '' });
  if (MP.role !== 'player') lsSet('luparis-rolls', RL);
  if (MP.role === 'host' && typeof mpPush === 'function') mpPush();
  if (!rlOpen) {
    rlOpen = true;
    try {
      localStorage.setItem('luparis-rolls-open', 'true');
    } catch (e) {}
  }
  rlRender();
  const el = document.getElementById('rl_list');
  if (el) el.scrollTop = 0;
}
document.getElementById('rl_tog').addEventListener('click', () => {
  rlOpen = !rlOpen;
  lsSet('luparis-rolls-open', rlOpen);
  rlRender();
});
document.getElementById('rl_clr').addEventListener('click', () => {
  RL = [];
  try {
    localStorage.removeItem('luparis-rolls');
  } catch (e) {}
  rlRender();
});
rlRender();
function logIt(h) {
  pushRoll(h, (C && C.name) || '');
  renderSheet();
}
function rollAtk(name, ab, key) {
  const r = dRoll(20),
    tot = r + ab,
    tg = +$('c_tgt').value,
    crit = r === 20;
  lastCrit[key] = crit;
  const res = crit
    ? `<span class="cr">${t('sk_crit')}</span>`
    : r === 1
      ? `<span class="ko">${t('sk_miss')}</span>`
      : $('c_tgt').value !== ''
        ? tot >= tg
          ? `<span class="ok">${t('sk_hit')}</span>`
          : `<span class="ko">${t('sk_miss')}</span>`
        : '';
  logIt(`${esc(name)} · ${t('sk_attack')}${lang === 'fr' ? ' :' : ':'} d20 (${r}) ${sgn(ab)} = <b>${tot}</b> ${res}`);
}
function rollDmg(name, nd, dd, mod, key) {
  const n = lastCrit[key] ? nd * 2 : nd,
    rs = Array.from({ length: n }, () => dRoll(dd)),
    tot = rs.reduce((a, b) => a + b, 0) + mod;
  lastCrit[key] = false;
  logIt(
    `${esc(name)} · ${t('sk_damage')}${lang === 'fr' ? ' :' : ':'} ${n}d${dd}${mod ? sgn(mod) : ''} [${rs.join(', ')}] = <b>${tot}</b>`,
  );
}
const fiche = $('v-fiche');
fiche.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const ds = b.dataset;
  if (ds.cxa != null) {
    campAward(ds.cxa, +ds.x, ds.l);
    return;
  }
  if (ds.stat) {
    const v = C.st[ds.stat] + +ds.d;
    if (v < -1 || (+ds.d > 0 && v > stCap())) return;
    C.st[ds.stat] = v;
    syncCells(C);
    C.demo = false;
  } else if (ds.tal) {
    const n = +ds.t,
      k = ds.tal,
      TT = C.tal || (C.tal = {}),
      cur = TT[k] || 0;
    TT[k] = cur === n ? n - 1 : n;
    if (!TT[k]) delete TT[k];
    if (k === 'stance') C.stances = (C.stances || []).slice(0, TT.stance || 0);
    C.demo = false;
  } else if (ds.stc != null) {
    const i = +ds.stc,
      a = C.stances || (C.stances = []),
      j = a.indexOf(i);
    if (j >= 0) a.splice(j, 1);
    else if (a.length < ((C.tal || {}).stance || 0)) a.push(i);
    else return;
  } else if (ds.fav) {
    const U = C.used;
    if (+ds.fav > 0) {
      if (debtMax(C) <= (C.debt || 0) || (U.fav || 0) >= favMax(C)) return;
      U.fav = (U.fav || 0) + 1;
      C.debt = (C.debt || 0) + 1;
    } else U.fav = Math.max(0, (U.fav || 0) - 1);
  } else if (ds.debt) {
    C.debt = Math.max(0, (C.debt || 0) + +ds.debt);
  } else if (ds.paid) {
    C.debt = 0;
  } else if (ds.sfadd) {
    (C.sf || (C.sf = [])).push({ n: '', r: 1 });
    C.demo = false;
  } else if (ds.sfdel != null) {
    C.sf.splice(+ds.sfdel, 1);
  } else if (ds.sf != null) {
    const f = C.sf[+ds.sf],
      n = +ds.t;
    if (!f) return;
    f.r = f.r === n ? n - 1 : n;
    C.demo = false;
  } else if (ds.dv) {
    C.dv = +ds.dv;
    C.demo = false;
  } else if (ds.apx) {
    const n = +ds.t;
    C.apex = (C.apex || 0) === n ? n - 1 : n;
    C.demo = false;
  } else if (ds.sch || ds.fam) {
    const g = ds.sch ? 'sch' : 'fam',
      k = ds.sch || ds.fam,
      n = +ds.t;
    C[g][k] = C[g][k] === n ? n - 1 : n;
    C.demo = false;
  } else if (ds.trk) {
    C.used[ds.trk] -= +ds.d;
  } else if (ds.wdel) {
    C.weapons.splice(+ds.wdel, 1);
  } else if (ds.roll) {
    if (ds.roll === 'atk' || ds.roll === 'dmg') {
      const x = C.weapons[+ds.i],
        tier = C.fam[x.f] || 0,
        mod = C.cells[FAM[x.f].c];
      if (ds.roll === 'atk') rollAtk(x.n, mod + mb(tier), 'w' + ds.i);
      else rollDmg(x.n, Math.max(1, tier), SZ[x.s], mod, 'w' + ds.i);
    } else {
      const k = ds.k,
        tier = C.sch[k],
        nm = tr(SCH[k]);
      if (ds.roll === 'satk') rollAtk(nm, C.cells.P_men + mb(tier), 's' + k);
      else rollDmg(nm, tier, SDIE[k] || 8, 0, 's' + k);
    }
    return;
  } else if (b.id === 'c_short') {
    const U = C.used;
    U.hp = Math.floor(U.hp / 2);
    U.mana = Math.ceil(U.mana / 2);
    U.st = 0;
  } else if (b.id === 'c_long') {
    C.used = { hp: 0, mana: 0, st: 0 };
  } else if (b.id === 'c_copy') {
    const txt = JSON.stringify(C);
    navigator.clipboard.writeText(txt).then(
      () => {
        $('c_msg').textContent = t('sk_copied');
      },
      () => {
        $('c_paste').value = txt;
        $('c_paste').select();
      },
    );
    return;
  } else if (b.id === 'c_imp') {
    try {
      const o = JSON.parse($('c_paste').value);
      if (!o || !(o.cells || o.st) || !o.sch || !o.fam) throw 0;
      const c = blankC();
      if (o.st && typeof o.st === 'object')
        for (const k in c.st) c.st[k] = Math.max(-1, Math.min(20, Math.round(+o.st[k] || 0)));
      else c.st = stFromCells(o.cells);
      if (o.tal && typeof o.tal === 'object')
        for (const k in o.tal)
          if (TAL[k]) c.tal[k] = Math.max(0, Math.min(TAL[k].c.length, Math.round(+o.tal[k] || 0)));
      if (o.pas) c.tal.pas = Math.min(2, +o.pas || 0);
      c.sf = (Array.isArray(o.sf) ? o.sf : []).map(f => ({
        n: String((f && f.n) || '').slice(0, 60),
        r: Math.max(0, Math.min(3, Math.round(+(f && f.r) || 0))),
      }));
      c.patron = PATR[o.patron] ? o.patron : '';
      c.patronN = String(o.patronN || '').slice(0, 60);
      c.debt = Math.max(0, Math.round(+o.debt || 0));
      c.corder = Array.isArray(o.corder) ? o.corder.map(String).slice(0, 80) : [];
      c.stances = (Array.isArray(o.stances) ? o.stances : []).filter(n => STANCES[n]).slice(0, c.tal.stance || 0);
      syncCells(c);
      for (const k in c.sch) c.sch[k] = Math.max(0, Math.min(5, +o.sch[k] || 0));
      for (const k in c.fam) c.fam[k] = Math.max(0, Math.min(5, +o.fam[k] || 0));
      c.name = String(o.name || '');
      c.people = String(o.people || '');
      c.xp = Math.max(0, +o.xp || 0);
      c.dv = [6, 8, 10, 12].includes(+o.dv) ? +o.dv : 6;
      c.armor = ARM[o.armor] ? o.armor : 'none';
      c.shield = SHD[o.shield] ? o.shield : 'none';
      c.notes = String(o.notes || '');
      c.used = {
        hp: Math.max(0, +(o.used && o.used.hp) || 0),
        mana: Math.max(0, +(o.used && o.used.mana) || 0),
        st: Math.max(0, +(o.used && o.used.st) || 0),
      };
      c.weapons = (Array.isArray(o.weapons) ? o.weapons : [])
        .filter(w => w && FAM[w.f] && SZ[w.s])
        .map(w => ({ n: String(w.n || '?'), f: w.f, s: w.s }));
      c.camp = String(o.camp || '');
      CH.list.push(c);
      CH.active = c.id;
      C = c;
      $('c_msg').textContent = t('sk_done');
    } catch (err) {
      $('c_msg').textContent = t('sk_bad');
    }
  } else if (b.id === 'c_del') {
    if (!b.dataset.armed) {
      b.dataset.armed = '1';
      b.textContent = t('sk_confirm2');
      setTimeout(() => {
        if (b.isConnected) {
          delete b.dataset.armed;
          b.textContent = t('sk_del');
        }
      }, 3000);
      return;
    }
    delete b.dataset.armed;
    b.textContent = t('sk_del');
    CH.list = CH.list.filter(x => x.id !== C.id);
    tokens = tokens.filter(k => k.cid !== C.id);
    save();
    CH.active = null;
    C = CH.list[0] || null;
  } else if (ds.open) {
    CH.active = ds.open;
    C = CH.list.find(x => x.id === ds.open);
    LOG.length = 0;
    window.scrollTo(0, 0);
  } else if (b.id === 'c_back') {
    CH.active = null;
    window.scrollTo(0, 0);
  } else return;
  saveC();
  renderSheet();
});
for (const [id, key] of [
  ['c_name', 'name'],
  ['c_people', 'people'],
  ['c_camp', 'camp'],
  ['c_notes', 'notes'],
])
  $(id).addEventListener('input', e => {
    if (C) {
      C[key] = e.target.value;
      saveC();
      if (key === 'camp') {
        campSync();
        const r = C.camp && campsGet()[C.camp],
          x = $('c_xp');
        x.readOnly = !!r;
        if (r) {
          x.value = C.xp;
          renderSheet();
        }
      }
    }
  });
$('c_don').addEventListener('change', e => {
  if (e.target.dataset.patr && C) {
    C.patron = e.target.value;
    saveC();
    renderSheet();
  }
});
$('c_don').addEventListener('input', e => {
  if (e.target.dataset.patn && C) {
    C.patronN = e.target.value.slice(0, 60);
    saveC();
    return;
  }
  const i = e.target.dataset.sfn;
  if (i == null || !C || !C.sf[+i]) return;
  C.sf[+i].n = e.target.value.slice(0, 60);
  saveC();
});
const POTS = [
  ['soin', ['Healing potion', 'Potion de soins'], ['+1 Vitality box', '+1 case de Vitalité'], 'hp', 1],
  ['soin2', ['Greater healing potion', 'Potion de soins supérieure'], ['+2 boxes', '+2 cases'], 'hp', 2],
  ['soin3', ['Major healing potion', 'Potion de soins majeure'], ['+3 boxes', '+3 cases'], 'hp', 3],
  ['soin5', ['Supreme healing potion', 'Potion de soins suprême'], ['+5 boxes', '+5 cases'], 'hp', 5],
  ['vig', ['Vigor tonic', 'Tonique de vigueur'], ['+3 Breath', '+3 Souffle'], 'st', 3],
  ['el1', ['Minor Mana elixir', 'Élixir de Mana mineur'], ['+2 Mana', '+2 Mana'], 'mana', 2],
  ['el2', ['Mana elixir', 'Élixir de Mana'], ['+6 Mana', '+6 Mana'], 'mana', 6],
  ['el3', ['Greater Mana elixir', 'Élixir de Mana supérieur'], ['+14 Mana', '+14 Mana'], 'mana', 14],
];
function invOf(c) {
  if (!c.inv) c.inv = {};
  const v = c.inv;
  v.gold = v.gold || { h: 0, b: 0, c: 0 };
  v.pot = v.pot || {};
  v.items = v.items || [];
  return v;
}
function renderInv() {
  const P = $('c_inv');
  if (!P || !C) return;
  const v = invOf(C),
    g = v.gold;
  const gRow = (k, lbl, hint) =>
    `<div class="gold"><span class="gl">${lbl}<span class="small">${hint}</span></span><button type="button" data-gold="${k}" data-d="-1" aria-label="${esc(lbl)} −">−</button><b>${g[k]}</b><button type="button" data-gold="${k}" data-d="1" aria-label="${esc(lbl)} +">+</button></div>`;
  P.innerHTML = `<h3>${L2('Inventory', 'Inventaire')}</h3>
 <h4>${L2('Gold', 'Or')}</h4><div class="golds">${gRow('h', L2('Handfuls', 'Poignées'), '')}${gRow('b', L2('Bags', 'Bourses'), L2(' = 10 handfuls', ' = 10 poignées'))}${gRow('c', L2('Chests', 'Coffres'), L2(' = 10 bags', ' = 10 bourses'))}</div>
 <p class="small">${L2('Ten handfuls fill a bag, ten bags fill a chest: going over converts automatically.', 'Dix poignées remplissent une bourse, dix bourses un coffre : le surplus se convertit tout seul.')}</p>
 <h4>${L2('Potions and consumables', 'Potions et consommables')}</h4><div class="pots">${POTS.map(([k, n, e]) => {
   const q = v.pot[k] || 0;
   return `<div class="pot${q ? '' : ' empty'}"><div><b>${esc(tr(n))}</b><div class="small">${esc(tr(e))}</div></div><div class="pq"><button type="button" data-pot="${k}" data-d="-1" aria-label="${esc(tr(n))} −">−</button><b>${q}</b><button type="button" data-pot="${k}" data-d="1" aria-label="${esc(tr(n))} +">+</button><button type="button" class="go" data-drink="${k}"${q ? '' : ' disabled'}>${L2('Use', 'Boire')}</button></div></div>`;
 }).join('')}</div>
 <h4>${L2('Items found', 'Objets trouvés')}</h4><ul class="items">${v.items.map((x, i) => `<li><input data-it="${i}" data-f="n" value="${esc(x.n)}" aria-label="${L2('Item', 'Objet')}" placeholder="${L2('Item', 'Objet')}"><input data-it="${i}" data-f="q" type="number" min="0" value="${esc(x.q)}" aria-label="${L2('Quantity', 'Quantité')}"><input data-it="${i}" data-f="no" value="${esc(x.no || '')}" placeholder="${L2('Notes (effect, origin, value…)', 'Notes (effet, origine, valeur…)')}" aria-label="Notes"><button type="button" data-itdel="${i}" aria-label="${L2('Remove', 'Retirer')}">×</button></li>`).join('')}</ul>
 <div class="row"><button type="button" data-itadd="1">${L2('Add an item', 'Ajouter un objet')}</button></div>`;
}
function invAct(c, ds) {
  const v = invOf(c),
    g = v.gold;
  if (ds.gold) {
    g[ds.gold] = Math.max(0, g[ds.gold] + +ds.d);
    if (g.h >= 10) {
      g.b += Math.floor(g.h / 10);
      g.h %= 10;
    }
    if (g.b >= 10) {
      g.c += Math.floor(g.b / 10);
      g.b %= 10;
    }
  } else if (ds.pot) {
    v.pot[ds.pot] = Math.max(0, (v.pot[ds.pot] || 0) + +ds.d);
  } else if (ds.drink) {
    const p = POTS.find(x => x[0] === ds.drink);
    if (!p || !(v.pot[p[0]] > 0)) return false;
    v.pot[p[0]]--;
    const u = c.used;
    u[p[3]] = Math.max(0, u[p[3]] - p[4]);
    if (p[3] === 'hp') {
      const D = derived(c);
      for (const k of tokens) if (k.cid === c.id) k.hp = D.hp - u.hp;
      save();
      draw();
    }
    pushRoll(`${esc(tr(p[1]))} : ${esc(tr(p[2]))}`, c.name || '');
  } else if (ds.itq != null) {
    const it = v.items[+ds.itq];
    if (!it) return false;
    it.q = Math.max(0, (+it.q || 0) + +ds.d);
  } else if (ds.itdel != null) {
    v.items.splice(+ds.itdel, 1);
  } else return false;
  saveC();
  if (c === C && CH.active) renderSheet();
  return true;
}
$('c_inv').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || !C) return;
  const v = invOf(C),
    ds = b.dataset,
    g = v.gold;
  if (ds.itadd) {
    v.items.push({ n: '', q: 1, no: '' });
    saveC();
    renderInv();
    const ins = $('c_inv').querySelectorAll('.items input[data-f="n"]');
    if (ins.length) ins[ins.length - 1].focus();
    return;
  }
  invAct(C, ds);
});
$('c_inv').addEventListener('input', e => {
  const t2 = e.target;
  if (t2.dataset.it == null || !C) return;
  const it = invOf(C).items[+t2.dataset.it];
  if (!it) return;
  it[t2.dataset.f] = t2.dataset.f === 'q' ? Math.max(0, +t2.value || 0) : t2.value.slice(0, 200);
  clearTimeout(window._invT);
  window._invT = setTimeout(saveC, 300);
});
function invCards(c) {
  const v = invOf(c),
    g = v.gold,
    ti = lang === 'fr' ? 1 : 0,
    a = ARM[c.armor] || ARM.none,
    sh = SHD[c.shield] || SHD.none,
    D = derived(c),
    pr = c.prof || {},
    lv = [L2('none', 'aucun'), L2('light', 'légères'), L2('medium', 'intermédiaires'), L2('heavy', 'lourdes')];
  const eq = `<div class="hc k-eq"><div class="ht">${L2('Equipment', 'Équipement')}</div><ul class="eql"><li><span>${L2('Armor', 'Armure')}</span> ${esc(tr(a[0]))}${a[1] ? ` <b>${a[1]}</b>` : ''}${D.armOk ? '' : ` <span class="ko">⚠ ${L2('untrained', 'sans entraînement')}</span>`}</li><li><span>${L2('Shield', 'Bouclier')}</span> ${c.shield !== 'none' ? esc(tr(sh[0])) + (sh[1] ? ` <b>+${sh[1]}</b>` : '') + (D.shdOk ? '' : ` <span class="ko">⚠</span>`) : '—'}</li>${(c.weapons || []).map(w => `<li><span>${esc(tr(FAM[w.f] ? FAM[w.f].n : ['', '']))}</span> ${esc(w.n)} <b>d${SZ[w.s] || 6}</b></li>`).join('')}<li><span>${L2('Training', 'Entraînement')}</span> ${L2('armor', 'armures')} ${lv[pr.arm || 0]}${pr.shd ? ' · ' + L2('shields', 'boucliers') : ''}</li></ul></div>`;
  const gr = (k, l) =>
    `<div class="igr"><span>${l}</span><button type="button" data-hinv="1" data-gold="${k}" data-d="1" aria-label="${esc(l)} +">+</button><b>${g[k]}</b><button type="button" data-hinv="1" data-gold="${k}" data-d="-1" aria-label="${esc(l)} −">−</button></div>`;
  const pots = POTS.filter(p => (v.pot[p[0]] || 0) > 0);
  const inv = `<div class="hc k-inv"><div class="ht">${L2('Inventory', 'Inventaire')}</div><div class="igold">${gr('h', L2('Handfuls', 'Poignées'))}${gr('b', L2('Bags', 'Bourses'))}${gr('c', L2('Chests', 'Coffres'))}</div>
  <ul class="ipl">${pots.map(p => `<li title="${esc(tr(p[2]))}"><span>${esc(tr(p[1]))}</span><button type="button" data-hinv="1" data-pot="${p[0]}" data-d="-1" aria-label="−">−</button><b>${v.pot[p[0]]}</b><button type="button" data-hinv="1" data-pot="${p[0]}" data-d="1" aria-label="+">+</button><button type="button" class="go" data-hinv="1" data-drink="${p[0]}">${L2('Use', 'Boire')}</button></li>`).join('')}
  ${v.items.map((x, i) => `<li title="${esc(x.no || '')}"><span>${esc(x.n || '?')}</span><button type="button" data-hinv="1" data-itq="${i}" data-d="-1" aria-label="−">−</button><b>${x.q}</b><button type="button" data-hinv="1" data-itq="${i}" data-d="1" aria-label="+">+</button><button type="button" data-hinv="1" data-itdel="${i}" aria-label="${L2('Remove', 'Retirer')}">×</button></li>`).join('')}</ul>
  <form class="iadd" data-hadd="1"><select aria-label="${L2('Add', 'Ajouter')}"><option value="">${L2('+ potion…', '+ potion…')}</option>${POTS.map(p => `<option value="${p[0]}">${esc(tr(p[1]))}</option>`).join('')}</select><input maxlength="60" placeholder="${L2('New item', 'Nouvel objet')}" aria-label="${L2('New item', 'Nouvel objet')}"><button type="submit">${L2('Add', 'Ajouter')}</button></form></div>`;
  return [eq, inv];
}

$('c_wfam').addEventListener('change', renderSheet);
function layApply() {
  document.querySelectorAll('#c_mods .scolh').forEach(h => {
    h.textContent = lang === 'fr' ? h.dataset.fr : h.dataset.en;
  });
}
layApply();

fiche.addEventListener('submit', e => {
  if (e.target.dataset && e.target.dataset.cxf != null) {
    e.preventDefault();
    const [a, b] = e.target.querySelectorAll('input'),
      x = Math.round(+a.value || 0);
    if (x) campAward(e.target.dataset.cxf, x, b.value.trim() || L2('Manual', 'Manuel'));
    return;
  }
  if (e.target.id !== 'c_nf') return;
  e.preventDefault();
  const n = $('c_nn').value.trim();
  if (!n) return;
  const c = blankC();
  c.name = n;
  c.camp = $('c_nc').value.trim();
  {
    const r = c.camp && campsGet()[c.camp];
    if (r) c.xp = r.xp;
  }
  CH.list.push(c);
  CH.active = c.id;
  C = c;
  saveC();
  renderSheet();
  window.scrollTo(0, 0);
});
$('c_xp').addEventListener('input', e => {
  if (e.target.readOnly) return;
  C.xp = Math.max(0, +e.target.value || 0);
  saveC();
  renderSheet();
});
$('c_prof').addEventListener('click', e => {
  const b = e.target.closest('button[data-prof]');
  if (!b || !C) return;
  C.prof = C.prof || { arm: 0, shd: 0 };
  C.prof.arm = +b.dataset.v;
  C.demo = false;
  saveC();
  renderSheet();
});
$('c_prof').addEventListener('change', e => {
  if (e.target.dataset.prof !== 'shd' || !C) return;
  C.prof = C.prof || { arm: 0, shd: 0 };
  C.prof.shd = e.target.checked ? 1 : 0;
  C.demo = false;
  saveC();
  renderSheet();
});
$('c_armor').addEventListener('change', e => {
  C.armor = e.target.value;
  C.demo = false;
  saveC();
  renderSheet();
});
$('c_shield').addEventListener('change', e => {
  C.shield = e.target.value;
  C.demo = false;
  saveC();
  renderSheet();
});
$('c_wf').addEventListener('submit', e => {
  e.preventDefault();
  const n = $('c_wn').value.trim();
  if (!n) return;
  C.weapons.push({ n, f: $('c_wfam').value, s: $('c_wsz').value });
  $('c_wn').value = '';
  saveC();
  renderSheet();
});
T.en.sk_confirm2 = 'Confirm: erase the sheet?';
T.fr.sk_confirm2 = 'Confirmer : effacer la fiche ?';

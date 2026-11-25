const cv = document.getElementById('cv');
let ctx = cv.getContext('2d');
const stage = document.getElementById('stage'),
  info = document.getElementById('info');
const B = {
  gen: {
    n: ['Generic', 'Générique'],
    g: ['#a9b28f', '#a2ab88'],
    top: ['#b9b4a8', '#9a958a', '#7d786f'],
    side: ['#b9b4a8', '#9a958a', '#7d786f'],
    pit: 'chasm',
    sp: { c: ['#8d9775', '#b7bf9c'], k: 'tuft', d: 0.5 },
    deco: [0, 0, 'rock'],
    bg: ['#f3f4ec', '#d7dccb'],
    L: {
      1: ['Low wall', 'Muret'],
      2: ['Boulder', 'Rocher'],
      3: ['Wall', 'Mur'],
      m1: ['Ditch', 'Fossé'],
      m2: ['Chasm', 'Gouffre'],
    },
    gen: { walls: 1, scatter: 0.02, pits: 1 },
  },
  prairie: {
    n: ['Plains', 'Prairie'],
    g: ['#93c26a', '#8bbb62'],
    top: ['#9a7b4f', '#8a8f86', '#6f9f55'],
    side: ['#7a5f3b', '#7b7f77', '#7a6a4f'],
    pit: 'water',
    sp: { c: ['#f4e36b', '#ffffff', '#e78bb0', '#74a84e'], k: 'flower', d: 0.55 },
    deco: ['hay', 'rock', 'bush'],
    bg: ['#eef8e2', '#c6e3a8'],
    L: {
      1: ['Hay bale', 'Botte de foin'],
      2: ['Boulder', 'Rocher'],
      3: ['Thick hedge', 'Haie épaisse'],
      m1: ['Pond', 'Mare'],
      m2: ['Deep pond', 'Étang profond'],
    },
    gen: { walls: 0.6, scatter: 0.05, pits: 1, water: true },
  },
  foret: {
    n: ['Forest', 'Forêt'],
    g: ['#5f8a4a', '#588343'],
    top: ['#4f7a3c', '#4a6f37', '#3f6531'],
    side: ['#5b4630', '#54412c', '#4c3a27'],
    pit: 'water',
    sp: { c: ['#3f6531', '#7b5a3a', '#a7c36b'], k: 'leaf', d: 0.6 },
    deco: ['bush', 'tree', 'pine'],
    bg: ['#e3eedb', '#9fbd8c'],
    L: {
      1: ['Bushes', 'Buissons'],
      2: ['Thicket', 'Bosquet'],
      3: ['Tall trees', 'Grands arbres'],
      m1: ['Stream', 'Ruisseau'],
      m2: ['Ravine', 'Ravin'],
    },
    gen: { walls: 0.3, scatter: 0.16, pits: 0, river: true },
  },
  montagne: {
    n: ['Mountain', 'Montagne'],
    g: ['#9aa08f', '#939986'],
    top: ['#8c8a84', '#77756f', '#eef1f4'],
    side: ['#7c7a74', '#66645e', '#57554f'],
    pit: 'chasm',
    sp: { c: ['#6f706a', '#b9bbb2', '#7d8a5f'], k: 'pebble', d: 0.6 },
    deco: ['rock', 'rock', 0],
    bg: ['#eef1f3', '#b9c0c6'],
    L: {
      1: ['Scree', 'Éboulis'],
      2: ['Boulder', 'Rocher'],
      3: ['Snowy peak', 'Pic enneigé'],
      m1: ['Crevasse', 'Crevasse'],
      m2: ['Sheer drop', 'Précipice'],
    },
    gen: { walls: 1.6, scatter: 0.05, pits: 1.4, ridge: true },
  },
  volcan: {
    n: ['Volcano', 'Volcan'],
    g: ['#3b3533', '#35302e'],
    top: ['#4a3f3a', '#3a302c', '#2b2321'],
    side: ['#2e2624', '#251e1c', '#1c1615'],
    pit: 'lava',
    sp: { c: ['#ff7a2a', '#5a514c', '#ffb15a'], k: 'ember', d: 0.35 },
    deco: ['rock', 'dead', 'rock'],
    bg: ['#3a2622', '#120c0b'],
    L: {
      1: ['Slag', 'Scories'],
      2: ['Basalt block', 'Bloc de basalte'],
      3: ['Cooled flow', 'Coulée figée'],
      m1: ['Surface lava', 'Lave affleurante'],
      m2: ['Lava lake', 'Lac de lave'],
    },
    gen: { walls: 1, scatter: 0.05, pits: 1.8 },
  },
  desert: {
    n: ['Desert', 'Désert'],
    g: ['#e3c68c', '#dcbf84'],
    top: ['#d8b779', '#c99e62', '#b9824f'],
    side: ['#c9a56a', '#b08453', '#9a6d43'],
    pit: 'sand',
    sp: { c: ['#c9a66b', '#f2dca6', '#b79058'], k: 'ripple', d: 0.5 },
    deco: [0, 'cactus', 'rock'],
    bg: ['#fbf1dc', '#e8cf9c'],
    L: {
      1: ['Dune', 'Dune'],
      2: ['Sandstone rock', 'Rocher de grès'],
      3: ['Cliff', 'Falaise'],
      m1: ['Quicksand', 'Sable mouvant'],
      m2: ['Sand sinkhole', 'Gouffre de sable'],
    },
    gen: { walls: 0.7, scatter: 0.06, pits: 0.8 },
  },
  neige: {
    n: ['Snow', 'Neige'],
    g: ['#eef3f7', '#e7eef3'],
    top: ['#dfe8ee', '#c9d6df', '#f7fafc'],
    side: ['#b7c7d3', '#9fb2c0', '#8aa0b0'],
    pit: 'ice',
    sp: { c: ['#c9d6df', '#ffffff', '#9fb2c0'], k: 'pebble', d: 0.3 },
    deco: ['bush', 'pinesnow', 'rock'],
    bg: ['#f7fafc', '#c9d8e3'],
    L: {
      1: ['Snowdrift', 'Congère'],
      2: ['Fir trees', 'Sapins'],
      3: ['Ice block', 'Bloc de glace'],
      m1: ['Thin ice', 'Glace fine'],
      m2: ['Icy water', 'Eau glacée'],
    },
    gen: { walls: 0.6, scatter: 0.1, pits: 1 },
  },
  marais: {
    n: ['Swamp', 'Marais'],
    g: ['#6f7d4f', '#687648'],
    top: ['#5d6b3f', '#4f5d36', '#465230'],
    side: ['#4a4430', '#3f3a29', '#353123'],
    pit: 'swamp',
    sp: { c: ['#8fa05e', '#4f5d36', '#a7b46d'], k: 'tuft', d: 0.6 },
    deco: ['reed', 'dead', 'tree'],
    bg: ['#e5e8d6', '#9aa37a'],
    L: {
      1: ['Reeds', 'Roseaux'],
      2: ['Stump', 'Souche'],
      3: ['Willow', 'Saule'],
      m1: ['Mud', 'Vase'],
      m2: ['Stagnant water', 'Eau stagnante'],
    },
    gen: { walls: 0.2, scatter: 0.12, pits: 2.4 },
  },
  donjon: {
    n: ['Dungeon', 'Donjon'],
    g: ['#8b8680', '#837e78'],
    top: ['#77726b', '#6a655f', '#5d5953'],
    side: ['#6a655f', '#5b5751', '#4d4944'],
    pit: 'chasm',
    sp: { c: ['#6f6a64', '#9a958e'], k: 'crack', d: 0.35 },
    deco: ['crate', 'pillar', 0],
    bg: ['#3a3633', '#1b1918'],
    brick: true,
    L: {
      1: ['Crates', 'Caisses'],
      2: ['Pillar', 'Pilier'],
      3: ['Stone wall', 'Mur de pierre'],
      m1: ['Pit', 'Fosse'],
      m2: ['Abyss', 'Abîme'],
    },
    gen: { rooms: true, pits: 0.6 },
  },
};
const ORDER = ['gen', 'prairie', 'foret', 'montagne', 'volcan', 'desert', 'neige', 'marais', 'donjon'];
let placing = null,
  meas = null,
  selTok = null;
let lang = 'en',
  unit = 'ft';
try {
  const p = lsGet('luparis-prefs', null);
  if (p) {
    if (p.lang === 'fr') lang = 'fr';
    if (p.unit === 'm') unit = 'm';
  }
} catch (e) {}
const LI = () => (lang === 'fr' ? 1 : 0),
  tr = v => (Array.isArray(v) ? v[LI()] : v);
const T = {
  en: {
    title: 'Luparis',
    sub: 'Prototype: sculpt a battle map in a few clicks.',
    u_ft: 'feet',
    u_m: 'meters',
    tab_map: 'Map',
    tab_best: 'Bestiary',
    tab_rules: 'Rules',
    toc: 'Contents',
    ver: 'Draft v0.7, filled in as we go',
    t_up: 'Raise',
    t_down: 'Dig',
    t_flat: 'Flatten',
    t_pj: 'Ally token',
    t_foe: 'Enemy token',
    t_move: 'Interact',
    t_measure: 'Measure',
    rot: 'Rotate',
    undo: 'Undo',
    gen: 'Generate',
    clear: 'Clear all',
    size: 'Size',
    decor: 'Setting',
    h_click:
      '<b>Left click</b> applies the tool; drag to paint. You can aim at the top or the sides of a tile. <b>Right click and drag</b> moves the view; the mouse wheel zooms. On mobile, pick a tool, then tap.',
    h_keys:
      '<b>Keyboard, row by row</b> (keys follow the physical rows, whatever your layout; each button shows its key): number row <b>1–5</b> the tabs; top row (Q W E R T Y on QWERTY, A Z E R T Y on AZERTY) the tools; middle row the session (search a token, initiative: roll, next, end); bottom row zoom out, zoom in, fit, undo, generate, save the map, in the order of the buttons. Rotate is the second key of the top row. Heights on the hovered tile: <b>Shift + 1 2 3</b> height, <b>Shift + 4</b> ditch, <b>Shift + 5</b> chasm, <b>Shift + 0</b> ground (hold and drag to paint). <b>Esc</b> back to Interact, <b>Ctrl+Z</b> undo.',
    h_meas:
      '<b>Measure:</b> click and drag from one tile to another. D&D rule: every tile counts 5 ft (1.5 m), diagonals included. <b>Monsters:</b> hover a token and press <b>−</b> or <b>+</b> to remove or restore a Vitality box.',
    h_heights:
      '<b>Heights:</b> +1 half cover, +2 cover, +3 wall or impassable obstacle. −1 difficult terrain, −2 impassable. The map is kept in your browser.',
    hover: 'Hover a tile',
    ground: 'Ground',
    tile: 'tile',
    placing: 'Placing',
    stop: 'Esc to stop',
    click_tile: 'Click a tile, Esc to stop.',
    meas_hint: 'Measure: click and drag between two tiles.',
    esq: 'Evasion',
    thr: 'Thresholds',
    box: 'Vitality',
    sq: 'tile',
    sqs: 'tiles',
    height: 'height',
    f_search: 'Search',
    f_search_ph: 'Name, type, note',
    f_type: 'Type',
    f_hab: 'Habitat',
    f_min: 'Minimum CR',
    f_max: 'Maximum CR',
    f_sort: 'Sort by',
    all: 'All',
    s_fp: 'Challenge rating',
    s_n: 'Name',
    s_type: 'Type',
    s_pv: 'Hit points',
    c_name: 'Name',
    c_cr: 'CR',
    c_esq: 'Evasion',
    c_thr: 'Thresholds',
    c_box: 'Vitality',
    c_act: 'Actions',
    hp: 'HP',
    place: 'Place',
    edit: 'Edit',
    del: 'Delete',
    confirm: 'Confirm?',
    none: 'No monster matches these filters.',
    count: (a, b) => `${a} monster${a > 1 ? 's' : ''} of ${b}`,
    b_note:
      'Evasion, thresholds and Vitality boxes are computed automatically from the D&D AC, HP and CR, using the Luparis rules. Includes the creatures of the System Reference Document 5.1 by Wizards of the Coast LLC (CC-BY-4.0 license), converted to Luparis attacks, plus generic NPCs; add your own monsters below. The bestiary is kept in your browser.',
    add: 'Add a monster',
    editing: 'Edit: ',
    m_ac: 'AC (D&D)',
    m_hp: 'HP (D&D)',
    m_habs: 'Habitats',
    m_notes: 'Notes',
    m_notes_ph: 'Abilities, tactics, lore',
    save: 'Save',
    cancel: 'Cancel',
    prev: v =>
      `Luparis: Evasion ${v.esq} · Thresholds ${v.maj}/${v.sev} · ${v.cases} Vitality box${v.cases > 1 ? 'es' : ''}`,
    io_sum: 'Export or import the bestiary',
    io_note: 'Copy the bestiary to back it up or move it to another browser, then paste it here to import it.',
    exp: 'Copy the bestiary',
    impb: 'Import pasted text',
    reset: 'Restore the base bestiary',
    reset_c: 'Confirm: erase your monsters?',
    imp_ph: 'Paste a copied bestiary here',
    copied: 'Bestiary copied.',
    copy_no: 'Copy refused: the text is in the box below, copy it by hand.',
    imported: n => `${n} monsters imported.`,
    bad: 'This text is not a valid bestiary.',
    restored: 'Examples restored.',
  },
  fr: {
    title: 'Luparis',
    sub: 'Prototype : sculpte une battle map en quelques clics.',
    u_ft: 'pieds',
    u_m: 'mètres',
    tab_map: 'Carte',
    tab_best: 'Bestiaire',
    tab_rules: 'Règles',
    toc: 'Sommaire',
    ver: 'Brouillon v0.7, complété au fur et à mesure',
    t_up: 'Monter',
    t_down: 'Creuser',
    t_flat: 'Aplanir',
    t_pj: 'Pion allié',
    t_foe: 'Pion ennemi',
    t_move: 'Interagir',
    t_measure: 'Mesurer',
    rot: 'Pivoter',
    undo: 'Annuler',
    gen: 'Générer',
    clear: 'Tout effacer',
    size: 'Taille',
    decor: 'Décor',
    h_click:
      "<b>Clic gauche</b> applique l'outil, en glissant pour peindre ; on peut viser le sommet ou les flancs d'une case. <b>Clic droit maintenu</b> déplace la vue ; la molette zoome. Sur mobile, choisis l'outil puis touche.",
    h_keys:
      "<b>Clavier, ligne par ligne</b> (les touches suivent les rangées physiques, quel que soit ton clavier ; chaque bouton affiche sa touche) : rangée des chiffres <b>1–5</b> les onglets ; rangée du haut (A Z E R T Y en AZERTY) les outils ; rangée du milieu la séance (rechercher un pion, initiative : lancer, suivant, fin) ; rangée du bas dézoomer, zoomer, ajuster, annuler, générer, enregistrer la carte, dans l'ordre des boutons. Pivoter est la deuxième touche de la rangée du haut. Hauteurs sur la case survolée : <b>Maj + 1 2 3</b> hauteur, <b>Maj + 4</b> fossé, <b>Maj + 5</b> gouffre, <b>Maj + 0</b> sol (garder et glisser pour peindre). <b>Échap</b> revenir à Interagir, <b>Ctrl+Z</b> annuler.",
    h_meas:
      "<b>Mesurer :</b> clique et glisse d'une case à l'autre. Règle D&D : chaque case compte 5 pieds (1,5 m), diagonales comprises. <b>Monstres :</b> survole un pion et appuie sur <b>−</b> ou <b>+</b> pour retirer ou rendre une case de Vitalité.",
    h_heights:
      '<b>Hauteurs :</b> +1 couvert partiel, +2 couvert, +3 mur ou obstacle infranchissable. −1 terrain difficile, −2 infranchissable. La carte est gardée dans ton navigateur.',
    hover: 'Survole une case',
    ground: 'Sol',
    tile: 'case',
    placing: 'Placement',
    stop: 'Échap pour arrêter',
    click_tile: 'Clique sur une case, Échap pour arrêter.',
    meas_hint: 'Mesure : clique et glisse entre deux cases.',
    esq: 'Esquive',
    thr: 'Seuils',
    box: 'Cases',
    sq: 'case',
    sqs: 'cases',
    height: 'hauteur',
    f_search: 'Recherche',
    f_search_ph: 'Nom, type, note',
    f_type: 'Type',
    f_hab: 'Habitat',
    f_min: 'FP minimum',
    f_max: 'FP maximum',
    f_sort: 'Trier par',
    all: 'Tous',
    s_fp: 'Facteur de puissance',
    s_n: 'Nom',
    s_type: 'Type',
    s_pv: 'Points de vie',
    c_name: 'Nom',
    c_cr: 'FP',
    c_esq: 'Esquive',
    c_thr: 'Seuils',
    c_box: 'Cases',
    c_act: 'Actions',
    hp: 'PV',
    place: 'Placer',
    edit: 'Modifier',
    del: 'Supprimer',
    confirm: 'Confirmer ?',
    none: 'Aucun monstre ne correspond à ces filtres.',
    count: (a, b) => `${a} monstre${a > 1 ? 's' : ''} sur ${b}`,
    b_note:
      'Esquive, seuils et cases sont calculés automatiquement depuis la CA, les PV et le FP de D&D, selon les règles de Luparis. Comprend les créatures du System Reference Document 5.1 de Wizards of the Coast LLC (licence CC-BY-4.0), converties en attaques Luparis, et des PNJ génériques ; ajoute tes propres monstres ci-dessous. Le bestiaire est gardé dans ton navigateur.',
    add: 'Ajouter un monstre',
    editing: 'Modifier : ',
    m_ac: 'CA (D&D)',
    m_hp: 'PV (D&D)',
    m_habs: 'Habitats',
    m_notes: 'Notes',
    m_notes_ph: 'Capacités, tactique, lore',
    save: 'Enregistrer',
    cancel: 'Annuler',
    prev: v => `Luparis : Esquive ${v.esq} · Seuils ${v.maj}/${v.sev} · ${v.cases} case${v.cases > 1 ? 's' : ''}`,
    io_sum: 'Exporter ou importer le bestiaire',
    io_note:
      "Copie le bestiaire pour le sauvegarder ou le passer à un autre navigateur, puis colle-le ici pour l'importer.",
    exp: 'Copier le bestiaire',
    impb: 'Importer le texte collé',
    reset: 'Revenir au bestiaire de base',
    reset_c: 'Confirmer : effacer tes monstres ?',
    imp_ph: 'Colle ici un bestiaire copié',
    copied: 'Bestiaire copié.',
    copy_no: 'Copie refusée : le texte est dans la zone ci-dessous, copie-le à la main.',
    imported: n => `${n} monstres importés.`,
    bad: "Ce texte n'est pas un bestiaire valide.",
    restored: 'Exemples restaurés.',
  },
};
const t = k => T[lang][k];
const TY = {
  humanoid: ['Humanoid', 'Humanoïde'],
  undead: ['Undead', 'Mort-vivant'],
  beast: ['Beast', 'Bête'],
  fiend: ['Fiend', 'Fiélon'],
  fey: ['Fey', 'Fée'],
  giant: ['Giant', 'Géant'],
  ooze: ['Ooze', 'Vase'],
  monstrosity: ['Monstrosity', 'Monstruosité'],
  elemental: ['Elemental', 'Élémentaire'],
  celestial: ['Celestial', 'Céleste'],
  plant: ['Plant', 'Plante'],
  dragon: ['Dragon', 'Dragon'],
  construct: ['Construct', 'Créature artificielle'],
  aberration: ['Aberration', 'Aberration'],
};
const tyName = k => (TY[k] ? tr(TY[k]) : k);
const num = v => (lang === 'fr' ? String(v).replace('.', ',') : String(v));
const CAM = { z: 1, px: 0, py: 0 };
let N = 16,
  H = [],
  F = [],
  scene = 'forest_road',
  MARKS = [],
  OBJS = [],
  TPLS = [],
  TPLA = null,
  ENV = {},
  CTX = null,
  CTXN = '',
  selMark = null,
  tokens = [],
  rot = 0,
  tool = 'move',
  hist = [],
  drag = null,
  painting = null,
  hover = null,
  lastPainted = '',
  bio = 'gen',
  t0 = performance.now();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function blank(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}
let INI = { o: [], cur: 0, round: 0 };
function encG(G, neg) {
  return G.map(r => r.map(v => String.fromCharCode(neg ? 99 + v : 48 + v)).join(''));
}
function decG(G, neg) {
  return G.map(r => (typeof r === 'string' ? [...r].map(c => c.charCodeAt(0) - (neg ? 99 : 48)) : r));
}
function towns() {
  if (saveT) saveNow();
  try {
    return lsGet('luparis-towns', null) || {};
  } catch (e) {
    return {};
  }
}
function save() {
  if (MP.role === 'player') {
    if (typeof mpPlayerSave === 'function') mpPlayerSave();
    if (typeof renderIni === 'function') renderIni();
    if (typeof renderMarks === 'function') renderMarks();
    return;
  }
  if (MP.role === 'host' && typeof mpPush === 'function') mpPush();
  if (saveT && saveCtx !== CTX) saveNow();
  clearTimeout(saveT);
  saveT = setTimeout(saveNow, 250);
  saveCtx = CTX;
  saveCtxN = CTXN;
  panelsSoon();
}
let saveT = 0,
  saveCtx = null,
  saveCtxN = '',
  panQ = false;
// writing the whole map to storage is the costly part: done once the gesture settles, and flushed when the page is left
function saveNow() {
  clearTimeout(saveT);
  saveT = 0;
  if (MP.role === 'player') return;
  const st = {
    v: 2,
    N,
    H: encG(H, 1),
    F: encG(F, 0),
    scene,
    tokens,
    rot,
    bio,
    ini: INI,
    marks: MARKS,
    env: ENV,
    objs: OBJS,
    tpls: TPLS,
  };
  try {
    if (saveCtx) {
      const o = towns();
      o[saveCtx] = { ...st, name: saveCtxN };
      localStorage.setItem('luparis-towns', JSON.stringify(o));
    } else localStorage.setItem('luparis-tac', JSON.stringify(st));
    localStorage.setItem('luparis-ctx', JSON.stringify(saveCtx ? { id: saveCtx, n: saveCtxN } : null));
  } catch (e) {}
}
function panelsSoon() {
  if (panQ) return;
  panQ = true;
  requestAnimationFrame(() => {
    panQ = false;
    if (typeof renderIni === 'function') renderIni();
    if (typeof renderMarks === 'function') renderMarks();
  });
}
addEventListener('pagehide', () => {
  if (saveT) saveNow();
  if (saveCT) saveCNow();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (saveT) saveNow();
    if (saveCT) saveCNow();
  }
});
function applyState(d) {
  if (!(d && d.H && d.N)) return false;
  N = d.N;
  H = decG(d.H, 1);
  F = Array.isArray(d.F) && d.F.length === d.N ? decG(d.F, 0) : blank(d.N);
  if (d.scene) scene = d.scene;
  tokens = d.tokens || [];
  rot = d.rot || 0;
  bio = B[d.bio] ? d.bio : 'gen';
  INI = d.ini && Array.isArray(d.ini.o) ? d.ini : { o: [], cur: 0, round: 0 };
  MARKS = Array.isArray(d.marks) ? d.marks : [];
  ENV = d.env && typeof d.env === 'object' ? d.env : {};
  OBJS = Array.isArray(d.objs) ? d.objs.filter(o => o && OBJT[o.k]) : [];
  TPLS = Array.isArray(d.tpls) ? d.tpls : [];
  return true;
}
function load() {
  try {
    const c = lsGet('luparis-ctx', null);
    if (c && c.id) {
      const o = towns()[c.id];
      if (o && applyState(o)) {
        CTX = c.id;
        CTXN = c.n || o.name || '';
        return true;
      }
    }
  } catch (e) {}
  try {
    return applyState(lsGet('luparis-tac', null));
  } catch (e) {}
  return false;
}
function tid() {
  return 't' + Math.random().toString(36).slice(2, 9);
}
function snap() {
  hist.push(JSON.stringify({ H, F, tokens, marks: MARKS, env: ENV, objs: OBJS, tpls: TPLS }));
  if (hist.length > 60) hist.shift();
}
const SIZES = [8, 16, 24, 32, 64, 128];
function sizeIdx(n) {
  let i = SIZES.findIndex(s => s >= n);
  return i < 0 ? SIZES.length - 1 : i;
}
function showSize() {
  document.getElementById('size').value = sizeIdx(N);
  document.getElementById('sv').textContent = N + '×' + N;
}
function resizeTo(n) {
  const nh = blank(n),
    nf = blank(n);
  for (let x = 0; x < Math.min(n, N); x++)
    for (let y = 0; y < Math.min(n, N); y++) {
      nh[x][y] = H[x][y];
      nf[x][y] = F[x][y];
    }
  N = n;
  H = nh;
  F = nf;
  CAM.z = 1;
  CAM.px = 0;
  CAM.py = 0;
  tokens = tokens.filter(k => k.x < n && k.y < n);
  MARKS = MARKS.filter(m => m.x < n && m.y < n);
  OBJS = OBJS.filter(o => o.x < n && o.y < n);
  TPLS = TPLS.filter(o => o.x < n && o.y < n);
  for (const key of Object.keys(ENV)) {
    const [a, b] = key.split(',').map(Number);
    if (a >= n || b >= n) delete ENV[key];
  }
}
if (!load()) {
  H = blank(N);
  F = blank(N);
} else if (!SIZES.includes(N)) resizeTo(SIZES[sizeIdx(N)]);

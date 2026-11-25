// ---- a map from a sentence ("temple en ruines dans la forêt")
// The sentence becomes a recipe (biome, scene, size, buildings, state, objects, hazards). Without an AI key the recipe
// comes from keywords; with a Gemini key (kept in this browser only) the AI writes it. The generators below draw it.
const MG = { last: null };
const MG_SCENES = Object.keys(SCN).filter(k => k !== 'free');
const MG_OBJ = Object.keys(OBJT);
const MG_ENV = Object.keys(ENVT);
const MG_SIZE = { small: 16, medium: 24, large: 32, huge: 64 };
const mgNorm = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
// keywords, French and English; each line: words → what they add to the recipe
const MG_WORDS = [
  [/\b(foret|bois|sylve|forest|woods?)\b/, r => (r.bio = 'foret')],
  [/\b(prairie|plaines?|champs?|campagne|plains?|fields?|meadow)\b/, r => (r.bio = 'prairie')],
  [/\b(montagnes?|mont|falaises?|mountains?|cliffs?)\b/, r => (r.bio = 'montagne')],
  [/\b(volcan|volcanique|lave|volcano|lava)\b/, r => (r.bio = 'volcan')],
  [/\b(desert|dunes?|sables?|desert|sand)\b/, r => (r.bio = 'desert')],
  [/\b(neige|enneigee?s?|neigeu(?:x|se)s?|hiver|toundra|snow|snowy|winter|tundra)\b/, r => (r.bio = 'neige')],
  [/\b(marais|marecages?|tourbiere|swamp|marsh|bog)\b/, r => (r.bio = 'marais')],
  [
    /\b(donjon|souterrains?|cachots?|dungeon|underground)\b/,
    r => ((r.bio = 'donjon'), (r.scene = r.scene || 'dungeon')),
  ],
  [/\b(clairiere|clearing)\b/, r => (r.scene = 'forest_clearing')],
  [/\b(bandits?|brigands?)\b/, r => (r.scene = 'bandit_camp')],
  [/\b(camp|campement|bivouac|encampment)\b/, r => r.add.push('camp')],
  [
    /\b(cryptes?|catacombes?|tombeaux?|mausolees?|ossuaires?|crypt|catacombs?|tomb|mausoleum)\b/,
    r => r.add.push('crypt'),
  ],
  [
    /\b(cercle de pierres?|menhirs?|dolmens?|monolithes?|stone circle|standing stones?)\b/,
    r => r.add.push('stone_circle'),
  ],
  [/\b(salle du trone|trones?|palais|chateau|throne room|throne|palace|castle)\b/, r => r.add.push('throne_room')],
  [/\b(marches?|foire|bazar|market|bazaar|fair)\b/, r => r.add.push('market')],
  [/\b(rivieres?|fleuve|ruisseau|torrent|stream)\b/, r => (r.terrain.water = 'river')],
  [/\b(lacs?|etangs?|lake|pond)\b/, r => (r.terrain.water = 'lake')],
  [/\b(mares|flaques|pools|puddles)\b/, r => (r.terrain.water = 'pools')],
  [/\b(collines?|vallonne|hills?|hilly)\b/, r => (r.terrain.relief = 'hills')],
  [/\b(falaises?|escarpements?|cliffs?)\b/, r => (r.terrain.relief = 'cliffs')],
  [/\b(chemins?|routes?|sentiers?|roads?|paths?|trail)\b/, r => (r.terrain.road = true)],
  [/\b(dense|epaisse|touffue|luxuriante|thick|dense|lush|overgrown)\b/, r => (r.terrain.veg = 0.8)],
  [/\b(clairseme|aride|desole|sparse|barren)\b/, r => (r.terrain.veg = 0.1)],
  [/\b(tentes?|tents?)\b/, r => r.objs.push({ k: 'tent', n: 3 })],
  [/\b(feu de camp|feux de camp|campfires?|bonfire)\b/, r => r.objs.push({ k: 'campfire', n: 1 })],
  [/\b(sarcophages?|cercueils?|sarcophagus|sarcophagi|coffins?)\b/, r => r.objs.push({ k: 'sarco', n: 2 })],
  [/\b(puits|wells?)\b/, r => r.objs.push({ k: 'well', n: 1 })],
  [/\b(charrettes?|chariots?|carts?|wagons?)\b/, r => r.objs.push({ k: 'cart', n: 1 })],
  [/\b(ossements|os|squelettes?|cranes?|bones|skeletons?|skulls?)\b/, r => r.objs.push({ k: 'bones', n: 3 })],
  [/\b(cristaux|cristal|crystals?)\b/, r => r.objs.push({ k: 'crystal', n: 3 })],
  [/\b(cages?)\b/, r => r.objs.push({ k: 'cage', n: 1 })],
  [/\b(rateliers?|armurerie|weapon racks?|armou?ry)\b/, r => r.objs.push({ k: 'rack', n: 2 })],
  [/\b(etals?|stalls?)\b/, r => r.objs.push({ k: 'stall', n: 3 })],
  [/\b(arbres?|trees?)\b/, r => r.objs.push({ k: 'tree', n: 5 })],
  [/\b(portes?|doors?)\b/, r => r.objs.push({ k: 'door', n: 1 })],
  [/\b(carrefour|croisement|crossroads?)\b/, r => (r.scene = 'crossroads')],
  [/\b(fermes?|farm|farmland)\b/, r => (r.scene = 'farmland')],
  [/\b(taverne|auberge|tavern|inn)\b/, r => (r.scene = 'tavern')],
  [/\b(village|hameau|place|square|hamlet)\b/, r => (r.scene = 'village_square')],
  [/\b(port|quais?|docks?|harbou?r)\b/, r => (r.scene = 'docks')],
  [/\b(pont|bridge)\b/, r => (r.scene = 'bridge')],
  [/\b(gue|ford)\b/, r => (r.scene = 'river_ford')],
  [/\b(cimetiere|tombes?|graveyard|cemetery|graves?)\b/, r => (r.scene = 'graveyard')],
  [/\b(grottes?|cavernes?|caves?|cavern)\b/, r => (r.scene = 'cave')],
  [/\b(oasis)\b/, r => ((r.bio = 'desert'), (r.scene = 'oasis'))],
  [/\b(col|passe|pass)\b/, r => (r.scene = 'mtn_pass')],
  [
    /\b(temples?|sanctuaires?|eglises?|cathedrales?|chapelles?|monasteres?|shrines?|church|cathedral|chapel|monastery)\b/,
    r => r.add.push('temple'),
  ],
  [/\b(tour de guet|tours?|watchtower|tower)\b/, r => r.add.push('tower')],
  [/\b(forge|smithy)\b/, r => r.add.push('forge')],
  [/\b(maisons?|houses?|cabanes?|hut)\b/, r => r.add.push('house')],
  [/\b(granges?|barn)\b/, r => r.add.push('barn')],
  [/\b(echoppes?|boutiques?|shop|store)\b/, r => r.add.push('shop')],
  [
    /\b(ruines?|effondres?|ecroules?|detruits?|ruined|ruins?|collapsed|crumbling)\b/,
    r => (r.ruin = Math.max(r.ruin, 0.6)),
  ],
  [
    /\b(abandonnes?|delabres?|anciens?|oublies?|abandoned|old|ancient|forgotten|derelict)\b/,
    r => (r.ruin = Math.max(r.ruin, 0.3)),
  ],
  [/\b(pieges?|traps?|trapped)\b/, r => r.objs.push({ k: 'trap', n: 2 })],
  [/\b(feux?|flammes?|incendies?|brule|fire|flames|burning)\b/, r => r.env.push({ k: 'fire', n: 6 })],
  [/\b(acides?|acid)\b/, r => r.env.push({ k: 'acid', n: 5 })],
  [/\b(poisons?|toxiques?|miasmes?|poison|toxic)\b/, r => r.env.push({ k: 'poison', n: 6 })],
  [/\b(glaces?|gele|frozen|ice)\b/, r => r.env.push({ k: 'ice', n: 6 })],
  [/\b(tenebres|sombres?|obscurs?|nuit|dark|darkness|night)\b/, r => r.env.push({ k: 'dark', n: 10 })],
  [/\b(autels?|altars?)\b/, r => r.objs.push({ k: 'altar', n: 1 })],
  [/\b(statues?)\b/, r => r.objs.push({ k: 'statue', n: 2 })],
  [/\b(braseros?|braziers?)\b/, r => r.objs.push({ k: 'brazier', n: 2 })],
  [/\b(coffres?|tresors?|chests?|treasure)\b/, r => r.objs.push({ k: 'chest', n: 1 })],
  [/\b(tonneaux|barils?|barrels?)\b/, r => r.objs.push({ k: 'barrel', n: 3 })],
  [/\b(caisses?|crates?)\b/, r => r.objs.push({ k: 'crate', n: 3 })],
  [/\b(bibliotheques?|livres|library|books)\b/, r => r.objs.push({ k: 'shelf', n: 3 })],
  [/\b(petite?s?|small|tiny)\b/, r => (r.size = 'small')],
  [/\b(grande?s?|vaste|large|big)\b/, r => (r.size = 'large')],
  [/\b(immense|enorme|gigantesque|huge|vast)\b/, r => (r.size = 'huge')],
];
const MG_NUM = {
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};
function mgParse(text) {
  const s = mgNorm(text),
    r = { bio: null, scene: null, size: null, add: [], ruin: 0, objs: [], env: [], foes: [], marks: [], terrain: {} };
  for (const [re, f] of MG_WORDS) if (re.test(s)) f(r);
  // creatures of the bestiary named in the sentence ("trois gobelins gardent l'autel")
  const numRe = `(\\d+|${Object.keys(MG_NUM).join('|')})`;
  for (const m of MON) {
    for (const nm of [].concat(m.n || [])) {
      const k = mgNorm(nm);
      if (k.length < 4 || r.foes.some(f => f.q === nm)) continue;
      const re = new RegExp(`(?:${numRe}\\s+)?\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`),
        mm = re.exec(s);
      if (mm) {
        r.foes.push({
          q: nm,
          n: Math.min(12, +mm[1] || MG_NUM[mm[1]] || 1),
          near: /autel|altar/.test(s) ? 'altar' : null,
        });
        break;
      }
    }
    if (r.foes.length >= 4) break;
  }
  // "trois statues", "4 braseros": the number in front of an object word
  for (const o of r.objs) {
    const w = {
      altar: 'autels?|altars?',
      statue: 'statues?',
      brazier: 'braseros?|braziers?',
      chest: 'coffres?|chests?',
      barrel: 'tonneaux|barils?|barrels?',
      crate: 'caisses?|crates?',
      trap: 'pieges?|traps?',
      shelf: 'bibliotheques?',
      tent: 'tentes?|tents?',
      sarco: 'sarcophages?|cercueils?',
      cart: 'charrettes?|carts?',
      crystal: 'cristaux|crystals?',
      cage: 'cages?',
      stall: 'etals?|stalls?',
      tree: 'arbres?|trees?',
      door: 'portes?|doors?',
    }[o.k];
    const m = w && new RegExp(`\\b(\\d+|${Object.keys(MG_NUM).join('|')})\\s+(${w})\\b`).exec(s);
    if (m) o.n = Math.min(12, +m[1] || MG_NUM[m[1]] || o.n);
  }
  return mgClean(r);
}
// whatever wrote the recipe (keywords or AI), only known values go through
const MG_NEAR = ['altar', 'entrance', 'center', 'edges', 'inside', 'anywhere'];
function mgClean(r) {
  r = r && typeof r === 'object' ? r : {};
  const n = (v, a, b, d) => (isFinite(+v) ? Math.max(a, Math.min(b, Math.round(+v))) : d),
    near = v => (MG_NEAR.includes(v) ? v : null),
    arr = v => (Array.isArray(v) ? v : []),
    t = r.terrain && typeof r.terrain === 'object' ? r.terrain : {},
    o = {
      bio: B[r.bio] ? r.bio : null,
      scene: MG_SCENES.includes(r.scene) ? r.scene : null,
      size: MG_SIZE[r.size] ? r.size : null,
      add: arr(r.add)
        .map(a => (typeof a === 'string' ? { k: a } : a))
        .filter(a => a && MG_STRUCT.includes(a.k))
        .slice(0, 4)
        .map(a => ({ k: a.k, pos: MG_POS.includes(a.pos) ? a.pos : null })),
      ruin: isFinite(+r.ruin) ? Math.max(0, Math.min(1, +r.ruin)) : 0,
      objs: arr(r.objs)
        .filter(x => x && MG_OBJ.includes(x.k))
        .slice(0, 12)
        .map(x => ({ k: x.k, n: n(x.n, 1, 16, 1), near: near(x.near) })),
      env: arr(r.env)
        .filter(x => x && MG_ENV.includes(x.k))
        .slice(0, 5)
        .map(x => ({ k: x.k, n: n(x.n, 1, 40, 5), near: near(x.near) })),
      foes: arr(r.foes)
        .filter(x => x && typeof x.q === 'string' && x.q.trim())
        .slice(0, 6)
        .map(x => ({ q: x.q.slice(0, 60), n: n(x.n, 1, 12, 1), near: near(x.near) })),
      marks: arr(r.marks)
        .filter(x => x && typeof x.l === 'string' && x.l.trim())
        .slice(0, 6)
        .map(x => ({ l: x.l.slice(0, 40), near: near(x.near) })),
      terrain: {
        water: ['none', 'river', 'lake', 'pools'].includes(t.water) ? t.water : null,
        relief: ['flat', 'hills', 'cliffs'].includes(t.relief) ? t.relief : null,
        veg: isFinite(+t.veg) && t.veg !== null && t.veg !== '' ? Math.max(0, Math.min(1, +t.veg)) : null,
        road: !!t.road,
      },
      title: String(r.title || '').slice(0, 60),
    };
  const seen = new Set();
  o.add = o.add.filter(a => !seen.has(a.k) && seen.add(a.k));
  if (o.terrain.veg === null) delete o.terrain.veg;
  if (!o.bio && o.scene && SCN[o.scene].bio) o.bio = typeof SCN[o.scene].bio === 'function' ? null : SCN[o.scene].bio;
  return o;
}
const MG_PLN = {
  temple: ['temple', 'temple'],
  crypt: ['crypt', 'crypte'],
  camp: ['camp', 'camp'],
  stone_circle: ['stone circle', 'cercle de pierres'],
  throne_room: ['throne room', 'salle du trône'],
  market: ['market', 'marché'],
};
function mgSummary(r) {
  const P = [];
  if (r.bio) P.push(tr(B[r.bio].n));
  if (r.scene) P.push(t('scn')[r.scene] || r.scene);
  for (const a of r.add) P.push(tr(MG_PLN[a.k] || PREF[a.k]));
  if (r.ruin >= 0.5) P.push(L2('in ruins', 'en ruines'));
  else if (r.ruin > 0) P.push(L2('abandoned', 'abandonné'));
  const T = r.terrain || {};
  if (T.water && T.water !== 'none')
    P.push({ river: L2('river', 'rivière'), lake: L2('lake', 'lac'), pools: L2('pools', 'mares') }[T.water]);
  if (T.relief)
    P.push({ flat: L2('flat', 'plat'), hills: L2('hills', 'collines'), cliffs: L2('cliffs', 'falaises') }[T.relief]);
  if (T.road) P.push(L2('road', 'chemin'));
  for (const x of r.objs) P.push(`${x.n} × ${tr(OBJT[x.k].n).toLowerCase()}`);
  for (const x of r.env) P.push(tr(ENVT[x.k].n).toLowerCase());
  for (const f of r.foes) P.push(`${f.n} × ${f.q}`);
  for (const m of r.marks) P.push('« ' + m.l + ' »');
  if (r.size)
    P.push(
      {
        small: L2('small', 'petite'),
        medium: L2('medium', 'moyenne'),
        large: L2('large', 'grande'),
        huge: L2('huge', 'immense'),
      }[r.size],
    );
  return P.join(' · ');
}
// free ground cells (inside a rectangle if given), shuffled
function mgFree(rect) {
  const c = [];
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++) {
      if (rect && (x <= rect[0] || y <= rect[1] || x >= rect[2] || y >= rect[3])) continue;
      if (H[x][y] === 0 && F[x][y] !== 4 && objAt(x, y) < 0) c.push({ x, y });
    }
  for (let i = c.length - 1; i > 0; i--) {
    const j = R(i + 1);
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}
// ---- places: each one fits in a rectangle and tells where its notable spots are
const MG_POS = ['center', 'north', 'south', 'east', 'west', 'northwest', 'northeast', 'southwest', 'southeast'];
// where a place of w×h tiles goes: near the asked position, away from the other places and out of the water
function mgRect(pos, w, h) {
  w = Math.max(3, Math.min(N - 2, w));
  h = Math.max(3, Math.min(N - 2, h));
  const fx = { west: 0.12, northwest: 0.12, southwest: 0.12, east: 0.88, northeast: 0.88, southeast: 0.88 }[pos] ?? 0.5,
    fy = { north: 0.12, northwest: 0.12, northeast: 0.12, south: 0.88, southwest: 0.88, southeast: 0.88 }[pos] ?? 0.5,
    bx = Math.max(1, Math.min(N - w - 1, Math.round(fx * N - w / 2))),
    by = Math.max(1, Math.min(N - h - 1, Math.round(fy * N - h / 2))),
    taken = MG.taken || [];
  let best = null,
    bp = 1e12;
  const span = Math.max(2, Math.round(N / 3));
  for (let dx = -span; dx <= span; dx++)
    for (let dy = -span; dy <= span; dy++) {
      const x0 = bx + dx,
        y0 = by + dy;
      if (x0 < 1 || y0 < 1 || x0 + w > N - 1 || y0 + h > N - 1) continue;
      let p = Math.hypot(dx, dy) * 2;
      for (const [a0, b0, a1, b1] of taken) {
        const ox = Math.min(x0 + w - 1, a1 + 1) - Math.max(x0, a0 - 1) + 1,
          oy = Math.min(y0 + h - 1, b1 + 1) - Math.max(y0, b0 - 1) + 1;
        if (ox > 0 && oy > 0) p += 1000 * ox * oy;
      }
      if (p >= bp) continue;
      for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) if (H[x][y] < 0) p += 6;
      if (p < bp) ((bp = p), (best = [x0, y0]));
    }
  const [x0, y0] = best || [bx, by],
    R0 = [x0, y0, x0 + w - 1, y0 + h - 1];
  taken.push(R0);
  MG.taken = taken;
  return R0;
}
const mgPut = (x, y, k, r = 0, o = false) => {
  if (ok(x, y) && objAt(x, y) < 0 && H[x][y] >= 0) OBJS.push({ x, y, k, o, r });
};
// clear a rectangle (and a ring around it) so a building can stand there
function mgClear([x0, y0, x1, y1], floor) {
  OBJS = OBJS.filter(o => o.x < x0 - 1 || o.x > x1 + 1 || o.y < y0 - 1 || o.y > y1 + 1);
  for (let x = x0 - 1; x <= x1 + 1; x++)
    for (let y = y0 - 1; y <= y1 + 1; y++) {
      if (!ok(x, y)) continue;
      delete ENV[x + ',' + y];
      H[x][y] = 0;
      if (floor != null && x >= x0 && x <= x1 && y >= y0 && y <= y1) F[x][y] = floor;
    }
}
// walls on the edge of a rectangle, with a doorway (door object in the gap) on one side
function mgWalls([x0, y0, x1, y1], side = 'south', door = true) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      if (x === x0 || y === y0 || x === x1 || y === y1) {
        H[x][y] = 3;
        F[x][y] = 4;
      }
  const mx = (x0 + x1) >> 1,
    my = (y0 + y1) >> 1,
    d = { south: [mx, y1], north: [mx, y0], east: [x1, my], west: [x0, my] }[side];
  H[d[0]][d[1]] = 0;
  F[d[0]][d[1]] = 2;
  if (door) mgPut(d[0], d[1], 'door', side === 'east' || side === 'west' ? 1 : 0);
  return { x: d[0], y: d[1] };
}
const MG_PLACES = {
  temple(pos) {
    const w = Math.max(7, Math.min(N - 4, Math.round(MG.span * 0.45))) | 1,
      h = Math.max(9, Math.min(N - 3, Math.round(w * 1.4))),
      R0 = mgRect(pos, w, h),
      [x0, y0, x1, y1] = R0,
      mid = (x0 + x1) >> 1;
    mgClear(R0, 2);
    const ent = mgWalls(R0, 'south');
    for (let x = x0 + 1; x < x1; x++) for (let y = y0 + 1; y <= y0 + 3; y++) H[x][y] = 1;
    mgPut(mid, y0 + 1, 'altar', 2);
    mgPut(mid - 2, y0 + 1, 'statue', 2);
    mgPut(mid + 2, y0 + 1, 'statue', 2);
    mgPut(x0 + 1, y0 + 1, 'brazier');
    mgPut(x1 - 1, y0 + 1, 'brazier');
    for (let y = y0 + 5; y < y1 - 1; y += 3)
      for (const x of [x0 + 2, x1 - 2]) {
        H[x][y] = 3;
        F[x][y] = 4;
      }
    for (let y = y0 + 6; y < y1 - 2; y += 2)
      for (let x = x0 + 3; x <= x1 - 3; x++) if (Math.abs(x - mid) > 1) mgPut(x, y, 'bench', 0);
    return { rect: R0, spots: { altar: { x: mid, y: y0 + 2 }, entrance: ent, center: { x: mid, y: (y0 + y1) >> 1 } } };
  },
  crypt(pos) {
    const w = Math.max(9, Math.min(N - 4, Math.round(MG.span * 0.5))) | 1,
      h = Math.max(9, Math.min(N - 4, Math.round(MG.span * 0.5))),
      R0 = mgRect(pos, w, h),
      [x0, y0, x1, y1] = R0,
      mid = (x0 + x1) >> 1;
    mgClear(R0, 7);
    const ent = mgWalls(R0, 'south');
    // a central aisle, burial rows on both sides, pillars between them
    for (let y = y0 + 3; y < y1 - 1; y += 3) {
      mgPut(x0 + 2, y, 'sarco', 0, RNG() < 0.25);
      mgPut(x1 - 2, y, 'sarco', 0, RNG() < 0.25);
      if (x1 - x0 >= 10)
        for (const x of [x0 + 4, x1 - 4]) {
          H[x][y] = 3;
          F[x][y] = 4;
        }
      if (RNG() < 0.5) mgPut(mid + (RNG() < 0.5 ? -1 : 1), y + 1, 'bones', R(4));
    }
    mgPut(mid, y0 + 1, 'sarco', 0);
    mgPut(mid - 1, y0 + 1, 'brazier');
    mgPut(mid + 1, y0 + 1, 'brazier');
    return { rect: R0, spots: { altar: { x: mid, y: y0 + 2 }, entrance: ent, center: { x: mid, y: (y0 + y1) >> 1 } } };
  },
  camp(pos) {
    const r = Math.max(4, Math.min(Math.round(MG.span * 0.3), 10)),
      R0 = mgRect(pos, 2 * r + 1, 2 * r + 1),
      cx = (R0[0] + R0[2]) >> 1,
      cy = (R0[1] + R0[3]) >> 1;
    mgClear(R0, 11);
    // palisade ring with a gate to the south
    for (let a = 0; a < 360; a += 3) {
      const x = Math.round(cx + Math.cos((a * Math.PI) / 180) * r),
        y = Math.round(cy + Math.sin((a * Math.PI) / 180) * r);
      if (ok(x, y) && !(y > cy && Math.abs(x - cx) <= 1)) {
        H[x][y] = 2;
        F[x][y] = 4;
      }
    }
    mgPut(cx, cy, 'campfire');
    const n = Math.max(3, Math.min(8, r));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3,
        x = Math.round(cx + Math.cos(a) * (r - 2.2)),
        y = Math.round(cy + Math.sin(a) * (r - 2.2));
      mgPut(x, y, 'tent', Math.abs(Math.cos(a)) > 0.7 ? 1 : 0);
    }
    mgPut(cx + 2, cy - 1, 'rack', 0);
    mgPut(cx - 2, cy + 1, 'crate');
    mgPut(cx - 2, cy + 2, 'barrel');
    mgPut(cx + 1, cy + 2, 'cart', 1);
    return { rect: R0, spots: { altar: { x: cx, y: cy }, entrance: { x: cx, y: cy + r }, center: { x: cx, y: cy } } };
  },
  stone_circle(pos) {
    const r = Math.max(3, Math.min(Math.round(MG.span * 0.22), 7)),
      R0 = mgRect(pos, 2 * r + 1, 2 * r + 1),
      cx = (R0[0] + R0[2]) >> 1,
      cy = (R0[1] + R0[3]) >> 1;
    mgClear(R0, 6);
    const n = Math.max(6, r * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2,
        x = Math.round(cx + Math.cos(a) * r),
        y = Math.round(cy + Math.sin(a) * r);
      if (ok(x, y)) {
        H[x][y] = i % 3 === 2 ? 2 : 3;
        F[x][y] = 7;
      }
    }
    mgPut(cx, cy, 'altar', R(4));
    return {
      rect: R0,
      spots: { altar: { x: cx, y: cy }, entrance: { x: cx, y: cy + r + 1 }, center: { x: cx, y: cy } },
    };
  },
  throne_room(pos) {
    const w = Math.max(9, Math.min(N - 4, Math.round(MG.span * 0.5))) | 1,
      h = Math.max(11, Math.min(N - 3, Math.round(w * 1.3))),
      R0 = mgRect(pos, w, h),
      [x0, y0, x1, y1] = R0,
      mid = (x0 + x1) >> 1;
    mgClear(R0, 3);
    const ent = mgWalls(R0, 'south');
    for (let x = x0 + 1; x < x1; x++) for (let y = y0 + 1; y <= y0 + 2; y++) H[x][y] = 1;
    mgPut(mid, y0 + 1, 'throne', 2);
    mgPut(mid - 2, y0 + 1, 'brazier');
    mgPut(mid + 2, y0 + 1, 'brazier');
    for (let y = y0 + 4; y < y1 - 1; y += 3)
      for (const x of [x0 + 2, x1 - 2]) {
        H[x][y] = 3;
        F[x][y] = 4;
        mgPut(x + (x < mid ? 1 : -1), y + 1, 'statue', 2);
      }
    for (let y = y0 + 3; y < y1; y++) F[mid][y] = 2;
    return { rect: R0, spots: { altar: { x: mid, y: y0 + 3 }, entrance: ent, center: { x: mid, y: (y0 + y1) >> 1 } } };
  },
  market(pos) {
    const w = Math.max(9, Math.min(N - 2, Math.round(MG.span * 0.6))),
      R0 = mgRect(pos, w, w),
      [x0, y0, x1, y1] = R0,
      cx = (x0 + x1) >> 1,
      cy = (y0 + y1) >> 1;
    mgClear(R0, 2);
    mgPut(cx, cy, 'well');
    for (let y = y0 + 1; y < y1; y += 3)
      for (let x = x0 + 1; x < x1; x += 3) {
        if (Math.abs(x - cx) < 2 && Math.abs(y - cy) < 2) continue;
        if (RNG() < 0.55) {
          mgPut(x, y, 'stall', R(2));
          if (RNG() < 0.6) mgPut(x + 1, y, RNG() < 0.5 ? 'crate' : 'barrel');
        }
      }
    return { rect: R0, spots: { altar: { x: cx, y: cy }, entrance: { x: cx, y: y1 }, center: { x: cx, y: cy } } };
  },
};
const MG_STRUCT = [...Object.keys(MG_PLACES), ...Object.keys(PREF)];
// ---- terrain: water, relief, vegetation, road (laid before the buildings)
function mgTerrain(t) {
  if (!t) return;
  if (t.relief === 'flat')
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (H[x][y] > 0 && F[x][y] !== 4) H[x][y] = 0;
  if (t.relief === 'hills' || t.relief === 'cliffs') {
    const n = Math.max(2, Math.round(N / 8));
    for (let i = 0; i < n; i++) {
      const cx = R(N),
        cy = R(N),
        rad = 2 + R(Math.max(2, N / 6));
      for (let x = cx - rad; x <= cx + rad; x++)
        for (let y = cy - rad; y <= cy + rad; y++) {
          if (!ok(x, y) || H[x][y] < 0) continue;
          const d = Math.hypot(x - cx, y - cy) / rad;
          if (d > 1) continue;
          const v = t.relief === 'cliffs' ? (d < 0.75 ? 3 : 2) : d < 0.4 ? 2 : 1;
          H[x][y] = Math.max(H[x][y], v);
        }
    }
  }
  if (typeof t.veg === 'number') {
    const p = Math.max(0, Math.min(1, t.veg));
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++) {
        if (H[x][y] !== 0) continue;
        if (RNG() < p * 0.12) mgPut(x, y, 'tree');
        else if (RNG() < p * 0.4 && !F[x][y]) F[x][y] = 6;
      }
  }
  if (t.water === 'river') {
    let y = Math.round(N * (0.25 + RNG() * 0.5));
    const wd = N >= 32 ? 3 : 2;
    for (let x = 0; x < N; x++) {
      for (let k = 0; k < wd; k++) if (ok(x, y + k)) H[x][y + k] = k === 0 || k === wd - 1 ? -1 : -2;
      if (RNG() < 0.3) y = Math.max(1, Math.min(N - wd - 1, y + (RNG() < 0.5 ? -1 : 1)));
    }
  } else if (t.water === 'lake' || t.water === 'pools') {
    const n = t.water === 'lake' ? 1 : 2 + R(3);
    for (let i = 0; i < n; i++) {
      const cx = 2 + R(N - 4),
        cy = 2 + R(N - 4),
        rx = t.water === 'lake' ? Math.max(3, N / 6) : 1.5,
        ry = rx * (0.6 + RNG() * 0.6);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
          if (d <= 1) H[x][y] = d < 0.45 ? -2 : -1;
        }
    }
  }
  if (t.road && t.road !== 'carve') {
    const vert = RNG() < 0.5,
      w = N >= 32 ? 2 : 1;
    let c = Math.round(N * (0.3 + RNG() * 0.4));
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < w; k++) {
        const x = vert ? c + k : i,
          y = vert ? i : c + k;
        if (!ok(x, y)) continue;
        if (H[x][y] < 0) {
          H[x][y] = 0;
          F[x][y] = 3; // a ford of planks over the water
        } else {
          H[x][y] = 0;
          F[x][y] = 1;
        }
        const oi = objAt(x, y);
        if (oi >= 0) OBJS.splice(oi, 1);
      }
      if (RNG() < 0.2) c = Math.max(1, Math.min(N - w - 1, c + (RNG() < 0.5 ? -1 : 1)));
    }
  }
}
// the cheapest way from a cell to the edge of the map: around buildings, over low ground, through water if needed
function mgPath(sx, sy, avoid) {
  const INF = 1e9,
    d = new Float64Array(N * N).fill(INF),
    prev = new Int32Array(N * N).fill(-1),
    cost = (x, y) => {
      if (avoid.some(([a0, b0, a1, b1]) => x >= a0 && x <= a1 && y >= b0 && y <= b1)) return INF;
      const h = H[x][y];
      return h >= 2 ? 6 : h === 1 ? 2 : h === -1 ? 4 : h <= -2 ? 8 : 1;
    },
    Q = [[0, sx * N + sy]];
  d[sx * N + sy] = 0;
  while (Q.length) {
    let bi = 0;
    for (let i = 1; i < Q.length; i++) if (Q[i][0] < Q[bi][0]) bi = i;
    const [dc, id] = Q.splice(bi, 1)[0];
    if (dc > d[id]) continue;
    const x = (id / N) | 0,
      y = id % N;
    if (x === 0 || y === 0 || x === N - 1 || y === N - 1) {
      const out = [];
      for (let k = id; k >= 0; k = prev[k]) out.push([(k / N) | 0, k % N]);
      return out;
    }
    for (const [ax, ay] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + ax,
        ny = y + ay;
      if (!ok(nx, ny)) continue;
      const c = cost(nx, ny);
      if (c >= INF) continue;
      const nd = dc + c,
        ni = nx * N + ny;
      if (nd < d[ni]) {
        d[ni] = nd;
        prev[ni] = id;
        Q.push([nd, ni]);
      }
    }
  }
  return [];
}
// every place can be reached from the edge of the map; with a road, the way is paved and bridged
function mgAccess(places, road) {
  const rects = places.map(p => p.rect);
  for (const p of places) {
    const e = p.spots && p.spots.entrance;
    if (!e) continue;
    const [x0, y0, x1, y1] = p.rect,
      sx = e.x <= x0 ? e.x - 1 : e.x >= x1 ? e.x + 1 : e.x,
      sy = e.y >= y1 ? e.y + 1 : e.y <= y0 ? e.y - 1 : e.y;
    if (!ok(sx, sy)) continue;
    const path = [[sx, sy], ...mgPath(sx, sy, rects)];
    for (const [x, y] of path) {
      if (H[x][y] < 0) {
        if (!road) continue;
        H[x][y] = 0;
        F[x][y] = 3;
      } else {
        if (H[x][y] > 0) H[x][y] = 0;
        if (road) F[x][y] = 1;
      }
      const oi = objAt(x, y);
      if (oi >= 0 && OBJS[oi].k !== 'door') OBJS.splice(oi, 1);
      delete ENV[x + ',' + y];
    }
  }
}
// ruins: broken walls, rubble, weeds; furniture partly gone
function mgRuin(p) {
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++) {
      if (F[x][y] === 4 && H[x][y] >= 2 && RNG() < p * 0.55) {
        H[x][y] = RNG() < 0.5 ? 1 : 0;
        F[x][y] = 13;
      } else if (H[x][y] === 0 && RNG() < p * 0.06 && objAt(x, y) < 0) {
        H[x][y] = 1;
        F[x][y] = 13;
      } else if (H[x][y] >= 0 && (F[x][y] === 2 || F[x][y] === 3) && RNG() < p * 0.35) F[x][y] = RNG() < 0.6 ? 6 : 11;
    }
  OBJS = OBJS.filter(
    o => !(['bench', 'chair', 'table', 'shelf', 'bed', 'counter', 'stall'].includes(o.k) && RNG() < p * 0.6),
  );
  for (const o of OBJS) if (['door', 'sarco', 'chest'].includes(o.k) && RNG() < p) o.o = true;
}
// a door only stands in a doorway: wall on both sides along one axis, open on the other
const mgWall = (x, y) => ok(x, y) && H[x][y] >= 2;
function mgDoorway(x, y) {
  if (!ok(x, y) || H[x][y] !== 0) return -1;
  const free = (a, b) => ok(a, b) && H[a][b] <= 1;
  if (mgWall(x - 1, y) && mgWall(x + 1, y) && free(x, y - 1) && free(x, y + 1)) return 0;
  if (mgWall(x, y - 1) && mgWall(x, y + 1) && free(x - 1, y) && free(x + 1, y)) return 1;
  return -1;
}
function mgFixDoors() {
  OBJS = OBJS.filter(o => o.k !== 'door' || mgDoorway(o.x, o.y) >= 0);
  for (const o of OBJS.filter(o => o.k === 'door')) {
    const ax = mgDoorway(o.x, o.y);
    for (const s of [-1, 1]) {
      const x = ax === 1 ? o.x + s : o.x,
        y = ax === 1 ? o.y : o.y + s;
      if (!ok(x, y)) continue;
      if (H[x][y] === 1) H[x][y] = 0;
      const oi = objAt(x, y);
      if (oi >= 0) OBJS.splice(oi, 1);
    }
  }
}
// doors asked for in the description: open a doorway in an existing wall (never a door alone in the open)
function mgAddDoors(n) {
  const c = [];
  for (let x = 1; x < N - 1; x++)
    for (let y = 1; y < N - 1; y++) {
      if (H[x][y] < 2 || F[x][y] !== 4 || objAt(x, y) >= 0) continue;
      const hor =
          mgWall(x - 1, y) && mgWall(x + 1, y) && ok(x, y - 1) && H[x][y - 1] <= 1 && ok(x, y + 1) && H[x][y + 1] <= 1,
        ver =
          mgWall(x, y - 1) && mgWall(x, y + 1) && ok(x - 1, y) && H[x - 1][y] <= 1 && ok(x + 1, y) && H[x + 1][y] <= 1;
      if (hor || ver) c.push({ x, y });
    }
  for (let i = 0; i < n && c.length; i++) {
    const p = c.splice(R(c.length), 1)[0];
    H[p.x][p.y] = 0;
    F[p.x][p.y] = 2;
    mgPut(p.x, p.y, 'door', mgDoorway(p.x, p.y) === 1 ? 1 : 0);
  }
}
// free cells sorted by distance to a spot ("near the altar", "at the entrance", "on the edges"…)
function mgNear(near, ctxs) {
  const main = ctxs[0],
    sp = main && main.spots,
    c = mgFree(null);
  let ref = null;
  if (near === 'inside' && main) {
    const [x0, y0, x1, y1] = main.rect;
    return c.filter(p => p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1);
  }
  if (near === 'edges')
    return c.sort(
      (a, b) => Math.min(a.x, a.y, N - 1 - a.x, N - 1 - a.y) - Math.min(b.x, b.y, N - 1 - b.x, N - 1 - b.y),
    );
  if (near === 'anywhere' || !near) return c;
  if (near === 'center') ref = (sp && sp.center) || { x: N >> 1, y: N >> 1 };
  else if (sp && sp[near]) ref = sp[near];
  if (!ref) return c;
  return c.sort((a, b) => Math.hypot(a.x - ref.x, a.y - ref.y) - Math.hypot(b.x - ref.x, b.y - ref.y));
}
// creatures from the bestiary, by name (French or English, approximate)
function mgMonster(q) {
  const s = mgNorm(q).replace(/s\b/g, '').trim();
  if (!s) return null;
  let best = null,
    bs = 1e9;
  for (const m of MON) {
    for (const nm of [].concat(m.n || [])) {
      const n = mgNorm(nm).replace(/s\b/g, '');
      if (!n) continue;
      const sc = n === s ? 0 : n.includes(s) ? n.length - s.length : s.includes(n) ? 50 + s.length - n.length : 1e9;
      if (sc < bs) ((bs = sc), (best = m));
    }
  }
  return bs < 1e9 ? best : null;
}
function mgFoe(m, p) {
  const v = conv(m),
    ab = abbr(tr(m.n)),
    nb = tokens.filter(k => k.ab === ab).length + 1,
    sz = monSz(m),
    nn = Math.max(1, Math.floor(SZN[sz] || 1));
  if (!fits(p.x, p.y, nn)) return false;
  tokens.push({
    id: tid(),
    mid: m.id,
    no: noT(m),
    x: p.x,
    y: p.y,
    sz,
    t: 'foe',
    ab,
    n: ab + nb,
    ty: m.type,
    nm: m.n,
    num: nb,
    esq: v.esq,
    maj: v.maj,
    sev: v.sev,
    hp: v.cases,
    hpMax: v.cases,
    init: +m.init || 0,
  });
  return true;
}
function mgBuild(r) {
  snap();
  // the map is big enough for its places, and each place shrinks when it has to share the map
  const nb = r.add.filter(a => MG_PLACES[a.k]).length,
    need = nb >= 3 ? 64 : nb === 2 ? 32 : nb === 1 ? 24 : 0,
    n = Math.max(r.size ? MG_SIZE[r.size] : N, need);
  MG.span = (nb >= 3 ? 0.55 : nb === 2 ? 0.7 : 1) * n;
  if (n !== N) resizeTo(n);
  H = blank(N);
  F = blank(N);
  tokens = tokens.filter(k => k.cid);
  MARKS = [];
  OBJS = [];
  TPLS = [];
  ENV = {};
  NZ = null;
  RNG = Math.random;
  MG.taken = [];
  if (r.bio) bio = r.bio;
  // a scene made for another setting (a desert oasis in the snow…) is dropped
  if (r.bio && r.scene && typeof SCN[r.scene].bio === 'string' && SCN[r.scene].bio !== r.bio) r.scene = null;
  // a crowded scene (camp, village, ruins…) under one of our own places makes a mess: keep only a landscape scene
  const LAND = [
    'forest_road',
    'forest_clearing',
    'mtn_pass',
    'mtn_bend',
    'river_ford',
    'marsh_walk',
    'lava_field',
    'snow_forest',
    'oasis',
    'crossroads',
    'outskirts',
    'cave',
  ];
  if (r.scene && r.add.some(a => MG_PLACES[a.k]) && !LAND.includes(r.scene)) r.scene = null;
  // a named scene draws the whole map; with buildings only, a free landscape of the setting is the base
  const sc = r.scene || (r.add.length ? 'free' : null) || (scenesFor(bio)[0] !== 'free' ? scenesFor(bio)[0] : 'free');
  scene = sc;
  if (sc === 'free') genFree();
  else SCN[sc].run();
  if (r.scene && SCN[r.scene].bio && !r.bio)
    bio = typeof SCN[r.scene].bio === 'function' ? SCN[r.scene].bio() : SCN[r.scene].bio;
  const T = { ...r.terrain };
  if (T.road && r.add.some(a => MG_PLACES[a.k])) T.road = 'carve';
  mgTerrain(T);
  const places = [];
  for (const a of r.add) {
    if (MG_PLACES[a.k]) places.push(MG_PLACES[a.k](a.pos || (places.length ? MG_POS[1 + R(8)] : 'center')));
    else {
      const [x0, y0] = mgRect(a.pos || MG_POS[R(9)], 6, 6);
      prefPlace({ x: x0 + 2, y: y0 + 2 }, a.k, true);
    }
  }
  for (const o of r.objs) {
    if (o.k === 'door') {
      mgAddDoors(o.n);
      continue;
    }
    const have = OBJS.filter(x => x.k === o.k).length;
    if (
      places.length &&
      ['altar', 'statue', 'brazier', 'sarco', 'throne', 'well', 'campfire'].includes(o.k) &&
      have >= o.n
    )
      continue;
    const c = mgNear(o.near || (places.length ? 'inside' : 'anywhere'), places);
    for (let i = 0; i < o.n - (places.length ? have : 0) && c.length; i++) {
      const p = o.near && o.near !== 'anywhere' ? c.shift() : c.splice(R(c.length), 1)[0];
      OBJS.push({ x: p.x, y: p.y, k: o.k, o: false, r: R(4) });
    }
  }
  for (const e of r.env) {
    const c = mgNear(e.near || 'anywhere', places);
    if (!c.length) continue;
    const s = e.near && e.near !== 'anywhere' ? c[0] : c[R(c.length)],
      near = c.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
    for (let i = 0; i < Math.min(e.n, near.length); i++) ENV[near[i].x + ',' + near[i].y] = { k: e.k, dc: 12 };
  }
  if (r.ruin > 0) mgRuin(r.ruin);
  mgAccess(places, T.road === 'carve');
  mgFixDoors();
  const missing = [];
  for (const f of r.foes) {
    const m = mgMonster(f.q);
    if (!m) {
      missing.push(f.q);
      continue;
    }
    const c = mgNear(f.near || 'anywhere', places).filter(p => tokAt(p) < 0);
    let put = 0;
    for (const p of f.near && f.near !== 'anywhere' ? c : c.sort(() => RNG() - 0.5)) {
      if (put >= f.n) break;
      if (mgFoe(m, p)) put++;
    }
  }
  for (const mk of r.marks) {
    const c = mgNear(mk.near || 'center', places);
    if (c[0]) MARKS.push({ x: c[0].x, y: c[0].y, l: mk.l, id: tid() });
  }
  MG.missing = missing;
  for (const x of document.querySelectorAll('#biomes button')) x.setAttribute('aria-pressed', x.dataset.b === bio);
  legend();
  fillScenes();
  showSize();
  if (typeof renderMarks === 'function') renderMarks();
  if (typeof renderIni === 'function') renderIni();
  save();
  layout();
  draw();
}
// ---- the AI, called from this browser with the GM's own keys (never put on the site, sent to players or backed up).
// Several providers can be filled in: they are tried in order, the free ones first, until one answers.
const MG_KEYS = 'luparis-ai-keys',
  MG_MODEL = 'luparis-ai-model';
const MG_AI = [
  { id: 'gemini', n: 'Gemini', free: 1, url: 'https://aistudio.google.com/apikey' },
  {
    id: 'groq',
    n: 'Groq',
    free: 1,
    url: 'https://console.groq.com/keys',
    base: 'https://api.groq.com/openai/v1',
    models: ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'],
  },
  {
    id: 'cerebras',
    n: 'Cerebras',
    free: 1,
    url: 'https://cloud.cerebras.ai',
    base: 'https://api.cerebras.ai/v1',
    models: ['gpt-oss-120b', 'llama-3.3-70b', 'qwen-3-32b', 'llama3.1-8b'],
  },
  {
    id: 'openrouter',
    n: 'OpenRouter',
    free: 1,
    url: 'https://openrouter.ai/keys',
    base: 'https://openrouter.ai/api/v1',
    models: null,
  },
  {
    id: 'mistral',
    n: 'Mistral',
    free: 1,
    url: 'https://console.mistral.ai/api-keys',
    base: 'https://api.mistral.ai/v1',
    models: ['mistral-small-latest', 'open-mistral-nemo'],
  },
  { id: 'claude', n: 'Claude', url: 'https://console.anthropic.com' },
  {
    id: 'openai',
    n: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    base: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini'],
  },
];
function mgSet(k, v) {
  try {
    if (v) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  } catch (e) {}
}
// which provider a key belongs to, from its shape (Mistral keys have none: they go in their own field)
function mgProv(key) {
  return /^sk-ant-/.test(key)
    ? 'claude'
    : /^sk-or-/.test(key)
      ? 'openrouter'
      : /^gsk_/.test(key)
        ? 'groq'
        : /^csk-/.test(key)
          ? 'cerebras'
          : /^sk-/.test(key)
            ? 'openai'
            : 'gemini';
}
function mgKeys() {
  let o = {};
  try {
    o = JSON.parse(localStorage.getItem(MG_KEYS) || '{}') || {};
    // the single key of the earlier version
    const old = localStorage.getItem('luparis-ai-key');
    if (old) {
      o[mgProv(old)] = o[mgProv(old)] || old;
      localStorage.setItem(MG_KEYS, JSON.stringify(o));
      localStorage.removeItem('luparis-ai-key');
    }
  } catch (e) {}
  return o;
}
function mgKey() {
  const K = mgKeys();
  return MG_AI.some(p => K[p.id]);
}
const mgJSON = t => {
  const a = t.indexOf('{'),
    b = t.lastIndexOf('}');
  return JSON.parse(a >= 0 ? t.slice(a, b + 1) : t);
};
async function mgFetch(url, opt) {
  try {
    return await fetch(url, { ...opt, signal: AbortSignal.timeout(25000) });
  } catch (e) {
    return { ok: false, status: 0 };
  }
}
// Gemini models get overloaded at times: try several, the last one that answered first
async function mgGeminiList(key) {
  if (MG.list) return MG.list;
  let L = [];
  try {
    const j = await (
      await mgFetch(
        'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(key),
      )
    ).json();
    L = (j.models || [])
      .filter(x => (x.supportedGenerationMethods || []).includes('generateContent'))
      .map(x => x.name.replace(/^models\//, ''));
  } catch (e) {}
  const num = re => L.filter(x => re.test(x)).sort((a, b) => parseFloat(b.slice(7)) - parseFloat(a.slice(7)));
  MG.list = [
    ...new Set([
      'gemini-flash-lite-latest',
      ...num(/^gemini-[\d.]+-flash-lite$/).slice(0, 2),
      'gemini-flash-latest',
      ...num(/^gemini-[\d.]+-flash$/).slice(0, 2),
    ]),
  ].filter(x => !L.length || L.includes(x));
  return MG.list;
}
// OpenRouter: its free models change often, so ask which ones exist now
async function mgOpenRouterList() {
  if (MG.orl) return MG.orl;
  let L = [];
  try {
    const j = await (await mgFetch('https://openrouter.ai/api/v1/models')).json();
    L = (j.data || []).map(x => x.id).filter(id => /:free$/.test(id));
  } catch (e) {}
  const pref = ['gpt-oss', 'llama-3.3-70b', 'deepseek', 'qwen', 'gemma', 'mistral'];
  L.sort((a, b) => ((pref.findIndex(p => a.includes(p)) + 99) % 99) - ((pref.findIndex(p => b.includes(p)) + 99) % 99));
  MG.orl = L.slice(0, 4);
  return MG.orl;
}
// one provider: returns the recipe, or throws { soft: true } to go on with the next one
async function mgAsk(p, key, text) {
  const prompt = mgPrompt(text),
    forced = (() => {
      try {
        return localStorage.getItem(MG_MODEL + '-' + p.id) || '';
      } catch (e) {
        return '';
      }
    })();
  const fail = (st, m) => {
    const e = new Error(m);
    e.st = st;
    return e;
  };
  if (p.id === 'gemini') {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
    });
    let last = 0;
    for (const m of forced ? [forced] : [...new Set([MG.ok, ...(await mgGeminiList(key))].filter(Boolean))]) {
      const res = await mgFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        },
      );
      if (res.status === 400 || res.status === 401 || res.status === 403) throw fail(res.status, 'key');
      if (!res.ok) {
        last = res.status;
        continue;
      }
      const j = await res.json();
      MG.ok = m;
      return mgClean(
        mgJSON(
          ((j.candidates && j.candidates[0] && j.candidates[0].content.parts) || []).map(x => x.text || '').join(''),
        ),
      );
    }
    throw fail(last, 'busy');
  }
  if (p.id === 'claude') {
    const res = await mgFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: forced || 'claude-haiku-5-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw fail(res.status, res.status === 401 || res.status === 403 ? 'key' : 'busy');
    const j = await res.json();
    return mgClean(mgJSON((j.content || []).map(c => c.text || '').join('')));
  }
  // OpenAI-style providers (Groq, Cerebras, OpenRouter, Mistral, OpenAI)
  const models = forced ? [forced] : p.id === 'openrouter' ? await mgOpenRouterList() : p.models;
  let last = 0;
  for (const m of models) {
    const res = await mgFetch(p.base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: m, temperature: 0.6, messages: [{ role: 'user', content: prompt }] }),
    });
    if (res.status === 401 || res.status === 403) throw fail(res.status, 'key');
    if (!res.ok) {
      last = res.status;
      continue;
    }
    const j = await res.json(),
      t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    try {
      return mgClean(mgJSON(t));
    } catch (e) {
      last = 'json';
    }
  }
  throw fail(last, 'busy');
}
// every filled key, in order, until one gives a recipe
async function mgAI(text) {
  const K = mgKeys(),
    errs = [];
  for (const p of MG_AI) {
    if (!K[p.id]) continue;
    mgMsg(L2(`${p.n} reads your description…`, `${p.n} lit ta description…`));
    try {
      const r = await mgAsk(p, K[p.id], text);
      r.via = p.n;
      return r;
    } catch (e) {
      errs.push(
        `${p.n} ${e.message === 'key' ? L2('key refused', 'clé refusée') : e.st === 0 ? L2('unreachable', 'injoignable') : e.st === 429 || e.st === 503 ? L2('busy', 'saturé') : e.st || ''}`,
      );
    }
  }
  const e = new Error(errs.join(', ') || L2('no key', 'aucune clé'));
  throw e;
}
function mgPrompt(text) {
  const scn = MG_SCENES.map(k => `${k} (${t('scn')[k] || k})`).join(', '),
    obj = MG_OBJ.map(k => `${k} (${OBJT[k].n[0]})`).join(', '),
    env = MG_ENV.map(k => `${k} (${ENVT[k].n[0]})`).join(', '),
    mons = [...new Set(MON.map(m => [].concat(m.n)[0]))].slice(0, 400).join(', ');
  return `You are the map designer of a tabletop RPG. Turn the game master's description into a JSON recipe that a map generator will draw on a square grid of tiles (1 tile = 5 ft). Answer with JSON only.

Fields (all optional; leave out what the description does not imply):
- "plan": write this first: 2 or 3 sentences on the layout (what is where, how one gets in, what the terrain does), so that the rest is coherent.
- "title": short name of the place, in the language of the description.
- "bio": setting, one of ${JSON.stringify(ORDER)} (gen = generic stone, foret = forest, prairie = plains, montagne = mountain, volcan = volcano, desert, neige = snow, marais = swamp, donjon = dungeon / underground).
- "scene": a ready-made whole map, one of: ${scn}. Use a scene ONLY when the description is mainly that kind of place and asks for no building below. Never combine "ruins" with a building: use "ruin" instead.
- "add": up to 4 buildings drawn on top, each {"k": one of ${JSON.stringify(MG_STRUCT)}, "pos": one of ${JSON.stringify(MG_POS)}}. temple = nave with altar, statues, pillars, benches; crypt = burial vault with sarcophagi; camp = palisade ring with tents and a campfire; stone_circle = ring of standing stones around an altar; throne_room = hall with a throne on a dais; market = square with stalls and a well; the others are small buildings. The first building is the main place: put it in "center" unless told otherwise.
- "ruin": 0 (intact) to 1 (collapsed). "abandoned" ≈ 0.3, "in ruins" ≈ 0.6–0.8.
- "terrain": {"water": "none"|"river"|"lake"|"pools", "relief": "flat"|"hills"|"cliffs", "veg": 0 to 1 (trees and grass density), "road": true|false}.
- "objs": extra objects, list of {"k": one of: ${obj}; "n": count; "near": one of ${JSON.stringify(MG_NEAR)}}. Buildings already contain their usual furniture: only add what the description adds. Doors ("door") are only ever put in existing walls: ask for them only when there are walls.
- "env": hazard zones, list of {"k": one of: ${env}; "n": number of tiles (3 to 20); "near": as above}.
- "foes": creatures, list of {"q": creature name from this bestiary: ${mons}; "n": count; "near": as above}. Use the closest bestiary name.
- "marks": labelled landmarks, list of {"l": short label in the language of the description, "near": as above}.
- "size": "small" (16×16), "medium" (24×24), "large" (32×32), "huge" (64×64). Pick large or huge for big outdoor scenes or several buildings.

Coherence rules: the setting, the scene, the buildings and the terrain must agree (no oasis in the snow, no river inside a crypt). Underground places (crypt, dungeon, cave) use "donjon" and no water unless asked. Give two buildings different positions. Creatures stand where the story puts them (guards at the entrance, a boss by the altar or the throne). Keep counts plausible for the size of the map.

Description: ${JSON.stringify(String(text).slice(0, 800))}`;
}
// ---- UI: a line in the map toolbar
function mgMsg(m) {
  const el = document.getElementById('mg_msg');
  if (el) el.textContent = m;
}
async function mgGo(again) {
  const q = document.getElementById('mg_q'),
    text = q ? q.value.trim() : '';
  if (!text && !(again && MG.last)) return;
  let r = again && MG.last ? MG.last : null,
    via = '';
  MG.aiErr = '';
  if (!r && mgKey()) {
    mgMsg(L2('The AI reads your description…', "L'IA lit ta description…"));
    try {
      r = await mgAI(text);
      via = r.via;
    } catch (e) {
      MG.aiErr = e.message;
      mgMsg(
        L2('AI unavailable (', 'IA indisponible (') +
          e.message +
          L2('): keywords instead.', ') : mots-clés à la place.'),
      );
    }
  }
  if (!r) {
    r = mgParse(text);
    via = via || L2('keywords', 'mots-clés');
  }
  MG.last = r;
  mgBuild(r);
  const s = mgSummary(r);
  mgMsg(
    s
      ? `${r.title ? r.title + ' — ' : ''}${L2('Understood', 'Compris')} (${via}) : ${s}${MG.aiErr && !r.via ? ' · ' + L2('AI unavailable: ', 'IA indisponible : ') + MG.aiErr : ''}${MG.missing && MG.missing.length ? ' · ' + L2('not in the bestiary: ', 'absents du bestiaire : ') + MG.missing.join(', ') : ''}`
      : L2(
          'No known word: a map of the current setting instead.',
          'Aucun mot connu : une carte du décor actuel à la place.',
        ),
  );
}
{
  const g = document.getElementById('gen').parentNode;
  g.insertAdjacentHTML(
    'beforeend',
    `<form id="mg_f" class="mgf"><input id="mg_q" type="text" maxlength="500" autocomplete="off" placeholder="${L2('Describe the scene: ruined temple in the forest…', 'Décris la scène : temple en ruines dans la forêt…')}" aria-label="${L2('Describe the scene', 'Décris la scène')}"><button type="submit" class="go">${L2('Draw', 'Dessiner')}</button><button type="button" id="mg_again" title="${L2('Another version of the same recipe', 'Une autre version de la même recette')}">↻</button><button type="button" id="mg_set" title="${L2('AI key', 'Clé IA')}" aria-label="${L2('AI key', 'Clé IA')}">⚙</button><span class="small" id="mg_msg" aria-live="polite"></span></form>`,
  );
  document.getElementById('mg_f').addEventListener('submit', e => {
    e.preventDefault();
    mgGo(false);
  });
  document.getElementById('mg_again').onclick = () => mgGo(true);
  document.getElementById('mg_set').onclick = () => {
    let d = document.getElementById('mgdlg');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'mgdlg';
      document.body.append(d);
    }
    const K = mgKeys();
    d.innerHTML = `<form method="dialog" class="mgd"><h3>${L2('AI for map drawing', 'IA pour dessiner les cartes')}</h3>
<p class="small">${L2('Optional. With at least one key, any sentence is understood; without, known keywords only. Keys are tried in this order until one answers, the free ones first. They stay in this browser: never put on the site, sent to the players or copied into backups.', "Facultatif. Avec au moins une clé, n'importe quelle phrase est comprise ; sans clé, seulement les mots-clés connus. Les clés sont essayées dans cet ordre jusqu'à ce qu'une réponde, les gratuites d'abord. Elles restent dans ce navigateur : jamais mises sur le site, envoyées aux joueurs ni copiées dans les sauvegardes.")}</p>
<div class="mgkeys">${MG_AI.map(p => `<label><span>${p.n} ${p.free ? `<span class="pill">${L2('free', 'gratuit')}</span>` : ''} <a href="${p.url}" target="_blank" rel="noopener" class="small">${L2('get a key', 'obtenir une clé')}</a></span><input type="password" autocomplete="off" data-mgk="${p.id}" value="${esc(K[p.id] || '')}" aria-label="${L2('Key', 'Clé')} ${p.n}"></label>`).join('')}</div>
<div class="row"><button value="save" class="go">${L2('Save', 'Enregistrer')}</button><button value="del">${L2('Forget all keys', 'Oublier toutes les clés')}</button><button value="cancel">${L2('Cancel', 'Annuler')}</button></div></form>`;
    d.onclose = () => {
      if (d.returnValue === 'save') {
        const o = {};
        for (const inp of d.querySelectorAll('[data-mgk]')) if (inp.value.trim()) o[inp.dataset.mgk] = inp.value.trim();
        mgSet(MG_KEYS, Object.keys(o).length ? JSON.stringify(o) : '');
        MG.list = MG.orl = null;
      } else if (d.returnValue === 'del') mgSet(MG_KEYS, '');
      const on = MG_AI.filter(p => mgKeys()[p.id]).map(p => p.n);
      mgMsg(
        on.length
          ? L2('AI on: ', 'IA activée : ') + on.join(' → ') + '.'
          : L2('Keywords only.', 'Mots-clés seulement.'),
      );
    };
    d.showModal();
  };
}

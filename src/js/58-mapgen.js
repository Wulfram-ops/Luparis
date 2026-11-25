// ---- a map from a sentence ("temple en ruines dans la forêt")
// The sentence becomes a recipe (biome, scene, size, buildings, state, objects, hazards). Without an AI key the recipe
// comes from keywords; with a Gemini key (kept in this browser only) the AI writes it. The generators below draw it.
const MG = { last: null };
const MG_SCENES = Object.keys(SCN).filter(k => k !== 'free');
const MG_STRUCT = ['temple', ...Object.keys(PREF)];
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
  [/\b(neige|enneige|hiver|toundra|snow|snowy|winter|tundra)\b/, r => (r.bio = 'neige')],
  [/\b(marais|marecages?|tourbiere|swamp|marsh|bog)\b/, r => (r.bio = 'marais')],
  [
    /\b(donjon|souterrains?|cachots?|dungeon|underground)\b/,
    r => ((r.bio = 'donjon'), (r.scene = r.scene || 'dungeon')),
  ],
  [/\b(clairiere|clearing)\b/, r => (r.scene = 'forest_clearing')],
  [/\b(camp|campement|bandits?|brigands?)\b/, r => (r.scene = 'bandit_camp')],
  [/\b(carrefour|croisement|crossroads?)\b/, r => (r.scene = 'crossroads')],
  [/\b(fermes?|farm|farmland)\b/, r => (r.scene = 'farmland')],
  [/\b(taverne|auberge|tavern|inn)\b/, r => (r.scene = 'tavern')],
  [/\b(village|hameau|place|square|hamlet)\b/, r => (r.scene = 'village_square')],
  [/\b(port|quais?|docks?|harbou?r)\b/, r => (r.scene = 'docks')],
  [/\b(pont|bridge)\b/, r => (r.scene = 'bridge')],
  [/\b(gue|riviere|ford|river)\b/, r => (r.scene = 'river_ford')],
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
    r = { bio: null, scene: null, size: null, add: [], ruin: 0, objs: [], env: [] };
  for (const [re, f] of MG_WORDS) if (re.test(s)) f(r);
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
    }[o.k];
    const m = w && new RegExp(`\\b(\\d+|${Object.keys(MG_NUM).join('|')})\\s+(${w})\\b`).exec(s);
    if (m) o.n = Math.min(12, +m[1] || MG_NUM[m[1]] || o.n);
  }
  return mgClean(r);
}
// whatever wrote the recipe (keywords or AI), only known values go through
function mgClean(r) {
  r = r && typeof r === 'object' ? r : {};
  const n = (v, a, b, d) => (isFinite(+v) ? Math.max(a, Math.min(b, Math.round(+v))) : d),
    o = {
      bio: B[r.bio] ? r.bio : null,
      scene: MG_SCENES.includes(r.scene) ? r.scene : null,
      size: MG_SIZE[r.size] ? r.size : null,
      add: (Array.isArray(r.add) ? r.add : []).filter(k => MG_STRUCT.includes(k)).slice(0, 4),
      ruin: isFinite(+r.ruin) ? Math.max(0, Math.min(1, +r.ruin)) : 0,
      objs: (Array.isArray(r.objs) ? r.objs : [])
        .filter(x => x && MG_OBJ.includes(x.k))
        .slice(0, 10)
        .map(x => ({ k: x.k, n: n(x.n, 1, 12, 1) })),
      env: (Array.isArray(r.env) ? r.env : [])
        .filter(x => x && MG_ENV.includes(x.k))
        .slice(0, 4)
        .map(x => ({ k: x.k, n: n(x.n, 1, 30, 5) })),
      title: String(r.title || '').slice(0, 60),
    };
  o.add = [...new Set(o.add)];
  if (!o.bio && o.scene && SCN[o.scene].bio) o.bio = typeof SCN[o.scene].bio === 'function' ? null : SCN[o.scene].bio;
  return o;
}
function mgSummary(r) {
  const P = [];
  if (r.bio) P.push(tr(B[r.bio].n));
  if (r.scene) P.push(t('scn')[r.scene] || r.scene);
  for (const k of r.add) P.push(k === 'temple' ? L2('temple', 'temple') : tr(PREF[k]));
  if (r.ruin >= 0.5) P.push(L2('in ruins', 'en ruines'));
  else if (r.ruin > 0) P.push(L2('abandoned', 'abandonné'));
  for (const x of r.objs) P.push(`${x.n} × ${tr(OBJT[x.k].n).toLowerCase()}`);
  for (const x of r.env) P.push(tr(ENVT[x.k].n).toLowerCase());
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
// a temple: walled nave, two rows of pillars, a dais with the altar, statues and braziers, benches, a door
function mgTemple() {
  const w = Math.max(7, Math.min(N - 4, Math.round(N * 0.45))) | 1,
    h = Math.max(9, Math.min(N - 3, Math.round(w * 1.5))),
    x0 = Math.floor((N - w) / 2),
    y0 = Math.max(1, Math.floor((N - h) / 2)),
    x1 = x0 + w - 1,
    y1 = y0 + h - 1,
    mid = x0 + (w >> 1),
    put = (x, y, k, r = 0) => {
      if (ok(x, y) && objAt(x, y) < 0) OBJS.push({ x, y, k, o: false, r });
    };
  OBJS = OBJS.filter(o => o.x < x0 - 1 || o.x > x1 + 1 || o.y < y0 - 1 || o.y > y1 + 1);
  for (let x = x0 - 1; x <= x1 + 1; x++)
    for (let y = y0 - 1; y <= y1 + 1; y++) {
      if (!ok(x, y)) continue;
      delete ENV[x + ',' + y];
      const edge = x === x0 || y === y0 || x === x1 || y === y1,
        out = x < x0 || y < y0 || x > x1 || y > y1;
      if (out) {
        if (H[x][y] !== 0) H[x][y] = 0;
        continue;
      }
      H[x][y] = edge ? 3 : 0;
      F[x][y] = edge ? 4 : 2;
    }
  // door (south), dais (north)
  for (const x of [mid - 1, mid, mid + 1]) if (x > x0 && x < x1) ((H[x][y1] = 0), (F[x][y1] = 2));
  put(mid, y1, 'door', 0);
  for (let x = x0 + 1; x < x1; x++) for (let y = y0 + 1; y <= y0 + 3; y++) H[x][y] = 1;
  put(mid, y0 + 1, 'altar', 2);
  put(mid - 2, y0 + 1, 'statue', 2);
  put(mid + 2, y0 + 1, 'statue', 2);
  put(x0 + 1, y0 + 1, 'brazier');
  put(x1 - 1, y0 + 1, 'brazier');
  // pillars and benches
  for (let y = y0 + 5; y < y1 - 1; y += 3) {
    for (const x of [x0 + 2, x1 - 2]) {
      H[x][y] = 3;
      F[x][y] = 4;
    }
  }
  for (let y = y0 + 6; y < y1 - 2; y += 2)
    for (let x = x0 + 3; x <= x1 - 3; x++) if (Math.abs(x - mid) > 1) put(x, y, 'bench', 0);
  return [x0, y0, x1, y1];
}
// ruins: broken walls, rubble, weeds; furniture partly gone
function mgRuin(p) {
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++) {
      if (F[x][y] === 4 && H[x][y] >= 2 && RNG() < p * 0.55) {
        H[x][y] = RNG() < 0.5 ? 1 : 0;
        F[x][y] = 13;
      } else if (H[x][y] === 0 && RNG() < p * 0.06) {
        H[x][y] = 1;
        F[x][y] = 13;
      } else if (H[x][y] >= 0 && (F[x][y] === 2 || F[x][y] === 3) && RNG() < p * 0.35) F[x][y] = RNG() < 0.6 ? 6 : 11;
    }
  OBJS = OBJS.filter(o => !(['bench', 'chair', 'table', 'shelf', 'bed', 'counter'].includes(o.k) && RNG() < p * 0.6));
  for (const o of OBJS) if (o.k === 'door' && RNG() < p) o.o = true;
}
function mgBuild(r) {
  snap();
  const n = r.size ? MG_SIZE[r.size] : r.add.includes('temple') && N < 24 ? 24 : N;
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
  if (r.bio) bio = r.bio;
  const sc = r.scene || (r.add.length ? 'free' : null) || (scenesFor(bio)[0] !== 'free' ? scenesFor(bio)[0] : 'free');
  scene = sc;
  if (sc === 'free') genFree();
  else SCN[sc].run();
  if (r.scene && SCN[r.scene].bio && !r.bio)
    bio = typeof SCN[r.scene].bio === 'function' ? SCN[r.scene].bio() : SCN[r.scene].bio;
  let room = null;
  for (const k of r.add) {
    if (k === 'temple') room = mgTemple();
    else prefPlace({ x: 2 + R(Math.max(1, N - 4)), y: 2 + R(Math.max(1, N - 4)) }, k, true);
  }
  for (const o of r.objs) {
    if (room && ['altar', 'statue', 'brazier'].includes(o.k) && OBJS.filter(x => x.k === o.k).length >= o.n) continue;
    const c = mgFree(room);
    for (let i = 0; i < o.n && c.length; i++) {
      const p = c.pop();
      OBJS.push({ x: p.x, y: p.y, k: o.k, o: false, r: R(4) });
    }
  }
  for (const e of r.env) {
    const c = mgFree(room),
      s = c[0];
    if (!s) continue;
    const near = c.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
    for (let i = 0; i < Math.min(e.n, near.length); i++) ENV[near[i].x + ',' + near[i].y] = { k: e.k, dc: 12 };
  }
  if (r.ruin > 0) mgRuin(r.ruin);
  for (const x of document.querySelectorAll('#biomes button')) x.setAttribute('aria-pressed', x.dataset.b === bio);
  legend();
  fillScenes();
  showSize();
  save();
  layout();
  draw();
}
// ---- the AI: Gemini, called from this browser with the GM's own key (never stored on the site)
const MG_KEY = 'luparis-ai-key',
  MG_MODEL = 'luparis-ai-model';
function mgSet(k, v) {
  try {
    if (v) localStorage.setItem(k, v);
    else localStorage.removeItem(k);
  } catch (e) {}
}
function mgKey() {
  try {
    return localStorage.getItem(MG_KEY) || '';
  } catch (e) {
    return '';
  }
}
// the key says which AI it belongs to: Gemini (AIza…), Claude (sk-ant-…), OpenAI (sk-…)
function mgProv(key) {
  return /^sk-ant-/.test(key) ? 'claude' : /^sk-/.test(key) ? 'openai' : 'gemini';
}
async function mgModel(key) {
  let m = '';
  try {
    m = localStorage.getItem(MG_MODEL) || '';
  } catch (e) {}
  if (m) return m;
  const prov = mgProv(key);
  if (prov === 'claude') return 'claude-haiku-5-5';
  if (prov === 'openai') {
    try {
      const j = await (
        await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + key } })
      ).json();
      const L = (j.data || [])
        .map(x => x.id)
        .filter(x => /^gpt-[\d.o]+-mini$/.test(x))
        .sort()
        .reverse();
      if (L[0]) {
        mgSet(MG_MODEL, L[0]);
        return L[0];
      }
    } catch (e) {}
    return 'gpt-4o-mini';
  }
  return '';
}
// Gemini models get overloaded at times: try several, the last one that answered first
async function mgGeminiList(key) {
  if (MG.list) return MG.list;
  let L = [];
  try {
    const j = await (
      await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(key),
        {
          signal: AbortSignal.timeout(10000),
        },
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
function mgPrompt(text) {
  return `You turn a game master's description of a tabletop battle map into a JSON recipe. Answer with JSON only.
Fields (all optional):
- "bio": one of ${JSON.stringify(ORDER)} (gen = generic stone, foret = forest, prairie = plains, montagne = mountain, volcan = volcano, desert, neige = snow, marais = swamp, donjon = dungeon)
- "scene": one of ${JSON.stringify(MG_SCENES)}
- "size": one of ${JSON.stringify(Object.keys(MG_SIZE))}
- "add": buildings, any of ${JSON.stringify(MG_STRUCT)}
- "ruin": 0 (intact) to 1 (in ruins)
- "objs": list of {"k": one of ${JSON.stringify(MG_OBJ)}, "n": count}
- "env": hazard zones, list of {"k": one of ${JSON.stringify(MG_ENV)}, "n": number of tiles}
- "title": a short name for the place, in the language of the description
Pick only what the description implies. Description: ${JSON.stringify(String(text).slice(0, 500))}`;
}
async function mgAI(text) {
  const key = mgKey();
  if (!key) return null;
  const model = await mgModel(key),
    prov = mgProv(key),
    json = t => {
      const a = t.indexOf('{'),
        b = t.lastIndexOf('}');
      return JSON.parse(a >= 0 ? t.slice(a, b + 1) : t);
    };
  if (prov === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: 'user', content: mgPrompt(text) }] }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    return mgClean(json((j.content || []).map(c => c.text || '').join('')));
  }
  if (prov === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: mgPrompt(text) }],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    return mgClean(json((j.choices && j.choices[0] && j.choices[0].message.content) || ''));
  }
  const body = JSON.stringify({
      contents: [{ parts: [{ text: mgPrompt(text) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    }),
    tries = model ? [model] : [...new Set([MG.ok, ...(await mgGeminiList(key))].filter(Boolean))];
  let last = '';
  for (const m of tries) {
    let res;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(20000) },
      );
    } catch (e) {
      last = L2('no answer', 'pas de réponse');
      continue;
    }
    if (res.status === 400 || res.status === 401 || res.status === 403)
      throw new Error(L2('key refused', 'clé refusée') + ' (' + res.status + ')');
    if (!res.ok) {
      last = res.status === 503 || res.status === 429 ? L2('AI overloaded', 'IA surchargée') : 'HTTP ' + res.status;
      continue;
    }
    const j = await res.json(),
      out = j.candidates && j.candidates[0] && j.candidates[0].content.parts.map(p => p.text || '').join('');
    MG.ok = m;
    return mgClean(json(out || ''));
  }
  throw new Error(last || L2('no model available', 'aucun modèle disponible'));
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
  if (!r && mgKey()) {
    mgMsg(L2('The AI reads your description…', "L'IA lit ta description…"));
    try {
      r = await mgAI(text);
      via = { gemini: 'Gemini', claude: 'Claude', openai: 'OpenAI' }[mgProv(mgKey())];
    } catch (e) {
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
      ? `${r.title ? r.title + ' — ' : ''}${L2('Understood', 'Compris')} (${via}) : ${s}`
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
    d.innerHTML = `<form method="dialog" class="mgd"><h3>${L2('AI for map drawing', 'IA pour dessiner les cartes')}</h3>
<p class="small">${L2('Optional. With an AI key, any sentence is understood; without it, known keywords only. Gemini (free at aistudio.google.com), Claude (console.anthropic.com) or OpenAI (platform.openai.com): the site recognizes the key. It stays in this browser: never put on the site, sent to the players or saved in backups.', "Facultatif. Avec une clé d'IA, n'importe quelle phrase est comprise ; sans clé, seulement les mots-clés connus. Gemini (gratuit sur aistudio.google.com), Claude (console.anthropic.com) ou OpenAI (platform.openai.com) : le site reconnaît la clé. Elle reste dans ce navigateur : jamais mise sur le site, envoyée aux joueurs ni copiée dans les sauvegardes.")}</p>
<label><span class="small">${L2('API key', "Clé d'API")}</span><input id="mg_key" type="password" autocomplete="off" value="${esc(mgKey())}"></label>
<label><span class="small">${L2('Model (empty = chosen automatically)', 'Modèle (vide = choisi automatiquement)')}</span><input id="mg_model" value="${esc(
      (() => {
        try {
          return localStorage.getItem(MG_MODEL) || '';
        } catch (e) {
          return '';
        }
      })(),
    )}"></label>
<div class="row"><button value="save" class="go">${L2('Save', 'Enregistrer')}</button><button value="del">${L2('Forget the key', 'Oublier la clé')}</button><button value="cancel">${L2('Cancel', 'Annuler')}</button></div></form>`;
    d.onclose = () => {
      if (d.returnValue === 'save') {
        mgSet(MG_KEY, document.getElementById('mg_key').value.trim());
        mgSet(MG_MODEL, document.getElementById('mg_model').value.trim());
      } else if (d.returnValue === 'del') {
        mgSet(MG_KEY, '');
        mgSet(MG_MODEL, '');
      }
      const pv = { gemini: 'Gemini', claude: 'Claude', openai: 'OpenAI' }[mgProv(mgKey())];
      mgMsg(mgKey() ? L2('AI on: ', 'IA activée : ') + pv + '.' : L2('Keywords only.', 'Mots-clés seulement.'));
    };
    d.showModal();
  };
}

Object.assign(T.en, {
  perf_q: 'Quality',
  t_tpl: 'Zone',
  tpl_zones: 'Effect zones',
  mp_title: 'Multiplayer (test)',
  img_title: 'Images',
  m_desc: 'Description',
  m_traits: 'Traits (one per line, “Name: what it does”)',
  m_traits_ph: 'Pack Tactics: advantage when an ally is adjacent to the target',
  sn_title: 'Session notes',
  t_obj: 'Object',
  t_pref: 'Building',
  savemap: 'Save the map',
  save_name: 'Name',
  w_mem: 'Saved maps',
  t_surf: 'Ground',
  t_env: 'Effect',
  sk_lay: 'Drag a module by its ⠿ handle to reorder.',
  sk_cols: 'Columns',
  sk_layreset: 'Reset layout',
  t_mark: 'Landmark',
  t_hide: '👁 Hide',
  mk_title: 'Landmarks',
  mk_ph: 'What is here?',
  mk_none: 'No landmark yet.',
  mk_hint:
    'Landmark tool (P): click a tile to pin a numbered flag, then name it here. Remove one with its ✕ in this list.',
  ctx_town: 'Town map',
  ctx_regen: 'Reset to the original town',
  ctx_back: 'Back to the free table',
  scene: 'Scene',
  m_sz: 'Size',
  szn: { T: 'Tiny (½ square)', S: 'Small', M: 'Medium', L: 'Large (2×2)', H: 'Huge (3×3)', G: 'Gargantuan (4×4)' },
  z_fit: 'Fit',
  z_out: 'Zoom out',
  scn: {
    forest_clearing: 'Forest clearing',
    bandit_camp: 'Bandit camp',
    snow_forest: 'Snowy forest',
    mtn_pass: 'Mountain pass',
    cave: 'Cave',
    dungeon: 'Dungeon rooms',
    ruins: 'Ruins',
    graveyard: 'Graveyard',
    river_ford: 'River ford',
    marsh_walk: 'Swamp boardwalk',
    oasis: 'Desert oasis',
    lava_field: 'Lava field',
    crossroads: 'Crossroads',
    farmland: 'Farmland',
    village_square: 'Village square',
    docks: 'Docks',
    forest_road: 'Road through the forest',
    mtn_bend: 'Bend on a mountainside',
    outskirts: 'Town outskirts',
    tavern: 'Roadside tavern',
    bridge: 'Bridge over a river',
    free: 'Free terrain',
  },
});
Object.assign(T.fr, {
  perf_q: 'Qualité',
  t_tpl: 'Zone',
  tpl_zones: "Zones d'effet",
  mp_title: 'Partie à plusieurs (test)',
  img_title: 'Images',
  m_desc: 'Description',
  m_traits: "Capacités (une par ligne, « Nom : ce qu'elle fait »)",
  m_traits_ph: 'Tactique de meute : avantage quand un allié est au contact de la cible',
  sn_title: 'Notes de séance',
  t_obj: 'Objet',
  t_pref: 'Bâtiment',
  savemap: 'Enregistrer la carte',
  save_name: 'Nom',
  w_mem: 'Cartes enregistrées',
  t_surf: 'Sol',
  t_env: 'Effet',
  sk_lay: 'Glisse un module par sa poignée ⠿ pour le déplacer.',
  sk_cols: 'Colonnes',
  sk_layreset: "Réinitialiser l'agencement",
  t_mark: 'Repère',
  t_hide: '👁 Cacher',
  mk_title: 'Repères',
  mk_ph: "Qu'y a-t-il ici ?",
  mk_none: "Aucun repère pour l'instant.",
  mk_hint:
    'Outil Repère (P) : clique une case pour planter un fanion numéroté, puis nomme-le ici. Retire-le avec sa croix ✕ dans cette liste.',
  ctx_town: 'Carte de ville',
  ctx_regen: "Revenir à la ville d'origine",
  ctx_back: 'Retour à la table libre',
  scene: 'Scène',
  m_sz: 'Taille',
  szn: {
    T: 'Très petite (½ case)',
    S: 'Petite',
    M: 'Moyenne',
    L: 'Grande (2×2)',
    H: 'Très grande (3×3)',
    G: 'Gigantesque (4×4)',
  },
  z_fit: 'Ajuster',
  z_out: 'Dézoomer',
  scn: {
    forest_clearing: 'Clairière',
    bandit_camp: 'Camp de bandits',
    snow_forest: 'Forêt enneigée',
    mtn_pass: 'Col de montagne',
    cave: 'Grotte',
    dungeon: 'Salles de donjon',
    ruins: 'Ruines',
    graveyard: 'Cimetière',
    river_ford: 'Gué',
    marsh_walk: 'Passerelles du marais',
    oasis: 'Oasis',
    lava_field: 'Champ de lave',
    crossroads: 'Carrefour',
    farmland: 'Champs et ferme',
    village_square: 'Place de village',
    docks: 'Quais',
    forest_road: 'Route en forêt',
    mtn_bend: 'Lacet à flanc de montagne',
    outskirts: 'Faubourg',
    tavern: 'Taverne au bord de la route',
    bridge: 'Pont sur la rivière',
    free: 'Terrain libre',
  },
});
setTimeout(() => {
  fillScenes();
  fillSz();
});
Object.assign(T.en, {
  pl_title: 'Quick place',
  pl_ally: 'Ally (characters)',
  pl_foe: 'Enemy (bestiary)',
  pl_hint: 'Pick a name, then click tiles on the map. Esc to stop.',
  pl_choose: '— choose —',
  in_title: 'Initiative',
  in_roll: 'Roll',
  in_next: 'Next turn',
  in_end: 'End',
  in_rnd: n => `Round ${n}`,
  in_empty: 'Place tokens, then roll. Allies use Physical Finesse, monsters their initiative bonus.',
  incl: 'incl.',
  up: 'up',
  down: 'down',
  m_init: 'Initiative',
  ai_prov: 'AI',
  ai_key: 'API key',
  ai_model: 'Model',
  ai_paste_ph: 'Paste the AI answer here',
  ai_imp: 'Import the answer',
  ai_sum: 'Generate a monster with AI',
  ai_note:
    'Describe the monster in a sentence: name, look, weapons, role. The AI turns it into a Luparis stat block that you check before adding it.',
  ai_ph: 'Ex: Brann the One-Eyed, a bandit chief with a war axe and a hand crossbow, cunning and cowardly',
  ai_go: 'Generate',
  ai_wait: 'Generating…',
  ai_fail: 'Generation failed. Try again or rephrase.',
  ai_rate: 'Too many requests, wait a moment.',
  ai_denied: 'Generation is not allowed here.',
  ai_add: 'Add to the bestiary',
  ai_added: 'Added to the bestiary.',
  sk_back: '← All characters',
  sk_camp: 'Campaign',
  sk_del: 'Delete this character',
  sk_confirm2: 'Confirm: delete this character?',
  sk_chars: 'Characters',
  sk_nchars: n => `${n} character${n > 1 ? 's' : ''}`,
  sk_create: 'Create',
  sk_nocamp: 'No campaign',
  sk_open: 'Open',
  sk_empty: 'No character yet: create one above.',
});
Object.assign(T.fr, {
  pl_title: 'Placement rapide',
  pl_ally: 'Allié (personnages)',
  pl_foe: 'Ennemi (bestiaire)',
  pl_hint: 'Choisis un nom, puis clique sur les cases de la carte. Échap pour arrêter.',
  pl_choose: '— choisir —',
  in_title: 'Initiative',
  in_roll: 'Lancer',
  in_next: 'Tour suivant',
  in_end: 'Fin',
  in_rnd: n => `Round ${n}`,
  in_empty:
    "Place les pions, puis lance. Les alliés utilisent leur Finesse physique, les monstres leur bonus d'initiative.",
  incl: 'dont',
  up: 'de montée',
  down: 'de descente',
  m_init: 'Initiative',
  ai_prov: 'IA',
  ai_key: 'Clé API',
  ai_model: 'Modèle',
  ai_paste_ph: "Colle ici la réponse de l'IA",
  ai_imp: 'Importer la réponse',
  ai_sum: "Générer un monstre avec l'IA",
  ai_note:
    "Décris le monstre en une phrase : nom, allure, armes, rôle. L'IA le convertit en profil Luparis que tu vérifies avant de l'ajouter.",
  ai_ph: 'Ex : Brann le Borgne, chef bandit avec une hache de guerre et une arbalète de poing, rusé et lâche',
  ai_go: 'Générer',
  ai_wait: 'Génération en cours…',
  ai_fail: 'La génération a échoué. Réessaie ou reformule.',
  ai_rate: 'Trop de demandes, patiente un instant.',
  ai_denied: "La génération n'est pas autorisée ici.",
  ai_add: 'Ajouter au bestiaire',
  ai_added: 'Ajouté au bestiaire.',
  sk_back: '← Tous les personnages',
  sk_camp: 'Campagne',
  sk_del: 'Supprimer ce personnage',
  sk_confirm2: 'Confirmer : supprimer ce personnage ?',
  sk_chars: 'Personnages',
  sk_nchars: n => `${n} personnage${n > 1 ? 's' : ''}`,
  sk_create: 'Créer',
  sk_nocamp: 'Sans campagne',
  sk_open: 'Ouvrir',
  sk_empty: 'Aucun personnage : crée-en un ci-dessus.',
});
function renderPlace() {
  const a = document.getElementById('pl_ally'),
    f = document.getElementById('pl_foe');
  if (!a || !f) return;
  const av = a.value,
    fv = f.value;
  a.innerHTML =
    opt('', t('pl_choose')) +
    [...camps(), '']
      .map(g => {
        const L = CH.list.filter(c => (c.camp || '') === g);
        if (!L.length) return '';
        return `<optgroup label="${esc(g || t('sk_nocamp'))}">${L.map(c => opt(c.id, c.name || '?', c.id === av)).join('')}</optgroup>`;
      })
      .join('');
  const byT = {};
  for (const m of MON) (byT[m.type] = byT[m.type] || []).push(m);
  f.innerHTML =
    opt('', t('pl_choose')) +
    Object.keys(byT)
      .sort((x, y) => tyName(x).localeCompare(tyName(y), lang))
      .map(
        k =>
          `<optgroup label="${esc(tyName(k))}">${byT[k]
            .sort((x, y) => fpNum(x.fp) - fpNum(y.fp))
            .map(m => opt(m.id, `${tr(m.n)} (${lang === 'fr' ? 'FP' : 'CR'} ${m.fp})`, m.id === fv))
            .join('')}</optgroup>`,
      )
      .join('');
}
$('pl_ally').addEventListener('change', e => {
  const v = e.target.value;
  if (!v) return setTool('move');
  $('pl_foe').value = '';
  const ch = CH.list.find(c => c.id === v);
  placing = { ally: v, n: ch ? ch.name || '?' : '?' };
  setTool('place');
});
$('pl_foe').addEventListener('change', e => {
  const v = e.target.value;
  if (!v) return setTool('move');
  $('pl_ally').value = '';
  const m = MON.find(x => x.id === v);
  if (!m) return;
  placing = m;
  setTool('place');
});
function renderIni() {
  const L = document.getElementById('in_list');
  if (!L) return;
  INI.o = INI.o.filter(o => tokens.some(k => k.id === o.id));
  if (INI.cur >= INI.o.length) INI.cur = 0;
  document.getElementById('in_round').textContent = INI.o.length ? t('in_rnd')(INI.round) : t('in_empty');
  L.innerHTML = INI.o
    .map((o, i) => {
      const k = tokens.find(k => k.id === o.id),
        nm = k ? (k.nm ? tr(k.nm) + (k.num ? ' ' + k.num : '') : k.n) : '?';
      return `<li class="${i === INI.cur ? 'cur' : ''}"><input class="iv" type="number" value="${o.v}" data-iv="${i}" aria-label="${esc(t('in_title'))} ${esc(nm)}"><span class="inm ${k && k.t === 'pj' ? 'ally' : 'foe'}">${esc(nm)}${k && k.cd && Object.keys(k.cd).length ? ` <span class="icd" title="${L2('Recharging', 'En recharge')}">⏳${Math.max(...Object.values(k.cd))}</span>` : ''}</span>${k && k.mid && MON.find(m => m.id === k.mid) ? `<button type="button" class="isb" data-isb="${esc(k.id)}" title="${L2('Monster sheet', 'Fiche du monstre')}" aria-label="${L2('Monster sheet', 'Fiche du monstre')} ${esc(nm)}">📜</button>` : ''}<button type="button" data-ix="${i}" aria-label="${esc(t('sk_remove'))} ${esc(nm)}">×</button></li>`;
    })
    .join('');
}
const iniSort = () => INI.o.sort((a, b) => b.v - a.v || b.b - a.b);
$('in_roll').onclick = () => {
  if (!tokens.length) return;
  sweepUsed.clear();
  INI.o = tokens.map(k => {
    const b = +k.init || 0,
      pv = k.cid && typeof INIP !== 'undefined' ? INIP[k.cid] : null;
    return { id: k.id || (k.id = tid()), v: pv != null ? pv : dRoll(20) + b, b };
  });
  iniSort();
  INI.cur = 0;
  INI.round = 1;
  save();
  draw();
  if (typeof renderHand === 'function') renderHand();
};
$('in_next').onclick = () => {
  if (!INI.o.length) return;
  INI.cur++;
  if (INI.cur >= INI.o.length) {
    INI.cur = 0;
    INI.round++;
  }
  // a creature whose turn starts recovers one turn of recharge on each ability
  {
    const k = tokens.find(x => x.id === INI.o[INI.cur].id);
    if (k && k.cd) {
      for (const a of Object.keys(k.cd)) if (--k.cd[a] <= 0) delete k.cd[a];
      if (typeof SBRP === 'function' && SBT === k && document.getElementById('sbdlg')?.open) SBRP();
    }
  }
  save();
  draw();
};
function iniReset() {
  sweepUsed.clear();
  INI = { o: [], cur: 0, round: 0 };
  $('in_xp').hidden = true;
  save();
  draw();
}
$('in_end').onclick = () => {
  for (const k in INIP) delete INIP[k];
  const names = camps();
  if (!names.length || !INI.o.length) {
    iniReset();
    return;
  }
  const ti = lang === 'fr' ? 1 : 0,
    here = [
      ...new Set(
        tokens
          .filter(k => k.cid)
          .map(k => (CH.list.find(c => c.id === k.cid) || {}).camp)
          .filter(Boolean),
      ),
    ],
    def = here[0] || names[0];
  const box = $('in_xp');
  box.hidden = false;
  box.innerHTML = `<p class="small"><b>${L2('Fight difficulty?', 'Difficulté du combat ?')}</b> <span class="pill">${L2('GM', 'MJ')}</span></p><label class="small">${L2('Campaign', 'Campagne')} <select id="in_xc">${names.map(n => opt(n, n, n === def)).join('')}</select></label><div class="chips">${DIFF.map(d => `<button type="button" class="chip" data-ixp="${d[1]}" data-l="${d[0]}">${esc(d[2][ti])} +${d[1]}</button>`).join('')}</div><button type="button" id="in_noxp">${L2('End without XP', 'Finir sans XP')}</button>`;
};
$('in_xp').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'in_noxp') {
    iniReset();
    return;
  }
  if (b.dataset.ixp != null) {
    campAward($('in_xc').value, +b.dataset.ixp, b.dataset.l);
    iniReset();
    const m = $('save_msg');
    if (m) {
      m.textContent = L2('XP awarded to the campaign.', 'XP attribuée à la campagne.');
      setTimeout(() => {
        m.textContent = '';
      }, 3500);
    }
  }
});
$('in_list').addEventListener('change', e => {
  const i = e.target.dataset.iv;
  if (i == null) return;
  INI.o[+i].v = +e.target.value || 0;
  const cur = INI.o[INI.cur];
  iniSort();
  INI.cur = Math.max(0, INI.o.indexOf(cur));
  save();
  draw();
});
$('in_list').addEventListener('click', e => {
  const b = e.target.closest('button[data-ix]');
  if (!b) return;
  const i = +b.dataset.ix;
  INI.o.splice(i, 1);
  if (INI.cur > i) INI.cur--;
  save();
  draw();
});
for (const k of tokens) if (!k.id) k.id = tid();
let SAMPLE = null,
  aiCand = null;
const AIP = {
  claude: { n: 'Claude (Anthropic)', m: 'claude-haiku-5-5', k: 1 },
  gemini: { n: 'Gemini (Google)', m: 'gemini-flash-latest', k: 1 },
  openai: { n: 'OpenAI', m: 'gpt-5-mini', k: 1 },
  custom: {
    n: ['OpenAI-compatible (LM Studio, Ollama, OpenRouter…)', 'Compatible OpenAI (LM Studio, Ollama, OpenRouter…)'],
    m: '',
    k: 0,
    u: 1,
  },
  copy: { n: ['Copy and paste (no key)', 'Copier-coller (sans clé)'], k: 0 },
};
var AIC = { p: 'copy', k: {}, m: {}, u: '' };
try {
  AIC = Object.assign(AIC, lsGet('luparis-ai', null) || {});
} catch (e) {}
function aiSave() {
  lsSet('luparis-ai', AIC);
}
function aiUI() {
  const p = AIC.p,
    P = AIP[p] || AIP.copy;
  $('ai_p').innerHTML =
    (SAMPLE ? opt('builtin', L2('Built-in (Claude)', 'Intégré (Claude)'), p === 'builtin') : '') +
    Object.keys(AIP)
      .map(k => opt(k, tr(AIP[k].n), k === p))
      .join('');
  $('ai_kl').hidden = !P.k || p === 'builtin';
  $('ai_ml').hidden = p === 'copy' || p === 'builtin';
  $('ai_ul').hidden = !P.u;
  $('ai_k').value = AIC.k[p] || '';
  $('ai_m').value = AIC.m[p] || P.m || '';
  $('ai_u').value = AIC.u || '';
  $('ai_paste').hidden = p !== 'copy';
  $('ai_go').textContent = p === 'copy' ? L2('Copy the prompt', 'Copier le prompt') : t('ai_go');
  $('ai_hint').textContent =
    p === 'copy'
      ? L2(
          'The prompt is copied: paste it into Claude, ChatGPT or Gemini, then paste the answer below.',
          'Le prompt est copié : colle-le dans Claude, ChatGPT ou Gemini, puis colle la réponse ci-dessous.',
        )
      : P.k
        ? L2(
            'Your key stays in this browser only and is sent only to the provider. Game master only: do not use it on a shared computer.',
            "Ta clé reste dans ce navigateur et n'est envoyée qu'au fournisseur. Réservé au MJ : ne l'utilise pas sur un ordinateur partagé.",
          )
        : p === 'custom'
          ? L2(
              'Local server: allow this site in its CORS settings (Ollama: OLLAMA_ORIGINS).',
              'Serveur local : autorise ce site dans ses réglages CORS (Ollama : OLLAMA_ORIGINS).',
            )
          : '';
}
$('ai_p').addEventListener('change', e => {
  AIC.p = e.target.value;
  aiSave();
  aiUI();
});
$('ai_k').addEventListener('change', e => {
  AIC.k[AIC.p] = e.target.value.trim();
  aiSave();
});
$('ai_m').addEventListener('change', e => {
  AIC.m[AIC.p] = e.target.value.trim();
  aiSave();
});
$('ai_u').addEventListener('change', e => {
  AIC.u = e.target.value.trim().replace(/\/+$/, '');
  aiSave();
});
function aiJSON(txt) {
  const a = txt.indexOf('{'),
    b = txt.lastIndexOf('}');
  if (a < 0 || b < a) throw { code: 'bad' };
  return JSON.parse(txt.slice(a, b + 1));
}
async function aiCall(prompt) {
  const p = AIC.p,
    key = AIC.k[p] || '',
    model = AIC.m[p] || (AIP[p] || {}).m;
  if (p === 'builtin' && SAMPLE) return SAMPLE.json(prompt, { modelTier: 'default' });
  if (AIP[p] && AIP[p].k && !key) throw { code: 'nokey' };
  let r, j;
  if (p === 'claude') {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    });
    j = await r.json();
    if (!r.ok) throw { code: r.status === 429 ? 'rate_limited' : 'http', msg: j.error && j.error.message };
    return aiJSON((j.content || []).map(c => c.text || '').join(''));
  }
  if (p === 'gemini') {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    j = await r.json();
    if (!r.ok) throw { code: r.status === 429 ? 'rate_limited' : 'http', msg: j.error && j.error.message };
    return aiJSON(((j.candidates || [])[0]?.content?.parts || []).map(x => x.text || '').join(''));
  }
  const base = p === 'custom' ? AIC.u : 'https://api.openai.com/v1';
  if (!base) throw { code: 'nourl' };
  const h = { 'content-type': 'application/json' };
  if (key) h.authorization = 'Bearer ' + key;
  r = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      ...(p === 'openai' ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  j = await r.json();
  if (!r.ok) throw { code: r.status === 429 ? 'rate_limited' : 'http', msg: j.error && (j.error.message || j.error) };
  return aiJSON((j.choices || [])[0]?.message?.content || '');
}
(async () => {
  try {
    if (window.claude && window.claude.use) SAMPLE = await window.claude.use('sample');
  } catch (e) {}
  if (SAMPLE && !localStorage.getItem('luparis-ai')) AIC.p = 'builtin';
  aiUI();
})();
function cleanMon(v) {
  if (!v || typeof v !== 'object' || !v.n) return null;
  const cl = (x, a, b, d) => {
    x = Math.round(+x);
    return isFinite(x) ? Math.max(a, Math.min(b, x)) : d;
  };
  return {
    id: 'u' + Date.now().toString(36),
    n: String(v.n).slice(0, 60),
    type: TY[v.type] ? v.type : 'humanoid',
    fp: FPS.includes(String(v.fp)) ? String(v.fp) : '1',
    sz: SZK.includes(v.sz) ? v.sz : 'M',
    ca: cl(v.ca, 5, 30, 12),
    pv: cl(v.pv, 1, 999, 10),
    init: cl(v.init, -5, 15, 0),
    hab: Array.isArray(v.hab) ? v.hab.filter(h => B[h] && h !== 'gen') : [],
    no: String(v.no || '').slice(0, 600),
    desc: String(v.desc || '').slice(0, 2000),
    tr: (Array.isArray(v.tr) ? v.tr : [])
      .filter(x => Array.isArray(x) && x[0])
      .slice(0, 8)
      .map(x => [String(x[0]).slice(0, 60), String(x[1] || '').slice(0, 600)]),
    atk: (Array.isArray(v.atk) ? v.atk : [])
      .slice(0, 6)
      .map(
        a =>
          a && {
            n: String(a.n || '').slice(0, 40),
            k: cl(a.k, 1, 6, 1),
            ab: cl(a.ab, -5, 25, 0),
            nd: cl(a.nd, 1, 10, 1),
            dd: [4, 6, 8, 10, 12].includes(+a.dd) ? +a.dd : 6,
            mod: cl(a.mod, -5, 15, 0),
          },
      )
      .filter(a => a && a.n),
  };
}
function showCand() {
  const m = aiCand,
    v = conv(m);
  $('ai_msg').textContent = '';
  $('ai_out').innerHTML =
    `<div class="aiprev"><b>${esc(m.n)}</b> · ${esc(tyName(m.type))} · ${lang === 'fr' ? 'FP' : 'CR'} ${esc(m.fp)}<div class="small">${t('esq')} ${v.esq} · ${t('thr')} ${v.maj}/${v.sev} · ${t('box')} ${v.cases} (${m.pv} ${t('hp')}) · Init ${sgn(m.init)}</div>${(m.atk || []).length ? `<ul class="small">${m.atk.map(a => `<li><b>${esc(a.n)}</b>${a.k > 1 ? ' ×' + a.k : ''} ${sgn(a.ab)}, ${a.nd}d${a.dd}${a.mod ? sgn(a.mod) : ''}</li>`).join('')}</ul>` : ''}<p>${esc(m.no)}</p><div class="row"><button class="go" type="button" id="ai_add">${t('ai_add')}</button></div></div>`;
}
$('ai_go').onclick = async () => {
  const q = $('ai_q').value.trim();
  if (!q) return;
  const btn = $('ai_go');
  btn.disabled = true;
  $('ai_msg').textContent = t('ai_wait');
  $('ai_out').innerHTML = '';
  const L = lang === 'fr' ? 'French' : 'English';
  const prompt = `You convert a game master's description into one monster for "Luparis", a homebrew built on D&D 5.5. Write all text in ${L}.
Return ONLY a JSON object with these keys:
"n": the monster's name (use the name given, if any),
"type": one of ${JSON.stringify(Object.keys(TY))},
"fp": challenge rating, one of ${JSON.stringify(FPS)},
"sz": size, one of "T" (tiny), "S" (small), "M" (medium), "L" (large), "H" (huge), "G" (gargantuan),
"ca": D&D armor class (integer),
"pv": D&D hit points (integer),
"init": initiative bonus (integer, like a D&D Dexterity modifier),
"hab": array with zero or more of ${JSON.stringify(ORDER.filter(k => k !== 'gen'))},
"atk": array of its attacks, each {"n": name, "k": attacks per turn with it, "ab": attack bonus, "nd": number of damage dice, "dd": die size (4, 6, 8, 10 or 12), "mod": damage modifier},
"desc": 2 or 3 sentences describing its look, behavior and lore, for the game master to read aloud,
"tr": array of its special abilities as ["Name", "what it does, in Luparis terms (thresholds, boxes, Mastery, D&D conditions, DCs)"], 0 to 5 entries,
"no": short tactics note under 300 characters (not the attacks).
Luparis attacks: Mastery Tier 1 to 5 (Tier = 1 + CR ÷ 4.5, rounded, between 1 and 5); attack bonus = modifier + Tier + 1; damage = Tier × weapon die + modifier; weapon die d6 one-handed, d8 versatile in one hand, d10 versatile in two hands, d12 two-handed. Conditions are the D&D 5.5 conditions; no damage over time. Choose CR, AC and HP like a balanced official D&D monster of that concept.
Game master's description, between the markers: <<<${q}>>>`;
  if (AIC.p === 'copy') {
    aiLast = prompt;
    try {
      await navigator.clipboard.writeText(prompt);
      $('ai_msg').textContent = L2('Prompt copied.', 'Prompt copié.');
    } catch (e) {
      $('ai_r').value = prompt;
      $('ai_r').select();
      $('ai_msg').textContent = L2('Copy the selected text.', 'Copie le texte sélectionné.');
    }
    btn.disabled = false;
    return;
  }
  try {
    const v = await aiCall(prompt);
    const m = cleanMon(v);
    if (!m) throw { code: 'bad' };
    aiCand = m;
    showCand();
  } catch (e) {
    $('ai_msg').textContent =
      e && e.code === 'rate_limited'
        ? t('ai_rate')
        : e && e.code === 'not_granted'
          ? t('ai_denied')
          : e && e.code === 'nokey'
            ? L2('Enter your API key first.', "Entre d'abord ta clé API.")
            : e && e.code === 'nourl'
              ? L2('Enter the server URL.', "Entre l'URL du serveur.")
              : e && e.msg
                ? t('ai_fail') + ' (' + String(e.msg).slice(0, 140) + ')'
                : e instanceof TypeError
                  ? L2(
                      'Network error: the provider could not be reached (key, URL or CORS).',
                      'Erreur réseau : le fournisseur est injoignable (clé, URL ou CORS).',
                    )
                  : t('ai_fail');
  } finally {
    btn.disabled = false;
  }
};
let aiLast = '';
$('ai_imp').addEventListener('click', () => {
  try {
    const m = cleanMon(aiJSON($('ai_r').value));
    if (!m) throw 0;
    aiCand = m;
    showCand();
    $('ai_r').value = '';
  } catch (e) {
    $('ai_msg').textContent = L2('This answer is not a valid monster.', "Cette réponse n'est pas un monstre valide.");
  }
});
$('ai_out').addEventListener('click', e => {
  if (e.target.id === 'ai_add' && aiCand) {
    MON.push(aiCand);
    saveMon();
    fillSel();
    renderB();
    $('ai_out').innerHTML = '';
    $('ai_msg').textContent = t('ai_added');
    aiCand = null;
  }
});

Object.assign(T.en, {
  pl_search: 'Search',
  pl_search_ph: 'Name of an ally or a monster',
  pl_none: 'No match.',
  tk_ally: 'ally',
  tk_close: 'Close',
  tk_del: 'Remove from map',
  tk_simple: 'Simple token: no stats attached.',
});
Object.assign(T.fr, {
  pl_search: 'Rechercher',
  pl_search_ph: "Nom d'un allié ou d'un monstre",
  pl_none: 'Aucun résultat.',
  tk_ally: 'allié',
  tk_close: 'Fermer',
  tk_del: 'Retirer du plateau',
  tk_simple: 'Pion simple : aucune stat associée.',
});
function tokHp(k, dl) {
  if (!k || !k.hpMax) return;
  k.hp = Math.max(0, Math.min(k.hpMax, k.hp + dl));
  if (k.cid) {
    const ch = CH.list.find(c => c.id === k.cid);
    if (ch) {
      ch.used.hp = k.hpMax - k.hp;
      saveC();
      if (ch === C && CH.active) renderSheet();
    }
  }
  save();
  draw();
  renderTok();
}
function L2(en, fr) {
  return lang === 'fr' ? fr : en;
}
const lastInf = {};
let handId = null;
const HLOG = [];
try {
  handId = lsGet('luparis-hand', null);
} catch (e) {}
const FX = [
  [
    1,
    ['Reflex shield', 'Bouclier réflexe'],
    [
      'Reaction when an attack hits you: +2 Evasion per point until your next turn, this attack included',
      "Réaction quand une attaque te touche : +2 Esquive par point jusqu'à ton prochain tour, cette attaque comprise",
    ],
  ],
  [1, ['Pressed hit', 'Coup appuyé'], ['+1 box on a hit', '+1 case si le sort touche']],
  [1, ['Offset', 'Déport'], ['Cast from another point', 'Lancer depuis un autre point']],
  [
    1,
    ['Movement', 'Déplacement'],
    [
      'Non-instant movement of yourself or a target (flight, push of wind…)',
      "Déplacement non instantané de soi ou d'une cible (vol, poussée…)",
    ],
  ],
  [1, ['Light control', 'Contrôle léger'], ['Push 10 ft or slow', 'Repousser de 10 pieds ou ralentir']],
  [2, ['Multiply', 'Multiplication'], ['One more target (2 per target)', 'Une cible de plus (2 par cible)']],
  [
    2,
    ['Heavy control', 'Contrôle lourd'],
    ['Prone, grappled, restrained, blinded…', 'À terre, agrippé, entravé, aveuglé…'],
  ],
  [2, ['Persistence', 'Persistance'], ['Lasts 1 minute', 'Dure 1 minute']],
  [3, ['Major control', 'Contrôle majeur'], ['Stunned, paralyzed', 'Étourdi, paralysé']],
  [3, ['Area', 'Zone'], ['Everyone within 20 ft; half on a save', 'Tous dans 6 m ; moitié sur une réussite']],
];
const FXS = {
  horizon: [
    [
      2,
      ['Teleport (willing)', 'Téléportation consentante'],
      [
        'Instant: you or a willing target; Multiply for each extra person (a portal)',
        'Instantané : soi ou une cible consentante ; Multiplication par personne en plus (un portail)',
      ],
    ],
    [
      3,
      ['Teleport a foe', 'Téléporter un ennemi'],
      [
        'Instant, against an unwilling target: it makes a save',
        'Instantané, sur une cible non consentante : elle fait un jet de sauvegarde',
      ],
    ],
  ],
  creuset: [[1, ['Heal', 'Soin'], ['Target regains 1 box (1 per box)', 'La cible regagne 1 case (1 par case)']]],
  harmonie: [
    [1, ['Heal', 'Soin'], ['Target regains 1 box (1 per box)', 'La cible regagne 1 case (1 par case)']],
    [
      1,
      ['Song of rest', 'Chant de repos'],
      ['Out of combat: +1 box on a short rest', 'Hors combat : +1 case au repos court'],
    ],
  ],
  egide: [
    [
      2,
      ['Aegis ward', "Bouclier d'Égide"],
      ['An ally ignores the next box lost', 'Un allié ignore la prochaine case perdue'],
    ],
  ],
};
const MAN = [
  [1, ['Pressed hit', 'Coup appuyé'], ['+1 box on a hit', '+1 case si le coup touche']],
  [2, ['Cleave', 'Clive'], ['One more adjacent foe (2 per target)', 'Un ennemi adjacent de plus (2 par cible)']],
  [1, ['Charge', 'Charge ou bond'], ['Move before striking', 'Se déplacer avant de frapper']],
  [1, ['Lunge', 'Allonge'], ['Strike further', 'Frapper plus loin']],
  [1, ['Shove', 'Bousculer'], ['Push or break guard', 'Repousser, briser la garde']],
  [2, ['Disarm, trip', 'Désarmer, renverser'], ['Disarm, knock prone, immobilize', 'Désarmer, renverser, immobiliser']],
  [2, ['Stance', 'Posture tenue'], ['One effect held 1 minute', 'Un effet maintenu 1 minute']],
  [3, ['Whirlwind', 'Tourbillon'], ['All adjacent foes', 'Tous les ennemis adjacents']],
  [
    1,
    ['Extra intercept', 'Interception supplémentaire'],
    ['Intercept again this round', 'Intercepter encore ce round'],
  ],
  [3, ['Extra action', 'Action supplémentaire'], ['One more action this turn', 'Une action de plus ce tour']],
];
const handSel = {};
function fxFor(k) {
  const L = [...FX, ...(FXS[k] || [])].map(f => [...f]);
  const set = (fr, v, txt) => {
    const f = L.find(x => x[1][1] === fr);
    if (f) {
      f[0] = v;
      if (txt) f[2] = txt;
    }
  };
  if (k === 'mirage') {
    set('Contrôle lourd', 1);
    set('Contrôle majeur', 2);
  }
  if (k === 'eidolon') set('Persistance', 1);
  if (k === 'egide') {
    set("Bouclier d'Égide", 1);
    set('Bouclier réflexe', 1, [
      'Reaction when an attack hits you or an ally within 30 ft: +3 Evasion per point until your next turn',
      "Réaction quand une attaque te touche, toi ou un allié à 9 m : +3 Esquive par point jusqu'à ton prochain tour",
    ]);
  }
  if (k === 'creuset') set('Soin', 1, ['Target regains 2 boxes per point', 'La cible regagne 2 cases par point']);
  if (k === 'horizon') set('Déport', 0);
  if (k === 'harmonie') set('Multiplication', 1, ['One more target (1 per target)', 'Une cible de plus (1 par cible)']);
  return L;
}
function handChar() {
  const k = tokens.find(x => x.id === selTok && x.cid);
  const id = k ? k.cid : handId;
  return CH.list.find(c => c.id === id) || null;
}
function hRoll(h) {
  const c = handChar();
  pushRoll(h, (c && c.name) || '');
  renderHand();
}
function hAtk(name, ab) {
  const r = dRoll(20);
  return `${esc(name)} · d20 (${r}) ${sgn(ab)} = <b>${r + ab}</b>${r === 20 ? ` <span class="cr">${t('sk_crit')}</span>` : r === 1 ? ` <span class="ko">${t('sk_miss')}</span>` : ''}`;
}
function hDmg(name, n, d, mod) {
  const rs = Array.from({ length: n }, () => dRoll(d)),
    tot = rs.reduce((a, b) => a + b, 0) + mod;
  return `${esc(name)} · ${n}d${d}${mod ? sgn(mod) : ''} [${rs.join(', ')}] = <b>${tot}</b>`;
}
function trk(lbl, key, max, used) {
  const left = Math.max(0, max - used);
  return `<div class="htrk"><span>${lbl}</span><button type="button" data-ht="${key}" data-d="1" aria-label="${esc(lbl)} −">−</button><b>${left}/${max}</b><button type="button" data-ht="${key}" data-d="-1" aria-label="${esc(lbl)} +">+</button></div>`;
}
let pfOpen = true;
try {
  const v = localStorage.getItem('luparis-pf');
  if (v != null) pfOpen = JSON.parse(v);
} catch (e) {}
function pfSheet(c, D) {
  const ti = lang === 'fr' ? 1 : 0,
    a = ARM[c.armor] || ARM.none,
    sh = SHD[c.shield] || SHD.none,
    S = c.st || {},
    hd = lang === 'fr' ? T.fr.dmH : T.en.dm,
    Q = handSel[c.id + '_pf'] || (handSel[c.id + '_pf'] = { sf: -1, adv: 0 });
  const box = (k, v) => `<div class="pfb"><span>${k}</span><b>${v}</b></div>`;
  const mx = `<table class="pfmx"><tr><th></th>${DOM.map((d, i) => `<th>${hd[i]} <small>${sgn(S[d] || 0)}</small></th>`).join('')}</tr>${INT.map(
    (i, ii) =>
      `<tr><th>${T[lang].it[ii]} <small>${sgn(S[i] || 0)}</small></th>${DOM.map(d => {
        const k = i + '_' + d;
        return `<td><button type="button" data-pfr="${k}" title="${esc(cellName(k))} · ${esc(T[lang].hint[k])}">${sgn(c.cells[k] || 0)}</button></td>`;
      }).join('')}</tr>`,
  ).join('')}</table>`;
  const sfs = (c.sf || []).filter(f => f.r > 0 && f.n);
  const mods = `<div class="pfmods">${Q.sf >= 0 && c.sf[Q.sf] ? `<span class="pflab">${L2('Expertise', 'Savoir-faire')}</span><button type="button" class="chip on" data-pfs="${Q.sf}" aria-pressed="true">${esc(c.sf[Q.sf].n)} +${2 * c.sf[Q.sf].r}</button>` : ''}<span class="pflab">${L2('Roll', 'Jet')}</span><button type="button" class="chip${Q.adv === 1 ? ' on' : ''}" data-pfa="1" aria-pressed="${Q.adv === 1}">${L2('Advantage', 'Avantage')}</button><button type="button" class="chip${Q.adv === -1 ? ' on' : ''}" data-pfa="-1" aria-pressed="${Q.adv === -1}">${L2('Disadvantage', 'Désavantage')}</button></div><p class="small pfhint">${L2('Click a cell of the matrix to roll d20 + that cell (+ the chosen expertise).', 'Clique une case de la matrice pour lancer d20 + la case (+ le savoir-faire choisi).')}</p>`;
  const tk0 = tokens.find(k => k.cid === c.id),
    io = tk0 && INI.o.find(o => o.id === tk0.id),
    ip = io ? io.v : INIP[c.id],
    def = `<div class="pfst"><button type="button" class="pfb pfini" data-pfi="1" title="${L2('Roll initiative', "Lancer l'initiative")}"><span>${L2('Initiative', 'Initiative')} ${sgn(D.init)}</span><b>${ip != null ? ip : 'd20'}</b></button>${box(L2('Speed', 'Déplacement'), D.mv + ' ' + L2('tiles', 'cases'))}</div>`;
  const inv = c.inv || {},
    items = (inv.items || []).map(x => esc(x.n || '') + ((x.q || 1) > 1 ? ' ×' + x.q : '')).filter(Boolean),
    pots = POTS.filter(p => (inv.pot || {})[p[0]] > 0).map(p => `${esc(tr(p[1]))} ×${inv.pot[p[0]]}`),
    g = inv.gold || {};
  const gear = [
    `${esc(tr(a[0]))}${a[1] ? ' (' + a[1] + ')' : ''}${D.armOk ? '' : ' ⚠'}`,
    ...(c.shield !== 'none' ? [esc(tr(sh[0])) + (D.shdOk ? '' : ' ⚠')] : []),
    ...(c.weapons || []).map(w => esc(w.n)),
  ];
  return `<details class="pf"${pfOpen ? ' open' : ''}><summary>${L2('Character sheet', 'Fiche')} · ${esc(c.people || '')}${c.people ? ' · ' : ''}${L2('level', 'niveau')} ${D.L} · ${+c.xp || 0} XP${c.camp ? ' · ' + esc(c.camp) : ''}</summary><div class="pfg">
 <div>${mx}</div><div>${mods}${def}
 </div></div></details>`;
}
function talCards(c) {
  const ti = lang === 'fr' ? 1 : 0,
    out = [];
  for (const k in TAL) {
    const v = (c.tal || {})[k] || 0;
    if (!v) continue;
    const T = TAL[k];
    if (k === 'pact') {
      const P = PATR[c.patron],
        U = c.used || {},
        fm = favMax(c),
        dm = debtMax(c),
        db = c.debt || 0,
        due = db >= dm,
        fl = due ? 0 : Math.max(0, fm - (U.fav || 0));
      out.push(`<div class="hc k-tal"><div class="ht">${L2('Pact', 'Pacte')} · ${L2('rank', 'rang')} ${v}</div><div class="hn">${esc(c.patronN || (P ? P.n[ti] : L2('Entity', 'Entité')))}${P && c.patronN ? ` <span class="small">(${esc(P.n[ti])})</span>` : ''}</div><div class="hb">${L2('A Favor pays 2 Mana or 2 Stamina, gives +1 Mastery (before rolling) or calls a gift.', 'Une Faveur paie 2 Mana ou 2 Souffle, donne +1 Maîtrise (avant le jet) ou appelle un don.')}${
        P
          ? '<ul>' +
            P.g
              .slice(0, v)
              .map(x => `<li>${esc(x[ti])}</li>`)
              .join('') +
            '</ul>'
          : ''
      }</div><div class="pacm"><div class="pacl"><span>${L2('Favors', 'Faveurs')}</span><b>${fl}/${fm}</b></div><div class="favs">${Array.from({ length: fm }, (_, n) => `<i class="fav${n < fl ? ' on' : ''}"></i>`).join('')}</div>
  <div class="pacl"><span>${L2('Debt', 'Dette')}</span><b>${db}/${dm}</b></div><div class="debt${due ? ' due' : ''}">${Array.from({ length: dm }, (_, n) => `<i class="${n < db ? 'on' : ''}"></i>`).join('')}</div>${due ? `<div class="ko small">${L2('The entity calls in its due: a service to perform.', "L'entité réclame son dû : un service à rendre.")}</div>` : ''}</div><div class="hbt"><button type="button" class="go" data-hpf="1"${!fl ? ' disabled' : ''}>${L2('Spend a Favor', 'Dépenser une Faveur')}</button></div></div>`);
      continue;
    }
    out.push(
      `<div class="hc k-tal"><div class="ht">${L2('Talent', 'Talent')}${T.c.length > 1 ? ' · ' + L2('rank', 'rang') + ' ' + v : ''}</div><div class="hn">${esc(T.n[ti])}</div><div class="hb">${T.r
        .slice(0, v)
        .map(x => esc(x[ti]))
        .join('<br>')}</div></div>`,
    );
  }
  return out;
}
function hKey(h) {
  const m = /class="hc (k-[a-z]+)/.exec(h),
    cl = m ? m[1] : 'k';
  if (['k-def', 'k-man', 'k-inv', 'k-eq', 'k-sf', 'k-add', 'k-atk', 'k-note'].includes(cl)) return cl;
  const n = /<div class="hn">([\s\S]*?)<\/div>/.exec(h);
  return cl + ':' + (n ? n[1].replace(/<[^>]*>/g, '').trim() : '');
}
function hOrder(c, cards) {
  const L = cards.map(h => ({ k: hKey(h), h })),
    o = Array.isArray(c.corder) ? c.corder : [],
    ix = k => {
      const i = o.indexOf(k);
      return i < 0 ? 1e3 : i;
    };
  L.forEach((x, i) => (x.i = i));
  L.sort((a, b) => ix(a.k) - ix(b.k) || a.i - b.i);
  return L.map(x =>
    x.h
      .replace(/^<div class="hc /, `<div data-ck="${esc(x.k)}" class="hc ${FOLD['c:' + x.k] ? 'fold ' : ''}`)
      .replace(
        '<div class="ht">',
        `<div class="ht" data-htit="1" role="button" tabindex="0" aria-expanded="${!FOLD['c:' + x.k]}" title="${L2('Click to fold · hold and drag to move', 'Clic pour réduire · maintenir et glisser pour déplacer')}">`,
      ),
  );
}
function hSaveOrder(c) {
  const box = document.querySelector('#hand .hcards');
  if (!box) return;
  c.corder = [...box.children].map(x => x.dataset.ck).filter(Boolean);
  saveC();
}
function renderHand() {
  handGen++;
  const P = document.getElementById('hand');
  if (!P) return;
  const c = handChar();
  const sel = `<label class="hsel"><span>${L2('Character', 'Personnage')}</span><select id="h_ch"><option value="">—</option>${CH.list.map(x => `<option value="${esc(x.id)}"${c && c.id === x.id ? ' selected' : ''}>${esc(x.name || '?')}${x.camp ? ' · ' + esc(x.camp) : ''}</option>`).join('')}</select></label>`;
  if (!c) {
    P.innerHTML = `<div class="hhead"><h3>${L2('Ability cards', 'Cartes de capacités')}</h3>${sel}</div><p class="small">${L2('Pick a character, or select a character token on the map.', "Choisis un personnage, ou sélectionne le pion d'un personnage sur la carte.")}</p>`;
    return;
  }
  const D = derived(c),
    u = c.used || (c.used = { hp: 0, mana: 0, st: 0 }),
    manaL = D.mana - u.mana,
    stL = D.st - u.st;
  const cards = [];
  const shd = SHD[c.shield] || SHD.none;
  cards.push(
    `<div class="hc k-def"><div class="ht">${L2('Defense', 'Défense')}</div><div class="hn">${L2('Evasion', 'Esquive')} ${D.eva}</div><div class="hb">${L2('Armor', 'Armure')} ${esc(tr((ARM[c.armor] || ARM.none)[0]))} (${D.av})${D.armOk ? '' : ' ⚠'}<br>${L2('Thresholds', 'Seuils')} ${D.minor} / ${D.major} / ${D.severe}<br>${c.shield !== 'none' ? `${L2('Shield', 'Bouclier')} ${esc(tr(shd[0]))}${shd[1] ? ` (+${shd[1]} ${L2('Evasion', 'Esquive')})` : ''}${shd[2] != null ? ` · ${L2('Finesse capped at', 'Finesse plafonnée à')} +${shd[2]}` : ''}${c.shield === 'grand' || c.shield === 'pavois' ? `<br>${L2('Intercept: an attack on an adjacent ally targets your Evasion instead', 'Interception : une attaque contre un allié adjacent vise ton Esquive à la place')}` : ''}${D.shdOk ? '' : ` · <span class="ko">${L2('untrained: no bonus', 'sans entraînement : aucun bonus')}</span>`}` : `${L2('No shield', 'Pas de bouclier')}`}</div></div>`,
  );
  const WL = [];
  (c.weapons || []).forEach((w, i) => {
    const tier = c.fam[w.f] || 0,
      cellK = weaponCell(c, i),
      mod = tier,
      ab = (c.cells[cellK] || 0) + mb(tier),
      nd = Math.max(1, tier),
      dd = SZ[w.s] || 6;
    const srcs = [...Object.keys(SCH).filter(k => c.sch[k] > 0), ...((c.apex || 0) > 0 ? ['apex'] : [])],
      infK = handSel[c.id + '_inf' + i] || '',
      infOn = srcs.includes(infK) ? infK : '',
      srcN = k => (k === 'apex' ? 'Apex' : tr(SCH[k])),
      infT = infOn === 'apex' ? c.apex || 0 : infOn ? c.sch[infOn] : 0,
      infV = Math.min(infT, handSel[c.id + '_iv' + i] || 1),
      infD = infOn === 'apex' ? dd : SDIE[infOn] || 8,
      infP = infOn === 'apex' ? L2('Breath', 'Souffle') : 'Mana';
    const infH = srcs.length
      ? `<div class="inf"><label><span>${L2('Infusion', 'Infusion')}</span><select data-hinf="${i}"><option value="">—</option>${srcs.map(k => `<option value="${k}"${infOn === k ? ' selected' : ''}>${esc(srcN(k))}</option>`).join('')}</select></label>${infOn ? `<div class="fx">${Array.from({ length: infT }, (_, n) => `<button type="button" class="chip${infV === n + 1 ? ' on' : ''}" data-hiv="${i}" data-v="${n + 1}">${n + 1}</button>`).join('')}</div>` : ''}</div>`
      : '';
    WL.push(
      `<div class="wpn"><div class="wpt"><b>${esc(w.n)}</b> <span class="small">${esc(tr(FAM[w.f] ? FAM[w.f].n : ['', '']))}</span></div><div class="hb"><label class="wcell"><span class="small">${L2('Attack with', 'Attaque avec')}</span><select data-hcell="${i}" aria-label="${L2('Matrix cell for the attack', 'Case de la Matrice pour l’attaque')}">${CELLS.map(k => `<option value="${k}"${k === cellK ? ' selected' : ''}>${esc(cellName(k))} (${sgn(c.cells[k] || 0)})</option>`).join('')}</select></label> ${L2('Attack', 'Attaque')} <b>${sgn(ab)}</b> · ${L2('Damage', 'Dégâts')} <b>${nd}d${dd}${mod ? sgn(mod) : ''}</b>${infOn ? ` <b>+${infV}d${infD}</b> (${esc(srcN(infOn))}, ${infV} ${infP})` : ''}${tier ? '' : ` <span class="small">(${L2('untrained', 'sans maîtrise')})</span>`}</div>${weaponPassiveHTML(c, i, w, tier, true)}${infH}<div class="hbt"><button type="button" class="go" data-ha="atk" data-i="${i}">${L2('Attack', 'Attaque')}</button><button type="button" data-ha="dmg" data-i="${i}">${L2('Damage', 'Dégâts')}</button></div></div>`,
    );
  });
  if (WL.length)
    cards.push(
      `<div class="hc k-atk"><div class="ht">${L2('Weapons', 'Armes')}</div><div class="hn">${WL.length > 1 ? WL.length + ' ' + L2('weapons', 'armes') : L2('Weapon', 'Arme')}</div>${WL.join('')}</div>`,
    );
  const sMod = c.cells.P_men || 0;
  for (const k of Object.keys(SCH)) {
    const tier = c.sch[k] || 0;
    if (!tier) continue;
    const ab = sMod + mb(tier),
      list = fxFor(k),
      st = handSel[c.id + k] || (handSel[c.id + k] = new Set()),
      cost = [...st].reduce((s, i) => s + list[i][0], 0);
    cards.push(`<div class="hc k-spl"><div class="ht">${L2('Spell', 'Sort')} · Tier ${tier}</div><div class="hn">${esc(tr(SCH[k]))}</div><div class="hb">${L2('Attack', 'Attaque')} <b>${sgn(ab)}</b> · ${L2('Save DC', 'DD')} <b>${8 + ab}</b> · ${L2('Damage', 'Dégâts')} <b>${tier}d${SDIE[k] || 8}</b></div>
  <div class="fx">${list
    .map((f, i) => {
      const on = st.has(i),
        dis = !on && f[0] + cost > tier;
      return `<button type="button" class="chip${on ? ' on' : ''}" data-hf="${k}" data-i="${i}" title="${esc(tr(f[2]))}"${dis ? ' disabled' : ''}>${esc(tr(f[1]))} <b>${f[0]}</b></button>`;
    })
    .join('')}</div>
  <div class="hbt"><button type="button" class="go" data-ha="cast" data-k="${k}"${cost > manaL ? ' disabled' : ''}>${L2('Cast', 'Lancer')}${cost ? ` (${cost} ${L2('Mana', 'Mana')})` : ''}</button><button type="button" data-ha="sdmg" data-k="${k}">${L2('Damage', 'Dégâts')}</button></div></div>`);
  }
  const famT = Math.max(0, ...Object.values(c.fam));
  if (famT > 0 || D.st > 0) {
    const st = handSel[c.id + '_m'] || (handSel[c.id + '_m'] = new Set()),
      cost = [...st].reduce((s, i) => s + MAN[i][0], 0);
    cards.push(`<div class="hc k-man"><div class="ht">${L2('Maneuvers', 'Manœuvres')} · Tier ${famT}</div><div class="hn">${L2('Breath', 'Souffle')} ${stL}/${D.st}</div><div class="fx">${MAN.map(
      (f, i) => {
        const on = st.has(i),
          dis = !on && f[0] + cost > Math.max(famT, 1);
        return `<button type="button" class="chip${on ? ' on' : ''}" data-hm="${i}" title="${esc(tr(f[2]))}"${dis ? ' disabled' : ''}>${esc(tr(f[1]))} <b>${f[0]}</b></button>`;
      },
    ).join('')}</div>
  <div class="hbt"><button type="button" class="go" data-ha="man"${!cost || cost > stL ? ' disabled' : ''}>${L2('Use', 'Utiliser')}${cost ? ` (${cost} ${L2('Breath', 'Souffle')})` : ''}</button></div></div>`);
  }
  {
    const Q = handSel[c.id + '_pf'] || (handSel[c.id + '_pf'] = { sf: -1, adv: 0 }),
      sfs = (c.sf || []).map((f, i) => [f, i]).filter(([f]) => f.r > 0 && f.n);
    if (sfs.length)
      cards.push(
        `<div class="hc k-sf"><div class="ht">${L2('Expertise', 'Savoir-faire')}</div><div class="sfl">${sfs.map(([f, i]) => `<button type="button" class="${Q.sf === i ? 'on' : ''}" data-pfs="${i}" aria-pressed="${Q.sf === i}"><span>${esc(f.n)}</span><b>+${2 * f.r}</b></button>`).join('')}</div><p class="small">${L2('Pick one, then click a cell of the matrix: d20 + cell + expertise.', 'Choisis-en un, puis clique une case de la matrice : d20 + case + savoir-faire.')}</p></div>`,
      );
  }
  cards.push(...talCards(c), ...invCards(c));
  cards.push(
    `<div class="hc k-note"><div class="ht">${L2('Notes', 'Notes')}</div><div class="hn">${L2('Character notes', 'Notes du personnage')}</div><textarea class="hnote" data-hnotes="1" rows="7" placeholder="${L2('Same notes as on the character sheet.', 'Mêmes notes que sur la fiche du personnage.')}">${esc(c.notes || '')}</textarea></div>`,
  );
  (c.cards || []).forEach((x, i) =>
    cards.push(
      `<div class="hc k-cus"><div class="ht">${esc(x.k || L2('Feat', 'Don'))}</div><div class="hn">${esc(x.n)}</div><div class="hb">${esc(x.t).replace(/\n/g, '<br>')}</div><div class="hbt"><button type="button" data-ha="cdel" data-i="${i}" aria-label="${L2('Remove', 'Retirer')} ${esc(x.n)}">×</button></div></div>`,
    ),
  );
  cards.push(
    `<form class="hc k-add" id="h_add"><div class="ht">${L2('New card', 'Nouvelle carte')}</div><select id="h_ak"><option>${L2('Feat', 'Don')}</option><option>${L2('Item', 'Objet')}</option><option>${L2('Trait', 'Trait')}</option><option>${L2('Condition', 'État')}</option></select><input id="h_an" required maxlength="60" placeholder="${L2('Name', 'Nom')}"><textarea id="h_at" rows="3" maxlength="400" placeholder="${L2('What it does', 'Ce que ça fait')}"></textarea><div class="hbt"><button class="go" type="submit">${L2('Add', 'Ajouter')}</button></div></form>`,
  );
  P.innerHTML = `<div class="htop">${pfSheet(c, D)}<div class="hside"><h3>${esc(c.name || '?')} <span class="small">${L2('level', 'niveau')} ${D.L}</span></h3>${sel}${trk(L2('Vitality', 'Vitalité'), 'hp', D.hp, u.hp)}${D.mana ? trk('Mana', 'mana', D.mana, u.mana) : ''}${D.st ? trk(L2('Breath', 'Souffle'), 'st', D.st, u.st) : ''}</div></div>
 <div class="hcards">${hOrder(c, cards).join('')}</div>`;
}
document.getElementById('hand').addEventListener('submit', e => {
  const f = e.target;
  if (!f.dataset || !f.dataset.hadd) return;
  e.preventDefault();
  const c = handChar();
  if (!c) return;
  const v = invOf(c),
    sel = f.querySelector('select'),
    inp = f.querySelector('input');
  if (sel.value) v.pot[sel.value] = (v.pot[sel.value] || 0) + 1;
  if (inp.value.trim()) v.items.push({ n: inp.value.trim().slice(0, 60), q: 1, no: '' });
  if (!sel.value && !inp.value.trim()) return;
  saveC();
  if (c === C && CH.active) renderSheet();
  renderHand();
});
{
  let hDrag = null;
  const H0 = document.getElementById('hand');
  const hFold = card => {
    const k = 'c:' + card.dataset.ck;
    FOLD[k] = !FOLD[k];
    if (!FOLD[k]) delete FOLD[k];
    foldSave();
    card.classList.toggle('fold', !!FOLD[k]);
    const t2 = card.querySelector('[data-htit]');
    if (t2) t2.setAttribute('aria-expanded', String(!FOLD[k]));
  };
  H0.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-htit]');
    if (g && e.button === 0) {
      const cd = g.closest('[data-ck]');
      if (cd) cd.draggable = true;
    }
  });
  H0.addEventListener('pointerup', e => {
    const g = e.target.closest('[data-htit]');
    if (g && !hDrag) {
      const cd = g.closest('[data-ck]');
      if (cd) cd.draggable = false;
    }
  });
  H0.addEventListener('click', e => {
    const g = e.target.closest('[data-htit]');
    if (!g || e.target.closest('button,a,input,select,textarea,label')) return;
    const cd = g.closest('[data-ck]');
    if (cd) hFold(cd);
  });
  H0.addEventListener('keydown', e => {
    const g = e.target.closest && e.target.closest('[data-htit]');
    if (!g || e.target !== g) return;
    const cd = g.closest('[data-ck]');
    if (!cd) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hFold(cd);
    } else if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const box = cd.parentNode;
      if (e.key === 'ArrowLeft' && cd.previousElementSibling) box.insertBefore(cd, cd.previousElementSibling);
      else if (e.key === 'ArrowRight' && cd.nextElementSibling) box.insertBefore(cd.nextElementSibling, cd);
      const c = handChar();
      if (c) hSaveOrder(c);
      g.focus();
    }
  });
  H0.addEventListener('dragstart', e => {
    const cd = e.target.closest && e.target.closest('[data-ck]');
    if (!cd || !cd.draggable) return;
    hDrag = cd;
    cd.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', 'card');
    } catch (x) {}
  });
  H0.addEventListener('dragover', e => {
    if (!hDrag) return;
    e.preventDefault();
    const t2 = e.target.closest('[data-ck]');
    if (!t2 || t2 === hDrag || t2.parentNode !== hDrag.parentNode) return;
    const r = t2.getBoundingClientRect(),
      before = e.clientY < r.top + 8 || (e.clientY < r.bottom && e.clientX < r.left + r.width / 2);
    t2.parentNode.insertBefore(hDrag, before ? t2 : t2.nextSibling);
  });
  H0.addEventListener('dragend', () => {
    if (!hDrag) return;
    hDrag.classList.remove('dragging');
    hDrag.draggable = false;
    hDrag = null;
    const c = handChar();
    if (c) hSaveOrder(c);
  });
}
document.getElementById('hand').addEventListener('input', e => {
  if (!e.target.dataset || !e.target.dataset.hnotes) return;
  const c = handChar();
  if (!c) return;
  c.notes = e.target.value.slice(0, 5000);
  clearTimeout(window._hnT);
  window._hnT = setTimeout(() => {
    lsSet('luparis-chars', CH);
  }, 300);
  if (c === C) {
    const t2 = document.getElementById('c_notes');
    if (t2 && document.activeElement !== t2) t2.value = c.notes;
  }
});
document.getElementById('hand').addEventListener(
  'toggle',
  e => {
    if (e.target.classList && e.target.classList.contains('pf')) {
      pfOpen = e.target.open;
      lsSet('luparis-pf', pfOpen);
    }
  },
  true,
);
document.getElementById('hand').addEventListener('change', e => {
  if (e.target.dataset.hcell != null) {
    const c = handChar();
    if (!c) return;
    handSel[c.id + '_cell' + e.target.dataset.hcell] = e.target.value;
    renderHand();
    return;
  }
  if (e.target.dataset.hinf != null) {
    const c = handChar();
    if (!c) return;
    handSel[c.id + '_inf' + e.target.dataset.hinf] = e.target.value;
    handSel[c.id + '_iv' + e.target.dataset.hinf] = 1;
    renderHand();
    return;
  }
  if (e.target.id === 'h_ch') {
    handId = e.target.value || null;
    lsSet('luparis-hand', handId);
    selTok = null;
    if (typeof renderTok === 'function') renderTok();
    renderHand();
  }
});
document.getElementById('hand').addEventListener('submit', e => {
  if (e.target.id !== 'h_add') return;
  e.preventDefault();
  const c = handChar();
  if (!c) return;
  (c.cards || (c.cards = [])).push({
    k: $('h_ak').value,
    n: $('h_an').value.trim().slice(0, 60),
    t: $('h_at').value.slice(0, 400),
  });
  saveC();
  renderHand();
});
document.getElementById('hand').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const c = handChar();
  if (!c) return;
  const ds = b.dataset,
    D = derived(c),
    u = c.used;
  if (ds.ht) {
    const max = ds.ht === 'hp' ? D.hp : ds.ht === 'mana' ? D.mana : D.st;
    u[ds.ht] = Math.max(0, Math.min(max, u[ds.ht] + +ds.d));
    if (ds.ht === 'hp')
      for (const k of tokens)
        if (k.cid === c.id) {
          k.hp = D.hp - u.hp;
          save();
          draw();
        }
    saveC();
    renderHand();
    return;
  }
  if (ds.pfs != null) {
    const Q = handSel[c.id + '_pf'];
    Q.sf = Q.sf === +ds.pfs ? -1 : +ds.pfs;
    renderHand();
    return;
  }
  if (ds.pfa != null) {
    const Q = handSel[c.id + '_pf'];
    Q.adv = Q.adv === +ds.pfa ? 0 : +ds.pfa;
    renderHand();
    return;
  }
  if (ds.pfr) {
    const Q = handSel[c.id + '_pf'] || { sf: -1, adv: 0 },
      k = ds.pfr,
      cv = c.cells[k] || 0,
      f = Q.sf >= 0 && c.sf[Q.sf] && c.sf[Q.sf].r ? c.sf[Q.sf] : null,
      b = cv + (f ? 2 * f.r : 0),
      r1 = dRoll(20),
      r2 = Q.adv ? dRoll(20) : null,
      r = Q.adv === 1 ? Math.max(r1, r2) : Q.adv === -1 ? Math.min(r1, r2) : r1;
    hRoll(
      `${esc(cellName(k))}${f ? ' + ' + esc(f.n) : ''} · d20 (${r2 != null ? r1 + ', ' + r2 + ' → ' + r : r}) ${sgn(b)} = <b>${r + b}</b>${r === 20 ? ` <span class="cr">${t('sk_crit')}</span>` : r === 1 ? ` <span class="ko">${t('sk_miss')}</span>` : ''}`,
    );
    Q.sf = -1;
    Q.adv = 0;
    return;
  }
  if (ds.hfold) {
    const card = b.closest('[data-ck]');
    if (!card) return;
    const k = 'c:' + card.dataset.ck;
    FOLD[k] = !FOLD[k];
    if (!FOLD[k]) delete FOLD[k];
    foldSave();
    card.classList.toggle('fold', !!FOLD[k]);
    b.setAttribute('aria-expanded', String(!FOLD[k]));
    return;
  }
  if (ds.hmv) {
    const card = b.closest('[data-ck]'),
      box = card && card.parentNode;
    if (!card) return;
    if (+ds.hmv < 0 && card.previousElementSibling) box.insertBefore(card, card.previousElementSibling);
    else if (+ds.hmv > 0 && card.nextElementSibling) box.insertBefore(card.nextElementSibling, card);
    hSaveOrder(c);
    return;
  }
  if (ds.hinv) {
    invAct(c, ds);
    renderHand();
    return;
  }
  if (ds.pfi) {
    const r = dRoll(20),
      v = r + (+D.init || 0);
    INIP[c.id] = v;
    let upd = false;
    const tk = tokens.find(k => k.cid === c.id);
    if (tk && INI.o.length) {
      const o = INI.o.find(o => o.id === tk.id);
      if (o) {
        const cur = INI.o[INI.cur];
        o.v = v;
        iniSort();
        INI.cur = Math.max(0, INI.o.indexOf(cur));
        upd = true;
        save();
        draw();
      }
    }
    hRoll(
      `${L2('Initiative', 'Initiative')} · d20 (${r}) ${sgn(+D.init || 0)} = <b>${v}</b>${upd ? ' · ' + L2('updated in the fight', 'mis à jour dans le combat') : tk ? ' · ' + L2('used when the fight starts', 'utilisé au lancement du combat') : ''}`,
    );
    return;
  }
  if (ds.hpf) {
    const U = c.used;
    if ((c.debt || 0) >= debtMax(c) || (U.fav || 0) >= favMax(c)) return;
    U.fav = (U.fav || 0) + 1;
    c.debt = (c.debt || 0) + 1;
    saveC();
    if (c === C && CH.active) renderSheet();
    hRoll(`${L2('Favor spent', 'Faveur dépensée')} · ${L2('Debt', 'Dette')} ${c.debt}/${debtMax(c)}`);
    return;
  }
  if (ds.hf) {
    const st = handSel[c.id + ds.hf],
      i = +ds.i;
    st.has(i) ? st.delete(i) : st.add(i);
    renderHand();
    return;
  }
  if (ds.hiv != null) {
    handSel[c.id + '_iv' + ds.hiv] = +ds.v;
    renderHand();
    return;
  }
  if (ds.hm != null) {
    const st = handSel[c.id + '_m'],
      i = +ds.hm;
    st.has(i) ? st.delete(i) : st.add(i);
    renderHand();
    return;
  }
  if (ds.ha === 'atk' || ds.ha === 'dmg') {
    const i = +ds.i,
      w = c.weapons[i],
      ik0 = handSel[c.id + '_inf' + i] || '',
      dd = SZ[w.s] || 6;
    const ik = (ik0 === 'apex' ? (c.apex || 0) > 0 : ik0 && c.sch[ik0] > 0) ? ik0 : '',
      sn = ik === 'apex' ? 'Apex' : ik ? tr(SCH[ik]) : '',
      iT = ik === 'apex' ? c.apex : ik ? c.sch[ik] : 0,
      iv = Math.min(iT, handSel[c.id + '_iv' + i] || 1),
      iD = ik === 'apex' ? dd : SDIE[ik] || 8,
      key = c.id + '_' + i;
    if (ds.ha === 'atk') {
      let ex = '';
      delete lastInf[key];
      if (ik) {
        const pool = ik === 'apex' ? 'st' : 'mana',
          max = pool === 'st' ? D.st : D.mana,
          pn = pool === 'st' ? L2('Breath', 'Souffle') : 'Mana';
        if (u[pool] + iv > max) {
          hRoll(`${esc(w.n)} · ${L2('not enough', 'pas assez de')} ${pn} ${L2('to infuse', 'pour infuser')} (${iv})`);
          return;
        }
        u[pool] += iv;
        saveC();
        lastInf[key] = { sn, iv, iD };
        ex = ` · ${L2('infused', 'infusé')} (${esc(sn)} ${iv}) −${iv} ${pn}`;
      }
      hRoll(weaponAttack(c, i, null) + ex);
      return;
    }
    const li = lastInf[key];
    let h = weaponDamage(c, i);
    if (li) {
      h += ' · ' + hDmg(li.sn, li.iv, li.iD, 0);
      delete lastInf[key];
    }
    hRoll(h);
    return;
  }
  if (ds.ha === 'cast' || ds.ha === 'sdmg') {
    const k = ds.k,
      tier = c.sch[k],
      ab = (c.cells.P_men || 0) + mb(tier),
      list = fxFor(k),
      st = handSel[c.id + k],
      nm = tr(SCH[k]);
    if (ds.ha === 'sdmg') {
      hRoll(hDmg(nm, tier, SDIE[k] || 8, 0));
      return;
    }
    const cost = [...st].reduce((s, i) => s + list[i][0], 0);
    if (cost > D.mana - u.mana) return;
    u.mana += cost;
    const fx = [...st].map(i => tr(list[i][1])).join(', ');
    st.clear();
    saveC();
    hRoll(hAtk(nm, ab) + (cost ? ` · −${cost} Mana` : '') + (fx ? ` · ${esc(fx)}` : ''));
    return;
  }
  if (ds.ha === 'man') {
    const st = handSel[c.id + '_m'],
      cost = [...st].reduce((s, i) => s + MAN[i][0], 0);
    if (!cost || cost > D.st - u.st) return;
    u.st += cost;
    const fx = [...st].map(i => tr(MAN[i][1])).join(', ');
    st.clear();
    saveC();
    hRoll(`${esc(fx)} · −${cost} ${L2('Breath', 'Souffle')}`);
    return;
  }
  if (ds.ha === 'cdel') {
    c.cards.splice(+ds.i, 1);
    saveC();
    renderHand();
  }
});

const TKLOG = [],
  TKCRIT = {};
function parseAtk(txt) {
  const out = [],
    body = txt.replace(/^[^:]*?(Attacks?|Attaques?)\s*:\s*/i, '');
  const re = /([^·:;.,+\d][^·:;,+]*?)(?:\s*×\s*(\d+))?\s+([+-]\d+)\s*,\s*(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?/g;
  let m;
  while ((m = re.exec(body))) {
    out.push({
      n: m[1].trim().replace(/^(Attacks?|Attaques?)\s*:\s*/i, ''),
      k: +(m[2] || 1),
      ab: +m[3],
      nd: +m[4],
      dd: +m[5],
      mod: m[6] ? (m[6] === '-' ? -1 : 1) * +m[7] : 0,
    });
  }
  return out;
}
function renderTok() {
  renderHand();
  const P = document.getElementById('tk_panel');
  if (!P) return;
  const k = tokens.find(x => x.id === selTok);
  if (!k) {
    P.hidden = true;
    return;
  }
  P.hidden = false;
  const ch = k.cid ? CH.list.find(c => c.id === k.cid) : null,
    m = k.mid ? MON.find(x => x.id === k.mid) : null,
    name = k.nm ? tr(k.nm) + (k.num ? ' ' + k.num : '') : k.n;
  const st = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
  let h = `<h3>${esc(name)}</h3>`;
  if (!k.hpMax && !ch) {
    h += `<p class="small">${t('tk_simple')}</p>`;
  } else {
    h += `<div class="stats">${st(t('esq'), k.esq)}${st(t('thr'), k.maj + ' / ' + k.sev)}${st('Init', sgn(+k.init || 0))}</div>
  <div class="trk"><div><b>${t('sk_vit')}</b><div class="bar2 hp"><i style="width:${Math.round((100 * k.hp) / k.hpMax)}%"></i></div></div><div class="ctl"><button type="button" data-tkhp="-1" aria-label="${t('sk_vit')} −">−</button><span class="num">${k.hp} / ${k.hpMax}</span><button type="button" data-tkhp="1" aria-label="${t('sk_vit')} +">+</button></div></div>`;
    if (ch) {
      const D = derived(ch);
      for (const [key, lab, mx] of [
        ['mana', 'Mana', D.mana],
        ['st', t('sk_st'), D.st],
      ])
        if (mx)
          h += `<div class="trk"><div><b>${lab}</b></div><div class="ctl"><button type="button" data-tkres="${key}" data-d="-1" aria-label="${lab} −">−</button><span class="num">${mx - (ch.used[key] || 0)} / ${mx}</span><button type="button" data-tkres="${key}" data-d="1" aria-label="${lab} +">+</button></div></div>`;
      h += ch.weapons
        .map(w => {
          const tier = ch.fam[w.f] || 0,
            mod = ch.cells[FAM[w.f].c];
          return `<p class="tline"><b>${esc(w.n)}</b> · ${t('sk_attack')} ${sgn(mod + mb(tier))} · ${Math.max(1, tier)}d${SZ[w.s]}${tier ? sgn(tier) : ''}</p>`;
        })
        .join('');
      h += Object.keys(SCH)
        .filter(x => ch.sch[x])
        .map(x => {
          const tier = ch.sch[x],
            ab = ch.cells.P_men + mb(tier);
          return `<p class="tline"><b>${esc(tr(SCH[x]))}</b> · Tier ${tier} · ${t('sk_attack')} ${sgn(ab)} · ${tier}d${SDIE[x] || 8} · ${t('sk_dc')} ${8 + ab}</p>`;
        })
        .join('');
    }
    const no = m ? noT(m) : k.no;
    if (no) h += `<p class="tno">${esc(no)}</p>`;
    const MA = m ? monAtk(m) : parseAtk(no || '');
    if (MA.length)
      h +=
        `<div class="matks">${MA.map((a, i) => `<div class="matk"><span>${esc(a.n)}${a.k > 1 ? ' ×' + a.k : ''}</span><button type="button" class="go" data-ma="${i}" data-r="atk" aria-label="${esc(a.n)} : ${t('sk_attack')}">${sgn(a.ab)}</button><button type="button" data-ma="${i}" data-r="dmg" aria-label="${esc(a.n)} : ${t('sk_damage')}">${a.nd}d${a.dd}${a.mod ? sgn(a.mod) : ''}</button></div>`).join('')}</div>` +
        '';
    if (m)
      h += `<p class="small">${esc(tyName(m.type))} · ${lang === 'fr' ? 'FP' : 'CR'} ${esc(m.fp)} · ${m.pv} ${t('hp')}</p>`;
  }
  if (m)
    h += `<div class="row"><button type="button" data-tkact="sheet">${L2('Full monster sheet', 'Fiche complète du monstre')}</button></div>`;
  {
    const owner = ch
        ? L2('this character', 'ce personnage')
        : m
          ? L2('every token of this monster', 'tous les pions de ce monstre')
          : L2('this token', 'ce pion'),
      has = !!(k.img || (ch && ch.img) || (m && m.img));
    h += `<div class="tkimg"><label class="btnlike"><input type="file" accept="image/*" data-tkimg="1" hidden>${has ? L2('Change the image', "Changer l'image") : L2('Add an image', 'Ajouter une image')}</label>${has ? `<button type="button" data-tkact="noimg">${L2('Remove the image', "Retirer l'image")}</button>` : ''}<span class="small">${L2('for', 'pour')} ${owner}</span></div>`;
  }
  h += `<div class="row"><button type="button" data-tkact="del">${t('tk_del')}</button><button type="button" data-tkact="close">${t('tk_close')}</button></div>`;
  P.innerHTML = h;
}
$('tk_panel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const k = tokens.find(x => x.id === selTok);
  if (!k) return;
  if (b.dataset.ma != null) {
    const m = k.mid ? MON.find(x => x.id === k.mid) : null,
      a = (m ? monAtk(m) : parseAtk(k.no || ''))[+b.dataset.ma];
    if (!a) return;
    const nm = (k.nm ? tr(k.nm) + (k.num ? ' ' + k.num : '') : k.n) + ' · ' + a.n,
      key = k.id + '_' + b.dataset.ma;
    if (b.dataset.r === 'atk') {
      const r = dRoll(20),
        tot = r + a.ab;
      TKCRIT[key] = r === 20;
      pushRoll(
        `${esc(nm)} · d20 (${r}) ${sgn(a.ab)} = <b>${tot}</b>${r === 20 ? ` <span class="cr">${t('sk_crit')}</span>` : r === 1 ? ` <span class="ko">${t('sk_miss')}</span>` : ''}`,
      );
    } else {
      const n = TKCRIT[key] ? a.nd * 2 : a.nd,
        rs = Array.from({ length: n }, () => dRoll(a.dd)),
        tot = rs.reduce((x, y) => x + y, 0) + a.mod;
      TKCRIT[key] = false;
      pushRoll(`${esc(nm)} · ${n}d${a.dd}${a.mod ? sgn(a.mod) : ''} [${rs.join(', ')}] = <b>${tot}</b>`);
    }
    renderTok();
    return;
  }
  if (b.dataset.tkhp) tokHp(k, +b.dataset.tkhp);
  else if (b.dataset.tkres) {
    const ch = CH.list.find(c => c.id === k.cid);
    if (ch) {
      ch.used[b.dataset.tkres] = (ch.used[b.dataset.tkres] || 0) - +b.dataset.d;
      saveC();
      if (CH.active === ch.id) renderSheet();
      renderTok();
    }
  } else if (b.dataset.tkact === 'del') {
    snap();
    tokens = tokens.filter(x => x.id !== k.id);
    selTok = null;
    save();
    draw();
    renderTok();
  } else if (b.dataset.tkact === 'close') {
    selTok = null;
    renderTok();
  } else if (b.dataset.tkact === 'sheet') {
    const m = k.mid && MON.find(x => x.id === k.mid);
    if (m) monSheet(m, k);
  } else if (b.dataset.tkact === 'noimg') {
    const ch = k.cid && CH.list.find(c => c.id === k.cid),
      m = k.mid && MON.find(x => x.id === k.mid);
    delete k.img;
    if (ch) {
      delete ch.img;
      saveC();
    }
    if (m) {
      delete m.img;
      saveMon();
    }
    save();
    draw();
    renderTok();
  }
});
$('tk_panel').addEventListener('change', e => {
  if (!e.target.dataset || !e.target.dataset.tkimg || !e.target.files[0]) return;
  const k = tokens.find(x => x.id === selTok);
  if (!k) return;
  imgShrink(e.target.files[0], url => {
    const ch = k.cid && CH.list.find(c => c.id === k.cid),
      m = k.mid && MON.find(x => x.id === k.mid);
    if (ch) {
      ch.img = url;
      saveC();
    } else if (m) {
      m.img = url;
      saveMon();
    } else k.img = url;
    save();
    draw();
    renderTok();
  });
});
function renderRes() {
  const q = $('pl_q').value.trim().toLowerCase(),
    R = $('pl_res');
  if (!q) {
    R.innerHTML = '';
    return;
  }
  const al = CH.list
    .filter(c => (c.name || '').toLowerCase().includes(q))
    .slice(0, 4)
    .map(
      c =>
        `<button type="button" data-pa="${esc(c.id)}"><span>${esc(c.name || '?')}</span><small>${t('tk_ally')}${c.camp ? ' · ' + esc(c.camp) : ''}</small></button>`,
    );
  const mo = MON.filter(m => [].concat(m.n).join(' ').toLowerCase().includes(q))
    .sort((a, b) => fpNum(a.fp) - fpNum(b.fp))
    .slice(0, 8)
    .map(
      m =>
        `<button type="button" data-pm="${esc(m.id)}"><span>${esc(tr(m.n))}</span><small>${lang === 'fr' ? 'FP' : 'CR'} ${esc(m.fp)}</small></button>`,
    );
  R.innerHTML = al.concat(mo).join('') || `<p class="small">${t('pl_none')}</p>`;
}
$('pl_q').addEventListener('input', renderRes);
$('pl_q').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const b = $('pl_res').querySelector('button');
    if (b) b.click();
  }
});
$('pl_res').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.pa) {
    const ch = CH.list.find(c => c.id === b.dataset.pa);
    placing = { ally: ch.id, n: ch.name || '?' };
  } else {
    placing = MON.find(m => m.id === b.dataset.pm);
  }
  if (!placing) return;
  $('pl_q').value = '';
  renderRes();
  setTool('place');
});

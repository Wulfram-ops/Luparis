// ---- Play tab: a modular grid. Every panel (map, character, matrix, each card, initiative, token, markers,
// illustrations, GM notes) is a module that anyone can move by its title and resize by its corner.
// Presets lay the modules out; each module is as tall as its content, so none needs a scrollbar.
const PLAY_AUX = {
  in: ['Initiative', 'Initiative'],
  tk: ['Token', 'Pion'],
  mk: ['Markers / zones', 'Repères / zones'],
  img: ['Illustrations', 'Illustrations'],
  sn: ['GM notes', 'Notes MJ'],
};
const PLAY_LAYOUT_LABELS = {
  play_presets: ['Play layouts', 'Dispositions de jeu'],
  play_customize: ['Customize', 'Personnaliser'],
  play_map_short: ['Map', 'Carte'],
  play_map: ['Battle map', 'Carte tactique'],
  play_character: ['Character', 'Personnage'],
  play_tools: ['Table tools', 'Outils de table'],
  play_panels: ['Visible modules', 'Modules affichés'],
  play_restore: ['Reset layout', 'Rétablir le preset'],
  play_done: ['Done', 'Terminer'],
  play_terrain: ['Terrain', 'Terrain'],
  play_tk_title: ['Token', 'Pion'],
  play_tk_empty: ['Select a token on the map to see it here.', 'Sélectionne un pion sur la carte pour le voir ici.'],
  play_grid_hint: [
    'Drag a module by its title, resize it by its corner (double-click the corner to fit its content). Esc cancels a move.',
    'Glisse un module par son titre, redimensionne-le par son coin (double-clic sur le coin pour l’ajuster au contenu). Échap annule un déplacement.',
  ],
};
// Each preset: regions of the 12-column grid. An item is [module or 'prefix*', 'full' | 1, 'fit' | 'fill'].
// 'fill' makes the map as tall as the screen allows; everything else fits its content.
// Choices follow what players praise in the common VTTs: the map stays central with a sidebar on the right
// (Foundry, Roll20), the turn order stays in sight during a fight instead of hiding behind a tab
// (combat carousels), attacks are one click away next to the map (token action HUDs), and the
// character comes first when the table plays without a battle map.
const PLAY_PRESETS = {
  table: {
    label: ['Table', 'Table'],
    hint: [
      'Map with your character and the turn order on the side',
      'Carte avec ton personnage et l’ordre du tour sur le côté',
    ],
    reg: [
      { c: 1, w: 8, cols: 2, items: [['map', 'full', 'fill']], rest: true },
      { c: 9, w: 4, cols: 1, items: [['hero'], ['in'], ['c:k-atk'], ['c:k-def'], ['tk']] },
    ],
  },
  combat: {
    label: ['Combat', 'Combat'],
    hint: [
      'Turn order above the map, every action at hand',
      'Ordre du tour au-dessus de la carte, toutes les actions à portée',
    ],
    reg: [
      {
        c: 1,
        w: 9,
        cols: 3,
        items: [
          ['in', 'full'],
          ['map', 'full', 'fill'],
        ],
        rest: true,
      },
      {
        c: 10,
        w: 3,
        cols: 1,
        items: [['hero'], ['tk'], ['c:k-atk'], ['c:k-spl*'], ['c:k-man'], ['c:k-def'], ['c:k-rest']],
      },
    ],
  },
  explore: {
    label: ['Exploration', 'Exploration'],
    hint: [
      'Large map, checks, expertise and gear on the side',
      'Grande carte, tests, savoir-faire et équipement sur le côté',
    ],
    reg: [
      { c: 1, w: 9, cols: 3, items: [['map', 'full', 'fill']], rest: true },
      { c: 10, w: 3, cols: 1, items: [['hero'], ['mk'], ['c:k-sf'], ['pf'], ['c:k-inv'], ['c:k-eq']] },
    ],
    hide: ['in'],
  },
  prepare: {
    label: ['Preparation', 'Préparation'],
    hint: ['Map editor with markers, illustrations and notes', 'Éditeur de carte avec repères, illustrations et notes'],
    reg: [
      { c: 1, w: 9, cols: 3, items: [['map', 'full', 'fill']], rest: true },
      { c: 10, w: 3, cols: 1, items: [['mk'], ['tk'], ['img'], ['sn'], ['in']] },
    ],
    hide: ['hero', 'pf', 'c:*'],
    gm: true,
  },
};
// order of the modules that no region names
const GORDER = [
  'hero',
  'pf',
  'c:k-atk',
  'c:k-def',
  'c:k-spl',
  'c:k-man',
  'c:k-rest',
  'c:k-sf',
  'c:k-inv',
  'c:k-eq',
  'c:k-tal',
  'c:k-cus',
  'c:k-training',
  'c:k-note',
  'c:k-add',
  'in',
  'tk',
  'mk',
  'img',
  'sn',
];
const GCOLS = 12,
  GROW = 8,
  GGAP = 8,
  PLAY_GRID_KEY = 'luparis-play-grid-v1';
let playRole = '',
  playPreset = 'table',
  playSaved = {},
  playModeBeforePrep = null,
  GL = {},
  GHIDE = new Set(),
  playSizeQ = 0,
  gGrowQ = 0,
  gAct = null;
const playWorkspace = $('play_workspace'),
  playAux = $('play_aux'),
  playHand = $('hand');

// ---- modules
function gMods() {
  const m = new Map([['map', playWorkspace.querySelector('.play-map-column')]]);
  for (const p of playAux.querySelectorAll('.play-aux-pane')) m.set(p.dataset.playPane, p);
  for (const e of playHand.querySelectorAll(':scope > [data-gk]')) m.set(e.dataset.gk, e);
  for (const [k, e] of m) e.dataset.gk = k;
  return m;
}
const gEl = k => playWorkspace.querySelector(`[data-gk="${CSS.escape(k)}"]`);
const gMatch = (m, k) => (m.endsWith('*') ? k.startsWith(m.slice(0, -1)) : k === m);
const gOrd = k => {
  const i = GORDER.findIndex(o => k === o || k.startsWith(o + ':') || k.startsWith(o));
  return i < 0 ? 99 : i;
};
// modules a role may see; then the ones hidden in this preset
function gAllowed(k) {
  if (playRole === 'spectator') return k === 'map' || k === 'img';
  if (k === 'sn') return MP.role !== 'player';
  if (k === 'tk') return MP.role !== 'player' || !$('tk_panel').hidden;
  return true;
}
const gShown = k => gAllowed(k) && !GHIDE.has(k) && !!gEl(k);
function gLabel(k, e) {
  if (k === 'map') return tr(PLAY_LAYOUT_LABELS.play_map);
  if (k === 'hero') return tr(PLAY_LAYOUT_LABELS.play_character);
  if (k === 'pf') return L2('Check matrix', 'Matrice des tests');
  if (PLAY_AUX[k]) return tr(PLAY_AUX[k]);
  const t = e && e.querySelector('.ht, h4, h3');
  return (
    ((t && t.textContent.trim()) || k.slice(2)) +
    (e && e.querySelector('.hn') ? ' · ' + e.querySelector('.hn').textContent.trim() : '')
  );
}
const gHit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
const gWide = () => !TABLE_DISPLAY && window.innerWidth > 900;

// ---- the grid
function gApply() {
  const wide = gWide(),
    ord = Object.keys(GL)
      .filter(k => GL[k])
      .sort((a, b) => GL[a][1] - GL[b][1] || GL[a][0] - GL[b][0]);
  for (const [k, e] of gMods()) {
    const on = gShown(k);
    e.hidden = !on;
    const r = GL[k];
    if (wide && r) e.style.gridArea = `${r[1]} / ${r[0]} / span ${r[3]} / span ${r[2]}`;
    else e.style.gridArea = '';
    e.style.order = String(Math.max(0, ord.indexOf(k)));
    if (on && !e.querySelector(':scope > .gsz')) gHandles(e, k);
  }
}
function gHandles(e, k) {
  if (k === 'map')
    e.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="ggrip" title="${L2('Drag to move', 'Glisse pour déplacer')}" aria-label="${L2('Move the map', 'Déplacer la carte')}">⠿</button>`,
    );
  e.insertAdjacentHTML(
    'beforeend',
    `<div class="gsz" title="${L2('Drag to resize · double-click to fit', 'Glisse pour redimensionner · double-clic pour ajuster')}" aria-hidden="true"></div>`,
  );
}
const gRows = px => Math.max(3, Math.ceil((px + GGAP) / GROW));
// rows a module needs to show all its content, measured at its natural height
function gFit(k) {
  const e = gEl(k);
  if (!e || k === 'map') return GL[k] ? GL[k][3] : 10;
  const a = e.style.alignSelf,
    h = e.style.height;
  e.style.alignSelf = 'start';
  e.style.height = 'auto';
  const n = gRows(e.offsetHeight);
  e.style.alignSelf = a;
  e.style.height = h;
  return n;
}
// rows needed when the content overflows the module now
function gNeed(k) {
  const e = gEl(k);
  if (!e || k === 'map' || !GL[k]) return GL[k] ? GL[k][3] : 10;
  if (e.scrollHeight <= e.clientHeight + 1) return GL[k][3];
  return gRows(e.scrollHeight + e.offsetHeight - e.clientHeight);
}
// preview while dragging: the held module takes its spot, the modules it touches go down just enough
function gPush(snap, k, n) {
  const out = {};
  for (const o in snap) out[o] = [...snap[o]];
  out[k] = n;
  const placed = [k];
  for (const o of Object.keys(snap)
    .filter(o => o !== k && gShown(o))
    .sort((a, b) => snap[a][1] - snap[b][1] || snap[a][0] - snap[b][0])) {
    const r = out[o];
    while (placed.some(d => gHit(r, out[d]))) r[1]++;
    placed.push(o);
  }
  return out;
}
// a module whose content grew gets taller, so nothing ever scrolls inside it
function gGrow() {
  if (!gWide() || gAct || $('v-carte').hidden) return;
  let changed = false;
  for (const k of Object.keys(GL).filter(gShown)) {
    if (k === 'map') continue;
    const need = gNeed(k);
    if (need > GL[k][3]) {
      GL = gPush(GL, k, [GL[k][0], GL[k][1], GL[k][2], need]);
      changed = true;
    }
  }
  if (changed) {
    gApply();
    gStore();
  }
}
const gGrowSoon = () => {
  if (gGrowQ) return;
  gGrowQ = requestAnimationFrame(() => {
    gGrowQ = 0;
    gGrow();
  });
};
// a module not in the layout yet (new card, new character): under the others of the main region
function gAddMissing() {
  const P = PLAY_PRESETS[playPreset],
    R = P.reg.find(r => r.rest) || P.reg[0],
    sw = Math.max(2, Math.floor(R.w / R.cols)),
    added = [];
  for (const [k] of gMods())
    if (!GL[k] && gAllowed(k)) {
      // the shortest column of the main region
      let best = null;
      for (let c = R.c; c + sw <= R.c + R.w; c += sw) {
        const y = Math.max(
          1,
          ...Object.keys(GL)
            .filter(o => gShown(o) && GL[o][0] < c + sw && c < GL[o][0] + GL[o][2])
            .map(o => GL[o][1] + GL[o][3]),
        );
        if (!best || y < best[1]) best = [c, y];
      }
      GL[k] = [best[0], best[1], sw, 4];
      added.push(k);
    }
  if (!added.length) return false;
  gApply();
  for (const k of added) if (gShown(k)) GL = gPush(GL, k, [...GL[k].slice(0, 3), gFit(k)]);
  gApply();
  gStore();
  return true;
}

// ---- presets
function gAvailRows(extra = 0) {
  const top = playWorkspace.getBoundingClientRect().top + window.scrollY;
  return Math.max(48, Math.floor((window.innerHeight - top - 12) / GROW) - extra);
}
function gBuild(id) {
  const P = PLAY_PRESETS[id],
    mods = gMods(),
    keys = [...mods.keys()].filter(gShown),
    out = {},
    used = new Set(),
    plan = [];
  for (const R of P.reg) {
    const sw = Math.floor(R.w / R.cols),
      list = [];
    for (const [m, span, h] of R.items)
      for (const k of keys.filter(k => !used.has(k) && gMatch(m, k)).sort((a, b) => gOrd(a) - gOrd(b))) {
        used.add(k);
        list.push({ k, full: span === 'full' || R.cols === 1, fill: h === 'fill' });
      }
    plan.push({ R, sw, list });
  }
  const rest = plan.find(p => p.R.rest) || plan[0];
  for (const k of keys.filter(k => !used.has(k)).sort((a, b) => gOrd(a) - gOrd(b)))
    rest.list.push({ k, full: rest.R.cols === 1, fill: false });
  // measure every module at its width
  for (const { R, sw, list } of plan) for (const it of list) out[it.k] = [R.c, 1, it.full ? R.w : sw, 4];
  for (const k in GL) if (!out[k]) out[k] = [...GL[k]];
  GL = out;
  playWorkspace.classList.add('g-measure');
  gApply();
  const need = {};
  for (const { list } of plan) for (const it of list) need[it.k] = it.k === 'map' ? 0 : gRows(gEl(it.k).offsetHeight);
  playWorkspace.classList.remove('g-measure');
  // masonry: full-width items span the region, the others go to the shortest column
  for (const { R, sw, list } of plan) {
    const hs = Array(R.cols).fill(1);
    const above = list
      .filter(it => !it.fill && list.indexOf(it) < list.findIndex(x => x.fill))
      .reduce((s, it) => s + need[it.k], 0);
    for (const it of list) {
      const h = it.fill ? gAvailRows(above) : need[it.k];
      if (it.full) {
        const y = Math.max(...hs);
        GL[it.k] = [R.c, y, R.w, h];
        hs.fill(y + h);
      } else {
        const i = hs.indexOf(Math.min(...hs));
        GL[it.k] = [R.c + i * sw, hs[i], sw, h];
        hs[i] += h;
      }
    }
  }
  gApply();
}

// ---- storage: one layout per role and preset
function gStore() {
  const all = lsGet(PLAY_GRID_KEY, {}) || {};
  const me = (all[playRole] = all[playRole] || {});
  me.preset = playPreset;
  me.lay = me.lay || {};
  me.lay[playPreset] = { GL, hide: [...GHIDE] };
  lsSet(PLAY_GRID_KEY, all);
}
function gLoadPreset(id, reset) {
  const all = lsGet(PLAY_GRID_KEY, {}) || {},
    s = !reset && all[playRole] && all[playRole].lay && all[playRole].lay[id];
  if (s && s.GL && typeof s.GL === 'object') {
    GL = {};
    for (const k in s.GL) {
      const r = s.GL[k];
      if (Array.isArray(r) && r.length === 4 && r.every(n => Number.isInteger(n) && n > 0))
        GL[k] = [Math.min(r[0], GCOLS), r[1], Math.min(r[2], GCOLS), r[3]];
    }
    GHIDE = new Set(Array.isArray(s.hide) ? s.hide : []);
    gApply();
    gAddMissing();
    gApply();
  } else {
    const keys = [...gMods().keys()];
    GHIDE = new Set(keys.filter(k => (PLAY_PRESETS[id].hide || []).some(m => gMatch(m, k))));
    GL = {};
    gBuild(id);
    gStore();
  }
  gGrowSoon();
}

function playPresetAllowed(key) {
  if (!Object.hasOwn(PLAY_PRESETS, key)) return false;
  if (playRole === 'spectator') return key === 'explore';
  return !(playRole === 'player' && PLAY_PRESETS[key].gm);
}
function playApplyLayout() {
  playWorkspace.dataset.preset = playPreset;
  for (const button of $('play_presets').querySelectorAll('[data-play-preset]')) {
    button.hidden = !playPresetAllowed(button.dataset.playPreset);
    button.setAttribute('aria-pressed', String(button.dataset.playPreset === playPreset));
  }
  for (const option of $('play_preset_select').options) {
    option.hidden = !playPresetAllowed(option.value);
    option.disabled = option.hidden;
  }
  $('play_preset_select').value = playPreset;
  gApply();
  for (const b of document.querySelectorAll('#v-carte [data-play-jump]')) {
    const t = gJumpTarget(b.dataset.playJump);
    b.hidden = !t || t.hidden;
  }
  playFit();
}
function playUsePreset(key, reset) {
  if (!playPresetAllowed(key)) return;
  if (key === 'prepare' && playPreset !== 'prepare') {
    playModeBeforePrep = document.body.classList.contains('mode-edit') ? 'edit' : 'play';
    setMode('edit', false);
  } else if (key !== 'prepare' && playModeBeforePrep) {
    if (document.body.classList.contains('mode-edit')) setMode(playModeBeforePrep, false);
    playModeBeforePrep = null;
  }
  playPreset = key;
  gLoadPreset(key, reset);
  playApplyLayout();
  gStore();
}
function gJumpTarget(id) {
  if (id === 'hand') return gEl('hero');
  if (id === 'play_aux') return ['in', 'tk', 'mk', 'img', 'sn'].map(gEl).find(e => e && !e.hidden) || null;
  return $(id);
}
function playLabels() {
  for (const node of document.querySelectorAll('[data-play-i18n]'))
    node.textContent = tr(PLAY_LAYOUT_LABELS[node.dataset.playI18n]);
  $('play_presets').setAttribute('aria-label', tr(PLAY_LAYOUT_LABELS.play_presets));
  $('play_presets').innerHTML = Object.entries(PLAY_PRESETS)
    .map(
      ([key, p]) =>
        `<button type="button" data-play-preset="${key}" title="${esc(tr(p.hint))}">${tr(p.label)}</button>`,
    )
    .join('');
  $('play_preset_select').setAttribute('aria-label', tr(PLAY_LAYOUT_LABELS.play_presets));
  $('play_preset_select').replaceChildren(
    ...Object.entries(PLAY_PRESETS).map(([key, p]) => new Option(tr(p.label), key)),
  );
  // table modules carry the same small family line as the character cards
  for (const p of playAux.querySelectorAll('.play-aux-pane')) p.dataset.fam = L2('Table', 'Table');
  $('mode_play').textContent = L2('Play', 'Partie');
  $('mode_edit').textContent = L2('Edit', 'Édition');
  for (const [k, e] of gMods()) {
    const s = e.querySelector(':scope > .gsz');
    if (s)
      s.title = L2('Drag to resize · double-click to fit', 'Glisse pour redimensionner · double-clic pour ajuster');
    if (k === 'map')
      e.querySelector(':scope > .ggrip')?.setAttribute('title', L2('Drag to move', 'Glisse pour déplacer'));
  }
  if (!TABLE_DISPLAY) playApplyLayout();
  document.dispatchEvent(new Event('play-labels'));
}
// the map module keeps the height the layout gives it; the page itself scrolls if the layout is taller
function playFit() {
  if (TABLE_DISPLAY || $('v-carte').hidden || playSizeQ) return;
  playSizeQ = requestAnimationFrame(() => {
    playSizeQ = 0;
    gGrow();
  });
}
function playSync() {
  if (TABLE_DISPLAY) return;
  const role = MP.role === 'player' ? (MP.prole === 'spec' ? 'spectator' : 'player') : 'table';
  if (role !== playRole) {
    playRole = role;
    const saved = (lsGet(PLAY_GRID_KEY, {}) || {})[role] || {};
    playPreset = '';
    playUsePreset(playPresetAllowed(saved.preset) ? saved.preset : role === 'spectator' ? 'explore' : 'table');
    return;
  }
  gApply();
  gGrowSoon();
}
// the sheet becomes modules: character header, matrix, then one module per card
function playArrangeHand() {
  const top = playHand.querySelector(':scope > .htop'),
    cards = playHand.querySelector(':scope > .hcards');
  if (top && cards) {
    const hero = top.querySelector('.hside'),
      pf = top.querySelector('.pf');
    if (hero) hero.dataset.gk = 'hero';
    if (pf) pf.dataset.gk = 'pf';
    for (const c of cards.children)
      c.dataset.gk = 'c:' + (c.dataset.ck || [...c.classList].find(x => x.startsWith('k-')) || 'card');
    playHand.replaceChildren(...[hero, pf, ...cards.children].filter(Boolean));
  } else if (!playHand.querySelector(':scope > [data-gk]')) {
    const box = document.createElement('div');
    box.className = 'play-hero-empty';
    box.dataset.gk = 'hero';
    box.append(...playHand.childNodes);
    playHand.replaceChildren(box);
  }
}
// ---- customize: which modules this preset shows
function gCustomize() {
  const box = $('play_modules');
  box.innerHTML = [...gMods()]
    .filter(([k]) => gAllowed(k))
    .sort(([a], [b]) => (a === 'map' ? -1 : b === 'map' ? 1 : gOrd(a) - gOrd(b)))
    .map(
      ([k, e]) =>
        `<label><input type="checkbox" data-gmod="${esc(k)}"${GHIDE.has(k) ? '' : ' checked'}${k === 'map' ? ' disabled' : ''}><span>${esc(gLabel(k, e))}</span></label>`,
    )
    .join('');
  $('play_layout_dialog').showModal();
}

{
  const originalHand = renderHand;
  renderHand = function () {
    const character = handChar()?.id || '';
    const sameCharacter = playHand.dataset.character === character;
    const openWeapons = sameCharacter
      ? [...playHand.querySelectorAll('[data-weapon][open]')].map(e => e.dataset.weapon)
      : [];
    const active = document.activeElement;
    const focusAttrs =
      sameCharacter && playHand.contains(active) && active.matches('button,select')
        ? [...active.attributes].filter(a => a.name === 'id' || a.name.startsWith('data-'))
        : [];
    originalHand.apply(this, arguments);
    playHand.dataset.character = character;
    playArrangeHand();
    for (const d of playHand.querySelectorAll('[data-weapon]')) d.open = openWeapons.includes(d.dataset.weapon);
    if (focusAttrs.length) {
      const match = [...playHand.querySelectorAll(active.tagName)].find(el =>
        focusAttrs.every(a => el.getAttribute(a.name) === a.value),
      );
      match?.focus({ preventScroll: true });
    }
    if (playWorkspace.dataset.ready && !TABLE_DISPLAY) {
      if (!gAddMissing()) gApply();
      gGrowSoon();
    }
  };
  const originalTok = renderTok;
  renderTok = function () {
    const r = originalTok.apply(this, arguments);
    if (playWorkspace.dataset.ready && !TABLE_DISPLAY) {
      gApply();
      gGrowSoon();
    }
    return r;
  };
  $('v-carte').addEventListener('click', e => {
    const b = e.target.closest('[data-play-jump]');
    if (!b) return;
    const target = gJumpTarget(b.dataset.playJump);
    if (!target || target.hidden) return;
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  });
  $('play_presets').addEventListener('click', e => {
    const b = e.target.closest('[data-play-preset]');
    if (!b || b.dataset.playPreset === playPreset) return;
    playUsePreset(b.dataset.playPreset);
  });
  $('play_preset_select').onchange = e => playUsePreset(e.target.value);
  $('play_customize').onclick = gCustomize;
  $('play_layout_dialog').addEventListener('change', e => {
    const c = e.target.closest('[data-gmod]');
    if (!c) return;
    const k = c.dataset.gmod;
    if (c.checked) GHIDE.delete(k);
    else GHIDE.add(k);
    if (c.checked) {
      // a module shown again finds room where it was, pushing the others down
      gApply();
      if (GL[k]) GL = gPush(GL, k, [...GL[k].slice(0, 3), Math.max(GL[k][3], gFit(k))]);
    }
    gApply();
    gStore();
    gGrowSoon();
  });
  $('play_restore').onclick = () => {
    playUsePreset(playPreset, true);
    gCustomize();
  };
  $('pl_toggle').onclick = () => {
    const open = $('pl_bar').classList.toggle('open');
    $('pl_toggle').setAttribute('aria-expanded', String(open));
    if (open) $('pl_q').focus({ preventScroll: true });
  };
  $('map_fields_toggle').onclick = () => {
    const open = $('map_fields').classList.toggle('open');
    $('map_fields_toggle').setAttribute('aria-expanded', String(open));
  };
  // ---- move by the title, resize by the corner
  const cell = (x, y) => {
    const r = playWorkspace.getBoundingClientRect(),
      cw = (r.width - GGAP * (GCOLS - 1)) / GCOLS;
    return { c: Math.floor((x - r.left + GGAP / 2) / (cw + GGAP)) + 1, r: Math.floor((y - r.top) / GROW) + 1, cw };
  };
  const handle = t => {
    const g = t.closest('.ggrip, .gsz');
    if (g) return g;
    const h = t.closest('h3, h4, .ht, .hn, .play-identity');
    if (!h || t.closest('button, input, select, textarea, a, label, summary, details')) return null;
    return h.closest('[data-gk]') ? h : null;
  };
  playWorkspace.addEventListener(
    'pointerdown',
    e => {
      if (e.button || !gWide()) return;
      const g = handle(e.target);
      if (!g) return;
      const m = g.closest('[data-gk]'),
        k = m.dataset.gk;
      if (!GL[k]) return;
      e.preventDefault();
      g.setPointerCapture(e.pointerId);
      const p = cell(e.clientX, e.clientY);
      gAct = { k, m, size: g.classList.contains('gsz'), p0: p, r0: [...GL[k]], snap: JSON.parse(JSON.stringify(GL)) };
      m.classList.add('gdrag');
      playWorkspace.style.setProperty('--gcw', p.cw + GGAP + 'px');
      playWorkspace.classList.add('gon');
    },
    true,
  );
  playWorkspace.addEventListener('pointermove', e => {
    if (!gAct) return;
    const p = cell(e.clientX, e.clientY),
      dc = p.c - gAct.p0.c,
      dr = p.r - gAct.p0.r,
      [c0, r0, w0, h0] = gAct.r0,
      n = gAct.size
        ? [c0, r0, Math.max(2, Math.min(GCOLS - c0 + 1, w0 + dc)), Math.max(4, h0 + dr)]
        : [Math.max(1, Math.min(GCOLS - w0 + 1, c0 + dc)), Math.max(1, r0 + dr), w0, h0];
    // the others make room as a preview; nothing is kept until the button is released
    GL = gPush(gAct.snap, gAct.k, n);
    gApply();
  });
  const end = keep => {
    if (!gAct) return;
    const { k, m } = gAct;
    if (!keep) GL = gAct.snap;
    gAct = null;
    m.classList.remove('gdrag');
    playWorkspace.classList.remove('gon');
    gApply();
    // a module never ends up shorter than its content
    if (keep && k !== 'map' && gFit(k) > GL[k][3]) GL = gPush(GL, k, [...GL[k].slice(0, 3), gFit(k)]);
    gApply();
    gStore();
  };
  playWorkspace.addEventListener('pointerup', () => end(true));
  playWorkspace.addEventListener('pointercancel', () => end(false));
  document.addEventListener(
    'keydown',
    e => {
      if (gAct && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        end(false);
      }
    },
    true,
  );
  // double-click the corner: the module takes exactly the height of its content
  playWorkspace.addEventListener('dblclick', e => {
    const g = e.target.closest('.gsz');
    if (!g || !gWide()) return;
    const k = g.closest('[data-gk]').dataset.gk;
    if (k === 'map' || !GL[k]) return;
    GL[k][3] = gFit(k);
    gApply();
    gStore();
  });
  // content that changes (a roll, a new item, an image) may need more room
  new MutationObserver(() => {
    if (!gAct) gGrowSoon();
  }).observe(playWorkspace, { childList: true, subtree: true, characterData: true });
  playWorkspace.addEventListener('load', gGrowSoon, true);
  playWorkspace.addEventListener('toggle', gGrowSoon, true);
  window.addEventListener('resize', () => {
    gApply();
    gGrowSoon();
  });
  window.addEventListener('hashchange', () => setTimeout(playFit, 0));
  playWorkspace.dataset.ready = '1';
  playLabels();
  renderHand();
  playSync();
  playFit();
}
// Keep receiving map updates in a display opened by an older version.
function gDisplayBoot() {
  if (!TABLE_DISPLAY) return;
  document.body.classList.add('mp-player', 'mp-spec');
  const button = document.createElement('button');
  button.className = 'table-fullscreen';
  button.textContent = L2('Fullscreen', 'Plein écran');
  button.onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  document.body.append(button);
  document.addEventListener(
    'keydown',
    e => {
      if (!['Escape', 'F11', 'Tab'].includes(e.key)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== window.opener || e.data?.type !== 'luparis-table-state') return;
    const n = N,
      first = !document.body.classList.contains('table-ready');
    if (!applyState(e.data.state)) return;
    document.body.classList.add('table-ready');
    if (first || n !== N) {
      CAM.z = 1;
      CAM.px = 0;
      CAM.py = 0;
    }
    layout();
  });
  if (window.opener) window.opener.postMessage({ type: 'luparis-table-ready' }, location.origin);
}

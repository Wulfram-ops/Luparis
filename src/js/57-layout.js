// ---- the Map page is a grid: every module (map, panels, each character card) can be moved and resized, snapped to it.
// Each person keeps their own layout in their browser. Narrow screens fall back to one column.
const GCOLS = 12,
  GROW = 36,
  GGAP = 8;
const GDEF = {
  map: [1, 1, 9, 18],
  pf: [1, 19, 9, 9],
  hhead: [1, 19, 9, 3],
  tk: [10, 1, 3, 7],
  pl: [10, 8, 3, 7],
  in: [10, 15, 3, 9],
  mk: [10, 24, 3, 7],
  mp: [10, 31, 3, 9],
  img: [10, 40, 3, 8],
  sn: [10, 48, 3, 8],
};
const GNAME = {
  map: ['Map', 'Carte'],
  pf: ['Character sheet', 'Fiche'],
  hhead: ['Ability cards', 'Cartes de capacités'],
  tk: ['Selected token', 'Token choisi'],
  pl: ['Quick place', 'Placement rapide'],
  in: ['Initiative', 'Initiative'],
  mk: ['Landmarks', 'Repères'],
  mp: ['Multiplayer', 'Partie à plusieurs'],
  img: ['Images', 'Images'],
  sn: ['Session notes', 'Notes de séance'],
};
let GL = {};
// a character card (defense, weapons, a school…) gets its own place, under the map by default
function gDefault(k) {
  if (GDEF[k]) return [...GDEF[k]];
  const n = Object.keys(GL).filter(x => x.startsWith('c:')).length;
  return [1 + (n % 3) * 3, 29 + Math.floor(n / 3) * 10, 3, 10];
}
function gLoad() {
  const v = lsGet('luparis-grid2', null) || {},
    o = {};
  for (const k of new Set([...Object.keys(GDEF), ...Object.keys(v)])) {
    const a = Array.isArray(v[k]) && v[k].length === 4 && v[k].every(n => Number.isInteger(n)) ? v[k] : null;
    if (!a && !GDEF[k]) continue;
    const r = a || GDEF[k];
    o[k] = [
      Math.max(1, Math.min(GCOLS, r[0])),
      Math.max(1, r[1]),
      Math.max(2, Math.min(GCOLS, r[2])),
      Math.max(2, r[3]),
    ];
    if (o[k][0] + o[k][2] - 1 > GCOLS) o[k][0] = GCOLS - o[k][2] + 1;
  }
  return o;
}
const gHit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
const gEl = k => document.querySelector(`#cgrid [data-gk="${CSS.escape(k)}"]`);
function gShown(k) {
  const m = gEl(k);
  return !!m && getComputedStyle(m).display !== 'none';
}
// modules stay where they are put; only one that would overlap another (a new card, an old layout) goes down
function gFix() {
  const keys = Object.keys(GL)
      .filter(k => gEl(k))
      .sort((a, b) => GL[a][1] - GL[b][1] || GL[a][0] - GL[b][0]),
    done = [];
  for (const k of keys) {
    const r = GL[k];
    while (done.some(d => gHit(r, GL[d]))) r[1]++;
    done.push(k);
  }
}
const gFree = (k, r) => Object.keys(GL).every(o => o === k || !gEl(o) || !gHit(r, GL[o]));
function gApply() {
  for (const k in GL) {
    const m = gEl(k);
    if (!m) continue;
    const [c, r, w, h] = GL[k];
    m.style.gridColumn = `${c} / span ${w}`;
    m.style.gridRow = `${r} / span ${h}`;
  }
}
function gSave() {
  lsSet('luparis-grid2', GL);
}
// the title of a module is its move handle (the map, without a title, keeps a small grip); a corner resizes it
function gHandles(el, k) {
  el.dataset.gk = k;
  el.classList.add('gitem');
  const t = el.querySelector('.hside > h3, .ht, h3, h2');
  if (t) {
    t.classList.add('gttl');
    t.title = L2('Drag the title to move', 'Glisse le titre pour déplacer');
  } else if (!el.querySelector(':scope > .ggrip'))
    el.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="ggrip" title="${L2('Drag to move', 'Glisse pour déplacer')}" aria-label="${L2('Move', 'Déplacer')}">⠿</button>`,
    );
  if (!el.querySelector(':scope > .gsz'))
    el.insertAdjacentHTML(
      'beforeend',
      `<div class="gsz" title="${L2('Drag to resize', 'Glisse pour redimensionner')}" aria-hidden="true"></div>`,
    );
}
// the sheet and the character box (name, picker, Vitality, Mana, Breath) make one module
function gPfBox(hand) {
  const top = hand.querySelector(':scope > .htop');
  if (!top) return null;
  let box = top.querySelector(':scope > .pfbox');
  const pf = top.querySelector(':scope > .pf'),
    hs = top.querySelector(':scope > .hside');
  if (!box && (pf || hs)) {
    box = document.createElement('div');
    box.className = 'pfbox';
    top.prepend(box);
  }
  if (hs) box.append(hs);
  if (pf) box.append(pf);
  return box;
}
// the character cards are rebuilt often: each time, give every card its module place again
function gHandSync() {
  const hand = document.getElementById('hand');
  if (!hand || !document.getElementById('cgrid')) return;
  const items = [
    [gPfBox(hand), 'pf'],
    [hand.querySelector(':scope > .hhead'), 'hhead'],
    ...[...hand.querySelectorAll('.hcards > .hc')].map(c => [
      c,
      'c:' + (c.dataset.ck || [...c.classList].find(x => x.startsWith('k-')) || 'card'),
    ]),
  ];
  let added = false;
  for (const [el, k] of items) {
    if (!el) continue;
    gHandles(el, k);
    if (!GL[k]) {
      GL[k] = gDefault(k);
      added = true;
    }
  }
  gFix();
  gApply();
  if (added) gSave();
}
{
  const view = document.getElementById('v-carte'),
    wrap = view.querySelector('.mapwrap'),
    side = wrap && wrap.querySelector('.side'),
    grid = document.createElement('div');
  grid.className = 'cgrid';
  grid.id = 'cgrid';
  const cardOf = {
    map: document.getElementById('stage'),
    tk: document.getElementById('tk_panel'),
    pl: document.getElementById('pl_q') && document.getElementById('pl_q').closest('.card'),
    in: document.getElementById('in_list') && document.getElementById('in_list').closest('.card'),
    mk: document.getElementById('mk_card'),
    mp: document.getElementById('mp_card'),
    img: document.getElementById('img_card'),
    sn: document.getElementById('sn_card'),
  };
  wrap.before(grid);
  for (const k in cardOf) {
    const el = cardOf[k];
    if (!el) continue;
    const m = document.createElement('div');
    m.className = 'gmod';
    m.dataset.mod = k;
    m.prepend(el);
    gHandles(m, k);
    grid.append(m);
  }
  // the character cards live in #hand, which steps out of the layout (display: contents): each card is a module
  const hand = document.getElementById('hand');
  if (hand) grid.append(hand);
  if (side && !side.children.length) side.remove();
  if (!wrap.children.length) wrap.remove();
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'greset';
  reset.textContent = L2('Reset the layout', 'Disposition par défaut');
  grid.after(reset);
  reset.onclick = () => {
    lsSet('luparis-grid2', null);
    GL = gLoad();
    gHandSync();
  };
  GL = gLoad();
  renderHand = (f =>
    function () {
      const r = f.apply(this, arguments);
      gHandSync();
      return r;
    })(renderHand);
  gHandSync();
  // grid cell under the pointer
  const cell = (x, y) => {
    const r = grid.getBoundingClientRect(),
      cw = (r.width - GGAP * (GCOLS - 1)) / GCOLS;
    return {
      c: Math.floor((x - r.left + GGAP / 2) / (cw + GGAP)) + 1,
      r: Math.floor((y - r.top + GGAP / 2) / (GROW + GGAP)) + 1,
      cw,
    };
  };
  let act = null;
  grid.addEventListener(
    'pointerdown',
    e => {
      const g = e.target.closest('.ggrip, .gsz, .gttl');
      if (!g || (g.classList.contains('gttl') && e.target.closest('button, input, select, textarea, a, label'))) return;
      if (e.button || getComputedStyle(grid).display !== 'grid') return;
      if (!g) return;
      const m = g.closest('[data-gk]'),
        k = m.dataset.gk,
        p = cell(e.clientX, e.clientY);
      if (!GL[k]) return;
      e.preventDefault();
      e.stopPropagation();
      g.setPointerCapture(e.pointerId);
      act = { k, m, move: !g.classList.contains('gsz'), p0: p, r0: [...GL[k]], g };
      m.classList.add('gdrag');
      grid.style.setProperty('--gcw', p.cw + GGAP + 'px');
      grid.classList.add('gon');
    },
    true,
  );
  grid.addEventListener('pointermove', e => {
    if (!act) return;
    const p = cell(e.clientX, e.clientY),
      dc = p.c - act.p0.c,
      dr = p.r - act.p0.r,
      [c0, r0, w0, h0] = act.r0,
      n = act.move
        ? [Math.max(1, Math.min(GCOLS - w0 + 1, c0 + dc)), Math.max(1, r0 + dr), w0, h0]
        : [c0, r0, Math.max(2, Math.min(GCOLS - c0 + 1, w0 + dc)), Math.max(2, h0 + dr)];
    // a module never goes over another: it stops at the last free place
    if (!gFree(act.k, n)) return;
    GL[act.k] = n;
    gApply();
  });
  const end = () => {
    if (!act) return;
    act.m.classList.remove('gdrag');
    grid.classList.remove('gon');
    act = null;
    gSave();
  };
  grid.addEventListener('pointerup', end);
  grid.addEventListener('pointercancel', end);
}

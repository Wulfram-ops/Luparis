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
let GL = {},
  GLK = new Set(lsGet('luparis-grid2-lock', []) || []);
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
// locked modules never move; the module just moved keeps its place (below a locked one if it lands on it);
// the others rise as high as they can without overlapping
function gSettle(fixed) {
  const keys = Object.keys(GL).filter(gShown),
    locked = keys.filter(k => GLK.has(k)),
    done = [...locked];
  if (fixed && keys.includes(fixed) && !GLK.has(fixed)) {
    const r = GL[fixed];
    while (done.some(d => gHit(r, GL[d]))) r[1]++;
    done.push(fixed);
  }
  for (const k of keys.filter(k => !done.includes(k)).sort((a, b) => GL[a][1] - GL[b][1] || GL[a][0] - GL[b][0])) {
    const r = GL[k];
    r[1] = 1;
    while (done.some(d => gHit(r, GL[d]))) r[1]++;
    done.push(k);
  }
}
function gLockSync(el, k) {
  const on = GLK.has(k),
    b = el.querySelector(':scope > .glock');
  el.classList.toggle('glocked', on);
  if (!b) return;
  b.textContent = on ? '🔒' : '🔓';
  b.title = on
    ? L2(
        'Locked: other modules flow around it. Click to unlock',
        'Verrouillé : les autres modules passent autour. Clic pour déverrouiller',
      )
    : L2('Lock in place', 'Verrouiller à sa place');
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function gLockToggle(k) {
  if (GLK.has(k)) GLK.delete(k);
  else GLK.add(k);
  lsSet('luparis-grid2-lock', [...GLK]);
  const m = gEl(k);
  if (m) gLockSync(m, k);
  gSettle(null);
  gApply();
  gSave();
}
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
// move and resize handles, added to any element that becomes a module
function gHandles(el, k) {
  el.dataset.gk = k;
  el.classList.add('gitem');
  if (el.querySelector(':scope > .ggrip')) return gLockSync(el, k);
  const nm = GNAME[k] ? L2(...GNAME[k]) : (el.querySelector('.ht') || el).textContent.trim().slice(0, 30);
  el.insertAdjacentHTML(
    'beforeend',
    `<button type="button" class="glock"></button><button type="button" class="ggrip" title="${L2('Drag to move', 'Glisse pour déplacer')} · ${esc(nm)}" aria-label="${L2('Move', 'Déplacer')} ${esc(nm)}">⠿</button><div class="gsz" title="${L2('Drag to resize', 'Glisse pour redimensionner')}" aria-hidden="true"></div>`,
  );
  gLockSync(el, k);
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
  gSettle(null);
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
    lsSet('luparis-grid2-lock', []);
    GLK.clear();
    grid.querySelectorAll('[data-gk]').forEach(m => gLockSync(m, m.dataset.gk));
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
      if (e.target.closest('.glock')) return e.stopPropagation();
      const g = e.target.closest('.ggrip, .gsz');
      if (!g) return;
      const m = g.closest('[data-gk]'),
        k = m.dataset.gk,
        p = cell(e.clientX, e.clientY);
      if (!GL[k] || GLK.has(k)) return;
      e.preventDefault();
      e.stopPropagation();
      g.setPointerCapture(e.pointerId);
      act = { k, m, move: g.classList.contains('ggrip'), p0: p, r0: [...GL[k]], g };
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
      r = GL[act.k],
      [c0, r0, w0, h0] = act.r0;
    if (act.move) {
      r[0] = Math.max(1, Math.min(GCOLS - w0 + 1, c0 + dc));
      r[1] = Math.max(1, r0 + dr);
    } else {
      r[2] = Math.max(2, Math.min(GCOLS - c0 + 1, w0 + dc));
      r[3] = Math.max(2, h0 + dr);
    }
    gSettle(act.k);
    gApply();
  });
  const end = () => {
    if (!act) return;
    act.m.classList.remove('gdrag');
    grid.classList.remove('gon');
    act = null;
    gSettle(null);
    gApply();
    gSave();
  };
  grid.addEventListener(
    'click',
    e => {
      const lk = e.target.closest('.glock');
      if (!lk) return;
      e.preventDefault();
      e.stopPropagation();
      gLockToggle(lk.closest('[data-gk]').dataset.gk);
    },
    true,
  );
  grid.addEventListener('pointerup', end);
  grid.addEventListener('pointercancel', end);
  // a card that appears or disappears (selected token, GM-only cards) lets the others settle again
  new MutationObserver(() => {
    if (act) return;
    gSettle(null);
    gApply();
  }).observe(grid, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
}

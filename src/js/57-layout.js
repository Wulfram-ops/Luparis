// ---- the Map page is a grid: every module (map, cards, character cards) can be moved and resized, snapped to it.
// Each person keeps their own layout in their browser. Narrow screens fall back to one column.
const GCOLS = 12,
  GROW = 30,
  GGAP = 8;
const GDEF = {
  map: [1, 1, 9, 16],
  hand: [1, 17, 9, 16],
  tk: [10, 1, 3, 6],
  pl: [10, 7, 3, 6],
  in: [10, 13, 3, 8],
  mk: [10, 21, 3, 6],
  mp: [10, 27, 3, 8],
  img: [10, 35, 3, 7],
  sn: [10, 42, 3, 7],
};
const GNAME = {
  map: ['Map', 'Carte'],
  hand: ['Character cards', 'Cartes du personnage'],
  tk: ['Selected token', 'Token choisi'],
  pl: ['Quick place', 'Placement rapide'],
  in: ['Initiative', 'Initiative'],
  mk: ['Landmarks', 'Repères'],
  mp: ['Multiplayer', 'Partie à plusieurs'],
  img: ['Images', 'Images'],
  sn: ['Session notes', 'Notes de séance'],
};
let GL = null;
function gLoad() {
  const v = lsGet('luparis-grid', null) || {},
    o = {};
  for (const k in GDEF) {
    const a = Array.isArray(v[k]) && v[k].length === 4 && v[k].every(n => Number.isInteger(n)) ? v[k] : GDEF[k];
    o[k] = [
      Math.max(1, Math.min(GCOLS, a[0])),
      Math.max(1, a[1]),
      Math.max(2, Math.min(GCOLS, a[2])),
      Math.max(2, a[3]),
    ];
    if (o[k][0] + o[k][2] - 1 > GCOLS) o[k][0] = GCOLS - o[k][2] + 1;
  }
  return o;
}
const gHit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
// the module just moved keeps its place; the others slide down until nothing overlaps, then everything rises back up
function gSettle(fixed) {
  const keys = Object.keys(GL).filter(k => gShown(k)),
    order = [fixed, ...keys.filter(k => k !== fixed).sort((a, b) => GL[a][1] - GL[b][1] || GL[a][0] - GL[b][0])].filter(
      k => k && keys.includes(k),
    ),
    done = [];
  for (const k of order) {
    const r = GL[k];
    if (k !== fixed) {
      // rise as high as possible, then go down past whatever is in the way
      r[1] = 1;
      while (done.some(d => gHit(r, GL[d]))) r[1]++;
    }
    done.push(k);
  }
}
const gMod = k => document.querySelector(`.gmod[data-mod="${k}"]`);
function gShown(k) {
  const m = gMod(k);
  return !!m && getComputedStyle(m).display !== 'none';
}
function gApply() {
  for (const k in GL) {
    const m = gMod(k);
    if (!m) continue;
    const [c, r, w, h] = GL[k];
    m.style.gridColumn = `${c} / span ${w}`;
    m.style.gridRow = `${r} / span ${h}`;
  }
}
function gSave() {
  lsSet('luparis-grid', GL);
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
    hand: document.getElementById('hand'),
    tk: document.getElementById('tk_panel'),
    pl: document.getElementById('pl_q') && document.getElementById('pl_q').closest('.card'),
    in: document.getElementById('in_list') && document.getElementById('in_list').closest('.card'),
    mk: document.getElementById('mk_card'),
    mp: document.getElementById('mp_card'),
    img: document.getElementById('img_card'),
    sn: document.getElementById('sn_card'),
  };
  wrap.before(grid);
  for (const k in GDEF) {
    const el = cardOf[k];
    if (!el) continue;
    const m = document.createElement('div');
    m.className = 'gmod';
    m.dataset.mod = k;
    m.innerHTML = `<button type="button" class="ggrip" title="${L2('Drag to move', 'Glisse pour déplacer')} · ${esc(L2(...GNAME[k]))}" aria-label="${L2('Move', 'Déplacer')} ${esc(L2(...GNAME[k]))}">⠿</button><div class="gsz" title="${L2('Drag to resize', 'Glisse pour redimensionner')}" aria-hidden="true"></div>`;
    m.prepend(el);
    grid.append(m);
  }
  if (side && !side.children.length) side.remove();
  if (!wrap.children.length) wrap.remove();
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'greset';
  reset.textContent = L2('Reset the layout', 'Disposition par défaut');
  grid.after(reset);
  reset.onclick = () => {
    lsSet('luparis-grid', null);
    GL = gLoad();
    gSettle(null);
    gApply();
  };
  GL = gLoad();
  gSettle(null);
  gApply();
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
  grid.addEventListener('pointerdown', e => {
    const g = e.target.closest('.ggrip, .gsz');
    if (!g) return;
    const m = g.closest('.gmod'),
      k = m.dataset.mod,
      p = cell(e.clientX, e.clientY);
    e.preventDefault();
    g.setPointerCapture(e.pointerId);
    act = { k, m, move: g.classList.contains('ggrip'), p0: p, r0: [...GL[k]], g };
    m.classList.add('gdrag');
    grid.style.setProperty('--gcw', p.cw + GGAP + 'px');
    grid.classList.add('gon');
  });
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
  grid.addEventListener('pointerup', end);
  grid.addEventListener('pointercancel', end);
  // a card that appears or disappears (selected token, GM-only cards) lets the others settle again
  new MutationObserver(() => {
    if (act) return;
    gSettle(null);
    gApply();
  }).observe(grid, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
}

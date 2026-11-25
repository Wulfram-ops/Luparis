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
  in: [10, 8, 3, 9],
  mk: [10, 17, 3, 7],
  mp: [10, 24, 3, 9],
  img: [10, 33, 3, 8],
  sn: [10, 41, 3, 8],
};
const GNAME = {
  map: ['Map', 'Carte'],
  pf: ['Character sheet', 'Fiche'],
  hhead: ['Ability cards', 'Cartes de capacités'],
  tk: ['Selected token', 'Token choisi'],
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
// Size the map against the visible page area, including the actual height of the
// toolbar (it can wrap). Keep a useful minimum on very short screens.
function gMapRows(preferred) {
  const grid = document.getElementById('cgrid');
  if (!grid || getComputedStyle(grid).display !== 'grid' || !grid.getBoundingClientRect().width) return preferred;
  const top = grid.getBoundingClientRect().top + window.scrollY,
    available = window.innerHeight - top - 12;
  return Math.max(4, Math.min(preferred, Math.floor((available + GGAP) / (GROW + GGAP))));
}
function gFitMap() {
  CAM.z = 1;
  CAM.px = 0;
  CAM.py = 0;
  // Read the stage dimensions after the new grid positions have been applied.
  layout();
}
function gLoad() {
  const v = lsGet('luparis-grid2', null) || {},
    o = {},
    mapRows = gMapRows(GDEF.map[3]);
  for (const k of new Set([...Object.keys(GDEF), ...Object.keys(v)])) {
    if (k === 'pl') continue; // quick place now lives in the toolbar, not in saved grids
    const a = Array.isArray(v[k]) && v[k].length === 4 && v[k].every(n => Number.isInteger(n)) ? v[k] : null;
    if (!a && !GDEF[k]) continue;
    const r = a || [...GDEF[k]];
    if (!a && k === 'map') r[3] = mapRows;
    if (!a && (k === 'pf' || k === 'hhead')) r[1] = mapRows + 1;
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
// modules stay where they are put. A hidden module (no token selected, GM-only card…) takes no room;
// when one shows up on a taken spot, it is the one that goes down, never the modules already shown.
let gVis = new Set();
function gFix() {
  const keys = Object.keys(GL).filter(gShown),
    old = keys.filter(k => gVis.has(k)),
    neu = keys.filter(k => !gVis.has(k)),
    by = (a, b) => GL[a][1] - GL[b][1] || GL[a][0] - GL[b][0],
    done = [];
  for (const k of [...old.sort(by), ...neu.sort(by)]) {
    const r = GL[k];
    while (done.some(d => gHit(r, GL[d]))) r[1]++;
    done.push(k);
  }
  gVis = new Set(keys);
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
// layout presets: regions (column, width, first row) filled with modules on shelves; 'k-spl*' matches every spell card
const GPRE = {
  combat: {
    n: ['Combat', 'Combat'],
    reg: [
      {
        c: 1,
        w: 9,
        y: 1,
        it: [
          ['map', 9, 20],
          ['pf', 9, 9],
          ['c:k-atk', 3, 10],
          ['c:k-def', 3, 10],
          ['c:k-spl*', 3, 10],
          ['c:k-man', 3, 10],
          ['c:k-tal*', 3, 10],
        ],
        rest: 1,
      },
      {
        c: 10,
        w: 3,
        y: 1,
        it: [
          ['in', 3, 10],
          ['tk', 3, 8],
          ['mk', 3, 7],
          ['mp', 3, 9],
        ],
      },
    ],
  },
  explo: {
    n: ['Exploration', 'Exploration'],
    reg: [
      {
        c: 1,
        w: 8,
        y: 1,
        it: [
          ['map', 8, 18],
          ['c:k-inv', 4, 10],
          ['c:k-sf', 4, 10],
          ['c:k-eq', 4, 10],
          ['c:k-note', 4, 10],
          ['pf', 8, 9],
        ],
        rest: 1,
      },
      {
        c: 9,
        w: 4,
        y: 1,
        it: [
          ['mk', 4, 8],
          ['img', 4, 9],
          ['tk', 4, 8],
          ['sn', 4, 8],
          ['in', 4, 9],
          ['mp', 4, 9],
        ],
      },
    ],
  },
  totm: {
    n: ['Theatre of the mind', "Théâtre de l'esprit"],
    reg: [
      {
        c: 1,
        w: 8,
        y: 1,
        it: [
          ['pf', 8, 10],
          ['c:k-sf', 4, 10],
          ['c:k-tal*', 4, 10],
          ['c:k-def', 4, 10],
          ['c:k-atk', 4, 10],
          ['c:k-spl*', 4, 10],
          ['c:k-man', 4, 10],
          ['c:k-inv', 4, 10],
          ['c:k-eq', 4, 10],
          ['c:k-note', 4, 10],
        ],
        rest: 1,
      },
      {
        c: 9,
        w: 4,
        y: 1,
        it: [
          ['map', 4, 10],
          ['img', 4, 11],
          ['sn', 4, 9],
          ['in', 4, 9],
          ['tk', 4, 8],
          ['mk', 4, 7],
          ['mp', 4, 9],
        ],
      },
    ],
  },
};
function gPreset(id) {
  const P = GPRE[id],
    // only the modules shown now are packed; a hidden one keeps its place and finds room when it appears
    keys = Object.keys(GL).filter(gShown),
    used = new Set(),
    out = {};
  const match = m => keys.filter(k => !used.has(k) && (m.endsWith('*') ? k.startsWith(m.slice(0, -1)) : k === m));
  for (const R of P.reg) {
    let x = 0,
      y = R.y,
      sh = 0;
    const put = (k, w, h) => {
      w = Math.min(w, R.w);
      if (k === 'map') h = gMapRows(h);
      if (x + w > R.w) {
        y += sh;
        x = 0;
        sh = 0;
      }
      out[k] = [R.c + x, y, w, h];
      used.add(k);
      x += w;
      sh = Math.max(sh, h);
    };
    for (const [m, w, h] of R.it) for (const k of match(m)) put(k, w, h);
    if (R.rest)
      for (const k of keys.filter(k => !used.has(k) && !P.reg.some(Q => Q.it.some(([m]) => match(m).includes(k)))))
        put(k, k.startsWith('c:') ? 3 : Math.min(GL[k][2], R.w), k.startsWith('c:') ? 10 : GL[k][3]);
  }
  for (const k in GL) if (!out[k]) out[k] = [...GL[k]];
  GL = out;
  gVis = new Set();
  gFix();
  gApply();
  gSave();
  gFitMap();
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
  const bar = document.createElement('div');
  bar.className = 'gpresets';
  bar.innerHTML = `<span class="small">${L2('Layout', 'Disposition')}</span>${Object.keys(GPRE)
    .map(id => `<button type="button" data-gpre="${id}">${L2(...GPRE[id].n)}</button>`)
    .join('')}<button type="button" class="greset">${L2('Default', 'Par défaut')}</button>`;
  grid.before(bar);
  bar.onclick = e => {
    const b = e.target.closest('[data-gpre]');
    if (b) gPreset(b.dataset.gpre);
  };
  const reset = bar.querySelector('.greset');
  reset.onclick = () => {
    lsSet('luparis-grid2', null);
    GL = gLoad();
    gHandSync();
    gSave();
    gFitMap();
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
      act = {
        k,
        m,
        move: !g.classList.contains('gsz'),
        p0: p,
        r0: [...GL[k]],
        g,
        snap: JSON.parse(JSON.stringify(GL)),
      };
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
    // the others make room as a preview; nothing is kept until the button is released
    GL = gPush(act.snap, act.k, n);
    gApply();
  });
  const end = keep => {
    if (!act) return;
    if (!keep) GL = act.snap;
    gApply();
    act.m.classList.remove('gdrag');
    grid.classList.remove('gon');
    act = null;
    gVis = new Set(Object.keys(GL).filter(gShown));
    gSave();
  };
  grid.addEventListener('pointerup', () => end(true));
  grid.addEventListener('pointercancel', () => end(false));
  // Esc while dragging: everything goes back
  document.addEventListener(
    'keydown',
    e => {
      if (act && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        end(false);
      }
    },
    true,
  );
  // a module that appears or disappears: make room only for the one that appears
  new MutationObserver(() => {
    if (act) return;
    gFix();
    gApply();
  }).observe(grid, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
}

// ---- the Map page is a grid: every module (map, panels, each character card) can be moved and resized, snapped to it.
// Each person keeps their own layout in their browser. Narrow screens fall back to one column.
let GCOLS = [12, 24, 36].includes(lsGet('luparis-grid-cols', 12)) ? lsGet('luparis-grid-cols', 12) : 12;
const GROW = 36, GGAP = 8;
const gDetached = new Map();
// Presets are intent-based, with independently overridable secondary modules.
// Old custom grids remain custom until the user selects a preset.
const savedPreset = lsGet('luparis-grid-preset', null);
let gActive = savedPreset && typeof savedPreset.id === 'string' ? savedPreset.id : '',
  gAuto = !!savedPreset?.auto,
  gOverrides = savedPreset?.overrides && typeof savedPreset.overrides === 'object' ? Object.assign(Object.create(null), savedPreset.overrides) : Object.create(null),
  gLastSignature = '',
  gDockHTML = '';
function gRole() {
  return MP.role === 'player' ? (MP.prole === 'spec' ? 'spec' : 'player') : 'gm';
}
function gScale(r, from = 12, to = GCOLS) {
  const start = Math.floor((r[0] - 1) * to / from),
    end = Math.round((r[0] - 1 + r[2]) * to / from);
  const width = Math.min(to, Math.max(2, end - start));
  return [Math.min(start + 1, to - width + 1), r[1], width, r[3]];
}
function gColumns(n) {
  if (![12, 24, 36].includes(n)) return;
  if (n !== GCOLS) for (const k in GL) GL[k] = gScale(GL[k], GCOLS, n);
  GCOLS = n;
  const grid = document.getElementById('cgrid');
  if (grid) grid.style.setProperty('--gcols', n);
}
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
  if (GDEF[k]) return gScale(GDEF[k]);
  const n = Object.keys(GL).filter(x => x.startsWith('c:')).length;
  return gScale([1 + (n % 3) * 3, 29 + Math.floor(n / 3) * 10, 3, 10]);
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
    const r = a || gScale(GDEF[k]);
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
  return !!m && gAvailable(k) && getComputedStyle(m).display !== 'none';
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
// Each region packs explicit priorities first. Unlisted modules are parked,
// not destroyed; the Modules drawer can restore them at any time.
// A wildcard matches each card of that category, regardless of the character.
const GPRE = {
  combat: {
    n: ['Combat', 'Combat'],
    desc: ['Map, turn order and attacks first.', 'Carte, initiative et attaques en priorité.'],
    cols: 12,
    reg: [
      { c:1,w:8,y:1,it:[['map',8,30],['pf',8,9],['hhead',8,3],['c:k-man',4,8],['c:k-spl*',4,9],['c:k-tal*',4,8],['c:k-cus*',4,8]] },
      { c:9,w:4,y:1,it:[['in',4,5],['tk',4,6],['c:k-atk',4,8],['c:k-def',4,5]] },
    ],
    player: [
      { c:1,w:7,y:1,it:[['map',7,30],['pf',7,9],['hhead',7,3],['c:k-spl*',4,9],['c:k-tal*',3,8],['c:k-cus*',4,8]] },
      { c:8,w:5,y:1,it:[['in',5,4],['c:k-atk',5,8],['c:k-man',5,7],['c:k-def',5,5],['tk',5,6]] },
    ],
  },
  explo: {
    n: ['Exploration', 'Exploration'],
    desc: ['Navigation, checks, inventory and landmarks.', 'Navigation, tests, inventaire et repères.'],
    cols:12,
    reg: [
      { c:1,w:8,y:1,it:[['map',8,30],['pf',8,9],['hhead',8,3],['c:k-inv',4,9],['c:k-eq',4,8],['c:k-note',8,8]] },
      { c:9,w:4,y:1,it:[['mk',4,7],['tk',4,6],['c:k-sf',4,7],['sn',4,8],['img',4,8]] },
    ],
    player:[
      { c:1,w:7,y:1,it:[['map',7,30],['c:k-inv',4,8],['c:k-eq',3,8],['c:k-note',7,8]] },
      { c:8,w:5,y:1,it:[['pf',5,10],['hhead',5,3],['c:k-sf',5,7],['mk',5,6],['tk',5,6]] },
    ],
  },
  totm: {
    n: ['Theatre of the mind', "Théâtre de l'esprit"],
    desc: ['Story notes, illustrations and checks; smaller tactical map.', 'Notes, illustrations et tests ; carte tactique secondaire.'],
    cols:12,
    reg:[
      { c:1,w:8,y:1,it:[['sn',8,9],['img',8,8],['pf',8,9],['hhead',8,3],['c:k-sf',4,7],['c:k-note',4,8],['c:k-tal*',4,8]] },
      { c:9,w:4,y:1,it:[['map',4,9],['mk',4,6],['tk',4,6]] },
    ],
    player:[
      { c:1,w:8,y:1,it:[['pf',8,9],['hhead',8,3],['c:k-sf',4,7],['c:k-note',4,8],['c:k-tal*',4,8],['c:k-inv',4,8]] },
      { c:9,w:4,y:1,it:[['map',4,9],['img',4,7],['mk',4,6]] },
    ],
  },
  focus: {
    n:['Map focus','Carte seule'],
    desc:['Full-width tactical map without secondary panels.', 'Carte tactique pleine largeur, sans panneaux secondaires.'],
    cols:12,
    reg:[{c:1,w:12,y:1,it:[['map',12,40]]}],
  },
  wide: {
    n: ['Ultrawide 21:9', 'Ultrawide 21:9'], cols: 24,
    desc:['Central map, initiative left, character actions right.', 'Carte centrale, initiative à gauche, actions à droite.'],
    reg: [
      { c:1,w:5,y:1,it:[['in',5,5],['tk',5,6],['mk',5,7]] },
      { c:6,w:13,y:1,it:[['map',13,40],['pf',13,9],['hhead',13,3],['img',7,8],['sn',6,8]] },
      { c:19,w:6,y:1,it:[['c:k-atk',6,8],['c:k-man',6,7],['c:k-def',6,5],['c:k-spl*',6,8],['c:k-tal*',6,8]] },
    ],
  },
  superwide: {
    n: ['Super Ultrawide 32:9', 'Super Ultrawide 32:9'], cols:36,
    desc:['Central map, more space for simultaneous reference and actions.', 'Carte centrale, davantage de place pour les références et actions.'],
    reg:[
      { c:1,w:7,y:1,it:[['in',7,5],['tk',7,6],['mk',7,7],['sn',7,8]] },
      { c:8,w:16,y:1,it:[['map',16,40],['img',8,8],['c:k-inv',8,8]] },
      { c:24,w:13,y:1,it:[['pf',13,8],['hhead',13,3],['c:k-atk',7,8],['c:k-def',6,8],['c:k-man',6,8],['c:k-spl*',7,9],['c:k-tal*',6,8]] },
    ],
  },
  dual: {
    n:['Dual screen GM','Double écran MJ'],
    desc:['Map first; detach initiative, notes or cards to a second monitor.', 'Carte en priorité ; détache initiative, notes ou cartes sur un autre écran.'],
    cols:12,
    reg:[{c:1,w:12,y:1,it:[['map',12,40],['in',4,7],['tk',4,7],['mk',4,7],['pf',12,9],['hhead',12,3],['c:k-atk',6,8],['c:k-man',6,8],['sn',6,8],['img',6,8]]}],
  },
  standard: {
    n:['Standard','Standard'],
    desc:['Balanced map and character workspace; all modules accessible.', 'Espace équilibré carte et personnage ; tous les modules accessibles.'],
    cols:12, all:true,
    reg:[
      {c:1,w:8,y:1,it:[['map',8,30],['pf',8,9],['hhead',8,3],['c:k-atk',4,9],['c:k-def',4,6],['c:k-spl*',4,9],['c:k-man',4,8]]},
      {c:9,w:4,y:1,it:[['in',4,6],['tk',4,6],['mk',4,7],['mp',4,9],['img',4,8],['sn',4,8]]},
    ],
  },
};
const gMatches = (pattern,k) => pattern.endsWith('*') ? k.startsWith(pattern.slice(0,-1)) : pattern === k;
function gRegions(P) {
  const regions=gRole()==='player' && P.player ? P.player : P.reg;
  if(gRole()!=='player'||MP.me)return regions;
  // Before a character is claimed, the session picker is more important than
  // combat or exploration references. Keep it adjacent to the map if possible.
  const out=regions.map(r=>({...r,it:r.it.filter(([k])=>k!=='mp')}));
  const side=out.find(r=>!r.it.some(([k])=>k==='map'))||out[0];
  const pos=side.it.findIndex(([k])=>k==='map');
  side.it.splice(pos<0?0:pos+1,0,['mp',side.w,8]);
  return out;
}
function gAllowed(k) {
  const role=gRole();
  return !(role!=='gm' && k==='sn') && !(role==='spec' && (k==='pf'||k==='hhead'||k.startsWith('c:')));
}
function gAvailable(k) {
  const m=gEl(k);
  return !!m && gAllowed(k) && !gDetached.has(k) && !m.hidden && !(m.classList.contains('gmod') && m.firstElementChild?.hidden);
}
function gIsParked(k) {
  if (!GPRE[gActive] || k==='map' || k==='mp' && MP.role==='player' && !MP.me) return false;
  if (Object.hasOwn(gOverrides,k)) return !gOverrides[k];
  const P=GPRE[gActive];
  return !P.all && !gRegions(P).some(r=>r.it.some(([m])=>gMatches(m,k)));
}
function gModuleName(k) {
  const m=gEl(k);
  return GNAME[k] ? tr(GNAME[k]) : (m?.querySelector('.hn')?.textContent.trim() || m?.querySelector('.ht,h3')?.textContent.trim() || k.replace(/^c:/,''));
}
function gDock() {
  const list=$('g_module_list');
  if (!list) return;
  const keys=Object.keys(GL).filter(k=>gEl(k)&&gAllowed(k));
  const html=keys.map(k=>{
    const detached=gDetached.has(k), available=gAvailable(k), parked=gIsParked(k);
    const status=detached?L2('Detached','Détaché'):!available?L2('Unavailable','Indisponible'):parked?L2('Hidden','Masqué'):L2('Visible','Visible');
    return `<button type="button" data-gmodule="${esc(k)}"${(!available&&!detached)||k==='map'||(k==='mp'&&MP.role==='player'&&!MP.me)?' disabled':''} aria-pressed="${!parked&&available}"><span>${esc(gModuleName(k))}</span><small>${status}</small></button>`;
  }).join('');
  if(gDockHTML!==html){list.innerHTML=html;gDockHTML=html;}
  const count=keys.filter(k=>gAvailable(k)&&gIsParked(k)).length;
  const summary=$('g_module_summary');
  if(summary)summary.textContent=L2('Modules','Modules')+(count?' · '+count+' '+L2('hidden','masqués'):'');
  const info=$('g_preset_hint'), P=GPRE[gActive];
  if(info)info.textContent=P?tr(P.desc)+(gAuto?'':' · '+L2('customized','personnalisée')):L2('Custom layout','Disposition personnalisée');
  document.querySelectorAll('[data-gpre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gpre===gActive)));
}
function gPark() {
  for(const k in GL) {
    const m=gEl(k);
    if(m)m.classList.toggle('gparked',gIsParked(k));
  }
}
function gPack() {
  const P=GPRE[gActive];
  if(!P)return;
  const regions=gRegions(P), keys=Object.keys(GL).filter(k=>gAvailable(k)&&!gIsParked(k)),used=new Set(),out={};
  const match=m=>keys.filter(k=>!used.has(k)&&gMatches(m,k));
  let bottom=1;
  for(const R of regions){
    let x=0,y=R.y,sh=0;
    const put=(k,w,h)=>{
      w=Math.min(w,R.w);
      if(k==='map')h=gMapRows(h);
      if(x+w>R.w){y+=sh;x=0;sh=0;}
      out[k]=[R.c+x,y,w,h];used.add(k);x+=w;sh=Math.max(sh,h);
    };
    for(const [m,w,h] of R.it)for(const k of match(m))put(k,w,h);
    bottom=Math.max(bottom,y+sh);
  }
  // Do not let the catch-all steal modules reserved for later regions.
  // Unlisted, explicitly enabled modules get a separate full-width shelf.
  const fallback=keys.filter(k=>!used.has(k));
  let x=0,y=bottom,sh=0;
  for(const k of fallback){
    const w=Math.min(GCOLS,Math.max(2,Math.round(GCOLS/3)));
    if(x+w>GCOLS){y+=sh;x=0;sh=0;}
    const h=GDEF[k]?.[3]||8;
    out[k]=[x+1,y,w,h];x+=w;sh=Math.max(sh,h);
  }
  for(const k in GL)if(!out[k])out[k]=[...GL[k]];
  GL=out;
  gVis=new Set();
}
function gRefresh(force=false) {
  if(TABLE_DISPLAY)return;
  gPark();
  // Updating the labels can wrap the toolbar. Measure the map only after that.
  gDock();
  const sig=JSON.stringify([gActive,gRole(),!!MP.me,GCOLS,Object.keys(GL).filter(k=>gAvailable(k)&&!gIsParked(k)).sort()]);
  if(gAuto&&GPRE[gActive]&&(force||sig!==gLastSignature))gPack();
  gLastSignature=sig;
  gFix();gApply();
}
function gPreset(id) {
  if(!Object.hasOwn(GPRE,id)||id==='dual'&&gRole()!=='gm')return;
  const P=GPRE[id];
  gActive=id;gAuto=true;gOverrides=Object.create(null);gLastSignature='';
  gColumns(P.cols||12);
  gRefresh(true);
  gSave();
  gFitMap();
}
function gToggleModule(k) {
  if(gDetached.has(k)){gDetached.get(k).win.focus();return;}
  if(!gAvailable(k)||k==='map'||(k==='mp'&&MP.role==='player'&&!MP.me))return;
  // A user can hide modules even in an imported/custom layout.
  if(!GPRE[gActive]){gActive='standard';gAuto=false;}
  gOverrides[k]=gIsParked(k);
  gRefresh(true);
  gSave();
}
function gApply() {
  for (const k in GL) {
    const m = gEl(k);
    if (!m) continue;
    const [c, r, w, h] = GL[k];
    m.style.gridColumn = `${c} / span ${w}`;
    m.style.gridRow = `${r} / span ${h}`;
    m.style.order = k === 'map' ? '-1' : String(r * 100 + c);
  }
}
function gSave() {
  lsSet('luparis-grid2', GL);
  lsSet('luparis-grid-cols', GCOLS);
  lsSet('luparis-grid-preset',{id:gActive,auto:gAuto,overrides:gOverrides});
}
// the title of a module is its move handle (the map, without a title, keeps a small grip); a corner resizes it
function gHandles(el, k) {
  el.dataset.gk = k;
  el.classList.add('gitem');
  el.classList.toggle('gdetached', gDetached.has(k));
  el.classList.toggle('gparked', gIsParked(k));
  if (!TABLE_DISPLAY && !el.querySelector(':scope > .gwindow'))
    el.insertAdjacentHTML('beforeend', `<button type="button" class="gwindow" data-gwindow="${esc(k)}" title="${L2('Open on another screen', 'Ouvrir sur un autre écran')}" aria-label="${L2('Open on another screen', 'Ouvrir sur un autre écran')}">↗</button>`);
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
  gRefresh();
  if (added) gSave();
}
{
  const view = document.getElementById('v-carte'),
    wrap = view.querySelector('.mapwrap'),
    side = wrap && wrap.querySelector('.side'),
    grid = document.createElement('div');
  grid.className = 'cgrid';
  grid.id = 'cgrid';
  grid.style.setProperty('--gcols', GCOLS);
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
  bar.innerHTML = `<div class="gpres-main"><span class="small">${L2('Layout', 'Disposition')}</span>${['combat','explo','totm','focus','wide','superwide','dual'].map(id => `<button type="button" data-gpre="${id}" title="${esc(tr(GPRE[id].desc))}" aria-pressed="false">${tr(GPRE[id].n)}</button>`).join('')}<button type="button" class="greset" data-gpre="standard">${L2('Default', 'Par défaut')}</button><details id="g_modules"><summary id="g_module_summary">${L2('Modules','Modules')}</summary><div id="g_module_list"></div></details><span id="g_preset_hint" class="small" aria-live="polite"></span></div><span class="gdisplaytools"><button type="button" id="g_public">${L2('Public table', 'Table publique')}</button><button type="button" id="g_screens">${L2('Detect screens', 'Détecter les écrans')}</button><select id="g_screen" aria-label="${L2('Destination screen', 'Écran de destination')}" hidden></select><button type="button" id="g_restore">${L2('Restore windows', 'Rouvrir les fenêtres')}</button><button type="button" id="g_return">${L2('Reattach all', 'Tout réintégrer')}</button><span class="small" id="g_display_msg" aria-live="polite"></span></span>`;
  grid.before(bar);
  bar.onclick = e => {
    const b = e.target.closest('[data-gpre]');
    if (b) gPreset(b.dataset.gpre);
    const m=e.target.closest('[data-gmodule]');
    if(m)gToggleModule(m.dataset.gmodule);
  };
  document.addEventListener('pointerdown',e=>{
    const d=$('g_modules');
    if(d&&!d.contains(e.target))d.open=false;
  });
  GL = gLoad();
  if(!Object.hasOwn(GPRE,gActive)){gActive='';gAuto=false;}
  else if(gAuto)gColumns(GPRE[gActive].cols||12);
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
    else gAuto=false; // a manual layout must not be repacked on character selection
    gApply();
    act.m.classList.remove('gdrag');
    grid.classList.remove('gon');
    act = null;
    gVis = new Set(Object.keys(GL).filter(gShown));
    gDock();
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
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-gwindow]');
    if (b) gOpenWindow(b.dataset.gwindow);
  });
  grid.addEventListener('contextmenu', e => {
    if (!e.target.closest('.gttl, .ggrip, .gwindow')) return;
    const m = e.target.closest('[data-gk]');
    if (!m || TABLE_DISPLAY) return;
    e.preventDefault();
    e.stopPropagation();
    const k=m.dataset.gk;
    ctxMenu(e.clientX, e.clientY, [
      {label:L2('Open on another screen', 'Ouvrir sur un autre écran'),fn:()=>gOpenWindow(k)},
      k==='map'||(k==='mp'&&MP.role==='player'&&!MP.me)?null:{label:L2('Hide module','Masquer le module'),fn:()=>gToggleModule(k)}
    ]);
  }, true);
  // a module that appears or disappears: make room only for the one that appears
  new MutationObserver(() => {
    if (act) return;
    gRefresh();
  }).observe(grid, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
  let gResizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(gResizeTimer);
    gResizeTimer=setTimeout(()=>{
      if(TABLE_DISPLAY||!gAuto||!GPRE[gActive]||act||view.hidden)return;
      gRefresh(true);
      layout();
    },120);
  });
  window.addEventListener('hashchange',()=>{
    if(location.hash==='#carte'&&gAuto)requestAnimationFrame(()=>{gRefresh(true);layout();});
  });
}

// ---- Local multi-screen windows. The opener owns all gameplay and storage.
// Controls in detached panels are mirrors: commands are dispatched to the original DOM.
const gWanted = new Set((lsGet('luparis-detached', []) || []).filter(k => typeof k === 'string'));
const gViews = new Map();
let gTick = 0, gScreenDetails = null, gClosing = false;
function gDisplayMsg(en, fr) {
  const el = $('g_display_msg');
  if (el) el.textContent = L2(en, fr);
}
function gRememberWindows() {
  lsSet('luparis-detached', [...gWanted]);
}
function gPopupFeatures() {
  const sel = $('g_screen'), s = gScreenDetails && sel && gScreenDetails.screens[+sel.value];
  if (!s || sel.hidden) return 'popup,width=900,height=720';
  return 'popup,left=' + Math.round(s.availLeft) + ',top=' + Math.round(s.availTop) +
    ',width=' + Math.max(400, Math.round(s.availWidth * .9)) + ',height=' + Math.max(300, Math.round(s.availHeight * .9));
}
async function gDetectScreens() {
  if (!window.getScreenDetails) return gDisplayMsg('Screen detection is unavailable. Move windows manually.', 'Détection indisponible : déplace les fenêtres manuellement.');
  try {
    gScreenDetails = await window.getScreenDetails();
    const s = $('g_screen');
    const render = () => {
      s.replaceChildren();
      gScreenDetails.screens.forEach((screen, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = (screen.label || L2('Screen ', 'Écran ') + (i + 1)) + ' · ' + screen.width + '×' + screen.height;
        s.append(o);
      });
      const i = gScreenDetails.screens.indexOf(gScreenDetails.currentScreen);
      if (gScreenDetails.screens.length > 1) s.value = String(i === 0 ? 1 : 0);
      s.hidden = false;
    };
    render();
    gScreenDetails.addEventListener('screenschange', render);
    gDisplayMsg('Choose a screen, then open a window.', 'Choisis un écran, puis ouvre une fenêtre.');
  } catch (e) {
    gDisplayMsg('Screen permission refused. Move windows manually.', 'Autorisation refusée : déplace les fenêtres manuellement.');
  }
}
function gReattach(k, close = true) {
  const p = gDetached.get(k);
  if (!p) return;
  gDetached.delete(k);
  gWanted.delete(k);
  if (!gClosing) gRememberWindows();
  if (close && !p.win.closed) p.win.close();
  const el = gEl(k);
  if (el) el.classList.remove('gdetached');
  gRefresh();
}
function gSourceControls(el) {
  return [...el.querySelectorAll('button,input,select,textarea,a,summary,form')].filter(x => !x.closest('.gwindow,.ggrip,.gsz'));
}
function gMirrorPanel(k, p) {
  const el = gEl(k);
  if (!el) {
    if (p.root.dataset.missing !== '1') {
      p.root.dataset.missing = '1';
      p.root.textContent = L2('This module is not available for the selected character.', 'Ce module est indisponible pour le personnage sélectionné.');
      p.signature = '';
      p.controls = [];
    }
    return;
  }
  delete p.root.dataset.missing;
  const doc = p.win.document;
  if (p.root.contains(doc.activeElement) && doc.activeElement.matches('input,textarea,select')) return;
  const copy = el.cloneNode(true);
  copy.classList.remove('gdetached','gdrag','gitem','gparked');
  copy.removeAttribute('style');
  copy.querySelectorAll('.gwindow,.ggrip,.gsz').forEach(x => x.remove());
  const originals = gSourceControls(el), controls = gSourceControls(copy);
  controls.forEach((c,i) => {
    c.dataset.gproxy = String(i);
    const s = originals[i];
    if (!s) return;
    if (c.matches('input,textarea,select')) {
      if (c.type !== 'file') c.value = s.value;
      if (c.matches('input') && c.type !== 'file') c.setAttribute('value',s.value);
      if (c.matches('textarea')) c.textContent = s.value;
      if (c.matches('input[type=checkbox],input[type=radio]')) c.toggleAttribute('checked',s.checked);
      if (c.matches('select')) [...c.options].forEach((o,j)=>o.toggleAttribute('selected',!!s.options[j]?.selected));
    }
  });
  const signature = copy.outerHTML + '|' + document.body.className;
  if (signature === p.signature && originals.every((s,i)=>p.controls[i]===s)) return;
  p.signature = signature;
  p.controls = originals;
  const scroll = p.root.scrollTop;
  doc.body.className = 'gpopup ' + document.body.className;
  p.root.replaceChildren(doc.adoptNode(copy));
  p.root.scrollTop = scroll;
}
function gOpenWindow(k) {
  if (TABLE_DISPLAY) return;
  if (k === 'map') return gOpenView('gm');
  if (gDetached.has(k)) return gDetached.get(k).win.focus();
  const el = gEl(k);
  if (!el || !gAvailable(k)) return;
  const win = window.open('', '_blank', gPopupFeatures());
  if (!win) return gDisplayMsg('Popup blocked. Allow popups for Luparis.', 'Fenêtre bloquée : autorise les pop-ups pour Luparis.');
  const doc = win.document;
  doc.documentElement.lang = lang;
  doc.title = 'Luparis · ' + (GNAME[k] ? tr(GNAME[k]) : (el.querySelector('.ht,h3,h2')?.textContent || k));
  for (const link of document.querySelectorAll('link[rel=stylesheet]')) {
    const l = doc.createElement('link');
    l.rel = 'stylesheet'; l.href = link.href; doc.head.append(l);
  }
  const meta = doc.createElement('meta'); meta.name='viewport';meta.content='width=device-width,initial-scale=1';doc.head.append(meta);
  const bar = doc.createElement('div'); bar.className='gpopupbar';
  const title = doc.createElement('strong'); title.textContent=doc.title;bar.append(title);
  const btn = (label,fn) => {const b=doc.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;bar.append(b);};
  btn(L2('Fullscreen','Plein écran'),()=>{if(doc.fullscreenElement) doc.exitFullscreen();else doc.documentElement.requestFullscreen?.().catch(()=>{});});
  btn(L2('Reattach','Réintégrer'),()=>gReattach(k));
  const root = doc.createElement('main');root.className='gpopupcontent';
  doc.body.append(bar,root);
  const p = {win,root,controls:[],signature:''};
  const source = e => {
    const t = e.target.closest('[data-gproxy]');
    if (!t) return [];
    const s = p.controls[+t.dataset.gproxy];
    return s && s.isConnected ? [t,s] : [];
  };
  const update = () => {p.signature='';gMirrorPanel(k,p);};
  root.addEventListener('click',e=>{
    const [t,s]=source(e);
    if (!s || !t.matches('button,a')) return;
    e.preventDefault();
    s.click();
    update();
  });
  for (const type of ['input','change']) root.addEventListener(type,e=>{
    const [t,s]=source(e);
    if (!s || !t.matches('input,textarea,select') || t.type==='file') return;
    if (t.matches('input[type=checkbox],input[type=radio]')) s.checked=t.checked;
    else s.value=t.value;
    s.dispatchEvent(new Event(type,{bubbles:true}));
    if(type==='change') update();
  });
  root.addEventListener('submit',e=>{
    e.preventDefault();
    const [,s]=source(e);
    if(s && s.matches('form')) {s.requestSubmit();update();}
  });
  // file pickers and native dialogs remain in the main window.
  root.addEventListener('click',e=>{
    if(e.target.matches('input[type=file]')) {e.preventDefault();window.focus();gDisplayMsg('Use file pickers in the main window.','Utilise les sélecteurs de fichiers dans la fenêtre principale.');}
  });
  gDetached.set(k,p);
  gWanted.add(k);
  gRememberWindows();
  el.classList.add('gdetached');
  gMirrorPanel(k,p);
  gRefresh();gStartTick();
}
function gOpenView(kind) {
  if (TABLE_DISPLAY || (kind==='public' && MP.role==='player')) return;
  if (gViews.has(kind) && !gViews.get(kind).win.closed) return gViews.get(kind).win.focus();
  const url = new URL(location.pathname,location.href);
  url.searchParams.set('table-display',kind);
  url.hash='carte';
  const win = window.open(url.href,'_blank',gPopupFeatures());
  if(!win) return gDisplayMsg('Popup blocked. Allow popups for Luparis.','Fenêtre bloquée : autorise les pop-ups pour Luparis.');
  gViews.set(kind,{win,signature:'',ready:false});
  gStartTick();
}
function gViewState(kind) {
  const state = memStateNow();
  // A public display receives the same visibility-filtered map as spectators, never the GM state.
  return kind==='public' ? mpView(state,[]) : state;
}
function gStartTick() {
  if (gTick) return;
  gTick=setInterval(()=>{
    for(const [k,p] of gDetached) {
      if(p.win.closed) gReattach(k,false);
      else try {gMirrorPanel(k,p);} catch(e) {gReattach(k);}
    }
    for(const [kind,p] of gViews) {
      if(p.win.closed) {gViews.delete(kind);continue;}
      if(!p.ready) continue;
      if(kind==='public' && MP.role==='player') {p.win.close();gViews.delete(kind);continue;}
      const state=gViewState(kind), signature=JSON.stringify(state);
      if(signature!==p.signature) {
        p.signature=signature;
        p.win.postMessage({type:'luparis-table-state',state},location.origin);
      }
    }
    if(!gDetached.size&&!gViews.size) {clearInterval(gTick);gTick=0;}
  },200);
}
function gDisplayBoot() {
  if(TABLE_DISPLAY) {
    // Separate read-only renderer, no multiplayer host/join, no local gameplay saves.
    document.body.classList.add('mp-player','mp-spec');
    const button=document.createElement('button');
    button.className='table-fullscreen';
    button.textContent=L2('Fullscreen','Plein écran');
    button.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{});};
    document.body.append(button);
    document.addEventListener('keydown',e=>{if(e.key!=='Escape'&&e.key!=='F11'&&e.key!=='Tab'){e.stopImmediatePropagation();e.preventDefault();}},true);
    window.addEventListener('message',e=>{
      if(e.origin!==location.origin||e.source!==window.opener||e.data?.type!=='luparis-table-state')return;
      if(!applyState(e.data.state))return;
      document.body.classList.add('table-ready');
      CAM.z=1;CAM.px=0;CAM.py=0;layout();
    });
    new ResizeObserver(()=>{if(document.body.classList.contains('table-ready'))layout();}).observe(stage);
    if(window.opener)window.opener.postMessage({type:'luparis-table-ready'},location.origin);
    return;
  }
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.data?.type!=='luparis-table-ready')return;
    for(const p of gViews.values()) if(e.source===p.win){p.ready=true;p.signature='';}
  });
  $('g_public').onclick=()=>gOpenView('public');
  $('g_screens').onclick=gDetectScreens;
  $('g_return').onclick=()=>{for(const k of [...gDetached.keys()])gReattach(k);};
  $('g_restore').onclick=()=>{for(const k of [...gWanted])gOpenWindow(k);};
  window.addEventListener('pagehide',()=>{
    gClosing=true;
    for(const p of gDetached.values())if(!p.win.closed)p.win.close();
    for(const p of gViews.values())if(!p.win.closed)p.win.close();
    clearInterval(gTick);
  });
}

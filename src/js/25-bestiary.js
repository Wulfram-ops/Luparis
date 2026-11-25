ro.observe(stage);
const esc = v =>
  String(v ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const FPS = ['0', '1/8', '1/4', '1/2', ...Array.from({ length: 30 }, (_, i) => String(i + 1))];
const DEFSZ = {
  Kobold: 'S',
  Goblin: 'S',
  Imp: 'T',
  'Giant Spider': 'L',
  'Dire Wolf': 'L',
  Ogre: 'L',
  'Ochre Jelly': 'L',
  'Gelatinous Cube': 'L',
  Owlbear: 'L',
  Manticore: 'L',
  Troll: 'L',
  'Fire Elemental': 'L',
  'Earth Elemental': 'L',
  'Hill Giant': 'H',
  Unicorn: 'L',
  'Shambling Mound': 'L',
  Chimera: 'L',
  Wyvern: 'L',
  'Frost Giant': 'H',
  Hydra: 'H',
  Treant: 'H',
  'Stone Golem': 'L',
  'Young Red Dragon': 'L',
  'Adult Red Dragon': 'H',
  Balor: 'H',
  Tarrasque: 'G',
};
const SZK = ['T', 'S', 'M', 'L', 'H', 'G'];
function noT(m) {
  return lang === 'en' && m.noen ? m.noen : m.no || '';
}
function monSz(m) {
  return SZK.includes(m.sz) ? m.sz : DEFSZ[Array.isArray(m.n) ? m.n[0] : m.n] || 'M';
}
const fpNum = f => (f.includes('/') ? 1 / +f.split('/')[1] : +f);
function conv(m) {
  const f = fpNum(m.fp),
    maj = Math.round(7 + f);
  return { esq: +m.ca, maj, sev: 2 * maj, cases: Math.max(1, Math.round(m.pv / (4 + f))) };
}
const monTier = f => Math.max(1, Math.min(5, Math.round(1 + f / 4.5)));
function abbr(n) {
  n = String(n);
  const w = n
    .replace(/[^A-Za-zÀ-ÿ ]/g, '')
    .split(' ')
    .filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
}
const DEF = [
  [['Kobold', 'Kobold'], 'humanoid', '1/8', 12, 5, 'montagne donjon'],
  [['Bandit', 'Bandit'], 'humanoid', '1/8', 12, 11, 'prairie foret desert'],
  [['Goblin', 'Gobelin'], 'humanoid', '1/4', 15, 7, 'foret montagne donjon'],
  [['Skeleton', 'Squelette'], 'undead', '1/4', 13, 13, 'donjon'],
  [['Zombie', 'Zombi'], 'undead', '1/4', 8, 22, 'donjon marais'],
  [['Wolf', 'Loup'], 'beast', '1/4', 13, 11, 'foret neige prairie'],
  [['Hobgoblin', 'Hobgobelin'], 'humanoid', '1/2', 18, 11, 'prairie foret'],
  [['Orc', 'Orc'], 'humanoid', '1/2', 13, 15, 'montagne prairie'],
  [['Gnoll', 'Gnoll'], 'humanoid', '1/2', 15, 22, 'prairie desert'],
  [['Imp', 'Diablotin'], 'fiend', '1', 13, 10, 'volcan donjon'],
  [['Ghoul', 'Goule'], 'undead', '1', 12, 22, 'donjon marais'],
  [['Giant Spider', 'Araignée géante'], 'beast', '1', 14, 26, 'foret donjon'],
  [['Dire Wolf', 'Loup sanguinaire'], 'beast', '1', 14, 37, 'foret neige'],
  [['Bugbear', 'Gobelours'], 'humanoid', '1', 16, 27, 'foret donjon'],
  [['Dryad', 'Dryade'], 'fey', '1', 11, 22, 'foret'],
  [['Ogre', 'Ogre'], 'giant', '2', 11, 59, 'montagne foret marais'],
  [['Ochre Jelly', 'Gelée ocre'], 'ooze', '2', 8, 45, 'donjon'],
  [['Gelatinous Cube', 'Cube gélatineux'], 'ooze', '2', 6, 84, 'donjon'],
  [['Owlbear', 'Ours-hibou'], 'monstrosity', '3', 13, 59, 'foret'],
  [['Wight', 'Nécrophage'], 'undead', '3', 14, 45, 'donjon marais'],
  [['Manticore', 'Manticore'], 'monstrosity', '3', 14, 68, 'montagne desert'],
  [['Hell Hound', 'Molosse infernal'], 'fiend', '3', 15, 45, 'volcan'],
  [['Banshee', 'Banshee'], 'undead', '4', 12, 58, 'marais donjon'],
  [['Troll', 'Troll'], 'giant', '5', 15, 84, 'marais montagne foret'],
  [['Fire Elemental', 'Élémentaire de feu'], 'elemental', '5', 13, 102, 'volcan'],
  [['Earth Elemental', 'Élémentaire de terre'], 'elemental', '5', 17, 126, 'montagne donjon'],
  [['Hill Giant', 'Géant des collines'], 'giant', '5', 13, 105, 'prairie montagne'],
  [['Unicorn', 'Licorne'], 'celestial', '5', 12, 67, 'foret'],
  [['Shambling Mound', 'Tertre errant'], 'plant', '5', 15, 136, 'marais foret'],
  [['Chimera', 'Chimère'], 'monstrosity', '6', 14, 114, 'montagne volcan'],
  [['Wyvern', 'Wyverne'], 'dragon', '6', 13, 110, 'montagne'],
  [['Frost Giant', 'Géant du givre'], 'giant', '8', 15, 138, 'neige'],
  [['Hydra', 'Hydre'], 'monstrosity', '8', 15, 172, 'marais'],
  [['Treant', 'Sylvanien'], 'plant', '9', 16, 138, 'foret'],
  [['Stone Golem', 'Golem de pierre'], 'construct', '10', 17, 178, 'donjon'],
  [['Young Red Dragon', 'Jeune dragon rouge'], 'dragon', '10', 18, 178, 'volcan montagne'],
  [['Vampire', 'Vampire'], 'undead', '13', 16, 144, 'donjon'],
  [['Adult Red Dragon', 'Dragon rouge adulte'], 'dragon', '17', 19, 256, 'volcan montagne'],
  [['Balor', 'Balor'], 'fiend', '19', 19, 262, 'volcan'],
  [['Lich', 'Liche'], 'undead', '21', 17, 135, 'donjon'],
  [['Tarrasque', 'Tarasque'], 'monstrosity', '30', 25, 676, 'prairie montagne'],
].map((r, i) => ({
  id: 'd' + i,
  n: r[0],
  type: r[1],
  fp: r[2],
  ca: r[3],
  pv: r[4],
  hab: r[5].split(' '),
  no: '',
  init: [
    2, 1, 2, 2, -2, 2, 1, 1, 1, 3, 2, 3, 2, 2, 1, -1, -2, -4, 1, 2, 3, 1, 2, 1, 3, -1, -1, 2, -1, 0, 0, -1, 1, -1, -1,
    0, 4, 0, 2, 3, 0,
  ][i],
}));
let MON;
// monsters the GM chose to show in the players' bestiary
const REV = new Set(lsGet('luparis-best-rev', []) || []);
function revToggle(id) {
  if (REV.has(id)) REV.delete(id);
  else REV.add(id);
  lsSet('luparis-best-rev', [...REV]);
  if (typeof mpPush === 'function') mpPush();
  renderB();
}
// what the players receive: only revealed monsters, without the GM's notes
function revList() {
  return MON.filter(m => REV.has(m.id)).map(m => {
    const o = { ...m };
    delete o.no;
    delete o.noFr;
    delete o.noEn;
    return o;
  });
}
let PBEST = [];
function renderPBest() {
  const el = document.getElementById('pbest');
  if (!el) return;
  el.hidden = MP.role !== 'player';
  if (el.hidden) return;
  el.innerHTML = `<div class="bhead"><h2>${L2('Bestiary', 'Bestiaire')}</h2><span class="small">${PBEST.length ? t('count')(PBEST.length, PBEST.length) : ''}</span></div>${
    PBEST.length
      ? `<div class="pbl">${PBEST.map(
          m =>
            `<button type="button" class="pbc" data-pbs="${esc(m.id)}"><b>${esc(tr(m.n))}</b><span class="small">${esc(tyName(m.type))} · ${lang === 'fr' ? 'FP' : 'CR'} ${esc(m.fp)}</span></button>`,
        ).join('')}</div>`
      : `<p class="small">${L2('The game master has not shown any creature yet.', "Le MJ n'a encore montré aucune créature.")}</p>`
  }`;
}
document.getElementById('pbest').addEventListener('click', e => {
  const b = e.target.closest('[data-pbs]'),
    m = b && PBEST.find(x => x.id === b.dataset.pbs);
  if (m) monSheet(m);
});
function loadMon() {
  try {
    const d = lsGet('luparis-bestiary-v2', null);
    if (Array.isArray(d)) return d;
  } catch (e) {}
  return DEF.map(m => ({ ...m, hab: [...m.hab] }));
}
MON = loadMon();
let SRD = [];
function mergeSrd(force) {
  if (!SRD.length) return 0;
  let n = 0;
  for (const x of SRD) {
    const en = x.n[0],
      d = MON.find(m => m.id === x.id || (Array.isArray(m.n) ? m.n[0] : m.n) === en);
    if (d) {
      if (String(d.id).startsWith('d') && !d.noen) {
        d.sz = x.sz;
        d.noen = x.noen;
        if (!d.no) d.no = x.no;
      }
      continue;
    }
    MON.push({ ...x, hab: [...x.hab] });
    n++;
  }
  return n;
}
fetch('srd-monsters.json')
  .then(r => (r.ok ? r.json() : []))
  .then(d => {
    if (!Array.isArray(d)) return;
    SRD = d;
    let done = null;
    try {
      done = localStorage.getItem('luparis-srd');
    } catch (e) {}
    if (done !== '1') {
      mergeSrd();
      try {
        localStorage.setItem('luparis-srd', '1');
      } catch (e) {}
      saveMon();
    }
    if (typeof fillSel === 'function') {
      fillSel();
      renderB();
    }
  })
  .catch(() => {});
function saveMon() {
  lsSet('luparis-bestiary-v2', MON);
  if (typeof renderPlace === 'function') renderPlace();
}
const $ = id => document.getElementById(id);
const opt = (v, t, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(t)}</option>`;
function fillSel() {
  const types = [...new Set(MON.map(m => m.type))].sort((a, b) => tyName(a).localeCompare(tyName(b), lang));
  const ft = $('ft').value,
    fh = $('fh').value,
    fs = $('fs').value || 'fp';
  $('ft').innerHTML = opt('', t('all')) + types.map(x => opt(x, tyName(x), x === ft)).join('');
  $('types').innerHTML = types.map(x => opt(tyName(x), tyName(x))).join('');
  $('fh').innerHTML =
    opt('', t('all')) +
    ORDER.filter(k => k !== 'gen')
      .map(k => opt(k, tr(B[k].n), k === fh))
      .join('');
  $('fs').innerHTML = ['fp', 'n', 'type', 'pv'].map(k => opt(k, t('s_' + k), k === fs)).join('');
  const hc = [...$('mhab').querySelectorAll('input:checked')].map(c => c.value);
  $('mhab').innerHTML = ORDER.filter(k => k !== 'gen')
    .map(
      k => `<label><input type="checkbox" value="${k}"${hc.includes(k) ? ' checked' : ''}>${esc(tr(B[k].n))}</label>`,
    )
    .join('');
}
$('fmin').innerHTML = FPS.map(f => opt(f, f, f === '0')).join('');
$('fmax').innerHTML = FPS.map(f => opt(f, f, f === '30')).join('');
$('mfp').innerHTML = FPS.map(f => opt(f, f, f === '1')).join('');
function fillSz() {
  const v = $('msz').value || 'M';
  if (!t('szn')) return;
  $('msz').innerHTML = SZK.map(k => opt(k, t('szn')[k], k === v)).join('');
}
fillSz();

var BDIRTY = false;
function renderB() {
  if ($('v-bestiaire').hidden) {
    BDIRTY = true;
    return;
  }
  BDIRTY = false;
  const q = $('q').value.trim().toLowerCase(),
    ft = $('ft').value,
    fh = $('fh').value,
    lo = fpNum($('fmin').value),
    hi = fpNum($('fmax').value),
    s = $('fs').value;
  let L = MON.filter(
    m =>
      (!ft || m.type === ft) &&
      (!fh || m.hab.includes(fh)) &&
      fpNum(m.fp) >= lo &&
      fpNum(m.fp) <= hi &&
      (!q || ([].concat(m.n).join(' ') + ' ' + tyName(m.type) + ' ' + noT(m)).toLowerCase().includes(q)),
  );
  const nm = m => tr(m.n);
  L.sort(
    s === 'n'
      ? (a, b) => nm(a).localeCompare(nm(b), lang)
      : s === 'type'
        ? (a, b) => tyName(a.type).localeCompare(tyName(b.type), lang) || fpNum(a.fp) - fpNum(b.fp)
        : s === 'pv'
          ? (a, b) => a.pv - b.pv
          : (a, b) => fpNum(a.fp) - fpNum(b.fp) || nm(a).localeCompare(nm(b), lang),
  );
  $('bcount').textContent = t('count')(L.length, MON.length);
  $('bt').tBodies[0].innerHTML = L.length
    ? L.map(m => {
        const v = conv(m);
        return `<tr><td><b>${esc(nm(m))}</b>${noT(m) ? `<div class="small">${esc(noT(m))}</div>` : ''}</td><td>${esc(tyName(m.type))}<div class="small">${esc(t('szn')[monSz(m)] || '')}</div></td><td class="r">${esc(m.fp)}</td><td>${m.hab.map(h => (B[h] ? `<span class="tag">${esc(tr(B[h].n))}</span>` : '')).join('')}</td><td class="r">${v.esq}</td><td class="r">${v.maj} / ${v.sev}</td><td class="r">${v.cases} <span class="small">(${esc(m.pv)} ${t('hp')})</span></td><td class="r"><div class="acts"><button class="go" data-place="${esc(m.id)}">${t('place')}</button><button data-sheet="${esc(m.id)}">${L2('Sheet', 'Fiche')}</button><button data-rev="${esc(m.id)}" class="${REV.has(m.id) ? 'on' : ''}" title="${L2("Show in the players' bestiary", 'Montrer dans le bestiaire des joueurs')}" aria-pressed="${REV.has(m.id)}">${REV.has(m.id) ? L2('👁 Shown', '👁 Montré') : L2('👁 Show', '👁 Montrer')}</button><button data-edit="${esc(m.id)}">${t('edit')}</button><button data-del="${esc(m.id)}">${t('del')}</button></div></td></tr>`;
      }).join('')
    : `<tr><td colspan="8" class="empty">${t('none')}</td></tr>`;
}
for (const id of ['q', 'ft', 'fh', 'fmin', 'fmax', 'fs']) $(id).addEventListener('input', renderB);
$('bt').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.dataset.place || b.dataset.edit || b.dataset.del || b.dataset.sheet || b.dataset.rev,
    m = MON.find(x => x.id === id);
  if (!m) return;
  if (b.dataset.rev) {
    revToggle(m.id);
    return;
  }
  if (b.dataset.sheet) {
    monSheet(m);
    return;
  }
  if (b.dataset.place) {
    placing = m;
    location.hash = '#carte';
    setTool('place');
  } else if (b.dataset.edit) {
    $('mid').value = m.id;
    $('mn').value = nm0(m);
    $('mty').value = tyName(m.type);
    $('mfp').value = m.fp;
    $('msz').value = monSz(m);
    $('mca').value = m.ca;
    $('mpv').value = m.pv;
    $('min').value = m.init || 0;
    $('mno').value = noT(m);
    $('mdesc').value = m.desc || '';
    $('mtr').value = (m.tr || []).map(x => x[0] + ' : ' + x[1]).join('\n');
    atkFill(monAtk(m));
    for (const c of $('mhab').querySelectorAll('input')) c.checked = m.hab.includes(c.value);
    $('addsum').textContent = t('editing') + tr(m.n);
    $('addbox').open = true;
    prev();
    $('mn').focus();
  } else if (b.dataset.del) {
    if (b.dataset.armed) {
      MON = MON.filter(x => x.id !== id);
      saveMon();
      fillSel();
      renderB();
    } else {
      b.dataset.armed = '1';
      b.textContent = t('confirm');
      setTimeout(() => {
        if (b.isConnected) {
          delete b.dataset.armed;
          b.textContent = t('del');
        }
      }, 3000);
    }
  }
});
function prev() {
  const v = conv({ fp: $('mfp').value, ca: +$('mca').value || 0, pv: +$('mpv').value || 1 });
  $('mprev').textContent = t('prev')(v);
}
for (const id of ['mfp', 'mca', 'mpv']) $(id).addEventListener('input', prev);
function resetForm() {
  $('mf').reset();
  fillSz();
  atkFill([]);
  $('mid').value = '';
  $('addsum').textContent = t('add');
  prev();
}
$('mcancel').onclick = resetForm;
function atkRow(a) {
  a = a || { n: '', k: 1, ab: 4, nd: 1, dd: 8, mod: 2 };
  const sel = (cls, vals, v, fmt) =>
      `<select class="${cls}" aria-label="${cls}">${vals.map(x => `<option value="${x}"${x === v ? ' selected' : ''}>${fmt(x)}</option>`).join('')}</select>`,
    rg = (a2, b2) => Array.from({ length: b2 - a2 + 1 }, (_, i) => a2 + i);
  return `<div class="arow"><input class="an" value="${esc(a.n)}" placeholder="${L2('Attack name', "Nom de l'attaque")}" aria-label="${L2('Attack name', "Nom de l'attaque")}">${sel('ak', rg(1, 4), a.k, x => '×' + x)}${sel('ab', rg(-2, 20), a.ab, x => L2('hit ', 'att. ') + sgn(x))}${sel('nd', rg(1, 10), a.nd, x => x)}${sel('dd', [4, 6, 8, 10, 12], a.dd, x => 'd' + x)}${sel('mod', rg(-5, 15), a.mod, x => (x ? sgn(x) : '+0'))}<button type="button" class="adel" aria-label="${L2('Remove', 'Retirer')}">×</button></div>`;
}
function atkFill(list) {
  $('matk').innerHTML =
    `<span class="small">${L2('Attacks (clickable on the map)', 'Attaques (cliquables sur la carte)')}</span><div class="arows">${(list || []).map(atkRow).join('')}</div><button type="button" id="matk_add">${L2('Add an attack', 'Ajouter une attaque')}</button>`;
}
function atkRead() {
  return [...$('matk').querySelectorAll('.arow')]
    .map(r => ({
      n: r.querySelector('.an').value.trim().slice(0, 40),
      k: +r.querySelector('.ak').value,
      ab: +r.querySelector('.ab').value,
      nd: +r.querySelector('.nd').value,
      dd: +r.querySelector('.dd').value,
      mod: +r.querySelector('.mod').value,
    }))
    .filter(a => a.n);
}
$('matk').addEventListener('click', e => {
  if (e.target.id === 'matk_add') {
    $('matk').querySelector('.arows').insertAdjacentHTML('beforeend', atkRow());
    const ins = $('matk').querySelectorAll('.an');
    ins[ins.length - 1].focus();
  } else if (e.target.classList.contains('adel')) e.target.closest('.arow').remove();
});
function monAtk(m) {
  return m && Array.isArray(m.atk) && m.atk.length ? m.atk : parseAtk((m ? noT(m) : '') || '');
}
atkFill([]);

$('mf').addEventListener('submit', e => {
  e.preventDefault();
  const tyIn = $('mty').value.trim(),
    tyKey = Object.keys(TY).find(k => TY[k].some(x => x.toLowerCase() === tyIn.toLowerCase())) || tyIn;
  const old = MON.find(x => x.id === $('mid').value),
    nIn = $('mn').value.trim(),
    nVal = old && Array.isArray(old.n) && nIn === tr(old.n) ? old.n : nIn;
  const m = {
    id: $('mid').value || 'u' + Date.now().toString(36),
    n: nVal,
    type: tyKey,
    fp: $('mfp').value,
    sz: $('msz').value || 'M',
    ca: +$('mca').value,
    pv: +$('mpv').value,
    init: Math.max(-5, Math.min(15, +$('min').value || 0)),
    hab: [...$('mhab').querySelectorAll('input:checked')].map(c => c.value),
    no: $('mno').value.trim(),
    atk: atkRead(),
    desc: $('mdesc').value.trim().slice(0, 2000),
    tr: trParse($('mtr').value),
  };
  if (!m.n || !m.type) return;
  const i = MON.findIndex(x => x.id === m.id);
  if (i >= 0) MON[i] = Object.assign({}, MON[i], m);
  else MON.push(m);
  saveMon();
  fillSel();
  renderB();
  resetForm();
  $('impmsg').textContent = '';
});
$('exp').onclick = () => {
  const txt = JSON.stringify(MON);
  navigator.clipboard.writeText(txt).then(
    () => {
      $('impmsg').textContent = T[lang].copied;
    },
    () => {
      $('imp').value = txt;
      $('imp').select();
      $('impmsg').textContent = T[lang].copy_no;
    },
  );
};
$('impb').onclick = () => {
  try {
    const d = JSON.parse($('imp').value);
    if (!Array.isArray(d)) throw 0;
    const L = d
      .filter(m => m && m.n && m.type)
      .map((m, i) => ({
        id: String(m.id || 'i' + i + Date.now().toString(36)),
        n: Array.isArray(m.n) ? m.n.map(String).slice(0, 2) : String(m.n),
        type: String(m.type),
        fp: FPS.includes(String(m.fp)) ? String(m.fp) : '1',
        ca: +m.ca || 10,
        pv: +m.pv || 1,
        init: Math.max(-5, Math.min(15, +m.init || 0)),
        hab: Array.isArray(m.hab) ? m.hab.filter(h => B[h]) : [],
        no: String(m.no || ''),
      }));
    if (!L.length) throw 0;
    MON = L;
    saveMon();
    fillSel();
    renderB();
    $('impmsg').textContent = T[lang].imported(L.length);
  } catch (e) {
    $('impmsg').textContent = T[lang].bad;
  }
};
$('reset').onclick = e => {
  const b = e.currentTarget;
  if (b.dataset.armed) {
    MON = DEF.map(m => ({ ...m, hab: [...m.hab] }));
    mergeSrd();
    saveMon();
    fillSel();
    renderB();
    b.textContent = t('reset');
    delete b.dataset.armed;
    $('impmsg').textContent = T[lang].restored;
  } else {
    b.dataset.armed = '1';
    b.textContent = t('reset_c');
  }
};
function route() {
  const v =
    { '#bestiaire': 'bestiaire', '#regles': 'regles', '#fiche': 'fiche', '#monde': 'monde' }[location.hash] || 'carte';
  if (v === 'monde') initWorld();
  for (const x of ['monde', 'carte', 'fiche', 'bestiaire', 'regles']) $('v-' + x).hidden = v !== x;
  if (v === 'bestiaire' && BDIRTY) renderB();
  if (v === 'regles') rules();
  for (const a of document.querySelectorAll('.tabs a'))
    (a.toggleAttribute('aria-current', a.dataset.v === v), a.dataset.v === v && a.setAttribute('aria-current', 'page'));
  if (v === 'carte') {
    requestAnimationFrame(layout);
    if (placing) requestAnimationFrame(() => stage.scrollIntoView({ block: 'center' }));
    else window.scrollTo(0, 0);
  } else window.scrollTo(0, 0);
}

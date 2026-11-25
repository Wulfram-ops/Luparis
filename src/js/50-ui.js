function nm0(m) {
  return tr(m.n);
}
function applyLang() {
  document.documentElement.lang = lang;
  document.title = 'Luparis';
  for (const e of document.querySelectorAll('[data-i18n]')) e.textContent = t(e.dataset.i18n);
  if (typeof fillScenes === 'function') fillScenes();
  if (typeof fillSz === 'function') fillSz();
  if (typeof fillEnv === 'function') fillEnv();
  if (typeof fillSurf === 'function') fillSurf();
  if (typeof fillObj === 'function') fillObj();
  if (typeof fillTpl === 'function' && TPLK) fillTpl();
  if (typeof toolHint === 'function' && TPLK) toolHint();
  if (typeof usBtn === 'function' && TPLK) usBtn();
  if (typeof perfUI === 'function') perfUI();
  if (typeof layApply === 'function') layApply();
  if (typeof snRender === 'function' && typeof SN !== 'undefined' && SN) snRender();
  if (typeof aiUI === 'function' && typeof AIC !== 'undefined') aiUI();
  if (typeof fillBio === 'function') fillBio();
  for (const e of document.querySelectorAll('[data-i18n-html]')) e.innerHTML = t(e.dataset.i18nHtml);
  for (const e of document.querySelectorAll('[data-i18n-ph]')) e.placeholder = t(e.dataset.i18nPh);
  for (const b of bz.querySelectorAll('button[data-b]')) b.querySelector('.bn').textContent = tr(B[b.dataset.b].n);
  for (const b of document.querySelectorAll('#langs button')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  for (const b of document.querySelectorAll('#units button')) b.setAttribute('aria-pressed', b.dataset.u === unit);
  if (!$('mid').value) $('addsum').textContent = t('add');
  fillSel();
  renderB();
  prev();
  legend();
  rules();
  renderSheet();
  renderPlace();
  renderIni();
  renderTok();
  renderRes();
  if(typeof playLabels==='function'&&$('play_workspace')?.dataset.ready){playLabels();playSync();playFit();mpRender();}
  if (WS) wRender();
  draw();
}
// The rules book (rules/en.html, rules/fr.html) is fetched the first time it is shown or searched.
const RULES_HTML = {};
let rulesShown = null;
function rulesLoad(l) {
  if (!RULES_HTML[l])
    RULES_HTML[l] = fetch(`rules/${l}.html`)
      .then(r => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
      .catch(e => {
        delete RULES_HTML[l];
        throw e;
      });
  return RULES_HTML[l];
}
function rules(force) {
  if (!force && $('v-regles').hidden) {
    if (rulesShown && rulesShown !== lang) rulesShown = null;
    return;
  }
  if (rulesShown === lang) return Promise.resolve();
  const l = lang;
  return rulesLoad(l)
    .then(html => {
      if (l !== lang) return;
      const tp = document.createElement('template');
      tp.innerHTML = html;
      $('rbody').replaceChildren(tp.content);
      for (const tb of $('rbody').querySelectorAll('table')) {
        const w = document.createElement('div');
        w.className = 'scroll';
        tb.before(w);
        w.append(tb);
      }
      $('toc').innerHTML =
        `<div class="vtag">${esc(t('ver'))}</div>` +
        [...$('rbody').querySelectorAll('h2')]
          .map(h => `<button data-to="${esc(h.id)}">${esc(h.textContent)}</button>`)
          .join('');
      rulesShown = l;
    })
    .catch(e => {
      console.error('Luparis: rules', e);
      $('rbody').textContent = L2('The rules could not be loaded.', 'Impossible de charger les règles.');
    });
}
$('toc').addEventListener('click', e => {
  const b = e.target.closest('button[data-to]');
  if (b) document.getElementById(b.dataset.to).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
});
function savePrefs() {
  lsSet('luparis-prefs', { lang, unit });
}
$('langs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  lang = b.dataset.lang;
  savePrefs();
  applyLang();
});
$('units').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  unit = b.dataset.u;
  savePrefs();
  applyLang();
});
applyLang();
route();
function makeReorder(box, key) {
  if (!box) return;
  const kids = [...box.children].filter(x => x.matches('section.card'));
  kids.forEach((sec, i) => {
    if (!sec.dataset.mod) sec.dataset.mod = sec.id || key + i;
    sec.classList.add('rmod');
  });
  const sk = 'luparis-layout-' + key;
  let o = null;
  try {
    o = lsGet(sk, null);
  } catch (e) {}
  if (Array.isArray(o))
    for (const m of o) {
      const el = [...box.children].find(x => x.dataset.mod === m);
      if (el) box.append(el);
    }
  let dragEl = null;
  const secOf = e => {
    const h = e.target.closest && e.target.closest('h3.foldh');
    if (!h || e.target.closest('button,a,input,select,textarea')) return null;
    const sec = h.closest('section.card');
    return sec && sec.parentNode === box && sec.id !== 'tk_panel' && sec.id !== 'w_sel' ? sec : null;
  };
  box.addEventListener('pointerdown', e => {
    const sec = e.button === 0 && secOf(e);
    if (sec) sec.draggable = true;
  });
  box.addEventListener('pointerup', e => {
    const sec = secOf(e);
    if (sec && !dragEl) sec.draggable = false;
  });
  box.addEventListener('keydown', e => {
    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    const sec = secOf(e);
    if (!sec) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && sec.previousElementSibling) box.insertBefore(sec, sec.previousElementSibling);
    else if (e.key === 'ArrowDown' && sec.nextElementSibling) box.insertBefore(sec.nextElementSibling, sec);
    lsSet(sk, [...box.children].map(x => x.dataset.mod).filter(Boolean));
    e.target.focus();
  });
  box.addEventListener('dragstart', e => {
    const t2 = e.target.closest('.rmod');
    if (!t2 || t2.parentNode !== box) return;
    dragEl = t2;
    dragEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', key);
    } catch (x) {}
  });
  box.addEventListener('dragover', e => {
    if (!dragEl) return;
    e.preventDefault();
    const tgt = e.target.closest('.rmod');
    if (!tgt || tgt === dragEl || tgt.parentNode !== box) return;
    const r = tgt.getBoundingClientRect();
    box.insertBefore(dragEl, e.clientY < r.top + r.height / 2 ? tgt : tgt.nextSibling);
  });
  box.addEventListener('dragend', () => {
    if (!dragEl) return;
    dragEl.classList.remove('dragging');
    dragEl.draggable = false;
    dragEl = null;
    lsSet(sk, [...box.children].map(x => x.dataset.mod).filter(Boolean));
  });
}
document.querySelectorAll('aside.side').forEach((a, i) => makeReorder(a, i ? 'side-map' : 'side-world'));
const KROW1 = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  KROW2 = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  KROW3 = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'];
let KLAB = null;
try {
  if (navigator.keyboard && navigator.keyboard.getLayoutMap)
    navigator.keyboard
      .getLayoutMap()
      .then(m => {
        KLAB = m;
        kbHints();
      })
      .catch(() => {});
} catch (e) {}
const KLAY = {
  azerty: { KeyQ: 'a', KeyW: 'z', KeyA: 'q', KeyZ: 'w', KeyM: ',', Semicolon: 'm' },
  qwertz: { KeyY: 'z', KeyZ: 'y' },
  qwerty: {},
};
let KL = null;
try {
  KL = localStorage.getItem('luparis-kblayout');
} catch (e) {}
if (!KLAY[KL])
  KL = /^fr(-FR|-BE|$)/i.test(navigator.language || '')
    ? 'azerty'
    : /^de/i.test(navigator.language || '')
      ? 'qwertz'
      : 'qwerty';
document.addEventListener(
  'keydown',
  e => {
    if (!e.key || e.key.length !== 1) return;
    const k = e.key.toLowerCase(),
      c = e.code;
    let g = null;
    if (c === 'KeyQ') g = k === 'a' ? 'azerty' : k === 'q' ? (KL === 'qwertz' ? 'qwertz' : 'qwerty') : null;
    else if (c === 'KeyW') g = k === 'z' ? 'azerty' : k === 'w' ? (KL === 'azerty' ? 'qwerty' : KL) : null;
    else if (c === 'KeyY') g = k === 'z' ? 'qwertz' : k === 'y' && KL === 'qwertz' ? 'qwerty' : null;
    else if (c === 'KeyZ')
      g = k === 'y' ? 'qwertz' : k === 'w' ? 'azerty' : k === 'z' && KL !== 'qwerty' ? 'qwerty' : null;
    if (g && g !== KL) {
      KL = g;
      try {
        localStorage.setItem('luparis-kblayout', g);
      } catch (x) {}
      if (typeof kbHints === 'function') kbHints();
    }
  },
  true,
);
const klab = code => {
  const v = KLAB && KLAB.get(code);
  return (v || KLAY[KL][code] || code.replace(/^Key|^Digit/, '')).toUpperCase();
};
function kbRows() {
  const v =
      { '#bestiaire': 'bestiaire', '#regles': 'regles', '#fiche': 'fiche', '#monde': 'monde' }[location.hash] ||
      'carte',
    r = { 1: [], 2: [], 3: [] };
  if (v === 'carte') {
    r[1] = [...document.querySelectorAll('#tools button')];
    r[2] = ['pl_q', 'in_roll', 'in_next', 'in_end'].map(id => $(id));
    r[3] = ['zout', 'zin', 'zfit', 'undo', 'gen', 'savemap'].map(id => $(id));
  } else if (v === 'monde') {
    r[1] = [...document.querySelectorAll('#w_layers input')];
    r[2] = ['w_fit', 'w_zout', 'w_zin', 'w_goparty'].map(id => $(id)).filter(Boolean);
  } else if (v === 'regles') {
    const b = [...document.querySelectorAll('#toc button')];
    r[1] = b.slice(0, 10);
    r[2] = b.slice(10, 19);
  } else if (v === 'bestiaire') {
    r[1] = ['q', 'ft', 'fh', 'fmin', 'fma'].map(id => $(id)).filter(Boolean);
  } else if (v === 'fiche') {
    r[1] = ['c_back', 'c_short', 'c_long', 'c_xp'].map(id => $(id)).filter(Boolean);
  }
  return r;
}
function kbHints() {
  for (const e of document.querySelectorAll('[data-kb]')) e.removeAttribute('data-kb');
  document.querySelectorAll('.tabs a').forEach((a, i) => a.setAttribute('data-kb', klab('Digit' + (i + 1))));
  const r = kbRows();
  [
    [1, KROW1],
    [2, KROW2],
    [3, KROW3],
  ].forEach(([n, codes]) =>
    r[n].forEach((el, i) => {
      if (el && codes[i]) {
        const tgt = el.tagName === 'INPUT' && el.type === 'checkbox' ? el.closest('label') || el : el;
        tgt.setAttribute('data-kb', klab(codes[i]));
      }
    }),
  );
}
document.addEventListener(
  'keydown',
  e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    const c = e.code,
      dm = /^Digit([1-5])$/.exec(c);
    if (dm && !e.shiftKey) {
      const a = document.querySelectorAll('.tabs a')[+dm[1] - 1];
      if (a) {
        e.preventDefault();
        location.hash = a.getAttribute('href');
      }
      return;
    }
    const r = kbRows();
    for (const [n, codes] of [
      [1, KROW1],
      [2, KROW2],
      [3, KROW3],
    ]) {
      const i = codes.indexOf(c);
      if (i < 0) continue;
      const el = r[n][i];
      if (!el) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (el.tagName === 'INPUT' && el.type === 'checkbox') {
        el.checked = !el.checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (el.tagName === 'INPUT' || el.tagName === 'SELECT') el.focus();
      else el.click();
      return;
    }
  },
  true,
);
window.addEventListener('hashchange', () => setTimeout(kbHints));
setTimeout(kbHints, 50);

// ---- detailed monster sheet (SRD 5.1 text, CC BY 4.0)
let SRDD = null,
  SRDP = null;
function srdDetails() {
  if (SRDD) return Promise.resolve(SRDD);
  if (!SRDP)
    SRDP = fetch('srd-details.json')
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(o => (SRDD = o));
  return SRDP;
}
function trParse(t) {
  return String(t || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map(l => {
      const i = l.indexOf(':');
      return i > 0
        ? [
            l.slice(0, i).trim().slice(0, 60),
            l
              .slice(i + 1)
              .trim()
              .slice(0, 600),
          ]
        : [l.slice(0, 60), ''];
    });
}
const SZN2 = {
  T: ['Tiny', 'Très petit'],
  S: ['Small', 'Petit'],
  M: ['Medium', 'Moyen'],
  L: ['Large', 'Grand'],
  H: ['Huge', 'Très grand'],
  G: ['Gargantuan', 'Gigantesque'],
};
// Luparis stat blocks of the SRD creatures (srd-luparis.json, built by tools/srd_luparis.py), loaded with the first sheet
let SRDL = null,
  SRDLP = null;
function srdLuparis() {
  if (SRDL) return Promise.resolve(SRDL);
  if (!SRDLP)
    SRDLP = fetch('srd-luparis.json')
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(o => (SRDL = o));
  return SRDLP;
}
function srdKey(m) {
  const en = Array.isArray(m.n) ? m.n[0] : String(m.n);
  return String(m.id).startsWith('s-')
    ? m.id
    : 's-' +
        en
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
}
// attacks shown on the sheet: the Luparis conversion when there is one, else the bestiary line
let SBA = [],
  SBRP = null;
function monBlockHTML(m, D, tk, LU) {
  const v = conv(m),
    P = x => (Array.isArray(x) ? x[lang === 'fr' ? 1 : 0] : x || ''),
    f = fpNum(m.fp),
    T = monTier(f),
    key = tk ? tk.id : m.id;
  SBA =
    LU && LU.atk && LU.atk.length
      ? LU.atk.map(a => ({
          n: P(a.n),
          ab: a.ab,
          nd: a.nd,
          dd: a.dd,
          mod: a.mod,
          ty: P(a.ty),
          how: P(a.how),
          plus: a.plus ? P(a.plus) : '',
          rest: P(a.rest),
        }))
      : monAtk(m).map(a => ({
          n: (a.n || '') + (a.k > 1 ? ' ×' + a.k : ''),
          ab: a.ab,
          nd: a.nd,
          dd: a.dd,
          mod: a.mod,
        }));
  const stat = (k, val) => `<div><span>${k}</span><b>${val}</b></div>`,
    line = (k, x) => (x ? `<p><span class="mk">${k}</span> ${esc(x)}</p>` : ''),
    list = (h, a, sec) =>
      a && a.length
        ? `<h4>${h}</h4>` +
          a
            .map((x, i) => {
              const rc = x[4] && x[4].rc;
              let ctl = '';
              if (rc) {
                // recharge chosen at the table: N turns of recharge = N × Tier dice
                const id = sec + i,
                  cd = tk && tk.cd ? +tk.cd[id] || 0 : 0;
                ctl =
                  `<div class="msrc">` +
                  [1, 2, 3]
                    .map(
                      n =>
                        `<button type="button" data-sbrc="${id}" data-n="${n}" data-t="${rc.t}" data-d="${rc.d}" data-ty="${esc(P(rc.ty))}" data-nm="${esc(P([x[0], x[1]]).replace(/\s*\(.*$/, ''))}">${n === 1 ? L2('every turn', 'chaque tour') : n + ' ' + L2('turns', 'tours')} · ${rc.t * n}d${rc.d}</button>`,
                    )
                    .join('') +
                  (tk
                    ? `<span class="msrcs${cd ? ' wait' : ''}">${cd ? L2(`recharging: ${cd} turn${cd > 1 ? 's' : ''}`, `en recharge : ${cd} tour${cd > 1 ? 's' : ''}`) : L2('ready', 'prêt')}</span>`
                    : '') +
                  `</div>`;
              }
              return `<p><b>${esc(lang === 'fr' ? x[1] : x[0])}.</b> ${esc(lang === 'fr' ? x[3] : x[2])}</p>${ctl}`;
            })
            .join('')
        : '';
  const sub = [tr(SZN2[monSz(m)] || ['', '']) + ' ' + tyName(m.type), LU ? P(LU.al) : ''].filter(Boolean).join(' · ');
  let h = `<div class="ms"><div class="mshd"><h2>${esc(tr(m.n))}${tk && tk.num ? ' ' + tk.num : ''}</h2><span class="mst">Tier ${T} · ${L2('CR', 'FP')} ${esc(m.fp)}</span></div>
 <p class="mss">${esc(sub)}</p>
 <div class="msk">${stat(L2('Evasion', 'Esquive'), v.esq)}${stat(L2('Thresholds', 'Seuils'), v.maj + ' / ' + v.sev)}${stat(L2('Boxes', 'Cases'), tk ? tk.hp + ' / ' + tk.hpMax : v.cases)}${stat(L2('Mastery', 'Maîtrise'), sgn(T + 1))}${stat('Init', sgn(+m.init || 0))}</div>`;
  if (LU && LU.mx) {
    const I = [L2('Power', 'Puissance'), 'Finesse', L2('Resilience', 'Résistance')],
      Dm = [
        [L2('Physical', 'Physique'), 'phy'],
        [L2('Mental', 'Mental'), 'men'],
        [L2('Social', 'Social'), 'soc'],
      ];
    h +=
      `<table class="msm"><thead><tr><th></th>${Dm.map(([n, k]) => `<th${(LU.sv || []).includes(k) ? ` class="sv" title="${L2('Mastered saving throws', 'Sauvegardes maîtrisées')}"` : ''}>${n}</th>`).join('')}</tr></thead><tbody>` +
      I.map((n, i) => `<tr><th>${n}</th>${[0, 1, 2].map(j => `<td>${sgn(LU.mx[i * 3 + j])}</td>`).join('')}</tr>`).join(
        '',
      ) +
      `</tbody></table>`;
    if ((LU.sv || []).length)
      h += `<p class="msn">${L2('● mastered saving throws: add the Mastery', '● sauvegardes maîtrisées : ajoute la Maîtrise')}</p>`;
  }
  if (LU)
    h +=
      `<div class="msl">` +
      line(L2('Speed', 'Vitesse'), P(LU.spd)) +
      line(L2('Senses', 'Sens'), P(LU.sen)) +
      line(L2('Languages', 'Langues'), P(LU.lng)) +
      line(L2('Skills', 'Compétences'), (LU.sk || []).map(P).join(', ')) +
      line(L2('Vulnerable', 'Vulnérable'), P(LU.vul)) +
      line(L2('Resistant', 'Résiste'), P(LU.res)) +
      line(L2('Immune', 'Immunisé'), [P(LU.imm), P(LU.cimm)].filter(Boolean).join(' · ')) +
      `</div>`;
  if (m.desc) h += `<p class="msd">${esc(m.desc)}</p>`;
  if (SBA.length)
    h +=
      `<h4>${L2('Attacks', 'Attaques')}</h4><div class="msa">` +
      SBA.map(
        (a, i) =>
          `<div class="msai"><div class="msah"><b>${esc(a.n)}</b><button type="button" class="go" data-sbr="atk" data-i="${i}" title="${L2('Attack roll', "Jet d'attaque")}">${sgn(a.ab)}</button>${a.nd ? `<button type="button" data-sbr="dmg" data-i="${i}" title="${L2('Damage', 'Dégâts')}">${a.nd}d${a.dd}${a.mod ? sgn(a.mod) : ''}${a.plus ? ' ' + esc(a.plus.replace(/^\+ /, '+')).replace(/ .*/, '') : ''}</button>` : ''}<span class="msty">${esc([a.ty, a.plus && a.plus.replace(/^\+ \S+ /, '+ ')].filter(Boolean).join(' '))}</span></div>${a.how ? `<p class="msh">${esc(a.how)}</p>` : ''}${a.rest ? `<p>${esc(a.rest)}</p>` : ''}</div>`,
      ).join('') +
      `</div>`;
  if (LU) {
    h +=
      list(L2('Traits', 'Capacités'), LU.tr, 'tr') +
      list(L2('Actions', 'Actions'), LU.act, 'act') +
      list(L2('Reactions', 'Réactions'), LU.rea, 'rea') +
      list(L2('Legendary actions (3 per round)', 'Actions légendaires (3 par round)'), LU.leg, 'leg');
  } else if ((m.tr || []).length)
    h += list(
      L2('Traits', 'Capacités'),
      (m.tr || []).map(([n, d]) => [n, n, d, d]),
    );
  if (!LU && noT(m)) h += `<p class="msn">${esc(noT(m))}</p>`;
  if (D) {
    const raw = (t, a) =>
      a && a.length
        ? `<p class="msn"><b>${t}</b></p>` + a.map(([n, d]) => `<p><i>${esc(n)}.</i> ${esc(d)}</p>`).join('')
        : '';
    h += `<details class="msraw"><summary>${L2('Original SRD 5.1 text (D&D values)', 'Texte original du SRD 5.1 (valeurs D&D, en anglais)')}</summary>
   <p>${L2('AC', 'CA')} ${m.ca} · ${L2('HP', 'PV')} ${m.pv}${D.hd ? ' (' + esc(D.hd) + ')' : ''} · ${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((k, i) => k + ' ' + (D.ab || [])[i]).join(' · ')}</p>${raw('Traits', D.tr)}${raw('Actions', D.act)}${raw('Reactions', D.rea)}${raw('Legendary', D.leg)}</details>
   <p class="msn">${L2('Contains SRD 5.1 content (CC BY 4.0), converted to the Luparis rules.', 'Contient du contenu du SRD 5.1 (CC BY 4.0), converti aux règles de Luparis.')}</p>`;
  }
  return h + '</div>';
}
let SBM = null,
  SBT = null;
function monSheet(m, tk) {
  SBM = m;
  SBT = tk || null;
  let dl = document.getElementById('sbdlg');
  if (!dl) {
    dl = document.createElement('dialog');
    dl.id = 'sbdlg';
    dl.className = 'sbdlg';
    document.body.append(dl);
    dl.addEventListener('click', e => {
      if (e.target === dl) {
        dl.close();
        return;
      }
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'sb_close') {
        dl.close();
        return;
      }
      if (b.dataset.sbrc) {
        const n = +b.dataset.n,
          nd = n * +b.dataset.t,
          dd = +b.dataset.d,
          rs = Array.from({ length: nd }, () => dRoll(dd)),
          tot = rs.reduce((x, y) => x + y, 0),
          who = tr(SBM.n) + (SBT && SBT.num ? ' ' + SBT.num : '');
        pushRoll(
          `${esc(who)} · ${esc(b.dataset.nm)} · ${nd}d${dd} [${rs.join(', ')}] = <b>${tot}</b> ${esc(b.dataset.ty)}` +
            (n > 1 ? ` · ${L2(`recharge ${n} turns`, `recharge ${n} tours`)}` : ''),
        );
        if (SBT) {
          SBT.cd = SBT.cd || {};
          if (n > 1) SBT.cd[b.dataset.sbrc] = n - 1;
          else delete SBT.cd[b.dataset.sbrc];
          save();
          SBRP && SBRP();
        }
        return;
      }
      if (b.dataset.sbr) {
        const a = SBA[+b.dataset.i];
        if (!a) return;
        const nm = tr(SBM.n) + (SBT && SBT.num ? ' ' + SBT.num : '') + ' · ' + a.n,
          key = 'sb_' + (SBT ? SBT.id : SBM.id) + '_' + b.dataset.i;
        if (b.dataset.sbr === 'atk') {
          const r = dRoll(20);
          TKCRIT[key] = r === 20;
          pushRoll(
            `${esc(nm)} · d20 (${r}) ${sgn(a.ab)} = <b>${r + a.ab}</b>${r === 20 ? ` <span class="cr">${t('sk_crit')}</span>` : r === 1 ? ` <span class="ko">${t('sk_miss')}</span>` : ''}`,
          );
        } else {
          const n = TKCRIT[key] ? a.nd * 2 : a.nd,
            rs = Array.from({ length: n }, () => dRoll(a.dd)),
            px = /^\+ ?(\d+)d(\d+)([+-]\d+)?/.exec(a.plus || ''),
            ps = px ? Array.from({ length: +px[1] }, () => dRoll(+px[2])) : [],
            tot = rs.reduce((x, y) => x + y, 0) + a.mod + ps.reduce((x, y) => x + y, 0) + (px && px[3] ? +px[3] : 0);
          TKCRIT[key] = false;
          pushRoll(
            `${esc(nm)} · ${n}d${a.dd}${a.mod ? sgn(a.mod) : ''} [${rs.join(', ')}]${px ? ` + ${px[1]}d${px[2]} [${ps.join(', ')}]` : ''} = <b>${tot}</b>`,
          );
        }
      }
    });
  }
  let DD = null,
    LU = null;
  const paint = () => {
    SBRP = paint;
    dl.innerHTML =
      `<div class="sbbar"><button type="button" id="sb_close" aria-label="${L2('Close', 'Fermer')}">×</button></div>` +
      monBlockHTML(m, DD, SBT, LU);
  };
  paint();
  if (!dl.open) dl.showModal();
  const k2 = srdKey(m);
  srdLuparis().then(o => {
    if (SBM === m && dl.open && o[k2]) {
      LU = o[k2];
      paint();
    }
  });
  srdDetails().then(o => {
    if (SBM === m && dl.open && o[k2]) {
      DD = o[k2];
      paint();
    }
  });
}

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
function monBlockHTML(m, D, tk) {
  const v = conv(m),
    mod = x => Math.floor((x - 10) / 2),
    sg = x => (x >= 0 ? '+' : '') + x,
    A = monAtk(m),
    key = tk ? tk.id : m.id;
  const list = (h, a) =>
    a && a.length ? `<h4>${h}</h4>` + a.map(([n, d]) => `<p><b><i>${esc(n)}.</i></b> ${esc(d)}</p>`).join('') : '';
  const line = (k, x) => (x ? `<p><b>${k}</b> ${esc(x)}</p>` : '');
  let h = `<div class="sb"><h2>${esc(tr(m.n))}${tk && tk.num ? ' ' + tk.num : ''}</h2><p class="sbt">${esc(tr(SZN2[monSz(m)] || ['', '']))} ${esc(tyName(m.type))}${D && D.sub ? ' (' + esc(D.sub) + ')' : ''}${D && D.al ? ', ' + esc(D.al) : ''}</p><hr class="sbr">
 <p><b>Luparis</b> · ${L2('Evasion', 'Esquive')} <b>${v.esq}</b> · ${L2('Thresholds', 'Seuils')} <b>${v.maj} / ${v.sev}</b> · ${L2('Boxes', 'Cases')} <b>${tk ? tk.hp + ' / ' + tk.hpMax : v.cases}</b> · Init <b>${sgn(+m.init || 0)}</b> · ${L2('CR', 'FP')} <b>${esc(m.fp)}</b>${D && D.xp ? ` (${D.xp} XP D&D)` : ''}</p>
 <p><b>D&amp;D</b> · ${L2('AC', 'CA')} ${m.ca} · ${L2('HP', 'PV')} ${m.pv}${D && D.hd ? ' (' + esc(D.hd) + ')' : ''}${D && D.spd ? ` · ${L2('Speed', 'Vitesse')} ${esc(D.spd)}` : ''}</p>`;
  if (D && D.ab)
    h += `<hr class="sbr"><div class="sbab">${['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA'].map((k, i) => `<div><b>${lang === 'fr' ? k : ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'][i]}</b><span>${D.ab[i]} (${sg(mod(D.ab[i]))})</span></div>`).join('')}</div>`;
  if (D)
    h +=
      `<hr class="sbr">` +
      line(L2('Saving throws', 'Jets de sauvegarde'), D.sv) +
      line(L2('Skills', 'Compétences'), D.sk) +
      line(L2('Vulnerabilities', 'Vulnérabilités'), D.vul) +
      line(L2('Resistances', 'Résistances'), D.res) +
      line(L2('Immunities', 'Immunités'), D.imm) +
      line(L2('Condition immunities', 'Immunités aux états'), D.cimm) +
      line(L2('Senses', 'Sens'), D.sen) +
      line(L2('Languages', 'Langues'), D.lng);
  h += `<hr class="sbr">` + (m.desc ? `<p class="sbd">${esc(m.desc)}</p>` : '');
  if (A.length)
    h += `<h4>${L2('Luparis attacks', 'Attaques Luparis')}</h4><div class="matks">${A.map((a, i) => `<div class="matk"><span>${esc(a.n)}${a.k > 1 ? ' ×' + a.k : ''}</span><button type="button" class="go" data-sbr="atk" data-i="${i}">${sgn(a.ab)}</button><button type="button" data-sbr="dmg" data-i="${i}">${a.nd}d${a.dd}${a.mod ? sgn(a.mod) : ''}</button></div>`).join('')}</div>`;
  h +=
    list(L2('Traits', 'Capacités'), [...(m.tr || []), ...((D && D.tr) || [])]) +
    list(L2('Actions (D&D text)', 'Actions (texte D&D)'), D && D.act) +
    list(L2('Reactions', 'Réactions'), D && D.rea) +
    list(L2('Legendary actions', 'Actions légendaires'), D && D.leg);
  if (noT(m)) h += `<p class="small">${esc(noT(m))}</p>`;
  if (D)
    h += `<p class="small sbsrc">${L2('Text from the System Reference Document 5.1 (CC BY 4.0). Numbers in the D&D text are D&D values; use the Luparis line and attacks at the table.', 'Texte du System Reference Document 5.1 (CC BY 4.0), en anglais. Les nombres du texte D&D sont ceux de D&D ; à table, utilise la ligne Luparis et les attaques Luparis.')}</p>`;
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
      if (b.dataset.sbr) {
        const a = monAtk(SBM)[+b.dataset.i];
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
            tot = rs.reduce((x, y) => x + y, 0) + a.mod;
          TKCRIT[key] = false;
          pushRoll(`${esc(nm)} · ${n}d${a.dd}${a.mod ? sgn(a.mod) : ''} [${rs.join(', ')}] = <b>${tot}</b>`);
        }
      }
    });
  }
  const paint = D => {
    dl.innerHTML =
      `<div class="sbbar"><button type="button" id="sb_close" aria-label="${L2('Close', 'Fermer')}">×</button></div>` +
      monBlockHTML(m, D, SBT);
  };
  paint(null);
  if (!dl.open) dl.showModal();
  const en = Array.isArray(m.n) ? m.n[0] : String(m.n),
    k2 = String(m.id).startsWith('s-')
      ? m.id
      : 's-' +
        en
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
  srdDetails().then(o => {
    if (SBM === m && dl.open && o[k2]) paint(o[k2]);
  });
}

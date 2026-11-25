// ---- full backup: every luparis-* entry of this browser in one JSON file
function bkCollect() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    // the AI key never leaves this browser, not even in a backup
    if (k && k.startsWith('luparis-') && !k.startsWith('luparis-ai-key')) {
      data[k] = localStorage.getItem(k);
    }
  }
  return { app: 'luparis', schema: LS_SCHEMA, date: new Date().toISOString(), data };
}
function bkSize() {
  let n = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('luparis-')) n += (localStorage.getItem(k) || '').length;
  }
  return n;
}
function bkOpen() {
  if (typeof saveNow === 'function' && saveT) saveNow();
  if (typeof saveCNow === 'function' && saveCT) saveCNow();
  let d = document.getElementById('bkdlg');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'bkdlg';
    document.body.appendChild(d);
  }
  const kb = Math.round(bkSize() / 1024);
  d.innerHTML = `<h3>${L2('Full backup', 'Sauvegarde complète')}</h3><p class="small">${L2('Characters, bestiary, maps, towns, campaigns, session notes and settings of this browser, in one file. Keep it somewhere safe; import it on another computer to get everything back.', 'Personnages, bestiaire, cartes, villes, campagnes, notes de séance et réglages de ce navigateur, dans un seul fichier. Garde-le en lieu sûr ; importe-le sur un autre ordinateur pour tout retrouver.')}</p><p class="small">${L2('Stored here', 'Stocké ici')} : ${kb} ${L2('KB', 'Ko')}</p>
 <div class="row"><button type="button" class="go" id="bk_exp">${L2('Export', 'Exporter')}</button><label class="btn"><input type="file" id="bk_file" accept="application/json,.json" hidden><span role="button" tabindex="0" class="bkimp">${L2('Import a backup…', 'Importer une sauvegarde…')}</span></label><button type="button" id="bk_close">${L2('Close', 'Fermer')}</button></div><p class="small" id="bk_msg" aria-live="polite"></p>`;
  d.querySelector('#bk_close').onclick = () => d.close();
  d.querySelector('#bk_exp').onclick = () => {
    const b = new Blob([JSON.stringify(bkCollect())], { type: 'application/json' }),
      a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `luparis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    d.querySelector('#bk_msg').textContent = L2('Backup downloaded.', 'Sauvegarde téléchargée.');
  };
  const imp = d.querySelector('.bkimp');
  imp.onclick = () => d.querySelector('#bk_file').click();
  imp.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      imp.click();
    }
  };
  d.querySelector('#bk_file').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const msg = d.querySelector('#bk_msg');
    try {
      const o = JSON.parse(await f.text());
      if (!o || o.app !== 'luparis' || typeof o.data !== 'object') throw 0;
      const keys = Object.keys(o.data).filter(k => /^luparis-[\w-]{1,40}$/.test(k));
      if (
        !confirm(
          L2(
            `Replace this browser's data with the backup of ${String(o.date || '').slice(0, 10)} (${keys.length} entries)?`,
            `Remplacer les données de ce navigateur par la sauvegarde du ${String(o.date || '').slice(0, 10)} (${keys.length} entrées) ?`,
          ),
        )
      )
        return;
      for (const k of keys) {
        const v = o.data[k];
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
      msg.textContent = L2('Imported. Reloading…', 'Importé. Rechargement…');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      msg.textContent = L2('This file is not a Luparis backup.', "Ce fichier n'est pas une sauvegarde Luparis.");
    }
  };
  d.showModal();
}
document.getElementById('bk_open').addEventListener('click', bkOpen);
// ---- universal search (Ctrl+K)
let US = [],
  USI = 0;
function usNorm(x) {
  return String(x || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
function usGo(v) {
  if (location.hash !== '#' + v) {
    location.hash = '#' + v;
  }
}
function usFlash(el) {
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.classList.add('usflash');
  setTimeout(() => el.classList.remove('usflash'), 1400);
  if (el.matches('input,select,textarea,button')) setTimeout(() => el.focus(), 60);
}
function usTool(t, sel, val) {
  usGo('carte');
  setTimeout(() => {
    if (sel) {
      const e = document.getElementById(sel);
      if (e) {
        e.value = val;
        e.dispatchEvent(new Event('change'));
      }
    }
    setTool(t);
  }, 30);
}
function usItems() {
  const gm = MP.role !== 'player' && MP.role !== 'spect',
    I = [],
    ty = (en, fr) => L2(en, fr);
  if (gm)
    for (const m of MON)
      I.push({
        ty: ty('Monster', 'Monstre'),
        n: nm0(m),
        kw: Array.isArray(m.n) ? m.n.join(' ') : '',
        d: `${tyName ? tyName(m.type) : ''} · FP ${m.fp}`,
        go: () => monSheet(m),
        alt: [
          L2('Place', 'Placer'),
          () => {
            placing = m;
            usGo('carte');
            setTool('place');
          },
        ],
      });
  for (const k of tokens) {
    if (!gm && k.hid) continue;
    const nm = k.nm ? tr(k.nm) + (k.num ? ' ' + k.num : '') : k.n || '?';
    I.push({
      ty: ty('Token', 'Token'),
      n: nm,
      d: `${L2('tile', 'case')} ${k.x}, ${k.y}`,
      go: () => {
        usGo('carte');
        selTok = k.id;
        renderTok();
        draw();
      },
    });
  }
  for (const c of CH.list)
    I.push({
      ty: ty('Character', 'Personnage'),
      n: c.name || '?',
      d: c.camp || '',
      go: () => {
        CH.active = c.id;
        C = c;
        usGo('fiche');
        setTimeout(() => {
          renderSheet();
          window.scrollTo(0, 0);
        }, 30);
      },
    });
  if (gm) {
    for (const k of Object.keys(OBJT))
      I.push({
        ty: ty('Object', 'Objet'),
        n: tr(OBJT[k].n),
        kw: OBJT[k].n.join(' '),
        go: () => usTool('obj', 'objk', k),
      });
    for (const k of Object.keys(PREF))
      I.push({
        ty: ty('Building', 'Bâtiment'),
        n: tr(PREF[k]),
        kw: PREF[k].join(' '),
        go: () => usTool('pref', 'prefk', k),
      });
    for (const k of Object.keys(ENVT))
      I.push({
        ty: ty('Effect', 'Effet'),
        n: tr(ENVT[k].n),
        kw: ENVT[k].n.join(' '),
        d: tr(ENVT[k].r),
        go: () => usTool('env', 'envk', k),
      });
    for (const k of Object.keys(TPLK))
      I.push({
        ty: ty('Zone', 'Zone'),
        n: tr(TPLK[k]),
        kw: TPLK[k].join(' '),
        d: L2('area of effect', "zone d'effet"),
        go: () => usTool('tpl', 'tplk', k),
      });
    for (const k of SURF_ORDER)
      if (k)
        I.push({
          ty: ty('Ground', 'Sol'),
          n: tr(FL[k]),
          kw: Array.isArray(FL[k]) ? FL[k].join(' ') : '',
          go: () => usTool('surf', 'surfk', k),
        });
    for (const m of MARKS)
      I.push({
        ty: ty('Landmark', 'Repère'),
        n: m.l || L2('(unnamed)', '(sans nom)'),
        d: `${L2('tile', 'case')} ${m.x}, ${m.y}`,
        go: () => {
          usGo('carte');
          selMark = m.id;
          renderMarks();
          draw();
          setTimeout(() => usFlash(document.querySelector(`#mk_list input[data-id="${esc(m.id)}"]`)), 60);
        },
      });
    if (SN && SN.txt)
      SN.txt
        .split('\n')
        .filter(x => x.trim())
        .forEach(l =>
          I.push({
            ty: ty('Note', 'Note'),
            n: l.slice(0, 90),
            d: L2('session notes', 'notes de séance'),
            go: () => {
              usGo('carte');
              setTimeout(() => usFlash(document.querySelector('#sn_txt,#sn_card textarea')), 60);
            },
          }),
        );
    for (const T of TPLS)
      I.push({
        ty: ty('Zone', 'Zone'),
        n: tplLabel(T),
        go: () => {
          usGo('carte');
          setTimeout(() => usFlash(document.getElementById('tpl_list')), 60);
        },
      });
  }
  // settings: labelled controls across views
  const seen = new Set();
  document
    .querySelectorAll(
      '.view button[id], .view select[id], .view input[id][type=checkbox], header button[data-lang], header button[data-u], .tabs a',
    )
    .forEach(el => {
      if (el.closest('#usdlg')) return;
      if (!gm && el.closest('.gmo')) return;
      let n = (el.getAttribute('aria-label') || el.textContent || '').trim();
      if (el.tagName === 'SELECT' || el.type === 'checkbox') {
        const l = el.closest('label');
        n = l ? (l.textContent || '').trim() : n;
        if (el.tagName === 'SELECT')
          n = (l && l.querySelector('span') ? l.querySelector('span').textContent : n).trim();
      }
      if (!n || n.length > 60 || seen.has(n)) return;
      seen.add(n);
      const v = el.closest('.view'),
        vid = v ? v.id.replace('v-', '') : null;
      I.push({
        ty: el.matches('.tabs a') ? ty('Tab', 'Onglet') : ty('Setting', 'Réglage'),
        n,
        d: vid
          ? {
              monde: L2('World', 'Monde'),
              carte: L2('Map', 'Carte'),
              fiche: L2('Character', 'Personnage'),
              bestiaire: L2('Bestiary', 'Bestiaire'),
              regles: L2('Rules', 'Règles'),
            }[vid]
          : '',
        go: () => {
          if (el.matches('.tabs a')) {
            location.hash = el.getAttribute('href');
            return;
          }
          if (vid) usGo(vid);
          setTimeout(() => usFlash(el.closest('label') || el), 60);
        },
      });
    });
  document.querySelectorAll('#v-regles h2, #v-regles h3').forEach(h => {
    const n = h.textContent.trim();
    if (n)
      I.push({
        ty: ty('Rule', 'Règle'),
        n,
        go: () => {
          usGo('regles');
          setTimeout(() => usFlash(h), 60);
        },
      });
  });
  return I;
}
function usRender() {
  const q = usNorm(document.getElementById('us_q').value).split(/\s+/).filter(Boolean),
    L = document.getElementById('us_res');
  let R = US.map(it => {
    const a = usNorm(it.n),
      b = usNorm(it.ty + ' ' + (it.d || '') + ' ' + (it.kw || ''));
    let sc = 0;
    for (const w of q) {
      if (a.startsWith(w)) sc += 3;
      else if (a.includes(w)) sc += 2;
      else if (b.includes(w)) sc += usNorm(it.kw || '').includes(w) ? 2 : 1;
      else return null;
    }
    return [sc, it];
  }).filter(Boolean);
  R.sort((x, y) => y[0] - x[0] || x[1].n.length - y[1].n.length);
  R = R.slice(0, q.length ? 40 : 0).map(x => x[1]);
  usRender.R = R;
  USI = Math.min(USI, Math.max(0, R.length - 1));
  L.innerHTML = R.length
    ? R.map(
        (it, i) =>
          `<li role="option" id="us_o${i}" data-usi="${i}" aria-selected="${i === USI}"><span class="ust">${esc(it.ty)}</span><span>${esc(it.n)}${it.d ? ` <span class="usd">· ${esc(it.d)}</span>` : ''}</span>${it.alt ? `<button type="button" data-usalt="${i}">${esc(it.alt[0])}</button>` : '<span></span>'}</li>`,
      ).join('')
    : `<li class="empty">${q.length ? L2('Nothing found.', 'Rien trouvé.') : L2('Type a monster, object, effect, token, note or setting…', 'Tape un monstre, objet, effet, token, note ou réglage…')}</li>`;
  document.getElementById('us_q').setAttribute('aria-activedescendant', R.length ? 'us_o' + USI : '');
}
function usOpen() {
  // the rules are part of the index: load them once in the background, then refresh the list
  if (rulesShown !== lang) {
    const r = rules(true);
    if (r && r.then)
      r.then(() => {
        const dl = document.getElementById('usdlg');
        if (dl && dl.open) {
          US = usItems();
          usRender();
        }
      });
  }
  let d = document.getElementById('usdlg');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'usdlg';
    d.innerHTML = `<input id="us_q" type="search" autocomplete="off" role="combobox" aria-controls="us_res" aria-expanded="true"><ul id="us_res" role="listbox"></ul>`;
    document.body.appendChild(d);
    const q = d.querySelector('#us_q');
    q.addEventListener('input', () => {
      USI = 0;
      usRender();
    });
    q.addEventListener('keydown', e => {
      const R = usRender.R || [];
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        USI = Math.min(R.length - 1, USI + 1);
        usRender();
        document.getElementById('us_o' + USI)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        USI = Math.max(0, USI - 1);
        usRender();
        document.getElementById('us_o' + USI)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && R[USI]) {
        e.preventDefault();
        usPick(R[USI], e.shiftKey);
      }
    });
    d.addEventListener('click', e => {
      if (e.target === d) {
        d.close();
        return;
      }
      const a = e.target.closest('[data-usalt]');
      if (a) {
        usPick(usRender.R[+a.dataset.usalt], true);
        return;
      }
      const li = e.target.closest('[data-usi]');
      if (li) usPick(usRender.R[+li.dataset.usi]);
    });
  }
  US = usItems();
  USI = 0;
  const q = d.querySelector('#us_q');
  q.placeholder = L2(
    'Search monsters, objects, effects, tokens, notes, settings…',
    'Rechercher monstres, objets, effets, tokens, notes, réglages…',
  );
  q.setAttribute('aria-label', q.placeholder);
  q.value = '';
  usRender();
  d.showModal();
  q.focus();
}
function usPick(it, alt) {
  if (!it) return;
  document.getElementById('usdlg').close();
  if (alt && it.alt) it.alt[1]();
  else it.go();
}
function usBtn() {
  const b = document.getElementById('us_open');
  const label = L2('Search', 'Rechercher');
  b.setAttribute('aria-label', label);
  b.innerHTML = `<span aria-hidden="true">🔍</span><span class="us-label">${esc(label)}</span><kbd>Ctrl K</kbd>`;
}
document.getElementById('us_open').addEventListener('click', usOpen);
document.addEventListener(
  'keydown',
  e => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      e.stopPropagation();
      usOpen();
    }
  },
  true,
);
usBtn();
// ---- contextual tool hint + placement preview
function toolHint() {
  const el = document.getElementById('thint');
  if (!el) return;
  const H = {
    shift: [
      'Drag an object or a marker to another square.',
      'Glisse un objet ou un repère vers une autre case.',
    ],
    move: [
      'Drag a token; double-click a monster for its sheet.',
      'Glisse un token ; double-clic sur un monstre pour sa fiche.',
    ],
    up: ['Click or drag: raise the ground by one level.', "Clic ou glisser : monte le sol d'un niveau."],
    down: ['Click or drag: lower the ground.', 'Clic ou glisser : baisse le sol.'],
    flat: ['Click or drag: back to ground level.', 'Clic ou glisser : remet au niveau du sol.'],
    measure: ['Drag from one tile to another.', "Glisse d'une case à l'autre."],
    mark: ['Click to drop a marker.', 'Clique pour poser un repère.'],
    hide: [
      'Click a token, object, marker, hazard or zone: hidden from players, or shown again.',
      'Clique sur un token, un objet, un repère, un danger ou une zone : caché aux joueurs, ou de nouveau visible.',
    ],
    surf: ['Paint the chosen surface.', 'Peins la surface choisie.'],
    env: ['Paint a hazard with its DC.', 'Peins un danger avec son DD.'],
    tpl: [
      'Circle, sphere, cube: one click. Cone, line: origin, then direction.',
      'Cercle, sphère, cube : un clic. Cône, ligne : origine, puis direction.',
    ],
    obj: [
      'Preview follows the mouse. Shift + wheel or ⟳ rotates.',
      "L'aperçu suit la souris. Maj + molette ou ⟳ pour tourner.",
    ],
    pref: [
      'The ghost shows footprint, rotation and wall height. Shift + wheel or ⟳ rotates, 🎲 rerolls the plan.',
      "Le fantôme montre l'empreinte, la rotation et la hauteur des murs. Maj + molette ou ⟳ pour tourner, 🎲 pour un autre plan.",
    ],
  };
  el.textContent = H[tool] ? tr(H[tool]) : '';
  const a = document.getElementById('objrot'),
    b = document.getElementById('prefrot'),
    c = document.getElementById('prefroll');
  if (a) a.textContent = '⟳ ' + OBJR * 90 + '°';
  if (b) b.textContent = '⟳ ' + (PREFP ? PREFP.r : 0) * 90 + '°';
  if (c) c.textContent = '🎲 ' + L2('Other plan', 'Autre plan');
}
function rotPend(d) {
  if (tool === 'obj') OBJR = (OBJR + d + 4) % 4;
  else if (tool === 'pref') {
    const p = prefPend();
    p.r = (p.r + d + 4) % 4;
  }
  toolHint();
  draw();
}
document.getElementById('objrot').addEventListener('click', () => rotPend(1));
document.getElementById('prefrot').addEventListener('click', () => rotPend(1));
document.getElementById('prefroll').addEventListener('click', () => {
  const r = PREFP ? PREFP.r : 0;
  PREFP = { k: prefSel, P: prefGen(prefSel, Math.random), r };
  toolHint();
  draw();
});
cv.addEventListener(
  'wheel',
  e => {
    if (e.shiftKey && (tool === 'obj' || tool === 'pref')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      rotPend(e.deltaY > 0 ? 1 : -1);
    }
  },
  { passive: false, capture: true },
);
function drawPlacePreview() {
  if (!hover || MP.role === 'player') return;
  const c = hover;
  const lab = (t, x, y) => {
    ctx.font = `700 ${Math.max(11, Math.min(15, TW * 0.3))}px "Alegreya Sans",sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,.92)';
    ctx.strokeText(t, x, y);
    ctx.fillStyle = '#1d1a17';
    ctx.fillText(t, x, y);
  };
  if (tool === 'obj') {
    if (c.x < 0 || c.y < 0 || c.x >= N || c.y >= N) return;
    const h = Math.max(H[c.x][c.y], 0),
      [vx, vy] = view(c.x, c.y);
    poly(tileCorners(vx, vy, h), 'rgba(90,140,60,.25)', 'rgba(60,110,40,.9)', 1.5);
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawObj({ x: c.x, y: c.y, k: objSel, o: false, r: OBJR }, vx, vy, h);
    ctx.restore();
    const [cx, cy] = scr(vx + 0.5, vy, h);
    lab(`${tr(OBJT[objSel].n)} · ${OBJR * 90}°`, cx, cy - LH * 2.2);
    return;
  }
  if (tool === 'pref') {
    const p = prefPend(),
      L = prefLay(c, p.P, p.r);
    if (L.W > N || L.Hh > N) return;
    let top = 1e9,
      cxm = 0;
    for (let x = 0; x < p.P.w; x++)
      for (let y = 0; y < p.P.h; y++) {
        const [a, b] = L.tf(x, y),
          gx = L.x0 + a,
          gy = L.y0 + b,
          [vx, vy] = view(gx, gy),
          wall = p.P.G[x][y] === 'W';
        if (wall) {
          const g = tileCorners(vx, vy, 0),
            t = tileCorners(vx, vy, p.P.wh);
          ctx.strokeStyle = 'rgba(60,50,40,.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (const i of [2, 3]) {
            ctx.moveTo(g[i][0], g[i][1]);
            ctx.lineTo(t[i][0], t[i][1]);
          }
          ctx.stroke();
          poly(t, 'rgba(110,90,70,.45)', 'rgba(60,45,30,.9)', 1.2);
          if (t[0][1] < top) {
            top = t[0][1];
            cxm = t[0][0] + TW / 2;
          }
        } else poly(tileCorners(vx, vy, 0), 'rgba(200,170,110,.35)', 'rgba(140,110,60,.7)', 1);
      }
    for (const o of p.P.O) {
      const [a, b] = L.tf(o.x, o.y),
        [vx, vy] = view(L.x0 + a, L.y0 + b);
      ctx.save();
      ctx.globalAlpha = 0.5;
      drawObj({ x: L.x0 + a, y: L.y0 + b, k: o.k, o: o.o }, vx, vy, 0);
      ctx.restore();
    }
    const cs = [
      [L.x0, L.y0],
      [L.x0 + L.W, L.y0],
      [L.x0 + L.W, L.y0 + L.Hh],
      [L.x0, L.y0 + L.Hh],
    ].map(([x, y]) => {
      const [vx, vy] = view(Math.min(x, N - 1), Math.min(y, N - 1));
      return scr(vx + 0.5, vy, 0);
    });
    lab(
      `${tr(PREF[p.k])} · ${L.W}×${L.Hh} · ${p.r * 90}° · ${L2('walls', 'murs')} h${p.P.wh}`,
      cxm || cs[0][0],
      (top < 1e9 ? top : cs[0][1]) - 10,
    );
  }
}
// ---- area templates (circle, sphere, cone, line, cube)
((TPLK = {
  circle: ['Circle', 'Cercle'],
  sphere: ['Sphere', 'Sphère'],
  cone: ['Cone', 'Cône'],
  line: ['Line', 'Ligne'],
  cube: ['Cube', 'Cube'],
}),
  (TPLC = { circle: '255,140,40', sphere: '170,90,220', cone: '230,70,60', line: '60,150,230', cube: '70,170,110' }));

function fillTpl() {
  const a = document.getElementById('tplk');
  if (a)
    a.innerHTML = Object.keys(TPLK)
      .map(k => `<option value="${k}"${k === tplSel ? ' selected' : ''}>${esc(tr(TPLK[k]))}</option>`)
      .join('');
}
function tplSize() {
  return Math.max(5, Math.min(300, Math.round((+document.getElementById('tplsz').value || 20) / 5) * 5));
}
function tplCells(T) {
  const L = T.s / 5,
    out = [],
    ox = T.x + 0.5,
    oy = T.y + 0.5,
    ca = Math.cos(T.a || 0),
    sa = Math.sin(T.a || 0);
  for (let x = Math.max(0, Math.floor(T.x - L - 1)); x <= Math.min(N - 1, Math.ceil(T.x + L + 1)); x++)
    for (let y = Math.max(0, Math.floor(T.y - L - 1)); y <= Math.min(N - 1, Math.ceil(T.y + L + 1)); y++) {
      const dx = x + 0.5 - ox,
        dy = y + 0.5 - oy,
        d = Math.hypot(dx, dy);
      let ok = false;
      if (T.k === 'circle' || T.k === 'sphere') ok = d <= L + 0.01;
      else if (T.k === 'cube') ok = Math.abs(dx) <= L / 2 + 0.01 && Math.abs(dy) <= L / 2 + 0.01;
      else {
        const al = dx * ca + dy * sa,
          pe = Math.abs(-dx * sa + dy * ca);
        if (T.k === 'line') ok = al > 0.01 && al <= L + 0.01 && pe <= 0.5;
        else ok = d > 0.01 && al > 0 && d <= L + 0.01 && pe <= al * 0.5 + 0.01;
      }
      if (ok) out.push([x, y]);
    }
  return out;
}
function tplTokens(T) {
  const set = new Set(tplCells(T).map(([x, y]) => x + ',' + y));
  return tokens.filter(k => {
    const n = tfp(k);
    for (let i = k.x; i < k.x + n; i++) for (let j = k.y; j < k.y + n; j++) if (set.has(i + ',' + j)) return true;
    return false;
  });
}
function tplLabel(T) {
  const n = tplTokens(T).length;
  return `${tr(TPLK[T.k])} ${T.s} ft · ${n} ${L2(n === 1 ? 'target' : 'targets', n > 1 ? 'cibles' : 'cible')}`;
}
// hidden from players: the GM sees it faded
function drawTpl(a, ...r) {
  if (!(a && a.hid)) return drawTpl0(a, ...r);
  ctx.save();
  ctx.globalAlpha *= 0.4;
  const v = drawTpl0(a, ...r);
  ctx.restore();
  return v;
}
function drawTpl0(T, ghost) {
  const col = TPLC[T.k] || '255,140,40';
  for (const [x, y] of tplCells(T)) {
    const [vx, vy] = view(x, y),
      h = Math.max(H[x][y], 0);
    poly(tileCorners(vx, vy, h), `rgba(${col},${ghost ? 0.2 : 0.3})`, `rgba(${col},.85)`, ghost ? 1 : 1.4);
  }
  if (T.x < 0 || T.y < 0 || T.x >= N || T.y >= N) return;
  const [cx, cy] = ctr(T);
  if (T.k === 'sphere') {
    const r = (T.s / 5) * TW * 0.72;
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.6, r * 0.1, cx, cy - r * 0.3, r);
    g.addColorStop(0, `rgba(${col},.05)`);
    g.addColorStop(1, `rgba(${col},.28)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.25, r, r * 0.75, 0, Math.PI, 0);
    ctx.ellipse(cx, cy - r * 0.25, r, r * 0.32, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = `rgba(${col},.7)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.fillStyle = `rgb(${col})`;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(3, TW * 0.08), 0, 7);
  ctx.fill();
  if (!ghost || 1) {
    ctx.font = `700 ${Math.max(11, Math.min(15, TW * 0.3))}px "Alegreya Sans",sans-serif`;
    ctx.textAlign = 'center';
    const tx = tplLabel(T);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.strokeText(tx, cx, cy - Math.max(8, TW * 0.25));
    ctx.fillStyle = '#1d1a17';
    ctx.fillText(tx, cx, cy - Math.max(8, TW * 0.25));
  }
}
function drawTpls() {
  for (const T of TPLS) drawTpl(T);
}
function drawTplGhost() {
  if (tool === 'tpl' && hover) {
    const k = tplSel,
      needAim = k === 'cone' || k === 'line';
    if (needAim && TPLA) {
      const a = Math.atan2(hover.y - TPLA.y, hover.x - TPLA.x);
      drawTpl({ k, x: TPLA.x, y: TPLA.y, a, s: tplSize() }, true);
    } else if (!needAim) drawTpl({ k, x: hover.x, y: hover.y, a: 0, s: tplSize() }, true);
    else drawTpl({ k, x: hover.x, y: hover.y, a: 0, s: tplSize() }, true);
  }
}
function tplClick(c) {
  const k = tplSel,
    needAim = k === 'cone' || k === 'line';
  if (needAim && !TPLA) {
    TPLA = { x: c.x, y: c.y };
    draw();
    return;
  }
  if (needAim && c.x === TPLA.x && c.y === TPLA.y) return;
  snap();
  const T = needAim
    ? { k, x: TPLA.x, y: TPLA.y, a: Math.atan2(c.y - TPLA.y, c.x - TPLA.x), s: tplSize(), id: tid() }
    : { k, x: c.x, y: c.y, a: 0, s: tplSize(), id: tid() };
  TPLA = null;
  if (MP.role === 'player') {
    T.by = MP.me;
    TPLS.push(T);
    mpSend({ type: 'tpl', T });
    draw();
    renderTpls();
    return;
  }
  TPLS.push(T);
  save();
  draw();
  renderTpls();
}
function renderTpls() {
  const L = document.getElementById('tpl_list');
  if (!L) return;
  L.innerHTML = TPLS.length
    ? TPLS.map(
        (T, i) =>
          `<li><span style="color:rgb(${TPLC[T.k]})">●</span> ${esc(tplLabel(T))}${
            tplTokens(T).length
              ? `<div class="small">${tplTokens(T)
                  .map(k => esc(k.nm ? tr(k.nm) + (k.num ? ' ' + k.num : '') : k.n))
                  .join(', ')}</div>`
              : ''
          }${MP.role !== 'player' || (T.by && T.by === MP.me) ? `<button type="button" data-tpx="${i}" aria-label="${L2('Remove', 'Retirer')}">×</button>` : ''}</li>`,
      ).join('') +
      (MP.role !== 'player'
        ? `<li><button type="button" data-tpx="all">${L2('Clear all zones', 'Effacer toutes les zones')}</button></li>`
        : '')
    : `<li class="small">${L2('No zone. Tool “Zone”: click to place a circle, sphere or cube; for a cone or a line, click the origin then the direction.', "Aucune zone. Outil « Zone » : clique pour poser un cercle, une sphère ou un cube ; pour un cône ou une ligne, clique l'origine puis la direction.")}</li>`;
}
document.getElementById('tplk').addEventListener('change', e => {
  tplSel = e.target.value;
  TPLA = null;
  setTool('tpl');
});
document.getElementById('tplsz').addEventListener('input', () => draw());
document.getElementById('tpl_list').addEventListener('click', e => {
  const b = e.target.closest('[data-tpx]');
  if (!b) return;
  if (MP.role === 'player') {
    const T = TPLS[+b.dataset.tpx];
    if (T && T.by === MP.me) {
      TPLS.splice(+b.dataset.tpx, 1);
      mpSend({ type: 'tpldel', id: T.id });
      draw();
      renderTpls();
    }
    return;
  }
  snap();
  if (b.dataset.tpx === 'all') TPLS = [];
  else TPLS.splice(+b.dataset.tpx, 1);
  save();
  draw();
  renderTpls();
});
renderTpls();
fillTpl();

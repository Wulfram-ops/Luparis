// ---- right-click menus: extra actions live here, so cards and the map stay uncluttered
// items: { label, fn, danger, confirm } | { head: 'title' } | { sep: true }
let MENU = null;
function menuClose() {
  if (MENU) MENU.remove();
  MENU = null;
}
function ctxMenu(x, y, items) {
  menuClose();
  items = items.filter(Boolean);
  if (!items.some(i => i.fn)) return;
  const m = document.createElement('div');
  m.className = 'ctxm';
  m.setAttribute('role', 'menu');
  for (const it of items) {
    if (it.sep) {
      m.insertAdjacentHTML('beforeend', '<hr>');
      continue;
    }
    if (it.head) {
      m.insertAdjacentHTML('beforeend', `<div class="ctxh">${esc(it.head)}</div>`);
      continue;
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitem');
    b.textContent = it.label;
    if (it.danger) b.className = 'ko';
    b.onclick = () => {
      // dangerous actions ask a second click
      if (it.confirm && !b.dataset.armed) {
        b.dataset.armed = '1';
        b.textContent = it.confirm;
        return;
      }
      menuClose();
      it.fn();
    };
    m.append(b);
  }
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + 'px';
  m.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + 'px';
  MENU = m;
  const first = m.querySelector('button');
  if (first) first.focus();
}
addEventListener('pointerdown', e => {
  if (MENU && !MENU.contains(e.target)) menuClose();
});
addEventListener('keydown', e => {
  if (!MENU) return;
  if (e.key === 'Escape') return menuClose();
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const B = [...MENU.querySelectorAll('button')],
      i = B.indexOf(document.activeElement);
    B[(i + (e.key === 'ArrowDown' ? 1 : B.length - 1)) % B.length].focus();
  }
});
addEventListener('resize', menuClose);
addEventListener('scroll', menuClose, true);

// characters tab: campaign folders and character cards
document.getElementById('v-fiche').addEventListener('contextmenu', e => {
  if (MP.role === 'player') return;
  const card = e.target.closest('.cc'),
    folder = e.target.closest('details[data-campfolder]');
  if (card) {
    const id = (card.querySelector('[data-open]') || {}).dataset?.open,
      c = CH.list.find(x => x.id === id);
    if (!c) return;
    e.preventDefault();
    const here = c.camp || '';
    ctxMenu(e.clientX, e.clientY, [
      { head: c.name || '?' },
      {
        label: L2('Open the sheet', 'Ouvrir la fiche'),
        fn: () => {
          CH.active = c.id;
          C = c;
          renderSheet();
        },
      },
      { sep: true },
      { head: L2('Move to', 'Déplacer vers') },
      ...['', ...campaignFolders()]
        .filter(n => n !== here)
        .map(n => ({ label: n || t('sk_nocamp'), fn: () => moveCharacterCampaign(c, n) })),
      { sep: true },
      {
        label: L2('Delete this character', 'Supprimer ce personnage'),
        danger: true,
        confirm: L2('Click again to delete', 'Clique encore pour supprimer'),
        fn: () => {
          CH.list = CH.list.filter(x => x.id !== c.id);
          tokens = tokens.filter(k => k.cid !== c.id);
          if (C && C.id === c.id) C = CH.list[0] || null;
          save();
          saveC();
          renderSheet();
        },
      },
    ]);
    return;
  }
  if (folder) {
    const name = folder.dataset.campfolder;
    if (!name) return;
    e.preventDefault();
    ctxMenu(e.clientX, e.clientY, [
      { head: name },
      {
        label: L2('Rename', 'Renommer'),
        fn: () => {
          const tt = folder.querySelector('.cf-title');
          tt.innerHTML = `<input class="cf-ren" maxlength="60" value="${esc(name)}" aria-label="${L2('New name', 'Nouveau nom')}">`;
          const inp = tt.querySelector('input');
          inp.focus();
          inp.select();
          const done = ok => {
            if (ok && renameCampaign(name, inp.value)) return;
            renderSheet();
          };
          inp.onkeydown = ev => {
            ev.stopPropagation();
            if (ev.key === 'Enter') done(true);
            else if (ev.key === 'Escape') done(false);
          };
          inp.onclick = ev => ev.preventDefault();
          inp.onblur = () => done(true);
        },
      },
      {
        label: folder.open ? L2('Collapse', 'Replier') : L2('Expand', 'Déplier'),
        fn: () => (folder.open = !folder.open),
      },
      { sep: true },
      {
        label: L2('Delete the campaign', 'Supprimer la campagne'),
        danger: true,
        confirm: L2('Click again: characters are kept', 'Clique encore : les personnages sont gardés'),
        fn: () => deleteCampaign(name),
      },
    ]);
  }
});

// map: tokens, objects and markers (move tool), for the game master
{
  let rdown = null;
  cv.addEventListener('pointerdown', e => {
    if (e.button === 2) rdown = { x: e.clientX, y: e.clientY };
  });
  cv.addEventListener('contextmenu', e => {
    if (MP.role === 'player' || tool !== 'move' || !rdown || Math.hypot(e.clientX - rdown.x, e.clientY - rdown.y) > 6)
      return;
    const [mx, my] = pos(e),
      c = pick(mx, my);
    if (!c) return;
    const done = () => {
        save();
        draw();
        if (typeof renderIni === 'function') renderIni();
      },
      hideItem = x => ({
        label: x.hid ? L2('Show to players', 'Montrer aux joueurs') : L2('Hide from players', 'Cacher aux joueurs'),
        fn: () => hideToggle(c),
      }),
      i = tokAt(c);
    if (i >= 0) {
      const k = tokens[i],
        m = k.mid && MON.find(x => x.id === k.mid);
      ctxMenu(e.clientX, e.clientY, [
        { head: k.nm ? `${tr(k.nm)} ${k.num || ''}` : k.n || '' },
        m && { label: L2('Monster sheet', 'Fiche du monstre'), fn: () => monSheet(m, k) },
        k.cid && {
          label: L2('Character sheet', 'Fiche du personnage'),
          fn: () => {
            CH.active = k.cid;
            C = CH.list.find(x => x.id === k.cid) || C;
            location.hash = '#fiche';
            renderSheet();
          },
        },
        hideItem(k),
        !k.cid && {
          label: L2('Duplicate', 'Dupliquer'),
          fn: () => {
            snap();
            const n = tfp(k);
            for (let r = 1; r < 6; r++)
              for (let dx = -r; dx <= r; dx++)
                for (let dy = -r; dy <= r; dy++)
                  if (fits(k.x + dx, k.y + dy, n)) {
                    tokens.push({
                      ...k,
                      id: tid(),
                      x: k.x + dx,
                      y: k.y + dy,
                      num: (k.num || 1) + 1,
                      hp: k.hpMax || k.hp,
                    });
                    return done();
                  }
          },
        },
        { sep: true },
        {
          label: L2('Remove from the map', 'Retirer de la carte'),
          danger: true,
          fn: () => {
            snap();
            tokens.splice(i, 1);
            INI.o = INI.o.filter(o => o.id !== k.id);
            done();
          },
        },
      ]);
      return;
    }
    const oi = objAt(c.x, c.y);
    if (oi >= 0) {
      const o = OBJS[oi];
      ctxMenu(e.clientX, e.clientY, [
        { head: tr(OBJT[o.k].n) },
        ['door', 'chest', 'trap', 'lever'].includes(o.k) && {
          label: o.o ? L2('Close', 'Fermer') : L2('Open', 'Ouvrir'),
          fn: () => {
            o.o = !o.o;
            done();
          },
        },
        {
          label: L2('Turn', 'Tourner'),
          fn: () => {
            o.r = ((o.r || 0) + 1) % 4;
            done();
          },
        },
        hideItem(o),
        { sep: true },
        {
          label: L2('Remove', 'Retirer'),
          danger: true,
          fn: () => {
            snap();
            OBJS.splice(OBJS.indexOf(o), 1);
            done();
          },
        },
      ]);
      return;
    }
    const mk = MARKS.find(q => q.x === c.x && q.y === c.y);
    if (mk)
      ctxMenu(e.clientX, e.clientY, [
        { head: mk.l || L2('Marker', 'Repère') },
        hideItem(mk),
        {
          label: L2('Remove', 'Retirer'),
          danger: true,
          fn: () => {
            MARKS.splice(MARKS.indexOf(mk), 1);
            if (typeof renderMarks === 'function') renderMarks();
            done();
          },
        },
      ]);
  });
}

// images card
document.getElementById('img_card').addEventListener('contextmenu', e => {
  const im = e.target.closest('[data-imgi]');
  if (!im || MP.role === 'player') return;
  const x = IMGS.find(y => y.id === im.dataset.imgi);
  if (!x) return;
  e.preventDefault();
  const on = IMGSHOW && IMGSHOW.id === x.id;
  ctxMenu(e.clientX, e.clientY, [
    { head: x.n },
    {
      label: on ? L2('Hide from the players', 'Masquer aux joueurs') : L2('Show to the players', 'Montrer aux joueurs'),
      fn: () => imgShow(on ? null : x),
    },
    { label: L2('Enlarge', 'Agrandir'), fn: () => imgZoom(x) },
    { sep: true },
    {
      label: L2('Delete', 'Supprimer'),
      danger: true,
      confirm: L2('Click again to delete', 'Clique encore pour supprimer'),
      fn: () => {
        if (on) imgShow(null);
        imgTx('readwrite', s => s.delete(x.id)).then(imgLoad);
      },
    },
  ]);
});

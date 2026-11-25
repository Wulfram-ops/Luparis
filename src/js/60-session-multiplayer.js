// ---- session notes (GM)
var SN = null;
try {
  SN = lsGet('luparis-session', null);
} catch (e) {}
function snNew() {
  return { t: '', start: Date.now(), txt: '' };
}
if (!SN || typeof SN !== 'object') SN = snNew();
function snSave() {
  lsSet('luparis-session', SN);
}
function snHist() {
  try {
    return lsGet('luparis-sessions', null) || [];
  } catch (e) {
    return [];
  }
}
function snRender() {
  const B = document.getElementById('sn_box');
  if (!B) return;
  const ac = document.activeElement;
  if (B.contains(ac) && (ac.id === 'sn_txt' || ac.id === 'sn_t')) return;
  const H = snHist();
  B.innerHTML = `<p class="small">${L2('Game master only. Notes for the session report; export them at the end.', 'Réservé au MJ. Notes pour le compte rendu ; exporte-les à la fin.')}</p>
 <label><span class="small">${L2('Session', 'Séance')}</span><input id="sn_t" value="${esc(SN.t)}" placeholder="${L2('Session 11, the Thorn Queen', 'Séance 11, la Reine des ronces')}"></label>
 <textarea id="sn_txt" rows="9" placeholder="${L2('What happened, decisions, NPCs met, loot, hooks for next time…', "Ce qui s'est passé, décisions, PNJ rencontrés, butin, pistes pour la suite…")}">${esc(SN.txt)}</textarea>
 <div class="row sn_row"><button type="button" id="sn_stamp">${L2('Timestamp', 'Horodater')}</button><button type="button" id="sn_roll">${L2('Add last roll', 'Ajouter le dernier jet')}</button></div>
 <div class="row sn_row"><button type="button" class="go" id="sn_exp">${L2('Export (.md)', 'Exporter (.md)')}</button><button type="button" id="sn_copy">${L2('Copy', 'Copier')}</button><button type="button" id="sn_end">${L2('End the session', 'Clore la séance')}</button></div><p class="small" id="sn_msg" aria-live="polite"></p>
 ${H.length ? `<details><summary class="small">${L2('Past sessions', 'Séances passées')} (${H.length})</summary><ul class="snh">${H.map((x, i) => `<li><span>${esc(x.t || new Date(x.start).toLocaleDateString(lang))}</span><button type="button" data-snd="${i}">.md</button></li>`).join('')}</ul></details>` : ''}`;
}
function snMd(S) {
  const d = new Date(S.start),
    xp = [];
  try {
    const o = lsGet('luparis-camps', null) || {};
    for (const n in o)
      for (const e of o[n].log || [])
        if (e.d >= S.start && (!S.end || e.d <= S.end)) xp.push(`- ${n} : ${e.x >= 0 ? '+' : ''}${e.x} XP (${e.l})`);
  } catch (e) {}
  const rolls = (RL || [])
    .filter(r => r.t >= S.start && (!S.end || r.t <= S.end))
    .reverse()
    .map(
      r =>
        `- ${new Date(r.t).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })} ${r.s ? r.s + ' · ' : ''}${r.h.replace(/<[^>]+>/g, '')}`,
    );
  return (
    `# ${S.t || L2('Session', 'Séance')} — ${d.toLocaleDateString(lang)}\n\n${S.txt.trim()}\n` +
    (xp.length ? `\n## XP\n${xp.join('\n')}\n` : '') +
    (rolls.length ? `\n## ${L2('Rolls', 'Jets')}\n${rolls.join('\n')}\n` : '')
  );
}
function snDownload(S) {
  const b = new Blob([snMd(S)], { type: 'text/markdown' }),
    a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download =
    ((S.t || 'seance')
      .replace(/[^\w\- àâçéèêëîïôûùüÿ]/gi, '')
      .trim()
      .replace(/\s+/g, '-') || 'seance') +
    '-' +
    (d0 =>
      d0.getFullYear() +
      '-' +
      String(d0.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d0.getDate()).padStart(2, '0'))(new Date(S.start)) +
    '.md';
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
document.getElementById('sn_card').addEventListener('input', e => {
  if (e.target.id === 'sn_txt') SN.txt = e.target.value;
  else if (e.target.id === 'sn_t') SN.t = e.target.value;
  else return;
  clearTimeout(window._snT);
  window._snT = setTimeout(snSave, 300);
});
document.getElementById('sn_card').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const T = document.getElementById('sn_txt'),
    ins = s => {
      const p = T.selectionStart ?? T.value.length;
      T.value = T.value.slice(0, p) + s + T.value.slice(T.selectionEnd ?? p);
      SN.txt = T.value;
      snSave();
      T.focus();
      T.selectionStart = T.selectionEnd = p + s.length;
    },
    msg = m => {
      const x = document.getElementById('sn_msg');
      if (x) {
        x.textContent = m;
        setTimeout(() => {
          x.textContent = '';
        }, 3000);
      }
    };
  if (b.id === 'sn_stamp')
    ins(
      (T.value && !T.value.endsWith('\n') ? '\n' : '') +
        '[' +
        new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) +
        '] ',
    );
  else if (b.id === 'sn_roll') {
    if (RL && RL[0])
      ins(
        (T.value && !T.value.endsWith('\n') ? '\n' : '') +
          (RL[0].s ? RL[0].s + ' · ' : '') +
          RL[0].h.replace(/<[^>]+>/g, '') +
          '\n',
      );
  } else if (b.id === 'sn_exp') snDownload(SN);
  else if (b.id === 'sn_copy') {
    navigator.clipboard.writeText(snMd(SN)).then(
      () => msg(L2('Copied.', 'Copié.')),
      () => msg(L2('Copy failed.', 'Copie impossible.')),
    );
  } else if (b.id === 'sn_end') {
    if (!b.dataset.armed) {
      b.dataset.armed = '1';
      b.textContent = L2(
        'Confirm: export and start a new session',
        'Confirmer : exporter et commencer une nouvelle séance',
      );
      setTimeout(() => {
        if (b.isConnected) {
          delete b.dataset.armed;
          b.textContent = L2('End the session', 'Clore la séance');
        }
      }, 4000);
      return;
    }
    SN.end = Date.now();
    snDownload(SN);
    const H = snHist();
    H.unshift(SN);
    lsSet('luparis-sessions', H.slice(0, 50));
    SN = snNew();
    snSave();
    snRender();
    msg(L2('Session exported and archived.', 'Séance exportée et archivée.'));
  } else if (b.dataset.snd != null) {
    const S = snHist()[+b.dataset.snd];
    if (S) snDownload(S);
  }
});
snRender();

// ---- multiplayer (test): host = GM, players join with a code. PeerJS (WebRTC) or ?local=1 (BroadcastChannel, same browser)
MP.uid = Math.random().toString(36).slice(2, 10);
MP.local = /[?&]local=1/.test(location.search);
function mpState() {
  return { type: 'state', map: memStateNow(), chars: CH.list, rolls: RL.slice(0, 40), code: MP.code };
}
function mpSend(o, conn) {
  const txt = o;
  if (MP.local) {
    MP.bc && MP.bc.postMessage(JSON.stringify({ ...o, from: MP.uid }));
    return;
  }
  if (MP.role === 'host') {
    for (const c of conn ? [conn] : MP.conns)
      if (c.open)
        try {
          c.send(txt);
        } catch (e) {}
  } else if (MP.conn && MP.conn.open)
    try {
      MP.conn.send(txt);
    } catch (e) {}
}
let mpT = null;
function mpPush() {
  if (MP.role !== 'host') return;
  clearTimeout(mpT);
  mpT = setTimeout(() => mpSend(mpState()), 200);
}
function mpPlayerSave() {
  if (!MP.me) return;
  mpSend({
    type: 'tokens',
    me: MP.me,
    t: tokens.filter(k => k.cid === MP.me).map(k => ({ id: k.id, x: k.x, y: k.y, hp: k.hp })),
  });
}
function mpSendChar() {
  const c = CH.list.find(x => x.id === MP.me);
  if (c) mpSend({ type: 'char', c });
}
// what a player may change on its own character, with types checked
function cleanCharPatch(c) {
  const N = (v, a, b) => {
      v = Math.round(+v);
      return isFinite(v) ? Math.max(a, Math.min(b, v)) : 0;
    },
    S = (v, n) => String(v == null ? '' : v).slice(0, n),
    o = {};
  if (c.used && typeof c.used === 'object') {
    o.used = {};
    for (const k of Object.keys(c.used).slice(0, 20)) if (/^\w{1,12}$/.test(k)) o.used[k] = N(c.used[k], 0, 999);
  }
  if (c.inv && typeof c.inv === 'object') {
    const g = c.inv.gold || {},
      p = c.inv.pot || {};
    o.inv = {
      gold: { h: N(g.h, 0, 1e6), b: N(g.b, 0, 1e6), c: N(g.c, 0, 1e6) },
      pot: {},
      items: (Array.isArray(c.inv.items) ? c.inv.items : [])
        .slice(0, 200)
        .map(x => ({ n: S(x && x.n, 60), q: N(x && x.q, 0, 9999), no: S(x && x.no, 600) })),
    };
    for (const k of Object.keys(p).slice(0, 40)) if (/^\w{1,20}$/.test(k)) o.inv.pot[k] = N(p[k], 0, 999);
  }
  if (c.notes != null) o.notes = S(c.notes, 5000);
  if (Array.isArray(c.corder)) o.corder = c.corder.slice(0, 40).map(x => S(x, 40));
  return o;
}
function mpHostMsg(m, conn) {
  if (m.type === 'hello') {
    mpSend(mpState(), conn);
    return;
  }
  if (conn && (m.type === 'tokens' || m.type === 'char')) {
    const id = m.type === 'tokens' ? m.me : m.c && m.c.id;
    if (!conn.me) conn.me = id;
    else if (conn.me !== id) return;
  }
  if (m.type === 'tokens') {
    for (const u of m.t || []) {
      const k = tokens.find(x => x.id === u.id && x.cid === m.me);
      if (!k) continue;
      const n = tfp(k);
      if (fits(u.x, u.y, n, k.id)) {
        k.x = u.x;
        k.y = u.y;
      }
      if (typeof u.hp === 'number' && k.hpMax) {
        k.hp = Math.max(0, Math.min(k.hpMax, u.hp));
      }
    }
    save();
    draw();
    return;
  }
  if (m.type === 'roll') {
    pushRoll(String(m.h || ''), String(m.s || ''), true);
    return;
  }
  if (m.type === 'char' && m.c && m.c.id) {
    const i = CH.list.findIndex(x => x.id === m.c.id);
    if (i >= 0) {
      CH.list[i] = Object.assign({}, CH.list[i], cleanCharPatch(m.c));
      if (C && C.id === m.c.id) C = CH.list[i];
      saveC();
      if (CH.active) renderSheet();
    }
  }
}
function mpClientMsg(m) {
  if (m.type === 'closed') {
    mpRender(L2('The game master closed the game.', 'Le MJ a fermé la partie.'));
    setTimeout(mpLeave, 1500);
    return;
  }
  if (m.type !== 'state') return;
  const first = !MP.got;
  MP.got = true;
  applyState(m.map);
  CH.list = m.chars || [];
  C = CH.list.find(c => c.id === CH.active) || CH.list[0] || null;
  RL = (Array.isArray(m.rolls) ? m.rolls : [])
    .slice(0, 40)
    .map(r => ({ h: safeRoll((r && r.h) || ''), s: String((r && r.s) || ''), t: +(r && r.t) || Date.now() }));
  rlRender();
  if (MP.me && !CH.list.some(c => c.id === MP.me)) MP.me = null;
  if (MP.me) handId = MP.me;
  for (const x of document.querySelectorAll('#biosel')) x.value = bio;
  showSize();
  legend();
  ctxBar && ctxBar();
  layout();
  if (typeof renderIni === 'function') renderIni();
  if (typeof renderMarks === 'function') renderMarks();
  renderHand();
  renderTok && renderTok();
  if (CH.active) renderSheet();
  else renderList();
  mpRender();
  if (first) setTool('move');
}
function mpStop() {
  if (MP.role !== 'host') return;
  clearTimeout(mpT);
  mpSend({ type: 'closed' });
  setTimeout(() => {
    for (const c of MP.conns)
      try {
        c.close();
      } catch (e) {}
    try {
      MP.peer && MP.peer.destroy();
    } catch (e) {}
    try {
      MP.bc && MP.bc.close();
    } catch (e) {}
    Object.assign(MP, {
      role: null,
      me: null,
      conns: [],
      code: '',
      n: 0,
      peer: null,
      bc: null,
      conn: null,
      got: false,
    });
    document.body.classList.remove('mp-host');
    mpRender(L2('Game closed: players are disconnected.', 'Partie fermée : les joueurs sont déconnectés.'));
  }, 300);
}
function mpLeave() {
  try {
    MP.conn && MP.conn.close();
    MP.peer && MP.peer.destroy();
    MP.bc && MP.bc.close();
  } catch (e) {}
  history.replaceState(null, '', location.pathname + location.hash);
  location.reload();
}
function mpLoadPeer() {
  return new Promise((ok, ko) => {
    if (window.Peer) return ok();
    const sc = document.createElement('script');
    sc.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    sc.onload = () => ok();
    sc.onerror = () => ko(new Error('peerjs'));
    document.head.append(sc);
  });
}
function mpCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join('');
}
async function mpHost() {
  MP.code = mpCode();
  MP.role = 'host';
  MP.conns = [];
  document.body.classList.add('mp-host');
  mpRender(L2('Opening…', 'Ouverture…'));
  if (MP.local) {
    MP.bc = new BroadcastChannel('luparis-mp-' + MP.code);
    MP.bc.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.from === MP.uid) return;
      if (m.type === 'hello') {
        MP.n++;
        mpRender();
      }
      mpHostMsg(m);
    };
    mpRender();
    return;
  }
  try {
    await mpLoadPeer();
    MP.peer = new Peer('luparis-' + MP.code);
    MP.peer.on('open', () => mpRender());
    MP.peer.on('error', e => mpRender(L2('Connection error: ', 'Erreur de connexion : ') + (e.type || e)));
    MP.peer.on('connection', conn => {
      MP.conns.push(conn);
      conn.on('open', () => {
        MP.n = MP.conns.filter(c => c.open).length;
        mpRender();
        mpSend(mpState(), conn);
      });
      conn.on('data', m => mpHostMsg(m, conn));
      conn.on('close', () => {
        MP.conns = MP.conns.filter(c => c !== conn);
        MP.n = MP.conns.filter(c => c.open).length;
        mpRender();
      });
    });
  } catch (e) {
    MP.role = null;
    document.body.classList.remove('mp-host');
    mpRender(
      L2(
        'Could not load the connection library (check your internet).',
        'Impossible de charger la bibliothèque de connexion (vérifie ta connexion internet).',
      ),
    );
  }
}
async function mpJoin(code) {
  code = String(code || '')
    .trim()
    .toUpperCase();
  if (!code) return;
  MP.code = code;
  MP.role = 'player';
  MP.got = false;
  document.body.classList.add('mp-player');
  mpRender(L2('Connecting…', 'Connexion…'));
  if (MP.local) {
    MP.bc = new BroadcastChannel('luparis-mp-' + code);
    MP.bc.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.from === MP.uid) return;
      mpClientMsg(m);
    };
    mpSend({ type: 'hello' });
    return;
  }
  try {
    await mpLoadPeer();
    MP.peer = new Peer();
    MP.peer.on('error', e => mpRender(L2('Connection error: ', 'Erreur de connexion : ') + (e.type || e)));
    MP.peer.on('open', () => {
      MP.conn = MP.peer.connect('luparis-' + code, { reliable: true, serialization: 'json' });
      MP.conn.on('open', () => mpSend({ type: 'hello' }));
      MP.conn.on('data', mpClientMsg);
      MP.conn.on('close', () => mpRender(L2('The game master closed the game.', 'Le MJ a fermé la partie.')));
    });
  } catch (e) {
    mpRender(
      L2(
        'Could not load the connection library (check your internet).',
        'Impossible de charger la bibliothèque de connexion (vérifie ta connexion internet).',
      ),
    );
  }
}
function mpRender(msg) {
  const B = document.getElementById('mp_box');
  if (!B) return;
  if (msg !== undefined) MP.msg = msg;
  const link = location.origin + location.pathname + '?join=' + MP.code + (MP.local ? '&local=1' : '') + '#carte';
  if (!MP.role)
    B.innerHTML = `<p class="small">${L2('Test version: the game master opens a game, players join with the code. Your own data stays untouched on each computer.', 'Version de test : le MJ ouvre une partie, les joueurs entrent le code. Les données de chacun restent intactes sur son ordinateur.')}</p><div class="row"><button type="button" class="go" id="mp_host">${L2('Open a game (GM)', 'Ouvrir une partie (MJ)')}</button></div><form class="row" id="mp_jf"><input id="mp_code" placeholder="${L2('Code', 'Code')}" maxlength="8" size="8" aria-label="Code"><button type="submit">${L2('Join', 'Rejoindre')}</button></form>`;
  else if (MP.role === 'host')
    B.innerHTML = `<p>${L2('Game open, code', 'Partie ouverte, code')} <b class="mpcode">${MP.code}</b></p><p class="small">${L2('Players connected', 'Joueurs connectés')} : <b>${MP.n || 0}</b></p><div class="row"><button type="button" id="mp_link">${L2('Copy the invitation link', "Copier le lien d'invitation")}</button><button type="button" id="mp_stop">${L2('Close the game', 'Fermer la partie')}</button></div>`;
  else
    B.innerHTML = `<p>${L2('Connected to game', 'Connecté à la partie')} <b class="mpcode">${MP.code}</b>${MP.got ? '' : ' …'}</p><label class="small">${L2('My character', 'Mon personnage')} <select id="mp_me"><option value="">—</option>${CH.list.map(c => `<option value="${esc(c.id)}"${c.id === MP.me ? ' selected' : ''}>${esc(c.name || '?')}</option>`).join('')}</select></label><p class="small">${L2('You can move your own token, roll, and use your cards. The game master does the rest.', 'Tu peux déplacer ton pion, lancer les dés et utiliser tes cartes. Le MJ gère le reste.')}</p><div class="row"><button type="button" id="mp_leave">${L2('Leave', 'Quitter')}</button></div>`;
  if (MP.msg) B.insertAdjacentHTML('beforeend', `<p class="small mpmsg">${esc(MP.msg)}</p>`);
}
document.getElementById('mp_card').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'mp_host') mpHost();
  else if (b.id === 'mp_stop') mpStop();
  else if (b.id === 'mp_leave') mpLeave();
  else if (b.id === 'mp_link') {
    const link = location.origin + location.pathname + '?join=' + MP.code + (MP.local ? '&local=1' : '') + '#carte';
    navigator.clipboard.writeText(link).then(
      () => mpRender(L2('Link copied.', 'Lien copié.')),
      () => mpRender(link),
    );
  }
});
document.getElementById('mp_card').addEventListener('submit', e => {
  if (e.target.id !== 'mp_jf') return;
  e.preventDefault();
  mpJoin(document.getElementById('mp_code').value);
});
document.getElementById('mp_card').addEventListener('change', e => {
  if (e.target.id !== 'mp_me') return;
  MP.me = e.target.value || null;
  handId = MP.me;
  selTok = null;
  renderHand();
  mpRender();
});
mpRender();
{
  const j = /[?&]join=([A-Z0-9]+)/i.exec(location.search);
  if (j) setTimeout(() => mpJoin(j[1]), 300);
}

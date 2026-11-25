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

// ---- multiplayer: host = GM, players and spectators join with a code. PeerJS (WebRTC) or ?local=1 (BroadcastChannel, same browser)
// The host sends each participant a filtered view: hidden items, monster numbers and secret GM rolls never leave the GM's computer.
MP.uid = Math.random().toString(36).slice(2, 10);
MP.local = /[?&]local=1/.test(location.search);
MP.prole = 'player';
MP.secret = false;
MP.tries = 0;
const MPK = 'luparis-mp-join',
  MPH = 'luparis-mp-host';
function ssGet(k) {
  try {
    return JSON.parse(sessionStorage.getItem(k) || 'null');
  } catch (e) {
    return null;
  }
}
function ssSet(k, v) {
  try {
    if (v == null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}
// what players and spectators may see of the table
function mpView(st, rolls) {
  const hid = new Set(st.tokens.filter(k => k.hid).map(k => k.id)),
    tokens = st.tokens
      .filter(k => !k.hid)
      .map(k => {
        if (k.t === 'pj' || k.cid) return k;
        const o = { id: k.id, x: k.x, y: k.y, t: k.t, n: k.n };
        for (const f of ['sz', 'ab', 'ty', 'nm', 'num', 'img', 'r']) if (k[f] != null) o[f] = k[f];
        if (k.hpMax) o.st = k.hp <= 0 ? 'd' : k.hp * 2 <= k.hpMax ? 'b' : 'ok';
        if (k.hp === 0) o.hp = 0;
        return o;
      }),
    o = st.ini && Array.isArray(st.ini.o) ? st.ini.o : [],
    cur = o[st.ini.cur],
    io = o.filter(e => !hid.has(e.id)),
    env = {};
  for (const e in st.env || {}) if (!(st.env[e] && st.env[e].hid)) env[e] = st.env[e];
  let ci = cur ? io.indexOf(cur) : 0;
  if (ci < 0) ci = Math.max(0, io.findIndex((e, i) => o.indexOf(e) > st.ini.cur) - 1);
  return {
    ...st,
    tokens,
    ini: { ...st.ini, o: io, cur: ci },
    marks: (st.marks || []).filter(m => !m.hid),
    objs: (st.objs || []).filter(x => !x.hid),
    tpls: (st.tpls || []).filter(x => !x.hid),
    env,
    rolls: (rolls || []).filter(r => !r.gm).slice(0, 40),
  };
}
function mpState() {
  const v = mpView(memStateNow(), RL);
  return { type: 'state', map: { ...v, rolls: undefined }, chars: CH.list, rolls: v.rolls, code: MP.code };
}
function mpSend(o, conn) {
  if (MP.local) {
    MP.bc && MP.bc.postMessage(JSON.stringify({ ...o, from: MP.uid, ...(conn && conn.uid ? { to: conn.uid } : {}) }));
    return;
  }
  if (MP.role === 'host') {
    for (const c of conn ? [conn] : MP.conns)
      if (c.open)
        try {
          c.send(o);
        } catch (e) {}
  } else if (MP.conn && MP.conn.open)
    try {
      MP.conn.send(o);
    } catch (e) {}
}
let mpT = null;
function mpPush() {
  if (MP.role !== 'host') return;
  clearTimeout(mpT);
  mpT = setTimeout(() => mpSend(mpState()), 200);
}
function mpPlayerSave() {
  if (!MP.me || MP.prole === 'spec') return;
  mpSend({
    type: 'tokens',
    me: MP.me,
    t: tokens.filter(k => k.cid === MP.me).map(k => ({ id: k.id, x: k.x, y: k.y, hp: k.hp })),
  });
}
function mpSendChar() {
  if (MP.prole === 'spec') return;
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
function mpTaken(id, conn) {
  return MP.conns.some(c => c !== conn && c.open && c.me === id);
}
function mpYou(conn, msg) {
  mpSend({ type: 'you', role: conn.prole, me: conn.me || null, msg: msg || '' }, conn);
}
function mpHostMsg(m, conn) {
  conn = conn || {};
  if (m.type === 'hello') {
    conn.pname = String(m.name || '').slice(0, 30) || L2('Player', 'Joueur');
    conn.prole = m.role === 'spec' ? 'spec' : 'player';
    const id = String(m.me || '');
    // the same person coming back (reload, lost network) takes their character back from the dead connection
    for (const c of MP.conns)
      if (c !== conn && c.me === id && c.pname === conn.pname) {
        c.me = null;
        if (!MP.local)
          try {
            c.close();
          } catch (e) {}
      }
    conn.me = conn.prole === 'player' && id && CH.list.some(c => c.id === id) && !mpTaken(id, conn) ? id : null;
    mpSend(mpState(), conn);
    mpYou(conn);
    if (IMGSHOW) mpSend({ type: 'img', n: IMGSHOW.n, d: IMGSHOW.d }, conn);
    mpRender();
    return;
  }
  if (conn.prole === 'spec') return;
  if (m.type === 'claim') {
    const id = String(m.me || '');
    if (!id) conn.me = null;
    else if (!CH.list.some(c => c.id === id)) return;
    else if (mpTaken(id, conn))
      return mpYou(conn, L2('Someone already plays this character.', 'Quelqu’un joue déjà ce personnage.'));
    else conn.me = id;
    mpYou(conn);
    mpRender();
    return;
  }
  if (m.type === 'tokens' || m.type === 'char') {
    const id = m.type === 'tokens' ? m.me : m.c && m.c.id;
    if (!id || conn.me !== id) return;
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
function mpSetRole(r) {
  MP.prole = r === 'spec' ? 'spec' : 'player';
  document.body.classList.toggle('mp-spec', MP.prole === 'spec');
}
function mpRemember() {
  if (MP.role === 'player') ssSet(MPK, { code: MP.code, name: MP.name || '', role: MP.prole, me: MP.me || '' });
}
function mpClientMsg(m) {
  if (m.type === 'closed') {
    MP.closed = true;
    mpRender(L2('The game master closed the game.', 'Le MJ a fermé la partie.'));
    ssSet(MPK, null);
    setTimeout(mpLeave, 1500);
    return;
  }
  if (m.type === 'you') {
    mpSetRole(m.role);
    MP.me = MP.prole === 'spec' ? null : m.me || null;
    handId = MP.me;
    mpRemember();
    renderHand();
    mpRender(m.msg || undefined);
    imgRender();
    return;
  }
  if (m.type === 'img') {
    imgReceive(m);
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
  ssSet(MPH, null);
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
  MP.closed = true;
  ssSet(MPK, null);
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
const MP_NOLIB = () =>
  L2(
    'Could not load the connection library (check your internet).',
    'Impossible de charger la bibliothèque de connexion (vérifie ta connexion internet).',
  );
async function mpHost(code) {
  MP.code = code || mpCode();
  MP.role = 'host';
  MP.conns = [];
  document.body.classList.add('mp-host');
  ssSet(MPH, { code: MP.code, local: MP.local });
  mpRender(L2('Opening…', 'Ouverture…'));
  if (MP.local) {
    MP.bc = new BroadcastChannel('luparis-mp-' + MP.code);
    MP.lc = {};
    MP.bc.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.from === MP.uid) return;
      const c = (MP.lc[m.from] = MP.lc[m.from] || { open: false, uid: m.from });
      if (m.type === 'hello') {
        MP.n = Object.keys(MP.lc).length;
        MP.conns = Object.values(MP.lc);
      }
      mpHostMsg(m, c);
    };
    mpRender();
    return;
  }
  try {
    await mpLoadPeer();
  } catch (e) {
    MP.role = null;
    document.body.classList.remove('mp-host');
    ssSet(MPH, null);
    return mpRender(MP_NOLIB());
  }
  const open = () => {
    MP.peer = new Peer('luparis-' + MP.code);
    MP.peer.on('open', () => {
      MP.tries = 0;
      mpRender('');
    });
    MP.peer.on('disconnected', () => {
      if (MP.role === 'host')
        try {
          MP.peer.reconnect();
        } catch (e) {}
    });
    MP.peer.on('error', e => {
      // after a reload, the old code can stay reserved for a few seconds: try again
      if (e.type === 'unavailable-id' && MP.role === 'host' && MP.tries++ < 15) {
        mpRender(L2('Reopening the game…', 'Réouverture de la partie…'));
        try {
          MP.peer.destroy();
        } catch (x) {}
        setTimeout(open, 2000);
        return;
      }
      mpRender(L2('Connection error: ', 'Erreur de connexion : ') + (e.type || e));
    });
    MP.peer.on('connection', conn => {
      MP.conns.push(conn);
      conn.on('data', m => mpHostMsg(m, conn));
      conn.on('open', () => {
        MP.n = MP.conns.filter(c => c.open).length;
        mpRender();
      });
      conn.on('close', () => {
        MP.conns = MP.conns.filter(c => c !== conn);
        MP.n = MP.conns.filter(c => c.open).length;
        mpRender();
      });
    });
  };
  open();
}
function mpConnect() {
  const code = MP.code;
  MP.conn = MP.peer.connect('luparis-' + code, { reliable: true, serialization: 'json' });
  MP.conn.on('open', () => {
    MP.tries = 0;
    mpSend({ type: 'hello', name: MP.name || '', role: MP.prole, me: MP.me || '' });
  });
  MP.conn.on('data', mpClientMsg);
  MP.conn.on('close', mpRetry);
  MP.conn.on('error', mpRetry);
}
// lost connection: try again with growing pauses, until it works or the player leaves
function mpRetry() {
  if (MP.closed || MP.role !== 'player' || MP.retrying) return;
  MP.retrying = true;
  const wait = Math.min(10, 1 + MP.tries++ * 2);
  mpRender(L2(`Connection lost, trying again in ${wait} s…`, `Connexion perdue, nouvel essai dans ${wait} s…`));
  setTimeout(() => {
    MP.retrying = false;
    if (MP.closed) return;
    try {
      if (!MP.peer || MP.peer.destroyed) {
        MP.peer = new Peer();
        MP.peer.on('open', mpConnect);
        MP.peer.on('error', mpRetry);
        MP.peer.on('disconnected', () => {
          try {
            MP.peer.reconnect();
          } catch (e) {}
        });
      } else if (MP.peer.disconnected) {
        MP.peer.reconnect();
        setTimeout(mpConnect, 800);
      } else mpConnect();
    } catch (e) {
      mpRetry();
    }
  }, wait * 1000);
}
async function mpJoin(code, opt) {
  code = String(code || '')
    .trim()
    .toUpperCase();
  if (!code) return;
  opt = opt || {};
  MP.code = code;
  MP.role = 'player';
  MP.name = String(opt.name || '').slice(0, 30);
  MP.me = opt.me || null;
  MP.got = false;
  MP.closed = false;
  mpSetRole(opt.role);
  document.body.classList.add('mp-player');
  mpRemember();
  mpRender(L2('Connecting…', 'Connexion…'));
  if (MP.local) {
    MP.bc = new BroadcastChannel('luparis-mp-' + code);
    MP.bc.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.from === MP.uid || (m.to && m.to !== MP.uid)) return;
      mpClientMsg(m);
    };
    mpSend({ type: 'hello', name: MP.name, role: MP.prole, me: MP.me || '' });
    return;
  }
  try {
    await mpLoadPeer();
  } catch (e) {
    return mpRender(MP_NOLIB());
  }
  MP.peer = new Peer();
  MP.peer.on('error', e => {
    if (e.type === 'peer-unavailable') mpRetry();
    else mpRender(L2('Connection error: ', 'Erreur de connexion : ') + (e.type || e));
  });
  MP.peer.on('disconnected', () => {
    if (MP.closed) return;
    try {
      MP.peer.reconnect();
    } catch (e) {}
  });
  MP.peer.on('open', mpConnect);
}
const ROLE_N = { player: ['Player', 'Joueur'], spec: ['Spectator', 'Spectateur'] };
function mpRender(msg) {
  const B = document.getElementById('mp_box');
  if (!B) return;
  if (msg !== undefined) MP.msg = msg;
  const saved = ssGet(MPK) || {};
  if (!MP.role)
    B.innerHTML = `<p class="small">${L2('The game master opens a game; players and spectators join with the code. Everyone keeps their own data on their computer.', 'Le MJ ouvre une partie ; joueurs et spectateurs entrent le code. Chacun garde ses données sur son ordinateur.')}</p><div class="row"><button type="button" class="go" id="mp_host">${L2('Open a game (GM)', 'Ouvrir une partie (MJ)')}</button></div><form class="mpj" id="mp_jf"><input id="mp_name" placeholder="${L2('Your name', 'Ton nom')}" maxlength="30" value="${esc(saved.name || '')}" aria-label="${L2('Your name', 'Ton nom')}"><input id="mp_code" placeholder="${L2('Code', 'Code')}" maxlength="8" size="8" aria-label="Code"><select id="mp_role" aria-label="${L2('Role', 'Rôle')}"><option value="player">${L2('Player', 'Joueur')}</option><option value="spec">${L2('Spectator', 'Spectateur')}</option></select><button type="submit">${L2('Join', 'Rejoindre')}</button></form>`;
  else if (MP.role === 'host') {
    const P = MP.conns.filter(c => c.open || MP.local);
    B.innerHTML = `<p>${L2('Game open, code', 'Partie ouverte, code')} <b class="mpcode">${MP.code}</b></p>
<ul class="mppl">${
      P.length
        ? P.map((c, i) => {
            const ch = c.me && CH.list.find(x => x.id === c.me);
            return `<li><b>${esc(c.pname || '?')}</b> <span class="small">${ch ? esc(ch.name || '?') : c.prole === 'spec' ? '' : L2('no character yet', 'pas encore de personnage')}</span><select data-mpr="${i}" aria-label="${L2('Role of', 'Rôle de')} ${esc(c.pname || '')}">${Object.entries(
              ROLE_N,
            )
              .map(([k, v]) => `<option value="${k}"${c.prole === k ? ' selected' : ''}>${L2(...v)}</option>`)
              .join(
                '',
              )}</select><button type="button" data-mpk="${i}" title="${L2('Remove from the game', 'Retirer de la partie')}" aria-label="${L2('Remove', 'Retirer')} ${esc(c.pname || '')}">×</button></li>`;
          }).join('')
        : `<li class="small">${L2('Nobody yet.', 'Personne pour l’instant.')}</li>`
    }</ul>
<label class="small mpsec"><input type="checkbox" id="mp_secret"${MP.secret ? ' checked' : ''}> ${L2('My rolls stay secret', 'Mes jets restent secrets')}</label>
<p class="small">${L2('Players never see what you hide (eye tool), nor monster numbers. They see whether a monster is hurt.', 'Les joueurs ne voient jamais ce que tu caches (outil œil), ni les chiffres des monstres. Ils voient seulement si un monstre est blessé.')}</p>
<div class="row"><button type="button" id="mp_link">${L2('Copy the invitation link', "Copier le lien d'invitation")}</button><button type="button" id="mp_stop">${L2('Close the game', 'Fermer la partie')}</button></div>`;
  } else {
    const spec = MP.prole === 'spec';
    B.innerHTML = `<p>${L2('Connected to game', 'Connecté à la partie')} <b class="mpcode">${MP.code}</b>${MP.got ? '' : ' …'} · ${L2(...ROLE_N[MP.prole])}</p>${
      spec
        ? `<p class="small">${L2('You follow the game without acting on it.', 'Tu suis la partie sans y agir.')}</p>`
        : `<label class="small">${L2('My character', 'Mon personnage')} <select id="mp_me"><option value="">—</option>${CH.list.map(c => `<option value="${esc(c.id)}"${c.id === MP.me ? ' selected' : ''}>${esc(c.name || '?')}</option>`).join('')}</select></label><p class="small">${L2('You can move your own token, roll, and use your cards. The game master does the rest.', 'Tu peux déplacer ton pion, lancer les dés et utiliser tes cartes. Le MJ gère le reste.')}</p>`
    }<div class="row"><button type="button" id="mp_leave">${L2('Leave', 'Quitter')}</button></div>`;
  }
  if (MP.msg) B.insertAdjacentHTML('beforeend', `<p class="small mpmsg" aria-live="polite">${esc(MP.msg)}</p>`);
}
function mpHostPeople() {
  return MP.conns.filter(c => c.open || MP.local);
}
document.getElementById('mp_card').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'mp_host') mpHost();
  else if (b.id === 'mp_stop') mpStop();
  else if (b.id === 'mp_leave') mpLeave();
  else if (b.dataset.mpk != null) {
    const c = mpHostPeople()[+b.dataset.mpk];
    if (!c) return;
    mpSend({ type: 'closed' }, c);
    setTimeout(() => {
      try {
        c.close && c.close();
      } catch (x) {}
    }, 300);
    MP.conns = MP.conns.filter(x => x !== c);
    if (MP.lc) delete MP.lc[c.uid];
    mpRender();
  } else if (b.id === 'mp_link') {
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
  mpJoin(document.getElementById('mp_code').value, {
    name: document.getElementById('mp_name').value,
    role: document.getElementById('mp_role').value,
  });
});
document.getElementById('mp_card').addEventListener('change', e => {
  if (e.target.id === 'mp_secret') {
    MP.secret = e.target.checked;
    return;
  }
  if (e.target.dataset.mpr != null) {
    const c = mpHostPeople()[+e.target.dataset.mpr];
    if (!c) return;
    c.prole = e.target.value === 'spec' ? 'spec' : 'player';
    if (c.prole === 'spec') c.me = null;
    mpYou(c);
    mpRender();
    return;
  }
  if (e.target.id !== 'mp_me') return;
  MP.me = e.target.value || null;
  handId = MP.me;
  selTok = null;
  mpSend({ type: 'claim', me: MP.me || '' });
  mpRemember();
  renderHand();
  mpRender();
});
mpRender();
{
  const j = /[?&]join=([A-Z0-9]+)/i.exec(location.search),
    s = ssGet(MPK),
    h = ssGet(MPH);
  // a reload keeps the game going: the GM reopens the same code, players come back with the same character
  if (j) setTimeout(() => mpJoin(j[1], s && s.code === j[1].toUpperCase() ? s : {}), 300);
  else if (s && s.code) setTimeout(() => mpJoin(s.code, s), 300);
  else if (h && h.code && !!h.local === MP.local) setTimeout(() => mpHost(h.code), 300);
}

// ---- images shown to the players: the GM keeps a gallery (IndexedDB, on this computer) and shows one at a time
var IMGSHOW = null,
  IMGS = [];
function imgDB() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open('luparis-images', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('img', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function imgTx(mode, f) {
  try {
    const d = await imgDB();
    return await new Promise(ok => {
      const tx = d.transaction('img', mode),
        q = f(tx.objectStore('img'));
      tx.oncomplete = () => ok(q && 'result' in q ? q.result : true);
      tx.onerror = () => ok(null);
    });
  } catch (e) {
    return null;
  }
}
async function imgLoad() {
  IMGS = ((await imgTx('readonly', s => s.getAll())) || []).sort((a, b) => b.t - a.t);
  imgRender();
}
// shrink before storing and sending: 1600 px on the long side is plenty for a screen
async function imgFit(file, max = 1600) {
  const bm = await createImageBitmap(file),
    k = Math.min(1, max / Math.max(bm.width, bm.height)),
    c = document.createElement('canvas');
  c.width = Math.round(bm.width * k);
  c.height = Math.round(bm.height * k);
  c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}
async function imgAdd(files) {
  for (const f of files) {
    if (!/^image\//.test(f.type)) continue;
    try {
      const d = await imgFit(f);
      await imgTx('readwrite', s =>
        s.put({ id: tid(), n: f.name.replace(/\.[^.]+$/, '').slice(0, 80), d, t: Date.now() }),
      );
    } catch (e) {}
  }
  imgLoad();
}
const imgOk = d =>
  typeof d === 'string' && d.length < 8e6 && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(d);
function imgShow(x) {
  IMGSHOW = x ? { id: x.id, n: x.n, d: x.d } : null;
  if (MP.role === 'host') mpSend(x ? { type: 'img', n: x.n, d: x.d } : { type: 'img', d: null });
  imgRender();
}
function imgReceive(m) {
  IMGSHOW = m.d && imgOk(m.d) ? { n: String(m.n || '').slice(0, 80), d: m.d } : null;
  const card = document.getElementById('img_card');
  if (IMGSHOW && card && card.classList.contains('fold') && typeof foldToggle === 'function') foldToggle(card);
  imgRender();
  if (IMGSHOW) imgZoom(IMGSHOW);
  else {
    const dl = document.getElementById('imgdlg');
    if (dl && dl.open) dl.close();
  }
}
function imgZoom(x) {
  let dl = document.getElementById('imgdlg');
  if (!dl) {
    dl = document.createElement('dialog');
    dl.id = 'imgdlg';
    dl.addEventListener('click', () => dl.close());
    document.body.append(dl);
  }
  dl.innerHTML = `<img alt="${esc(x.n || '')}"><p class="small">${esc(x.n || '')} · ${L2('click to close', 'clic pour fermer')}</p>`;
  dl.querySelector('img').src = x.d;
  if (!dl.open) dl.showModal();
}
function imgRender() {
  const B = document.getElementById('img_box');
  if (!B) return;
  const cur = IMGSHOW
    ? `<figure class="imgcur"><img src="" alt="${esc(IMGSHOW.n || '')}" data-imgz="1"><figcaption class="small">${esc(IMGSHOW.n || '')}</figcaption></figure>`
    : '';
  if (MP.role === 'player') {
    B.innerHTML =
      cur ||
      `<p class="small">${L2('The game master shows no image right now.', "Le MJ n'affiche aucune image pour l'instant.")}</p>`;
  } else {
    B.innerHTML = `<p class="small">${L2('Add pictures (or drop them here), then show one to the players. They stay on this computer.', 'Ajoute des images (ou dépose-les ici), puis montres-en une aux joueurs. Elles restent sur cet ordinateur.')}</p>
<label class="imgadd"><input type="file" accept="image/*" multiple id="img_file" hidden><span>${L2('Add images', 'Ajouter des images')}</span></label>
${IMGSHOW ? `<div class="imgon">${cur}<button type="button" id="img_hide">${L2('Hide from the players', 'Masquer aux joueurs')}</button></div>` : ''}
${
  IMGS.length
    ? `<ul class="imgg">${IMGS.map(
        x =>
          `<li class="${IMGSHOW && IMGSHOW.id === x.id ? 'on' : ''}"><img src="" data-imgi="${esc(x.id)}" alt="${esc(x.n)}" title="${esc(x.n)}"><div class="row"><button type="button" class="go" data-imgs="${esc(x.id)}">${IMGSHOW && IMGSHOW.id === x.id ? L2('Shown', 'Affichée') : L2('Show', 'Montrer')}</button><button type="button" data-imgd="${esc(x.id)}" aria-label="${L2('Delete', 'Supprimer')} ${esc(x.n)}">×</button></div></li>`,
      ).join('')}</ul>`
    : ''
}`;
    for (const im of B.querySelectorAll('[data-imgi]')) {
      const x = IMGS.find(y => y.id === im.dataset.imgi);
      if (x) im.src = x.d;
    }
  }
  const ci = B.querySelector('.imgcur img');
  if (ci && IMGSHOW) ci.src = IMGSHOW.d;
}
{
  const card = document.getElementById('img_card');
  card.addEventListener('click', e => {
    const b = e.target.closest('button,[data-imgz],[data-imgi]');
    if (!b) return;
    if (b.dataset.imgz != null && IMGSHOW) imgZoom(IMGSHOW);
    else if (b.dataset.imgi) {
      const x = IMGS.find(y => y.id === b.dataset.imgi);
      if (x) imgZoom(x);
    } else if (b.id === 'img_hide') imgShow(null);
    else if (b.dataset.imgs) {
      const x = IMGS.find(y => y.id === b.dataset.imgs);
      if (x) imgShow(IMGSHOW && IMGSHOW.id === x.id ? null : x);
    } else if (b.dataset.imgd) {
      const id = b.dataset.imgd;
      if (IMGSHOW && IMGSHOW.id === id) imgShow(null);
      imgTx('readwrite', s => s.delete(id)).then(imgLoad);
    }
  });
  card.addEventListener('change', e => {
    if (e.target.id === 'img_file' && e.target.files.length) imgAdd([...e.target.files]);
  });
  card.addEventListener('dragover', e => {
    if (MP.role !== 'player') e.preventDefault();
  });
  card.addEventListener('drop', e => {
    if (MP.role === 'player') return;
    e.preventDefault();
    imgAdd([...(e.dataTransfer.files || [])]);
  });
}
imgLoad();

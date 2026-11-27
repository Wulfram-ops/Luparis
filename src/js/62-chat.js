// ---- in-game chat: public messages and whispers; the GM can mirror the public chat to a Discord webhook
// the GM (host) is authoritative: he stamps the author name, keeps the history, enforces the caps
const CHT_MAX = 200,
  CHT_SYNC = 100;
let CHT = (lsGet('luparis-chat', null) || []).filter(m => m && typeof m.x === 'string').slice(-CHT_MAX);
let chOpen;
try {
  chOpen = localStorage.getItem('luparis-chat-open') === 'true';
} catch (e) {
  chOpen = false;
}
let dcFlag = null;
const chId = () => 'c' + Math.random().toString(36).slice(2, 12);
function chMyName() {
  return MP.role === 'host' ? L2('GM', 'MJ') : MP.name || L2('Player', 'Joueur');
}
function chColor(name) {
  const cols = ['#5aa0ff', '#7ed3a0', '#e8b34d', '#e07a9a', '#b48ce0', '#6fc7c0', '#d98e5a', '#9aa5b1'];
  let h = 7;
  for (let i = 0; i < String(name).length; i++) h = (h * 31 + String(name).codePointAt(i)) >>> 0;
  return cols[h % cols.length];
}
function chPersist() {
  if (MP.role === 'host') lsSet('luparis-chat', CHT);
}
function chSetOpen(on) {
  chOpen = !!on;
  try {
    localStorage.setItem('luparis-chat-open', String(!!on));
  } catch (e) {}
}
function chTargets() {
  const o = [`<option value="">${L2('Everyone', 'Tout le monde')}</option>`];
  if (MP.role === 'host') {
    for (const c of MP.conns)
      if ((c.open || MP.local) && c.prole === 'player' && c.me)
        o.push(`<option value="${esc(c.me)}">🤫 ${esc(c.pname || L2('Player', 'Joueur'))}</option>`);
  } else if (MP.role === 'player') {
    o.push(`<option value="gm">🤫 ${L2('Whisper the GM', 'Chuchoter au MJ')}</option>`);
  }
  return o.join('');
}
function chRender() {
  const P = $('chat');
  if (!P) return;
  P.setAttribute('aria-label', L2('Chat', 'Discussion'));
  P.classList.toggle('min', !chOpen);
  $('ch_tog').setAttribute('aria-expanded', String(chOpen));
  $('ch_ttl').textContent = L2('Chat', 'Discussion');
  $('ch_cnt').textContent = CHT.length ? `(${CHT.length})` : '';
  const inGame = MP.role === 'host' || (MP.role === 'player' && MP.got),
    mine = chMyName();
  $('ch_form').hidden = !inGame;
  const sel = $('ch_to'),
    opts = chTargets();
  if (sel.dataset.k !== opts) {
    const keep = sel.value;
    sel.innerHTML = opts;
    sel.dataset.k = opts;
    if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
  }
  $('ch_dc').hidden = MP.role !== 'host';
  const dc = dcCfg(),
    f =
      dcFlag ||
      (dc.u && dc.ch
        ? { ok: true, msg: L2('Discord mirror is on', 'Miroir Discord activé') }
        : {
            ok: null,
            msg: L2('Discord not configured — click to set it up', 'Discord non configuré — clique pour régler'),
          });
  $('ch_dc').classList.toggle('dc-on', f.ok === true);
  $('ch_dc').classList.toggle('dc-err', f.ok === false);
  $('ch_dc').title = f.msg;
  const lk = lang + '|' + inGame + '|' + CHT.length + '|' + (CHT.length ? CHT[CHT.length - 1].id : '');
  if ($('ch_list').dataset.k === lk) return;
  $('ch_list').dataset.k = lk;
  $('ch_list').innerHTML = CHT.length
    ? CHT.map((m, i) => {
        const head = new Date(m.t || Date.now()).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }),
          who = m.a === mine ? L2('You', 'Vous') : m.a;
        return `<li class="${i === CHT.length - 1 ? 'new' : ''} ${m.w ? 'wh' : ''}"><span class="chw" style="color:${chColor(who)}">${head} · ${esc(who)}${m.w ? ' 🤫' : ''}</span>${esc(m.x)}</li>`;
      }).join('')
    : `<li class="empty">${
        inGame
          ? L2('No message yet — say something.', 'Pas encore de message — dis quelque chose.')
          : L2('Join a game to use the chat.', 'Rejoins une partie pour discuter.')
      }</li>`;
  $('ch_list').scrollTop = $('ch_list').scrollHeight;
}
function chPost(x, to) {
  x = String(x == null ? '' : x)
    .slice(0, 1000)
    .trim();
  if (!x) return;
  to = to === 'gm' ? 'gm' : MP.role === 'host' ? String(to || '').slice(0, 40) : '';
  if (MP.role === 'host') {
    const m = { id: chId(), a: chMyName(), w: to ? 1 : 0, to: to || '', t: Date.now(), x };
    CHT.push(m);
    if (CHT.length > CHT_MAX) CHT = CHT.slice(-CHT_MAX);
    chPersist();
    if (!m.w) mpSend({ type: 'chat', m });
    else {
      const c = MP.conns.find(c => (c.open || MP.local) && c.me === to);
      if (c) mpSend({ type: 'chat', m }, c);
    }
    if (!m.w) dcChat(m);
  } else if (MP.role === 'player' && MP.got) {
    // the host re-broadcasts the message with its own stamp; the id travels with it so both copies deduplicate
    const m = { id: chId(), a: chMyName(), w: to ? 1 : 0, to: to || '', t: Date.now(), x };
    mpSend({ type: 'chat', id: m.id, x: m.x, to: m.to });
    CHT.push(m);
    if (CHT.length > CHT_MAX) CHT = CHT.slice(-CHT_MAX);
  } else return;
  if (!chOpen) chSetOpen(true);
  chRender();
}
function chHost(m, conn) {
  if (MP.role !== 'host' || !conn || (conn.prole !== 'player' && conn.prole !== 'spec')) return;
  const x = String((m && m.x) || '')
    .slice(0, 1000)
    .trim();
  if (!x) return;
  let to = '';
  if (m && m.to) {
    if (m.to !== 'gm') return; // a player or a spectator may whisper only the GM
    to = 'gm';
  }
  const now = Date.now(),
    rl = (conn._cht = (conn._cht || []).filter(t => now - t < 10000));
  if (rl.length >= 8) return; // 8 messages per 10 seconds per connection
  rl.push(now);
  const id = m.id && /^c[a-z0-9]{6,16}$/.test(String(m.id)) ? String(m.id) : chId(),
    m2 = { id, a: conn.pname || L2('Player', 'Joueur'), w: to ? 1 : 0, to, t: now, x };
  CHT.push(m2);
  if (CHT.length > CHT_MAX) CHT = CHT.slice(-CHT_MAX);
  chPersist();
  if (!to) {
    mpSend({ type: 'chat', m: m2 });
    dcChat(m2);
  }
  chRender();
}
function chApply(m) {
  if (MP.role !== 'player' || !m || typeof m.id !== 'string' || !/^c[a-z0-9]{6,16}$/.test(m.id)) return;
  const x = String(m.x || '').slice(0, 1000);
  if (!x.trim()) return;
  const to = m.to ? String(m.to).slice(0, 40) : '';
  if (to && to !== 'gm' && to !== MP.me) return; // a whisper that is not for me stays hidden
  if (CHT.some(z => z.id === m.id)) return;
  CHT.push({
    id: m.id,
    a: String(m.a || '').slice(0, 30) || L2('Player', 'Joueur'),
    w: to ? 1 : 0,
    to,
    t: +m.t || Date.now(),
    x,
  });
  if (CHT.length > CHT_MAX) CHT = CHT.slice(-CHT_MAX);
  if (!chOpen) chSetOpen(true);
  chRender();
}
function chMergePublic(list) {
  if (MP.role !== 'player' || !Array.isArray(list)) return;
  const pub = list
    .filter(m => m && typeof m.id === 'string' && typeof m.x === 'string')
    .slice(-CHT_MAX)
    .map(m => ({
      id: String(m.id),
      a: String(m.a || '').slice(0, 30),
      w: 0,
      to: '',
      t: +m.t || Date.now(),
      x: String(m.x).slice(0, 1000),
    }));
  CHT = pub.concat(CHT.filter(z => z.w)).sort((a, b) => a.t - b.t);
  chRender();
}
// ---- Discord mirror (webhook): the URL is a GM secret, handled like the AI keys
const DC_KEY = 'luparis-discord';
function dcCfg() {
  const o = lsGet(DC_KEY, null) || {};
  return { u: String(o.u || ''), ch: !!o.ch, r: !!o.r };
}
const dcUrlOk = u =>
  /^https:\/\/(discord|discordapp)\.com\/api\/(v\d+\/)?webhooks\/\d{10,20}\/[\w-]{16,}$/.test(String(u));
let dcChain = Promise.resolve();
function dcMark(ok, msg) {
  dcFlag = { ok, msg };
  chRender();
}
function dcPost(payload) {
  const c = dcCfg();
  if (!c.u) return Promise.resolve(false);
  // One attempt only, never a retry: once the message has left the browser, sending it again
  // would post it twice in the channel. The statuses are therefore distinct:
  //   offline          → the message was not sent (safe to retry);
  //   Discord answered → it rejected the message (status shown, safe to retry);
  //   network failure  → the connection failed, the message did not leave (safe to retry);
  //   readable answer  → delivered. Discord answers webhooks with CORS headers (verified in a
  //                      real browser, November 2026), so when the message leaves, the answer is readable.
  const run = () => {
    if (!dcUrlOk(c.u)) {
      dcMark(false, L2('This does not look like a Discord webhook URL.', 'Ça ne ressemble pas à une URL de webhook Discord.'));
      return Promise.resolve(false);
    }
    if (navigator.onLine === false) {
      dcMark(
        false,
        L2('Offline — the message was not sent (you can retry).', 'Hors ligne — le message n’a pas été envoyé (tu peux réessayer).'),
      );
      return Promise.resolve(false);
    }
    const fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    return fetch(c.u, { method: 'POST', body: fd }).then(
      r => {
        dcMark(
          r.ok,
          r.ok
            ? L2('Discord mirror is on', 'Miroir Discord activé')
            : L2('Discord answered ', 'Discord a répondu ') + r.status,
        );
        return r.ok;
      },
      () => {
        dcMark(
          false,
          L2('Network failure — the message was not sent (you can retry).', 'Échec réseau — le message n’a pas été envoyé (tu peux réessayer).'),
        );
        return false;
      },
    );
  };
  // The chain must never die: a synchronous throw or a rejected link would silently skip every
  // following send. run() can only throw synchronously, and the fetch always settles.
  dcChain = dcChain.then(() => {
    try {
      return run();
    } catch (e) {
      dcMark(false, L2('Sending failed. ', 'L’envoi a échoué. ') + String(e).slice(0, 120));
      return false;
    }
  });
  return dcChain;
}
function dcColor(name) {
  let h = 0;
  for (let i = 0; i < String(name).length; i++) h = (h * 31 + String(name).codePointAt(i)) >>> 0;
  return 0x100000 + (h % 0xefffff);
}
function dcChat(m) {
  if (m && m.w) return; // a whisper never leaves the game
  const c = dcCfg();
  if (!c.u || !c.ch) return;
  dcPost({
    username: 'Luparis',
    embeds: [
      {
        author: { name: String((m && m.a) || 'Luparis').slice(0, 60) },
        color: dcColor(String((m && m.a) || '')),
        description: String((m && m.x) || '').slice(0, 2000),
        timestamp: new Date((m && m.t) || Date.now()).toISOString(),
      },
    ],
  });
}
function dcRoll(r, src) {
  const c = dcCfg();
  if (!c.u || !c.r) return;
  const txt = String((r && r.h) || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!txt) return;
  dcPost({
    username: 'Luparis',
    embeds: [
      {
        author: { name: String(src || '').slice(0, 60) || 'Luparis' },
        color: dcColor(String(src || '')),
        description: '🎲 ' + txt.slice(0, 2000),
        timestamp: new Date((r && r.t) || Date.now()).toISOString(),
      },
    ],
  });
}
function dcClear() {
  try {
    localStorage.removeItem(DC_KEY);
  } catch (e) {}
  dcFlag = null;
  chRender();
}
function dcDialog() {
  const c = dcCfg();
  let d = $('dcdlg');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'dcdlg';
    document.body.appendChild(d);
  }
  const msg = t2 => {
    const x = d.querySelector('#dc_msg');
    if (x) x.textContent = t2;
  };
  d.innerHTML = `<h3>${L2('Discord mirror', 'Miroir Discord')}</h3>
<p class="small">${L2(
    'Optional. In your channel: ⋯ → Integrations → Webhooks → copy the URL. The URL stays in this browser only: it is never sent to the players and never copied into a backup.',
    'Facultatif. Dans ton salon : ⋯ → Intégrations → Webhooks → copier l’URL. L’URL reste dans ce navigateur uniquement : jamais envoyée aux joueurs, jamais copiée dans une sauvegarde.',
  )}</p>
<label><span class="small">${L2('Webhook URL', 'URL du webhook')}</span><input id="dc_url" type="text" autocomplete="off" spellcheck="false" placeholder="https://discord.com/api/webhooks/…" value="${esc(c.u)}"></label>
<label class="small"><input type="checkbox" id="dc_ch"${c.ch ? ' checked' : ''}><span>${L2('Mirror the chat', 'Miroir du chat')}</span></label>
<label class="small"><input type="checkbox" id="dc_r"${c.r ? ' checked' : ''}><span>${L2('Mirror the public rolls too', 'Les jets publics aussi')}</span></label>
<div class="row"><button type="button" class="go" id="dc_save">${L2('Save', 'Enregistrer')}</button><button type="button" id="dc_test">${L2('Send a test', 'Envoyer un test')}</button><button type="button" id="dc_del">${L2('Forget the URL', 'Oublier l’URL')}</button><button type="button" id="dc_close">${L2('Close', 'Fermer')}</button></div>
<p class="small" id="dc_msg" aria-live="polite"></p>`;
  d.querySelector('#dc_close').onclick = () => d.close();
  d.querySelector('#dc_del').onclick = () => {
    dcClear();
    d.close();
  };
  d.querySelector('#dc_save').onclick = () => {
    const u = d.querySelector('#dc_url').value.trim();
    if (u && !dcUrlOk(u))
      return msg(
        L2('This does not look like a Discord webhook URL.', 'Ça ne ressemble pas à une URL de webhook Discord.'),
      );
    lsSet(
      DC_KEY,
      u
        ? { u, ch: d.querySelector('#dc_ch').checked, r: d.querySelector('#dc_r').checked }
        : { u: '', ch: false, r: false },
    );
    dcFlag = null;
    d.close();
    chRender();
  };
  d.querySelector('#dc_test').onclick = async () => {
    const u = d.querySelector('#dc_url').value.trim();
    if (!u) return msg(L2('Enter the URL first.', 'Renseigne d’abord l’URL.'));
    if (!dcUrlOk(u))
      return msg(
        L2('This does not look like a Discord webhook URL.', 'Ça ne ressemble pas à une URL de webhook Discord.'),
      );
    lsSet(DC_KEY, { u, ch: true, r: d.querySelector('#dc_r').checked });
    msg(L2('Sending…', 'Envoi…'));
    const ok = await dcPost({
      username: 'Luparis',
      content: L2('Luparis test: the mirror works.', 'Test Luparis : le miroir fonctionne.'),
    });
    msg(
      ok ? L2('Sent — check your channel.', 'Envoyé — vérifie ton salon.') : L2('Sending failed.', 'L’envoi a échoué.'),
    );
  };
  d.showModal();
}
// ---- the chat log also feeds the session journal
function chJournal(S) {
  const end = S.end || Date.now(),
    rows = CHT.filter(m => m.t >= S.start && m.t <= end).map(m => {
      const to = m.w
          ? m.to === 'gm'
            ? L2('GM', 'MJ')
            : ((CH.list || []).find(c => c.id === m.to) || {}).name || m.to
          : '',
        head = new Date(m.t).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
      return `- ${head} ${m.a}${to ? ' → ' + to + ' (🤫)' : ''} : ${String(m.x).replace(/\s+/g, ' ')}`;
    });
  if (!rows.length) return '';
  return `\n\n## ${L2('Chat', 'Discussion')}\n${rows.join('\n')}\n`;
}
// ---- wrappers: the established pattern of this repo (see 57-layout.js)
const _chmpHostMsg = mpHostMsg;
mpHostMsg = (m, conn) => {
  if (m && m.type === 'chat') {
    chHost(m, conn);
    return;
  }
  return _chmpHostMsg(m, conn);
};
const _chmpClientMsg = mpClientMsg;
mpClientMsg = m => {
  if (m && m.type === 'chat') {
    if (m.m) chApply(m.m);
    return;
  }
  if (m && m.type === 'state') {
    const r = _chmpClientMsg(m);
    if (Array.isArray(m.chat)) chMergePublic(m.chat);
    return r;
  }
  return _chmpClientMsg(m);
};
const _chmpState = mpState;
mpState = () => {
  const s = _chmpState();
  s.chat = CHT.filter(m => !m.w).slice(-CHT_SYNC);
  return s;
};
const _chpushRoll = pushRoll;
pushRoll = (h, src, remote, by) => {
  const before = RL[0];
  const r = _chpushRoll(h, src, remote, by);
  if (MP.role === 'host' && RL[0] && RL[0] !== before && !RL[0].gm) dcRoll(RL[0], src);
  return r;
};
const _chapplyLang = applyLang;
applyLang = () => {
  _chapplyLang();
  chRender();
};
const _chsnMd = snMd;
snMd = S => _chsnMd(S) + chJournal(S);
const _chmpRender = mpRender;
mpRender = (...a) => {
  const r = _chmpRender(...a);
  chRender();
  return r;
};
{
  const P = $('chat');
  if (P) {
    P.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && b.id === 'ch_tog') {
        chSetOpen(!chOpen);
        chRender();
      } else if (b && b.id === 'ch_dc') dcDialog();
    });
    P.addEventListener('submit', e => {
      e.preventDefault();
      const inp = $('ch_x'),
        sel = $('ch_to');
      if (!inp) return;
      chPost(inp.value, sel ? sel.value : '');
      inp.value = '';
      inp.focus();
    });
  }
}
chRender();

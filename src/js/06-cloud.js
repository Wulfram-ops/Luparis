// ---- online accounts (ROADMAP §1.4, lot B): sign-in with Google or an e-mail link, through Supabase.
// The database rules live in supabase/migrations/ and are enforced by the database itself: nothing here
// replaces them. Only the project URL and the PUBLIC (publishable) key are in the code; the secret key
// never leaves the Supabase dashboard. AI keys and the Discord webhook are never sent to Supabase.
// The library is loaded only when someone signs in or already has a session: a visitor without an
// account downloads nothing and the site works as before, locally.
const CLOUD_URL = 'https://trhhdiieukihdgawxjoe.supabase.co',
  CLOUD_KEY = 'sb_publishable_yTOtw-9OB8f2C8DojqbGZg_2dozd5dq',
  CLOUD_LIB = 'https://unpkg.com/@supabase/supabase-js@2.119.2/dist/umd/supabase.js',
  CLOUD_SRI = 'sha384-A97u3Qnt9GZHURO9YJZRe7VQgGUeFzcv6I1oIGnUTxQrCxnpQMwR0/G8F2zt9abZ',
  // outside the luparis- prefix on purpose: the session is never copied into a backup (bkCollect)
  CLOUD_STORE = 'sb-luparis-auth',
  CLOUD_TAB = 'luparis-cloud-tab';
const CLOUD = { sb: null, user: null, owner: false, name: '', busy: false, err: '', loading: null };

function cloudHasSession() {
  try {
    return !!localStorage.getItem(CLOUD_STORE);
  } catch (e) {
    return false;
  }
}
// back from Google or from the e-mail link: ?code=… (PKCE flow, keeps the #tab routing intact)
const cloudCallback = () => /[?&](code|error_description)=/.test(location.search);

function cloudLoad() {
  if (CLOUD.sb) return Promise.resolve(CLOUD.sb);
  if (CLOUD.loading) return CLOUD.loading;
  CLOUD.loading = new Promise((ok, ko) => {
    const make = () => {
      try {
        CLOUD.sb = window.supabase.createClient(CLOUD_URL, CLOUD_KEY, {
          auth: {
            flowType: 'pkce',
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: CLOUD_STORE,
          },
        });
        CLOUD.sb.auth.onAuthStateChange((ev, session) => {
          // never await Supabase calls inside this callback (the library's own advice): defer
          setTimeout(() => cloudSet(session && session.user), 0);
        });
        ok(CLOUD.sb);
      } catch (e) {
        ko(e);
      }
    };
    if (window.supabase && window.supabase.createClient) return make();
    const sc = document.createElement('script');
    sc.src = CLOUD_LIB;
    sc.integrity = CLOUD_SRI;
    sc.crossOrigin = 'anonymous';
    sc.onload = make;
    sc.onerror = () => ko(new Error('supabase'));
    document.head.append(sc);
  }).catch(e => {
    CLOUD.loading = null;
    CLOUD.err = L2(
      'Could not reach the account service (check your internet).',
      'Impossible de joindre le service de comptes (vérifie ta connexion internet).',
    );
    cloudRender();
    throw e;
  });
  return CLOUD.loading;
}

async function cloudSet(user) {
  const was = CLOUD.user && CLOUD.user.id;
  CLOUD.user = user || null;
  CLOUD.err = '';
  if (!CLOUD.user) {
    CLOUD.owner = false;
    CLOUD.name = '';
    return cloudRender();
  }
  const m = CLOUD.user.user_metadata || {};
  CLOUD.name = m.full_name || m.name || (CLOUD.user.email || '').split('@')[0];
  cloudRender();
  if (was === CLOUD.user.id) return;
  try {
    const sb = CLOUD.sb;
    // owner (Fred): the database only lets you see your own line in owners
    const o = await sb.from('owners').select('user_id').eq('user_id', CLOUD.user.id).maybeSingle();
    CLOUD.owner = !!(o && o.data);
    // the profile row: create it with the name on the first sign-in, keep a name already chosen
    const p = await sb.from('profiles').select('name').eq('id', CLOUD.user.id).maybeSingle();
    if (p && p.data && p.data.name) CLOUD.name = p.data.name;
    else if (p && !p.error) await sb.from('profiles').upsert({ id: CLOUD.user.id, name: CLOUD.name.slice(0, 60) });
  } catch (e) {}
  cloudRender();
}

async function cloudGoogle() {
  CLOUD.busy = true;
  cloudRender();
  try {
    const sb = await cloudLoad();
    sessionStorage.setItem(CLOUD_TAB, location.hash || '');
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + location.pathname },
    });
    if (error) throw error;
  } catch (e) {
    CLOUD.busy = false;
    CLOUD.err = CLOUD.err || L2('Google sign-in failed: ', 'La connexion Google a échoué : ') + (e.message || e);
    cloudRender();
  }
}

async function cloudEmail(email) {
  email = String(email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return cloudMsg(L2('Enter a valid e-mail address.', 'Saisis une adresse e-mail valide.'));
  CLOUD.busy = true;
  cloudRender();
  try {
    const sb = await cloudLoad();
    sessionStorage.setItem(CLOUD_TAB, location.hash || '');
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname },
    });
    if (error) throw error;
    CLOUD.busy = false;
    cloudRender();
    cloudMsg(
      L2(
        'Link sent. Open it from this same browser to sign in (check your spam folder).',
        'Lien envoyé. Ouvre-le dans ce même navigateur pour te connecter (regarde aussi dans les indésirables).',
      ),
    );
  } catch (e) {
    CLOUD.busy = false;
    CLOUD.err = CLOUD.err || L2('Could not send the link: ', 'Impossible d’envoyer le lien : ') + (e.message || e);
    cloudRender();
  }
}

async function cloudOut() {
  try {
    if (CLOUD.sb) await CLOUD.sb.auth.signOut();
  } catch (e) {}
  try {
    localStorage.removeItem(CLOUD_STORE);
  } catch (e) {}
  cloudSet(null);
}

function cloudMsg(t) {
  const x = $('acct_msg');
  if (x) x.textContent = t;
}

// the rail button: "Sign in" or the account name (a ★ for the owner)
function cloudRender() {
  const b = $('acct_open');
  if (b) {
    const lbl = b.querySelector('.acct-label');
    const t = CLOUD.user ? (CLOUD.owner ? '★ ' : '') + CLOUD.name : L2('Sign in', 'Se connecter');
    if (lbl) lbl.textContent = t;
    b.title = CLOUD.user
      ? L2('Your account', 'Ton compte') + ' · ' + (CLOUD.user.email || '')
      : L2('Sign in', 'Se connecter');
    b.classList.toggle('on', !!CLOUD.user);
  }
  const d = $('acctdlg');
  if (d && d.open) cloudDialogFill(d);
}

function cloudDialog() {
  let d = $('acctdlg');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'acctdlg';
    document.body.appendChild(d);
  }
  cloudDialogFill(d);
  if (!d.open) d.showModal();
}

function cloudDialogFill(d) {
  const off = navigator.onLine === false;
  const privacy = `<p class="small"><a href="confidentialite.html" target="_blank" rel="noopener">${L2('What is stored, and where', 'Ce qui est enregistré, et où')}</a></p>`;
  if (CLOUD.user) {
    d.innerHTML = `<h3>${L2('Your account', 'Ton compte')}</h3>
<p><b>${esc(CLOUD.name)}</b>${CLOUD.owner ? ` <span class="pill">${L2('owner', 'propriétaire')}</span>` : ''}<br><span class="small">${esc(CLOUD.user.email || '')}</span></p>
<p class="small">${L2(
      'Your characters and your settings will follow you on every device (coming soon). Campaigns and roles are given by the owner.',
      'Tes personnages et tes réglages te suivront sur tous tes appareils (bientôt). Les campagnes et les rôles sont donnés par le propriétaire.',
    )}</p>
${privacy}
<p class="small acct-err" aria-live="polite">${esc(CLOUD.err)}</p>
<div class="row"><button type="button" id="acct_out">${L2('Sign out', 'Se déconnecter')}</button><button type="button" id="acct_close">${L2('Close', 'Fermer')}</button></div>`;
    d.querySelector('#acct_out').onclick = () => cloudOut();
  } else {
    d.innerHTML = `<h3>${L2('Sign in', 'Se connecter')}</h3>
<p class="small">${L2(
      'Optional: the site works without an account. With one, your characters and settings follow you on every device, and the owner can add you to campaigns.',
      'Facultatif : le site marche sans compte. Avec un compte, tes personnages et tes réglages te suivent sur tous tes appareils, et le propriétaire peut t’ajouter à des campagnes.',
    )}</p>
${off ? `<p class="small acct-err">${L2('You are offline.', 'Tu es hors ligne.')}</p>` : ''}
<div class="row"><button type="button" class="go" id="acct_google"${CLOUD.busy || off ? ' disabled' : ''}>${L2('Continue with Google', 'Continuer avec Google')}</button></div>
<form id="acct_mail" class="row"><input id="acct_email" type="email" autocomplete="email" placeholder="${L2('your@e-mail', 'ton@adresse.mail')}" required><button type="submit"${CLOUD.busy || off ? ' disabled' : ''}>${L2('Get a link by e-mail', 'Recevoir un lien par e-mail')}</button></form>
${privacy}
<p class="small acct-err" id="acct_msg" aria-live="polite">${esc(CLOUD.err)}</p>
<div class="row"><button type="button" id="acct_close">${L2('Close', 'Fermer')}</button></div>`;
    d.querySelector('#acct_google').onclick = () => cloudGoogle();
    d.querySelector('#acct_mail').onsubmit = e => {
      e.preventDefault();
      cloudEmail(d.querySelector('#acct_email').value);
    };
  }
  d.querySelector('#acct_close').onclick = () => d.close();
}

function cloudBoot() {
  const b = $('acct_open');
  if (b) b.onclick = () => cloudDialog();
  cloudRender();
  if (!cloudHasSession() && !cloudCallback()) return; // no account here: load nothing
  cloudLoad()
    .then(async sb => {
      const { data } = await sb.auth.getSession();
      await cloudSet(data && data.session && data.session.user);
      if (cloudCallback()) {
        // back from the sign-in: tidy the address and go back to the tab we came from
        const q = new URLSearchParams(location.search);
        const bad = q.get('error_description');
        let tab = '';
        try {
          tab = sessionStorage.getItem(CLOUD_TAB) || '';
          sessionStorage.removeItem(CLOUD_TAB);
        } catch (e) {}
        history.replaceState(null, '', location.pathname + (tab || location.hash));
        if (tab) window.dispatchEvent(new HashChangeEvent('hashchange'));
        if (bad) {
          CLOUD.err = L2('Sign-in refused: ', 'Connexion refusée : ') + bad;
          cloudDialog();
        }
      }
    })
    .catch(() => {});
}
window.addEventListener('online', cloudRender);
window.addEventListener('offline', cloudRender);

// ---- storage: every read and write of the browser storage goes through here; failures are reported once
var LS_SCHEMA = 1,
  LSW = false;
function lsGet(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : JSON.parse(v);
  } catch (e) {
    console.warn('Luparis: unreadable data', k, e);
    return d;
  }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch (e) {
    console.error('Luparis: save failed', k, e);
    lsWarn();
    return false;
  }
}
function lsWarn() {
  if (LSW) return;
  LSW = true;
  const fr =
      (document.documentElement.lang || '').startsWith('fr') || /fr/.test(localStorage.getItem('luparis-prefs') || ''),
    d = document.createElement('div');
  d.className = 'lswarn';
  d.setAttribute('role', 'alert');
  d.textContent = fr
    ? 'Sauvegarde impossible dans ce navigateur (stockage plein ?). Exporte une sauvegarde complète avec 💾.'
    : 'Saving failed in this browser (storage full?). Export a full backup with 💾.';
  d.onclick = () => d.remove();
  document.body.appendChild(d);
}
(function migrate() {
  let v = +localStorage.getItem('luparis-schema') || 0;
  /* future migrations: if(v<2){...;v=2} */ if (v !== LS_SCHEMA)
    try {
      localStorage.setItem('luparis-schema', String(LS_SCHEMA));
    } catch (e) {}
})();
var TPLK = null,
  TPLC = null,
  tplSel = 'circle',
  FOLD = {},
  INIP = {},
  MP = { role: null, me: null, conns: [], code: '', n: 0 };
try {
  FOLD = lsGet('luparis-fold', null) || {};
} catch (e) {}
function foldSave() {
  lsSet('luparis-fold', FOLD);
}

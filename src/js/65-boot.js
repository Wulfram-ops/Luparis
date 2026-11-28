// ---- foldable panels and cards
function foldKey(sec) {
  const h = sec.querySelector('h3');
  return 'p:' + (sec.dataset.mod || sec.id || (h && (h.dataset.i18n || h.textContent.trim().slice(0, 30))) || '');
}
function foldApply(root) {
  (root || document).querySelectorAll('section.card').forEach(sec => {
    const h = sec.querySelector('h3');
    if (!h || sec.closest('#c_mods')) return;
    // The integrated play tabs already provide navigation.
    if (sec.closest('#play_workspace')) {
      sec.classList.remove('fold');
      h.classList.remove('foldh');
      h.removeAttribute('role');
      h.removeAttribute('aria-expanded');
      h.removeAttribute('tabindex');
      return;
    }
    let w = h;
    while (w.parentNode && w.parentNode !== sec) w = w.parentNode;
    if (w !== h) w.classList.add('foldwrap');
    const k = foldKey(sec),
      on = !!FOLD[k];
    sec.classList.toggle('fold', on);
    h.classList.add('foldh');
    h.setAttribute('role', 'button');
    h.tabIndex = 0;
    if (sec.classList.contains('rmod') && !h.title)
      h.title = L2('Click to fold · hold and drag to move', 'Clic pour réduire · maintenir et glisser pour déplacer');
    h.setAttribute('aria-expanded', String(!on));
  });
}
function foldToggle(sec) {
  const k = foldKey(sec);
  FOLD[k] = !FOLD[k];
  if (!FOLD[k]) delete FOLD[k];
  foldSave();
  foldApply(sec.parentNode);
}
document.addEventListener('click', e => {
  const h = e.target.closest('h3.foldh');
  if (!h || e.target.closest('button,a,input,select,textarea,label')) return;
  const sec = h.closest('section.card');
  if (sec) foldToggle(sec);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('h3.foldh')) {
    e.preventDefault();
    const sec = e.target.closest('section.card');
    if (sec) foldToggle(sec);
  }
});
let foldQ = false;
new MutationObserver(ms => {
  if (foldQ) return;
  for (const m of ms)
    for (const n of m.addedNodes)
      if (n.nodeType === 1 && (n.matches('section.card,h3') || (n.querySelector && n.querySelector('section.card')))) {
        foldQ = true;
        requestAnimationFrame(() => {
          foldQ = false;
          foldApply();
        });
        return;
      }
}).observe(document.body, { childList: true, subtree: true });
setTimeout(foldApply, 0);
legend();
layout();
gDisplayBoot();
cloudBoot();
// ?debug=1 exposes the app's scope to automated tests and to the console (window.DBG('expression'))
if (/[?&]debug=1\b/.test(location.search)) window.DBG = x => eval(x);

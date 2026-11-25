// Integrated play workspace: fixed responsive columns, no movable modules.
const PLAY_AUX={in:['Initiative','Initiative'],tk:['Token','Pion'],mk:['Markers / zones','Repères / zones'],mp:['Session','Session'],img:['Illustrations','Illustrations'],sn:['GM notes','Notes MJ'],roll:['Rolls','Jets']};
const PLAY_SHEET={actions:['Combat','Combat'],checks:['Checks','Tests'],magic:['Magic','Magie'],gear:['Equipment','Équipement'],profile:['Profile','Profil']};
let playAuxTab='in',playSheetTab='actions',playClaimState='',playLastToken=null,playSizeQ=0;
const playWorkspace=$('play_workspace'),playAux=$('play_aux'),playHand=$('hand');
function playSelectAux(k){
  const allowed=key=>!(key==='sn'&&MP.role==='player')&&!(key==='tk'&&$('tk_panel').hidden);
  if(!Object.hasOwn(PLAY_AUX,k)||!allowed(k))k='in';
  playAuxTab=k;
  for(const b of playAux.querySelectorAll('[data-play-tab]')){
    const key=b.dataset.playTab,active=key===k;
    b.hidden=!allowed(key);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
  }
  for(const p of playAux.querySelectorAll('[data-play-pane]'))p.hidden=p.dataset.playPane!==k;
}
function playSelectSheet(k){
  if(!Object.hasOwn(PLAY_SHEET,k))k='actions';
  playSheetTab=k;
  for(const b of playHand.querySelectorAll('[data-sheet-tab]')){
    const active=b.dataset.sheetTab===k;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
  }
  for(const p of playHand.querySelectorAll('[data-sheet-pane]'))p.hidden=p.dataset.sheetPane!==k;
}
function playTabsKeyboard(e,selector){
  const b=e.target.closest(selector);
  if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  const buttons=[...b.parentNode.querySelectorAll(selector)].filter(x=>!x.hidden);
  if(!buttons.length)return;
  const i=buttons.indexOf(b),n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  e.preventDefault();buttons[n].click();buttons[n].focus();
}
function playLabels(){
  for(const b of playAux.querySelectorAll('[data-play-tab]'))b.textContent=tr(PLAY_AUX[b.dataset.playTab]);
  const labels={play_aux_label:['Table tools','Outils de table'],play_map_label:['Battle map','Carte tactique'],play_jump_sheet:['Character','Personnage'],play_display_label:['Displays','Écrans'],g_public:['Public table','Table publique'],g_map:['Second map screen','Carte sur un second écran'],g_screens:['Detect screens','Détecter les écrans']};
  for(const [id,p] of Object.entries(labels))$(id).textContent=tr(p);
  $('zin').setAttribute('aria-label',L2('Zoom in','Zoom avant'));
  $('zout').setAttribute('aria-label',L2('Zoom out','Zoom arrière'));
  $('mode_play').textContent=L2('Play','Partie');
  $('mode_edit').textContent=L2('Edit','Édition');
  $('g_screen').setAttribute('aria-label',L2('Destination screen','Écran de destination'));
  for(const o of $('g_screen').options)if(o.dataset.screenSize)o.textContent=(o.dataset.screenLabel||L2('Screen ','Écran ')+(+o.value+1))+' · '+o.dataset.screenSize;
  const msg=$('g_display_msg');if(msg.dataset.en!==undefined)msg.textContent=L2(msg.dataset.en,msg.dataset.fr);
  playRollPreview();
}
function playFit(){
  if(TABLE_DISPLAY||$('v-carte').hidden||playSizeQ)return;
  playSizeQ=requestAnimationFrame(()=>{
    playSizeQ=0;if($('v-carte').hidden)return;
    const top=Math.ceil(playWorkspace.getBoundingClientRect().top+window.scrollY),h=Math.max(420,window.innerHeight-top-12)+'px';
    if(playWorkspace.style.getPropertyValue('--play-height')!==h)playWorkspace.style.setProperty('--play-height',h);
  });
}
function playSync(){
  if(TABLE_DISPLAY)return;
  const claim=MP.role==='player'&&MP.prole!=='spec'?(MP.me?'claimed':'unclaimed'):'other';
  if(claim!==playClaimState){
    if(claim==='unclaimed')playAuxTab='mp';
    else if(claim==='claimed'&&playAuxTab==='mp')playAuxTab='in';
    playClaimState=claim;
  }
  playSelectAux(playAuxTab);
}
function playTokenSync(){
  if(TABLE_DISPLAY)return;
  const k=tokens.find(t=>t.id===selTok);
  if(k&&k.id!==playLastToken&&!k.cid&&MP.role!=='player'&&!$('tk_panel').hidden)playAuxTab='tk';
  playLastToken=k?.id||null;playSync();
}
function playRollPreview(){
  const el=$('play_last_roll'),last=$('rl_list').lastElementChild;
  const s=last&&RL.length?last.textContent.trim():L2('No rolls yet','Aucun jet pour le moment');
  if(el.textContent!==s)el.textContent=s;el.title=s;
}
function playArrangeHand(scroll=0){
  const top=playHand.querySelector('.htop'),cards=playHand.querySelector('.hcards');
  if(!top||!cards)return;
  const summary=top.querySelector('.hside'),matrix=top.querySelector('.pf');
  if(!summary||!matrix)return;
  top.replaceChildren(summary);
  const nav=document.createElement('div');nav.className='play-sheet-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label',L2('Character sections','Sections du personnage'));
  for(const [k,p] of Object.entries(PLAY_SHEET)){
    const b=document.createElement('button');b.type='button';b.dataset.sheetTab=k;b.id='play_sheet_tab_'+k;
    b.setAttribute('role','tab');b.setAttribute('aria-controls','play_sheet_'+k);b.textContent=tr(p);nav.append(b);
  }
  const content=document.createElement('div');content.className='play-sheet-body';
  const panes={};
  for(const k of Object.keys(PLAY_SHEET)){
    const p=document.createElement('section');p.className='play-sheet-pane';p.dataset.sheetPane=k;p.id='play_sheet_'+k;
    p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby','play_sheet_tab_'+k);panes[k]=p;content.append(p);
  }
  panes.checks.append(matrix);
  for(const card of [...cards.children]){
    const k=card.matches('.k-sf')?'checks'
      :card.matches('.k-spl')?'magic'
      :card.matches('.k-inv,.k-eq')?'gear'
      :card.matches('.k-note,.k-add,.k-cus,.k-tal,.k-training')?'profile'
      :'actions';
    panes[k].append(card);
  }
  for(const k of Object.keys(panes))if(!panes[k].children.length){
    const p=document.createElement('p');p.className='play-empty-sheet';p.textContent=t('sk_nospell');panes[k].append(p);
  }
  cards.replaceWith(nav,content);playSelectSheet(playSheetTab);content.scrollTop=scroll;
}
function playRoute(){
  if(TABLE_DISPLAY)return;
  const rolls=$('rolls');
  if(!$('v-carte').hidden){$('play_roll_pane').append(rolls);playFit();}
  else if(rolls.parentNode!==document.body)document.body.append(rolls);
}
{
  const originalHand=renderHand;
  renderHand=function(){
    const character=handChar()?.id||'';
    const sameCharacter=playHand.dataset.character===character;
    const scroll=sameCharacter?playHand.querySelector('.play-sheet-body')?.scrollTop||0:0;
    const openWeapons=sameCharacter?[...playHand.querySelectorAll('[data-weapon][open]')].map(e=>e.dataset.weapon):[];
    const active=document.activeElement;
    const focusAttrs=sameCharacter&&playHand.contains(active)&&active.matches('button,select')
      ?[...active.attributes].filter(a=>a.name==='id'||a.name.startsWith('data-'))
      :[];
    originalHand.apply(this,arguments);
    playHand.dataset.character=character;
    playArrangeHand(scroll);
    for(const d of playHand.querySelectorAll('[data-weapon]'))d.open=openWeapons.includes(d.dataset.weapon);
    if(focusAttrs.length){
      const match=[...playHand.querySelectorAll(active.tagName)].find(el=>focusAttrs.every(a=>el.getAttribute(a.name)===a.value));
      match?.focus({preventScroll:true});
    }
  };
  const originalTok=renderTok;
  renderTok=function(){const r=originalTok.apply(this,arguments);playTokenSync();return r;};
  const originalRoll=rlRender;
  rlRender=function(){const r=originalRoll.apply(this,arguments);playRollPreview();return r;};
  playAux.addEventListener('click',e=>{
    const b=e.target.closest('[data-play-tab]');if(!b)return;
    playSelectAux(b.dataset.playTab);if(playAuxTab==='roll'&&!rlOpen){rlOpen=true;rlRender();}
  });
  playHand.addEventListener('click',e=>{
    const b=e.target.closest('[data-sheet-tab]');if(!b)return;
    playSelectSheet(b.dataset.sheetTab);const p=playHand.querySelector('.play-sheet-body');if(p)p.scrollTop=0;
  });
  playWorkspace.addEventListener('click',e=>{
    const b=e.target.closest('[data-play-jump]');if(!b)return;
    const target=$(b.dataset.playJump);target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
  });
  $('pl_toggle').onclick=()=>{
    const open=$('pl_bar').classList.toggle('open');
    $('pl_toggle').setAttribute('aria-expanded',String(open));
    if(open)$('pl_q').focus({preventScroll:true});
  };
  playAux.addEventListener('keydown',e=>playTabsKeyboard(e,'[data-play-tab]'));
  playHand.addEventListener('keydown',e=>playTabsKeyboard(e,'[data-sheet-tab]'));
  $('play_last_roll').onclick=()=>{playSelectAux('roll');if(!rlOpen){rlOpen=true;rlRender();}};
  const resize=new ResizeObserver(playFit);
  for(const e of [$('v-carte').querySelector('.bar'),$('ctxbar'),$('savebox'),$('play_display_bar'),document.querySelector('header'),document.querySelector('.tabs')])if(e)resize.observe(e);
  window.addEventListener('resize',playFit);window.addEventListener('hashchange',playRoute);
  playWorkspace.dataset.ready='1';playLabels();playSync();playRollPreview();renderHand();playRoute();
}
// Second displays retain map-only and public spectator views, without module cloning.
const gViews=new Map();
let gTick=0,gScreenDetails=null;
function gDisplayMsg(en, fr) {
  const el = $('g_display_msg');
  if (el) {el.dataset.en=en;el.dataset.fr=fr;el.textContent=L2(en,fr);}
}
function gPopupFeatures() {
  const sel = $('g_screen'), s = gScreenDetails && sel && gScreenDetails.screens[+sel.value];
  if (!s || sel.hidden) return 'popup,width=900,height=720';
  return 'popup,left=' + Math.round(s.availLeft) + ',top=' + Math.round(s.availTop) +
    ',width=' + Math.max(400, Math.round(s.availWidth * .9)) + ',height=' + Math.max(300, Math.round(s.availHeight * .9));
}
async function gDetectScreens() {
  if (!window.getScreenDetails) return gDisplayMsg('Screen detection is unavailable. Move windows manually.', 'Détection indisponible : déplace les fenêtres manuellement.');
  try {
    gScreenDetails = await window.getScreenDetails();
    const s = $('g_screen');
    const render = () => {
      s.replaceChildren();
      gScreenDetails.screens.forEach((screen, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.dataset.screenLabel=screen.label||'';o.dataset.screenSize=screen.width+'×'+screen.height;
        o.textContent=(screen.label||L2('Screen ','Écran ')+(i+1))+' · '+o.dataset.screenSize;
        s.append(o);
      });
      const i = gScreenDetails.screens.indexOf(gScreenDetails.currentScreen);
      if (gScreenDetails.screens.length > 1) s.value = String(i === 0 ? 1 : 0);
      s.hidden = false;
    };
    render();
    gScreenDetails.addEventListener('screenschange', render);
    gDisplayMsg('Choose a screen, then open a window.', 'Choisis un écran, puis ouvre une fenêtre.');
  } catch (e) {
    gDisplayMsg('Screen permission refused. Move windows manually.', 'Autorisation refusée : déplace les fenêtres manuellement.');
  }
}
function gOpenView(kind) {
  if (TABLE_DISPLAY || (kind==='public' && MP.role==='player')) return;
  if (gViews.has(kind) && !gViews.get(kind).win.closed) return gViews.get(kind).win.focus();
  const url = new URL(location.pathname,location.href);
  url.searchParams.set('table-display',kind);
  url.hash='carte';
  const win = window.open(url.href,'_blank',gPopupFeatures());
  if(!win) return gDisplayMsg('Popup blocked. Allow popups for Luparis.','Fenêtre bloquée : autorise les pop-ups pour Luparis.');
  gViews.set(kind,{win,signature:'',ready:false});
  gStartTick();
}
function gViewState(kind) {
  const state = memStateNow();
  // A public display receives the same visibility-filtered map as spectators, never the GM state.
  return kind==='public' ? mpView(state,[]) : state;
}

function gStartTick(){
  if(gTick)return;
  gTick=setInterval(()=>{
    let full=null,publicState=null;
    for(const [kind,p] of gViews){
      if(p.win.closed){gViews.delete(kind);continue;}
      if(!p.ready)continue;
      if(kind==='public'&&MP.role==='player'){p.win.close();gViews.delete(kind);continue;}
      full ||= memStateNow();
      const state=kind==='public'?(publicState||=mpView(full,[])):full,signature=JSON.stringify(state);
      if(signature!==p.signature){p.signature=signature;p.win.postMessage({type:'luparis-table-state',state},location.origin);}
    }
    if(!gViews.size){clearInterval(gTick);gTick=0;}
  },300);
}
function gDisplayBoot(){
  if(TABLE_DISPLAY){
    document.body.classList.add('mp-player','mp-spec');
    const button=document.createElement('button');button.className='table-fullscreen';button.textContent=L2('Fullscreen','Plein écran');
    button.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{});};
    document.body.append(button);
    document.addEventListener('keydown',e=>{if(!['Escape','F11','Tab'].includes(e.key)){e.stopImmediatePropagation();e.preventDefault();}},true);
    window.addEventListener('message',e=>{
      if(e.origin!==location.origin||e.source!==window.opener||e.data?.type!=='luparis-table-state')return;
      const n=N,first=!document.body.classList.contains('table-ready');
      if(!applyState(e.data.state))return;
      document.body.classList.add('table-ready');
      if(first||n!==N){CAM.z=1;CAM.px=0;CAM.py=0;}layout();
    });
    if(window.opener)window.opener.postMessage({type:'luparis-table-ready'},location.origin);return;
  }
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.data?.type!=='luparis-table-ready')return;
    for(const p of gViews.values())if(e.source===p.win){p.ready=true;p.signature='';}
  });
  $('g_public').onclick=()=>gOpenView('public');$('g_map').onclick=()=>gOpenView('gm');$('g_screens').onclick=gDetectScreens;
  window.addEventListener('pagehide',()=>{for(const p of gViews.values())if(!p.win.closed)p.win.close();clearInterval(gTick);});
}

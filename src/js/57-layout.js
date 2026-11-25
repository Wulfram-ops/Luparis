const PLAY_AUX={in:['Initiative','Initiative'],tk:['Token','Pion'],mk:['Markers / zones','Repères / zones'],img:['Illustrations','Illustrations'],sn:['GM notes','Notes MJ']};
const PLAY_SHEET={actions:['Combat','Combat'],checks:['Checks','Tests'],magic:['Magic','Magie'],gear:['Equipment','Équipement'],profile:['Profile','Profil']};
const PLAY_LAYOUT_LABELS={
  play_presets:['Play layouts','Dispositions de jeu'],
  play_customize:['Customize','Personnaliser'],
  play_map_short:['Map','Carte'],
  play_map:['Battle map','Carte tactique'],
  play_character:['Character','Personnage'],
  play_tools:['Table tools','Outils de table'],
  play_position:['Arrangement','Disposition'],
  play_width:['Column width','Largeur des colonnes'],
  play_panels:['Visible panels','Panneaux visibles'],
  play_restore:['Reset layout','Rétablir le preset'],
  play_done:['Done','Terminer'],
  play_terrain:['Terrain','Terrain'],
};
const PLAY_PRESETS = {
  table: {label:['Table','Table'],hint:['Map, character and table tools','Carte, personnage et outils de table'],position:'table',width:'balanced',sheet:true,tools:true,aux:'in',tab:'actions'},
  combat: {label:['Combat','Combat'],hint:['Initiative above your combat sheet','Initiative au-dessus de la fiche de combat'],position:'rail',width:'map',sheet:true,tools:true,aux:'in',tab:'actions'},
  explore: {label:['Exploration','Exploration'],hint:['Full-width map with markers and zones','Carte pleine largeur avec repères et zones'],position:'table',width:'map',sheet:false,tools:true,aux:'mk',tab:'checks'},
  sheet: {label:['Character','Fiche'],hint:['Wide character sheet with the map in view','Fiche au premier plan, carte à portée'],position:'sheet',width:'panel',sheet:true,tools:true,aux:'in',tab:'checks'},
  prepare: {label:['Preparation','Préparation'],hint:['Map editor and scenario presets','Éditeur et modèles de cartes'],position:'rail',width:'map',sheet:false,tools:true,aux:'mk',tab:'profile',gm:true},
};
const PLAY_POSITIONS = {
  table:['Map left, tools below','Carte à gauche, outils en dessous'],
  rail:['Map left, tools in the right column','Carte à gauche, outils dans la colonne droite'],
  sheet:['Character sheet first','Fiche au premier plan'],
  stack:['Stacked panels','Panneaux empilés'],
};
const PLAY_WIDTHS = {balanced:['Balanced','Équilibrée'],map:['Wider map','Carte plus large'],panel:['Wider panels','Panneaux plus larges']};
let playAuxTab='in',playSheetTab='actions',playLastToken=null,playSizeQ=0;
const playWorkspace=$('play_workspace'),playAux=$('play_aux'),playHand=$('hand');
const PLAY_LAYOUT_KEY = 'luparis-play-layout-v1';
let playRole = '', playPreset = 'table', playOverrides = {}, playModeBeforePrep = null;

function playPresetAllowed(key) {
  if (!Object.hasOwn(PLAY_PRESETS,key)) return false;
  if (playRole === 'spectator') return key === 'explore';
  return !(playRole === 'player' && PLAY_PRESETS[key].gm);
}
function playSettings() {
  const base = PLAY_PRESETS[playPreset], saved = playOverrides[playPreset] || {};
  return {
    position: Object.hasOwn(PLAY_POSITIONS,saved.position) ? saved.position : base.position,
    width: Object.hasOwn(PLAY_WIDTHS,saved.width) ? saved.width : base.width,
    sheet: typeof saved.sheet === 'boolean' ? saved.sheet : base.sheet,
    tools: typeof saved.tools === 'boolean' ? saved.tools : base.tools,
  };
}
function playStoreLayout() {
  const all = lsGet(PLAY_LAYOUT_KEY,{}) || {};
  lsSet(PLAY_LAYOUT_KEY,{...all,[playRole]:{preset:playPreset,overrides:playOverrides}});
}
function playApplyLayout() {
  const {position,width,sheet,tools} = playSettings(),
    canReadSheet = playRole !== 'spectator';
  playHand.hidden = !canReadSheet || !sheet;
  playAux.hidden = !tools;
  playWorkspace.dataset.preset = playPreset;
  playWorkspace.dataset.position = position;
  playWorkspace.dataset.width = width;
  playWorkspace.dataset.sheet = String(!playHand.hidden);
  playWorkspace.dataset.tools = String(!playAux.hidden);
  for (const button of $('play_presets').querySelectorAll('[data-play-preset]')) {
    button.hidden = !playPresetAllowed(button.dataset.playPreset);
    button.setAttribute('aria-pressed',String(button.dataset.playPreset === playPreset));
  }
  for (const option of $('play_preset_select').options) {
    option.hidden = !playPresetAllowed(option.value);
    option.disabled = option.hidden;
  }
  $('play_preset_select').value = playPreset;
  $('play_position').value = position;
  $('play_width').value = width;
  $('play_width').disabled = position === 'stack';
  $('play_sheet_visible').checked = !playHand.hidden;
  $('play_sheet_visible').disabled = !canReadSheet;
  $('play_tools_visible').checked = !playAux.hidden;
  for (const button of document.querySelectorAll('#v-carte [data-play-jump]')) button.hidden = $(button.dataset.playJump).hidden;
  playFit();
}
function playUsePreset(key) {
  if (!playPresetAllowed(key)) return;
  if (key === 'prepare' && playPreset !== 'prepare') {
    playModeBeforePrep = document.body.classList.contains('mode-edit') ? 'edit' : 'play';
    setMode('edit',false);
  } else if (key !== 'prepare' && playModeBeforePrep) {
    if (document.body.classList.contains('mode-edit')) setMode(playModeBeforePrep,false);
    playModeBeforePrep = null;
  }
  playPreset = key;
  const base = PLAY_PRESETS[key];
  playSelectAux(base.aux);
  playSelectSheet(base.tab);
  const sheetBody = playHand.querySelector('.play-sheet-body');
  if (sheetBody) sheetBody.scrollTop = 0;
  playApplyLayout();
}
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
  for (const node of document.querySelectorAll('[data-play-i18n]')) node.textContent=tr(PLAY_LAYOUT_LABELS[node.dataset.playI18n]);
  $('play_presets').setAttribute('aria-label',tr(PLAY_LAYOUT_LABELS.play_presets));
  $('play_presets').innerHTML=Object.entries(PLAY_PRESETS).map(([key,p])=>
    `<button type="button" data-play-preset="${key}" title="${esc(tr(p.hint))}">${tr(p.label)}</button>`).join('');
  $('play_preset_select').setAttribute('aria-label',tr(PLAY_LAYOUT_LABELS.play_presets));
  $('play_preset_select').replaceChildren(...Object.entries(PLAY_PRESETS).map(([key,p])=>new Option(tr(p.label),key)));
  for (const [id,choices] of [['play_position',PLAY_POSITIONS],['play_width',PLAY_WIDTHS]]) {
    $(id).innerHTML=Object.entries(choices).map(([key,title])=>`<option value="${key}">${tr(title)}</option>`).join('');
  }
  $('mode_play').textContent=L2('Play','Partie');
  $('mode_edit').textContent=L2('Edit','Édition');
  if (!TABLE_DISPLAY) playApplyLayout();
  document.dispatchEvent(new Event('play-labels'));
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
  const role=MP.role==='player'?(MP.prole==='spec'?'spectator':'player'):'table';
  if (role !== playRole) {
    playRole=role;
    const saved=lsGet(PLAY_LAYOUT_KEY,{})?.[role] || {};
    playOverrides=saved.overrides && typeof saved.overrides==='object' && !Array.isArray(saved.overrides) ? saved.overrides : {};
    playUsePreset(playPresetAllowed(saved.preset) ? saved.preset : role==='spectator'?'explore':'table');
    return;
  }
  playSelectAux(playAuxTab);
}
function playTokenSync(){
  if(TABLE_DISPLAY)return;
  const k=tokens.find(t=>t.id===selTok);
  if(k&&k.id!==playLastToken&&!k.cid&&MP.role!=='player'&&!$('tk_panel').hidden)playAuxTab='tk';
  playLastToken=k?.id||null;playSync();
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
  playAux.addEventListener('click',e=>{
    const b=e.target.closest('[data-play-tab]');if(!b)return;
    playSelectAux(b.dataset.playTab);
  });
  playHand.addEventListener('click',e=>{
    const b=e.target.closest('[data-sheet-tab]');if(!b)return;
    playSelectSheet(b.dataset.sheetTab);const p=playHand.querySelector('.play-sheet-body');if(p)p.scrollTop=0;
  });
  $('v-carte').addEventListener('click',e=>{
    const b=e.target.closest('[data-play-jump]');if(!b)return;
    const target=$(b.dataset.playJump);
    if(target.hidden)return;
    target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
  });
  $('play_presets').addEventListener('click',e=>{
    const b=e.target.closest('[data-play-preset]');
    if(!b || b.dataset.playPreset===playPreset)return;
    playUsePreset(b.dataset.playPreset);
    playStoreLayout();
  });
  $('play_preset_select').onchange=e=>{
    playUsePreset(e.target.value);
    playStoreLayout();
  };
  $('play_customize').onclick=()=>$('play_layout_dialog').showModal();
  $('play_layout_dialog').addEventListener('change',()=>{
    const current=playSettings();
    playOverrides[playPreset]={
      position:$('play_position').value,width:$('play_width').value,
      sheet:$('play_sheet_visible').disabled?current.sheet:$('play_sheet_visible').checked,
      tools:$('play_tools_visible').checked,
    };
    playStoreLayout();
    playApplyLayout();
  });
  $('play_restore').onclick=()=>{
    delete playOverrides[playPreset];
    playUsePreset(playPreset);
    playStoreLayout();
  };
  $('pl_toggle').onclick=()=>{
    const open=$('pl_bar').classList.toggle('open');
    $('pl_toggle').setAttribute('aria-expanded',String(open));
    if(open)$('pl_q').focus({preventScroll:true});
  };
  $('map_fields_toggle').onclick=()=>{
    const open=$('map_fields').classList.toggle('open');
    $('map_fields_toggle').setAttribute('aria-expanded',String(open));
  };
  playAux.addEventListener('keydown',e=>playTabsKeyboard(e,'[data-play-tab]'));
  playHand.addEventListener('keydown',e=>playTabsKeyboard(e,'[data-sheet-tab]'));
  const resize=new ResizeObserver(playFit);
  for(const e of [$('v-carte').querySelector('.bar'),$('ctxbar'),$('savebox'),$('play_presets').parentNode,document.querySelector('header'),document.querySelector('.tabs')])resize.observe(e);
  window.addEventListener('resize',playFit);window.addEventListener('hashchange',playFit);
  playWorkspace.dataset.ready='1';playLabels();playSync();renderHand();playFit();
}
// Keep receiving map updates in a display opened by an older version.
function gDisplayBoot(){
  if(!TABLE_DISPLAY)return;
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
  if(window.opener)window.opener.postMessage({type:'luparis-table-ready'},location.origin);
}

(()=>{
  'use strict';
  const KEY='takaguchhi-lock-v1';
  const GRACE_MS=15000;
  const root=document.documentElement;
  const $=id=>document.getElementById(id);
  const BN='০১২৩৪৫৬৭৮৯';
  const TXT={
    bn:{title:'অ্যাপ লক',off:'লক বন্ধ আছে। PIN দিয়ে হিসাব সুরক্ষিত রাখুন।',on:'PIN লক চালু আছে। অ্যাপ খুলতে PIN লাগবে।',enable:'PIN লক চালু করুন',change:'PIN বদলান',disable:'লক বন্ধ করুন',bio:'ফিঙ্গারপ্রিন্ট দিয়ে খুলুন',
      hUnlock:'অ্যাপ লক করা আছে',sUnlock:'PIN দিন',hNew:'নতুন PIN দিন',sNew:'৪ অঙ্কের PIN বেছে নিন',hConfirm:'PIN আবার দিন',sConfirm:'একই PIN আরেকবার লিখুন',hOld:'বর্তমান PIN দিন',sOld:'চালিয়ে যেতে PIN দিন',
      wrong:'PIN ভুল হয়েছে',mismatch:'PIN দুটো মেলেনি, আবার চেষ্টা করুন',wait:'অনেকবার ভুল হয়েছে। অপেক্ষা করুন: ',sec:' সেকেন্ড',bioTitle:'TakaGuchhi আনলক করুন',bioNeg:'PIN ব্যবহার করুন',cancel:'বাতিল',del:'মুছুন',bioKey:'ফিঙ্গারপ্রিন্ট'},
    en:{title:'App lock',off:'Lock is off. Protect your records with a PIN.',on:'PIN lock is on. A PIN is needed to open the app.',enable:'Turn on PIN lock',change:'Change PIN',disable:'Turn off lock',bio:'Unlock with fingerprint',
      hUnlock:'App is locked',sUnlock:'Enter your PIN',hNew:'Set a new PIN',sNew:'Choose a 4-digit PIN',hConfirm:'Confirm your PIN',sConfirm:'Enter the same PIN again',hOld:'Enter current PIN',sOld:'Enter your PIN to continue',
      wrong:'Wrong PIN',mismatch:'PINs did not match, try again',wait:'Too many attempts. Wait ',sec:' s',bioTitle:'Unlock TakaGuchhi',bioNeg:'Use PIN',cancel:'Cancel',del:'Delete',bioKey:'Fingerprint'}
  };
  const lang=()=>root.lang==='en'?'en':'bn';
  const t=k=>TXT[lang()][k];
  const num=d=>lang()==='bn'?BN[d]:String(d);

  let cfg=null;
  try{cfg=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){cfg=null}
  let mode='unlock',buf='',first='',after=null,fails=0,until=0,timer=null;
  let covered=false,hiddenAt=0,bioBusy=false,bioPurpose='';
  let settingsWasOpen=false;

  const save=()=>{try{cfg?localStorage.setItem(KEY,JSON.stringify(cfg)):localStorage.removeItem(KEY)}catch(e){}};
  async function sha(text){
    if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
    let h=5381;for(const c of text)h=((h<<5)+h+c.charCodeAt(0))|0;return 'x'+h;
  }
  const newSalt=()=>{const a=new Uint8Array(8);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256)}).getRandomValues(a);return Array.from(a).map(x=>x.toString(16).padStart(2,'0')).join('')};
  async function verify(pin){return Boolean(cfg)&&await sha(cfg.salt+':'+pin)===cfg.hash}
  const bioAvail=()=>{try{return Boolean(window.AndroidLock)&&AndroidLock.canBiometric()}catch(e){return false}};

  /* ---------- lock screen ---------- */
  function buildScreen(){
    const el=document.createElement('div');
    el.id='lockScreen';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
    el.innerHTML='<button class="lock-cancel" id="lockCancel" type="button" hidden>×</button>'
      +'<div class="lock-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor"/></svg></div>'
      +'<h2 id="lockHead"></h2><p id="lockSub"></p>'
      +'<div class="lock-dots" id="lockDots"><i></i><i></i><i></i><i></i></div>'
      +'<p class="lock-error" id="lockError" role="alert"></p><div class="lock-pad" id="lockPad"></div>';
    document.body.appendChild(el);
    $('lockCancel').onclick=()=>finish();
  }
  function renderPad(){
    const pad=$('lockPad');pad.innerHTML='';
    const key=(label,fn,cls,aria)=>{const b=document.createElement('button');b.type='button';b.className='lock-key '+(cls||'');b.innerHTML=label;if(aria)b.setAttribute('aria-label',aria);if(fn)b.onclick=fn;else b.disabled=true;return b};
    for(let d=1;d<=9;d++)pad.appendChild(key(num(d),()=>press(d)));
    const fp='<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11a6 6 0 0 1 12 0v2"/><path d="M9 13v-2a3 3 0 0 1 6 0v3c0 3-1 5-2 6"/><path d="M12 13v2c0 2-.6 3.6-1.5 5"/><path d="M6 14c0 2-.3 3.3-1 4.5"/><path d="M18 14.5c0 1.5-.2 2.8-.6 3.8"/></svg>';
    const showBio=mode==='unlock'&&cfg&&cfg.bio&&bioAvail();
    pad.appendChild(showBio?key(fp,()=>tryBio('unlock'),'lock-bio',t('bioKey')):key('',null,'lock-blank'));
    pad.appendChild(key(num(0),()=>press(0)));
    pad.appendChild(key('<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12z"/><path d="m13 9 4 6M17 9l-4 6"/></svg>',back,'lock-del',t('del')));
  }
  function renderDots(){document.querySelectorAll('#lockDots i').forEach((d,i)=>d.classList.toggle('on',i<buf.length))}
  function render(){
    if(!$('lockScreen'))return;
    const h={unlock:['hUnlock','sUnlock'],new:['hNew','sNew'],confirm:['hConfirm','sConfirm'],old:['hOld','sOld']}[mode];
    $('lockHead').textContent=t(h[0]);$('lockSub').textContent=t(h[1]);
    $('lockCancel').hidden=mode==='unlock';$('lockCancel').setAttribute('aria-label',t('cancel'));
    renderPad();renderDots();
  }
  const setLocked=on=>root.classList.toggle('app-locked',on);
  function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id==='settingsDialog')settingsWasOpen=true;d.close()})}
  function lock(){
    if(!cfg)return;closeDialogs();mode='unlock';buf='';first='';after=null;render();setLocked(true);autoBio();
  }
  function unlock(){buf='';fails=0;setLocked(false);renderSettings()}
  function finish(){
    buf='';first='';after=null;mode='unlock';setLocked(false);render();renderSettings();
    if(settingsWasOpen){settingsWasOpen=false;const d=$('settingsDialog');if(d&&!d.open)d.showModal()}
  }
  function openFlow(m,fn){
    settingsWasOpen=Boolean($('settingsDialog')&&$('settingsDialog').open);
    if(settingsWasOpen)$('settingsDialog').close();
    mode=m;buf='';first='';after=fn||null;$('lockError').textContent='';render();setLocked(true);
  }

  /* ---------- PIN entry ---------- */
  function press(d){
    if(Date.now()<until)return;
    if(buf.length>=4)return;
    buf+=d;renderDots();$('lockError').textContent='';
    if(buf.length===4)setTimeout(submit,110);
  }
  function back(){if(buf){buf=buf.slice(0,-1);renderDots()}}
  function shake(msg){
    const el=$('lockScreen');$('lockError').textContent=msg;buf='';renderDots();
    el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');
    if(navigator.vibrate)navigator.vibrate(120);
  }
  function wrong(){
    fails++;
    if(fails>=5){fails=0;until=Date.now()+30000;countdown()}else shake(t('wrong'));
  }
  function countdown(){
    clearInterval(timer);buf='';renderDots();
    const tick=()=>{const left=Math.ceil((until-Date.now())/1000);if(left<=0){clearInterval(timer);$('lockError').textContent='';return}$('lockError').textContent=t('wait')+left+t('sec')};
    tick();timer=setInterval(tick,500);
  }
  async function submit(){
    const pin=buf;
    if(mode==='unlock'){(await verify(pin))?unlock():wrong();return}
    if(mode==='old'){if(await verify(pin)){buf='';const fn=after;after=null;fn&&fn()}else wrong();return}
    if(mode==='new'){first=pin;buf='';mode='confirm';render();return}
    if(mode==='confirm'){
      if(pin===first){const salt=newSalt();cfg={salt,hash:await sha(salt+':'+pin),bio:Boolean(cfg&&cfg.bio)};save();finish()}
      else{mode='new';first='';render();shake(t('mismatch'))}
    }
  }

  /* ---------- fingerprint (Android native) ---------- */
  function tryBio(purpose){
    if(bioBusy||!bioAvail())return;
    bioBusy=true;bioPurpose=purpose;setTimeout(()=>{bioBusy=false},45000);
    try{AndroidLock.authenticate(t('bioTitle'),t('bioNeg'))}catch(e){bioBusy=false}
  }
  window.onBiometricResult=(ok)=>{
    const p=bioPurpose;bioBusy=false;bioPurpose='';
    if(p==='unlock'&&ok)unlock();
    if(p==='enable'){if(ok&&cfg){cfg.bio=true;save()}renderSettings()}
  };
  function autoBio(){if(cfg&&cfg.bio&&mode==='unlock')setTimeout(()=>{if(root.classList.contains('app-locked')&&!document.hidden)tryBio('unlock')},350)}

  /* ---------- settings section ---------- */
  function buildSettings(){
    const dlg=$('settingsDialog');const acc=dlg&&dlg.querySelector('.account-section');if(!acc)return;
    const sec=document.createElement('section');sec.className='account-section lock-section';sec.setAttribute('aria-labelledby','lockTitle');
    sec.innerHTML='<h3 id="lockTitle"></h3><p id="lockStatus"></p>'
      +'<button class="google-button lock-primary" id="lockEnable" type="button"></button>'
      +'<div id="lockOn" hidden><button class="google-button" id="lockChange" type="button"></button>'
      +'<label class="lock-switch" id="lockBioRow" hidden><span id="lockBioLabel"></span><input type="checkbox" id="lockBio"></label>'
      +'<button class="google-button signout-button" id="lockDisable" type="button"></button></div>';
    acc.insertAdjacentElement('afterend',sec);
    $('lockEnable').onclick=()=>openFlow('new');
    $('lockChange').onclick=()=>openFlow('old',()=>{mode='new';first='';buf='';render()});
    $('lockDisable').onclick=()=>openFlow('old',()=>{cfg=null;save();finish()});
    $('lockBio').onchange=e=>{
      if(!cfg)return;
      if(e.target.checked)tryBio('enable');else{cfg.bio=false;save()}
    };
  }
  function renderSettings(){
    if(!$('lockTitle'))return;
    $('lockTitle').textContent=t('title');
    $('lockStatus').textContent=cfg?t('on'):t('off');
    $('lockEnable').textContent=t('enable');$('lockEnable').hidden=Boolean(cfg);
    $('lockOn').hidden=!cfg;
    $('lockChange').textContent=t('change');$('lockDisable').textContent=t('disable');
    $('lockBioLabel').textContent=t('bio');
    $('lockBioRow').hidden=!bioAvail();$('lockBio').checked=Boolean(cfg&&cfg.bio);
  }

  /* ---------- app lifecycle ---------- */
  document.addEventListener('visibilitychange',()=>{
    if(!cfg)return;
    if(document.hidden){
      hiddenAt=Date.now();
      if(mode==='unlock'&&!root.classList.contains('app-locked')){covered=true;closeDialogs();setLocked(true)}
    }else{
      if(covered){
        covered=false;
        if(Date.now()-hiddenAt<GRACE_MS)setLocked(false);else{lock()}
      }else if(root.classList.contains('app-locked')&&mode==='unlock')autoBio();
    }
  });

  function init(){
    buildScreen();buildSettings();render();renderSettings();
    new MutationObserver(()=>{render();renderSettings()}).observe(root,{attributes:true,attributeFilter:['lang']});
    if(cfg){setLocked(true);autoBio()}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

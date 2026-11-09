(() => {
  'use strict';
  const registry=window.AKCarrierRegistry, intel=window.AKTrackingIntelligence;
  const $=id=>document.getElementById(id);
  const form=$('carrierTrackingForm');
  if(!form||!registry||!intel)return;
  const ref=$('trackingReference'),toggle=$('akCarrierToggle'),name=$('akCarrierName'),picker=$('akCarrierPicker'),drop=$('akCarrierDropdown'),search=$('akCarrierSearch'),list=$('akCarrierResults'),empty=$('akCarrierEmpty'),link=$('trackingOfficialLink'),status=$('trackingStatus'),selection=$('akTrackingSelection');
  const featured=$('akFeaturedCarriers'),allToggle=$('akAllCarriersToggle'),allPanel=$('akAllCarriers'),allSearch=$('akAllCarrierSearch'),allResults=$('akAllCarrierResults'),allEmpty=$('akAllCarrierEmpty');
  const translations={
    kicker:['AK INTERNATIONAL · FREE SHIPPING TRACKING','AK INTERNATIONAL · خدمة تتبع مجانية'],title:['Track Your Shipment','تتبع شحنتك'],intro:['Official shipping line trackers, one click away.','صفحات التتبع الرسمية لشركات الملاحة بضغطة واحدة.'],
    choose:['Choose your shipping line','اختر شركة الملاحة'],all:['View All Shipping Lines','عرض جميع شركات الملاحة'],find:['Find a shipping line','ابحث عن شركة ملاحة'],noMatches:['No matching shipping line.','لا توجد شركة مطابقة.'],noVerified:['If a carrier has no verified tracker, contact our team.','إذا لم يتوفر رابط تتبع موثّق، تواصل مع فريقنا.'],
    byNumber:['Or track by reference number','أو تتبع برقم الشحنة'],optional:['Optional — automatic carrier suggestion when available.','اختياري — اقتراح الشركة تلقائيًا عند توفر البيانات.'],reference:['Container / B/L / Booking number','رقم الحاوية / البوليصة / الحجز'],carrier:['Shipping line','شركة الملاحة'],track:['Track Shipment ↗','تتبع الشحنة ↗'],missing:['Shipping line not listed? Contact us','لم تجد شركة الشحن؟ تواصل معنا'],note:["Carrier detection is only a suggestion. Official trackers open on the carrier's website.",'تحديد الشركة تلقائيًا مجرد اقتراح. يتم فتح صفحات التتبع على المواقع الرسمية للشركات.']
  };
  const ar=()=>document.documentElement.lang==='ar';
  const tr=(en,arabic)=>ar()?arabic:en;
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s.\-_/()]+/g,'');
  const carriers=[...registry.carriers].sort((a,b)=>a.name.localeCompare(b.name,'en'));
  const searchData=carriers.map(c=>({c,key:normalize([c.name,c.id,c.short,c.aliases].join(' '))}));
  const featuredIds=['maersk','msc','cma-cgm','cosco','oocl','evergreen'];
  let manual='',detected=null,active=-1,options=[];
  function selected(){return registry.getCarrier(manual)||registry.getCarrier(detected?.carrierId);}
  function message(value='',error=false){status.textContent=value;status.className=error?'is-error':'';}
  function imageOf(carrier){if(!carrier.logo)return null;const img=document.createElement('img');img.src=carrier.logo;img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>img.replaceWith(Object.assign(document.createElement('strong'),{textContent:carrier.name,className:'ak-carrier-name-fallback'})),{once:true});return img;}
  function carrierAnchor(carrier,featuredCard=false){
    const verified=!!carrier.officialUrl;
    const el=document.createElement(verified?'a':'div');
    el.className=featuredCard?'ak-featured-carrier':'ak-directory-link';
    if(verified){
      el.href=carrier.officialUrl;
      el.target='_blank';
      el.rel='noopener noreferrer';
      el.setAttribute('aria-label',tr(carrier.linkType==='portal'?'Open official portal: ':'Open official tracker: ',carrier.linkType==='portal'?'فتح البوابة الرسمية: ':'فتح التتبع الرسمي: ')+carrier.name);
    }else{
      el.setAttribute('aria-disabled','true');
      el.title=tr('Tracking link unavailable','رابط التتبع غير متاح');
    }
    if(featuredCard){
      const img=imageOf(carrier);
      if(img)el.append(img);
      const label=document.createElement('span');
      label.textContent=tr('Official tracker ↗','التتبع الرسمي ↗');
      el.append(label);
      return el;
    }
    const logo=document.createElement('span');
    logo.className='ak-directory-logo';
    const fallback=document.createElement('strong');
    fallback.className='ak-directory-wordmark';
    fallback.textContent=carrier.name;
    fallback.title=tr('Text label — official logo not available','اسم الشركة — الشعار الرسمي غير متاح');
    fallback.setAttribute('aria-hidden','true');
    if(carrier.logo){
      const img=document.createElement('img');
      img.src=carrier.logo;
      img.alt='';
      img.loading='lazy';
      img.decoding='async';
      img.addEventListener('error',()=>img.replaceWith(fallback),{once:true});
      logo.append(img);
    }else logo.append(fallback);
    const detail=document.createElement('span');
    detail.className='ak-directory-detail';
    const title=document.createElement('span');
    title.className='ak-directory-name';
    title.textContent=carrier.name;
    const subtitle=document.createElement('span');
    subtitle.className='ak-directory-status';
    subtitle.textContent=verified?(carrier.linkType==='portal'?tr('Official customer portal','بوابة العملاء الرسمية'):tr('Official tracker','التتبع الرسمي')):tr('Tracking link unavailable','رابط التتبع غير متاح');
    detail.append(title,subtitle);
    const icon=document.createElement('span');
    icon.className='ak-directory-action';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=verified?'↗':'—';
    el.append(logo,detail,icon);
    return el;
  }
  function renderFeatured(){featured.replaceChildren(...featuredIds.map(id=>registry.getCarrier(id)).filter(Boolean).map(c=>carrierAnchor(c,true)));}
  function renderDirectory(){
    const q=normalize(allSearch.value),matched=searchData.filter(x=>x.key.includes(q));
    // Fixed number of visible results; typing updates locally without network requests.
    allResults.replaceChildren(...matched.slice(0,80).map(x=>carrierAnchor(x.c)));
    allEmpty.hidden=matched.length>0;
  }
  const allToggleLabel=allToggle.querySelector('.ak-all-toggle-label');
  function updateAllToggle(){
    const open=!allPanel.hidden;
    allToggle.setAttribute('aria-expanded',String(open));
    allToggleLabel.textContent=tr(open?'Hide Shipping Lines':'View All Shipping Lines',open?'إخفاء شركات الملاحة':'عرض جميع شركات الملاحة');
  }
  allToggle.addEventListener('click',()=>{
    const open=allPanel.hidden;
    allPanel.hidden=!open;
    updateAllToggle();
    if(open){renderDirectory();allSearch.focus();}
  });
  allSearch.addEventListener('input',renderDirectory);
  function setOpen(open){if(drop.hidden===!open)return;drop.hidden=!open;toggle.setAttribute('aria-expanded',String(open));search.setAttribute('aria-expanded',String(open));if(open){search.value='';renderOptions();search.focus();}else{search.removeAttribute('aria-activedescendant');active=-1;}}
  function choose(id){manual=id==='auto'?'':id;setOpen(false);evaluate();toggle.focus();}
  function highlight(index){if(!options.length)return;active=index;options.forEach((el,i)=>el.classList.toggle('is-active',i===active));if(options[active]){search.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});}else search.removeAttribute('aria-activedescendant');}
  function renderOptions(){
    list.replaceChildren();active=-1;search.removeAttribute('aria-activedescendant');
    const q=normalize(search.value),matches=searchData.filter(x=>x.key.includes(q)).map(x=>x.c);
    const entries=[{id:'auto',name:tr('Auto-detect','اكتشاف تلقائي')},...matches];
    entries.forEach(c=>{const item=document.createElement('div');item.className='ak-carrier-option';item.id='carrier-option-'+c.id;item.dataset.id=c.id;item.setAttribute('role','option');item.setAttribute('aria-selected',String(c.id===(manual||'auto')));if(c.logo){const img=imageOf(c);if(img)item.append(img);}const label=document.createElement('span');label.className='ak-carrier-option-name';label.textContent=c.name;item.append(label);item.addEventListener('mousedown',e=>e.preventDefault());item.addEventListener('click',()=>choose(c.id));list.append(item);});
    options=[...list.children];empty.hidden=matches.length>0;empty.textContent=tr('No matching shipping line. Try another name or contact us.','لا توجد شركة مطابقة. جرّب اسمًا آخر أو تواصل معنا.');
  }
  function renderLogo(id,carrier){const img=$(id);img.hidden=true;img.removeAttribute('src');if(!carrier?.logo)return;img.onload=()=>img.hidden=false;img.onerror=()=>img.hidden=true;img.src=carrier.logo;if(img.complete&&img.naturalWidth>0)img.hidden=false;}
  function refresh(){
    const c=selected();renderLogo('akSelectedLogo',manual?c:null);renderLogo('akSuggestedLogo',!manual?c:null);name.textContent=manual?c.name:tr('Auto-detect','اكتشاف تلقائي');
    selection.textContent=c?(manual?tr('Selected: ','الشركة المختارة: '):tr('Suggested (verify carrier): ','الشركة المقترحة (يرجى التحقق): '))+c.name:tr('Choose a shipping line if automatic detection is unavailable.','اختر شركة الملاحة إن لم يتوفر الاكتشاف التلقائي.');
    link.hidden=!c?.officialUrl;if(c?.officialUrl){link.href=c.officialUrl;link.textContent=tr('Open official tracker ↗','فتح التتبع الرسمي ↗');link.setAttribute('aria-label',tr('Open official tracker: ','فتح التتبع الرسمي: ')+c.name);}else link.removeAttribute('href');
  }
  function evaluate(){const value=intel.normalize(ref.value);detected=value?intel.detect(value):null;ref.removeAttribute('aria-invalid');message();refresh();if(detected?.type==='container'&&detected.validContainer===false)message(tr('Check the container number: its check digit is invalid.','راجع رقم الحاوية: رقم التحقق غير صحيح.'),true);else if(value&&!selected())message(tr('Select a shipping line; this reference could not identify one automatically.','اختر شركة الملاحة؛ تعذر تحديدها من الرقم تلقائيًا.'));}
  toggle.addEventListener('click',()=>setOpen(drop.hidden));
  search.addEventListener('input',renderOptions);
  search.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();highlight((active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);}else if(e.key==='Enter'){e.preventDefault();if(active>=0)choose(options[active].dataset.id);}else if(e.key==='Escape'){e.preventDefault();setOpen(false);toggle.focus();}});
  picker.addEventListener('focusout',()=>setTimeout(()=>{if(!picker.contains(document.activeElement))setOpen(false);},0));
  document.addEventListener('click',e=>{if(!picker.contains(e.target))setOpen(false);});
  ref.addEventListener('input',evaluate);
  async function copy(value){try{await navigator.clipboard.writeText(value);return true;}catch{return false;}}
  form.addEventListener('submit',async e=>{
    e.preventDefault();evaluate();const value=intel.normalize(ref.value),c=selected();
    if(!value){message(tr('Enter a reference, or click a carrier logo above for direct access without a number.','أدخل رقم الشحنة، أو اضغط شعار الشركة بالأعلى للوصول المباشر دون رقم.'),true);ref.focus();return;}
    if(detected?.type==='container'&&detected.validContainer===false){ref.setAttribute('aria-invalid','true');ref.focus();return;}
    if(!c){message(tr('Choose a shipping line to continue.','اختر شركة الملاحة للمتابعة.'),true);setOpen(true);return;}
    if(!c.officialUrl){message(tr('An official tracker is not verified for this line. Please contact us.','لم نوثّق صفحة تتبع رسمية لهذه الشركة بعد. تواصل معنا.'),true);return;}
    const url=registry.getTrackingUrl(c,value,detected?.type),direct=Boolean(c.prefill&&url!==c.officialUrl);
    // Open in the original user gesture to avoid popup blocking.
    let popup;try{popup=window.open(url,'_blank');if(popup)popup.opener=null;}catch{}
    const copied=direct?false:await copy(value);
    if(!popup){message(tr('Pop-up blocked. Use the official tracker link shown above.','تم حظر التبويب الجديد. استخدم رابط التتبع الرسمي الموضح أعلاه.'),true);return;}
    message(direct?tr('Official tracker opened with your reference.','تم فتح التتبع الرسمي مع رقم الشحنة.'):copied?tr('Reference copied. Paste it into the official tracker.','تم نسخ الرقم. الصقه في صفحة التتبع الرسمية.'):tr('Use your reference on the official carrier tracker.','استخدم رقم شحنتك في صفحة التتبع الرسمية.'));
  });
  function language(){document.querySelectorAll('[data-track-text]').forEach(el=>{const t=translations[el.dataset.trackText];if(t)el.textContent=t[ar()?1:0];});updateAllToggle();allSearch.placeholder=tr('Search by company name…','ابحث باسم شركة الملاحة…');search.placeholder=tr('Search by name or abbreviation…','ابحث باسم الشركة أو اختصارها…');search.setAttribute('aria-label',tr('Search shipping lines','البحث عن شركات الملاحة'));ref.placeholder=tr('Enter your shipment reference','أدخل رقم الشحنة');renderFeatured();if(!allPanel.hidden)renderDirectory();evaluate();if(!drop.hidden)renderOptions();}
  document.addEventListener('ak:languagechange',language);language();
})();

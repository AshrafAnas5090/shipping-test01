(() => {
  'use strict';
  const registry=window.AKCarrierRegistry, intel=window.AKTrackingIntelligence;
  const $=id=>document.getElementById(id);
  const form=$('carrierTrackingForm');
  if(!form||!registry||!intel)return;
  const ref=$('trackingReference'),toggle=$('akCarrierToggle'),name=$('akCarrierName'),picker=$('akCarrierPicker'),drop=$('akCarrierDropdown'),search=$('akCarrierSearch'),list=$('akCarrierResults'),empty=$('akCarrierEmpty'),link=$('trackingOfficialLink'),status=$('trackingStatus'),selection=$('akTrackingSelection');
  const text={
    kicker:['OCEAN FREIGHT · SHIPMENT TRACKING','الشحن البحري · تتبع الشحنات'],title:['Track your shipment.','تتبّع شحنتك.'],intro:['Find your shipping line. Continue to its official tracker.','اختر خط الملاحة وانتقل إلى صفحة التتبع الرسمية.'],reference:['Container / B/L / Booking number','رقم الحاوية / البوليصة / الحجز'],carrier:['Shipping line','خط الملاحة'],track:['Track shipment ↗','تتبع الشحنة ↗'],missing:['Shipping line not listed? Contact us','لم تجد شركة الشحن؟ تواصل معنا'],note:['Carrier suggestions are not a confirmation of the operating line. Results open on the carrier’s website.','اقتراح الشركة لا يؤكد الناقل الفعلي. تُفتح النتائج على موقع شركة الشحن.']
  };
  const ar=()=>document.documentElement.lang==='ar';
  const tr=(en,arabic)=>ar()?arabic:en;
  const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/[\s.\-_/()]+/g,'');
  const carriers=[...registry.carriers].sort((a,b)=>a.name.localeCompare(b.name,'en'));
  let manual='',detected=null,active=-1,options=[];
  function selected(){return registry.getCarrier(manual)||registry.getCarrier(detected?.carrierId);}
  function message(value='',error=false){status.textContent=value;status.className=error?'is-error':'';}
  function setOpen(open){drop.hidden=!open;toggle.setAttribute('aria-expanded',String(open));search.setAttribute('aria-expanded',String(open));if(open){search.value='';renderOptions();search.focus();}else{search.removeAttribute('aria-activedescendant');active=-1;}}
  function choose(id){manual=id==='auto'?'':id;setOpen(false);evaluate();toggle.focus();}
  function highlight(index){active=index;options.forEach((el,i)=>el.classList.toggle('is-active',i===active));if(options[active]){search.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});}else search.removeAttribute('aria-activedescendant');}
  function renderOptions(){
    list.replaceChildren();active=-1;search.removeAttribute('aria-activedescendant');
    const q=normalize(search.value),matches=carriers.filter(c=>normalize([c.name,c.id,c.short,c.aliases].join(' ')).includes(q));
    const entries=[{id:'auto',name:tr('Auto-detect','اكتشاف تلقائي')},...matches];
    entries.forEach(c=>{const item=document.createElement('div');item.className='ak-carrier-option';item.id='carrier-option-'+c.id;item.dataset.id=c.id;item.setAttribute('role','option');item.setAttribute('aria-selected',String(c.id===(manual||'auto')));if(c.logo){const img=document.createElement('img');img.src=c.logo;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});item.append(img);}const label=document.createElement('span');label.className='ak-carrier-option-name';label.textContent=c.name;item.append(label);item.addEventListener('mousedown',e=>e.preventDefault());item.addEventListener('click',()=>choose(c.id));list.append(item);});
    options=[...list.children];empty.hidden=matches.length>0;empty.textContent=tr('No matching shipping line. Try another name or contact us.','لا توجد شركة مطابقة. جرّب اسمًا آخر أو تواصل معنا.');
  }
  function renderLogo(id, carrier){
    const img=$(id);
    img.hidden=true;
    img.removeAttribute('src');
    // Keep the company name visible even if its image fails to load.
    if(!carrier?.logo)return;
    img.onload=()=>{img.hidden=false;};
    img.onerror=()=>{img.hidden=true;};
    img.src=carrier.logo;
    if(img.complete&&img.naturalWidth>0)img.hidden=false;
  }
  function refresh(){
    const c=selected();renderLogo('akSelectedLogo',manual?c:null);renderLogo('akSuggestedLogo',!manual?c:null);name.textContent=manual?c.name:tr('Auto-detect','اكتشاف تلقائي');
    selection.textContent=c?(manual?tr('Selected: ','الشركة المختارة: '):tr('Suggested: ','الشركة المقترحة: '))+c.name:tr('Choose a line to open its official tracker without a reference.','اختر شركة لفتح صفحة تتبعها الرسمية دون إدخال رقم.');
    link.hidden=!c?.officialUrl;
    if(c?.officialUrl){link.href=c.officialUrl;link.textContent=tr('Official tracker ↗','التتبع الرسمي ↗');link.setAttribute('aria-label',tr('Open official tracker: ','فتح التتبع الرسمي: ')+c.name);}
    else{link.removeAttribute('href');if(c)selection.textContent+=' — '+tr('Official tracking link not yet verified. Contact us for assistance.','رابط التتبع الرسمي غير موثّق بعد. تواصل معنا للمساعدة.');}
  }
  function evaluate(){
    const value=intel.normalize(ref.value);detected=value?intel.detect(value):null;
    ref.removeAttribute('aria-invalid');message();refresh();
    if(detected?.type==='container'&&detected.validContainer===false)message(tr('Check the container number: its check digit is invalid.','راجع رقم الحاوية: رقم التحقق غير صحيح.'),true);
    else if(value&&!selected())message(tr('Select a shipping line; this reference could not identify one automatically.','اختر خط الملاحة؛ تعذر تحديده تلقائيًا من هذا الرقم.'));
  }
  toggle.addEventListener('click',()=>setOpen(drop.hidden));
  search.addEventListener('input',renderOptions);
  search.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();highlight((active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);}
    else if(e.key==='Home'&&e.ctrlKey){e.preventDefault();highlight(0);}
    else if(e.key==='End'&&e.ctrlKey){e.preventDefault();highlight(options.length-1);}
    else if(e.key==='Enter'){e.preventDefault();if(active>=0)choose(options[active].dataset.id);}
    else if(e.key==='Escape'){e.preventDefault();setOpen(false);toggle.focus();}
  });
  picker.addEventListener('focusout',()=>setTimeout(()=>{if(!picker.contains(document.activeElement))setOpen(false);},0));
  document.addEventListener('click',e=>{if(!picker.contains(e.target))setOpen(false);});
  ref.addEventListener('input',evaluate);
  async function copy(value){try{await navigator.clipboard.writeText(value);return true;}catch{return false;}}
  form.addEventListener('submit',async e=>{
    e.preventDefault();evaluate();const value=intel.normalize(ref.value),c=selected();
    if(!value){message(tr('Enter a shipment reference first.','أدخل رقم الشحنة أولًا.'),true);ref.setAttribute('aria-invalid','true');ref.focus();return;}
    if(detected?.type==='container'&&detected.validContainer===false){ref.setAttribute('aria-invalid','true');ref.focus();return;}
    if(!c){message(tr('Choose a shipping line to continue.','اختر شركة الشحن للمتابعة.'),true);setOpen(true);return;}
    if(!c.officialUrl){message(tr('An official tracker is not yet verified for this line. Please contact us.','لم نوثّق صفحة تتبع رسمية لهذه الشركة بعد. يرجى التواصل معنا.'),true);return;}
    const url=registry.getTrackingUrl(c,value,detected?.type),direct=Boolean(c.prefill&&url!==c.officialUrl);
    const pending=direct?Promise.resolve(false):copy(value);
    // Open synchronously during user activation; never replace the standalone official link.
    let popup;try{popup=window.open(url,'_blank');if(popup)popup.opener=null;}catch{}
    const copied=await pending;
    if(!popup){message(tr('New tab blocked. Use the official tracker link above.','تم منع التبويب الجديد. استخدم رابط التتبع الرسمي أعلاه.'),true);return;}
    message(direct?tr('Opened '+c.name+' with your reference.','تم فتح '+c.name+' مع رقم الشحنة.'):copied?tr('Reference copied. Paste it into '+c.name+'’s official tracker.','تم نسخ الرقم. الصقه في صفحة التتبع الرسمية لـ '+c.name+'.'):tr('Enter '+value+' in '+c.name+'’s official tracker.','أدخل '+value+' في صفحة التتبع الرسمية لـ '+c.name+'.'));
  });
  function language(){document.querySelectorAll('[data-track-text]').forEach(el=>{el.textContent=text[el.dataset.trackText][ar()?1:0];});search.placeholder=tr('Search by name or abbreviation…','ابحث باسم الشركة أو اختصارها…');search.setAttribute('aria-label',tr('Search shipping lines','البحث عن شركات الشحن'));ref.placeholder=tr('Enter your shipment reference','أدخل رقم الشحنة');evaluate();if(!drop.hidden)renderOptions();}
  document.addEventListener('ak:languagechange',language);language();
})();

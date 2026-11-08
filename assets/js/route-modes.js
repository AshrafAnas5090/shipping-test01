(() => {
  'use strict';
  const groups = [['quickShipmentMode','quickOrigin','quickDestination','quickSwapPorts'],['shipmentMode','origin','destination','quoteSwapPorts']];
  const ar=()=>document.documentElement.lang==='ar';
  const kind=g=>{const v=document.querySelector(`input[name="${g}"]:checked`)?.value;return v==='Air Freight'?'air':v==='Land Transport'?'land':'sea'};
  const drafts=new Map();
  function label(k,i){return k==='air'?(ar()?['مطار / مدينة المغادرة','مطار / مدينة الوصول']:['Origin airport / city','Destination airport / city'])[i]:(ar()?['موقع الاستلام','موقع التسليم']:['Pickup location','Delivery location'])[i]}
  for(const [group,...ids] of groups){
    ids.slice(0,2).forEach((id,i)=>{
      const original=document.getElementById(id),combo=original.closest('.port-combo');
      const wrap=document.createElement('div');wrap.className='route-location';wrap.hidden=true;
      const input=document.createElement('input');input.id=id+'Location';input.type='text';input.maxLength=250;input.autocomplete='off';
      wrap.append(input);combo.after(wrap);
      input.addEventListener('input',()=>drafts.set(id+':'+kind(group),input.value));
    });
    document.querySelectorAll(`input[name="${group}"]`).forEach(el=>el.addEventListener('change',refresh));
    document.getElementById(ids[2]).addEventListener('click',event=>{
      if(kind(group)==='sea')return;
      event.stopImmediatePropagation();
      const a=document.getElementById(ids[0]+'Location'),b=document.getElementById(ids[1]+'Location');
      [a.value,b.value]=[b.value,a.value];a.dispatchEvent(new Event('input'));b.dispatchEvent(new Event('input'));
    },true);
  }
  function refresh(){
    for(const [group,...ids] of groups){const k=kind(group);
      ids.slice(0,2).forEach((id,i)=>{
        const original=document.getElementById(id),input=document.getElementById(id+'Location');
        original.disabled=k!=='sea';original.closest('.port-combo').hidden=k!=='sea';
        input.parentElement.hidden=k==='sea';input.disabled=k==='sea';input.required=k!=='sea';
        input.value=drafts.get(id+':'+k)||'';input.placeholder=label(k,i);input.setAttribute('aria-label',label(k,i));
        const title=document.querySelector(`label[for="${id}"]`);
        if(!title.dataset.seaTextEn){title.dataset.seaTextEn=i?'Destination':'Origin';}
        title.textContent=k==='sea'?(ar()?(i?'الوجهة':'المنشأ'):title.dataset.seaTextEn):label(k,i);
      });
    }
  }
  window.AKRouteModes={
    isSea:()=>kind('quickShipmentMode')==='sea',
    quickValid:()=>['quickOrigin','quickDestination'].every(id=>document.getElementById(id+'Location').value.trim()),
    copy(){for(const [a,b] of [['quickOrigin','origin'],['quickDestination','destination']]){drafts.set(b+':'+kind('shipmentMode'),document.getElementById(a+'Location').value);}refresh();},
    value(id){return kind('shipmentMode')==='sea'?null:document.getElementById(id+'Location').value.trim()},
    label:i=>kind('shipmentMode')==='sea'?null:label(kind('shipmentMode'),i)
  };
  document.addEventListener('ak:languagechange',refresh);refresh();
})();

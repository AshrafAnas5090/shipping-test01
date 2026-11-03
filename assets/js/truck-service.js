(() => {
 'use strict';
 const el=id=>document.getElementById(id), enabled=el('truckEnabled'), leg=el('truckLeg');
 const mode=()=>document.querySelector('[name="shipmentMode"]:checked')?.value;
 function state(){const active=enabled.checked&&mode()!=='Land Transport';return {active,origin:active&&['origin','both'].includes(leg.value),destination:active&&['destination','both'].includes(leg.value)};}
 function update(){
  const s=state();el('truckService').hidden=mode()==='Land Transport';el('truckPanel').hidden=!s.active;leg.disabled=!s.active;leg.required=s.active;
  for(const [id,on,required] of [['truckPickup',s.origin,true],['truckDelivery',s.destination,true],['truckOriginDate',s.origin,false],['truckDestinationDate',s.destination,false],['truckNotes',s.active,false]]){
   el(id+'Wrap').hidden=!on;el(id).disabled=!on;el(id).required=on&&required;el(id).setCustomValidity('');
  }
  const ar=document.documentElement.lang==='ar';document.querySelectorAll('[data-truck-en]').forEach(n=>n.textContent=n.dataset[ar?'truckAr':'truckEn']);
 }
 enabled.addEventListener('change',update);leg.addEventListener('change',update);document.querySelectorAll('[name="shipmentMode"]').forEach(n=>n.addEventListener('change',update));document.addEventListener('ak:languagechange',update);
 for(const id of ['truckPickup','truckDelivery'])el(id).addEventListener('input',()=>el(id).setCustomValidity(''));
 el('quoteForm').addEventListener('submit',e=>{
  const s=state();let bad=null;
  for(const [id,on] of [['truckLeg',s.active],['truckPickup',s.origin],['truckDelivery',s.destination]])if(on&&!el(id).value.trim()){bad ||= el(id);el(id).setCustomValidity(document.documentElement.lang==='ar'?'هذا الحقل مطلوب.':'This field is required.');}
  if(bad){e.preventDefault();e.stopImmediatePropagation();el('quoteForm').reportValidity();}
 },true);
 window.AKTruckService={messageLines(ar){const s=state();if(!s.active)return [];const lines=['',ar?'*النقل بالشاحنات*':'*TRUCK TRANSPORT*'];
 const add=(label,id)=>{const v=el(id).value.trim();if(v)lines.push(`• ${label}: ${v}`)};
 if(s.origin){add(ar?'عنوان الاستلام إلى ميناء / مطار المغادرة':'Pickup address to origin port / airport','truckPickup');add(ar?'تاريخ الاستلام المطلوب':'Requested pickup date','truckOriginDate');}
 if(s.destination){add(ar?'عنوان التسليم من ميناء / مطار الوصول':'Delivery address from destination port / airport','truckDelivery');add(ar?'تاريخ التسليم المطلوب':'Requested delivery date','truckDestinationDate');}
 add(ar?'ملاحظات النقل':'Transport notes','truckNotes');return lines;
 }};update();
})();

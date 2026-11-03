/* Optional backend: failures never interrupt the customer journey. */
(()=>{'use strict';
 const endpoint=new URL('api/collect.php',document.currentScript.src.replace(/assets\/js\/backend.js.*$/,''));
 const uuid=()=>crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(20)),x=>x.toString(16).padStart(2,'0')).join('');
 let visitor,session;try{visitor=localStorage.getItem('ak_visitor')||uuid();localStorage.setItem('ak_visitor',visitor);session=sessionStorage.getItem('ak_session')||uuid();sessionStorage.setItem('ak_session',session);}catch{visitor=uuid();session=uuid();}
 const send=(body,retry=false)=>{if(!/^https?:$/.test(location.protocol))return;fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,visitor,session,page:location.pathname}),keepalive:true,credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error();}).catch(()=>{if(retry)setTimeout(()=>send(body),1500);});};
 const enabled=()=>navigator.doNotTrack!=='1' && !localStorageSafe('ak_analytics_off');
 function localStorageSafe(k){try{return localStorage.getItem(k);}catch{return null;}}
 if(enabled())send({kind:'pageview'});
 document.getElementById('quoteForm')?.addEventListener('input',()=>{if(enabled())send({kind:'quote_start'});},{once:true});
 let previous='',requestId='';
 window.AKBackend={submit(form,reference,message){try{
 const fields={};form.querySelectorAll('input,select,textarea').forEach(el=>{if(el.type==='radio'){if(el.checked)fields[el.name]=el.value;}else if(el.id)fields[el.id]=el.type==='checkbox'?el.checked:el.value;});
 fields.origin=window.AKRouteModes?.value('origin')||fields.origin;fields.destination=window.AKRouteModes?.value('destination')||fields.destination;
 const signature=JSON.stringify(fields);if(signature!==previous){previous=signature;requestId=uuid();}
 send({kind:'order',request_id:requestId,reference,fields,message},true);
 if(enabled())send({kind:'whatsapp_open'});
 }catch{/* WhatsApp continues independently. */}}};
})();

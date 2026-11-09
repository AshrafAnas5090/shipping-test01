/* Shared input hints. Existing route selection and validation remain authoritative. */
(()=>{'use strict';
const ids=['quickOrigin','quickDestination','origin','destination'];
function update(){const ar=document.documentElement.lang==='ar';
 ids.forEach(id=>{const input=document.getElementById(id);if(!input)return;if(input.closest('.port-combo')?.classList.contains('origin-composite'))return;let hint=document.getElementById(id+'Hint');if(!hint){hint=document.createElement('small');hint.id=id+'Hint';hint.className='input-guidance';input.closest('.port-combo').parentElement.append(hint);const desc=(input.getAttribute('aria-describedby')||'').split(' ').filter(Boolean);desc.push(hint.id);input.setAttribute('aria-describedby',[...new Set(desc)].join(' '));}
 const sea=!input.disabled;hint.textContent=sea?(ar?'اختر الميناء من نتائج البحث.':'Select a port from the suggestions.'):(ar?'أدخل المطار أو المدينة أو عنوان الموقع.':'Enter the airport, city or location.');
 const location=document.getElementById(id+'Location');if(location)location.setAttribute('aria-describedby',hint.id);
 input.placeholder=ar?'ابحث بالميناء أو المدينة أو الدولة':'Search port, city or country';
 });
 const ref=document.getElementById('trackingReference');if(ref)ref.placeholder=ar?'أدخل رقم الحاوية أو البوليصة أو الحجز':'Enter container, B/L or booking number';
}
document.addEventListener('ak:languagechange',update);document.querySelectorAll('[name="quickShipmentMode"],[name="shipmentMode"]').forEach(el=>el.addEventListener('change',update));update();
})();
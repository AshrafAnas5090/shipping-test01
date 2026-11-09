(() => {
  'use strict';
  const form=document.getElementById('quoteForm');
  if(!form)return;
  function validate(){
    const ar=document.documentElement.lang==='ar';
    const mode=form.querySelector('input[name="shipmentMode"]:checked')?.value;
    const required=['name','phone','shipper','cargo'];
    if(mode==='Sea Freight - FCL')required.push('containerSize','containerType','qty');
    const sea=mode?.startsWith('Sea Freight');
    required.push(...(sea?['origin','destination']:['originLocation','destinationLocation']));
    if(document.getElementById('customsEnabled').checked)required.push('ccLocation');
    let invalid=null;
    form.querySelectorAll('[data-quote-error]').forEach(el=>{el.setCustomValidity('');delete el.dataset.quoteError;});
    function fail(el,message){if(!el)return;el.setCustomValidity(message);el.dataset.quoteError='1';invalid ||= el;}
    if(!mode)fail(form.querySelector('[name="shipmentMode"]'),ar?'اختر نوع الشحن.':'Select a shipment type.');
    for(const id of required){const el=document.getElementById(id);if(!el?.value.trim())fail(el,ar?'هذا الحقل مطلوب.':'This field is required.');}
    if(sea)for(const id of ['origin','destination'])if(!window.AKPortSelector?.getSelected(id))fail(document.getElementById(id),ar?'اختر ميناءً من القائمة.':'Select a port from the list.');
    if(mode==='Sea Freight - FCL'){
      const q=document.getElementById('qty');if(!Number.isInteger(Number(q.value))||Number(q.value)<1)fail(q,ar?'أدخل عدد حاويات صحيحًا أكبر من صفر.':'Enter a positive whole container quantity.');
    }
    if(document.getElementById('customsEnabled').checked&&!form.querySelector('[name="ccType"]:checked'))fail(document.getElementById('ccTypeImport'),ar?'اختر استيراد أو تصدير.':'Select import or export.');
    const valid=form.checkValidity()&&!invalid;
    if(!valid){form.classList.add('validation-active');document.getElementById('status').textContent=ar?'يرجى استكمال البيانات الأساسية المطلوبة قبل الإرسال.':'Complete all required information before sending.';(invalid||form.querySelector(':invalid'))?.scrollIntoView({block:'center'});form.reportValidity();}
    return valid;
  }
  form.addEventListener('submit',event=>{if(!validate()){event.preventDefault();event.stopImmediatePropagation();}},true);
  form.addEventListener('input',event=>{if(event.target.dataset.quoteError){event.target.setCustomValidity('');delete event.target.dataset.quoteError;}});
  form.addEventListener('change',event=>{if(event.target.dataset.quoteError){event.target.setCustomValidity('');delete event.target.dataset.quoteError;}});
})();

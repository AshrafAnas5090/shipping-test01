(() => {
  "use strict";

  const storageGet = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const storageSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  };

const tr={
en:{
navAbout:"About",navServices:"Services",navNetwork:"Network",navTrack:"Track Shipment",navContact:"Contact",navQuote:"Get a Quote",quoteBtn:"Get a Quote",
heroKicker:"INTERNATIONAL FREIGHT FORWARDING",heroTitle:"International Freight Forwarding, Customs Clearance & Logistics in Egypt",heroLine1:"International Freight Forwarding",heroLine2:"Customs Clearance & Logistics in Egypt",heroSince:"DIRECT EXECUTION · EST. 2009",quickShipment:"SHIPMENT",
heroText:"Moving cargo across markets with clarity and control. Sea freight, air freight, customs clearance and integrated logistics solutions for importers, exporters and businesses.",
requestQuote:"Request a Quote",whatsapp:"WhatsApp",startQuote:"Start a Quote",exploreServices:"Explore Services",quickReady:"QUOTE REQUEST",quickNoLogin:"No account required",quickTitle:"Start your shipment quote.",quickText:"Choose the shipment type and route. Continue for cargo, contact and customs details.",quickAir:"AIR",quickLand:"LAND",quickPOL:"POL — Port of Loading",quickPOD:"POD — Port of Discharge",quickContinue:"Start Quote",drawerLanguage:"LANGUAGE",quickDirect:"Direct request to our team",quickDetails:"Cargo & customs details next",stepRoute:"Route",stepCargo:"Cargo",stepCustoms:"Customs",quoteSideTitle:"One request. One operational team.",quoteSideText:"Freight, documentation, customs and transport can be coordinated in one quotation flow.",years:"Years Experience",countries:"Countries Served",clients:"Trusted Clients",
linesTitle:"SHIPPING LINES WE WORK WITH",trackingKicker:"MULTI-CARRIER TRACKING",trackingTitle:"Track your container through the official shipping line.",trackingText:"Type or paste a container, B/L or booking reference. AK will detect a supported carrier when possible, while manual carrier selection remains available through the official logos.",trackingOfficial:"Official carrier portals only",trackingNewTab:"Opens securely in a new tab",trackingPanelKicker:"SHIPMENT VISIBILITY",trackingPanelTitle:"Track Shipment",trackingLive:"OFFICIAL PORTALS",trackingReferenceLabel:"Container / B/L / Booking Number",trackingReferenceHelp:"Type or paste the shipment reference here to test auto-detection.",trackingCarrierLabel:"Shipping Line",trackingButton:"Track Shipment",trackingManualTitle:"Select shipping line manually",trackingManualHint:"Use the logos only if auto-detection is unavailable or incorrect.",trackingNote:"Carrier detection is a convenience only. Container owner codes do not always identify the operating carrier. Verify the shipping line before continuing.",trackingOfficialLink:"Open official carrier tracker",trackingOwnerCodeLabel:"Owner code",trackingDetectedCarrierLabel:"Suggested carrier",trackingConfidenceLabel:"Confidence",trackingUseAuto:"Use auto detection",trackingStateAuto:"AUTO",trackingStateManual:"MANUAL",trackingStateOverride:"OVERRIDE",trackingStateDetected:"DETECTED",aboutKicker:"ABOUT US",aboutWord:"ABOUT",aboutTitle:"A practical logistics partner for international trade.",
about1:"Established in 2009, AK International provides sea freight, air freight, customs clearance, import & export support and integrated logistics services.",
about2:"We focus on responsive communication, reliable execution and shipping solutions shaped around each client's cargo, route and operational priorities.",
s1:"Years of experience",s2:"Countries served",s3:"Trusted clients",
servicesKicker:"OUR SERVICES",servicesTitle:"Core services without unnecessary complexity.",servicesText:"A focused logistics offering from freight booking and documentation to customs and delivery coordination.",
sea:"Sea Freight",seaText:"FCL, LCL, reefer and special-equipment ocean freight with flexible routing options.",
air:"Air Freight",airText:"Fast international air cargo support for urgent and time-sensitive shipments.",
customs:"Customs Clearance",customsText:"Documentation and customs handling to support smooth cargo release and movement.",
land:"Land Transport",landText:"Port-to-door and door-to-port transport coordination within the logistics chain.",
warehouse:"Warehousing & Distribution",warehouseText:"Storage, handling and distribution support for supply-chain requirements.",
trade:"Import & Export Support",tradeText:"Operational support for international trade flows, documentation and cargo coordination.",
networkKicker:"GLOBAL CONNECTIVITY",networkTitle:"From Egypt to global markets.",
networkText:"A shipment is more than one ocean leg. We coordinate the route around freight, customs, documentation and final movement.",
np1:"Ocean Freight",np1t:"FCL · LCL · Reefer",np2:"Air Cargo",np2t:"Time-sensitive shipments",np3:"Customs",np3t:"Documentation & clearance",np4:"Final Delivery",np4t:"Integrated inland movement",
mapNote:"Illustrative global logistics network",
whyKicker:"WHY AK INTERNATIONAL",whyTitle:"Built around execution.",whyText:"A straightforward operating approach for clients who value speed, clarity and dependable coordination.",
w1:"Responsive Communication",w1t:"Direct handling of quote and shipment requirements.",w2:"Competitive Routing",w2t:"Options structured around route, equipment and cost.",w3:"Operational Coordination",w3t:"Freight, documentation, customs and transport alignment.",w4:"Long-Term Partnerships",w4t:"Service built around repeat business and continuity.",
formKicker:"REQUEST A QUOTE",formTitle:"Complete your shipment request.",formText:"Add cargo, contact and optional customs details. Your request is prepared as a structured WhatsApp message for AK International.",requiredNote:"Fields marked * are required.",fclRequiredLabel:"FCL DETAILS · REQUIRED",
q1:"Direct to WhatsApp",q2:"FCL / LCL / Air fields",q3:"Discount code included",moreDetails:"Additional notes",optional:"Optional",
ccTitle:"CUSTOMS CLEARANCE",ccSub:"Add customs clearance to this quotation",ccAdd:"ADD SERVICE",ccAdded:"REMOVE",ccDetails:"CUSTOMS CLEARANCE DETAILS",ccType:"Clearance Type",ccTypeReq:"Clearance Type *",ccImport:"IMPORT",ccExport:"EXPORT",ccLocation:"Customs Clearance Location",ccLocationReq:"Customs Clearance Location *",ccOrigin:"Country of Origin",ccHs:"HS Code",ccHsUnknown:"HS Code Unknown",ccValue:"Cargo Value",ccCurrency:"Currency",ccDocs:"DOCUMENT AVAILABILITY",ccInvoice:"Commercial Invoice",ccPacking:"Packing List",ccBL:"Bill of Lading (B/L)",ccAWB:"Air Waybill (AWB)",ccCOO:"Certificate of Origin",ccLicense:"Import / Export License",ccImportLicense:"Import License",ccExportLicense:"Export License",ccPermits:"Required Permits / Approvals",ccMSDS:"MSDS — Safety Data Sheet",ccDG:"Dangerous Goods Declaration",ccSpecial:"Special Customs Requirements",ccSpecify:"Please specify",ccNotesTitle:"CUSTOMS ADDITIONAL NOTES",yes:"Yes",no:"No",fName:"Full Name *",fShipper:"Shipper Name *",fPhone:"Phone / WhatsApp *",fEmail:"Email",fShipment:"Shipment Type *",select:"Select",fcl:"Sea Freight - FCL",lcl:"Sea Freight - LCL",airOpt:"Air Freight",landOpt:"Land Transport",fOrigin:"POL — Port of Loading *",fDestination:"POD — Port of Discharge *",fContainerSize:"Container Size",fContainerType:"Container Type",fQty:"Container Quantity",fWeight:"Gross Weight (KG)",fCbm:"Volume / CBM",fReady:"Cargo Ready Date",fReleaseDays:"Estimated Cargo Release Time (Days)",fDiscount:"Discount Code",fCargo:"Cargo Description *",fNotes:"Additional Notes",send:"Send via WhatsApp",privacy:"The form only creates the WhatsApp message on your device.",invalid:"Please complete the required fields.",
ctaTitle:"Ready to move your cargo?",ctaText:"Send the details and start the quotation process directly with our team.",
footerText:"International freight forwarding, customs clearance and integrated logistics solutions.",footerNav:"Quick Links",footerServices:"Services",footerContact:"Contact",mainWhatsApp:"Main WhatsApp",officePhone:"Office",mobilePhone:"Mobile",contactKicker:"LET\'S TALK LOGISTICS",salesQuotes:"Sales & Quotations",headOffice:"Head Office",officeRegion:"Egypt",addressPending:"Full street address to be confirmed before launch.",rights:"All rights reserved.",opsTitle:"Integrated Operations",opsActive:"ACTIVE",opsOrigin:"Origin",opsDestination:"Destination",opsDocs:"Documents · Release",opsDelivery:"Port · Door Delivery",opsCoordination:"Trade Coordination",networkBoard:"GLOBAL ROUTE NETWORK",networkConnected:"CONNECTED",regionHub:"Operations Hub",regionEurope:"Europe",regionAsia:"Asia",regionAfrica:"Africa",regionAmericas:"Americas",regionGulf:"Gulf",networkFoot1:"Route planning",networkFoot2:"Carrier coordination",networkFoot3:"Shipment execution",footerTag:"More than logistics — we build bridges between markets."
},
ar:{
navAbout:"عن الشركة",navServices:"الخدمات",navNetwork:"شبكة الشحن",navTrack:"تتبع الشحنة",navContact:"تواصل معنا",navQuote:"طلب عرض سعر",quoteBtn:"اطلب عرض سعر",
heroKicker:"الشحن الدولي والخدمات اللوجستية",heroTitle:"الشحن الدولي والتخليص الجمركي والخدمات اللوجستية في مصر",heroLine1:"الشحن الدولي",heroLine2:"التخليص الجمركي والخدمات اللوجستية في مصر",heroSince:"تنفيذ مباشر · منذ 2009",quickShipment:"نوع الشحن",
heroText:"نحرك البضائع بين الأسواق بوضوح وتحكم. حلول للشحن البحري والجوي والتخليص الجمركي والخدمات اللوجستية للمستوردين والمصدرين والشركات.",
requestQuote:"اطلب عرض سعر",whatsapp:"واتساب",startQuote:"ابدأ طلب السعر",exploreServices:"استكشف الخدمات",quickReady:"طلب عرض سعر",quickNoLogin:"لا يحتاج إلى حساب",quickTitle:"ابدأ طلب عرض سعر لشحنتك.",quickText:"اختر نوع الشحن والمسار ثم أكمل بيانات البضاعة والتواصل والتخليص عند الحاجة.",quickAir:"جوي",quickLand:"بري",quickPOL:"POL — ميناء الشحن",quickPOD:"POD — ميناء التفريغ",quickContinue:"ابدأ طلب السعر",drawerLanguage:"اللغة",quickDirect:"طلب مباشر إلى فريقنا",quickDetails:"بيانات البضاعة والجمارك في الخطوة التالية",stepRoute:"المسار",stepCargo:"البضاعة",stepCustoms:"الجمارك",quoteSideTitle:"طلب واحد. فريق تشغيل واحد.",quoteSideText:"يمكن تنسيق الشحن والمستندات والجمارك والنقل ضمن مسار طلب سعر واحد.",years:"عامًا من الخبرة",countries:"دولة نخدمها",clients:"عميل موثوق",
linesTitle:"خطوط الشحن التي نتعامل معها",trackingKicker:"تتبع متعدد لخطوط الملاحة",trackingTitle:"تتبع حاويتك عبر نظام التتبع الرسمي لخط الملاحة.",trackingText:"اكتب أو الصق رقم الحاوية أو بوليصة الشحن أو الحجز. تحاول AK اكتشاف خط ملاحي مدعوم تلقائيًا، مع بقاء الاختيار اليدوي متاحًا من خلال الشعارات.",trackingOfficial:"روابط رسمية لخطوط الملاحة فقط",trackingNewTab:"يفتح بأمان في تبويب جديد",trackingPanelKicker:"رؤية الشحنة",trackingPanelTitle:"تتبع الشحنة",trackingLive:"الأنظمة الرسمية",trackingReferenceLabel:"رقم الحاوية / بوليصة الشحن / الحجز",trackingReferenceHelp:"اكتب أو الصق رقم الشحنة هنا لاختبار الاكتشاف التلقائي.",trackingCarrierLabel:"خط الملاحة",trackingButton:"تتبع الشحنة",trackingManualTitle:"اختر خط الملاحة يدويًا",trackingManualHint:"استخدم الشعارات فقط إذا لم ينجح الاكتشاف التلقائي أو كان غير صحيح.",trackingNote:"اقتراح خط الملاحة للمساعدة فقط؛ كود مالك الحاوية لا يحدد دائمًا الناقل الفعلي. تحقق من خط الملاحة قبل المتابعة.",trackingOfficialLink:"فتح نظام التتبع الرسمي",trackingOwnerCodeLabel:"كود المالك",trackingDetectedCarrierLabel:"خط الملاحة المقترح",trackingConfidenceLabel:"درجة الثقة",trackingUseAuto:"استخدام الاكتشاف التلقائي",trackingStateAuto:"تلقائي",trackingStateManual:"يدوي",trackingStateOverride:"تجاوز يدوي",trackingStateDetected:"مقترح",aboutKicker:"عن AK INTERNATIONAL",aboutWord:"عن",aboutTitle:"خبرة في الشحن. تركيز على التنفيذ.",
about1:"تنسق AK International أعمال الشحن الدولي والجمارك والخدمات اللوجستية من خلال علاقة تشغيلية واحدة سريعة الاستجابة.",
about2:"دورنا بسيط: نفهم الشحنة، ونبني المسار المناسب، وننسق التفاصيل، ونحافظ على وضوح التواصل من عرض السعر حتى التنفيذ.",
s1:"عامًا من الخبرة",s2:"دولة نخدمها",s3:"عميل موثوق",
servicesKicker:"خدماتنا",servicesTitle:"خدمات أساسية بدون تعقيد غير ضروري.",servicesText:"حلول لوجستية مركزة من الحجز والمستندات إلى الجمارك وتنسيق التسليم.",
sea:"الشحن البحري",seaText:"حلول FCL وLCL والحاويات المبردة والمعدات الخاصة مع خيارات مرنة للمسارات.",
air:"الشحن الجوي",airText:"دعم سريع للشحن الجوي الدولي للبضائع العاجلة والحساسة للوقت.",
customs:"التخليص الجمركي",customsText:"إدارة المستندات والإجراءات الجمركية لدعم الإفراج وحركة البضائع بسلاسة.",
land:"النقل البري",landText:"تنسيق النقل من الميناء إلى الباب ومن الباب إلى الميناء ضمن السلسلة اللوجستية.",
warehouse:"التخزين والتوزيع",warehouseText:"دعم التخزين والمناولة والتوزيع وفق احتياجات سلسلة الإمداد.",
trade:"دعم الاستيراد والتصدير",tradeText:"دعم تشغيلي للتجارة الدولية والمستندات وتنسيق حركة البضائع.",
networkKicker:"اتصال عالمي",networkTitle:"من مصر إلى الأسواق العالمية.",
networkText:"الشحنة ليست مجرد رحلة بحرية واحدة؛ نحن ننسق المسار حول الشحن والجمارك والمستندات والحركة النهائية.",
np1:"الشحن البحري",np1t:"FCL · LCL · مبرد",np2:"الشحن الجوي",np2t:"للشحنات الحساسة للوقت",np3:"الجمارك",np3t:"مستندات وتخليص",np4:"التسليم النهائي",np4t:"تنسيق الحركة البرية",
mapNote:"تصور توضيحي لشبكة لوجستية عالمية",
whyKicker:"لماذا AK INTERNATIONAL",whyTitle:"مصمم حول جودة التنفيذ.",whyText:"أسلوب تشغيل مباشر للعملاء الذين يقدّرون السرعة والوضوح والتنسيق الموثوق.",
w1:"تواصل سريع",w1t:"تعامل مباشر مع عروض الأسعار ومتطلبات الشحن.",w2:"خيارات تنافسية",w2t:"حلول حسب المسار والمعدات والتكلفة.",w3:"تنسيق تشغيلي",w3t:"مواءمة الشحن والمستندات والجمارك والنقل.",w4:"شراكات طويلة المدى",w4t:"خدمة مبنية على الاستمرارية وتكرار الأعمال.",
formKicker:"طلب عرض سعر",formTitle:"أكمل بيانات طلب الشحن.",formText:"أضف بيانات البضاعة والتواصل والتخليص الجمركي عند الحاجة. يتم تجهيز الطلب في رسالة واتساب منظمة إلى AK International.",requiredNote:"الحقول المميزة بعلامة * مطلوبة.",fclRequiredLabel:"بيانات FCL · مطلوبة",
q1:"إرسال مباشر إلى واتساب",q2:"حقول FCL / LCL / Air",q3:"يتضمن كود الخصم",moreDetails:"ملاحظات إضافية",optional:"اختياري",
ccTitle:"التخليص الجمركي",ccSub:"أضف خدمة التخليص الجمركي إلى طلب السعر",ccAdd:"إضافة الخدمة",ccAdded:"إزالة",ccDetails:"بيانات التخليص الجمركي",ccType:"نوع التخليص",ccTypeReq:"نوع التخليص *",ccImport:"استيراد",ccExport:"تصدير",ccLocation:"مكان التخليص الجمركي",ccLocationReq:"مكان التخليص الجمركي *",ccOrigin:"بلد المنشأ",ccHs:"HS Code",ccHsUnknown:"HS Code غير معروف",ccValue:"قيمة البضاعة",ccCurrency:"العملة",ccDocs:"مدى توافر المستندات",ccInvoice:"الفاتورة التجارية",ccPacking:"قائمة التعبئة",ccBL:"بوليصة الشحن (B/L)",ccAWB:"بوليصة الشحن الجوي (AWB)",ccCOO:"شهادة المنشأ",ccLicense:"ترخيص الاستيراد / التصدير",ccImportLicense:"ترخيص الاستيراد",ccExportLicense:"ترخيص التصدير",ccPermits:"التصاريح / الموافقات المطلوبة",ccMSDS:"MSDS — صحيفة بيانات السلامة",ccDG:"إقرار البضائع الخطرة",ccSpecial:"متطلبات جمركية خاصة",ccSpecify:"يرجى التوضيح",ccNotesTitle:"ملاحظات إضافية للتخليص الجمركي",yes:"نعم",no:"لا",fName:"الاسم بالكامل *",fShipper:"اسم الشاحن *",fPhone:"الهاتف / واتساب *",fEmail:"البريد الإلكتروني",fShipment:"نوع الشحن *",select:"اختر",fcl:"شحن بحري - FCL",lcl:"شحن بحري - LCL",airOpt:"شحن جوي",landOpt:"نقل بري",fOrigin:"POL — ميناء الشحن *",fDestination:"POD — ميناء التفريغ *",fContainerSize:"حجم الحاوية",fContainerType:"نوع الحاوية",fQty:"عدد الحاويات",fWeight:"الوزن الإجمالي (KG)",fCbm:"الحجم / CBM",fReady:"تاريخ الجاهزية",fReleaseDays:"المدة المتوقعة للإفراج عن الشحنة (بالأيام)",fDiscount:"كود الخصم",fCargo:"وصف البضاعة *",fNotes:"ملاحظات إضافية",send:"إرسال عبر واتساب",privacy:"النموذج يقوم فقط بإنشاء رسالة واتساب على جهازك.",invalid:"يرجى استكمال الحقول المطلوبة.",
ctaTitle:"جاهز لنقل شحنتك؟",ctaText:"أرسل التفاصيل وابدأ طلب عرض السعر مباشرة مع فريقنا.",
footerText:"الشحن الدولي والتخليص الجمركي والحلول اللوجستية المتكاملة.",footerNav:"روابط سريعة",footerServices:"الخدمات",footerContact:"التواصل",mainWhatsApp:"واتساب الرئيسي",officePhone:"المكتب",mobilePhone:"موبايل",contactKicker:"لنتحدث عن شحنتك",salesQuotes:"المبيعات وعروض الأسعار",headOffice:"المكتب الرئيسي",officeRegion:"مصر",addressPending:"سيتم إضافة العنوان الكامل قبل إطلاق الموقع.",rights:"جميع الحقوق محفوظة.",opsTitle:"عمليات متكاملة",opsActive:"نشط",opsOrigin:"المنشأ",opsDestination:"الوجهة",opsDocs:"المستندات · الإفراج",opsDelivery:"الميناء · التسليم",opsCoordination:"تنسيق التجارة",networkBoard:"شبكة المسارات العالمية",networkConnected:"متصل",regionHub:"مركز العمليات",regionEurope:"أوروبا",regionAsia:"آسيا",regionAfrica:"أفريقيا",regionAmericas:"الأمريكتان",regionGulf:"الخليج",networkFoot1:"تخطيط المسار",networkFoot2:"تنسيق الناقلين",networkFoot3:"تنفيذ الشحنة",footerTag:"أكثر من مجرد لوجستيات — نبني جسورًا بين الأسواق."
}};
const doc=document.documentElement;
const languageToggles=document.querySelectorAll("[data-language-toggle]");
let customsReady=false;
function updateCustomsDynamicLang(){
  if(!customsReady)return;
  updateCustomsUI();
  updateTransportDocLabel();
  updateLicenseLabel();
}

let arabicFontsPromise=null;
function ensureArabicFonts(){
  if(document.getElementById("akArabicFonts")) return Promise.resolve();
  if(arabicFontsPromise) return arabicFontsPromise;

  arabicFontsPromise=new Promise((resolve,reject)=>{
    const addPreconnect=(href,crossOrigin=false)=>{
      if(document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      const l=document.createElement("link");
      l.rel="preconnect";
      l.href=href;
      if(crossOrigin) l.crossOrigin="anonymous";
      document.head.appendChild(l);
    };

    addPreconnect("https://fonts.googleapis.com");
    addPreconnect("https://fonts.gstatic.com",true);

    const fontLink=document.createElement("link");
    fontLink.id="akArabicFonts";
    fontLink.rel="stylesheet";
    fontLink.href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap";
    fontLink.onload=()=>resolve();
    fontLink.onerror=()=>{
      arabicFontsPromise=null;
      reject(new Error("Arabic fonts failed to load"));
    };
    document.head.appendChild(fontLink);
  });

  return arabicFontsPromise;
}

function updateLanguageToggleUI(){
  const current=doc.lang==="ar"?"ar":"en";
  const nextLabel=current==="ar"?"EN":"عربي";
  const nextLong=current==="ar"?"English":"العربية";
  languageToggles.forEach(button=>{
    const label=button.querySelector("[data-language-label]");
    if(label) label.textContent=nextLabel;
    button.setAttribute("aria-label",current==="ar"?"Switch to English":"Switch to Arabic");
    button.setAttribute("title",nextLong);
  });
}

function setLang(lang){
  const d=tr[lang]||tr.en;
  doc.lang=lang;doc.dir=lang==="ar"?"rtl":"ltr";
  if(lang==="ar") ensureArabicFonts().catch(()=>{});
  document.querySelectorAll("[data-t]").forEach(el=>{const k=el.dataset.t;if(d[k]!=null)el.textContent=d[k]});
  const releaseDays=document.getElementById("releaseDays");
  const shipper=document.getElementById("shipper");
  const pol=document.getElementById("origin");
  const pod=document.getElementById("destination");
  const weight=document.getElementById("weight");
  if(releaseDays) releaseDays.placeholder=lang==="ar"?"مثال: 3":"e.g. 3";
  if(shipper) shipper.placeholder=lang==="ar"?"اسم الشاحن / الشركة":"Shipper / Company name";
  if(pol) pol.placeholder=lang==="ar"?"ابحث بالميناء أو المدينة أو الدولة أو UN/LOCODE...":"Search port, city, country or UN/LOCODE...";
  if(pod) pod.placeholder=lang==="ar"?"ابحث بالميناء أو المدينة أو الدولة أو UN/LOCODE...":"Search port, city, country or UN/LOCODE...";
  if(weight) weight.placeholder=lang==="ar"?"مثال: 18,500":"e.g. 18,500";
  const quickPol=document.getElementById("quickOrigin"),quickPod=document.getElementById("quickDestination");
  if(quickPol) quickPol.placeholder=lang==="ar"?"ابحث بالميناء أو المدينة أو الدولة أو UN/LOCODE...":"Search port, city, country or UN/LOCODE...";
  if(quickPod) quickPod.placeholder=lang==="ar"?"ابحث بالميناء أو المدينة أو الدولة أو UN/LOCODE...":"Search port, city, country or UN/LOCODE...";
  const trackingRef=document.getElementById("trackingReference");
  if(trackingRef) trackingRef.placeholder=lang==="ar"?"مثال: MSCU1234567":"e.g. MSCU1234567";
  updateCustomsDynamicLang?.();
  storageSet("ak_lang",lang);
  document.title=lang==="ar"?"AK International | الشحن الدولي والتخليص الجمركي في مصر":"Freight Forwarding & Customs Clearance in Egypt | AK International";
  updateLanguageToggleUI();
  document.dispatchEvent(new CustomEvent("ak:languagechange",{detail:{lang}}));
}
const savedLang=storageGet("ak_lang");
if(savedLang==="ar"){
  setLang("ar");
}else{
  // English is already rendered directly in the HTML.
  // Keep the initial load fast: no 154-element translation pass is needed.
  doc.lang="en";
  doc.dir="ltr";
  updateLanguageToggleUI();
}
languageToggles.forEach(button=>button.addEventListener("click",event=>{
  event.preventDefault();
  event.stopPropagation();
  const next=doc.lang==="ar"?"en":"ar";
  setLang(next);
}));


/* Port selectors are isolated in assets/js/ports-ui.js */


const menuBtn=document.getElementById("menuBtn");
const mobileDrawer=document.getElementById("mobileDrawer");
const mobileBackdrop=document.getElementById("mobileBackdrop");
const drawerClose=document.getElementById("drawerClose");
let drawerLastFocus=null;

function setMobileDrawer(open){
  if(!menuBtn||!mobileDrawer||!mobileBackdrop) return;
  if(open) drawerLastFocus=document.activeElement;

  mobileDrawer.classList.toggle("is-open",open);
  mobileBackdrop.classList.toggle("is-open",open);
  mobileBackdrop.hidden=!open;
  document.body.classList.toggle("drawer-open",open);
  menuBtn.setAttribute("aria-expanded",String(open));
  menuBtn.setAttribute("aria-label",open?"Close navigation":"Open navigation");
  mobileDrawer.setAttribute("aria-hidden",String(!open));

  if(open){
    requestAnimationFrame(()=>drawerClose?.focus());
  }else if(drawerLastFocus && typeof drawerLastFocus.focus==="function"){
    drawerLastFocus.focus();
  }
}

menuBtn?.addEventListener("click",()=>setMobileDrawer(menuBtn.getAttribute("aria-expanded")!=="true"));
drawerClose?.addEventListener("click",()=>setMobileDrawer(false));
mobileBackdrop?.addEventListener("click",()=>setMobileDrawer(false));
mobileDrawer?.querySelectorAll("a").forEach(el=>el.addEventListener("click",()=>setMobileDrawer(false)));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && mobileDrawer?.classList.contains("is-open")) setMobileDrawer(false);
});
window.addEventListener("resize",()=>{
  if(window.innerWidth>900 && mobileDrawer?.classList.contains("is-open")) setMobileDrawer(false);
},{passive:true});
// V3 quick quote starter -> prefill the full operational quote form.
const quickContinue=document.getElementById("quickContinue");
const quickStatus=document.getElementById("quickStatus");
if(quickContinue){
  quickContinue.addEventListener("click",()=>{
    const qMode=document.querySelector('input[name="quickShipmentMode"]:checked')?.value||"";
    const ports=window.AKPortSelector;
    const qOrigin=ports?.getSelected("quickOrigin");
    const qDestination=ports?.getSelected("quickDestination");
    if(!qMode||(window.AKRouteModes?.isSea() !== false ? (!qOrigin||!qDestination) : !window.AKRouteModes.quickValid())){
      if(quickStatus) quickStatus.textContent=document.documentElement.lang==="ar"
        ?"أكمل بيانات المنشأ والوجهة؛ للشحن البحري اختر الموانئ من القائمة."
        :"Complete origin and destination; for sea freight select ports from the list.";
      if(window.AKRouteModes?.isSea() === false) document.getElementById("quickOriginLocation")?.focus();
      else if(!qOrigin) document.getElementById("quickOrigin")?.focus();
      else if(!qDestination) document.getElementById("quickDestination")?.focus();
      return;
    }
    if(quickStatus) quickStatus.textContent="";
    const mode=document.querySelector(`input[name="shipmentMode"][value="${CSS.escape(qMode)}"]`);
    if(mode){ mode.checked=true; mode.dispatchEvent(new Event("change",{bubbles:true})); }
    if(window.AKRouteModes?.isSea() !== false){
      ports.copySelection("quickOrigin","origin");
      ports.copySelection("quickDestination","destination");
    } else window.AKRouteModes.copy();
    document.getElementById("quote")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>document.getElementById("name")?.focus({preventScroll:true}),450);
  });
}

const modeInputs=[...document.querySelectorAll('input[name="shipmentMode"]')];
const csw=document.getElementById("containerSizeWrap"),ctw=document.getElementById("containerTypeWrap"),qw=document.getElementById("qtyWrap"),bw=document.getElementById("cbmWrap");
const shipmentValue=()=>document.querySelector('input[name="shipmentMode"]:checked')?.value||"";
function conditionals(){
  const v=shipmentValue();
  const isFCL=v==="Sea Freight - FCL";
  csw.classList.toggle("show",isFCL);
  ctw.classList.toggle("show",isFCL);
  qw.classList.toggle("show",isFCL);
  bw.classList.toggle("show",v==="Sea Freight - LCL"||v==="Air Freight");

  const size=document.getElementById("containerSize");
  const type=document.getElementById("containerType");
  const qty=document.getElementById("qty");
  const fclLabel=document.getElementById("fclRequiredLabel");
  if(fclLabel) fclLabel.classList.toggle("show",isFCL);

  [size,type,qty].forEach(el=>{
    el.required=isFCL;
    if(!isFCL) el.setCustomValidity("");
  });
}
modeInputs.forEach(input=>input.addEventListener("change",conditionals));
conditionals();

const customsEnabled=document.getElementById("customsEnabled"),customsService=document.getElementById("customsService"),customsBadge=document.getElementById("customsBadge");
customsReady=true;
function radioVal(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||""}
function updateCustomsUI(){
  const on=customsEnabled.checked;
  customsService.classList.toggle("active",on);
  customsBadge.dataset.t=on?"ccAdded":"ccAdd";
  customsBadge.textContent=(tr[doc.lang]||tr.en)[on?"ccAdded":"ccAdd"];
  document.getElementById("ccTypeImport").required=on;
  document.getElementById("ccLocation").required=on;
  if(!on) document.getElementById("ccSpecialWrap").classList.remove("show");
}
customsEnabled.addEventListener("change",updateCustomsUI);
function updateSpecialCustoms(){document.getElementById("ccSpecialWrap").classList.toggle("show",customsEnabled.checked&&radioVal("ccSpecial")==="Yes")}
document.querySelectorAll('input[name="ccSpecial"]').forEach(x=>x.addEventListener("change",updateSpecialCustoms));
function updateTransportDocLabel(){const air=shipmentValue()==="Air Freight",el=document.getElementById("ccTransportDocLabel");if(!el)return;el.textContent=air?((tr[doc.lang]||tr.en).ccAWB):((tr[doc.lang]||tr.en).ccBL)}
function updateLicenseLabel(){const type=radioVal("ccType"),d=tr[doc.lang]||tr.en,el=document.getElementById("ccLicenseLabel");if(!el)return;el.textContent=type==="Import"?d.ccImportLicense:type==="Export"?d.ccExportLicense:d.ccLicense}
document.querySelectorAll('input[name="shipmentMode"]').forEach(x=>x.addEventListener("change",updateTransportDocLabel));
document.querySelectorAll('input[name="ccType"]').forEach(x=>x.addEventListener("change",updateLicenseLabel));
const ccHsUnknown=document.getElementById("ccHsUnknown"),ccHs=document.getElementById("ccHs");
function updateHsState(){const unknown=ccHsUnknown.checked;ccHs.disabled=unknown;if(unknown)ccHs.value=""}
ccHsUnknown.addEventListener("change",updateHsState);

updateCustomsUI();updateTransportDocLabel();updateLicenseLabel();updateHsState();
const V=id=>{
  const el=document.getElementById(id);
  return (el?.dataset?.portValue||el?.value||"").trim();
};
const quoteForm=document.getElementById("quoteForm");
quoteForm.addEventListener("invalid",()=>quoteForm.classList.add("validation-active"),true);

const fclRequiredFields=[
  ["containerSize","Please select container size.","يرجى اختيار حجم الحاوية."],
  ["containerType","Please select container type.","يرجى اختيار نوع الحاوية."],
  ["qty","Please enter container quantity.","يرجى إدخال عدد الحاويات."]
];
fclRequiredFields.forEach(([id,enMsg,arMsg])=>{
  const el=document.getElementById(id);
  el.addEventListener("invalid",()=>{
    if(el.required && !el.value) el.setCustomValidity(doc.lang==="ar"?arMsg:enMsg);
  });
  el.addEventListener("input",()=>el.setCustomValidity(""));
  el.addEventListener("change",()=>el.setCustomValidity(""));
});
quoteForm.addEventListener("submit",e=>{
  e.preventDefault();
  const f=e.currentTarget;
  const status=document.getElementById("status");
  const ar=doc.lang==="ar",d=ar?tr.ar:tr.en;

  if(!f.checkValidity()){
    f.reportValidity();
    status.textContent=d.invalid;
    return;
  }

  const yesNoSymbol=v=>v==="Yes"?"✅ YES":v==="No"?"❌ NO":"— NOT SPECIFIED";
  const yesNoSymbolAr=v=>v==="Yes"?"✅ نعم":v==="No"?"❌ لا":"— غير محدد";
  const esc=v=>String(v||"").trim();
  const line=(label,value)=>value?`• ${label}: ${value}`:null;
  const section=title=>[``,`*${title}*`,`────────────────────`];
  const clean=list=>list.filter(Boolean);

  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  const ref=`AKQ-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

  const L=ar?{
    title:"AK INTERNATIONAL",
    request:"طلب عرض سعر شحن",
    ref:"رقم الطلب",
    contact:"بيانات العميل",
    shipment:"بيانات الشحنة",
    name:"الاسم",
    shipper:"اسم الشاحن / الشركة",
    phone:"الهاتف / واتساب",
    email:"البريد الإلكتروني",
    shipmentType:"نوع الشحن",
    pol:"POL — ميناء الشحن",
    pod:"POD — ميناء التفريغ",
    incoterm:"Incoterm",
    ready:"تاريخ جاهزية البضاعة",
    releaseDays:"المدة المتوقعة للإفراج (أيام)",
    containerSize:"حجم الحاوية",
    containerType:"نوع الحاوية",
    qty:"عدد الحاويات",
    weight:"الوزن الإجمالي (KG)",
    cbm:"الحجم (CBM)",
    cargo:"وصف البضاعة",
    discount:"كود الخصم",
    customs:"التخليص الجمركي",
    service:"الخدمة مطلوبة",
    clearanceType:"نوع التخليص",
    clearanceLocation:"مكان التخليص",
    countryOrigin:"بلد المنشأ",
    hs:"HS Code",
    cargoValue:"قيمة البضاعة",
    docs:"توافر المستندات",
    invoice:"الفاتورة التجارية",
    packing:"قائمة التعبئة",
    bl:"بوليصة الشحن (B/L)",
    awb:"بوليصة الشحن الجوي (AWB)",
    coo:"شهادة المنشأ",
    importLicense:"ترخيص الاستيراد",
    exportLicense:"ترخيص التصدير",
    license:"ترخيص الاستيراد / التصدير",
    permits:"التصاريح / الموافقات المطلوبة",
    msds:"MSDS — صحيفة بيانات السلامة",
    dg:"إقرار البضائع الخطرة",
    special:"متطلبات جمركية خاصة",
    notes:"ملاحظات إضافية للتخليص الجمركي",
    unknown:"غير معروف",
    footer:"تم إرسال الطلب من موقع AK INTERNATIONAL"
  }:{
    title:"AK INTERNATIONAL",
    request:"SHIPPING QUOTATION REQUEST",
    ref:"Request Ref",
    contact:"CONTACT INFORMATION",
    shipment:"SHIPMENT DETAILS",
    name:"Name",
    shipper:"Shipper / Company",
    phone:"Phone / WhatsApp",
    email:"Email",
    shipmentType:"Shipment Type",
    pol:"POL — Port of Loading",
    pod:"POD — Port of Discharge",
    incoterm:"Incoterm",
    ready:"Cargo Ready Date",
    releaseDays:"Estimated Release Time (Days)",
    containerSize:"Container Size",
    containerType:"Container Type",
    qty:"Container Quantity",
    weight:"Gross Weight (KG)",
    cbm:"Volume (CBM)",
    cargo:"Cargo Description",
    discount:"Discount Code",
    customs:"CUSTOMS CLEARANCE",
    service:"Service Required",
    clearanceType:"Clearance Type",
    clearanceLocation:"Clearance Location",
    countryOrigin:"Country of Origin",
    hs:"HS Code",
    cargoValue:"Cargo Value",
    docs:"DOCUMENT AVAILABILITY",
    invoice:"Commercial Invoice",
    packing:"Packing List",
    bl:"Bill of Lading (B/L)",
    awb:"Air Waybill (AWB)",
    coo:"Certificate of Origin",
    importLicense:"Import License",
    exportLicense:"Export License",
    license:"Import / Export License",
    permits:"Required Permits / Approvals",
    msds:"MSDS — Safety Data Sheet",
    dg:"Dangerous Goods Declaration",
    special:"Special Customs Requirements",
    notes:"Customs Additional Notes",
    unknown:"Unknown",
    footer:"Sent from AK INTERNATIONAL website"
  };

  const lines=[
    `*${L.title}*`,
    `*${L.request}*`,
    `${L.ref}: ${ref}`,
    ...section(L.contact),
    line(L.name,V("name")),
    line(L.shipper,V("shipper")),
    line(L.phone,V("phone")),
    line(L.email,V("email")),
    ...section(L.shipment),
    line(L.shipmentType,shipmentValue()),
    line(window.AKRouteModes?.label(0)||L.pol,window.AKRouteModes?.value("origin")??V("origin")),
    line(window.AKRouteModes?.label(1)||L.pod,window.AKRouteModes?.value("destination")??V("destination")),
    line(L.incoterm,V("incoterm")),
    line(L.ready,V("ready")),
    line(L.releaseDays,V("releaseDays")),
    line(L.containerSize,shipmentValue()==="Sea Freight - FCL"?V("containerSize"):""),
    line(L.containerType,shipmentValue()==="Sea Freight - FCL"?V("containerType"):""),
    line(L.qty,shipmentValue()==="Sea Freight - FCL"?V("qty"):""),
    line(L.weight,V("weight")),
    line(L.cbm,["Sea Freight - LCL","Air Freight"].includes(shipmentValue())?V("cbm"):""),
    line(L.cargo,V("cargo")),
    line(L.discount,V("discount"))
  ];

  if(customsEnabled.checked){
    const clearanceType=radioVal("ccType");
    const transportLabel=shipmentValue()==="Air Freight"?L.awb:L.bl;
    const licenseLabel=clearanceType==="Import"?L.importLicense:clearanceType==="Export"?L.exportLicense:L.license;
    const yn=ar?yesNoSymbolAr:yesNoSymbol;
    const hsValue=ccHsUnknown.checked?L.unknown:V("ccHs");
    const specialValue=radioVal("ccSpecial")==="Yes"&&V("ccSpecialText")
      ?`${yn("Yes")} — ${V("ccSpecialText")}`
      :yn(radioVal("ccSpecial"));

    lines.push(
      ...section(L.customs),
      `• ${L.service}: ✅ ${ar?"نعم":"YES"}`,
      line(L.clearanceType,clearanceType),
      line(L.clearanceLocation,V("ccLocation")),
      line(L.countryOrigin,V("ccOrigin")),
      line(L.hs,hsValue),
      line(L.cargoValue,V("ccValue")?`${V("ccCurrency")} ${V("ccValue")}`:""),
      ...section(L.docs),
      `• ${L.invoice}: ${yn(radioVal("ccInvoice"))}`,
      `• ${L.packing}: ${yn(radioVal("ccPacking"))}`,
      `• ${transportLabel}: ${yn(radioVal("ccTransportDoc"))}`,
      `• ${L.coo}: ${yn(radioVal("ccCOO"))}`,
      `• ${licenseLabel}: ${yn(radioVal("ccLicense"))}`,
      `• ${L.permits}: ${yn(radioVal("ccPermits"))}`,
      `• ${L.msds}: ${yn(radioVal("ccMSDS"))}`,
      `• ${L.dg}: ${yn(radioVal("ccDG"))}`,
      `• ${L.special}: ${specialValue}`,
      line(L.notes,V("ccNotes"))
    );
  }

  lines.push(...(window.AKTruckService?.messageLines(ar)||[]));
  lines.push("",`_${L.footer}_`);

  const message=clean(lines).join("\n");
  window.AKBackend?.submit(f,ref,message);
  const whatsappUrl=`https://wa.me/201111188764?text=${encodeURIComponent(message)}`;

  // Use a temporary anchor instead of window.open; this reliably preserves the encoded message.
  const a=document.createElement("a");
  a.href=whatsappUrl;
  a.target="_blank";
  a.rel="noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();

  status.textContent="";
});
document.getElementById("year").textContent=new Date().getFullYear();

  // UI observers: one source of truth for sticky header and carrier animation.
  const header = document.querySelector(".site-header");
  if (header) {
    const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 18);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  const carrierSection = document.querySelector("#carrierMarqueeSection");
  const carrierTrack = document.querySelector(".carrier-track");
  if (carrierSection && carrierTrack) {
    const setCarrierMotion = visible => carrierTrack.classList.toggle("is-paused", !visible);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) setCarrierMotion(entry.isIntersecting);
      }, { threshold: 0.01 });
      observer.observe(carrierSection);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) carrierTrack.classList.add("is-paused");
    });
  }
})();

(() => {
  'use strict';
  // One registry for selection, aliases and official destinations.
  // Empty officialUrl means verification is pending; never substitute a third-party tracker.
  const carriers = [
    {
      id: "anl",
      name: "ANL",
      officialUrl: "https://www.anl.com.au/ebusiness/tracking",
      prefill: false,
      aliases: ""
    },
    {
      id: "apl",
      name: "APL",
      officialUrl: "https://www.apl.com/ebusiness/tracking",
      prefill: false,
      aliases: ""
    },
    {
      id: "arkas",
      name: "Arkas Line",
      short: "ARK",
      logo: "./assets/logos/arkas-line.svg",
      officialUrl: "https://webtrackingprodnew.arkasline.com.tr/shipmenttracking",
      sourcePage: "https://arkasline.com.tr/en/online-tracking/",
      prefill: false,
      aliases: "اركاس"
    },
    {
      id: "bmc",
      logo: "./assets/logos/bmc-lines.svg",
      name: "BMC Lines",
      officialUrl: "",
      prefill: false,
      aliases: "بي ام سي BMSU"
    },
    {
      id: "cma-cgm",
      name: "CMA CGM",
      short: "CMA",
      logo: "./assets/logos/cma-cgm.svg",
      officialUrl: "https://www.cma-cgm.com/eBusiness/Tracking",
      prefill: false,
      handoff: "clipboard",
      pasteRequired: true,
      aliases: "سي ام ايه CMDU"
    },
    {
      id: "cnc",
      name: "CNC (Cheng Lie Navigation)",
      officialUrl: "https://www.cnc-line.com/ebusiness/tracking",
      prefill: false,
      aliases: ""
    },
    {
      id: "cosco",
      name: "COSCO SHIPPING",
      short: "COS",
      logo: "./assets/logos/cosco.svg",
      officialUrl: "https://elines.coscoshipping.com/ebusiness/cargoTracking",
      prefill: false,
      aliases: "كوسكو COSU"
    },
    {
      id: "crowley",
      logo: "./assets/logos/crowley.png",
      name: "Crowley",
      officialUrl: "https://www.crowley.com/liner-shipment-tracking/",
      prefill: false,
      aliases: ""
    },
    {
      id: "culines",
      logo: "./assets/logos/culines.png",
      name: "CULines (China United Lines)",
      officialUrl: "https://www.culines.com/en/site/bill",
      prefill: false,
      aliases: ""
    },
    {
      id: "eimskip",
      logo: "./assets/logos/eimskip.svg",
      name: "Eimskip",
      officialUrl: "https://www.eimskip.com/customer-portal/",
      linkType: "portal",
      prefill: false,
      aliases: ""
    },
    {
      id: "emirates",
      logo: "./assets/logos/emirates.svg",
      name: "Emirates Shipping Line",
      officialUrl: "https://www.emiratesline.com/track/",
      prefill: false,
      aliases: "الامارات ESL"
    },
    {
      id: "evergreen",
      name: "Evergreen / ShipmentLink",
      short: "EVG",
      logo: "./assets/logos/evergreen.svg",
      officialUrl: "https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do",
      prefill: false,
      aliases: "ايفرجرين EGLV"
    },
    {
      id: "fesco",
      name: "FESCO",
      officialUrl: "https://my.fesco.com/tracking/",
      prefill: false,
      aliases: ""
    },
    {
      id: "grimaldi",
      logo: "./assets/logos/grimaldi.png",
      name: "Grimaldi Group",
      officialUrl: "https://www.gnet.grimaldi-eservice.com/gnet/pages_gatlas/wfcontainertracking",
      prefill: false,
      aliases: ""
    },
    {
      id: "hapag-lloyd",
      name: "Hapag-Lloyd",
      short: "HLC",
      logo: "./assets/logos/hapag-lloyd.svg",
      officialUrl: "https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html",
      prefill: false,
      aliases: "هاباج لويد HLCU"
    },
    {
      id: "hmm",
      name: "HMM (Hyundai Merchant Marine)",
      officialUrl: "https://www.hmm21.com/e-service/general/trackNTrace/TrackNTrace.do",
      prefill: false,
      aliases: "هيونداي HDMU"
    },
    {
      id: "kmtc",
      linkType: "portal",
      logo: "./assets/logos/kmtc.png",
      name: "KMTC (Korea Marine Transport)",
      officialUrl: "https://www.ekmtc.com/index.html",
      prefill: false,
      aliases: "KMTU"
    },
    {
      id: "maersk",
      name: "Maersk",
      short: "MAE",
      logo: "./assets/logos/maersk.svg",
      officialUrl: "https://www.maersk.com/tracking/",
      prefill: true,
      handoff: "direct",
      buildUrl(reference){
        return `https://www.maersk.com/tracking/${encodeURIComponent(reference)}`;
      },
      aliases: "ميرسك MAEU"
    },
    {
      id: "matson",
      name: "Matson",
      officialUrl: "https://www.matson.com/shipment-tracking.html",
      prefill: false,
      aliases: ""
    },
    {
      id: "msc",
      name: "MSC",
      short: "MSC",
      logo: "./assets/logos/msc.svg",
      officialUrl: "https://www.msc.com/en/track-a-shipment",
      prefill: false,
      aliases: "ام اس سي Mediterranean Shipping Company MSCU"
    },
    {
      id: "one",
      name: "Ocean Network Express (ONE)",
      short: "ONE",
      logo: "./assets/logos/one.svg",
      officialUrl: "https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?sessLocale=en",
      prefill: true,
      handoff: "direct",
      buildUrl(reference,type){
        if(type==="container"){
          return `https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${encodeURIComponent(reference)}&trakNoTpCdParam=C`;
        }
        const ref=reference.startsWith("ONEY")?reference.slice(4):reference;
        return `https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${encodeURIComponent(ref)}&trakNoTpCdParam=B`;
      },
      aliases: "وان ONEY"
    },
    {
      id: "oocl",
      name: "OOCL",
      short: "OOC",
      logo: "./assets/logos/oocl.svg",
      officialUrl: "https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx",
      prefill: false,
      aliases: "Orient Overseas Container Line OOLU"
    },
    {
      id: "pil",
      name: "PIL",
      short: "PIL",
      logo: "./assets/logos/pil.svg",
      officialUrl: "https://www.pilship.com/digital-solutions/?id=track-trace&tab=customer-tool",
      prefill: false,
      aliases: "Pacific International Lines باسيفيك"
    },
    {
      id: "rcl",
      logo: "./assets/logos/rcl.png",
      name: "RCL (Regional Container Lines)",
      officialUrl: "https://eservice.rclgroup.com/CargoTracking/",
      prefill: false,
      aliases: "RCLU"
    },
    {
      id: "samskip",
      linkType: "portal",
      logo: "./assets/logos/samskip.png",
      name: "Samskip",
      officialUrl: "https://my.samskip.com/CustomerPortal/Login",
      prefill: false,
      aliases: ""
    },
    {
      id: "seaboard",
      name: "Seaboard Marine",
      officialUrl: "https://www.seaboardmarine.com/tracking-results/",
      prefill: false,
      aliases: ""
    },
    {
      id: "sidra",
      logo: "./assets/logos/sedra.svg",
      name: "Sidra Line / SEDRA",
      officialUrl: "https://sidraline.com/tracking",
      prefill: false,
      aliases: "سدرة سيدرا sedra sidra"
    },
    {
      id: "sinokor",
      logo: "./assets/logos/sinokor.png",
      name: "Sinokor",
      officialUrl: "https://ebiz.sinokor.co.kr/Home",
      prefill: false,
      aliases: ""
    },
    {
      id: "sitc",
      logo: "./assets/logos/sitc.png",
      name: "SITC",
      officialUrl: "https://ebusiness.sitcline.com",
      prefill: false,
      aliases: ""
    },
    {
      id: "sm-line",
      logo: "./assets/logos/sm-line.png",
      name: "SM Line",
      officialUrl: "https://esvc.smlines.com/smline/CUP_HOM_3301.do?sessLocale=en",
      prefill: false,
      aliases: "SMLM"
    },
    {
      id: "ts-lines",
      logo: "./assets/logos/ts-lines.svg",
      name: "T.S. Lines",
      officialUrl: "https://www.tslines.com/en/tracking?nowmenu=search_by_bl_number",
      prefill: false,
      aliases: "TSL TSLU"
    },
    {
      id: "turkon",
      logo: "./assets/logos/turkon.svg",
      name: "Turkon Line",
      officialUrl: "https://myturkonline.turkon.com/tracking",
      prefill: false,
      aliases: ""
    },
    {
      id: "unifeeder",
      linkType: "portal",
      name: "Unifeeder",
      officialUrl: "https://www.unifeeder.cargoes.com/",
      prefill: false,
      aliases: "يونيفيدر"
    },
    {
      id: "vasco",
      name: "VASCO (VASP)",
      officialUrl: "",
      prefill: false,
      aliases: ""
    },
    {
      id: "volta",
      name: "Volta (VCLU)",
      officialUrl: "",
      prefill: false,
      aliases: ""
    },
    {
      id: "wan-hai",
      name: "Wan Hai Lines",
      officialUrl: "https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml",
      prefill: false,
      aliases: "وان هاي WHL WHLC"
    },
    {
      id: "wec",
      logo: "./assets/logos/wec.png",
      name: "WEC Lines",
      officialUrl: "https://weclines.com/track-and-trace/",
      prefill: false,
      aliases: ""
    },
    {
      id: "wilhelmsen",
      name: "Wilhelmsen",
      officialUrl: "",
      prefill: false,
      aliases: ""
    },
    {
      id: "x-press",
      logo: "./assets/logos/x-press.png",
      name: "X-Press Feeders",
      officialUrl: "",
      prefill: false,
      aliases: ""
    },
    {
      id: "yang-ming",
      name: "Yang Ming",
      short: "YML",
      logo: "./assets/logos/yang-ming.svg",
      officialUrl: "https://www.yangming.com/en/esolution/cargo_tracking",
      prefill: false,
      aliases: "يانج مينج YMLU"
    },
    {
      id: "zim",
      name: "ZIM",
      short: "ZIM",
      logo: "./assets/logos/zim.svg",
      officialUrl: "https://www.zim.com/tools/track-a-shipment",
      prefill: false,
      aliases: "زيم"
    }
  ];
  // Resolve logo URLs from the shared JS asset directory on both / and /ar/.
  const logoRoot = new URL('../logos/', document.currentScript.src);
  carriers.forEach(c => {
    if (c.logo?.startsWith('./assets/logos/')) {
      c.logo = new URL(c.logo.slice('./assets/logos/'.length), logoRoot).href;
    }
  });
  const byId = new Map(carriers.map(c => [c.id, c]));
  const normalizeReference = value => String(value || '').toUpperCase().replace(/[\s-]+/g, '').trim();
  const getCarrier = id => byId.get(id) || null;
  function getTrackingUrl(carrier, reference, type='generic') {
    return typeof carrier?.buildUrl === 'function' ? carrier.buildUrl(normalizeReference(reference),type) : carrier?.officialUrl || '';
  }
  window.AKCarrierRegistry = Object.freeze({carriers, normalizeReference, getCarrier, getTrackingUrl});
})();

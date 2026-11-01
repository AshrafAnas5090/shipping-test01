(() => {
  "use strict";

  const carriers = [
    {
      id:"maersk",
      name:"Maersk",
      short:"MAE",
      logo:"./assets/logos/maersk.svg",
      officialUrl:"https://www.maersk.com/tracking/",
      prefill:true,
      handoff:"direct",
      buildUrl(reference){
        return `https://www.maersk.com/tracking/${encodeURIComponent(reference)}`;
      }
    },
    {
      id:"msc",
      name:"MSC",
      short:"MSC",
      logo:"./assets/logos/msc.svg",
      officialUrl:"https://www.msc.com/en/track-a-shipment",
      prefill:false
    },
    {
      id:"cma-cgm",
      name:"CMA CGM",
      short:"CMA",
      logo:"./assets/logos/cma-cgm.svg",
      officialUrl:"https://www.cma-cgm.com/eBusiness/Tracking",
      prefill:false,
      handoff:"clipboard",
      pasteRequired:true
    },
    {
      id:"cosco",
      name:"COSCO SHIPPING",
      short:"COS",
      logo:"./assets/logos/cosco.svg",
      officialUrl:"https://elines.coscoshipping.com/ebusiness/cargoTracking",
      prefill:false
    },
    {
      id:"oocl",
      name:"OOCL",
      short:"OOC",
      logo:"./assets/logos/oocl.svg",
      officialUrl:"https://www.oocl.com/eng/Pages/default.aspx",
      prefill:false
    },
    {
      id:"one",
      name:"Ocean Network Express (ONE)",
      short:"ONE",
      logo:"./assets/logos/one.svg",
      officialUrl:"https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?sessLocale=en",
      prefill:true,
      handoff:"direct",
      buildUrl(reference,type){
        if(type==="container"){
          return `https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${encodeURIComponent(reference)}&trakNoTpCdParam=C`;
        }
        const ref=reference.startsWith("ONEY")?reference.slice(4):reference;
        return `https://www.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${encodeURIComponent(ref)}&trakNoTpCdParam=B`;
      }
    },
    {
      id:"hapag-lloyd",
      name:"Hapag-Lloyd",
      short:"HLC",
      logo:"./assets/logos/hapag-lloyd.svg",
      officialUrl:"https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html",
      prefill:false
    },
    {
      id:"evergreen",
      name:"Evergreen / ShipmentLink",
      short:"EVG",
      logo:"./assets/logos/evergreen.svg",
      officialUrl:"https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do",
      prefill:false
    },
    {
      id:"pil",
      name:"PIL",
      short:"PIL",
      logo:"./assets/logos/pil.svg",
      officialUrl:"https://www.pilship.com/digital-solutions/?id=track-trace&tab=customer-tool",
      prefill:false
    },
    {
      id:"yang-ming",
      name:"Yang Ming",
      short:"YML",
      logo:"./assets/logos/yang-ming.svg",
      officialUrl:"https://www.yangming.com/en/esolution/cargo_tracking",
      prefill:true,
      handoff:"direct",
      buildUrl(reference){
        return `https://www.yangming.com/en/esolution/cargo_tracking?service=${encodeURIComponent(reference)}`;
      }
    },
    {
      id:"arkas",
      name:"Arkas Line",
      short:"ARK",
      logo:"./assets/logos/arkas-line.svg",
      officialUrl:"https://webtrackingprodnew.arkasline.com.tr/shipmenttracking",
      sourcePage:"https://arkasline.com.tr/en/online-tracking/",
      prefill:false
    },
    {
      id:"zim",
      name:"ZIM",
      short:"ZIM",
      logo:"./assets/logos/zim.svg",
      officialUrl:"https://www.zim.com/tools/track-a-shipment",
      prefill:false
    }
  ];

  const byId=new Map(carriers.map(carrier=>[carrier.id,carrier]));

  function normalizeReference(value){
    return String(value||"").toUpperCase().replace(/[\s-]+/g,"").trim();
  }

  function getCarrier(id){
    return byId.get(id)||null;
  }

  function getTrackingUrl(carrier,reference,type="generic"){
    const ref=normalizeReference(reference);
    return typeof carrier?.buildUrl==="function"
      ? carrier.buildUrl(ref,type)
      : carrier?.officialUrl||"";
  }

  window.AKCarrierRegistry=Object.freeze({
    carriers,
    normalizeReference,
    getCarrier,
    getTrackingUrl
  });
})();
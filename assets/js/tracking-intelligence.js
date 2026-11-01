(() => {
  "use strict";

  const containerPattern=/^[A-Z]{3}U\d{7}$/;

  // Curated owner-code mappings for the carriers currently supported by AK.
  // These are not presented as a complete BIC registry.
  // ownerCode = first 3 letters; equipment category (usually U) is separate.
  const ownerCodeMappings = Object.freeze({
    // Maersk / legacy-equipment families commonly seen in Maersk operations
    MAE:{carrierId:"maersk",ownerName:"Maersk",confidence:"high"},
    MSK:{carrierId:"maersk",ownerName:"Maersk",confidence:"high"},
    MRK:{carrierId:"maersk",ownerName:"Maersk",confidence:"high"},
    MRS:{carrierId:"maersk",ownerName:"Maersk",confidence:"high"},
    SEA:{carrierId:"maersk",ownerName:"Maersk / Sealand",confidence:"high"},
    SUD:{carrierId:"maersk",ownerName:"Maersk / Safmarine legacy",confidence:"high"},
    MWC:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"high"},
    MNB:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    HAS:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MSW:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    PON:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MSF:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MSA:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MVI:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    CAD:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    APM:{carrierId:"maersk",ownerName:"APM / Maersk equipment family",confidence:"medium"},
    POC:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    OCL:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MIE:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},
    MWM:{carrierId:"maersk",ownerName:"Maersk equipment family",confidence:"medium"},

    // MSC
    MSC:{carrierId:"msc",ownerName:"MSC",confidence:"high"},
    MSD:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    MSM:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    MSN:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    MSV:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    MSY:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    MSZ:{carrierId:"msc",ownerName:"MSC equipment family",confidence:"medium"},
    GTI:{carrierId:"msc",ownerName:"MSC-associated equipment family",confidence:"medium"},

    // CMA CGM / group equipment families
    CMA:{carrierId:"cma-cgm",ownerName:"CMA CGM",confidence:"high"},
    CGM:{carrierId:"cma-cgm",ownerName:"CMA CGM",confidence:"high"},
    AMC:{carrierId:"cma-cgm",ownerName:"CMA CGM equipment family",confidence:"medium"},
    ANN:{carrierId:"cma-cgm",ownerName:"CMA CGM equipment family",confidence:"medium"},
    APL:{carrierId:"cma-cgm",ownerName:"APL / CMA CGM group",confidence:"medium"},
    NOL:{carrierId:"cma-cgm",ownerName:"NOL / CMA CGM group",confidence:"medium"},
    OPD:{carrierId:"cma-cgm",ownerName:"CMA CGM equipment family",confidence:"medium"},

    // COSCO
    CCL:{carrierId:"cosco",ownerName:"COSCO SHIPPING Lines",confidence:"high"},
    CSL:{carrierId:"cosco",ownerName:"COSCO SHIPPING equipment family",confidence:"medium"},
    CSN:{carrierId:"cosco",ownerName:"COSCO SHIPPING equipment family",confidence:"medium"},
    CBH:{carrierId:"cosco",ownerName:"COSCO SHIPPING equipment family",confidence:"medium"},

    // OOCL
    OOL:{carrierId:"oocl",ownerName:"OOCL",confidence:"high"},
    OOC:{carrierId:"oocl",ownerName:"OOCL",confidence:"high"},

    // ONE
    ONE:{carrierId:"one",ownerName:"Ocean Network Express",confidence:"high"},

    // Hapag-Lloyd
    HLC:{carrierId:"hapag-lloyd",ownerName:"Hapag-Lloyd",confidence:"high"},
    HLB:{carrierId:"hapag-lloyd",ownerName:"Hapag-Lloyd equipment family",confidence:"medium"},
    HLX:{carrierId:"hapag-lloyd",ownerName:"Hapag-Lloyd equipment family",confidence:"medium"},
    FAN:{carrierId:"hapag-lloyd",ownerName:"Hapag-Lloyd-associated equipment",confidence:"medium"},
    UAC:{carrierId:"hapag-lloyd",ownerName:"UASC / Hapag-Lloyd group",confidence:"medium"},
    UAE:{carrierId:"hapag-lloyd",ownerName:"UASC / Hapag-Lloyd group",confidence:"medium"},
    HAM:{carrierId:"hapag-lloyd",ownerName:"Hapag-Lloyd equipment family",confidence:"medium"},

    // Evergreen
    EMC:{carrierId:"evergreen",ownerName:"Evergreen Marine",confidence:"high"},
    EGH:{carrierId:"evergreen",ownerName:"Evergreen equipment family",confidence:"medium"},
    EGS:{carrierId:"evergreen",ownerName:"Evergreen equipment family",confidence:"medium"},
    EIT:{carrierId:"evergreen",ownerName:"Evergreen equipment family",confidence:"medium"},

    // PIL
    PIL:{carrierId:"pil",ownerName:"Pacific International Lines",confidence:"high"},
    PCI:{carrierId:"pil",ownerName:"PIL equipment family",confidence:"medium"},
    PID:{carrierId:"pil",ownerName:"PIL equipment family",confidence:"medium"},

    // Yang Ming
    YML:{carrierId:"yang-ming",ownerName:"Yang Ming Marine Transport",confidence:"high"},
    YMM:{carrierId:"yang-ming",ownerName:"Yang Ming Marine Transport",confidence:"high"},

    // Arkas Line
    ARK:{carrierId:"arkas",ownerName:"Arkas Container Transport",confidence:"medium"},

    // ZIM
    ZIM:{carrierId:"zim",ownerName:"ZIM Integrated Shipping Services",confidence:"high"}
  });

  // Carrier document / B/L / booking prefixes. These are intentionally separate
  // from container owner codes because they describe a different identifier type.
  const documentPrefixMappings = Object.freeze([
    {prefix:"MAEU",carrierId:"maersk",confidence:"high",kind:"document"},
    {prefix:"MRKU",carrierId:"maersk",confidence:"medium",kind:"document"},
    {prefix:"SEAU",carrierId:"maersk",confidence:"medium",kind:"document"},
    {prefix:"SEJJ",carrierId:"maersk",confidence:"medium",kind:"document"},
    {prefix:"MEDU",carrierId:"msc",confidence:"high",kind:"document"},
    {prefix:"CMDU",carrierId:"cma-cgm",confidence:"high",kind:"document"},
    {prefix:"COSU",carrierId:"cosco",confidence:"high",kind:"document"},
    {prefix:"OOLU",carrierId:"oocl",confidence:"high",kind:"document"},
    {prefix:"OOCU",carrierId:"oocl",confidence:"high",kind:"document"},
    {prefix:"ONEY",carrierId:"one",confidence:"high",kind:"document"},
    {prefix:"HLCU",carrierId:"hapag-lloyd",confidence:"high",kind:"document"},
    {prefix:"EGLV",carrierId:"evergreen",confidence:"high",kind:"document"},
    {prefix:"PILU",carrierId:"pil",confidence:"high",kind:"document"},
    {prefix:"YMLU",carrierId:"yang-ming",confidence:"high",kind:"document"},
    {prefix:"YMJA",carrierId:"yang-ming",confidence:"high",kind:"document"},
    {prefix:"YMPR",carrierId:"yang-ming",confidence:"medium",kind:"document"},
    {prefix:"YMSG",carrierId:"yang-ming",confidence:"medium",kind:"document"},
    {prefix:"ARKU",carrierId:"arkas",confidence:"medium",kind:"document"},
    {prefix:"ZIMU",carrierId:"zim",confidence:"high",kind:"document"}
  ]);

  const confidenceRank={unknown:0,low:1,medium:2,high:3};

  const letterValue=letter=>{
    const code=letter.charCodeAt(0)-55;
    return code+Math.floor((code-1)/10);
  };

  function normalize(value){
    return String(value||"").toUpperCase().replace(/[\s-]+/g,"").trim();
  }

  function isContainerShape(value){
    return containerPattern.test(normalize(value));
  }

  function isValidContainerNumber(value){
    const ref=normalize(value);
    if(!containerPattern.test(ref)) return false;

    let sum=0;
    for(let index=0;index<10;index++){
      const char=ref[index];
      const numeric=/\d/.test(char)?Number(char):letterValue(char);
      sum+=numeric*(2**index);
    }

    return ((sum%11)%10)===Number(ref[10]);
  }

  function getOwnerCode(value){
    const ref=normalize(value);
    return /^[A-Z]{3}U/.test(ref)?ref.slice(0,3):"";
  }

  function detectContainer(value){
    const ref=normalize(value);
    if(!isContainerShape(ref)) return null;

    const ownerCode=getOwnerCode(ref);
    const mapping=ownerCodeMappings[ownerCode]||null;

    return {
      reference:ref,
      type:"container",
      ownerCode,
      equipmentCategory:ref[3],
      validContainer:isValidContainerNumber(ref),
      ownerName:mapping?.ownerName||"",
      carrierId:mapping?.carrierId||"",
      confidence:mapping?.confidence||"unknown",
      basis:mapping?"owner-code-mapping":"unmapped-owner-code"
    };
  }

  function detectDocument(value){
    const ref=normalize(value);
    if(!ref || isContainerShape(ref)) return null;

    const match=documentPrefixMappings
      .filter(item=>ref.startsWith(item.prefix))
      .sort((a,b)=>b.prefix.length-a.prefix.length)[0];

    if(!match) return null;

    return {
      reference:ref,
      type:"document",
      ownerCode:"",
      equipmentCategory:"",
      validContainer:null,
      ownerName:"",
      carrierId:match.carrierId,
      confidence:match.confidence,
      basis:"document-prefix",
      matchedPrefix:match.prefix
    };
  }

  function detect(value){
    return detectContainer(value)||detectDocument(value)||{
      reference:normalize(value),
      type:"unknown",
      ownerCode:"",
      equipmentCategory:"",
      validContainer:null,
      ownerName:"",
      carrierId:"",
      confidence:"unknown",
      basis:"unknown"
    };
  }

  function compareConfidence(a,b){
    return (confidenceRank[a]||0)-(confidenceRank[b]||0);
  }

  window.AKTrackingIntelligence=Object.freeze({
    ownerCodeMappings,
    documentPrefixMappings,
    normalize,
    isContainerShape,
    isValidContainerNumber,
    getOwnerCode,
    detectContainer,
    detectDocument,
    detect,
    compareConfidence
  });
})();
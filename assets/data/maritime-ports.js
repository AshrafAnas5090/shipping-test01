/* AK INTERNATIONAL — Global Maritime Ports Data Loader
   Dataset: UN/LOCODE Pre-Release (Latest), filtered to Function position 1 = "1"
   Snapshot target date: 2026-10-16
   Remote source is downloaded once, filtered in-browser, then cached locally.
*/
(function () {
  "use strict";

  const VERSION = "2026-10-16-pre-release";
  const CACHE_KEY = "ak_maritime_ports_" + VERSION;
  const SOURCES = [
    "https://datahub.io/core/un-locode/_r/-/data/code-list.csv",
    "https://raw.githubusercontent.com/datasets/un-locode/main/data/code-list.csv"
  ];
  const COUNTRY_NAMES = {"AW":"Aruba","AF":"Afghanistan","AO":"Angola","AI":"Anguilla","AX":"Åland Islands","AL":"Albania","AD":"Andorra","AE":"United Arab Emirates","AR":"Argentina","AM":"Armenia","AS":"American Samoa","AQ":"Antarctica","TF":"French Southern Territories","AG":"Antigua and Barbuda","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BI":"Burundi","BE":"Belgium","BJ":"Benin","BQ":"Bonaire, Sint Eustatius and Saba","BF":"Burkina Faso","BD":"Bangladesh","BG":"Bulgaria","BH":"Bahrain","BS":"Bahamas","BA":"Bosnia and Herzegovina","BL":"Saint Barthélemy","BY":"Belarus","BZ":"Belize","BM":"Bermuda","BO":"Bolivia","BR":"Brazil","BB":"Barbados","BN":"Brunei","BT":"Bhutan","BV":"Bouvet Island","BW":"Botswana","CF":"Central African Republic","CA":"Canada","CC":"Cocos (Keeling) Islands","CH":"Switzerland","CL":"Chile","CN":"China","CI":"Côte d'Ivoire","CM":"Cameroon","CD":"Democratic Republic of the Congo","CG":"Congo","CK":"Cook Islands","CO":"Colombia","KM":"Comoros","CV":"Cabo Verde","CR":"Costa Rica","CU":"Cuba","CW":"Curaçao","CX":"Christmas Island","KY":"Cayman Islands","CY":"Cyprus","CZ":"Czechia","DE":"Germany","DJ":"Djibouti","DM":"Dominica","DK":"Denmark","DO":"Dominican Republic","DZ":"Algeria","EC":"Ecuador","EG":"Egypt","ER":"Eritrea","EH":"Western Sahara","ES":"Spain","EE":"Estonia","ET":"Ethiopia","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands (Malvinas)","FR":"France","FO":"Faroe Islands","FM":"Micronesia, Federated States of","GA":"Gabon","GB":"United Kingdom","GE":"Georgia","GG":"Guernsey","GH":"Ghana","GI":"Gibraltar","GN":"Guinea","GP":"Guadeloupe","GM":"Gambia","GW":"Guinea-Bissau","GQ":"Equatorial Guinea","GR":"Greece","GD":"Grenada","GL":"Greenland","GT":"Guatemala","GF":"French Guiana","GU":"Guam","GY":"Guyana","HK":"Hong Kong","HM":"Heard Island and McDonald Islands","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","ID":"Indonesia","IM":"Isle of Man","IN":"India","IO":"British Indian Ocean Territory","IE":"Ireland","IR":"Iran","IQ":"Iraq","IS":"Iceland","IL":"Israel","IT":"Italy","JM":"Jamaica","JE":"Jersey","JO":"Jordan","JP":"Japan","KZ":"Kazakhstan","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KI":"Kiribati","KN":"Saint Kitts and Nevis","KR":"South Korea","KW":"Kuwait","LA":"Laos","LB":"Lebanon","LR":"Liberia","LY":"Libya","LC":"Saint Lucia","LI":"Liechtenstein","LK":"Sri Lanka","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","MO":"Macao","MF":"Saint Martin (French part)","MA":"Morocco","MC":"Monaco","MD":"Moldova","MG":"Madagascar","MV":"Maldives","MX":"Mexico","MH":"Marshall Islands","MK":"North Macedonia","ML":"Mali","MT":"Malta","MM":"Myanmar","ME":"Montenegro","MN":"Mongolia","MP":"Northern Mariana Islands","MZ":"Mozambique","MR":"Mauritania","MS":"Montserrat","MQ":"Martinique","MU":"Mauritius","MW":"Malawi","MY":"Malaysia","YT":"Mayotte","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NF":"Norfolk Island","NG":"Nigeria","NI":"Nicaragua","NU":"Niue","NL":"Netherlands","NO":"Norway","NP":"Nepal","NR":"Nauru","NZ":"New Zealand","OM":"Oman","PK":"Pakistan","PA":"Panama","PN":"Pitcairn","PE":"Peru","PH":"Philippines","PW":"Palau","PG":"Papua New Guinea","PL":"Poland","PR":"Puerto Rico","KP":"North Korea","PT":"Portugal","PY":"Paraguay","PS":"Palestine","PF":"French Polynesia","QA":"Qatar","RE":"Réunion","RO":"Romania","RU":"Russia","RW":"Rwanda","SA":"Saudi Arabia","SD":"Sudan","SN":"Senegal","SG":"Singapore","GS":"South Georgia and the South Sandwich Islands","SH":"Saint Helena, Ascension and Tristan da Cunha","SJ":"Svalbard and Jan Mayen","SB":"Solomon Islands","SL":"Sierra Leone","SV":"El Salvador","SM":"San Marino","SO":"Somalia","PM":"Saint Pierre and Miquelon","RS":"Serbia","SS":"South Sudan","ST":"Sao Tome and Principe","SR":"Suriname","SK":"Slovakia","SI":"Slovenia","SE":"Sweden","SZ":"Eswatini","SX":"Sint Maarten (Dutch part)","SC":"Seychelles","SY":"Syria","TC":"Turks and Caicos Islands","TD":"Chad","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TK":"Tokelau","TM":"Turkmenistan","TL":"Timor-Leste","TO":"Tonga","TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Türkiye","TV":"Tuvalu","TW":"Taiwan","TZ":"Tanzania","UG":"Uganda","UA":"Ukraine","UM":"United States Minor Outlying Islands","UY":"Uruguay","US":"United States","UZ":"Uzbekistan","VA":"Holy See (Vatican City State)","VC":"Saint Vincent and the Grenadines","VE":"Venezuela","VG":"Virgin Islands, British","VI":"Virgin Islands, U.S.","VN":"Vietnam","VU":"Vanuatu","WF":"Wallis and Futuna","WS":"Samoa","YE":"Yemen","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe","XK":"Kosovo"};
  const FALLBACK_PORTS = [["Tripoli","","Libya","LYTIP","Tripoli","LY"],["Bingazi (Benghazi)","","Libya","LYBEN","Benghazi","LY"],["Misurata","","Libya","LYMRA","Misurata","LY"],["Tobruk","","Libya","LYTOB","Tobruk","LY"],["As Sidr","","Libya","LYESI","As Sidr","LY"],["Az Zawiyah","","Libya","LYZAW","Az Zawiyah","LY"],["Marsa Brega","","Libya","LYLMQ","Marsa Brega","LY"],["Marsa El Hania","","Libya","LYMEH","Marsa El Hania","LY"],["Marsa El Hariga","","Libya","LYMHR","Marsa El Hariga","LY"],["Melittah","","Libya","LYMTH","Melittah","LY"],["Mellitah (Qasr Ahmed)","","Libya","LYMEL","Mellitah Qasr Ahmed","LY"],["Apollonia","","Libya","LYAPO","Apollonia","LY"],["Bardiyah","","Libya","LYBAR","Bardiyah","LY"],["Toulmeitha","","Libya","LYTOA","Toulmeitha","LY"],["Tukrah","","Libya","LYTUK","Tukrah","LY"],["Zliten","","Libya","LYZLI","Zliten","LY"],["Zuara","","Libya","LYZUA","Zuara","LY"],["Shanghai","","China","CNSHA","Shanghai","CN"],["Ningbo","","China","CNNGB","Ningbo","CN"],["Qingdao","","China","CNQDG","Qingdao","CN"],["Xiamen","","China","CNXMN","Xiamen","CN"],["Tianjin","","China","CNTXG","Tianjin","CN"],["Rotterdam","","Netherlands","NLRTM","Rotterdam","NL"],["Hamburg","","Germany","DEHAM","Hamburg","DE"],["Antwerpen","","Belgium","BEANR","Antwerp","BE"],["Jebel Ali","","United Arab Emirates","AEJEA","Jebel Ali","AE"],["New York","","United States","USNYC","New York","US"],["Los Angeles","","United States","USLAX","Los Angeles","US"],["Long Beach","","United States","USLGB","Long Beach","US"],["Singapore","","Singapore","SGSIN","Singapore","SG"]];

  let state = "idle";
  let ports = [];
  let sourceUsed = "";
  let loadPromise = null;
  let lastError = null;

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else quoted = false;
        } else field += ch;
      } else {
        if (ch === '"') quoted = true;
        else if (ch === ',') { row.push(field); field = ""; }
        else if (ch === '\n') {
          row.push(field); field = "";
          if (row.length > 1 || row[0] !== "") rows.push(row);
          row = [];
        } else if (ch !== '\r') field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function buildPorts(csvText) {
    const rows = parseCSV(csvText);
    if (!rows.length) throw new Error("Empty UN/LOCODE dataset");
    const header = rows.shift().map(x => String(x || "").trim());
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));
    for (const key of ["Country","Location","Name","NameWoDiacritics","Function"]) {
      if (!(key in idx)) throw new Error("Missing UN/LOCODE column: " + key);
    }

    const byCode = new Map();
    for (const r of rows) {
      const change = idx.Change == null ? "" : (r[idx.Change] || "").trim();
      const fn = (r[idx.Function] || "").trim();
      if (change === "X" || fn.charAt(0) !== "1") continue;

      const cc = (r[idx.Country] || "").trim().toUpperCase();
      const loc = (r[idx.Location] || "").trim().toUpperCase();
      if (!cc || !loc) continue;

      const name = (r[idx.Name] || r[idx.NameWoDiacritics] || "").trim();
      const ascii = (r[idx.NameWoDiacritics] || name).trim();
      if (!name) continue;

      const code = cc + loc;
      const country = COUNTRY_NAMES[cc] || cc;
      const date = idx.Date == null ? "" : (r[idx.Date] || "").trim();
      const item = [name, "", country, code, ascii, cc];
      const old = byCode.get(code);

      // UN/LOCODE may contain more than one row for a code during a rename.
      // Prefer the newer dated row; otherwise keep the first stable entry.
      if (!old || (date && date > old.date)) byCode.set(code, { item, date });
    }

    const result = [...byCode.values()].map(x => x.item);
    result.sort((a,b) => a[2].localeCompare(b[2]) || a[0].localeCompare(b[0]));
    if (result.length < 10000) throw new Error("Unexpectedly small maritime dataset: " + result.length);
    return result;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.ports) || parsed.ports.length < 10000) return null;
      return parsed.ports;
    } catch (_) { return null; }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ports: data }));
    } catch (_) {
      // Cache quota/privacy restrictions must never break the quotation form.
    }
  }

  function emitReady() {
    try {
      window.dispatchEvent(new CustomEvent("ak:maritime-ports-ready", {
        detail: { state, count: ports.length, source: sourceUsed, version: VERSION }
      }));
    } catch (_) {}
  }

  async function fetchSource(url) {
    const res = await fetch(url, { mode: "cors", cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    return buildPorts(text);
  }

  async function load(force = false) {
    if (!force && state === "ready" && ports.length) return ports;
    if (!force && loadPromise) return loadPromise;

    loadPromise = (async () => {
      state = "loading";
      lastError = null;

      if (!force) {
        const cached = readCache();
        if (cached) {
          ports = cached;
          state = "ready";
          sourceUsed = "browser-cache";
          emitReady();
          return ports;
        }
      }

      const errors = [];
      for (const url of SOURCES) {
        try {
          const data = await fetchSource(url);
          ports = data;
          state = "ready";
          sourceUsed = url;
          writeCache(data);
          emitReady();
          return ports;
        } catch (err) {
          errors.push(url + ": " + (err && err.message ? err.message : String(err)));
        }
      }

      lastError = new Error(errors.join(" | "));
      ports = FALLBACK_PORTS.slice();
      state = "fallback";
      sourceUsed = "built-in emergency fallback";
      emitReady();
      return ports;
    })().finally(() => { loadPromise = null; });

    return loadPromise;
  }

  window.AKMaritimePorts = {
    version: VERSION,
    load,
    retry: () => load(true),
    getPorts: () => ports,
    getCountryNames: () => COUNTRY_NAMES,
    getState: () => state,
    getSource: () => sourceUsed,
    getError: () => lastError,
    fallbackCount: FALLBACK_PORTS.length
  };

  // Intentionally no auto-start: index.html loads this file only on first POD interaction.
})();

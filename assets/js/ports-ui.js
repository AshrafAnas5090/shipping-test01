(() => {
  "use strict";

  const doc = document.documentElement;
  const selectedByInput = new Map();
  let maritimeScriptPromise = null;
  // Main commercial container gateways are an explicit, maintainable shortlist.
  // Codes are UN/LOCODE identifiers, not a claim that every carrier serves a port.
  // A non-listed maritime port remains searchable under "Other maritime ports".
  const MAJOR_CONTAINER_PORT_CODES = new Set(Object.values({
    EG: 'EGALY EGEDK EGDAM EGPSD EGPSE EGSOK',
    CN: 'CNSHA CNNGB CNQDG CNXMN CNTXG CNSZX CNGZG',
    SG: 'SGSIN', NL: 'NLRTM', BE: 'BEANR',
    DE: 'DEHAM DEBRV', AE: 'AEJEA',
    US: 'USLAX USLGB USNYC USSAV USHOU USORF USSEA USOAK USCHS',
    KR: 'KRPUS KRINC', IN: 'INMUN INNSA INMAA',
    MY: 'MYPKG MYTPP MYPEN', MA: 'MAMED MACAS',
    VN: 'VNSGN VNHPH', TH: 'THLCH THBKK',
    JP: 'JPTYO JPYOK JPOSA JPUKB JPNGO',
    IT: 'ITGOA ITLSP ITTRS ITLIV',
    ES: 'ESVLC ESALG ESBCN ESLPA',
    FR: 'FRMRS FRLEH', GB: 'GBFXT GBSOU GBLIV',
    PL: 'PLGDN PLGDY', TR: 'TRMER TRAMB TRIZM',
    GR: 'GRPIR GRTHE', PT: 'PTLIS PTSIE',
    SA: 'SADMM SAJED', OM: 'OMSLL OMSOH',
    ZA: 'ZADUR ZACPT', BR: 'BRSSZ BRPNG BRRIO',
    MX: 'MXVER MXZLO MXLZC', CA: 'CAVAN CAHAL CAMTR CAPRR',
    AU: 'AUMEL AUSYD AUBNE AUFRE', NZ: 'NZAKL NZTRG',
    ID: 'IDJKT IDSUB', PH: 'PHMNL PHCEB',
    PK: 'PKKHI PKBQM', BD: 'BDCGP', LK: 'LKCMB',
    KE: 'KEMBA', TZ: 'TZDAR', NG: 'NGLOS', GH: 'GHTEM',
    CI: 'CIABJ', SN: 'SNDKR', DZ: 'DZALG', TN: 'TNRAD',
    LY: 'LYTIP LYMRA LYBEN', IL: 'ILASH ILHFA', JO: 'JOAQJ'
  }).join(' ').split(/\s+/).filter(Boolean));
  // NB: country codes not present in the live UN/LOCODE data are not created.
  const isMajorPort = port => MAJOR_CONTAINER_PORT_CODES.has(String(port?.[3] || '').toUpperCase());

  let countryPortIndex = new Map();
  let prioritizedCountries = new Map();
  let indexedSource = null;

  function portsForCountry(source, code) {
    if (source !== indexedSource) {
      countryPortIndex = new Map();
      prioritizedCountries = new Map();
      for (const port of source) {
        const cc = countryCode(port);
        if (!cc) continue;
        if (!countryPortIndex.has(cc)) countryPortIndex.set(cc, []);
        countryPortIndex.get(cc).push(port);
      }
      indexedSource = source;
    }
    if (prioritizedCountries.has(code)) return prioritizedCountries.get(code);
    const result = [...(countryPortIndex.get(code) || [])];
    // Egypt's curated local records remain visible when the remote database is
    // unavailable; deduplicate on UN/LOCODE if the full database already has them.
    if (code === 'EG') {
      const known = new Set(result.map(port => String(port[3] || '').toUpperCase()));
      for (const port of EGYPT_PORTS) {
        if (!known.has(port[3])) {result.push(port);known.add(port[3]);}
      }
    }
    result.sort((a, b) => Number(isMajorPort(b)) - Number(isMajorPort(a)) ||
      String(a[0]).localeCompare(String(b[0])));
    prioritizedCountries.set(code, result);
    return result;
  }

  // One controller for both selector layouts and all four route inputs.
  // Desktop: a compact, unclipped popover. Mobile: a real modal with its own
  // persistent search field. The underlying selected values are unchanged.
  const dropdownLayer = (() => {
    const narrow = window.matchMedia('(max-width: 640px)');
    let current = null;
    let pendingFrame = 0;
    let modal = null;
    let modalTitle, modalSearch, modalContent;

    const mobile = () => narrow.matches;
    function ensureModal() {
      if (modal) return;
      modal = document.createElement('dialog');
      modal.className = 'ak-location-dialog';
      modal.setAttribute('aria-label', 'Select location');
      modal.innerHTML = `
        <div class="ak-location-dialog-header">
          <strong class="ak-location-dialog-title"></strong>
          <button class="ak-location-dialog-close" type="button" aria-label="Close">×</button>
        </div>
        <div class="ak-location-dialog-search-row">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <input class="ak-location-dialog-search" type="search" autocomplete="off" spellcheck="false"/>
        </div>
        <div class="ak-location-dialog-results"></div>`;
      document.body.appendChild(modal);
      modalTitle = modal.querySelector('.ak-location-dialog-title');
      modalSearch = modal.querySelector('.ak-location-dialog-search');
      modalContent = modal.querySelector('.ak-location-dialog-results');
      modal.querySelector('.ak-location-dialog-close').addEventListener('click', () => hide());
      modalSearch.addEventListener('input', () => current?.onSearch?.());
      modalSearch.addEventListener('keydown', event => {
        if (event.key === 'Escape') {event.preventDefault();hide();return;}
        current?.onKeydown?.(event);
      });
      modal.addEventListener('cancel', event => {event.preventDefault();hide();});
    }

    function position() {
      if (!current || current.mobile) return;
      const {list, anchor} = current;
      if (!anchor.isConnected) {hide();return;}
      const vv = window.visualViewport;
      const viewportTop = vv?.offsetTop || 0;
      const viewportLeft = vv?.offsetLeft || 0;
      const viewportWidth = vv?.width || innerWidth;
      const viewportHeight = vv?.height || innerHeight;
      const box = anchor.getBoundingClientRect();
      const gap = 8;
      const width = Math.min(Math.max(box.width, 300), viewportWidth - 2 * gap);
      const x = Math.max(viewportLeft + gap,
        Math.min(box.left, viewportLeft + viewportWidth - width - gap));
      const below = viewportTop + viewportHeight - box.bottom - gap * 2;
      const above = box.top - viewportTop - gap * 2;
      const placeAbove = below < Math.min(list.scrollHeight, 245) && above > below;
      const room = Math.max(96, placeAbove ? above : below);
      const height = Math.min(list.scrollHeight, room, viewportHeight - 2 * gap);
      const y = placeAbove ? box.top - height - gap : box.bottom + gap;
      Object.assign(list.style, {
        left:`${Math.round(x)}px`, top:`${Math.round(Math.max(viewportTop+gap,y))}px`,
        width:`${Math.round(width)}px`, maxHeight:`${Math.round(room)}px`
      });
    }
    function schedule() {
      if (!current || current.mobile || pendingFrame) return;
      pendingFrame = requestAnimationFrame(() => {pendingFrame = 0;position();});
    }
    function hide(list = current?.list) {
      if (!current || (list && current.list !== list)) return;
      const old = current;
      current = null;
      old.list.classList.remove('ak-selector-open', 'open');
      old.list.removeAttribute('style');
      old.parent.insertBefore(old.list, old.nextSibling?.parentNode === old.parent ? old.nextSibling : null);
      if (old.mobile) {
        document.body.classList.remove('ak-location-lock');
        if (modal?.open) modal.close();
      }
      old.onClose?.();
    }
    function show(list, anchor, options = {}) {
      if (current?.list === list && current.mobile === mobile()) {
        if (!current.mobile) schedule();
        return;
      }
      hide();
      const useMobile = mobile();
      current = {list, anchor, parent:list.parentNode, nextSibling:list.nextSibling,
        mobile:useMobile, ...options};
      list.classList.add('ak-selector-open');
      if (useMobile) {
        ensureModal();
        modalTitle.textContent = options.title || msg('Select location', 'اختر الموقع');
        modal.setAttribute('aria-label', modalTitle.textContent);
        modalSearch.placeholder = options.placeholder || msg('Search...', 'بحث...');
        modalSearch.setAttribute('aria-label', modalSearch.placeholder);
        modalSearch.value = '';
        modalContent.appendChild(list);
        document.body.classList.add('ak-location-lock');
        // Avoid focus restoration reopening the country field on dialog close.
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        modal.showModal();
        modalSearch.focus({preventScroll:true});
      } else {
        document.body.appendChild(list);
        position();
      }
    }
    function queryFor(list, input) {
      return current?.list === list && current.mobile ? modalSearch.value : input.value;
    }
    function isMobile(list) {return current?.list === list && current.mobile;}
    document.addEventListener('pointerdown', event => {
      if (!current || current.mobile) return;
      if (!current.list.contains(event.target) && !current.anchor.contains(event.target)) hide();
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && current && !current.mobile) hide();
    });
    window.addEventListener('resize', () => {
      if (current && current.mobile !== mobile()) hide();
      else schedule();
    }, {passive:true});
    window.addEventListener('scroll', schedule, {capture:true, passive:true});
    window.visualViewport?.addEventListener('resize', schedule, {passive:true});
    window.visualViewport?.addEventListener('scroll', schedule, {passive:true});
    narrow.addEventListener('change', () => {
      document.querySelectorAll('.origin-country-input, .origin-composite .port-control input')
        .forEach(input => {input.readOnly = mobile();input.inputMode = mobile() ? 'none' : 'search';});
      if (current) hide();
    });
    return {show,hide,schedule,queryFor,isMobile,mobile};
  })();

  const EGYPT_PORTS = [
    ["Alexandria","Alexandria","Egypt","EGALY","Alexandria","EG"],
    ["El Dekheila","Alexandria","Egypt","EGEDK","El Dekheila","EG"],
    ["Damietta","Damietta","Egypt","EGDAM","Damietta","EG"],
    ["Port Said","Port Said","Egypt","EGPSD","Port Said","EG"],
    ["East Port Said","Port Said","Egypt","EGPSE","East Port Said","EG"],
    ["Ain Sokhna","Suez","Egypt","EGSOK","Ain Sokhna","EG"],
    ["Adabiya","Suez","Egypt","EGADA","Adabiya","EG"],
    ["Suez","Suez","Egypt","EGSUZ","Suez","EG"],
    ["Safaga","Red Sea","Egypt","EGSGA","Safaga","EG"],
    ["Nuweiba","South Sinai","Egypt","EGNUW","Nuweiba","EG"],
    ["Abu Qir","Alexandria","Egypt","EGAKI","Abu Qir","EG"],
    ["El Tor","South Sinai","Egypt","EGTOR","El Tor","EG"]
  ];

  const isArabic = () => doc.lang === "ar";
  const msg = (en, ar) => isArabic() ? ar : en;
  const norm = value => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const maritimeDataURL = new URL("../data/maritime-ports.js", document.currentScript.src).href;

  function ensureMaritimeDB() {
    if (window.AKMaritimePorts) return Promise.resolve(window.AKMaritimePorts);
    if (maritimeScriptPromise) return maritimeScriptPromise;

    maritimeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = maritimeDataURL;
      script.async = true;
      script.onload = () => window.AKMaritimePorts
        ? resolve(window.AKMaritimePorts)
        : reject(new Error("Maritime database loader unavailable"));
      script.onerror = () => reject(new Error("Unable to load maritime database"));
      document.head.appendChild(script);
    });

    return maritimeScriptPromise;
  }

  function countryCode(port) {
    const explicit = String(port?.[5] || "").toUpperCase();
    if (/^[A-Z]{2}$/.test(explicit)) return explicit;
    const locode = String(port?.[3] || "").toUpperCase();
    return /^[A-Z]{2}/.test(locode) ? locode.slice(0, 2) : "";
  }

  // Small SVG flags from FlagCDN. Only validated ISO-alpha-2 country codes are accepted.
  // The browser caches each file; no emoji rendering or platform-specific flag fonts.
  function countryFlagUrl(code) {
    const cc = String(code || "").toLowerCase();
    return /^[a-z]{2}$/.test(cc) ? `https://flagcdn.com/${cc}.svg` : "";
  }

  function countryFlag(code) {
    const src = countryFlagUrl(code);
    return src ? `<img class="origin-option-flag-image" src="${src}" width="30" height="22" loading="lazy" decoding="async" alt="">` : "";
  }

  function makeCountryFlag(code, className = "origin-flag-image") {
    const image = document.createElement("img");
    image.className = className;
    image.width = 30;
    image.height = 22;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => { image.hidden = true; });
    image.src = countryFlagUrl(code);
    return image;
  }

  function portRecord(port) {
    if (!port) return null;
    return {
      name: String(port[0] || ""),
      city: String(port[1] || ""),
      country: String(port[2] || ""),
      locode: String(port[3] || ""),
      alternateName: String(port[4] || ""),
      countryCode: countryCode(port)
    };
  }

  function portFullText(port) {
    const p = portRecord(port);
    if (!p) return "";
    const place = [p.country, p.city].filter(Boolean).join(" · ");
    return `${escapeHtml(p.name)}${place ? ` — ${place}` : ""}${p.locode ? ` (${escapeHtml(p.locode)})` : ""}`;
  }

  function aliases(port) {
    const p = portRecord(port);
    const extra = [];
    const country = norm(p.country);
    const cc = p.countryCode;

    if (cc === "US" || country === "united states") extra.push("usa","us","america","united states of america");
    if (cc === "AE") extra.push("uae","emirates");
    if (cc === "GB") extra.push("uk","britain","great britain");
    if (cc === "RU") extra.push("russia","russian federation");
    if (cc === "TR") extra.push("turkey","turkiye","türkiye");
    if (cc === "KR") extra.push("korea","south korea","republic of korea");
    if (cc === "KP") extra.push("north korea");
    if (cc === "CN") extra.push("china","prc");
    if (cc === "EG") extra.push("egypt","egyptian");

    return [
      p.name, p.city, p.country, p.locode, p.alternateName, p.countryCode, ...extra
    ].map(norm);
  }

  // Port arrays are immutable records; reuse normalized search fields across keystrokes.
  const searchFields = new WeakMap();
  function cachedAliases(port) {
    let fields = searchFields.get(port);
    if (!fields) {
      fields = aliases(port);
      searchFields.set(port, fields);
    }
    return fields;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function score(port, query) {
    const fields = cachedAliases(port);
    const [name, city, country, code, alt, cc] = fields;

    if (code === query || name === query || alt === query) return 0;
    if (name.startsWith(query) || alt.startsWith(query)) return 1;
    if (code.startsWith(query)) return 2;
    if (city === query || country === query || cc === query) return 3;
    if (city.startsWith(query) || country.startsWith(query) || cc.startsWith(query)) return 4;
    if (fields.some(value => value.includes(query))) return 5;
    return 99;
  }

  function validMessage() {
    return msg(
      "Select a valid sea port from the list.",
      "اختر ميناءً بحريًا صالحًا من القائمة."
    );
  }

  function setValidity(input) {
    if (!input) return;
    const hasText = Boolean(input.value.trim());
    const selected = selectedByInput.get(input.id);
    input.setCustomValidity(hasText && !selected ? validMessage() : "");
    input.closest(".port-combo")?.classList.toggle("is-invalid-port", hasText && !selected);
  }

  function createInputChrome(input, combo) {
    if (combo.querySelector(".port-control")) return;

    const control = document.createElement("div");
    control.className = "port-control";

    const flag = document.createElement("span");
    flag.className = "port-selected-flag";
    flag.setAttribute("aria-hidden", "true");
    flag.hidden = true;

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "port-clear";
    clear.hidden = true;
    clear.setAttribute("aria-label", msg("Clear selected port", "مسح الميناء المختار"));
    clear.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"></path></svg>';

    input.parentNode.insertBefore(control, input);
    control.append(flag, input, clear);

    const detail = document.createElement("div");
    detail.className = "port-selected-detail";
    detail.hidden = true;
    combo.insertBefore(detail, combo.querySelector(".port-dropdown"));

    clear.addEventListener("click", () => {
      clearSelection(input, false);
      input.value = "";
      setValidity(input);
      input.focus();
      input.dispatchEvent(new Event("input", {bubbles: true}));
    });
  }

  function setSelected(inputOrId, port, {emit = true} = {}) {
    const input = typeof inputOrId === "string"
      ? document.getElementById(inputOrId)
      : inputOrId;
    if (!input || !port) return false;

    const combo = input.closest(".port-combo");
    const record = portRecord(port);
    selectedByInput.set(input.id, [...port]);

    input.value = record.name;
    input.dataset.portValue = portFullText(port);
    input.dataset.portLocode = record.locode;
    input.dataset.portCountry = record.country;
    input.dataset.portCountryCode = record.countryCode;
    input.dataset.portCity = record.city;

    combo?.classList.add("has-port");
    combo?.classList.remove("is-invalid-port");

    const flag = combo?.querySelector(".port-selected-flag");
    if (flag) {
      flag.replaceChildren(makeCountryFlag(record.countryCode));
      flag.hidden = false;
    }

    const clear = combo?.querySelector(".port-clear");
    if (clear) clear.hidden = false;

    const detail = combo?.querySelector(".port-selected-detail");
    if (detail) {
      const geography = [record.country, record.city].filter(Boolean).join(" · ");
      detail.innerHTML = `
        <span>${escapeHtml(geography)}</span>
        <b>${escapeHtml(record.locode)}</b>
      `;
      detail.hidden = false;
    }

    input.setCustomValidity("");
    syncCountryFromPort(input, record);
    if (emit) input.dispatchEvent(new Event("change", {bubbles: true}));
    return true;
  }

  function clearSelection(inputOrId, keepText = true) {
    const input = typeof inputOrId === "string"
      ? document.getElementById(inputOrId)
      : inputOrId;
    if (!input) return;

    selectedByInput.delete(input.id);
    delete input.dataset.portValue;
    delete input.dataset.portLocode;
    delete input.dataset.portCountry;
    delete input.dataset.portCountryCode;
    delete input.dataset.portCity;

    const combo = input.closest(".port-combo");
    combo?.classList.remove("has-port");

    const flag = combo?.querySelector(".port-selected-flag");
    if (flag) {
      flag.hidden = true;
      flag.textContent = "";
    }

    const clear = combo?.querySelector(".port-clear");
    if (clear) clear.hidden = true;

    const detail = combo?.querySelector(".port-selected-detail");
    if (detail) {
      detail.hidden = true;
      detail.textContent = "";
    }

    if (!keepText) input.value = "";
    setValidity(input);
  }

  function getSelected(id) {
    const port = selectedByInput.get(id);
    return port ? portRecord(port) : null;
  }

  function getSelectedRaw(id) {
    const port = selectedByInput.get(id);
    return port ? [...port] : null;
  }

  function copySelection(fromId, toId) {
    const port = getSelectedRaw(fromId);
    return port ? setSelected(toId, port) : false;
  }

  function swapSelections(aId, bId) {
    const a = getSelectedRaw(aId);
    const b = getSelectedRaw(bId);

    if (b) setSelected(aId, b);
    else {
      clearSelection(aId, false);
      document.getElementById(aId).value = "";
      countryControls.get(aId)?.reset();
    }

    if (a) setSelected(bId, a);
    else {
      clearSelection(bId, false);
      document.getElementById(bId).value = "";
      countryControls.get(bId)?.reset();
    }

    const aInput = document.getElementById(aId);
    const bInput = document.getElementById(bId);
    setValidity(aInput);
    setValidity(bInput);
  }

  function updateSwapLabels() {
    document.querySelectorAll(".port-swap").forEach(button => {
      const label = msg("Swap origin and destination", "تبديل ميناء الشحن وميناء التفريغ");
      button.title = label;
      button.setAttribute("aria-label", label);
    });
    document.querySelectorAll(".port-clear").forEach(button => {
      button.setAttribute("aria-label", msg("Clear selected port", "مسح الميناء المختار"));
    });
  }

  function initPortCombo(inputId, listId) {
    const input = document.getElementById(inputId);
    const combo = input?.closest(".port-combo");
    const list = document.getElementById(listId);
    if (!input || !combo || !list) return;

    createInputChrome(input, combo);
    input.readOnly = dropdownLayer.mobile();
    input.inputMode = dropdownLayer.mobile() ? 'none' : 'search';

    let active = -1;
    let shown = [];
    let requestSeq = 0;
    let loadFailed = false;

    const globalDB = () => window.AKMaritimePorts;

    function dbState() {
      const db = globalDB();
      if (!db) return "idle";
      return db.getState?.() || "idle";
    }

    function stateLine() {
      const db = globalDB();
      if (loadFailed) {
        return `<span class="port-db-state port-db-warning">${msg(
          "Global maritime database is unavailable. Only built-in fallback port locations are shown.",
          "قاعدة الموانئ العالمية غير متاحة حاليًا. تظهر مواقع الموانئ الاحتياطية المتاحة."
        )}</span>`;
      }
      if (!db) return `<span class="port-db-state">${msg(
        "Global maritime database loads when you search.",
        "يتم تحميل قاعدة الموانئ العالمية عند بدء البحث."
      )}</span>`;

      const state = dbState();
      if (state === "ready") {
        const count = db.getPorts?.().length || 0;
        return `<span class="port-db-state">${msg(
          `UN/LOCODE maritime locations: ${count.toLocaleString()}`,
          `مواقع الموانئ البحرية المسجلة: ${count.toLocaleString()}`
        )}</span>`;
      }
      if (state === "fallback") {
        return `<span class="port-db-state port-db-warning">${msg(
          "Global database fallback mode — select from the available port locations.",
          "وضع احتياطي لقاعدة الموانئ — اختر من مواقع الموانئ المتاحة."
        )}</span>`;
      }
      return `<span class="port-db-state">${msg(
        "Loading global maritime database…",
        "جارٍ تحميل قاعدة الموانئ البحرية العالمية…"
      )}</span>`;
    }

    function optionHtml(port, index) {
      const p = portRecord(port);
      const flag = countryFlag(p.countryCode);
      const geography = [p.country, p.city].filter(Boolean).join(" · ");
      return `
        <button type="button" class="port-option" role="option" data-i="${index}">
          <span class="port-option-flag" aria-hidden="true">${flag}</span>
          <span class="port-option-copy">
            <span class="port-name">${escapeHtml(p.name)}</span>
            <span class="port-meta">${escapeHtml(geography)}</span>
          </span>
          <span class="port-option-side">
            <span class="port-type">${isMajorPort(port) ? msg("MAIN CONTAINER PORT","ميناء حاويات رئيسي") : msg("MARITIME PORT","ميناء بحري")}</span>
            <span class="port-code">${escapeHtml(p.locode)}</span>
          </span>
        </button>`;
    }

    // One row renderer for both country/port selectors and screen sizes.
    // Group headings scroll together with results, keeping the mobile search fixed.
    function groupedOptions() {
      let lastGroup = '';
      return shown.map((port, index) => {
        const group = isMajorPort(port) ? 'major' : 'other';
        const heading = group !== lastGroup ? `<div class="port-group-heading" role="presentation">${
          group === 'major' ? msg('MAIN CONTAINER PORTS', 'موانئ الحاويات الرئيسية') :
          msg('OTHER MARITIME PORTS', 'الموانئ البحرية الأخرى')
        }</div>` : '';
        lastGroup = group;
        return heading + optionHtml(port, index);
      }).join('');
    }

    function shell(body, title, footer = "") {
      list.innerHTML = `
        <div class="port-dropdown-head">
          <span>${title}</span>
          <b>${msg("PORTS ONLY","موانئ فقط")}</b>
        </div>
        <div class="ak-selector-options">${body}</div>
        <div class="port-hint">
          ${msg(
            "UN/LOCODE maritime locations; container service depends on the carrier. Select from the list.",
            "مواقع بحرية مسجلة في UN/LOCODE؛ توافر خدمة الحاويات يعتمد على شركة الملاحة. اختر من القائمة."
          )}
          ${footer ? `<br>${footer}` : ""}
          ${stateLine()}
        </div>`;
    }

    // One delegated handler also handles touch; no listener per result.
    list.addEventListener('click', event => {
      const button = event.target.closest('.port-option');
      if (button) choose(Number(button.dataset.i));
    });
    function bindOptions() { dropdownLayer.schedule(); }

    async function requestGlobalLoad(seq) {
      try {
        const db = await ensureMaritimeDB();
        await db.load?.(false);
        loadFailed = false;
        if (seq === requestSeq && combo.classList.contains("open")) render();
      } catch {
        loadFailed = true;
        if (seq === requestSeq && combo.classList.contains("open")) render();
      }
    }

    function render() {
      const seq = ++requestSeq;
      const query = norm(dropdownLayer.queryFor(list, input));
      const selectedCountry = combo.dataset.countryCode || "";
      active = -1;

      if (!selectedCountry) {
        shown = [];
        shell(`<div class="port-empty">${msg("Select a country first.", "اختر الدولة أولًا.")}</div>`, msg("SELECT COUNTRY FIRST", "اختر الدولة أولًا"));
        return;
      }

      if (!query) {
        const db = globalDB();
        const state = dbState();
        const source = state === "ready" || state === "fallback" ? db.getPorts?.() || [] : [];
        const candidates = source.length ? portsForCountry(source, selectedCountry) :
          EGYPT_PORTS.filter(port => countryCode(port) === selectedCountry);
        shown = candidates.slice(0, 60);
        const body = shown.length ? groupedOptions() :
          `<div class="port-empty">${msg(
            "Loading available seaports for this country…",
            "جارٍ تحميل الموانئ البحرية المتاحة لهذه الدولة…"
          )}</div>`;
        const footer = candidates.length > shown.length ? msg(
          `Showing ${shown.length} of ${candidates.length} ports — type to search.`,
          `عرض ${shown.length} من ${candidates.length} ميناء — اكتب للبحث.`
        ) : "";
        shell(body, msg("SELECT MARITIME PORT", "اختر الميناء البحري"), footer);
        bindOptions();
        if ((!db || state === "idle" || state === "loading") && !loadFailed) requestGlobalLoad(seq);
        return;
      }

      if (query.length < 2) {
        shown = [];
        shell(`<div class="port-empty">${msg("Type at least 2 characters to search.", "اكتب حرفين على الأقل للبحث.")}</div>`, msg("MARITIME PORT SEARCH","بحث الموانئ البحرية"));
        return;
      }

      const db = globalDB();
      const state = dbState();

      if (!db || state === "idle" || state === "loading") {
        // Search verified Egypt fallback immediately, while the global DB loads.
        const localMatches = portsForCountry(EGYPT_PORTS, selectedCountry)
          .map(port => ({port, score: score(port, query)}))
          .filter(item => item.score < 99)
          .sort((a,b) => Number(isMajorPort(b.port)) - Number(isMajorPort(a.port)) || a.score - b.score)
          .slice(0, 60)
          .map(item => item.port);

        shown = localMatches;
        const body = shown.length
          ? groupedOptions()
          : `<div class="port-empty">${msg(
              "Preparing global sea-port search…",
              "جارٍ تجهيز البحث في الموانئ البحرية العالمية…"
            )}</div>`;

        shell(body, msg("MARITIME PORT SEARCH","بحث الموانئ البحرية"));
        bindOptions();
        if (!loadFailed) requestGlobalLoad(seq);
        return;
      }

      const source = db.getPorts?.() || EGYPT_PORTS;
      const matches = [];

      for (const port of portsForCountry(source, selectedCountry)) {
        const portScore = score(port, query);
        if (portScore < 99) matches.push({port, score: portScore});
      }

      matches.sort((a,b) =>
        Number(isMajorPort(b.port)) - Number(isMajorPort(a.port)) ||
        a.score - b.score ||
        String(a.port[0] || "").localeCompare(String(b.port[0] || ""))
      );

      const total = matches.length;
      shown = matches.slice(0, 60).map(item => item.port);

      const body = shown.length
        ? groupedOptions()
        : `<div class="port-empty">${msg(
            "No maritime port matches this search. Check the spelling or UN/LOCODE.",
            "لا يوجد ميناء بحري يطابق البحث. راجع الكتابة أو UN/LOCODE."
          )}</div>`;

      const footer = total > shown.length
        ? msg(
            `Showing ${shown.length} of ${total} matches — type more to narrow.`,
            `عرض ${shown.length} من ${total} نتيجة — اكتب أكثر لتضييق البحث.`
          )
        : "";

      shell(body, msg("MARITIME PORTS","الموانئ البحرية"), footer);
      bindOptions();
    }

    function choose(index) {
      const port = shown[index];
      if (!port) return;
      setSelected(input, port);
      dropdownLayer.hide(list);
      combo.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
    }

    function navigate(event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;
      const options = [...list.querySelectorAll('.port-option')];
      if (event.key === 'Enter') {
        if (active >= 0) {event.preventDefault();choose(active);}
        return;
      }
      event.preventDefault();
      active = event.key === 'ArrowDown' ? Math.min(active+1,options.length-1) : Math.max(active-1,0);
      options.forEach((option,index) => option.classList.toggle('active', index===active));
      options[active]?.scrollIntoView({block:'nearest'});
    }
    function open() {
      combo.classList.add('open');
      input.setAttribute('aria-expanded','true');
      dropdownLayer.show(list, combo.querySelector('.origin-port-side') || combo, {
        title:msg('Select Seaport','اختر الميناء البحري'),
        placeholder:msg('Search port, city or UN/LOCODE','ابحث عن ميناء أو مدينة أو رمز الميناء'),
        onSearch:render, onKeydown:navigate,
        onClose:() => {combo.classList.remove('open');input.setAttribute('aria-expanded','false');}
      });
      render();
    }

    input.addEventListener("focus", () => {
      if (!combo.dataset.countryCode) combo.querySelector(".origin-country-input")?.focus();
      else open();
    });
    input.addEventListener("click", () => {
      if (!combo.dataset.countryCode) combo.querySelector(".origin-country-input")?.focus();
      else open();
    });

    input.addEventListener("input", () => {
      if (selectedByInput.has(input.id)) clearSelection(input, true);
      setValidity(input);
      open();
    });

    input.addEventListener("blur", () => setValidity(input));

    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {dropdownLayer.hide(list);return;}
      if (!combo.classList.contains('open') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) open();
      navigate(event);
    });

    window.addEventListener("ak:maritime-ports-ready", () => {
      if (combo.classList.contains("open")) render();
    });
  }


  // Country and port share one visual field, while the original port input/ID
  // continues to drive the existing quotation, copying, and server payload.
  const countryControls = new Map();
  function syncCountryFromPort(portInput, record) {
    const ui = countryControls.get(portInput.id);
    if (!ui) return;
    ui.select(record.countryCode, record.country, false);
  }

  function initCountryPort(portId) {
    const portInput = document.getElementById(portId);
    const combo = portInput?.closest(".port-combo");
    const portControl = combo?.querySelector(".port-control");
    if (!combo || !portControl) return;
    combo.classList.add("origin-composite");

    const row = document.createElement("div");
    row.className = "origin-composite-row";
    const side = document.createElement("div");
    side.className = "origin-country-side";
    const flag = makeCountryFlag("", "origin-country-flag");
    flag.hidden = true;
    const countryLabel = document.createElement("span");
    countryLabel.className = "origin-field-caption origin-country-caption";
    countryLabel.textContent = msg("Country", "الدولة");
    const input = document.createElement("input");
    input.type = "text";
    input.id = portId + "Country";
    input.className = "origin-country-input";
    input.autocomplete = "off";
    input.readOnly = dropdownLayer.mobile();
    input.inputMode = dropdownLayer.mobile() ? 'none' : 'search';
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-label", msg("Country", "الدولة"));
    const list = document.createElement("div");
    list.id = portId + "CountryList";
    list.className = "origin-country-list";
    list.setAttribute("role", "listbox");
    input.setAttribute("aria-controls", list.id);
    const portSide = document.createElement("div");
    portSide.className = "origin-port-side";
    const portLabel = document.createElement("span");
    portLabel.className = "origin-field-caption origin-port-caption";
    portLabel.textContent = msg("Seaport", "الميناء البحري");
    const separator = document.createElement("span");
    separator.className = "origin-internal-separator";
    separator.setAttribute("aria-hidden", "true");
    const selectedName = document.createElement("span");
    selectedName.className = "country-name-display";
    selectedName.hidden = true;
    selectedName.setAttribute("aria-hidden", "true");
    side.append(flag, countryLabel, input, selectedName, list);
    portSide.append(portLabel, portControl);
    row.append(side, separator, portSide);
    combo.insertBefore(row, combo.firstChild);
    portInput.setAttribute("aria-label", msg("Seaport", "الميناء البحري"));

    let chosen = "";
    let matches = [];
    let highlighted = -1;
    let pending = null;
    let countryCache = null;
    let countrySource = null;
    const displayNames = () => window.AKMaritimePorts?.getCountryNames?.() || {EG:"Egypt"};
    const countryList = () => {
      const names = displayNames();
      if (countrySource !== names) {
        countrySource = names;
        countryCache = Object.entries(names).map(([code,name]) => ({code,name,search:norm(name)}))
          .sort((a,b) => a.name.localeCompare(b.name));
      }
      return countryCache;
    };
    const close = () => {
      dropdownLayer.hide(list);
      list.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      highlighted = -1;
    };
    function select(code, name, clearPort = true) {
      const changed = chosen !== code;
      chosen = code;
      combo.dataset.countryCode = code;
      input.value = name;
      selectedName.textContent = name;
      selectedName.hidden = false;
      side.classList.add("has-country");
      flag.hidden = true;
      flag.src = countryFlagUrl(code);
      flag.hidden = !flag.src;
      portInput.disabled = false;
      portInput.placeholder = msg("Search sea port...", "ابحث عن الميناء البحري...");
      if (changed && clearPort) {
        clearSelection(portInput, false);
        portInput.dispatchEvent(new Event("change", {bubbles:true}));
      }
      close();
      if (changed && clearPort) portInput.focus();
    }
    countryControls.set(portId, {select, reset: () => {
      chosen = "";
      delete combo.dataset.countryCode;
      input.value = "";
      flag.hidden = true;
      selectedName.hidden = true;
      selectedName.textContent = "";
      side.classList.remove("has-country", "editing-country");
      portInput.disabled = true;
      portInput.placeholder = msg("Select country first", "اختر الدولة أولًا");
      close();
    }});
    selectedName.addEventListener("click", () => {
      side.classList.add("editing-country");
      input.focus();
      if (dropdownLayer.mobile()) show();
      else input.select();
    });
    portInput.disabled = true;
    flag.hidden = true;
    function renderCountry() {
      const q = norm(dropdownLayer.queryFor(list,input));
      matches = countryList().filter(c => !q || c.search.includes(q) || norm(c.code).startsWith(q));
      list.innerHTML = `<div class="ak-selector-options">${matches.length ? matches.map((c,i) =>
        `<button type="button" class="origin-country-option" role="option" data-index="${i}"><img class="origin-option-flag" src="${countryFlagUrl(c.code)}" width="30" height="22" loading="lazy" decoding="async" alt=""><span>${escapeHtml(c.name)}</span></button>`
      ).join('') : `<div class="port-empty">${msg('No matching country','لا توجد دولة مطابقة')}</div>`}</div>`;
      highlighted = -1;
      dropdownLayer.schedule();
    }
    function navigateCountry(event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        highlighted = event.key === 'ArrowDown' ? Math.min(highlighted+1,matches.length-1) : Math.max(0,highlighted-1);
        list.querySelectorAll('button').forEach((button,i) => button.classList.toggle('active',i===highlighted));
        list.querySelectorAll('button')[highlighted]?.scrollIntoView({block:'nearest'});
      } else if (event.key === 'Enter' && highlighted >= 0) {
        event.preventDefault();
        const country = matches[highlighted];
        if (country) select(country.code,country.name);
      }
    }
    function show() {
      list.classList.add('open');
      input.setAttribute('aria-expanded','true');
      dropdownLayer.show(list,side,{
        title:msg('Select Country','اختر الدولة'),
        placeholder:msg('Search country','ابحث عن الدولة'),
        onSearch:renderCountry,onKeydown:navigateCountry,
        onClose:() => {list.classList.remove('open');input.setAttribute('aria-expanded','false');highlighted=-1;}
      });
      renderCountry();
    }
    function load() {
      if (pending) return pending;
      pending = ensureMaritimeDB().then(db => {
        // Country names are already in the small loader; do not wait for the CSV.
        if (list.classList.contains('open')) renderCountry();
        return db.load?.();
      }).catch(() => null).finally(() => {
        pending = null;
        if (list.classList.contains('open')) renderCountry();
      });
      return pending;
    }
    input.addEventListener("focus", () => {side.classList.add("editing-country");show();load();});
    input.addEventListener("blur", () => {
      side.classList.remove("editing-country");
      if (chosen) input.value = selectedName.textContent;
    });
    input.addEventListener("input", () => {
      if (chosen) {
        chosen = "";
        delete combo.dataset.countryCode;
        flag.hidden = true;
        selectedName.hidden = true;
        selectedName.textContent = "";
        side.classList.remove("has-country");
        portInput.disabled = true;
        clearSelection(portInput, false);
      }
      show();
    });
    list.addEventListener('click', event => {
      const button = event.target.closest('button[data-index]');
      if (!button) return;
      const country = matches[Number(button.dataset.index)];
      if (country) select(country.code,country.name);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {close();return;}
      if (!list.classList.contains('open') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) show();
      navigateCountry(event);
    });
    document.addEventListener("ak:languagechange", () => {
      input.placeholder = msg("Country", "الدولة");
      countryLabel.textContent = msg("Country", "الدولة");
      portLabel.textContent = msg("Seaport", "الميناء البحري");
      input.setAttribute("aria-label", msg("Country", "الدولة"));
      portInput.setAttribute("aria-label", msg("Seaport", "الميناء البحري"));
      if (chosen) {
        input.value = displayNames()[chosen] || input.value;
        selectedName.textContent = input.value;
      }
    });
    input.placeholder = msg("Country", "الدولة");
    portInput.placeholder = msg("Select country first", "اختر الدولة أولًا");
  }

  initPortCombo("origin", "polPortList");
  initPortCombo("destination", "podPortList");
  initPortCombo("quickOrigin", "quickPolPortList");
  initPortCombo("quickDestination", "quickPodPortList");
  ["origin", "destination", "quickOrigin", "quickDestination"].forEach(initCountryPort);

  document.getElementById("quickSwapPorts")?.addEventListener("click", () => {
    swapSelections("quickOrigin", "quickDestination");
  });

  document.getElementById("quoteSwapPorts")?.addEventListener("click", () => {
    swapSelections("origin", "destination");
  });

  document.addEventListener("ak:languagechange", () => {
    updateSwapLabels();
    document.querySelectorAll(".port-combo input").forEach(setValidity);
  });

  updateSwapLabels();

  window.AKPortSelector = Object.freeze({
    getSelected,
    getSelectedRaw,
    setSelected,
    clearSelection,
    copySelection,
    swapSelections,
    portFullText
  });
})();
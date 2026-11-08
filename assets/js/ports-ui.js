(() => {
  "use strict";

  const doc = document.documentElement;
  const selectedByInput = new Map();
  let maritimeScriptPromise = null;
  let countryPortIndex = null;
  let indexedSource = null;

  // Build the index once per dataset, not once per keystroke.
  function portsForCountry(source, code) {
    if (source !== indexedSource) {
      countryPortIndex = new Map();
      for (const port of source) {
        const cc = countryCode(port);
        if (!countryPortIndex.has(cc)) countryPortIndex.set(cc, []);
        countryPortIndex.get(cc).push(port);
      }
      indexedSource = source;
    }
    return countryPortIndex.get(code) || [];
  }

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

  function ensureMaritimeDB() {
    if (window.AKMaritimePorts) return Promise.resolve(window.AKMaritimePorts);
    if (maritimeScriptPromise) return maritimeScriptPromise;

    maritimeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./assets/data/maritime-ports.js";
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

  function initPortCombo(kind, inputId, listId) {
    const input = document.getElementById(inputId);
    const combo = input?.closest(".port-combo");
    const list = document.getElementById(listId);
    if (!input || !combo || !list) return;

    createInputChrome(input, combo);

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
          "Global maritime database is unavailable. Only verified fallback ports are shown.",
          "قاعدة الموانئ العالمية غير متاحة حاليًا. تظهر فقط الموانئ الاحتياطية الموثقة."
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
          `Verified maritime database: ${count.toLocaleString()} locations`,
          `قاعدة الموانئ البحرية الموثقة: ${count.toLocaleString()} موقع`
        )}</span>`;
      }
      if (state === "fallback") {
        return `<span class="port-db-state port-db-warning">${msg(
          "Global database fallback mode — select only from the displayed verified results.",
          "وضع احتياطي لقاعدة الموانئ — اختر فقط من النتائج الموثقة الظاهرة."
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
            <span class="port-type">${msg("SEA PORT","ميناء بحري")}</span>
            <span class="port-code">${escapeHtml(p.locode)}</span>
          </span>
        </button>`;
    }

    function shell(body, title, footer = "") {
      list.innerHTML = `
        <div class="port-dropdown-head">
          <span>${title}</span>
          <b>${msg("PORTS ONLY","موانئ فقط")}</b>
        </div>
        ${body}
        <div class="port-hint">
          ${msg(
            "Search by port, city, country or UN/LOCODE. Free text is not accepted.",
            "ابحث بالميناء أو المدينة أو الدولة أو UN/LOCODE. لا يتم قبول النص الحر."
          )}
          ${footer ? `<br>${footer}` : ""}
          ${stateLine()}
        </div>`;
    }

    function bindOptions() {
      list.querySelectorAll(".port-option").forEach(button => {
        button.addEventListener("mousedown", event => {
          event.preventDefault();
          choose(Number(button.dataset.i));
        });
      });
    }

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
      const query = norm(input.value);
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
        shown = candidates.slice(0, 20);
        const body = shown.length ? shown.map(optionHtml).join("") :
          `<div class="port-empty">${msg(
            "Loading available seaports for this country…",
            "جارٍ تحميل الموانئ البحرية المتاحة لهذه الدولة…"
          )}</div>`;
        const footer = candidates.length > shown.length ? msg(
          `Showing ${shown.length} of ${candidates.length} ports — type to search.`,
          `عرض ${shown.length} من ${candidates.length} ميناء — اكتب للبحث.`
        ) : "";
        shell(body, msg("AVAILABLE SEA PORTS", "الموانئ البحرية المتاحة"), footer);
        bindOptions();
        if ((!db || state === "idle" || state === "loading") && !loadFailed) requestGlobalLoad(seq);
        return;
      }

      if (query.length < 2) {
        shown = [];
        shell(`<div class="port-empty">${msg("Type at least 2 characters to search.", "اكتب حرفين على الأقل للبحث.")}</div>`, msg("VERIFIED SEA PORT SEARCH","بحث الموانئ البحرية الموثقة"));
        return;
      }

      const db = globalDB();
      const state = dbState();

      if (!db || state === "idle" || state === "loading") {
        // Search verified Egypt fallback immediately, while the global DB loads.
        const localMatches = EGYPT_PORTS
          .filter(port => kind !== "pol" || countryCode(port) === selectedCountry)
          .map(port => ({port, score: score(port, query)}))
          .filter(item => item.score < 99)
          .sort((a,b) => a.score - b.score)
          .slice(0, 18)
          .map(item => item.port);

        shown = localMatches;
        const body = shown.length
          ? shown.map(optionHtml).join("")
          : `<div class="port-empty">${msg(
              "Preparing global sea-port search…",
              "جارٍ تجهيز البحث في الموانئ البحرية العالمية…"
            )}</div>`;

        shell(body, msg("VERIFIED SEA PORT SEARCH","بحث الموانئ البحرية الموثقة"));
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
        a.score - b.score ||
        String(a.port[2] || "").localeCompare(String(b.port[2] || "")) ||
        String(a.port[0] || "").localeCompare(String(b.port[0] || ""))
      );

      const total = matches.length;
      shown = matches.slice(0, 20).map(item => item.port);

      const body = shown.length
        ? shown.map(optionHtml).join("")
        : `<div class="port-empty">${msg(
            "No verified sea port matches this search. Check the spelling or UN/LOCODE.",
            "لا يوجد ميناء بحري موثق يطابق البحث. راجع الكتابة أو UN/LOCODE."
          )}</div>`;

      const footer = total > shown.length
        ? msg(
            `Showing ${shown.length} of ${total} matches — type more to narrow.`,
            `عرض ${shown.length} من ${total} نتيجة — اكتب أكثر لتضييق البحث.`
          )
        : "";

      shell(body, msg("VERIFIED SEA PORTS","الموانئ البحرية الموثقة"), footer);
      bindOptions();
    }

    function choose(index) {
      const port = shown[index];
      if (!port) return;
      setSelected(input, port);
      combo.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
    }

    function open() {
      combo.classList.add("open");
      input.setAttribute("aria-expanded", "true");
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

    input.addEventListener("keydown", event => {
      const options = [...list.querySelectorAll(".port-option")];

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!combo.classList.contains("open")) open();
        active = event.key === "ArrowDown"
          ? Math.min(active + 1, options.length - 1)
          : Math.max(active - 1, 0);
        options.forEach((option, index) => option.classList.toggle("active", index === active));
        options[active]?.scrollIntoView({block: "nearest"});
      } else if (event.key === "Enter" && active >= 0) {
        event.preventDefault();
        choose(active);
      } else if (event.key === "Escape") {
        combo.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("mousedown", event => {
      if (!combo.contains(event.target)) {
        combo.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
      }
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
    const displayNames = () => window.AKMaritimePorts?.getCountryNames?.() || {EG:"Egypt"};
    const countryList = () => {
      const names = displayNames();
      const entries = Object.entries(names).map(([code, name]) => ({code, name}));
      return entries.sort((a,b) => a.name.localeCompare(b.name));
    };
    const close = () => {
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
      input.select();
    });
    portInput.disabled = true;
    flag.hidden = true;
    function show() {
      const q = norm(input.value);
      const countryEntries = countryList();
      matches = countryEntries.filter(c => !q || norm(c.name).includes(q) || norm(c.code).startsWith(q)).slice(0, 35);
      list.innerHTML = matches.length ? matches.map((c,i) =>
        `<button type="button" class="origin-country-option" role="option" data-index="${i}"><img class="origin-option-flag" src="${countryFlagUrl(c.code)}" width="30" height="22" loading="lazy" decoding="async" alt=""><span>${escapeHtml(c.name)}</span></button>`
      ).join("") : `<div class="port-empty">${msg("No matching country", "لا توجد دولة مطابقة")}</div>`;
      list.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }
    function load() {
      if (pending) return pending;
      pending = ensureMaritimeDB().then(db => db.load?.()).catch(() => null).finally(() => {pending = null; if (list.classList.contains("open")) show();});
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
    list.addEventListener("mousedown", e => {
      const btn = e.target.closest("button[data-index]");
      if (!btn) return;
      e.preventDefault();
      const c = matches[Number(btn.dataset.index)];
      if (c) select(c.code,c.name);
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") {close();return;}
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!list.classList.contains("open")) show();
        highlighted = e.key === "ArrowDown" ? Math.min(highlighted + 1, matches.length - 1) : Math.max(highlighted - 1, 0);
        list.querySelectorAll("button").forEach((button,i) => button.classList.toggle("active", i === highlighted));
      }
      if (e.key === "Enter" && highlighted >= 0) {
        e.preventDefault();
        const c = matches[highlighted];
        if (c) select(c.code,c.name);
      }
    });
    document.addEventListener("mousedown", e => {if (!side.contains(e.target)) close();});
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

  initPortCombo("pol", "origin", "polPortList");
  initPortCombo("pod", "destination", "podPortList");
  initPortCombo("pol", "quickOrigin", "quickPolPortList");
  initPortCombo("pod", "quickDestination", "quickPodPortList");
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
(() => {
  "use strict";

  const doc = document.documentElement;
  const selectedByInput = new Map();
  let maritimeScriptPromise = null;

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

  function countryFlag(code) {
    const cc = String(code || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
    return String.fromCodePoint(...[...cc].map(char => 127397 + char.charCodeAt(0)));
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
      flag.textContent = countryFlag(record.countryCode);
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
    }

    if (a) setSelected(bId, a);
    else {
      clearSelection(bId, false);
      document.getElementById(bId).value = "";
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
    const featuredPorts = () => kind === "pol" ? EGYPT_PORTS.slice(0, 8) : [];

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
      active = -1;

      if (!query) {
        shown = featuredPorts();
        if (shown.length) {
          shell(
            shown.map(optionHtml).join(""),
            msg("FEATURED EGYPT SEA PORTS","موانئ مصر البحرية المميزة")
          );
          bindOptions();
        } else {
          shell(
            `<div class="port-empty">${msg(
              "Type at least 2 characters to search verified world sea ports.",
              "اكتب حرفين على الأقل للبحث في الموانئ البحرية العالمية الموثقة."
            )}<br><small>${msg(
              "Examples: Shanghai · Jebel Ali · Rotterdam · CNSHA · NLRTM",
              "أمثلة: Shanghai · Jebel Ali · Rotterdam · CNSHA · NLRTM"
            )}</small></div>`,
            msg("WORLD SEA PORTS","الموانئ البحرية العالمية")
          );
        }
        return;
      }

      if (query.length < 2) {
        shown = [];
        shell(
          `<div class="port-empty">${msg(
            "Type at least 2 characters to search.",
            "اكتب حرفين على الأقل للبحث."
          )}</div>`,
          msg("VERIFIED SEA PORT SEARCH","بحث الموانئ البحرية الموثقة")
        );
        return;
      }

      const db = globalDB();
      const state = dbState();

      if (!db || state === "idle" || state === "loading") {
        // Search verified Egypt fallback immediately, while the global DB loads.
        const localMatches = EGYPT_PORTS
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

      for (const port of source) {
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
      render();
      combo.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("focus", open);
    input.addEventListener("click", open);

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

  initPortCombo("pol", "origin", "polPortList");
  initPortCombo("pod", "destination", "podPortList");
  initPortCombo("pol", "quickOrigin", "quickPolPortList");
  initPortCombo("pod", "quickDestination", "quickPodPortList");

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
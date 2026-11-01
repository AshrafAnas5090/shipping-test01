(() => {
  "use strict";

  const doc = document.documentElement;

  const trackingForm = document.getElementById("carrierTrackingForm");
  const trackingReference = document.getElementById("trackingReference");
  const trackingCarrier = document.getElementById("trackingCarrier");
  const trackingStatus = document.getElementById("trackingStatus");
  const trackingCarrierChips = document.getElementById("trackingCarrierChips");
  const trackingOfficialLink = document.getElementById("trackingOfficialLink");
  const trackingOfficialLinkLabel = document.getElementById("trackingOfficialLinkLabel");
  const trackingIntelligence = document.getElementById("trackingIntelligence");
  const trackingOwnerCode = document.getElementById("trackingOwnerCode");
  const trackingDetectedCarrier = document.getElementById("trackingDetectedCarrier");
  const trackingDetectedLogo = document.getElementById("trackingDetectedLogo");
  const trackingConfidence = document.getElementById("trackingConfidence");
  const trackingCarrierStatus = document.getElementById("trackingCarrierStatus");
  const trackingCarrierIdle = document.getElementById("trackingCarrierIdle");
  const trackingCurrentLogo = document.getElementById("trackingCurrentLogo");
  const trackingSelectionBadge = document.getElementById("trackingSelectionBadge");
  const trackingAutoReset = document.getElementById("trackingAutoReset");

  if (!trackingForm || !trackingReference || !trackingCarrier || !trackingCarrierChips) {
    return;
  }

  let trackingDetectedCarrierId = "";
  let trackingManualCarrierId = "";
  let trackingAutoCarrierId = "";
  let trackingLastDetection = null;

  const registry = () => window.AKCarrierRegistry || null;
  const intelligence = () => window.AKTrackingIntelligence || null;
  const isArabic = () => doc.lang === "ar";
  const msg = (en, ar) => isArabic() ? ar : en;

  function setStatus(message, type = "") {
    if (!trackingStatus) return;
    trackingStatus.textContent = message || "";
    trackingStatus.className = `tracking-status${type ? ` is-${type}` : ""}`;
  }

  function confidenceLabel(level) {
    if (isArabic()) {
      return ({ high: "مرتفعة", medium: "متوسطة", low: "منخفضة", unknown: "غير معروفة" })[level] || "غير معروفة";
    }
    return ({ high: "High", medium: "Medium", low: "Low", unknown: "Unknown" })[level] || "Unknown";
  }

  function carrierSelectionState() {
    const selected = trackingCarrier.value || "auto";
    if (selected === "auto") return "none";
    if (trackingManualCarrierId) {
      return trackingDetectedCarrierId && trackingManualCarrierId !== trackingDetectedCarrierId
        ? "override"
        : "manual";
    }
    if (trackingAutoCarrierId === selected) return "auto";
    return "manual";
  }

  function selectionLabel(state) {
    if (state === "auto") return msg("AUTO", "تلقائي");
    if (state === "manual") return msg("MANUAL", "يدوي");
    if (state === "override") return msg("OVERRIDE", "تجاوز يدوي");
    return "";
  }

  function updateDynamicLanguage() {
    trackingCarrierChips.querySelectorAll("[data-carrier-id]").forEach(button => {
      const carrier = registry()?.getCarrier(button.dataset.carrierId);
      if (!carrier) return;
      button.setAttribute("aria-label", msg(`Select ${carrier.name}`, `اختر ${carrier.name}`));
    });

    const state = carrierSelectionState();
    if (trackingSelectionBadge && !trackingSelectionBadge.hidden) {
      trackingSelectionBadge.textContent = selectionLabel(state);
    }

    if (trackingConfidence && trackingLastDetection) {
      trackingConfidence.textContent = confidenceLabel(trackingLastDetection.confidence);
    }

    refreshCarrierSelection();
  }

  function renderCarrierStatus() {
    const carrier = registry()?.getCarrier(trackingCarrier.value);
    const state = carrierSelectionState();

    if (carrier) {
      if (trackingCurrentLogo) {
        trackingCurrentLogo.src = carrier.logo;
        trackingCurrentLogo.alt = carrier.name;
        trackingCurrentLogo.hidden = false;
      }
      if (trackingCarrierIdle) trackingCarrierIdle.hidden = true;
      trackingCarrierStatus?.classList.add("has-carrier");

      if (trackingSelectionBadge) {
        trackingSelectionBadge.textContent = selectionLabel(state);
        trackingSelectionBadge.className = `tracking-selection-badge is-${state}`;
        trackingSelectionBadge.hidden = false;
      }
    } else {
      if (trackingCurrentLogo) {
        trackingCurrentLogo.hidden = true;
        trackingCurrentLogo.removeAttribute("src");
        trackingCurrentLogo.alt = "";
      }
      if (trackingCarrierIdle) trackingCarrierIdle.hidden = false;
      trackingCarrierStatus?.classList.remove("has-carrier");
      if (trackingSelectionBadge) trackingSelectionBadge.hidden = true;
    }

    if (trackingAutoReset) {
      trackingAutoReset.hidden = !(state === "manual" || state === "override");
    }
  }

  function renderDetection(result) {
    const carrierRegistry = registry();

    if (!result?.reference) {
      trackingDetectedCarrierId = "";
      if (trackingIntelligence) trackingIntelligence.hidden = true;
      return;
    }

    const carrier = result.carrierId ? carrierRegistry?.getCarrier(result.carrierId) : null;
    trackingDetectedCarrierId = carrier?.id || "";

    if (trackingIntelligence) trackingIntelligence.hidden = false;
    if (trackingOwnerCode) trackingOwnerCode.textContent = result.ownerCode || "—";

    if (carrier) {
      if (trackingDetectedCarrier) trackingDetectedCarrier.textContent = "";
      if (trackingDetectedLogo) {
        trackingDetectedLogo.src = carrier.logo;
        trackingDetectedLogo.alt = carrier.name;
        trackingDetectedLogo.hidden = false;
      }
    } else {
      if (trackingDetectedCarrier) trackingDetectedCarrier.textContent = "—";
      if (trackingDetectedLogo) {
        trackingDetectedLogo.hidden = true;
        trackingDetectedLogo.removeAttribute("src");
        trackingDetectedLogo.alt = "";
      }
    }

    if (trackingConfidence) {
      trackingConfidence.textContent = confidenceLabel(result.confidence);
      trackingConfidence.className = `tracking-confidence is-${result.confidence || "unknown"}`;
    }
  }

  function populateCarrierLogos() {
    const carrierRegistry = registry();
    if (!carrierRegistry) return;

    // Rebuild deterministically in case the module is re-evaluated.
    trackingCarrier.querySelectorAll('option:not([value="auto"])').forEach(option => option.remove());
    trackingCarrierChips.replaceChildren();

    carrierRegistry.carriers.forEach(carrier => {
      const option = document.createElement("option");
      option.value = carrier.id;
      option.textContent = carrier.name;
      trackingCarrier.appendChild(option);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "tracking-logo-card";
      button.dataset.carrierId = carrier.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-label", msg(`Select ${carrier.name}`, `اختر ${carrier.name}`));
      button.title = carrier.name;
      button.innerHTML = `
        <span class="tracking-logo-frame">
          <img src="${carrier.logo}" alt="" loading="lazy" decoding="async">
        </span>
        <span class="tracking-logo-state" aria-hidden="true"></span>
      `;

      button.addEventListener("click", () => {
        trackingCarrier.value = carrier.id;
        trackingManualCarrierId = carrier.id;
        trackingAutoCarrierId = "";
        refreshCarrierSelection();

        const state = carrierSelectionState();
        if (state === "override") {
          const detected = carrierRegistry.getCarrier(trackingDetectedCarrierId);
          setStatus(
            msg(
              `${carrier.name} selected manually instead of detected ${detected?.name || "carrier"}.`,
              `تم اختيار ${carrier.name} يدويًا بدلًا من الخط المقترح ${detected?.name || ""}.`
            ),
            "info"
          );
        } else {
          setStatus(
            msg(`${carrier.name} selected manually.`, `تم اختيار ${carrier.name} يدويًا.`),
            "info"
          );
        }
      });

      trackingCarrierChips.appendChild(button);
    });
  }

  function refreshCarrierSelection() {
    const carrierRegistry = registry();
    const selectedId = trackingCarrier.value || "auto";
    const state = carrierSelectionState();

    trackingCarrierChips.querySelectorAll("[data-carrier-id]").forEach(button => {
      const id = button.dataset.carrierId;
      const selected = id === selectedId && selectedId !== "auto";
      const detected = id === trackingDetectedCarrierId;

      button.classList.toggle("is-selected", selected);
      button.classList.toggle("is-auto", selected && state === "auto");
      button.classList.toggle("is-manual", selected && state === "manual");
      button.classList.toggle("is-override", selected && state === "override");
      button.classList.toggle("is-detected", detected && !selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");

      const badge = button.querySelector(".tracking-logo-state");
      if (!badge) return;

      if (selected) {
        badge.textContent = selectionLabel(state);
      } else if (detected) {
        badge.textContent = msg("DETECTED", "مقترح");
      } else {
        badge.textContent = "";
      }
    });

    renderCarrierStatus();

    const carrier = carrierRegistry?.getCarrier(selectedId);
    if (trackingOfficialLink) {
      if (carrier) {
        trackingOfficialLink.hidden = false;
        trackingOfficialLink.href = carrier.officialUrl;
        const ref = intelligence()?.normalize(trackingReference.value) || "";
        const clipboardHandoff = carrier.handoff === "clipboard" && Boolean(ref);

        if (trackingOfficialLinkLabel) {
          trackingOfficialLinkLabel.textContent = clipboardHandoff
            ? msg(
                `Open ${carrier.name} + Copy ${ref}`,
                `فتح ${carrier.name} + نسخ ${ref}`
              )
            : msg(
                `Open ${carrier.name} official tracker`,
                `فتح التتبع الرسمي لـ ${carrier.name}`
              );
        }
      } else {
        trackingOfficialLink.hidden = true;
        trackingOfficialLink.removeAttribute("href");
        if (trackingOfficialLinkLabel) {
          trackingOfficialLinkLabel.textContent = msg(
            "Open official carrier tracker",
            "فتح نظام التتبع الرسمي"
          );
        }
      }
    }
  }

  function evaluateReference() {
    const intel = intelligence();
    const carrierRegistry = registry();
    if (!intel || !carrierRegistry) return;

    const reference = intel.normalize(trackingReference.value);

    if (!reference) {
      trackingLastDetection = null;
      trackingDetectedCarrierId = "";
      if (!trackingManualCarrierId) {
        trackingCarrier.value = "auto";
        trackingAutoCarrierId = "";
      }
      renderDetection(null);
      refreshCarrierSelection();
      setStatus("");
      return;
    }

    const result = intel.detect(reference);
    trackingLastDetection = result;
    renderDetection(result);

    // A manual carrier is never silently replaced.
    if (trackingManualCarrierId) {
      refreshCarrierSelection();
      return;
    }

    if (result.type === "container" && result.validContainer === false) {
      trackingCarrier.value = result.carrierId || "auto";
      trackingAutoCarrierId = result.carrierId || "";
      refreshCarrierSelection();
      setStatus(
        msg(
          `Container format detected, but the ISO 6346 check digit is invalid${result.ownerCode ? `. Owner code: ${result.ownerCode}` : ""}.`,
          `تم التعرف على صيغة حاوية، لكن رقم التحقق ISO 6346 غير صحيح${result.ownerCode ? `. كود المالك: ${result.ownerCode}` : ""}.`
        ),
        "error"
      );
      return;
    }

    if (result.carrierId) {
      trackingCarrier.value = result.carrierId;
      trackingAutoCarrierId = result.carrierId;
      refreshCarrierSelection();

      const carrier = carrierRegistry.getCarrier(result.carrierId);
      setStatus(
        msg(
          `Auto-detected ${carrier?.name || "carrier"}. Confidence: ${confidenceLabel(result.confidence)}.`,
          `تم اكتشاف ${carrier?.name || "خط الملاحة"} تلقائيًا. درجة الثقة: ${confidenceLabel(result.confidence)}.`
        ),
        result.confidence === "high" ? "success" : "info"
      );
      return;
    }

    trackingCarrier.value = "auto";
    trackingAutoCarrierId = "";
    refreshCarrierSelection();

    if (result.type === "container" && result.ownerCode) {
      setStatus(
        msg(
          `Valid container reference. Owner code ${result.ownerCode} is not mapped to a supported carrier. Select a shipping line manually using the logos.`,
          `مرجع الحاوية صالح. كود المالك ${result.ownerCode} غير مرتبط بخط ملاحي مدعوم. اختر الخط يدويًا من الشعارات.`
        ),
        "info"
      );
    } else {
      setStatus(
        msg(
          "Carrier could not be confirmed automatically. Select a shipping line manually using the logos.",
          "تعذر تأكيد خط الملاحة تلقائيًا. اختر الخط يدويًا من الشعارات."
        ),
        "info"
      );
    }
  }

  trackingAutoReset?.addEventListener("click", () => {
    trackingManualCarrierId = "";
    trackingAutoCarrierId = "";
    trackingCarrier.value = "auto";
    evaluateReference();
  });

  trackingReference.addEventListener("input", () => {
    const caret = trackingReference.selectionStart;
    const upper = trackingReference.value.toUpperCase();

    if (trackingReference.value !== upper) {
      trackingReference.value = upper;
      if (caret != null) trackingReference.setSelectionRange(caret, caret);
    }

    evaluateReference();
  });

  trackingReference.addEventListener("paste", () => setTimeout(evaluateReference, 0));
  trackingReference.addEventListener("change", evaluateReference);

  async function copyTrackingReference(reference) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference);
        return true;
      }
    } catch {}

    try {
      const area = document.createElement("textarea");
      area.value = reference;
      area.readOnly = true;
      area.style.position = "fixed";
      area.style.opacity = "0";
      area.style.pointerEvents = "none";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return copied;
    } catch {
      return false;
    }
  }

  trackingOfficialLink?.addEventListener("click", async event => {
    const carrierRegistry = registry();
    const carrier = carrierRegistry?.getCarrier(trackingCarrier.value);
    const ref = intelligence()?.normalize(trackingReference.value) || "";

    if (!carrier || carrier.handoff !== "clipboard" || !ref) return;

    const copied = await copyTrackingReference(ref);
    if (copied) {
      setStatus(
        msg(
          `${ref} copied. Paste it into ${carrier.name}'s shipment search field.`,
          `تم نسخ ${ref}. الصقه في خانة البحث داخل ${carrier.name}.`
        ),
        "success"
      );
    }
  });

  trackingForm.addEventListener("submit", async event => {
    event.preventDefault();

    const carrierRegistry = registry();
    const intel = intelligence();
    if (!carrierRegistry || !intel) return;

    const reference = intel.normalize(trackingReference.value);

    if (!reference) {
      setStatus(msg("Enter a shipment reference first.", "أدخل رقم الشحنة أولًا."), "error");
      trackingReference.focus();
      return;
    }

    const result = intel.detect(reference);

    if (result.type === "container" && result.validContainer === false) {
      setStatus(
        msg(
          "The ISO 6346 check digit is invalid. Verify the container number before tracking.",
          "رقم التحقق ISO 6346 غير صحيح. راجع رقم الحاوية قبل التتبع."
        ),
        "error"
      );
      trackingReference.focus();
      return;
    }

    const carrier = carrierRegistry.getCarrier(trackingCarrier.value);

    if (!carrier) {
      setStatus(
        msg(
          "Carrier is not confirmed. Select a shipping line manually using a logo.",
          "خط الملاحة غير مؤكد. اختر خط الملاحة يدويًا من أحد الشعارات."
        ),
        "error"
      );
      return;
    }

    const targetUrl = carrierRegistry.getTrackingUrl(carrier, reference, result.type);
    const directTransfer = Boolean(carrier.prefill && targetUrl !== carrier.officialUrl);

    let popup = null;
    let copied = false;
    let copyPromise = null;

    // Start clipboard work while the click still has user activation.
    // Do not wait before opening the official tracker, otherwise browsers
    // may block the new tab.
    if (!directTransfer) {
      copyPromise = copyTrackingReference(reference);
    }

    try {
      popup = window.open(targetUrl, "_blank");
      if (popup) {
        try { popup.opener = null; } catch {}
      }
    } catch {}

    if (copyPromise) {
      copied = await copyPromise;
    }

    if (!popup) {
      setStatus(
        msg(
          "Your browser blocked the new tab. Use the official carrier link below.",
          "المتصفح منع فتح التبويب الجديد. استخدم رابط التتبع الرسمي بالأسفل."
        ),
        "error"
      );

      if (trackingOfficialLink) {
        trackingOfficialLink.hidden = false;
        trackingOfficialLink.href = targetUrl;
      }
      return;
    }

    if (directTransfer) {
      setStatus(
        msg(
          `Opened ${carrier.name} with ${reference} transferred automatically.`,
          `تم فتح ${carrier.name} وتم تمرير الرقم ${reference} تلقائيًا.`
        ),
        "success"
      );
    } else if (copied) {
      setStatus(
        carrier.pasteRequired
          ? msg(
              `${carrier.name} opened. ${reference} is copied — paste it into the "Search by Container Number, Shipment Ref or My Ref" field, then press Search.`,
              `تم فتح ${carrier.name}. تم نسخ ${reference} — الصقه في خانة البحث الخاصة برقم الحاوية أو Shipment Ref ثم اضغط Search.`
            )
          : msg(
              `Opened ${carrier.name}. ${reference} was copied — paste it into the official tracker.`,
              `تم فتح ${carrier.name}. تم نسخ الرقم ${reference} — الصقه داخل نظام التتبع الرسمي.`
            ),
        "success"
      );
    } else {
      setStatus(
        msg(
          `Opened ${carrier.name}. Enter ${reference} in the official tracker.`,
          `تم فتح ${carrier.name}. أدخل الرقم ${reference} داخل نظام التتبع الرسمي.`
        ),
        "success"
      );
    }
  });

  document.addEventListener("ak:languagechange", updateDynamicLanguage);

  populateCarrierLogos();
  refreshCarrierSelection();
})();
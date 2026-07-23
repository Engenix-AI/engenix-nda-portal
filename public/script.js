(function () {
  "use strict";

  const scriptUrl = document.currentScript && document.currentScript.src;
  const root = scriptUrl ? new URL(".", scriptUrl).pathname : "/";
  const route = (slug) => slug ? `${root}${slug}/` : root;
  const themeStorageKey = "engenix-theme";
  const normalizeTheme = (value) => value === "signal" || value === "light" ? "signal" : "obsidian";
  const applyTheme = (value, persist) => {
    const theme = normalizeTheme(value);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "signal" ? "light" : "dark";
    const themeColor = document.querySelector("#theme-color-meta");
    if (themeColor) themeColor.content = theme === "signal" ? "#f1f2ee" : "#090b0c";
    if (persist) {
      try { localStorage.setItem(themeStorageKey, theme === "signal" ? "light" : "dark"); } catch {}
    }
    return theme;
  };
  applyTheme(document.documentElement.dataset.theme, false);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const allowBodyScrollLock = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!reducedMotion) document.documentElement.classList.add("motion-ready");
  const navItems = [
    ["platform", "Platform"],
    ["intelligence-layers", "Intelligence Layers"],
    ["guided-experience", "Guided Experience"],
    ["security", "Security"],
    ["company", "Company"],
  ];

  const brandLogo = `<span class="brand-logo"><img class="brand-logo__image" src="${root}assets/engenix-logo.png?v=12.3" alt="ENGENIX" width="577" height="433"></span>`;
  const arrow = '<span class="arrow" aria-hidden="true"></span>';
  const currentSlug = navItems.find(([slug]) => location.pathname.includes(`/${slug}/`))?.[0] ||
    (location.pathname.includes("/founding-dealerships/") ? "founding-dealerships" : "");

  const headerTarget = document.querySelector("[data-site-header]");
  const footerTarget = document.querySelector("[data-site-footer]");
  const drawerTarget = document.querySelector("[data-site-drawer]");

  const loader = document.querySelector("#site-loader");
  const loaderStatus = document.querySelector("#loader-status");
  const loaderThemeButtons = Array.from(document.querySelectorAll("[data-loader-theme]"));
  const syncLoaderTheme = () => {
    const current = normalizeTheme(document.documentElement.dataset.theme);
    loaderThemeButtons.forEach((button) => {
      const selected = button.dataset.loaderTheme === current;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  };
  syncLoaderTheme();
  loaderThemeButtons.forEach((button) => button.addEventListener("click", () => {
    applyTheme(button.dataset.loaderTheme, true);
    syncLoaderTheme();
    updateThemeLabel();
  }));

  if (loader) {
    document.body.classList.add("loader-active");
    const releaseLoader = () => {
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      document.body.classList.remove("loader-active");
      loader.remove();
    };
    if (!reducedMotion && loaderStatus) {
      window.setTimeout(() => { loaderStatus.textContent = "Calibrating operating view"; }, 480);
      window.setTimeout(() => { loaderStatus.textContent = "Entry authorized"; }, 950);
    }
    window.setTimeout(releaseLoader, reducedMotion ? 280 : 1300);
    loader.addEventListener("animationend", (event) => {
      if (event.animationName === "loader-failsafe") releaseLoader();
    }, { once: true });
  }

  if (headerTarget) {
    headerTarget.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to main content</a>
      <header class="site-header">
        <nav class="nav-shell" aria-label="Primary navigation">
          <a class="brand-link" href="${route("")}" aria-label="ENGENIX home">${brandLogo}<span>Launch Edition</span></a>
          <div class="desktop-nav">
            ${navItems.map(([slug, label]) => `<a href="${route(slug)}"${currentSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </div>
          <div class="nav-actions">
            <button class="theme-toggle" type="button" aria-label="Switch website theme" aria-pressed="false" data-theme-current="obsidian">
              <span class="theme-toggle-icons" aria-hidden="true">
                <svg class="theme-toggle-icon theme-toggle-icon--moon" viewBox="0 0 24 24"><path d="M20 15.2A8.35 8.35 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z"></path></svg>
                <svg class="theme-toggle-icon theme-toggle-icon--sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.6"></circle><path d="M12 2.3v2.1M12 19.6v2.1M2.3 12h2.1M19.6 12h2.1M5.15 5.15l1.5 1.5M17.35 17.35l1.5 1.5M18.85 5.15l-1.5 1.5M6.65 17.35l-1.5 1.5"></path></svg>
              </span>
            </button>
            <a class="button button--gold nav-founding" href="${route("founding-dealerships")}">Founding Dealerships</a>
            <button class="menu-button" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
          </div>
        </nav>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true" hidden>
        <div class="mobile-menu__inner">
          <p class="eyebrow">Operating Intelligence</p>
          ${navItems.map(([slug, label], index) => `<a ${index === 0 ? 'data-first-menu-link ' : ""}href="${route(slug)}"${currentSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a href="${route("founding-dealerships")}"${currentSlug === "founding-dealerships" ? ' aria-current="page"' : ""}>Founding Dealerships</a>
          <button class="button button--gold" type="button" data-open-briefing>Request a Founding Briefing</button>
        </div>
      </div>`;
  }

  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div>${brandLogo}<p>Operating Intelligence for Automotive Retail</p></div>
        <div class="footer-statement"><p>Dealership software records what happened.</p><p>ENGENIX helps change what happens next.</p></div>
        <div class="footer-links">${navItems.map(([slug, label]) => `<a href="${route(slug)}">${label}</a>`).join("")}<a href="${route("founding-dealerships")}">Founding Dealerships</a></div>
        <div class="footer-meta"><span>ENGEN LLC d/b/a ENGENIX</span><a href="mailto:nicholas@engenix.co">nicholas@engenix.co</a><span>© ${new Date().getFullYear()} ENGENIX</span></div>
      </footer>`;
  }

  if (drawerTarget) {
    drawerTarget.innerHTML = `
      <div class="drawer-backdrop" aria-hidden="true" hidden>
        <aside class="briefing-drawer" id="briefing-drawer" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
          <button class="drawer-close" type="button" aria-label="Close briefing request"><span></span><span></span></button>
          <div class="briefing-drawer__intro"><p class="eyebrow">Founding Dealership Network</p><h2 id="briefing-title">Request a private operating briefing.</h2><p>For dealership principals, ownership groups, and operating leaders evaluating the first ENGENIX layer and the system entering controlled deployment.</p></div>
          <form class="briefing-form" action="https://script.google.com/macros/s/AKfycbyYggK-MIIaSpGqwAdh4YXuZ5DCKCQMGw6T7V-TeAME5vJKQf51qSiVA8ugah3QdsWl/exec" method="post" target="engenix-briefing-response">
            <label>Name<input name="name" type="text" autocomplete="name" required></label>
            <label>Role<input name="role" type="text" autocomplete="organization-title" placeholder="Dealer principal, GM, controller…" required></label>
            <label>Dealership or group<input name="company" type="text" autocomplete="organization" required></label>
            <label>Work email<input name="email" type="email" autocomplete="email" required></label>
            <label>Phone <span class="field-optional">Optional</span><input name="phone" type="tel" autocomplete="tel"></label>
            <label>Rooftops <span class="field-optional">Optional</span><select name="rooftops"><option value="">Select</option><option value="1">1 rooftop</option><option value="2–4">2–4 rooftops</option><option value="5–9">5–9 rooftops</option><option value="10–24">10–24 rooftops</option><option value="25+">25+ rooftops</option></select></label>
            <label>Monthly retail volume <span class="field-optional">Optional</span><select name="monthlyVolume"><option value="">Select</option><option value="Under 75">Under 75</option><option value="75–149">75–149</option><option value="150–299">150–299</option><option value="300–599">300–599</option><option value="600+">600+</option></select></label>
            <label>DMS <span class="field-optional">Optional</span><input name="dms" type="text" autocomplete="off"></label>
            <label class="briefing-form__wide">What would you like to address?<textarea name="challenge" rows="4" required placeholder="For example: deal-jacket review, funding readiness, controller reconciliation, or multi-rooftop visibility."></textarea></label>
            <input class="form-honeypot" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
            <input name="source" type="hidden" value="ENGENIX website">
            <input name="page" type="hidden" value="">
            <input name="userAgent" type="hidden" value="">
            <button class="button button--gold button--full" type="submit"><span data-form-submit-label>Request a Founding Briefing</span> ${arrow}</button>
            <p class="form-note">Your request is sent securely to ENGENIX leadership. We use it only to follow up on your briefing request.</p>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>
          <iframe class="form-response-frame" name="engenix-briefing-response" title="Briefing request response" tabindex="-1"></iframe>
        </aside>
      </div>`;
  }

  const briefingDock = document.createElement("button");
  briefingDock.className = "briefing-dock";
  briefingDock.type = "button";
  briefingDock.setAttribute("data-open-briefing", "");
  briefingDock.setAttribute("aria-controls", "briefing-drawer");
  briefingDock.setAttribute("aria-expanded", "false");
  briefingDock.innerHTML = `
    <span class="briefing-dock__signal" aria-hidden="true"></span>
    <span class="briefing-dock__copy">
      <small>Founding Dealerships</small>
      <strong>Request a briefing</strong>
    </span>
    <span class="briefing-dock__arrow" aria-hidden="true"></span>`;
  document.body.append(briefingDock);

  const themeButton = document.querySelector(".theme-toggle");
  const updateThemeLabel = () => {
    if (!themeButton) return;
    const current = normalizeTheme(document.documentElement.dataset.theme);
    const nextLabel = current === "obsidian" ? "Signal White" : "Obsidian";
    themeButton.setAttribute("aria-label", `Switch to ${nextLabel} website theme`);
    themeButton.setAttribute("aria-pressed", current === "signal" ? "true" : "false");
    themeButton.setAttribute("data-theme-current", current);
    themeButton.setAttribute("title", `Switch to ${nextLabel}`);
  };
  updateThemeLabel();
  themeButton?.addEventListener("click", () => {
    const current = normalizeTheme(document.documentElement.dataset.theme);
    const next = current === "obsidian" ? "signal" : "obsidian";
    applyTheme(next, true);
    syncLoaderTheme();
    updateThemeLabel();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== themeStorageKey || !event.newValue) return;
    applyTheme(event.newValue, false);
    syncLoaderTheme();
    updateThemeLabel();
  });

  const menu = document.querySelector(".mobile-menu");
  const menuButton = document.querySelector(".menu-button");
  const firstMenuLink = document.querySelector("[data-first-menu-link]");
  const closeMenu = (returnFocus) => {
    menu?.classList.remove("is-open");
    menu?.setAttribute("aria-hidden", "true");
    if (menu) {
      menu.hidden = true;
      menu.inert = true;
    }
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-locked");
    if (returnFocus) menuButton?.focus();
  };
  menuButton?.addEventListener("click", () => {
    const willOpen = !menu?.classList.contains("is-open");
    if (!willOpen) return closeMenu(false);
    if (menu) {
      menu.hidden = false;
      menu.inert = false;
    }
    menu?.classList.add("is-open");
    menu?.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation menu");
    if (allowBodyScrollLock) document.body.classList.add("menu-locked");
    firstMenuLink?.focus();
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));

  const backdrop = document.querySelector(".drawer-backdrop");
  const drawer = document.querySelector(".briefing-drawer");
  const closeDrawerButton = document.querySelector(".drawer-close");
  const briefingTriggers = Array.from(document.querySelectorAll("[data-open-briefing]"));
  let lastTrigger = null;
  const setBriefingExpanded = (expanded) => {
    briefingTriggers.forEach((trigger) => {
      if (trigger.hasAttribute("aria-controls")) trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  };
  const openDrawer = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    closeMenu(false);
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.inert = false;
    }
    backdrop?.classList.add("is-open");
    backdrop?.setAttribute("aria-hidden", "false");
    if (allowBodyScrollLock) document.body.classList.add("drawer-locked");
    setBriefingExpanded(true);
    closeDrawerButton?.focus();
  };
  const closeDrawer = () => {
    backdrop?.classList.remove("is-open");
    backdrop?.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.inert = true;
    }
    document.body.classList.remove("drawer-locked");
    setBriefingExpanded(false);
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  };

  /* Prevent Safari back-forward cache from restoring an invisible scroll lock. */
  window.addEventListener("pagehide", () => {
    if (menu) {
      menu.hidden = true;
      menu.inert = true;
    }
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.inert = true;
    }
    document.body.classList.remove("menu-locked", "drawer-locked", "loader-active");
  });
  window.addEventListener("pageshow", (event) => {
    closeMenu(false);
    backdrop?.classList.remove("is-open");
    backdrop?.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.inert = true;
    }
    document.body.classList.remove("menu-locked", "drawer-locked", "loader-active");
    if (event.persisted) loader?.remove();
    setBriefingExpanded(false);
  });

  briefingTriggers.forEach((button) => button.addEventListener("click", () => openDrawer(button)));
  closeDrawerButton?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("mousedown", (event) => { if (event.target === backdrop) closeDrawer(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (backdrop?.classList.contains("is-open")) closeDrawer();
      else if (menu?.classList.contains("is-open")) closeMenu(true);
    }
    if (event.key === "Tab" && backdrop?.classList.contains("is-open") && drawer) {
      const focusable = Array.from(drawer.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });

  const form = document.querySelector(".briefing-form");
  const formStatus = form?.querySelector(".form-status");
  const formSubmitLabel = form?.querySelector("[data-form-submit-label]");
  const formSubmitButton = form?.querySelector('button[type="submit"]');
  let briefingResponseTimer = null;
  const setFormStatus = (state, message) => {
    if (!form) return;
    form.dataset.state = state;
    if (formStatus) formStatus.textContent = message;
    if (formSubmitButton) formSubmitButton.disabled = state === "submitting" || state === "submitted";
    if (formSubmitLabel) formSubmitLabel.textContent = state === "submitting" ? "Sending request" : state === "submitted" ? "Briefing request received" : "Request a Founding Briefing";
  };
  form?.addEventListener("submit", () => {
    window.clearTimeout(briefingResponseTimer);
    const pageField = form.elements.namedItem("page");
    const userAgentField = form.elements.namedItem("userAgent");
    if (pageField) pageField.value = window.location.href;
    if (userAgentField) userAgentField.value = navigator.userAgent;
    setFormStatus("submitting", "Sending your private briefing request…");
    briefingResponseTimer = window.setTimeout(() => {
      if (form?.dataset.state === "submitting") {
        setFormStatus("processing", "Your request is still being processed. Please check your inbox shortly for ENGENIX confirmation.");
        if (formSubmitButton) formSubmitButton.disabled = false;
      }
    }, 12000);
  });
  window.addEventListener("message", (event) => {
    if (!/^https:\/\/(?:[a-z0-9-]+\.)?googleusercontent\.com$/i.test(event.origin)) return;
    const payload = event.data;
    if (!payload || payload.source !== "engenix-google-form" || !form || !["submitting", "processing"].includes(form.dataset.state)) return;
    window.clearTimeout(briefingResponseTimer);
    if (payload.ok) {
      setFormStatus("submitted", "Request received. ENGENIX leadership will follow up shortly.");
      form.reset();
    } else {
      setFormStatus("error", payload.error || "We could not send the request. Please review the form and try again.");
      formSubmitButton?.focus();
    }
  });

  const sequence = document.querySelector("[data-hero-sequence]");
  if (sequence) {
    const stages = [
      ["Structure", "Desking Intelligence", "Strongest pathway identified", "Customer objective, trade position, lender pathway, and approved economics remain connected.", "Sales leadership", "Preparing for controlled deployment"],
      ["Sell", "F&I Intelligence", "Ownership strategy prepared", "The approved structure remains visible as the transaction moves into F&I.", "F&I leadership", "Preparing for controlled deployment"],
      ["Verify", "Compliance Intelligence", "Disclosure review required", "A material difference between the approval record and final transaction is surfaced for dealership review.", "Compliance leadership", "Operational today"],
      ["Fund", "Funding Assurance", "Funding condition visible", "Packet consistency, required items, and the accountable next move stay in view.", "Funding owner", "In active development"],
      ["Reconcile", "Controller Intelligence", "Gross variance surfaced", "Expected, booked, and realized transaction values remain connected.", "Controller", "In active development"],
      ["Close", "Operating Command", "Next action assigned", "Leadership sees the unresolved blocker, accountable owner, and preserved decision history.", "Executive leadership", "In active development"],
    ];
    let active = 0;
    const renderStage = (index) => {
      active = index;
      const [label, layer, outcome, detail, owner, status] = stages[index];
      sequence.querySelector("[data-stage-layer]").textContent = layer;
      sequence.querySelector("[data-stage-status]").textContent = status;
      sequence.querySelector("[data-stage-outcome]").textContent = outcome;
      sequence.querySelector("[data-stage-detail]").textContent = detail;
      sequence.querySelector("[data-stage-owner]").textContent = owner;
      sequence.querySelectorAll("[data-stage-button]").forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", selected ? "true" : "false");
      });
      sequence.setAttribute("data-active-stage", label.toLowerCase());
    };
    const rail = sequence.querySelector(".operating-film__rail");
    rail.innerHTML = stages.map((stage, index) => `<button type="button" role="tab" data-stage-button aria-selected="${index === 0}"><span>${String(index + 1).padStart(2, "0")}</span>${stage[0]}</button>`).join("");
    rail.querySelectorAll("[data-stage-button]").forEach((button, index) => button.addEventListener("click", () => renderStage(index)));
    renderStage(0);
    if (!reducedMotion) {
      window.setInterval(() => renderStage((active + 1) % stages.length), 3400);
    }
  }

  const revealItems = Array.from(document.querySelectorAll(".reveal-on-scroll"));
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const alertSimulator = document.querySelector("[data-alert-simulator]");
  if (alertSimulator) {
    const alertCard = alertSimulator.querySelector("[data-simulator-alert]");
    const resolvedPanel = alertSimulator.querySelector("[data-simulator-resolved]");
    const resolveButton = alertSimulator.querySelector("[data-resolve-alert]");
    const replayButton = alertSimulator.querySelector("[data-replay-alert]");
    let focusTimer = null;

    const setSimulatorState = (resolved, moveFocus) => {
      window.clearTimeout(focusTimer);
      alertSimulator.classList.toggle("is-resolved", resolved);
      alertCard?.setAttribute("aria-hidden", resolved ? "true" : "false");
      resolvedPanel?.setAttribute("aria-hidden", resolved ? "false" : "true");
      if (alertCard) alertCard.inert = resolved;
      if (resolvedPanel) resolvedPanel.inert = !resolved;
      if (!moveFocus) return;
      focusTimer = window.setTimeout(() => {
        if (resolved) replayButton?.focus();
        else resolveButton?.focus();
      }, reducedMotion ? 0 : 520);
    };

    resolveButton?.addEventListener("click", () => setSimulatorState(true, true));
    replayButton?.addEventListener("click", () => setSimulatorState(false, true));
  }
})();

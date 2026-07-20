(function () {
  "use strict";

  const scriptUrl = document.currentScript && document.currentScript.src;
  const root = scriptUrl ? new URL(".", scriptUrl).pathname : "/";
  const route = (slug) => slug ? `${root}${slug}/` : `${root}launch.html`;
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
  const navItems = [
    ["platform", "Platform"],
    ["intelligence-layers", "Intelligence Layers"],
    ["guided-experience", "Guided Experience"],
    ["security", "Security"],
    ["company", "Company"],
  ];

  const brandLogo = `<span class="brand-logo"><img class="brand-logo__image" src="${root}assets/engenix-logo.png?v=6" alt="ENGENIX" width="577" height="433"></span>`;
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
  }));

  if (loader) {
    document.body.classList.add("loader-active");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion && loaderStatus) {
      window.setTimeout(() => { loaderStatus.textContent = "Calibrating operating view"; }, 850);
      window.setTimeout(() => { loaderStatus.textContent = "Entry authorized"; }, 1650);
    }
    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      document.body.classList.remove("loader-active");
    }, reducedMotion ? 450 : 2350);
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
            <button class="theme-toggle" type="button" aria-label="Switch website theme"><span class="theme-toggle__track" aria-hidden="true"><span class="theme-toggle__dot"></span></span></button>
            <a class="button button--gold nav-founding" href="${route("founding-dealerships")}">Founding Dealerships</a>
            <button class="menu-button" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
          </div>
        </nav>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
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
      <div class="drawer-backdrop" aria-hidden="true">
        <aside class="briefing-drawer" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
          <button class="drawer-close" type="button" aria-label="Close briefing request"><span></span><span></span></button>
          <div class="briefing-drawer__intro"><p class="eyebrow">Founding Dealership Network</p><h2 id="briefing-title">Request a private operating briefing.</h2><p>For dealership principals, ownership groups, and operating leaders evaluating the first ENGENIX layer and the system entering controlled deployment.</p></div>
          <form class="briefing-form">
            <label>Name<input name="name" type="text" autocomplete="name" required></label>
            <label>Title<input name="title" type="text" autocomplete="organization-title" required></label>
            <label>Dealership or group<input name="organization" type="text" autocomplete="organization" required></label>
            <label>Work email<input name="email" type="email" autocomplete="email" required></label>
            <label>Rooftops<select name="rooftops"><option value="">Select</option><option value="1">1 rooftop</option><option value="2-5">2–5 rooftops</option><option value="6-20">6–20 rooftops</option><option value="21+">21+ rooftops</option></select></label>
            <label>Current priority<select name="priority"><option>Compliance review</option><option>Deal workflow visibility</option><option>Funding readiness</option><option>Controller reconciliation</option><option>Multi-rooftop operating visibility</option></select></label>
            <button class="button button--gold button--full" type="submit">Prepare briefing request ${arrow}</button>
            <p class="form-note">This prepares an email request for ENGENIX leadership. No information is sent until you approve it in your email application.</p>
          </form>
        </aside>
      </div>`;
  }

  const themeButton = document.querySelector(".theme-toggle");
  const updateThemeLabel = () => {
    if (!themeButton) return;
    const current = normalizeTheme(document.documentElement.dataset.theme);
    themeButton.setAttribute("aria-label", `Switch to ${current === "obsidian" ? "Signal White" : "Obsidian"} theme`);
    themeButton.setAttribute("aria-pressed", current === "signal" ? "true" : "false");
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
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-locked");
    if (returnFocus) menuButton?.focus();
  };
  menuButton?.addEventListener("click", () => {
    const willOpen = !menu?.classList.contains("is-open");
    if (!willOpen) return closeMenu(false);
    menu?.classList.add("is-open");
    menu?.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-locked");
    firstMenuLink?.focus();
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));

  const backdrop = document.querySelector(".drawer-backdrop");
  const drawer = document.querySelector(".briefing-drawer");
  const closeDrawerButton = document.querySelector(".drawer-close");
  let lastTrigger = null;
  const openDrawer = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    closeMenu(false);
    backdrop?.classList.add("is-open");
    backdrop?.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-locked");
    closeDrawerButton?.focus();
  };
  const closeDrawer = () => {
    backdrop?.classList.remove("is-open");
    backdrop?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-locked");
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  };
  document.querySelectorAll("[data-open-briefing]").forEach((button) => button.addEventListener("click", () => openDrawer(button)));
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
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent("ENGENIX Founding Briefing Request");
    const body = encodeURIComponent([
      `Name: ${data.get("name") || ""}`,
      `Title: ${data.get("title") || ""}`,
      `Dealership / Group: ${data.get("organization") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Rooftops: ${data.get("rooftops") || ""}`,
      `Priority: ${data.get("priority") || ""}`,
    ].join("\n"));
    location.href = `mailto:nicholas@engenix.co?subject=${subject}&body=${body}`;
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
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.setInterval(() => renderStage((active + 1) % stages.length), 3400);
    }
  }
})();

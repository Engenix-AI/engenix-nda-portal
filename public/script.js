(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ---------------------------------------------------------------------------
  // Display theme: saved choice > device preference > dark fallback
  // ---------------------------------------------------------------------------
  (() => {
    const STORAGE_KEY = 'engenix-theme';
    const root = document.documentElement;
    const systemQuery = window.matchMedia('(prefers-color-scheme: light)');
    const themeColor = qs('#theme-color-meta');

    const readSaved = () => {
      try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
      } catch (_) {
        return null;
      }
    };

    const save = theme => {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch (_) {
        // Private browsing or storage restrictions should never block the theme.
      }
    };

    const updateControls = theme => {
      qsa('[data-theme-toggle]').forEach(button => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        const label = qs('[data-theme-toggle-label]', button);
        button.dataset.themeCurrent = theme;
        button.setAttribute('aria-pressed', String(theme === 'light'));
        button.setAttribute('aria-label', `Switch to ${nextTheme} website theme`);
        button.title = `Switch to ${nextTheme === 'light' ? 'Signal White' : 'Obsidian'}`;
        if (label) label.textContent = theme === 'light' ? 'SIGNAL WHITE' : 'OBSIDIAN';
      });

      qsa('[data-loader-theme]').forEach(button => {
        const active = button.dataset.loaderTheme === theme;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    const apply = (theme, { persist = false } = {}) => {
      const resolved = theme === 'light' ? 'light' : 'dark';
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
      if (themeColor) themeColor.content = resolved === 'light' ? '#f3f6fc' : '#05070b';
      if (persist) save(resolved);
      updateControls(resolved);
      window.dispatchEvent(new CustomEvent('engenix:themechange', {
        detail: { theme: resolved }
      }));
    };

    const initial = readSaved() || (systemQuery.matches ? 'light' : 'dark');
    apply(initial);

    qsa('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        apply(root.dataset.theme === 'light' ? 'dark' : 'light', { persist: true });
      });
    });

    qsa('[data-loader-theme]').forEach(button => {
      button.addEventListener('click', () => {
        apply(button.dataset.loaderTheme, { persist: true });
      });
    });

    const followSystem = event => {
      if (readSaved()) return;
      apply(event.matches ? 'light' : 'dark');
    };

    if (typeof systemQuery.addEventListener === 'function') {
      systemQuery.addEventListener('change', followSystem);
    } else if (typeof systemQuery.addListener === 'function') {
      systemQuery.addListener(followSystem);
    }
  })();

  // ---------------------------------------------------------------------------
  // Loader
  // ---------------------------------------------------------------------------
  (() => {
    const loader = qs('#site-loader');
    if (!loader) {
      document.body.classList.remove('loader-active');
      return;
    }

    const status = qs('#loader-status');
    const messages = [
      'Establishing secure session',
      'Authenticating operator access',
      'Risk engine online',
      'Entry authorized'
    ];
    const duration = reducedMotion ? 250 : 3900;
    const messageStep = reducedMotion ? 50 : 760;
    let closed = false;

    messages.forEach((message, index) => {
      window.setTimeout(() => {
        if (!status || closed) return;
        status.classList.remove('status-in');
        window.requestAnimationFrame(() => {
          status.textContent = message;
          status.classList.add('status-in');
        });
      }, index * messageStep);
    });

    const closeLoader = () => {
      if (closed) return;
      closed = true;
      loader.classList.add('is-ready');
      window.setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.classList.remove('loader-active');
      }, reducedMotion ? 0 : 360);
      window.setTimeout(() => loader.remove(), reducedMotion ? 25 : 1380);
    };

    window.setTimeout(closeLoader, duration);
    window.setTimeout(closeLoader, 7000);
    window.addEventListener('pageshow', event => {
      if (event.persisted) closeLoader();
    });
  })();

  // ---------------------------------------------------------------------------
  // Header and navigation: exactly one controller
  // ---------------------------------------------------------------------------
  (() => {
    const header = qs('.site-header');
    const toggle = qs('.nav-toggle');
    const links = qsa('.nav-links a');
    if (!header) return;

    const closeMenu = () => {
      header.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      toggle?.setAttribute('aria-expanded', 'false');
    };

    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    toggle?.addEventListener('click', event => {
      event.preventDefault();
      const open = !header.classList.contains('menu-open');
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1180) closeMenu();
    }, { passive: true });
  })();

  // ---------------------------------------------------------------------------
  // Copyright year and delayed reveal timing
  // ---------------------------------------------------------------------------
  const year = qs('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  qsa('[data-delay]').forEach(element => {
    element.style.setProperty('--delay', `${element.dataset.delay}ms`);
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    qsa('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    qsa('.reveal').forEach(element => element.classList.add('visible'));
  }

  // ---------------------------------------------------------------------------
  // Private access drawer
  // ---------------------------------------------------------------------------
  (() => {
    const trigger = qs('#private-access-trigger');
    const panel = qs('#private-access-panel');
    const backdrop = qs('#private-access-backdrop');
    const close = qs('#private-access-close');
    if (!trigger || !panel || !backdrop || !close) return;

    const openPanel = () => {
      backdrop.hidden = false;
      window.requestAnimationFrame(() => {
        backdrop.classList.add('is-open');
        panel.classList.add('is-open');
      });
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('private-access-open');
      window.setTimeout(() => qs('input, select, textarea', panel)?.focus(), 350);
    };

    const closePanel = () => {
      backdrop.classList.remove('is-open');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('private-access-open');
      window.setTimeout(() => { backdrop.hidden = true; }, 380);
    };

    trigger.addEventListener('click', openPanel);
    close.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);
    qsa('[data-open-private-access]').forEach(button => button.addEventListener('click', openPanel));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });
  })();

  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------
  (() => {
    const forms = [qs('#quick-demo-form'), qs('#demo-request-form')].filter(Boolean);
    if (!forms.length) return;

    forms.forEach(form => {
      form.action = '/api/demo';
      form.method = 'POST';
      form.removeAttribute('target');

      const status = qs('.quick-form-status, .form-status', form);
      const button = qs('button[type="submit"]', form);
      const label = qs('span', button || form);
      const defaultLabel = label?.textContent || 'Become a Founding Dealership';

      const setStatus = (message, type = '') => {
        if (!status) return;
        const base = status.classList.contains('quick-form-status') ? 'quick-form-status' : 'form-status';
        status.className = `${base}${type ? ` ${type}` : ''}`;
        status.textContent = message;
      };

      form.addEventListener('submit', async event => {
        event.preventDefault();
        setStatus('');
        if (!form.reportValidity()) return;

        if (button) button.disabled = true;
        if (label) label.textContent = 'Sending securely…';
        setStatus('Securely submitting your founding dealership request…');

        try {
          const payload = Object.fromEntries(new FormData(form).entries());
          payload.page = window.location.href;
          payload.userAgent = navigator.userAgent;
          payload.submittedAtClient = new Date().toISOString();

          const response = await fetch('/api/demo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.ok) {
            throw new Error(result.error || 'We could not deliver your request.');
          }

          form.reset();
          setStatus(
            'Founding status received. A member of the ENGENIX leadership team will contact you shortly.',
            'success'
          );
          if (label) label.textContent = 'Founding Request Received';
          window.setTimeout(() => {
            if (label) label.textContent = defaultLabel;
          }, 6500);
        } catch (error) {
          setStatus(
            `${error.message || 'Unable to send request.'} Email demo@engenix.co if the issue continues.`,
            'error'
          );
          if (label) label.textContent = defaultLabel;
        } finally {
          if (button) button.disabled = false;
        }
      });
    });
  })();

  // ---------------------------------------------------------------------------
  // Risk simulator
  // ---------------------------------------------------------------------------
  (() => {
    const docs = qs('#sim-docs');
    const signatures = qs('#sim-signatures');
    const review = qs('#sim-review');
    if (!docs || !signatures || !review) return;

    const update = () => {
      const docsValue = Number(docs.value);
      const signaturesValue = Number(signatures.value);
      const reviewValue = Number(review.value);
      const quality = docsValue * 0.42 + signaturesValue * 0.31 + reviewValue * 0.27;
      const risk = Math.max(4, Math.round(100 - quality));

      const setText = (selector, value) => {
        const element = qs(selector);
        if (element) element.textContent = value;
      };

      setText('#sim-docs-value', `${docsValue}%`);
      setText('#sim-signatures-value', `${signaturesValue}%`);
      setText('#sim-review-value', `${reviewValue}%`);
      setText('#risk-score', String(risk));
      setText('#sim-ready', `${Math.max(30, Math.round(quality - 4))}%`);
      setText('#sim-critical', String(Math.max(0, Math.round((risk - 18) / 11))));
      setText('#sim-moderate', String(Math.max(1, Math.round(risk / 7))));

      let riskLabel = 'Low';
      let dialColor = 'var(--success)';
      if (risk >= 25) { riskLabel = 'Moderate'; dialColor = 'var(--gold)'; }
      if (risk >= 48) { riskLabel = 'High'; dialColor = 'var(--danger)'; }
      setText('#risk-label', riskLabel);

      const dial = qs('#risk-dial');
      if (dial) {
        dial.style.setProperty('--risk', String(risk));
        const lightTheme = document.documentElement.dataset.theme === 'light';
        const dialCenter = lightTheme ? '#ffffff' : '#090c12';
        const dialTrack = lightTheme ? 'rgba(31,48,73,.12)' : 'rgba(255,255,255,.07)';
        dial.style.background = `radial-gradient(circle at center, ${dialCenter} 57%, transparent 58%), conic-gradient(${dialColor} ${risk}%, ${dialTrack} 0)`;
      }
    };

    [docs, signatures, review].forEach(control => control.addEventListener('input', update));
    window.addEventListener('engenix:themechange', update);
    update();
  })();

  // ---------------------------------------------------------------------------
  // One Deal sequence
  // The active department automatically follows the story on mobile so the
  // viewer never has to swipe the rail just to see the current phase.
  // ---------------------------------------------------------------------------
  (() => {
    const nodes = qsa('.deal-node');
    const eventBox = qs('#deal-event');
    const track = qs('#deal-track');
    const consoleBox = eventBox?.closest('.deal-console');
    if (!nodes.length || !eventBox || !track || !consoleBox) return;

    const mobileWorkflow = window.matchMedia('(max-width: 820px)');
    const events = [
      ['09:14:02', 'Customer identity verified', 'Required customer information is present and the review can continue.', 'CLEAR', '✓', false],
      ['09:16:18', 'Deal structure created', 'Vehicle, trade, cash, and payment structure enter the active workflow.', 'MOVING', '→', false],
      ['09:20:44', 'Lender path selected', 'Approval context and deal structure are ready for finance review.', 'READY', '✓', false],
      ['09:23:09', 'Disclosure variance detected', 'A required disclosure appears inconsistent. Manager review is recommended before delivery.', 'PRIORITY', '!', true],
      ['09:27:31', 'Corrective action documented', 'The manager records the response, owner, and resolution inside the audit history.', 'RESOLVED', '✓', false],
      ['09:31:06', 'Deal cleared for delivery', 'The reviewed transaction continues with a documented operational record.', 'CLEAR', '✓', false]
    ];

    let current = 0;
    let timer = null;
    let resumeTimer = null;
    let inView = false;
    let hasEntered = false;
    let userHoldUntil = 0;

    const stop = () => {
      window.clearInterval(timer);
      timer = null;
    };

    const centerActiveNode = (index, behavior = 'smooth', force = false) => {
      if (!mobileWorkflow.matches) return;
      if (!force && Date.now() < userHoldUntil) return;

      const node = nodes[index];
      if (!node) return;

      window.requestAnimationFrame(() => {
        const target = node.offsetLeft - Math.max(0, (track.clientWidth - node.offsetWidth) / 2);
        track.scrollTo({
          left: Math.max(0, target),
          behavior: reducedMotion ? 'auto' : behavior
        });
      });
    };

    const render = (index, options = {}) => {
      current = index;
      nodes.forEach((node, nodeIndex) => {
        node.classList.toggle('active', nodeIndex === index);
        node.classList.toggle('complete', nodeIndex < index);
        node.setAttribute('aria-current', nodeIndex === index ? 'step' : 'false');
      });

      const [time, heading, text, state, symbol, risk] = events[index];
      const assignments = [
        ['#deal-event-time', time],
        ['#deal-event-title', heading],
        ['#deal-event-copy', text],
        ['#deal-event-status', state],
        ['#deal-clock', time]
      ];
      assignments.forEach(([selector, value]) => {
        const element = qs(selector);
        if (element) element.textContent = value;
      });

      const icon = qs('.deal-event-icon', eventBox);
      if (icon) icon.textContent = symbol;
      eventBox.classList.toggle('is-risk', risk);

      const progress = qs('#deal-progress-bar');
      if (progress) progress.style.width = `${((index + 1) / events.length) * 100}%`;

      centerActiveNode(index, options.behavior || 'smooth', Boolean(options.forceFollow));
    };

    const start = () => {
      stop();
      if (reducedMotion || !inView || Date.now() < userHoldUntil) return;
      timer = window.setInterval(() => render((current + 1) % events.length), 2800);
    };

    const holdForManualInteraction = () => {
      stop();
      window.clearTimeout(resumeTimer);
      userHoldUntil = Date.now() + 4800;
      resumeTimer = window.setTimeout(start, 4900);
    };

    nodes.forEach((node, index) => node.addEventListener('click', () => {
      userHoldUntil = 0;
      render(index, { forceFollow: true });
      start();
    }));

    track.addEventListener('pointerdown', holdForManualInteraction, { passive: true });
    track.addEventListener('touchstart', holdForManualInteraction, { passive: true });
    consoleBox.addEventListener('mouseenter', stop);
    consoleBox.addEventListener('mouseleave', start);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.32;
          if (inView) {
            if (!hasEntered) {
              hasEntered = true;
              current = 0;
              render(0, { behavior: 'auto', forceFollow: true });
            } else {
              centerActiveNode(current, 'smooth');
            }
            start();
          } else {
            stop();
          }
        });
      }, { threshold: [0, 0.32, 0.6] });
      observer.observe(consoleBox);
    } else {
      inView = true;
      hasEntered = true;
      render(0, { behavior: 'auto', forceFollow: true });
      start();
    }

    render(0, { behavior: 'auto' });
  })();

  // ---------------------------------------------------------------------------
  // Count-up metrics
  // ---------------------------------------------------------------------------
  (() => {
    const counters = qsa('[data-count]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window) || reducedMotion) {
      counters.forEach(element => { element.textContent = element.dataset.count; });
      return;
    }

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const start = performance.now();
        const animate = now => {
          const progress = Math.min(1, (now - start) / 1100);
          element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        counterObserver.unobserve(element);
      });
    }, { threshold: 0.4 });

    counters.forEach(element => counterObserver.observe(element));
  })();

  // ---------------------------------------------------------------------------
  // Scene direction and dock suppression
  // ---------------------------------------------------------------------------
  (() => {
    const scenes = qsa('.cinematic-scene');
    if (!scenes.length || !('IntersectionObserver' in window)) return;

    const number = qs('#scene-number');
    const name = qs('#scene-name');
    const names = ['ENTRY', 'THRESHOLD', 'BLIND SPOTS', 'THE DEAL', 'SYSTEM', 'PRINCIPLE', 'OPERATORS', 'HORIZON', 'TRUST', 'FOUNDING', 'SESSION'];

    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        scenes.forEach(scene => scene.classList.remove('scene-active'));
        entry.target.classList.add('scene-active');
        const index = scenes.indexOf(entry.target);
        document.documentElement.style.setProperty('--scene-progress', String((index + 1) / scenes.length));
        if (number) number.textContent = String(index + 1).padStart(2, '0');
        if (name) name.textContent = names[index] || 'ENGENIX';
      });
    }, { threshold: 0.42 });

    scenes.forEach(scene => sceneObserver.observe(scene));

    const dock = qs('.global-founding-dock');
    const ending = qs('.scene-ending');
    if (dock && ending) {
      const dockObserver = new IntersectionObserver(([entry]) => {
        dock.classList.toggle('is-suppressed', entry.isIntersecting);
      }, { threshold: 0.28 });
      dockObserver.observe(ending);
    }
  })();

  // ---------------------------------------------------------------------------
  // Hero parallax and quiet scene breathing
  // ---------------------------------------------------------------------------
  if (!reducedMotion) {
    (() => {
      const hero = qs('.cinematic-hero');
      const visual = qs('.hero-visual', hero || document);
      const copy = qs('.hero-copy', hero || document);
      const quietElements = [qs('.threshold-content'), qs('.silent-interlude .shell')].filter(Boolean);
      if (!hero && !quietElements.length) return;

      let ticking = false;
      const render = () => {
        if (hero && visual && copy) {
          const rect = hero.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
          visual.style.transform = `translate3d(0, ${progress * 30}px, 0) scale(${1 - progress * 0.03})`;
          copy.style.transform = `translate3d(0, ${progress * 15}px, 0)`;
          copy.style.opacity = String(1 - progress * 0.28);
        }

        quietElements.forEach(element => {
          const section = element.parentElement;
          if (!section) return;
          const rect = section.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = Math.abs(window.innerHeight / 2 - center);
          const intensity = Math.max(0, 1 - distance / window.innerHeight);
          element.style.transform = `scale(${0.965 + intensity * 0.035})`;
          element.style.opacity = String(0.55 + intensity * 0.45);
        });
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(render);
      }, { passive: true });
      render();
    })();
  }

  // ---------------------------------------------------------------------------
  // Cinematic chapter navigation
  // ---------------------------------------------------------------------------
  (() => {
    const supportedHashes = new Set(['#system', '#intelligence', '#why']);

    const getOffset = () => {
      const header = qs('.site-header');
      return (header?.getBoundingClientRect().height || 84) + (window.innerWidth <= 620 ? 14 : 24);
    };

    const moveToChapter = (hash, behavior = 'smooth') => {
      if (!supportedHashes.has(hash)) return false;
      const target = qs(hash);
      if (!target) return false;
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - getOffset());
      window.scrollTo({ top, behavior });
      return true;
    };

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      const sameDocument = url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!sameDocument || !supportedHashes.has(url.hash)) return;
      event.preventDefault();
      history.pushState(null, '', url.hash);
      moveToChapter(url.hash);
    });

    const placeInitialHash = () => {
      if (!supportedHashes.has(window.location.hash)) return;
      const waitForLoader = () => {
        const loader = qs('#site-loader');
        if (loader && !loader.classList.contains('is-hidden')) {
          window.setTimeout(waitForLoader, 120);
          return;
        }
        requestAnimationFrame(() => moveToChapter(window.location.hash, reducedMotion ? 'auto' : 'smooth'));
      };
      waitForLoader();
    };

    window.addEventListener('load', placeInitialHash);
    window.addEventListener('hashchange', () => moveToChapter(window.location.hash));
  })();
})();

// =============================================================================
// ENGENIX MOBILE UNBOXING V2
// Scroll-driven optical framing and premium mobile chapter controls.
// =============================================================================
(() => {
  const mobile = window.matchMedia('(max-width: 820px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  const frameSelectors = [
    '.signal-card',
    '.blind-line',
    '.deal-console',
    '.intel-panel',
    '.activity-stream',
    '.leader-card',
    '.expansion-rail article',
    '.trust-item',
    '.early-access-grid'
  ];

  let frames = [];
  let ticking = false;
  let expansionCleanup = null;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const resetFrame = element => {
    element.style.removeProperty('--m-scale');
    element.style.removeProperty('--m-lift');
    element.style.removeProperty('--m-opacity');
    element.style.removeProperty('--m-radius');
  };

  const update = () => {
    ticking = false;

    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty('--mobile-page-progress', String(clamp(window.scrollY / scrollable)));

    if (!mobile.matches || reduced) {
      frames.forEach(resetFrame);
      return;
    }

    const viewport = window.innerHeight;
    const focusLine = viewport * 0.53;

    frames.forEach(element => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - focusLine);
      const focus = clamp(1 - distance / (viewport * 0.82));
      const scale = 0.975 + focus * 0.025;
      const lift = (1 - focus) * 16;
      const opacity = 0.90 + focus * 0.10;
      const radius = 36 - focus * 4;

      element.style.setProperty('--m-scale', scale.toFixed(4));
      element.style.setProperty('--m-lift', `${lift.toFixed(1)}px`);
      element.style.setProperty('--m-opacity', opacity.toFixed(3));
      element.style.setProperty('--m-radius', `${radius.toFixed(1)}px`);
    });
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  const buildExpansionTabs = () => {
    expansionCleanup?.();
    expansionCleanup = null;

    const rail = document.querySelector('.expansion-rail');
    if (!rail || !mobile.matches) return;

    const cards = Array.from(rail.querySelectorAll(':scope > article'));
    if (!cards.length) return;

    let tabs = rail.previousElementSibling;
    if (!tabs || !tabs.classList.contains('mobile-expansion-tabs')) {
      tabs = document.createElement('div');
      tabs.className = 'mobile-expansion-tabs';
      tabs.setAttribute('aria-label', 'ENGENIX expansion stages');
      rail.parentNode.insertBefore(tabs, rail);
    }

    tabs.replaceChildren();

    const buttons = cards.map((card, index) => {
      const button = document.createElement('button');
      const heading = card.querySelector('h3');
      button.type = 'button';
      button.textContent = heading?.textContent?.trim() || `Stage ${index + 1}`;
      button.setAttribute('aria-label', `Show ${button.textContent}`);
      button.classList.toggle('is-active', index === 0);
      button.addEventListener('click', () => {
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
        rail.scrollTo({ left: card.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' });
      });
      tabs.appendChild(button);
      return button;
    });

    let railTicking = false;
    const updateActive = () => {
      railTicking = false;
      const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      let activeIndex = 0;
      let bestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - railCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          activeIndex = index;
        }
      });

      buttons.forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    const onRailScroll = () => {
      if (railTicking) return;
      railTicking = true;
      requestAnimationFrame(updateActive);
    };

    rail.addEventListener('scroll', onRailScroll, { passive: true });
    updateActive();

    expansionCleanup = () => rail.removeEventListener('scroll', onRailScroll);
  };

  const buildSignalReveal = () => {
    const rail = document.querySelector('.signal-reveal-rail');
    const sequence = document.querySelector('.signal-sequence');
    if (!rail || !sequence || !mobile.matches) return () => {};

    const cards = Array.from(rail.querySelectorAll(':scope > .signal-card'));
    const labels = Array.from(sequence.querySelectorAll('[data-signal-label]'));
    if (!cards.length) return () => {};

    let frame = 0;
    const updateSignal = () => {
      frame = 0;
      const railRect = rail.getBoundingClientRect();
      const focusX = railRect.left + rail.clientWidth * 0.5;
      let activeIndex = 0;
      let distance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const nextDistance = Math.abs(rect.left + rect.width / 2 - focusX);
        if (nextDistance < distance) {
          distance = nextDistance;
          activeIndex = index;
        }
      });

      cards.forEach((card, index) => card.classList.toggle('is-active', index === activeIndex));
      labels.forEach((label, index) => label.classList.toggle('is-active', index === activeIndex));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateSignal);
    };

    rail.addEventListener('scroll', onScroll, { passive: true });
    updateSignal();
    return () => rail.removeEventListener('scroll', onScroll);
  };

  let signalCleanup = null;

  const prepare = () => {
    signalCleanup?.();
    signalCleanup = buildSignalReveal();
    frames = frameSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    frames.forEach(element => element.classList.add('mobile-cinematic-frame'));
    buildExpansionTabs();
    schedule();
  };

  // Preserve the briefing invitation without covering the story. The full rail
  // returns when the viewer scrolls upward; downward reading collapses it into
  // a Rivian-style action puck.
  const dock = document.querySelector('.global-founding-dock');
  let lastScrollY = window.scrollY;
  let dockTicking = false;

  const updateDock = () => {
    dockTicking = false;
    if (!dock || !mobile.matches) {
      dock?.classList.remove('is-compact');
      lastScrollY = window.scrollY;
      return;
    }

    const delta = window.scrollY - lastScrollY;
    if (window.scrollY < 300 || delta < -10) {
      dock.classList.remove('is-compact');
    } else if (delta > 8) {
      dock.classList.add('is-compact');
    }
    lastScrollY = window.scrollY;
  };

  const scheduleDock = () => {
    if (dockTicking) return;
    dockTicking = true;
    requestAnimationFrame(updateDock);
  };

  window.addEventListener('scroll', () => {
    schedule();
    scheduleDock();
  }, { passive: true });
  window.addEventListener('resize', () => {
    buildExpansionTabs();
    signalCleanup?.();
    signalCleanup = buildSignalReveal();
    schedule();
  }, { passive: true });

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', () => {
      buildExpansionTabs();
      signalCleanup?.();
      signalCleanup = buildSignalReveal();
      schedule();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepare, { once: true });
  } else {
    prepare();
  }
})();

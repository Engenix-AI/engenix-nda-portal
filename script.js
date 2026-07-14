const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const year = document.getElementById('year');


// ENGENIX cinematic boot sequence. Always releases the page.
(() => {
  const loader = document.getElementById('site-loader');

  if (!loader) {
    document.body.classList.remove('loader-active');
    return;
  }

  const status = document.getElementById('loader-status');
  const messages = [
    'Establishing secure session',
    'Authenticating operator access',
    'Risk engine online',
    'Entry authorized'
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 300 : 3900;
  const messageStep = reducedMotion ? 60 : 760;
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

    window.setTimeout(() => {
      loader.remove();
    }, reducedMotion ? 50 : 1380);
  };

  window.setTimeout(closeLoader, duration);
  window.setTimeout(closeLoader, 7000);
  window.addEventListener('pageshow', event => {
    if (event.persisted) closeLoader();
  });
})();


const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

toggle?.addEventListener('click', () => {
  const open = header?.classList.toggle('menu-open') || false;
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => link.addEventListener('click', () => {
  header?.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('[data-delay]').forEach(el => {
  el.style.setProperty('--delay', `${el.dataset.delay}ms`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));





// Mobile navigation hardening.
const closeMobileMenu = () => {
  header?.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMobileMenu();
}, { passive: true });


// Interactive dealership risk model.
(() => {
  const docs = document.getElementById('sim-docs');
  const signatures = document.getElementById('sim-signatures');
  const review = document.getElementById('sim-review');
  if (!docs || !signatures || !review) return;

  const docsValue = document.getElementById('sim-docs-value');
  const signaturesValue = document.getElementById('sim-signatures-value');
  const reviewValue = document.getElementById('sim-review-value');
  const score = document.getElementById('risk-score');
  const label = document.getElementById('risk-label');
  const dial = document.getElementById('risk-dial');
  const critical = document.getElementById('sim-critical');
  const moderate = document.getElementById('sim-moderate');
  const ready = document.getElementById('sim-ready');

  const update = () => {
    const d = Number(docs.value);
    const s = Number(signatures.value);
    const r = Number(review.value);
    const quality = (d * .42) + (s * .31) + (r * .27);
    const risk = Math.max(4, Math.round(100 - quality));

    docsValue.textContent = `${d}%`;
    signaturesValue.textContent = `${s}%`;
    reviewValue.textContent = `${r}%`;
    score.textContent = risk;
    ready.textContent = `${Math.max(30, Math.round(quality - 4))}%`;
    critical.textContent = Math.max(0, Math.round((risk - 18) / 11));
    moderate.textContent = Math.max(1, Math.round(risk / 7));

    let riskLabel = 'Low';
    let dialColor = 'var(--success)';
    if (risk >= 25) { riskLabel = 'Moderate'; dialColor = 'var(--gold)'; }
    if (risk >= 48) { riskLabel = 'High'; dialColor = 'var(--danger)'; }

    label.textContent = riskLabel;
    dial.style.setProperty('--risk', risk);
    dial.style.background = `radial-gradient(circle at center, #090c12 57%, transparent 58%), conic-gradient(${dialColor} ${risk}%, rgba(255,255,255,.07) 0)`;
  };

  [docs, signatures, review].forEach(control => control.addEventListener('input', update));
  update();
})();


// Native private-access drawer.
(() => {
  const trigger = document.getElementById('private-access-trigger');
  const panel = document.getElementById('private-access-panel');
  const backdrop = document.getElementById('private-access-backdrop');
  const close = document.getElementById('private-access-close');
  if (!trigger || !panel || !backdrop || !close) return;

  const openPanel = () => {
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      panel.classList.add('is-open');
    });
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('private-access-open');
    window.setTimeout(() => panel.querySelector('input')?.focus(), 350);
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
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
  });
})();





// ENGENIX production demo form handler.
// Browser posts only to ENGENIX. Cloudflare relays securely to Google Workspace.
(() => {
  const forms = [
    document.getElementById('quick-demo-form'),
    document.getElementById('demo-request-form')
  ].filter(Boolean);

  if (!forms.length) return;

  forms.forEach((form) => {
    form.action = '/api/demo';
    form.method = 'POST';
    form.removeAttribute('target');

    const status = form.querySelector('.quick-form-status, .form-status');
    const button = form.querySelector('button[type="submit"]');
    const label = button?.querySelector('span');
    const defaultLabel = label?.textContent || 'Become a Founding Dealership';

    const setStatus = (message, type = '') => {
      if (!status) return;
      const base = status.classList.contains('quick-form-status')
        ? 'quick-form-status'
        : 'form-status';
      status.className = `${base}${type ? ` ${type}` : ''}`;
      status.textContent = message;
    };

    form.addEventListener('submit', async (event) => {
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


// BLACK DIAMOND: open Private Access from any premium CTA.
document.querySelectorAll('[data-open-private-access]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('private-access-trigger')?.click();
  });
});

// BLACK DIAMOND: Deal in Motion.
(() => {
  const nodes = [...document.querySelectorAll('.deal-node')];
  const eventBox = document.getElementById('deal-event');
  if (!nodes.length || !eventBox) return;

  const data = [
    ['09:14:02','Customer identity verified','Required customer information is present and the review can continue.','CLEAR','✓',false],
    ['09:16:18','Deal structure created','Vehicle, trade, cash, and payment structure enter the active workflow.','MOVING','→',false],
    ['09:20:44','Lender path selected','Approval context and deal structure are ready for finance review.','READY','✓',false],
    ['09:23:09','Disclosure variance detected','A required disclosure appears inconsistent. Manager review is recommended before delivery.','PRIORITY','!',true],
    ['09:27:31','Corrective action documented','The manager records the response, owner, and resolution inside the audit history.','RESOLVED','✓',false],
    ['09:31:06','Deal cleared for delivery','The reviewed transaction continues with a documented operational record.','CLEAR','✓',false]
  ];

  let current = 0;
  const title = document.getElementById('deal-event-title');
  const copy = document.getElementById('deal-event-copy');
  const time = document.getElementById('deal-event-time');
  const status = document.getElementById('deal-event-status');
  const icon = eventBox.querySelector('.deal-event-icon');
  const progress = document.getElementById('deal-progress-bar');
  const clock = document.getElementById('deal-clock');

  const render = index => {
    current = index;
    nodes.forEach((node, i) => node.classList.toggle('active', i === index));
    const [t,heading,text,state,symbol,risk] = data[index];
    time.textContent = t; title.textContent = heading; copy.textContent = text;
    status.textContent = state; icon.textContent = symbol;
    eventBox.classList.toggle('is-risk', risk);
    progress.style.width = `${((index + 1) / data.length) * 100}%`;
    clock.textContent = t;
  };

  nodes.forEach((node, i) => node.addEventListener('click', () => render(i)));
  render(0);

  let timer = window.setInterval(() => render((current + 1) % data.length), 2600);
  eventBox.closest('.deal-console')?.addEventListener('mouseenter', () => clearInterval(timer));
})();

// BLACK DIAMOND: count operational metrics into view.
(() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const animate = now => {
        const p = Math.min(1, (now - start) / 1100);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterObserver.unobserve(el);
    });
  }, { threshold: .4 });
  counters.forEach(el => counterObserver.observe(el));
})();



// BLACK DIAMOND V3 EDITOR'S CUT
(() => {
  const hero = document.querySelector('.cinematic-hero');
  const visual = hero?.querySelector('.hero-visual');
  const copy = hero?.querySelector('.hero-copy');
  if (!hero || !visual || !copy || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  const render = () => {
    const rect = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    visual.style.transform = `translate3d(0, ${p*30}px, 0) scale(${1-p*.03})`;
    copy.style.transform = `translate3d(0, ${p*15}px, 0)`;
    copy.style.opacity = String(1-p*.28);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(render); ticking = true; } }, {passive:true});
  render();
})();


// BLACK DIAMOND V6 — SCENE DIRECTION + CROSS-PAGE NAV HARDENING
(() => {
  const scenes = [...document.querySelectorAll('.cinematic-scene')];
  if (!scenes.length) return;

  const number = document.getElementById('scene-number');
  const name = document.getElementById('scene-name');
  const names = [
    'ENTRY','THRESHOLD','BLIND SPOTS','THE DEAL','SYSTEM',
    'PRINCIPLE','OPERATORS','HORIZON','TRUST','FOUNDING','SESSION'
  ];

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
  }, { threshold: .42 });

  scenes.forEach(scene => sceneObserver.observe(scene));

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const threshold = document.querySelector('.threshold-content');
    const silence = document.querySelector('.silent-interlude .shell');
    let ticking = false;

    const direct = () => {
      [threshold, silence].forEach(el => {
        if (!el) return;
        const rect = el.parentElement.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(innerHeight / 2 - center);
        const intensity = Math.max(0, 1 - distance / innerHeight);
        el.style.transform = `scale(${.965 + intensity * .035})`;
        el.style.opacity = String(.55 + intensity * .45);
      });
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(direct);
        ticking = true;
      }
    }, { passive:true });
    direct();
  }
})();


// BLACK DIAMOND V7 — PERSISTENT CONVERSION SPINE
(() => {
  const dock = document.querySelector('.global-founding-dock');
  const ending = document.querySelector('.scene-ending');
  if (!dock || !ending) return;

  const observer = new IntersectionObserver(([entry]) => {
    dock.classList.toggle('is-suppressed', entry.isIntersecting);
    dock.style.opacity = entry.isIntersecting ? '0' : '';
    dock.style.visibility = entry.isIntersecting ? 'hidden' : '';
    dock.style.pointerEvents = entry.isIntersecting ? 'none' : '';
  }, { threshold: .28 });

  observer.observe(ending);
})();



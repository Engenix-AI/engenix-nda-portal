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
    'Initializing operational intelligence',
    'Loading compliance engine',
    'Verifying secure workspace',
    'Compliance intelligence ready'
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 300 : 3250;
  const messageStep = reducedMotion ? 60 : 650;
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
    const defaultLabel = label?.textContent || 'Request Private Access';

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
      setStatus('Securely sending your private access request…');

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
          'Private access requested. The ENGENIX team will contact you shortly.',
          'success'
        );
        if (label) label.textContent = 'Access Requested';

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

// BLACK DIAMOND: transparent executive value model.
(() => {
  const deals = document.getElementById('roi-deals');
  const minutes = document.getElementById('roi-minutes');
  const rate = document.getElementById('roi-rate');
  const reduction = document.getElementById('roi-reduction');
  if (!deals || !minutes || !rate || !reduction) return;

  const money = value => new Intl.NumberFormat('en-US', {
    style:'currency', currency:'USD', maximumFractionDigits:0
  }).format(value);

  const compact = value => new Intl.NumberFormat('en-US', {
    notation:'compact', maximumFractionDigits:1
  }).format(value);

  const update = () => {
    const d = Number(deals.value), m = Number(minutes.value);
    const r = Number(rate.value), pct = Number(reduction.value) / 100;
    const monthlyHours = d * m / 60;
    const savedMonthly = monthlyHours * pct;
    const annualHours = savedMonthly * 12;
    const annualValue = annualHours * r;

    document.getElementById('roi-deals-value').textContent = d;
    document.getElementById('roi-minutes-value').textContent = m;
    document.getElementById('roi-rate-value').textContent = money(r);
    document.getElementById('roi-reduction-value').textContent = `${Math.round(pct*100)}%`;
    document.getElementById('roi-output').textContent = money(annualValue);
    document.getElementById('roi-hours').textContent = `${Math.round(annualHours)} staff hours potentially redirected annually`;
    document.getElementById('roi-monthly-hours').textContent = Math.round(monthlyHours);
    document.getElementById('roi-saved-hours').textContent = Math.round(savedMonthly);
    document.getElementById('roi-annual-label').textContent = `$${compact(annualValue)}`;
  };

  [deals,minutes,rate,reduction].forEach(input => input.addEventListener('input', update));
  update();
})();

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const year = document.getElementById('year');

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
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


const demoForm = document.getElementById('demo-request-form');
if (demoForm) {
  demoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = demoForm.querySelector('.form-status');
    const button = demoForm.querySelector('button[type="submit"]');
    status.className = 'form-status';
    if (!demoForm.reportValidity()) return;
    button.disabled = true;
    status.textContent = 'Sending your private demo request…';
    try {
      const payload = Object.fromEntries(new FormData(demoForm).entries());
      const response = await fetch(demoForm.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to send request.');
      demoForm.reset();
      status.className = 'form-status success';
      status.textContent = 'Request received. The ENGENIX team will contact you shortly.';
      button.querySelector('span').textContent = 'Request Received';
    } catch (error) {
      status.className = 'form-status error';
      status.innerHTML = `${error.message || 'Unable to send request.'} You can also email <a href="mailto:demo@engenix.co">demo@engenix.co</a>.`;
    } finally { button.disabled = false; }
  });
}

// ENGENIX cinematic boot sequence. Runs on every full page load.
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
  const duration = reducedMotion ? 350 : 3250;
  const messageStep = reducedMotion ? 80 : 650;
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
    window.setTimeout(() => loader.remove(), reducedMotion ? 50 : 1380);
  };

  // The sequence is time-driven instead of waiting for every remote asset,
  // so a slow analytics request can never trap the visitor on the boot screen.
  window.setTimeout(closeLoader, duration);
  window.setTimeout(closeLoader, 7000); // hard safety release
})();


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

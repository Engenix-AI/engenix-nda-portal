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


// ENGENIX Google Workspace form transport.
// Replace this placeholder with the Apps Script Web App /exec URL.
const ENGENIX_GOOGLE_FORM_URL = 'https://script.google.com/macros/s/AKfycby4Ya8vA2H1fEvm9t6lGEXqLOPhA1g1WSyGUonL4_oxX_0LcOxl_tT4rqktKOLT7ZLHfg/exec';

(() => {
  const forms = [
    document.getElementById('quick-demo-form'),
    document.getElementById('demo-request-form')
  ].filter(Boolean);
  const transport = document.getElementById('engenix-form-transport');
  if (!forms.length || !transport) return;

  let active = null;
  let fallbackTimer = null;

  const setStatus = (form, message, type = '') => {
    const node = form.querySelector('.quick-form-status, .form-status');
    if (!node) return;
    const base = node.classList.contains('quick-form-status')
      ? 'quick-form-status'
      : 'form-status';
    node.className = `${base}${type ? ` ${type}` : ''}`;
    node.textContent = message;
  };

  forms.forEach(form => {
    form.method = 'POST';
    form.target = transport.name;

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (ENGENIX_GOOGLE_FORM_URL.includes('YOUR_GOOGLE')) {
        setStatus(form, 'Google Workspace form URL has not been added yet.', 'error');
        return;
      }
      if (!form.reportValidity()) return;

      form.action = ENGENIX_GOOGLE_FORM_URL;

      const button = form.querySelector('button[type="submit"]');
      const label = button?.querySelector('span');
      const defaultLabel = label?.textContent || 'Submit';

      if (button) button.disabled = true;
      if (label) label.textContent = 'Sending securely…';
      setStatus(form, 'Securely sending your request…');

      const metadata = {
        page: window.location.href,
        userAgent: navigator.userAgent,
        submittedAtClient: new Date().toISOString()
      };

      Object.entries(metadata).forEach(([name, value]) => {
        let input = form.querySelector(`input[name="${name}"]`);
        if (!input) {
          input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          form.appendChild(input);
        }
        input.value = value;
      });

      active = { form, button, label, defaultLabel };

      clearTimeout(fallbackTimer);
      fallbackTimer = setTimeout(() => {
        if (!active) return;
        active.form.reset();
        setStatus(active.form, 'Your request was sent. Check your inbox for confirmation.', 'success');
        if (active.button) active.button.disabled = false;
        if (active.label) active.label.textContent = 'Request Received';
        active = null;
      }, 9000);

      form.submit();
    });
  });

  window.addEventListener('message', event => {
    const data = event.data;
    if (!active || !data || data.source !== 'engenix-google-form') return;

    clearTimeout(fallbackTimer);

    if (data.ok) {
      active.form.reset();
      setStatus(active.form, 'Request received. ENGENIX will contact you shortly.', 'success');
      if (active.label) active.label.textContent = 'Request Received';
    } else {
      setStatus(active.form, data.error || 'Unable to send request. Email demo@engenix.co.', 'error');
      if (active.label) active.label.textContent = active.defaultLabel;
    }

    if (active.button) active.button.disabled = false;
    active = null;
  });
})();

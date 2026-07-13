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
  const duration = reducedMotion ? 350 : 2650;
  const messageStep = reducedMotion ? 80 : 540;
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
    }, reducedMotion ? 0 : 240);
    window.setTimeout(() => loader.remove(), reducedMotion ? 50 : 1100);
  };

  // The sequence is time-driven instead of waiting for every remote asset,
  // so a slow analytics request can never trap the visitor on the boot screen.
  window.setTimeout(closeLoader, duration);
  window.setTimeout(closeLoader, 6000); // hard safety release
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

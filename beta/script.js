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

// Premium launch loader. It plays once per browser tab, then stays out of the way.
(() => {
  const loader = document.getElementById('site-loader');
  if (!loader) return;
  const key = 'engenix-loader-seen';
  const seen = sessionStorage.getItem(key) === '1';
  const hide = (immediate = false) => {
    if (immediate) loader.style.transitionDuration = '0ms';
    loader.classList.add('is-hidden');
    document.body.classList.remove('loader-active');
    window.setTimeout(() => loader.remove(), immediate ? 0 : 760);
  };
  if (seen) {
    hide(true);
    return;
  }
  document.body.classList.add('loader-active');
  const start = performance.now();
  const minimumDisplay = 1450;
  const finish = () => {
    const wait = Math.max(0, minimumDisplay - (performance.now() - start));
    window.setTimeout(() => {
      sessionStorage.setItem(key, '1');
      hide(false);
    }, wait);
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
  window.setTimeout(finish, 3500);
})();

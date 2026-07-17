// ── NAV SCROLL EFFECT ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

// ── ACTIVE NAV HIGHLIGHT ──
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#f97316' : '';
  });
});

// ── THEME TOGGLE (dark / light) ──
const rootEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');

function applyTheme(theme) {
  if (theme === 'light') {
    rootEl.setAttribute('data-theme', 'light');
  } else {
    rootEl.removeAttribute('data-theme');
  }
  const icon = theme === 'light' ? '☀️' : '🌙';
  if (themeToggle) themeToggle.textContent = icon;
  if (themeToggleMobile) themeToggleMobile.textContent = icon;
}

let savedTheme = 'dark';
try {
  savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
} catch (e) { /* localStorage unavailable, default to dark */ }
applyTheme(savedTheme);

function toggleTheme() {
  const current = rootEl.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem('portfolio-theme', next); } catch (e) {}
}
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

// ── SKILL BAR ANIMATION ──
const barFills = document.querySelectorAll('.bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.getAttribute('data-w') + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
barFills.forEach(bar => barObserver.observe(bar));

// ── COUNTER ANIMATION ──
const counters = document.querySelectorAll('.stat-num[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
      let current  = 0;
      const step   = Math.max(1, Math.floor(target / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.innerHTML = current + suffix;
      }, 40);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ── CONTACT FORM — Formspree ──
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xqewjjgg', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        formSuccess.style.display = 'block';
        formSuccess.textContent   = '✅ Message sent! Sachin will reply soon.';
        setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
      } else {
        formSuccess.style.display   = 'block';
        formSuccess.style.color     = '#f87171';
        formSuccess.textContent     = '❌ Something went wrong. Please email directly.';
      }
    } catch (err) {
      formSuccess.style.display = 'block';
      formSuccess.style.color   = '#f87171';
      formSuccess.textContent   = '❌ Network error. Please try again.';
    }

    btn.textContent = 'Send Message →';
    btn.disabled    = false;
  });
}

// ── SCROLL HINT FADE ──
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    scrollHint.style.opacity = window.scrollY > 100 ? '0' : '1';
  });
}

// ── AUTO-ADVANCING CAROUSEL (Projects & Certificates) ──
function initCarousel(carouselEl) {
  const track = carouselEl.querySelector('.carousel-track');
  const dotsWrap = carouselEl.querySelector('.carousel-dots');
  const prevBtn = carouselEl.querySelector('.carousel-arrow.prev');
  const nextBtn = carouselEl.querySelector('.carousel-arrow.next');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;
  const autoplayMs = parseInt(carouselEl.getAttribute('data-autoplay'), 10) || 5000;
  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    restart();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  function restart() {
    if (timer) clearInterval(timer);
    if (slides.length > 1) timer = setInterval(next, autoplayMs);
  }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  carouselEl.addEventListener('mouseenter', () => timer && clearInterval(timer));
  carouselEl.addEventListener('mouseleave', restart);
  carouselEl.addEventListener('touchstart', () => timer && clearInterval(timer), { passive: true });
  carouselEl.addEventListener('touchend', restart);

  update();
  restart();
}
document.querySelectorAll('.carousel').forEach(initCarousel);

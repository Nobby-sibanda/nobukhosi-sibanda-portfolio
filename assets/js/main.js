/* ══════════════════════════════════════════════════════
   NOBUKHOSI SIBANDA — PORTFOLIO JAVASCRIPT
   ══════════════════════════════════════════════════════ */

'use strict';

/* ── 1. Navbar scroll behaviour ────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    // Scrolled style
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── 2. Mobile nav toggle ───────────────────────────── */
(function initMobileNav() {
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const items    = navLinks.querySelectorAll('a');

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  items.forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();


/* ── 3. Reveal on scroll ────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Slight stagger for cards in a grid
        const delay = entry.target.closest('.proj-grid, .certs-grid, .skills-grid')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 60
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();


/* ── 4. Back-to-top button ─────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── 5. Hero canvas particle systems ───────────────── */
(function initParticles() {

  function Particles(canvasId, color, accentColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    let W, H, particles, animId;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.8 + 0.4;
      this.vx   = (Math.random() - 0.5) * 0.35;
      this.vy   = (Math.random() - 0.5) * 0.35;
      this.alpha= Math.random() * 0.55 + 0.1;
      this.da   = (Math.random() - 0.5) * 0.003;
    };
    Particle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha += this.da;
      if (this.alpha <= 0.05 || this.alpha >= 0.65) this.da *= -1;
      if (this.x < -2 || this.x > W + 2 || this.y < -2 || this.y > H + 2) this.reset();
    };

    function init() {
      resize();
      const COUNT = Math.min(Math.floor((W * H) / 6000), 120);
      particles = Array.from({ length: COUNT }, () => new Particle());
      loop();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = color + Math.round((1 - dist / 110) * 28).toString(16).padStart(2,'0');
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId);
      init();
    });

    init();
  }

  Particles('canvasDS', '#00C6FF', '#00C6FF');
  Particles('canvasQA', '#FF6B35', '#FF6B35');
})();


/* ── 6. Hero split: expand on click (mobile) ────────── */
(function initHeroSplit() {
  const btns = document.querySelectorAll('.split-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', e => {
      const filter = btn.getAttribute('data-filter');
      // Smooth scroll to projects
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      // After scroll lands, trigger the tab
      setTimeout(() => {
        const tab = document.querySelector(`.proj-tab[data-tab="${filter}"]`);
        if (tab) tab.click();
      }, 700);
      e.preventDefault();
    });
  });
})();


/* ── 7. Project tab filtering ───────────────────────── */
(function initProjFilter() {
  const tabs  = document.querySelectorAll('.proj-tab');
  const cards = document.querySelectorAll('.proj-card');

  function setFilter(filter) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === filter));

    cards.forEach(c => {
      const show = filter === 'all' || c.dataset.cat === filter;
      c.classList.toggle('hidden', !show);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.tab));
  });

  setFilter('all');
})();


/* ── 8. Contact form (mailto fallback) ─────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const subject = form.subject.value.trim() || 'Portfolio Enquiry';
    const message = form.message.value.trim();

    const body    = encodeURIComponent(`Hi Nobukhosi,\n\n${message}\n\n— ${name}\n${email}`);
    const mailto  = `mailto:nobbyspearl@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailto;

    const note = document.getElementById('formNote');
    note.textContent = 'Opening your email client...';
    setTimeout(() => { note.textContent = ''; }, 4000);
  });
})();


/* ── 9. Smooth-scroll for all anchor links ──────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});


/* ── 10. Typed headline effect in hero ──────────────── */
(function initTyped() {
  const dsHeading = document.querySelector('.hero-ds .split-heading');
  const qaHeading = document.querySelector('.hero-qa .split-heading');
  if (!dsHeading || !qaHeading) return;

  function typeEl(el, finalHTML, delay) {
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transition = 'opacity 0.6s ease';
    }, delay);
  }

  typeEl(dsHeading, dsHeading.innerHTML, 300);
  typeEl(qaHeading, qaHeading.innerHTML, 500);
})();

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
    navbar.classList.toggle('scrolled', window.scrollY > 40);
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
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
})();


/* ── 3. Reveal on scroll ────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.closest('.proj-grid,.certs-grid,.doc-certs-grid,.skills-grid');
      const delay  = parent
        ? Array.from(parent.children).indexOf(entry.target) * 60
        : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ── 4. Back-to-top ────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── 5. Certificate expand / collapse ──────────────── */
function toggleCert(trigger) {
  const card    = trigger.closest('.doc-cert-card');
  const isOpen  = card.classList.contains('open');

  // Close all others first
  document.querySelectorAll('.doc-cert-card.open').forEach(c => {
    if (c !== card) c.classList.remove('open');
  });

  card.classList.toggle('open', !isOpen);
  const span = trigger.querySelector('span');
  span.innerHTML = card.classList.contains('open')
    ? '<i class="fas fa-eye-slash"></i>&nbsp; Hide Certificate'
    : '<i class="fas fa-eye"></i>&nbsp; View Certificate';
}


/* ── 6. Hero canvas — 3D Neural Network (DS side) ──── */
(function initNeuralNetCanvas() {
  const canvas = document.getElementById('canvasDS');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let theta = 0;
  let t     = 0;

  // Palette (DS = steel blue family)
  const COL_NODE  = '#9BBFD4';
  const COL_EDGE  = '#5D768B';
  const COL_PULSE = '#E3C9A4';

  // Network layers: each layer is list of 3D [x, y, z] positions
  // Layers along Z axis, nodes spread in X-Y plane
  const layerZ = [-1.1, -0.35, 0.4, 1.15];
  const layerCounts = [5, 8, 7, 4];

  function makeNodes() {
    const nodes = [];
    layerCounts.forEach((count, li) => {
      const layer = [];
      for (let i = 0; i < count; i++) {
        const spread = 0.7;
        const yCentered = ((i / (count - 1)) - 0.5) * spread * 2;
        const xOffset   = (Math.random() - 0.5) * 0.12;
        layer.push([xOffset, yCentered, layerZ[li]]);
      }
      nodes.push(layer);
    });
    return nodes;
  }

  const nodes = makeNodes();

  // Build edges (connect every pair across adjacent layers)
  const edges = [];
  for (let li = 0; li < nodes.length - 1; li++) {
    nodes[li].forEach((nA, ai) => {
      nodes[li + 1].forEach((nB, bi) => {
        edges.push({
          from: [li, ai],
          to:   [li + 1, bi],
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
        });
      });
    });
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function project(x, y, z) {
    // Rotate around Y axis
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    const xr = x * cosT - z * sinT;
    const zr = x * sinT + z * cosT;
    // Slight downward tilt
    const tilt = 0.2;
    const yr = y * Math.cos(tilt) - zr * Math.sin(tilt);
    const zr2 = y * Math.sin(tilt) + zr * Math.cos(tilt);
    // Perspective
    const fov = 3.5;
    const s = fov / (fov + zr2 + 2.2);
    return {
      sx: W * 0.5 + xr * s * Math.min(W, H) * 0.45,
      sy: H * 0.5 - yr * s * Math.min(W, H) * 0.42,
      depth: zr2,
      scale: s,
    };
  }

  function draw() {
    resize();
    ctx.clearRect(0, 0, W, H);
    theta += 0.004;
    t     += 0.016;

    // ── Draw edges ──
    edges.forEach(e => {
      const pA = project(...nodes[e.from[0]][e.from[1]]);
      const pB = project(...nodes[e.to[0]][e.to[1]]);

      // Edge line
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      const avgScale = (pA.scale + pB.scale) * 0.5;
      ctx.strokeStyle = COL_EDGE;
      ctx.globalAlpha = avgScale * 0.25;
      ctx.lineWidth   = 0.6;
      ctx.stroke();

      // Animated pulse dot traveling along edge
      const progress = ((Math.sin(t * e.speed + e.phase) + 1) * 0.5);
      const px = pA.sx + (pB.sx - pA.sx) * progress;
      const py = pA.sy + (pB.sy - pA.sy) * progress;
      const ps = pA.scale + (pB.scale - pA.scale) * progress;

      ctx.beginPath();
      ctx.arc(px, py, ps * 3, 0, Math.PI * 2);
      ctx.fillStyle = COL_PULSE;
      ctx.globalAlpha = ps * 0.65;
      ctx.fill();
    });

    // ── Draw nodes ──
    nodes.forEach((layer, li) => {
      layer.forEach(n => {
        const p = project(...n);
        const r = p.scale * 7;

        // Glow
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 2.8);
        grad.addColorStop(0,   'rgba(155,191,212,0.5)');
        grad.addColorStop(1,   'rgba(155,191,212,0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = li === nodes.length - 1 ? COL_PULSE : COL_NODE;
        ctx.globalAlpha = 0.85 * p.scale;
        ctx.fill();
      });
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(animId); draw(); });
  draw();
})();


/* ── 7. Hero canvas — 3D Volatility Surface (QA side) ─ */
(function initVolSurfaceCanvas() {
  const canvas = document.getElementById('canvasQA');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let theta = 0.6;

  const NX = 22, NY = 16;

  // Black-Scholes vol surface: parabolic smile + term structure
  function impliedVol(moneyness, maturity) {
    const atm   = 0.18;
    const smile = 0.14 * moneyness * moneyness;
    const skew  = -0.06 * moneyness;
    const term  = 0.05 * Math.exp(-1.8 * maturity);
    return Math.max(0.08, atm + smile + skew + term);
  }

  // Build 3D grid
  // x = moneyness (−1 → +1), z = maturity (0 → 1), y = vol (up)
  const grid = [];
  for (let i = 0; i < NX; i++) {
    grid.push([]);
    for (let j = 0; j < NY; j++) {
      const mx  = (i / (NX - 1)) * 2 - 1;       // −1 to +1
      const mat = j / (NY - 1);                   // 0 to 1
      const vol = impliedVol(mx, mat + 0.05);
      grid[i].push({
        x: mx  * 0.95,
        y: vol * 2.8 - 0.52,
        z: mat * 1.5 - 0.75,
        vol: vol,
      });
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function project(gx, gy, gz) {
    // Rotate around Y
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    const xr = gx * cosT - gz * sinT;
    const zr = gx * sinT + gz * cosT;
    // Downward tilt
    const tilt = 0.38;
    const yr  = gy * Math.cos(tilt) - zr * Math.sin(tilt);
    const zr2 = gy * Math.sin(tilt) + zr * Math.cos(tilt);
    // Perspective
    const fov = 3.2;
    const s = fov / (fov + zr2 + 2.5);
    return {
      sx: W * 0.5 + xr * s * Math.min(W, H) * 0.44,
      sy: H * 0.5 - yr * s * Math.min(W, H) * 0.40,
      depth: zr2,
      scale: s,
    };
  }

  // Interpolate between two hex colours
  function lerpColor(t) {
    // Low vol → cool (#5D768B), High vol → warm (#C8B39B → #E3C9A4)
    t = Math.min(1, Math.max(0, t));
    const r = Math.round(93  + t * (227 - 93));
    const g = Math.round(118 + t * (201 - 118));
    const b = Math.round(139 + t * (164 - 139));
    return { r, g, b };
  }

  function draw() {
    resize();
    ctx.clearRect(0, 0, W, H);
    theta += 0.0032;

    // Collect quads (painter's algorithm — sort back to front)
    const quads = [];
    for (let i = 0; i < NX - 1; i++) {
      for (let j = 0; j < NY - 1; j++) {
        const g00 = grid[i][j];
        const g10 = grid[i + 1][j];
        const g11 = grid[i + 1][j + 1];
        const g01 = grid[i][j + 1];

        const p00 = project(g00.x, g00.y, g00.z);
        const p10 = project(g10.x, g10.y, g10.z);
        const p11 = project(g11.x, g11.y, g11.z);
        const p01 = project(g01.x, g01.y, g01.z);

        const avgVol   = (g00.vol + g10.vol + g11.vol + g01.vol) * 0.25;
        const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) * 0.25;
        const t        = (avgVol - 0.08) / 0.26;

        quads.push({ p00, p10, p11, p01, t, depth: avgDepth });
      }
    }

    quads.sort((a, b) => a.depth - b.depth);

    quads.forEach(q => {
      const c = lerpColor(q.t);

      ctx.beginPath();
      ctx.moveTo(q.p00.sx, q.p00.sy);
      ctx.lineTo(q.p10.sx, q.p10.sy);
      ctx.lineTo(q.p11.sx, q.p11.sy);
      ctx.lineTo(q.p01.sx, q.p01.sy);
      ctx.closePath();

      ctx.fillStyle   = `rgba(${c.r},${c.g},${c.b},0.18)`;
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.55)`;
      ctx.lineWidth   = 0.7;
      ctx.fill();
      ctx.stroke();
    });

    // Draw vertex dots on top row (high-vol rim for visual interest)
    for (let i = 0; i < NX; i++) {
      const g = grid[i][0];
      const p = project(g.x, g.y, g.z);
      const c = lerpColor(1);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.scale * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.75)`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(animId); draw(); });
  draw();
})();


/* ── 8. Hero split: scroll to projects on click ─────── */
(function initHeroSplit() {
  document.querySelectorAll('.split-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const filter = btn.getAttribute('data-filter');
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const tab = document.querySelector(`.proj-tab[data-tab="${filter}"]`);
        if (tab) tab.click();
      }, 700);
    });
  });
})();


/* ── 9. Project tab filtering ───────────────────────── */
(function initProjFilter() {
  const tabs  = document.querySelectorAll('.proj-tab');
  const cards = document.querySelectorAll('.proj-card');

  function setFilter(filter) {
    tabs.forEach(t  => t.classList.toggle('active', t.dataset.tab === filter));
    cards.forEach(c => c.classList.toggle('hidden', filter !== 'all' && c.dataset.cat !== filter));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setFilter(tab.dataset.tab)));
  setFilter('all');
})();


/* ── 10. Contact form (mailto fallback) ─────────────── */
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
    window.location.href = `mailto:nobbyspearl@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    const note = document.getElementById('formNote');
    note.textContent = 'Opening your email client...';
    setTimeout(() => { note.textContent = ''; }, 4000);
  });
})();


/* ── 11. Smooth-scroll for anchor links ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});


/* ── 12. Hero fade-in ───────────────────────────────── */
(function initHeroFade() {
  ['.hero-ds .split-heading', '.hero-qa .split-heading'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = 0;
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => {
      el.style.opacity   = 1;
      el.style.transform = 'translateY(0)';
    }, 300 + i * 200);
  });
})();

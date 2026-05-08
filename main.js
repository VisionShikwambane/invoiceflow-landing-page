document.addEventListener('DOMContentLoaded', () => {

  // ── Dynamic year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Navbar: tighten background on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    // Close on backdrop tap
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Scroll-reveal via IntersectionObserver
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // ── Animated number counters
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1800;
        const isDecimal = !Number.isInteger(target);
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutExpo curve
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const val = eased * target;
          el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));
  }

  // ── FAQ accordion (one open at a time)
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Demo showcase stepper
  (function () {
    const TOTAL = 7;
    const PHASE_MAP = [
      { phase: 'user',    steps: [0, 1, 2, 3] },
      { phase: 'client',  steps: [4, 5]    },
      { phase: 'confirm', steps: [6]           },
    ];

    let current = 0;

    const pills     = document.querySelectorAll('.demo-step-pill');
    const slides    = document.querySelectorAll('.demo-slide');
    const dots      = document.querySelectorAll('.demo-dot');
    const prevBtn   = document.getElementById('demo-prev');
    const nextBtn   = document.getElementById('demo-next');
    const phaseBtns = document.querySelectorAll('.demo-phase-btn');
    const viewer    = document.getElementById('demo-viewer');

    if (!pills.length) return;

    // Swap placeholder ↔ image depending on load result
    document.querySelectorAll('.demo-screen img').forEach(img => {
      const screen = img.closest('.demo-screen');
      const markLoaded = () => { if (screen) screen.classList.add('has-image'); };
      // Already cached / loaded synchronously before listener attached
      if (img.complete && img.naturalWidth > 0) markLoaded();
      img.addEventListener('load',  markLoaded);
      // On error: leave placeholder visible (no has-image class added)
      img.addEventListener('error', () => { /* placeholder stays shown */ });
    });

    function goTo(idx) {
      if (idx < 0 || idx >= TOTAL) return;

      pills.forEach(p  => { p.classList.remove('active'); p.setAttribute('aria-selected', 'false'); });
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d   => d.classList.remove('active'));

      pills[idx].classList.add('active');
      pills[idx].setAttribute('aria-selected', 'true');
      slides[idx].classList.add('active');
      dots[idx].classList.add('active');

      phaseBtns.forEach(btn => btn.classList.remove('active'));
      const activePhase = PHASE_MAP.find(p => p.steps.includes(idx));
      if (activePhase) {
        const btn = document.querySelector(`.demo-phase-btn[data-phase="${activePhase.phase}"]`);
        if (btn) btn.classList.add('active');
      }

      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        nextBtn.disabled = idx === TOTAL - 1;
        nextBtn.textContent = idx === TOTAL - 1 ? 'Done ✓' : 'Next →';
        if (idx === TOTAL - 1) nextBtn.style.background = 'var(--green)';
        else nextBtn.style.background = '';
      }

      current = idx;
    }

    pills.forEach((pill, i) => pill.addEventListener('click', () => goTo(i)));
    dots.forEach((dot, i)   => dot.addEventListener('click',  () => goTo(i)));

    phaseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const phase = PHASE_MAP.find(p => p.phase === btn.dataset.phase);
        if (phase) goTo(phase.steps[0]);
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    if (viewer) {
      viewer.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      });
    }

    goTo(0);
  })();

});

// ── Toast notification for upgrade button
function notAvailable() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = 'Paid plans coming soon — continue using the free plan for now!';
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 4500);
}

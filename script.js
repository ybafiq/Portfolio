/**
 * PORTFOLIO — VANILLA JS
 * Features:
 *  1. Bioluminescent canvas animation (Hero)
 *  2. Navbar scroll behaviour + mobile toggle
 *  3. Project filtering (CSS Grid)
 *  4. Skills scroll-triggered animation + stat counter
 *  5. Contact form validation
 */

'use strict';

/* ============================================================
   1. BIOLUMINESCENT CANVAS ANIMATION
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('bioCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT = 70;
  const TEAL = '0,255,180';
  const TEAL2 = '0,200,140';

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 20;
      this.r  = Math.random() * 2.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.alpha     = 0;
      this.maxAlpha  = Math.random() * 0.55 + 0.1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.pulse     = Math.random() * Math.PI * 2;
      this.pulseSpd  = Math.random() * 0.03 + 0.01;
      this.color     = Math.random() > 0.4 ? TEAL : TEAL2;
    }

    update() {
      this.pulse += this.pulseSpd;
      this.x  += this.vx;
      this.y  += this.vy;
      const pulseFactor = 0.85 + Math.sin(this.pulse) * 0.15;

      if (this.alpha < this.maxAlpha) this.alpha += this.fadeSpeed;

      if (this.y < -20 || this.x < -20 || this.x > W + 20) this.reset();

      return pulseFactor;
    }

    draw(pulseFactor) {
      ctx.save();
      // glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4 * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha * 0.15})`;
      ctx.fill();
      // core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,255,180,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function setup() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      const pf = p.update();
      p.draw(pf);
    });
    animId = requestAnimationFrame(loop);
  }

  setup();
  loop();

  const ro = new ResizeObserver(() => { setup(); });
  ro.observe(canvas);
})();


/* ============================================================
   2. NAVBAR — scroll style + mobile toggle
   ============================================================ */
(function initNav() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll style
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ============================================================
   3. PROJECT FILTERING
   ============================================================ */
(function initFilter() {
  const filterBar    = document.getElementById('filterBar');
  const projectsGrid = document.getElementById('projectsGrid');
  const noResults    = document.getElementById('noResults');
  if (!filterBar || !projectsGrid) return;

  const cards = Array.from(projectsGrid.querySelectorAll('.project-card'));

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Update active button
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category;
      const match = filter === 'all' || category === filter;

      if (match) {
        card.classList.remove('hidden');
        // Re-trigger fade-in animation
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  });
})();


/* ============================================================
   4A. SKILLS — scroll-triggered card animation
   ============================================================ */
(function initSkillsAnimation() {
  const skillCards = document.querySelectorAll('.skill-card');
  if (!skillCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card  = entry.target;
        const delay = parseInt(card.dataset.delay || '0', 10);
        setTimeout(() => {
          card.classList.add('in-view');
        }, delay);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.15 });

  skillCards.forEach(card => observer.observe(card));
})();


/* ============================================================
   4B. ABOUT — animated stat counters
   ============================================================ */
(function initStatCounters() {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  function animateCounter(el, target, duration = 1400) {
    const start  = performance.now();
    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('fname'),    errEl: document.getElementById('nameError') },
    email:   { el: document.getElementById('femail'),   errEl: document.getElementById('emailError') },
    subject: { el: document.getElementById('fsubject'), errEl: document.getElementById('subjectError') },
    message: { el: document.getElementById('fmessage'), errEl: document.getElementById('messageError') },
  };

  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnLoader  = submitBtn.querySelector('.btn-loader');
  const formSuccess = document.getElementById('formSuccess');

  /* -- Validation helpers -- */
  function isValidEmail(email) {
    // RFC-5321-ish regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }

  function setError(fieldKey, message) {
    const { el, errEl } = fields[fieldKey];
    el.classList.add('error');
    errEl.textContent = message;
  }

  function clearError(fieldKey) {
    const { el, errEl } = fields[fieldKey];
    el.classList.remove('error');
    errEl.textContent = '';
  }

  function validateField(fieldKey) {
    const value = fields[fieldKey].el.value.trim();

    switch (fieldKey) {
      case 'name':
        if (!value) {
          setError('name', 'Name is required.');
          return false;
        } else if (value.length < 2) {
          setError('name', 'Name must be at least 2 characters.');
          return false;
        }
        break;

      case 'email':
        if (!value) {
          setError('email', 'Email address is required.');
          return false;
        } else if (!isValidEmail(value)) {
          setError('email', 'Please enter a valid email address.');
          return false;
        }
        break;

      case 'subject':
        if (!value) {
          setError('subject', 'Subject is required.');
          return false;
        } else if (value.length < 3) {
          setError('subject', 'Subject must be at least 3 characters.');
          return false;
        }
        break;

      case 'message':
        if (!value) {
          setError('message', 'Message cannot be empty.');
          return false;
        } else if (value.length < 10) {
          setError('message', 'Message must be at least 10 characters.');
          return false;
        }
        break;
    }

    clearError(fieldKey);
    return true;
  }

  // Real-time validation on blur
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.classList.contains('error')) validateField(key);
    });
  });

  /* -- Form submit -- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const valid = Object.keys(fields).map(key => validateField(key));
    if (valid.includes(false)) return;

    // Simulate async send (Fetch API skeleton)
    btnText.style.display   = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled      = true;
    formSuccess.style.display = 'none';

    try {
      // --- REAL USAGE: replace URL with your backend endpoint ---
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name:    fields.name.el.value.trim(),
      //     email:   fields.email.el.value.trim(),
      //     subject: fields.subject.el.value.trim(),
      //     message: fields.message.el.value.trim(),
      //   })
      // });
      // if (!response.ok) throw new Error('Network response was not ok');

      // Simulated 1.5s network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      form.reset();
      Object.keys(fields).forEach(key => clearError(key));
      formSuccess.style.display = 'block';

    } catch (err) {
      console.error('Form submission error:', err);
      // Show a generic error to the user
      setError('message', 'Something went wrong. Please try again.');
    } finally {
      btnText.style.display   = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled      = false;
    }
  });
})();


/* ============================================================
   MISC — Smooth reveal on page sections via IntersectionObserver
   ============================================================ */
(function initSectionReveal() {
  const sections = document.querySelectorAll('#about, #projects, #contact');
  const style = document.createElement('style');
  style.textContent = `
    .section-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .section-reveal.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  sections.forEach(s => s.classList.add('section-reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => obs.observe(s));
})();
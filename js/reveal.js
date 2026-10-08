/**
 * reveal.js - Scroll Interactions, IntersectionObserver, Count-up stats,
 * and Active Section Spy for Navbar and Right Rail Dots
 */

export function initScrollEffects() {
  setupRevealAnimations();
  setupStatsCountUp();
  setupSectionSpy();
  setupBackToTop();
  setupHeroParallax();
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

function setupStatsCountUp() {
  const statElements = document.querySelectorAll('.stat-val[data-target]');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        animateValue(el, 0, target, 1600, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statElements.forEach(el => observer.observe(el));
}

function animateValue(element, start, end, duration, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const currentVal = Math.floor(easeOutQuad * (end - start) + start);
    element.textContent = currentVal + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

function setupSectionSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const navDots = document.querySelectorAll('.nav-dot[data-target]');

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        // Update top navbar links
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          link.classList.toggle('active', href === id);
        });

        // Update right rail dots
        navDots.forEach(dot => {
          const target = dot.dataset.target;
          dot.classList.toggle('active', target === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

function setupBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupHeroParallax() {
  const avatar = document.querySelector('.hero-avatar-frame');
  const moon = document.querySelector('.hero-backdrop-moon');

  if (!avatar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    avatar.style.transform = `translate(${x * 0.8}px, ${y * 0.8}px)`;
    if (moon) {
      moon.style.transform = `translateX(calc(-50% + ${-x * 0.4}px)) translateY(${-y * 0.4}px)`;
    }
  }, { passive: true });
}

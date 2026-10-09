/**
 * main.js - Master Orchestrator & Application Bootstrap
 * Loads JSON content asynchronously, initializes components, and sets up interactions.
 */

import { initTheme } from './theme.js';
import {
  renderProfile,
  renderStats,
  renderExpertise,
  renderSkillsAndActivities
} from './render.js';
import {
  ExperienceCarousel,
  ActiveSystemsCarousel,
  NewsFeedCarousel
} from './carousel.js';
import { ProjectFilterManager } from './filters.js';
import { PortfolioChatbot } from './chatbot.js';
import { initScrollEffects } from './reveal.js';
import { initFx } from './fx.js';

async function initPortfolio() {
  // 1. Theme initialization first (fast render)
  initTheme();

  // 2. Mobile navigation hamburger toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    // Close mobile menu on clicking any link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // 3. Load all JSON data in parallel
  try {
    const [
      profile,
      expertise,
      activeProjects,
      news,
      experience,
      skills,
      organizations,
      education,
      certifications,
      projects
    ] = await Promise.all([
      fetch('data/profile.json').then(r => r.json()),
      fetch('data/expertise.json').then(r => r.json()),
      fetch('data/active-projects.json').then(r => r.json()),
      fetch('data/news.json').then(r => r.json()),
      fetch('data/experience.json').then(r => r.json()),
      fetch('data/skills.json').then(r => r.json()),
      fetch('data/organizations.json').then(r => r.json()),
      fetch('data/education.json').then(r => r.json()),
      fetch('data/certifications.json').then(r => r.json()),
      fetch('data/projects.json').then(r => r.json())
    ]);

    // 4. Render sections
    renderProfile(profile);
    renderStats(profile.stats);
    renderExpertise(expertise);
    renderSkillsAndActivities(skills, organizations, education, certifications);

    // 5. Initialize Interactive Subsystems
    new ActiveSystemsCarousel('active-projects-container', activeProjects);
    new NewsFeedCarousel('news-feed-container', news);
    new ExperienceCarousel('exp-carousel-container', experience);
    new ProjectFilterManager('projects-grid-container', null, projects);
    new PortfolioChatbot({
      profile,
      expertise,
      projects,
      experience
    });

    // 6. Contact Form Submission Handler
    setupContactForm(profile.contact?.phone);

    // 7. Scroll reveal & animations
    initScrollEffects();

    // 8. Futuristic interaction layer (typing line, spotlight, command palette)
    initFx(profile);

  } catch (error) {
    console.error('Failed to load portfolio data:', error);
  }
}

/**
 * Contact form: opens a prefilled WhatsApp chat (wa.me) instead of pretending to send.
 * @param {string} phone - international number from profile.json, e.g. "+6281250233529"
 */
function setupContactForm(phone) {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-form-feedback');
  if (!form) return;

  const waNumber = (phone || '').replace(/\D/g, '');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!waNumber) {
      showFeedback('Messaging is unavailable right now. Please use the email address on this page.');
      return;
    }

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const subject = form.querySelector('#contact-subject').value.trim();
    const message = form.querySelector('#contact-message').value.trim();

    const text = `Hi Archie, I'm ${name} (${email}).\n\n*${subject}*\n${message}`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank', 'noopener');
    form.reset();
    showFeedback('Opening WhatsApp with your message ready to send. Archie usually replies within 24 hours.');
  });

  function showFeedback(msg) {
    if (!feedback) return;
    feedback.style.display = 'block';
    feedback.textContent = msg;
    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

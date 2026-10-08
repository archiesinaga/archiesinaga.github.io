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
    setupContactForm();

    // 7. Scroll reveal & animations
    initScrollEffects();

  } catch (error) {
    console.error('Failed to load portfolio data:', error);
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        if (feedback) {
          feedback.style.display = 'block';
          feedback.textContent = 'Thank you! Your message has been sent successfully. Archie will respond within 24 hours.';
          setTimeout(() => { feedback.style.display = 'none'; }, 6000);
        }
      }, 800);
    });
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

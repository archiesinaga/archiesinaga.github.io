/**
 * main.js - Master Orchestrator & Application Bootstrap
 * Loads JSON content asynchronously, initializes components, and sets up interactions.
 */

import { initTheme } from './theme.js';
import {
  renderProfile,
  renderStats,
  renderExpertise,
  renderSkillsAndActivities,
  renderEducation,
  renderCertifications
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
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-controls', 'nav-menu');
    const setMenuOpen = (open) => {
      navMenu.classList.toggle('mobile-open', open);
      hamburgerBtn.setAttribute('aria-expanded', String(open));
    };

    hamburgerBtn.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('mobile-open'));
    });

    // Close mobile menu on clicking any real link (including the Arcade items)
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a[href]')) setMenuOpen(false);
    });

    // Close on Escape so keyboard users are not trapped behind the menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        setMenuOpen(false);
        hamburgerBtn.focus();
      }
    });
  }

  // Arcade dropdown: hover alone fails for keyboard and touch, so toggle it explicitly
  const dropdown = document.querySelector('.nav-item-dropdown');
  const dropdownToggle = dropdown?.querySelector('.dropdown-toggle');
  if (dropdown && dropdownToggle) {
    const setDropdown = (open) => {
      dropdown.classList.toggle('open', open);
      dropdownToggle.setAttribute('aria-expanded', String(open));
    };
    dropdownToggle.addEventListener('click', () => setDropdown(!dropdown.classList.contains('open')));
    dropdownToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setDropdown(!dropdown.classList.contains('open'));
      }
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) setDropdown(false);
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
    renderEducation(education);
    renderCertifications(certifications);

    // 5. Initialize Interactive Subsystems
    new ActiveSystemsCarousel('active-projects-container', activeProjects);
    new NewsFeedCarousel('news-feed-container', news);
    new ExperienceCarousel('exp-carousel-container', experience);
    new ProjectFilterManager('projects-grid-container', 'project-filter-bar', projects);
    new PortfolioChatbot({
      profile,
      expertise,
      projects,
      experience
    });

    // 6. Contact Form Submission Handler
    setupContactForm(profile.contact || {});

    // 7. Scroll reveal & animations
    initScrollEffects();

  } catch (error) {
    console.error('Failed to load portfolio data:', error);
  }
}

function setupContactForm(contact) {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-form-feedback');
  if (!form) return;

  const showFeedback = (message, kind) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `form-feedback form-feedback-${kind}`;
    feedback.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    // No form endpoint configured yet: hand the message to the visitor's own
    // email app, and say so plainly instead of pretending it was sent.
    if (!contact.formEndpoint) {
      const subject = encodeURIComponent(data.get('subject') || 'Portfolio enquiry');
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      showFeedback(`Your email app should now open with this message ready to send. If nothing opened, email ${contact.email} directly.`, 'info');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      showFeedback(`Thank you — your message reached Archie. Expect a reply within ${contact.responseTime || '24 hours'}.`, 'success');
    } catch (err) {
      console.error('Contact form failed:', err);
      showFeedback(`Sorry, the message could not be sent. Please email ${contact.email} directly.`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

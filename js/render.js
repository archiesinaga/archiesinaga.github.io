/**
 * render.js - Dynamic Template Rendering Engine from /data/*.json
 * Keeps HTML clean and content strictly separated into JSON files.
 */

import { modal } from './modal.js';

export function renderProfile(profile) {
  // Hero texts
  const heroNameEl = document.getElementById('hero-name');
  const heroRoleEl = document.getElementById('hero-role');
  const heroMottoEl = document.getElementById('hero-motto');
  const brandNameEl = document.getElementById('brand-name');
  const footerYearEl = document.getElementById('footer-year');

  if (heroNameEl) heroNameEl.textContent = `I'm ${profile.name}`;
  if (heroRoleEl) heroRoleEl.textContent = profile.headline_role;
  if (heroMottoEl) heroMottoEl.textContent = profile.motto;
  if (brandNameEl) brandNameEl.textContent = profile.nickname || profile.name;

  const heroAvatarImg = document.querySelector('.hero-avatar-img');
  if (heroAvatarImg && profile.avatar) {
    heroAvatarImg.src = profile.avatar;
    heroAvatarImg.alt = `${profile.name} Profile Avatar`;
  }

  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // Social Links in Navbar
  const socialLinksHtml = (profile.socials || []).map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="btn btn-icon btn-sm" aria-label="${s.name}" title="${s.name}">
        ${getSocialSvg(s.name)}
      </a>
    `).join('');
  ['nav-socials', 'footer-socials'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = socialLinksHtml;
  });

  // Contact Info Panel
  const contactInfoContainer = document.getElementById('contact-info-list');
  if (contactInfoContainer && profile.contact) {
    contactInfoContainer.innerHTML = `
      <div class="contact-item-card">
        <div class="contact-item-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">Direct Email</div>
          <a href="mailto:${profile.contact.email}" style="color: var(--accent-primary); font-weight: 600;">${profile.contact.email}</a>
          <div class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">Response time: ${profile.contact.responseTime}</div>
        </div>
      </div>

      ${profile.contact.phone ? `
      <div class="contact-item-card">
        <div class="contact-item-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">Phone / WhatsApp</div>
          <a href="https://wa.me/${profile.contact.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); font-weight: 600;">${profile.contact.phone}</a>
          <div class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">Direct mobile / WhatsApp chat</div>
        </div>
      </div>
      ` : ''}

      <div class="contact-item-card">
        <div class="contact-item-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">Current Location</div>
          <div class="text-secondary">${profile.contact.location}</div>
          <div class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">Timezone: ${profile.timezone}</div>
        </div>
      </div>

      <div class="contact-item-card">
        <div class="contact-item-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">Status & Availability</div>
          <span class="badge badge-live" style="margin-top: 0.35rem;">${profile.contact.availability}</span>
        </div>
      </div>
    `;
  }
}

export function renderStats(stats) {
  const container = document.getElementById('stats-grid-container');
  if (!container || !stats) return;

  container.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-val" data-target="${s.target}" data-suffix="${s.suffix}">${s.target}${s.suffix}</div>
      <div class="stat-lbl">${s.label}</div>
    </div>
  `).join('');
}

export function renderExpertise(items) {
  const container = document.getElementById('expertise-grid-container');
  if (!container || !items) return;

  container.innerHTML = items.map(item => `
    <div class="expertise-card" data-expertise-id="${item.id}" tabindex="0" role="button" aria-label="Details for ${item.title}">
      <div class="expertise-icon-box">
        ${getExpertiseSvg(item.icon)}
      </div>
      <h3 class="expertise-title">${item.title}</h3>
      <p class="expertise-summary">${item.summary}</p>
      <div class="expertise-cta">
        Explore Capabilities
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  `).join('');

  // Wire modal on click
  container.querySelectorAll('.expertise-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.expertiseId;
      const data = items.find(i => i.id === id);
      if (data) {
        openExpertiseModal(data);
      }
    });
  });
}

function openExpertiseModal(data) {
  const content = `
    <div style="margin-bottom: 1.5rem;">
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.25rem;">${data.summary}</p>
      <h4 style="color: var(--accent-primary); margin-bottom: 0.75rem;">Core Capabilities:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem;">
        ${data.capabilities.map(c => `
          <li style="position: relative; padding-left: 1.5rem; font-size: 0.95rem;">
            <span style="position: absolute; left: 0; color: var(--accent-primary); font-weight: bold;">✔</span>
            ${c}
          </li>
        `).join('')}
      </ul>
      <h4 style="margin-bottom: 0.75rem;">Preferred Tech Stack:</h4>
      <div class="tag-list">
        ${data.stack.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>
  `;
  modal.open(data.title, content);
}



export function renderSkillsAndActivities(skills, orgs, education, certs) {
  // Organizations list
  const orgContainer = document.getElementById('org-list-container');
  if (orgContainer && orgs) {
    orgContainer.innerHTML = orgs.map(o => `
      <div class="org-card">
        <div class="org-header">
          <span class="org-name">${o.name}</span>
          <span class="badge badge-accent" style="font-size: 0.7rem;">${o.badge}</span>
        </div>
        <div class="org-role">${o.role} • <span class="text-muted">${o.period}</span></div>
        <p class="org-desc">${o.description}</p>
      </div>
    `).join('');
  }

  // Technical Ecosystem (Unified 8 Core Skills)
  const skillsContainer = document.getElementById('skills-categorized-container');
  if (skillsContainer && skills) {
    skillsContainer.innerHTML = `
      <div class="skill-category-block" style="margin-bottom: 0;">
        <div class="skills-icon-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.85rem;">
          ${skills.slice(0, 8).map(item => `
            <div class="skill-chip" style="padding: 0.85rem 0.65rem; background: var(--bg-main); border: 1px solid var(--surface-border); border-radius: var(--radius-md);">
              <div style="color: var(--accent-primary); margin-bottom: 0.25rem;">
                ${getSkillSvg(item.icon)}
              </div>
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.85rem; line-height: 1.2;">${item.name}</span>
              <span class="badge badge-accent" style="font-size: 0.65rem; margin-top: 0.2rem; padding: 0.15rem 0.5rem;">${item.level}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Clear education & certifications container if present
  const eduContainer = document.getElementById('education-certs-container');
  if (eduContainer) {
    eduContainer.innerHTML = '';
  }
}

// Icon helper functions
function getSkillSvg(icon) {
  switch (icon) {
    case 'python':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
    case 'database':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    case 'cpu':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
    case 'bot':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
    case 'bar-chart-3':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`;
    case 'pie-chart':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`;
    case 'code-2':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    case 'server':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`;
    default:
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
}

function getExpertiseSvg(icon) {
  switch (icon) {
    case 'cpu':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
    case 'bot':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
    case 'bar-chart-3':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`;
    case 'code-2':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    case 'scan-face':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M10 15c.5.5 1.5.5 2 0"/></svg>`;
    case 'message-square-text':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>`;
    case 'cloud':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
}

function getSocialSvg(name) {
  switch (name.toLowerCase()) {
    case 'github':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
    case 'linkedin':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
    case 'instagram':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
    case 'spotify':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  }
}

function escapeAndHighlightCode(raw) {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(async|def|void|return|auto|if|class|import|from)/g, '<span class="keyword">$1</span>')
    .replace(/(validate_taxonomy|processFrame|similarity_search|rerank|evaluate_taxonomic_fit)/g, '<span class="function">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
    .replace(/(#.*|\/\/.*)/g, '<span class="comment">$1</span>');
}

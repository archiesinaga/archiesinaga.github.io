/**
 * filters.js - 3-Level Cumulative Project Filtering System
 * Filter 1: Type (All / Tech / Non-Tech)
 * Filter 2: Domain (AI/ML, Data Science, Full Stack, UI/UX, etc.)
 * Filter 3: Topic Sub-tags (RAG, Multi-Agent, NLP, etc.)
 */

import { modal } from './modal.js';

export class ProjectFilterManager {
  constructor(containerId, filterBarId, projects) {
    this.container = document.getElementById(containerId);
    this.filterBar = document.getElementById(filterBarId);
    this.projects = projects || [];
    this.activeType = 'all';
    this.activeDomain = 'all';
    this.activeTopic = 'all';

    if (this.container) {
      this.init();
    }
  }

  init() {
    if (this.filterBar) {
      this.buildFilterControls();
      this.applyFilters();
      this.setupFilterEvents();
    } else {
      this.renderGrid(this.projects);
    }
    this.setupCardEvents();
  }

  buildFilterControls() {
    // Extract unique domains, and the most-shared topics so the row stays short
    const domains = Array.from(new Set(this.projects.map(p => p.domain))).filter(Boolean);
    const topicCounts = {};
    this.projects.flatMap(p => p.topics || []).forEach(t => { topicCounts[t] = (topicCounts[t] || 0) + 1; });
    const topics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);

    this.filterBar.innerHTML = `
      <div class="filter-group">
        <span class="filter-label">1. Type:</span>
        <button class="filter-btn active" data-filter="type" data-value="all">All Types</button>
        <button class="filter-btn" data-filter="type" data-value="tech">Tech Projects</button>
        <button class="filter-btn" data-filter="type" data-value="non-tech">Non-Tech / Org</button>
      </div>

      <div class="filter-group">
        <span class="filter-label">2. Domain:</span>
        <button class="filter-btn active" data-filter="domain" data-value="all">All Domains</button>
        ${domains.map(d => `
          <button class="filter-btn" data-filter="domain" data-value="${d}">
            ${formatDomain(d)}
          </button>
        `).join('')}
      </div>

      <div class="filter-group">
        <span class="filter-label">3. Topic:</span>
        <button class="filter-btn active" data-filter="topic" data-value="all">All Topics</button>
        ${topics.slice(0, 8).map(t => `
          <button class="filter-btn" data-filter="topic" data-value="${t}">
            #${t}
          </button>
        `).join('')}
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3 pt-2" style="border-top: 1px solid var(--surface-border-subtle);">
        <span class="text-muted" style="font-size: 0.85rem;" id="project-count-badge">Showing ${this.projects.length} Projects</span>
        <button class="btn btn-outline btn-sm" id="reset-filters-btn" style="font-size: 0.775rem;">Reset All Filters</button>
      </div>
    `;
  }

  setupFilterEvents() {
    if (!this.filterBar) return;
    this.filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) {
        const filterType = btn.dataset.filter;
        const filterVal = btn.dataset.value;

        // Update active class within that group
        const groupBtns = this.filterBar.querySelectorAll(`[data-filter="${filterType}"]`);
        groupBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (filterType === 'type') this.activeType = filterVal;
        if (filterType === 'domain') this.activeDomain = filterVal;
        if (filterType === 'topic') this.activeTopic = filterVal;

        this.applyFilters();
      }

      if (e.target.closest('#reset-filters-btn')) {
        this.reset();
      }
    });
  }

  setupCardEvents() {
    if (!this.container) return;
    const openFromCard = (card) => {
      const project = this.projects.find(p => p.id === card.dataset.projectId);
      if (project) this.openProjectModal(project);
    };

    // Project card click -> open preview modal (links inside the card navigate instead)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const card = e.target.closest('.project-card');
      if (card) openFromCard(card);
    });

    // Cards are role="button", so they must also respond to Enter and Space
    this.container.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.project-card');
      if (card && e.target === card) {
        e.preventDefault();
        openFromCard(card);
      }
    });
  }

  reset() {
    this.activeType = 'all';
    this.activeDomain = 'all';
    this.activeTopic = 'all';

    const buttons = this.filterBar.querySelectorAll('.filter-btn');
    buttons.forEach(b => {
      b.classList.toggle('active', b.dataset.value === 'all');
    });

    this.applyFilters();
  }

  applyFilters() {
    // Cumulative (AND) filtering
    const filtered = this.projects.filter(item => {
      const matchType = this.activeType === 'all' || item.type === this.activeType;
      const matchDomain = this.activeDomain === 'all' || item.domain === this.activeDomain;
      const matchTopic = this.activeTopic === 'all' || (item.topics && item.topics.includes(this.activeTopic));
      return matchType && matchDomain && matchTopic;
    });

    const countBadge = document.getElementById('project-count-badge');
    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${this.projects.length} Projects`;
    }

    this.renderGrid(filtered);
  }

  renderGrid(items) {
    if (items.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem auto; color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3 style="margin-bottom: 0.5rem;">No matching projects found</h3>
          <p class="text-muted" style="margin-bottom: 1.5rem;">Try relaxing your domain or topic filter criteria.</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('reset-filters-btn').click()">Reset Filters</button>
        </div>
      `;
      return;
    }

    this.container.innerHTML = items.map(p => `
      <div class="project-card" data-project-id="${p.id}" tabindex="0" role="button" aria-label="View details for ${p.title}">
        <div class="project-card-top">
          <span class="badge ${p.type === 'tech' ? 'badge-accent' : 'badge-live'}">${formatDomain(p.domain)}</span>
          ${p.repo ? `<span class="project-repo-flag" title="Source code on GitHub">${GITHUB_SVG} Open source</span>` : `<span class="text-muted" style="font-size: 0.775rem;">${p.type === 'tech' ? 'TECH' : 'NON-TECH'}</span>`}
        </div>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-summary">${p.summary}</p>
        <div class="tag-list mt-auto mb-3">
          ${(p.tech || []).slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="project-card-footer">
          <span class="project-card-more">
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
          ${p.repo ? `
          <a href="${p.repo}" target="_blank" rel="noopener noreferrer" class="btn btn-icon btn-sm" aria-label="View ${p.title} source code on GitHub" title="View source on GitHub">
            ${GITHUB_SVG}
          </a>` : ''}
        </div>
      </div>
    `).join('');
  }

  openProjectModal(p) {
    const content = `
      <div style="margin-bottom: 1.5rem;">
        <div class="d-flex gap-2 mb-2">
          <span class="badge badge-accent">${p.type === 'tech' ? 'TECH' : 'NON-TECH'}</span>
          <span class="badge badge-live">${formatDomain(p.domain)}</span>
        </div>
        <h3 style="margin-top: 0.5rem; margin-bottom: 0.75rem;">${p.title}</h3>
        <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.25rem;">${p.summary}</p>
        <p class="text-secondary" style="margin-bottom: 1.5rem; line-height: 1.6;">${p.details || ''}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.65rem; color: var(--accent-primary);">Topics & Architectural Patterns:</h4>
        <div class="tag-list mb-3">
          ${(p.topics || []).map(topic => `<span class="tag">#${topic}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.65rem; color: var(--accent-primary);">Technologies & Frameworks:</h4>
        <div class="tag-list">
          ${(p.tech || []).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>

      ${p.note ? `<p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.25rem;"><strong>Note:</strong> ${p.note}</p>` : ''}

      ${projectActions(p)}
    `;
    modal.open(p.title, content);
  }
}

const GITHUB_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

const EXTERNAL_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

const DOMAIN_LABELS = {
  'ai-ml': 'AI / ML',
  'data-science': 'Data Science',
  'full-stack': 'Full-Stack',
  'iot': 'IoT',
  'design': 'Design',
  'leadership': 'Leadership'
};

function formatDomain(d) {
  return DOMAIN_LABELS[d] || d.replace(/-/g, ' ');
}

// Each button is labelled by where it actually goes, never a generic "Visit Repository"
function demoLabel(url) {
  if (url.includes('youtu')) return 'Watch Demo Video';
  if (url.includes('linkedin.com')) return 'View on LinkedIn';
  return 'Live Demo';
}

export function projectActions(p) {
  const buttons = [];
  if (p.repo) {
    buttons.push(`<a href="${p.repo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">${GITHUB_SVG} View Source on GitHub</a>`);
  }
  if (p.demo) {
    buttons.push(`<a href="${p.demo}" target="_blank" rel="noopener noreferrer" class="btn ${p.repo ? 'btn-outline' : 'btn-primary'} btn-sm">${EXTERNAL_SVG} ${demoLabel(p.demo)}</a>`);
  }
  if (!buttons.length) {
    return `<p class="text-muted pt-3" style="border-top: 1px solid var(--surface-border); font-size: 0.85rem; margin: 0;">No public repository — source belongs to the organisation or the work is non-code.</p>`;
  }
  return `<div class="modal-actions">${buttons.join('')}</div>`;
}

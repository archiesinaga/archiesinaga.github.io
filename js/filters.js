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
    // Extract unique domains & topics
    const domains = Array.from(new Set(this.projects.map(p => p.domain))).filter(Boolean);
    const topics = Array.from(new Set(this.projects.flatMap(p => p.topics || []))).filter(Boolean);

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
            ${d.replace('-', ' ').toUpperCase()}
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
    // Project card click -> open preview modal
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) {
        const projId = card.dataset.projectId;
        const project = this.projects.find(p => p.id === projId);
        if (project) {
          this.openProjectModal(project);
        }
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
          <span class="badge ${p.type === 'tech' ? 'badge-accent' : 'badge-live'}">${p.domain.toUpperCase()}</span>
          <span class="text-muted" style="font-size: 0.775rem;">${p.type.toUpperCase()}</span>
        </div>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-summary">${p.summary}</p>
        <div class="tag-list mt-auto mb-3">
          ${(p.tech || []).slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="d-flex justify-content-between align-items-center pt-2" style="border-top: 1px solid var(--surface-border-subtle);">
          <span style="font-size: 0.825rem; font-weight: 600; color: var(--accent-primary); display: flex; align-items: center; gap: 0.35rem;">
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn btn-icon btn-sm" onclick="event.stopPropagation()" aria-label="Open project repository">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    `).join('');
  }

  openProjectModal(p) {
    const content = `
      <div style="margin-bottom: 1.5rem;">
        <div class="d-flex gap-2 mb-2">
          <span class="badge badge-accent">${p.type.toUpperCase()}</span>
          <span class="badge badge-live">${p.domain.toUpperCase()}</span>
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

      <div class="d-flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--surface-border);">
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Visit Repository / Source
        </a>
      </div>
    `;
    modal.open(p.title, content);
  }
}

/**
 * carousel.js - Professional Experience & Active Systems Swiper Carousels
 * Supports keyboard navigation, touch swipe gestures, mouse dragging,
 * dot pagination, and metrics/AI modals.
 */

import { modal } from './modal.js';

/* ==========================================================================
   1. Active Systems Swiper Carousel (Featured Active Projects)
   ========================================================================== */
export class ActiveSystemsCarousel {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = data || [];
    this.currentIndex = 0;
    this.track = null;
    this.dotsContainer = null;
    this.wrapper = null;

    // Gesture tracking
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.touchStartY = 0;

    if (this.container && this.data.length > 0) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="active-slider-container" role="region" aria-roledescription="carousel" aria-label="Active Systems Carousel">
        <div class="active-slider-wrapper" id="active-slider-wrapper">
          <div class="active-slider-track" id="active-slider-track">
            ${this.data.map((item, index) => this.renderSlide(item, index)).join('')}
          </div>
        </div>

        <!-- Controls: Prev, Dots, Next (matching design reference) -->
        <div class="active-slider-controls">
          <button class="active-slider-btn" id="active-prev-btn" aria-label="Previous active project">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div class="active-slider-dots" id="active-slider-dots">
            ${this.data.map((_, i) => `
              <button class="active-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
            `).join('')}
          </div>

          <button class="active-slider-btn" id="active-next-btn" aria-label="Next active project">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `;

    this.wrapper = document.getElementById('active-slider-wrapper');
    this.track = document.getElementById('active-slider-track');
    this.dotsContainer = document.getElementById('active-slider-dots');
  }

  renderSlide(proj, index) {
    return `
      <div class="active-slider-slide" data-slide-index="${index}">
        <div class="active-project-card">
          <div class="active-proj-header">
            <div>
              <span class="badge ${proj.badge_type === 'primary' ? 'badge-live' : 'badge-accent'} mb-2">${proj.status}</span>
              <h3 class="active-proj-title">${proj.title}</h3>
            </div>
            <span class="text-muted" style="font-size: 0.8rem; font-weight: 600;">System ${index + 1} of ${this.data.length}</span>
          </div>
          <div class="active-proj-subtitle">${proj.subtitle}</div>
          <p class="active-proj-desc">${proj.description}</p>

          <ul class="active-proj-highlights">
            ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>

          <!-- Code Snippet Box -->
          <div class="code-panel">
            <div class="code-header">
              <div class="code-dots">
                <span class="code-dot red"></span>
                <span class="code-dot yellow"></span>
                <span class="code-dot green"></span>
              </div>
              <span class="code-lang">Architecture Node</span>
            </div>
            <div class="code-body">${this.highlightCode(proj.code_snippet)}</div>
          </div>

          <div class="tag-list mb-3">
            ${proj.tech.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>

          <div class="active-proj-metrics">
            ${proj.metrics.map(m => `
              <div>
                <div class="active-metric-val">${m.value}</div>
                <div class="active-metric-lbl">${m.label}</div>
              </div>
            `).join('')}
          </div>

          <div class="active-proj-actions">
            <button class="btn btn-primary btn-sm ask-ai-project-btn" data-project-title="${proj.title}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask AI about this
            </button>
            <a href="${proj.github_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Source Code
            </a>
          </div>
        </div>
      </div>
    `;
  }

  highlightCode(raw) {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(async|def|void|return|auto|if|class|import|from)/g, '<span class="keyword">$1</span>')
      .replace(/(validate_taxonomy|processFrame|similarity_search|rerank|evaluate_taxonomic_fit|render_subsurface_strata)/g, '<span class="function">$1</span>')
      .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
      .replace(/(#.*|\/\/.*)/g, '<span class="comment">$1</span>');
  }

  setupEvents() {
    const prevBtn = document.getElementById('active-prev-btn');
    const nextBtn = document.getElementById('active-next-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.active-slider-dot');
        if (dot) {
          const index = parseInt(dot.dataset.index, 10);
          this.goTo(index);
        }
      });
    }

    // Touch Swipe Gestures
    this.wrapper.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.currentX = this.startX;
      this.isDragging = true;
    }, { passive: true });

    this.wrapper.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.currentX = e.touches[0].clientX;
    }, { passive: true });

    this.wrapper.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const diffX = this.startX - this.currentX;
      const diffY = Math.abs((e.changedTouches[0]?.clientY || 0) - this.touchStartY);

      // Only trigger horizontal swipe if movement is primarily horizontal
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
        if (diffX > 0) this.next();
        else this.prev();
      }
    });

    // Mouse Dragging Swipe Gestures
    this.wrapper.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons, links or code selection
      if (e.target.closest('button, a, pre, code')) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.currentX = e.clientX;
      this.wrapper.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.currentX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.wrapper?.classList.remove('is-dragging');
      const diffX = this.startX - this.currentX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) this.next();
        else this.prev();
      }
    });

    // Keyboard Arrow navigation when active systems section is visible
    document.addEventListener('keydown', (e) => {
      const rect = this.container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView && !modal.isOpen()) {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      }
    });

    // Ask AI event wiring
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.ask-ai-project-btn');
      if (btn) {
        const title = btn.dataset.projectTitle;
        document.dispatchEvent(new CustomEvent('ask-ai', { detail: { topic: title } }));
      }
    });
  }

  goTo(index) {
    if (index < 0) index = this.data.length - 1;
    if (index >= this.data.length) index = 0;
    this.currentIndex = index;

    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    const dots = this.dotsContainer?.querySelectorAll('.active-slider-dot');
    dots?.forEach((d, i) => {
      d.classList.toggle('active', i === this.currentIndex);
    });
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }
}

/* ==========================================================================
   2. News Feed Swiper Carousel (Publications & Dispatches)
   ========================================================================== */
export class NewsFeedCarousel {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = data || [];
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;

    if (this.container && this.data.length > 0) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="news-slider-wrap">
        <div class="news-slider-track" id="news-slider-track">
          ${this.data.map(item => `
            <div class="news-card">
              <div class="news-meta">
                <span class="badge badge-accent">${item.type}</span>
                <span>${item.date}</span>
              </div>
              <h4 class="news-card-title">${item.title}</h4>
              <p class="news-card-summary">${item.summary}</p>
              <div class="tag-list mb-3">
                ${item.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
              </div>
              <div class="mt-auto">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width: 100%;">
                  Read on ${item.platform.split('/')[0]}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="news-swipe-indicator">
        <button class="btn btn-icon btn-sm" id="news-prev-btn" aria-label="Previous article">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="text-muted" style="font-size: 0.8rem;">← Swipe / Drag articles →</span>
        <button class="btn btn-icon btn-sm" id="news-next-btn" aria-label="Next article">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;
  }

  setupEvents() {
    const track = document.getElementById('news-slider-track');
    const prevBtn = document.getElementById('news-prev-btn');
    const nextBtn = document.getElementById('news-next-btn');

    if (track) {
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          track.scrollBy({ left: -360, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          track.scrollBy({ left: 360, behavior: 'smooth' });
        });
      }

      // Touch swipe
      track.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        const diff = this.touchStartX - this.touchEndX;
        if (Math.abs(diff) > 40) {
          track.scrollBy({ left: diff > 0 ? 320 : -320, behavior: 'smooth' });
        }
      }, { passive: true });
    }
  }
}

/* ==========================================================================
   3. Professional Experience Carousel
   ========================================================================== */
export class ExperienceCarousel {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = data || [];
    this.currentIndex = 0;
    this.track = null;
    this.dotsContainer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;

    if (this.container && this.data.length > 0) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="carousel-wrapper" role="region" aria-label="Experience Carousel">
        <div class="carousel-track" id="exp-carousel-track">
          ${this.data.map((item, index) => this.renderSlide(item, index)).join('')}
        </div>
      </div>
      <div class="carousel-controls">
        <button class="btn btn-icon" id="exp-prev-btn" aria-label="Previous Experience">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="carousel-dots" id="exp-carousel-dots">
          ${this.data.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
        </div>
        <button class="btn btn-icon" id="exp-next-btn" aria-label="Next Experience">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    this.track = document.getElementById('exp-carousel-track');
    this.dotsContainer = document.getElementById('exp-carousel-dots');
  }

  renderSlide(item, index) {
    return `
      <div class="carousel-slide" data-slide-index="${index}">
        <div class="exp-card-large">
          <div class="exp-image-box">
            <img src="${item.image}" alt="${item.role} at ${item.org}" loading="lazy" onerror="this.src='image/exp-nexus.svg'">
            <div class="exp-image-overlay"></div>
          </div>
          <div class="exp-content">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="exp-period">${item.period} ${item.isCurrent ? '• <span class="badge badge-live">Present</span>' : ''}</span>
            </div>
            <h3 class="exp-role">${item.role}</h3>
            <div class="exp-org">${item.org} • <span class="text-muted">${item.location}</span></div>
            <p class="exp-summary">${item.summary}</p>
            <div class="tag-list mb-4">
              ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="mt-auto">
              <button class="btn btn-primary btn-sm exp-metrics-trigger" data-index="${index}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Click for Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEvents() {
    const prevBtn = document.getElementById('exp-prev-btn');
    const nextBtn = document.getElementById('exp-next-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.carousel-dot');
        if (dot) {
          const index = parseInt(dot.dataset.index, 10);
          this.goTo(index);
        }
      });
    }

    // Metrics modal trigger
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.exp-metrics-trigger');
      if (btn) {
        const index = parseInt(btn.dataset.index, 10);
        this.openMetricsModal(this.data[index]);
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const rect = this.container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView && !modal.isOpen()) {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      }
    });

    // Touch swipe support
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }

  goTo(index) {
    if (index < 0) index = this.data.length - 1;
    if (index >= this.data.length) index = 0;
    this.currentIndex = index;

    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
    dots?.forEach((d, i) => {
      d.classList.toggle('active', i === this.currentIndex);
    });
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  openMetricsModal(item) {
    const metricsHtml = `
      <div style="margin-bottom: 1.5rem;">
        <span class="section-tag">${item.period}</span>
        <h3 style="margin-top: 0.5rem; margin-bottom: 0.25rem;">${item.role}</h3>
        <p class="text-muted" style="margin-bottom: 1.5rem;">${item.org} • ${item.location}</p>
        <p style="margin-bottom: 1.5rem;">${item.summary}</p>
      </div>
      <h4 style="margin-bottom: 1rem; color: var(--accent-primary);">Quantified Impact & Key Results:</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        ${item.metrics.map(m => `
          <div style="background: var(--bg-main); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-primary); font-family: var(--font-heading);">${m.val}</div>
            <div style="font-weight: 600; font-size: 0.85rem; margin-top: 0.25rem;">${m.label}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.35rem;">${m.desc}</div>
          </div>
        `).join('')}
      </div>
      <h4 style="margin-bottom: 0.75rem;">Core Technologies Utilized:</h4>
      <div class="tag-list">
        ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    `;
    modal.open(`Performance Metrics — ${item.org}`, metricsHtml);
  }
}

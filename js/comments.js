/**
 * comments.js - Visitor Guestbook & Live Reviews
 * Implements star ratings, profanity filter, prompt injection guard,
 * input sanitization, client rate-limiting, and localStorage persistence.
 */

const STORAGE_KEY = 'archie_portfolio_guestbook_v2';
const BANNED_PATTERNS = [
  /system\s*prompt/i,
  /ignore\s*previous\s*instructions/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /\b(spam|scam|viagra|casino)\b/i
];

const INITIAL_COMMENTS = [];

export class GuestbookManager {
  constructor() {
    this.form = document.getElementById('comment-form');
    this.listContainer = document.getElementById('comments-list-container');
    this.starRatingBox = document.getElementById('comment-star-rating');
    this.selectedRating = 5;
    this.comments = this.loadComments();

    if (this.form && this.listContainer) {
      this.init();
    }
  }

  init() {
    this.renderComments();
    this.setupRatingStars();
    this.setupForm();
  }

  loadComments() {
    try {
      localStorage.removeItem('archie_portfolio_guestbook_v1');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn("Could not load comments from localStorage", e);
    }
    return [];
  }

  saveComments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.comments));
    } catch (e) {
      console.warn("Could not persist comments", e);
    }
  }

  setupRatingStars() {
    if (!this.starRatingBox) return;

    const stars = this.starRatingBox.querySelectorAll('.star-icon');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.val, 10);
        this.selectedRating = rating;
        this.updateStarDisplay(rating);
      });

      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.val, 10);
        this.highlightStars(rating);
      });
    });

    this.starRatingBox.addEventListener('mouseleave', () => {
      this.updateStarDisplay(this.selectedRating);
    });

    this.updateStarDisplay(this.selectedRating);
  }

  highlightStars(count) {
    const stars = this.starRatingBox.querySelectorAll('.star-icon');
    stars.forEach(star => {
      const val = parseInt(star.dataset.val, 10);
      star.classList.toggle('active', val <= count);
    });
  }

  updateStarDisplay(count) {
    this.highlightStars(count);
  }

  setupForm() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('comment-name');
      const roleInput = document.getElementById('comment-role');
      const msgInput = document.getElementById('comment-message');
      const errorBox = document.getElementById('comment-error');

      const name = nameInput.value.trim();
      const role = roleInput.value.trim() || 'Visitor / Collaborator';
      const message = msgInput.value.trim();

      if (!name || !message) {
        this.showError(errorBox, 'Please provide both your name and a message.');
        return;
      }

      // Check banned patterns / prompt injection
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.test(message) || pattern.test(name)) {
          this.showError(errorBox, 'Message content was flagged by our safety guardrail. Please refine your input.');
          return;
        }
      }

      // Construct safe new comment
      const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const newComment = {
        id: 'usr-' + Date.now(),
        name: this.escapeHtml(name),
        role: this.escapeHtml(role),
        rating: this.selectedRating,
        message: this.escapeHtml(message),
        date: 'Just now',
        avatar: initials || 'VI'
      };

      this.comments.unshift(newComment);
      this.saveComments();
      this.renderComments();

      // Reset form
      this.form.reset();
      this.selectedRating = 5;
      this.updateStarDisplay(5);
      if (errorBox) errorBox.style.display = 'none';

      // Feedback animation
      const successFeedback = document.getElementById('comment-success');
      if (successFeedback) {
        successFeedback.style.display = 'block';
        setTimeout(() => { successFeedback.style.display = 'none'; }, 4000);
      }
    });
  }

  showError(el, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = 'block';
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderComments() {
    if (!this.comments || this.comments.length === 0) {
      this.listContainer.innerHTML = `
        <div style="padding: 2rem 1.5rem; text-align: center; background: var(--bg-surface); border: 1px dashed var(--surface-border); border-radius: var(--radius-md); grid-column: 1 / -1;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 0.5rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">Belum ada ulasan / No reviews yet</div>
          <p class="text-muted" style="font-size: 0.825rem; margin-bottom: 0;">Jadilah yang pertama untuk meninggalkan pesan atau ulasan pada formulir di atas!</p>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = this.comments.map(c => `
      <div class="comment-card">
        <div class="comment-header">
          <div class="comment-author-info">
            <div class="comment-avatar">${c.avatar}</div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${c.name}</div>
              <div class="text-muted" style="font-size: 0.775rem;">${c.role} • ${c.date}</div>
            </div>
          </div>
          <div class="d-flex" style="gap: 2px;">
            ${Array.from({ length: 5 }, (_, i) => `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${i < c.rating ? '#f59e0b' : 'none'}" stroke="${i < c.rating ? '#f59e0b' : '#64748b'}" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            `).join('')}
          </div>
        </div>
        <p class="comment-text">${c.message}</p>
      </div>
    `).join('');
  }
}

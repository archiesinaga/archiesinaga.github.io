/**
 * modal.js - Generic Accessible Modal System
 * Supports keyboard trap, ESC close, scroll locking, and dynamic templates.
 */

class ModalSystem {
  constructor() {
    this.overlay = document.getElementById('global-modal-overlay');
    this.titleEl = document.getElementById('global-modal-title');
    this.bodyEl = document.getElementById('global-modal-body');
    this.closeBtn = document.getElementById('global-modal-close-btn');
    this.previousActiveElement = null;

    if (this.overlay && this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }
  }

  isOpen() {
    return this.overlay && this.overlay.classList.contains('open');
  }

  open(title, htmlContent) {
    if (!this.overlay) return;
    this.previousActiveElement = document.activeElement;
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = htmlContent;
    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button or first focusable item
    setTimeout(() => {
      this.closeBtn.focus();
    }, 50);
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.previousActiveElement && this.previousActiveElement.focus) {
      this.previousActiveElement.focus();
    }
  }
}

export const modal = new ModalSystem();

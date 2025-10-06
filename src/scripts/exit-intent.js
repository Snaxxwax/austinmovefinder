/**
 * Exit Intent Detection
 * Shows modal when user shows intent to leave page
 * With frequency capping and analytics tracking
 */

class ExitIntentManager {
  constructor() {
    this.modal = null;
    this.isShown = false;
    this.minDelayMs = 15000; // 15 seconds minimum before showing
    this.pageLoadTime = Date.now();
    this.inactivityTimer = null;
    this.inactivityThreshold = 30000; // 30 seconds
    this.hasInteractedWithForm = false;

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    document.addEventListener('DOMContentLoaded', () => {
      // Check if already shown this session
      if (sessionStorage.getItem('exitIntentShown') === 'true') {
        return;
      }

      // Check if form already submitted
      if (sessionStorage.getItem('formSubmitted') === 'true') {
        return;
      }

      this.setupModal();
      this.setupTriggers();
    });
  }

  setupModal() {
    this.modal = document.getElementById('exit-intent-modal');
    if (!this.modal) {
      console.warn('Exit intent modal not found');
      return;
    }

    // Setup close handlers
    const closeButtons = this.modal.querySelectorAll('[data-close-modal]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal('close_button');
      });
    });

    // Setup CTA handler
    const ctaButton = this.modal.querySelector('[data-exit-cta]');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        this.trackEvent('exit_intent_cta_clicked');
        this.closeModal('cta_clicked');
        // Scroll to form
        const form = document.getElementById('quote-form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isShown) {
        this.closeModal('escape_key');
      }
    });
  }

  setupTriggers() {
    // Desktop: Mouse leave detection
    if (!this.isMobile()) {
      document.addEventListener('mouseleave', (e) => {
        // Only trigger if mouse leaves from top of page
        if (e.clientY < 10) {
          this.tryShowModal('mouse_exit');
        }
      });
    }

    // Mobile: Back button detection
    if (this.isMobile()) {
      let currentState = window.history.length;

      window.addEventListener('popstate', () => {
        if (window.history.length < currentState) {
          this.tryShowModal('back_button');
          // Prevent actual navigation
          window.history.pushState(null, '', window.location.href);
        }
      });

      // Add initial state
      window.history.pushState(null, '', window.location.href);
    }

    // Form field blur after inactivity
    this.setupFormInactivityDetection();
  }

  setupFormInactivityDetection() {
    const formFields = document.querySelectorAll('#quote-form input, #quote-form select, #quote-form textarea');

    formFields.forEach(field => {
      field.addEventListener('focus', () => {
        this.hasInteractedWithForm = true;
        this.resetInactivityTimer();
      });

      field.addEventListener('blur', () => {
        this.startInactivityTimer();
      });

      field.addEventListener('input', () => {
        this.resetInactivityTimer();
      });
    });
  }

  startInactivityTimer() {
    this.clearInactivityTimer();

    this.inactivityTimer = setTimeout(() => {
      if (this.hasInteractedWithForm && !this.isShown) {
        this.tryShowModal('form_inactivity');
      }
    }, this.inactivityThreshold);
  }

  resetInactivityTimer() {
    this.clearInactivityTimer();
    this.startInactivityTimer();
  }

  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  tryShowModal(trigger) {
    // Already shown
    if (this.isShown) return;

    // Not enough time has passed
    if (Date.now() - this.pageLoadTime < this.minDelayMs) {
      return;
    }

    // Already shown this session
    if (sessionStorage.getItem('exitIntentShown') === 'true') {
      return;
    }

    this.showModal(trigger);
  }

  showModal(trigger) {
    if (!this.modal || this.isShown) return;

    // Mark as shown
    this.isShown = true;
    sessionStorage.setItem('exitIntentShown', 'true');

    // Show modal
    this.modal.classList.add('visible');
    this.modal.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    this.lockBodyScroll();

    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = this.modal.querySelector('button, a, input');
      firstFocusable?.focus();
    }, 100);

    // Track analytics
    this.trackEvent('exit_intent_shown', { trigger });
  }

  closeModal(reason) {
    if (!this.modal || !this.isShown) return;

    // Hide modal
    this.modal.classList.remove('visible');
    this.modal.setAttribute('aria-hidden', 'true');

    // Unlock body scroll
    this.unlockBodyScroll();

    this.isShown = false;

    // Track analytics
    this.trackEvent('exit_intent_dismissed', { reason });
  }

  lockBodyScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  }

  unlockBodyScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  trackEvent(eventName, properties = {}) {
    // PostHog tracking
    if (typeof posthog !== 'undefined') {
      posthog.capture(eventName, properties);
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Exit Intent]', eventName, properties);
    }
  }
}

// Initialize
if (typeof window !== 'undefined') {
  window.exitIntentManager = new ExitIntentManager();
}

export default ExitIntentManager;

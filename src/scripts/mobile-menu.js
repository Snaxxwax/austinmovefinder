/**
 * Mobile Menu Script
 * Handles hamburger menu interactions with smooth animations and accessibility
 */

class MobileMenu {
  constructor() {
    // DOM elements
    this.hamburgerButton = document.getElementById('hamburgerButton');
    this.overlay = document.getElementById('mobileMenuOverlay');
    this.drawer = document.getElementById('mobileMenuDrawer');
    this.closeButton = document.getElementById('mobileMenuClose');
    this.navLinks = document.querySelectorAll('[data-mobile-nav-link]');

    // State
    this.isOpen = false;
    this.scrollPosition = 0;

    // Focusable elements for focus trap
    this.focusableElements = null;
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;

    // Check if elements exist
    if (!this.hamburgerButton || !this.overlay || !this.drawer) {
      console.warn('Mobile menu elements not found');
      return;
    }

    this.init();
  }

  init() {
    // Event listeners
    this.hamburgerButton.addEventListener('click', () => this.toggle());
    this.closeButton.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => this.handleOverlayClick(e));

    // Close on navigation link click
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // ESC key listener
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Focus trap
    this.drawer.addEventListener('keydown', (e) => this.handleFocusTrap(e));

    // Prevent scroll chaining on drawer
    this.drawer.addEventListener('touchmove', (e) => {
      const target = e.currentTarget;
      if (target.scrollHeight > target.clientHeight) {
        e.stopPropagation();
      }
    }, { passive: false });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    // Save scroll position and lock body
    this.scrollPosition = window.pageYOffset;
    document.body.classList.add('mobile-menu-open');
    document.body.style.top = `-${this.scrollPosition}px`;

    // Show menu
    this.overlay.setAttribute('aria-hidden', 'false');
    this.drawer.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Animate hamburger to X
    this.hamburgerButton.setAttribute('aria-expanded', 'true');
    this.hamburgerButton.classList.add('active');

    // Setup focus trap
    this.setupFocusTrap();

    // Focus first element after animation
    setTimeout(() => {
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }, 300);
  }

  close() {
    // Unlock body and restore scroll
    document.body.classList.remove('mobile-menu-open');
    document.body.style.top = '';
    window.scrollTo(0, this.scrollPosition);

    // Hide menu
    this.overlay.setAttribute('aria-hidden', 'true');
    this.drawer.setAttribute('aria-hidden', 'true');
    this.isOpen = false;

    // Animate X back to hamburger
    this.hamburgerButton.setAttribute('aria-expanded', 'false');
    this.hamburgerButton.classList.remove('active');

    // Return focus to hamburger button
    this.hamburgerButton.focus();
  }

  handleOverlayClick(e) {
    // Close only if clicking on overlay (not drawer)
    if (e.target === this.overlay) {
      this.close();
    }
  }

  handleKeyDown(e) {
    // Close on ESC key
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  setupFocusTrap() {
    // Get all focusable elements within drawer
    this.focusableElements = this.drawer.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (this.focusableElements.length === 0) return;

    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  handleFocusTrap(e) {
    if (!this.isOpen || e.key !== 'Tab') return;

    // Shift + Tab (backwards)
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault();
        this.lastFocusableElement.focus();
      }
    }
    // Tab (forwards)
    else {
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MobileMenu());
} else {
  new MobileMenu();
}

// Re-initialize on page transitions (for SPAs)
document.addEventListener('astro:page-load', () => new MobileMenu());
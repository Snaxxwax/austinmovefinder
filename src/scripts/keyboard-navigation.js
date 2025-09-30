/**
 * Keyboard Navigation Enhancement for Austin Move Finder Quote Form
 * Provides comprehensive keyboard accessibility following WCAG 2.1 AA guidelines
 */

class KeyboardNavigationManager {
  constructor() {
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '.service-card[role="radio"]'
    ].join(', ');

    this.currentFocusableElements = [];
    this.currentIndex = -1;

    this.init();
  }

  init() {
    this.setupGlobalKeyboardHandlers();
    this.setupServiceCardNavigation();
    this.setupFormNavigation();
    this.setupSkipNavigation();
    this.updateFocusableElements();

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
    });
  }

  setupGlobalKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      // Handle Escape key globally
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }

      // Handle Tab key for custom focus management
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }

      // Handle Enter and Space for custom interactive elements
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivationKeys(e);
      }

      // Handle arrow keys for grouped controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowKeys(e);
      }
    });

    // Update current focus tracking
    document.addEventListener('focusin', (e) => {
      this.currentIndex = this.currentFocusableElements.indexOf(e.target);
    });
  }

  setupServiceCardNavigation() {
    // Enhanced service card keyboard navigation with roving tabindex
    const setupCards = () => {
      const radioGroup = document.querySelector('.service-cards[role="radiogroup"]');
      if (!radioGroup) return;

      const cards = Array.from(radioGroup.querySelectorAll('.service-card[role="radio"]'));
      if (cards.length === 0) return;

      // Set up roving tabindex
      cards.forEach((card, index) => {
        const isSelected = card.getAttribute('aria-checked') === 'true';
        card.setAttribute('tabindex', isSelected ? '0' : '-1');

        // Remove previous event listeners to avoid duplicates
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        cards[index] = newCard;
      });

      // Re-get the cards after cloning
      const updatedCards = Array.from(radioGroup.querySelectorAll('.service-card[role="radio"]'));

      updatedCards.forEach((card, index) => {
        card.addEventListener('keydown', (e) => {
          let targetIndex = index;

          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              this.selectServiceCard(card, updatedCards);
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              e.preventDefault();
              targetIndex = (index + 1) % updatedCards.length;
              updatedCards[targetIndex].focus();
              break;
            case 'ArrowUp':
            case 'ArrowLeft':
              e.preventDefault();
              targetIndex = (index - 1 + updatedCards.length) % updatedCards.length;
              updatedCards[targetIndex].focus();
              break;
            case 'Home':
              e.preventDefault();
              updatedCards[0].focus();
              break;
            case 'End':
              e.preventDefault();
              updatedCards[updatedCards.length - 1].focus();
              break;
          }
        });

        card.addEventListener('click', () => {
          this.selectServiceCard(card, updatedCards);
        });
      });
    };

    // Set up initially and when steps change
    setupCards();
    document.addEventListener('stepLoaded', setupCards);
  }

  selectServiceCard(selectedCard, allCards) {
    // Update ARIA states and tabindex
    allCards.forEach((card) => {
      card.setAttribute('aria-checked', 'false');
      card.setAttribute('tabindex', '-1');
      card.classList.remove('selected');
    });

    selectedCard.setAttribute('aria-checked', 'true');
    selectedCard.setAttribute('tabindex', '0');
    selectedCard.classList.add('selected');

    // Update the associated radio button
    const radio = selectedCard.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Announce the selection
    const title = selectedCard.querySelector('.service-card-title')?.textContent;
    if (title) {
      this.announceToScreenReader(`Selected ${title}`);
    }
  }

  setupFormNavigation() {
    // Enhanced form field navigation
    document.addEventListener('keydown', (e) => {
      const target = e.target;

      // Auto-advance for certain field types
      if (target.matches('input[type="tel"]') && e.key.match(/[0-9]/)) {
        this.handlePhoneInput(target, e);
      }

      if (target.matches('input[pattern="[0-9]{5}"]') && e.key.match(/[0-9]/)) {
        this.handleZipInput(target, e);
      }

      // Handle checkbox groups
      if (target.matches('.checkbox-item input[type="checkbox"]')) {
        this.handleCheckboxNavigation(target, e);
      }
    });
  }

  handlePhoneInput(input, _e) {
    // Auto-format phone numbers and advance focus when complete
    setTimeout(() => {
      const value = input.value.replace(/\D/g, '');
      if (value.length === 10) {
        // Phone number is complete, move to next field
        this.focusNextField(input);
      }
    }, 0);
  }

  handleZipInput(input, _e) {
    // Auto-advance when ZIP code is complete
    setTimeout(() => {
      const value = input.value.replace(/\D/g, '');
      if (value.length === 5) {
        // ZIP code is complete, move to next field
        this.focusNextField(input);
      }
    }, 0);
  }

  handleCheckboxNavigation(checkbox, e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  setupSkipNavigation() {
    // Enhanced skip navigation functionality
    const skipLinks = document.querySelectorAll('.skip-nav-link');
    skipLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Remove tabindex after focus to maintain natural order
          setTimeout(() => {
            target.removeAttribute('tabindex');
          }, 100);
        }
      });
    });
  }

  handleEscapeKey(_e) {
    // Close any open dropdowns or suggestions
    const suggestions = document.querySelector('.zip-suggestions');
    if (suggestions) {
      suggestions.remove();
      return;
    }

    // Return focus to first form field if in a modal-like state
    const messageBox = document.querySelector('.message-box.show');
    if (messageBox && messageBox.getAttribute('tabindex') === '-1') {
      messageBox.classList.remove('show');
      const firstInput = document.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  handleTabKey(e) {
    // Custom tab handling for complex widgets
    const target = e.target;

    // Handle service card tab navigation
    if (target.matches('.service-card[role="radio"]')) {
      const radioGroup = target.closest('.service-cards[role="radiogroup"]');
      if (radioGroup) {
        // Let tab move out of the radio group naturally
        return;
      }
    }

    // Handle checkbox group navigation
    if (target.matches('.checkbox-item input[type="checkbox"]')) {
      // Allow natural tab flow through checkboxes
      return;
    }
  }

  handleActivationKeys(e) {
    const target = e.target;

    // Handle service card activation
    if (target.matches('.service-card[role="radio"]') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      target.click();
      return;
    }

    // Handle toggle switch activation
    if (target.matches('.toggle-switch') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const checkbox = target.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
  }

  handleArrowKeys(e) {
    const target = e.target;

    // Service card navigation is handled in setupServiceCardNavigation
    if (target.matches('.service-card[role="radio"]')) {
      return; // Handled by dedicated service card navigation
    }

    // Handle checkbox grid navigation
    if (target.matches('.checkbox-item input[type="checkbox"]')) {
      const checkboxGrid = target.closest('.checkbox-grid');
      if (checkboxGrid) {
        this.navigateCheckboxGrid(target, e.key);
      }
    }
  }

  navigateCheckboxGrid(currentCheckbox, key) {
    const grid = currentCheckbox.closest('.checkbox-grid');
    const checkboxes = Array.from(grid.querySelectorAll('input[type="checkbox"]'));
    const currentIndex = checkboxes.indexOf(currentCheckbox);
    const columns = this.getGridColumns(grid);
    let targetIndex = currentIndex;

    switch (key) {
      case 'ArrowRight':
        targetIndex = Math.min(currentIndex + 1, checkboxes.length - 1);
        break;
      case 'ArrowLeft':
        targetIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        targetIndex = Math.min(currentIndex + columns, checkboxes.length - 1);
        break;
      case 'ArrowUp':
        targetIndex = Math.max(currentIndex - columns, 0);
        break;
    }

    if (targetIndex !== currentIndex) {
      checkboxes[targetIndex].focus();
    }
  }

  getGridColumns(grid) {
    // Calculate number of columns in the checkbox grid
    const computedStyle = getComputedStyle(grid);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;

    if (gridTemplateColumns && gridTemplateColumns !== 'none') {
      return gridTemplateColumns.split(' ').length;
    }

    // Fallback: count items in first row
    const items = grid.querySelectorAll('.checkbox-item');
    if (items.length === 0) return 1;

    const firstItemTop = items[0].getBoundingClientRect().top;
    let columns = 0;

    for (const item of items) {
      if (Math.abs(item.getBoundingClientRect().top - firstItemTop) < 5) {
        columns++;
      } else {
        break;
      }
    }

    return Math.max(columns, 1);
    }

  focusNextField(currentField) {
    const focusableElements = Array.from(
      document.querySelectorAll(this.focusableSelectors)
    ).filter((el) => {
      return (
        el.offsetParent !== null && // Element is visible
        !el.disabled &&
        el.getAttribute('tabindex') !== '-1' &&
        !el.closest('[aria-hidden="true"]')
      );
    });

    const currentIndex = focusableElements.indexOf(currentField);
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    }
  }

  updateFocusableElements() {
    this.currentFocusableElements = Array.from(
      document.querySelectorAll(this.focusableSelectors)
    ).filter((el) => {
      return (
        el.offsetParent !== null && // Element is visible
        !el.disabled &&
        el.getAttribute('tabindex') !== '-1' &&
        !el.closest('[aria-hidden="true"]')
      );
    });
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Public method to manually focus the first focusable element
  focusFirstElement() {
    this.updateFocusableElements();
    if (this.currentFocusableElements.length > 0) {
      this.currentFocusableElements[0].focus();
    }
  }

  // Public method to manually focus the last focusable element
  focusLastElement() {
    this.updateFocusableElements();
    if (this.currentFocusableElements.length > 0) {
      this.currentFocusableElements[this.currentFocusableElements.length - 1].focus();
    }
  }
}

// Initialize keyboard navigation when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.keyboardNavigationManager = new KeyboardNavigationManager();
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeyboardNavigationManager };
} else if (typeof window !== 'undefined') {
  window.KeyboardNavigationManager = KeyboardNavigationManager;
}

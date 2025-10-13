/**
 * Form Enhancement Features for Austin Move Finder Quote Form
 * - Auto-save functionality
 * - Smart field suggestions
 * - Enhanced validation with real-time feedback
 * - Improved accessibility
 */

class FormEnhancements {
  constructor() {
    this.autoSaveKey = "amf_quote_autosave";
    this.autoSaveInterval = 5000; // 5 seconds
    this.autoSaveTimer = null;
    this.validationRules = this.initValidationRules();

    this.init();
  }

  init() {
    if (typeof window !== "undefined") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupAutoSave();
        this.setupSmartValidation();
        this.setupFieldSuggestions();
        this.setupAccessibilityEnhancements();
        this.restoreAutoSavedData();
      });
    }
  }

  initValidationRules() {
    return {
      name: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\s'-]+$/,
        message:
          "Please enter a valid name (letters, spaces, hyphens, and apostrophes only)",
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
      phone: {
        pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
        message: "Please enter phone number in format: (555) 123-4567",
      },
      "from-zip": {
        pattern: /^\d{5}$/,
        message: "Please enter a valid 5-digit ZIP code",
      },
      "to-zip": {
        pattern: /^\d{5}$/,
        message: "Please enter a valid 5-digit ZIP code",
      },
      "move-date": {
        validate: (value) => {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        message: "Move date must be today or in the future",
      },
    };
  }

  setupAutoSave() {
    const form = document.getElementById("quote-form");
    if (!form) return;

    // Auto-save on form input changes
    form.addEventListener("input", () => {
      this.scheduleAutoSave();
    });

    form.addEventListener("change", () => {
      this.scheduleAutoSave();
    });

    // Save before page unload
    window.addEventListener("beforeunload", () => {
      this.saveFormData();
    });
  }

  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.saveFormData();
    }, this.autoSaveInterval);
  }

  saveFormData() {
    try {
      const formData = this.collectFormData();
      if (Object.keys(formData).length > 0) {
        localStorage.setItem(
          this.autoSaveKey,
          JSON.stringify({
            data: formData,
            timestamp: Date.now(),
            step: window.currentStep || 1,
          }),
        );

        this.showAutoSaveIndicator();
      }
    } catch (error) {
      console.warn("Auto-save failed:", error);
    }
  }

  collectFormData() {
    const formData = {};
    const form = document.getElementById("quote-form");
    if (!form) return formData;

    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (input.name && input.name !== "website") {
        // Skip honeypot
        if (input.type === "checkbox") {
          if (input.checked) {
            if (!formData[input.name]) {
              formData[input.name] = [];
            }
            if (Array.isArray(formData[input.name])) {
              formData[input.name].push(input.value);
            } else {
              formData[input.name] = [formData[input.name], input.value];
            }
          }
        } else if (input.type === "radio") {
          if (input.checked) {
            formData[input.name] = input.value;
          }
        } else if (input.value.trim()) {
          formData[input.name] = input.value.trim();
        }
      }
    });

    return formData;
  }

  restoreAutoSavedData() {
    try {
      const saved = localStorage.getItem(this.autoSaveKey);
      if (!saved) return;

      const { data, timestamp, step } = JSON.parse(saved);

      // Check if auto-saved data is less than 24 hours old
      const hoursSinceLastSave = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (hoursSinceLastSave > 24) {
        localStorage.removeItem(this.autoSaveKey);
        return;
      }

      // Show restore option to user
      this.showRestoreOption(data, step);
    } catch (error) {
      console.warn("Failed to restore auto-saved data:", error);
      localStorage.removeItem(this.autoSaveKey);
    }
  }

  showRestoreOption(data, step) {
    const messageBox = document.getElementById("message-box");
    if (!messageBox) return;

    messageBox.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>We found a previous incomplete form. Would you like to restore it?</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" id="restore-data-btn" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        Restore
                    </button>
                    <button type="button" id="dismiss-restore-btn" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        Start Fresh
                    </button>
                </div>
            </div>
        `;
    messageBox.className = "message-box show";

    document
      .getElementById("restore-data-btn")
      .addEventListener("click", () => {
        this.restoreFormData(data, step);
        messageBox.classList.remove("show");
      });

    document
      .getElementById("dismiss-restore-btn")
      .addEventListener("click", () => {
        localStorage.removeItem(this.autoSaveKey);
        messageBox.classList.remove("show");
      });
  }

  restoreFormData(data, step) {
    // Wait for current step to load, then restore data
    setTimeout(() => {
      Object.entries(data).forEach(([name, value]) => {
        const elements = document.querySelectorAll(`[name="${name}"]`);
        elements.forEach((element) => {
          if (element.type === "checkbox") {
            element.checked = Array.isArray(value)
              ? value.includes(element.value)
              : value === element.value;
            if (element.checked) {
              const wrapper = element.closest(".checkbox-item");
              if (wrapper) wrapper.classList.add("checked");
            }
          } else if (element.type === "radio") {
            element.checked = element.value === value;
            if (element.checked) {
              const card = element.closest(".service-card");
              if (card) card.classList.add("selected");
            }
          } else {
            element.value = value;
          }
        });
      });

      this.showAutoSaveIndicator("Restored previous form data");
    }, 500);
  }

  showAutoSaveIndicator(message = "Form auto-saved") {
    const indicator = document.createElement("div");
    indicator.textContent = message;
    indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-green);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            font-size: 0.9rem;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;

    document.body.appendChild(indicator);

    setTimeout(() => {
      indicator.style.opacity = "1";
      indicator.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      indicator.style.opacity = "0";
      indicator.style.transform = "translateX(100px)";
      setTimeout(() => indicator.remove(), 300);
    }, 3000);
  }

  setupSmartValidation() {
    const form = document.getElementById("quote-form");
    if (!form) return;

    // Add real-time validation to form fields
    Object.keys(this.validationRules).forEach((fieldName) => {
      this.setupFieldValidation(fieldName);
    });
  }

  setupFieldValidation(fieldName) {
    document.addEventListener("input", (e) => {
      if (e.target.name === fieldName) {
        this.validateField(e.target);
      }
    });

    document.addEventListener("blur", (e) => {
      if (e.target.name === fieldName) {
        this.validateField(e.target);
      }
    });
  }

  validateField(field) {
    const rule = this.validationRules[field.name];
    if (!rule) return true;

    const value = field.value.trim();
    const group = field.closest(".form-group");
    let isValid = true;
    let errorMessage = "";

    // Clear previous error state
    group?.classList.remove("error");
    const existingError = group?.querySelector(".field-error");
    if (existingError) existingError.remove();

    if (value) {
      // Only validate if field has value
      if (rule.minLength && value.length < rule.minLength) {
        isValid = false;
        errorMessage = `Minimum ${rule.minLength} characters required`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        isValid = false;
        errorMessage = `Maximum ${rule.maxLength} characters allowed`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        isValid = false;
        errorMessage = rule.message;
      } else if (rule.validate && !rule.validate(value)) {
        isValid = false;
        errorMessage = rule.message;
      }
    }

    if (!isValid && group) {
      group.classList.add("error");
      this.showFieldError(group, errorMessage);
    }

    return isValid;
  }

  showFieldError(group, message) {
    const errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.textContent = message;
    errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
    group.appendChild(errorElement);
  }

  setupFieldSuggestions() {
    // ZIP code suggestions based on Austin area
    this.setupZipSuggestions();

    // Move size suggestions
    this.setupMoveSizeHelp();
  }

  setupZipSuggestions() {
    const austinZips = [
      "78701",
      "78702",
      "78703",
      "78704",
      "78705",
      "78712",
      "78717",
      "78719",
      "78721",
      "78722",
      "78723",
      "78724",
      "78725",
      "78726",
      "78727",
      "78728",
      "78729",
      "78730",
      "78731",
      "78732",
      "78733",
      "78734",
      "78735",
      "78736",
      "78737",
      "78738",
      "78739",
      "78741",
      "78742",
      "78744",
      "78745",
      "78746",
      "78747",
      "78748",
      "78749",
      "78750",
      "78751",
      "78752",
      "78753",
      "78754",
      "78756",
      "78757",
      "78758",
      "78759",
    ];

    ["from-zip", "to-zip"].forEach((fieldName) => {
      this.setupZipAutoComplete(fieldName, austinZips);
    });
  }

  setupZipAutoComplete(fieldName, suggestions) {
    document.addEventListener("input", (e) => {
      if (e.target.id === fieldName) {
        const value = e.target.value;
        if (value.length >= 2) {
          const matches = suggestions.filter((zip) => zip.startsWith(value));
          this.showZipSuggestions(e.target, matches);
        } else {
          this.hideZipSuggestions();
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".zip-suggestions")) {
        this.hideZipSuggestions();
      }
    });
  }

  showZipSuggestions(input, matches) {
    this.hideZipSuggestions();

    if (matches.length === 0 || matches.length > 10) return;

    const container = document.createElement("div");
    container.className = "zip-suggestions";
    container.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid var(--border-gray);
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            width: 100%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

    matches.forEach((zip) => {
      const option = document.createElement("div");
      option.textContent = zip;
      option.style.cssText = `
                padding: 0.5rem;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
            `;
      option.addEventListener("mouseenter", () => {
        option.style.backgroundColor = "#f8f9fa";
      });
      option.addEventListener("mouseleave", () => {
        option.style.backgroundColor = "white";
      });
      option.addEventListener("click", () => {
        input.value = zip;
        input.dispatchEvent(new Event("input"));
        this.hideZipSuggestions();
      });
      container.appendChild(option);
    });

    const parent = input.parentElement;
    parent.style.position = "relative";
    parent.appendChild(container);
  }

  hideZipSuggestions() {
    const existing = document.querySelector(".zip-suggestions");
    if (existing) existing.remove();
  }

  setupMoveSizeHelp() {
    const moveSizeSelect = document.getElementById("move-size");
    if (!moveSizeSelect) return;

    const helpTexts = {
      studio: "Typically 1 room with combined living/sleeping area",
      "1-bed": "Usually 1-2 rooms plus kitchen and bathroom",
      "2-bed": "Typically 2-3 rooms plus common areas",
      "3-bed": "Usually 3-4 rooms plus common areas",
      "4-bed": "Typically 4-5 rooms plus common areas",
      "5-bed-plus": "5 or more bedrooms, often 2+ stories",
      office: "Commercial space or home office setup",
    };

    moveSizeSelect.addEventListener("change", (e) => {
      const helpText = helpTexts[e.target.value];
      if (helpText) {
        this.showMoveSizeHelp(moveSizeSelect, helpText);
      } else {
        this.hideMoveSizeHelp();
      }
    });
  }

  showMoveSizeHelp(select, text) {
    this.hideMoveSizeHelp();

    const helpElement = document.createElement("div");
    helpElement.className = "move-size-help";
    helpElement.textContent = text;
    helpElement.style.cssText = `
            color: var(--medium-gray);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            font-style: italic;
        `;

    const group = select.closest(".form-group");
    if (group) group.appendChild(helpElement);
  }

  hideMoveSizeHelp() {
    const existing = document.querySelector(".move-size-help");
    if (existing) existing.remove();
  }

  setupAccessibilityEnhancements() {
    // Enhanced keyboard navigation
    this.setupKeyboardNavigation();

    // ARIA live regions for dynamic content
    this.setupAriaLiveRegions();

    // Focus management
    this.setupFocusManagement();

    // Service card accessibility
    this.enhanceServiceCardAccessibility();

    // Form field labeling
    this.enhanceFormFieldLabeling();
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Service card navigation
      if (e.target.matches('.service-card[role="radio"]')) {
        const cards = Array.from(
          document.querySelectorAll('.service-card[role="radio"]'),
        );
        const currentIndex = cards.indexOf(e.target);

        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            e.target.click();
            break;
          case "ArrowDown":
          case "ArrowRight":
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % cards.length;
            cards[nextIndex].focus();
            break;
          case "ArrowUp":
          case "ArrowLeft":
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
            cards[prevIndex].focus();
            break;
        }
      }

      // Skip navigation
      if (e.key === "Tab" && e.target.matches(".skip-nav-link")) {
        // Allow normal tab behavior for skip links
        return;
      }
    });
  }

  setupAriaLiveRegions() {
    const messageBox = document.getElementById("message-box");
    if (messageBox) {
      messageBox.setAttribute("aria-live", "polite");
      messageBox.setAttribute("aria-atomic", "true");
    }
  }

  setupFocusManagement() {
    // Focus first invalid field on validation error
    document.addEventListener("formValidationError", (e) => {
      const firstError = document.querySelector(
        ".form-group.error input, .form-group.error select",
      );
      if (firstError) {
        firstError.focus();
        firstError.setAttribute("aria-invalid", "true");
      }
    });

    // Remove aria-invalid when field is corrected
    document.addEventListener("input", (e) => {
      if (e.target.hasAttribute("aria-invalid")) {
        const group = e.target.closest(".form-group");
        if (group && !group.classList.contains("error")) {
          e.target.removeAttribute("aria-invalid");
        }
      }
    });

    // Focus management for form steps
    document.addEventListener("stepChange", (e) => {
      const newStep = e.detail.step;
      const heading = document.getElementById(`step-${newStep}-heading`);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        setTimeout(() => heading.removeAttribute("tabindex"), 100);
      }
    });
  }

  enhanceServiceCardAccessibility() {
    // Set up proper ARIA attributes for service cards
    const setupServiceCards = () => {
      const radioGroup = document.querySelector(
        '.service-cards[role="radiogroup"]',
      );
      if (!radioGroup) return;

      const cards = radioGroup.querySelectorAll('.service-card[role="radio"]');
      cards.forEach((card, index) => {
        // Set proper tabindex for roving tabindex pattern
        const isSelected = card.classList.contains("selected");
        card.setAttribute("tabindex", isSelected ? "0" : "-1");
        card.setAttribute("aria-checked", isSelected.toString());

        // Ensure proper describedby relationships
        const titleElement = card.querySelector(".service-card-title");
        const descElement = card.querySelector(".service-card-desc");
        if (titleElement && descElement && !descElement.id) {
          const descId = `service-desc-${index}`;
          descElement.id = descId;
          card.setAttribute("aria-describedby", descId);
        }
      });
    };

    // Set up initially and on step changes
    setupServiceCards();
    document.addEventListener("stepLoaded", setupServiceCards);
  }

  enhanceFormFieldLabeling() {
    // Ensure all form fields have proper labels and descriptions
    const enhanceField = (input) => {
      const group = input.closest(".form-group");
      if (!group) return;

      const label = group.querySelector("label");
      const help = group.querySelector(".field-help");
      const error = group.querySelector(".error-message");

      // Ensure label association
      if (
        label &&
        !input.getAttribute("aria-labelledby") &&
        !input.getAttribute("aria-label")
      ) {
        if (!label.getAttribute("for") && input.id) {
          label.setAttribute("for", input.id);
        }
      }

      // Set up aria-describedby relationships
      const describedBy = [];
      if (help && help.id) describedBy.push(help.id);
      if (error && error.id) describedBy.push(error.id);

      if (describedBy.length > 0) {
        input.setAttribute("aria-describedby", describedBy.join(" "));
      }

      // Add required indicator to aria-label if needed
      if (
        input.hasAttribute("required") &&
        !input.getAttribute("aria-required")
      ) {
        input.setAttribute("aria-required", "true");
      }
    };

    // Enhance all current fields
    document.querySelectorAll("input, select, textarea").forEach(enhanceField);

    // Enhance fields when new steps load
    document.addEventListener("stepLoaded", () => {
      setTimeout(() => {
        document
          .querySelectorAll("input, select, textarea")
          .forEach(enhanceField);
      }, 100);
    });
  }

  clearAutoSave() {
    localStorage.removeItem(this.autoSaveKey);
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }
}

// Initialize form enhancements
if (typeof window !== "undefined") {
  window.formEnhancements = new FormEnhancements();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { FormEnhancements };
} else if (typeof window !== "undefined") {
  window.FormEnhancements = FormEnhancements;
}

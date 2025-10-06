/**
 * Enhanced Quote Form Handler for Austin Move Finder
 * - Improved error handling and user feedback
 * - Better form state management
 * - Enhanced loading states
 * - Mobile-optimized interactions
 */

class QuoteFormHandler {
  constructor() {
    this.CONFIG = {
      totalSteps: 2,
      stepFileTemplate: "quote-step-{step}.html",
      hiddenStep1ContainerId: "step-1-hidden-fields",
      phoneMaxLength: 10,
      zipMaxLength: 5,
      apiEndpoint: "/api/submit",
      retryAttempts: 3,
      retryDelay: 1000,
    };

    this.currentStep = 1;
    this.formState = {};
    this.eventListeners = new Map();
    this.isSubmitting = false;

    this.init();
  }

  init() {
    if (typeof window !== "undefined") {
      document.addEventListener("DOMContentLoaded", () => {
        this.initializeForm();
      });
    }
  }

  initializeForm() {
    this.form = document.getElementById("quote-form");
    this.formStepsContainer = document.getElementById("form-steps-container");
    this.messageBox = document.getElementById("message-box");
    this.progressFill = document.getElementById("progress-fill");

    if (!this.form) {
      console.error("Quote form not found");
      return;
    }

    this.setupFormHandler();
    this.loadStep(1);
    this.setupGlobalEventListeners();
  }

  setupFormHandler() {
    this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Prevent double submission
    this.form.addEventListener("submit", (e) => {
      if (this.isSubmitting) {
        e.preventDefault();
        return false;
      }
    });
  }

  setupGlobalEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.step) {
        this.currentStep = e.state.step;
        this.loadStep(this.currentStep, false);
      }
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });

    // Handle orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.handleResponsiveLayout(), 100);
    });
  }

  async loadStep(stepNumber, updateHistory = true) {
    try {
      this.showLoadingState();

      const stepFile = this.CONFIG.stepFileTemplate.replace(
        "{step}",
        stepNumber,
      );
      const response = await this.fetchWithRetry(stepFile);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Could not load step ${stepNumber}`,
        );
      }

      const html = await response.text();
      await this.renderStep(html, stepNumber);

      if (updateHistory) {
        this.updateBrowserHistory(stepNumber);
      }

      this.hideLoadingState();
    } catch (error) {
      console.error("Failed to load form step:", error);
      this.showMessage(
        "Error loading form step. Please refresh and try again.",
        "error",
        0,
      );
      this.hideLoadingState();
    }
  }

  async fetchWithRetry(
    url,
    options = {},
    attempts = this.CONFIG.retryAttempts,
  ) {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok || response.status < 500) {
          return response;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === attempts - 1) throw error;
        await this.delay(this.CONFIG.retryDelay * (i + 1));
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async renderStep(html, stepNumber) {
    // Fade out current step
    if (this.formStepsContainer.firstElementChild) {
      await this.fadeOut(this.formStepsContainer.firstElementChild);
    }

    this.formStepsContainer.innerHTML = html;
    const stepElement = this.formStepsContainer.querySelector(".form-step");

    if (!stepElement) {
      throw new Error(
        `Step element not found in loaded HTML for step ${stepNumber}`,
      );
    }

    // Setup step-specific functionality
    await this.setupStepListeners(stepNumber);

    // Restore or setup initial state
    if (stepNumber === 1) {
      this.restoreStepState(1);
      this.removeHiddenStep1Fields();
    } else if (stepNumber === 2) {
      this.restoreStepState(2);
      this.syncStep1HiddenFields();
    }

    // Fade in new step
    stepElement.classList.add("active");
    await this.fadeIn(stepElement);

    this.updateProgress(stepNumber);
    this.handleResponsiveLayout();
  }

  async fadeOut(element) {
    return new Promise((resolve) => {
      element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      element.style.opacity = "0";
      element.style.transform = "translateX(-20px)";
      setTimeout(resolve, 300);
    });
  }

  async fadeIn(element) {
    return new Promise((resolve) => {
      element.style.opacity = "0";
      element.style.transform = "translateX(20px)";
      element.style.transition = "opacity 0.4s ease, transform 0.4s ease";

      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
        setTimeout(resolve, 400);
      }, 50);
    });
  }

  updateBrowserHistory(stepNumber) {
    const url = new URL(window.location);
    url.searchParams.set("step", stepNumber);
    history.pushState({ step: stepNumber }, "", url);
  }

  showLoadingState() {
    const loader = document.createElement("div");
    loader.id = "step-loader";
    loader.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div class="spinner" style="opacity: 1; margin-right: 0.5rem;"></div>
                <span>Loading...</span>
            </div>
        `;
    loader.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

    if (this.formStepsContainer) {
      this.formStepsContainer.style.position = "relative";
      this.formStepsContainer.appendChild(loader);
    }
  }

  hideLoadingState() {
    const loader = document.getElementById("step-loader");
    if (loader) loader.remove();
  }

  async setupStepListeners(stepNumber) {
    this.clearStepListeners(stepNumber);

    if (stepNumber === 1) {
      await this.setupStep1Listeners();
    } else if (stepNumber === 2) {
      await this.setupStep2Listeners();
    }

    this.setupCommonListeners();
  }

  async setupStep1Listeners() {
    const nextBtn = document.getElementById("next-1");
    if (nextBtn) {
      const handler = () => this.navigateToStep(2);
      this.addTrackedListener(1, nextBtn, "click", handler);
    }

    // Enhanced date validation
    const moveDate = document.getElementById("move-date");
    if (moveDate) {
      const today = new Date().toISOString().split("T")[0];
      moveDate.setAttribute("min", today);

      // Set max date to 1 year from now
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      moveDate.setAttribute("max", maxDate.toISOString().split("T")[0]);
    }

    // Enhanced phone formatting with paste support
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
      this.addTrackedListener(
        1,
        phoneInput,
        "input",
        this.formatPhone.bind(this),
      );
      this.addTrackedListener(
        1,
        phoneInput,
        "paste",
        this.handlePhonePaste.bind(this),
      );
    }

    // Enhanced ZIP code formatting
    const zipInputs = document.querySelectorAll("#from-zip, #to-zip");
    zipInputs.forEach((input) => {
      this.addTrackedListener(1, input, "input", this.formatZip.bind(this));
      this.addTrackedListener(1, input, "blur", this.validateZip.bind(this));
    });
  }

  async setupStep2Listeners() {
    const backBtn = document.getElementById("back-2");
    if (backBtn) {
      const handler = () => this.navigateToStep(1);
      this.addTrackedListener(2, backBtn, "click", handler);
    }

    // Enhanced service card selection with keyboard support
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach((card) => {
      const handler = (e) => {
        // Handle both click and keyboard activation
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
        if (e.type === "keydown") e.preventDefault();

        serviceCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        // Update radio button state
        const radio = card.querySelector('input[type=\"radio\"]');
        if (radio) radio.checked = true;

        // Announce selection to screen readers
        this.announceToScreenReader(
          `Selected ${card.querySelector(".service-card-title")?.textContent}`,
        );
      };

      this.addTrackedListener(2, card, "click", handler);
      this.addTrackedListener(2, card, "keydown", handler);

      // Make cards focusable
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "radio");
    });

    // Enhanced checkbox handling
    const checkboxes = document.querySelectorAll(
      '.checkbox-item input[type=\"checkbox\"]',
    );
    checkboxes.forEach((checkbox) => {
      this.addTrackedListener(
        2,
        checkbox,
        "change",
        this.handleCheckboxChange.bind(this),
      );
    });

    // Setup Turnstile if available
    this.setupTurnstile();
  }

  setupTurnstile() {
    const turnstileContainer = document.querySelector(".cf-turnstile");
    if (turnstileContainer && window.turnstile) {
      try {
        window.turnstile.render(turnstileContainer, {
          sitekey: turnstileContainer.dataset.sitekey,
          callback: window.onTurnstileSuccess,
          "error-callback": window.onTurnstileError,
          "expired-callback": window.onTurnstileExpired,
        });
      } catch (error) {
        console.warn("Turnstile setup failed:", error);
      }
    }
  }

  handlePhonePaste(e) {
    setTimeout(() => {
      this.formatPhone(e);
    }, 0);
  }

  formatPhone(e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > this.CONFIG.phoneMaxLength) {
      value = value.slice(0, this.CONFIG.phoneMaxLength);
    }

    // Apply formatting based on length
    if (value.length >= 7) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 4) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    e.target.value = value;
  }

  formatZip(e) {
    e.target.value = e.target.value
      .replace(/\D/g, "")
      .slice(0, this.CONFIG.zipMaxLength);
  }

  validateZip(e) {
    const value = e.target.value;
    const group = e.target.closest(".form-group");

    if (value && value.length !== 5) {
      group?.classList.add("error");
      this.showFieldError(group, "ZIP code must be 5 digits");
    } else {
      group?.classList.remove("error");
      this.removeFieldError(group);
    }
  }

  showFieldError(group, message) {
    if (!group) return;

    this.removeFieldError(group);

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

  removeFieldError(group) {
    if (!group) return;
    const existingError = group.querySelector(".field-error");
    if (existingError) existingError.remove();
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  handleResponsiveLayout() {
    // Adjust form layout for mobile devices
    if (window.innerWidth <= 768) {
      this.optimizeForMobile();
    } else {
      this.optimizeForDesktop();
    }
  }

  optimizeForMobile() {
    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.style.margin = "10px";
      formSection.style.padding = "20px";
    }

    // Ensure form inputs are properly sized for mobile
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.style.fontSize =
        Math.max(16, parseFloat(getComputedStyle(input).fontSize)) + "px";
    });
  }

  optimizeForDesktop() {
    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.style.margin = "40px auto";
      formSection.style.padding = "40px";
    }
  }

  async navigateToStep(stepNumber) {
    if (stepNumber > this.currentStep) {
      // Moving forward
      if (this.currentStep === 1 && !(await this.validateStep1())) {
        this.showMessage(
          "Please fill in all required fields correctly.",
          "error",
          3000,
        );
        document.dispatchEvent(new Event("formValidationError"));
        return;
      }
    }

    this.persistStepState(this.currentStep);
    this.currentStep = stepNumber;

    await this.loadStep(this.currentStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async validateStep1() {
    const requiredFields = document.querySelectorAll("#step-1 [required]");
    let isValid = true;
    const errors = [];

    requiredFields.forEach((field) => {
      const fieldContainer = field.closest(".form-group");
      fieldContainer?.classList.remove("error");
      this.removeFieldError(fieldContainer);

      if (!field.value.trim()) {
        isValid = false;
        fieldContainer?.classList.add("error");
        errors.push(`${this.getFieldLabel(field)} is required`);
      }
    });

    // Enhanced email validation
    const email = document.getElementById("email");
    if (email && email.value && !this.isValidEmail(email.value)) {
      isValid = false;
      const container = email.closest(".form-group");
      container?.classList.add("error");
      this.showFieldError(container, "Please enter a valid email address");
      errors.push("Valid email is required");
    }

    // Enhanced phone validation
    const phone = document.getElementById("phone");
    if (
      phone &&
      phone.value.replace(/\D/g, "").length !== this.CONFIG.phoneMaxLength
    ) {
      isValid = false;
      const container = phone.closest(".form-group");
      container?.classList.add("error");
      this.showFieldError(
        container,
        "Please enter a complete 10-digit phone number",
      );
      errors.push("Valid phone number is required");
    }

    // ZIP code validation
    const fromZip = document.getElementById("from-zip");
    const toZip = document.getElementById("to-zip");

    [fromZip, toZip].forEach((zipField) => {
      if (zipField && zipField.value && zipField.value.length !== 5) {
        isValid = false;
        const container = zipField.closest(".form-group");
        container?.classList.add("error");
        this.showFieldError(container, "ZIP code must be 5 digits");
        errors.push("Valid ZIP codes are required");
      }
    });

    // Date validation
    const moveDate = document.getElementById("move-date");
    if (moveDate && moveDate.value) {
      const selectedDate = new Date(moveDate.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        isValid = false;
        const container = moveDate.closest(".form-group");
        container?.classList.add("error");
        this.showFieldError(
          container,
          "Move date must be today or in the future",
        );
        errors.push("Valid move date is required");
      }
    }

    if (!isValid && errors.length > 0) {
      this.announceToScreenReader(
        `Form has ${errors.length} errors: ${errors.join(", ")}`,
      );
    }

    return isValid;
  }

  getFieldLabel(field) {
    const label = field.closest(".form-group")?.querySelector("label");
    return label ? label.textContent.replace("*", "").trim() : field.name;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return false;

    // Honeypot spam protection
    const honeypot = document.querySelector('input[name=\"website\"]');
    if (honeypot?.value) {
      console.warn("Spam attempt detected");
      return false;
    }

    // Final validation
    if (!(await this.validateStep1())) {
      this.showMessage("Please correct the errors before submitting.", "error");
      return false;
    }

    const submitBtn = document.getElementById("submit-btn");
    this.setSubmitButtonState(submitBtn, true);
    this.isSubmitting = true;

    try {
      await this.submitForm();
    } catch (error) {
      console.error("Form submission error:", error);
      this.handleSubmissionError(error);
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState(submitBtn, false);
    }
  }

  async submitForm() {
    this.persistStepState(this.currentStep);
    this.syncStep1HiddenFields();

    const formData = new FormData(this.form);
    const data = this.processFormData(formData);

    console.log("Submitting form data:", data);

    const response = await this.fetchWithRetry(this.CONFIG.apiEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      this.handleSubmissionSuccess();

      // Clear auto-saved data on successful submission
      if (window.formEnhancements) {
        window.formEnhancements.clearAutoSave();
      }
    } else {
      throw new Error(result.error || `Server error (${response.status})`);
    }
  }

  processFormData(formData) {
    const data = Object.fromEntries(formData.entries());

    // Process special-items array
    data.specialItems = formData.getAll("special-items");

    // Add submission metadata
    data.submissionTime = new Date().toISOString();
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;

    return data;
  }

  handleSubmissionSuccess() {
    this.showSuccessMessage();
    this.updateProgress(this.CONFIG.totalSteps + 1);

    // Hide progress bar
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.style.display = "none";
    }

    // Track conversion event (if analytics available)
    if (typeof gtag !== "undefined") {
      gtag("event", "conversion", {
        send_to: "AW-XXXXXXXXX/XXXXXXXXXXXXXXX",
        value: 1.0,
        currency: "USD",
      });
    }
  }

  handleSubmissionError(error) {
    let errorMessage =
      "There was an error submitting your form. Please try again.";

    if (error.message === "Failed to fetch") {
      errorMessage =
        "Network error. Please check your connection and try again.";
    } else if (error.message.includes("Rate limit")) {
      errorMessage =
        "Too many submissions. Please wait a moment and try again.";
    } else if (error.message.includes("Security verification")) {
      errorMessage =
        "Security verification failed. Please refresh the page and try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.showMessage(errorMessage, "error", 0);
  }

  showSuccessMessage() {
    this.form.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.5s ease;">
                <div style="background: var(--success-green); color: white; padding: 1rem; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                    ✓
                </div>
                <h2 style="color: var(--success-green, #28a745); font-size: 1.8rem; margin-bottom: 1rem;">
                    Success!
                </h2>
                <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
                    We've received your detailed moving request. You'll receive personalized quotes
                    from 3-5 top-rated Austin movers within the next 2 hours.
                </p>
                <p style="font-size: 1.1rem; margin-bottom: 2rem;">
                    <strong>Check your email for instant estimates!</strong>
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                        Back to Homepage
                    </a>
                    <a href="/about" class="btn btn-secondary" style="text-decoration: none; display: inline-block;">
                        Learn More About Us
                    </a>
                </div>
            </div>
        `;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ... (rest of the existing methods remain the same)

  cleanup() {
    this.eventListeners.clear();
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }
}

// Initialize the enhanced form handler
window.quoteFormHandler = new QuoteFormHandler();

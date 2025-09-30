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
      stepFileTemplate: "/quote-step-{step}.html",
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
      console.error("[QuoteFormHandler] CRITICAL: Quote form element not found!");
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
      console.error("[QuoteFormHandler] Failed to load form step:", error);
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

    // Accessibility: Focus management and announcements
    this.manageFocusForStep(stepNumber);
    this.announceStepChange(stepNumber);
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
    } else {
      console.error("[QuoteFormHandler] CRITICAL: 'Next' button (#next-1) not found!");
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
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.setAttribute("aria-live", "polite");
    errorElement.setAttribute("role", "alert");

    // Find the associated input and update its aria-describedby
    const input = group.querySelector("input, select, textarea");
    if (input) {
      const errorId = `${input.id || input.name}-error`;
      errorElement.id = errorId;

      const currentDescribedBy = input.getAttribute("aria-describedby") || "";
      const describedByIds = currentDescribedBy
        .split(" ")
        .filter((id) => id && !id.endsWith("-error"));
      describedByIds.push(errorId);
      input.setAttribute("aria-describedby", describedByIds.join(" ").trim());
    }

    group.appendChild(errorElement);

    // Announce error to screen readers
    this.announceToScreenReader(`Error: ${message}`);
  }

  removeFieldError(group) {
    if (!group) return;
    const existingError = group.querySelector(".error-message, .field-error");
    if (existingError) {
      // Remove error ID from aria-describedby
      const input = group.querySelector("input, select, textarea");
      if (input && existingError.id) {
        const currentDescribedBy = input.getAttribute("aria-describedby") || "";
        const describedByIds = currentDescribedBy
          .split(" ")
          .filter((id) => id && id !== existingError.id);
        if (describedByIds.length > 0) {
          input.setAttribute("aria-describedby", describedByIds.join(" "));
        } else {
          input.removeAttribute("aria-describedby");
        }
      }
      existingError.remove();
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  manageFocusForStep(stepNumber) {
    // Focus the main heading of the step for screen readers
    const heading = document.getElementById(`step-${stepNumber}-heading`);
    if (heading) {
      // Set focus without scrolling for screen readers
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });

      // Remove tabindex after focus to maintain natural tab order
      setTimeout(() => {
        heading.removeAttribute("tabindex");
      }, 100);
    }
  }

  announceStepChange(stepNumber) {
    const totalSteps = this.CONFIG.totalSteps;
    const stepNames = {
      1: "Basic Information",
      2: "Move Details",
    };

    const message = `Step ${stepNumber} of ${totalSteps}: ${stepNames[stepNumber]}. ${stepNumber === totalSteps ? "Complete this step to get your quotes." : "Complete all required fields to continue."}`;

    // Update progress announcement
    const progressAnnouncement = document.getElementById(
      `step-progress-${stepNumber}`,
    );
    if (progressAnnouncement) {
      progressAnnouncement.textContent = message;
    }

    this.announceToScreenReader(message);
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

  setupCommonListeners() {
    // Handle orientation change on mobile
    window.addEventListener("resize", () => {
      this.handleResponsiveLayout();
    });

    // Global key handlers
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideZipSuggestions();
        this.hideMoveSizeHelp();
      }
    });
  }

  handleCheckboxChange(e) {
    const checkbox = e.target;
    const wrapper = checkbox.closest(".checkbox-item");

    if (wrapper) {
      if (checkbox.checked) {
        wrapper.classList.add("checked");
      } else {
        wrapper.classList.remove("checked");
      }
    }

    // Handle "None of these" special logic
    if (checkbox.value === "none") {
      if (checkbox.checked) {
        // Uncheck all other special items
        const otherCheckboxes = document.querySelectorAll(
          '.checkbox-item input[name="special-items"]',
        );
        otherCheckboxes.forEach((cb) => {
          if (cb.value !== "none") {
            cb.checked = false;
            cb.closest(".checkbox-item")?.classList.remove("checked");
          }
        });
      }
    } else {
      // If any other item is checked, uncheck "none"
      if (checkbox.checked) {
        const noneCheckbox = document.querySelector(
          '.checkbox-item input[value="none"]',
        );
        if (noneCheckbox) {
          noneCheckbox.checked = false;
          noneCheckbox.closest(".checkbox-item")?.classList.remove("checked");
        }
      }
    }
  }

  addTrackedListener(step, element, event, handler) {
    if (!this.eventListeners.has(step)) {
      this.eventListeners.set(step, []);
    }

    element.addEventListener(event, handler);
    this.eventListeners.get(step).push({ element, event, handler });
  }

  clearStepListeners(step) {
    const listeners = this.eventListeners.get(step);
    if (listeners) {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners.delete(step);
    }
  }

  persistStepState(step) {
    const stepElement = document.querySelector(`#step-${step}`);
    if (!stepElement) return;

    const formData = {};
    const inputs = stepElement.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (input.name && input.name !== "website") {
        if (input.type === "checkbox") {
          if (input.checked) {
            if (!formData[input.name]) {
              formData[input.name] = [];
            }
            formData[input.name].push(input.value);
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

    this.formState[`step${step}`] = formData;
  }

  restoreStepState(step) {
    const savedState = this.formState[`step${step}`];
    if (!savedState) return;

    Object.entries(savedState).forEach(([name, value]) => {
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
  }

  syncStep1HiddenFields() {
    if (this.currentStep !== 2) return;

    // Remove existing hidden fields
    this.removeHiddenStep1Fields();

    const step1Data = this.formState.step1;
    if (!step1Data) return;

    const step2Container = document.querySelector("#step-2");
    if (!step2Container) return;

    // Create container for hidden fields
    const hiddenContainer = document.createElement("div");
    hiddenContainer.id = this.CONFIG.hiddenStep1ContainerId;
    hiddenContainer.style.display = "none";

    Object.entries(step1Data).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = val;
          hiddenContainer.appendChild(input);
        });
      } else {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        hiddenContainer.appendChild(input);
      }
    });

    step2Container.appendChild(hiddenContainer);
  }

  removeHiddenStep1Fields() {
    const existing = document.getElementById(
      this.CONFIG.hiddenStep1ContainerId,
    );
    if (existing) existing.remove();
  }

  updateProgress(step) {
    const totalSteps = this.CONFIG.totalSteps;
    const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;

    if (this.progressFill) {
      this.progressFill.style.width = `${progressPercentage}%`;
    }

    // Update progress bar ARIA attributes
    const progressBar = document.querySelector(
      '.progress-bar[role="progressbar"]',
    );
    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", step.toString());
      progressBar.setAttribute(
        "aria-valuetext",
        `Step ${step} of ${totalSteps}`,
      );
    }

    // Update step indicators
    document
      .querySelectorAll(".progress-step")
      .forEach((stepElement, index) => {
        const stepNumber = index + 1;
        stepElement.classList.remove("active", "completed");
        stepElement.removeAttribute("aria-current");

        if (stepNumber < step) {
          stepElement.classList.add("completed");
          const circle = stepElement.querySelector(".progress-step-circle");
          if (circle) circle.textContent = "✓";
        } else if (stepNumber === step) {
          stepElement.classList.add("active");
          stepElement.setAttribute("aria-current", "step");
          const circle = stepElement.querySelector(".progress-step-circle");
          if (circle) circle.textContent = stepNumber.toString();
        } else {
          const circle = stepElement.querySelector(".progress-step-circle");
          if (circle) circle.textContent = stepNumber.toString();
        }
      });
  }

  setSubmitButtonState(button, isLoading) {
    if (!button) return;

    const buttonText = button.querySelector(".button-text");
    const spinner = button.querySelector(".spinner");

    if (isLoading) {
      button.disabled = true;
      button.classList.add("loading");
      if (buttonText) buttonText.textContent = "Submitting...";
      if (spinner) spinner.style.display = "inline-block";
    } else {
      button.disabled = false;
      button.classList.remove("loading");
      if (buttonText) buttonText.textContent = "Get My Quotes";
      if (spinner) spinner.style.display = "none";
    }
  }

  showMessage(message, type = "info", duration = 5000) {
    if (!this.messageBox) return;

    this.messageBox.textContent = message;
    this.messageBox.className = `message-box ${type} show`;

    // Ensure the message is announced to screen readers
    this.messageBox.setAttribute(
      "aria-live",
      type === "error" ? "assertive" : "polite",
    );

    // Focus the message box for urgent messages
    if (type === "error") {
      this.messageBox.setAttribute("tabindex", "-1");
      this.messageBox.focus();
      setTimeout(() => {
        this.messageBox.removeAttribute("tabindex");
      }, 100);
    }

    if (duration > 0) {
      setTimeout(() => {
        this.messageBox.classList.remove("show");
      }, duration);
    }
  }

  hideZipSuggestions() {
    const suggestions = document.querySelector(".zip-suggestions");
    if (suggestions) suggestions.remove();
  }

  hideMoveSizeHelp() {
    const help = document.querySelector(".move-size-help");
    if (help) help.remove();
  }

  cleanup() {
    this.eventListeners.clear();
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }
}

// Initialize the enhanced form handler
if (typeof window !== "undefined") {
  window.quoteFormHandler = new QuoteFormHandler();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { QuoteFormHandler };
} else if (typeof window !== "undefined") {
  window.QuoteFormHandler = QuoteFormHandler;
}

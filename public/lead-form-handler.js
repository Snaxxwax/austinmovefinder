/**
 * Lead Form Handler - Converted from React useLeadForm hook
 * Multi-step form with comprehensive validation
 */

const TCPA_CONSENT_TEXT = "I agree to be contacted by phone, SMS, and email by partner moving companies regarding my inquiry. Message/data rates may apply. Consent not required to purchase.";
const FORM_NAME = 'Moving Lead Form';

const STEPS = [
  { id: 1, name: 'Contact Info', fields: ['first_name', 'last_name', 'email', 'phone'] },
  { id: 2, name: 'Move Details', fields: ['from_zip', 'to_zip', 'date', 'flexible'] },
  { id: 3, name: 'Home Size', fields: ['home_size', 'items_count'] },
  { id: 4, name: 'Logistics', fields: ['stairs_or_elevator', 'parking_constraints', 'budget_range', 'notes', 'tcpa'] },
];

class LeadFormHandler {
  constructor() {
    this.currentStep = 0;
    this.formData = this.getInitialData();
    this.errors = {};
    this.isSubmitting = false;
    this.init();
  }

  getInitialData() {
    return {
      prospect: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      },
      move: {
        from_zip: '',
        to_zip: '',
        date: '',
        flexible: false,
        home_size: null,
        items_count: null,
        stairs_or_elevator: null,
        parking_constraints: '',
        budget_range: null,
        notes: '',
      },
      tracking: this.getTrackingData(),
      consent: {
        tcpa: false,
        text: TCPA_CONSENT_TEXT,
      },
      honeypot_nickname: '',
    };
  }

  getTrackingData() {
    const urlParams = new URLSearchParams(window.location.search);

    let firstPageSeenAt = sessionStorage.getItem('first_page_seen_at');
    if (!firstPageSeenAt) {
      firstPageSeenAt = new Date().toISOString();
      sessionStorage.setItem('first_page_seen_at', firstPageSeenAt);
    }

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }

    return {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
      gclid: urlParams.get('gclid'),
      fbclid: urlParams.get('fbclid'),
      referrer_url: document.referrer || null,
      landing_url: window.location.href,
      user_agent: navigator.userAgent,
      ip: null,
      first_page_seen_at: firstPageSeenAt,
      session_id: sessionId,
    };
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeForm());
    } else {
      this.initializeForm();
    }
  }

  initializeForm() {
    this.form = document.getElementById('lead-form');
    this.container = document.getElementById('form-container');

    if (!this.form || !this.container) {
      console.error('Lead form elements not found');
      return;
    }

    this.renderStep();
    this.updateProgress();

    // GTM tracking
    this.trackEvent('form_start', { form_name: FORM_NAME });
  }

  renderStep() {
    const step = STEPS[this.currentStep];
    this.container.innerHTML = this.getStepHTML(step);
    this.attachStepEventListeners();
  }

  getStepHTML(step) {
    switch (step.id) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
      default: return '';
    }
  }

  renderStep1() {
    const { prospect } = this.formData;
    return `
      <div>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Your Information</h2>
        <p class="mb-6 text-gray-600">Let's start with the basics.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label for="first_name" class="block text-sm font-medium text-gray-800 mb-1">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value="${prospect.first_name}"
              required
              class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.first_name ? 'border-red-500' : 'border-gray-300'}"
            />
            ${this.errors.first_name ? `<p class="mt-1 text-xs text-red-600">${this.errors.first_name}</p>` : ''}
          </div>

          <div class="mb-4">
            <label for="last_name" class="block text-sm font-medium text-gray-800 mb-1">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value="${prospect.last_name}"
              required
              class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.last_name ? 'border-red-500' : 'border-gray-300'}"
            />
            ${this.errors.last_name ? `<p class="mt-1 text-xs text-red-600">${this.errors.last_name}</p>` : ''}
          </div>
        </div>

        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value="${prospect.email || ''}"
            placeholder="you@example.com"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.email ? 'border-red-500' : 'border-gray-300'}"
          />
          ${this.errors.email ? `<p class="mt-1 text-xs text-red-600">${this.errors.email}</p>` : ''}
        </div>

        <div class="mb-4">
          <label for="phone" class="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value="${prospect.phone || ''}"
            placeholder="(555)123-4567"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.phone ? 'border-red-500' : 'border-gray-300'}"
          />
          ${this.errors.phone ? `<p class="mt-1 text-xs text-red-600">${this.errors.phone}</p>` : ''}
          <p class="mt-1 text-xs text-gray-500">Either email or phone is required</p>
        </div>

        <div class="flex justify-between mt-6">
          <button type="button" disabled class="px-6 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
            Back
          </button>
          <button type="button" id="next-btn" class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition">
            Next
          </button>
        </div>
      </div>
    `;
  }

  renderStep2() {
    const { move } = this.formData;
    return `
      <div>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Move Details</h2>
        <p class="mb-6 text-gray-600">Where are you moving from and to?</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label for="from_zip" class="block text-sm font-medium text-gray-800 mb-1">Moving From ZIP Code *</label>
            <input
              type="text"
              id="from_zip"
              name="from_zip"
              value="${move.from_zip}"
              required
              maxlength="5"
              inputmode="numeric"
              class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.from_zip ? 'border-red-500' : 'border-gray-300'}"
            />
            ${this.errors.from_zip ? `<p class="mt-1 text-xs text-red-600">${this.errors.from_zip}</p>` : ''}
          </div>

          <div class="mb-4">
            <label for="to_zip" class="block text-sm font-medium text-gray-800 mb-1">Moving To ZIP Code *</label>
            <input
              type="text"
              id="to_zip"
              name="to_zip"
              value="${move.to_zip}"
              required
              maxlength="5"
              inputmode="numeric"
              class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.to_zip ? 'border-red-500' : 'border-gray-300'}"
            />
            ${this.errors.to_zip ? `<p class="mt-1 text-xs text-red-600">${this.errors.to_zip}</p>` : ''}
          </div>
        </div>

        <div class="mb-4 mt-4">
          <label for="date" class="block text-sm font-medium text-gray-800 mb-1">Desired Move Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value="${move.date || ''}"
            ${move.flexible ? 'disabled' : ''}
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.date ? 'border-red-500' : 'border-gray-300'}"
          />
          ${this.errors.date ? `<p class="mt-1 text-xs text-red-600">${this.errors.date}</p>` : ''}
        </div>

        <div class="flex items-center">
          <input
            id="flexible"
            name="flexible"
            type="checkbox"
            ${move.flexible ? 'checked' : ''}
            class="h-4 w-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
          />
          <label for="flexible" class="ml-2 block text-sm text-gray-900">My dates are flexible</label>
        </div>

        <div class="flex justify-between mt-6">
          <button type="button" id="back-btn" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
            Back
          </button>
          <button type="button" id="next-btn" class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition">
            Next
          </button>
        </div>
      </div>
    `;
  }

  renderStep3() {
    const { move } = this.formData;
    return `
      <div>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Home Size</h2>
        <p class="mb-6 text-gray-600">Tell us about the size of your move.</p>

        <div class="mb-4">
          <label for="home_size" class="block text-sm font-medium text-gray-800 mb-1">Size of Home</label>
          <select
            id="home_size"
            name="home_size"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.home_size ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">Select size...</option>
            <option value="studio" ${move.home_size === 'studio' ? 'selected' : ''}>Studio</option>
            <option value="1BR" ${move.home_size === '1BR' ? 'selected' : ''}>1BR</option>
            <option value="2BR" ${move.home_size === '2BR' ? 'selected' : ''}>2BR</option>
            <option value="3BR" ${move.home_size === '3BR' ? 'selected' : ''}>3BR</option>
            <option value="4BR+" ${move.home_size === '4BR+' ? 'selected' : ''}>4BR+</option>
          </select>
          ${this.errors.home_size ? `<p class="mt-1 text-xs text-red-600">${this.errors.home_size}</p>` : ''}
        </div>

        <p class="text-center my-4 text-gray-500">OR</p>

        <div class="mb-4">
          <label for="items_count" class="block text-sm font-medium text-gray-800 mb-1">Approximate Number of Items</label>
          <input
            type="number"
            id="items_count"
            name="items_count"
            value="${move.items_count || ''}"
            placeholder="e.g., 50"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm ${this.errors.items_count ? 'border-red-500' : 'border-gray-300'}"
          />
          ${this.errors.items_count ? `<p class="mt-1 text-xs text-red-600">${this.errors.items_count}</p>` : ''}
        </div>

        <div class="flex justify-between mt-6">
          <button type="button" id="back-btn" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
            Back
          </button>
          <button type="button" id="next-btn" class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition">
            Next
          </button>
        </div>
      </div>
    `;
  }

  renderStep4() {
    const { move, consent } = this.formData;
    return `
      <div>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Logistics & Final Details</h2>
        <p class="mb-6 text-gray-600">A few more details to get you an accurate quote.</p>

        <div class="mb-4">
          <label for="stairs_or_elevator" class="block text-sm font-medium text-gray-800 mb-1">Stairs or Elevator</label>
          <select
            id="stairs_or_elevator"
            name="stairs_or_elevator"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm border-gray-300"
          >
            <option value="">Select one...</option>
            <option value="none" ${move.stairs_or_elevator === 'none' ? 'selected' : ''}>None</option>
            <option value="stairs" ${move.stairs_or_elevator === 'stairs' ? 'selected' : ''}>Stairs</option>
            <option value="elevator" ${move.stairs_or_elevator === 'elevator' ? 'selected' : ''}>Elevator</option>
            <option value="both" ${move.stairs_or_elevator === 'both' ? 'selected' : ''}>Both</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="budget_range" class="block text-sm font-medium text-gray-800 mb-1">Budget Range</label>
          <select
            id="budget_range"
            name="budget_range"
            class="block w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm border-gray-300"
          >
            <option value="">Select range...</option>
            <option value="<500" ${move.budget_range === '<500' ? 'selected' : ''}><$500</option>
            <option value="$500-$999" ${move.budget_range === '$500-$999' ? 'selected' : ''}>$500-$999</option>
            <option value="$1k-$1.9k" ${move.budget_range === '$1k-$1.9k' ? 'selected' : ''}>$1k-$1.9k</option>
            <option value="$2k-$3.9k" ${move.budget_range === '$2k-$3.9k' ? 'selected' : ''}>$2k-$3.9k</option>
            <option value=">$4k" ${move.budget_range === '>$4k' ? 'selected' : ''}>$4k+</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="parking_constraints" class="block text-sm font-medium text-gray-800 mb-1">Parking Constraints (Optional)</label>
          <textarea
            id="parking_constraints"
            name="parking_constraints"
            rows="3"
            class="block w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm"
          >${move.parking_constraints || ''}</textarea>
        </div>

        <div class="mb-4">
          <label for="notes" class="block text-sm font-medium text-gray-800 mb-1">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            class="block w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm"
          >${move.notes || ''}</textarea>
        </div>

        <div class="mt-6">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="tcpa"
                name="tcpa"
                type="checkbox"
                ${consent.tcpa ? 'checked' : ''}
                class="focus:ring-amber-500 h-4 w-4 text-amber-500 border-gray-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="tcpa" class="font-medium text-gray-800">Consent to Contact *</label>
              <p class="text-gray-500 text-xs mt-1">${TCPA_CONSENT_TEXT}</p>
            </div>
          </div>
          ${this.errors.tcpa ? `<p class="mt-1 text-xs text-red-600">${this.errors.tcpa}</p>` : ''}
        </div>

        <div class="flex justify-between mt-6">
          <button type="button" id="back-btn" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
            Back
          </button>
          <button type="submit" id="submit-btn" class="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition">
            Get My Quotes
          </button>
        </div>
      </div>
    `;
  }

  attachStepEventListeners() {
    // Input change listeners
    this.container.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', (e) => this.handleInputChange(e));
      input.addEventListener('input', (e) => this.handleInputChange(e));
    });

    // Phone formatting
    const phoneInput = this.container.querySelector('#phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => this.handlePhoneInput(e));
    }

    // ZIP code formatting
    ['from_zip', 'to_zip'].forEach(id => {
      const zipInput = this.container.querySelector(`#${id}`);
      if (zipInput) {
        zipInput.addEventListener('input', (e) => this.handleZipInput(e));
      }
    });

    // Navigation buttons
    const nextBtn = this.container.querySelector('#next-btn');
    const backBtn = this.container.querySelector('#back-btn');
    const submitBtn = this.container.querySelector('#submit-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNext());
    }
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBack());
    }
    if (submitBtn) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    const section = this.getFieldSection(name);

    if (section) {
      this.formData[section][name] = type === 'checkbox' ? checked : value;

      // Clear error when field is modified
      if (this.errors[name]) {
        delete this.errors[name];
        this.renderStep();
      }
    }
  }

  handlePhoneInput(e) {
    const input = e.target.value.replace(/\D/g, '').substring(0, 10);
    const areaCode = input.substring(0, 3);
    const middle = input.substring(3, 6);
    const last = input.substring(6, 10);

    let maskedValue = '';
    if (input.length > 6) {
      maskedValue = `(${areaCode})${middle}-${last}`;
    } else if (input.length > 3) {
      maskedValue = `(${areaCode})${middle}`;
    } else if (input.length > 0) {
      maskedValue = `(${areaCode}`;
    }

    this.formData.prospect.phone = maskedValue;
    e.target.value = maskedValue;
  }

  handleZipInput(e) {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    this.formData.move[e.target.name] = value;
  }

  getFieldSection(fieldName) {
    if (['first_name', 'last_name', 'email', 'phone'].includes(fieldName)) {
      return 'prospect';
    }
    if (['from_zip', 'to_zip', 'date', 'flexible', 'home_size', 'items_count',
         'stairs_or_elevator', 'parking_constraints', 'budget_range', 'notes'].includes(fieldName)) {
      return 'move';
    }
    if (['tcpa'].includes(fieldName)) {
      return 'consent';
    }
    return null;
  }

  validateCurrentStep() {
    const step = STEPS[this.currentStep];
    const stepErrors = {};

    step.fields.forEach(field => {
      const error = this.validateField(field);
      if (error) {
        stepErrors[field] = error;
      }
    });

    this.errors = stepErrors;
    return Object.keys(stepErrors).length === 0;
  }

  validateField(field) {
    const { prospect, move, consent } = this.formData;

    // Step 1 validation
    if (field === 'first_name' && !prospect.first_name) {
      return 'This field is required.';
    }
    if (field === 'last_name' && !prospect.last_name) {
      return 'This field is required.';
    }
    if (field === 'email') {
      const hasEmail = !!prospect.email;
      const hasPhone = !!prospect.phone;

      if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prospect.email)) {
        return 'Please enter a valid email address.';
      }
      if (!hasEmail && !hasPhone) {
        return 'Either email or phone is required.';
      }
    }
    if (field === 'phone') {
      const hasEmail = !!prospect.email;
      const hasPhone = !!prospect.phone;

      if (hasPhone) {
        const digits = prospect.phone.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 10) {
          return 'Please enter a complete 10-digit phone number.';
        }
      }
      if (!hasEmail && !hasPhone) {
        return 'Either email or phone is required.';
      }
    }

    // Step 2 validation
    if (field === 'from_zip' && (!/^\d{5}$/.test(move.from_zip))) {
      return 'Must be a 5-digit ZIP code.';
    }
    if (field === 'to_zip' && (!/^\d{5}$/.test(move.to_zip))) {
      return 'Must be a 5-digit ZIP code.';
    }
    if (field === 'date') {
      if (move.date) {
        const parts = move.date.split('-').map(s => parseInt(s, 10));
        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
          return 'Move date must be in the future.';
        }
      } else if (!move.flexible) {
        return 'Please select a move date or check "My dates are flexible".';
      }
    }

    // Step 3 validation
    if (field === 'home_size') {
      const hasHomeSize = move.home_size;
      const hasValidItemsCount = move.items_count && move.items_count >= 1;

      if (!hasHomeSize && !hasValidItemsCount) {
        return 'Please select your home size or enter a valid item count.';
      }
    }
    if (field === 'items_count' && move.items_count !== null && move.items_count < 1) {
      return 'Number of items must be 1 or more.';
    }

    // Step 4 validation
    if (field === 'tcpa' && !consent.tcpa) {
      return 'You must agree to be contacted to receive quotes.';
    }

    return null;
  }

  handleNext() {
    if (!this.validateCurrentStep()) {
      this.renderStep();
      return;
    }

    this.trackEvent('form_step_completed', {
      step_number: this.currentStep + 1,
      step_name: STEPS[this.currentStep].name,
    });

    this.currentStep++;
    this.renderStep();
    this.updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleBack() {
    this.currentStep--;
    this.errors = {};
    this.renderStep();
    this.updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    if (!this.validateCurrentStep()) {
      this.renderStep();
      return;
    }

    // Check honeypot
    if (this.formData.honeypot_nickname) {
      console.warn('Bot detected');
      return;
    }

    this.isSubmitting = true;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const payload = this.preparePayload();
      const result = await this.submitLead(payload);

      this.trackEvent('form_submitted', {
        form_name: FORM_NAME,
        lead_id: result.lead_id,
      });

      // Show success message
      this.showSuccessMessage(result);
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage();
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Quotes';
      }
    }
  }

  preparePayload() {
    const { honeypot_nickname, ...restOfData } = this.formData;
    const prospectPayload = { ...restOfData.prospect };

    // Sanitize phone to E.164 format
    if (prospectPayload.phone) {
      const digits = prospectPayload.phone.replace(/\D/g, '');
      if (digits.length === 10) {
        prospectPayload.phone = `+1${digits}`;
      }
    }

    return {
      ...restOfData,
      prospect: prospectPayload,
      timestamp: new Date().toISOString(),
      tracking: this.getTrackingData(),
    };
  }

  async submitLead(payload) {
    const response = await fetch('/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  showSuccessMessage(result) {
    this.container.innerHTML = `
      <div class="text-center py-12">
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
        <p class="text-lg text-gray-600 mb-2">Your quote request has been received.</p>
        <p class="text-gray-600">You'll receive quotes from our top-rated movers within 24 hours.</p>
        <p class="text-sm text-gray-500 mt-4">Reference ID: ${result.lead_id || 'N/A'}</p>
      </div>
    `;
  }

  showErrorMessage() {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
      messageBox.textContent = 'There was an error submitting your request. Please try again.';
      messageBox.className = 'message-box error show';
      setTimeout(() => {
        messageBox.classList.remove('show');
      }, 5000);
    }
  }

  updateProgress() {
    const progress = ((this.currentStep + 1) / STEPS.length) * 100;
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Update step indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
      if (index < this.currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (index === this.currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }

  trackEvent(eventName, data = {}) {
    // GTM tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...data,
      });
    }

    // PostHog tracking
    if (window.posthog) {
      window.posthog.capture(eventName, data);
    }
  }
}

// Initialize form when DOM is ready
if (typeof window !== 'undefined') {
  window.leadFormHandler = new LeadFormHandler();
}

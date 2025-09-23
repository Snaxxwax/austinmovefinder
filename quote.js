document.addEventListener('DOMContentLoaded', function() {
    /** 
     * @tweakable The delay in milliseconds before showing the success message after form submission.
     */
    const submissionSuccessDelay = 2000;

    // Configuration
    const CONFIG = {
        totalSteps: 2,
        stepFileTemplate: 'quote-step-{step}.html',
        hiddenStep1ContainerId: 'step-1-hidden-fields',
        phoneMaxLength: 10,
        zipMaxLength: 5
    };

    // Form elements
    const form = document.getElementById('quote-form');
    const formStepsContainer = document.getElementById('form-steps-container');
    const messageBox = document.getElementById('message-box');
    const progressFill = document.getElementById('progress-fill');
    
    let currentStep = 1;
    const formState = {};
    let eventListeners = new Map(); // Track event listeners to prevent duplicates

    /**
     * Load a specific form step
     */
    async function loadStep(stepNumber) {
        try {
            const stepFile = CONFIG.stepFileTemplate.replace('{step}', stepNumber);
            const response = await fetch(stepFile);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Could not load step ${stepNumber}`);
            }
            
            const html = await response.text();
            formStepsContainer.innerHTML = html;
            
            const stepElement = formStepsContainer.querySelector('.form-step');
            if (!stepElement) {
                throw new Error(`Step element not found in loaded HTML for step ${stepNumber}`);
            }

            stepElement.classList.add('active');
            
            // Setup step-specific functionality
            await setupStepListeners(stepNumber);
            
            if (stepNumber === 1) {
                restoreStepState(1);
                removeHiddenStep1Fields();
            } else if (stepNumber === 2) {
                restoreStepState(2);
                syncStep1HiddenFields();
            }
            
        } catch (error) {
            console.error('Failed to load form step:', error);
            showMessage('Error loading form. Please refresh and try again.', 'error');
        }
    }

    /**
     * Setup listeners for a specific step
     */
    async function setupStepListeners(stepNumber) {
        // Clear existing listeners for this step
        clearStepListeners(stepNumber);

        if (stepNumber === 1) {
            setupStep1Listeners();
        } else if (stepNumber === 2) {
            setupStep2Listeners();
        }
        
        setupCommonListeners();
    }

    /**
     * Clear event listeners for a step to prevent duplicates
     */
    function clearStepListeners(stepNumber) {
        const stepKey = `step-${stepNumber}`;
        if (eventListeners.has(stepKey)) {
            const listeners = eventListeners.get(stepKey);
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners.delete(stepKey);
        }
    }

    /**
     * Add tracked event listener
     */
    function addTrackedListener(stepNumber, element, event, handler) {
        const stepKey = `step-${stepNumber}`;
        if (!eventListeners.has(stepKey)) {
            eventListeners.set(stepKey, []);
        }
        
        eventListeners.get(stepKey).push({ element, event, handler });
        element.addEventListener(event, handler);
    }

    function setupStep1Listeners() {
        const nextBtn = document.getElementById('next-1');
        if (nextBtn) {
            const handler = () => navigateToStep(2);
            addTrackedListener(1, nextBtn, 'click', handler);
        }
        
        // Set minimum date for move date
        const moveDate = document.getElementById('move-date');
        if (moveDate) {
            const today = new Date().toISOString().split('T')[0];
            moveDate.setAttribute('min', today);
        }

        // Phone formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            addTrackedListener(1, phoneInput, 'input', formatPhone);
        }
        
        // ZIP code formatting
        const zipInputs = document.querySelectorAll('#from-zip, #to-zip');
        zipInputs.forEach(input => {
            addTrackedListener(1, input, 'input', formatZip);
        });
    }

    function setupStep2Listeners() {
        const backBtn = document.getElementById('back-2');
        if (backBtn) {
            const handler = () => navigateToStep(1);
            addTrackedListener(2, backBtn, 'click', handler);
        }
        
        // Service card selection
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            const handler = function() {
                serviceCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            };
            addTrackedListener(2, card, 'click', handler);
        });
        
        // Checkbox handling
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            addTrackedListener(2, checkbox, 'change', handleCheckboxChange);
        });
    }

    /**
     * Setup common listeners that apply to all steps
     */
    function setupCommonListeners() {
        clearErrorsOnInput();
    }
    
    /**
     * Navigate to a specific step
     */
    function navigateToStep(stepNumber) {
        if (stepNumber > currentStep) { // Moving forward
            if (currentStep === 1 && !validateStep1()) {
                showMessage('Please fill in all required fields correctly.', 'error', 3000);
                return;
            }
        }

        persistStepState(currentStep);
        currentStep = stepNumber;
        
        loadStep(currentStep).then(() => {
            updateProgress(currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Format phone number input
     */
    function formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > CONFIG.phoneMaxLength) {
            value = value.slice(0, CONFIG.phoneMaxLength);
        }
        
        // Apply formatting based on length
        if (value.length >= 7) {
            value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else if (value.length >= 4) {
            value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        
        e.target.value = value;
    }

    /**
     * Format ZIP code input
     */
    function formatZip(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, CONFIG.zipMaxLength);
    }
    
    /**
     * Handle checkbox selection logic
     */
    function handleCheckboxChange() {
        const parent = this.closest('.checkbox-grid');
        if (!parent) return;
        
        if (this.value === 'none' && this.checked) {
            // If "none" is selected, uncheck all others
            parent.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (cb.value !== 'none') {
                    cb.checked = false;
                    const wrapper = cb.closest('.checkbox-item');
                    if (wrapper) wrapper.classList.remove('checked');
                }
            });
        } else if (this.checked && this.value !== 'none') {
            // If any other option is selected, uncheck "none"
            const noneCheckbox = parent.querySelector('input[value="none"]');
            if (noneCheckbox && noneCheckbox.checked) {
                noneCheckbox.checked = false;
                const wrapper = noneCheckbox.closest('.checkbox-item');
                if (wrapper) wrapper.classList.remove('checked');
            }
        }
        
        // Update visual state
        const wrapper = this.closest('.checkbox-item');
        if (wrapper) {
            wrapper.classList.toggle('checked', this.checked);
        }
    }

    /**
     * Validate step 1 fields
     */
    function validateStep1() {
        const requiredFields = document.querySelectorAll('#step-1 [required]');
        let isValid = true;

        requiredFields.forEach(field => {
            const fieldContainer = field.closest('.form-group');
            if (fieldContainer) {
                fieldContainer.classList.remove('error');
            }
            
            if (!field.value.trim()) {
                isValid = false;
                if (fieldContainer) {
                    fieldContainer.classList.add('error');
                }
            }
        });

        // Email validation
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            isValid = false;
            const container = email.closest('.form-group');
            if (container) container.classList.add('error');
        }

        // Phone validation
        const phone = document.getElementById('phone');
        if (phone && phone.value.replace(/\D/g, '').length !== CONFIG.phoneMaxLength) {
            isValid = false;
            const container = phone.closest('.form-group');
            if (container) container.classList.add('error');
        }

        return isValid;
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Persist current step state to memory
     */
    function persistStepState(stepNumber) {
        const stepElement = formStepsContainer.querySelector(`#step-${stepNumber}`);
        if (!stepElement) return;

        const fields = stepElement.querySelectorAll('input, select, textarea');
        if (!fields.length) return;

        const fieldsArray = Array.from(fields);
        const state = {};

        fieldsArray.forEach(field => {
            if (!field.name) return;

            if (field.type === 'checkbox') {
                handleCheckboxPersistence(field, fieldsArray, state);
            } else if (field.type === 'radio') {
                handleRadioPersistence(field, state);
            } else {
                state[field.name] = field.value;
            }
        });

        formState[stepNumber] = state;
    }

    /**
     * Handle checkbox field persistence
     */
    function handleCheckboxPersistence(field, fieldsArray, state) {
        const sameNameCheckboxes = fieldsArray.filter(f => 
            f.type === 'checkbox' && f.name === field.name
        );
        
        if (sameNameCheckboxes.length > 1) {
            state[field.name] = state[field.name] || [];
            if (field.checked) {
                state[field.name].push(field.value);
            }
        } else {
            state[field.name] = field.checked;
        }
    }

    /**
     * Handle radio field persistence
     */
    function handleRadioPersistence(field, state) {
        if (field.checked) {
            state[field.name] = field.value;
        } else if (!(field.name in state)) {
            state[field.name] = '';
        }
    }

    /**
     * Restore state for a specific step
     */
    function restoreStepState(stepNumber) {
        const state = formState[stepNumber];
        if (!state) return;

        const stepElement = formStepsContainer.querySelector(`#step-${stepNumber}`);
        if (!stepElement) return;

        // Reset service card selection for step 2
        if (stepNumber === 2) {
            stepElement.querySelectorAll('.service-card').forEach(card => {
                card.classList.remove('selected');
            });
        }

        const fields = stepElement.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            restoreFieldState(field, state);
        });
    }

    /**
     * Restore individual field state
     */
    function restoreFieldState(field, state) {
        if (!field.name || !(field.name in state)) return;

        const storedValue = state[field.name];

        if (field.type === 'checkbox') {
            restoreCheckboxState(field, storedValue);
        } else if (field.type === 'radio') {
            restoreRadioState(field, storedValue);
        } else {
            field.value = storedValue;
        }
    }

    /**
     * Restore checkbox state
     */
    function restoreCheckboxState(field, storedValue) {
        if (Array.isArray(storedValue)) {
            field.checked = storedValue.includes(field.value);
        } else {
            field.checked = Boolean(storedValue);
        }

        const checkboxWrapper = field.closest('.checkbox-item');
        if (checkboxWrapper) {
            checkboxWrapper.classList.toggle('checked', field.checked);
        }
    }

    /**
     * Restore radio state
     */
    function restoreRadioState(field, storedValue) {
        const isSelected = storedValue === field.value;
        field.checked = isSelected;

        if (isSelected) {
            const card = field.closest('.service-card');
            if (card) {
                card.classList.add('selected');
            }
        }
    }

    /**
     * Remove hidden step 1 fields
     */
    function removeHiddenStep1Fields() {
        const existingContainer = form?.querySelector(`#${CONFIG.hiddenStep1ContainerId}`);
        if (existingContainer) {
            existingContainer.remove();
        }
    }

    /**
     * Sync step 1 data as hidden fields for form submission
     */
    function syncStep1HiddenFields() {
        removeHiddenStep1Fields();

        const step1State = formState[1];
        if (!step1State) return;

        const hiddenContainer = document.createElement('div');
        hiddenContainer.id = CONFIG.hiddenStep1ContainerId;
        hiddenContainer.style.display = 'none';
        hiddenContainer.setAttribute('aria-hidden', 'true');

        Object.entries(step1State).forEach(([name, value]) => {
            createHiddenField(hiddenContainer, name, value);
        });

        if (hiddenContainer.childElementCount) {
            form?.appendChild(hiddenContainer);
        }
    }

    /**
     * Create hidden input field
     */
    function createHiddenField(container, name, value) {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                value.forEach(itemValue => {
                    const input = createHiddenInput(name, itemValue);
                    container.appendChild(input);
                });
            }
        } else if (value !== undefined && value !== null) {
            const input = createHiddenInput(name, 
                typeof value === 'boolean' ? String(value) : value
            );
            container.appendChild(input);
        }
    }

    /**
     * Create hidden input element
     */
    function createHiddenInput(name, value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        return input;
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Honeypot spam protection
        const honeypot = document.querySelector('input[name="website"]');
        if (honeypot?.value) {
            console.warn('Spam attempt detected');
            return false;
        }

        const submitBtn = document.getElementById('submit-btn');
        setSubmitButtonState(submitBtn, true);

        try {
            persistStepState(currentStep);
            syncStep1HiddenFields();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            data.specialItems = formData.getAll('special-items');

            console.log('Form data:', data);

            // TODO: Replace with actual API call
            await simulateFormSubmission();
            
            showSuccessMessage();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('There was an error submitting your form. Please try again.', 'error');
            setSubmitButtonState(submitBtn, false);
        }
    }

    /**
     * Set submit button loading state
     */
    function setSubmitButtonState(button, isLoading) {
        if (!button) return;
        
        button.classList.toggle('loading', isLoading);
        button.disabled = isLoading;
    }

    /**
     * Simulate form submission (replace with actual API call)
     */
    function simulateFormSubmission() {
        return new Promise(resolve => {
            setTimeout(resolve, submissionSuccessDelay);
        });
    }

    /**
     * Show success message and update UI
     */
    function showSuccessMessage() {
        updateProgress(CONFIG.totalSteps + 1);
        
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.display = 'none';
        }

        form.innerHTML = `
            <div style="text-align: center;">
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
                <a href="/" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                    Back to Homepage
                </a>
            </div>
        `;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Show message to user
     */
    function showMessage(text, type, duration = null) {
        if (!messageBox) return;
        
        messageBox.textContent = text;
        messageBox.className = `message-box ${type} show`;
        
        if (duration) {
            setTimeout(() => messageBox.classList.remove('show'), duration);
        }
    }

    /**
     * Clear error states when user starts typing
     */
    function clearErrorsOnInput() {
        const fields = document.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            const handler = function() {
                const group = this.closest('.form-group');
                if (group) {
                    group.classList.remove('error');
                }
                if (messageBox && messageBox.classList.contains('show')) {
                    messageBox.classList.remove('show');
                }
            };
            
            // Remove existing listener to prevent duplicates
            field.removeEventListener('input', handler);
            field.addEventListener('input', handler);
        });
    }

    /**
     * Update progress bar (placeholder - implement based on your progress bar structure)
     */
    function updateProgress(step) {
        if (!progressFill) return;
        
        const percentage = Math.min((step / CONFIG.totalSteps) * 100, 100);
        progressFill.style.width = `${percentage}%`;
    }

    // Initialize the form
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        loadStep(1);
    } else {
        console.error('Form element not found');
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        eventListeners.clear();
    });
});

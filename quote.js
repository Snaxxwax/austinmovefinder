document.addEventListener('DOMContentLoaded', function() {
    /** 
     * @tweakable The delay in milliseconds before showing the success message after form submission.
     */
    const submissionSuccessDelay = 2000;

    // Form elements
    const form = document.getElementById('quote-form');
    const formStepsContainer = document.getElementById('form-steps-container');
    const messageBox = document.getElementById('message-box');
    const progressFill = document.getElementById('progress-fill');
    
    let currentStep = 1;
    const totalSteps = 2;

    async function loadStep(stepNumber) {
        try {
            const response = await fetch(`quote-step-${stepNumber}.html`);
            if (!response.ok) throw new Error(`Could not load step ${stepNumber}`);
            const html = await response.text();
            formStepsContainer.innerHTML = html;
            const stepElement = formStepsContainer.querySelector('.form-step');
            
            // Re-run setup functions for the new content
            if (stepElement) {
                stepElement.classList.add('active');
                if (stepNumber === 1) setupStep1Listeners();
                if (stepNumber === 2) setupStep2Listeners();
            }
        } catch (error) {
            console.error('Failed to load form step:', error);
            messageBox.textContent = 'Error loading form. Please refresh and try again.';
            messageBox.className = 'message-box error show';
        }
    }

    function setupStep1Listeners() {
        document.getElementById('next-1').addEventListener('click', () => navigateToStep(2));
        
        // Re-attach validation and formatting listeners
        const moveDate = document.getElementById('move-date');
        const today = new Date().toISOString().split('T')[0];
        if(moveDate) moveDate.setAttribute('min', today);

        const phoneInput = document.getElementById('phone');
        if(phoneInput) phoneInput.addEventListener('input', formatPhone);
        
        const zipInputs = document.querySelectorAll('#from-zip, #to-zip');
        zipInputs.forEach(input => input.addEventListener('input', formatZip));
        
        clearErrorsOnInput();
    }

    function setupStep2Listeners() {
        document.getElementById('back-2').addEventListener('click', () => navigateToStep(1));
        
        // Re-attach interactive element listeners
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        clearErrorsOnInput();
    }
    
    function navigateToStep(stepNumber) {
        if (stepNumber > currentStep) { // Moving forward
            if (currentStep === 1 && !validateStep1()) {
                messageBox.textContent = 'Please fill in all required fields correctly.';
                messageBox.className = 'message-box error show';
                setTimeout(() => messageBox.classList.remove('show'), 3000);
                return;
            }
        }

        currentStep = stepNumber;
        loadStep(currentStep).then(() => {
            updateProgress(currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        if (value.length >= 7) value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        else if (value.length >= 4) value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        else if (value.length > 0) value = `(${value}`;
        e.target.value = value;
    }

    function formatZip(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    }
    
    function handleCheckboxChange() {
        const parent = this.closest('.checkbox-grid');
        if (this.value === 'none' && this.checked) {
            parent.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (cb.value !== 'none') {
                    cb.checked = false;
                    cb.parentElement.classList.remove('checked');
                }
            });
        } else if (this.value !== 'none' && this.checked) {
            const noneCheckbox = parent.querySelector('input[value="none"]');
            if (noneCheckbox) {
                noneCheckbox.checked = false;
                noneCheckbox.parentElement.classList.remove('checked');
            }
        }
        this.parentElement.classList.toggle('checked', this.checked);
    }

    function updateProgress(step) {
        const steps = document.querySelectorAll('.progress-step');
        const percentage = step === 1 ? 0 : step === 2 ? 50 : 100;
        if(progressFill) progressFill.style.width = percentage + '%';

        steps.forEach((s, index) => {
            if (index < step - 1) {
                s.classList.add('completed');
                s.classList.remove('active');
            } else if (index === step - 1) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active', 'completed');
            }
        });
    }

    function validateStep1() {
        const step1 = document.getElementById('step-1');
        const requiredFields = step1.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const fieldContainer = field.closest('.form-group');
            if (fieldContainer) fieldContainer.classList.remove('error');
            
            if (!field.value.trim()) {
                isValid = false;
                if (fieldContainer) fieldContainer.classList.add('error');
            }
        });

        const email = document.getElementById('email');
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            isValid = false;
            email.closest('.form-group')?.classList.add('error');
        }

        const phone = document.getElementById('phone');
        if (phone && phone.value.replace(/\D/g, '').length !== 10) {
            isValid = false;
            phone.closest('.form-group')?.classList.add('error');
        }

        return isValid;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (document.querySelector('input[name="website"]').value) return false;

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        data.specialItems = formData.getAll('special-items');

        console.log('Form data:', data);

        setTimeout(() => {
            updateProgress(3);
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) progressBar.style.display = 'none';

            form.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="color: var(--success-green, #28a745); font-size: 1.8rem; margin-bottom: 1rem;">Success!</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">We've received your detailed moving request. You'll receive personalized quotes from 3-5 top-rated Austin movers within the next 2 hours.</p>
                    <p style="font-size: 1.1rem; margin-bottom: 2rem;"><strong>Check your email for instant estimates!</strong></p>
                    <a href="/" class="btn btn-primary" style="text-decoration: none; display: inline-block;">Back to Homepage</a>
                </div>
            `;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, submissionSuccessDelay);
    }
    
    function clearErrorsOnInput() {
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                const group = this.closest('.form-group');
                if (group) group.classList.remove('error');
                if (messageBox.classList.contains('show')) {
                    messageBox.classList.remove('show');
                }
            });
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        loadStep(1); // Load the initial step
    }

    // tombstone: removed phone formatting, zip formatting, checkbox logic, progress update, validation, and navigation functions as they were refactored and integrated into the new dynamic loading structure.
});
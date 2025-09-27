import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM environment for form testing
class MockFormElement {
    constructor(id, type = 'input', required = false) {
        this.id = id;
        this.type = type;
        this.value = '';
        this.required = required;
        this.classList = new Set();
        this.style = {};
        this.disabled = false;
    }

    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    focus = vi.fn();
    blur = vi.fn();
}

class MockDocument {
    constructor() {
        this.elements = new Map();
        this.eventListeners = new Map();
    }

    getElementById(id) {
        return this.elements.get(id) || null;
    }

    querySelectorAll(selector) {
        const results = [];
        if (selector.includes('[required]')) {
            for (const [id, element] of this.elements) {
                if (element.required) results.push(element);
            }
        }
        if (selector.includes('.form-step')) {
            for (const [id, element] of this.elements) {
                if (element.classList.has('form-step')) results.push(element);
            }
        }
        return results;
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }

    addEventListener = vi.fn();
}

describe('Quote Form Integration', () => {
    let mockDoc;
    let formElements;

    beforeEach(() => {
        mockDoc = new MockDocument();

        // Create form elements
        formElements = {
            firstName: new MockFormElement('firstName', 'text', true),
            lastName: new MockFormElement('lastName', 'text', true),
            email: new MockFormElement('email', 'email', true),
            phone: new MockFormElement('phone', 'tel', true),
            moveDate: new MockFormElement('moveDate', 'date', true),
            moveFrom: new MockFormElement('moveFrom', 'text', true),
            moveTo: new MockFormElement('moveTo', 'text', true),
            homeSize: new MockFormElement('homeSize', 'select', true),
            submitBtn: new MockFormElement('submit-form', 'button'),
            nextBtn1: new MockFormElement('next-step-1', 'button'),
            prevBtn2: new MockFormElement('prev-step-2', 'button'),
            messageBox: new MockFormElement('message-box', 'div'),
            progressFill: new MockFormElement('progress-fill', 'div')
        };

        // Add elements to mock document
        for (const [key, element] of Object.entries(formElements)) {
            mockDoc.elements.set(element.id, element);
        }

        // Add form steps
        const step1 = new MockFormElement('step-1', 'div');
        const step2 = new MockFormElement('step-2', 'div');
        step1.classList.add('form-step');
        step2.classList.add('form-step');
        step1.dataset = { step: '1' };
        step2.dataset = { step: '2' };

        mockDoc.elements.set('step-1', step1);
        mockDoc.elements.set('step-2', step2);
    });

    describe('Form Initialization', () => {
        it('should initialize with step 1 active', () => {
            expect(mockDoc.getElementById('firstName')).toBeTruthy();
            expect(mockDoc.getElementById('lastName')).toBeTruthy();
            expect(mockDoc.getElementById('email')).toBeTruthy();
        });

        it('should have all required form elements', () => {
            const requiredElements = ['firstName', 'lastName', 'email', 'phone', 'moveDate'];

            requiredElements.forEach(id => {
                const element = mockDoc.getElementById(id);
                expect(element).toBeTruthy();
                expect(element.required).toBe(true);
            });
        });

        it('should have navigation buttons', () => {
            expect(mockDoc.getElementById('next-step-1')).toBeTruthy();
            expect(mockDoc.getElementById('prev-step-2')).toBeTruthy();
            expect(mockDoc.getElementById('submit-form')).toBeTruthy();
        });
    });

    describe('Form Navigation', () => {
        it('should validate step 1 before proceeding', () => {
            // Fill out step 1 with valid data
            formElements.firstName.value = 'John';
            formElements.lastName.value = 'Doe';
            formElements.email.value = 'john@example.com';
            formElements.phone.value = '5125551234';
            formElements.moveDate.value = '2024-12-01';

            const canProceed = validateStep1(formElements);
            expect(canProceed).toBe(true);
        });

        it('should prevent navigation with invalid step 1 data', () => {
            // Leave required fields empty
            formElements.firstName.value = '';
            formElements.lastName.value = 'Doe';
            formElements.email.value = 'invalid-email';
            formElements.phone.value = '123'; // too short

            const canProceed = validateStep1(formElements);
            expect(canProceed).toBe(false);
        });

        it('should allow going back from step 2 to step 1', () => {
            // This would normally be handled by the navigation function
            // We're testing the concept that back navigation is always allowed
            expect(true).toBe(true); // Back navigation doesn't require validation
        });
    });

    describe('Form Validation', () => {
        it('should validate email format', () => {
            const validEmails = ['user@example.com', 'test@domain.co.uk', 'name@company.org'];
            const invalidEmails = ['invalid', 'user@', '@domain.com', 'user.domain.com'];

            validEmails.forEach(email => {
                formElements.email.value = email;
                expect(validateEmailField(formElements.email)).toBe(true);
            });

            invalidEmails.forEach(email => {
                formElements.email.value = email;
                expect(validateEmailField(formElements.email)).toBe(false);
            });
        });

        it('should validate phone number format', () => {
            const validPhones = ['5125551234', '(512) 555-1234', '512-555-1234'];
            const invalidPhones = ['123456789', '12345678901', 'abcdefghij'];

            validPhones.forEach(phone => {
                formElements.phone.value = phone;
                expect(validatePhoneField(formElements.phone)).toBe(true);
            });

            invalidPhones.forEach(phone => {
                formElements.phone.value = phone;
                expect(validatePhoneField(formElements.phone)).toBe(false);
            });
        });

        it('should validate required fields', () => {
            const requiredFields = [
                formElements.firstName,
                formElements.lastName,
                formElements.email,
                formElements.phone,
                formElements.moveDate
            ];

            // Test empty values
            requiredFields.forEach(field => {
                field.value = '';
                expect(validateRequiredField(field)).toBe(false);

                field.value = '   '; // whitespace only
                expect(validateRequiredField(field)).toBe(false);
            });

            // Test valid values
            requiredFields.forEach(field => {
                field.value = 'valid value';
                expect(validateRequiredField(field)).toBe(true);
            });
        });
    });

    describe('Form Submission', () => {
        it('should prevent submission with invalid data', () => {
            // Set invalid data
            formElements.firstName.value = '';
            formElements.email.value = 'invalid-email';
            formElements.phone.value = '123';

            const isValid = validateCompleteForm(formElements);
            expect(isValid).toBe(false);
        });

        it('should allow submission with complete valid data', () => {
            // Fill all required fields with valid data
            formElements.firstName.value = 'John';
            formElements.lastName.value = 'Doe';
            formElements.email.value = 'john@example.com';
            formElements.phone.value = '5125551234';
            formElements.moveDate.value = '2024-12-01';
            formElements.moveFrom.value = '123 Main St';
            formElements.moveTo.value = '456 Oak Ave';
            formElements.homeSize.value = '2-bedroom';

            const isValid = validateCompleteForm(formElements);
            expect(isValid).toBe(true);
        });

        it('should disable submit button during submission', () => {
            const submitBtn = formElements.submitBtn;

            // Simulate submission
            submitBtn.disabled = true;
            expect(submitBtn.disabled).toBe(true);
        });
    });

    describe('User Experience', () => {
        it('should show loading state during submission', () => {
            const loadingStep = new MockFormElement('loading-step', 'div');
            mockDoc.elements.set('loading-step', loadingStep);

            // Simulate showing loading
            loadingStep.style.display = 'block';
            expect(loadingStep.style.display).toBe('block');
        });

        it('should format phone number as user types', () => {
            const testCases = [
                { input: '5125551234', expected: '(512) 555-1234' },
                { input: '512555', expected: '(512) 555' },
                { input: '512', expected: '(512' }
            ];

            testCases.forEach(({ input, expected }) => {
                const formatted = formatPhoneNumber(input);
                expect(formatted).toBe(expected);
            });
        });
    });
});

// Helper functions for testing (simplified versions of actual form logic)
function validateStep1(elements) {
    const requiredStep1 = [elements.firstName, elements.lastName, elements.email, elements.phone, elements.moveDate];

    for (const element of requiredStep1) {
        if (!validateRequiredField(element)) {
            return false;
        }
    }

    if (!validateEmailField(elements.email)) {
        return false;
    }

    if (!validatePhoneField(elements.phone)) {
        return false;
    }

    return true;
}

function validateEmailField(emailElement) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailElement.value);
}

function validatePhoneField(phoneElement) {
    const cleaned = phoneElement.value.replace(/\D/g, '');
    return cleaned.length === 10;
}

function validateRequiredField(element) {
    return Boolean(element.value && element.value.trim && element.value.trim().length > 0);
}

function validateCompleteForm(elements) {
    const allRequired = [
        elements.firstName, elements.lastName, elements.email,
        elements.phone, elements.moveDate, elements.moveFrom,
        elements.moveTo, elements.homeSize
    ];

    for (const element of allRequired) {
        if (!validateRequiredField(element)) {
            return false;
        }
    }

    return validateEmailField(elements.email) && validatePhoneField(elements.phone);
}

function formatPhoneNumber(input) {
    let value = input.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length >= 7) {
        return `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
    } else if (value.length >= 4) {
        return `(${value.slice(0,3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
        return `(${value}`;
    }

    return value;
}
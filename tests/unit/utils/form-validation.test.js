import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM for testing
function createMockElement(id, value = '', type = 'input') {
    return {
        id,
        value,
        type,
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            toggle: vi.fn()
        }
    };
}

function createMockDocument(elements) {
    return {
        getElementById: vi.fn((id) => elements[id]),
        querySelectorAll: vi.fn((selector) => {
            if (selector.includes('required')) {
                return Object.values(elements).filter(el => el.required);
            }
            return [];
        })
    };
}

// Extract validation functions from the quote form logic
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

function validateRequired(value) {
    return Boolean(value && value.trim && value.trim().length > 0);
}

describe('Form Validation', () => {
    describe('Email Validation', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('user@example.com')).toBe(true);
            expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
            expect(validateEmail('firstname.lastname@company.org')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('user@')).toBe(false);
            expect(validateEmail('user@.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail(' ')).toBe(false);
        });
    });

    describe('Phone Validation', () => {
        it('should validate 10-digit phone numbers', () => {
            expect(validatePhone('5125551234')).toBe(true);
            expect(validatePhone('(512) 555-1234')).toBe(true);
            expect(validatePhone('512-555-1234')).toBe(true);
            expect(validatePhone('512.555.1234')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('512555123')).toBe(false); // 9 digits
            expect(validatePhone('51255512345')).toBe(false); // 11 digits
            expect(validatePhone('')).toBe(false); // empty
            expect(validatePhone('abcdefghij')).toBe(false); // letters
            expect(validatePhone('555-CALL')).toBe(false); // partial letters
        });
    });

    describe('Required Field Validation', () => {
        it('should validate non-empty values', () => {
            expect(validateRequired('John Doe')).toBe(true);
            expect(validateRequired('a')).toBe(true);
            expect(validateRequired('123')).toBe(true);
        });

        it('should reject empty or whitespace values', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired('   ')).toBe(false);
            expect(validateRequired('\t\n')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });
    });

    describe('Form Step Validation', () => {
        let mockElements;
        let mockDocument;

        beforeEach(() => {
            mockElements = {
                'firstName': createMockElement('firstName', 'John', 'input'),
                'lastName': createMockElement('lastName', 'Doe', 'input'),
                'email': createMockElement('email', 'john@example.com', 'email'),
                'phone': createMockElement('phone', '(512) 555-1234', 'tel'),
                'moveDate': createMockElement('moveDate', '2024-12-01', 'date')
            };

            // Mark required fields
            mockElements.firstName.required = true;
            mockElements.lastName.required = true;
            mockElements.email.required = true;
            mockElements.phone.required = true;
            mockElements.moveDate.required = true;

            mockDocument = createMockDocument(mockElements);
        });

        it('should validate complete step 1 form', () => {
            const requiredFields = Object.values(mockElements).filter(el => el.required);
            let isValid = true;

            for (const field of requiredFields) {
                if (!validateRequired(field.value)) {
                    isValid = false;
                    break;
                }
            }

            // Additional email validation
            if (isValid && !validateEmail(mockElements.email.value)) {
                isValid = false;
            }

            // Additional phone validation
            if (isValid && !validatePhone(mockElements.phone.value)) {
                isValid = false;
            }

            expect(isValid).toBe(true);
        });

        it('should fail validation with empty required fields', () => {
            mockElements.firstName.value = '';

            const requiredFields = Object.values(mockElements).filter(el => el.required);
            let isValid = true;

            for (const field of requiredFields) {
                if (!validateRequired(field.value)) {
                    isValid = false;
                    break;
                }
            }

            expect(isValid).toBe(false);
        });

        it('should fail validation with invalid email', () => {
            mockElements.email.value = 'invalid-email';

            let isValid = true;

            // Check required fields first
            const requiredFields = Object.values(mockElements).filter(el => el.required);
            for (const field of requiredFields) {
                if (!validateRequired(field.value)) {
                    isValid = false;
                    break;
                }
            }

            // Check email validation
            if (isValid && !validateEmail(mockElements.email.value)) {
                isValid = false;
            }

            expect(isValid).toBe(false);
        });
    });
});
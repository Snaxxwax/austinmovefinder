import { describe, it, expect, vi } from 'vitest';

// Extract the formatPhone function logic for testing
function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length >= 7) {
        value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
    } else if (value.length >= 4) {
        value = `(${value.slice(0,3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
        value = `(${value}`;
    }

    e.target.value = value;
    return value;
}

describe('Phone Formatting', () => {
    it('should format phone number correctly for full 10 digits', () => {
        const mockEvent = {
            target: { value: '5125551234' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(512) 555-1234');
        expect(mockEvent.target.value).toBe('(512) 555-1234');
    });

    it('should format partial phone number with area code and partial local', () => {
        const mockEvent = {
            target: { value: '512555' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(512) 555');
        expect(mockEvent.target.value).toBe('(512) 555');
    });

    it('should format partial phone number with just area code', () => {
        const mockEvent = {
            target: { value: '512' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(512');
        expect(mockEvent.target.value).toBe('(512');
    });

    it('should handle empty input', () => {
        const mockEvent = {
            target: { value: '' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('');
        expect(mockEvent.target.value).toBe('');
    });

    it('should remove non-numeric characters', () => {
        const mockEvent = {
            target: { value: '512-555-1234' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(512) 555-1234');
        expect(mockEvent.target.value).toBe('(512) 555-1234');
    });

    it('should truncate numbers longer than 10 digits', () => {
        const mockEvent = {
            target: { value: '15125551234' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(151) 255-5123');
        expect(mockEvent.target.value).toBe('(151) 255-5123');
    });

    it('should handle mixed input with letters and numbers', () => {
        const mockEvent = {
            target: { value: '5a1b2c5d5e5f1g2h3i4j' }
        };

        const result = formatPhone(mockEvent);
        expect(result).toBe('(512) 555-1234');
        expect(mockEvent.target.value).toBe('(512) 555-1234');
    });
});
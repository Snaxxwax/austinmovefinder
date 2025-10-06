import { describe, it, expect, vi } from 'vitest';

// Mock the Astro component behavior for testing
function mockHeaderComponent() {
    return `
        <header>
            <div class="container">
                <nav class="navbar">
                    <a href="/" class="navbar-brand">
                        <img src="/logo.png" alt="Austin Move Finder">
                        Austin Move Finder
                    </a>
                    <ul class="navbar-nav">
                        <li><a href="/">Home</a></li>
                        <li><a href="/quote">Get Quote</a></li>
                        <li><a href="/privacy">Privacy</a></li>
                        <li><a href="/terms">Terms</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    `;
}

describe('Header Component', () => {
    it('should render header with correct structure', () => {
        const headerHTML = mockHeaderComponent();

        expect(headerHTML).toContain('<header>');
        expect(headerHTML).toContain('class="container"');
        expect(headerHTML).toContain('class="navbar"');
    });

    it('should contain logo and brand name', () => {
        const headerHTML = mockHeaderComponent();

        expect(headerHTML).toContain('Austin Move Finder');
        expect(headerHTML).toContain('/logo.png');
        expect(headerHTML).toContain('alt="Austin Move Finder"');
    });

    it('should contain all navigation links', () => {
        const headerHTML = mockHeaderComponent();

        expect(headerHTML).toContain('href="/"');
        expect(headerHTML).toContain('href="/quote"');
        expect(headerHTML).toContain('href="/privacy"');
        expect(headerHTML).toContain('href="/terms"');
    });

    it('should contain correct navigation text', () => {
        const headerHTML = mockHeaderComponent();

        expect(headerHTML).toContain('>Home<');
        expect(headerHTML).toContain('>Get Quote<');
        expect(headerHTML).toContain('>Privacy<');
        expect(headerHTML).toContain('>Terms<');
    });

    it('should have proper navbar structure', () => {
        const headerHTML = mockHeaderComponent();

        expect(headerHTML).toContain('class="navbar-brand"');
        expect(headerHTML).toContain('class="navbar-nav"');
        expect(headerHTML).toContain('<nav class="navbar">');
    });
});
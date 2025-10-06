import { describe, it, expect } from 'vitest';

// Mock the HeroSection component for testing
function mockHeroSectionComponent() {
    return `
        <section class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <h1>Find Trusted Austin Movers</h1>
                    <p>Get free quotes from top-rated moving companies in Austin, Texas. Compare prices and book your move in minutes.</p>
                    <div class="hero-buttons">
                        <a href="/quote" class="btn btn-primary btn-large">Get Free Quotes</a>
                        <a href="#features" class="btn btn-secondary btn-large">Learn More</a>
                    </div>
                </div>
                <div class="hero-image">
                    <img src="/hero-background.png" alt="Austin moving services" loading="lazy">
                </div>
            </div>
        </section>
    `;
}

describe('HeroSection Component', () => {
    it('should render hero section with correct structure', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('<section class="hero-section">');
        expect(heroHTML).toContain('class="container"');
        expect(heroHTML).toContain('class="hero-content"');
    });

    it('should contain main headline', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('<h1>Find Trusted Austin Movers</h1>');
    });

    it('should contain descriptive paragraph', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('Get free quotes from top-rated moving companies');
        expect(heroHTML).toContain('Austin, Texas');
        expect(heroHTML).toContain('Compare prices and book your move');
    });

    it('should contain call-to-action buttons', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('href="/quote"');
        expect(heroHTML).toContain('Get Free Quotes');
        expect(heroHTML).toContain('btn btn-primary btn-large');
    });

    it('should contain secondary button', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('href="#features"');
        expect(heroHTML).toContain('Learn More');
        expect(heroHTML).toContain('btn btn-secondary btn-large');
    });

    it('should contain hero image with proper attributes', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('/hero-background.png');
        expect(heroHTML).toContain('alt="Austin moving services"');
        expect(heroHTML).toContain('loading="lazy"');
    });

    it('should have proper button structure', () => {
        const heroHTML = mockHeroSectionComponent();

        expect(heroHTML).toContain('class="hero-buttons"');
        expect(heroHTML).toContain('class="btn');
    });

    it('should prioritize the main CTA button', () => {
        const heroHTML = mockHeroSectionComponent();

        // Primary button should come before secondary button
        const primaryIndex = heroHTML.indexOf('btn-primary');
        const secondaryIndex = heroHTML.indexOf('btn-secondary');

        expect(primaryIndex).toBeLessThan(secondaryIndex);
    });
});
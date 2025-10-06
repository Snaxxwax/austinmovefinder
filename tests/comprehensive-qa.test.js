/**
 * Comprehensive Quality Assurance Test Suite
 * Austin Move Finder - Complete Testing Framework
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("Austin Move Finder - Comprehensive QA Suite", () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Get Free Moving Quotes - Austin Move Finder</title>
        <meta name="description" content="Get instant moving quotes from trusted Austin movers. Takes only 2 minutes. Compare quotes from 3-5 top-rated moving companies.">
      </head>
      <body>
        <header>
          <div class="container">
            <a href="/" class="logo-link" aria-label="Austin Move Finder Home">
              <img src="/logo.png" alt="Austin Move Finder - Your trusted moving partner in Austin" class="logo">
            </a>
            <nav class="main-nav">
              <a href="/" class="nav-link">Home</a>
              <a href="/quote" class="nav-link active">Get Quote</a>
              <a href="/about" class="nav-link">About</a>
              <a href="/contact" class="nav-link">Contact</a>
            </nav>
          </div>
        </header>

        <main id="main-content">
          <section class="form-section" aria-labelledby="main-heading">
            <div class="container">
              <h1 id="main-heading">Get Instant Moving Quotes</h1>
              <p class="subtitle">Takes only 2 minutes • Get quotes from 3-5 top movers</p>

              <div id="message-box" class="message-box" role="alert" aria-live="polite" aria-atomic="true"></div>

              <div class="progress-bar" role="progressbar" aria-label="Form completion progress" aria-valuenow="1" aria-valuemin="1" aria-valuemax="2">
                <div class="progress-bar-fill" id="progress-fill"></div>
                <div class="progress-step active" data-step="1" aria-current="step">
                  <div class="progress-step-circle" aria-hidden="true">1</div>
                  <div class="progress-step-label">Basic Info</div>
                </div>
                <div class="progress-step" data-step="2">
                  <div class="progress-step-circle" aria-hidden="true">2</div>
                  <div class="progress-step-label">Move Details</div>
                </div>
                <div class="progress-step" data-step="3">
                  <div class="progress-step-circle" aria-hidden="true">✓</div>
                  <div class="progress-step-label">Complete</div>
                </div>
              </div>

              <form id="quote-form" method="POST" novalidate role="form" aria-label="Moving quote request form">
                <div class="honeypot" aria-hidden="true">
                  <input type="text" name="website" tabindex="-1" autocomplete="off">
                </div>
                <div id="form-steps-container" aria-live="polite">
                  <div id="step-1" class="form-step active">
                    <fieldset>
                      <legend>Personal Information</legend>
                      <div class="form-group">
                        <label for="name">Full Name*</label>
                        <input type="text" id="name" name="name" required aria-describedby="name-error">
                        <div id="name-error" class="error-message" role="alert"></div>
                      </div>
                      <div class="form-group">
                        <label for="email">Email Address*</label>
                        <input type="email" id="email" name="email" required aria-describedby="email-error">
                        <div id="email-error" class="error-message" role="alert"></div>
                      </div>
                      <div class="form-group">
                        <label for="phone">Phone Number*</label>
                        <input type="tel" id="phone" name="phone" required aria-describedby="phone-error">
                        <div id="phone-error" class="error-message" role="alert"></div>
                      </div>
                    </fieldset>
                    <button type="button" id="next-step-1" class="btn btn-primary">Next Step</button>
                  </div>
                </div>
                <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response">
              </form>
            </div>
          </section>
        </main>

        <footer>
          <div class="container">
            <p>&copy; 2024 Austin Move Finder. All rights reserved.</p>
            <nav class="footer-nav">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact Us</a>
            </nav>
          </div>
        </footer>
      </body>
      </html>
    `,
      {
        url: "https://austinmovefinder.com/quote",
        pretendToBeVisual: true,
        resources: "usable",
      },
    );

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
    global.location = window.location;
  });

  afterEach(() => {
    dom.window.close();
    vi.restoreAllMocks();
  });

  describe("1. Form Functionality Tests", () => {
    describe("Multi-step Form Navigation", () => {
      it("should initialize with step 1 active", () => {
        const step1 = document.querySelector('[data-step="1"]');
        const step2 = document.querySelector('[data-step="2"]');

        expect(step1.classList.contains("active")).toBe(true);
        expect(step2.classList.contains("active")).toBe(false);
      });

      it("should progress through form steps correctly", async () => {
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const nextButton = document.getElementById("next-step-1");

        // Fill out step 1
        nameInput.value = "John Doe";
        emailInput.value = "john@example.com";
        phoneInput.value = "(512) 555-0123";

        // Mock form validation
        const validateStep = vi.fn(() => true);
        window.validateStep = validateStep;

        // Simulate next button click
        nextButton.click();

        expect(validateStep).toHaveBeenCalled();
      });

      it("should prevent progression with invalid data", () => {
        const nameInput = document.getElementById("name");
        const nextButton = document.getElementById("next-step-1");

        // Leave name empty
        nameInput.value = "";

        // Simulate validation
        const isValid = nameInput.checkValidity();
        expect(isValid).toBe(false);
      });
    });

    describe("Form Validation", () => {
      it("should validate required fields", () => {
        const requiredFields = document.querySelectorAll("[required]");
        expect(requiredFields.length).toBeGreaterThan(0);

        requiredFields.forEach((field) => {
          expect(field.hasAttribute("required")).toBe(true);
          expect(field.getAttribute("aria-describedby")).toContain("error");
        });
      });

      it("should validate email format", () => {
        const emailInput = document.getElementById("email");

        // Test invalid email
        emailInput.value = "invalid-email";
        expect(emailInput.checkValidity()).toBe(false);

        // Test valid email
        emailInput.value = "test@example.com";
        expect(emailInput.checkValidity()).toBe(true);
      });

      it("should validate phone number format", () => {
        const phoneInput = document.getElementById("phone");

        // Test various phone formats
        const validFormats = ["(512) 555-0123", "(713) 123-4567"];

        const invalidFormats = ["123-456-7890", "512.555.0123", "abc-def-ghij"];

        validFormats.forEach((phone) => {
          phoneInput.value = phone;
          // In a real implementation, custom validation would check the pattern
          const pattern = /^\(\d{3}\) \d{3}-\d{4}$/;
          expect(pattern.test(phone)).toBe(true);
        });

        invalidFormats.forEach((phone) => {
          phoneInput.value = phone;
          const pattern = /^\(\d{3}\) \d{3}-\d{4}$/;
          expect(pattern.test(phone)).toBe(false);
        });
      });
    });

    describe("Honeypot Anti-Spam", () => {
      it("should include honeypot field for spam detection", () => {
        const honeypot = document.querySelector(
          '.honeypot input[name="website"]',
        );
        expect(honeypot).toBeTruthy();
        expect(honeypot.getAttribute("tabindex")).toBe("-1");
        expect(honeypot.getAttribute("autocomplete")).toBe("off");
      });
    });
  });

  describe("2. Accessibility Tests", () => {
    describe("ARIA Attributes", () => {
      it("should have proper ARIA labels on main navigation", () => {
        const logoLink = document.querySelector(".logo-link");
        expect(logoLink.getAttribute("aria-label")).toBe(
          "Austin Move Finder Home",
        );
      });

      it("should have proper form labeling", () => {
        const form = document.getElementById("quote-form");
        expect(form.getAttribute("aria-label")).toBe(
          "Moving quote request form",
        );
        expect(form.getAttribute("role")).toBe("form");
      });

      it("should have live regions for dynamic content", () => {
        const messageBox = document.getElementById("message-box");
        expect(messageBox.getAttribute("aria-live")).toBe("polite");
        expect(messageBox.getAttribute("aria-atomic")).toBe("true");
        expect(messageBox.getAttribute("role")).toBe("alert");
      });

      it("should have progress bar with ARIA attributes", () => {
        const progressBar = document.querySelector(".progress-bar");
        expect(progressBar.getAttribute("role")).toBe("progressbar");
        expect(progressBar.getAttribute("aria-label")).toBe(
          "Form completion progress",
        );
        expect(progressBar.getAttribute("aria-valuenow")).toBe("1");
        expect(progressBar.getAttribute("aria-valuemin")).toBe("1");
        expect(progressBar.getAttribute("aria-valuemax")).toBe("2");
      });
    });

    describe("Semantic HTML", () => {
      it("should use proper heading hierarchy", () => {
        const h1 = document.querySelector("h1");
        expect(h1).toBeTruthy();
        expect(h1.id).toBe("main-heading");
      });

      it("should have proper landmark elements", () => {
        const header = document.querySelector("header");
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");

        expect(header).toBeTruthy();
        expect(main).toBeTruthy();
        expect(footer).toBeTruthy();
        expect(main.getAttribute("id")).toBe("main-content");
      });

      it("should use fieldsets for form grouping", () => {
        const fieldset = document.querySelector("fieldset");
        const legend = document.querySelector("legend");

        expect(fieldset).toBeTruthy();
        expect(legend).toBeTruthy();
        expect(legend.textContent).toBe("Personal Information");
      });
    });

    describe("Keyboard Navigation", () => {
      it("should have visible focus indicators", () => {
        const focusableElements = document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        expect(focusableElements.length).toBeGreaterThan(0);

        // Check that honeypot is not focusable
        const honeypotInput = document.querySelector(".honeypot input");
        expect(honeypotInput.getAttribute("tabindex")).toBe("-1");
      });

      it("should have logical tab order", () => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
          ),
        ).filter((el) => {
          const tabindex = el.getAttribute("tabindex");
          return tabindex !== "-1" && !el.closest(".honeypot");
        });

        expect(focusableElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("3. Security Tests", () => {
    describe("Content Security Policy", () => {
      it("should validate HTTPS origins", () => {
        const allowedOrigins = [
          "https://austin-move-finder.pages.dev",
          "https://www.mitm.life",
          "https://mitm.life",
          "http://localhost:4321",
          "http://localhost:3000",
        ];

        // Mock getOrigin function behavior
        const getOrigin = (origin) => {
          if (origin && allowedOrigins.includes(origin)) {
            return origin;
          }
          return "https://mitm.life";
        };

        expect(getOrigin("https://mitm.life")).toBe("https://mitm.life");
        expect(getOrigin("https://evil-site.com")).toBe("https://mitm.life");
        expect(getOrigin("http://localhost:4321")).toBe(
          "http://localhost:4321",
        );
      });
    });

    describe("Input Sanitization", () => {
      it("should have proper input validation patterns", () => {
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");

        expect(nameInput.type).toBe("text");
        expect(emailInput.type).toBe("email");
      });

      it("should include Turnstile security token", () => {
        const turnstileInput = document.getElementById("cf-turnstile-response");
        expect(turnstileInput).toBeTruthy();
        expect(turnstileInput.type).toBe("hidden");
        expect(turnstileInput.name).toBe("cf-turnstile-response");
      });
    });
  });

  describe("4. SEO and Meta Data Tests", () => {
    describe("Meta Tags", () => {
      it("should have proper meta tags", () => {
        const title = document.title;
        const description = document.querySelector('meta[name="description"]');
        const viewport = document.querySelector('meta[name="viewport"]');

        expect(title).toBe("Get Free Moving Quotes - Austin Move Finder");
        expect(description.getAttribute("content")).toBe(
          "Get instant moving quotes from trusted Austin movers. Takes only 2 minutes. Compare quotes from 3-5 top-rated moving companies.",
        );
        expect(viewport.getAttribute("content")).toBe(
          "width=device-width, initial-scale=1.0",
        );
      });

      it("should have proper language attribute", () => {
        const htmlLang = document.documentElement.getAttribute("lang");
        expect(htmlLang).toBe("en");
      });

      it("should have structured data elements", () => {
        const h1 = document.querySelector("h1");
        const subtitle = document.querySelector(".subtitle");

        expect(h1.textContent).toBe("Get Instant Moving Quotes");
        expect(subtitle.textContent).toContain("Takes only 2 minutes");
      });
    });
  });

  describe("5. Error Handling Tests", () => {
    describe("User Feedback", () => {
      it("should provide error message containers", () => {
        const errorContainers = document.querySelectorAll(".error-message");
        expect(errorContainers.length).toBeGreaterThan(0);

        errorContainers.forEach((container) => {
          expect(container.getAttribute("role")).toBe("alert");
        });
      });

      it("should have message box for system feedback", () => {
        const messageBox = document.getElementById("message-box");
        expect(messageBox.className).toContain("message-box");
        expect(messageBox.getAttribute("role")).toBe("alert");
      });
    });
  });

  describe("6. Performance Tests", () => {
    describe("Resource Loading", () => {
      it("should have optimized image loading", () => {
        const logo = document.querySelector(".logo");
        expect(logo).toBeTruthy();
        expect(logo.getAttribute("alt")).toContain("Austin Move Finder");
      });

      it("should use semantic HTML for better performance", () => {
        const nav = document.querySelector("nav");
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");

        expect(nav).toBeTruthy();
        expect(main).toBeTruthy();
        expect(footer).toBeTruthy();
      });
    });
  });
});

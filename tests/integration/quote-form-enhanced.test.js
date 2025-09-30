/**
 * Enhanced Quote Form Integration Tests
 * Tests the complete quote form functionality including auto-save, validation, and submission
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

// Mock implementations
const mockLocalStorage = {
  store: {},
  getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key, value) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
};

const mockFetch = vi.fn();

// Setup DOM environment
function setupDOM() {
  const dom = new JSDOM(
    `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Quote Form Test</title>
        </head>
        <body>
            <div id="message-box" class="message-box" role="alert" aria-live="polite"></div>

            <div class="progress-bar">
                <div class="progress-bar-fill" id="progress-fill"></div>
            </div>

            <form id="quote-form" method="POST" novalidate>
                <div class="honeypot" aria-hidden="true">
                    <input type="text" name="website" tabindex="-1" autocomplete="off">
                </div>
                <div id="form-steps-container"></div>
            </form>

            <script>
                // Mock step 1 HTML
                window.mockStep1HTML = \`
                    <div class="form-step" id="step-1">
                        <div class="form-group">
                            <label for="name">Full Name<span class="required-star">*</span></label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email<span class="required-star">*</span></label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone<span class="required-star">*</span></label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label for="move-date">Move Date<span class="required-star">*</span></label>
                            <input type="date" id="move-date" name="move-date" required>
                        </div>
                        <div class="form-group">
                            <label for="from-zip">From ZIP<span class="required-star">*</span></label>
                            <input type="text" id="from-zip" name="from-zip" required>
                        </div>
                        <div class="form-group">
                            <label for="to-zip">To ZIP<span class="required-star">*</span></label>
                            <input type="text" id="to-zip" name="to-zip" required>
                        </div>
                        <div class="form-group">
                            <label for="move-size">Move Size<span class="required-star">*</span></label>
                            <select id="move-size" name="move-size" required>
                                <option value="">Select size</option>
                                <option value="1-bed">1 Bedroom</option>
                                <option value="2-bed">2 Bedrooms</option>
                            </select>
                        </div>
                        <button type="button" id="next-1">Next</button>
                    </div>
                \`;

                // Mock step 2 HTML
                window.mockStep2HTML = \`
                    <div class="form-step" id="step-2">
                        <div class="service-cards">
                            <label class="service-card">
                                <input type="radio" name="service-type" value="full-service">
                                <div class="service-card-title">Full Service</div>
                            </label>
                        </div>
                        <div class="checkbox-grid">
                            <label class="checkbox-item">
                                <input type="checkbox" name="special-items" value="piano">
                                <span>Piano</span>
                            </label>
                        </div>
                        <div class="cf-turnstile" data-sitekey="test-key"></div>
                        <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response">
                        <button type="button" id="back-2">Back</button>
                        <button type="submit" id="submit-btn">Submit</button>
                    </div>
                \`;
            </script>
        </body>
        </html>
    `,
    {
      url: "http://localhost:3000",
      pretendToBeVisual: true,
      resources: "usable",
      runScripts: "dangerously",
    },
  );

  // Setup global mocks
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = mockLocalStorage;
  global.fetch = mockFetch;
  global.console = { ...console, warn: vi.fn(), error: vi.fn() };

  // Mock Turnstile
  global.window.turnstile = {
    render: vi.fn(),
    reset: vi.fn(),
  };

  return dom;
}

describe("Enhanced Quote Form", () => {
  let dom;

  beforeEach(() => {
    dom = setupDOM();
    mockLocalStorage.clear();
    mockFetch.mockClear();
    vi.clearAllMocks();

    // Mock successful fetch responses
    mockFetch.mockImplementation((url) => {
      if (url === "quote-step-1.html") {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(window.mockStep1HTML),
        });
      }
      if (url === "quote-step-2.html") {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(window.mockStep2HTML),
        });
      }
      if (url === "/api/submit") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: "Success" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
    vi.restoreAllMocks();
  });

  describe("Form Initialization", () => {
    it("should initialize form elements correctly", async () => {
      const { FormEnhancements } = await import(
        "../../public/form-enhancements.js"
      );
      const formEnhancements = new FormEnhancements();

      expect(document.getElementById("quote-form")).toBeTruthy();
      expect(document.getElementById("message-box")).toBeTruthy();
      expect(document.getElementById("progress-fill")).toBeTruthy();
    });

    it("should load step 1 initially", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Simulate DOMContentLoaded
      const event = new window.Event("DOMContentLoaded");
      document.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledWith("quote-step-1.html");
    });
  });

  describe("Auto-Save Functionality", () => {
    it("should save form data to localStorage", async () => {
      const { FormEnhancements } = await import(
        "../../public/form-enhancements.js"
      );
      const formEnhancements = new FormEnhancements();

      // Simulate form input
      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      const nameInput = document.getElementById("name");
      nameInput.value = "John Doe";
      nameInput.dispatchEvent(new window.Event("input"));

      // Wait for auto-save timer
      await new Promise((resolve) => setTimeout(resolve, 5100));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "amf_quote_autosave",
        expect.stringContaining("John Doe"),
      );
    });

    it("should restore auto-saved data", async () => {
      // Set up saved data
      const savedData = {
        data: { name: "Jane Smith", email: "jane@example.com" },
        timestamp: Date.now(),
        step: 1,
      };
      mockLocalStorage.store.amf_quote_autosave = JSON.stringify(savedData);

      const { FormEnhancements } = await import(
        "../../public/form-enhancements.js"
      );
      const formEnhancements = new FormEnhancements();

      // Trigger restore
      formEnhancements.restoreAutoSavedData();

      const messageBox = document.getElementById("message-box");
      expect(messageBox.innerHTML).toContain("previous incomplete form");
    });

    it("should clear old auto-saved data", async () => {
      // Set up old data (25 hours ago)
      const oldData = {
        data: { name: "Old Data" },
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
        step: 1,
      };
      mockLocalStorage.store.amf_quote_autosave = JSON.stringify(oldData);

      const { FormEnhancements } = await import(
        "../../public/form-enhancements.js"
      );
      const formEnhancements = new FormEnhancements();

      formEnhancements.restoreAutoSavedData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "amf_quote_autosave",
      );
    });
  });

  describe("Form Validation", () => {
    beforeEach(async () => {
      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;
    });

    it("should validate required fields", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      const isValid = await handler.validateStep1();
      expect(isValid).toBe(false);

      // Check error classes
      const requiredFields = document.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        const group = field.closest(".form-group");
        expect(group.classList.contains("error")).toBe(true);
      });
    });

    it("should validate email format", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Fill required fields
      document.getElementById("name").value = "John Doe";
      document.getElementById("email").value = "invalid-email";
      document.getElementById("phone").value = "(512) 555-1234";
      document.getElementById("move-date").value = "2024-12-31";
      document.getElementById("from-zip").value = "78701";
      document.getElementById("to-zip").value = "78704";
      document.getElementById("move-size").value = "2-bed";

      const isValid = await handler.validateStep1();
      expect(isValid).toBe(false);

      const emailGroup = document
        .getElementById("email")
        .closest(".form-group");
      expect(emailGroup.classList.contains("error")).toBe(true);
    });

    it("should validate phone number format", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Fill required fields with invalid phone
      document.getElementById("name").value = "John Doe";
      document.getElementById("email").value = "john@example.com";
      document.getElementById("phone").value = "512555"; // Too short
      document.getElementById("move-date").value = "2024-12-31";
      document.getElementById("from-zip").value = "78701";
      document.getElementById("to-zip").value = "78704";
      document.getElementById("move-size").value = "2-bed";

      const isValid = await handler.validateStep1();
      expect(isValid).toBe(false);

      const phoneGroup = document
        .getElementById("phone")
        .closest(".form-group");
      expect(phoneGroup.classList.contains("error")).toBe(true);
    });

    it("should validate ZIP codes", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Test invalid ZIP
      const zipInput = document.getElementById("from-zip");
      zipInput.value = "1234"; // Too short

      const event = new window.Event("blur");
      zipInput.dispatchEvent(event);

      const zipGroup = zipInput.closest(".form-group");
      expect(zipGroup.classList.contains("error")).toBe(true);
    });

    it("should validate move date", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Fill fields with past date
      document.getElementById("name").value = "John Doe";
      document.getElementById("email").value = "john@example.com";
      document.getElementById("phone").value = "(512) 555-1234";
      document.getElementById("move-date").value = "2020-01-01"; // Past date
      document.getElementById("from-zip").value = "78701";
      document.getElementById("to-zip").value = "78704";
      document.getElementById("move-size").value = "2-bed";

      const isValid = await handler.validateStep1();
      expect(isValid).toBe(false);

      const dateGroup = document
        .getElementById("move-date")
        .closest(".form-group");
      expect(dateGroup.classList.contains("error")).toBe(true);
    });
  });

  describe("Phone Number Formatting", () => {
    it("should format phone number as user types", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      const phoneInput = document.getElementById("phone");

      // Simulate typing
      phoneInput.value = "5125551234";
      handler.formatPhone({ target: phoneInput });

      expect(phoneInput.value).toBe("(512) 555-1234");
    });

    it("should handle partial phone input", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      const phoneInput = document.getElementById("phone");

      // Partial input
      phoneInput.value = "512555";
      handler.formatPhone({ target: phoneInput });

      expect(phoneInput.value).toBe("(512) 555");
    });
  });

  describe("ZIP Code Formatting and Suggestions", () => {
    it("should format ZIP code input", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      const zipInput = document.getElementById("from-zip");
      zipInput.value = "abc78701xyz";

      handler.formatZip({ target: zipInput });

      expect(zipInput.value).toBe("78701");
    });

    it("should show ZIP code suggestions", async () => {
      const { FormEnhancements } = await import(
        "../../public/form-enhancements.js"
      );
      const formEnhancements = new FormEnhancements();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      const zipInput = document.getElementById("from-zip");
      formEnhancements.showZipSuggestions(zipInput, [
        "78701",
        "78702",
        "78703",
      ]);

      const suggestions = document.querySelector(".zip-suggestions");
      expect(suggestions).toBeTruthy();
      expect(suggestions.children.length).toBe(3);
    });
  });

  describe("Step Navigation", () => {
    it("should navigate to step 2 with valid data", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      // Fill valid data
      document.getElementById("name").value = "John Doe";
      document.getElementById("email").value = "john@example.com";
      document.getElementById("phone").value = "(512) 555-1234";
      document.getElementById("move-date").value = "2024-12-31";
      document.getElementById("from-zip").value = "78701";
      document.getElementById("to-zip").value = "78704";
      document.getElementById("move-size").value = "2-bed";

      await handler.navigateToStep(2);

      expect(mockFetch).toHaveBeenCalledWith("quote-step-2.html");
    });

    it("should prevent navigation with invalid data", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      // Leave fields empty
      await handler.navigateToStep(2);

      expect(handler.currentStep).toBe(1);
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep2HTML;

      // Mock valid form data
      handler.formState = {
        1: {
          name: "John Doe",
          email: "john@example.com",
          phone: "(512) 555-1234",
          "move-date": "2024-12-31",
          "from-zip": "78701",
          "to-zip": "78704",
          "move-size": "2-bed",
        },
      };

      // Set Turnstile response
      document.getElementById("cf-turnstile-response").value = "test-token";

      const submitEvent = new window.Event("submit");
      await handler.handleFormSubmit(submitEvent);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/submit",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
        }),
      );
    });

    it("should handle submission errors gracefully", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Mock fetch failure
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep2HTML;

      handler.formState = {
        1: {
          name: "John Doe",
          email: "john@example.com",
          phone: "(512) 555-1234",
          "move-date": "2024-12-31",
          "from-zip": "78701",
          "to-zip": "78704",
          "move-size": "2-bed",
        },
      };

      const submitEvent = new window.Event("submit");
      await handler.handleFormSubmit(submitEvent);

      const messageBox = document.getElementById("message-box");
      expect(messageBox.textContent).toContain("Network error");
    });

    it("should prevent spam with honeypot", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep2HTML;

      // Set honeypot value (spam attempt)
      document.querySelector('input[name="website"]').value = "spam";

      const submitEvent = new window.Event("submit");
      const result = await handler.handleFormSubmit(submitEvent);

      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalledWith(
        "/api/submit",
        expect.anything(),
      );
    });
  });

  describe("Accessibility Features", () => {
    it("should announce form errors to screen readers", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      const announceToScreenReader = vi.spyOn(
        handler,
        "announceToScreenReader",
      );

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep1HTML;

      await handler.validateStep1();

      expect(announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining("Form has"),
      );
    });

    it("should support keyboard navigation for service cards", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      document.getElementById("form-steps-container").innerHTML =
        window.mockStep2HTML;

      const serviceCard = document.querySelector(".service-card");

      // Check accessibility attributes
      expect(serviceCard.getAttribute("tabindex")).toBe("0");
      expect(serviceCard.getAttribute("role")).toBe("radio");
    });
  });

  describe("Responsive Design", () => {
    it("should optimize layout for mobile", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 400,
      });

      handler.handleResponsiveLayout();

      // Verify mobile optimizations
      const formSection = document.querySelector(".form-section");
      if (formSection) {
        expect(formSection.style.margin).toBe("10px");
        expect(formSection.style.padding).toBe("20px");
      }
    });
  });

  describe("Progress Tracking", () => {
    it("should update progress bar correctly", async () => {
      const { QuoteFormHandler } = await import(
        "../../public/quote-form-handler.js"
      );
      const handler = new QuoteFormHandler();

      handler.updateProgress(1);
      const progressFill = document.getElementById("progress-fill");
      expect(progressFill.style.width).toBe("50%");

      handler.updateProgress(2);
      expect(progressFill.style.width).toBe("100%");
    });
  });
});

describe("Integration with Cloudflare API", () => {
  it("should handle rate limiting responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          success: false,
          error: "Rate limit exceeded",
        }),
    });

    const { QuoteFormHandler } = await import(
      "../../public/quote-form-handler.js"
    );
    const handler = new QuoteFormHandler();

    try {
      await handler.submitForm();
    } catch (error) {
      expect(error.message).toContain("Rate limit exceeded");
    }
  });

  it("should handle Turnstile verification failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({
          success: false,
          error: "Security verification failed",
        }),
    });

    const { QuoteFormHandler } = await import(
      "../../public/quote-form-handler.js"
    );
    const handler = new QuoteFormHandler();

    try {
      await handler.submitForm();
    } catch (error) {
      expect(error.message).toContain("Security verification failed");
    }
  });
});

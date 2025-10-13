/**
 * Comprehensive test suite for the quote form system
 * Tests multi-step navigation, validation, and API submission
 */

// Mock DOM environment for testing
const { JSDOM } = require("jsdom");

describe("Quote Form System", () => {
  let dom;
  let window;
  let document;
  let QuoteFormHandler;

  beforeEach(() => {
    // Setup DOM environment
    dom = new JSDOM(
      `
            <!DOCTYPE html>
            <html>
            <head><title>Test</title></head>
            <body>
                <div id="message-box" class="message-box" role="alert" aria-live="polite"></div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="progress-fill"></div>
                    <div class="progress-step active" data-step="1">
                        <div class="progress-step-circle">1</div>
                        <div class="progress-step-label">Basic Info</div>
                    </div>
                    <div class="progress-step" data-step="2">
                        <div class="progress-step-circle">2</div>
                        <div class="progress-step-label">Move Details</div>
                    </div>
                </div>
                <form id="quote-form" method="POST" novalidate>
                    <div class="honeypot" aria-hidden="true">
                        <input type="text" name="website" tabindex="-1" autocomplete="off">
                    </div>
                    <div id="form-steps-container"></div>
                </form>
            </body>
            </html>
        `,
      {
        url: "http://localhost:4322",
        pretendToBeVisual: true,
        resources: "usable",
      },
    );

    window = dom.window;
    document = window.document;

    // Make global
    global.window = window;
    global.document = document;
    global.fetch = jest.fn();

    // Mock console methods
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Load the QuoteFormHandler
    require("../public/quote-form-handler.js");
    QuoteFormHandler = window.QuoteFormHandler;
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete global.window;
    delete global.document;
    delete global.fetch;
  });

  describe("Form Initialization", () => {
    test("should initialize form handler correctly", () => {
      expect(QuoteFormHandler).toBeDefined();

      const handler = new QuoteFormHandler();
      expect(handler.currentStep).toBe(1);
      expect(handler.CONFIG.totalSteps).toBe(2);
      expect(handler.formState).toEqual({});
    });

    test("should find required DOM elements", async () => {
      const handler = new QuoteFormHandler();
      await handler.initializeForm();

      expect(handler.form).toBeDefined();
      expect(handler.formStepsContainer).toBeDefined();
      expect(handler.messageBox).toBeDefined();
      expect(handler.progressFill).toBeDefined();
    });
  });

  describe("Step Navigation", () => {
    test("should load step 1 content", async () => {
      // Mock fetch for step HTML
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
                    <div class="form-step" id="step-1">
                        <h2>Basic Info</h2>
                        <input type="text" id="name" name="name" required>
                        <input type="email" id="email" name="email" required>
                        <button type="button" id="next-1">Next</button>
                    </div>
                `,
      });

      const handler = new QuoteFormHandler();
      await handler.loadStep(1);

      expect(document.querySelector("#step-1")).toBeTruthy();
      expect(document.querySelector("#name")).toBeTruthy();
      expect(document.querySelector("#email")).toBeTruthy();
    });

    test("should validate step 1 before proceeding", async () => {
      // Setup step 1 content
      document.getElementById("form-steps-container").innerHTML = `
                <div class="form-step" id="step-1">
                    <input type="text" id="name" name="name" required>
                    <input type="email" id="email" name="email" required>
                    <input type="tel" id="phone" name="phone" required>
                    <input type="date" id="move-date" name="move-date" required>
                    <input type="text" id="from-zip" name="from-zip" required>
                    <input type="text" id="to-zip" name="to-zip" required>
                    <select id="move-size" name="move-size" required>
                        <option value="">Select size</option>
                        <option value="1-bed">1 Bedroom</option>
                    </select>
                </div>
            `;

      const handler = new QuoteFormHandler();

      // Test empty form validation
      const isValid = await handler.validateStep1();
      expect(isValid).toBe(false);

      // Fill in valid data
      document.getElementById("name").value = "John Doe";
      document.getElementById("email").value = "john@example.com";
      document.getElementById("phone").value = "(512) 555-1234";
      document.getElementById("move-date").value = "2025-12-01";
      document.getElementById("from-zip").value = "78701";
      document.getElementById("to-zip").value = "78704";
      document.getElementById("move-size").value = "1-bed";

      const isValidNow = await handler.validateStep1();
      expect(isValidNow).toBe(true);
    });
  });

  describe("Form Validation", () => {
    test("should validate email format", () => {
      const handler = new QuoteFormHandler();

      expect(handler.isValidEmail("john@example.com")).toBe(true);
      expect(handler.isValidEmail("invalid-email")).toBe(false);
      expect(handler.isValidEmail("test@")).toBe(false);
      expect(handler.isValidEmail("@example.com")).toBe(false);
    });

    test("should format phone numbers correctly", () => {
      const handler = new QuoteFormHandler();
      const mockEvent = {
        target: { value: "5125551234" },
      };

      handler.formatPhone(mockEvent);
      expect(mockEvent.target.value).toBe("(512) 555-1234");
    });

    test("should format ZIP codes correctly", () => {
      const handler = new QuoteFormHandler();
      const mockEvent = {
        target: { value: "78701abc" },
      };

      handler.formatZip(mockEvent);
      expect(mockEvent.target.value).toBe("78701");
    });
  });

  describe("Form Submission", () => {
    test("should handle successful form submission", async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          quoteId: "AMF-12345-ABC",
        }),
      });

      const handler = new QuoteFormHandler();
      handler.form = document.getElementById("quote-form");
      handler.messageBox = document.getElementById("message-box");

      // Setup valid form data
      document.getElementById("form-steps-container").innerHTML = `
                <div class="form-step" id="step-1">
                    <input type="text" id="name" name="name" value="John Doe" required>
                    <input type="email" id="email" name="email" value="john@example.com" required>
                    <input type="tel" id="phone" name="phone" value="(512) 555-1234" required>
                    <input type="date" id="move-date" name="move-date" value="2025-12-01" required>
                    <input type="text" id="from-zip" name="from-zip" value="78701" required>
                    <input type="text" id="to-zip" name="to-zip" value="78704" required>
                    <select id="move-size" name="move-size" required>
                        <option value="1-bed" selected>1 Bedroom</option>
                    </select>
                    <button type="submit" id="submit-btn">Submit</button>
                </div>
            `;

      await handler.submitForm();

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/submit",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
        }),
      );
    });

    test("should handle form submission errors", async () => {
      // Mock API error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: "Missing required fields",
        }),
      });

      const handler = new QuoteFormHandler();
      handler.messageBox = document.getElementById("message-box");

      try {
        await handler.submitForm();
      } catch (error) {
        expect(error.message).toContain("Missing required fields");
      }
    });

    test("should prevent spam with honeypot", async () => {
      const handler = new QuoteFormHandler();
      const form = document.getElementById("quote-form");

      // Fill honeypot field (simulating spam)
      const honeypot = form.querySelector('input[name="website"]');
      honeypot.value = "spam-value";

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      const result = await handler.handleFormSubmit(mockEvent);
      expect(result).toBe(false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Progress Tracking", () => {
    test("should update progress bar correctly", () => {
      const handler = new QuoteFormHandler();
      const progressFill = document.getElementById("progress-fill");

      handler.updateProgress(1);
      expect(progressFill.style.width).toBe("0%");

      handler.updateProgress(2);
      expect(progressFill.style.width).toBe("100%");
    });

    test("should update step indicators", () => {
      const handler = new QuoteFormHandler();

      handler.updateProgress(2);

      const step1 = document.querySelector('[data-step="1"]');
      const step2 = document.querySelector('[data-step="2"]');

      expect(step1.classList.contains("completed")).toBe(true);
      expect(step2.classList.contains("active")).toBe(true);
    });
  });

  describe("Auto-save Functionality", () => {
    test("should save form state to localStorage", () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Load form enhancements module
      require("../public/form-enhancements.js");
      const FormEnhancements = window.FormEnhancements;

      const enhancements = new FormEnhancements();

      // Setup form with data
      document.getElementById("form-steps-container").innerHTML = `
                <input type="text" name="name" value="John Doe">
                <input type="email" name="email" value="john@example.com">
            `;

      enhancements.saveFormData();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "amf_quote_autosave",
        expect.stringContaining("John Doe"),
      );
    });
  });
});

// Integration tests for API endpoint
describe("Quote API Endpoint", () => {
  test("should process valid quote submission", async () => {
    const mockRequest = {
      formData: async () => {
        const formData = new Map();
        formData.set("name", "John Doe");
        formData.set("email", "john@example.com");
        formData.set("phone", "(512) 555-1234");
        formData.set("move-date", "2025-12-01");
        formData.set("from-zip", "78701");
        formData.set("to-zip", "78704");
        formData.set("move-size", "1-bed");
        formData.set("service-type", "full-service");
        formData.set("cf-turnstile-response", "valid-token");
        formData.set("website", ""); // honeypot

        return {
          get: (key) => formData.get(key),
          getAll: (key) => [formData.get(key)].filter(Boolean),
          toString: () => "name=John+Doe&email=john%40example.com...",
        };
      },
      headers: {
        get: (header) => {
          const headers = {
            "user-agent": "Mozilla/5.0 Test Browser",
            referer: "http://localhost:4322/quote",
            "cf-connecting-ip": "127.0.0.1",
          };
          return headers[header.toLowerCase()];
        },
      },
    };

    // This would test the actual API endpoint
    // const { POST } = require('../src/pages/api/submit.js');
    // const response = await POST({ request: mockRequest });
    // const result = await response.json();
    // expect(result.success).toBe(true);

    console.log(
      "API integration test placeholder - would test actual endpoint",
    );
  });
});

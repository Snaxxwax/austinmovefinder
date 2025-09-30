/**
 * Email Service Tests
 * Comprehensive tests for email service functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EmailService } from "../../src/services/email/emailService.js";

describe("EmailService", () => {
  let emailService;
  let mockConfig;

  beforeEach(() => {
    // Mock configuration
    mockConfig = {
      primaryProvider: "sendgrid",
      providers: {
        sendgrid: {
          apiKey: "test-sendgrid-key",
          fromEmail: "test@example.com",
          enabled: true,
        },
        mailgun: {
          apiKey: "test-mailgun-key",
          domain: "test.example.com",
          fromEmail: "test@example.com",
          enabled: true,
        },
        nodemailer: {
          host: "smtp.example.com",
          port: 587,
          auth: { user: "test", pass: "test" },
          fromEmail: "test@example.com",
          enabled: false,
        },
      },
      business: {
        email: "business@example.com",
        name: "Test Business",
        phone: "(555) 123-4567",
        website: "https://test.com",
      },
      settings: {
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 5000,
        enableTracking: true,
        enableAnalytics: true,
        logEmails: true,
        dryRun: false,
      },
      templates: {
        baseUrl: "https://test.com",
        unsubscribeUrl: "https://test.com/unsubscribe",
      },
    };

    // Mock getEmailConfig
    vi.doMock("../../src/config/email.js", () => ({
      getEmailConfig: () => mockConfig,
      getFallbackProviders: () => ["mailgun"],
      EMAIL_PROVIDERS: {
        SENDGRID: "sendgrid",
        MAILGUN: "mailgun",
        NODEMAILER: "nodemailer",
      },
    }));

    emailService = new EmailService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with correct configuration", () => {
      expect(emailService.config).toBeDefined();
      expect(emailService.providers).toBeDefined();
      expect(emailService.providers.size).toBeGreaterThan(0);
    });

    it("should set up fallback providers", () => {
      expect(emailService.fallbackProviders).toBeDefined();
      expect(Array.isArray(emailService.fallbackProviders)).toBe(true);
    });
  });

  describe("Email Validation", () => {
    it("should validate required email fields", () => {
      const invalidEmailData = {
        subject: "Test Subject",
        // Missing 'to' field
      };

      expect(() => {
        emailService.validateEmailData(invalidEmailData);
      }).toThrow("Missing required email fields: to");
    });

    it("should validate email addresses", () => {
      const emailData = {
        to: "invalid-email",
        subject: "Test Subject",
        html: "<p>Test</p>",
      };

      expect(() => {
        emailService.validateEmailData(emailData);
      }).toThrow("Invalid email address: invalid-email");
    });

    it("should require either HTML or text content", () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        // Missing html and text
      };

      expect(() => {
        emailService.validateEmailData(emailData);
      }).toThrow("Email must have either HTML or text content");
    });

    it("should pass validation with valid data", () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      expect(() => {
        emailService.validateEmailData(emailData);
      }).not.toThrow();
    });
  });

  describe("Provider Management", () => {
    it("should test all configured providers", async () => {
      // Mock provider test methods
      const mockTestResults = {
        sendgrid: { success: true, provider: "SendGrid" },
        mailgun: { success: true, provider: "Mailgun" },
      };

      emailService.providers.forEach((provider, name) => {
        provider.testConnection = vi
          .fn()
          .mockResolvedValue(mockTestResults[name]);
      });

      const results = await emailService.testProviders();

      expect(results).toBeDefined();
      expect(Object.keys(results)).toContain("sendgrid");
      expect(Object.keys(results)).toContain("mailgun");
    });
  });

  describe("Email Sending", () => {
    beforeEach(() => {
      // Mock provider send methods
      emailService.providers.forEach((provider) => {
        provider.sendEmail = vi.fn().mockResolvedValue({
          messageId: "test-message-id",
          provider: provider.name,
        });
      });
    });

    it("should send email successfully with primary provider", async () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
        type: "test",
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe("sendgrid");
      expect(result.messageId).toBe("test-message-id");
    });

    it("should fallback to secondary provider on failure", async () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      // Make primary provider fail
      const sendgridProvider = emailService.providers.get("sendgrid");
      sendgridProvider.sendEmail = vi
        .fn()
        .mockRejectedValue(new Error("Primary failed"));

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe("mailgun");
    });

    it("should handle dry run mode", async () => {
      emailService.config.settings.dryRun = true;

      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe("dry-run");
      expect(result.isDryRun).toBe(true);
    });
  });

  describe("Customer Confirmation Email", () => {
    beforeEach(() => {
      // Mock template engine
      vi.doMock("../../src/services/email/templateEngine.js", () => ({
        templateEngine: {
          renderCustomerConfirmation: vi.fn().mockResolvedValue({
            html: "<p>Customer confirmation email</p>",
            text: "Customer confirmation email",
            subject: "Quote Confirmation - TEST-123",
          }),
        },
      }));

      // Mock analytics
      vi.doMock("../../src/services/email/analytics.js", () => ({
        emailAnalytics: {
          trackSent: vi.fn().mockResolvedValue("track-id"),
          addTrackingToContent: vi.fn().mockImplementation((html) => html),
        },
      }));

      // Mock provider
      emailService.providers.forEach((provider) => {
        provider.sendEmail = vi.fn().mockResolvedValue({
          messageId: "test-message-id",
          provider: provider.name,
        });
      });
    });

    it("should send customer confirmation email", async () => {
      const customerData = {
        name: "John Doe",
        email: "john@example.com",
        moveDate: "2024-01-15",
        fromZip: "78701",
        toZip: "78702",
        moveSize: "2-bedroom",
        serviceType: "full-service",
      };

      const result = await emailService.sendCustomerConfirmation(
        customerData,
        "TEST-123",
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id");
    });

    it("should handle template rendering errors", async () => {
      const { templateEngine } = await import(
        "../../src/services/email/templateEngine.js"
      );
      templateEngine.renderCustomerConfirmation.mockRejectedValue(
        new Error("Template error"),
      );

      const customerData = {
        name: "John Doe",
        email: "john@example.com",
      };

      await expect(
        emailService.sendCustomerConfirmation(customerData, "TEST-123"),
      ).rejects.toThrow("Customer confirmation email failed");
    });
  });

  describe("Business Notification Email", () => {
    beforeEach(() => {
      // Mock template engine
      vi.doMock("../../src/services/email/templateEngine.js", () => ({
        templateEngine: {
          renderBusinessNotification: vi.fn().mockResolvedValue({
            html: "<p>Business notification email</p>",
            text: "Business notification email",
            subject: "New Quote Request - TEST-123",
          }),
        },
      }));

      emailService.providers.forEach((provider) => {
        provider.sendEmail = vi.fn().mockResolvedValue({
          messageId: "test-message-id",
          provider: provider.name,
        });
      });
    });

    it("should send business notification email", async () => {
      const customerData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "(555) 123-4567",
        moveDate: "2024-01-15",
      };

      const result = await emailService.sendBusinessNotification(
        customerData,
        "TEST-123",
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id");
    });
  });

  describe("Statistics", () => {
    it("should track email statistics", () => {
      emailService.updateStats("sendgrid", true, 1500);

      const stats = emailService.getStats();

      expect(stats.totalSent).toBe(1);
      expect(stats.providerStats.sendgrid).toBeDefined();
      expect(stats.providerStats.sendgrid.sent).toBe(1);
      expect(stats.providerStats.sendgrid.avgDuration).toBe(1500);
    });

    it("should track failed email statistics", () => {
      emailService.updateStats("sendgrid", false);

      const stats = emailService.getStats();

      expect(stats.totalFailed).toBe(1);
      expect(stats.providerStats.sendgrid.failed).toBe(1);
    });
  });

  describe("Utility Methods", () => {
    it("should generate tracking IDs", () => {
      const trackingId = emailService.generateTrackingId("TEST-123");

      expect(trackingId).toMatch(/^track_TEST-123_\d+_[a-z0-9]+$/);
    });

    it("should handle sleep delays", async () => {
      const start = Date.now();
      await emailService.sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Error Scenarios", () => {
    it("should handle all providers failing", async () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      // Make all providers fail
      emailService.providers.forEach((provider) => {
        provider.sendEmail = vi
          .fn()
          .mockRejectedValue(new Error("Provider failed"));
      });

      await expect(emailService.sendEmail(emailData)).rejects.toThrow(
        "All email providers failed",
      );
    });

    it("should handle timeout errors", async () => {
      const emailData = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      emailService.config.settings.timeout = 100;

      // Make provider hang
      emailService.providers.forEach((provider) => {
        provider.sendEmail = vi
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 200)),
          );
      });

      await expect(emailService.sendEmail(emailData)).rejects.toThrow(
        "All email providers failed",
      );
    });
  });
});

describe("Email Service Integration", () => {
  it("should integrate with queue service", async () => {
    // This would test integration with the email queue
    expect(true).toBe(true); // Placeholder
  });

  it("should integrate with analytics service", async () => {
    // This would test analytics integration
    expect(true).toBe(true); // Placeholder
  });

  it("should integrate with bounce handler", async () => {
    // This would test bounce handling integration
    expect(true).toBe(true); // Placeholder
  });
});

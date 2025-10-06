/**
 * Email Service - Main orchestration layer
 * Manages multiple email providers with fallback support, retry logic, and analytics
 */

import {
  getEmailConfig,
  getFallbackProviders,
  EMAIL_PROVIDERS,
} from "../../config/email.js";
import { SendGridProvider } from "./providers/sendgrid.js";
import { MailgunProvider } from "./providers/mailgun.js";
import { NodemailerProvider } from "./providers/nodemailer.js";
import { templateEngine } from "./templateEngine.js";
import { emailAnalytics } from "./analytics.js";

export class EmailService {
  constructor() {
    this.config = getEmailConfig();
    this.providers = new Map();
    this.fallbackProviders = [];
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      providerStats: {},
    };

    this.initialize();
  }

  /**
   * Initialize email providers
   */
  initialize() {
    try {
      // Initialize available providers
      if (this.config.providers.sendgrid.enabled) {
        this.providers.set(
          EMAIL_PROVIDERS.SENDGRID,
          new SendGridProvider(this.config.providers.sendgrid),
        );
      }

      if (this.config.providers.mailgun.enabled) {
        this.providers.set(
          EMAIL_PROVIDERS.MAILGUN,
          new MailgunProvider(this.config.providers.mailgun),
        );
      }

      if (this.config.providers.nodemailer.enabled) {
        this.providers.set(
          EMAIL_PROVIDERS.NODEMAILER,
          new NodemailerProvider(this.config.providers.nodemailer),
        );
      }

      // Set up fallback chain
      this.fallbackProviders = getFallbackProviders();

      console.log(
        `Email service initialized with ${this.providers.size} providers`,
      );
      console.log(`Primary provider: ${this.config.primaryProvider}`);
      console.log(`Fallback providers: ${this.fallbackProviders.join(", ")}`);
    } catch (error) {
      console.error("Failed to initialize email service:", error);
    }
  }

  /**
   * Send email with automatic fallback and retry logic
   */
  async sendEmail(emailData) {
    const startTime = Date.now();
    let lastError = null;
    let attemptCount = 0;

    // Prepare providers to try (primary + fallbacks)
    const providersToTry = [
      this.config.primaryProvider,
      ...this.fallbackProviders,
    ].filter((provider) => provider && this.providers.has(provider));

    if (providersToTry.length === 0) {
      throw new Error("No email providers available");
    }

    // Validate email data
    this.validateEmailData(emailData);

    // Dry run mode for development
    if (this.config.settings.dryRun) {
      return this.handleDryRun(emailData);
    }

    // Try each provider with retry logic
    for (const providerName of providersToTry) {
      const provider = this.providers.get(providerName);

      for (
        let attempt = 1;
        attempt <= this.config.settings.retryAttempts;
        attempt++
      ) {
        attemptCount++;

        try {
          console.log(
            `Sending email via ${providerName} (attempt ${attempt}/${this.config.settings.retryAttempts})`,
          );

          const result = await this.sendWithProvider(provider, emailData);

          // Success! Update stats and return
          this.updateStats(providerName, true, Date.now() - startTime);

          if (this.config.settings.logEmails) {
            this.logEmailSent(emailData, result, attemptCount);
          }

          // Track analytics
          if (this.config.settings.enableAnalytics) {
            await emailAnalytics.trackSent(emailData, result);
          }

          return {
            success: true,
            provider: providerName,
            messageId: result.messageId,
            attempts: attemptCount,
            duration: Date.now() - startTime,
            result,
          };
        } catch (error) {
          lastError = error;
          console.error(
            `${providerName} attempt ${attempt} failed:`,
            error.message,
          );

          // Update stats for failed attempt
          this.updateStats(providerName, false);

          // Wait before retry (exponential backoff)
          if (attempt < this.config.settings.retryAttempts) {
            const delay =
              this.config.settings.retryDelay * Math.pow(2, attempt - 1);
            await this.sleep(delay);
          }
        }
      }
    }

    // All providers and retries failed
    const totalDuration = Date.now() - startTime;
    this.logEmailFailed(emailData, lastError, attemptCount, totalDuration);

    throw new Error(
      `All email providers failed. Last error: ${lastError?.message || "Unknown error"}`,
    );
  }

  /**
   * Send email using specific provider
   */
  async sendWithProvider(provider, emailData) {
    // Add timeout to prevent hanging
    return Promise.race([
      provider.sendEmail(emailData),
      this.timeoutPromise(this.config.settings.timeout),
    ]);
  }

  /**
   * Create timeout promise
   */
  timeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Email send timeout after ${ms}ms`)),
        ms,
      );
    });
  }

  /**
   * Validate email data before sending
   */
  validateEmailData(emailData) {
    const required = ["to", "subject"];
    const missing = required.filter((field) => !emailData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required email fields: ${missing.join(", ")}`);
    }

    if (!emailData.html && !emailData.text) {
      throw new Error("Email must have either HTML or text content");
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = Array.isArray(emailData.to) ? emailData.to : [emailData.to];

    for (const email of emails) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }

  /**
   * Handle dry run mode (development)
   */
  handleDryRun(emailData) {
    console.log("📧 DRY RUN MODE - Email would be sent:");
    console.log({
      to: emailData.to,
      subject: emailData.subject,
      type: emailData.type,
      quoteId: emailData.quoteId,
      provider: this.config.primaryProvider,
    });

    return {
      success: true,
      provider: "dry-run",
      messageId: `dry-run-${Date.now()}`,
      attempts: 1,
      duration: 0,
      isDryRun: true,
    };
  }

  /**
   * Update provider statistics
   */
  updateStats(providerName, success, duration = 0) {
    if (!this.stats.providerStats[providerName]) {
      this.stats.providerStats[providerName] = {
        sent: 0,
        failed: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }

    const stats = this.stats.providerStats[providerName];

    if (success) {
      stats.sent++;
      this.stats.totalSent++;
      stats.totalDuration += duration;
      stats.avgDuration = stats.totalDuration / stats.sent;
    } else {
      stats.failed++;
      this.stats.totalFailed++;
    }
  }

  /**
   * Log successful email
   */
  logEmailSent(emailData, result, attempts) {
    console.log("✅ Email sent successfully:", {
      to: emailData.to,
      subject: emailData.subject,
      provider: result.provider,
      messageId: result.messageId,
      attempts: attempts,
      quoteId: emailData.quoteId,
    });
  }

  /**
   * Log failed email
   */
  logEmailFailed(emailData, error, attempts, duration) {
    console.error("❌ Email failed to send:", {
      to: emailData.to,
      subject: emailData.subject,
      error: error?.message,
      attempts: attempts,
      duration: duration,
      quoteId: emailData.quoteId,
    });
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test all configured providers
   */
  async testProviders() {
    const results = {};

    for (const [providerName, provider] of this.providers) {
      try {
        console.log(`Testing ${providerName}...`);
        const result = await provider.testConnection();
        results[providerName] = result;
      } catch (error) {
        results[providerName] = {
          success: false,
          error: error.message,
          provider: providerName,
        };
      }
    }

    return results;
  }

  /**
   * Get email service statistics
   */
  getStats() {
    return {
      ...this.stats,
      providers: Array.from(this.providers.keys()),
      primaryProvider: this.config.primaryProvider,
      fallbackProviders: this.fallbackProviders,
      config: {
        retryAttempts: this.config.settings.retryAttempts,
        timeout: this.config.settings.timeout,
        dryRun: this.config.settings.dryRun,
      },
    };
  }

  /**
   * Send customer confirmation email
   */
  async sendCustomerConfirmation(customerData, quoteId) {
    try {
      const templateData = {
        customerName: customerData.name,
        quoteId: quoteId,
        moveDate: customerData.moveDate,
        fromZip: customerData.fromZip,
        toZip: customerData.toZip,
        moveSize: customerData.moveSize,
        serviceType: customerData.serviceType,
        businessName: this.config.business.name,
        businessPhone: this.config.business.phone,
        businessWebsite: this.config.business.website,
        customerEmail: customerData.email,
        unsubscribeUrl: this.config.templates.unsubscribeUrl,
      };

      // Render template
      const renderedTemplate =
        await templateEngine.renderCustomerConfirmation(templateData);

      // Add tracking if enabled
      let html = renderedTemplate.html;
      if (this.config.settings.enableTracking) {
        const messageId = this.generateTrackingId(quoteId);
        html = emailAnalytics.addTrackingToContent(
          html,
          messageId,
          this.config.templates.baseUrl,
        );
      }

      const emailData = {
        to: customerData.email,
        subject: renderedTemplate.subject,
        html: html,
        text: renderedTemplate.text,
        type: "customer_confirmation",
        quoteId: quoteId,
        fromName: this.config.business.name,
        template: "customer-confirmation",
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error("Failed to send customer confirmation:", error);
      throw new Error(`Customer confirmation email failed: ${error.message}`);
    }
  }

  /**
   * Send business notification email
   */
  async sendBusinessNotification(customerData, quoteId) {
    try {
      const templateData = {
        quoteId: quoteId,
        customer: customerData,
        submissionTime: new Date().toISOString(),
        businessName: this.config.business.name,
      };

      // Render template
      const renderedTemplate =
        await templateEngine.renderBusinessNotification(templateData);

      const emailData = {
        to: this.config.business.email,
        subject: renderedTemplate.subject,
        html: renderedTemplate.html,
        text: renderedTemplate.text,
        type: "business_notification",
        quoteId: quoteId,
        fromName: this.config.business.name,
        template: "business-notification",
        priority: "high", // Business notifications are high priority
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error("Failed to send business notification:", error);
      throw new Error(`Business notification email failed: ${error.message}`);
    }
  }

  /**
   * Generate tracking ID for email analytics
   */
  generateTrackingId(quoteId) {
    return `track_${quoteId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Add email to queue for background processing
   */
  async enqueueEmail(emailData, priority = "normal") {
    // This would integrate with the email queue service
    // For now, just send directly
    return await this.sendEmail(emailData);
  }
}

// Export singleton instance
export const emailService = new EmailService();

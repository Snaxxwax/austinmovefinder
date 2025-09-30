/**
 * Mailgun Email Provider
 * Handles email sending through Mailgun API
 */

import Mailgun from "mailgun.js";

export class MailgunProvider {
  constructor(config) {
    this.config = config;
    this.name = "Mailgun";
    this.isConfigured = false;
    this.client = null;

    this.initialize();
  }

  /**
   * Initialize Mailgun client
   */
  initialize() {
    try {
      if (!this.config.apiKey || !this.config.domain) {
        console.warn("Mailgun API key or domain not provided");
        return;
      }

      const mailgun = new Mailgun(FormData);
      this.client = mailgun.client({
        username: "api",
        key: this.config.apiKey,
        public_key: this.config.publicKey || "",
      });

      this.isConfigured = true;
      console.log("Mailgun provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Mailgun:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email through Mailgun
   */
  async sendEmail(emailData) {
    if (!this.isConfigured) {
      throw new Error("Mailgun provider not configured");
    }

    try {
      const messageData = this.formatMessage(emailData);

      const result = await this.client.messages.create(
        this.config.domain,
        messageData,
      );

      return {
        success: true,
        provider: this.name,
        messageId: result.id,
        response: result,
      };
    } catch (error) {
      console.error("Mailgun send error:", error);

      const errorDetails = this.parseError(error);
      throw new Error(`Mailgun: ${errorDetails.message}`);
    }
  }

  /**
   * Format message for Mailgun API
   */
  formatMessage(emailData) {
    const messageData = {
      from: `${emailData.fromName || "Austin Move Finder"} <${this.config.fromEmail}>`,
      to: Array.isArray(emailData.to) ? emailData.to.join(",") : emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.stripHtml(emailData.html),
    };

    // Add CC/BCC if provided
    if (emailData.cc && emailData.cc.length > 0) {
      messageData.cc = Array.isArray(emailData.cc)
        ? emailData.cc.join(",")
        : emailData.cc;
    }
    if (emailData.bcc && emailData.bcc.length > 0) {
      messageData.bcc = Array.isArray(emailData.bcc)
        ? emailData.bcc.join(",")
        : emailData.bcc;
    }

    // Add reply-to if provided
    if (emailData.replyTo) {
      messageData["h:Reply-To"] = emailData.replyTo;
    }

    // Add tracking options
    messageData["o:tracking"] = this.config.tracking || true;
    messageData["o:tracking-clicks"] = this.config.trackingClicks || "yes";
    messageData["o:tracking-opens"] = this.config.trackingOpens || "yes";

    // Add custom variables for analytics
    if (emailData.quoteId) {
      messageData["v:quote_id"] = emailData.quoteId;
    }
    if (emailData.type) {
      messageData["v:email_type"] = emailData.type;
    }
    messageData["v:campaign"] = "quote_notifications";

    // Add tags for categorization
    messageData["o:tag"] = [
      emailData.type || "general",
      "austin-move-finder",
      "quote-system",
    ];

    // Test mode for development
    if (this.config.testMode) {
      messageData["o:testmode"] = "yes";
    }

    // Add delivery time if specified
    if (emailData.deliveryTime) {
      messageData["o:deliverytime"] = emailData.deliveryTime;
    }

    // Add attachments if provided
    if (emailData.attachments && emailData.attachments.length > 0) {
      messageData.attachment = emailData.attachments.map((attachment) => ({
        data: Buffer.from(attachment.content, "base64"),
        filename: attachment.filename,
      }));
    }

    return messageData;
  }

  /**
   * Parse Mailgun error response
   */
  parseError(error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      return {
        message: data.message || "Unknown Mailgun error",
        code: error.response.status,
        details: data,
      };
    }

    return {
      message: error.message || "Unknown Mailgun error",
      code: error.code || "UNKNOWN",
    };
  }

  /**
   * Strip HTML tags to create plain text version
   */
  stripHtml(html) {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Validate email configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.config.apiKey) {
      errors.push("Mailgun API key is required");
    }

    if (!this.config.domain) {
      errors.push("Mailgun domain is required");
    }

    if (!this.config.fromEmail) {
      errors.push("From email address is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test connection to Mailgun
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          error: "Mailgun not configured",
        };
      }

      // Test by validating the domain
      const domainInfo = await this.client.domains.get(this.config.domain);

      return {
        success: true,
        provider: this.name,
        domain: domainInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error).message,
        provider: this.name,
      };
    }
  }

  /**
   * Get delivery statistics
   */
  async getStats(options = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error("Mailgun not configured");
      }

      const startDate =
        options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = options.endDate || new Date();

      const stats = await this.client.stats.getDomain(this.config.domain, {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        resolution: options.resolution || "day",
      });

      return {
        provider: this.name,
        stats: stats.items || [],
        domain: this.config.domain,
        period: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      console.error("Failed to get Mailgun stats:", error);
      return null;
    }
  }

  /**
   * Get events (bounces, complaints, etc.)
   */
  async getEvents(options = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error("Mailgun not configured");
      }

      const events = await this.client.events.get(this.config.domain, options);

      return {
        provider: this.name,
        events: events.items || [],
        paging: events.paging,
      };
    } catch (error) {
      console.error("Failed to get Mailgun events:", error);
      return null;
    }
  }

  /**
   * Validate email address
   */
  async validateEmail(email) {
    try {
      if (!this.isConfigured) {
        throw new Error("Mailgun not configured");
      }

      const validation = await this.client.validate.get(email);

      return {
        provider: this.name,
        email: email,
        isValid: validation.is_valid,
        result: validation,
      };
    } catch (error) {
      console.error("Failed to validate email with Mailgun:", error);
      return {
        provider: this.name,
        email: email,
        isValid: false,
        error: error.message,
      };
    }
  }
}

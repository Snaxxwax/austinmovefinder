/**
 * SendGrid Email Provider
 * Handles email sending through SendGrid API
 */

import sgMail from "@sendgrid/mail";

export class SendGridProvider {
  constructor(config) {
    this.config = config;
    this.name = "SendGrid";
    this.isConfigured = false;

    this.initialize();
  }

  /**
   * Initialize SendGrid with API key
   */
  initialize() {
    try {
      if (!this.config.apiKey) {
        console.warn("SendGrid API key not provided");
        return;
      }

      sgMail.setApiKey(this.config.apiKey);
      this.isConfigured = true;
      console.log("SendGrid provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SendGrid:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email through SendGrid
   */
  async sendEmail(emailData) {
    if (!this.isConfigured) {
      throw new Error("SendGrid provider not configured");
    }

    try {
      const msg = this.formatMessage(emailData);

      // Add SendGrid-specific tracking and analytics
      if (this.config.trackOpens) {
        msg.trackingSettings = {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: {
            enable: true,
            text: "Unsubscribe",
            html: '<a href="%unsubscribe_url%">Unsubscribe</a>',
          },
        };
      }

      // Add custom args for analytics
      msg.customArgs = {
        quote_id: emailData.quoteId || "",
        email_type: emailData.type || "",
        campaign: "quote_notifications",
      };

      const result = await sgMail.send(msg);

      return {
        success: true,
        provider: this.name,
        messageId: result[0].headers["x-message-id"],
        response: result[0],
      };
    } catch (error) {
      console.error("SendGrid send error:", error);

      // Parse SendGrid error details
      const errorDetails = this.parseError(error);

      throw new Error(`SendGrid: ${errorDetails.message}`);
    }
  }

  /**
   * Format message for SendGrid API
   */
  formatMessage(emailData) {
    const msg = {
      to: emailData.to,
      from: {
        email: this.config.fromEmail,
        name: emailData.fromName || "Austin Move Finder",
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.stripHtml(emailData.html),
    };

    // Add CC/BCC if provided
    if (emailData.cc && emailData.cc.length > 0) {
      msg.cc = emailData.cc;
    }
    if (emailData.bcc && emailData.bcc.length > 0) {
      msg.bcc = emailData.bcc;
    }

    // Add attachments if provided
    if (emailData.attachments && emailData.attachments.length > 0) {
      msg.attachments = emailData.attachments.map((attachment) => ({
        content: attachment.content,
        filename: attachment.filename,
        type: attachment.type || "application/octet-stream",
        disposition: "attachment",
      }));
    }

    // Add reply-to if provided
    if (emailData.replyTo) {
      msg.replyTo = emailData.replyTo;
    }

    return msg;
  }

  /**
   * Parse SendGrid error response
   */
  parseError(error) {
    if (error.response && error.response.body) {
      const body = error.response.body;
      if (body.errors && body.errors.length > 0) {
        return {
          message: body.errors[0].message,
          code: error.code,
          statusCode: error.response.statusCode,
        };
      }
    }

    return {
      message: error.message || "Unknown SendGrid error",
      code: error.code,
      statusCode: error.response?.statusCode,
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
      errors.push("SendGrid API key is required");
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
   * Test connection to SendGrid
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          error: "SendGrid not configured",
        };
      }

      // Send a minimal test request to validate API key
      const testMsg = {
        to: this.config.fromEmail,
        from: this.config.fromEmail,
        subject: "SendGrid Connection Test",
        text: "This is a test message to validate SendGrid configuration.",
        mailSettings: {
          sandboxMode: {
            enable: true, // This prevents actual email sending
          },
        },
      };

      await sgMail.send(testMsg);

      return {
        success: true,
        provider: this.name,
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
   * Get delivery statistics (if available)
   */
  async getStats(options = {}) {
    try {
      // Note: SendGrid stats API requires additional setup and permissions
      // This is a placeholder for future implementation
      console.log("SendGrid stats API not implemented in this version");

      return {
        provider: this.name,
        stats: {
          delivered: 0,
          bounced: 0,
          opened: 0,
          clicked: 0,
        },
        note: "Stats API requires additional SendGrid configuration",
      };
    } catch (error) {
      console.error("Failed to get SendGrid stats:", error);
      return null;
    }
  }
}

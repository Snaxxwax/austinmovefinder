/**
 * Nodemailer Email Provider
 * Handles email sending through SMTP with Nodemailer
 */

import nodemailer from "nodemailer";
import striptags from "striptags";
export class NodemailerProvider {
  constructor(config) {
    this.config = config;
    this.name = "Nodemailer";
    this.isConfigured = false;
    this.transporter = null;

    this.initialize();
  }

  /**
   * Initialize Nodemailer transporter
   */
  initialize() {
    try {
      if (!this.config.host || !this.config.auth?.user) {
        console.warn("Nodemailer SMTP configuration incomplete");
        return;
      }

      // Create transporter with SMTP configuration
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port || 587,
        secure: this.config.secure || false, // true for 465, false for other ports
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
        // Additional options
        pool: true, // use pooled connection
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 10, // max 10 messages per rateDelta
      });

      this.isConfigured = true;
      console.log("Nodemailer provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Nodemailer:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email through Nodemailer
   */
  async sendEmail(emailData) {
    if (!this.isConfigured) {
      throw new Error("Nodemailer provider not configured");
    }

    try {
      const mailOptions = this.formatMessage(emailData);

      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        provider: this.name,
        messageId: result.messageId,
        response: result.response,
        envelope: result.envelope,
      };
    } catch (error) {
      console.error("Nodemailer send error:", error);

      const errorDetails = this.parseError(error);
      throw new Error(`Nodemailer: ${errorDetails.message}`);
    }
  }

  /**
   * Format message for Nodemailer
   */
  formatMessage(emailData) {
    const mailOptions = {
      from: {
        name: emailData.fromName || "Austin Move Finder",
        address: this.config.fromEmail,
      },
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.stripHtml(emailData.html),
    };

    // Add CC/BCC if provided
    if (emailData.cc && emailData.cc.length > 0) {
      mailOptions.cc = emailData.cc;
    }
    if (emailData.bcc && emailData.bcc.length > 0) {
      mailOptions.bcc = emailData.bcc;
    }

    // Add reply-to if provided
    if (emailData.replyTo) {
      mailOptions.replyTo = emailData.replyTo;
    }

    // Add attachments if provided
    if (emailData.attachments && emailData.attachments.length > 0) {
      mailOptions.attachments = emailData.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.type || "application/octet-stream",
        encoding: "base64",
      }));
    }

    // Add custom headers for tracking (if supported by SMTP server)
    mailOptions.headers = {
      "X-Quote-ID": emailData.quoteId || "",
      "X-Email-Type": emailData.type || "",
      "X-Campaign": "quote_notifications",
      "X-Sender": "austin-move-finder",
    };

    // Add message ID for tracking
    if (emailData.quoteId) {
      mailOptions.messageId = `${emailData.quoteId}@austinmovefinder.com`;
    }

    // Priority setting
    if (emailData.priority) {
      mailOptions.priority = emailData.priority; // high, normal, low
    }

    return mailOptions;
  }

  /**
   * Parse Nodemailer error response
   */
  parseError(error) {
    return {
      message: error.message || "Unknown SMTP error",
      code: error.code || "UNKNOWN",
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    };
  }

  /**
   * Strip HTML tags to create plain text version
   */
  stripHtml(html) {
    if (!html) return "";
    return striptags(html)
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

    if (!this.config.host) {
      errors.push("SMTP host is required");
    }

    if (!this.config.auth?.user) {
      errors.push("SMTP username is required");
    }

    if (!this.config.auth?.pass) {
      errors.push("SMTP password is required");
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
   * Test connection to SMTP server
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          error: "Nodemailer not configured",
        };
      }

      // Verify SMTP connection
      await this.transporter.verify();

      return {
        success: true,
        provider: this.name,
        host: this.config.host,
        port: this.config.port,
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
   * Get basic stats (limited for SMTP)
   */
  async getStats() {
    // SMTP doesn't provide delivery statistics by default
    // This would require integration with external tracking services
    return {
      provider: this.name,
      note: "SMTP does not provide delivery statistics. Consider integrating with external tracking services.",
      stats: {
        sent: 0, // Would need to be tracked separately
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
      },
    };
  }

  /**
   * Close the transporter pool
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
      console.log("Nodemailer transporter closed");
    }
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(testEmail) {
    const testData = {
      to: testEmail || this.config.fromEmail,
      subject: "Nodemailer Test Email",
      text: "This is a test email to verify Nodemailer configuration.",
      html: `
                <h2>Nodemailer Test Email</h2>
                <p>This is a test email to verify your Nodemailer SMTP configuration.</p>
                <p><strong>Provider:</strong> ${this.name}</p>
                <p><strong>Host:</strong> ${this.config.host}</p>
                <p><strong>Port:</strong> ${this.config.port}</p>
                <p><strong>Secure:</strong> ${this.config.secure ? "Yes" : "No"}</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            `,
      type: "test",
    };

    return await this.sendEmail(testData);
  }
}

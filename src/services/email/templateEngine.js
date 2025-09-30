/**
 * Email Template Engine
 * Handles template loading, rendering, and dynamic content generation
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class EmailTemplateEngine {
  constructor(options = {}) {
    this.templateDir =
      options.templateDir || join(__dirname, "../../templates/email");
    this.cache = new Map();
    this.cacheEnabled = options.cache !== false;
    this.defaultContext = options.defaultContext || {};
  }

  /**
   * Render email template with data
   */
  async render(templateName, data = {}) {
    try {
      const template = await this.loadTemplate(templateName);
      const context = { ...this.defaultContext, ...data };

      // Process the template with simple template engine
      const html = this.processTemplate(template, context);
      const text = this.generateTextVersion(html);

      return {
        html,
        text,
        subject: this.extractSubject(html, templateName, context),
      };
    } catch (error) {
      console.error(`Template rendering error for ${templateName}:`, error);
      throw new Error(
        `Failed to render template ${templateName}: ${error.message}`,
      );
    }
  }

  /**
   * Load template from file system
   */
  async loadTemplate(templateName) {
    const cacheKey = `template_${templateName}`;

    // Check cache first
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Construct template path
      const templatePath = join(this.templateDir, `${templateName}.html`);

      // Read template file
      const template = readFileSync(templatePath, "utf8");

      // Cache the template
      if (this.cacheEnabled) {
        this.cache.set(cacheKey, template);
      }

      return template;
    } catch (error) {
      if (error.code === "ENOENT") {
        // Template not found, generate basic template
        console.warn(
          `Template ${templateName} not found, generating basic template`,
        );
        return this.generateBasicTemplate(templateName);
      }
      throw error;
    }
  }

  /**
   * Process template with simple template engine
   * Supports {{variable}}, {{#if condition}}, {{#each array}}
   */
  processTemplate(template, data) {
    let processed = template;

    // Replace simple variables {{variable}}
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return this.getNestedValue(data, variable) || "";
    });

    // Handle nested object properties {{object.property}}
    processed = processed.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      return this.getNestedValue(data, path) || "";
    });

    // Handle conditional blocks {{#if condition}}...{{/if}}
    processed = processed.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        const value = this.getNestedValue(data, condition);
        return this.isTruthy(value) ? this.processTemplate(content, data) : "";
      },
    );

    // Handle each blocks {{#each array}}...{{/each}}
    processed = processed.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayName, content) => {
        const array = this.getNestedValue(data, arrayName);
        if (!Array.isArray(array)) return "";

        return array
          .map((item) => {
            const itemData = { ...data, this: item };
            return this.processTemplate(content, itemData);
          })
          .join("");
      },
    );

    // Handle {{this}} in loops
    processed = processed.replace(/\{\{this\}\}/g, (match) => {
      return data.this || "";
    });

    return processed;
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null;
    }, obj);
  }

  /**
   * Check if value is truthy for conditionals
   */
  isTruthy(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return value !== 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return Boolean(value);
  }

  /**
   * Generate text version from HTML
   */
  generateTextVersion(html) {
    return (
      html
        // Remove HTML tags
        .replace(/<[^>]*>/g, "")
        // Convert common HTML entities
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace
        .replace(/\n\s*\n/g, "\n\n")
        .replace(/[ \t]+/g, " ")
        .trim()
    );
  }

  /**
   * Extract subject from template title or generate from template name
   */
  extractSubject(html, templateName, data) {
    // Try to extract from HTML title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      return this.processTemplate(titleMatch[1], data);
    }

    // Generate subject from template name and data
    switch (templateName) {
      case "customer_confirmation":
      case "customer-confirmation":
        return `Moving Quote Confirmation - ${data.quoteId || "AMF-" + Date.now()}`;

      case "business_notification":
      case "business-notification":
        return `New Quote Request - ${data.quoteId || "Unknown"}`;

      case "follow_up":
      case "follow-up":
        return `Follow-up: Your Austin Moving Quote - ${data.quoteId || ""}`;

      case "quote_update":
      case "quote-update":
        return `Quote Update - ${data.quoteId || ""}`;

      default:
        return `Austin Move Finder Notification`;
    }
  }

  /**
   * Generate basic template when template file not found
   */
  generateBasicTemplate(templateName) {
    const title = templateName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{businessName}}</h1>
        <p>${title}</p>
    </div>
    <div class="content">
        <p>Hello {{customerName}},</p>
        <p>This is a notification from Austin Move Finder regarding your quote request {{quoteId}}.</p>
        <p>We'll be in touch soon with more details.</p>
        <p>Best regards,<br>{{businessName}} Team</p>
    </div>
    <div class="footer">
        <p>{{businessName}} | {{businessPhone}} | {{businessWebsite}}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Render customer confirmation email
   */
  async renderCustomerConfirmation(data) {
    const templateData = {
      customerName: data.customerName,
      quoteId: data.quoteId,
      moveDate: this.formatDate(data.moveDate),
      fromZip: data.fromZip,
      toZip: data.toZip,
      moveSize: data.moveSize,
      serviceType: data.serviceType,
      businessName: data.businessName,
      businessPhone: data.businessPhone,
      businessWebsite: data.businessWebsite,
      customerEmail: data.customerEmail,
      unsubscribeUrl: data.unsubscribeUrl || "#",
    };

    return await this.render("customer-confirmation", templateData);
  }

  /**
   * Render business notification email
   */
  async renderBusinessNotification(data) {
    const templateData = {
      quoteId: data.quoteId,
      submissionTime: this.formatDateTime(data.submissionTime),
      customer: {
        ...data.customer,
        moveDate: this.formatDate(data.customer.moveDate),
        flexibleDates: data.customer.flexibleDates ? "Yes" : "No",
        packingSupplies: data.customer.packingSupplies,
        storageNeeded: data.customer.storageNeeded,
        specialItems: data.customer.specialItems || [],
        budget: data.customer.budget || "Not specified",
        additionalInfo: data.customer.additionalInfo || "None provided",
      },
      businessName: data.businessName,
    };

    return await this.render("business-notification", templateData);
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString) {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
    console.log("Template cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      enabled: this.cacheEnabled,
      size: this.cache.size,
      templates: Array.from(this.cache.keys()),
    };
  }

  /**
   * Validate template syntax
   */
  validateTemplate(templateContent) {
    const errors = [];

    // Check for unclosed template tags
    const openTags = templateContent.match(/\{\{#(if|each)\s+\w+\}\}/g) || [];
    const closeTags = templateContent.match(/\{\{\/(if|each)\}\}/g) || [];

    if (openTags.length !== closeTags.length) {
      errors.push(
        "Mismatched template tags - check {{#if}} and {{#each}} blocks",
      );
    }

    // Check for invalid variable references
    const variables = templateContent.match(/\{\{(\w+(?:\.\w+)*)\}\}/g) || [];
    variables.forEach((variable) => {
      const cleanVar = variable.replace(/[{}]/g, "");
      if (cleanVar.includes("..")) {
        errors.push(`Invalid variable reference: ${variable}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const templateEngine = new EmailTemplateEngine();

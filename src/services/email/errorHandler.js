/**
 * Email Error Handler and Logging Service
 * Comprehensive error handling, logging, and monitoring for email operations
 */

export class EmailErrorHandler {
  constructor(options = {}) {
    this.logLevel = options.logLevel || "info";
    this.maxRetries = options.maxRetries || 3;
    this.retryableErrors = options.retryableErrors || [
      "TIMEOUT",
      "NETWORK_ERROR",
      "RATE_LIMIT",
      "TEMPORARY_FAILURE",
      "CONNECTION_ERROR",
    ];

    // Error tracking
    this.errorStats = {
      total: 0,
      byType: {},
      byProvider: {},
      recent: [],
    };

    this.alertThresholds = {
      errorRate: 10, // Alert if error rate > 10%
      consecutiveFailures: 5,
      bounceRate: 5, // Alert if bounce rate > 5%
    };
  }

  /**
   * Handle email sending error
   */
  async handleSendError(error, emailData, provider, attempt = 1) {
    const errorInfo = this.analyzeError(error, provider);

    // Log error
    this.logError(errorInfo, emailData, attempt);

    // Track error statistics
    this.trackError(errorInfo, provider);

    // Determine if error is retryable
    const shouldRetry = this.shouldRetryError(errorInfo, attempt);

    // Check if alert threshold reached
    await this.checkAlertThresholds(errorInfo, provider);

    return {
      shouldRetry,
      errorType: errorInfo.type,
      errorCode: errorInfo.code,
      errorMessage: errorInfo.message,
      isRetryable: errorInfo.isRetryable,
      nextRetryDelay: shouldRetry ? this.calculateRetryDelay(attempt) : null,
    };
  }

  /**
   * Analyze error to categorize and extract details
   */
  analyzeError(error, provider) {
    const errorInfo = {
      originalError: error,
      message: error.message || "Unknown error",
      provider: provider,
      timestamp: new Date().toISOString(),
      type: "UNKNOWN",
      code: error.code || "UNKNOWN",
      isRetryable: false,
      severity: "error",
    };

    // Provider-specific error analysis
    switch (provider) {
      case "SendGrid":
        return this.analyzeSendGridError(error, errorInfo);
      case "Mailgun":
        return this.analyzeMailgunError(error, errorInfo);
      case "Nodemailer":
        return this.analyzeNodemailerError(error, errorInfo);
      default:
        return this.analyzeGenericError(error, errorInfo);
    }
  }

  /**
   * Analyze SendGrid specific errors
   */
  analyzeSendGridError(error, errorInfo) {
    if (error.response?.body?.errors) {
      const sgError = error.response.body.errors[0];
      errorInfo.message = sgError.message;
      errorInfo.code = sgError.field || error.response.statusCode;

      switch (error.response.statusCode) {
        case 400:
          errorInfo.type = "VALIDATION_ERROR";
          errorInfo.severity = "error";
          break;
        case 401:
          errorInfo.type = "AUTHENTICATION_ERROR";
          errorInfo.severity = "critical";
          break;
        case 413:
          errorInfo.type = "MESSAGE_TOO_LARGE";
          errorInfo.severity = "error";
          break;
        case 429:
          errorInfo.type = "RATE_LIMIT";
          errorInfo.isRetryable = true;
          errorInfo.severity = "warning";
          break;
        case 500:
        case 502:
        case 503:
          errorInfo.type = "TEMPORARY_FAILURE";
          errorInfo.isRetryable = true;
          errorInfo.severity = "warning";
          break;
        default:
          errorInfo.type = "SENDGRID_ERROR";
      }
    }

    return errorInfo;
  }

  /**
   * Analyze Mailgun specific errors
   */
  analyzeMailgunError(error, errorInfo) {
    if (error.response?.data) {
      const mgError = error.response.data;
      errorInfo.message = mgError.message || errorInfo.message;

      switch (error.response.status) {
        case 400:
          errorInfo.type = "VALIDATION_ERROR";
          errorInfo.severity = "error";
          break;
        case 401:
          errorInfo.type = "AUTHENTICATION_ERROR";
          errorInfo.severity = "critical";
          break;
        case 402:
          errorInfo.type = "PAYMENT_REQUIRED";
          errorInfo.severity = "critical";
          break;
        case 429:
          errorInfo.type = "RATE_LIMIT";
          errorInfo.isRetryable = true;
          errorInfo.severity = "warning";
          break;
        case 500:
        case 502:
        case 503:
          errorInfo.type = "TEMPORARY_FAILURE";
          errorInfo.isRetryable = true;
          errorInfo.severity = "warning";
          break;
        default:
          errorInfo.type = "MAILGUN_ERROR";
      }
    }

    return errorInfo;
  }

  /**
   * Analyze Nodemailer/SMTP specific errors
   */
  analyzeNodemailerError(error, errorInfo) {
    errorInfo.code = error.code || error.responseCode;

    // SMTP error codes
    if (error.responseCode) {
      const code = parseInt(error.responseCode);
      if (code >= 400 && code < 500) {
        errorInfo.type = "SMTP_CLIENT_ERROR";
        errorInfo.severity = "error";
      } else if (code >= 500 && code < 600) {
        errorInfo.type = "SMTP_SERVER_ERROR";
        errorInfo.isRetryable = true;
        errorInfo.severity = "warning";
      }
    }

    // Connection errors
    if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      errorInfo.type = "CONNECTION_ERROR";
      errorInfo.isRetryable = true;
      errorInfo.severity = "warning";
    }

    return errorInfo;
  }

  /**
   * Analyze generic errors
   */
  analyzeGenericError(error, errorInfo) {
    if (error.message) {
      if (error.message.includes("timeout")) {
        errorInfo.type = "TIMEOUT";
        errorInfo.isRetryable = true;
        errorInfo.severity = "warning";
      } else if (error.message.includes("network")) {
        errorInfo.type = "NETWORK_ERROR";
        errorInfo.isRetryable = true;
        errorInfo.severity = "warning";
      }
    }

    return errorInfo;
  }

  /**
   * Log error with appropriate level
   */
  logError(errorInfo, emailData, attempt) {
    const logData = {
      timestamp: errorInfo.timestamp,
      provider: errorInfo.provider,
      errorType: errorInfo.type,
      errorCode: errorInfo.code,
      message: errorInfo.message,
      severity: errorInfo.severity,
      attempt: attempt,
      isRetryable: errorInfo.isRetryable,
      emailTo: emailData.to,
      emailSubject: emailData.subject,
      quoteId: emailData.quoteId,
    };

    switch (errorInfo.severity) {
      case "critical":
        console.error("🚨 CRITICAL EMAIL ERROR:", logData);
        break;
      case "error":
        console.error("❌ EMAIL ERROR:", logData);
        break;
      case "warning":
        console.warn("⚠️ EMAIL WARNING:", logData);
        break;
      default:
        console.log("ℹ️ EMAIL INFO:", logData);
    }

    // Store for analysis
    this.errorStats.recent.push({
      ...logData,
      stackTrace: this.shouldLogStackTrace(errorInfo)
        ? errorInfo.originalError.stack
        : null,
    });

    // Keep only last 100 errors
    if (this.errorStats.recent.length > 100) {
      this.errorStats.recent = this.errorStats.recent.slice(-100);
    }
  }

  /**
   * Track error statistics
   */
  trackError(errorInfo, provider) {
    this.errorStats.total++;

    // Track by type
    this.errorStats.byType[errorInfo.type] =
      (this.errorStats.byType[errorInfo.type] || 0) + 1;

    // Track by provider
    this.errorStats.byProvider[provider] =
      (this.errorStats.byProvider[provider] || 0) + 1;
  }

  /**
   * Determine if error should be retried
   */
  shouldRetryError(errorInfo, attempt) {
    if (attempt >= this.maxRetries) {
      return false;
    }

    return (
      errorInfo.isRetryable || this.retryableErrors.includes(errorInfo.type)
    );
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 1 minute
    const delay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  /**
   * Check if alert thresholds are reached
   */
  async checkAlertThresholds(errorInfo, provider) {
    // Check consecutive failures
    const recentErrors = this.errorStats.recent.slice(-10);
    const consecutiveFailures = this.getConsecutiveFailures(
      recentErrors,
      provider,
    );

    if (consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
      await this.sendAlert("consecutive_failures", {
        provider,
        count: consecutiveFailures,
        errorType: errorInfo.type,
      });
    }

    // Check error rate
    const errorRate = this.calculateErrorRate(provider);
    if (errorRate > this.alertThresholds.errorRate) {
      await this.sendAlert("high_error_rate", {
        provider,
        errorRate,
        threshold: this.alertThresholds.errorRate,
      });
    }
  }

  /**
   * Get consecutive failures count
   */
  getConsecutiveFailures(recentErrors, provider) {
    let count = 0;
    for (let i = recentErrors.length - 1; i >= 0; i--) {
      if (
        recentErrors[i].provider === provider &&
        recentErrors[i].severity !== "info"
      ) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Calculate error rate for provider
   */
  calculateErrorRate(provider) {
    const recentHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.errorStats.recent.filter(
      (error) =>
        error.provider === provider && new Date(error.timestamp) > recentHour,
    );

    // This would ideally compare against total sends, but for now use error count
    return recentErrors.length;
  }

  /**
   * Send alert notification
   */
  async sendAlert(alertType, details) {
    const alert = {
      type: alertType,
      timestamp: new Date().toISOString(),
      details,
      severity: "high",
    };

    console.error("🚨 EMAIL SYSTEM ALERT:", alert);

    // In production, this would:
    // 1. Send notification to admin email
    // 2. Post to Slack/Discord
    // 3. Create incident in monitoring system
    // 4. Update status page
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeRange = "24h") {
    const cutoff = this.getTimeRangeCutoff(timeRange);
    const recentErrors = this.errorStats.recent.filter(
      (error) => new Date(error.timestamp) > cutoff,
    );

    const stats = {
      total: recentErrors.length,
      byType: {},
      byProvider: {},
      bySeverity: {},
      timeRange,
    };

    recentErrors.forEach((error) => {
      stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1;
      stats.byProvider[error.provider] =
        (stats.byProvider[error.provider] || 0) + 1;
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get time range cutoff
   */
  getTimeRangeCutoff(timeRange) {
    const now = new Date();
    const ranges = {
      "1h": 1,
      "24h": 24,
      "7d": 24 * 7,
      "30d": 24 * 30,
    };

    const hours = ranges[timeRange] || 24;
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }

  /**
   * Should log stack trace for error
   */
  shouldLogStackTrace(errorInfo) {
    return errorInfo.severity === "critical" || errorInfo.type === "UNKNOWN";
  }

  /**
   * Handle delivery webhook events
   */
  async handleDeliveryEvent(event) {
    const eventInfo = {
      type: event.event || event.type,
      timestamp: event.timestamp || new Date().toISOString(),
      messageId: event.messageId || event["message-id"],
      email: event.email || event.recipient,
      provider: event.provider || "unknown",
    };

    switch (eventInfo.type) {
      case "delivered":
        console.log("✅ Email delivered:", eventInfo);
        break;
      case "bounced":
        await this.handleBounce(eventInfo, event);
        break;
      case "complained":
        await this.handleComplaint(eventInfo, event);
        break;
      case "unsubscribed":
        await this.handleUnsubscribe(eventInfo, event);
        break;
      default:
        console.log("📧 Email event:", eventInfo);
    }
  }

  /**
   * Handle bounce events
   */
  async handleBounce(eventInfo, rawEvent) {
    console.warn("⚠️ Email bounced:", eventInfo);

    // Track bounce statistics
    this.trackError(
      {
        type: "BOUNCED",
        severity: rawEvent.bounceType === "hard" ? "error" : "warning",
        timestamp: eventInfo.timestamp,
      },
      eventInfo.provider,
    );

    // For hard bounces, add to suppression list
    if (rawEvent.bounceType === "hard") {
      // Implementation would add to suppression list
      console.log(
        `Adding ${eventInfo.email} to suppression list (hard bounce)`,
      );
    }
  }

  /**
   * Handle complaint events
   */
  async handleComplaint(eventInfo, rawEvent) {
    console.warn("⚠️ Spam complaint received:", eventInfo);

    // Track complaint
    this.trackError(
      {
        type: "COMPLAINED",
        severity: "error",
        timestamp: eventInfo.timestamp,
      },
      eventInfo.provider,
    );

    // Add to suppression list
    console.log(
      `Adding ${eventInfo.email} to suppression list (spam complaint)`,
    );
  }

  /**
   * Handle unsubscribe events
   */
  async handleUnsubscribe(eventInfo, rawEvent) {
    console.log("📭 Unsubscribe event:", eventInfo);

    // Track unsubscribe
    this.trackError(
      {
        type: "UNSUBSCRIBED",
        severity: "info",
        timestamp: eventInfo.timestamp,
      },
      eventInfo.provider,
    );
  }

  /**
   * Clear error statistics
   */
  clearStats() {
    this.errorStats = {
      total: 0,
      byType: {},
      byProvider: {},
      recent: [],
    };
  }
}

// Export singleton instance
export const errorHandler = new EmailErrorHandler();

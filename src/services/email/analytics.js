/**
 * Email Analytics and Tracking Service
 * Handles email performance tracking, open rates, click tracking, and reporting
 */

export class EmailAnalytics {
  constructor(config = {}) {
    this.config = config;
    this.events = [];
    this.storage = config.storage || "memory"; // 'memory', 'database', 'file'
    this.enableTracking = config.enableTracking !== false;

    this.initializeStorage();
  }

  /**
   * Initialize storage for analytics data
   */
  initializeStorage() {
    if (this.storage === "memory") {
      this.analyticsData = {
        emails: new Map(),
        events: [],
        stats: {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalBounced: 0,
          totalComplained: 0,
          totalUnsubscribed: 0,
        },
      };
    }
  }

  /**
   * Track email send event
   */
  async trackSent(emailData, result) {
    if (!this.enableTracking) return;

    const event = {
      id: result.messageId || this.generateEventId(),
      type: "sent",
      timestamp: new Date().toISOString(),
      email: emailData.to,
      subject: emailData.subject,
      provider: result.provider,
      quoteId: emailData.quoteId,
      emailType: emailData.type,
      templateUsed: emailData.template,
      metadata: {
        attempts: result.attempts || 1,
        duration: result.duration || 0,
      },
    };

    await this.storeEvent(event);
    this.updateStats("sent");

    return event.id;
  }

  /**
   * Track email delivery
   */
  async trackDelivered(messageId, deliveryData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "delivered",
      timestamp: new Date().toISOString(),
      provider: deliveryData.provider,
      metadata: deliveryData,
    };

    await this.storeEvent(event);
    this.updateStats("delivered");

    return event.id;
  }

  /**
   * Track email open
   */
  async trackOpened(messageId, openData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "opened",
      timestamp: new Date().toISOString(),
      userAgent: openData.userAgent,
      ipAddress: openData.ipAddress,
      location: openData.location,
      device: this.parseDevice(openData.userAgent),
      metadata: openData,
    };

    await this.storeEvent(event);
    this.updateStats("opened");

    return event.id;
  }

  /**
   * Track email click
   */
  async trackClicked(messageId, clickData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "clicked",
      timestamp: new Date().toISOString(),
      url: clickData.url,
      userAgent: clickData.userAgent,
      ipAddress: clickData.ipAddress,
      location: clickData.location,
      device: this.parseDevice(clickData.userAgent),
      metadata: clickData,
    };

    await this.storeEvent(event);
    this.updateStats("clicked");

    return event.id;
  }

  /**
   * Track email bounce
   */
  async trackBounced(messageId, bounceData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "bounced",
      timestamp: new Date().toISOString(),
      bounceType: bounceData.bounceType || "hard", // 'hard', 'soft', 'complaint'
      reason: bounceData.reason,
      code: bounceData.code,
      provider: bounceData.provider,
      metadata: bounceData,
    };

    await this.storeEvent(event);
    this.updateStats("bounced");

    return event.id;
  }

  /**
   * Track spam complaint
   */
  async trackComplaint(messageId, complaintData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "complained",
      timestamp: new Date().toISOString(),
      provider: complaintData.provider,
      feedbackType: complaintData.feedbackType,
      metadata: complaintData,
    };

    await this.storeEvent(event);
    this.updateStats("complained");

    return event.id;
  }

  /**
   * Track unsubscribe
   */
  async trackUnsubscribed(messageId, unsubscribeData = {}) {
    if (!this.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      messageId: messageId,
      type: "unsubscribed",
      timestamp: new Date().toISOString(),
      email: unsubscribeData.email,
      method: unsubscribeData.method || "link", // 'link', 'reply', 'complaint'
      metadata: unsubscribeData,
    };

    await this.storeEvent(event);
    this.updateStats("unsubscribed");

    return event.id;
  }

  /**
   * Store event based on storage type
   */
  async storeEvent(event) {
    switch (this.storage) {
      case "memory":
        this.analyticsData.events.push(event);
        // Keep only last 10000 events in memory
        if (this.analyticsData.events.length > 10000) {
          this.analyticsData.events = this.analyticsData.events.slice(-10000);
        }
        break;

      case "database":
        // Implement database storage
        await this.storeToDatabase(event);
        break;

      case "file":
        // Implement file storage
        await this.storeToFile(event);
        break;

      default:
        console.warn("Unknown storage type:", this.storage);
    }
  }

  /**
   * Update statistics
   */
  updateStats(eventType) {
    if (this.storage === "memory") {
      const statKey = `total${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
      if (this.analyticsData.stats[statKey] !== undefined) {
        this.analyticsData.stats[statKey]++;
      }
    }
  }

  /**
   * Generate tracking pixel URL for email opens
   */
  generateTrackingPixel(messageId, baseUrl = "") {
    const trackingUrl = `${baseUrl}/api/track/open/${messageId}`;
    return `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="">`;
  }

  /**
   * Generate click tracking URL
   */
  generateClickTrackingUrl(originalUrl, messageId, baseUrl = "") {
    const trackingUrl = `${baseUrl}/api/track/click/${messageId}`;
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${trackingUrl}?url=${encodedUrl}`;
  }

  /**
   * Process HTML content to add tracking
   */
  addTrackingToContent(html, messageId, baseUrl = "") {
    if (!this.enableTracking || !messageId) return html;

    let processedHtml = html;

    // Add tracking pixel before closing body tag
    const trackingPixel = this.generateTrackingPixel(messageId, baseUrl);
    processedHtml = processedHtml.replace(
      /<\/body>/i,
      `${trackingPixel}</body>`,
    );

    // Add click tracking to links
    processedHtml = processedHtml.replace(
      /<a\s+([^>]*href=["']?)([^"'>\s]+)([^>]*)>/gi,
      (match, prefix, url, suffix) => {
        // Don't track unsubscribe links or internal anchors
        if (
          url.includes("unsubscribe") ||
          url.startsWith("#") ||
          url.startsWith("mailto:") ||
          url.startsWith("tel:")
        ) {
          return match;
        }

        const trackedUrl = this.generateClickTrackingUrl(
          url,
          messageId,
          baseUrl,
        );
        return `<a ${prefix}${trackedUrl}${suffix}>`;
      },
    );

    return processedHtml;
  }

  /**
   * Get email analytics for specific message
   */
  async getEmailAnalytics(messageId) {
    if (this.storage === "memory") {
      const events = this.analyticsData.events.filter(
        (event) => event.messageId === messageId || event.id === messageId,
      );

      return this.processEmailEvents(events);
    }

    // For other storage types, implement retrieval
    return null;
  }

  /**
   * Process events for a specific email
   */
  processEmailEvents(events) {
    const analytics = {
      messageId: events[0]?.messageId || events[0]?.id,
      sent: false,
      delivered: false,
      opened: false,
      clicked: false,
      bounced: false,
      complained: false,
      unsubscribed: false,
      events: events.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      ),
      timeline: [],
    };

    events.forEach((event) => {
      analytics[event.type] = true;
      analytics.timeline.push({
        type: event.type,
        timestamp: event.timestamp,
        details: event.metadata || {},
      });

      // Store additional details for certain event types
      if (event.type === "opened" && event.device) {
        analytics.deviceInfo = event.device;
        analytics.location = event.location;
      }

      if (event.type === "clicked") {
        analytics.clickedUrls = analytics.clickedUrls || [];
        analytics.clickedUrls.push(event.url);
      }

      if (event.type === "bounced") {
        analytics.bounceReason = event.reason;
        analytics.bounceType = event.bounceType;
      }
    });

    return analytics;
  }

  /**
   * Get overall email statistics
   */
  getOverallStats(timeRange = "30d") {
    if (this.storage === "memory") {
      const cutoffDate = this.getTimeRangeCutoff(timeRange);
      const recentEvents = this.analyticsData.events.filter(
        (event) => new Date(event.timestamp) >= cutoffDate,
      );

      const stats = {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalComplained: 0,
        totalUnsubscribed: 0,
      };

      recentEvents.forEach((event) => {
        const statKey = `total${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`;
        if (stats[statKey] !== undefined) {
          stats[statKey]++;
        }
      });

      // Calculate rates
      const rates = {};
      if (stats.totalSent > 0) {
        rates.deliveryRate = (
          (stats.totalDelivered / stats.totalSent) *
          100
        ).toFixed(2);
        rates.openRate = ((stats.totalOpened / stats.totalSent) * 100).toFixed(
          2,
        );
        rates.clickRate = (
          (stats.totalClicked / stats.totalSent) *
          100
        ).toFixed(2);
        rates.bounceRate = (
          (stats.totalBounced / stats.totalSent) *
          100
        ).toFixed(2);
        rates.complaintRate = (
          (stats.totalComplained / stats.totalSent) *
          100
        ).toFixed(2);
        rates.unsubscribeRate = (
          (stats.totalUnsubscribed / stats.totalSent) *
          100
        ).toFixed(2);
      }

      return { ...stats, rates, timeRange };
    }

    return null;
  }

  /**
   * Get statistics by email type
   */
  getStatsByEmailType(timeRange = "30d") {
    if (this.storage !== "memory") return null;

    const cutoffDate = this.getTimeRangeCutoff(timeRange);
    const recentEvents = this.analyticsData.events.filter(
      (event) => new Date(event.timestamp) >= cutoffDate && event.emailType,
    );

    const statsByType = {};

    recentEvents.forEach((event) => {
      const emailType = event.emailType;
      if (!statsByType[emailType]) {
        statsByType[emailType] = {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          complained: 0,
          unsubscribed: 0,
        };
      }

      statsByType[emailType][event.type]++;
    });

    // Calculate rates for each type
    Object.keys(statsByType).forEach((emailType) => {
      const stats = statsByType[emailType];
      if (stats.sent > 0) {
        stats.openRate = ((stats.opened / stats.sent) * 100).toFixed(2);
        stats.clickRate = ((stats.clicked / stats.sent) * 100).toFixed(2);
        stats.bounceRate = ((stats.bounced / stats.sent) * 100).toFixed(2);
      }
    });

    return statsByType;
  }

  /**
   * Parse device information from user agent
   */
  parseDevice(userAgent) {
    if (!userAgent) return null;

    const device = {
      type: "desktop",
      os: "unknown",
      browser: "unknown",
    };

    // Simple device detection
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      device.type = "mobile";
    }

    if (/windows/i.test(userAgent)) device.os = "Windows";
    else if (/mac/i.test(userAgent)) device.os = "macOS";
    else if (/linux/i.test(userAgent)) device.os = "Linux";
    else if (/android/i.test(userAgent)) device.os = "Android";
    else if (/ios|iphone|ipad/i.test(userAgent)) device.os = "iOS";

    if (/chrome/i.test(userAgent)) device.browser = "Chrome";
    else if (/firefox/i.test(userAgent)) device.browser = "Firefox";
    else if (/safari/i.test(userAgent)) device.browser = "Safari";
    else if (/edge/i.test(userAgent)) device.browser = "Edge";

    return device;
  }

  /**
   * Get time range cutoff date
   */
  getTimeRangeCutoff(timeRange) {
    const now = new Date();
    const ranges = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };

    const days = ranges[timeRange] || 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export analytics data
   */
  exportData(format = "json") {
    if (this.storage === "memory") {
      const data = {
        stats: this.analyticsData.stats,
        events: this.analyticsData.events,
        exportDate: new Date().toISOString(),
      };

      switch (format) {
        case "json":
          return JSON.stringify(data, null, 2);
        case "csv":
          return this.convertToCSV(this.analyticsData.events);
        default:
          return data;
      }
    }

    return null;
  }

  /**
   * Convert events to CSV format
   */
  convertToCSV(events) {
    if (events.length === 0) return "";

    const headers = [
      "timestamp",
      "type",
      "messageId",
      "email",
      "provider",
      "quoteId",
    ];
    const csvRows = [headers.join(",")];

    events.forEach((event) => {
      const row = headers.map((header) => {
        const value = event[header] || "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Clear analytics data
   */
  clearData() {
    if (this.storage === "memory") {
      this.initializeStorage();
    }
  }
}

// Export singleton instance
export const emailAnalytics = new EmailAnalytics();

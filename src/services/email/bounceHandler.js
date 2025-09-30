/**
 * Bounce and Unsubscribe Management Service
 * Handles email bounces, complaints, unsubscribes, and suppression lists
 */

export class BounceHandler {
  constructor(options = {}) {
    this.storage = options.storage || "memory";
    this.suppressionLists = {
      bounces: new Set(),
      complaints: new Set(),
      unsubscribes: new Set(),
      blocks: new Set(),
    };

    this.bounceThresholds = {
      softBounceLimit: 5, // Max soft bounces before suppression
      hardBounceAction: "immediate", // immediate suppression for hard bounces
      cleanupInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    this.stats = {
      totalBounces: 0,
      totalComplaints: 0,
      totalUnsubscribes: 0,
      softBounces: new Map(),
      recentActivity: [],
    };

    this.initializeStorage();
  }

  /**
   * Initialize storage system
   */
  initializeStorage() {
    if (this.storage === "memory") {
      // Memory-based storage (for development)
      console.log("Bounce handler initialized with memory storage");
    } else if (this.storage === "database") {
      // Database storage would be initialized here
      console.log("Bounce handler initialized with database storage");
    }
  }

  /**
   * Process bounce event
   */
  async processBounce(bounceData) {
    const bounce = {
      id: this.generateEventId(),
      email: bounceData.email,
      type: bounceData.bounceType || "unknown", // 'hard', 'soft', 'undetermined'
      reason: bounceData.reason || "",
      code: bounceData.code || "",
      timestamp: new Date().toISOString(),
      provider: bounceData.provider || "unknown",
      messageId: bounceData.messageId || "",
      campaignId: bounceData.campaignId || "",
      metadata: bounceData.metadata || {},
    };

    // Log bounce
    console.log(
      `📧 Processing ${bounce.type} bounce for ${bounce.email}:`,
      bounce.reason,
    );

    // Update statistics
    this.stats.totalBounces++;
    this.logActivity("bounce", bounce);

    // Handle based on bounce type
    switch (bounce.type.toLowerCase()) {
      case "hard":
        await this.handleHardBounce(bounce);
        break;
      case "soft":
        await this.handleSoftBounce(bounce);
        break;
      case "undetermined":
        await this.handleUndeterminedBounce(bounce);
        break;
      default:
        console.warn(`Unknown bounce type: ${bounce.type}`);
        await this.handleUndeterminedBounce(bounce);
    }

    // Store bounce record
    await this.storeBounce(bounce);

    return bounce;
  }

  /**
   * Handle hard bounce (permanent failure)
   */
  async handleHardBounce(bounce) {
    console.warn(
      `❌ Hard bounce detected for ${bounce.email} - adding to suppression list`,
    );

    // Add to bounce suppression list
    this.suppressionLists.bounces.add(bounce.email.toLowerCase());

    // Remove from soft bounce tracking
    this.stats.softBounces.delete(bounce.email.toLowerCase());

    // Trigger immediate suppression
    await this.addToSuppressionList(bounce.email, "hard_bounce", bounce);
  }

  /**
   * Handle soft bounce (temporary failure)
   */
  async handleSoftBounce(bounce) {
    const email = bounce.email.toLowerCase();
    const currentCount = this.stats.softBounces.get(email) || 0;
    const newCount = currentCount + 1;

    this.stats.softBounces.set(email, newCount);

    console.log(`⚠️ Soft bounce #${newCount} for ${bounce.email}`);

    // Check if soft bounce limit reached
    if (newCount >= this.bounceThresholds.softBounceLimit) {
      console.warn(
        `❌ Soft bounce limit reached for ${bounce.email} - adding to suppression list`,
      );

      // Convert to suppression
      this.suppressionLists.bounces.add(email);
      this.stats.softBounces.delete(email);

      await this.addToSuppressionList(
        bounce.email,
        "soft_bounce_limit",
        bounce,
      );
    }
  }

  /**
   * Handle undetermined bounce
   */
  async handleUndeterminedBounce(bounce) {
    // Treat as soft bounce initially
    console.log(
      `❓ Undetermined bounce for ${bounce.email} - treating as soft bounce`,
    );
    bounce.type = "soft";
    await this.handleSoftBounce(bounce);
  }

  /**
   * Process spam complaint
   */
  async processComplaint(complaintData) {
    const complaint = {
      id: this.generateEventId(),
      email: complaintData.email,
      timestamp: new Date().toISOString(),
      provider: complaintData.provider || "unknown",
      messageId: complaintData.messageId || "",
      feedbackType: complaintData.feedbackType || "abuse",
      campaignId: complaintData.campaignId || "",
      metadata: complaintData.metadata || {},
    };

    console.warn(`🚨 Spam complaint received for ${complaint.email}`);

    // Update statistics
    this.stats.totalComplaints++;
    this.logActivity("complaint", complaint);

    // Add to complaint suppression list
    this.suppressionLists.complaints.add(complaint.email.toLowerCase());

    // Add to general suppression
    await this.addToSuppressionList(
      complaint.email,
      "spam_complaint",
      complaint,
    );

    // Store complaint record
    await this.storeComplaint(complaint);

    return complaint;
  }

  /**
   * Process unsubscribe request
   */
  async processUnsubscribe(unsubscribeData) {
    const unsubscribe = {
      id: this.generateEventId(),
      email: unsubscribeData.email,
      timestamp: new Date().toISOString(),
      method: unsubscribeData.method || "link", // 'link', 'reply', 'manual'
      campaignId: unsubscribeData.campaignId || "",
      messageId: unsubscribeData.messageId || "",
      ipAddress: unsubscribeData.ipAddress || "",
      userAgent: unsubscribeData.userAgent || "",
      metadata: unsubscribeData.metadata || {},
    };

    console.log(
      `📭 Unsubscribe request for ${unsubscribe.email} via ${unsubscribe.method}`,
    );

    // Update statistics
    this.stats.totalUnsubscribes++;
    this.logActivity("unsubscribe", unsubscribe);

    // Add to unsubscribe suppression list
    this.suppressionLists.unsubscribes.add(unsubscribe.email.toLowerCase());

    // Add to general suppression
    await this.addToSuppressionList(
      unsubscribe.email,
      "unsubscribe",
      unsubscribe,
    );

    // Store unsubscribe record
    await this.storeUnsubscribe(unsubscribe);

    return unsubscribe;
  }

  /**
   * Check if email is suppressed
   */
  isSuppressed(email) {
    const emailLower = email.toLowerCase();

    const suppressed = {
      isBlocked: false,
      reason: null,
      lists: [],
    };

    if (this.suppressionLists.bounces.has(emailLower)) {
      suppressed.isBlocked = true;
      suppressed.reason = "bounced";
      suppressed.lists.push("bounces");
    }

    if (this.suppressionLists.complaints.has(emailLower)) {
      suppressed.isBlocked = true;
      suppressed.reason = "complaint";
      suppressed.lists.push("complaints");
    }

    if (this.suppressionLists.unsubscribes.has(emailLower)) {
      suppressed.isBlocked = true;
      suppressed.reason = "unsubscribed";
      suppressed.lists.push("unsubscribes");
    }

    if (this.suppressionLists.blocks.has(emailLower)) {
      suppressed.isBlocked = true;
      suppressed.reason = "blocked";
      suppressed.lists.push("blocks");
    }

    return suppressed;
  }

  /**
   * Add email to suppression list
   */
  async addToSuppressionList(email, reason, eventData = {}) {
    const suppressionRecord = {
      email: email.toLowerCase(),
      reason,
      timestamp: new Date().toISOString(),
      eventData,
      source: "automatic",
    };

    // Store suppression record
    await this.storeSuppressionRecord(suppressionRecord);

    console.log(`🚫 Added ${email} to suppression list (reason: ${reason})`);

    return suppressionRecord;
  }

  /**
   * Remove email from suppression lists
   */
  async removeFromSuppression(email, reason = "manual_removal") {
    const emailLower = email.toLowerCase();
    let removed = false;

    // Remove from all suppression lists
    if (this.suppressionLists.bounces.has(emailLower)) {
      this.suppressionLists.bounces.delete(emailLower);
      removed = true;
    }

    if (this.suppressionLists.complaints.has(emailLower)) {
      this.suppressionLists.complaints.delete(emailLower);
      removed = true;
    }

    if (this.suppressionLists.unsubscribes.has(emailLower)) {
      this.suppressionLists.unsubscribes.delete(emailLower);
      removed = true;
    }

    if (this.suppressionLists.blocks.has(emailLower)) {
      this.suppressionLists.blocks.delete(emailLower);
      removed = true;
    }

    if (removed) {
      console.log(
        `✅ Removed ${email} from suppression lists (reason: ${reason})`,
      );

      // Log removal activity
      this.logActivity("suppression_removed", {
        email,
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    return removed;
  }

  /**
   * Get suppression list statistics
   */
  getSuppressionStats() {
    return {
      bounces: this.suppressionLists.bounces.size,
      complaints: this.suppressionLists.complaints.size,
      unsubscribes: this.suppressionLists.unsubscribes.size,
      blocks: this.suppressionLists.blocks.size,
      total:
        this.suppressionLists.bounces.size +
        this.suppressionLists.complaints.size +
        this.suppressionLists.unsubscribes.size +
        this.suppressionLists.blocks.size,
      softBounceTracking: this.stats.softBounces.size,
      recentActivity: this.stats.recentActivity.length,
    };
  }

  /**
   * Export suppression list
   */
  exportSuppressionList(type = "all") {
    const exports = {};

    if (type === "all" || type === "bounces") {
      exports.bounces = Array.from(this.suppressionLists.bounces);
    }

    if (type === "all" || type === "complaints") {
      exports.complaints = Array.from(this.suppressionLists.complaints);
    }

    if (type === "all" || type === "unsubscribes") {
      exports.unsubscribes = Array.from(this.suppressionLists.unsubscribes);
    }

    if (type === "all" || type === "blocks") {
      exports.blocks = Array.from(this.suppressionLists.blocks);
    }

    return exports;
  }

  /**
   * Import suppression list
   */
  async importSuppressionList(data, type) {
    let imported = 0;

    if (data.bounces && (type === "all" || type === "bounces")) {
      data.bounces.forEach((email) => {
        this.suppressionLists.bounces.add(email.toLowerCase());
        imported++;
      });
    }

    if (data.complaints && (type === "all" || type === "complaints")) {
      data.complaints.forEach((email) => {
        this.suppressionLists.complaints.add(email.toLowerCase());
        imported++;
      });
    }

    if (data.unsubscribes && (type === "all" || type === "unsubscribes")) {
      data.unsubscribes.forEach((email) => {
        this.suppressionLists.unsubscribes.add(email.toLowerCase());
        imported++;
      });
    }

    if (data.blocks && (type === "all" || type === "blocks")) {
      data.blocks.forEach((email) => {
        this.suppressionLists.blocks.add(email.toLowerCase());
        imported++;
      });
    }

    console.log(`📥 Imported ${imported} suppressed emails`);
    return imported;
  }

  /**
   * Clean up old bounce records
   */
  async cleanupOldRecords() {
    const cutoffDate = new Date(
      Date.now() - this.bounceThresholds.cleanupInterval,
    );

    // Clean up soft bounce tracking older than threshold
    const softBounceEmails = Array.from(this.stats.softBounces.keys());
    softBounceEmails.forEach((email) => {
      // In a real implementation, you'd check the timestamp of the last bounce
      // For now, just limit the size
    });

    // Clean up recent activity
    this.stats.recentActivity = this.stats.recentActivity.filter(
      (activity) => new Date(activity.timestamp) > cutoffDate,
    );

    console.log("🧹 Cleaned up old bounce records");
  }

  /**
   * Generate unsubscribe link
   */
  generateUnsubscribeLink(email, campaignId, baseUrl = "") {
    const token = this.generateUnsubscribeToken(email, campaignId);
    return `${baseUrl}/unsubscribe?token=${token}&email=${encodeURIComponent(email)}`;
  }

  /**
   * Generate unsubscribe token
   */
  generateUnsubscribeToken(email, campaignId) {
    // Simple token generation - in production, use proper encryption
    const data = `${email}:${campaignId}:${Date.now()}`;
    return Buffer.from(data).toString("base64");
  }

  /**
   * Verify unsubscribe token
   */
  verifyUnsubscribeToken(token, email) {
    try {
      const decoded = Buffer.from(token, "base64").toString();
      const [tokenEmail] = decoded.split(":");
      return tokenEmail === email;
    } catch (error) {
      return false;
    }
  }

  /**
   * Log activity
   */
  logActivity(type, data) {
    const activity = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    this.stats.recentActivity.push(activity);

    // Keep only last 1000 activities
    if (this.stats.recentActivity.length > 1000) {
      this.stats.recentActivity = this.stats.recentActivity.slice(-1000);
    }
  }

  /**
   * Store bounce record (implement based on storage type)
   */
  async storeBounce(bounce) {
    // Implementation depends on storage type
    console.log("Storing bounce record:", bounce.id);
  }

  /**
   * Store complaint record
   */
  async storeComplaint(complaint) {
    console.log("Storing complaint record:", complaint.id);
  }

  /**
   * Store unsubscribe record
   */
  async storeUnsubscribe(unsubscribe) {
    console.log("Storing unsubscribe record:", unsubscribe.id);
  }

  /**
   * Store suppression record
   */
  async storeSuppressionRecord(record) {
    console.log("Storing suppression record:", record.email);
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Get bounce/complaint statistics
   */
  getActivityStats(timeRange = "30d") {
    const cutoff = this.getTimeRangeCutoff(timeRange);
    const recentActivity = this.stats.recentActivity.filter(
      (activity) => new Date(activity.timestamp) > cutoff,
    );

    const stats = {
      totalActivity: recentActivity.length,
      bounces: recentActivity.filter((a) => a.type === "bounce").length,
      complaints: recentActivity.filter((a) => a.type === "complaint").length,
      unsubscribes: recentActivity.filter((a) => a.type === "unsubscribe")
        .length,
      timeRange,
    };

    return stats;
  }

  /**
   * Get time range cutoff
   */
  getTimeRangeCutoff(timeRange) {
    const now = new Date();
    const ranges = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days = ranges[timeRange] || 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
}

// Export singleton instance
export const bounceHandler = new BounceHandler();

/**
 * Email Queue Service
 * Handles email queuing, retry logic, and background processing
 */

export class EmailQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 5000; // 5 seconds
    this.batchSize = options.batchSize || 10;
    this.processingInterval = options.processingInterval || 30000; // 30 seconds
    this.maxQueueSize = options.maxQueueSize || 1000;

    // Stats
    this.stats = {
      totalQueued: 0,
      totalProcessed: 0,
      totalFailed: 0,
      currentQueueSize: 0,
    };

    // Start processing interval
    this.startProcessing();
  }

  /**
   * Add email to queue
   */
  async enqueue(emailData, priority = "normal") {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error("Email queue is full");
    }

    const queueItem = {
      id: this.generateQueueId(),
      emailData,
      priority,
      attempts: 0,
      createdAt: new Date(),
      status: "queued",
      lastAttempt: null,
      lastError: null,
      nextRetry: null,
    };

    // Insert based on priority
    this.insertByPriority(queueItem);

    this.stats.totalQueued++;
    this.stats.currentQueueSize = this.queue.length;

    console.log(`Email queued: ${queueItem.id} (priority: ${priority})`);

    return queueItem.id;
  }

  /**
   * Insert item into queue based on priority
   */
  insertByPriority(item) {
    const priorities = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    const itemPriority = priorities[item.priority] || 2;

    // Find insertion point
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorities[this.queue[i].priority] || 2;
      if (itemPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, item);
  }

  /**
   * Process queue items
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Processing email queue (${this.queue.length} items)`);

    try {
      const batch = this.getProcessableBatch();

      if (batch.length > 0) {
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error("Queue processing error:", error);
    } finally {
      this.processing = false;
      this.stats.currentQueueSize = this.queue.length;
    }
  }

  /**
   * Get batch of items ready for processing
   */
  getProcessableBatch() {
    const now = new Date();
    const batch = [];

    for (
      let i = 0;
      i < this.queue.length && batch.length < this.batchSize;
      i++
    ) {
      const item = this.queue[i];

      // Check if item is ready for processing
      if (
        item.status === "queued" ||
        (item.status === "retry" && (!item.nextRetry || now >= item.nextRetry))
      ) {
        batch.push(item);
      }
    }

    return batch;
  }

  /**
   * Process a batch of emails
   */
  async processBatch(batch) {
    const promises = batch.map((item) => this.processItem(item));
    await Promise.allSettled(promises);
  }

  /**
   * Process individual queue item
   */
  async processItem(item) {
    try {
      item.status = "processing";
      item.attempts++;
      item.lastAttempt = new Date();

      console.log(`Processing email ${item.id} (attempt ${item.attempts})`);

      // Here you would inject your email service
      // For now, simulate email sending
      const result = await this.sendEmail(item.emailData);

      // Success
      item.status = "completed";
      this.removeFromQueue(item.id);
      this.stats.totalProcessed++;

      console.log(`Email ${item.id} sent successfully`);

      return result;
    } catch (error) {
      console.error(`Email ${item.id} failed:`, error.message);

      item.lastError = error.message;

      if (item.attempts >= this.maxRetries) {
        // Max retries reached
        item.status = "failed";
        this.removeFromQueue(item.id);
        this.stats.totalFailed++;

        console.error(
          `Email ${item.id} permanently failed after ${item.attempts} attempts`,
        );
      } else {
        // Schedule retry
        item.status = "retry";
        item.nextRetry = new Date(
          Date.now() + this.getRetryDelay(item.attempts),
        );

        console.log(
          `Email ${item.id} will retry in ${this.getRetryDelay(item.attempts)}ms`,
        );
      }

      throw error;
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay(attempt) {
    return this.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Remove item from queue
   */
  removeFromQueue(itemId) {
    const index = this.queue.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Simulate email sending (to be replaced with actual email service)
   */
  async sendEmail(emailData) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      // 10% failure rate
      throw new Error("Simulated email sending failure");
    }

    return {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      provider: "simulation",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Start background processing
   */
  startProcessing() {
    // Process queue immediately
    setTimeout(() => this.processQueue(), 1000);

    // Set up interval processing
    setInterval(() => {
      this.processQueue();
    }, this.processingInterval);

    console.log(
      `Email queue processor started (interval: ${this.processingInterval}ms)`,
    );
  }

  /**
   * Stop processing
   */
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    const statusCounts = {
      queued: 0,
      processing: 0,
      retry: 0,
      completed: 0,
      failed: 0,
    };

    this.queue.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    return {
      totalItems: this.queue.length,
      isProcessing: this.processing,
      statusCounts,
      stats: this.stats,
      oldestItem:
        this.queue.length > 0
          ? this.queue[this.queue.length - 1].createdAt
          : null,
      newestItem: this.queue.length > 0 ? this.queue[0].createdAt : null,
    };
  }

  /**
   * Get queue items with filtering
   */
  getItems(filter = {}) {
    let items = [...this.queue];

    if (filter.status) {
      items = items.filter((item) => item.status === filter.status);
    }

    if (filter.priority) {
      items = items.filter((item) => item.priority === filter.priority);
    }

    if (filter.limit) {
      items = items.slice(0, filter.limit);
    }

    return items.map((item) => ({
      id: item.id,
      status: item.status,
      priority: item.priority,
      attempts: item.attempts,
      createdAt: item.createdAt,
      lastAttempt: item.lastAttempt,
      lastError: item.lastError,
      nextRetry: item.nextRetry,
      emailTo: item.emailData.to,
      emailSubject: item.emailData.subject,
    }));
  }

  /**
   * Retry failed items
   */
  retryFailed() {
    let retriedCount = 0;

    this.queue.forEach((item) => {
      if (item.status === "failed" && item.attempts < this.maxRetries) {
        item.status = "queued";
        item.attempts = 0;
        item.lastError = null;
        item.nextRetry = null;
        retriedCount++;
      }
    });

    console.log(`Retrying ${retriedCount} failed email(s)`);
    return retriedCount;
  }

  /**
   * Clear completed items
   */
  clearCompleted() {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((item) => item.status !== "completed");
    const clearedCount = initialLength - this.queue.length;

    console.log(`Cleared ${clearedCount} completed email(s)`);
    return clearedCount;
  }

  /**
   * Clear all queue items
   */
  clearAll() {
    const clearedCount = this.queue.length;
    this.queue = [];
    this.stats.currentQueueSize = 0;

    console.log(`Cleared all ${clearedCount} email(s) from queue`);
    return clearedCount;
  }

  /**
   * Get specific queue item
   */
  getItem(itemId) {
    return this.queue.find((item) => item.id === itemId);
  }

  /**
   * Remove specific item from queue
   */
  removeItem(itemId) {
    const index = this.queue.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      const item = this.queue.splice(index, 1)[0];
      this.stats.currentQueueSize = this.queue.length;
      return item;
    }
    return null;
  }

  /**
   * Update item priority
   */
  updatePriority(itemId, newPriority) {
    const item = this.getItem(itemId);
    if (item) {
      this.removeItem(itemId);
      item.priority = newPriority;
      this.insertByPriority(item);
      return true;
    }
    return false;
  }

  /**
   * Generate unique queue ID
   */
  generateQueueId() {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Get queue health metrics
   */
  getHealthMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentItems = this.queue.filter(
      (item) => item.createdAt > oneHourAgo,
    );
    const stuckItems = this.queue.filter(
      (item) =>
        item.status === "processing" &&
        item.lastAttempt &&
        now - item.lastAttempt > 300000, // 5 minutes
    );

    return {
      queueSize: this.queue.length,
      recentItems: recentItems.length,
      stuckItems: stuckItems.length,
      avgProcessingTime: this.calculateAvgProcessingTime(),
      successRate: this.calculateSuccessRate(),
      isHealthy:
        this.queue.length < this.maxQueueSize * 0.8 && stuckItems.length === 0,
    };
  }

  /**
   * Calculate average processing time
   */
  calculateAvgProcessingTime() {
    // This would typically be calculated from historical data
    // For now, return estimated value
    return 2500; // 2.5 seconds
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    const total = this.stats.totalProcessed + this.stats.totalFailed;
    if (total === 0) return 100;
    return ((this.stats.totalProcessed / total) * 100).toFixed(2);
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();

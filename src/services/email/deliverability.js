/**
 * Email Deliverability Service
 * Provides guidance and tools for improving email deliverability
 * Handles SPF/DKIM setup, domain reputation, and best practices
 */

export class EmailDeliverabilityService {
  constructor(config = {}) {
    this.domain = config.domain || "austinmovefinder.com";
    this.config = config;
  }

  /**
   * Generate SPF record for the domain
   */
  generateSPFRecord(providers = ["sendgrid", "mailgun"], includeAll = false) {
    const spfMechanisms = ["v=spf1"];

    // Add provider-specific includes
    providers.forEach((provider) => {
      switch (provider.toLowerCase()) {
        case "sendgrid":
          spfMechanisms.push("include:sendgrid.net");
          break;
        case "mailgun":
          spfMechanisms.push("include:mailgun.org");
          break;
        case "mailchimp":
          spfMechanisms.push("include:servers.mcsv.net");
          break;
        case "google":
          spfMechanisms.push("include:_spf.google.com");
          break;
        case "microsoft":
          spfMechanisms.push("include:spf.protection.outlook.com");
          break;
        default:
          console.warn(`Unknown email provider: ${provider}`);
      }
    });

    // Add custom IP addresses if specified
    if (this.config.customIPs && this.config.customIPs.length > 0) {
      this.config.customIPs.forEach((ip) => {
        if (this.isValidIP(ip)) {
          spfMechanisms.push(`ip4:${ip}`);
        }
      });
    }

    // Add the all mechanism
    if (includeAll) {
      spfMechanisms.push("~all"); // Soft fail
    } else {
      spfMechanisms.push("-all"); // Hard fail
    }

    const spfRecord = spfMechanisms.join(" ");

    return {
      record: spfRecord,
      type: "TXT",
      name: "@",
      instructions: this.getSPFInstructions(spfRecord),
      validation: this.validateSPFRecord(spfRecord),
    };
  }

  /**
   * Generate DKIM setup instructions
   */
  generateDKIMSetup(providers = ["sendgrid", "mailgun"]) {
    const dkimInstructions = [];

    providers.forEach((provider) => {
      switch (provider.toLowerCase()) {
        case "sendgrid":
          dkimInstructions.push({
            provider: "SendGrid",
            records: [
              {
                type: "CNAME",
                name: "s1._domainkey",
                value:
                  "s1.domainkey.u{USER_ID}.wl{WHITE_LABEL_ID}.sendgrid.net",
                instructions: [
                  "1. Log into your SendGrid account",
                  "2. Go to Settings > Sender Authentication",
                  '3. Click "Authenticate Your Domain"',
                  "4. Enter your domain and follow the wizard",
                  "5. Add the generated CNAME records to your DNS",
                ],
              },
              {
                type: "CNAME",
                name: "s2._domainkey",
                value:
                  "s2.domainkey.u{USER_ID}.wl{WHITE_LABEL_ID}.sendgrid.net",
              },
            ],
            verificationUrl: "https://app.sendgrid.com/settings/sender_auth",
          });
          break;

        case "mailgun":
          dkimInstructions.push({
            provider: "Mailgun",
            records: [
              {
                type: "TXT",
                name: `mailo._domainkey.${this.domain}`,
                value: "k=rsa; p={PUBLIC_KEY_FROM_MAILGUN}",
                instructions: [
                  "1. Log into your Mailgun account",
                  "2. Go to Sending > Domains",
                  "3. Click on your domain",
                  "4. Copy the DKIM DNS record",
                  "5. Add it to your DNS provider",
                ],
              },
            ],
            verificationUrl: "https://app.mailgun.com/app/domains",
          });
          break;
      }
    });

    return {
      domain: this.domain,
      providers: dkimInstructions,
      generalInstructions: [
        "DKIM (DomainKeys Identified Mail) helps verify that emails haven't been tampered with",
        "Each email provider has their own DKIM setup process",
        "After adding DNS records, verification can take up to 48 hours",
        "Verify DKIM setup using online tools like MXToolbox or DMARCian",
      ],
    };
  }

  /**
   * Generate DMARC policy
   */
  generateDMARCPolicy(
    policy = "none",
    percentage = 100,
    reportingEmail = null,
  ) {
    const dmarcParts = ["v=DMARC1"];

    // Policy (none, quarantine, reject)
    dmarcParts.push(`p=${policy}`);

    // Percentage of emails to apply policy to
    if (percentage < 100) {
      dmarcParts.push(`pct=${percentage}`);
    }

    // Alignment for SPF and DKIM
    dmarcParts.push("sp=none"); // Subdomain policy
    dmarcParts.push("aspf=r"); // SPF alignment (relaxed)
    dmarcParts.push("adkim=r"); // DKIM alignment (relaxed)

    // Reporting
    if (reportingEmail) {
      dmarcParts.push(`rua=mailto:${reportingEmail}`);
      dmarcParts.push(`ruf=mailto:${reportingEmail}`);
    }

    // Report format
    dmarcParts.push("rf=afrf");
    dmarcParts.push("ri=86400"); // Report interval (24 hours)

    const dmarcRecord = dmarcParts.join("; ");

    return {
      record: dmarcRecord,
      type: "TXT",
      name: "_dmarc",
      instructions: this.getDMARCInstructions(policy),
      policy: policy,
      validation: this.validateDMARCRecord(dmarcRecord),
    };
  }

  /**
   * Check domain reputation
   */
  async checkDomainReputation() {
    const checks = {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      results: {},
    };

    try {
      // These would typically call external APIs
      // For now, providing structure and placeholders
      checks.results = {
        blacklists: {
          spamhaus: "not_listed", // Would check via API
          barracuda: "not_listed",
          surbl: "not_listed",
          status: "clean",
        },
        domainAge: {
          created: "Unknown", // Would query WHOIS
          age: "Unknown",
          status: "ok",
        },
        sslCertificate: {
          valid: true, // Would check SSL
          issuer: "Unknown",
          expiry: "Unknown",
          status: "ok",
        },
        dnsHealth: {
          mx: "configured",
          spf: "needs_check",
          dkim: "needs_check",
          dmarc: "needs_check",
          status: "warning",
        },
        recommendations: this.getReputationRecommendations(),
      };
    } catch (error) {
      console.error("Domain reputation check failed:", error);
      checks.error = error.message;
    }

    return checks;
  }

  /**
   * Get email deliverability best practices
   */
  getDeliverabilityBestPractices() {
    return {
      authentication: {
        title: "Email Authentication",
        practices: [
          "Set up SPF record to authorize sending servers",
          "Configure DKIM to sign outgoing emails",
          "Implement DMARC policy to protect against spoofing",
          "Use consistent from domains and sender names",
        ],
        priority: "critical",
      },
      content: {
        title: "Email Content",
        practices: [
          "Maintain good text-to-image ratio (60/40 or better)",
          "Avoid spam trigger words and excessive punctuation",
          "Include clear unsubscribe links",
          "Use descriptive and honest subject lines",
          "Personalize content when possible",
        ],
        priority: "high",
      },
      listManagement: {
        title: "List Management",
        practices: [
          "Use double opt-in for subscriptions",
          "Remove hard bounces immediately",
          "Suppress unsubscribes and complaints",
          "Segment lists for better targeting",
          "Regular list cleaning and validation",
        ],
        priority: "high",
      },
      sending: {
        title: "Sending Practices",
        practices: [
          "Warm up new sending domains gradually",
          "Maintain consistent sending volume",
          "Monitor bounce and complaint rates",
          "Use consistent sending schedule",
          "Avoid sudden volume spikes",
        ],
        priority: "medium",
      },
      monitoring: {
        title: "Monitoring & Analytics",
        practices: [
          "Track delivery, open, and click rates",
          "Monitor domain and IP reputation",
          "Set up feedback loops with ISPs",
          "Regular blacklist monitoring",
          "Analyze email performance metrics",
        ],
        priority: "medium",
      },
    };
  }

  /**
   * Validate email content for deliverability
   */
  validateEmailContent(content) {
    const results = {
      score: 100,
      issues: [],
      warnings: [],
      recommendations: [],
    };

    const text = this.extractTextFromHTML(content);

    // Check for spam trigger words
    const spamWords = this.checkSpamWords(text);
    if (spamWords.length > 0) {
      results.score -= spamWords.length * 5;
      results.warnings.push(
        `Potential spam words found: ${spamWords.join(", ")}`,
      );
    }

    // Check text-to-image ratio
    const imageCount = (content.match(/<img/gi) || []).length;
    const textLength = text.length;
    if (imageCount > 0 && textLength < imageCount * 100) {
      results.score -= 15;
      results.warnings.push(
        "Poor text-to-image ratio. Consider adding more text content.",
      );
    }

    // Check for unsubscribe link
    if (!content.includes("unsubscribe")) {
      results.score -= 25;
      results.issues.push("No unsubscribe link found in email content");
    }

    // Check for excessive punctuation
    const excessivePunctuation = text.match(/[!]{3,}|[?]{3,}|[.]{4,}/g);
    if (excessivePunctuation) {
      results.score -= 10;
      results.warnings.push("Excessive punctuation detected");
    }

    // Check for ALL CAPS
    const capsWords = text.match(/\b[A-Z]{4,}\b/g);
    if (capsWords && capsWords.length > 3) {
      results.score -= 10;
      results.warnings.push("Too many words in ALL CAPS");
    }

    // Generate recommendations
    if (results.score < 80) {
      results.recommendations.push(
        "Review and improve email content based on identified issues",
      );
    }
    if (!content.includes("alt=")) {
      results.recommendations.push(
        "Add alt text to images for better accessibility",
      );
    }

    return results;
  }

  /**
   * Extract text content from HTML
   */
  extractTextFromHTML(html) {
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
   * Check for common spam words
   */
  checkSpamWords(text) {
    const spamWords = [
      "act now",
      "apply now",
      "buy direct",
      "call now",
      "click here",
      "free",
      "guarantee",
      "limited time",
      "make money",
      "no obligation",
      "prize",
      "risk free",
      "save money",
      "urgent",
      "winner",
      "cash",
      "credit",
      "earn money",
      "extra income",
      "home based",
    ];

    const lowerText = text.toLowerCase();
    return spamWords.filter((word) => lowerText.includes(word));
  }

  /**
   * Validate SPF record
   */
  validateSPFRecord(record) {
    const issues = [];

    if (!record.startsWith("v=spf1")) {
      issues.push("SPF record must start with v=spf1");
    }

    if (
      !record.includes("-all") &&
      !record.includes("~all") &&
      !record.includes("+all")
    ) {
      issues.push("SPF record should end with an all mechanism");
    }

    if (record.length > 255) {
      issues.push("SPF record is too long (max 255 characters)");
    }

    const includeCount = (record.match(/include:/g) || []).length;
    if (includeCount > 10) {
      issues.push("Too many DNS lookups (max 10 includes recommended)");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate DMARC record
   */
  validateDMARCRecord(record) {
    const issues = [];

    if (!record.startsWith("v=DMARC1")) {
      issues.push("DMARC record must start with v=DMARC1");
    }

    if (!record.includes("p=")) {
      issues.push("DMARC record must include a policy (p=)");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get SPF setup instructions
   */
  getSPFInstructions(record) {
    return [
      "1. Log into your DNS provider (domain registrar or hosting provider)",
      "2. Navigate to DNS management or DNS records section",
      "3. Create a new TXT record with these settings:",
      `   - Type: TXT`,
      `   - Name: @ (or leave blank for root domain)`,
      `   - Value: ${record}`,
      "4. Save the record and wait for DNS propagation (up to 48 hours)",
      "5. Test the SPF record using online SPF checkers",
    ];
  }

  /**
   * Get DMARC setup instructions
   */
  getDMARCInstructions(policy) {
    return [
      "1. Ensure SPF and DKIM are properly configured first",
      "2. Start with policy=none to monitor without enforcement",
      "3. Add the DMARC TXT record to your DNS",
      "4. Monitor DMARC reports for several weeks",
      `5. Gradually increase policy strictness (none → quarantine → reject)`,
      "6. Set up email address to receive DMARC reports",
    ];
  }

  /**
   * Get reputation improvement recommendations
   */
  getReputationRecommendations() {
    return [
      "Implement proper email authentication (SPF, DKIM, DMARC)",
      "Maintain low bounce and complaint rates (<2%)",
      "Use consistent sending patterns and volumes",
      "Implement proper list hygiene and validation",
      "Monitor blacklist status regularly",
      "Set up feedback loops with major ISPs",
      "Use dedicated IP addresses for high-volume sending",
      "Warm up new IPs and domains gradually",
    ];
  }

  /**
   * Validate IP address
   */
  isValidIP(ip) {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }

  /**
   * Generate comprehensive deliverability report
   */
  async generateDeliverabilityReport(providers = ["sendgrid", "mailgun"]) {
    const report = {
      domain: this.domain,
      generatedAt: new Date().toISOString(),
      authentication: {
        spf: this.generateSPFRecord(providers),
        dkim: this.generateDKIMSetup(providers),
        dmarc: this.generateDMARCPolicy("none", 100),
      },
      reputation: await this.checkDomainReputation(),
      bestPractices: this.getDeliverabilityBestPractices(),
      actionItems: [],
    };

    // Generate action items based on findings
    if (!report.authentication.spf.validation.isValid) {
      report.actionItems.push({
        priority: "high",
        type: "authentication",
        action: "Fix SPF record issues",
        details: report.authentication.spf.validation.issues,
      });
    }

    if (report.reputation.results?.dnsHealth?.status === "warning") {
      report.actionItems.push({
        priority: "high",
        type: "dns",
        action: "Configure missing DNS records",
        details: "Set up SPF, DKIM, and DMARC records",
      });
    }

    return report;
  }
}

// Export singleton instance
export const deliverabilityService = new EmailDeliverabilityService();

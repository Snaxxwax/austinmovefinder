/**
 * Email Service Configuration
 * Manages email provider settings, fallback mechanisms, and service selection
 */

/**
 * Email provider types
 */
export const EMAIL_PROVIDERS = {
  SENDGRID: "sendgrid",
  MAILGUN: "mailgun",
  NODEMAILER: "nodemailer",
};

/**
 * Email template types
 */
export const EMAIL_TEMPLATES = {
  CUSTOMER_CONFIRMATION: "customer_confirmation",
  BUSINESS_NOTIFICATION: "business_notification",
  FOLLOW_UP: "follow_up",
  QUOTE_UPDATE: "quote_update",
};

/**
 * Get email configuration based on environment variables
 */
export function getEmailConfig() {
  return {
    // Primary provider selection
    primaryProvider: getPrimaryProvider(),

    // Provider configurations
    providers: {
      sendgrid: {
        apiKey: import.meta.env.SENDGRID_API_KEY,
        fromEmail:
          import.meta.env.SENDGRID_FROM_EMAIL || "noreply@austinmovefinder.com",
        enabled: !!import.meta.env.SENDGRID_API_KEY,
      },
      mailgun: {
        apiKey: import.meta.env.MAILGUN_API_KEY,
        domain: import.meta.env.MAILGUN_DOMAIN,
        fromEmail:
          import.meta.env.MAILGUN_FROM_EMAIL || "noreply@austinmovefinder.com",
        enabled: !!(
          import.meta.env.MAILGUN_API_KEY && import.meta.env.MAILGUN_DOMAIN
        ),
      },
      nodemailer: {
        host: import.meta.env.SMTP_HOST,
        port: import.meta.env.SMTP_PORT || 587,
        secure: import.meta.env.SMTP_SECURE === "true",
        auth: {
          user: import.meta.env.SMTP_USER,
          pass: import.meta.env.SMTP_PASS,
        },
        fromEmail:
          import.meta.env.SMTP_FROM_EMAIL || "noreply@austinmovefinder.com",
        enabled: !!(import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER),
      },
    },

    // Business configuration
    business: {
      email: import.meta.env.BUSINESS_EMAIL || "quotes@austinmovefinder.com",
      name: "Austin Move Finder",
      phone: "(512) 555-MOVE",
      website: "https://austinmovefinder.com",
    },

    // Email settings
    settings: {
      retryAttempts: 3,
      retryDelay: 2000, // ms
      timeout: 10000, // ms
      enableTracking: import.meta.env.NODE_ENV === "production",
      enableAnalytics: import.meta.env.NODE_ENV === "production",
      enableBounceHandling: import.meta.env.NODE_ENV === "production",

      // Rate limiting
      maxEmailsPerHour: 100,
      maxEmailsPerDay: 1000,

      // Development settings
      logEmails: import.meta.env.NODE_ENV === "development",
      dryRun: import.meta.env.EMAIL_DRY_RUN === "true",
    },

    // Template settings
    templates: {
      baseUrl:
        import.meta.env.PUBLIC_BASE_URL || "https://austinmovefinder.com",
      assetUrl:
        import.meta.env.PUBLIC_ASSET_URL ||
        "https://austinmovefinder.com/assets",
      unsubscribeUrl:
        import.meta.env.PUBLIC_UNSUBSCRIBE_URL ||
        "https://austinmovefinder.com/unsubscribe",
    },
  };
}

/**
 * Determine the primary email provider based on availability
 */
function getPrimaryProvider() {
  const config = {
    sendgrid: !!import.meta.env.SENDGRID_API_KEY,
    mailgun: !!(
      import.meta.env.MAILGUN_API_KEY && import.meta.env.MAILGUN_DOMAIN
    ),
    nodemailer: !!(import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER),
  };

  // Priority order: SendGrid > Mailgun > Nodemailer
  if (config.sendgrid) return EMAIL_PROVIDERS.SENDGRID;
  if (config.mailgun) return EMAIL_PROVIDERS.MAILGUN;
  if (config.nodemailer) return EMAIL_PROVIDERS.NODEMAILER;

  console.warn(
    "No email provider configured! Please set up SendGrid, Mailgun, or SMTP credentials.",
  );
  return null;
}

/**
 * Get fallback providers in order of preference
 */
export function getFallbackProviders() {
  const config = getEmailConfig();
  const fallbacks = [];

  Object.keys(config.providers).forEach((provider) => {
    if (
      config.providers[provider].enabled &&
      provider !== config.primaryProvider
    ) {
      fallbacks.push(provider);
    }
  });

  return fallbacks;
}

/**
 * Validate email configuration
 */
export function validateEmailConfig() {
  const config = getEmailConfig();
  const errors = [];

  if (!config.primaryProvider) {
    errors.push("No email provider configured");
  }

  if (!config.business.email) {
    errors.push("Business email not configured");
  }

  // Validate provider-specific configurations
  Object.entries(config.providers).forEach(([provider, providerConfig]) => {
    if (providerConfig.enabled) {
      switch (provider) {
        case EMAIL_PROVIDERS.SENDGRID:
          if (!providerConfig.apiKey) {
            errors.push("SendGrid API key missing");
          }
          break;
        case EMAIL_PROVIDERS.MAILGUN:
          if (!providerConfig.apiKey || !providerConfig.domain) {
            errors.push("Mailgun API key or domain missing");
          }
          break;
        case EMAIL_PROVIDERS.NODEMAILER:
          if (!providerConfig.host || !providerConfig.auth.user) {
            errors.push("SMTP host or user credentials missing");
          }
          break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Email delivery configuration for different providers
 */
export const DELIVERY_CONFIG = {
  [EMAIL_PROVIDERS.SENDGRID]: {
    trackOpens: true,
    trackClicks: true,
    subscriptionTracking: {
      enable: true,
      text: "Unsubscribe",
      html: '<a href="%unsubscribe_url%">Unsubscribe</a>',
    },
    analytics: {
      enable: true,
      utmSource: "email",
      utmMedium: "sendgrid",
      utmCampaign: "quote_notifications",
    },
  },
  [EMAIL_PROVIDERS.MAILGUN]: {
    tracking: true,
    trackingClicks: "yes",
    trackingOpens: "yes",
    testMode: import.meta.env.NODE_ENV === "development",
  },
  [EMAIL_PROVIDERS.NODEMAILER]: {
    // Standard SMTP doesn't have built-in tracking
    // Can integrate with external services if needed
  },
};

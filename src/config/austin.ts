// Austin Move Finder Configuration
// Centralized configuration for Austin-specific features and optimizations

export const austinConfig = {
  // App metadata
  app: {
    name: 'Austin Move Finder',
    version: '1.2.0',
    description: 'Your complete guide to moving in Austin, Texas',
    keywords: [
      'Austin moving',
      'Austin movers',
      'moving to Austin',
      'Austin neighborhoods',
      'Texas moving services',
      'Austin relocation'
    ]
  },

  // Contact information
  contact: {
    phone: '(512) 555-MOVE',
    phoneDigits: '5125556683',
    email: 'hello@austinmovefinder.com',
    website: 'https://austinmovefinder.com',
    businessHours: {
      weekdays: 'Monday - Friday: 9am - 6pm CST',
      saturday: 'Saturday: 10am - 4pm CST',
      sunday: 'Sunday: Closed'
    }
  },

  // Austin-specific geographical data
  location: {
    city: 'Austin',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: [
      '78701', '78702', '78703', '78704', '78705', '78712', '78717',
      '78719', '78721', '78722', '78723', '78724', '78725', '78726',
      '78727', '78728', '78729', '78730', '78731', '78732', '78733',
      '78734', '78735', '78736', '78737', '78738', '78739', '78741',
      '78742', '78744', '78745', '78746', '78747', '78748', '78749',
      '78750', '78751', '78752', '78753', '78754', '78756', '78757',
      '78758', '78759'
    ],
    coordinates: {
      lat: 30.2672,
      lng: -97.7431
    },
    timeZone: 'America/Chicago'
  },

  // Moving service configuration
  services: {
    localMovingRadius: 50, // miles
    longDistanceMinimum: 100, // miles
    pricing: {
      baseLaborRate: 120, // per hour per mover
      truckRatePerMile: 1.2,
      minimumCharge: 200,
      peakSeasonMultiplier: 1.3, // May-September
      offSeasonMultiplier: 0.9, // October-April
      downtownSurcharge: 25,
      hillCountrySurcharge: 15
    },
    features: [
      'Professional moving team',
      'All moving equipment & supplies',
      'Basic furniture protection',
      'Loading, transport & unloading',
      'Austin area expertise',
      'Insurance coverage',
      'Same-day availability'
    ]
  },

  // AI and technology configuration
  ai: {
    objectDetection: {
      enabled: true,
      maxFiles: 10,
      maxFileSize: 25 * 1024 * 1024, // 25MB in bytes
      supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      videoFormats: ['video/mp4', 'video/webm', 'video/mov'],
      confidenceThreshold: 0.25,
      maxRetries: 3,
      timeoutMs: 30000
    },
    emailService: {
      enabled: true,
      provider: 'EmailJS',
      responseTimeTarget: 2 * 60 * 60 * 1000, // 2 hours in ms
    }
  },

  // Performance targets
  performance: {
    targets: {
      fcp: 1800, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 800, // Time to First Byte (ms)
      pageLoad: 5000 // Complete page load (ms)
    },
    caching: {
      staticAssets: 24 * 60 * 60 * 1000, // 24 hours
      apiResponses: 5 * 60 * 1000, // 5 minutes
      images: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  },

  // Feature flags
  features: {
    enableObjectDetection: true,
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableOfflineMode: true,
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableA11yFeatures: true
  },

  // Austin neighborhoods (abbreviated list - full list in utils.ts)
  popularNeighborhoods: [
    'Downtown Austin',
    'South Austin (SoCo)',
    'East Austin',
    'West Lake Hills',
    'Cedar Park',
    'Round Rock',
    'Georgetown',
    'Pflugerville'
  ],

  // SEO and marketing
  seo: {
    defaultTitle: 'Austin Move Finder - Your Guide to Moving in Austin, TX',
    titleTemplate: '%s | Austin Move Finder',
    defaultDescription: 'Complete guide to moving to Austin, Texas. Find neighborhoods, moving tips, local resources, and everything you need for your Austin move.',
    defaultKeywords: [
      'Austin moving guide',
      'moving to Austin Texas',
      'Austin neighborhoods',
      'Austin movers',
      'Texas relocation',
      'Austin apartment hunting'
    ],
    twitterHandle: '@austinmovefinder',
    facebookPage: 'austinmovefinder'
  },

  // Theme and branding
  theme: {
    colors: {
      austinBlue: '#00a0dc',
      austinGreen: '#8cc63f',
      austinOrange: '#f47321',
      austinPurple: '#663399',
      austinTeal: '#0d7377'
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif'
    }
  },

  // External integrations
  integrations: {
    huggingFace: {
      apiUrl: 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
      rateLimit: 30, // requests per minute
    },
    emailJS: {
      serviceTemplates: {
        quoteRequest: 'template_quote_request',
        customerConfirmation: 'template_customer_confirmation'
      }
    }
  },

  // Development and debugging
  debug: {
    enableConsoleLogging: import.meta.env.DEV,
    enablePerformanceLogging: true,
    enableErrorReporting: import.meta.env.PROD,
    logLevel: import.meta.env.DEV ? 'debug' : 'error'
  }
};

// Utility functions for Austin-specific logic
export const austinUtils = {
  // Check if an address is in Austin area
  isAustinArea: (address: string): boolean => {
    const austinKeywords = [
      'austin', 'cedar park', 'round rock', 'georgetown', 'pflugerville',
      'lakeway', 'bee cave', 'west lake hills', 'rollingwood', 'sunset valley'
    ];

    return austinKeywords.some(keyword =>
      address.toLowerCase().includes(keyword)
    );
  },

  // Get season-based pricing multiplier
  getSeasonMultiplier: (date: Date = new Date()): number => {
    const month = date.getMonth() + 1; // 1-12
    // Peak season: May (5) through September (9)
    return (month >= 5 && month <= 9)
      ? austinConfig.services.pricing.peakSeasonMultiplier
      : austinConfig.services.pricing.offSeasonMultiplier;
  },

  // Format phone number for display
  formatPhone: (phone?: string): string => {
    if (!phone) return austinConfig.contact.phone;

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // Get Austin-specific moving tips
  getAustinMovingTips: (): string[] => [
    'Book movers early during SXSW and ACL seasons (March-April, September-October)',
    'Consider traffic patterns - avoid I-35 during rush hours',
    'Many Austin apartments require elevator reservations',
    'Hill Country homes may have challenging access roads',
    'Keep Austin Weird - support local moving companies!',
    'Summer moves (June-August) can be extremely hot - plan accordingly',
    'UT students move in late August - book early for this period'
  ],

  // Check if it's peak moving season in Austin
  isPeakSeason: (date: Date = new Date()): boolean => {
    const month = date.getMonth() + 1;
    return month >= 5 && month <= 9;
  },

  // Get Austin weather considerations
  getWeatherConsiderations: (date: Date = new Date()): string => {
    const month = date.getMonth() + 1;

    if (month >= 6 && month <= 8) {
      return 'Summer heat advisory: Schedule early morning moves and stay hydrated. Temperatures can exceed 100°F.';
    } else if (month >= 12 || month <= 2) {
      return 'Winter moves: Generally mild, but watch for occasional ice storms in January/February.';
    } else if (month >= 3 && month <= 5) {
      return 'Spring moves: Perfect weather, but book early due to SXSW and graduation season demand.';
    } else {
      return 'Fall moves: Great weather and ACL season - book early for October dates.';
    }
  }
};

export default austinConfig;
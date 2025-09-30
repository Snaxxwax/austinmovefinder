export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "service";
  noindex?: boolean;
  keywords?: string[];
  localBusiness?: LocalBusinessData;
  breadcrumbs?: BreadcrumbItem[];
  faq?: FAQItem[];
  service?: ServiceData;
}

export interface LocalBusinessData {
  name: string;
  description: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  url: string;
  image?: string;
  priceRange?: string;
  areaServed: string[];
  serviceType: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  openingHours?: string[];
  sameAs?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceData {
  name: string;
  description: string;
  provider: string;
  areaServed: string[];
  serviceType: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

// Austin-specific SEO configuration
export const AUSTIN_SEO_CONFIG = {
  siteName: "Austin Move Finder",
  defaultTitle: "Austin Move Finder - Find Top Movers in Austin Texas",
  defaultDescription:
    "Find trusted, licensed moving companies in Austin, Texas. Get free quotes from top-rated local movers. Compare prices and services for your Austin move.",
  siteUrl: "https://austinmovefinder.com",
  defaultImage: "/logo-optimized.webp",
  keywords: [
    "austin movers",
    "moving companies austin",
    "austin moving services",
    "local movers austin tx",
    "austin relocation services",
    "professional movers austin",
    "austin moving quotes",
    "moving company austin texas",
    "residential movers austin",
    "commercial movers austin",
  ],
  localBusiness: {
    name: "Austin Move Finder",
    description:
      "Austin Move Finder connects you with trusted, licensed moving companies in Austin, Texas. Get free quotes from top-rated local movers and compare services for your move.",
    address: {
      addressLocality: "Austin",
      addressRegion: "TX",
      addressCountry: "US",
    },
    telephone: "+1-512-555-0123",
    email: "hello@austinmovefinder.com",
    url: "https://austinmovefinder.com",
    image: "https://austinmovefinder.com/logo-optimized.webp",
    priceRange: "$$",
    areaServed: [
      "Austin, TX",
      "Round Rock, TX",
      "Cedar Park, TX",
      "Pflugerville, TX",
      "Leander, TX",
      "Georgetown, TX",
      "Lakeway, TX",
      "Bee Cave, TX",
      "West Lake Hills, TX",
      "Rollingwood, TX",
      "Sunset Valley, TX",
      "Manor, TX",
      "Elgin, TX",
      "Bastrop, TX",
      "Dripping Springs, TX",
    ],
    serviceType: [
      "Local Moving Services",
      "Long Distance Moving",
      "Residential Moving",
      "Commercial Moving",
      "Packing Services",
      "Storage Solutions",
      "Moving Quote Comparison",
    ],
    aggregateRating: {
      ratingValue: 4.8,
      reviewCount: 1247,
    },
    openingHours: ["Mo-Fr 08:00-18:00", "Sa 09:00-16:00"],
    sameAs: [
      "https://www.facebook.com/austinmovefinder",
      "https://www.instagram.com/austinmovefinder",
      "https://www.linkedin.com/company/austinmovefinder",
    ],
  } as LocalBusinessData,
};

// Austin neighborhoods and areas for local SEO
export const AUSTIN_NEIGHBORHOODS = [
  "Downtown Austin",
  "South Austin",
  "East Austin",
  "West Austin",
  "North Austin",
  "Central Austin",
  "Mueller",
  "Zilker",
  "Barton Hills",
  "Tarrytown",
  "Clarksville",
  "Hyde Park",
  "Crestview",
  "Bouldin Creek",
  "Travis Heights",
  "Allandale",
  "Rosedale",
  "Cherrywood",
  "Windsor Park",
  "Govalle",
  "Holly",
  "Montopolis",
  "St. Johns",
  "Riverside",
  "Oltorf",
];

// Moving-related keywords for Austin
export const AUSTIN_MOVING_KEYWORDS = [
  // Primary keywords
  "austin movers",
  "moving companies austin",
  "austin moving services",
  "movers in austin texas",

  // Long-tail keywords
  "best moving companies in austin tx",
  "affordable movers austin",
  "local moving companies austin",
  "austin residential movers",
  "austin commercial movers",
  "austin apartment movers",
  "austin house movers",
  "austin office movers",

  // Service-specific keywords
  "austin packing services",
  "austin storage solutions",
  "austin moving quotes",
  "austin moving estimates",
  "austin moving help",
  "austin relocation services",

  // Neighborhood-specific
  "downtown austin movers",
  "south austin moving company",
  "east austin movers",
  "west austin moving services",
  "north austin movers",

  // Intent-based keywords
  "hire movers austin",
  "find movers austin",
  "compare moving quotes austin",
  "trusted movers austin",
  "licensed movers austin",
  "insured movers austin",
  "professional movers austin",
];

export function generateSchemaOrg(config: SEOConfig): any {
  const schemas = [];

  // Local Business Schema
  if (config.localBusiness) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      name: config.localBusiness.name,
      description: config.localBusiness.description,
      url: config.localBusiness.url,
      image: config.localBusiness.image,
      telephone: config.localBusiness.telephone,
      email: config.localBusiness.email,
      priceRange: config.localBusiness.priceRange,
      address: {
        "@type": "PostalAddress",
        addressLocality: config.localBusiness.address.addressLocality,
        addressRegion: config.localBusiness.address.addressRegion,
        addressCountry: config.localBusiness.address.addressCountry,
        streetAddress: config.localBusiness.address.streetAddress,
        postalCode: config.localBusiness.address.postalCode,
      },
      areaServed: config.localBusiness.areaServed.map((area) => ({
        "@type": "City",
        name: area,
      })),
      serviceType: config.localBusiness.serviceType,
      aggregateRating: config.localBusiness.aggregateRating
        ? {
            "@type": "AggregateRating",
            ratingValue: config.localBusiness.aggregateRating.ratingValue,
            reviewCount: config.localBusiness.aggregateRating.reviewCount,
          }
        : undefined,
      openingHours: config.localBusiness.openingHours,
      sameAs: config.localBusiness.sameAs,
    });
  }

  // Service Schema
  if (config.service) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: config.service.name,
      description: config.service.description,
      provider: {
        "@type": "Organization",
        name: config.service.provider,
      },
      areaServed: config.service.areaServed.map((area) => ({
        "@type": "City",
        name: area,
      })),
      serviceType: config.service.serviceType,
      offers: config.service.offers
        ? {
            "@type": "Offer",
            price: config.service.offers.price,
            priceCurrency: config.service.offers.priceCurrency,
            availability: config.service.offers.availability,
          }
        : undefined,
    });
  }

  // Breadcrumb Schema
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: config.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  // FAQ Schema
  if (config.faq && config.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  // Website Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: AUSTIN_SEO_CONFIG.siteName,
    url: AUSTIN_SEO_CONFIG.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${AUSTIN_SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });

  return schemas.length === 1 ? schemas[0] : schemas;
}

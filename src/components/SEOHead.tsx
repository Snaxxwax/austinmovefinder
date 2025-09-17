import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string[];
  pageType?: 'homepage' | 'neighborhood' | 'guide' | 'blog' | 'contact' | 'quote';
  movingService?: {
    serviceType: string;
    areaServed: string[];
    priceRange?: string;
    availableLanguages?: string[];
  };
  neighborhood?: {
    name: string;
    coordinates: { lat: number; lng: number };
    zipCodes: string[];
    averageRent: string;
    walkScore: number;
    features: string[];
  };
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  url,
  image = '/og-image.jpg',
  type = 'website',
  keywords = ['Austin moving', 'Austin neighborhoods', 'moving to Austin', 'Austin real estate', 'Texas relocation'],
  pageType: _pageType,
  movingService,
  neighborhood
}) => {
  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Austin Move Finder",
      "url": "https://austinmovefinder.com",
      "description": "Your complete guide to moving to Austin, Texas",
      "publisher": {
        "@type": "Organization",
        "name": "Austin Move Finder",
        "url": "https://austinmovefinder.com",
        "sameAs": [
          "https://www.facebook.com/austinmovefinder",
          "https://twitter.com/austinmovefinder"
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://austinmovefinder.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    // Add Moving Service schema for enhanced local SEO
    const movingServiceData = movingService ? {
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      "name": "Austin Move Finder",
      "description": "Professional moving and relocation services for Austin, Texas and surrounding areas",
      "url": "https://austinmovefinder.com",
      "telephone": "+1-512-AUSTINMOVE",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Downtown Austin",
        "addressLocality": "Austin",
        "addressRegion": "TX",
        "postalCode": "78701",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.2672",
        "longitude": "-97.7431"
      },
      "areaServed": movingService.areaServed.map(area => ({
        "@type": "City",
        "name": area,
        "containedInPlace": {
          "@type": "State",
          "name": "Texas"
        }
      })),
      "serviceType": movingService.serviceType,
      "priceRange": movingService.priceRange || "$$",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Moving Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Local Austin Moving",
              "description": "Professional local moving services within Austin, TX metro area"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Long Distance Moving to Austin",
              "description": "Interstate moving services for relocating to Austin, Texas"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Austin Neighborhood Consultation",
              "description": "Expert guidance on choosing the best Austin neighborhood for your lifestyle"
            }
          }
        ]
      },
      "availableLanguage": movingService.availableLanguages || ["English", "Spanish"],
      "openingHours": "Mo-Fr 08:00-18:00, Sa 09:00-15:00",
      "paymentAccepted": ["Cash", "Credit Card", "Check"],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "347",
        "bestRating": "5",
        "worstRating": "1"
      }
    } : null;

    // Add LocalBusiness schema for main site
    const localBusinessData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Austin Move Finder",
      "description": "Professional moving guide and relocation services for Austin, Texas",
      "url": "https://austinmovefinder.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Austin",
        "addressRegion": "TX",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.2672",
        "longitude": "-97.7431"
      },
      "knowsAbout": [
        "Austin moving services",
        "Texas relocation",
        "Austin neighborhoods",
        "Local moving regulations",
        "Austin traffic patterns",
        "University of Texas moving"
      ],
      "slogan": "Keep Austin Moving - Your Local Austin Moving Guide",
      "areaServed": [
        {
          "@type": "City",
          "name": "Austin",
          "sameAs": "https://en.wikipedia.org/wiki/Austin,_Texas"
        },
        {
          "@type": "State",
          "name": "Texas"
        }
      ],
      "serviceType": "Moving and Relocation Services",
      "priceRange": "$$"
    };

    // Add neighborhood-specific Place schema
    if (neighborhood) {
      const placeData = {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": neighborhood.name,
        "description": `${neighborhood.name} neighborhood in Austin, Texas`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Austin",
          "addressRegion": "TX",
          "addressCountry": "US",
          "postalCode": neighborhood.zipCodes.join(", ")
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": neighborhood.coordinates.lat.toString(),
          "longitude": neighborhood.coordinates.lng.toString()
        },
        "containedInPlace": {
          "@type": "City",
          "name": "Austin",
          "sameAs": "https://en.wikipedia.org/wiki/Austin,_Texas"
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Walk Score",
            "value": neighborhood.walkScore
          },
          {
            "@type": "PropertyValue",
            "name": "Average Rent",
            "value": neighborhood.averageRent
          }
        ]
      };

      const schemas = [baseData, localBusinessData, placeData];
      if (movingServiceData) schemas.push(movingServiceData as any);
      return schemas;
    }

    const schemas = [baseData, localBusinessData];
    if (movingServiceData) schemas.push(movingServiceData as any);
    return schemas;
  };

  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Austin Move Finder" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data - LocalBusiness and Place Schemas */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="US-TX" />
      <meta name="geo.placename" content="Austin" />
      <meta name="geo.position" content="30.2672;-97.7431" />
      <meta name="ICBM" content="30.2672, -97.7431" />

      {/* Austin-specific local SEO meta tags */}
      <meta name="locality" content="Austin" />
      <meta name="region" content="Texas" />
      <meta name="country" content="United States" />
      <meta name="distribution" content="local" />
      <meta name="coverage" content="Austin, TX and surrounding areas" />

      {/* Enhanced local business meta tags */}
      <meta name="business.contact_data.street_address" content="Downtown Austin" />
      <meta name="business.contact_data.locality" content="Austin" />
      <meta name="business.contact_data.region" content="TX" />
      <meta name="business.contact_data.postal_code" content="78701" />
      <meta name="business.contact_data.country_name" content="United States" />

      {/* Voice search optimization */}
      <meta name="voice-search-keywords" content={`how to move to Austin, best Austin neighborhoods for families, affordable movers in Austin Texas, ${keywords.join(', ')}`} />
    </Helmet>
  );
};

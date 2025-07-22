import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  url,
  image = '/og-image.jpg',
  type = 'website',
  keywords = ['Austin moving', 'Austin neighborhoods', 'moving to Austin', 'Austin real estate', 'Texas relocation']
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Austin Move Finder",
    "url": "https://austinmovefinder.com",
    "description": "Your complete guide to moving to Austin, Texas",
    "publisher": {
      "@type": "Organization",
      "name": "Austin Move Finder",
      "url": "https://austinmovefinder.com"
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

      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="US-TX" />
      <meta name="geo.placename" content="Austin" />
      <meta name="geo.position" content="30.2672;-97.7431" />
      <meta name="ICBM" content="30.2672, -97.7431" />
    </Helmet>
  );
};

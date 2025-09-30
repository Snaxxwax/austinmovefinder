import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    category: z.enum(['Moving Tips', 'Neighborhoods', 'Cost Guide', 'Seasonal', 'Planning']),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    readTime: z.string(),
    featured: z.boolean().default(false),
    author: z.string().default('Austin Move Finder Team'),
    draft: z.boolean().default(false)
  }),
});

const neighborhoodsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    zip_codes: z.array(z.string()),
    median_home_price: z.string().optional(),
    median_rent: z.string().optional(),
    walkability_score: z.number().optional(),
    school_rating: z.string().optional(),
    crime_rating: z.enum(['Very Low', 'Low', 'Moderate', 'High']).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    highlights: z.array(z.string()),
    amenities: z.array(z.string()),
    transportation: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    layout: z.enum(['default', 'landing', 'legal']).default('default'),
    lastModified: z.date().optional(),
    noindex: z.boolean().default(false),
    draft: z.boolean().default(false)
  }),
});

export const collections = {
  'blog': blogCollection,
  'neighborhoods': neighborhoodsCollection,
  'pages': pagesCollection,
};
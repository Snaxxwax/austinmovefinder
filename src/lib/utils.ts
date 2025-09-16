import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Austin neighborhoods data - Comprehensive guide to 25+ Austin areas
// Updated for 2025 with enhanced SEO data and local market insights
export const austinNeighborhoods = [
  {
    name: "Downtown Austin",
    slug: "downtown",
    description: "The heart of the city with high-rise living and urban amenities",
    averageRent: "$2,200",
    walkScore: 88,
    features: ["Public transportation", "Nightlife", "Business district", "Entertainment", "High-rise living", "Walking distance to everything"],
    zipCodes: ["78701", "78702"],
    coordinates: { lat: 30.2672, lng: -97.7431 }
  },
  {
    name: "South Austin (SoCo)",
    slug: "south-austin",
    description: "Eclectic neighborhood known for 'Keep Austin Weird' culture and Zilker Park access",
    averageRent: "$1,840",
    walkScore: 79,
    features: ["Zilker Park (350+ acres)", "Barton Springs Pool", "Austin City Limits Festival", "Food trucks", "Live music venues", "Keep Austin Weird culture", "South Congress shopping", "Lady Bird Lake trail access", "The Far Out Lounge", "Lustre Pearl South"],
    zipCodes: ["78704", "78745"],
    coordinates: { lat: 30.2360, lng: -97.7675 }
  },
  {
    name: "East Austin",
    slug: "east-austin",
    description: "Hip area with creative scene, diverse dining, and rapid gentrification",
    averageRent: "$1,900",
    walkScore: 70,
    features: ["Art galleries", "Breweries", "Food scene", "Music venues", "Street art", "Creative community"],
    zipCodes: ["78702", "78723"],
    coordinates: { lat: 30.2711, lng: -97.7137 }
  },
  {
    name: "West Lake Hills",
    slug: "west-lake-hills",
    description: "Upscale suburban community with lake access and luxury homes",
    averageRent: "$3,500",
    walkScore: 45,
    features: ["Lake Austin", "Luxury homes", "Top schools", "Hill Country views", "Boating", "Quiet neighborhoods"],
    zipCodes: ["78746"],
    coordinates: { lat: 30.2849, lng: -97.8081 }
  },
  {
    name: "North Austin",
    slug: "north-austin",
    description: "Family-friendly area with affordable housing and tech corridor access",
    averageRent: "$1,600",
    walkScore: 55,
    features: ["Family-oriented", "Affordable", "Good schools", "Parks", "Tech companies", "Growing area"],
    zipCodes: ["78757", "78758"],
    coordinates: { lat: 30.3572, lng: -97.7278 }
  },
  {
    name: "Cedar Park",
    slug: "cedar-park",
    description: "Suburban community north of Austin with excellent schools and family amenities",
    averageRent: "$1,639",
    walkScore: 52,
    features: ["#2 Best School District in Austin Area", "Cedar Park Recreation Center", "1,000+ acres of parkland", "H-E-B Center venues", "Nebraska Furniture Mart (2025)", "1890 Ranch shopping", "The Parke retail center", "Family-friendly community", "Low crime rates", "250+ restaurants and cafes"],
    zipCodes: ["78613"],
    coordinates: { lat: 30.5052, lng: -97.8203 }
  },
  {
    name: "Westlake",
    slug: "westlake",
    description: "Affluent area with prestigious schools and upscale shopping at Barton Creek Mall",
    averageRent: "$3,200",
    walkScore: 35,
    features: ["Luxury living", "Top schools", "Barton Creek Mall", "Golf courses", "Low crime", "High property values"],
    zipCodes: ["78746"],
    coordinates: { lat: 30.3079, lng: -97.8431 }
  },
  {
    name: "Round Rock",
    slug: "round-rock",
    description: "Growing suburb north of Austin known for Dell headquarters and family-friendly atmosphere",
    averageRent: "$1,650",
    walkScore: 42,
    features: ["Dell headquarters", "Family-friendly", "Good schools", "Sports complex", "Affordable", "Growing tech scene"],
    zipCodes: ["78664", "78665"],
    coordinates: { lat: 30.5083, lng: -97.6789 }
  },
  {
    name: "The Domain",
    slug: "the-domain",
    description: "Modern high-end shopping and residential district in North Austin",
    averageRent: "$2,100",
    walkScore: 65,
    features: ["Luxury shopping", "High-end dining", "Modern apartments", "Business district", "Walkable", "Upscale living"],
    zipCodes: ["78758"],
    coordinates: { lat: 30.4003, lng: -97.7211 }
  },
  {
    name: "Mueller",
    slug: "mueller",
    description: "Sustainable planned community on former airport site with parks and trails",
    averageRent: "$2,000",
    walkScore: 68,
    features: ["Sustainable living", "Parks and trails", "New development", "Green building", "Community events", "Modern amenities"],
    zipCodes: ["78723"],
    coordinates: { lat: 30.2953, lng: -97.7019 }
  },
  {
    name: "Barton Hills",
    slug: "barton-hills",
    description: "Quiet residential area near Zilker Park with easy downtown access",
    averageRent: "$2,500",
    walkScore: 60,
    features: ["Near Zilker Park", "Quiet residential", "Downtown access", "Green spaces", "Swimming pool", "Established neighborhood"],
    zipCodes: ["78704"],
    coordinates: { lat: 30.2584, lng: -97.7808 }
  },
  {
    name: "Clarksville",
    slug: "clarksville",
    description: "Historic neighborhood near downtown with tree-lined streets and unique character",
    averageRent: "$2,800",
    walkScore: 75,
    features: ["Historic charm", "Tree-lined streets", "Near downtown", "Walkable", "Local restaurants", "Character homes"],
    zipCodes: ["78703"],
    coordinates: { lat: 30.2804, lng: -97.7567 }
  },
  {
    name: "Tarrytown",
    slug: "tarrytown",
    description: "Established central Austin neighborhood with mature trees and quality homes",
    averageRent: "$2,700",
    walkScore: 65,
    features: ["Established neighborhood", "Mature trees", "Quality homes", "Central location", "Good schools", "Family-friendly"],
    zipCodes: ["78703"],
    coordinates: { lat: 30.2930, lng: -97.7648 }
  },
  {
    name: "Zilker",
    slug: "zilker",
    description: "Home to Zilker Park and Austin City Limits, with outdoor recreation focus",
    averageRent: "$2,300",
    walkScore: 70,
    features: ["Zilker Park", "Austin City Limits", "Outdoor recreation", "Barton Springs Pool", "Food trucks", "Festival grounds"],
    zipCodes: ["78704"],
    coordinates: { lat: 30.2636, lng: -97.7734 }
  },
  {
    name: "Bouldin Creek",
    slug: "bouldin-creek",
    description: "Trendy neighborhood south of downtown with eclectic dining and nightlife",
    averageRent: "$2,100",
    walkScore: 78,
    features: ["Trendy dining", "Nightlife", "South of downtown", "Walkable", "Local businesses", "Young professionals"],
    zipCodes: ["78704"],
    coordinates: { lat: 30.2484, lng: -97.7534 }
  },
  {
    name: "Hyde Park",
    slug: "hyde-park",
    description: "Historic neighborhood near UT campus with vintage homes and local businesses",
    averageRent: "$1,900",
    walkScore: 82,
    features: ["Near UT campus", "Historic homes", "Local businesses", "Duval Street", "Students and families", "Vintage character"],
    zipCodes: ["78751"],
    coordinates: { lat: 30.3095, lng: -97.7350 }
  },
  {
    name: "Crestview",
    slug: "crestview",
    description: "Up-and-coming North Austin neighborhood with affordable homes and local culture",
    averageRent: "$1,750",
    walkScore: 58,
    features: ["Affordable homes", "Local culture", "Food scene", "Lamar Boulevard", "Growing area", "Community feel"],
    zipCodes: ["78757"],
    coordinates: { lat: 30.3397, lng: -97.7411 }
  },
  {
    name: "Cherrywood",
    slug: "cherrywood",
    description: "East Austin neighborhood with diverse community and proximity to downtown",
    averageRent: "$1,850",
    walkScore: 65,
    features: ["Diverse community", "Near downtown", "Local venues", "Art scene", "Airport Boulevard", "Affordable"],
    zipCodes: ["78722"],
    coordinates: { lat: 30.2889, lng: -97.7072 }
  },
  {
    name: "Travis Heights",
    slug: "travis-heights",
    description: "South Austin neighborhood with hike and bike trail access and family atmosphere",
    averageRent: "$2,200",
    walkScore: 62,
    features: ["Hike and bike trail", "Family atmosphere", "South First", "Local shops", "Quiet streets", "Established area"],
    zipCodes: ["78704"],
    coordinates: { lat: 30.2445, lng: -97.7645 }
  },
  {
    name: "Rosedale",
    slug: "rosedale",
    description: "Central Austin neighborhood with tree-lined streets and proximity to amenities",
    averageRent: "$2,000",
    walkScore: 72,
    features: ["Tree-lined streets", "Central location", "Near amenities", "Family-friendly", "Burnet Road", "Local dining"],
    zipCodes: ["78756"],
    coordinates: { lat: 30.3211, lng: -97.7289 }
  },
  {
    name: "Allandale",
    slug: "allandale",
    description: "Established North Austin neighborhood with mature trees and quiet residential feel",
    averageRent: "$1,950",
    walkScore: 55,
    features: ["Mature trees", "Quiet residential", "Established neighborhood", "Good schools", "Family-oriented", "Burnet Road access"],
    zipCodes: ["78756"],
    coordinates: { lat: 30.3456, lng: -97.7356 }
  },
  {
    name: "Rollingwood",
    slug: "rollingwood",
    description: "Small incorporated city within Austin area, known for quiet suburban living",
    averageRent: "$3,000",
    walkScore: 25,
    features: ["Quiet suburban", "Incorporated city", "Low density", "Tree coverage", "Family-friendly", "Good schools"],
    zipCodes: ["78746"],
    coordinates: { lat: 30.2834, lng: -97.7934 }
  },
  {
    name: "Lakeway",
    slug: "lakeway",
    description: "Lake community west of Austin with resort-style living and water activities",
    averageRent: "$2,800",
    walkScore: 30,
    features: ["Lake community", "Resort-style living", "Water activities", "Golf courses", "Quiet", "Hill Country"],
    zipCodes: ["78734"],
    coordinates: { lat: 30.3638, lng: -97.9297 }
  },
  {
    name: "Dripping Springs",
    slug: "dripping-springs",
    description: "Hill Country community known as 'Gateway to the Hill Country' with rural feel",
    averageRent: "$2,400",
    walkScore: 25,
    features: ["Hill Country", "Rural feel", "Good schools", "Family-friendly", "Outdoor activities", "Commuter town"],
    zipCodes: ["78620"],
    coordinates: { lat: 30.1905, lng: -98.0867 }
  },
  {
    name: "Pflugerville",
    slug: "pflugerville",
    description: "Fast-growing suburb northeast of Austin with affordable family housing and Lake Pflugerville recreation",
    averageRent: "$1,697",
    walkScore: 35,
    features: ["Lake Pflugerville (180 acres)", "Pflugerville Recreation Center", "56-mile trail system", "92.6% graduation rate schools", "Hawaiian Falls waterpark", "Family-oriented (73% family households)", "Swimming and water sports", "Heritage Trail greenway", "Growing tech employment", "Strategic Austin/Round Rock location"],
    zipCodes: ["78660"],
    coordinates: { lat: 30.4394, lng: -97.6200 }
  }
];

// Moving checklist data
export const movingChecklist = [
  {
    timeline: "8 weeks before",
    tasks: [
      "Research Austin neighborhoods",
      "Get moving quotes from local companies",
      "Start decluttering belongings",
      "Research Austin utilities (Austin Energy, etc.)"
    ]
  },
  {
    timeline: "6 weeks before",
    tasks: [
      "Book your moving company",
      "Start apartment/house hunting",
      "Research Austin schools if you have kids",
      "Begin job search if needed"
    ]
  },
  {
    timeline: "4 weeks before",
    tasks: [
      "Secure housing in Austin",
      "Schedule utility transfers",
      "Update address with banks/credit cards",
      "Research Texas vehicle registration"
    ]
  },
  {
    timeline: "2 weeks before",
    tasks: [
      "Confirm moving details",
      "Pack non-essential items",
      "Update voter registration",
      "Research Texas driver's license requirements"
    ]
  },
  {
    timeline: "Moving week",
    tasks: [
      "Pack essentials box",
      "Confirm utility connections",
      "Do final walkthrough",
      "Prepare cash for movers"
    ]
  }
];

// 2025 Austin moving cost estimates (Enhanced for SEO)
export const austinMovingCosts = {
  localMoves: {
    studio: { range: '$400-800', average: '$600' },
    oneBedroom: { range: '$500-1200', average: '$850' },
    twoBedroom: { range: '$800-1800', average: '$1300' },
    threeBedroom: { range: '$1200-2500', average: '$1850' }
  },
  longDistance: {
    california: { range: '$2800-5500', average: '$4150', days: '3-5' },
    newYork: { range: '$3200-6200', average: '$4700', days: '4-7' },
    florida: { range: '$2400-4800', average: '$3600', days: '3-6' },
    chicago: { range: '$2100-4200', average: '$3150', days: '2-4' }
  },
  additionalServices: {
    packing: '$25-50 per hour per packer',
    storage: '$80-200 per month (10x10 unit)',
    pianoMoving: '$300-800 depending on type',
    carShipping: '$800-1500 depending on distance'
  }
};

// Austin area utility providers and setup info
export const austinUtilities = {
  electricity: {
    provider: 'Austin Energy',
    website: 'austinenergy.com',
    phone: '512-494-9400',
    setupTime: '1-3 business days',
    averageRate: '$0.087 per kWh'
  },
  water: {
    provider: 'City of Austin Water Utility',
    website: 'austintexas.gov/department/water',
    phone: '512-972-0101',
    setupTime: '1-2 business days'
  },
  gas: {
    provider: 'Texas Gas Service',
    website: 'texasgasservice.com',
    phone: '512-370-8243',
    setupTime: '1-3 business days'
  },
  internet: {
    providers: [
      { name: 'Google Fiber', speed: 'Up to 2 Gig', price: '$70-100/month' },
      { name: 'Spectrum', speed: 'Up to 1 Gig', price: '$50-80/month' },
      { name: 'AT&T Fiber', speed: 'Up to 5 Gig', price: '$55-180/month' }
    ]
  }
};

// Austin-specific moving tips for 2025
export const austinMovingTips = [
  {
    title: "Best Time to Move in Austin",
    content: "Avoid summer months (June-August) when it's hottest. Spring and fall offer the best weather for moving."
  },
  {
    title: "Austin Traffic Considerations",
    content: "Plan moves around rush hour (7-9 AM, 4-7 PM) and avoid I-35 during peak times. Consider MoPac and 183 as alternatives."
  },
  {
    title: "Texas Residency Requirements",
    content: "You have 90 days to get a Texas driver's license and 30 days to register your vehicle after establishing residency."
  },
  {
    title: "Austin Utility Setup",
    content: "Austin Energy provides electricity. Set up water through the City of Austin. Research internet options: Google Fiber, Spectrum, AT&T."
  },
  {
    title: "Austin DMV and Vehicle Registration",
    content: "Visit the Travis County Tax Office at 5501 Airport Blvd for vehicle registration. Bring proof of insurance, inspection, and identification."
  },
  {
    title: "Austin Moving Permits",
    content: "Large moving trucks may need permits for downtown Austin streets. Check with the City of Austin Transportation Department for requirements."
  },
  {
    title: "Austin Storage Solutions",
    content: "If you need temporary storage, Austin has many climate-controlled facilities. Popular areas include North Austin, Cedar Park, and South Austin."
  },
  {
    title: "Austin Pet Relocation",
    content: "Austin is very pet-friendly! Register with local vets, visit Zilker Park dog park, and consider pet microchipping services available citywide."
  }
];

// Popular Austin landmarks and points of interest for local SEO
export const austinLandmarks = [
  { name: 'State Capitol', neighborhood: 'Downtown', type: 'Government' },
  { name: 'Zilker Park', neighborhood: 'Zilker', type: 'Recreation' },
  { name: 'Lady Bird Lake', neighborhood: 'Downtown', type: 'Recreation' },
  { name: 'South by Southwest (SXSW)', neighborhood: 'Downtown', type: 'Event' },
  { name: 'Austin City Limits Festival', neighborhood: 'Zilker', type: 'Event' },
  { name: 'University of Texas', neighborhood: 'UT Campus', type: 'Education' },
  { name: 'Barton Springs Pool', neighborhood: 'Zilker', type: 'Recreation' },
  { name: 'Franklin Barbecue', neighborhood: 'East Austin', type: 'Dining' },
  { name: 'The Domain', neighborhood: 'North Austin', type: 'Shopping' },
  { name: 'Rainey Street', neighborhood: 'Downtown', type: 'Entertainment' }
];

// Austin school districts for family relocation SEO
export const austinSchoolDistricts = [
  {
    name: 'Austin ISD',
    rating: '7/10',
    highlights: ['Diverse programs', 'Multiple language immersion', 'STEM focus'],
    topSchools: ['Liberal Arts & Science Academy', 'Ann Richards School'],
    areas: ['Central Austin', 'East Austin', 'South Austin']
  },
  {
    name: 'Eanes ISD',
    rating: '10/10',
    highlights: ['Top academic performance', 'Low student-teacher ratio', 'High graduation rates'],
    topSchools: ['Westlake High School', 'West Ridge Middle School'],
    areas: ['Westlake', 'West Lake Hills']
  },
  {
    name: 'Leander ISD',
    rating: '9/10',
    highlights: ['Rapid growth', 'New facilities', 'Technology integration'],
    topSchools: ['Vandegrift High School', 'Four Points Middle School'],
    areas: ['Cedar Park', 'Leander', 'Northwest Austin']
  },
  {
    name: 'Round Rock ISD',
    rating: '8/10',
    highlights: ['STEM programs', 'Career readiness', 'Dual credit options'],
    topSchools: ['Round Rock High School', 'Stony Point High School'],
    areas: ['Round Rock', 'Pflugerville', 'North Austin']
  }
];

// Austin job market data for relocation decisions
export const austinJobMarket = {
  topIndustries: [
    { name: 'Technology', growth: '+8.5%', averageSalary: '$89,000' },
    { name: 'Healthcare', growth: '+6.2%', averageSalary: '$67,000' },
    { name: 'Government', growth: '+3.1%', averageSalary: '$55,000' },
    { name: 'Education', growth: '+4.8%', averageSalary: '$48,000' },
    { name: 'Finance', growth: '+5.7%', averageSalary: '$71,000' }
  ],
  majorEmployers: [
    'Apple', 'Google', 'Tesla', 'Meta', 'AMD', 'IBM', 'Dell Technologies',
    'University of Texas', 'Austin-Travis County', 'H-E-B', 'Whole Foods'
  ],
  unemployment: '3.2%',
  medianHouseholdIncome: '$73,800'
};

// Austin transportation options for newcomers
export const austinTransportation = {
  publicTransit: {
    provider: 'Capital Metro',
    website: 'capmetro.org',
    services: [
      { name: 'MetroRail', description: 'Red Line connects downtown to Cedar Park/Leander' },
      { name: 'MetroBus', description: 'Extensive bus network throughout Austin' },
      { name: 'MetroRapid', description: 'Bus rapid transit on major corridors' }
    ],
    monthlyPass: '$41.25'
  },
  rideshare: {
    services: ['Uber', 'Lyft', 'Austin Pedicabs'],
    averageCost: '$8-15 for typical Austin trip'
  },
  biking: {
    bikeScore: '4.5/5',
    features: ['200+ miles of bike lanes', 'B-Cycle bike share', 'Veloway recreational trail'],
    popular: ['Lady Bird Lake Trail', 'Shoal Creek Trail', 'Walnut Creek Trail']
  },
  airports: {
    primary: 'Austin-Bergstrom International (AUS)',
    distance: '8 miles southeast of downtown',
    airlines: ['American', 'Delta', 'Southwest', 'United', 'JetBlue']
  }
};

// Generate Austin-specific SEO keywords based on user intent
export function generateAustinSEOKeywords(intent: 'moving' | 'neighborhood' | 'cost' | 'schools'): string[] {
  const baseKeywords = ['Austin Texas', 'Austin TX', 'moving to Austin'];

  switch (intent) {
    case 'moving':
      return [
        ...baseKeywords,
        'Austin moving services', 'best movers Austin', 'Austin relocation guide',
        'moving companies Austin TX', 'local movers Austin', 'Austin moving tips',
        'professional movers Austin', 'residential moving Austin'
      ];
    case 'neighborhood':
      return [
        ...baseKeywords,
        'best Austin neighborhoods', 'Austin areas to live', 'family friendly Austin',
        'affordable Austin neighborhoods', 'luxury Austin areas', 'Austin suburbs',
        'downtown Austin living', 'East Austin neighborhoods', 'South Austin areas'
      ];
    case 'cost':
      return [
        ...baseKeywords,
        'cost of living Austin', 'Austin housing costs', 'Austin rent prices',
        'moving costs to Austin', 'Austin salary requirements', 'Austin home prices',
        'affordable living Austin', 'Austin cost comparison'
      ];
    case 'schools':
      return [
        ...baseKeywords,
        'best schools Austin', 'Austin school districts', 'family moving Austin',
        'top rated schools Austin TX', 'Austin education', 'school ratings Austin',
        'elementary schools Austin', 'high schools Austin'
      ];
    default:
      return baseKeywords;
  }
}

// Format Austin phone numbers for local business schema
export function formatAustinPhoneNumber(phone: string): string {
  // Ensure Austin area code if not provided
  if (!phone.includes('512') && !phone.includes('737')) {
    return `+1-512-${phone}`;
  }
  return phone.startsWith('+1') ? phone : `+1-${phone}`;
}

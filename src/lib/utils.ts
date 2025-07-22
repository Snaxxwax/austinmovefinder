import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Austin neighborhoods data
export const austinNeighborhoods = [
  {
    name: "Downtown Austin",
    slug: "downtown",
    description: "The heart of the city with high-rise living and urban amenities",
    averageRent: "$2,200",
    walkScore: 88,
    features: ["Public transportation", "Nightlife", "Business district", "Entertainment"],
  },
  {
    name: "South Austin (SoCo)",
    slug: "south-austin",
    description: "Eclectic neighborhood known for 'Keep Austin Weird' culture",
    averageRent: "$1,800",
    walkScore: 75,
    features: ["Food trucks", "Live music", "Vintage shops", "Zilker Park"],
  },
  {
    name: "East Austin",
    slug: "east-austin",
    description: "Hip area with creative scene and diverse dining",
    averageRent: "$1,900",
    walkScore: 70,
    features: ["Art galleries", "Breweries", "Food scene", "Music venues"],
  },
  {
    name: "West Lake Hills",
    slug: "west-lake-hills",
    description: "Upscale suburban community with lake access",
    averageRent: "$3,500",
    walkScore: 45,
    features: ["Lake Austin", "Luxury homes", "Top schools", "Hill Country views"],
  },
  {
    name: "North Austin",
    slug: "north-austin",
    description: "Family-friendly area with affordable housing options",
    averageRent: "$1,600",
    walkScore: 55,
    features: ["Family-oriented", "Affordable", "Good schools", "Parks"],
  },
  {
    name: "Cedar Park",
    slug: "cedar-park",
    description: "Suburban community north of Austin with family amenities",
    averageRent: "$1,700",
    walkScore: 40,
    features: ["Family-friendly", "New developments", "Recreation", "Shopping"],
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

// Austin-specific moving tips
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
  }
];

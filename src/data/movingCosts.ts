// Moving cost data for detected household items
export interface MovingItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'electronics' | 'personal' | 'fragile';
  baseCost: number; // Base cost in dollars
  weight: number; // Estimated weight in lbs
  volume: number; // Volume in cubic feet
  difficulty: 'easy' | 'medium' | 'hard' | 'specialty';
  specialHandling: boolean;
  description: string;
  tips?: string;
}

export const movingItemCatalog: Record<string, MovingItem> = {
  // Furniture
  'chair': {
    id: 'chair',
    name: 'Chair',
    category: 'furniture',
    baseCost: 25,
    weight: 20,
    volume: 8,
    difficulty: 'easy',
    specialHandling: false,
    description: 'Standard dining or office chair',
    tips: 'Can be stacked for efficient transport'
  },
  'couch': {
    id: 'couch',
    name: 'Couch/Sofa',
    category: 'furniture',
    baseCost: 150,
    weight: 150,
    volume: 50,
    difficulty: 'hard',
    specialHandling: false,
    description: 'Large seating furniture',
    tips: 'May need disassembly for tight spaces'
  },
  'bed': {
    id: 'bed',
    name: 'Bed',
    category: 'furniture',
    baseCost: 100,
    weight: 100,
    volume: 40,
    difficulty: 'medium',
    specialHandling: false,
    description: 'Bed frame and mattress',
    tips: 'Frame disassembly usually required'
  },
  'dining table': {
    id: 'dining_table',
    name: 'Dining Table',
    category: 'furniture',
    baseCost: 80,
    weight: 80,
    volume: 30,
    difficulty: 'medium',
    specialHandling: false,
    description: 'Dining room table',
    tips: 'Legs may need removal for transport'
  },

  // Appliances
  'refrigerator': {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'appliances',
    baseCost: 200,
    weight: 250,
    volume: 45,
    difficulty: 'specialty',
    specialHandling: true,
    description: 'Full-size refrigerator',
    tips: 'Requires appliance dolly and 2+ movers'
  },
  'microwave': {
    id: 'microwave',
    name: 'Microwave',
    category: 'appliances',
    baseCost: 40,
    weight: 40,
    volume: 6,
    difficulty: 'easy',
    specialHandling: false,
    description: 'Countertop microwave oven'
  },
  'oven': {
    id: 'oven',
    name: 'Oven/Stove',
    category: 'appliances',
    baseCost: 180,
    weight: 200,
    volume: 35,
    difficulty: 'specialty',
    specialHandling: true,
    description: 'Kitchen range or oven',
    tips: 'Gas connections require professional disconnection'
  },
  'toaster': {
    id: 'toaster',
    name: 'Toaster',
    category: 'appliances',
    baseCost: 15,
    weight: 8,
    volume: 2,
    difficulty: 'easy',
    specialHandling: false,
    description: 'Small kitchen appliance'
  },

  // Electronics
  'tv': {
    id: 'tv',
    name: 'Television',
    category: 'electronics',
    baseCost: 75,
    weight: 35,
    volume: 15,
    difficulty: 'medium',
    specialHandling: true,
    description: 'Flat screen TV',
    tips: 'Original box preferred, special TV moving kit recommended'
  },
  'laptop': {
    id: 'laptop',
    name: 'Laptop',
    category: 'electronics',
    baseCost: 20,
    weight: 5,
    volume: 1,
    difficulty: 'easy',
    specialHandling: true,
    description: 'Portable computer',
    tips: 'Pack in original case or padded box'
  },

  // Personal Items
  'suitcase': {
    id: 'suitcase',
    name: 'Suitcase',
    category: 'personal',
    baseCost: 25,
    weight: 15,
    volume: 8,
    difficulty: 'easy',
    specialHandling: false,
    description: 'Travel luggage'
  },
  'book': {
    id: 'book',
    name: 'Books (per box)',
    category: 'personal',
    baseCost: 30,
    weight: 40,
    volume: 4,
    difficulty: 'easy',
    specialHandling: false,
    description: 'Box of books',
    tips: 'Use small boxes to avoid overweight'
  },

  // Fragile Items
  'vase': {
    id: 'vase',
    name: 'Vase/Decorative Item',
    category: 'fragile',
    baseCost: 35,
    weight: 3,
    volume: 2,
    difficulty: 'medium',
    specialHandling: true,
    description: 'Fragile decorative items',
    tips: 'Requires bubble wrap and dish pack boxes'
  },
  'wine glass': {
    id: 'wine_glass',
    name: 'Glassware (per set)',
    category: 'fragile',
    baseCost: 40,
    weight: 10,
    volume: 4,
    difficulty: 'medium',
    specialHandling: true,
    description: 'Drinking glasses and stemware',
    tips: 'Use divider boxes and extra padding'
  },

  // Bathroom
  'toilet': {
    id: 'toilet',
    name: 'Toilet',
    category: 'appliances',
    baseCost: 120,
    weight: 100,
    volume: 20,
    difficulty: 'specialty',
    specialHandling: true,
    description: 'Bathroom toilet fixture',
    tips: 'Requires plumbing disconnection'
  },

  // Kitchen Items
  'sink': {
    id: 'sink',
    name: 'Kitchen Sink',
    category: 'appliances',
    baseCost: 100,
    weight: 50,
    volume: 15,
    difficulty: 'specialty',
    specialHandling: true,
    description: 'Kitchen sink fixture',
    tips: 'Plumbing disconnection required'
  },

  // Default/Generic Items
  'potted plant': {
    id: 'potted_plant',
    name: 'Potted Plant',
    category: 'fragile',
    baseCost: 30,
    weight: 15,
    volume: 5,
    difficulty: 'medium',
    specialHandling: true,
    description: 'Indoor plant in container',
    tips: 'May not survive long moves, consider giving away'
  }
};

// Austin-specific pricing multipliers
export const austinPricingFactors = {
  baseLaborRate: 120, // per hour per mover
  truckRate: 1.2, // per mile
  localMoveMultiplier: 1.0,
  longDistanceMultiplier: 1.5,
  specialtyMultiplier: 1.8,
  
  // Austin area surcharges
  downtownSurcharge: 25, // High-rise buildings, parking challenges
  hillCountrySurcharge: 15, // Difficult terrain access
  
  // Seasonal multipliers (Austin moving season)
  peakSeasonMultiplier: 1.3, // May-September (hot weather, UT students)
  offSeasonMultiplier: 0.9   // October-April
};

export function calculateItemCost(
  itemId: string, 
  quantity: number = 1,
  moveDistance: number = 10, // miles
  isSpecialtyMove: boolean = false
): number {
  const item = movingItemCatalog[itemId];
  if (!item) return 0;

  let baseCost = item.baseCost * quantity;
  
  // Apply difficulty multiplier
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 1.3,
    hard: 1.6,
    specialty: 2.0
  };
  
  baseCost *= difficultyMultipliers[item.difficulty];
  
  // Apply special handling surcharge
  if (item.specialHandling) {
    baseCost *= 1.4;
  }
  
  // Apply specialty move multiplier
  if (isSpecialtyMove) {
    baseCost *= austinPricingFactors.specialtyMultiplier;
  }
  
  // Distance factor (for local moves)
  if (moveDistance > 20) {
    baseCost *= 1.2;
  }
  
  return Math.round(baseCost);
}

export function getItemByLabel(label: string): MovingItem | undefined {
  // Handle label variations and mappings
  const labelMappings: Record<string, string> = {
    'dining table': 'dining_table',
    'wine glass': 'wine_glass',
    'potted plant': 'potted_plant',
    'cell phone': 'laptop', // Group with electronics
    'remote': 'electronics', // Generic electronics
    'keyboard': 'laptop',
    'mouse': 'laptop'
  };
  
  const mappedLabel = labelMappings[label.toLowerCase()] || label.toLowerCase();
  return movingItemCatalog[mappedLabel];
}
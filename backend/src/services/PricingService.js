import database from '../database/connection.js';

// Austin-specific moving item catalog with cost estimates
export const movingItemCatalog = {
  // Living Room
  'couch': { category: 'furniture', basePrice: 85, difficulty: 'medium', weight: 'heavy' },
  'sofa': { category: 'furniture', basePrice: 85, difficulty: 'medium', weight: 'heavy' },
  'chair': { category: 'furniture', basePrice: 25, difficulty: 'easy', weight: 'light' },
  'dining table': { category: 'furniture', basePrice: 65, difficulty: 'medium', weight: 'heavy' },
  'coffee table': { category: 'furniture', basePrice: 35, difficulty: 'easy', weight: 'medium' },
  'tv': { category: 'electronics', basePrice: 45, difficulty: 'medium', weight: 'medium' },
  'entertainment center': { category: 'furniture', basePrice: 75, difficulty: 'hard', weight: 'heavy' },
  'bookshelf': { category: 'furniture', basePrice: 55, difficulty: 'medium', weight: 'heavy' },
  'lamp': { category: 'decor', basePrice: 15, difficulty: 'easy', weight: 'light' },

  // Bedroom
  'bed': { category: 'furniture', basePrice: 95, difficulty: 'medium', weight: 'heavy' },
  'mattress': { category: 'furniture', basePrice: 65, difficulty: 'medium', weight: 'medium' },
  'dresser': { category: 'furniture', basePrice: 75, difficulty: 'medium', weight: 'heavy' },
  'nightstand': { category: 'furniture', basePrice: 35, difficulty: 'easy', weight: 'medium' },
  'wardrobe': { category: 'furniture', basePrice: 125, difficulty: 'hard', weight: 'heavy' },
  'mirror': { category: 'decor', basePrice: 25, difficulty: 'medium', weight: 'light' },

  // Kitchen & Appliances
  'refrigerator': { category: 'appliances', basePrice: 150, difficulty: 'hard', weight: 'heavy' },
  'washing machine': { category: 'appliances', basePrice: 135, difficulty: 'hard', weight: 'heavy' },
  'dryer': { category: 'appliances', basePrice: 125, difficulty: 'hard', weight: 'heavy' },
  'dishwasher': { category: 'appliances', basePrice: 115, difficulty: 'hard', weight: 'heavy' },
  'microwave': { category: 'appliances', basePrice: 35, difficulty: 'easy', weight: 'medium' },
  'oven': { category: 'appliances', basePrice: 165, difficulty: 'hard', weight: 'heavy' },
  'stove': { category: 'appliances', basePrice: 145, difficulty: 'hard', weight: 'heavy' },
  'kitchen island': { category: 'furniture', basePrice: 95, difficulty: 'hard', weight: 'heavy' },

  // Office & Storage
  'desk': { category: 'furniture', basePrice: 55, difficulty: 'medium', weight: 'medium' },
  'office chair': { category: 'furniture', basePrice: 35, difficulty: 'easy', weight: 'light' },
  'filing cabinet': { category: 'furniture', basePrice: 45, difficulty: 'medium', weight: 'heavy' },
  'bookcase': { category: 'furniture', basePrice: 65, difficulty: 'medium', weight: 'heavy' },
  'cabinet': { category: 'furniture', basePrice: 55, difficulty: 'medium', weight: 'medium' },
  'shelf': { category: 'furniture', basePrice: 25, difficulty: 'easy', weight: 'light' },

  // Specialty Items (Austin-specific considerations)
  'piano': { category: 'specialty', basePrice: 450, difficulty: 'expert', weight: 'extreme' },
  'pool table': { category: 'specialty', basePrice: 325, difficulty: 'expert', weight: 'extreme' },
  'hot tub': { category: 'specialty', basePrice: 850, difficulty: 'expert', weight: 'extreme' },
  'safe': { category: 'specialty', basePrice: 275, difficulty: 'expert', weight: 'extreme' },
  'artwork': { category: 'specialty', basePrice: 65, difficulty: 'medium', weight: 'light' },
  'antique': { category: 'specialty', basePrice: 85, difficulty: 'hard', weight: 'medium' },

  // Outdoor & Austin Climate Items
  'outdoor furniture': { category: 'furniture', basePrice: 45, difficulty: 'medium', weight: 'medium' },
  'patio set': { category: 'furniture', basePrice: 75, difficulty: 'medium', weight: 'heavy' },
  'grill': { category: 'appliances', basePrice: 55, difficulty: 'medium', weight: 'medium' },
  'fire pit': { category: 'outdoor', basePrice: 65, difficulty: 'medium', weight: 'heavy' },
  'lawn mower': { category: 'tools', basePrice: 45, difficulty: 'medium', weight: 'medium' },
  'gardening tools': { category: 'tools', basePrice: 25, difficulty: 'easy', weight: 'light' },

  // Boxes and General Items
  'box': { category: 'boxes', basePrice: 8, difficulty: 'easy', weight: 'light' },
  'small box': { category: 'boxes', basePrice: 5, difficulty: 'easy', weight: 'light' },
  'large box': { category: 'boxes', basePrice: 12, difficulty: 'easy', weight: 'medium' },
  'wardrobe box': { category: 'boxes', basePrice: 15, difficulty: 'easy', weight: 'medium' },
  'moving box': { category: 'boxes', basePrice: 8, difficulty: 'easy', weight: 'light' },

  // Generic fallbacks
  'furniture': { category: 'furniture', basePrice: 65, difficulty: 'medium', weight: 'medium' },
  'item': { category: 'general', basePrice: 25, difficulty: 'easy', weight: 'light' },
  'object': { category: 'general', basePrice: 25, difficulty: 'easy', weight: 'light' }
};

// Austin moving base rates (per hour for local moves)
export const austinMovingRates = {
  baseHourlyRate: 120, // 2-person crew
  additionalMoverRate: 45, // per additional mover per hour
  truckRates: {
    'local': 0, // included in hourly rate
    'long-distance': 1.45, // per mile
    'commercial': 1.65 // per mile
  },
  minimumHours: {
    'local': 2,
    'long-distance': 4,
    'commercial': 3,
    'storage': 1
  }
};

// Calculate cost for a single detected item
export function calculateItemCost(itemLabel, quantity = 1, distance = 15, isSpecialtyMove = false) {
  const normalizedLabel = itemLabel.toLowerCase().trim();

  // Find the item in catalog (try exact match first, then partial matches)
  let itemInfo = movingItemCatalog[normalizedLabel];

  if (!itemInfo) {
    // Try partial matches for common variations
    const partialMatches = Object.keys(movingItemCatalog).filter(key =>
      key.includes(normalizedLabel) || normalizedLabel.includes(key)
    );

    if (partialMatches.length > 0) {
      itemInfo = movingItemCatalog[partialMatches[0]];
    } else {
      // Fallback to generic item
      itemInfo = movingItemCatalog['item'];
    }
  }

  let baseCost = itemInfo.basePrice * quantity;

  // Apply difficulty multipliers
  const difficultyMultipliers = {
    'easy': 1.0,
    'medium': 1.2,
    'hard': 1.5,
    'expert': 2.0
  };

  baseCost *= difficultyMultipliers[itemInfo.difficulty] || 1.0;

  // Apply weight multipliers
  const weightMultipliers = {
    'light': 1.0,
    'medium': 1.1,
    'heavy': 1.3,
    'extreme': 1.8
  };

  baseCost *= weightMultipliers[itemInfo.weight] || 1.0;

  // Apply distance multiplier for long-distance moves
  if (distance > 50) {
    baseCost *= 1.4;
  }

  // Apply specialty move multiplier
  if (isSpecialtyMove) {
    baseCost *= 1.25;
  }

  // Apply Austin-specific considerations
  if (itemInfo.category === 'specialty') {
    baseCost *= 1.15; // Austin specialty item handling
  }

  return Math.round(baseCost);
}

// Calculate total quote cost based on move details and detected items
export function calculateTotalQuote(quoteDetails, detectedItems = []) {
  const {
    estimated_size,
    move_type,
    move_date,
    from_address = '',
    to_address = ''
  } = quoteDetails;

  let totalCost = 0;
  let isLongDistance = move_type === 'long-distance';
  let isCommercial = move_type === 'commercial';
  let distance = isLongDistance ? 500 : 15; // Default distances

  // Calculate cost from detected items
  if (detectedItems && detectedItems.length > 0) {
    for (const item of detectedItems) {
      const itemCost = calculateItemCost(
        item.item_label || item.label,
        item.quantity || 1,
        distance,
        isCommercial
      );
      totalCost += itemCost;
    }
  } else {
    // Use base pricing when no items detected
    const basePricing = {
      'studio': 450,
      '1br': 650,
      '2br': 950,
      '3br': 1350,
      '4br+': 1850,
      'commercial': 2500
    };

    totalCost = basePricing[estimated_size] || 800;
  }

  // Apply base move costs (travel, truck, crew setup)
  const baseMoveSetup = {
    'local': 150,
    'long-distance': 350,
    'commercial': 275,
    'storage': 100
  };

  totalCost += baseMoveSetup[move_type] || 150;

  // Apply Austin-specific neighborhood multipliers
  totalCost = applyLocationMultipliers(totalCost, from_address, to_address);

  // Apply seasonal and timing multipliers
  totalCost = applySeasonalMultipliers(totalCost, move_date);

  return Math.round(totalCost);
}

// Apply Austin neighborhood-specific pricing
function applyLocationMultipliers(baseCost, fromAddress, toAddress) {
  let adjustedCost = baseCost;

  const downtownKeywords = ['downtown', 'congress', 'sixth street', '6th street', 'rainey'];
  const difficultAreas = ['westlake', 'tarrytown', 'rollingwood'];
  const easyAccess = ['pflugerville', 'round rock', 'cedar park'];

  const addressText = `${fromAddress} ${toAddress}`.toLowerCase();

  // Downtown Austin premium (parking, traffic, permits)
  if (downtownKeywords.some(keyword => addressText.includes(keyword))) {
    adjustedCost *= 1.25;
    adjustedCost += 85; // Parking/permit fees
  }

  // Difficult access areas (narrow streets, hills, gated communities)
  if (difficultAreas.some(area => addressText.includes(area))) {
    adjustedCost *= 1.15;
  }

  // Easier suburban access
  if (easyAccess.some(area => addressText.includes(area))) {
    adjustedCost *= 0.95;
  }

  // Highway access premium for long-distance
  if (addressText.includes('i-35') || addressText.includes('mopac') || addressText.includes('183')) {
    adjustedCost *= 1.05;
  }

  return adjustedCost;
}

// Apply seasonal and timing multipliers
function applySeasonalMultipliers(baseCost, moveDate) {
  if (!moveDate) return baseCost;

  const date = new Date(moveDate);
  const month = date.getMonth() + 1; // 1-12
  const dayOfWeek = date.getDay(); // 0 = Sunday

  let adjustedCost = baseCost;

  // Peak season in Austin (May-August: UT students, summer moves)
  if (month >= 5 && month <= 8) {
    adjustedCost *= 1.25;
  }

  // Spring season (March-April: moderate premium)
  if (month >= 3 && month <= 4) {
    adjustedCost *= 1.15;
  }

  // Fall season (September-October: moderate premium)
  if (month >= 9 && month <= 10) {
    adjustedCost *= 1.1;
  }

  // Weekend premium
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    adjustedCost *= 1.15;
  }

  // Month-end premium (common moving time)
  if (date.getDate() >= 28) {
    adjustedCost *= 1.1;
  }

  return adjustedCost;
}

// Get pricing breakdown for transparency
export function getPricingBreakdown(quoteDetails, detectedItems = []) {
  const breakdown = {
    items: [],
    baseCosts: {},
    multipliers: {},
    total: 0
  };

  // Calculate item costs
  if (detectedItems && detectedItems.length > 0) {
    breakdown.items = detectedItems.map(item => {
      const cost = calculateItemCost(
        item.item_label || item.label,
        item.quantity || 1,
        15,
        quoteDetails.move_type === 'commercial'
      );
      return {
        label: item.item_label || item.label,
        quantity: item.quantity || 1,
        cost
      };
    });
  }

  // Base setup costs
  const baseMoveSetup = {
    'local': 150,
    'long-distance': 350,
    'commercial': 275,
    'storage': 100
  };

  breakdown.baseCosts.setup = baseMoveSetup[quoteDetails.move_type] || 150;
  breakdown.baseCosts.itemsTotal = breakdown.items.reduce((sum, item) => sum + item.cost, 0);

  // Location adjustments
  const addressText = `${quoteDetails.from_address || ''} ${quoteDetails.to_address || ''}`.toLowerCase();
  breakdown.multipliers.location = 1.0;

  if (addressText.includes('downtown')) {
    breakdown.multipliers.location = 1.25;
    breakdown.baseCosts.parking = 85;
  }

  // Seasonal adjustments
  breakdown.multipliers.seasonal = 1.0;
  if (quoteDetails.move_date) {
    const month = new Date(quoteDetails.move_date).getMonth() + 1;
    if (month >= 5 && month <= 8) {
      breakdown.multipliers.seasonal = 1.25;
    }
  }

  // Calculate total
  const subtotal = breakdown.baseCosts.setup + breakdown.baseCosts.itemsTotal + (breakdown.baseCosts.parking || 0);
  breakdown.total = Math.round(subtotal * breakdown.multipliers.location * breakdown.multipliers.seasonal);

  return breakdown;
}

// Austin-specific moving tips based on detected items
export function getAustinMovingTips(detectedItems = []) {
  const tips = [];
  const itemLabels = detectedItems.map(item => (item.item_label || item.label || '').toLowerCase());

  // General Austin tips
  tips.push("🌡️ Austin heat: Schedule early morning moves in summer to avoid 100°F+ temperatures");
  tips.push("🚦 Traffic: Avoid I-35 and MoPac during rush hours (7-9 AM, 4-7 PM)");
  tips.push("🅿️ Parking: Downtown moves may require permit - we'll handle this for you");

  // Item-specific tips
  if (itemLabels.some(label => ['piano', 'pool table'].includes(label))) {
    tips.push("🎹 Specialty items: Our expert team has experience with Austin's music scene equipment");
  }

  if (itemLabels.some(label => ['refrigerator', 'washing machine', 'dryer'].includes(label))) {
    tips.push("⚡ Appliances: We'll disconnect/reconnect with Austin's electrical standards");
  }

  if (itemLabels.some(label => ['outdoor furniture', 'grill', 'patio'].includes(label))) {
    tips.push("🌳 Outdoor items: Perfect for Austin's year-round outdoor lifestyle!");
  }

  if (itemLabels.some(label => ['artwork', 'antique'].includes(label))) {
    tips.push("🎨 Valuables: Austin's art scene appreciates proper handling - we use museum-quality packing");
  }

  return tips;
}

// Estimate move duration based on items and distance
export function estimateMoveDuration(detectedItems = [], distance = 15, moveType = 'local') {
  let baseHours = austinMovingRates.minimumHours[moveType] || 2;

  // Add time based on items
  const itemCount = detectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const additionalHours = Math.ceil(itemCount / 15); // Roughly 15 items per hour

  // Add time for specialty items
  const specialtyItems = detectedItems.filter(item => {
    const label = (item.item_label || item.label || '').toLowerCase();
    return ['piano', 'pool table', 'safe', 'hot tub'].includes(label);
  });

  const specialtyTime = specialtyItems.length * 0.5; // 30 minutes per specialty item

  // Add travel time for long-distance
  let travelTime = 0;
  if (moveType === 'long-distance') {
    travelTime = Math.ceil(distance / 45) * 2; // Round trip at 45 mph average
  }

  const totalHours = baseHours + additionalHours + specialtyTime + travelTime;

  return {
    estimatedHours: Math.max(totalHours, baseHours),
    breakdown: {
      base: baseHours,
      items: additionalHours,
      specialty: specialtyTime,
      travel: travelTime
    }
  };
}
import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Plus, Calculator, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DetectedObject } from '../services/objectDetection';
import { MovingItem, calculateItemCost, getItemByLabel, austinPricingFactors } from '../data/movingCosts';

interface QuoteItem {
  id: string;
  label: string;
  quantity: number;
  confidence: number;
  cost: number;
  item: MovingItem;
  isCustom?: boolean;
}

interface ItemizedQuoteProps {
  detectedObjects: DetectedObject[];
  moveDistance: number;
  isSpecialtyMove: boolean;
  onQuoteUpdate: (totalCost: number) => void;
  className?: string;
}

export const ItemizedQuote: React.FC<ItemizedQuoteProps> = ({
  detectedObjects,
  moveDistance,
  isSpecialtyMove,
  onQuoteUpdate,
  className = ''
}) => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  // const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [customItemName, setCustomItemName] = useState('');

  // Convert detected objects to quote items
  useEffect(() => {
    const items = detectedObjects
      .map((obj, index) => {
        const item = getItemByLabel(obj.label);
        if (!item) return null;

        const cost = calculateItemCost(item.id, 1, moveDistance, isSpecialtyMove);
        
        return {
          id: `${item.id}_${index}`,
          label: obj.label,
          quantity: 1,
          confidence: obj.score,
          cost,
          item
        };
      })
      .filter((item): item is QuoteItem => item !== null);

    // Group similar items
    const groupedItems = groupSimilarItems(items);
    setQuoteItems(groupedItems);
  }, [detectedObjects, moveDistance, isSpecialtyMove]);

  // Update parent component when quote changes
  useEffect(() => {
    const totalCost = calculateTotalCost();
    onQuoteUpdate(totalCost);
  }, [quoteItems, onQuoteUpdate]);

  const groupSimilarItems = (items: QuoteItem[]): QuoteItem[] => {
    const grouped = new Map<string, QuoteItem>();

    items.forEach(item => {
      const key = item.item.id;
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.quantity += 1;
        existing.cost = calculateItemCost(item.item.id, existing.quantity, moveDistance, isSpecialtyMove);
        existing.confidence = Math.max(existing.confidence, item.confidence);
      } else {
        grouped.set(key, { ...item });
      }
    });

    return Array.from(grouped.values());
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 0) return;

    setQuoteItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newCost = calculateItemCost(item.item.id, quantity, moveDistance, isSpecialtyMove);
          return { ...item, quantity, cost: newCost };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setQuoteItems(items => items.filter(item => item.id !== itemId));
  };

  const addCustomItem = () => {
    if (!customItemName.trim()) return;

    // Create a generic custom item
    const customItem: MovingItem = {
      id: `custom_${Date.now()}`,
      name: customItemName,
      category: 'personal',
      baseCost: 30,
      weight: 20,
      volume: 5,
      difficulty: 'medium',
      specialHandling: false,
      description: 'Custom item added by user'
    };

    const cost = calculateItemCost(customItem.id, 1, moveDistance, isSpecialtyMove);

    const quoteItem: QuoteItem = {
      id: customItem.id,
      label: customItemName,
      quantity: 1,
      confidence: 1.0,
      cost,
      item: customItem,
      isCustom: true
    };

    setQuoteItems(items => [...items, quoteItem]);
    setCustomItemName('');
    setShowAddItem(false);
  };

  const calculateTotalCost = (): number => {
    const itemsTotal = quoteItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Add base service costs
    const laborCost = Math.ceil(itemsTotal / 100) * austinPricingFactors.baseLaborRate / 2; // Rough estimate
    const truckCost = moveDistance * austinPricingFactors.truckRate;
    
    return Math.round(itemsTotal + laborCost + truckCost);
  };

  const getCategoryIcon = (category: MovingItem['category']) => {
    switch (category) {
      case 'furniture': return '🪑';
      case 'appliances': return '🏠';
      case 'electronics': return '📱';
      case 'fragile': return '🌸';
      case 'personal': return '👜';
      default: return '📦';
    }
  };

  const getDifficultyColor = (difficulty: MovingItem['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'specialty': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (quoteItems.length === 0) {
    return (
      <div className={`austin-card p-8 text-center ${className}`}>
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Add Your Items</h3>
        <p className="text-gray-600 mb-4">
          Upload photos above for AI detection, or add items manually to get started
        </p>
        <button
          onClick={() => setShowAddItem(true)}
          className="bg-austin-blue text-white px-4 py-2 rounded-lg hover:bg-austin-teal transition-colors"
        >
          <Plus className="inline h-4 w-4 mr-2" />
          Add Your First Item
        </button>
      </div>
    );
  }

  return (
    <div className={`austin-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-austin-blue mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Your Moving Quote</h3>
        </div>
        <button
          onClick={() => setShowAddItem(true)}
          className="flex items-center bg-austin-blue text-white px-3 py-2 rounded-lg hover:bg-austin-teal transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4 mb-6">
        {quoteItems.map((quoteItem) => (
          <div key={quoteItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getCategoryIcon(quoteItem.item.category)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {quoteItem.item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quoteItem.item.difficulty)}`}>
                        {quoteItem.item.difficulty}
                      </span>
                      {!quoteItem.isCustom && (
                        <div className="flex items-center">
                          {quoteItem.confidence > 0.8 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="ml-1">
                            {Math.round(quoteItem.confidence * 100)}% confident
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">{quoteItem.item.description}</p>
                
                {quoteItem.item.tips && (
                  <p className="text-xs text-austin-blue bg-austin-blue/10 rounded p-2">
                    💡 {quoteItem.item.tips}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateItemQuantity(quoteItem.id, quoteItem.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    disabled={quoteItem.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{quoteItem.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(quoteItem.id, quoteItem.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                  >
                    +
                  </button>
                </div>

                {/* Cost */}
                <div className="text-right min-w-[80px]">
                  <div className="font-bold text-austin-blue text-lg">
                    ${quoteItem.cost}
                  </div>
                  {quoteItem.quantity > 1 && (
                    <div className="text-xs text-gray-500">
                      ${Math.round(quoteItem.cost / quoteItem.quantity)} each
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => {/* TODO: Implement edit functionality */}}
                    className="p-2 text-gray-400 hover:text-austin-blue transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(quoteItem.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item Modal */}
      {showAddItem && (
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Enter item name..."
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
            />
            <button
              onClick={addCustomItem}
              className="bg-austin-blue text-white px-4 py-2 rounded-lg hover:bg-austin-teal transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddItem(false);
                setCustomItemName('');
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quote Summary */}
      <div className="border-t pt-4">
        <div className="bg-gradient-to-r from-austin-blue/5 to-austin-green/5 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">Total Estimated Cost:</span>
            <span className="text-3xl font-bold text-austin-blue">
              ${calculateTotalCost().toLocaleString()}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2 mb-4">
            <div className="flex justify-between py-1">
              <span>Items & Packing:</span>
              <span className="font-medium">${quoteItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Labor & Service:</span>
              <span className="font-medium">${Math.ceil(quoteItems.reduce((sum, item) => sum + item.cost, 0) / 100) * austinPricingFactors.baseLaborRate / 2}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-200 pt-2">
              <span>Transportation ({moveDistance} miles):</span>
              <span className="font-medium">${Math.round(moveDistance * austinPricingFactors.truckRate)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">✅ What's Included:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Professional moving team</div>
              <div>• All moving equipment & supplies</div>
              <div>• Basic furniture protection</div>
              <div>• Loading, transport & unloading</div>
              <div>• Austin area expertise</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            💡 <strong>Edit items above</strong> if we missed anything or got quantities wrong.<br/>
            Final pricing confirmed after phone consultation.
          </div>
        </div>
      </div>
    </div>
  );
};
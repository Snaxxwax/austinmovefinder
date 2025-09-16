import database from '../database/connection.js';
import { movingItemCatalog, calculateItemCost } from '../services/PricingService.js';

export class Quote {
    constructor(data = {}) {
        this.id = data.id;
        this.customer_id = data.customer_id;
        this.move_type = data.move_type;
        this.move_date = data.move_date;
        this.from_address = data.from_address;
        this.to_address = data.to_address;
        this.estimated_size = data.estimated_size;
        this.special_items = data.special_items;
        this.notes = data.notes;
        this.status = data.status || 'pending';
        this.estimated_cost = data.estimated_cost;
        this.final_cost = data.final_cost;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findById(id) {
        const row = await database.get(
            'SELECT * FROM quotes WHERE id = ?',
            [id]
        );
        return row ? new Quote(row) : null;
    }

    static async findByCustomerId(customerId) {
        const rows = await database.all(
            'SELECT * FROM quotes WHERE customer_id = ? ORDER BY created_at DESC',
            [customerId]
        );
        return rows.map(row => new Quote(row));
    }

    static async create(quoteData) {
        const {
            customer_id,
            move_type,
            move_date,
            from_address,
            to_address,
            estimated_size,
            special_items,
            notes
        } = quoteData;

        // Validate required fields
        if (!customer_id || !move_type || !move_date || !from_address || !estimated_size) {
            throw new Error('Missing required quote fields');
        }

        const result = await database.run(
            `INSERT INTO quotes (
                customer_id, move_type, move_date, from_address, to_address,
                estimated_size, special_items, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer_id, move_type, move_date, from_address, to_address, estimated_size, special_items, notes]
        );

        return Quote.findById(result.lastID);
    }

    static async update(id, updates) {
        const allowedFields = [
            'move_type', 'move_date', 'from_address', 'to_address',
            'estimated_size', 'special_items', 'notes', 'status',
            'estimated_cost', 'final_cost'
        ];

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await database.run(
            `UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Quote.findById(id);
    }

    async addDetectedItem(itemData) {
        const { item_label, confidence_score, quantity = 1 } = itemData;
        
        // Calculate cost based on item and quote details
        const distance = this.move_type === 'long-distance' ? 500 : 15;
        const isSpecialty = this.move_type === 'commercial';
        const estimated_cost = calculateItemCost(item_label, quantity, distance, isSpecialty);

        const result = await database.run(
            `INSERT INTO detected_items (quote_id, item_label, confidence_score, quantity, estimated_cost)
             VALUES (?, ?, ?, ?, ?)`,
            [this.id, item_label, confidence_score, quantity, estimated_cost]
        );

        return result;
    }

    async getDetectedItems() {
        const rows = await database.all(
            'SELECT * FROM detected_items WHERE quote_id = ? ORDER BY confidence_score DESC',
            [this.id]
        );
        return rows;
    }

    async addMediaFile(fileData) {
        const { filename, original_name, file_type, file_size, file_path } = fileData;

        const result = await database.run(
            `INSERT INTO media_files (quote_id, filename, original_name, file_type, file_size, file_path)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [this.id, filename, original_name, file_type, file_size, file_path]
        );

        return result;
    }

    async getMediaFiles() {
        const rows = await database.all(
            'SELECT * FROM media_files WHERE quote_id = ? ORDER BY created_at DESC',
            [this.id]
        );
        return rows;
    }

    async calculateEstimatedCost() {
        const detectedItems = await this.getDetectedItems();
        
        let totalCost = 0;
        
        // Add up costs from detected items
        for (const item of detectedItems) {
            totalCost += parseFloat(item.estimated_cost || 0);
        }

        // Apply base cost if no items detected
        if (detectedItems.length === 0) {
            const baseCosts = {
                'studio': 400,
                '1br': 600,
                '2br': 900,
                '3br': 1300,
                '4br+': 1800,
                'commercial': 2500
            };
            totalCost = baseCosts[this.estimated_size] || 800;
        }

        // Apply pricing rules (location, seasonal, etc.)
        totalCost = await this.applyPricingRules(totalCost);

        // Update quote with estimated cost
        await Quote.update(this.id, { estimated_cost: totalCost });
        this.estimated_cost = totalCost;

        return totalCost;
    }

    async applyPricingRules(baseCost) {
        const rules = await database.all(
            'SELECT * FROM pricing_rules WHERE active = 1'
        );

        let adjustedCost = baseCost;
        let additionalCosts = 0;

        const moveDate = new Date(this.move_date);
        const dayOfWeek = moveDate.getDay();
        const month = moveDate.getMonth() + 1;

        for (const rule of rules) {
            const conditions = JSON.parse(rule.condition_json);
            let ruleApplies = false;

            switch (rule.rule_type) {
                case 'seasonal':
                    if (conditions.days && conditions.days.includes(dayOfWeek)) {
                        ruleApplies = true;
                    }
                    if (conditions.months && conditions.months.includes(month)) {
                        ruleApplies = true;
                    }
                    break;

                case 'distance':
                    if (this.move_type === 'long-distance' && conditions.min_miles) {
                        ruleApplies = true;
                    }
                    break;

                case 'location':
                    // Check if addresses match location conditions
                    if (conditions.zones && (
                        this.from_address.toLowerCase().includes('downtown') ||
                        this.to_address?.toLowerCase().includes('downtown')
                    )) {
                        ruleApplies = true;
                    }
                    break;
            }

            if (ruleApplies) {
                adjustedCost *= parseFloat(rule.multiplier);
                additionalCosts += parseFloat(rule.fixed_cost);
            }
        }

        return Math.round(adjustedCost + additionalCosts);
    }

    async addToHistory(fieldName, oldValue, newValue, changedBy = 'system') {
        await database.run(
            `INSERT INTO quote_history (quote_id, field_name, old_value, new_value, changed_by)
             VALUES (?, ?, ?, ?, ?)`,
            [this.id, fieldName, oldValue, newValue, changedBy]
        );
    }

    async getHistory() {
        const rows = await database.all(
            'SELECT * FROM quote_history WHERE quote_id = ? ORDER BY changed_at DESC',
            [this.id]
        );
        return rows;
    }

    toJSON() {
        return {
            id: this.id,
            customer_id: this.customer_id,
            move_type: this.move_type,
            move_date: this.move_date,
            from_address: this.from_address,
            to_address: this.to_address,
            estimated_size: this.estimated_size,
            special_items: this.special_items,
            notes: this.notes,
            status: this.status,
            estimated_cost: this.estimated_cost,
            final_cost: this.final_cost,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
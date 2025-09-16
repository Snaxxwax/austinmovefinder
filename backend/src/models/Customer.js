import database from '../database/connection.js';

export class Customer {
    constructor(data = {}) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async findByEmail(email) {
        const row = await database.get(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );
        return row ? new Customer(row) : null;
    }

    static async findById(id) {
        const row = await database.get(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );
        return row ? new Customer(row) : null;
    }

    static async create(customerData) {
        const { name, email, phone } = customerData;
        
        // Validate required fields
        if (!name || !email || !phone) {
            throw new Error('Name, email, and phone are required');
        }

        // Check if customer already exists
        const existing = await Customer.findByEmail(email);
        if (existing) {
            return existing;
        }

        const result = await database.run(
            `INSERT INTO customers (name, email, phone) 
             VALUES (?, ?, ?)`,
            [name, email, phone]
        );

        return Customer.findById(result.lastID);
    }

    static async update(id, updates) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (['name', 'email', 'phone'].includes(key)) {
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
            `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Customer.findById(id);
    }

    static async getQuotes(customerId) {
        const rows = await database.all(
            `SELECT q.*, 
                    COUNT(mi.id) as media_count,
                    COUNT(di.id) as detected_items_count
             FROM quotes q
             LEFT JOIN media_files mi ON q.id = mi.quote_id
             LEFT JOIN detected_items di ON q.id = di.quote_id
             WHERE q.customer_id = ?
             GROUP BY q.id
             ORDER BY q.created_at DESC`,
            [customerId]
        );
        return rows;
    }

    async save() {
        if (this.id) {
            // Update existing customer
            return Customer.update(this.id, {
                name: this.name,
                email: this.email,
                phone: this.phone
            });
        } else {
            // Create new customer
            const customer = await Customer.create({
                name: this.name,
                email: this.email,
                phone: this.phone
            });
            
            this.id = customer.id;
            this.created_at = customer.created_at;
            this.updated_at = customer.updated_at;
            
            return this;
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
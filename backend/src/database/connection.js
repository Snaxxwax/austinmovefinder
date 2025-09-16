import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/austinmovefinder.db');
    }

    async connect() {
        if (this.db) {
            return this.db;
        }

        // Ensure data directory exists
        const dataDir = dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log(`✅ Connected to SQLite database at ${this.dbPath}`);
                    
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON', (err) => {
                        if (err) {
                            console.error('Error enabling foreign keys:', err);
                            reject(err);
                        } else {
                            resolve(this.db);
                        }
                    });
                }
            });
        });
    }

    async initialize() {
        const db = await this.connect();
        
        // Read and execute schema
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error initializing database schema:', err);
                    reject(err);
                } else {
                    console.log('✅ Database schema initialized');
                    this.seedData().then(resolve).catch(reject);
                }
            });
        });
    }

    async seedData() {
        const db = await this.connect();
        
        // Seed Austin neighborhoods
        const neighborhoods = [
            { name: 'Downtown', zone: 'central', avg_rent: 2500, walk_score: 95, difficulty_multiplier: 1.3 },
            { name: 'South Lamar', zone: 'central', avg_rent: 2200, walk_score: 88, difficulty_multiplier: 1.1 },
            { name: 'East Austin', zone: 'east', avg_rent: 1900, walk_score: 82, difficulty_multiplier: 1.0 },
            { name: 'North Loop', zone: 'north', avg_rent: 2100, walk_score: 85, difficulty_multiplier: 1.1 },
            { name: 'Westlake', zone: 'west', avg_rent: 3500, walk_score: 65, difficulty_multiplier: 1.4 },
            { name: 'Cedar Park', zone: 'north', avg_rent: 1800, walk_score: 55, difficulty_multiplier: 1.2 },
            { name: 'Pflugerville', zone: 'north', avg_rent: 1700, walk_score: 45, difficulty_multiplier: 1.3 },
            { name: 'Round Rock', zone: 'north', avg_rent: 1650, walk_score: 50, difficulty_multiplier: 1.3 }
        ];

        for (const neighborhood of neighborhoods) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR IGNORE INTO neighborhoods (name, zone, avg_rent, walk_score, difficulty_multiplier) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [neighborhood.name, neighborhood.zone, neighborhood.avg_rent, neighborhood.walk_score, neighborhood.difficulty_multiplier],
                    function(err) {
                        if (err) {
                            console.error('Error seeding neighborhood:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }

        // Seed pricing rules
        const pricingRules = [
            {
                rule_name: 'weekend_surcharge',
                rule_type: 'seasonal',
                condition_json: JSON.stringify({ days: [0, 6] }), // Sunday, Saturday
                multiplier: 1.15,
                fixed_cost: 0
            },
            {
                rule_name: 'peak_season',
                rule_type: 'seasonal', 
                condition_json: JSON.stringify({ months: [5, 6, 7, 8] }), // May-August
                multiplier: 1.25,
                fixed_cost: 0
            },
            {
                rule_name: 'long_distance',
                rule_type: 'distance',
                condition_json: JSON.stringify({ min_miles: 50 }),
                multiplier: 1.8,
                fixed_cost: 200
            },
            {
                rule_name: 'downtown_parking',
                rule_type: 'location',
                condition_json: JSON.stringify({ zones: ['central'] }),
                multiplier: 1.0,
                fixed_cost: 75
            }
        ];

        for (const rule of pricingRules) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR IGNORE INTO pricing_rules (rule_name, rule_type, condition_json, multiplier, fixed_cost) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [rule.rule_name, rule.rule_type, rule.condition_json, rule.multiplier, rule.fixed_cost],
                    function(err) {
                        if (err) {
                            console.error('Error seeding pricing rule:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }

        console.log('✅ Database seeded with Austin neighborhoods and pricing rules');
    }

    // Query helpers
    async get(sql, params = []) {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async all(sql, params = []) {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async run(sql, params = []) {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    async close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    } else {
                        console.log('Database connection closed');
                    }
                    resolve();
                });
            });
        }
    }
}

// Export singleton instance
const database = new Database();
export default database;
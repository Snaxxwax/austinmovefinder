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
        
        // Comprehensive Austin neighborhoods with enhanced pricing factors
        const neighborhoods = [
            // Central Austin
            {
                name: 'Downtown Austin', slug: 'downtown', zone: 'central', avg_rent: 2500, walk_score: 95,
                difficulty_multiplier: 1.35, parking_difficulty: 'extreme', access_type: 'downtown',
                stairs_common: true, traffic_impact: 'high', permit_required: true, truck_restrictions: true,
                special_requirements: 'Parking permits required, loading zone restrictions, narrow streets',
                zip_codes: JSON.stringify(['78701', '78702']),
                coordinates: JSON.stringify({ lat: 30.2672, lng: -97.7431 })
            },
            {
                name: 'South Lamar', slug: 'south-lamar', zone: 'central', avg_rent: 2200, walk_score: 88,
                difficulty_multiplier: 1.1, parking_difficulty: 'difficult', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Heavy traffic on Lamar Blvd during peak hours',
                zip_codes: JSON.stringify(['78704']),
                coordinates: JSON.stringify({ lat: 30.2447, lng: -97.7697 })
            },
            {
                name: 'East Austin', slug: 'east-austin', zone: 'east', avg_rent: 1900, walk_score: 82,
                difficulty_multiplier: 1.0, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Mixed residential and commercial areas',
                zip_codes: JSON.stringify(['78702', '78723']),
                coordinates: JSON.stringify({ lat: 30.2711, lng: -97.7137 })
            },
            {
                name: 'Zilker', slug: 'zilker', zone: 'central', avg_rent: 2300, walk_score: 70,
                difficulty_multiplier: 1.2, parking_difficulty: 'difficult', access_type: 'standard',
                stairs_common: false, traffic_impact: 'high', permit_required: false, truck_restrictions: false,
                special_requirements: 'Festival traffic during ACL and other events, park proximity',
                zip_codes: JSON.stringify(['78704']),
                coordinates: JSON.stringify({ lat: 30.2636, lng: -97.7734 })
            },
            {
                name: 'Clarksville', slug: 'clarksville', zone: 'central', avg_rent: 2800, walk_score: 75,
                difficulty_multiplier: 1.25, parking_difficulty: 'difficult', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: true,
                special_requirements: 'Historic area with narrow tree-lined streets',
                zip_codes: JSON.stringify(['78703']),
                coordinates: JSON.stringify({ lat: 30.2804, lng: -97.7567 })
            },
            {
                name: 'Tarrytown', slug: 'tarrytown', zone: 'central', avg_rent: 2700, walk_score: 65,
                difficulty_multiplier: 1.2, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Established neighborhood with mature trees',
                zip_codes: JSON.stringify(['78703']),
                coordinates: JSON.stringify({ lat: 30.2930, lng: -97.7648 })
            },
            {
                name: 'Bouldin Creek', slug: 'bouldin-creek', zone: 'central', avg_rent: 2100, walk_score: 78,
                difficulty_multiplier: 1.15, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Trendy area south of downtown',
                zip_codes: JSON.stringify(['78704']),
                coordinates: JSON.stringify({ lat: 30.2484, lng: -97.7534 })
            },
            {
                name: 'Barton Hills', slug: 'barton-hills', zone: 'central', avg_rent: 2500, walk_score: 60,
                difficulty_multiplier: 1.3, parking_difficulty: 'difficult', access_type: 'hillside',
                stairs_common: true, traffic_impact: 'low', permit_required: false, truck_restrictions: true,
                special_requirements: 'Hillside location with steep streets and stairs',
                zip_codes: JSON.stringify(['78704']),
                coordinates: JSON.stringify({ lat: 30.2584, lng: -97.7808 })
            },

            // North Austin
            {
                name: 'The Domain', slug: 'the-domain', zone: 'north', avg_rent: 2100, walk_score: 65,
                difficulty_multiplier: 1.1, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: true, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Modern high-rise developments',
                zip_codes: JSON.stringify(['78758']),
                coordinates: JSON.stringify({ lat: 30.4003, lng: -97.7211 })
            },
            {
                name: 'North Loop', slug: 'north-loop', zone: 'north', avg_rent: 2100, walk_score: 85,
                difficulty_multiplier: 1.1, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Close to UT campus',
                zip_codes: JSON.stringify(['78751']),
                coordinates: JSON.stringify({ lat: 30.3175, lng: -97.7425 })
            },
            {
                name: 'Hyde Park', slug: 'hyde-park', zone: 'north', avg_rent: 1900, walk_score: 82,
                difficulty_multiplier: 1.05, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Near UT campus, student-friendly area',
                zip_codes: JSON.stringify(['78751']),
                coordinates: JSON.stringify({ lat: 30.3095, lng: -97.7350 })
            },
            {
                name: 'Mueller', slug: 'mueller', zone: 'north', avg_rent: 2000, walk_score: 68,
                difficulty_multiplier: 1.05, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Planned community with wide streets',
                zip_codes: JSON.stringify(['78723']),
                coordinates: JSON.stringify({ lat: 30.2953, lng: -97.7019 })
            },
            {
                name: 'Crestview', slug: 'crestview', zone: 'north', avg_rent: 1750, walk_score: 58,
                difficulty_multiplier: 1.0, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Growing area with good access',
                zip_codes: JSON.stringify(['78757']),
                coordinates: JSON.stringify({ lat: 30.3397, lng: -97.7411 })
            },
            {
                name: 'Rosedale', slug: 'rosedale', zone: 'north', avg_rent: 2000, walk_score: 72,
                difficulty_multiplier: 1.05, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Central location with good amenities',
                zip_codes: JSON.stringify(['78756']),
                coordinates: JSON.stringify({ lat: 30.3211, lng: -97.7289 })
            },
            {
                name: 'Allandale', slug: 'allandale', zone: 'north', avg_rent: 1950, walk_score: 55,
                difficulty_multiplier: 1.0, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Established residential area',
                zip_codes: JSON.stringify(['78756']),
                coordinates: JSON.stringify({ lat: 30.3456, lng: -97.7356 })
            },
            {
                name: 'Cedar Park', slug: 'cedar-park', zone: 'north', avg_rent: 1639, walk_score: 52,
                difficulty_multiplier: 1.1, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Suburban area with family amenities',
                zip_codes: JSON.stringify(['78613']),
                coordinates: JSON.stringify({ lat: 30.5052, lng: -97.8203 })
            },
            {
                name: 'Round Rock', slug: 'round-rock', zone: 'north', avg_rent: 1650, walk_score: 42,
                difficulty_multiplier: 1.15, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Tech corridor, Dell headquarters area',
                zip_codes: JSON.stringify(['78664', '78665']),
                coordinates: JSON.stringify({ lat: 30.5083, lng: -97.6789 })
            },
            {
                name: 'Pflugerville', slug: 'pflugerville', zone: 'north', avg_rent: 1697, walk_score: 35,
                difficulty_multiplier: 1.2, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Growing suburban area, longer drive to central Austin',
                zip_codes: JSON.stringify(['78660']),
                coordinates: JSON.stringify({ lat: 30.4394, lng: -97.6200 })
            },

            // West Austin
            {
                name: 'Westlake', slug: 'westlake', zone: 'west', avg_rent: 3200, walk_score: 35,
                difficulty_multiplier: 1.45, parking_difficulty: 'normal', access_type: 'gated',
                stairs_common: true, traffic_impact: 'low', permit_required: false, truck_restrictions: true,
                special_requirements: 'Luxury area, gated communities, large truck restrictions',
                zip_codes: JSON.stringify(['78746']),
                coordinates: JSON.stringify({ lat: 30.3079, lng: -97.8431 })
            },
            {
                name: 'West Lake Hills', slug: 'west-lake-hills', zone: 'west', avg_rent: 3500, walk_score: 45,
                difficulty_multiplier: 1.5, parking_difficulty: 'difficult', access_type: 'hillside',
                stairs_common: true, traffic_impact: 'low', permit_required: false, truck_restrictions: true,
                special_requirements: 'Steep hillside roads, luxury homes, truck size restrictions',
                zip_codes: JSON.stringify(['78746']),
                coordinates: JSON.stringify({ lat: 30.2849, lng: -97.8081 })
            },
            {
                name: 'Rollingwood', slug: 'rollingwood', zone: 'west', avg_rent: 3000, walk_score: 25,
                difficulty_multiplier: 1.4, parking_difficulty: 'normal', access_type: 'gated',
                stairs_common: false, traffic_impact: 'low', permit_required: true, truck_restrictions: true,
                special_requirements: 'Incorporated city, may require special permits for large moves',
                zip_codes: JSON.stringify(['78746']),
                coordinates: JSON.stringify({ lat: 30.2834, lng: -97.7934 })
            },
            {
                name: 'Lakeway', slug: 'lakeway', zone: 'west', avg_rent: 2800, walk_score: 30,
                difficulty_multiplier: 1.3, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Lake community, longer distance from central Austin',
                zip_codes: JSON.stringify(['78734']),
                coordinates: JSON.stringify({ lat: 30.3638, lng: -97.9297 })
            },
            {
                name: 'Dripping Springs', slug: 'dripping-springs', zone: 'west', avg_rent: 2400, walk_score: 25,
                difficulty_multiplier: 1.35, parking_difficulty: 'easy', access_type: 'standard',
                stairs_common: false, traffic_impact: 'low', permit_required: false, truck_restrictions: false,
                special_requirements: 'Hill Country location, rural roads, longer travel time',
                zip_codes: JSON.stringify(['78620']),
                coordinates: JSON.stringify({ lat: 30.1905, lng: -98.0867 })
            },

            // East Austin
            {
                name: 'Cherrywood', slug: 'cherrywood', zone: 'east', avg_rent: 1850, walk_score: 65,
                difficulty_multiplier: 1.0, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Diverse community near downtown',
                zip_codes: JSON.stringify(['78722']),
                coordinates: JSON.stringify({ lat: 30.2889, lng: -97.7072 })
            },

            // South Austin
            {
                name: 'Travis Heights', slug: 'travis-heights', zone: 'south', avg_rent: 2200, walk_score: 62,
                difficulty_multiplier: 1.1, parking_difficulty: 'normal', access_type: 'standard',
                stairs_common: false, traffic_impact: 'medium', permit_required: false, truck_restrictions: false,
                special_requirements: 'Established area with hike and bike trail access',
                zip_codes: JSON.stringify(['78704']),
                coordinates: JSON.stringify({ lat: 30.2445, lng: -97.7645 })
            }
        ];

        for (const neighborhood of neighborhoods) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR IGNORE INTO neighborhoods (
                        name, slug, zone, avg_rent, walk_score, difficulty_multiplier,
                        parking_difficulty, access_type, stairs_common, traffic_impact,
                        permit_required, truck_restrictions, special_requirements,
                        zip_codes, coordinates
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        neighborhood.name, neighborhood.slug, neighborhood.zone,
                        neighborhood.avg_rent, neighborhood.walk_score, neighborhood.difficulty_multiplier,
                        neighborhood.parking_difficulty, neighborhood.access_type,
                        neighborhood.stairs_common, neighborhood.traffic_impact,
                        neighborhood.permit_required, neighborhood.truck_restrictions,
                        neighborhood.special_requirements, neighborhood.zip_codes, neighborhood.coordinates
                    ],
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
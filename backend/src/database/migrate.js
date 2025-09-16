#!/usr/bin/env node

import database from './connection.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    console.log('🔄 Running Austin Move Finder database migrations...');
    
    // Initialize database (creates tables and seeds data)
    await database.initialize();
    
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 Austin Move Finder database is ready for use.');
    
    // Close database connection
    await database.close();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
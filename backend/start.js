#!/usr/bin/env node

// Austin Move Finder Backend Startup Script
// This script initializes the database and starts the server

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✅ Created directory: ${dirPath}`, colors.green);
  }
}

function copyEnvTemplate() {
  const envExample = path.join(__dirname, '.env.example');
  const envFile = path.join(__dirname, '.env');

  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    log(`✅ Created .env file from template`, colors.green);
    log(`⚠️  Please edit .env file with your actual configuration values`, colors.yellow);
    return true;
  }
  return false;
}

async function checkDependencies() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const nodeModules = path.join(__dirname, 'node_modules');

  if (!fs.existsSync(nodeModules)) {
    log(`❌ Dependencies not installed. Run: npm install`, colors.red);
    process.exit(1);
  }

  log(`✅ Dependencies installed`, colors.green);
}

async function setupDirectories() {
  const directories = [
    path.join(__dirname, 'data'),
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'logs'),
    path.join(__dirname, 'backups'),
  ];

  directories.forEach(createDirectoryIfNotExists);
}

async function startServer() {
  try {
    // Import the server module
    const serverModule = await import('./src/server.js');
    log(`🚀 Austin Move Finder Backend started successfully!`, colors.green);
  } catch (error) {
    log(`❌ Failed to start server: ${error.message}`, colors.red);
    process.exit(1);
  }
}

async function main() {
  log(`\n${colors.bright}${colors.blue}🚚 Austin Move Finder Backend Setup${colors.reset}\n`);

  try {
    // 1. Check dependencies
    log(`📦 Checking dependencies...`, colors.cyan);
    await checkDependencies();

    // 2. Setup directories
    log(`📁 Setting up directories...`, colors.cyan);
    await setupDirectories();

    // 3. Copy environment template if needed
    log(`⚙️  Checking environment configuration...`, colors.cyan);
    const envCreated = copyEnvTemplate();

    if (envCreated) {
      log(`\n${colors.yellow}IMPORTANT: Please edit the .env file with your actual configuration before continuing.${colors.reset}`);
      log(`${colors.yellow}Required settings:${colors.reset}`);
      log(`  - SMTP_USER and SMTP_PASS for email notifications`);
      log(`  - HUGGINGFACE_API_KEY for object detection`);
      log(`  - JWT_SECRET for security`);
      log(`\nAfter updating .env, run this script again to start the server.\n`);
      process.exit(0);
    }

    // 4. Start the server
    log(`🚀 Starting Austin Move Finder Backend...`, colors.cyan);
    await startServer();

  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log(`\n🛑 SIGTERM received. Shutting down gracefully...`, colors.yellow);
  process.exit(0);
});

process.on('SIGINT', () => {
  log(`\n🛑 SIGINT received. Shutting down gracefully...`, colors.yellow);
  process.exit(0);
});

// Start the application
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
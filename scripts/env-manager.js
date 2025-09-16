#!/usr/bin/env node

/**
 * Austin Move Finder Environment Manager
 * Manages environment variables across development, staging, and production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

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

const ENV_CONFIGS = {
  development: {
    NODE_ENV: 'development',
    VITE_APP_URL: 'http://localhost:5173',
    VITE_BACKEND_URL: 'http://localhost:5000',
    VITE_ENVIRONMENT: 'development',
    VITE_AUSTIN_TIMEZONE: 'America/Chicago',
    VITE_ENABLE_OBJECT_DETECTION: 'true',
    VITE_MAX_DETECTION_FILES: '10',
    VITE_MAX_FILE_SIZE_MB: '25',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.2',
  },
  staging: {
    NODE_ENV: 'staging',
    VITE_APP_URL: 'https://staging-austinmovefinder.pages.dev',
    VITE_BACKEND_URL: 'https://staging-api.austinmovefinder.com',
    VITE_ENVIRONMENT: 'staging',
    VITE_AUSTIN_TIMEZONE: 'America/Chicago',
    VITE_ENABLE_OBJECT_DETECTION: 'true',
    VITE_MAX_DETECTION_FILES: '10',
    VITE_MAX_FILE_SIZE_MB: '25',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.2',
  },
  production: {
    NODE_ENV: 'production',
    VITE_APP_URL: 'https://austinmovefinder.com',
    VITE_BACKEND_URL: 'https://api.austinmovefinder.com',
    VITE_ENVIRONMENT: 'production',
    VITE_AUSTIN_TIMEZONE: 'America/Chicago',
    VITE_ENABLE_OBJECT_DETECTION: 'true',
    VITE_MAX_DETECTION_FILES: '10',
    VITE_MAX_FILE_SIZE_MB: '25',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.45',
    VITE_ANALYTICS_ENABLED: 'true',
  }
};

const REQUIRED_SECRETS = [
  'VITE_HUGGINGFACE_API_KEY',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
];

function loadExistingEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

function generateEnvContent(environment, existingEnv = {}) {
  const config = ENV_CONFIGS[environment];
  if (!config) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  let content = `# Austin Move Finder - ${environment.toUpperCase()} Environment\\n`;
  content += `# Generated on ${new Date().toISOString()}\\n`;
  content += `# Austin Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\\n\\n`;

  // Add environment-specific variables
  content += `# Environment Configuration\\n`;
  Object.entries(config).forEach(([key, value]) => {
    content += `${key}=${value}\\n`;
  });

  content += `\\n# Secrets (configure these manually)\\n`;
  REQUIRED_SECRETS.forEach(secret => {
    const existingValue = existingEnv[secret] || 'your_secret_here';
    content += `${secret}=${existingValue}\\n`;
  });

  // Add optional analytics for production
  if (environment === 'production') {
    content += `\\n# Production Analytics (optional)\\n`;
    content += `# VITE_GA_TRACKING_ID=G-XXXXXXXXXX\\n`;
    content += `# VITE_PLAUSIBLE_DOMAIN=austinmovefinder.com\\n`;
  }

  content += `\\n# Austin-Specific Configuration\\n`;
  content += `# Peak moving season: March-September\\n`;
  content += `# Business hours: 8 AM - 8 PM CST\\n`;
  content += `# Service area: Austin Metro (Travis, Williamson, Hays counties)\\n`;

  return content;
}

function setupEnvironment(environment) {
  log(`\\n${colors.bright}${colors.blue}🚚 Setting up ${environment.toUpperCase()} environment for Austin Move Finder${colors.reset}\\n`);

  const envFilePath = path.join(PROJECT_ROOT, `.env.${environment}`);
  const localEnvPath = path.join(PROJECT_ROOT, '.env.local');

  // Load existing environment variables
  const existingEnv = loadExistingEnv(envFilePath);
  const existingLocal = loadExistingEnv(localEnvPath);

  // Generate new environment configuration
  const envContent = generateEnvContent(environment, { ...existingEnv, ...existingLocal });

  // Write environment file
  fs.writeFileSync(envFilePath, envContent);
  log(`✅ Created ${envFilePath}`, colors.green);

  // For development, also create/update .env.local
  if (environment === 'development') {
    fs.writeFileSync(localEnvPath, envContent);
    log(`✅ Created ${localEnvPath}`, colors.green);
  }

  // Check for missing secrets
  const missingSecrets = REQUIRED_SECRETS.filter(secret => {
    const value = existingEnv[secret] || existingLocal[secret];
    return !value || value === 'your_secret_here' || value.includes('_here');
  });

  if (missingSecrets.length > 0) {
    log(`\\n${colors.yellow}⚠️  Missing required secrets:${colors.reset}`);
    missingSecrets.forEach(secret => {
      log(`   - ${secret}`, colors.yellow);
    });
    log(`\\nPlease update these values in ${envFilePath}`, colors.yellow);
  }

  log(`\\n${colors.green}🎯 Environment setup complete!${colors.reset}`);
  log(`   📁 Configuration: ${envFilePath}`, colors.cyan);
  log(`   🌟 Environment: ${environment}`, colors.cyan);
  log(`   🏠 Austin-optimized settings applied`, colors.cyan);
}

function validateEnvironment(environment) {
  log(`\\n${colors.bright}${colors.blue}🔍 Validating ${environment.toUpperCase()} environment${colors.reset}\\n`);

  const envFilePath = path.join(PROJECT_ROOT, `.env.${environment}`);

  if (!fs.existsSync(envFilePath)) {
    log(`❌ Environment file not found: ${envFilePath}`, colors.red);
    return false;
  }

  const env = loadExistingEnv(envFilePath);
  const config = ENV_CONFIGS[environment];
  let isValid = true;

  // Check required configuration
  Object.entries(config).forEach(([key, expectedValue]) => {
    if (env[key] !== expectedValue) {
      log(`❌ ${key}: expected "${expectedValue}", got "${env[key] || 'undefined'}"`, colors.red);
      isValid = false;
    } else {
      log(`✅ ${key}: ${env[key]}`, colors.green);
    }
  });

  // Check secrets
  REQUIRED_SECRETS.forEach(secret => {
    const value = env[secret];
    if (!value || value === 'your_secret_here' || value.includes('_here')) {
      log(`⚠️  ${secret}: not configured`, colors.yellow);
    } else {
      log(`✅ ${secret}: configured`, colors.green);
    }
  });

  log(`\\n${isValid ? '✅ Environment validation passed' : '❌ Environment validation failed'}`, isValid ? colors.green : colors.red);
  return isValid;
}

function listEnvironments() {
  log(`\\n${colors.bright}${colors.blue}🚚 Austin Move Finder Environment Configurations${colors.reset}\\n`);

  Object.keys(ENV_CONFIGS).forEach(env => {
    const envFilePath = path.join(PROJECT_ROOT, `.env.${env}`);
    const exists = fs.existsSync(envFilePath);

    log(`${env.toUpperCase()}:`, colors.cyan);
    log(`   📁 File: ${envFilePath}`, colors.reset);
    log(`   ${exists ? '✅ Configured' : '❌ Not configured'}`, exists ? colors.green : colors.red);

    if (exists) {
      const envData = loadExistingEnv(envFilePath);
      log(`   🌐 App URL: ${envData.VITE_APP_URL || 'not set'}`, colors.reset);
      log(`   🔗 Backend URL: ${envData.VITE_BACKEND_URL || 'not set'}`, colors.reset);
    }
    log('');
  });
}

// CLI Interface
const command = process.argv[2];
const environment = process.argv[3];

switch (command) {
  case 'setup':
    if (!environment || !ENV_CONFIGS[environment]) {
      log(`❌ Usage: npm run env:setup <environment>`, colors.red);
      log(`Available environments: ${Object.keys(ENV_CONFIGS).join(', ')}`, colors.yellow);
      process.exit(1);
    }
    setupEnvironment(environment);
    break;

  case 'validate':
    if (!environment || !ENV_CONFIGS[environment]) {
      log(`❌ Usage: npm run env:validate <environment>`, colors.red);
      log(`Available environments: ${Object.keys(ENV_CONFIGS).join(', ')}`, colors.yellow);
      process.exit(1);
    }
    const isValid = validateEnvironment(environment);
    process.exit(isValid ? 0 : 1);
    break;

  case 'list':
    listEnvironments();
    break;

  default:
    log(`${colors.bright}Austin Move Finder Environment Manager${colors.reset}\\n`, colors.blue);
    log(`Usage:`, colors.cyan);
    log(`  node scripts/env-manager.js setup <environment>    - Setup environment configuration`);
    log(`  node scripts/env-manager.js validate <environment> - Validate environment configuration`);
    log(`  node scripts/env-manager.js list                   - List all environments`);
    log(`\\nAvailable environments: ${Object.keys(ENV_CONFIGS).join(', ')}`, colors.yellow);
    break;
}

export { setupEnvironment, validateEnvironment, listEnvironments };
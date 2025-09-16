#!/usr/bin/env node

/**
 * Austin Move Finder Environment Setup Script
 * Interactive script to configure environment variables for different environments
 */

import fs from 'fs';
import readline from 'readline';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Default values for Austin Move Finder
const DEFAULT_VALUES = {
  development: {
    VITE_APP_NAME: 'Austin Move Finder',
    VITE_APP_URL: 'http://localhost:5173',
    VITE_BACKEND_URL: 'http://localhost:5000',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.2',
    VITE_ENABLE_OBJECT_DETECTION: 'true',
    VITE_MAX_DETECTION_FILES: '10',
    VITE_MAX_FILE_SIZE_MB: '25'
  },
  staging: {
    VITE_APP_NAME: 'Austin Move Finder (Staging)',
    VITE_APP_URL: 'https://staging-austinmovefinder.pages.dev',
    VITE_BACKEND_URL: 'https://staging-api.austinmovefinder.com',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.2',
    VITE_ENABLE_OBJECT_DETECTION: 'true'
  },
  production: {
    VITE_APP_NAME: 'Austin Move Finder',
    VITE_APP_URL: 'https://austinmovefinder.com',
    VITE_BACKEND_URL: 'https://api.austinmovefinder.com',
    VITE_BASE_LABOR_RATE: '120',
    VITE_TRUCK_RATE_PER_MILE: '1.2',
    VITE_ENABLE_OBJECT_DETECTION: 'true'
  }
};

const ENV_DESCRIPTIONS = {
  VITE_APP_NAME: 'Application name displayed in browser',
  VITE_APP_URL: 'Frontend application URL',
  VITE_BACKEND_URL: 'Backend API URL',
  VITE_HUGGINGFACE_API_KEY: 'HuggingFace API key for object detection',
  VITE_EMAILJS_SERVICE_ID: 'EmailJS service ID for quote emails',
  VITE_EMAILJS_TEMPLATE_ID: 'EmailJS template ID for quote emails',
  VITE_EMAILJS_PUBLIC_KEY: 'EmailJS public key',
  VITE_BASE_LABOR_RATE: 'Base hourly rate for Austin moving labor ($)',
  VITE_TRUCK_RATE_PER_MILE: 'Rate per mile for truck rental ($)',
  VITE_GA_TRACKING_ID: 'Google Analytics tracking ID',
  VITE_PLAUSIBLE_DOMAIN: 'Plausible analytics domain'
};

async function selectEnvironment() {
  log(`\n🔧 Select environment to configure:`, colors.cyan);
  log(`1. Development (local development)`);
  log(`2. Staging (testing environment)`);
  log(`3. Production (live website)`);

  const choice = await question('\nEnter choice (1-3): ');

  switch (choice) {
    case '1':
      return 'development';
    case '2':
      return 'staging';
    case '3':
      return 'production';
    default:
      log(`Invalid choice. Using development.`, colors.yellow);
      return 'development';
  }
}

async function configureVariable(name, defaultValue, environment) {
  const description = ENV_DESCRIPTIONS[name] || 'No description available';

  log(`\n📝 ${name}`, colors.bright);
  log(`   ${description}`, colors.cyan);

  if (defaultValue) {
    log(`   Default: ${defaultValue}`, colors.yellow);
  }

  const value = await question(`   Enter value (press Enter for default): `);
  return value.trim() || defaultValue || '';
}

async function generateServiceCredentials() {
  log(`\n🔑 Setting up Austin Move Finder service credentials:`, colors.blue);

  const setupEmailJS = await question('Setup EmailJS for quote emails? (y/n): ');
  let emailJSConfig = {};

  if (setupEmailJS.toLowerCase() === 'y') {
    log(`\n📧 EmailJS Setup:`, colors.cyan);
    log(`1. Visit https://dashboard.emailjs.com/`);
    log(`2. Create an account and service`);
    log(`3. Create a template for Austin moving quotes`);
    log(`4. Get your service ID, template ID, and public key`);

    emailJSConfig.VITE_EMAILJS_SERVICE_ID = await question('\nEmailJS Service ID: ');
    emailJSConfig.VITE_EMAILJS_TEMPLATE_ID = await question('EmailJS Template ID: ');
    emailJSConfig.VITE_EMAILJS_PUBLIC_KEY = await question('EmailJS Public Key: ');
  }

  const setupHuggingFace = await question('\nSetup HuggingFace for object detection? (y/n): ');
  let huggingFaceConfig = {};

  if (setupHuggingFace.toLowerCase() === 'y') {
    log(`\n🤖 HuggingFace Setup:`, colors.cyan);
    log(`1. Visit https://huggingface.co/settings/tokens`);
    log(`2. Create a new token with 'Read' access`);
    log(`3. Copy the token`);

    huggingFaceConfig.VITE_HUGGINGFACE_API_KEY = await question('\nHuggingFace API Key: ');
  }

  return { ...emailJSConfig, ...huggingFaceConfig };
}

async function createEnvFile(environment, config) {
  const envFileName = environment === 'development' ? '.env.local' : `.env.${environment}`;

  let envContent = `# Austin Move Finder - ${environment.toUpperCase()} Environment\n`;
  envContent += `# Generated on ${new Date().toISOString()}\n`;
  envContent += `# Environment: ${environment}\n\n`;

  // Core application settings
  envContent += '# Application Configuration\n';
  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith('VITE_APP_') || key.startsWith('VITE_BASE_') || key.startsWith('VITE_TRUCK_') || key.startsWith('VITE_ENABLE_') || key.startsWith('VITE_MAX_')) {
      envContent += `${key}=${value}\n`;
    }
  }

  // Service integrations
  envContent += '\n# Service Integrations\n';
  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith('VITE_EMAILJS_') || key.startsWith('VITE_HUGGINGFACE_')) {
      envContent += `${key}=${value}\n`;
    }
  }

  // Analytics (optional)
  envContent += '\n# Analytics (Optional)\n';
  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith('VITE_GA_') || key.startsWith('VITE_PLAUSIBLE_')) {
      if (value) {
        envContent += `${key}=${value}\n`;
      } else {
        envContent += `# ${key}=\n`;
      }
    }
  }

  // Austin-specific settings
  envContent += '\n# Austin-Specific Configuration\n';
  envContent += `# Austin timezone: America/Chicago\n`;
  envContent += `# Peak moving season: March-September\n`;
  envContent += `# Business hours: 8 AM - 6 PM CST\n`;

  fs.writeFileSync(envFileName, envContent);
  log(`\n✅ Created ${envFileName}`, colors.green);

  return envFileName;
}

async function validateConfiguration(config, environment) {
  log(`\n🔍 Validating configuration:`, colors.cyan);

  let isValid = true;

  // Required fields check
  const requiredFields = ['VITE_APP_NAME', 'VITE_APP_URL', 'VITE_BASE_LABOR_RATE'];
  for (const field of requiredFields) {
    if (!config[field]) {
      log(`❌ Missing required field: ${field}`, colors.red);
      isValid = false;
    }
  }

  // Austin-specific validations
  const laborRate = parseFloat(config.VITE_BASE_LABOR_RATE);
  if (isNaN(laborRate) || laborRate < 100 || laborRate > 200) {
    log(`⚠️  Austin labor rate should be between $100-200: $${laborRate}`, colors.yellow);
  }

  const truckRate = parseFloat(config.VITE_TRUCK_RATE_PER_MILE);
  if (isNaN(truckRate) || truckRate < 1 || truckRate > 2) {
    log(`⚠️  Austin truck rate should be between $1-2/mile: $${truckRate}`, colors.yellow);
  }

  // URL validation for production
  if (environment === 'production') {
    if (!config.VITE_APP_URL.startsWith('https://')) {
      log(`❌ Production URL must use HTTPS`, colors.red);
      isValid = false;
    }
  }

  return isValid;
}

async function main() {
  log(`\n${colors.bright}${colors.blue}🚀 Austin Move Finder Environment Setup${colors.reset}\n`);

  try {
    // Select environment
    const environment = await selectEnvironment();
    log(`\nConfiguring ${environment} environment...`, colors.green);

    // Start with defaults
    const config = { ...DEFAULT_VALUES[environment] };

    // Configure core variables
    log(`\n📋 Configuring core application settings:`, colors.blue);
    config.VITE_APP_NAME = await configureVariable('VITE_APP_NAME', config.VITE_APP_NAME, environment);
    config.VITE_APP_URL = await configureVariable('VITE_APP_URL', config.VITE_APP_URL, environment);
    config.VITE_BACKEND_URL = await configureVariable('VITE_BACKEND_URL', config.VITE_BACKEND_URL, environment);

    // Austin-specific configuration
    log(`\n🏠 Austin-specific configuration:`, colors.blue);
    config.VITE_BASE_LABOR_RATE = await configureVariable('VITE_BASE_LABOR_RATE', config.VITE_BASE_LABOR_RATE, environment);
    config.VITE_TRUCK_RATE_PER_MILE = await configureVariable('VITE_TRUCK_RATE_PER_MILE', config.VITE_TRUCK_RATE_PER_MILE, environment);

    // Service credentials
    const serviceCredentials = await generateServiceCredentials();
    Object.assign(config, serviceCredentials);

    // Analytics (optional)
    const setupAnalytics = await question('\nSetup analytics tracking? (y/n): ');
    if (setupAnalytics.toLowerCase() === 'y') {
      config.VITE_GA_TRACKING_ID = await configureVariable('VITE_GA_TRACKING_ID', '', environment);
    }

    // Validate configuration
    const isValid = await validateConfiguration(config, environment);

    if (isValid) {
      // Create .env file
      const envFile = await createEnvFile(environment, config);

      log(`\n${colors.bright}✅ Setup Complete!${colors.reset}`, colors.green);
      log(`\nNext steps:`, colors.cyan);
      log(`1. Review the generated ${envFile} file`);
      log(`2. Run: npm run validate:env`);
      log(`3. Start development: npm run dev`);
      log(`\nFor production deployment:`, colors.yellow);
      log(`1. Set environment variables in Cloudflare Pages`);
      log(`2. Run: npm run deploy`);

    } else {
      log(`\n❌ Configuration has issues. Please review and try again.`, colors.red);
    }

  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red);
  } finally {
    rl.close();
  }
}

main();
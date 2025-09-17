#!/usr/bin/env node

/**
 * Austin Move Finder Environment Validation Script
 * Validates required environment variables for different deployment environments
 */

import fs from 'fs';
import path from 'path';

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

// Environment variable requirements by environment
const ENV_REQUIREMENTS = {
  development: {
    required: [
      'VITE_APP_NAME',
      'VITE_APP_URL',
      'VITE_BACKEND_URL'
    ],
    optional: [
      'VITE_HUGGINGFACE_API_KEY',
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID',
      'VITE_EMAILJS_PUBLIC_KEY'
    ]
  },
  staging: {
    required: [
      'VITE_APP_NAME',
      'VITE_APP_URL',
      'VITE_BACKEND_URL',
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID',
      'VITE_EMAILJS_PUBLIC_KEY'
    ],
    optional: [
      'VITE_HUGGINGFACE_API_KEY',
      'VITE_GA_TRACKING_ID'
    ]
  },
  production: {
    required: [
      'VITE_APP_NAME',
      'VITE_APP_URL',
      'VITE_BACKEND_URL',
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID',
      'VITE_EMAILJS_PUBLIC_KEY',
      'VITE_BASE_LABOR_RATE',
      'VITE_TRUCK_RATE_PER_MILE'
    ],
    optional: [
      'VITE_HUGGINGFACE_API_KEY',
      'VITE_GA_TRACKING_ID',
      'VITE_PLAUSIBLE_DOMAIN'
    ]
  }
};

// Austin-specific validation rules
const AUSTIN_VALIDATION_RULES = {
  'VITE_APP_URL': {
    production: ['austinmovefinder.com', 'austinmovefinder.pages.dev'],
    staging: ['staging-austinmovefinder.pages.dev', 'localhost']
  },
  'VITE_BASE_LABOR_RATE': {
    min: 100,
    max: 200,
    message: 'Austin labor rate should be between $100-200/hour'
  },
  'VITE_TRUCK_RATE_PER_MILE': {
    min: 1.0,
    max: 2.0,
    message: 'Austin truck rate should be between $1.00-2.00/mile'
  }
};

function loadEnvVariables() {
  // Load from .env.local, .env, or process.env
  const envFiles = ['.env.local', '.env'];
  const envVars = { ...process.env };

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
      log(`📁 Loaded environment from: ${envFile}`, colors.blue);
    }
  }

  return envVars;
}

function validateAustinSpecificRules(envVars) {
  let issues = [];

  for (const [varName, rules] of Object.entries(AUSTIN_VALIDATION_RULES)) {
    const value = envVars[varName];

    if (!value) continue;

    // URL validation
    if (rules.production || rules.staging) {
      const environment = envVars.NODE_ENV || 'development';
      const allowedUrls = rules[environment] || rules.production || [];

      const isValidUrl = allowedUrls.some(url => value.includes(url));
      if (!isValidUrl) {
        issues.push({
          type: 'warning',
          message: `${varName} may not be correct for ${environment} environment: ${value}`
        });
      }
    }

    // Numeric range validation
    if (rules.min !== undefined && rules.max !== undefined) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < rules.min || numericValue > rules.max) {
        issues.push({
          type: 'error',
          message: `${varName} is out of range: ${value}. ${rules.message}`
        });
      }
    }
  }

  return issues;
}

function validateEnvironment(environment, envVars) {
  log(`\n🔍 Validating ${environment} environment:`, colors.cyan);

  const requirements = ENV_REQUIREMENTS[environment];
  if (!requirements) {
    log(`❌ Unknown environment: ${environment}`, colors.red);
    return false;
  }

  let hasErrors = false;
  let hasWarnings = false;

  // Check if we're in CI environment (Cloudflare Pages, GitHub Actions, etc.)
  const isCI = process.env.CI === 'true' || process.env.CF_PAGES === '1' || process.env.GITHUB_ACTIONS === 'true';

  if (isCI) {
    log(`🔧 Detected CI environment - relaxing validation for production build`, colors.blue);
  }

  // Check required variables
  for (const varName of requirements.required) {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      if (isCI && environment === 'development') {
        // In CI, skip validation for development mode since env vars come from platform
        log(`⚠️  CI Mode - ${varName} will be provided by deployment platform`, colors.yellow);
        hasWarnings = true;
      } else {
        log(`❌ Missing required: ${varName}`, colors.red);
        hasErrors = true;
      }
    } else {
      log(`✅ Required: ${varName}`, colors.green);
    }
  }

  // Check optional variables
  for (const varName of requirements.optional) {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      log(`⚠️  Optional missing: ${varName}`, colors.yellow);
      hasWarnings = true;
    } else {
      log(`✅ Optional: ${varName}`, colors.green);
    }
  }

  // Austin-specific validations
  const austinIssues = validateAustinSpecificRules(envVars);
  for (const issue of austinIssues) {
    if (issue.type === 'error') {
      log(`❌ ${issue.message}`, colors.red);
      hasErrors = true;
    } else {
      log(`⚠️  ${issue.message}`, colors.yellow);
      hasWarnings = true;
    }
  }

  // Environment-specific validations
  if (environment === 'production') {
    // Production URL should be HTTPS
    const appUrl = envVars.VITE_APP_URL;
    if (appUrl && !appUrl.startsWith('https://')) {
      log(`❌ Production URL must use HTTPS: ${appUrl}`, colors.red);
      hasErrors = true;
    }

    // Backend URL should be production
    const backendUrl = envVars.VITE_BACKEND_URL;
    if (backendUrl && backendUrl.includes('localhost')) {
      log(`❌ Production backend should not use localhost: ${backendUrl}`, colors.red);
      hasErrors = true;
    }
  }

  return !hasErrors;
}

function generateEnvTemplate(environment) {
  log(`\n📝 Generating .env template for ${environment}:`, colors.blue);

  const requirements = ENV_REQUIREMENTS[environment];
  let template = `# Austin Move Finder - ${environment.toUpperCase()} Environment\n`;
  template += `# Generated on ${new Date().toISOString()}\n\n`;

  template += '# Required Variables\n';
  for (const varName of requirements.required) {
    template += `${varName}=\n`;
  }

  template += '\n# Optional Variables\n';
  for (const varName of requirements.optional) {
    template += `# ${varName}=\n`;
  }

  template += '\n# Austin-Specific Configuration\n';
  template += 'VITE_BASE_LABOR_RATE=120\n';
  template += 'VITE_TRUCK_RATE_PER_MILE=1.2\n';
  template += 'VITE_ENABLE_OBJECT_DETECTION=true\n';

  console.log(template);
  return template;
}

function main() {
  log(`\n${colors.bright}${colors.blue}🔧 Austin Move Finder Environment Validator${colors.reset}\n`);

  const environment = process.env.NODE_ENV || 'development';
  log(`Environment: ${environment}`, colors.cyan);

  // Load environment variables
  const envVars = loadEnvVariables();

  // Validate current environment
  const isValid = validateEnvironment(environment, envVars);

  // Summary
  log(`\n${colors.bright}📊 Validation Summary:${colors.reset}`);
  if (isValid) {
    log(`✅ Environment validation passed for ${environment}`, colors.green);
    process.exit(0);
  } else {
    log(`❌ Environment validation failed for ${environment}`, colors.red);
    log(`\nTo fix issues, update your environment variables or run:`, colors.yellow);
    log(`npm run setup:env`, colors.cyan);

    if (process.argv.includes('--generate-template')) {
      generateEnvTemplate(environment);
    }

    process.exit(1);
  }
}

// Handle CLI arguments
if (process.argv.includes('--help')) {
  console.log(`
Austin Move Finder Environment Validator

Usage:
  npm run validate:env                     # Validate current environment
  npm run validate:env -- --generate-template # Generate template for current environment

Environment Variables:
  NODE_ENV=production|staging|development  # Set environment mode
  `);
  process.exit(0);
}

main();
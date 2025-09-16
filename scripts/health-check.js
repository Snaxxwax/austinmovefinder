#!/usr/bin/env node

/**
 * Austin Move Finder Health Check Script
 * Validates production deployment health and Austin-specific features
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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

async function checkUrl(url, description) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Austin-Move-Finder-Health-Check/1.0'
      }
    });

    if (response.ok) {
      log(`✅ ${description}: ${url} (${response.status})`, colors.green);
      return true;
    } else {
      log(`❌ ${description}: ${url} (${response.status})`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: ${url} - ${error.message}`, colors.red);
    return false;
  }
}

async function checkAustinSpecificContent(url) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const html = await response.text();

    const austinKeywords = [
      'Austin',
      'Texas',
      'ATX',
      'neighborhoods',
      'moving guide'
    ];

    const foundKeywords = austinKeywords.filter(keyword =>
      html.toLowerCase().includes(keyword.toLowerCase())
    );

    if (foundKeywords.length >= 3) {
      log(`✅ Austin content validation: Found ${foundKeywords.length}/5 keywords`, colors.green);
      return true;
    } else {
      log(`⚠️  Austin content validation: Only found ${foundKeywords.length}/5 keywords`, colors.yellow);
      return false;
    }
  } catch (error) {
    log(`❌ Austin content validation failed: ${error.message}`, colors.red);
    return false;
  }
}

async function checkPerformance(url) {
  try {
    const fetch = (await import('node-fetch')).default;
    const start = Date.now();
    const response = await fetch(url);
    const end = Date.now();
    const responseTime = end - start;

    if (responseTime < 2000) {
      log(`✅ Performance check: ${responseTime}ms (Good)`, colors.green);
      return true;
    } else if (responseTime < 5000) {
      log(`⚠️  Performance check: ${responseTime}ms (Acceptable)`, colors.yellow);
      return true;
    } else {
      log(`❌ Performance check: ${responseTime}ms (Slow)`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Performance check failed: ${error.message}`, colors.red);
    return false;
  }
}

async function runHealthChecks() {
  log(`\n${colors.bright}${colors.blue}🩺 Austin Move Finder Health Check${colors.reset}\n`);

  const baseUrls = [
    'https://austinmovefinder.com',
    'https://austinmovefinder.pages.dev'
  ];

  const endpoints = [
    '/',
    '/neighborhoods',
    '/fast-quote',
    '/moving-guide'
  ];

  let totalChecks = 0;
  let passedChecks = 0;

  // Check each URL and endpoint combination
  for (const baseUrl of baseUrls) {
    log(`\n📍 Checking ${baseUrl}:`, colors.cyan);

    for (const endpoint of endpoints) {
      const fullUrl = `${baseUrl}${endpoint}`;
      totalChecks++;

      const isHealthy = await checkUrl(fullUrl, `${endpoint} page`);
      if (isHealthy) passedChecks++;

      // Additional checks for homepage
      if (endpoint === '/') {
        totalChecks += 2;

        const hasAustinContent = await checkAustinSpecificContent(fullUrl);
        if (hasAustinContent) passedChecks++;

        const isPerformant = await checkPerformance(fullUrl);
        if (isPerformant) passedChecks++;
      }
    }
  }

  // Final report
  log(`\n${colors.bright}📊 Health Check Summary:${colors.reset}`);
  log(`Total checks: ${totalChecks}`);
  log(`Passed: ${passedChecks}`, passedChecks === totalChecks ? colors.green : colors.yellow);
  log(`Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks === 0 ? colors.green : colors.red);

  const healthScore = (passedChecks / totalChecks) * 100;
  if (healthScore >= 90) {
    log(`\n✅ Overall Health: ${healthScore.toFixed(1)}% (Excellent)`, colors.green);
    process.exit(0);
  } else if (healthScore >= 75) {
    log(`\n⚠️  Overall Health: ${healthScore.toFixed(1)}% (Good)`, colors.yellow);
    process.exit(0);
  } else {
    log(`\n❌ Overall Health: ${healthScore.toFixed(1)}% (Needs Attention)`, colors.red);
    process.exit(1);
  }
}

// Austin-specific timezone check
function checkAustinTime() {
  try {
    const austinTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago'
    });
    log(`🕐 Austin Time: ${austinTime}`, colors.blue);
  } catch (error) {
    log(`⚠️  Austin timezone check failed: ${error.message}`, colors.yellow);
  }
}

// Run health checks
checkAustinTime();
runHealthChecks().catch(error => {
  log(`\n❌ Health check failed: ${error.message}`, colors.red);
  process.exit(1);
});
#!/usr/bin/env node

/**
 * Austin Move Finder Traffic Monitor
 * Monitors traffic patterns specific to Austin moving season and business hours
 */

import { execSync } from 'child_process';

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

const AUSTIN_TIMEZONE = 'America/Chicago';
const MONITORING_ENDPOINTS = [
  {
    name: 'Production Site',
    url: 'https://austinmovefinder.com',
    critical: true
  },
  {
    name: 'Cloudflare Pages',
    url: 'https://austinmovefinder.pages.dev',
    critical: true
  },
  {
    name: 'API Health Check',
    url: 'https://api.austinmovefinder.com/health',
    critical: false
  }
];

// Austin-specific business logic
const AUSTIN_BUSINESS_HOURS = {
  start: 8,  // 8 AM CST
  end: 20,   // 8 PM CST
};

const AUSTIN_PEAK_MONTHS = [3, 4, 5, 6, 7, 8, 9]; // March through September
const AUSTIN_PEAK_DAYS = [1, 2, 3, 4, 5]; // Monday through Friday

function getAustinTime() {
  const now = new Date();
  const austinTime = new Date(now.toLocaleString("en-US", {timeZone: AUSTIN_TIMEZONE}));
  return {
    date: austinTime,
    hour: austinTime.getHours(),
    day: austinTime.getDay(), // 0 = Sunday, 1 = Monday, etc.
    month: austinTime.getMonth() + 1, // 1-indexed
    weekday: austinTime.toLocaleDateString('en-US', { weekday: 'long', timeZone: AUSTIN_TIMEZONE }),
    formatted: austinTime.toLocaleString('en-US', {
      timeZone: AUSTIN_TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  };
}

function analyzeAustinTrafficConditions() {
  const austin = getAustinTime();

  const isBusinessHours = austin.hour >= AUSTIN_BUSINESS_HOURS.start &&
                         austin.hour < AUSTIN_BUSINESS_HOURS.end;
  const isPeakSeason = AUSTIN_PEAK_MONTHS.includes(austin.month);
  const isPeakDay = AUSTIN_PEAK_DAYS.includes(austin.day);
  const isWeekend = austin.day === 0 || austin.day === 6;

  let trafficLevel = 'LOW';
  let recommendations = [];

  // Determine expected traffic level
  if (isPeakSeason && isPeakDay && isBusinessHours) {
    trafficLevel = 'VERY HIGH';
    recommendations.push('Monitor response times closely');
    recommendations.push('Consider scaling Cloudflare Workers');
    recommendations.push('Enable enhanced caching');
  } else if (isPeakSeason && isBusinessHours) {
    trafficLevel = 'HIGH';
    recommendations.push('Monitor for increased quote requests');
    recommendations.push('Check email delivery performance');
  } else if (isBusinessHours && !isWeekend) {
    trafficLevel = 'MEDIUM';
    recommendations.push('Standard monitoring sufficient');
  } else {
    trafficLevel = 'LOW';
    recommendations.push('Maintenance window opportunity');
  }

  return {
    austin,
    trafficLevel,
    isBusinessHours,
    isPeakSeason,
    isPeakDay,
    isWeekend,
    recommendations
  };
}

async function checkEndpoint(endpoint) {
  try {
    const startTime = Date.now();
    const command = `curl -f -s -w "%{http_code}|%{time_total}|%{size_download}" "${endpoint.url}"`;
    const result = execSync(command, { encoding: 'utf8', timeout: 15000 });

    const metrics = result.split('|');
    const httpCode = metrics[metrics.length - 3] || '000';
    const totalTime = parseFloat(metrics[metrics.length - 2] || '0');
    const sizeDownload = parseInt(metrics[metrics.length - 1] || '0');

    const responseTime = Math.round(totalTime * 1000);

    const status = httpCode === '200' ? 'HEALTHY' : 'ERROR';
    const performance = responseTime < 500 ? 'EXCELLENT' :
                       responseTime < 1000 ? 'GOOD' :
                       responseTime < 2000 ? 'SLOW' : 'CRITICAL';

    return {
      status,
      httpCode,
      responseTime,
      sizeDownload,
      performance,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'ERROR',
      httpCode: '000',
      responseTime: 0,
      sizeDownload: 0,
      performance: 'CRITICAL',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runAustinMonitoring() {
  log(`\\n${colors.bright}${colors.blue}🚚 Austin Move Finder Traffic Monitor${colors.reset}\\n`);

  const conditions = analyzeAustinTrafficConditions();

  // Display Austin time and conditions
  log(`🕐 Austin Time: ${conditions.austin.formatted}`, colors.cyan);
  log(`📊 Expected Traffic Level: ${conditions.trafficLevel}`,
      conditions.trafficLevel === 'VERY HIGH' ? colors.red :
      conditions.trafficLevel === 'HIGH' ? colors.yellow :
      conditions.trafficLevel === 'MEDIUM' ? colors.blue : colors.green);

  // Business context
  log(`\\n🏢 Austin Business Context:`, colors.cyan);
  log(`   Business Hours: ${conditions.isBusinessHours ? '✅ OPEN' : '❌ CLOSED'}`,
      conditions.isBusinessHours ? colors.green : colors.yellow);
  log(`   Moving Season: ${conditions.isPeakSeason ? '🌡️ PEAK SEASON' : '❄️ OFF-SEASON'}`,
      conditions.isPeakSeason ? colors.yellow : colors.green);
  log(`   Day Type: ${conditions.isWeekend ? '🏖️ WEEKEND' : '💼 WEEKDAY'}`, colors.reset);

  // Recommendations
  if (conditions.recommendations.length > 0) {
    log(`\\n💡 Monitoring Recommendations:`, colors.magenta);
    conditions.recommendations.forEach(rec => {
      log(`   • ${rec}`, colors.reset);
    });
  }

  // Health checks
  log(`\\n🩺 Endpoint Health Checks:`, colors.cyan);
  const results = [];

  for (const endpoint of MONITORING_ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    results.push({ ...result, endpoint });

    const statusColor = result.status === 'HEALTHY' ? colors.green : colors.red;
    const perfColor = result.performance === 'EXCELLENT' ? colors.green :
                     result.performance === 'GOOD' ? colors.yellow :
                     result.performance === 'SLOW' ? colors.yellow : colors.red;

    log(`   ${endpoint.critical ? '🔴' : '🟡'} ${endpoint.name}:`, colors.reset);
    log(`      Status: ${result.status} (${result.httpCode})`, statusColor);
    log(`      Response: ${result.responseTime}ms (${result.performance})`, perfColor);
    if (result.sizeDownload > 0) {
      log(`      Size: ${(result.sizeDownload / 1024).toFixed(1)}KB`, colors.reset);
    }
    if (result.error) {
      log(`      Error: ${result.error}`, colors.red);
    }
  }

  // Overall assessment
  const criticalEndpoints = results.filter(r => r.endpoint.critical);
  const healthyEndpoints = criticalEndpoints.filter(r => r.status === 'HEALTHY');
  const avgResponseTime = results.filter(r => r.responseTime > 0)
                                .reduce((sum, r) => sum + r.responseTime, 0) /
                                results.filter(r => r.responseTime > 0).length;

  log(`\\n📈 Overall System Status:`, colors.cyan);

  if (healthyEndpoints.length === criticalEndpoints.length) {
    log(`   ✅ ALL SYSTEMS OPERATIONAL`, colors.green);
    log(`   🚀 Austin Move Finder is ready for customers!`, colors.green);
  } else {
    log(`   ❌ SYSTEM DEGRADED`, colors.red);
    log(`   🚨 ${criticalEndpoints.length - healthyEndpoints.length} critical endpoint(s) down`, colors.red);
  }

  if (avgResponseTime > 0) {
    log(`   ⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`,
        avgResponseTime < 500 ? colors.green :
        avgResponseTime < 1000 ? colors.yellow : colors.red);
  }

  // Austin-specific alerts
  if (conditions.trafficLevel === 'VERY HIGH' && avgResponseTime > 1000) {
    log(`\\n🚨 AUSTIN PEAK TRAFFIC ALERT:`, colors.red);
    log(`   High traffic + slow responses detected`, colors.red);
    log(`   Consider immediate scaling actions`, colors.red);
  }

  if (conditions.isPeakSeason && !conditions.isBusinessHours) {
    log(`\\n📞 After-Hours Peak Season:`, colors.yellow);
    log(`   Monitor for overnight quote submissions`, colors.yellow);
    log(`   Ensure email systems are operational`, colors.yellow);
  }

  return {
    conditions,
    results,
    summary: {
      healthy: healthyEndpoints.length === criticalEndpoints.length,
      avgResponseTime: Math.round(avgResponseTime || 0),
      timestamp: new Date().toISOString()
    }
  };
}

// Export for use in other scripts
export { runAustinMonitoring, analyzeAustinTrafficConditions };

// Run monitoring if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAustinMonitoring().catch(error => {
    log(`\\n❌ Monitoring failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}
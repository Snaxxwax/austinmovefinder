#!/usr/bin/env node

/**
 * Austin Move Finder Backup Manager
 * Automated backup and disaster recovery for production data
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BACKEND_PATH = path.resolve(PROJECT_ROOT, 'backend');

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

function getAustinTimestamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[\\/:]/g, '-').replace(/[, ]/g, '_');
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`📁 Created directory: ${dirPath}`, colors.green);
  }
}

async function backupDatabase() {
  log(`🗄️  Backing up SQLite database...`, colors.cyan);

  const dbPath = path.join(BACKEND_PATH, 'data', 'austinmovefinder.db');
  const backupDir = path.join(BACKEND_PATH, 'backups');
  const timestamp = getAustinTimestamp();
  const backupFileName = `austinmovefinder_${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFileName);

  ensureDirectoryExists(backupDir);

  if (!fs.existsSync(dbPath)) {
    log(`⚠️  Database not found at ${dbPath}`, colors.yellow);
    return null;
  }

  try {
    // Create database backup
    fs.copyFileSync(dbPath, backupPath);
    const stats = fs.statSync(backupPath);

    log(`✅ Database backed up successfully`, colors.green);
    log(`   📄 File: ${backupFileName}`, colors.reset);
    log(`   📊 Size: ${(stats.size / 1024).toFixed(1)}KB`, colors.reset);

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      austinTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      fileName: backupFileName,
      filePath: backupPath,
      size: stats.size,
      type: 'database',
      source: dbPath
    };

    const metadataPath = path.join(backupDir, `${backupFileName}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  } catch (error) {
    log(`❌ Database backup failed: ${error.message}`, colors.red);
    return null;
  }
}

async function backupUploads() {
  log(`📎 Backing up uploaded files...`, colors.cyan);

  const uploadsPath = path.join(BACKEND_PATH, 'uploads');
  const backupDir = path.join(BACKEND_PATH, 'backups');
  const timestamp = getAustinTimestamp();
  const backupFileName = `uploads_${timestamp}.tar.gz`;
  const backupPath = path.join(backupDir, backupFileName);

  ensureDirectoryExists(backupDir);

  if (!fs.existsSync(uploadsPath)) {
    log(`⚠️  Uploads directory not found at ${uploadsPath}`, colors.yellow);
    return null;
  }

  try {
    // Count files to backup
    const fileCount = execSync(`find "${uploadsPath}" -type f | wc -l`, { encoding: 'utf8' }).trim();

    if (fileCount === '0') {
      log(`⚠️  No files to backup in uploads directory`, colors.yellow);
      return null;
    }

    // Create compressed backup
    execSync(`tar -czf "${backupPath}" -C "${BACKEND_PATH}" uploads/`, { stdio: 'pipe' });
    const stats = fs.statSync(backupPath);

    log(`✅ Uploads backed up successfully`, colors.green);
    log(`   📄 File: ${backupFileName}`, colors.reset);
    log(`   📊 Size: ${(stats.size / 1024 / 1024).toFixed(1)}MB`, colors.reset);
    log(`   📋 Files: ${fileCount}`, colors.reset);

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      austinTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      fileName: backupFileName,
      filePath: backupPath,
      size: stats.size,
      fileCount: parseInt(fileCount),
      type: 'uploads',
      source: uploadsPath
    };

    const metadataPath = path.join(backupDir, `${backupFileName}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  } catch (error) {
    log(`❌ Uploads backup failed: ${error.message}`, colors.red);
    return null;
  }
}

async function backupLogs() {
  log(`📝 Backing up application logs...`, colors.cyan);

  const logsPath = path.join(BACKEND_PATH, 'logs');
  const backupDir = path.join(BACKEND_PATH, 'backups');
  const timestamp = getAustinTimestamp();
  const backupFileName = `logs_${timestamp}.tar.gz`;
  const backupPath = path.join(backupDir, backupFileName);

  ensureDirectoryExists(backupDir);

  if (!fs.existsSync(logsPath)) {
    log(`⚠️  Logs directory not found at ${logsPath}`, colors.yellow);
    return null;
  }

  try {
    // Create compressed backup
    execSync(`tar -czf "${backupPath}" -C "${BACKEND_PATH}" logs/`, { stdio: 'pipe' });
    const stats = fs.statSync(backupPath);

    log(`✅ Logs backed up successfully`, colors.green);
    log(`   📄 File: ${backupFileName}`, colors.reset);
    log(`   📊 Size: ${(stats.size / 1024).toFixed(1)}KB`, colors.reset);

    const metadata = {
      timestamp: new Date().toISOString(),
      austinTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
      fileName: backupFileName,
      filePath: backupPath,
      size: stats.size,
      type: 'logs',
      source: logsPath
    };

    const metadataPath = path.join(backupDir, `${backupFileName}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return metadata;
  } catch (error) {
    log(`❌ Logs backup failed: ${error.message}`, colors.red);
    return null;
  }
}

async function cleanupOldBackups(retentionDays = 30) {
  log(`🧹 Cleaning up backups older than ${retentionDays} days...`, colors.cyan);

  const backupDir = path.join(BACKEND_PATH, 'backups');

  if (!fs.existsSync(backupDir)) {
    log(`⚠️  Backup directory not found`, colors.yellow);
    return;
  }

  try {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(backupDir);
    let cleanedCount = 0;
    let cleanedSize = 0;

    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime.getTime() < cutoffTime) {
        cleanedSize += stats.size;
        fs.unlinkSync(filePath);
        cleanedCount++;
        log(`   🗑️  Removed: ${file}`, colors.yellow);
      }
    });

    if (cleanedCount > 0) {
      log(`✅ Cleanup complete: ${cleanedCount} files removed (${(cleanedSize / 1024 / 1024).toFixed(1)}MB freed)`, colors.green);
    } else {
      log(`✅ No old backups to clean up`, colors.green);
    }
  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, colors.red);
  }
}

async function listBackups() {
  log(`\\n${colors.bright}${colors.blue}📋 Austin Move Finder Backup Inventory${colors.reset}\\n`);

  const backupDir = path.join(BACKEND_PATH, 'backups');

  if (!fs.existsSync(backupDir)) {
    log(`📁 No backups directory found`, colors.yellow);
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.db') || file.endsWith('.tar.gz'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const metadataPath = `${filePath}.meta.json`;
      let metadata = null;

      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        } catch (e) {
          // Ignore metadata read errors
        }
      }

      return {
        name: file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        metadata
      };
    })
    .sort((a, b) => b.modified - a.modified);

  if (files.length === 0) {
    log(`📁 No backups found`, colors.yellow);
    return;
  }

  let totalSize = 0;
  const types = { database: 0, uploads: 0, logs: 0, unknown: 0 };

  files.forEach(file => {
    totalSize += file.size;
    const type = file.metadata?.type || 'unknown';
    types[type]++;

    const sizeStr = file.size > 1024 * 1024 ?
      `${(file.size / 1024 / 1024).toFixed(1)}MB` :
      `${(file.size / 1024).toFixed(1)}KB`;

    const typeIcon = type === 'database' ? '🗄️' :
                    type === 'uploads' ? '📎' :
                    type === 'logs' ? '📝' : '❓';

    log(`${typeIcon} ${file.name}`, colors.cyan);
    log(`   📊 Size: ${sizeStr}`, colors.reset);
    log(`   🕐 Date: ${file.modified.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`, colors.reset);
    if (file.metadata?.fileCount) {
      log(`   📋 Files: ${file.metadata.fileCount}`, colors.reset);
    }
    log('');
  });

  log(`📊 Backup Summary:`, colors.bright);
  log(`   🗄️  Database backups: ${types.database}`, colors.green);
  log(`   📎 Upload backups: ${types.uploads}`, colors.green);
  log(`   📝 Log backups: ${types.logs}`, colors.green);
  log(`   📦 Total size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`, colors.green);
}

async function runFullBackup() {
  log(`\\n${colors.bright}${colors.blue}🚚 Austin Move Finder Full Backup${colors.reset}\\n`);

  const austinTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  log(`🕐 Austin Time: ${austinTime}`, colors.cyan);

  const results = {
    timestamp: new Date().toISOString(),
    austinTime,
    backups: [],
    success: true
  };

  // Run all backup operations
  const dbBackup = await backupDatabase();
  if (dbBackup) results.backups.push(dbBackup);

  const uploadsBackup = await backupUploads();
  if (uploadsBackup) results.backups.push(uploadsBackup);

  const logsBackup = await backupLogs();
  if (logsBackup) results.backups.push(logsBackup);

  // Cleanup old backups
  await cleanupOldBackups();

  // Summary
  log(`\\n📊 Backup Summary:`, colors.bright);
  if (results.backups.length > 0) {
    const totalSize = results.backups.reduce((sum, backup) => sum + backup.size, 0);
    log(`✅ ${results.backups.length} backup(s) created successfully`, colors.green);
    log(`📦 Total backup size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`, colors.green);
    log(`🏠 All Austin Move Finder data secured!`, colors.magenta);
  } else {
    log(`⚠️  No backups were created`, colors.yellow);
    results.success = false;
  }

  return results;
}

// CLI Interface
const command = process.argv[2];

switch (command) {
  case 'full':
    runFullBackup().catch(error => {
      log(`\\n❌ Backup failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  case 'database':
    backupDatabase().catch(error => {
      log(`\\n❌ Database backup failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  case 'uploads':
    backupUploads().catch(error => {
      log(`\\n❌ Uploads backup failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  case 'logs':
    backupLogs().catch(error => {
      log(`\\n❌ Logs backup failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  case 'list':
    listBackups().catch(error => {
      log(`\\n❌ List backups failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  case 'cleanup':
    const days = parseInt(process.argv[3]) || 30;
    cleanupOldBackups(days).catch(error => {
      log(`\\n❌ Cleanup failed: ${error.message}`, colors.red);
      process.exit(1);
    });
    break;

  default:
    log(`${colors.bright}Austin Move Finder Backup Manager${colors.reset}\\n`, colors.blue);
    log(`Usage:`, colors.cyan);
    log(`  node scripts/backup-manager.js full              - Run full backup`);
    log(`  node scripts/backup-manager.js database          - Backup database only`);
    log(`  node scripts/backup-manager.js uploads           - Backup uploads only`);
    log(`  node scripts/backup-manager.js logs              - Backup logs only`);
    log(`  node scripts/backup-manager.js list              - List all backups`);
    log(`  node scripts/backup-manager.js cleanup [days]    - Clean up old backups (default: 30 days)`);
    break;
}

export { runFullBackup, backupDatabase, backupUploads, backupLogs, listBackups, cleanupOldBackups };
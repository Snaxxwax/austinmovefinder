#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Verifying Austin Move Finder Astro Setup...\n');

const checks = [
  // Core files
  { file: 'package.json', desc: 'Package configuration' },
  { file: 'astro.config.mjs', desc: 'Astro configuration' },
  { file: 'tsconfig.json', desc: 'TypeScript configuration' },
  { file: 'wrangler.toml', desc: 'Cloudflare configuration' },

  // Layout components
  { file: 'src/components/layout/BaseLayout.astro', desc: 'Base layout component' },
  { file: 'src/components/layout/Header.astro', desc: 'Header component' },
  { file: 'src/components/layout/Footer.astro', desc: 'Footer component' },

  // UI components
  { file: 'src/components/ui/HeroSection.astro', desc: 'Hero section component' },
  { file: 'src/components/ui/FeatureCard.astro', desc: 'Feature card component' },

  // Pages
  { file: 'src/pages/index.astro', desc: 'Home page' },

  // Content collections
  { file: 'src/content/config.ts', desc: 'Content collections config' },
  { file: 'src/content/blog/ultimate-austin-moving-checklist.md', desc: 'Sample blog post' },

  // Serverless function
  { file: 'functions/api/submit.ts', desc: 'Form submission handler' },

  // CMS configuration
  { file: 'public/admin/index.html', desc: 'CMS interface' },
  { file: 'public/admin/config.yml', desc: 'CMS configuration' },

  // Assets
  { file: 'public/logo.png', desc: 'Site logo' },
  { file: 'public/hero-background.png', desc: 'Hero background image' },
];

let allPassed = true;

checks.forEach(({ file, desc }) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${desc} - ${file}`);
  } else {
    console.log(`❌ ${desc} - ${file} (MISSING)`);
    allPassed = false;
  }
});

console.log('\n📊 Setup Summary:');
console.log(`Total checks: ${checks.length}`);
console.log(`Passed: ${checks.filter(({ file }) => fs.existsSync(path.join(__dirname, file))).length}`);
console.log(`Failed: ${checks.filter(({ file }) => !fs.existsSync(path.join(__dirname, file))).length}`);

if (allPassed) {
  console.log('\n🎉 All checks passed! Your Astro setup is ready.');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Copy .env.example to .env and configure');
  console.log('3. Run: npm run dev');
  console.log('4. Visit: http://localhost:4321');
} else {
  console.log('\n⚠️  Some files are missing. Please review the setup.');
}

console.log('\n📝 For deployment:');
console.log('1. Connect repo to Cloudflare Pages');
console.log('2. Set build command: npm run build');
console.log('3. Set output directory: dist');
console.log('4. Configure environment variables');
console.log('5. Set up R2 bucket for form storage');
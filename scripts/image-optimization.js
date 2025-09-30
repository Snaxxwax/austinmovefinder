#!/usr/bin/env node

// Image optimization script for converting PNG to WebP
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, "..", "legacy");
const OUTPUT_DIR = path.join(__dirname, "..", "public");

// Image optimization settings
const QUALITY_SETTINGS = {
  "hero-background.png": { quality: 75, resize: "1920x1080" },
  "logo.png": { quality: 85, resize: "200x200" },
  "icon-form.png": { quality: 80, resize: "90x90" },
  "icon-quotes.png": { quality: 80, resize: "90x90" },
  "icon-mover.png": { quality: 80, resize: "90x90" },
  "icon-trusted.png": { quality: 80, resize: "90x90" },
  "icon-save-money.png": { quality: 80, resize: "90x90" },
  "icon-no-obligation.png": { quality: 80, resize: "90x90" },
};

async function optimizeImages() {
  console.log("🖼️  Starting image optimization...");

  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Get all PNG files from legacy directory
    const files = await fs.readdir(INPUT_DIR);
    const pngFiles = files.filter((file) => file.endsWith(".png"));

    for (const file of pngFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputWebP = path.join(OUTPUT_DIR, file.replace(".png", ".webp"));
      const outputJPG = path.join(OUTPUT_DIR, file.replace(".png", ".jpg"));

      const settings = QUALITY_SETTINGS[file] || { quality: 80, resize: null };

      console.log(`📸 Processing ${file}...`);

      try {
        // Create WebP version
        let webpCommand = `npx sharp -i "${inputPath}" -o "${outputWebP}" -f webp -q ${settings.quality}`;
        if (settings.resize) {
          webpCommand += ` --resize ${settings.resize}`;
        }
        execSync(webpCommand, { stdio: "pipe" });

        // Create JPEG fallback
        let jpgCommand = `npx sharp -i "${inputPath}" -o "${outputJPG}" -f jpeg -q ${settings.quality}`;
        if (settings.resize) {
          jpgCommand += ` --resize ${settings.resize}`;
        }
        execSync(jpgCommand, { stdio: "pipe" });

        // Get file sizes
        const originalStats = await fs.stat(inputPath);
        const webpStats = await fs.stat(outputWebP);
        const jpgStats = await fs.stat(outputJPG);

        const originalSize = (originalStats.size / 1024).toFixed(1);
        const webpSize = (webpStats.size / 1024).toFixed(1);
        const jpgSize = (jpgStats.size / 1024).toFixed(1);
        const webpSavings = (
          ((originalStats.size - webpStats.size) / originalStats.size) *
          100
        ).toFixed(1);
        const jpgSavings = (
          ((originalStats.size - jpgStats.size) / originalStats.size) *
          100
        ).toFixed(1);

        console.log(`   ✅ ${file}`);
        console.log(`      Original: ${originalSize}KB`);
        console.log(`      WebP: ${webpSize}KB (${webpSavings}% savings)`);
        console.log(`      JPEG: ${jpgSize}KB (${jpgSavings}% savings)`);
      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error.message);

        // Fallback: copy original file
        const fallbackOutput = path.join(OUTPUT_DIR, file);
        await fs.copyFile(inputPath, fallbackOutput);
        console.log(`   📋 Copied original ${file} as fallback`);
      }
    }

    console.log("🎉 Image optimization complete!");
    await generateImageSizeReport();
  } catch (error) {
    console.error("❌ Image optimization failed:", error);
    process.exit(1);
  }
}

async function generateImageSizeReport() {
  console.log("\n📊 Image Size Report:");
  console.log("====================");

  const files = await fs.readdir(OUTPUT_DIR);
  const imageFiles = files.filter(
    (file) =>
      file.endsWith(".webp") || file.endsWith(".jpg") || file.endsWith(".png"),
  );

  let totalSize = 0;
  const report = [];

  for (const file of imageFiles) {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = await fs.stat(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    totalSize += stats.size;

    report.push({ file, size: parseFloat(sizeKB) });
  }

  // Sort by size (largest first)
  report.sort((a, b) => b.size - a.size);

  report.forEach(({ file, size }) => {
    const icon = size > 100 ? "🔴" : size > 50 ? "🟡" : "🟢";
    console.log(`${icon} ${file}: ${size}KB`);
  });

  console.log(
    `\n📈 Total optimized images size: ${(totalSize / 1024).toFixed(1)}KB`,
  );

  // Performance recommendations
  if (totalSize > 500 * 1024) {
    console.log("\n⚠️  Warning: Total image size > 500KB");
    console.log("   Consider further optimization for better performance");
  } else {
    console.log("\n✅ Good: Total image size is within recommended limits");
  }
}

// Run optimization if script is called directly
if (process.argv[1] === __filename) {
  optimizeImages();
}

export default optimizeImages;

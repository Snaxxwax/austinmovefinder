#!/usr/bin/env node

// Build analysis script for bundle size and performance metrics
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeBuild() {
  console.log("📊 Starting build analysis...");

  try {
    // Build the project
    console.log("🔨 Building project...");
    execSync("npm run build", { stdio: "inherit" });

    const distPath = path.join(__dirname, "..", "dist");
    const analysis = await generateBuildAnalysis(distPath);

    console.log("\n📈 Build Analysis Report");
    console.log("========================");

    // File size analysis
    console.log("\n📁 File Sizes:");
    analysis.files.forEach((file) => {
      const sizeIcon = file.size > 100 ? "🔴" : file.size > 50 ? "🟡" : "🟢";
      console.log(`${sizeIcon} ${file.name}: ${file.size}KB`);
    });

    console.log(`\n📊 Total bundle size: ${analysis.totalSize}KB`);
    console.log(`🖼️  Total image size: ${analysis.imageSize}KB`);
    console.log(`📄 Total HTML size: ${analysis.htmlSize}KB`);
    console.log(`🎨 Total CSS size: ${analysis.cssSize}KB`);
    console.log(`⚡ Total JS size: ${analysis.jsSize}KB`);

    // Performance recommendations
    console.log("\n💡 Performance Recommendations:");

    if (analysis.totalSize > 1000) {
      console.log("⚠️  Bundle size > 1MB - Consider code splitting");
    } else {
      console.log("✅ Bundle size is good");
    }

    if (analysis.imageSize > 500) {
      console.log("⚠️  Image size > 500KB - Consider further optimization");
    } else {
      console.log("✅ Image sizes are optimized");
    }

    if (analysis.jsSize > 200) {
      console.log("⚠️  JavaScript size > 200KB - Consider lazy loading");
    } else {
      console.log("✅ JavaScript size is good");
    }

    // Generate detailed report
    await generateDetailedReport(analysis);
  } catch (error) {
    console.error("❌ Build analysis failed:", error);
    process.exit(1);
  }
}

async function generateBuildAnalysis(distPath) {
  const files = await getAllFiles(distPath);
  const analysis = {
    files: [],
    totalSize: 0,
    imageSize: 0,
    htmlSize: 0,
    cssSize: 0,
    jsSize: 0,
  };

  for (const file of files) {
    const stats = await fs.stat(file);
    const relativePath = path.relative(distPath, file);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    const fileInfo = {
      name: relativePath,
      size: sizeKB,
      path: file,
    };

    analysis.files.push(fileInfo);
    analysis.totalSize += sizeKB;

    // Categorize by file type
    const ext = path.extname(file).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"].includes(ext)) {
      analysis.imageSize += sizeKB;
    } else if (ext === ".html") {
      analysis.htmlSize += sizeKB;
    } else if (ext === ".css") {
      analysis.cssSize += sizeKB;
    } else if (ext === ".js") {
      analysis.jsSize += sizeKB;
    }
  }

  // Round totals
  analysis.totalSize = Math.round(analysis.totalSize * 100) / 100;
  analysis.imageSize = Math.round(analysis.imageSize * 100) / 100;
  analysis.htmlSize = Math.round(analysis.htmlSize * 100) / 100;
  analysis.cssSize = Math.round(analysis.cssSize * 100) / 100;
  analysis.jsSize = Math.round(analysis.jsSize * 100) / 100;

  return analysis;
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function generateDetailedReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: analysis.files.length,
      totalSizeKB: analysis.totalSize,
      breakdown: {
        images: analysis.imageSize,
        html: analysis.htmlSize,
        css: analysis.cssSize,
        javascript: analysis.jsSize,
      },
    },
    files: analysis.files,
    recommendations: generateRecommendations(analysis),
  };

  const reportPath = path.join(__dirname, "..", "build-analysis.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: build-analysis.json`);
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.totalSize > 1000) {
    recommendations.push({
      type: "bundle-size",
      severity: "warning",
      message:
        "Bundle size exceeds 1MB. Consider implementing code splitting and lazy loading.",
      action: "Implement dynamic imports for non-critical components",
    });
  }

  if (analysis.imageSize > 500) {
    recommendations.push({
      type: "image-optimization",
      severity: "warning",
      message: "Image assets exceed 500KB. Consider further optimization.",
      action: "Use responsive images and modern formats (WebP, AVIF)",
    });
  }

  if (analysis.jsSize > 200) {
    recommendations.push({
      type: "javascript-size",
      severity: "info",
      message:
        "JavaScript bundle is getting large. Monitor and optimize as needed.",
      action: "Consider tree shaking and removing unused dependencies",
    });
  }

  // Find largest files
  const largestFiles = analysis.files
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .filter((file) => file.size > 50);

  if (largestFiles.length > 0) {
    recommendations.push({
      type: "large-files",
      severity: "info",
      message: `Largest files: ${largestFiles.map((f) => f.name).join(", ")}`,
      action: "Review largest files for optimization opportunities",
    });
  }

  return recommendations;
}

// Run analysis if script is called directly
if (process.argv[1] === __filename) {
  analyzeBuild();
}

export default analyzeBuild;

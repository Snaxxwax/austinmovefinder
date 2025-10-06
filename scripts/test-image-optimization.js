#!/usr/bin/env node

/**
 * Image Optimization Test Script
 * Validates that all WebP images are properly generated and accessible
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdir, stat, access } from "fs/promises";
import { createServer } from "http";
import { performance } from "perf_hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const publicDir = join(projectRoot, "public");

class ImageOptimizationTester {
  constructor() {
    this.results = {
      webpGenerated: [],
      sizeSavings: [],
      accessibilityTests: [],
      performanceMetrics: {},
      errors: [],
    };
  }

  async runAllTests() {
    console.log("🔍 Starting Image Optimization Tests...\n");

    try {
      await this.testWebPGeneration();
      await this.testSizeSavings();
      await this.testImageAccessibility();
      await this.generateReport();
    } catch (error) {
      console.error("❌ Test execution failed:", error.message);
      this.results.errors.push(error.message);
    }

    return this.results;
  }

  async testWebPGeneration() {
    console.log("📸 Testing WebP Generation...");

    try {
      const files = await readdir(publicDir);
      const pngFiles = files.filter((f) => f.endsWith(".png"));
      const webpFiles = files.filter((f) => f.endsWith(".webp"));

      for (const pngFile of pngFiles) {
        const webpFile = pngFile.replace(".png", ".webp");
        const hasWebP = webpFiles.includes(webpFile);

        this.results.webpGenerated.push({
          original: pngFile,
          webp: webpFile,
          generated: hasWebP,
          status: hasWebP ? "✅" : "❌",
        });

        console.log(`  ${hasWebP ? "✅" : "❌"} ${pngFile} → ${webpFile}`);
      }

      const successCount = this.results.webpGenerated.filter(
        (r) => r.generated,
      ).length;
      console.log(
        `\n📊 WebP Generation: ${successCount}/${pngFiles.length} successful\n`,
      );
    } catch (error) {
      this.results.errors.push(`WebP generation test failed: ${error.message}`);
      console.error("❌ WebP generation test failed:", error.message);
    }
  }

  async testSizeSavings() {
    console.log("💾 Testing File Size Savings...");

    try {
      const files = await readdir(publicDir);
      const imageFiles = files.filter(
        (f) => f.endsWith(".png") || f.endsWith(".webp"),
      );

      for (const file of imageFiles) {
        const filePath = join(publicDir, file);
        const stats = await stat(filePath);
        const sizeKB = Math.round(stats.size / 1024);

        if (file.endsWith(".png")) {
          const webpFile = file.replace(".png", ".webp");
          const webpPath = join(publicDir, webpFile);

          try {
            await access(webpPath);
            const webpStats = await stat(webpPath);
            const webpSizeKB = Math.round(webpStats.size / 1024);
            const savings = Math.round(((sizeKB - webpSizeKB) / sizeKB) * 100);

            this.results.sizeSavings.push({
              original: file,
              originalSize: `${sizeKB}KB`,
              webpSize: `${webpSizeKB}KB`,
              savings: `${savings}%`,
              status: savings > 0 ? "✅" : "⚠️",
            });

            console.log(
              `  ${savings > 0 ? "✅" : "⚠️"} ${file}: ${sizeKB}KB → ${webpSizeKB}KB (${savings}% savings)`,
            );
          } catch {
            // WebP file doesn't exist
          }
        }
      }

      const avgSavings =
        this.results.sizeSavings.reduce((acc, curr) => {
          return acc + parseInt(curr.savings);
        }, 0) / this.results.sizeSavings.length;

      console.log(`\n📊 Average size savings: ${Math.round(avgSavings)}%\n`);
    } catch (error) {
      this.results.errors.push(`Size savings test failed: ${error.message}`);
      console.error("❌ Size savings test failed:", error.message);
    }
  }

  async testImageAccessibility() {
    console.log("🌐 Testing Image Accessibility...");

    // Start a temporary server to test image accessibility
    const server = createServer((req, res) => {
      const filePath = join(publicDir, req.url);

      stat(filePath)
        .then((stats) => {
          if (stats.isFile()) {
            res.writeHead(200, { "Content-Type": this.getMimeType(req.url) });
            res.end("OK");
          } else {
            res.writeHead(404);
            res.end("Not Found");
          }
        })
        .catch(() => {
          res.writeHead(404);
          res.end("Not Found");
        });
    });

    return new Promise((resolve) => {
      server.listen(0, async () => {
        const port = server.address().port;
        const baseUrl = `http://localhost:${port}`;

        try {
          const testImages = [
            "/hero-background.webp",
            "/logo.webp",
            "/icon-form.webp",
            "/icon-quotes.webp",
            "/icon-mover.webp",
            "/icon-trusted.webp",
            "/icon-save-money.webp",
            "/icon-no-obligation.webp",
          ];

          for (const imagePath of testImages) {
            const startTime = performance.now();

            try {
              const response = await fetch(`${baseUrl}${imagePath}`);
              const endTime = performance.now();
              const loadTime = Math.round(endTime - startTime);

              this.results.accessibilityTests.push({
                path: imagePath,
                status: response.status,
                accessible: response.ok,
                loadTime: `${loadTime}ms`,
                result: response.ok ? "✅" : "❌",
              });

              console.log(
                `  ${response.ok ? "✅" : "❌"} ${imagePath} (${response.status}) - ${loadTime}ms`,
              );
            } catch (error) {
              this.results.accessibilityTests.push({
                path: imagePath,
                status: "ERROR",
                accessible: false,
                error: error.message,
                result: "❌",
              });

              console.log(`  ❌ ${imagePath} - ERROR: ${error.message}`);
            }
          }

          const successCount = this.results.accessibilityTests.filter(
            (r) => r.accessible,
          ).length;
          console.log(
            `\n📊 Accessibility: ${successCount}/${testImages.length} images accessible\n`,
          );
        } catch (error) {
          this.results.errors.push(
            `Accessibility test failed: ${error.message}`,
          );
          console.error("❌ Accessibility test failed:", error.message);
        } finally {
          server.close();
          resolve();
        }
      });
    });
  }

  getMimeType(url) {
    const ext = url.split(".").pop().toLowerCase();
    const mimeTypes = {
      webp: "image/webp",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  async generateReport() {
    console.log("📋 Test Report Summary");
    console.log("=".repeat(50));

    // WebP Generation Summary
    const webpSuccess = this.results.webpGenerated.filter(
      (r) => r.generated,
    ).length;
    const webpTotal = this.results.webpGenerated.length;
    console.log(
      `\n🖼️  WebP Generation: ${webpSuccess}/${webpTotal} (${Math.round((webpSuccess / webpTotal) * 100)}%)`,
    );

    // Size Savings Summary
    if (this.results.sizeSavings.length > 0) {
      const avgSavings =
        this.results.sizeSavings.reduce((acc, curr) => {
          return acc + parseInt(curr.savings);
        }, 0) / this.results.sizeSavings.length;

      const totalOriginalSize = this.results.sizeSavings.reduce((acc, curr) => {
        return acc + parseInt(curr.originalSize);
      }, 0);

      const totalWebpSize = this.results.sizeSavings.reduce((acc, curr) => {
        return acc + parseInt(curr.webpSize);
      }, 0);

      console.log(`💾 Average Size Savings: ${Math.round(avgSavings)}%`);
      console.log(
        `📊 Total Size Reduction: ${totalOriginalSize}KB → ${totalWebpSize}KB`,
      );
    }

    // Accessibility Summary
    const accessibleCount = this.results.accessibilityTests.filter(
      (r) => r.accessible,
    ).length;
    const accessibleTotal = this.results.accessibilityTests.length;
    console.log(
      `🌐 Image Accessibility: ${accessibleCount}/${accessibleTotal} (${Math.round((accessibleCount / accessibleTotal) * 100)}%)`,
    );

    // Error Summary
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors Found: ${this.results.errors.length}`);
      this.results.errors.forEach((error) => console.log(`   • ${error}`));
    } else {
      console.log(`\n✅ No errors found!`);
    }

    // Performance Recommendations
    console.log("\n🚀 Performance Recommendations:");
    if (this.results.sizeSavings.length > 0) {
      const avgSavings =
        this.results.sizeSavings.reduce((acc, curr) => {
          return acc + parseInt(curr.savings);
        }, 0) / this.results.sizeSavings.length;

      if (avgSavings > 80) {
        console.log("   ✅ Excellent file size optimization");
      } else if (avgSavings > 60) {
        console.log("   ⚠️  Good optimization, consider further compression");
      } else {
        console.log(
          "   ❌ Poor optimization, review image compression settings",
        );
      }
    }

    console.log(
      "   💡 Consider implementing lazy loading for below-fold images",
    );
    console.log("   💡 Use responsive images with multiple size variants");
    console.log("   💡 Implement proper image preloading for critical images");

    console.log("\n=".repeat(50));
    console.log("✅ Image optimization test completed!");
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ImageOptimizationTester();
  tester.runAllTests().catch(console.error);
}

export default ImageOptimizationTester;

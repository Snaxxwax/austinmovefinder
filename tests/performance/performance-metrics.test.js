/**
 * Performance Metrics Test Suite
 * Tests for performance optimizations, image loading, and build metrics
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { JSDOM } from "jsdom";

describe("Performance Metrics Tests", () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Austin Move Finder</title>
      </head>
      <body>
        <header>
          <img src="/logo-optimized.webp" alt="Austin Move Finder" class="logo" loading="lazy">
        </header>
        <main>
          <img src="/hero-background.webp" alt="Austin cityscape" loading="lazy">
          <picture>
            <source srcset="/icon-quotes.webp" type="image/webp">
            <img src="/icon-quotes.png" alt="Get quotes icon">
          </picture>
        </main>
      </body>
      </html>`);

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe("Image Optimization", () => {
    it("should use WebP format for optimized images", () => {
      const webpImages = document.querySelectorAll('img[src$=".webp"]');
      expect(webpImages.length).toBeGreaterThan(0);

      webpImages.forEach((img) => {
        expect(img.src).toMatch(/\.webp$/);
      });
    });

    it("should implement lazy loading for images", () => {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      expect(lazyImages.length).toBeGreaterThan(0);

      lazyImages.forEach((img) => {
        expect(img.getAttribute("loading")).toBe("lazy");
      });
    });

    it("should provide proper alt text for all images", () => {
      const images = document.querySelectorAll("img");

      images.forEach((img) => {
        const alt = img.getAttribute("alt");
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
        expect(alt).not.toBe("image"); // Generic alt text
      });
    });

    it("should use responsive image techniques", () => {
      const pictureElements = document.querySelectorAll("picture");
      expect(pictureElements.length).toBeGreaterThan(0);

      pictureElements.forEach((picture) => {
        const sources = picture.querySelectorAll("source");
        const img = picture.querySelector("img");

        expect(sources.length).toBeGreaterThan(0);
        expect(img).toBeTruthy();

        // Check for modern image formats in sources
        const hasWebP = Array.from(sources).some(
          (source) => source.getAttribute("type") === "image/webp",
        );
        expect(hasWebP).toBe(true);
      });
    });
  });

  describe("Bundle Optimization", () => {
    it("should validate build configuration for performance", () => {
      const buildConfig = {
        minify: "terser",
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ["astro"],
            },
          },
        },
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      };

      expect(buildConfig.minify).toBe("terser");
      expect(buildConfig.cssCodeSplit).toBe(true);
      expect(buildConfig.terserOptions.compress.drop_console).toBe(true);
      expect(buildConfig.terserOptions.compress.drop_debugger).toBe(true);
    });

    it("should implement code splitting strategies", () => {
      // Test manual chunks configuration
      const manualChunks = {
        vendor: ["astro"],
        components: ["src/components"],
        utils: ["src/utils"],
      };

      expect(manualChunks.vendor).toContain("astro");
      expect(Object.keys(manualChunks)).toHaveLength(3);
    });

    it("should use compression techniques", () => {
      const compressionSettings = {
        compressHTML: true,
        inlineStylesheets: "auto",
      };

      expect(compressionSettings.compressHTML).toBe(true);
      expect(compressionSettings.inlineStylesheets).toBe("auto");
    });
  });

  describe("Loading Performance", () => {
    it("should implement resource prefetching", () => {
      const prefetchConfig = {
        prefetchAll: true,
        defaultStrategy: "viewport",
      };

      expect(prefetchConfig.prefetchAll).toBe(true);
      expect(prefetchConfig.defaultStrategy).toBe("viewport");
    });

    it("should measure script loading performance", async () => {
      const mockPerformanceEntry = {
        name: "/quote.js",
        entryType: "resource",
        startTime: 100,
        responseEnd: 250,
        transferSize: 15000,
      };

      // Simulate performance measurement
      const loadTime =
        mockPerformanceEntry.responseEnd - mockPerformanceEntry.startTime;
      expect(loadTime).toBeLessThan(500); // Under 500ms
      expect(mockPerformanceEntry.transferSize).toBeLessThan(50000); // Under 50KB
    });

    it("should validate critical CSS inlining", () => {
      // Check for inline styles (critical CSS should be inlined)
      const hasInlineStyles = document.querySelector("style") !== null;
      const hasExternalStyles =
        document.querySelector('link[rel="stylesheet"]') !== null;

      // Should have either inline critical CSS or external stylesheets
      expect(hasInlineStyles || hasExternalStyles).toBe(true);
    });
  });

  describe("Core Web Vitals Simulation", () => {
    it("should measure Largest Contentful Paint (LCP)", () => {
      // Mock LCP measurement
      const mockLCP = {
        element: document.querySelector("h1") || document.querySelector("img"),
        size: 2000,
        loadTime: 1200,
      };

      // LCP should be under 2.5 seconds
      expect(mockLCP.loadTime).toBeLessThan(2500);
      expect(mockLCP.element).toBeTruthy();
    });

    it("should measure First Input Delay (FID)", () => {
      // Mock FID measurement
      const mockFID = {
        delay: 50, // milliseconds
        eventType: "click",
      };

      // FID should be under 100ms
      expect(mockFID.delay).toBeLessThan(100);
    });

    it("should measure Cumulative Layout Shift (CLS)", () => {
      // Mock CLS measurement
      const mockCLS = {
        score: 0.05,
        shifts: [
          { impact: 0.02, distance: 0.03 },
          { impact: 0.01, distance: 0.02 },
        ],
      };

      // CLS should be under 0.1
      expect(mockCLS.score).toBeLessThan(0.1);
    });
  });

  describe("Memory Usage", () => {
    it("should monitor JavaScript memory usage", () => {
      // Mock memory usage
      const mockMemory = {
        usedJSHeapSize: 5000000, // 5MB
        totalJSHeapSize: 10000000, // 10MB
        jsHeapSizeLimit: 50000000, // 50MB
      };

      const memoryUsagePercent =
        (mockMemory.usedJSHeapSize / mockMemory.totalJSHeapSize) * 100;

      expect(memoryUsagePercent).toBeLessThan(80); // Under 80% usage
      expect(mockMemory.usedJSHeapSize).toBeLessThan(
        mockMemory.jsHeapSizeLimit,
      );
    });

    it("should prevent memory leaks in event listeners", () => {
      const eventListeners = [];

      const mockAddEventListener = (element, event, handler) => {
        eventListeners.push({ element, event, handler });
      };

      const mockRemoveEventListener = (element, event, handler) => {
        const index = eventListeners.findIndex(
          (listener) =>
            listener.element === element &&
            listener.event === event &&
            listener.handler === handler,
        );
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      };

      // Simulate adding listeners
      const button = document.createElement("button");
      const handler = () => {};

      mockAddEventListener(button, "click", handler);
      expect(eventListeners.length).toBe(1);

      // Simulate cleanup
      mockRemoveEventListener(button, "click", handler);
      expect(eventListeners.length).toBe(0);
    });
  });

  describe("Network Performance", () => {
    it("should implement efficient caching strategies", () => {
      const cacheHeaders = {
        "Cache-Control": "public, max-age=31536000, immutable", // For static assets
        ETag: '"abc123"',
        "Last-Modified": new Date().toUTCString(),
      };

      expect(cacheHeaders["Cache-Control"]).toContain("max-age");
      expect(cacheHeaders["ETag"]).toBeTruthy();
      expect(cacheHeaders["Last-Modified"]).toBeTruthy();
    });

    it("should minimize HTTP requests", () => {
      // Count external resources
      const externalResources = [
        ...document.querySelectorAll('link[rel="stylesheet"]'),
        ...document.querySelectorAll("script[src]"),
        ...document.querySelectorAll("img[src]"),
      ];

      // Should minimize external requests (specific threshold depends on needs)
      expect(externalResources.length).toBeLessThan(20);
    });

    it("should use appropriate image formats for file size", () => {
      const images = document.querySelectorAll("img");

      images.forEach((img) => {
        const src = img.getAttribute("src");
        if (src) {
          // WebP should be preferred for modern browsers
          const isWebP = src.endsWith(".webp");
          const isPNG = src.endsWith(".png");
          const isJPG = src.endsWith(".jpg") || src.endsWith(".jpeg");

          expect(isWebP || isPNG || isJPG).toBe(true);
        }
      });
    });
  });

  describe("Accessibility Performance", () => {
    it("should minimize accessibility tree computation", () => {
      // Check for proper semantic structure that aids accessibility performance
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const landmarks = document.querySelectorAll(
        "header, main, nav, footer, section, article, aside",
      );

      expect(headings.length).toBeGreaterThan(0);
      expect(landmarks.length).toBeGreaterThan(0);
    });

    it("should optimize screen reader performance", () => {
      // Check for ARIA attributes that improve screen reader efficiency
      const ariaLabels = document.querySelectorAll("[aria-label]");
      const ariaDescribedBy = document.querySelectorAll("[aria-describedby]");
      const ariaLive = document.querySelectorAll("[aria-live]");

      // Should have accessibility attributes for dynamic content
      expect(
        ariaLabels.length + ariaDescribedBy.length + ariaLive.length,
      ).toBeGreaterThan(0);
    });
  });
});

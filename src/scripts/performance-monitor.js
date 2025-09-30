// Performance monitoring and Core Web Vitals optimization
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
    };

    this.init();
  }

  init() {
    // Only run in browsers that support the APIs
    if (typeof window === "undefined") return;

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.optimizeImages();
    this.preloadCriticalResources();
  }

  // Largest Contentful Paint
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric("LCP", lastEntry.startTime);
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP monitoring not supported");
    }
  }

  // First Input Delay
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric("FID", this.metrics.fid);
        });
      });

      observer.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID monitoring not supported");
    }
  }

  // Cumulative Layout Shift
  observeCLS() {
    try {
      let clsValue = 0;
      let clsEntries = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;
          }
        });

        this.metrics.cls = clsValue;
        this.reportMetric("CLS", clsValue);
      });

      observer.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS monitoring not supported");
    }
  }

  // First Contentful Paint
  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.metrics.fcp = entry.startTime;
            this.reportMetric("FCP", entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ["paint"] });
    } catch (e) {
      console.warn("FCP monitoring not supported");
    }
  }

  // Time to First Byte
  observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            this.metrics.ttfb = entry.responseStart - entry.requestStart;
            this.reportMetric("TTFB", this.metrics.ttfb);
          }
        });
      });

      observer.observe({ entryTypes: ["navigation"] });
    } catch (e) {
      console.warn("TTFB monitoring not supported");
    }
  }

  // Report metrics to analytics (placeholder)
  reportMetric(name, value) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag("event", "web_vital", {
        name: name,
        value: Math.round(value),
        event_category: "Web Vitals",
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === "development") {
      console.log(`${name}: ${Math.round(value)}ms`);
    }
  }

  // Optimize images for better performance
  optimizeImages() {
    // Lazy load images that are not critical
    const images = document.querySelectorAll("img[data-src]");

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove("lazy");
            img.classList.add("loaded");
            observer.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach((img) => {
        img.src = img.dataset.src;
        img.classList.add("loaded");
      });
    }
  }

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      { href: "/hero-background.webp", as: "image", type: "image/webp" },
      { href: "/logo-optimized.webp", as: "image", type: "image/webp" },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;

      // Only add if not already present
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }

  // Optimize font loading
  optimizeFonts() {
    // Preload critical fonts
    const fontPreloads = [
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
    ];

    fontPreloads.forEach((fontUrl) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = fontUrl;
      link.as = "style";
      link.onload = function () {
        this.rel = "stylesheet";
      };

      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        document.head.appendChild(link);
      }
    });
  }

  // Monitor resource loading
  monitorResources() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Track slow resources
        if (entry.duration > 1000) {
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
        }

        // Track failed resources
        if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
          console.error(`Failed to load: ${entry.name}`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch (e) {
      console.warn("Resource monitoring not supported");
    }
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Send metrics to server
  async sendMetrics() {
    try {
      const metricsData = {
        ...this.metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      // Only send if we have meaningful data
      if (Object.values(this.metrics).some((value) => value !== null)) {
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metricsData),
        });
      }
    } catch (error) {
      console.warn("Failed to send metrics:", error);
    }
  }
}

// Initialize performance monitoring
if (typeof window !== "undefined") {
  const performanceMonitor = new PerformanceMonitor();

  // Send metrics before page unload
  window.addEventListener("beforeunload", () => {
    performanceMonitor.sendMetrics();
  });

  // Send metrics after page is fully loaded
  window.addEventListener("load", () => {
    setTimeout(() => {
      performanceMonitor.sendMetrics();
    }, 5000);
  });

  // Make available globally for debugging
  window.performanceMonitor = performanceMonitor;
}

export default PerformanceMonitor;

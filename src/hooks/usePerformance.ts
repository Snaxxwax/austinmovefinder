import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface NavigationTiming {
  dns: number;
  tcp: number;
  ttfb: number;
  domContentLoaded: number;
  load: number;
}

// Hook for monitoring Core Web Vitals and performance metrics
export const usePerformance = (enableLogging: boolean = import.meta.env.DEV) => {
  useEffect(() => {
    if (!enableLogging) return;

    let metrics: PerformanceMetrics = {};

    // Monitor Core Web Vitals using the new Web Vitals API
    const observeWebVitals = () => {
      // First Contentful Paint (FCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
            console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
          console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore - processingStart is not in the type definition yet
          const fid = entry.processingStart - entry.startTime;
          metrics.fid = fid;
          console.log(`⚡ First Input Delay: ${fid.toFixed(2)}ms`);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore - value and hadRecentInput are not in the type definition yet
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.cls = clsValue;
        console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Monitor Navigation Timing
    const observeNavigationTiming = () => {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

          if (navigation) {
            const timing: NavigationTiming = {
              dns: navigation.domainLookupEnd - navigation.domainLookupStart,
              tcp: navigation.connectEnd - navigation.connectStart,
              ttfb: navigation.responseStart - navigation.requestStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              load: navigation.loadEventEnd - navigation.fetchStart
            };

            metrics.ttfb = timing.ttfb;

            console.group('🚀 Austin Move Finder Performance Metrics');
            console.log(`DNS Lookup: ${timing.dns.toFixed(2)}ms`);
            console.log(`TCP Connect: ${timing.tcp.toFixed(2)}ms`);
            console.log(`Time to First Byte: ${timing.ttfb.toFixed(2)}ms`);
            console.log(`DOM Content Loaded: ${timing.domContentLoaded.toFixed(2)}ms`);
            console.log(`Page Load Complete: ${timing.load.toFixed(2)}ms`);
            console.groupEnd();

            // Analyze Austin Move Finder specific performance
            analyzeAustinAppPerformance(timing, metrics);
          }
        }, 0);
      });
    };

    // Monitor resource loading
    const observeResourceTiming = () => {
      new PerformanceObserver((list) => {
        const resources = list.getEntries() as PerformanceResourceTiming[];

        resources.forEach(resource => {
          const duration = resource.responseEnd - resource.startTime;

          // Log slow resources (> 1 second)
          if (duration > 1000) {
            console.warn(`🐌 Slow resource: ${resource.name} took ${duration.toFixed(2)}ms`);
          }

          // Track specific Austin app resources
          if (resource.name.includes('huggingface') || resource.name.includes('emailjs')) {
            console.log(`📡 API Request: ${resource.name} - ${duration.toFixed(2)}ms`);
          }
        });
      }).observe({ entryTypes: ['resource'] });
    };

    try {
      observeWebVitals();
      observeNavigationTiming();
      observeResourceTiming();
    } catch (error) {
      console.error('Performance monitoring setup failed:', error);
    }

    // Cleanup function
    return () => {
      // Performance observers are automatically cleaned up when the component unmounts
    };
  }, [enableLogging]);
};

// Analyze performance specifically for Austin Move Finder app
const analyzeAustinAppPerformance = (timing: NavigationTiming, metrics: PerformanceMetrics) => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check Core Web Vitals against thresholds
  if (metrics.fcp && metrics.fcp > 1800) {
    issues.push(`FCP is slow (${metrics.fcp.toFixed(2)}ms > 1.8s)`);
    recommendations.push('Consider code splitting and lazy loading');
  }

  if (metrics.lcp && metrics.lcp > 2500) {
    issues.push(`LCP is slow (${metrics.lcp.toFixed(2)}ms > 2.5s)`);
    recommendations.push('Optimize images and critical CSS');
  }

  if (metrics.fid && metrics.fid > 100) {
    issues.push(`FID is slow (${metrics.fid.toFixed(2)}ms > 100ms)`);
    recommendations.push('Reduce JavaScript execution time');
  }

  if (metrics.cls && metrics.cls > 0.1) {
    issues.push(`CLS is high (${metrics.cls.toFixed(4)} > 0.1)`);
    recommendations.push('Add size attributes to images and reserve space for dynamic content');
  }

  // Check specific Austin app timings
  if (timing.ttfb > 800) {
    issues.push(`TTFB is slow (${timing.ttfb.toFixed(2)}ms > 800ms)`);
    recommendations.push('Optimize server response time or use CDN');
  }

  if (timing.load > 5000) {
    issues.push(`Page load is slow (${timing.load.toFixed(2)}ms > 5s)`);
    recommendations.push('Optimize bundle size and critical resources');
  }

  // Report findings
  if (issues.length > 0) {
    console.group('⚠️ Austin Move Finder Performance Issues');
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();

    console.group('💡 Recommendations');
    recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  } else {
    console.log('✅ Austin Move Finder performance is good!');
  }

  // Austin-specific performance tips
  console.group('🏆 Austin Move Finder Optimization Tips');
  console.log('• Austin neighborhoods data should load < 500ms');
  console.log('• Object detection should respond < 3s for good UX');
  console.log('• MediaUpload should show progress for files > 5MB');
  console.log('• Form validation should be instant (<100ms)');
  console.groupEnd();
};

// Hook for measuring specific component performance
export const useComponentPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (import.meta.env.DEV) {
        console.log(`⏱️ ${componentName} render time: ${duration.toFixed(2)}ms`);

        if (duration > 16.67) { // > 1 frame at 60fps
          console.warn(`🐌 ${componentName} may be blocking rendering (${duration.toFixed(2)}ms)`);
        }
      }
    };
  });
};

// Utility to measure async operations
export const measureAsync = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    if (import.meta.env.DEV) {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (import.meta.env.DEV) {
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
};
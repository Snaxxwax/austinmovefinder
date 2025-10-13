// Client-side image optimization and lazy loading enhancement
class ImageOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupResponsiveImages();
    this.setupWebPSupport();
    this.preloadCriticalImages();
  }

  // Enhanced lazy loading with intersection observer
  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              observer.unobserve(img);
            }
          });
        },
        {
          // Start loading when image is 100px away from viewport
          rootMargin: "100px 0px",
          threshold: 0.01,
        },
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  }

  // Load image with error handling and fade-in effect
  loadImage(img) {
    const src = img.dataset.src || img.src;
    if (!src) return;

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = tempImg.src;
      img.classList.add("loaded");
    };
    tempImg.onerror = () => {
      img.classList.add("error");
      // Fallback to original format if WebP fails
      if (src.includes(".webp")) {
        const fallbackSrc = src.replace(".webp", ".png");
        if (fallbackSrc !== src) {
          img.src = fallbackSrc;
        }
      }
    };
    tempImg.src = src;
  }

  // Setup responsive images based on screen size
  setupResponsiveImages() {
    const updateImageSources = () => {
      const images = document.querySelectorAll("img[data-responsive]");
      const devicePixelRatio = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;

      images.forEach((img) => {
        let size = "large";
        if (viewportWidth <= 480) size = "small";
        else if (viewportWidth <= 768) size = "medium";

        const baseSrc = img.dataset.baseSrc;
        if (baseSrc) {
          const extension = baseSrc.split(".").pop();
          const nameWithoutExt = baseSrc.replace(`.${extension}`, "");
          const newSrc = `${nameWithoutExt}-${size}.webp`;

          if (img.src !== newSrc) {
            img.src = newSrc;
          }
        }
      });
    };

    // Update on load and resize
    updateImageSources();
    window.addEventListener("resize", this.debounce(updateImageSources, 250));
  }

  // Check WebP support and update image sources
  setupWebPSupport() {
    const supportsWebP = this.checkWebPSupport();

    if (!supportsWebP) {
      // Fallback to PNG for browsers that don't support WebP
      const webpImages = document.querySelectorAll('img[src*=".webp"]');
      webpImages.forEach((img) => {
        img.src = img.src.replace(".webp", ".png");
      });

      // Also handle source elements in picture tags
      const webpSources = document.querySelectorAll(
        'source[type="image/webp"]',
      );
      webpSources.forEach((source) => {
        source.remove();
      });
    }
  }

  // Check if browser supports WebP
  checkWebPSupport() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  // Preload critical images for better LCP
  preloadCriticalImages() {
    const criticalImages = ["/hero-background.webp", "/logo.webp"];

    const supportsWebP = this.checkWebPSupport();

    criticalImages.forEach((src) => {
      // Don't preload if already preloaded in HTML
      const existingPreload = document.querySelector(
        `link[rel="preload"][href="${src}"]`,
      );
      if (existingPreload) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = supportsWebP ? src : src.replace(".webp", ".png");
      link.type = supportsWebP ? "image/webp" : "image/png";
      document.head.appendChild(link);
    });
  }

  // Utility: Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize image optimizer when DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new ImageOptimizer());
  } else {
    new ImageOptimizer();
  }
}

export default ImageOptimizer;

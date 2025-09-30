// Critical CSS loader and optimization
class CriticalCSSLoader {
  constructor() {
    this.loadNonCriticalCSS();
    this.optimizeFontLoading();
    this.preloadImportantResources();
  }

  // Load non-critical CSS asynchronously
  loadNonCriticalCSS() {
    const nonCriticalCSS = [
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
    ];

    nonCriticalCSS.forEach((href) => {
      this.loadCSSAsync(href);
    });
  }

  // Load CSS file asynchronously
  loadCSSAsync(href) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    link.onload = function () {
      this.rel = "stylesheet";
    };
    document.head.appendChild(link);

    // Fallback for browsers that don't support rel="preload"
    const noscript = document.createElement("noscript");
    const fallbackLink = document.createElement("link");
    fallbackLink.rel = "stylesheet";
    fallbackLink.href = href;
    noscript.appendChild(fallbackLink);
    document.head.appendChild(noscript);
  }

  // Optimize font loading with font-display: swap
  optimizeFontLoading() {
    // Add font-display: swap to existing font faces
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Poppins Regular'), local('Poppins-Regular');
      }
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: local('Poppins SemiBold'), local('Poppins-SemiBold');
      }
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: local('Poppins Bold'), local('Poppins-Bold');
      }
    `;
    document.head.appendChild(style);
  }

  // Preload important resources
  preloadImportantResources() {
    const resources = [
      { href: "/hero-background.webp", as: "image", type: "image/webp" },
      { href: "/favicon.ico", as: "image" },
      {
        href: "https://fonts.gstatic.com",
        rel: "preconnect",
        crossorigin: true,
      },
    ];

    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = resource.rel || "preload";
      link.href = resource.href;
      if (resource.as) link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }
}

// Initialize critical CSS loader
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => new CriticalCSSLoader(),
    );
  } else {
    new CriticalCSSLoader();
  }
}

export default CriticalCSSLoader;

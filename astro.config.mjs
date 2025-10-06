import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://austinmovefinder.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
    imageService: 'compile'
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll use our custom CSS
    }),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
    })
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['austinmovefinder.com'],
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.cloudflare.com'
    }]
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/variables.css";`
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro']
          }
        }
      },
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
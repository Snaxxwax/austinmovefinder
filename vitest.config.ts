/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        '.storybook/',
        'storybook-static/',
      ],
    },
    // Mock environment variables for tests
    env: {
      VITE_HUGGINGFACE_API_KEY: 'test_api_key',
      VITE_BACKEND_URL: 'http://localhost:5000',
      VITE_EMAILJS_SERVICE_ID: 'test_service_id',
      VITE_EMAILJS_TEMPLATE_ID: 'test_template_id',
      VITE_EMAILJS_PUBLIC_KEY: 'test_public_key',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
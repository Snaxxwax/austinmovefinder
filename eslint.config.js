import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".astro",
      "public/build",
      "test-results",
      "playwright.config.js",
      "vitest.config.js",
      "astro.config.mjs",
      "scripts/image-optimization.js",
      "wrangler.toml",
      "functions/",
      "*.d.ts"
    ]
  },
  ...eslintPluginAstro.configs['flat/recommended'],
  {
      // Config for TypeScript files
      files: ['**/*.ts', '**/*.tsx'],
      extends: tseslint.configs.recommended,
  },
  {
    // Global rule overrides
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off'
    }
  }
);
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    modulePreload: {
      // Disable the inline polyfill script — all supported browsers handle
      // <link rel="modulepreload"> natively. This removes the inline script
      // that violates the script-src 'self' CSP directive.
      polyfill: false,
    },
  },
  test: {
    // Required for @testing-library/react's auto-cleanup, which only registers
    // itself when a global afterEach exists. Without it, component trees stay
    // mounted after their test file ends and animation loops (ScoreRing's rAF)
    // keep scheduling React work past jsdom teardown → "window is not defined".
    globals: true,
    // e2e/ holds Playwright specs (run via `npm run test:e2e`), not Vitest specs —
    // exclude them so `vitest run` doesn't try to execute test() from @playwright/test.
    exclude: [...configDefaults.exclude, 'e2e/**', '.claude/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/api/demo.ts', // demo mock data, not production logic
      ],
      thresholds: {
        statements: 14,
        branches: 11,
        functions: 8,
        lines: 15,
      },
    },
  },
});

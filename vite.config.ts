import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';

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
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: [],
    include: ['@ondc-sdk/shared/design-system'],
  },
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:3001',
      '/on_search': 'http://localhost:3001',
    },
  },
});

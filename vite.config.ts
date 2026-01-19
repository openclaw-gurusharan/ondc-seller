import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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

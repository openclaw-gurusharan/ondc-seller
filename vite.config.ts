import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@drams-design/components': path.resolve(
        __dirname,
        '../../Research/drams-design/src/index.ts'
      ),
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  server: {
    port: 3003,
    proxy: {
      '/api': 'http://localhost:3001',
      '/on_search': 'http://localhost:3001',
    },
  },
});

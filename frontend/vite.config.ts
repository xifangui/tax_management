import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = (process.env.VITE_BASE_PATH || '/tax_management/').trim();

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
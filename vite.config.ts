import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Relative base path ensures asset URLs resolve properly across custom domains and GitHub Pages subdirectories
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          table: ['@tanstack/react-table'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});

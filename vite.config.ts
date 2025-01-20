import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'jquery': resolve(__dirname, 'node_modules/jquery/dist/jquery.js'),
    }
  },
  optimizeDeps: {
    include: ['jquery']
  },
  server: {
    port: 5180,
    host: true,
    open: true,
    watch: {
      usePolling: true,
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

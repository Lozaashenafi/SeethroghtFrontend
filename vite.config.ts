import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const srcDir = path.resolve(import.meta.dirname, './src');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': srcDir,
      '@/app': path.resolve(srcDir, './app'),
      '@/assets': path.resolve(srcDir, './assets'),
      '@/components': path.resolve(srcDir, './components'),
      '@/features': path.resolve(srcDir, './features'),
      '@/hooks': path.resolve(srcDir, './hooks'),
      '@/services': path.resolve(srcDir, './services'),
      '@/styles': path.resolve(srcDir, './styles'),
      '@/types': path.resolve(srcDir, './types'),
      '@/utils': path.resolve(srcDir, './utils'),
      '@/config': path.resolve(srcDir, './config'),
      '@/constants': path.resolve(srcDir, './constants'),
      '@/lib': path.resolve(srcDir, './lib'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});

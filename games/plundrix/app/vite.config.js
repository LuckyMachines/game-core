import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5501,
    strictPort: true,
  },
  preview: {
    port: 4501,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': normalizePath(fileURLToPath(new URL('./src', import.meta.url)))
    }
  }
});

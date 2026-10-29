/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import pandacss from '@pandacss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [pandacss(), react()],
  css: {
    devSourcemap: command === 'serve',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));

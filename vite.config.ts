/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // На GitHub Pages сайт живёт в подпути (/<репозиторий>/), путь передаёт workflow через BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  css: {
    devSourcemap: command === 'serve',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));

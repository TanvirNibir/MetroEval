import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../frontend/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'setup/',
        '**/*.config.js',
        '**/main.jsx',
      ],
    },
  },
})


import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    test: {
      name: 'frontend',
      root: path.resolve(__dirname, 'frontend'),
      include: [path.resolve(__dirname, 'tests/frontend/**/*.{test,spec}.{js,jsx,ts,tsx}')],
      setupFiles: [path.resolve(__dirname, 'tests/frontend/setup/setup.js')],
      environment: 'jsdom',
      globals: true,
    },
  },
])


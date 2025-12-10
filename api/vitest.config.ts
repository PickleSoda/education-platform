import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentOptions: {
      NODE_ENV: 'test',
    },
    include: ['test/**/*.test.ts'],
    exclude: ['build/**', 'node_modules/**'],
    setupFiles: ['test/setup.ts'],
    coverage: {
      include: ['src/**'],
      exclude: ['build/**', 'node_modules/**', 'test/**'],
      reporter: ['text', 'lcov', 'clover', 'html'],
    },
    restoreMocks: true,
    sequence: {
      shuffle: false,
    },
    maxConcurrency: 1, // Run tests sequentially
    isolate: false, // Disable isolation to prevent connection issues
    pool: 'forks', // Use fork pool for better isolation
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to prevent database conflicts
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

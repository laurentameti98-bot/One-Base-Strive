import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './src/tests/globalSetup.ts',
    testTimeout: 10000,
    pool: 'forks',
    poolMatchGlobs: [['**/*.test.ts', 'forks']],
    fileParallelism: false,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  },
});

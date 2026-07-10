import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // setupFiles: ['./tests/setup.ts'], // Will be used later for DB transactions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', 'prisma/'],
      thresholds: {
        lines: 80, // Backend logic requires stricter coverage
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

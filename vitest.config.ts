import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    testTimeout: 10000, // Increase timeout if tests are slow
    
    // Configure test environment
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    
    // Exclude node_modules and other unnecessary directories
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/cypress/**',
      '**/test/**',
      '**/__tests__/test-utils/**',
    ],
    
    // Only include test files in the src directory
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Type checking is handled by the TypeScript compiler
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.next/**',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/test/**',
        '**/__tests__/test-utils/**',
      ],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      clean: true, // Clean coverage results before running
    },
    
    // Add type checking in tests
    typecheck: {
      enabled: true,
      include: ['src/**/*.test.{ts,tsx}'],
    },
    
    // Configure test output
    logHeapUsage: true,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000, // 10 seconds timeout for tests
  },
});

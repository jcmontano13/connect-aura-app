// Import the Vitest version of jest-dom
import '@testing-library/jest-dom/vitest';
import { vi, expect } from 'vitest';

// Import all matchers from @testing-library/jest-dom
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom's matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

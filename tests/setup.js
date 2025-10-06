import '@testing-library/jest-dom';

// Global test setup
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});
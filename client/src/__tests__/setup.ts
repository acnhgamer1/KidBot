import '@testing-library/jest-dom';

// Mock scrollIntoView for jsdom environment
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: function () {
    // Mock implementation - do nothing
  },
  writable: true,
});

// Global test setup can go here

// Global test-environment setup for Vitest + jsdom.
//
// This file runs before every test file. We establish mocks for browser APIs
// that jsdom doesn't implement so that module-level code (e.g. Redux slice
// initialState blocks) can safely call them during import.

import { vi } from "vitest";

// window.matchMedia — used by settingsSelectors.getCurrentSystemScheme() and
// settingsActions.getLowPowerModeSetting() when slices are first evaluated.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })),
});

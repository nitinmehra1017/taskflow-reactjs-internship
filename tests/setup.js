import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Every test starts with independent browser state. Routine tests never use live APIs.
const originalFetch = globalThis.fetch;
beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = jest.fn(() =>
    Promise.reject(
      new Error('Unexpected fetch: install a deterministic mock in this test'),
    ),
  );
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

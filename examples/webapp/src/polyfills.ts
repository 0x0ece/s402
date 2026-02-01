// Polyfills for browser compatibility with Solana libraries
import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;
(window as any).global = window;
(window as any).process = {
  env: {},
  version: '',
  nextTick: (fn: Function) => setTimeout(fn, 0)
};

export {};

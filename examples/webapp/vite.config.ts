import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Buffer } from 'buffer';

// Make Buffer available globally for Solana libraries
globalThis.Buffer = Buffer;

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'globalThis',
    'process.env': {}
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: [
      '@s402/core',
      '@s402/react',
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets'
    ]
  },
  resolve: {
    alias: {
      // Force Vite to use the source files instead of compiled dist
      '@s402/core': '/data/ecesena/s402/packages/core/src/index.ts',
      '@s402/react': '/data/ecesena/s402/packages/react/src/index.ts'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages/]
    }
  }
});

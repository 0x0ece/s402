import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { Buffer } from 'buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

// Make Buffer available globally for Solana libraries
globalThis.Buffer = Buffer;

export default defineConfig({
  plugins: [
    cloudflare({ configPath: path.join(root, 'wrangler.toml') }),
    react()
  ],
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
      '@s402/core': path.join(root, 'packages/core/dist/index.js'),
      '@s402/react': path.join(root, 'packages/react/dist/index.js')
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages/]
    }
  }
});

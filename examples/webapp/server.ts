import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { paymentMiddleware } from '../../packages/express/dist/index.js';
import { createPaymentConfig, PaymentType } from '../../packages/core/dist/index.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single destination for all payments (Solana Pay, normal tx, SOL and USDC)
const PAYMENT_DESTINATION = 's4o2ELcyPYkx37UsJKfs6kUwCsimWjBRa6qThVyVLE2';
const CLIENT_PUBLIC_KEY = 'J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

const paymentOptions = [
  createPaymentConfig(
    PAYMENT_DESTINATION,
    0.01,
    60,
    MAINNET,
    PaymentType.SOL
  ),
  {
    ...createPaymentConfig(
      PAYMENT_DESTINATION,
      0.1,
      60,
      MAINNET,
      PaymentType.USDC
    ),
    tokenMint: USDC_MINT
  }
];

export interface WorkerEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

/**
 * Create the Express app. When running on Cloudflare Workers, pass env so
 * non-API routes are served from the ASSETS binding. When running locally,
 * omit env and the app serves static files from ./dist.
 */
export function createApp(env?: WorkerEnv): express.Express {
  const app = express();

  app.use(express.json());

  if (!env?.ASSETS) {
    // Local: serve static files from disk
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // Protected API endpoint
  app.get(
    '/api/protected',
    paymentMiddleware({
      paymentOptions,
      requireSignature: false
    }),
    (_req, res) => {
      res.json({
        success: true,
        message: 'Welcome to the protected content!',
        data: {
          timestamp: Date.now(),
          content: 'This is exclusive content accessible only after payment.',
          features: [
            'Real-time data access',
            'Premium analytics',
            'Advanced features'
          ]
        }
      });
    }
  );

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  if (env?.ASSETS) {
    // Worker: serve static assets and SPA fallback via ASSETS binding
    app.all('*', async (req, res) => {
      const url = `https://${req.headers.host || 'localhost'}${req.url}`;
      const request = new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit
      });
      const response = await env.ASSETS.fetch(request);
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const body = await response.arrayBuffer();
      res.end(Buffer.from(body));
    });
  } else {
    // Local: SPA fallback
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  return app;
}

// Local development: run server only when this file is executed directly (not when imported by worker)
const PORT = 3001;
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`\n🚀 S402 Webapp Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/protected`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n💰 Payment Options:`);
    console.log(`   1. SOL: 0.01 SOL per 60 seconds`);
    console.log(`   2. USDC: 0.1 USDC per 60 seconds`);
    console.log(`\n🏦 Payment Details:`);
    console.log(`   Server receives at: ${PAYMENT_DESTINATION}`);
    console.log(`   Network: mainnet | RPC: rpc.s402.dev`);
    console.log(`   Test wallet: ${CLIENT_PUBLIC_KEY}`);
    console.log(`\n💡 Tip: Import this private key to test:`);
    console.log(`   b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc\n`);
  });
}

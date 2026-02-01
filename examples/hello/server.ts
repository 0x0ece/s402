import express from 'express';
import { paymentMiddleware } from '@s402/express';
import { createPaymentConfig, PaymentType } from '@s402/core';
import { PUBLIC_KEY, SERVER_PUBLIC_KEY, KEY_ID } from './keys';

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint (no payment required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 's402-server' });
});

// Create payment configuration
// 0.001 SOL per 60 seconds (1 minute)
// Note: First payment needs to cover rent-exempt minimum for new accounts (~0.00089 SOL)
const paymentConfig = createPaymentConfig(
  SERVER_PUBLIC_KEY,
  0.001, // subscriptionPrice in SOL
  60,    // subscriptionTime in seconds
  'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // devnet
  PaymentType.SOL
);

// Apply s402 payment middleware to the /api/data endpoint
// Requires RFC 9421 signatures with ed25519 AND Solana payment
app.get(
  '/api/data',
  paymentMiddleware({
    paymentOptions: [paymentConfig],
    publicKey: PUBLIC_KEY,
    requireSignature: true
  }),
  (req, res) => {
    // This handler only runs if signature and payment verification pass
    res.json({
      message: 'Hello from s402!',
      timestamp: Date.now(),
      data: 'This is protected by s402 payment middleware with RFC 9421 signatures and Solana payments'
    });
  }
);

app.listen(PORT, () => {
  console.log(`\n🚀 S402 Server running on http://localhost:${PORT}`);
  console.log(`📡 Protected endpoint: http://localhost:${PORT}/api/data (requires signature + payment)`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Signature verification: ENABLED (RFC 9421 + ed25519)`);
  console.log(`💰 Payment verification: ENABLED (Solana devnet)`);
  console.log(`🔑 Key ID: ${KEY_ID}`);
  console.log(`🏦 Server public key: ${SERVER_PUBLIC_KEY}`);
  console.log(`👤 Client public key: ${PUBLIC_KEY}`);
  console.log(`💵 Subscription: ${paymentConfig.subscriptionPrice} SOL per ${paymentConfig.subscriptionTime} seconds\n`);
});

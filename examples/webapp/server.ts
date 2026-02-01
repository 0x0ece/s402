import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { paymentMiddleware } from '@s402/express';
import { createPaymentConfig, PaymentType } from '@s402/core';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Using the same keys as hello example for easy testing
// Client: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss (already has devnet SOL)
// Server: 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J (receives payments)
const SERVER_SOL_PUBKEY = '9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J';
const CLIENT_PUBLIC_KEY = 'J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss';

// USDC devnet mint (for future use)
// const USDC_DEVNET_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Payment configurations (same as hello example for easy testing)
const paymentOptions = [
  // Option 1: SOL payment (same as hello example)
  createPaymentConfig(
    SERVER_SOL_PUBKEY,
    0.001, // 0.001 SOL per 60 seconds
    60,    
    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // devnet
    PaymentType.SOL
  )
  
  // Additional payment options can be added:
  // Option 2: USDC payment
  // {
  //   payTo: SERVER_SOL_PUBKEY,
  //   paymentType: PaymentType.USDC,
  //   subscriptionPrice: 0.01,
  //   subscriptionTime: 60,
  //   network: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  //   tokenMint: USDC_DEVNET_MINT
  // }
];

// Optional: Initialize staking option (commented out for simpler testing)
// initializeValidator().then(() => {
//   paymentOptions.push({
//     payTo: SERVER_SOL_PUBKEY,
//     paymentType: PaymentType.STAKE,
//     subscriptionPrice: 0,
//     subscriptionTime: 31536000, // 1 year
//     network: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
//     validatorVoteAccount,
//     minimumStakeAmount: 1
//   });
// });

// Protected API endpoint
app.get(
  '/api/protected',
  paymentMiddleware({
    paymentOptions,
    requireSignature: false // Signatures not required for webapp (browser-based)
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

// Serve React app for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 S402 Webapp Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/protected`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n💰 Payment Options:`);
  console.log(`   1. SOL: 0.001 SOL per 60 seconds`);
  console.log(`\n🏦 Payment Details:`);
  console.log(`   Server receives at: ${SERVER_SOL_PUBKEY}`);
  console.log(`   Test with wallet: ${CLIENT_PUBLIC_KEY} (has devnet SOL)`);
  console.log(`\n💡 Tip: Import this private key to test:`);
  console.log(`   b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc\n`);
});

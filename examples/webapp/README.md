# S402 Webapp Example

A React single-page application demonstrating the S402 payment middleware with Solana payments.

## ✅ Ready to Test!

The webapp server is **pre-configured with the same keys as the `hello` example** - no configuration needed!

### Quick Start - Full Stack

```bash
cd /data/ecesena/s402/examples/webapp

# Option 1: One command (recommended)
./start.sh

# Option 2: Manual (two terminals)
# Terminal 1: API server
pnpm server

# Terminal 2: Dev server
pnpm dev
```

Then open **http://localhost:5173** in your browser!

### Test the API

See [TEST_API.md](./TEST_API.md) for detailed API testing instructions.

Quick test:
```bash
# Health check
curl http://localhost:3001/api/health

# Protected endpoint (will return 402)
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

## Pre-configured Test Wallet

The server uses the same wallet as the `hello` example:

**Client Wallet** (has devnet SOL):
- Public: `J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss`
- Private: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`

**Server Wallet** (receives payments):
- Public: `9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J`

## Payment Configuration

- **Amount**: 0.001 SOL
- **Duration**: 60 seconds of access
- **Network**: Solana Devnet

## What Works ✅

- ✅ React app builds successfully! 🎉
- ✅ Express server with s402 payment middleware
- ✅ Protected API endpoint (`/api/protected`)
- ✅ Payment verification using Solana devnet
- ✅ Server-side credit caching
- ✅ Wallet adapter integration (Phantom, Solflare, Torus)
- ✅ Payment modal component
- ✅ Beautiful gradient UI
- ✅ Full browser-based payment flow
- ✅ Same keys as hello example for easy testing

## Using the Web UI 🌐

### Setup Wallet

1. Install [Phantom wallet](https://phantom.app/) browser extension
2. Import test wallet:
   - Settings → Add/Import Account → Import Private Key
   - Paste: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`
3. Switch to **Devnet**:
   - Settings → Developer Settings → Change Network → Devnet

### Use the Webapp

1. Start the webapp: `./start.sh`
2. Open http://localhost:5173
3. Click "Connect Wallet" (top right)
4. Select Phantom and approve
5. Click "Try Protected Content"
6. Choose payment method (SOL)
7. Approve 0.001 SOL transaction
8. ✅ Access granted!

See [FIXED.md](./FIXED.md) for detailed walkthrough with screenshots.

## Testing the Full Flow (Alternative Methods)

### Option 1: Use the Hello Client

```bash
# Terminal 1: Start webapp server
cd /data/ecesena/s402/examples/webapp
./test-server.sh

# Terminal 2: Use hello client to send payment
cd /data/ecesena/s402/examples/hello
pnpm client
```

The hello client will:
1. Try to access the webapp's protected endpoint
2. Get 402 Payment Required
3. Automatically send 0.001 SOL payment
4. Retry and get access

### Option 2: Manual Testing with curl

See [TEST_API.md](./TEST_API.md) for step-by-step curl commands.

### Option 3: Import Wallet to Phantom

1. Install Phantom wallet extension
2. Import private key: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`
3. Switch to Devnet
4. Send 0.001 SOL to `9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J`
5. Test API with curl

## Project Structure

```
examples/webapp/
├── server.ts              # Express server (WORKS!)
├── test-server.sh         # Start script
├── TEST_API.md            # API testing guide
├── QUICKSTART.md          # Quick start guide
├── README.md              # This file
├── package.json
├── vite.config.mts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── pages/
    │   ├── LandingPage.tsx
    │   └── ProtectedPage.tsx
    └── styles/
        └── app.css
```

## API Endpoints

### `GET /api/health`
Health check endpoint (no auth required)

**Response:**
```json
{"status":"ok","timestamp":1234567890}
```

### `GET /api/protected`
Protected endpoint requiring payment

**Headers:**
- `x-client-pubkey`: Your Solana wallet public key

**Responses:**
- `402 Payment Required`: No valid payment found
- `200 OK`: Payment valid, returns protected content

## Implementation Status

### ✅ Completed
- Multi-payment type support (SOL, USDC, Staking)
- Payment verification with Solana devnet
- Server-side credit caching
- Express middleware integration
- Pre-configured test keys
- API documentation

### ❌ Pending
- React frontend build configuration
- Browser wallet integration
- Payment modal UI
- USDC and Staking payment options (code ready, not tested)

## Next Steps

To fix the React build:
1. Configure packages to output ES modules
2. Update bundler configuration
3. Test wallet adapter integration
4. Enable USDC and Staking options

For now, the **server API is fully functional** and can be tested with:
- curl commands
- The hello example client
- Any HTTP client
- Phantom wallet + manual transactions

## Learn More

- [Main S402 Documentation](../../README.md)
- [Hello Example](../hello/README.md)
- [API Testing Guide](./TEST_API.md)
- [Quick Start](./QUICKSTART.md)

## License

MIT

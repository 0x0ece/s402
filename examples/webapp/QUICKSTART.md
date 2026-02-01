# Webapp Quickstart

## Instant Testing with Pre-configured Keys

The webapp is pre-configured with the same keys as the `hello` example for instant testing.

### Test Wallet (Already has Devnet SOL)

**Public Key**: `J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss`  
**Private Key**: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`

### Quick Start

1. **Start the server:**
   ```bash
   cd /data/ecesena/s402/examples/webapp
   pnpm server
   ```

2. **Import the test wallet to Phantom:**
   - Open Phantom wallet
   - Settings → Add/Import Account
   - Import Private Key
   - Paste: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`
   - Switch network to Devnet (Settings → Developer Settings → Change Network)

3. **Test the API directly:**
   ```bash
   # Should return 402 Payment Required with payment options
   curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
        http://localhost:3001/api/protected
   ```

4. **Once webapp build is fixed, open in browser:**
   - Navigate to http://localhost:3001
   - Connect with Phantom wallet (using imported test wallet)
   - Click "Try Protected Content"
   - Approve the 0.001 SOL payment when prompted
   - Access granted for 60 seconds!

### Payment Configuration

- **Amount**: 0.001 SOL
- **Duration**: 60 seconds of access
- **Network**: Solana Devnet
- **Receiver**: `9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J`

### Testing the API

The server exposes:

**Protected Endpoint**: `GET /api/protected`
- Requires `x-client-pubkey` header
- Returns 402 if no payment
- Returns 200 + content if payment valid

**Example with curl:**
```bash
# 1. First request - will return 402
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected

# Response:
# {
#   "error": "Payment Required",
#   "message": "Please send payment using one of the available methods",
#   "paymentOptions": [...]
# }

# 2. Send 0.001 SOL from J5W... to 9JX... using solana CLI or wallet

# 3. Second request - will return 200 (after payment)
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected

# Response:
# {
#   "success": true,
#   "message": "Welcome to the protected content!",
#   "data": {...}
# }
```

### Health Check

```bash
curl http://localhost:3001/api/health
# {"status":"ok","timestamp":...}
```

## Current Status

✅ Server works and can verify payments  
✅ API endpoints functional  
❌ React frontend build needs module format fix  

You can test the full payment flow using:
1. The server API directly (curl)
2. The `hello` example client (already works)
3. Custom client using `@s402/fetch` package

Once the build is fixed, the React UI will provide a beautiful interface for the same functionality.

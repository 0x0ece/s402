# Testing the Webapp API

The webapp server is now configured with the same keys as the `hello` example for instant testing!

## Start the Server

```bash
cd /data/ecesena/s402/examples/webapp
./test-server.sh
```

Or manually:
```bash
npx ts-node server.ts
```

## Test with curl

### 1. Health Check (no auth required)
```bash
curl http://localhost:3001/api/health
```

Expected: `{"status":"ok","timestamp":...}`

### 2. Protected Endpoint - First Request (will return 402)
```bash
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

Expected 402 response:
```json
{
  "error": "Payment Required",
  "message": "Please send payment using one of the available methods",
  "paymentOptions": [
    {
      "paymentType": "SOL",
      "serverPublicKey": "9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J",
      "subscriptionPrice": 0.001,
      "subscriptionTime": 60,
      "network": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
    }
  ]
}
```

### 3. Send Payment (using Solana CLI or the hello client)

Option A - Use the hello client:
```bash
cd ../hello
pnpm client
```

Option B - Use Solana CLI:
```bash
solana transfer 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J 0.001 \
  --keypair <(echo '[YOUR_PRIVATE_KEY_ARRAY]') \
  --url devnet
```

### 4. Protected Endpoint - After Payment (will return 200)
```bash
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

Expected 200 response:
```json
{
  "success": true,
  "message": "Welcome to the protected content!",
  "data": {
    "timestamp": 1234567890,
    "content": "This is exclusive content accessible only after payment.",
    "features": [
      "Real-time data access",
      "Premium analytics",
      "Advanced features"
    ]
  }
}
```

### 5. Immediate Second Request (uses cached credits)
```bash
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

Should return 200 immediately without blockchain check!

## Test Wallet Details

**Public Key**: `J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss`  
**Private Key (hex)**: `b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc`

This wallet already has devnet SOL from the hello example testing.

## Payment Configuration

- **Amount**: 0.001 SOL
- **Duration**: 60 seconds of access
- **Network**: Solana Devnet
- **Server receives at**: `9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J`

## Full Test Flow

```bash
# Terminal 1: Start server
cd /data/ecesena/s402/examples/webapp
./test-server.sh

# Terminal 2: Test the flow
# 1. Health check
curl http://localhost:3001/api/health

# 2. Try protected endpoint (will get 402)
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected

# 3. Send payment using hello client
cd ../hello
pnpm client

# 4. Try protected endpoint again (will get 200)
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

## Next Steps

Once the React build is fixed, you'll be able to:
1. Open http://localhost:3001 in browser
2. Connect Phantom wallet with the test private key
3. Click "Try Protected Content"
4. Approve payment in wallet
5. Access granted!

For now, the API works perfectly and can be tested with curl or the hello client.

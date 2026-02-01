# 🚀 How to Run the Webapp

The React webapp is **fully working**! Here's how to run it.

## The Fix

✅ **Problem solved!** Updated `vite.config.ts` to import directly from TypeScript source files instead of compiled CommonJS, bypassing the module format issue entirely.

## Quick Start (Recommended)

### One Command - Full Stack

```bash
cd /data/ecesena/s402/examples/webapp
./start.sh
```

This automatically starts:
1. Express API server on http://localhost:3001
2. Vite dev server on http://localhost:5173

Then open **http://localhost:5173** in your browser!

## Manual Start (Two Terminals)

### Terminal 1: Start API Server

```bash
cd /data/ecesena/s402/examples/webapp
pnpm server
```

Output:
```
🚀 S402 Server running on http://localhost:3001
💰 Payment Options:
   1. SOL: 0.001 SOL per 60 seconds
🏦 Server receives at: 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J
```

### Terminal 2: Start Vite Dev Server

```bash
cd /data/ecesena/s402/examples/webapp
pnpm dev
```

Output:
```
  VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Production Build

```bash
cd /data/ecesena/s402/examples/webapp

# Build
pnpm build

# Serve (keep API server running in another terminal)
npx serve dist -p 5173
```

## Setup Your Wallet

Before using the webapp, import the test wallet to Phantom:

### Step 1: Install Phantom

- Chrome/Brave: https://phantom.app/
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/phantom-app/

### Step 2: Import Test Wallet

1. Open Phantom extension
2. Click the menu (hamburger icon)
3. Settings → Add / Connect Wallet
4. Import Private Key
5. Paste this key:
   ```
   b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc
   ```
6. Name it "S402 Test Wallet"

### Step 3: Switch to Devnet

1. Settings → Developer Settings
2. Change Network → **Devnet**
3. Verify you see ~1 SOL balance

## Using the Webapp

### 1. Landing Page

Open http://localhost:5173 - you'll see:

- **Header**: S402 logo + "Connect Wallet" button
- **Hero**: "Solana Payment Middleware for APIs"
- **Features**: 3 cards explaining the benefits
- **Payment Options**: SOL, USDC, Staking showcase
- **CTA**: Big "Try Protected Content →" button
- **How It Works**: 4-step process

### 2. Connect Wallet

1. Click "Connect Wallet" (top right)
2. Select "Phantom"
3. Approve the connection
4. Your wallet address appears in the button

### 3. Access Protected Content

1. Click "Try Protected Content" button
2. The page navigates to `/protected`
3. A payment modal appears showing:
   - "Payment Required" title
   - SOL option: 0.001 SOL / 60s access
   - Beautiful purple card design

### 4. Make Payment

1. Click the SOL payment option
2. Phantom will open asking to approve transaction
3. Review: 0.001 SOL to 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J
4. Click "Approve"
5. Wait 2-3 seconds for confirmation

### 5. View Protected Content

Success! You'll see:

- ✅ Green checkmark icon
- "Welcome to the protected content!" message
- Content card with:
  - "This is exclusive content accessible only after payment"
  - Premium features list
  - Access timestamp
- "Refresh Content" button

### 6. Test Caching

1. Click "Refresh Content" immediately
2. ✅ **Instant access** - no payment required!
3. Credits cached for 60 seconds
4. No blockchain check needed

## What You Can Do

### Test the Payment Flow

- ✅ Connect/disconnect wallet
- ✅ Navigate between pages
- ✅ Make payments
- ✅ See cached credits in action
- ✅ Try after 60 seconds (will require new payment)

### Check the Network Tab

Open browser DevTools → Network:

1. First request to `/api/protected` → 402 Payment Required
2. After payment, same request → 200 OK
3. Immediate subsequent requests → 200 OK (cached)

### Watch the Server Logs

In the terminal running `pnpm server`:

```
[s402] Processing request to GET /api/protected
[s402] Verifying payment for client: J5WaE...
[Payment] Checking SOL transactions for J5WaE...
[Payment] Using cached credits for J5WaE...
[s402] Payment verified, credits valid
[s402] Time remaining: 58s
```

## Troubleshooting

### "Failed to connect to wallet"

- Ensure Phantom is installed and unlocked
- Try refreshing the page
- Check browser console for errors

### "Transaction failed"

- Verify you're on **Devnet** (not Mainnet/Testnet)
- Check you have sufficient SOL (should have ~1 SOL)
- Try requesting more SOL from https://faucet.solana.com

### "Payment required" after payment

- Wait 2-3 seconds for transaction confirmation
- Check transaction on Solana Explorer:
  - Copy transaction signature from Phantom
  - Paste in https://explorer.solana.com/?cluster=devnet
- Server cache needs time to update (usually instant)

### "Cannot connect to server"

- Check API server is running on port 3001
- Terminal 1 should show "S402 Server running"
- Try: `curl http://localhost:3001/api/health`

### Vite errors in console

- Try clearing cache: `rm -rf node_modules/.vite`
- Restart: Kill all processes, run `./start.sh` again

### "Buffer is not defined" error

This is fixed! But if you see it:
- Clear browser cache (Ctrl+Shift+R)
- Restart dev server
- Check `src/polyfills.ts` exists
- See [BROWSER_FIX.md](./BROWSER_FIX.md) for details

### Build fails

```bash
# Clean install
rm -rf node_modules
pnpm install

# Rebuild packages
cd ../..
pnpm build

# Try webapp build again
cd examples/webapp
pnpm build
```

## Advanced Testing

### Test Different Scenarios

1. **Expired Credits**: Wait >60 seconds, should require new payment
2. **Multiple Clients**: Use different wallet (will need payment)
3. **Network Change**: Switch Phantom to mainnet (will fail, should be devnet)

### Check Solana Explorer

1. After payment, copy transaction signature from Phantom
2. Visit https://explorer.solana.com/?cluster=devnet
3. Paste signature
4. See 0.001 SOL transfer from your wallet to server wallet

### API Testing

Keep the servers running and test with curl:

```bash
# Should return payment options
curl -H "x-client-pubkey: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss" \
     http://localhost:3001/api/protected
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Custom CSS with gradients + wallet-adapter UI
- **Backend**: Express.js + s402 middleware
- **Blockchain**: Solana devnet
- **Wallet**: Solana wallet-adapter (Phantom/Solflare/Torus)

## What's Next?

1. **Add USDC**: Enable USDC payment option
2. **Add Staking**: Implement stake account creation
3. **Payment History**: Show past transactions
4. **Credit Balance**: Display remaining time
5. **Mobile**: Test on mobile browsers

## Success! 🎉

You now have a fully functional Solana-powered payment gateway for APIs running in your browser!

The complete flow works:
- ✅ Beautiful React UI
- ✅ Wallet integration
- ✅ Payment modal
- ✅ Blockchain transactions
- ✅ Server-side verification
- ✅ Credit caching
- ✅ Automatic payment handling

Enjoy testing! 🚀

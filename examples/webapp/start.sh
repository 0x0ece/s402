#!/bin/bash

echo "🚀 Starting S402 Webapp (Full Stack)"
echo ""
echo "This will start:"
echo "  1. Express API server on http://localhost:3001"
echo "  2. Vite dev server on http://localhost:5173"
echo ""
echo "Configuration:"
echo "  - Client wallet: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss (has devnet SOL)"
echo "  - Server wallet: 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J"
echo "  - Payment: 0.001 SOL per 60 seconds"
echo ""
echo "Test wallet private key (import to Phantom):"
echo "  b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start API server in background
echo "Starting API server..."
npx ts-node server.ts &
SERVER_PID=$!

# Give server time to start
sleep 2

# Start Vite dev server
echo "Starting Vite dev server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Open http://localhost:5173 in your browser"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

pnpm dev

# Cleanup on exit
kill $SERVER_PID 2>/dev/null

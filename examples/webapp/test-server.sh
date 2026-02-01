#!/bin/bash

echo "🚀 Starting S402 Webapp Server..."
echo ""
echo "Configuration:"
echo "  - Same keys as hello example"
echo "  - Client wallet: J5WaEwb2LYyGbhpPju1a1MaQr1poJ8DzLQ2mALxmYEss (has devnet SOL)"
echo "  - Server receives at: 9JX32u4tPkQiGN1KfJzsC8cGnhNxjbdKRukD9eL2J15J"
echo "  - Payment: 0.001 SOL per 60 seconds"
echo ""
echo "Test wallet private key (import to Phantom):"
echo "  b19703725b64c69fda8b0e146d6c27c7d5ade963d3c5cc1dcef8a8d71c4ec1dc"
echo ""
echo "Starting server on http://localhost:3001..."
echo ""

npx ts-node server.ts

#!/bin/bash

# S402 Hello Example Test Script
# This script runs the server in the background, executes the client test, and cleans up

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  S402 Hello Example - Full Test       ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Cleanup function
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}Cleaning up...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Server stopped${NC}"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Check if we're in the right directory
if [ ! -f "server.ts" ] || [ ! -f "client.ts" ]; then
    echo -e "${RED}Error: Must be run from examples/hello directory${NC}"
    exit 1
fi

# Step 1: Start the server
echo -e "${BLUE}[1/3] Starting server...${NC}"
npx ts-node server.ts > /tmp/s402-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}✗ Server failed to start${NC}"
    cat /tmp/s402-server.log
    exit 1
fi

echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
echo ""

# Step 2: Show server info
echo -e "${BLUE}[2/3] Server Information:${NC}"
head -6 /tmp/s402-server.log | sed 's/^/  /'
echo ""

# Step 3: Run client test
echo -e "${BLUE}[3/3] Running client tests...${NC}"
echo -e "${YELLOW}─────────────────────────────────────────${NC}"
echo ""

if npx ts-node client.ts; then
    echo ""
    echo -e "${YELLOW}─────────────────────────────────────────${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    EXIT_CODE=0
else
    echo ""
    echo -e "${YELLOW}─────────────────────────────────────────${NC}"
    echo -e "${RED}✗ Tests failed${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Summary                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "  Format: Private key (hex), Public key (base58)"
echo -e "  Server: ${GREEN}RFC 9421 signature verification enabled${NC}"
echo -e "  Client: ${GREEN}Auto-signing with ed25519${NC}"
echo ""

exit $EXIT_CODE

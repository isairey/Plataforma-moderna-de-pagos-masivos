#!/bin/bash

# Example CLI usage script for Stellar BatchPay
# Make sure to set STELLAR_SECRET_KEY before running

if [ -z "$STELLAR_SECRET_KEY" ]; then
  echo "Error: STELLAR_SECRET_KEY environment variable is not set"
  exit 1
fi

echo "=== Stellar Bulk Payment CLI Example ==="
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "[*] Installing dependencies..."
  npm install
fi

echo "[*] Building TypeScript..."
npm run build 2>/dev/null || echo "Note: build may be optional depending on your setup"

echo
echo "[*] Running CLI with example JSON file..."
node cli/index.ts \
  --input examples/payments.json \
  --network testnet \
  --output /tmp/stellar-results.json

if [ -f "/tmp/stellar-results.json" ]; then
  echo
  echo "[+] Results saved to /tmp/stellar-results.json"
  echo
  echo "[*] First result:"
  head -20 /tmp/stellar-results.json
fi

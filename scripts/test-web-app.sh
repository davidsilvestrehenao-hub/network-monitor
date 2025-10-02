#!/bin/bash

# Test script for web app with DI bootstrap
# This script starts the web server, waits for it to start, then curls to trigger the error

echo "🚀 Starting web app test..."

# Kill any existing processes
pkill -f "bun run dev:web" || true
sleep 2

# Build packages first
echo "🔨 Building packages..."
cd /Users/david/Documents/Projects/network-monitor
turbo run build --filter=@network-monitor/shared --filter=@network-monitor/infrastructure --filter=@network-monitor/database

# Start web server in background
echo "📡 Starting web server..."
SKIP_AUTO_INIT=true SERVICE_WIRING_CONFIG=development bun run dev:web &
WEB_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 15

# Test the tRPC endpoint
echo "🧪 Testing tRPC endpoint..."
curl -sS 'http://0.0.0.0:3000/api/trpc/hello?input=%7B%7D' | jq . 2>/dev/null || \
curl -sS 'http://0.0.0.0:3001/api/trpc/hello?input=%7B%7D' | jq . 2>/dev/null || \
curl -sS 'http://0.0.0.0:3002/api/trpc/hello?input=%7B%7D' | jq .

# Clean up
echo "🧹 Cleaning up..."
kill $WEB_PID 2>/dev/null || true
wait $WEB_PID 2>/dev/null || true

echo "✅ Test complete"

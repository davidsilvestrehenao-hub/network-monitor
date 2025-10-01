#!/bin/bash
set -e

echo "🔄 Fixing database package SpeedTestResult type migration..."

# The database package has copies of mocks that need the same fixes
# These should actually be removed since they're in infrastructure now

echo "📋 Checking which mocks exist in database package..."
if [ -d "packages/database/src/mocks" ]; then
  echo "Found mocks in database package (should be in infrastructure)"
  ls -la packages/database/src/mocks/
fi

echo "✅ Database package fix script ready!"

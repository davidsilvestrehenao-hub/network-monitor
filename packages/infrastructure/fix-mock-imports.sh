#!/bin/bash
set -e

echo "🔄 Fixing infrastructure mock imports..."

for file in src/mocks/*.ts; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    # Replace interface imports
    sed -i '' 's|from "../interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
  fi
done

echo "✅ Mock import fixes complete!"

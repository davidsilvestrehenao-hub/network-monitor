#!/bin/bash
set -e

echo "🔄 Fixing all package imports..."

# Fix auth package
echo "Fixing auth package..."
for file in packages/auth/src/*.ts; do
  if [ -f "$file" ]; then
    sed -i '' 's|from "../interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
  fi
done

# Fix database package
echo "Fixing database package..."
for file in packages/database/src/*.ts packages/database/src/repositories/*.ts packages/database/src/mocks/*.ts; do
  if [ -f "$file" ]; then
    sed -i '' 's|from "../interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
    sed -i '' 's|from "../../interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
    sed -i '' 's|from "../services/interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
  fi
done

echo "✅ All package import fixes complete!"

#!/bin/bash
set -e

echo "🔄 Fixing speed-test package imports..."

for file in src/*.ts; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    # Replace interface imports
    sed -i '' 's|from "../interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
    # Fix child_process import
    sed -i '' 's|from "child_process"|from "node:child_process"|g' "$file"
  fi
done

echo "✅ Import fixes complete!"

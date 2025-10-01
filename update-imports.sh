#!/bin/bash
set -e

echo "🔄 Updating imports from ~/lib/services to @network-monitor packages..."

# Find all TypeScript/TSX files that import from ~/lib/services
files=$(grep -rl "from \"~/lib/services" src --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -z "$files" ]; then
  echo "✅ No files found with old imports!"
  exit 0
fi

echo "📝 Found files to update:"
echo "$files" | head -10

# Patterns to replace:
# Interface imports -> @network-monitor/shared
# Concrete service imports -> appropriate packages
# Mock imports -> appropriate packages

for file in $files; do
  echo "Updating: $file"
  
  # Replace interface imports
  sed -i '' 's|from "~/lib/services/interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
  
  # Replace concrete service imports
  sed -i '' 's|from "~/lib/services/concrete/MonitorService"|from "@network-monitor/monitor"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/AlertingService"|from "@network-monitor/alerting"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/NotificationService"|from "@network-monitor/notification"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/AuthService"|from "@network-monitor/auth"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/SpeedTestService"|from "@network-monitor/speed-test"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/SpeedTestConfigService"|from "@network-monitor/speed-test"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/MonitoringScheduler"|from "@network-monitor/speed-test"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/DatabaseService"|from "@network-monitor/database"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/EventBus"|from "@network-monitor/infrastructure"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/LoggerService"|from "@network-monitor/infrastructure"|g' "$file"
  sed -i '' 's|from "~/lib/services/concrete/\([^"]*\)Repository"|from "@network-monitor/database"|g' "$file"
  
  # Replace mock imports
  sed -i '' 's|from "~/lib/services/mocks/Mock\([^"]*\)Repository"|from "@network-monitor/database"|g' "$file"
  sed -i '' 's|from "~/lib/services/mocks/MockAuth"|from "@network-monitor/auth"|g' "$file"
  sed -i '' 's|from "~/lib/services/mocks/MockEventBus"|from "@network-monitor/infrastructure"|g' "$file"
  sed -i '' 's|from "~/lib/services/mocks/MockLogger"|from "@network-monitor/infrastructure"|g' "$file"
  sed -i '' 's|from "~/lib/services/mocks/Mock\([^"]*\)"|from "@network-monitor/\1"|g' "$file"
done

echo "✅ Import updates complete!"
echo "📊 Updated $(echo "$files" | wc -l) files"

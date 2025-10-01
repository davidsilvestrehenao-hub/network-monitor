#!/bin/bash
set -e

echo "🔄 Updating container imports..."

files="src/lib/container/container.browser.ts src/lib/container/json-container.ts src/lib/container/service-config.browser.ts src/lib/container/container.ts src/lib/container/service-config.ts"

for file in $files; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    # Replace relative imports with package imports
    sed -i '' 's|from "../services/interfaces/\([^"]*\)"|from "@network-monitor/shared"|g' "$file"
    sed -i '' 's|from "../services/concrete/MonitorService"|from "@network-monitor/monitor"|g' "$file"
    sed -i '' 's|from "../services/concrete/AlertingService"|from "@network-monitor/alerting"|g' "$file"
    sed -i '' 's|from "../services/concrete/NotificationService"|from "@network-monitor/notification"|g' "$file"
    sed -i '' 's|from "../services/concrete/AuthService"|from "@network-monitor/auth"|g' "$file"
    sed -i '' 's|from "../services/concrete/SpeedTestService"|from "@network-monitor/speed-test"|g' "$file"
    sed -i '' 's|from "../services/concrete/SpeedTestConfigService"|from "@network-monitor/speed-test"|g' "$file"
    sed -i '' 's|from "../services/concrete/MonitoringScheduler"|from "@network-monitor/speed-test"|g' "$file"
    sed -i '' 's|from "../services/concrete/DatabaseService"|from "@network-monitor/database"|g' "$file"
    sed -i '' 's|from "../services/concrete/EventBus"|from "@network-monitor/infrastructure"|g' "$file"
    sed -i '' 's|from "../services/concrete/LoggerService"|from "@network-monitor/infrastructure"|g' "$file"
    sed -i '' 's|from "../services/concrete/WinstonLoggerService"|from "@network-monitor/infrastructure"|g' "$file"
    sed -i '' 's|from "../services/concrete/\([^"]*\)Repository"|from "@network-monitor/database"|g' "$file"
    sed -i '' 's|from "../services/mocks/Mock\([^"]*\)Repository"|from "@network-monitor/database"|g' "$file"
    sed -i '' 's|from "../services/mocks/MockAuth"|from "@network-monitor/auth"|g' "$file"
    sed -i '' 's|from "../services/mocks/MockEventBus"|from "@network-monitor/infrastructure"|g' "$file"
    sed -i '' 's|from "../services/mocks/MockLogger"|from "@network-monitor/infrastructure"|g' "$file"
    sed -i '' 's|from "../services/mocks/MockDatabase"|from "@network-monitor/database"|g' "$file"
    sed -i '' 's|from "../services/mocks/Mock\([^"]*\)"|from "@network-monitor/\1"|g' "$file"
  fi
done

echo "✅ Container import updates complete!"

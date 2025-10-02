#!/bin/bash

# List of files to update
files=(
  "service-wiring/test.json"
  "service-wiring/offline.json"
  "service-wiring/integration-test.json"
  "service-wiring/frontend-dev.json"
  "service-wiring/demo.json"
  "service-wiring/ci.json"
)

# List of repository classes to update
repositories=(
  "MockAlertRuleRepository"
  "MockIncidentEventRepository"
  "MockMonitoringTargetRepository"
  "MockNotificationRepository"
  "MockPushSubscriptionRepository"
  "MockSpeedTestResultRepository"
  "MockUserRepository"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  for repo in "${repositories[@]}"; do
    # Update from infrastructure package
    sed -i '' "s|\"module\": \"@network-monitor/infrastructure\",\n      \"className\": \"$repo\"|\"module\": \"@network-monitor/mock-database\",\n      \"className\": \"$repo\"|g" "$file"
    # Update from mock-services package (just in case)
    sed -i '' "s|\"module\": \"@network-monitor/mock-services\",\n      \"className\": \"$repo\"|\"module\": \"@network-monitor/mock-database\",\n      \"className\": \"$repo\"|g" "$file"
  done
done

echo "Done updating service wiring files!"

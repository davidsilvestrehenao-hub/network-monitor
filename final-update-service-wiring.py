#!/usr/bin/env python3

import json
import os

# List of files to update
files = [
    "service-wiring/offline.json",
    "service-wiring/integration-test.json", 
    "service-wiring/frontend-dev.json",
    "service-wiring/demo.json",
    "service-wiring/ci.json"
]

# List of repository classes to update
repositories = [
    "MockAlertRuleRepository",
    "MockIncidentEventRepository", 
    "MockMonitoringTargetRepository",
    "MockNotificationRepository",
    "MockPushSubscriptionRepository",
    "MockSpeedTestResultRepository",
    "MockUserRepository"
]

for file_path in files:
    print(f"Updating {file_path}...")
    
    # Read the JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Update all repository references
    for service_key, service_config in data.get('services', {}).items():
        if service_config.get('className') in repositories:
            if service_config.get('module') in ['@network-monitor/infrastructure', '@network-monitor/mock-services']:
                service_config['module'] = '@network-monitor/mock-database'
                print(f"  Updated {service_key} -> {service_config['className']}")
    
    # Write the updated JSON file
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

print("Done updating all service wiring files!")

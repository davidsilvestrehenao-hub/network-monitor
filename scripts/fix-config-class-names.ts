#!/usr/bin/env bun

// Justification: This is a CLI script where console output is the primary way to communicate with users

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

// Class name corrections
const classCorrections: Record<string, string> = {
  EventBusService: "EventBus",
  MockEventBusService: "MockEventBus",
  MockLoggerService: "MockLogger",
  MockDatabaseService: "MockDatabase",
  MockMonitorService: "MockMonitor",
  MockAlertingService: "MockAlerting",
  MockNotificationService: "MockNotification",
  MockAuthService: "MockAuth",
};

// Module path corrections
const moduleCorrections: Record<string, string> = {
  "../src/lib/services/concrete/EventBusService":
    "../src/lib/services/concrete/EventBus",
  "../src/lib/services/mocks/MockEventBusService":
    "../src/lib/services/mocks/MockEventBus",
  "../src/lib/services/mocks/MockLoggerService":
    "../src/lib/services/mocks/MockLogger",
  "../src/lib/services/mocks/MockDatabaseService":
    "../src/lib/services/mocks/MockDatabase",
  "../src/lib/services/mocks/MockMonitorService":
    "../src/lib/services/mocks/MockMonitor",
  "../src/lib/services/mocks/MockAlertingService":
    "../src/lib/services/mocks/MockAlerting",
  "../src/lib/services/mocks/MockNotificationService":
    "../src/lib/services/mocks/MockNotification",
  "../src/lib/services/concrete/MockAuthService":
    "../src/lib/services/concrete/MockAuth",
};

function fixConfigurationFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, "utf-8");
    const config = JSON.parse(content);

    let modified = false;

    // Fix service configurations
    for (const [, serviceConfig] of Object.entries(config.services)) {
      const service = serviceConfig as Record<string, unknown>;

      // Fix class names
      if (classCorrections[service.className]) {
        console.log(
          `  Fixing class name: ${service.className} → ${classCorrections[service.className]}`
        );
        service.className = classCorrections[service.className];
        modified = true;
      }

      // Fix module paths
      if (moduleCorrections[service.module]) {
        console.log(
          `  Fixing module path: ${service.module} → ${moduleCorrections[service.module]}`
        );
        service.module = moduleCorrections[service.module];
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(filePath, JSON.stringify(config, null, 2));
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`ℹ️ No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error);
  }
}

function main() {
  console.log("🔧 Fixing configuration class names and module paths\n");

  // Fix service-config.json in root
  console.log("📋 Fixing service-config.json:");
  fixConfigurationFile("service-config.json");

  // Fix all configs in configs directory
  console.log("\n📁 Fixing configs directory:");
  const configsDir = "configs";
  const configFiles = readdirSync(configsDir).filter(file =>
    file.endsWith(".json")
  );

  for (const configFile of configFiles) {
    console.log(`\n📋 Fixing ${configFile}:`);
    fixConfigurationFile(join(configsDir, configFile));
  }

  console.log("\n✅ All configuration files have been fixed!");
}

main();

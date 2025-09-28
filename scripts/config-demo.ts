#!/usr/bin/env bun

// Justification: This is a demo script where console output is the primary way to demonstrate functionality

import { ConfigurationManager } from "../src/lib/container/config-manager";
import { JsonConfigLoader } from "../src/lib/container/json-config-loader";
import { createContainerWithEnvironment } from "../src/lib/container/flexible-container";
import { TYPES } from "../src/lib/container/container";

// Demo script showing dynamic service configuration
async function main() {
  console.log("🔧 Dynamic Service Configuration Demo\n");

  // 1. Show available configurations
  console.log("1. Available configurations:");
  const configManager = ConfigurationManager.getInstance();
  const configs = configManager.listAvailableConfigs();
  configs.forEach(config => console.log(`   - ${config}`));
  console.log();

  // 2. Load different environments
  console.log("2. Loading different environments:\n");

  // Load development environment
  console.log("   Loading development environment...");
  const devContainer = await createContainerWithEnvironment("development");
  const devLogger = await devContainer.get(TYPES.ILogger);
  console.log(`   Logger type: ${devLogger.constructor.name}`);
  console.log(`   Is mock: ${devLogger.constructor.name.includes("Mock")}\n`);

  // Load test environment
  console.log("   Loading test environment...");
  const testContainer = await createContainerWithEnvironment("test");
  const testLogger = await testContainer.get(TYPES.ILogger);
  console.log(`   Logger type: ${testLogger.constructor.name}`);
  console.log(`   Is mock: ${testLogger.constructor.name.includes("Mock")}\n`);

  // Load mock environment
  console.log("   Loading mock environment...");
  const mockContainer = await createContainerWithEnvironment("mock");
  const mockLogger = await mockContainer.get(TYPES.ILogger);
  console.log(`   Logger type: ${mockLogger.constructor.name}`);
  console.log(`   Is mock: ${mockLogger.constructor.name.includes("Mock")}\n`);

  // 3. Load from JSON configuration
  console.log("3. Loading from JSON configuration:");
  try {
    const jsonLoader = JsonConfigLoader.getInstance();
    const customRegistry = jsonLoader.loadFromFile("configs/active.json");
    const customConfig = await configManager.createCustomConfig(customRegistry);

    console.log("   Custom configuration loaded successfully");
    console.log("   Services in custom config:");
    Object.entries(customConfig).forEach(([key, config]) => {
      console.log(`     ${key}: ${config.factory.name}`);
    });
  } catch (error) {
    console.log(`   Error loading custom config: ${error}`);
  }
  console.log();

  // 4. Show current configuration
  console.log("4. Current configuration:");
  const currentEnv = configManager.getCurrentEnvironment();
  const currentConfig = configManager.getCurrentConfig();
  console.log(`   Environment: ${currentEnv}`);
  if (currentConfig) {
    console.log("   Services:");
    Object.entries(currentConfig).forEach(([key, config]) => {
      console.log(`     ${key}: ${config.factory.name}`);
    });
  }
  console.log();

  // 5. Generate configuration template
  console.log("5. Configuration template:");
  const jsonLoader = JsonConfigLoader.getInstance();
  const template = jsonLoader.createTemplate();
  console.log(JSON.stringify(template, null, 2));

  console.log("\n✅ Demo completed successfully!");
  console.log("\n💡 Try switching configurations:");
  console.log("   bun run scripts/switch-config.ts list");
  console.log("   bun run scripts/switch-config.ts switch all-mock.json");
  console.log("   bun run scripts/switch-config.ts current");
}

// Run the demo
main().catch(console.error);

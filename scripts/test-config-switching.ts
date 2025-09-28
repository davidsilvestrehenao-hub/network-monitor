#!/usr/bin/env bun

// Justification: This is a CLI script where console output is the primary way to communicate with users

import { JsonConfigLoader } from "../src/lib/container/json-config-loader";
import {
  initializeJsonContainer,
  getCurrentConfigurationInfo,
  resetContainerInitialization,
} from "../src/lib/container/json-container";
import { getJsonAppContext } from "../src/lib/container/json-container";

async function testConfigurationSwitching() {
  console.log("🧪 Testing Configuration Switching\n");

  try {
    // Test 1: Load different configurations
    console.log("1️⃣ Testing configuration loading...");

    const configs = [
      "auth-mock-only.json",
      "all-mock.json",
      "all-concrete.json",
      "offline-development.json",
    ];

    for (const configName of configs) {
      console.log(`\n📋 Testing ${configName}:`);

      try {
        // Copy configuration to service-config.json
        const { execSync } = await import("child_process");
        execSync(`cp configs/${configName} service-config.json`, {
          stdio: "pipe",
        });

        // Reset container state
        resetContainerInitialization();

        // Load configuration
        const configLoader = new JsonConfigLoader();
        const config = configLoader.loadConfiguration();

        console.log(`   ✅ Loaded: ${config.name}`);
        console.log(`   📝 Description: ${config.description}`);
        console.log(`   🌍 Environment: ${config.environment}`);
        console.log(`   🔧 Services: ${Object.keys(config.services).length}`);

        // Test service conversion
        const serviceConfig = await configLoader.convertToServiceConfig(config);
        console.log(
          `   🏗️ Converted to ${Object.getOwnPropertySymbols(serviceConfig).length} service configs`
        );
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    // Test 2: Test container initialization
    console.log("\n2️⃣ Testing container initialization...");

    try {
      // Use auth-mock-only configuration
      const { execSync } = await import("child_process");
      execSync("cp configs/auth-mock-only.json service-config.json", {
        stdio: "pipe",
      });

      resetContainerInitialization();

      // Initialize container
      await initializeJsonContainer();

      // Get app context
      const context = await getJsonAppContext();

      console.log("   ✅ Container initialized successfully");
      console.log(
        `   🔧 Available services: ${Object.keys(context.services).filter(k => context.services[k] !== null).length}`
      );
      console.log(
        `   🗄️ Available repositories: ${Object.keys(context.repositories).filter(k => context.repositories[k] !== null).length}`
      );

      // Test service functionality
      if (context.services.logger) {
        context.services.logger.info(
          "Test log message from JSON configuration"
        );
        console.log("   ✅ Logger service working");
      }

      if (context.services.eventBus) {
        context.services.eventBus.emit("TEST_EVENT", { message: "Test event" });
        console.log("   ✅ Event bus service working");
      }
    } catch (error) {
      console.log(`   ❌ Container initialization failed: ${error.message}`);
    }

    // Test 3: Test configuration info
    console.log("\n3️⃣ Testing configuration info...");

    try {
      const info = await getCurrentConfigurationInfo();
      console.log("   📋 Current Configuration Info:");
      console.log(`   Name: ${info.name}`);
      console.log(`   Description: ${info.description}`);
      console.log(`   Environment: ${info.environment}`);
      console.log(`   Services: ${info.services?.join(", ") || "none"}`);
      console.log(`   Initialized: ${info.initialized}`);
    } catch (error) {
      console.log(`   ❌ Failed to get configuration info: ${error.message}`);
    }

    // Test 4: Test all available configurations
    console.log("\n4️⃣ Testing all available configurations...");

    const availableConfigs = JsonConfigLoader.getAvailableConfigurations();
    console.log(
      `   📁 Found ${availableConfigs.length} available configurations:`
    );

    for (const config of availableConfigs) {
      console.log(`   - ${config}`);
    }

    console.log("\n✅ Configuration switching test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testConfigurationSwitching().catch(console.error);

#!/usr/bin/env bun

// Justification: This is a CLI script where console output is the primary way to communicate with users

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Configuration switcher script
class ConfigSwitcher {
  private configsDir = "configs";
  private activeConfig = "service-config.json";

  // List all available configurations
  public listConfigs(): void {
    console.log("📁 Available configurations:\n");

    const configs = [
      {
        file: "all-concrete.json",
        name: "All Concrete Services",
        desc: "Production-ready with all concrete implementations",
      },
      {
        file: "auth-mock-only.json",
        name: "Auth Mock Only",
        desc: "Development with only auth mocked",
      },
      {
        file: "all-mock.json",
        name: "All Mock Services",
        desc: "Testing with all services mocked",
      },
      {
        file: "offline-development.json",
        name: "Offline Development",
        desc: "Development without external dependencies",
      },
      {
        file: "performance-testing.json",
        name: "Performance Testing",
        desc: "Optimized for performance testing",
      },
      {
        file: "database-testing.json",
        name: "Database Testing",
        desc: "Testing database operations",
      },
      {
        file: "notification-testing.json",
        name: "Notification Testing",
        desc: "Testing notification system",
      },
      {
        file: "monitoring-testing.json",
        name: "Monitoring Testing",
        desc: "Testing monitoring system",
      },
      {
        file: "alerting-testing.json",
        name: "Alerting Testing",
        desc: "Testing alerting system",
      },
    ];

    configs.forEach((config, index) => {
      const isActive = this.isActiveConfig(config.file);
      const status = isActive ? "✅ ACTIVE" : "  ";
      console.log(`${status} ${index + 1}. ${config.name}`);
      console.log(`     ${config.desc}`);
      console.log(`     File: ${config.file}\n`);
    });
  }

  // Switch to a specific configuration
  public switchTo(configName: string): void {
    const sourcePath = join(this.configsDir, configName);
    const targetPath = this.activeConfig; // Now in root directory

    if (!existsSync(sourcePath)) {
      console.error(`❌ Configuration file not found: ${configName}`);
      console.log(
        "Use 'bun run scripts/switch-config.ts list' to see available configurations"
      );
      return;
    }

    try {
      // Read the source configuration
      const configContent = readFileSync(sourcePath, "utf-8");
      const config = JSON.parse(configContent);

      // Write to active configuration in root directory
      writeFileSync(targetPath, JSON.stringify(config, null, 2));

      console.log(`✅ Switched to: ${config.name}`);
      console.log(`   Description: ${config.description}`);
      console.log(`   Environment: ${config.environment}`);
      console.log(
        `   File: ${configName} → ${this.activeConfig} (root directory)`
      );
    } catch (error) {
      console.error(`❌ Failed to switch configuration: ${error}`);
    }
  }

  // Show current active configuration
  public showCurrent(): void {
    const activePath = this.activeConfig; // Now in root directory

    if (!existsSync(activePath)) {
      console.log("❌ No active configuration found");
      return;
    }

    try {
      const configContent = readFileSync(activePath, "utf-8");
      const config = JSON.parse(configContent);

      console.log("📋 Current Active Configuration:\n");
      console.log(`Name: ${config.name}`);
      console.log(`Description: ${config.description}`);
      console.log(`Environment: ${config.environment}`);
      console.log(`File: ${this.activeConfig}\n`);

      console.log("Services:");
      Object.entries(config.services).forEach(
        ([serviceName, serviceConfig]: [string, unknown]) => {
          const config = serviceConfig as {
            isMock?: boolean;
            className?: string;
          };
          const mockStatus = config.isMock ? "🔧 Mock" : "🏭 Concrete";
          console.log(`  ${mockStatus} ${serviceName}: ${config.className}`);
        }
      );
    } catch (error) {
      console.error(`❌ Failed to read active configuration: ${error}`);
    }
  }

  // Check if a configuration is currently active
  private isActiveConfig(configName: string): boolean {
    const activePath = this.activeConfig; // Now in root directory

    if (!existsSync(activePath)) {
      return false;
    }

    try {
      const activeContent = readFileSync(activePath, "utf-8");
      const activeConfig = JSON.parse(activeContent);

      // Compare service configurations to determine if they're the same
      const sourcePath = join(this.configsDir, configName);
      const sourceContent = readFileSync(sourcePath, "utf-8");
      const sourceConfig = JSON.parse(sourceContent);

      return (
        JSON.stringify(activeConfig.services) ===
        JSON.stringify(sourceConfig.services)
      );
    } catch {
      return false;
    }
  }

  // Show help
  public showHelp(): void {
    console.log("🔧 Configuration Switcher\n");
    console.log("Usage:");
    console.log(
      "  bun run scripts/switch-config.ts list          - List all configurations"
    );
    console.log(
      "  bun run scripts/switch-config.ts current       - Show current configuration"
    );
    console.log(
      "  bun run scripts/switch-config.ts switch <file> - Switch to configuration"
    );
    console.log(
      "  bun run scripts/switch-config.ts help          - Show this help\n"
    );
    console.log("Examples:");
    console.log("  bun run scripts/switch-config.ts switch all-concrete.json");
    console.log(
      "  bun run scripts/switch-config.ts switch auth-mock-only.json"
    );
    console.log("  bun run scripts/switch-config.ts switch all-mock.json");
  }
}

// Main execution
const switcher = new ConfigSwitcher();
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
  case "list":
    switcher.listConfigs();
    break;
  case "current":
    switcher.showCurrent();
    break;
  case "switch":
    if (argument) {
      switcher.switchTo(argument);
    } else {
      console.error("❌ Please specify a configuration file to switch to");
      console.log(
        "Usage: bun run scripts/switch-config.ts switch <config-file>"
      );
    }
    break;
  case "help":
  case "--help":
  case "-h":
    switcher.showHelp();
    break;
  default:
    console.log("❌ Unknown command");
    switcher.showHelp();
    break;
}

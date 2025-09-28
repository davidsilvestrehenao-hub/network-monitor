#!/usr/bin/env bun

// Justification: This is a demo script where console output is the primary way to demonstrate functionality

import { FlexibleContainer } from "../src/lib/container/flexible-container";
import { mockSeededConfig } from "../src/lib/container/configs/mock-seeded.config";
import { TYPES } from "../src/lib/container/container";

async function demoSeededData() {
  console.log("🌱 Demo: Seeded Mock Data Repositories\n");

  try {
    // Create container with mock-seeded configuration
    const container = new FlexibleContainer(mockSeededConfig);
    await container.initialize();

    // Debug: Check what's in the config
    console.log("Mock config keys:", Object.keys(mockSeededConfig));
    console.log("Mock config values:", Object.values(mockSeededConfig).length);
    console.log("TYPES.IUserRepository:", TYPES.IUserRepository.toString());

    // Get repositories
    const userRepo = await container.get(TYPES.IUserRepository);
    const alertRepo = await container.get(TYPES.IAlertRepository);
    const notificationRepo = await container.get(TYPES.INotificationRepository);
    const targetRepo = await container.get(TYPES.ITargetRepository);
    const speedTestRepo = await container.get(TYPES.ISpeedTestRepository);

    console.log("📊 Seeded Data Summary:");
    console.log("======================");

    // Users
    const users = await userRepo.getAllUsers();
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Targets
    const targets = await targetRepo.findActiveTargets();
    console.log(`\n🎯 Targets: ${targets.length}`);
    targets.forEach(target => {
      console.log(`   - ${target.name} (${target.address})`);
    });

    // Alert Rules
    const alertRules = await alertRepo.getAllAlertRules();
    console.log(`\n🚨 Alert Rules: ${alertRules.length}`);
    alertRules.forEach(rule => {
      console.log(
        `   - ${rule.name} (${rule.metric} ${rule.condition} ${rule.threshold})`
      );
    });

    // Incidents
    const incidents = await alertRepo.getAllIncidents();
    console.log(`\n⚠️  Incidents: ${incidents.length}`);
    incidents.forEach(incident => {
      const status = incident.resolved ? "✅ Resolved" : "❌ Active";
      console.log(`   - ${incident.type}: ${incident.description} ${status}`);
    });

    // Notifications
    const notifications = await notificationRepo.getNotifications("user-1");
    console.log(`\n📱 Notifications (user-1): ${notifications.length}`);
    notifications.forEach(notif => {
      const status = notif.read ? "✅ Read" : "📬 Unread";
      console.log(`   - ${notif.message} ${status}`);
    });

    // Speed Test Results
    const results = await speedTestRepo.findByTargetId("target-1", 5);
    console.log(
      `\n📈 Speed Test Results (target-1, last 5): ${results.length}`
    );
    results.forEach(result => {
      console.log(
        `   - ${result.status}: ${result.ping?.toFixed(1)}ms ping, ${result.download?.toFixed(1)}Mbps down`
      );
    });

    // Statistics
    const incidentStats = await alertRepo.getIncidentStats();
    console.log(`\n📊 Incident Statistics:`);
    console.log(`   - Total: ${incidentStats.total}`);
    console.log(`   - Resolved: ${incidentStats.resolved}`);
    console.log(`   - Active: ${incidentStats.active}`);

    const notificationStats =
      await notificationRepo.getNotificationStats("user-1");
    console.log(`\n📊 Notification Statistics (user-1):`);
    console.log(`   - Total: ${notificationStats.total}`);
    console.log(`   - Unread: ${notificationStats.unread}`);

    console.log("\n✅ Demo completed successfully!");
    console.log(
      "\n💡 All mock repositories are now seeded with realistic test data!"
    );
    console.log(
      "   - Users, targets, alert rules, incidents, notifications, and speed test results"
    );
    console.log(
      "   - Data is automatically generated and consistent across all repositories"
    );
    console.log(
      "   - Perfect for testing and development without a real database"
    );
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Run the demo
demoSeededData();

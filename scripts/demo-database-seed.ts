#!/usr/bin/env bun

// Justification: This is a demo script where console output is the primary way to demonstrate functionality

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function demoDatabaseSeed() {
  console.log("🌱 Demo: Database Seeded Data\n");

  try {
    // Get data from database
    const users = await prisma.user.findMany();
    const targets = await prisma.monitoringTarget.findMany();
    const alertRules = await prisma.alertRule.findMany();
    const incidents = await prisma.incidentEvent.findMany();
    const notifications = await prisma.notification.findMany();
    const pushSubscriptions = await prisma.pushSubscription.findMany();
    const speedTestResults = await prisma.speedTestResult.findMany({
      take: 20, // Limit to first 20 for demo
      orderBy: { createdAt: "desc" },
    });

    console.log("📊 Database Data Summary:");
    console.log("========================");

    // Users
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => {
      const verified = user.emailVerified ? "✅ Verified" : "❌ Unverified";
      console.log(`   - ${user.name} (${user.email}) ${verified}`);
    });

    // Targets
    console.log(`\n🎯 Targets: ${targets.length}`);
    targets.forEach(target => {
      console.log(`   - ${target.name} (${target.address})`);
    });

    // Alert Rules
    console.log(`\n🚨 Alert Rules: ${alertRules.length}`);
    alertRules.forEach(rule => {
      const status = rule.enabled ? "✅ Enabled" : "❌ Disabled";
      console.log(
        `   - ${rule.name} (${rule.metric} ${rule.condition} ${rule.threshold}) ${status}`
      );
    });

    // Incidents
    console.log(`\n⚠️  Incidents: ${incidents.length}`);
    incidents.forEach(incident => {
      const status = incident.resolved ? "✅ Resolved" : "❌ Active";
      console.log(`   - ${incident.type}: ${incident.description} ${status}`);
    });

    // Notifications
    console.log(`\n📱 Notifications: ${notifications.length}`);
    notifications.forEach(notif => {
      const status = notif.read ? "✅ Read" : "📬 Unread";
      console.log(`   - ${notif.message} ${status}`);
    });

    // Push Subscriptions
    console.log(`\n🔔 Push Subscriptions: ${pushSubscriptions.length}`);
    pushSubscriptions.forEach(sub => {
      console.log(`   - User ${sub.userId}: ${sub.endpoint}`);
    });

    // Speed Test Results (sample)
    console.log(
      `\n📈 Speed Test Results (sample of ${speedTestResults.length}):`
    );
    speedTestResults.forEach(result => {
      const ping = result.ping ? `${result.ping.toFixed(1)}ms` : "N/A";
      const download = result.download
        ? `${result.download.toFixed(1)}Mbps`
        : "N/A";
      console.log(`   - ${result.status}: ${ping} ping, ${download} down`);
    });

    // Statistics
    const incidentStats = {
      total: incidents.length,
      resolved: incidents.filter(i => i.resolved).length,
      active: incidents.filter(i => !i.resolved).length,
    };

    console.log(`\n📊 Incident Statistics:`);
    console.log(`   - Total: ${incidentStats.total}`);
    console.log(`   - Resolved: ${incidentStats.resolved}`);
    console.log(`   - Active: ${incidentStats.active}`);

    const notificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
    };

    console.log(`\n📊 Notification Statistics:`);
    console.log(`   - Total: ${notificationStats.total}`);
    console.log(`   - Unread: ${notificationStats.unread}`);

    // Speed test results by target
    const resultsByTarget = await prisma.speedTestResult.groupBy({
      by: ["targetId"],
      _count: {
        id: true,
      },
      _avg: {
        ping: true,
        download: true,
      },
    });

    console.log(`\n📊 Speed Test Results by Target:`);
    for (const result of resultsByTarget) {
      const target = targets.find(t => t.id === result.targetId);
      const avgPing = result._avg.ping ? result._avg.ping.toFixed(1) : "N/A";
      const avgDownload = result._avg.download
        ? result._avg.download.toFixed(1)
        : "N/A";
      console.log(
        `   - ${target?.name || result.targetId}: ${result._count.id} tests, avg ${avgPing}ms ping, ${avgDownload}Mbps down`
      );
    }

    console.log("\n✅ Database demo completed successfully!");
    console.log("\n💡 The database now contains realistic test data!");
    console.log("   - All data is persisted and can be queried with Prisma");
    console.log("   - Perfect for development, testing, and demonstrations");
    console.log(
      "   - Use 'bun run studio' to explore the data in Prisma Studio"
    );
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demo
demoDatabaseSeed();

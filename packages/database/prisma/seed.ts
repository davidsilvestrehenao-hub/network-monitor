#!/usr/bin/env bun

// Justification: This is a seeding script where console output is the primary way to show progress

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with test data...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.incidentEvent.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.speedTestResult.deleteMany();
  await prisma.monitoringTarget.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: new Date("2024-01-15"),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
    }),
    prisma.user.create({
      data: {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: new Date("2024-01-20"),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
    }),
    prisma.user.create({
      data: {
        id: "user-3",
        name: "Bob Wilson",
        email: "bob@example.com",
        emailVerified: null,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
    }),
  ]);

  console.log(`   ✅ Created ${users.length} users`);

  // Create monitoring targets
  console.log("🎯 Creating monitoring targets...");
  const targets = await Promise.all([
    prisma.monitoringTarget.create({
      data: {
        id: "target-1",
        name: "Google DNS",
        address: "8.8.8.8",
        ownerId: "user-1",
      },
    }),
    prisma.monitoringTarget.create({
      data: {
        id: "target-2",
        name: "Cloudflare DNS",
        address: "1.1.1.1",
        ownerId: "user-1",
      },
    }),
    prisma.monitoringTarget.create({
      data: {
        id: "target-3",
        name: "OpenDNS",
        address: "208.67.222.222",
        ownerId: "user-1",
      },
    }),
    prisma.monitoringTarget.create({
      data: {
        id: "target-4",
        name: "Quad9 DNS",
        address: "9.9.9.9",
        ownerId: "user-1",
      },
    }),
  ]);

  console.log(`   ✅ Created ${targets.length} targets`);

  // Create alert rules
  console.log("🚨 Creating alert rules...");
  const alertRules = await Promise.all([
    prisma.alertRule.create({
      data: {
        name: "High Latency Alert",
        targetId: "target-1",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 100,
        enabled: true,
      },
    }),
    prisma.alertRule.create({
      data: {
        name: "Low Download Speed",
        targetId: "target-1",
        metric: "download",
        condition: "LESS_THAN",
        threshold: 10,
        enabled: true,
      },
    }),
    prisma.alertRule.create({
      data: {
        name: "Connection Timeout",
        targetId: "target-2",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 5000,
        enabled: false,
      },
    }),
  ]);

  console.log(`   ✅ Created ${alertRules.length} alert rules`);

  // Create incidents
  console.log("⚠️  Creating incidents...");
  const now = new Date();
  const incidents = await Promise.all([
    prisma.incidentEvent.create({
      data: {
        type: "OUTAGE",
        description: "Connection timeout to Google DNS",
        targetId: "target-1",
        ruleId: alertRules[0].id,
        resolved: false,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.incidentEvent.create({
      data: {
        type: "SLOW",
        description: "High latency detected on Cloudflare DNS",
        targetId: "target-2",
        ruleId: alertRules[2].id,
        resolved: true,
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    }),
    prisma.incidentEvent.create({
      data: {
        type: "ERROR",
        description: "DNS resolution failed",
        targetId: "target-1",
        resolved: false,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
  ]);

  console.log(`   ✅ Created ${incidents.length} incidents`);

  // Create push subscriptions
  console.log("🔔 Creating push subscriptions...");
  const pushSubscriptions = await Promise.all([
    prisma.pushSubscription.create({
      data: {
        id: "sub-1",
        userId: "user-1",
        endpoint: "https://fcm.googleapis.com/fcm/send/sub1",
        p256dh: "BNJxwH...",
        auth: "tBH...",
      },
    }),
    prisma.pushSubscription.create({
      data: {
        id: "sub-2",
        userId: "user-2",
        endpoint: "https://fcm.googleapis.com/fcm/send/sub2",
        p256dh: "BNJxwH...",
        auth: "tBH...",
      },
    }),
  ]);

  console.log(`   ✅ Created ${pushSubscriptions.length} push subscriptions`);

  // Create notifications
  console.log("📱 Creating notifications...");
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: "user-1",
        message: "High latency detected on Google DNS",
        read: false,
        sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: "user-1",
        message: "Connection timeout to Cloudflare DNS",
        read: true,
        sentAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: "user-2",
        message: "DNS resolution failed on OpenDNS",
        read: false,
        sentAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: "user-1",
        message: "All systems operational",
        read: true,
        sentAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`   ✅ Created ${notifications.length} notifications`);

  // Create speed test results
  console.log("📈 Creating speed test results...");
  const speedTestResults = [];

  // Generate results for each target over the last 24 hours
  for (const target of targets) {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const isSuccess = Math.random() > 0.1; // 90% success rate

      speedTestResults.push(
        prisma.speedTestResult.create({
          data: {
            targetId: target.id,
            ping: isSuccess ? Math.random() * 50 + 10 : null,
            download: isSuccess ? Math.random() * 50 + 20 : null,
            status: isSuccess ? "SUCCESS" : "FAILURE",
            createdAt: timestamp,
          },
        })
      );
    }
  }

  await Promise.all(speedTestResults);
  console.log(`   ✅ Created ${speedTestResults.length} speed test results`);

  // Display summary
  console.log("\n📊 Database Seeding Summary:");
  console.log("============================");
  console.log(`👥 Users: ${users.length}`);
  console.log(`🎯 Targets: ${targets.length}`);
  console.log(`🚨 Alert Rules: ${alertRules.length}`);
  console.log(`⚠️  Incidents: ${incidents.length}`);
  console.log(`🔔 Push Subscriptions: ${pushSubscriptions.length}`);
  console.log(`📱 Notifications: ${notifications.length}`);
  console.log(`📈 Speed Test Results: ${speedTestResults.length}`);

  console.log("\n✅ Database seeding completed successfully!");
  console.log(
    "\n💡 The database now contains realistic test data for development and testing."
  );
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

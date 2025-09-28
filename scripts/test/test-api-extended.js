// Extended API testing
import { getAppContext } from "./src/lib/container/container.js";

async function testExtendedAPI() {
  try {
    console.log("🧪 Testing Extended API endpoints...");

    const ctx = await getAppContext();

    // Test Alerting Service
    console.log("\n🚨 Testing Alerting Service...");
    const alertRules = await ctx.services.alerting.getAlertRulesByTargetId(
      "cmg0f42sp0001rr9dyhm75pyc"
    );
    console.log("✅ getAlertRulesByTargetId:", alertRules);

    // Test creating an alert rule
    const newAlertRule = await ctx.services.alerting.createAlertRule({
      targetId: "cmg0f42sp0001rr9dyhm75pyc",
      name: "High Ping Alert",
      metric: "ping",
      condition: "GREATER_THAN",
      threshold: 100,
    });
    console.log("✅ createAlertRule:", newAlertRule);

    // Test Notification Service
    console.log("\n🔔 Testing Notification Service...");
    const notifications =
      await ctx.services.notification.getNotifications("anonymous");
    console.log("✅ getNotifications:", notifications);

    // Test creating a notification
    const newNotification = await ctx.services.notification.createNotification({
      userId: "anonymous",
      message: "Test notification from API test",
    });
    console.log("✅ createNotification:", newNotification);

    // Test Auth Service
    console.log("\n🔐 Testing Auth Service...");
    const isAuthenticated = await ctx.services.auth.isAuthenticated();
    console.log("✅ isAuthenticated:", isAuthenticated);

    const currentUser = await ctx.services.auth.getCurrentUser();
    console.log("✅ getCurrentUser:", currentUser);

    // Test updating a target
    console.log("\n✏️ Testing Target Update...");
    const updatedTarget = await ctx.services.monitor.updateTarget(
      "cmg0f42sp0001rr9dyhm75pyc",
      {
        name: "Updated Test Target",
        address: "https://example.com",
      }
    );
    console.log("✅ updateTarget:", updatedTarget);

    // Test getting target results
    console.log("\n📊 Testing Target Results...");
    const targetResults = await ctx.services.monitor.getTargetResults(
      "cmg0f42sp0001rr9dyhm75pyc",
      5
    );
    console.log("✅ getTargetResults:", targetResults.length, "results");

    // Test deleting a target
    console.log("\n🗑️ Testing Target Deletion...");
    await ctx.services.monitor.deleteTarget("cmg0f42sp0001rr9dyhm75pyc");
    console.log("✅ deleteTarget: Target deleted successfully");

    console.log("\n🎉 All Extended API tests passed!");
  } catch (error) {
    console.error("❌ Extended API test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testExtendedAPI();

// Test API endpoints directly
import { getAppContext } from "./src/lib/container/container.js";

async function testAPI() {
  try {
    console.log("🧪 Testing API endpoints...");

    // Get the app context
    const ctx = await getAppContext();
    console.log("✅ Container initialized successfully");
    console.log("📋 Available services:", Object.keys(ctx.services));

    // Test the monitor service
    console.log("\n🎯 Testing Monitor Service...");
    const targets = await ctx.services.monitor.getTargets("anonymous");
    console.log("✅ getTargets:", targets);

    // Test creating a target
    console.log("\n➕ Testing Target Creation...");
    const newTarget = await ctx.services.monitor.createTarget({
      name: "Test Target",
      address: "https://google.com",
      ownerId: "anonymous",
    });
    console.log("✅ createTarget:", newTarget);

    // Test getting the target
    console.log("\n🔍 Testing Target Retrieval...");
    const retrievedTarget = await ctx.services.monitor.getTarget(newTarget.id);
    console.log("✅ getTarget:", retrievedTarget);

    // Test running a speed test
    console.log("\n⚡ Testing Speed Test...");
    const speedTestResult = await ctx.services.monitor.runSpeedTest({
      targetId: newTarget.id,
      timeout: 5000,
    });
    console.log("✅ runSpeedTest:", speedTestResult);

    console.log("\n🎉 All API tests passed!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAPI();

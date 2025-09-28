// Test PRPC API endpoints
import {
  createTarget,
  getTargets,
  getTarget,
  updateTarget,
  deleteTarget,
  runSpeedTest,
  getTargetResults,
  startMonitoring,
  stopMonitoring,
  getActiveTargets,
} from "./src/server/prpc.js";

async function testPRPCAPI() {
  try {
    console.log("🧪 Testing PRPC API endpoints...");

    // Test getTargets
    console.log("\n📋 Testing getTargets...");
    const targets = await getTargets({});
    console.log("✅ getTargets:", targets);

    // Test createTarget
    console.log("\n➕ Testing createTarget...");
    const newTarget = await createTarget({
      name: "PRPC Test Target",
      address: "https://github.com",
    });
    console.log("✅ createTarget:", newTarget);

    // Test getTarget
    console.log("\n🔍 Testing getTarget...");
    const retrievedTarget = await getTarget({ id: newTarget.id });
    console.log("✅ getTarget:", retrievedTarget);

    // Test runSpeedTest
    console.log("\n⚡ Testing runSpeedTest...");
    const speedTestResult = await runSpeedTest({
      targetId: newTarget.id,
      timeout: 5000,
    });
    console.log("✅ runSpeedTest:", speedTestResult);

    // Test getTargetResults
    console.log("\n📊 Testing getTargetResults...");
    const results = await getTargetResults({
      targetId: newTarget.id,
      limit: 5,
    });
    console.log("✅ getTargetResults:", results.length, "results");

    // Test startMonitoring
    console.log("\n▶️ Testing startMonitoring...");
    const startResult = await startMonitoring({
      targetId: newTarget.id,
      intervalMs: 30000,
    });
    console.log("✅ startMonitoring:", startResult);

    // Test getActiveTargets
    console.log("\n🎯 Testing getActiveTargets...");
    const activeTargets = await getActiveTargets({});
    console.log("✅ getActiveTargets:", activeTargets);

    // Test stopMonitoring
    console.log("\n⏹️ Testing stopMonitoring...");
    const stopResult = await stopMonitoring({
      targetId: newTarget.id,
    });
    console.log("✅ stopMonitoring:", stopResult);

    // Test updateTarget
    console.log("\n✏️ Testing updateTarget...");
    const updatedTarget = await updateTarget({
      id: newTarget.id,
      name: "Updated PRPC Test Target",
      address: "https://stackoverflow.com",
    });
    console.log("✅ updateTarget:", updatedTarget);

    // Test deleteTarget
    console.log("\n🗑️ Testing deleteTarget...");
    const deleteResult = await deleteTarget({ id: newTarget.id });
    console.log("✅ deleteTarget:", deleteResult);

    console.log("\n🎉 All PRPC API tests passed!");
  } catch (error) {
    console.error("❌ PRPC API test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testPRPCAPI();

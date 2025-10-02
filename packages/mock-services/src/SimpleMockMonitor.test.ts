import { describe, it, expect } from "vitest";
import { SimpleMockMonitor } from "./SimpleMockMonitor";

describe("SimpleMockMonitor", () => {
  it("should be able to create an instance", () => {
    const monitor = new SimpleMockMonitor();
    expect(monitor).toBeDefined();
    expect(typeof monitor.createTarget).toBe("function");
  });

  it("should create a target", async () => {
    const monitor = new SimpleMockMonitor();
    const target = await monitor.createTarget({
      name: "Test Target",
      address: "https://example.com",
      ownerId: "test-user",
    });

    expect(target).toBeDefined();
    expect(target.name).toBe("Test Target");
    expect(target.address).toBe("https://example.com");
    expect(target.ownerId).toBe("test-user");
    expect(target.id).toBeDefined();
    expect(typeof target.id).toBe("string");
  });

  it("should get targets by user ID", async () => {
    const monitor = new SimpleMockMonitor();
    const userId = "test-user";

    // Create a target
    await monitor.createTarget({
      name: "Test Target",
      address: "https://example.com",
      ownerId: userId,
    });

    // Get targets for the user
    const targets = await monitor.getTargets(userId);
    expect(targets).toHaveLength(1);
    expect(targets[0].ownerId).toBe(userId);
  });

  it("should get all targets", async () => {
    const monitor = new SimpleMockMonitor();

    // Create multiple targets
    await monitor.createTarget({
      name: "Target 1",
      address: "https://example1.com",
      ownerId: "user1",
    });

    await monitor.createTarget({
      name: "Target 2",
      address: "https://example2.com",
      ownerId: "user2",
    });

    const allTargets = await monitor.getAllTargets();

    expect(allTargets).toHaveLength(2);
    expect(allTargets[0].name).toBe("Target 1");
    expect(allTargets[1].name).toBe("Target 2");
  });

  it("should run a speed test", async () => {
    const monitor = new SimpleMockMonitor();

    const result = await monitor.runSpeedTest({
      targetId: "test-target",
      target: "https://example.com",
    });

    expect(result).toBeDefined();
    expect(result.targetId).toBe("test-target");
    expect(result.status).toBe("SUCCESS");
    expect(typeof result.ping).toBe("number");
    expect(typeof result.download).toBe("number");
    expect(typeof result.upload).toBe("number");
  });

  it("should start and stop monitoring", () => {
    const monitor = new SimpleMockMonitor();
    const targetId = "test-target";

    // Should not throw when starting monitoring
    expect(() => monitor.startMonitoring(targetId, 1000)).not.toThrow();

    // Should not throw when stopping monitoring
    expect(() => monitor.stopMonitoring(targetId)).not.toThrow();
  });

  it("should return active targets", async () => {
    const monitor = new SimpleMockMonitor();
    const target = await monitor.createTarget({
      name: "Test Target",
      address: "https://example.com",
      ownerId: "test-user",
    });

    monitor.startMonitoring(target.id, 1000);

    const activeTargets = monitor.getActiveTargets();
    expect(activeTargets).toContain(target.id);
  });
});

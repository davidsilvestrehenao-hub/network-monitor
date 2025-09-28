#!/usr/bin/env bun

import {
  WinstonLoggerService,
  LogLevel,
} from "../src/lib/services/concrete/WinstonLoggerService";

async function testLogging() {
  console.log("🧪 Testing Winston Logger Service...\n");

  // Create logger instance
  const logger = new WinstonLoggerService(LogLevel.DEBUG);

  // Test different log levels
  logger.debug("Debug message", { userId: "123", action: "test" });
  logger.info("Info message", { requestId: "req-456", status: "success" });
  logger.warn("Warning message", { warning: "Low disk space", usage: "95%" });
  logger.error("Error message", {
    error: "Database connection failed",
    code: "DB_001",
  });

  // Test with no context
  logger.info("Simple message without context");
  logger.error("Error without context");

  // Test with complex context
  logger.info("Complex context test", {
    user: {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
    },
    request: {
      method: "POST",
      url: "/api/targets",
      timestamp: new Date().toISOString(),
    },
    metrics: {
      responseTime: 150,
      memoryUsage: "45MB",
    },
  });

  console.log("\n✅ Logging test completed!");
  console.log(
    "📁 Check the logs/ directory for file output (in production mode)"
  );
}

// Run the test
testLogging().catch(console.error);

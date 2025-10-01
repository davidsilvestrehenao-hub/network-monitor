// Browser-safe exports for speed-test package
// Only exports services that don't use Node.js-specific APIs

// SpeedTestConfigService is browser-safe
export { SpeedTestConfigService } from "./SpeedTestConfigService.js";

// Note: SpeedTestService and MonitoringScheduler are NOT exported here
// because they use Node.js-specific imports (child_process) and should
// only be used in server-side contexts

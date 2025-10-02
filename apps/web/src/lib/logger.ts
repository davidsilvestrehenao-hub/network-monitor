import { ConsoleLogger } from "@network-monitor/loggers";
import type { ILogger } from "@network-monitor/shared";

/**
 * Simple logger for frontend components
 *
 * This replaces the complex DI container approach with a direct import.
 * Components can simply import and use this logger directly.
 */
export const logger: ILogger = new ConsoleLogger("debug");

// Export the logger as default for convenience
export default logger;

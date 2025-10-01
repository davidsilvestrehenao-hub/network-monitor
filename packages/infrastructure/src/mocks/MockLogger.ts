import type { ILogger, LogContext } from "@network-monitor/shared";
import { LogLevel } from "@network-monitor/shared";

export { LogLevel };

export class MockLogger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private logs: Array<{
    level: LogLevel;
    message: string;
    context?: LogContext;
  }> = [];

  constructor(initialLevel: LogLevel = LogLevel.INFO) {
    this.level = initialLevel;
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (level >= this.level) {
      this.logs.push({ level, message, context });
      // Justification: MockLogger implementation - console usage for testing and development
      // eslint-disable-next-line no-console
      console.log(`[${LogLevel[level]}] ${message}`, context || "");
    }
  }

  // Mock-specific methods for testing
  getLogs(): Array<{ level: LogLevel; message: string; context?: LogContext }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogCount(): number {
    return this.logs.length;
  }
}

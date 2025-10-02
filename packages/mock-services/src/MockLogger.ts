import type { ILogger, LogContext, LogLevel } from "@network-monitor/shared";

export class MockLogger implements ILogger {
  private level: LogLevel = "info";
  private context: LogContext = {};
  private logs: Array<{
    level: LogLevel;
    message: string;
    context?: LogContext;
  }> = [];

  constructor(initialLevel: LogLevel = "info") {
    this.level = initialLevel;
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log("fatal", message, context);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  isLevelEnabled(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
    return levels[level] >= levels[this.level];
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  getContext<T = unknown>(): LogContext<T> {
    return { ...this.context } as LogContext<T>;
  }

  child<T = unknown>(context: LogContext<T>): ILogger {
    const childLogger = new MockLogger(this.level);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (this.isLevelEnabled(level)) {
      this.logs.push({ level, message, context });
      // Justification: MockLogger implementation - console usage for testing and development
      // eslint-disable-next-line no-console
      console.log(`[${level.toUpperCase()}] ${message}`, context || "");
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

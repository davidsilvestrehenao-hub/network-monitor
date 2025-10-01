import type { ILogger, LogContext, LogLevel } from "@network-monitor/shared";

export class LoggerService implements ILogger {
  private level: LogLevel = "info";
  private context: LogContext = {};

  constructor(initialLevel: LogLevel = "info") {
    this.level = initialLevel;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("debug")) {
      // Justification: LoggerService implementation - must use console.debug for debug logs
      // eslint-disable-next-line no-console
      console.debug(
        `[DEBUG] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("info")) {
      // Justification: LoggerService implementation - must use console.info for info logs
      // eslint-disable-next-line no-console
      console.info(
        `[INFO] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("warn")) {
      // Justification: LoggerService implementation - must use console.warn for warning logs
      // eslint-disable-next-line no-console
      console.warn(
        `[WARN] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("error")) {
      // Justification: LoggerService implementation - must use console.error for error logs
      // eslint-disable-next-line no-console
      console.error(
        `[ERROR] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  fatal(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("fatal")) {
      // Justification: LoggerService implementation - must use console.error for fatal logs
      // eslint-disable-next-line no-console
      console.error(
        `[FATAL] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
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

  getContext(): LogContext {
    return { ...this.context };
  }

  child(context: LogContext): ILogger {
    const childLogger = new LoggerService(this.level);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

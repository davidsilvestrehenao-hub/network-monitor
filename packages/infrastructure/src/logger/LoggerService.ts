import type { ILogger, LogContext } from "../interfaces/ILogger";
import { LogLevel } from "../interfaces/ILogger";

export { LogLevel };

export class LoggerService implements ILogger {
  private level: LogLevel = LogLevel.INFO;

  constructor(initialLevel: LogLevel = LogLevel.INFO) {
    this.level = initialLevel;
  }

  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(
        `[DEBUG] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      console.info(
        `[INFO] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(
        `[WARN] ${message}`,
        context ? JSON.stringify(context, null, 2) : ""
      );
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      // Justification: LoggerService implementation - must use console.error for error logs
      // eslint-disable-next-line no-console
      console.error(
        `[ERROR] ${message}`,
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
}

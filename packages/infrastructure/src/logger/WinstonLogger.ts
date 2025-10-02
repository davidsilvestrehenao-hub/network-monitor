import winston from "winston";
// Note: File system and path imports removed to comply with 12-Factor logging (no file transports)
import type { ILogger, LogContext, LogLevel } from "@network-monitor/shared";

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;
  private level: LogLevel = "info";
  private context: LogContext = {};

  constructor(initialLevel: LogLevel = "info") {
    this.level = initialLevel;
    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    return winston.createLogger({
      level: this.level,
      format: logFormat,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private logLevelToWinstonLevel(level: LogLevel): string {
    switch (level) {
      case "debug":
        return "debug";
      case "info":
        return "info";
      case "warn":
        return "warn";
      case "error":
        return "error";
      case "fatal":
        return "error"; // Winston doesn't have fatal, use error
      default:
        return "info";
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("debug")) {
      this.logger.debug(message, { ...this.context, ...context });
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("info")) {
      this.logger.info(message, { ...this.context, ...context });
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("warn")) {
      this.logger.warn(message, { ...this.context, ...context });
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("error")) {
      this.logger.error(message, { ...this.context, ...context });
    }
  }

  fatal(message: string, context?: LogContext): void {
    if (this.isLevelEnabled("fatal")) {
      this.logger.error(message, { ...this.context, ...context });
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    this.logger.level = this.logLevelToWinstonLevel(level);
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
    const childLogger = new WinstonLogger(this.level);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

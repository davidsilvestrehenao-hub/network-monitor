import winston from "winston";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { ILogger, LogContext } from "@network-monitor/shared";
import { LogLevel } from "@network-monitor/shared";

export { LogLevel };

export class WinstonLoggerService implements ILogger {
  private logger: winston.Logger;
  private level: LogLevel = LogLevel.INFO;

  constructor(initialLevel: LogLevel = LogLevel.INFO) {
    this.level = initialLevel;
    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString =
          Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString ? `\n${metaString}` : ""}`;
      })
    );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), logFormat),
      }),
    ];

    // Add file transports in production
    if (process.env.NODE_ENV === "production") {
      // Ensure logs directory exists
      const logsDir = join(process.cwd(), "logs");

      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }

      transports.push(
        new winston.transports.File({
          filename: join(logsDir, "error.log"),
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: join(logsDir, "combined.log"),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    return winston.createLogger({
      level: this.getWinstonLevel(this.level),
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  private getWinstonLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "debug";
      case LogLevel.INFO:
        return "info";
      case LogLevel.WARN:
        return "warn";
      case LogLevel.ERROR:
        return "error";
      default:
        return "info";
    }
  }

  private getLogLevel(level: LogLevel): boolean {
    return this.level <= level;
  }

  debug(message: string, context?: LogContext): void {
    if (this.getLogLevel(LogLevel.DEBUG)) {
      this.logger.debug(message, context || {});
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.getLogLevel(LogLevel.INFO)) {
      this.logger.info(message, context || {});
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.getLogLevel(LogLevel.WARN)) {
      this.logger.warn(message, context || {});
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.getLogLevel(LogLevel.ERROR)) {
      this.logger.error(message, context || {});
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    this.logger.level = this.getWinstonLevel(level);
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

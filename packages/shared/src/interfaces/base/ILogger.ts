// Base logger interface that all loggers should extend
// This ensures consistency and polymorphism across all logging implementations

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  [key: string]: unknown;
}

export interface ILogger {
  // Standard logging methods
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;

  // Level management
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isLevelEnabled(level: LogLevel): boolean;

  // Context management
  setContext(context: LogContext): void;
  getContext(): LogContext;
  child(context: LogContext): ILogger;
}

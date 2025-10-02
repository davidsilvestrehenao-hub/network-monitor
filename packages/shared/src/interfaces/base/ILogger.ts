// Base logger interface that all loggers should extend
// This ensures consistency and polymorphism across all logging implementations

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext<T = unknown> {
  [key: string]: T;
}

export interface ILogger {
  // Standard logging methods
  debug<T = unknown>(message: string, context?: LogContext<T>): void;
  info<T = unknown>(message: string, context?: LogContext<T>): void;
  warn<T = unknown>(message: string, context?: LogContext<T>): void;
  error<T = unknown>(message: string, context?: LogContext<T>): void;
  fatal<T = unknown>(message: string, context?: LogContext<T>): void;

  // Level management
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isLevelEnabled(level: LogLevel): boolean;

  // Context management
  setContext<T = unknown>(context: LogContext<T>): void;
  getContext<T = unknown>(): LogContext<T>;
  child<T = unknown>(context: LogContext<T>): ILogger;
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: unknown;
}

// Helper type for converting any object to LogContext
export type ToLogContext<T> = T extends object ? T & LogContext : LogContext;

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

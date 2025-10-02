import type {
  ILogger as IBaseLogger,
  LogLevel as BaseLogLevel,
  LogContext as BaseLogContext,
} from "../base/ILogger";

// Re-export base types for compatibility
export type LogLevel = BaseLogLevel;
export type LogContext<T = unknown> = BaseLogContext<T>;

// Helper type for converting any object to LogContext
export type ToLogContext<T> = T extends object ? T & LogContext : LogContext;

export interface ILogger extends IBaseLogger {
  // All methods inherited from base interface
}

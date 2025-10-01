import { TYPES } from "./types";
import { createServiceFactory } from "./flexible-container";
import { LoggerService } from "../logger/LoggerService";
import { LogLevel } from "@network-monitor/shared";
import { EventBus } from "../event-bus/EventBus";
import type { ILogger, IEventBus } from "@network-monitor/shared";

export const browserServiceConfig = {
  [TYPES.ILogger]: {
    factory: createServiceFactory<ILogger>(
      () => new LoggerService(LogLevel.DEBUG)
    ),
    dependencies: [],
    singleton: true,
    description: "Browser logger service",
  },
  [TYPES.IEventBus]: {
    factory: createServiceFactory<IEventBus>(() => new EventBus()),
    dependencies: [],
    singleton: true,
    description: "Browser event bus",
  },
};

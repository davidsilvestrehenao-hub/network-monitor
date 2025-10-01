import { TYPES } from "./types";
import { createServiceFactory } from "./flexible-container";
import { LoggerService, LogLevel } from "../services/concrete/LoggerService";
import { EventBus } from "../services/concrete/EventBus";
import type { ILogger } from "../services/interfaces/ILogger";
import type { IEventBus } from "../services/interfaces/IEventBus";

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

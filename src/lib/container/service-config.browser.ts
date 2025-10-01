import { TYPES } from "./types";
import { createServiceFactory } from "./utils";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
import { EventBus } from "@network-monitor/infrastructure";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";

import type { ServiceConfigMap } from "./types";

export const browserServiceConfig: ServiceConfigMap = {
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

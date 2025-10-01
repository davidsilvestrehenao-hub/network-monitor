import { TYPES } from "./types.js";
import { createServiceFactory } from "./flexible-container.js";
import { LoggerService } from "../logger/LoggerService.js";
import { LogLevel } from "@network-monitor/shared";
import { EventBus } from "../event-bus/EventBus.js";
import type {
  ILogger,
  IEventBus,
  ISpeedTestConfigService,
} from "@network-monitor/shared";
import { MockSpeedTestConfigService } from "../mocks/MockSpeedTestConfigService.js";

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
  [TYPES.ISpeedTestConfigService]: {
    factory: createServiceFactory<ISpeedTestConfigService>(
      container => new MockSpeedTestConfigService(container.get(TYPES.ILogger))
    ),
    dependencies: [TYPES.ILogger],
    singleton: true,
    description: "Mock speed test URL configuration service for browser",
  },
};

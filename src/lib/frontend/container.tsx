import { createContext, useContext, ParentProps } from "solid-js";
import { IAPIClient } from "./interfaces/IAPIClient";
import { ICommandQueryService } from "./interfaces/ICommandQueryService";
import { IEventBus } from "~/lib/services/interfaces/IEventBus";
import { ILogger, LogLevel } from "~/lib/services/interfaces/ILogger";
import { APIClient } from "./services/APIClient";
import { CommandQueryService } from "./services/CommandQueryService";
import { EventBus } from "~/lib/services/concrete/EventBus";
import { LoggerService } from "~/lib/services/concrete/LoggerService";

// Frontend service interfaces
export interface FrontendServices {
  apiClient: IAPIClient;
  commandQuery: ICommandQueryService;
  eventBus: IEventBus;
  logger: ILogger;
}

// Create services - SSR safe
let frontendServices: FrontendServices | null = null;

function createFrontendServices(): FrontendServices {
  if (frontendServices) {
    return frontendServices;
  }

  const logger = new LoggerService(LogLevel.DEBUG);
  const eventBus = new EventBus();
  const apiClient = new APIClient();
  const commandQuery = new CommandQueryService(apiClient, eventBus, logger);

  frontendServices = {
    apiClient,
    commandQuery,
    eventBus,
    logger,
  };

  return frontendServices;
}

// Create context
const FrontendServicesContext = createContext<FrontendServices>();

// Provider component
export function FrontendServicesProvider(props: ParentProps) {
  const services = createFrontendServices();
  return (
    <FrontendServicesContext.Provider value={services}>
      {props.children}
    </FrontendServicesContext.Provider>
  );
}

// Hook to use services
export function useFrontendServices(): FrontendServices {
  const context = useContext(FrontendServicesContext);
  if (!context) {
    throw new Error(
      "useFrontendServices must be used within FrontendServicesProvider"
    );
  }
  return context;
}

// Individual service hooks for convenience
export function useAPIClient(): IAPIClient {
  return useFrontendServices().apiClient;
}

export function useCommandQuery(): ICommandQueryService {
  return useFrontendServices().commandQuery;
}

export function useEventBus(): IEventBus {
  return useFrontendServices().eventBus;
}

export function useLogger(): ILogger {
  return useFrontendServices().logger;
}

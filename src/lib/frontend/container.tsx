import type { ParentProps } from "solid-js";
import { createContext, useContext, createEffect, createSignal } from "solid-js";
import type { IAPIClient } from "./interfaces/IAPIClient";
import type { ICommandQueryService } from "./interfaces/ICommandQueryService";
import type { IEventBus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import { initializeBrowserContainer } from "~/lib/container/container.browser";
import { getContainer } from "~/lib/container/flexible-container";
import { TYPES } from "~/lib/container/types";
import { APIClient } from "./services/APIClient";
import { CommandQueryService } from "./services/CommandQueryService";

// Frontend service interfaces
export interface FrontendServices {
  apiClient: IAPIClient;
  commandQuery: ICommandQueryService;
  eventBus: IEventBus;
  logger: ILogger;
}

// Create context
const FrontendServicesContext = createContext<FrontendServices>();

// Provider component
export function FrontendServicesProvider(props: ParentProps) {
  const [services, setServices] = createSignal<FrontendServices | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  // Initialize services using the flexible container
  // Justification: Async initialization is necessary for container setup
  // eslint-disable-next-line solid/reactivity
  createEffect(async () => {
    try {
      // Initialize browser container
      await initializeBrowserContainer();

      const container = getContainer();

      // Get shared services from container
      const logger = container.get<ILogger>(TYPES.ILogger);
      const eventBus = container.get<IEventBus>(TYPES.IEventBus);

      // Create frontend-specific services
      const apiClient = new APIClient();
      const commandQuery = new CommandQueryService(apiClient, eventBus, logger);

      setServices({
        apiClient,
        commandQuery,
        eventBus,
        logger,
      });

      logger.info("Frontend services initialized successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      // Justification: Console logging is appropriate for initialization errors
      // eslint-disable-next-line no-console
      console.error("Failed to initialize frontend services:", error);
    }
  });

  return (
    <>
      {error() && (
        <div class="flex items-center justify-center min-h-screen bg-red-50">
          <div class="text-center p-8">
            <h1 class="text-2xl font-bold text-red-600 mb-4">
              Initialization Error
            </h1>
            <p class="text-gray-700">{error()?.message}</p>
          </div>
        </div>
      )}
      {!error() && !services() && (
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p class="mt-4 text-gray-600">Initializing services...</p>
          </div>
        </div>
      )}
      {!error() && services() && (
        <FrontendServicesContext.Provider value={services()!}>
          {props.children}
        </FrontendServicesContext.Provider>
      )}
    </>
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

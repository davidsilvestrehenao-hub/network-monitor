import type { ServiceFactory } from "./types";

// Factory function for creating service factories
export function createServiceFactory<T>(
  factory: ServiceFactory<T>
): ServiceFactory<T> {
  return factory;
}

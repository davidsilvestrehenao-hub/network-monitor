/**
 * Application Bootstrap Utilities
 *
 * Exports utilities for bootstrapping applications (workers, APIs, web apps) with JSON-configurable DI containers
 */

export {
  bootstrapApplication,
  // Add aliases for backward compatibility
  bootstrapApplication as bootstrapMicroservice,
  createHealthCheckEndpoint,
  getRequiredService,
  getRequiredRepository,
  type ApplicationBootstrapOptions,
  type ApplicationContext,
  // Add type alias for backward compatibility
  type ApplicationContext as MicroserviceContext,
} from "./bootstrap.js";

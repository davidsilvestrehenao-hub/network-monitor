/**
 * Microservice Bootstrap Utilities
 *
 * Exports utilities for bootstrapping microservices with JSON-configurable DI containers
 */

export {
  bootstrapMicroservice,
  createHealthCheckEndpoint,
  getRequiredService,
  getRequiredRepository,
  type MicroserviceBootstrapOptions,
  type MicroserviceContext,
} from "./bootstrap";

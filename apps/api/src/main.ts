/**
 * Headless API Server (REST + GraphQL)
 *
 * This is a multi-protocol API server that exposes the same services via:
 * - REST API (standard HTTP/JSON)
 * - GraphQL API (queries, mutations, subscriptions)
 *
 * Perfect for:
 * - Mobile app backends
 * - External integrations
 * - Multi-language clients
 * - Webhooks and third-party services
 *
 * DRY Architecture:
 * All API styles (REST, GraphQL, tRPC) share the SAME service layer.
 * No code duplication - services are resolved from the DI container.
 *
 * 12-Factor Compliance:
 * ✅ Factor III: Config from environment variables
 * ✅ Factor VII: Port binding - self-contained HTTP server
 * ✅ Factor IX: Graceful shutdown
 * ✅ Factor XI: Logs to stdout/stderr
 */

import {
  bootstrapMicroservice,
  type MicroserviceContext,
  validateEnvironment,
  getEnvironment,
  createGracefulShutdown,
  type IGracefulShutdown,
} from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
  GraphQLContextRequest,
} from "@network-monitor/shared";
import { getBunGlobal } from "@network-monitor/shared";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { findAvailablePort } from "./utils/port-utils";
import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { schema } from "./graphql/schema";
import { createResolvers, createGraphQLContext } from "./graphql/resolvers";
import { registerRESTRoutes } from "./rest/routes";
import {
  getOpenAPISpec,
  handleDocsRequest,
  autoLaunchBrowser,
} from "./openapi/swagger-ui";

/**
 * Create API Application graceful shutdown handler
 */
function createAPIGracefulShutdown(
  context: MicroserviceContext,
  server: unknown // Bun server instance
): IGracefulShutdown {
  async function performAppShutdown(): Promise<void> {
    context.logger.info("Stopping API server...");

    // Stop accepting new requests
    await stopHttpServer();

    // Complete in-flight requests
    await completeInFlightRequests();

    // Close any remaining connections
    await closeConnections();

    context.logger.info("API server shutdown complete");
  }

  async function stopHttpServer(): Promise<void> {
    if (
      server &&
      typeof server === "object" &&
      server !== null &&
      "stop" in server &&
      typeof (server as { stop: unknown }).stop === "function"
    ) {
      context.logger.info("Stopping HTTP server...");
      (server as { stop: () => void }).stop();
    } else {
      context.logger.debug("Server does not support graceful stop");
    }
  }

  async function completeInFlightRequests(): Promise<void> {
    // TODO: Wait for in-flight requests to complete
    context.logger.debug("Waiting for in-flight requests to complete...");
    // Give requests a moment to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function closeConnections(): Promise<void> {
    // TODO: Close any remaining connections
    context.logger.debug("Closing remaining connections...");
  }

  return createGracefulShutdown(
    context.logger,
    performAppShutdown,
    context.database ?? undefined,
    context.eventBus,
    30000 // 30 second timeout
  );
}

async function startMonolith() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Justification: Console statements for 12-factor compliance banner
  // eslint-disable-next-line no-console
  console.log("🚀 Starting Network Monitor Monolith (12-Factor)...");
  // eslint-disable-next-line no-console
  console.log("📦 All services in one process");
  // eslint-disable-next-line no-console
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  // eslint-disable-next-line no-console
  console.log(`⚙️  Event Bus: ${config.eventBusType}`);
  // eslint-disable-next-line no-console
  console.log(`📊 Log Level: ${config.logLevel}`);
  // eslint-disable-next-line no-console
  console.log("");

  // Bootstrap with environment configuration
  // Service wiring: Which implementations to use (DI configuration)
  // Runtime config: All values come from environment variables
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  // Justification: Console statements for service wiring info
  // eslint-disable-next-line no-console
  console.log(`📦 Service wiring: ${wiringConfig}.json`);
  // eslint-disable-next-line no-console
  console.log(`⚙️  Runtime config: from environment variables`);

  const context = await bootstrapMicroservice({
    applicationName: "Network Monitor Monolith",
    configPath,
    enableDatabase: true,
    showBanner: false, // Custom banner above

    // Custom initialization - setup all services
    onInitialized: async (ctx: MicroserviceContext) => {
      // Get all services
      const monitorService = ctx.services.monitor as IMonitorService | null;
      const alertingService = ctx.services.alerting as IAlertingService | null;
      const notificationService = ctx.services
        .notification as INotificationService | null;

      ctx.logger.info("Infrastructure initialized", {
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
        services: {
          monitor: config.monitorServiceEnabled,
          alerting: config.alertingServiceEnabled,
          notification: config.notificationServiceEnabled,
        },
      });

      ctx.logger.info("Services running:");
      if (monitorService) {
        ctx.logger.info("  ✅ Monitor Service (targets, speed tests)");
      }
      if (alertingService) {
        ctx.logger.info("  ✅ Alerting Service (alert rules, incidents)");
      }
      if (notificationService) {
        ctx.logger.info("  ✅ Notification Service (push, in-app)");
      }
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Factor III: Config from environment");
      ctx.logger.info("  ✅ Factor IX: Graceful shutdown enabled");
      ctx.logger.info("  ✅ Factor XI: Logs to stdout/stderr");
      ctx.logger.info("  ✅ Factor X: PostgreSQL supported");
      ctx.logger.info("");

      ctx.logger.info("To scale to microservices:");
      ctx.logger.info("  1. Set EVENT_BUS_TYPE=rabbitmq");
      ctx.logger.info("  2. Deploy services separately (apps/*-service/)");
      ctx.logger.info("  3. Zero code changes needed!");
      ctx.logger.info("");

      // Note: Graceful shutdown will be set up after server creation
      ctx.logger.info("Infrastructure initialized, server will start next");
    },

    // Custom shutdown - cleanup all services
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Shutting down all services...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Load OpenAPI specification
  const openAPISpec = getOpenAPISpec();

  // Create GraphQL server
  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: createResolvers(context),
  });

  const yoga = createYoga({
    schema: executableSchema,
    context: (req: GraphQLContextRequest) =>
      createGraphQLContext(req.request, context),
    graphqlEndpoint: "/graphql",
    landingPage: true, // GraphQL Playground
  });

  // Create Hono app
  const app = new Hono();

  // Middleware
  app.use("*", honoLogger()); // Request logging
  app.use(
    "*",
    cors({
      origin: "*", // TODO: Configure allowed origins via environment
      credentials: true,
    })
  );

  // Root - API documentation
  app.get("/", c => {
    return c.json(
      {
        name: "Network Monitor API",
        version: "1.0.0",
        description: "Multi-protocol API server with Hono",
        documentation: {
          openapi: `http://${config.host}:${config.port}/api/docs`,
          graphql: `http://${config.host}:${config.port}/graphql`,
          postman: "Import postman-collection.json",
          insomnia: "Import insomnia-collection.json",
        },
        endpoints: {
          rest: {
            documentation: "/api/docs",
            spec: "/api/docs/spec.yaml",
            baseUrl: "/api",
            health: "/health",
          },
          graphql: {
            endpoint: "/graphql",
            playground: "/graphql (visit in browser)",
          },
        },
        services: {
          monitor: !!context.services.monitor,
          alerting: !!context.services.alerting,
          notification: !!context.services.notification,
        },
      },
      200
    );
  });

  // OpenAPI Documentation (Swagger UI)
  app.get("/api/docs", c => handleDocsRequest(c.req.raw, openAPISpec));
  app.get("/api/docs/*", c => handleDocsRequest(c.req.raw, openAPISpec));

  // GraphQL endpoint
  app.all("/graphql", c => yoga.fetch(c.req.raw));

  // Register REST routes
  registerRESTRoutes(app, context);

  // Error handling middleware
  app.onError((err, c) => {
    context.logger.error("Request error", { error: err, path: c.req.path });
    return c.json(
      {
        error: "Internal Server Error",
        message: err.message,
        path: c.req.path,
      },
      500
    );
  });

  // 404 handler
  app.notFound(c => {
    return c.json(
      {
        error: "Not Found",
        path: c.req.path,
        method: c.req.method,
        availableEndpoints: [
          "GET /",
          "GET /health",
          "GET /api/docs",
          "GET /graphql",
          "GET /api/targets",
          "POST /api/targets",
          "GET /api/targets/:id",
          "PUT /api/targets/:id",
          "DELETE /api/targets/:id",
          "POST /api/targets/:id/start",
          "POST /api/targets/:id/stop",
          "POST /api/targets/:id/test",
          "GET /api/targets/active",
          "GET /api/alert-rules/target/:targetId",
          "POST /api/alert-rules",
          "PUT /api/alert-rules/:id",
          "DELETE /api/alert-rules/:id",
          "GET /api/incidents/target/:targetId",
          "POST /api/incidents/:id/resolve",
          "GET /api/notifications/user/:userId",
          "POST /api/notifications/:id/read",
          "POST /api/push-subscriptions",
        ],
      },
      404
    );
  });

  // Find an available port starting from the configured port
  context.logger.info(
    `🔍 Looking for available port starting from ${config.port}...`
  );
  let availablePort = await findAvailablePort(config.port);
  context.logger.info(`✅ Found available port: ${availablePort}`);

  // Start HTTP server using Bun with Hono with retry logic
  const bunRuntime = getBunGlobal();
  if (!bunRuntime) {
    throw new Error("This application requires Bun runtime");
  }

  let server;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      server = bunRuntime.serve({
        port: availablePort,
        hostname: config.host,
        fetch: app.fetch, // Hono handles all routing
      });
      break; // Success, exit retry loop
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "EADDRINUSE" &&
        retryCount < maxRetries - 1
      ) {
        retryCount++;
        context.logger.warn(
          `Port ${availablePort} is now in use, finding new port...`
        );
        const newPort = await findAvailablePort(availablePort + 1);
        context.logger.info(`✅ Found new available port: ${newPort}`);
        availablePort = newPort;
      } else {
        throw error; // Re-throw if not a port conflict or max retries reached
      }
    }
  }

  // 12-Factor Factor IX: Setup graceful shutdown using new interface
  const gracefulShutdown = createAPIGracefulShutdown(context, server);
  gracefulShutdown.setupGracefulShutdown();

  context.logger.info(
    "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
  );

  context.logger.info("🚀 API Server is now running", {
    port: availablePort,
    host: config.host,
    environment: config.nodeEnv,
    endpoints: {
      rest: `http://${config.host}:${availablePort}/api`,
      graphql: `http://${config.host}:${availablePort}/graphql`,
      health: `http://${config.host}:${availablePort}/health`,
      docs: `http://${config.host}:${availablePort}/api/docs`,
    },
  });

  context.logger.info("📚 Available Protocols:");
  context.logger.info("  ✅ REST API - Standard HTTP/JSON");
  context.logger.info("  ✅ GraphQL - Flexible queries and mutations");
  context.logger.info("");

  context.logger.info("📖 Documentation:");
  context.logger.info(
    `  📘 OpenAPI/Swagger: http://${config.host}:${availablePort}/api/docs`
  );
  context.logger.info(
    `  🎮 GraphQL Playground: http://${config.host}:${availablePort}/graphql`
  );
  context.logger.info(
    `  📄 Postman Collection: apps/api/postman-collection.json`
  );
  context.logger.info(
    `  📄 Insomnia Collection: apps/api/insomnia-collection.json`
  );
  context.logger.info("");

  // Auto-launch browser if enabled
  if (config.enableBrowserLaunch) {
    const docsUrl = `http://${config.host}:${availablePort}/api/docs`;
    context.logger.info(`🚀 Opening API documentation in browser: ${docsUrl}`);
    autoLaunchBrowser(docsUrl, context.logger).catch(() => {
      // Silently ignore errors
    });
  }

  // Return server handle for shutdown
  return { context, server };
}

// Start the monolith
startMonolith().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start monolith:", error);
  process.exit(1);
});

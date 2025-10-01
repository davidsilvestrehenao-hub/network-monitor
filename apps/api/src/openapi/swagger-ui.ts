/**
 * Swagger UI Handler
 *
 * Serves the OpenAPI documentation with a beautiful, interactive UI.
 * Uses Scalar API Reference for modern, fast documentation.
 */

import { readFileSync } from "fs";
import { join } from "path";
import * as yaml from "js-yaml";

/**
 * Gets the OpenAPI spec from the YAML file
 */
export function getOpenAPISpec(): string {
  const specPath = join(process.cwd(), "openapi.yaml");
  return readFileSync(specPath, "utf-8");
}

/**
 * Creates Swagger UI HTML page
 * Alternative simple implementation if needed
 */
export function createSwaggerUIHTML(_spec: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Network Monitor API - Documentation</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script
    id="api-reference"
    data-url="/api/docs/spec.yaml"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `.trim();
}

/**
 * Creates a modern API documentation page using Scalar
 */
export function createScalarHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Network Monitor API Documentation</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <script
    id="api-reference"
    data-url="/api/docs/spec.yaml"
    data-configuration='{"theme":"purple","layout":"modern","defaultHttpClient":{"targetKey":"shell","clientKey":"curl"}}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `.trim();
}

/**
 * Handle OpenAPI documentation requests
 */
export async function handleDocsRequest(
  req: Request,
  spec: string
): Promise<Response> {
  const url = new URL(req.url);

  // Serve the OpenAPI spec (YAML)
  if (url.pathname === "/api/docs/spec.yaml") {
    return new Response(spec, {
      headers: {
        "Content-Type": "text/yaml",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Serve the OpenAPI spec (JSON)
  if (url.pathname === "/api/docs/spec.json") {
    // Convert YAML to JSON using js-yaml
    try {
      const jsonSpec = yaml.load(spec);
      return new Response(JSON.stringify(jsonSpec, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      // Fallback: return YAML as-is (some tools can handle YAML)
      return new Response(spec, {
        headers: {
          "Content-Type": "text/yaml",
          "Cache-Control": "no-cache",
        },
      });
    }
  }

  // Serve Swagger UI HTML
  if (url.pathname === "/api/docs" || url.pathname === "/api/docs/") {
    return new Response(createScalarHTML(), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return new Response("Not Found", { status: 404 });
}

/**
 * Auto-launch browser in development mode
 */
export async function autoLaunchBrowser(
  url: string,
  logger: { info: (msg: string) => void }
): Promise<void> {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!isDevelopment) {
    return;
  }

  // Wait a bit for server to fully start
  await new Promise(resolve => setTimeout(resolve, 1000));

  logger.info(`🚀 Opening API documentation in browser: ${url}`);

  const platform = process.platform;
  let command: string;
  let args: string[];

  if (platform === "darwin") {
    // macOS
    command = "open";
    args = [url];
  } else if (platform === "win32") {
    // Windows
    command = "cmd";
    args = ["/c", "start", url];
  } else {
    // Linux
    command = "xdg-open";
    args = [url];
  }

  try {
    // Use Node.js child_process to spawn browser
    const { spawn } = await import("child_process");
    const proc = spawn(command, args, {
      stdio: "ignore",
      detached: true,
    });

    proc.unref(); // Allow parent to exit independently
  } catch (error) {
    // Silently fail - not critical
    logger.info(`ℹ️  Could not auto-launch browser. Visit manually: ${url}`);
  }
}

import { type VoidComponent, onMount, createSignal } from "solid-js";

// Type declarations for Swagger UI
declare global {
  interface Window {
    SwaggerUIBundle: {
      (config: unknown): unknown;
      presets: {
        apis: unknown;
      };
      plugins: {
        DownloadUrl: unknown;
      };
    };
    SwaggerUIStandalonePreset: unknown;
  }
}

const SwaggerUI: VoidComponent = () => {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      // Load CSS first
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css";
      document.head.appendChild(link);

      // Load the OpenAPI spec first
      const response = await fetch("/api/docs");
      if (!response.ok) {
        throw new Error(`Failed to load OpenAPI spec: ${response.status}`);
      }
      const spec = await response.json();

      // Load Swagger UI bundle
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js";

      script.onload = () => {
        const standaloneScript = document.createElement("script");
        standaloneScript.src =
          "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js";

        standaloneScript.onload = () => {
          try {
            // Initialize Swagger UI with the loaded spec
            if (window.SwaggerUIBundle) {
              window.SwaggerUIBundle({
                spec: spec, // Use the loaded spec instead of URL
                dom_id: "#swagger-ui",
                deepLinking: true,
                presets: [
                  window.SwaggerUIBundle.presets.apis,
                  window.SwaggerUIStandalonePreset,
                ],
                plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: (request: unknown) => {
                  console.log("Making request:", request);
                  return request;
                },
                responseInterceptor: (response: unknown) => {
                  console.log("Received response:", response);
                  return response;
                },
              });
              setLoading(false);
            } else {
              throw new Error("SwaggerUIBundle not available");
            }
          } catch (err) {
            console.error("Error initializing Swagger UI:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setLoading(false);
          }
        };

        standaloneScript.onerror = () => {
          setError("Failed to load Swagger UI standalone preset");
          setLoading(false);
        };

        document.head.appendChild(standaloneScript);
      };

      script.onerror = () => {
        setError("Failed to load Swagger UI bundle");
        setLoading(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.error("Error loading OpenAPI spec:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load OpenAPI specification"
      );
      setLoading(false);
    }
  });

  return (
    <div class="min-h-screen bg-white">
      {loading() && (
        <div class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p class="text-gray-600">Loading Swagger UI...</p>
          </div>
        </div>
      )}

      {error() && (
        <div class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="text-red-500 text-xl mb-4">⚠️</div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">
              Failed to load Swagger UI
            </h2>
            <p class="text-gray-600 mb-4">{error()}</p>
            <div class="space-y-2">
              <a
                href="/api/docs"
                class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                View Raw OpenAPI Spec
              </a>
              <br />
              <button
                onClick={() => window.location.reload()}
                class="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        id="swagger-ui"
        class="swagger-ui"
        style={{ display: loading() || error() ? "none" : "block" }}
      />
    </div>
  );
};

export default SwaggerUI;

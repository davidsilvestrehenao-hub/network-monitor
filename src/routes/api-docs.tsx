import { type VoidComponent } from "solid-js";

const ApiDocs: VoidComponent = () => {
  return (
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">
          PWA Connection Monitor API Documentation
        </h1>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            pRPC API Endpoints
          </h2>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-medium text-gray-800">
                POST /api/prpc/targets.list
              </h3>
              <p class="text-gray-600 text-sm">Get all monitoring targets</p>
              <div class="mt-2 text-xs text-gray-500">Body: {"{}"}</div>
            </div>

            <div class="border-l-4 border-green-500 pl-4">
              <h3 class="font-medium text-gray-800">
                POST /api/prpc/targets.create
              </h3>
              <p class="text-gray-600 text-sm">
                Create a new monitoring target
              </p>
              <div class="mt-2 text-xs text-gray-500">
                Body: {"{ name: string, address: string }"}
              </div>
            </div>

            <div class="border-l-4 border-yellow-500 pl-4">
              <h3 class="font-medium text-gray-800">
                POST /api/prpc/targets.get
              </h3>
              <p class="text-gray-600 text-sm">Get a specific target by ID</p>
              <div class="mt-2 text-xs text-gray-500">
                Body: {"{ id: string }"}
              </div>
            </div>

            <div class="border-l-4 border-purple-500 pl-4">
              <h3 class="font-medium text-gray-800">
                POST /api/prpc/targets.runSpeedTest
              </h3>
              <p class="text-gray-600 text-sm">Run a speed test on a target</p>
              <div class="mt-2 text-xs text-gray-500">
                Body: {"{ targetId: string, timeout?: number }"}
              </div>
            </div>

            <div class="border-l-4 border-indigo-500 pl-4">
              <h3 class="font-medium text-gray-800">
                POST /api/prpc/targets.startMonitoring
              </h3>
              <p class="text-gray-600 text-sm">Start monitoring a target</p>
              <div class="mt-2 text-xs text-gray-500">
                Body: {"{ targetId: string, intervalMs: number }"}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Test the pRPC API
          </h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-800 mb-2">Create a Target</h3>
              <div class="bg-gray-50 p-4 rounded border">
                <pre class="text-sm text-gray-700">
                  {`curl -X POST http://localhost:3000/api/prpc/targets.create \\
      -H "Content-Type: application/json" \\
      -d '{
        "name": "Google DNS",
        "address": "https://8.8.8.8"
      }'`}
                </pre>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-800 mb-2">Get All Targets</h3>
              <div class="bg-gray-50 p-4 rounded border">
                <pre class="text-sm text-gray-700">
                  {`curl -X POST http://localhost:3000/api/prpc/targets.list \\
      -H "Content-Type: application/json" \\
      -d '{}'`}
                </pre>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-800 mb-2">Run Speed Test</h3>
              <div class="bg-gray-50 p-4 rounded border">
                <pre class="text-sm text-gray-700">
                  {`curl -X POST http://localhost:3000/api/prpc/targets.runSpeedTest \\
      -H "Content-Type: application/json" \\
      -d '{"targetId": "target-id-here", "timeout": 10000}'`}
                </pre>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-800 mb-2">Start Monitoring</h3>
              <div class="bg-gray-50 p-4 rounded border">
                <pre class="text-sm text-gray-700">
                  {`curl -X POST http://localhost:3000/api/prpc/targets.startMonitoring \\
      -H "Content-Type: application/json" \\
      -d '{"targetId": "target-id-here", "intervalMs": 30000}'`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            OpenAPI Specification
          </h2>
          <p class="text-gray-600 mb-4">
            The complete OpenAPI 3.0 specification is available in two formats:
          </p>
          <div class="space-x-4">
            <a
              href="/api/swagger"
              target="_blank"
              class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Interactive Swagger UI
            </a>
            <a
              href="/api/docs"
              target="_blank"
              class="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Raw JSON Spec
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;

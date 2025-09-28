// Simple Express server to serve the application
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getAppContext } from "./src/lib/container/container.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the container
let appContext;
try {
  appContext = await getAppContext();
  console.log("✅ Container initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize container:", error.message);
  process.exit(1);
}

// API endpoints
app.get("/api/targets", async (req, res) => {
  try {
    const targets = await appContext.services.monitor.getTargets("anonymous");
    res.json({ success: true, data: targets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/targets", async (req, res) => {
  try {
    const { name, address } = req.body;
    const target = await appContext.services.monitor.createTarget({
      name,
      address,
      ownerId: "anonymous",
    });
    res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/targets/:id", async (req, res) => {
  try {
    const target = await appContext.services.monitor.getTarget(req.params.id);
    if (!target) {
      return res
        .status(404)
        .json({ success: false, error: "Target not found" });
    }
    res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/targets/:id", async (req, res) => {
  try {
    const { name, address } = req.body;
    const target = await appContext.services.monitor.updateTarget(
      req.params.id,
      {
        name,
        address,
      }
    );
    res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/targets/:id", async (req, res) => {
  try {
    await appContext.services.monitor.deleteTarget(req.params.id);
    res.json({ success: true, message: "Target deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/targets/:id/speed-test", async (req, res) => {
  try {
    const result = await appContext.services.monitor.runSpeedTest({
      targetId: req.params.id,
      timeout: 10000,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/targets/:id/results", async (req, res) => {
  try {
    const results = await appContext.services.monitor.getTargetResults(
      req.params.id,
      parseInt(req.query.limit) || 10
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: Object.keys(appContext.services),
  });
});

// Serve static files
app.use(express.static(join(__dirname, "dist")));

// Parse JSON bodies
app.use(express.json());

// Catch all handler - serve the app
app.get("/*", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>PWA Connection Monitor</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .api-test { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .result { margin-top: 10px; padding: 10px; background: white; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 PWA Connection Monitor</h1>
        <p>Server is running! The API is working perfectly.</p>
        
        <div class="api-test">
          <h3>🧪 API Test Interface</h3>
          <button onclick="testHealth()">Test Health Check</button>
          <button onclick="testGetTargets()">Get Targets</button>
          <button onclick="testCreateTarget()">Create Target</button>
          <button onclick="testSpeedTest()">Run Speed Test</button>
          <div id="result" class="result"></div>
        </div>
        
        <div class="api-test">
          <h3>📊 Available Endpoints</h3>
          <ul>
            <li><code>GET /api/health</code> - Health check</li>
            <li><code>GET /api/targets</code> - Get all targets</li>
            <li><code>POST /api/targets</code> - Create target</li>
            <li><code>GET /api/targets/:id</code> - Get specific target</li>
            <li><code>PUT /api/targets/:id</code> - Update target</li>
            <li><code>DELETE /api/targets/:id</code> - Delete target</li>
            <li><code>POST /api/targets/:id/speed-test</code> - Run speed test</li>
            <li><code>GET /api/targets/:id/results</code> - Get speed test results</li>
          </ul>
        </div>
      </div>
      
      <script>
        async function testHealth() {
          try {
            const response = await fetch('/api/health');
            const data = await response.json();
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('result').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
          }
        }
        
        async function testGetTargets() {
          try {
            const response = await fetch('/api/targets');
            const data = await response.json();
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('result').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
          }
        }
        
        async function testCreateTarget() {
          try {
            const response = await fetch('/api/targets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Test Target',
                address: 'https://google.com'
              })
            });
            const data = await response.json();
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('result').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
          }
        }
        
        async function testSpeedTest() {
          try {
            // First create a target
            const createResponse = await fetch('/api/targets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Speed Test Target',
                address: 'https://google.com'
              })
            });
            const target = await createResponse.json();
            
            if (target.success) {
              // Then run speed test
              const testResponse = await fetch(\`/api/targets/\${target.data.id}/speed-test\`, {
                method: 'POST'
              });
              const result = await testResponse.json();
              document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            }
          } catch (error) {
            document.getElementById('result').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

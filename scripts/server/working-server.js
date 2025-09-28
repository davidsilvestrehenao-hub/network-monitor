// Working server that serves both frontend and API
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getAppContext } from "./src/lib/container/container.js";
import * as targetsAPI from "./src/server/api/targets.js";

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

// Parse JSON bodies
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: Object.keys(appContext.services),
  });
});

app.get("/api/targets", async (req, res) => {
  try {
    const targets = await targetsAPI.getTargets("anonymous");
    res.json({ success: true, data: targets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/targets", async (req, res) => {
  try {
    const target = await targetsAPI.createTarget({
      ...req.body,
      ownerId: "anonymous",
    });
    res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/targets/:id", async (req, res) => {
  try {
    const target = await targetsAPI.getTarget(req.params.id);
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
    const target = await targetsAPI.updateTarget(req.params.id, req.body);
    res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/targets/:id", async (req, res) => {
  try {
    await targetsAPI.deleteTarget(req.params.id);
    res.json({ success: true, message: "Target deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/targets/:id/speed-test", async (req, res) => {
  try {
    const result = await targetsAPI.runSpeedTest({
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
    const results = await targetsAPI.getTargetResults(
      req.params.id,
      parseInt(req.query.limit) || 10
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files (if any)
app.use(express.static(join(__dirname, "dist")));

// Simple root route
app.get("/", (req, res) => {
  res.json({
    message: "PWA Connection Monitor API Server",
    status: "running",
    endpoints: [
      "GET /api/health",
      "GET /api/targets",
      "POST /api/targets",
      "GET /api/targets/:id",
      "PUT /api/targets/:id",
      "DELETE /api/targets/:id",
      "POST /api/targets/:id/speed-test",
      "GET /api/targets/:id/results",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Working server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

// Initialize graceful shutdown for web app
import "./lib/graceful-shutdown";
import "~/lib/chart-config";

export default function App() {
  return (
    <Router
      root={props => (
        <Suspense fallback={<div class="p-4">Loading...</div>}>
          {props.children}
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

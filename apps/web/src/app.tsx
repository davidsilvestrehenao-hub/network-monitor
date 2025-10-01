import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { FrontendServiceProvider } from "~/lib/frontend/container";
import "./app.css";
import "~/lib/chart-config";

export default function App() {
  return (
    <FrontendServiceProvider>
      <Router
        root={props => (
          <Suspense fallback={<div class="p-4">Loading...</div>}>
            {props.children}
          </Suspense>
        )}
      >
        <FileRoutes />
      </Router>
    </FrontendServiceProvider>
  );
}

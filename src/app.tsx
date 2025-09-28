// @refresh reload
import "./app.css";
import "~/lib/chart-config"; // Register Chart.js plugins
import { MetaProvider, Title, Link, Meta } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createEffect } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SessionProvider } from "@solid-mediakit/auth/client";
import { FrontendServicesProvider } from "~/lib/frontend/container";

export default function App() {
  const queryClient = new QueryClient();

  // Register service worker for PWA functionality
  createEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(registration => {
          console.log("SW registered: ", registration);
        })
        .catch(registrationError => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  });

  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>PWA Connection Monitor</Title>
          <Meta
            name="description"
            content="Monitor your internet connection quality with real-time speed tests and alerts"
          />
          <Meta name="theme-color" content="#3b82f6" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* PWA Manifest */}
          <Link rel="manifest" href="/manifest.json" />

          {/* PWA Icons */}
          <Link rel="icon" href="/favicon.ico" />
          <Link rel="apple-touch-icon" href="/icon-192.png" />

          {/* PWA Meta Tags */}
          <Meta name="apple-mobile-web-app-capable" content="yes" />
          <Meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <Meta name="apple-mobile-web-app-title" content="Network Monitor" />
          <Meta name="mobile-web-app-capable" content="yes" />

          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <FrontendServicesProvider>
                <Suspense>{props.children}</Suspense>
              </FrontendServicesProvider>
            </QueryClientProvider>
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

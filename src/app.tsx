// @refresh reload
import "./app.css";
import "~/lib/chart-config";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Layout } from "~/components/Layout";
import { FrontendServicesProvider } from "~/lib/frontend/container";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>Network Monitor - PWA</Title>
          <FrontendServicesProvider>
            <Layout>
              <Suspense>{props.children}</Suspense>
            </Layout>
          </FrontendServicesProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

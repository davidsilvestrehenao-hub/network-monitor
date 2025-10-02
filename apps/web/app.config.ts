import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    preset: "node-server",
  },
  vite: {
    optimizeDeps: {
      include: ["solid-js", "@solidjs/router", "@network-monitor/shared"],
    },
    build: {
      target: "esnext",
    },
    ssr: {
      noExternal: ["@solidjs/router", "@network-monitor/shared"],
    },
  },
});

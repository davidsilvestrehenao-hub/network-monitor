import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    preset: "node-server",
  },
  vite: {
    optimizeDeps: {
      include: ["solid-js", "@solidjs/router"],
    },
    build: {
      target: "esnext",
    },
    ssr: {
      noExternal: ["@solidjs/router"],
    },
  },
});
